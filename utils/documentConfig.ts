
export const BASE_DOCUMENTS = [
  { 
    key: "passport", 
    title: "Passport", 
    description: "A valid passport with at least 6 months validity.", 
    label: "Passport copy",
    explanation: "Your passport must be valid for your entire stay plus usually 6 months.",
    example: "Must be valid at least 6 months beyond your intended travel date with 2 blank pages.",
    mistakes: ["Expired passport", "Damaged pages", "Name mismatch"]
  },
  { 
    key: "financialStatement", 
    title: "Financial Statement", 
    description: "Bank statements, sponsor's statements, etc.", 
    label: "Financial Statement",
    explanation: "This shows you can support yourself without working illegally.",
    example: "6 months bank statement with consistent balances covering tuition + living expenses.",
    mistakes: ["Sudden large deposits", "Unclear sponsor source", "Short statement duration"]
  },
  { 
    key: "statementOfPurpose", 
    title: "Statement of Purpose", 
    description: "Explain purpose, duration, funding, and return plan.", 
    label: "Statement of Purpose",
    explanation: "This explains why you chose this course and country.",
    example: "Clear study plan linked to your background and future career goals.",
    mistakes: ["Copy-paste templates", "No career connection", "Contradicting documents"]
  },
  { 
    key: "travelItinerary", 
    title: "Travel Itinerary", 
    description: "Flight reservations, etc.", 
    label: "Travel Itinerary",
    explanation: "Proof of your travel plans.",
    example: "Flight reservation showing entry and exit dates.",
    mistakes: ["Booking actual tickets before visa approval", "Dates mismatch with application"]
  },
  { 
    key: "proofOfAccommodation", 
    title: "Proof of Accommodation", 
    description: "Hotel reservation, host invitation, etc.", 
    label: "Proof of Accommodation",
    explanation: "Where you will stay upon arrival.",
    example: "Hotel booking or invitation letter from a host.",
    mistakes: ["Unconfirmed booking", "Address mismatch"]
  },
  { 
    key: "purposeOfTravel", 
    title: "Purpose of Travel", 
    description: "Admission letter, job offer, invitation letter, etc.", 
    label: "Purpose of Travel",
    explanation: "Evidence supporting your reason for visiting.",
    example: "Admission letter from university or invitation letter for business.",
    mistakes: ["Vague purpose", "Invalid documents"]
  },
  { 
    key: "homeTies", 
    title: "Home Ties", 
    description: "Employment letter, business registration, proof of family responsibility, etc.", 
    label: "Home Ties",
    explanation: "Proof that you will return to your home country.",
    example: "Employment letter, property deeds, or family certificates.",
    mistakes: ["No strong ties shown", "Implied intent to immigrate permanently"]
  },
];

export const WORK_DOCUMENTS = [
  { 
    key: "academicDegrees", 
    title: "Academic Degrees & Certs", 
    description: "Original academic degrees, transcripts, professional licenses/certifications.",
    label: "Academic Degrees & Certs",
    explanation: "Proof of your educational background and qualifications.",
    example: "Bachelor's degree certificate and official transcripts from your university.",
    mistakes: ["Incomplete transcripts", "Unofficial copies", "Missing certifications"]
  },
  { 
    key: "cvResume", 
    title: "Updated CV/Resume", 
    description: "Your most recent professional resume or curriculum vitae.",
    label: "Updated CV/Resume",
    explanation: "A summary of your work experience and skills.",
    example: "A 2-page CV detailing your professional history relevant to the job.",
    mistakes: ["Outdated information", "Gaps in employment not explained", "Incorrect contact details"]
  },
  { 
    key: "employerLetters", 
    title: "Employer Letters", 
    description: "Letters from your U.S. employer (offer letter, detailed job description).",
    label: "U.S. Employer Letters",
    explanation: "Official documentation from your prospective employer.",
    example: "Signed offer letter on company letterhead with salary and job duties.",
    mistakes: ["Missing signature", "Generic job description", "Salary not mentioned"]
  },
  {
    key: "workExperience",
    title: "Work Experience Proof",
    description: "Experience letters from previous employers.",
    label: "Previous Experience Letters",
    explanation: "Validates your professional background and years of experience.",
    example: "Reference letters from past employers on official letterheads.",
    mistakes: ["Inconsistent dates", "No supervisor contact info", "Missing roles/responsibilities"]
  },
];

