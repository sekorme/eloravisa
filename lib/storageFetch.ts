import "server-only";

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/**
 * Downloads a document the user uploaded, for AI analysis. Only accepts files
 * in our own Storage bucket under users/{uid}/, so one user can't have
 * another's file analysed. Throws a user-facing message on any problem.
 */
export async function fetchOwnDocument(rawUrl: string, uid: string): Promise<string> {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("Document link is invalid.");
  }
  const prefix = `/v0/b/${bucket}/o/${encodeURIComponent(`users/${uid}/`)}`;
  if (!bucket || url.protocol !== "https:" || url.hostname !== "firebasestorage.googleapis.com" || !url.pathname.startsWith(prefix)) {
    throw new Error("Document must be one you uploaded to Elora Visa.");
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Couldn't download the document.");
  if (Number(res.headers.get("content-length") || 0) > MAX_DOCUMENT_BYTES) throw new Error("Document is too large to analyse (20MB max).");
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_DOCUMENT_BYTES) throw new Error("Document is too large to analyse (20MB max).");
  return Buffer.from(buf).toString("base64");
}
