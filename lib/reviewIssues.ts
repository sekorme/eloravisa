/**
 * The AI document review sometimes puts reassurances in its problem lists
 * ("There are no inconsistencies…", "None found", "No risk flags detected").
 * Those must not be shown as problems. Used wherever review issues are listed.
 */
const NOT_A_PROBLEM = /^\s*(there (are|were|is) )?no\b|^\s*(none|n\/a|nil)\b|no (inconsistenc|issue|risk|red flag|discrepanc|concern)|matches perfectly|fully consistent|consistent with the (applicant|profile)/i

export const isRealProblem = (p: unknown): p is string => typeof p === "string" && p.trim().length > 0 && !NOT_A_PROBLEM.test(p)

/** Plain text for AI output that sometimes carries Markdown ("**CRITICAL:**"). */
export const plainText = (t: string) => t.replace(/\*\*|__|`|^#+\s*/gm, "").replace(/\s+/g, " ").trim()