export const STUDY_DOCUMENTS = [
  { 
    key: "admissionLetter", 
    title: "Admission Letter", 
    description: "Official admission letter from the educational institution.",
    label: "Admission Letter",
    explanation: "Proof that you have been accepted by a recognized institution.",
    example: "Official acceptance letter with your student ID and course details.",
    mistakes: ["Conditional offer not met", "Expired admission", "Incorrect school name"]
  },
  { 
    key: "scholarshipLetter", 
    title: "Scholarship Letter (Optional)", 
    description: "Scholarship award letter, if applicable.",
    label: "Scholarship Letter",
    explanation: "Evidence of financial support from the institution or other bodies.",
    example: "Award letter detailing the scholarship amount and duration.",
    mistakes: ["Unsigned letter", "Terms of scholarship not clear"]
  },
  { 
    key: "academicCertificate", 
    title: "Academic Certificate", 
    description: "Your most recent academic certificate or diploma.",
    label: "Academic Certificate",
    explanation: "Proof of your previous academic achievements.",
    example: "High school diploma or previous university degree certificate.",
    mistakes: ["Low resolution scans", "Missing original stamps"]
  },
  {
    key: "standardizedTests",
    title: "Test Scores (GRE/GMAT/TOEFL/IELTS)",
    description: "Official score reports for required standardized tests.",
    label: "Test Score Reports",
    explanation: "Demonstrates your academic readiness and English proficiency.",
    example: "TOEFL iBT score report showing at least 90 or IELTS 7.0.",
    mistakes: ["Expired scores", "Unofficial screenshots", "Score below minimum requirement"]
  },
];

export const VISIT_DOCUMENTS = [
  { 
    key: "invitationLetter", 
    title: "Invitation Letter", 
    description: "Letter from host, relative, or business contact in the destination country.",
    label: "Invitation Letter",
    explanation: "A letter confirming the purpose of your visit and your relationship with the host.",
    example: "Signed letter from your host with their contact info and your travel dates.",
    mistakes: ["Generic content", "No contact information", "Dates don't match itinerary"]
  },
  { 
    key: "employmentVerification", 
    title: "Employment Verification", 
    description: "Letter from your current employer, pay stubs, or business registration.",
    label: "Employment Proof",
    explanation: "Shows you have a stable job or business to return to.",
    example: "Recent employment letter stating your position, salary, and approved leave.",
    mistakes: ["Old letters", "No salary mentioned", "Unsigned documents"]
  },
  {
    key: "travelHistory",
    title: "Travel History (Old Passports)",
    description: "Copies of previous visas and entry/exit stamps from the last 5-10 years.",
    label: "Travel History",
    explanation: "Evidence of your history of complying with visa regulations in other countries.",
    example: "Scanned pages of your previous passport showing used visas and stamps.",
    mistakes: ["Missing relevant pages", "Unclear stamps"]
  },
];

export const FAMILY_DOCUMENTS = [
  { 
    key: "birthCertificate", 
    title: "Birth Certificate", 
    description: "Original or certified copy of birth certificate.",
    label: "Birth Certificate",
    explanation: "Proof of identity and parental relationship.",
    example: "Official birth certificate with parents' names and government seal.",
    mistakes: ["Poor quality scan", "Incorrect names", "Not translated"]
  },
  { 
    key: "marriageCertificate", 
    title: "Marriage Certificate", 
    description: "Original or certified copy of marriage certificate, if applicable.",
    label: "Marriage Certificate",
    explanation: "Proof of marital status and relationship for spouse-based applications.",
    example: "Legal marriage certificate issued by a government authority.",
    mistakes: ["Unregistered marriage", "Name mismatch", "Missing pages"]
  },
  { 
    key: "affidavitOfSupport", 
    title: "Affidavit of Support", 
    description: "Form I-864 or equivalent financial support document from petitioner.",
    label: "Affidavit of Support",
    explanation: "Contractual proof that your sponsor will support you financially.",
    example: "Signed I-864 with the petitioner's latest tax returns and W2s.",
    mistakes: ["Incomplete forms", "Expired tax returns", "Income below threshold"]
  },
  {
    key: "policeCertificate",
    title: "Police Clearance Certificate",
    description: "Official police certificate from your country of residence.",
    label: "Police Clearance",
    explanation: "Required to prove you have no criminal record.",
    example: "Recent police clearance certificate with official stamps and seals.",
    mistakes: ["Expired certificate (usually valid 6-12 months)", "Wrong jurisdiction", "Missing pages"]
  },
];

export const getRequiredDocuments = (visaType?: string) => {
  const type = visaType?.toLowerCase();
  if (type === "work") {
    return [...BASE_DOCUMENTS, ...WORK_DOCUMENTS];
  }
  if (type === "study") {
    return [...BASE_DOCUMENTS, ...STUDY_DOCUMENTS];
  }
  if (type === "visit") {
    return [...BASE_DOCUMENTS, ...VISIT_DOCUMENTS];
  }
  if (type === "family") {
    return [...BASE_DOCUMENTS, ...FAMILY_DOCUMENTS];
  }
  return BASE_DOCUMENTS;
};
