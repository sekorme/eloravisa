/**
 * Statement builder (app/dashboard/statement-builder): a plan for building a
 * genuine, stronger bank statement over 3-6 months from the user's real
 * income and savings. Pure functions, used client-side; the funds target
 * comes from the requirements library (action/statementPlan.ts).
 *
 * It never suggests borrowing money to show ("funds parking"): officers look
 * for it, and the funds check (action/finance.ts) flags it.
 */

export type FundedBy = "self" | "sponsor" | "both"
export type IncomeType = "salary" | "business" | "irregular" | "none"
export type LumpSource = "none" | "asset_sale" | "gift" | "bonus" | "investment" | "loan_bank" | "loan_personal"

export interface StatementPlanInput {
  /** Currency of the account that will be shown (usually GHS). */
  currency: string
  /** Balance today on that account. */
  balance: number
  /** Regular money coming in each month. */
  monthlyIncome: number
  incomeType: IncomeType
  /** What goes out each month (rent, food, transport, family support). */
  monthlyExpenses: number
  /** Months until the statement is printed: 3 to 6. */
  months: number
  fundedBy: FundedBy
  /** With "both": what the sponsor will show, in `currency`. */
  sponsorAmount: number
  /** A one-off amount expected during the plan. */
  lumpSum: number
  lumpSource: LumpSource
  /** Plan month (1..months) the lump sum arrives. */
  lumpMonth: number
  /** Stay length and fees still to pay, for the target. */
  stayMonths: number
  extraCosts: number
  /** Target in `currency`: prefilled from the requirement, editable. */
  target: number
}

export interface PlanMonth {
  month: number
  /** First day of the month, YYYY-MM-DD. */
  date: string
  deposit: number
  lump: number
  balance: number
}

export interface StatementPlan {
  /** Target this account must reach (after any sponsor share). */
  accountTarget: number
  monthlySaving: number
  /** Saving per month needed to reach the target on time. */
  neededPerMonth: number
  months: PlanMonth[]
  endBalance: number
  verdict: "on_track" | "stretch" | "short"
  shortfall: number
  /** Months of saving to reach the target at the current rate, or null if never. */
  monthsAtCurrentRate: number | null
  warnings: string[]
  options: string[]
}

export const LUMP_SOURCES: { value: LumpSource; label: string }[] = [
  { value: "none", label: "None expected" },
  { value: "asset_sale", label: "Sale of land, car or other property" },
  { value: "gift", label: "Gift from family" },
  { value: "bonus", label: "Bonus or end-of-service benefit" },
  { value: "investment", label: "Investment or fixed deposit maturing" },
  { value: "loan_bank", label: "Loan from a bank (e.g. education loan)" },
  { value: "loan_personal", label: "Money borrowed from a person" },
]

/** Required funds for the stay, from the library's guidance (shared with the funds check). */
export function requiredFunds(
  funds: { amount: number; currency: string; per: string } | null,
  input: { stayMonths: number; extraCosts: number },
) {
  if (!funds) return null
  const months = Math.max(1, Math.round(input.stayMonths))
  const living = funds.per === "month" ? funds.amount * months : funds.per === "year" ? funds.amount * Math.max(1, months / 12) : funds.amount
  const total = Math.round(living + Math.max(0, input.extraCosts))
  const basis = `${funds.per === "trip" ? "the embassy's guide amount" : `${funds.currency} ${funds.amount.toLocaleString()} per ${funds.per} × ${funds.per === "month" ? months : Math.max(1, months / 12).toFixed(1)}`}${input.extraCosts > 0 ? ` + ${funds.currency} ${input.extraCosts.toLocaleString()} fees` : ""}`
  return { amount: total, currency: funds.currency, basis }
}

const pos = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0)

function firstOfMonth(offset: number, from = new Date()): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + offset, 1))
  return d.toISOString().slice(0, 10)
}

