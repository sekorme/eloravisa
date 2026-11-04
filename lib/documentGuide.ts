/**
 * How to get the supporting documents that back up a bank statement and show
 * ties to home. Shown on app/dashboard/statement-builder, filtered by visa
 * type, who pays and income type. Office names are for Ghana (most users);
 * other nationalities see the general steps only. Fees and waiting times are
 * left out on purpose: they change, so users are told to confirm at the office.
 */

import type { FundedBy, IncomeType } from "@/lib/statementPlan"

export type GuideGroup = "identity" | "money" | "ties" | "sponsor"

export interface DocumentGuide {
  key: string
  title: string
  group: GuideGroup
  why: string
  /** General steps, valid anywhere. */
  steps: string[]
  /** Where to go in Ghana. */
  ghana?: string
  tips?: string[]
  /** Visa types it applies to; omitted = all. */
  visaTypes?: string[]
  /** Only when this condition holds. */
  when?: (ctx: GuideContext) => boolean
}

export interface GuideContext {
  visaType: string
  fundedBy: FundedBy
  incomeType: IncomeType
  hasLumpSum: boolean
}

export const GUIDE_GROUPS: Record<GuideGroup, string> = {
  identity: "Identity and civil records",
  money: "Proof of funds and where they came from",
  ties: "Ties to home",
  sponsor: "If someone is sponsoring you",
}

const sponsored = (c: GuideContext) => c.fundedBy !== "self"

