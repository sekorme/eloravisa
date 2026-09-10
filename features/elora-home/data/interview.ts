import type { InterviewQuestion } from "../types"

/**
 * Sample questions for the front-end interview demo.
 *
 * `coaching` describes what a *strong answer covers* — it is deliberately not a
 * script. Handing an applicant words to recite at a consular officer would be
 * actively harmful: rehearsed answers are exactly what interviewers are trained
 * to notice, and coaching someone to misrepresent their intentions is fraud.
 * Elora coaches structure and honesty, never content.
 */
export const INTERVIEW_QUESTIONS: InterviewQuestion[] = [
    {
        id: "purpose",
        category: "Purpose of travel",
        prompt: "Why have you chosen this country for your studies?",
        coaching: [
            "A specific reason, not a general one",
            "Something only your chosen institution offers",
            "How it connects to what you have already done",
        ],
    },
    {
        id: "funding",
        category: "Financial capacity",
        prompt: "Who is funding your trip, and how?",
        coaching: [
            "Name the funder and your relationship",
            "Match the figure to your submitted statements",
            "Explain any recent large deposit plainly",
        ],
    },
    {
        id: "ties",
        category: "Ties to home",
        prompt: "What will you return to when your studies finish?",
        coaching: [
            "Concrete commitments, not intentions",
            "Family, employment or property you can evidence",
            "Consistency with your statement of purpose",
        ],
    },
    {
        id: "plans",
        category: "Post-study plans",
        prompt: "What do you plan to do after you graduate?",
        coaching: [
            "A plan you can actually describe in detail",
            "Alignment with the course you chose",
            "No contradiction with your stated ties",
        ],
    },
]

/**
 * The scripted beats of the sample demo, in order. Times are cumulative ms from
 * the moment the visitor presses "Try a Sample Question".
 *
 * This is a front-end demonstration of the real session's four states
 * (connecting → listening → thinking → speaking). It performs no network
 * request and — critically — never touches `getUserMedia`. Microphone access
 * belongs to the real session at `/dashboard/ai-mock-interview`, and only
 * after the applicant starts it.
 */
export const DEMO_BEATS = [
    { at: 0, state: "connecting", caption: "Establishing session" },
    { at: 900, state: "speaking", caption: "Interviewer is asking your question" },
    { at: 3400, state: "listening", caption: "Your turn — the real session listens here" },
    { at: 6200, state: "thinking", caption: "Reviewing structure and clarity" },
    { at: 7800, state: "speaking", caption: "Feedback ready" },
] as const
