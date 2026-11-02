/**
 * Client-side helpers for paid live sessions (server side: lib/meetings.ts).
 *
 * Same checkout model as lib/paystack.ts: the server prices the seat and
 * creates the payment intent; the browser only resumes the Paystack popup and
 * then asks /api/paystack-success to verify and grant the seat. The webhook
 * grants it too if that confirmation never arrives.
 */
import { toast } from "sonner";
import type { PaidMeetingView, PastSessionView, QuestionView, ReplayRecording } from "@/lib/meetings";
import { buildSessionIcs } from "@/lib/ics";

export type LiveSession = PaidMeetingView;
export type PastSession = PastSessionView;
export type SessionQuestion = QuestionView;
export type { ReplayRecording };

export interface JoinCredentials {
    apiKey: string;
    token: string;
    callType: string;
    callId: string;
    user: { id: string; name: string };
}

export class LiveSessionError extends Error {
    constructor(public readonly status: number, message: string) {
        super(message);
    }
}

async function authedFetch(url: string, init: RequestInit = {}) {
    const user = (await import("firebase/auth")).getAuth().currentUser;
    if (!user) throw new LiveSessionError(401, "You must be signed in");
    const idToken = await user.getIdToken();
    const res = await fetch(url, {
        ...init,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}`, ...init.headers },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new LiveSessionError(res.status, data.error || "Something went wrong");
    return data;
}

export async function fetchLiveSessions(): Promise<LiveSession[]> {
    return (await authedFetch("/api/meetings")).meetings;
}

/** Upcoming sessions plus past ones the user bought (for replays). */
export async function fetchSessionsWithPast(): Promise<{ meetings: LiveSession[]; past: PastSession[] }> {
    const { meetings, past } = await authedFetch("/api/meetings");
    return { meetings, past: past ?? [] };
}

export interface SeatQuote {
    priceUsd: number;
    percentOff: number;
    discountCode: string | null;
}

/** Price with a discount code applied; throws LiveSessionError if the code is refused. */
export async function quoteSeat(meetingId: string, code: string): Promise<SeatQuote> {
    return authedFetch(`/api/meetings/${encodeURIComponent(meetingId)}/quote?code=${encodeURIComponent(code)}`);
}

export async function fetchReplays(meetingId: string): Promise<ReplayRecording[]> {
    return (await authedFetch(`/api/meetings/${encodeURIComponent(meetingId)}/replays`)).recordings;
}

export async function fetchQuestions(meetingId: string): Promise<SessionQuestion[]> {
    return (await authedFetch(`/api/meetings/${encodeURIComponent(meetingId)}/questions`)).questions;
}

export async function postQuestion(
    meetingId: string,
    body: { text: string } | { questionId: string; upvote: boolean },
): Promise<SessionQuestion[]> {
    return (
        await authedFetch(`/api/meetings/${encodeURIComponent(meetingId)}/questions`, {
            method: "POST",
            body: JSON.stringify(body),
        })
    ).questions;
}

/** Downloads a calendar invite for a session. */
export function downloadSessionIcs(session: LiveSession) {
    const ics = buildSessionIcs({
        id: session.id,
        title: session.title,
        description: session.description,
        scheduledAt: session.scheduledAt,
        joinUrl: `${window.location.origin}/live/${session.id}`,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${session.title.replace(/[^\w\- ]+/g, "").trim() || "live-session"}.ics`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function fetchJoinCredentials(meetingId: string, renewal = false): Promise<JoinCredentials> {
    return authedFetch(`/api/meetings/${encodeURIComponent(meetingId)}/join`, {
        method: "POST",
        body: JSON.stringify({ renewal }),
    });
}

/**
 * Runs checkout for a seat. Resolves "paid" once the server has confirmed the
 * payment, or "cancelled" if the buyer closed the popup.
 */
export async function buyLiveSessionSeat(meetingId: string, code?: string | null): Promise<"paid" | "cancelled"> {
    const { accessCode } = await authedFetch(`/api/meetings/${encodeURIComponent(meetingId)}/checkout`, {
        method: "POST",
        body: JSON.stringify({ code: code || null }),
    });
    if (!accessCode) throw new LiveSessionError(500, "Failed to initialize payment");

    const PaystackPop = (await import("@paystack/inline-js")).default;
    const reference = await new Promise<string | null>((resolve) => {
        new PaystackPop().resumeTransaction(accessCode, {
            onSuccess: (transaction) => resolve(transaction.reference),
            onCancel: () => resolve(null),
            onError: (error) => {
                console.error("Paystack checkout error:", error?.message);
                resolve(null);
            },
        });
    });
    if (!reference) return "cancelled";

    const result = await authedFetch("/api/paystack-success", {
        method: "POST",
        body: JSON.stringify({ reference }),
    });
    if (!result.success) throw new LiveSessionError(400, result.error || "Payment could not be applied");
    return "paid";
}

/**
 * Buys a seat, then re-reads the list to confirm it was granted: if the
 * session filled up or was cancelled mid-checkout, the payment is recorded
 * for a refund instead (lib/paystackServer.ts fulfilMeetingSeat).
 */
export async function purchaseAndConfirm(meetingId: string, code?: string | null): Promise<LiveSession[] | null> {
    const outcome = await buyLiveSessionSeat(meetingId, code);
    if (outcome === "cancelled") return null;
    const sessions = await fetchLiveSessions();
    if (sessions.find((s) => s.id === meetingId)?.purchased) {
        toast.success("You're in! Check your email for the calendar invite.");
    } else {
        toast.error("Payment received, but the session was no longer available. We'll refund you.");
    }
    return sessions;
}

export function formatSessionTime(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}
