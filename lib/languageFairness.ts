/**
 * Shared rule for every AI prompt that judges a mock-interview answer: the
 * scorers (action/interviewSessions.ts, action/interview.ts) and the live
 * officer (hooks/useLiveAPI.ts).
 *
 * Applicants are scored on what they say, not how well they speak English.
 * Many are answering in a second or third language, and voice answers arrive
 * through speech-to-text, which garbles accents. Real visa officers decide on
 * substance (purpose, funding, ties, consistency); grammar is not a criterion.
 */
export const LANGUAGE_FAIRNESS = `LANGUAGE FAIRNESS (applies to every score, rating and comment):
- Judge only the substance of the answers: what the applicant says, whether it is specific, truthful-sounding, consistent and relevant.
- Never lower any score, rating or decision because of grammar, vocabulary, sentence structure, spelling, accent, pronunciation, fluency, short or simple sentences, or the applicant mixing in or answering in another language.
- The transcript may come from speech-to-text and can contain recognition errors. Read for the intended meaning; never treat a transcription error as a weak or inconsistent answer.
- "Clarity" means the content is specific and unambiguous (names the school, the amount, the dates, who pays), not that the English is polished. A short answer in simple English that gives the facts is a clear answer.
- "Confidence" means answering directly and consistently without evading, not speaking fluently or without an accent.
- Do not list English, grammar, vocabulary, accent or fluency as a weakness, red flag or recommendation, and do not suggest language classes.
- When you write a better example answer, keep it in plain, simple words the applicant could realistically say, and improve only the content (missing facts, vagueness, contradictions).`;