export function buildStatementPlan(input: StatementPlanInput, now = new Date()): StatementPlan {
  const months = Math.min(6, Math.max(3, Math.round(input.months) || 6))
  const balance = pos(input.balance)
  const monthlySaving = Math.round(pos(input.monthlyIncome) - pos(input.monthlyExpenses))
  const sponsorShare = input.fundedBy === "both" ? pos(input.sponsorAmount) : 0
  const accountTarget = Math.max(0, Math.round(pos(input.target) - sponsorShare))
  const lump = input.lumpSource === "none" ? 0 : pos(input.lumpSum)
  const lumpMonth = Math.min(months, Math.max(1, Math.round(input.lumpMonth) || 1))
  const saving = Math.max(0, monthlySaving)

  const plan: PlanMonth[] = []
  let running = balance
  for (let m = 1; m <= months; m++) {
    const thisLump = m === lumpMonth ? lump : 0
    running += saving + thisLump
    plan.push({ month: m, date: firstOfMonth(m, now), deposit: saving, lump: thisLump, balance: Math.round(running) })
  }
  const endBalance = plan[plan.length - 1].balance
  const shortfall = Math.max(0, accountTarget - endBalance)
  const verdict: StatementPlan["verdict"] =
    shortfall === 0 ? "on_track" : endBalance >= accountTarget * 0.85 ? "stretch" : "short"
  const neededPerMonth = Math.max(0, Math.ceil((accountTarget - balance - lump) / months))
  const monthsAtCurrentRate =
    accountTarget <= balance + lump ? 0 : saving > 0 ? Math.ceil((accountTarget - balance - lump) / saving) : null

  const warnings: string[] = []
  if (monthlySaving <= 0 && pos(input.monthlyIncome) > 0)
    warnings.push("Your expenses use up all your income, so the balance can't grow. Officers read a flat or falling balance as money that won't last the trip.")
  if (input.incomeType === "none" && input.fundedBy === "self")
    warnings.push("With no regular income, a large balance raises the question “where did this come from?”. Plan to show the source (a sale, savings history or a sponsor) on paper.")
  if (input.incomeType === "irregular")
    warnings.push("Irregular income is fine if it goes through the bank. Cash kept at home or spent before it reaches the account doesn't show up on the statement.")
  if (lump > 0) {
    const share = endBalance > 0 ? lump / endBalance : 1
    if (lumpMonth >= months - 1 && share >= 0.3)
      warnings.push(`The ${input.currency} ${lump.toLocaleString()} lump sum lands near the end and makes up ${Math.round(share * 100)}% of the final balance. A late, large deposit is the most common reason statements are questioned: bring it in as early as you can and keep proof of where it came from.`)
    if (input.lumpSource === "loan_personal")
      warnings.push("Don't deposit money borrowed from a friend or relative just to show it and give it back later. Officers call this “funds parking”, often check with the bank, and it can lead to a refusal or a ban for misrepresentation. If someone wants to help, they can sponsor you openly with their own statement and a sponsorship letter.")
    if (input.lumpSource === "loan_bank")
      warnings.push("A bank loan only counts if the embassy accepts loans for this visa (common for study, rare for visits). Keep the loan approval letter and declare it; never present it as savings.")
  }
  if (input.fundedBy !== "self")
    warnings.push("Your sponsor's statement is judged the same way as yours: steady income, no unexplained deposits, enough left after their own costs.")

  const options: string[] = []
  if (verdict !== "on_track") {
    if (monthsAtCurrentRate !== null && monthsAtCurrentRate > months)
      options.push(`At your current saving rate you'd reach the target in about ${monthsAtCurrentRate} months. Consider moving your application date back.`)
    if (neededPerMonth > saving)
      options.push(`Save about ${input.currency} ${neededPerMonth.toLocaleString()} a month instead of ${input.currency} ${saving.toLocaleString()}: cut costs or add an income source that pays into this account.`)
    if (input.fundedBy === "self")
      options.push("Add a genuine sponsor (parent, spouse, sibling) who shows their own statement and writes a sponsorship letter.")
    options.push("Lower the target honestly: a shorter stay, cheaper accommodation, or a scholarship or tuition deposit already paid (keep the receipt; paid fees reduce what you must show).")
  }

  return { accountTarget, monthlySaving, neededPerMonth, months: plan, endBalance, verdict, shortfall, monthsAtCurrentRate, warnings, options }
}

/** Habits that make a statement read as stable, for each plan stage. */
export function planSteps(input: StatementPlanInput, plan: StatementPlan): { when: string; items: string[] }[] {
  const cur = input.currency
  const income =
    input.incomeType === "salary"
      ? "Ask HR to pay your salary into this account if it isn't already."
      : input.incomeType === "business"
        ? "Bank your business takings every week through this account (or the business account), not in cash at home. Keep invoices and receipts."
        : input.incomeType === "irregular"
          ? "Ask everyone who pays you to pay by bank transfer or mobile money moved into the account, and keep a note of each job."
          : "If you have no income, show where your savings came from and lean on a sponsor."
  return [
    {
      when: "This week",
      items: [
        "Choose one main account and use it for everything from now on. Statements spread over several accounts look weaker.",
        income,
        `Set up a standing order to move ${cur} ${Math.max(plan.monthlySaving, 0).toLocaleString()} into savings on payday, every month, on the same date.`,
        "Stop large cash withdrawals and avoid going overdrawn or bouncing payments.",
      ],
    },
    {
      when: "Every month",
      items: [
        "Keep the balance above last month's. A steady climb reads better than a jump.",
        "Don't deposit money you'll have to take out again before the statement is printed.",
        "For any deposit outside your normal pattern, file the proof now (sale agreement, gift letter, bonus letter).",
        "Log your balance below so you can see if you're on track.",
      ],
    },
    {
      when: "Before you apply",
      items: [
        `Ask the bank for a stamped, signed statement covering at least the last ${Math.max(3, plan.months.length)} months (6 is safest), dated within a month of applying.`,
        "Ask for a bank reference letter confirming the account and current balance.",
        "Check the embassy's rules: some (e.g. UK student) need the money held for 28 days in a row before you apply.",
        "Run the Funds Check on the final statement to see what an officer might question.",
      ],
    },
  ]
}
