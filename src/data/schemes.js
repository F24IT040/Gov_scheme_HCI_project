const commonImportantDates = [
  { label: 'Application start date', value: 'Check the latest official notification or portal.' },
  { label: 'Last date', value: 'Verify the closing date before applying.' },
  { label: 'Renewal deadline', value: 'If applicable, follow the current renewal window.' }
];

const commonRejectionReasons = [
  'Missing documents or incomplete uploads',
  'Incorrect personal, bank, or institution details',
  'Not meeting the current eligibility rules',
  'Duplicate or conflicting applications'
];

export const schemeData = {
  pmkisan: {
    id: "pmkisan",
    kicker: "Ministry of Agriculture",
    title: "PM-Kisan Samman Nidhi",
    fullTitle: "Pradhan Mantri Kisan Samman Nidhi",
    copy: "Income support for eligible landholding farmer families, paid in instalments subject to the current scheme rules.",
    eligibility: "Landholding farmer families meeting scheme conditions. Check current exclusions and e-KYC requirements on the official portal.",
    benefit: "Income support of ₹6,000 per year in three instalments, subject to eligibility and official verification.",
    confidence: "92%",
    documents: ["Aadhaar Card", "Land ownership documents", "Bank account details", "E-KYC verification"],
    benefitsSection: "Income support of ₹6,000 per year in three instalments, subject to eligibility and official verification.",
    eligibilityCriteria: [
      { label: 'Age', value: 'No specific age rule in the scheme summary.' },
      { label: 'Income', value: 'Subject to current exclusions and verification rules.' },
      { label: 'Category', value: 'Landholding farmer families.' },
      { label: 'State/Domicile', value: 'Local land and beneficiary records must align with portal rules.' },
      { label: 'Education/Occupation', value: 'Farmer / cultivator status.' },
      { label: 'Special conditions', value: 'Aadhaar, bank account details and e-KYC verification are commonly required.' }
    ],
    importantDates: commonImportantDates,
    rejectionReasons: commonRejectionReasons,
    personalizedEligibility: {
      status: 'Eligible',
      why: 'This card matches the farmer-income support scheme, but final approval depends on official verification.',
      missing: 'Complete land records, Aadhaar linkage, bank details and e-KYC.',
      nextSteps: 'Open the official portal, verify beneficiary details, and finish e-KYC before applying.'
    },
    icon: "Sprout",
    iconBg: "#fff1f1",
    iconColor: "#dca1a1",
    tag: "Farmer income support",
    tagBg: "#fff1f1",
    tagColor: "#dca1a1",
    category: "farming",
    isSingleResult: true
  },
  csss: {
    id: "csss",
    kicker: "Higher education",
    title: "Central Sector Scholarship",
    fullTitle: "Central Sector Scheme of Scholarship",
    copy: "Merit-based support for students pursuing higher education after Class XII.",
    eligibility: "Students meeting current Class XII performance, family-income, institution and course requirements.",
    benefit: "Annual financial assistance for approved undergraduate and postgraduate study, as per current guidelines.",
    confidence: "88%",
    documents: ["12th mark sheet", "Income certificate", "Institution enrollment proof", "Bank account details"],
    benefitsSection: "1.Annual financial assistance for approved undergraduate and postgraduate study, as per current guidelines.",
    eligibilityCriteria: [
      { label: 'Age', value: 'Depends on the current scholarship notification.' },
      { label: 'Income', value: 'Family income must meet the latest threshold.' },
      { label: 'Category', value: 'Merit-based student scholarship.' },
      { label: 'State/Domicile', value: 'May depend on the implementing authority and current rules.' },
      { label: 'Education/Occupation', value: 'Students pursuing approved higher education courses.' },
      { label: 'Special conditions', value: 'Academic performance and institution verification are typically required.' }
    ],
    importantDates: commonImportantDates,
    rejectionReasons: commonRejectionReasons,
    personalizedEligibility: {
      status: 'Eligible',
      why: 'The card matches a scholarship route, but the final result depends on your marks, income, and enrollment details.',
      missing: 'Class XII proof, income certificate, institution enrollment proof, and bank details.',
      nextSteps: 'Confirm the current cutoff marks and income limit, then submit through the scholarship portal.'
    },
    icon: "Award",
    iconBg: "#fff1f1",
    iconColor: "#dca1a1",
    tag: "Merit-based",
    tagBg: "#fff1f1",
    tagColor: "#dca1a1",
    category: "scholarship"
  },
  nmms: {
    id: "nmms",
    kicker: "School education",
    title: "National Means-cum-Merit Scholarship",
    fullTitle: "National Means-cum-Merit Scholarship",
    copy: "Support designed to help meritorious students from economically weaker families continue secondary education.",
    eligibility: "Eligible students generally apply through the state selection process and must meet income and academic criteria.",
    benefit: "Scholarship support for selected students to help reduce school dropout after Class VIII.",
    confidence: "85%",
    documents: ["Class 8th mark sheet", "Class 7th mark sheet", "Income certificate", "School registration proof"],
    benefitsSection: "Scholarship support for selected students to help reduce school dropout after Class VIII.",
    eligibilityCriteria: [
      { label: 'Age', value: 'Usually tied to the class level rather than a strict age cap.' },
      { label: 'Income', value: 'Family income must meet the scheme limit.' },
      { label: 'Category', value: 'Economically weaker, meritorious school students.' },
      { label: 'State/Domicile', value: 'State selection and domicile rules may apply.' },
      { label: 'Education/Occupation', value: 'Students studying in approved schools.' },
      { label: 'Special conditions', value: 'Selection tests or state-level screening may be required.' }
    ],
    importantDates: commonImportantDates,
    rejectionReasons: commonRejectionReasons,
    personalizedEligibility: {
      status: 'Eligible',
      why: 'The scheme fits school-level scholarship support, subject to selection and academic checks.',
      missing: 'Marksheets, income proof, and school registration documents.',
      nextSteps: 'Check your state application window and confirm the selection process before applying.'
    },
    icon: "BookOpenCheck",
    iconBg: "rgb(241, 237, 255)",
    iconColor: "rgb(97, 73, 175)",
    tag: "Class VIII onwards",
    tagBg: "rgb(241, 237, 255)",
    tagColor: "rgb(97, 73, 175)",
    category: "scholarship"
  },
  scpostmatric: {
    id: "scpostmatric",
    kicker: "Social justice",
    title: "Post-Matric Scholarship for SC Students",
    fullTitle: "Post-Matric Scholarship for SC Students",
    copy: "Financial support for eligible Scheduled Caste students studying after Class X.",
    eligibility: "SC students enrolled in approved post-matric courses who meet relevant income and state application conditions.",
    benefit: "Support may include maintenance allowance, compulsory fees and other approved study expenses.",
    confidence: "89%",
    documents: ["SC certificate", "12th pass certificate", "Income certificate", "Institution enrollment proof"],
    benefitsSection: "Support may include maintenance allowance, compulsory fees and other approved study expenses.",
    eligibilityCriteria: [
      { label: 'Age', value: 'As per the course and scheme rules.' },
      { label: 'Income', value: 'Household income must satisfy the current limit.' },
      { label: 'Category', value: 'Scheduled Caste students.' },
      { label: 'State/Domicile', value: 'State application and domicile conditions may apply.' },
      { label: 'Education/Occupation', value: 'Students enrolled in post-matric courses.' },
      { label: 'Special conditions', value: 'Admission in an approved institution and valid caste certificate are required.' }
    ],
    importantDates: commonImportantDates,
    rejectionReasons: commonRejectionReasons,
    personalizedEligibility: {
      status: 'Eligible',
      why: 'The card matches a post-matric scholarship for SC students, but income and institution checks still apply.',
      missing: 'SC certificate, income proof, enrollment proof, and qualifying exam records.',
      nextSteps: 'Review your state portal, confirm the current income ceiling, and apply with verified documents.'
    },
    icon: "GraduationCap",
    iconBg: "rgb(255, 243, 223)",
    iconColor: "rgb(164, 82, 0)",
    tag: "Post-matric study",
    tagBg: "rgb(255, 243, 223)",
    tagColor: "rgb(164, 82, 0)",
    category: "scholarship"
  },
  pragati: {
    id: "pragati",
    kicker: "Technical education",
    title: "AICTE Pragati Scholarship",
    fullTitle: "AICTE Pragati Scholarship",
    copy: "Scholarship support encouraging girls to pursue technical education in approved institutions.",
    eligibility: "Eligible girl students in approved technical diploma or degree programmes, subject to current family-income rules.",
    benefit: "Annual scholarship assistance for selected applicants under the current AICTE guidelines.",
    confidence: "91%",
    documents: ["Class 12th mark sheet", "Income certificate", "Institute enrollment proof", "Girl student verification"],
    benefitsSection: "Annual scholarship assistance for selected applicants under the current AICTE guidelines.",
    eligibilityCriteria: [
      { label: 'Age', value: 'Depends on the current technical course and scheme rules.' },
      { label: 'Income', value: 'Family income must meet the current guideline.' },
      { label: 'Category', value: 'Girl students in technical education.' },
      { label: 'State/Domicile', value: 'Implementing rules may vary by state and institution.' },
      { label: 'Education/Occupation', value: 'Approved diploma or degree technical programmes.' },
      { label: 'Special conditions', value: 'Institution approval and student verification are usually required.' }
    ],
    importantDates: commonImportantDates,
    rejectionReasons: commonRejectionReasons,
    personalizedEligibility: {
      status: 'Eligible',
      why: 'The card matches the Pragati scholarship, but the final result depends on course, institution, and income checks.',
      missing: 'Class 12 marksheet, income certificate, institute proof, and girl-student verification.',
      nextSteps: 'Confirm your institute is approved, then apply through the official AICTE process.'
    },
    icon: "Rocket",
    iconBg: "rgb(252, 236, 244)",
    iconColor: "rgb(166, 55, 104)",
    tag: "Girls in technical education",
    tagBg: "rgb(252, 236, 244)",
    tagColor: "rgb(166, 55, 104)",
    category: "scholarship"
  }
};