export const DOCUMENT_GUIDES: DocumentGuide[] = [
  {
    key: "birthCertificate",
    title: "Birth certificate",
    group: "identity",
    why: "Proves your identity and, with a sponsor or family visa, your relationship to them (parents' names).",
    steps: [
      "Get a certified copy from the civil registry where the birth was registered.",
      "If the birth was never registered or details are wrong, ask about late registration or correction early. It needs extra paperwork and takes longer.",
      "Check that names and dates match your passport exactly.",
    ],
    ghana: "Births and Deaths Registry: any district office, or the head office in Accra. Ask for a certified copy for visa use.",
    tips: ["A parent sponsoring you should appear on it by the same name as on their ID and statement. If not, add a statutory declaration explaining the difference."],
  },
  {
    key: "marriageCertificate",
    title: "Marriage certificate",
    group: "identity",
    why: "Needed if a spouse is sponsoring you, travelling with you, or staying home as one of your ties.",
    steps: [
      "Get a certified copy from the office that registered the marriage.",
      "A customary marriage that was never registered usually needs registering first before embassies will accept it.",
    ],
    ghana: "Ordinance marriages: the Registrar of Marriages. Customary marriages: register at the Metropolitan, Municipal or District Assembly where you live.",
    when: (c) => c.visaType === "family" || sponsored(c),
  },
  {
    key: "policeReport",
    title: "Police clearance report",
    group: "identity",
    why: "Some work, study and family visas ask for proof of no criminal record.",
    steps: ["Apply in person with your passport; fingerprints are usually taken.", "Check how recent the embassy needs it (often within 6 months)."],
    ghana: "Ghana Police Service CID Headquarters, Accra (criminal record / police report section).",
    visaTypes: ["work", "study", "family"],
  },
  {
    key: "bankStatement",
    title: "Stamped bank statement",
    group: "money",
    why: "The main proof you can pay for the trip. Follow your plan above so it shows steady saving.",
    steps: [
      "Ask your branch for a statement covering the last 6 months (3 at minimum), stamped and signed by the bank.",
      "Get it within a month of applying. Old statements are often rejected.",
      "Some embassies verify statements with the bank directly, so never alter one.",
    ],
  },
  {
    key: "bankLetter",
    title: "Bank reference letter",
    group: "money",
    why: "Confirms the account is real and states the current balance and how long you've banked there.",
    steps: ["Request it at the same time as your statement; most banks charge a small fee.", "It should be on letterhead, signed, and dated close to your application."],
  },
  {
    key: "payslips",
    title: "Payslips and employment letter",
    group: "money",
    why: "Explains the salary credits on your statement and shows a job to return to.",
    steps: [
      "Get your last 3-6 payslips from HR.",
      "Ask for a letter on company letterhead with your role, start date, salary and approved leave dates, saying you'll resume after the trip.",
    ],
    tips: ["Salary on the payslip should match what reaches your account each month. Explain any big difference (loan deductions, for example)."],
    when: (c) => c.incomeType === "salary",
  },
  {
    key: "ssnit",
    title: "Social security contribution statement",
    group: "money",
    why: "Independent proof of how long you've been employed and earning.",
    steps: ["Request your contribution statement from your social security office or online portal."],
    ghana: "SSNIT: any branch, or the SSNIT self-service portal.",
    when: (c) => c.incomeType === "salary",
  },
  {
    key: "businessDocs",
    title: "Business registration and records",
    group: "money",
    why: "Shows the business is real and explains the deposits on your statement.",
    steps: [
      "Get a copy of your business registration certificate (and company documents if it's a limited company).",
      "Bring the business account's bank statement too, if you have one.",
      "Keep simple monthly records: sales, expenses, invoices and receipts.",
    ],
    ghana: "Office of the Registrar of Companies (ORC): registration certificate and company search. Ghana Revenue Authority (GRA): Tax Identification Number and tax clearance certificate.",
    when: (c) => c.incomeType === "business",
  },
  {
    key: "taxClearance",
    title: "Tax clearance or tax returns",
    group: "money",
    why: "Strong, independent proof of income, especially for business owners and sponsors.",
    steps: ["Request a tax clearance certificate or your filed returns from the tax authority."],
    ghana: "Ghana Revenue Authority (GRA), at your tax office or through the GRA online portal.",
    when: (c) => c.incomeType === "business" || sponsored(c),
  },
  {
    key: "lumpSumProof",
    title: "Proof of any large deposit",
    group: "money",
    why: "Every deposit outside your normal pattern needs a paper trail, or officers may treat it as borrowed money.",
    steps: [
      "Sale of land or a car: the signed sale agreement, the buyer's payment record, and the title or registration papers.",
      "Gift: a signed gift letter, the giver's ID, and their bank statement showing the money leaving their account.",
      "Bonus or end-of-service benefit: a letter from the employer.",
      "Investment or fixed deposit: the maturity certificate or statement.",
    ],
    when: (c) => c.hasLumpSum,
  },
  {
    key: "sponsorLetter",
    title: "Sponsorship letter",
    group: "sponsor",
    why: "Your sponsor states in their own words what they'll pay for and how they're related to you.",
    steps: ["Draft it with AI Document Draft (Sponsorship Letter), then have your sponsor check, sign and date it."],
    when: sponsored,
  },
  {
    key: "sponsorFinances",
    title: "Sponsor's statement, ID and income proof",
    group: "sponsor",
    why: "The sponsor's money is judged like yours: steady income, no unexplained deposits.",
    steps: [
      "The sponsor's stamped 6-month bank statement and bank reference letter.",
      "Their ID or passport bio page.",
      "Their payslips and employment letter, or business registration and tax documents.",
      "Proof of relationship: your birth certificate (parent), marriage certificate (spouse) or other papers.",
    ],
    when: sponsored,
  },
  {
    key: "affidavitSupport",
    title: "Affidavit of support",
    group: "sponsor",
    why: "A sworn statement from your sponsor. Some embassies ask for it; for others it just strengthens the letter.",
    steps: [
      "Your sponsor swears it before a Commissioner for Oaths or notary.",
      "For US family visas this is the official Form I-864, filed by the US petitioner, not a local affidavit.",
    ],
    ghana: "A Commissioner for Oaths at the High Court registry, or a notary public.",
    when: (c) => sponsored(c) || c.visaType === "family",
  },
  {
    key: "propertyDocs",
    title: "Property or land documents",
    group: "ties",
    why: "Owning property at home is a strong reason to return.",
    steps: ["Copies of title deeds, indenture or site plan; tenancy agreements if you rent property out."],
    ghana: "Lands Commission: search and certified copies of registered land documents.",
  },
  {
    key: "familyTies",
    title: "Family ties",
    group: "ties",
    why: "Spouse, children or dependants staying at home show you'll come back.",
    steps: [
      "Marriage certificate and children's birth certificates.",
      "Proof you support them: school fee receipts, rent, health insurance in their names.",
    ],
  },
  {
    key: "studyTies",
    title: "Study or job to return to",
    group: "ties",
    why: "A place to come back to after the trip.",
    steps: [
      "Employment letter with approved leave, or a letter from your school confirming you're enrolled and when you resume.",
      "For students going abroad: evidence of the career plan the course leads to at home.",
    ],
  },
]

export function guidesFor(ctx: GuideContext): DocumentGuide[] {
  const type = ctx.visaType.toLowerCase()
  const c = { ...ctx, visaType: type }
  return DOCUMENT_GUIDES.filter((g) => (!g.visaTypes || g.visaTypes.includes(type)) && (!g.when || g.when(c)))
}
