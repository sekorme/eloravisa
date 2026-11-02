import "server-only";

import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/firebase/admin";
import { APPLICANT_FIELDS, SELF, activeMemberOf, familyCapacity, type FamilyMember } from "@/lib/family";

/** User-facing errors from the family actions. */
export class FamilyError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Makes `target` the active applicant: stashes the current applicant's fields
 * and reviews in familyMembers[current], restores the target's, all in one
 * transaction so a failure can't leave two applicants' data mixed.
 */
export async function switchMember(uid: string, target: string) {
  const userRef = db.collection("users").doc(uid);
  const reviewsRef = userRef.collection("reviews");

  await db.runTransaction(async (tx) => {
    const [snap, reviews] = await Promise.all([tx.get(userRef), tx.get(reviewsRef)]);
    const user = snap.data();
    if (!user) throw new FamilyError(404, "Account not found");
    const current = activeMemberOf(user);
    if (target === current) return;
    const roster: FamilyMember[] = user.familyRoster ?? [];
    if (target !== SELF && !roster.some((m) => m.id === target)) throw new FamilyError(404, "Family member not found");

    const stash: Record<string, unknown> = { reviews: Object.fromEntries(reviews.docs.map((d) => [d.id, d.data()])) };
    for (const f of APPLICANT_FIELDS) if (user[f] !== undefined) stash[f] = user[f];

    const restore: Record<string, unknown> = user.familyMembers?.[target] ?? {};
    const update: Record<string, unknown> = {
      [`familyMembers.${current}`]: stash,
      [`familyMembers.${target}`]: FieldValue.delete(),
      activeMemberId: target === SELF ? null : target,
      updatedAt: Date.now(),
    };
    for (const f of APPLICANT_FIELDS) update[f] = restore[f] ?? FieldValue.delete();
    // A member never switched to before starts with just their name.
    if (target !== SELF && !restore.fullName) update.fullName = roster.find((m) => m.id === target)!.name;
    if (target === SELF && !restore.fullName && user.accountHolderName) update.fullName = user.accountHolderName;
    tx.update(userRef, update);

    for (const d of reviews.docs) tx.delete(d.ref);
    for (const [id, data] of Object.entries((restore.reviews as Record<string, FirebaseFirestore.DocumentData>) ?? {})) {
      tx.set(reviewsRef.doc(id), data);
    }
  });
}

export async function addMember(uid: string, input: { name: string; relationship: string; destination?: string; visaType?: string; nationality?: string }) {
  const name = input.name?.trim().slice(0, 80);
  if (!name) throw new FamilyError(400, "Add the member's full name");
  const relationship = input.relationship?.trim().slice(0, 30) || "Other";
  const userRef = db.collection("users").doc(uid);
  const id = randomUUID().slice(0, 12);

  await db.runTransaction(async (tx) => {
    const user = (await tx.get(userRef)).data();
    if (!user) throw new FamilyError(404, "Account not found");
    const roster: FamilyMember[] = user.familyRoster ?? [];
    const capacity = familyCapacity(user, Date.now());
    if (capacity === 0) throw new FamilyError(402, "Family applications need an active Family plan");
    if (roster.length >= capacity) throw new FamilyError(402, `Your plan covers ${capacity} family member${capacity === 1 ? "" : "s"}. Add an extra member to continue.`);

    const prefilled = input.destination && input.visaType;
    tx.update(userRef, {
      familyRoster: [...roster, { id, name, relationship, createdAt: Date.now() }],
      familyMemberCount: roster.length + 1,
      // The holder's own name, kept for emails while someone else is active.
      accountHolderName: user.accountHolderName ?? (activeMemberOf(user) === SELF ? user.fullName ?? null : null),
      [`familyMembers.${id}`]: {
        fullName: name,
        ...(input.nationality ? { country: input.nationality.slice(0, 80) } : {}),
        // With destination and visa type the member skips onboarding.
        ...(prefilled
          ? { onboarding: { destination: input.destination!.slice(0, 80), visaType: input.visaType!.slice(0, 20) }, completedOnboarding: true }
          : { completedOnboarding: false }),
      },
    });
  });
  return id;
}

export async function removeMember(uid: string, memberId: string) {
  if (memberId === SELF) throw new FamilyError(400, "The account holder can't be removed");
  const userRef = db.collection("users").doc(uid);
  const user = (await userRef.get()).data();
  if (activeMemberOf(user) === memberId) await switchMember(uid, SELF);

  await db.runTransaction(async (tx) => {
    const fresh = (await tx.get(userRef)).data();
    const roster: FamilyMember[] = fresh?.familyRoster ?? [];
    if (!roster.some((m) => m.id === memberId)) throw new FamilyError(404, "Family member not found");
    const next = roster.filter((m) => m.id !== memberId);
    tx.update(userRef, {
      familyRoster: next,
      familyMemberCount: next.length,
      [`familyMembers.${memberId}`]: FieldValue.delete(),
    });
  });
}
