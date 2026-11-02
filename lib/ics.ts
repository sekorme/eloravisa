/**
 * Calendar invite (.ics) for a paid live session or an embassy appointment. Plain string building, so
 * it runs both on the server (email attachment) and in the browser (download).
 */

/** Sessions have no set length; calendars get this much time blocked. */
const DEFAULT_LENGTH_MS = 60 * 60 * 1000;

const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// RFC 5545 text escaping.
const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

export function buildSessionIcs(session: {
  id: string;
  title: string;
  description?: string;
  scheduledAt: string | Date;
  /** Online sessions: the join link. */
  joinUrl?: string;
  /** In-person events: the address. Defaults to the join link. */
  location?: string;
  /** Reminder before the start, in minutes. */
  alarmMinutes?: number;
}): string {
  const start = new Date(session.scheduledAt);
  const end = new Date(start.getTime() + DEFAULT_LENGTH_MS);
  const description = [session.description, session.joinUrl && `Join: ${session.joinUrl}`].filter(Boolean).join("\n\n");
  const location = session.location ?? session.joinUrl ?? "";
  const alarm = session.alarmMinutes ?? 15;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Elora Visa//Live Sessions//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${session.id}@eloravisa.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${escape(session.title)}`,
    `DESCRIPTION:${escape(description)}`,
    ...(session.joinUrl ? [`URL:${session.joinUrl}`] : []),
    `LOCATION:${escape(location)}`,
    "BEGIN:VALARM",
    `TRIGGER:-PT${alarm}M`,
    "ACTION:DISPLAY",
    `DESCRIPTION:${escape(session.title)} starts in ${alarm} minutes`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}
