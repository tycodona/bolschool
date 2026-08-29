import {
  EczGradeInfo,
  EczGradePoint,
  SchoolSection,
  SecondaryPathway,
  SecondaryPathwayInfo,
  Student,
  Teacher,
  StaffMember,
  ClassStream,
  SubjectAssessment,
  GradebookData,
  FeeItem,
  PaymentReceipt,
  HomeworkTask,
  ExamSchedule,
  LibraryBook,
  BookCheckout,
  InventoryItem,
  DisciplineRecord,
  HostelDormitory,
  HostelAllocation,
  TransportRoute,
  TransportVehicle,
  TransportPupilAssignment,
  SchoolEvent,
  ParentAccount,
  TermlyReportCard,
  UserMessage,
  AcademicTerm,
  ZambianHoliday,
  EventCategory,
  AcademicBatch,
  SubjectDefinition,
  ReportPublishStatus,
  TermResultsApproval,
  SchoolProfile,
  SchoolHouse,
  AuditLogEntry,
  TimetablePeriod,
  PupilApplication
} from "../types";

export const SYSTEM_NAME = "RYNTECH School Management System";
export const SCHOOL_NAME = "Bread of Life School";
export const SCHOOL_SLOGAN = "Quality Education in a Christian Environment";
export const SCHOOL_ADDRESS = "Plot 26523, Corner of Vubu & Lumumba Road, P.O. Box 37486, Lusaka, Zambia";
export const SCHOOL_PHONE = "+260977421180 / +260 977451325";
export const SCHOOL_EMAIL = "info@myblci.org";
export const MINISTRY_CENTRE_CODE = "Centre No: 0412";
export const CENTRE_CODE = MINISTRY_CENTRE_CODE;

export const ZAMBIAN_PROVINCES: Record<string, string[]> = {
  "Lusaka Province": ["Lusaka", "Chongwe", "Kafue", "Chilanga", "Luangwa", "Rufunsa", "Shibuyunji"],
  "Copperbelt Province": ["Ndola", "Kitwe", "Chingola", "Mufulira", "Luanshya", "Kalulushi", "Chililabombwe", "Lufwanyama", "Masaiti", "Mpongwe"],
  "Central Province": ["Kabwe", "Chibombo", "Kapiri Mposhi", "Mkushi", "Mumbwa", "Serenje", "Chisamba", "Luano", "Ngabwe", "Shibuyunji"],
  "Southern Province": ["Choma", "Livingstone", "Mazabuka", "Monze", "Kalomo", "Sinazongwe", "Gwembe", "Namwala", "Pemba", "Zimba", "Kazungula", "Chikankata"],
  "Eastern Province": ["Chipata", "Lundazi", "Petauke", "Katete", "Nyimba", "Mambwe", "Sinda", "Chadiza", "Vubwi", "Chasefu", "Lumezi"],
  "Northern Province": ["Kasama", "Mbala", "Mporokoso", "Luwingu", "Mpulungu", "Kaputa", "Mungwi", "Nsama", "Chilubi", "Lupososhi"],
  "Luapula Province": ["Mansa", "Kawambwa", "Nchelenge", "Samfya", "Mwense", "Chiengi", "Milenge", "Mwansabombwe", "Chipili", "Chembe", "Chifunabuli"],
  "North-Western Province": ["Solwezi", "Kasempa", "Mwinilunga", "Zambezi", "Kabompo", "Chavuma", "Mufumbwe", "Manyinga", "Ikelenge", "Kalumbila", "Mushindamo"],
  "Western Province": ["Mongu", "Kaoma", "Senanga", "Sesheke", "Kalabo", "Shang'ombo", "Lukulu", "Sioma", "Nalolo", "Limulunga", "Luampa", "Mitete", "Sikongo"],
  "Muchinga Province": ["Chinsali", "Mpika", "Isoka", "Nakonde", "Mafinga", "Shiwang'andu", "Kanchibiya", "Lavushimanda"]
};

export const initialHouses: SchoolHouse[] = [
  { id: "house-eagle", name: "Eagle House", color: "#1e40af", motto: "Soaring to Academic Heights", patronName: "Unassigned", studentCount: 0 },
  { id: "house-kafue", name: "Kafue House", color: "#047857", motto: "Flowing with Wisdom and Grace", patronName: "Unassigned", studentCount: 0 },
  { id: "house-victoria", name: "Victoria House", color: "#b45309", motto: "Thundering with Power and Virtue", patronName: "Unassigned", studentCount: 0 },
  { id: "house-zambezi", name: "Zambezi House", color: "#6d28d9", motto: "Mighty in Character and Truth", patronName: "Unassigned", studentCount: 0 }
];

export const initialDepartments: string[] = [
  "Mathematics & Computing",
  "Natural Sciences",
  "Languages & Literature",
  "Social Sciences & Humanities",
  "Business & Commercial Studies",
  "TEVET & Vocational Skills",
  "Expressive & Performing Arts",
  "Religious & Moral Education"
];

export const initialSchoolProfile: SchoolProfile = {
  name: "Bread of Life School",
  systemName: "RYNTECH School Management System",
  slogan: "Quality Education in a Christian Environment",
  motto: "Knowledge, Excellence & Christian Character",
  registrationNumber: "MOE/REG/LUS/2026/0412",
  examinationCenterCode: "ECZ-CENTRE-0412",
  schoolType: "Combined School (Primary & Secondary)",
  ownership: "Private (Mission / Church)",
  headteacherName: "Mr. Davison Banda",
  deputyHeadName: "Mrs. Mutale Musonda",
  phone: "+260 977 421180",
  altPhone: "+260 977 451325",
  email: "info@myblci.org",
  address: "Plot 26523, Corner of Vubu & Lumumba Road",
  city: "Lusaka",
  province: "Lusaka Province",
  district: "Lusaka District",
  country: "Zambia",
  currentYear: 2026,
  activeTerm: "Term 2",
  termStartDate: "2026-05-11",
  termEndDate: "2026-08-07",
  nextTermStartDate: "2026-08-31",
  missionStatement: "To provide holistic, Christ-centred quality education that equips pupils with academic excellence, vocational skills, moral integrity, and national leadership qualities.",
  visionStatement: "To be a premier Christian educational institution in Zambia producing self-reliant, God-fearing, and innovative leaders for national development.",
  bankName: "Indo Zambia Bank / ZANACO",
  bankAccountName: "Bread of Life Church International School",
  bankAccountNumber: "0120285491024",
  bankBranch: "Lusaka Main Branch",
  mobileMoneyNumber: "*115*4*1*40285# (Airtel) / MTN MoMo Pay: 882014",
  themeColor: "#065f46",
  houses: initialHouses,
  departments: initialDepartments,
  currency: "ZMW",
  smsGatewayEnabled: true,
  whatsappGatewayEnabled: true,
  momoGatewayEnabled: true
};

export const initialTimetableData: TimetablePeriod[] = [];

export const SECONDARY_PATHWAYS: Record<SecondaryPathway, SecondaryPathwayInfo> = {
  "Natural Sciences": {
    id: "Natural Sciences",
    name: "Natural Sciences & STEM",
    code: "SCI-STEM",
    description: "Designed for pupils pursuing medicine, biological sciences, physical engineering, computing, and technological innovations.",
    badgeColor: "#059669",
    accentColor: "emerald",
    iconName: "Atom",
    level: "Senior Secondary (Grades 10-12)",
    coreSubjects: ["English Language", "Mathematics", "Civic Education"],
    specializationSubjects: ["Pure Physics", "Pure Chemistry", "Biology", "Additional Mathematics", "Computer Science"],
    careerPaths: [
      "Medicine & Surgery (MBChB)",
      "Civil / Electrical / Mechanical Engineering",
      "Computer Science & Software Systems",
      "Pharmacy & Biotechnology",
      "Architecture & Quantity Surveying"
    ],
    entryRequirements: "Distinction or Merit in Grade 9 Mathematics and Integrated Science."
  },
  "Business & Commercial": {
    id: "Business & Commercial",
    name: "Business, Commercial & Finance",
    code: "BUS-COM",
    description: "Tailored for future corporate leaders, chartered accountants, economists, bankers, and innovative entrepreneurs.",
    badgeColor: "#d97706",
    accentColor: "amber",
    iconName: "TrendingUp",
    level: "Senior Secondary (Grades 10-12)",
    coreSubjects: ["English Language", "Mathematics", "Civic Education"],
    specializationSubjects: ["Principles of Accounts", "Commerce", "Economics", "Business Studies", "Information Technology"],
    careerPaths: [
      "Chartered Accountancy (ZICA / ACCA)",
      "Banking & Financial Management",
      "Economics & Macroeconomic Policy",
      "Business Administration & Marketing",
      "Procurement & Supply Chain Management"
    ],
    entryRequirements: "Strong pass in Grade 9 Mathematics and Business Studies."
  },
  "Social Sciences & Humanities": {
    id: "Social Sciences & Humanities",
    name: "Social Sciences, Humanities & Arts",
    code: "SOC-HUM",
    description: "Focused on legal jurisprudence, governance, diplomacy, literary arts, communication, and social transformation.",
    badgeColor: "#7c3aed",
    accentColor: "purple",
    iconName: "BookOpen",
    level: "Senior Secondary (Grades 10-12)",
    coreSubjects: ["English Language", "Mathematics", "Civic Education"],
    specializationSubjects: ["History", "Geography", "Literature in English", "Religious Education (2046)", "Zambian Languages (Icibemba / Cinyanja)", "Art & Design"],
    careerPaths: [
      "Law & Legal Practice (LLB)",
      "Mass Communication & Investigative Journalism",
      "International Relations & Diplomatic Service",
      "Public Policy & Human Resource Management",
      "Secondary School & Higher Education Teaching"
    ],
    entryRequirements: "Distinction or Merit in Grade 9 English Language and Social Studies."
  },
  "Technical & Vocational": {
    id: "Technical & Vocational",
    name: "Technical, Vocational & Applied STEM (TEVET)",
    code: "TECH-VOC",
    description: "Practical and industry-aligned hands-on craftsmanship, agricultural biotechnology, construction design, and food science.",
    badgeColor: "#0284c7",
    accentColor: "sky",
    iconName: "Wrench",
    level: "Senior Secondary (Grades 10-12)",
    coreSubjects: ["English Language", "Mathematics", "Civic Education"],
    specializationSubjects: ["Design & Technology", "Technical Drawing", "Agricultural Science", "Food & Nutrition", "Computer Studies"],
    careerPaths: [
      "Applied Industrial Engineering & Instrumentation",
      "Commercial Agriculture & Agribusiness",
      "Building Construction & Structural Drafting",
      "Food Processing Technology & Nutrition",
      "Applied ICT & Hardware Engineering"
    ],
    entryRequirements: "Interest in practical technology, agriculture, or design crafts."
  },
  "Junior Secondary Core": {
    id: "Junior Secondary Core",
    name: "Junior Secondary Foundational Pathway",
    code: "JUNIOR-SEC",
    description: "Comprehensive preparatory foundation for Grades 8 and 9 covering core sciences, humanities, languages, and technical previews before pathway selection.",
    badgeColor: "#475569",
    accentColor: "slate",
    iconName: "GraduationCap",
    level: "Junior Secondary (Grades 8-9)",
    coreSubjects: ["English Language", "Mathematics", "Integrated Science", "Social Studies", "Civic Education"],
    specializationSubjects: ["Business Studies", "Computer Studies", "Agricultural Science", "Religious Education", "Icibemba / Cinyanja"],
    careerPaths: [
      "Preparation for Senior Secondary Pathway Allocation",
      "National Junior Secondary School Leaving Examination (Grade 9)"
    ],
    entryRequirements: "Successful completion of Primary School (Grade 7 Examination)."
  }
};

export const ECZ_GRADE_SCALE: Record<EczGradePoint, EczGradeInfo> = {
  1: { point: 1, label: "Distinction", description: "Distinction (75 - 100%)", badgeColor: "#16a34a" },
  2: { point: 2, label: "Distinction", description: "Distinction (70 - 74%)", badgeColor: "#22c55e" },
  3: { point: 3, label: "Merit", description: "Merit (65 - 69%)", badgeColor: "#0284c7" },
  4: { point: 4, label: "Merit", description: "Merit (60 - 64%)", badgeColor: "#0ea5e9" },
  5: { point: 5, label: "Credit", description: "Credit (55 - 59%)", badgeColor: "#d97706" },
  6: { point: 6, label: "Credit", description: "Credit (50 - 54%)", badgeColor: "#f59e0b" },
  7: { point: 7, label: "Satisfactory", description: "Satisfactory (45 - 49%)", badgeColor: "#64748b" },
  8: { point: 8, label: "Satisfactory", description: "Satisfactory (40 - 44%)", badgeColor: "#94a3b8" },
  9: { point: 9, label: "Unsatisfactory", description: "Unsatisfactory (0 - 39%)", badgeColor: "#ef4444" },
};

/**
 * Official ECZ Grade 7 Composite Examination (Primary School Leaving) 5-Point Grade Scale & Division Standards
 */
export interface Grade7ScaleInfo {
  point: 1 | 2 | 3 | 4 | 5;
  label: "Distinction" | "Merit" | "Credit" | "Satisfactory" | "Unsatisfactory";
  division: "Division 1" | "Division 2" | "Division 3" | "Division 4" | "Ungraded";
  range: string;
  minScore: number;
  maxScore: number;
  description: string;
  badgeColor: string;
  selectionPlacement: string;
}

export const GRADE_7_ECZ_SCALE: Record<number, Grade7ScaleInfo> = {
  1: {
    point: 1,
    label: "Distinction",
    division: "Division 1",
    range: "75 – 100%",
    minScore: 75,
    maxScore: 100,
    description: "Distinction (Outstanding Performance)",
    badgeColor: "#16a34a",
    selectionPlacement: "National & STEM Secondary School Placement"
  },
  2: {
    point: 2,
    label: "Merit",
    division: "Division 2",
    range: "65 – 74%",
    minScore: 65,
    maxScore: 74,
    description: "Merit (Very Good Performance)",
    badgeColor: "#0284c7",
    selectionPlacement: "Provincial & Boarding Secondary Placement"
  },
  3: {
    point: 3,
    label: "Credit",
    division: "Division 3",
    range: "50 – 64%",
    minScore: 50,
    maxScore: 64,
    description: "Credit (Good Pass / Sound Understanding)",
    badgeColor: "#d97706",
    selectionPlacement: "Day Secondary School Placement"
  },
  4: {
    point: 4,
    label: "Satisfactory",
    division: "Division 4",
    range: "40 – 49%",
    minScore: 40,
    maxScore: 49,
    description: "Satisfactory / Pass (Basic Primary Leaving Pass)",
    badgeColor: "#64748b",
    selectionPlacement: "Basic Primary Leaving Pass / General Secondary Placement"
  },
  5: {
    point: 5,
    label: "Unsatisfactory",
    division: "Ungraded",
    range: "0 – 39%",
    minScore: 0,
    maxScore: 39,
    description: "Unsatisfactory / Fail (Below Pass Mark)",
    badgeColor: "#ef4444",
    selectionPlacement: "Below Cut-off (Did Not Qualify / Resit Required)"
  }
};

export const GRADE_SCALE = ECZ_GRADE_SCALE;
export const SCHOOL_GRADE_SCALE = ECZ_GRADE_SCALE;

export interface GradeStructureInfo {
  id: string;
  name: string;
  section: SchoolSection;
  stage: string;
  ageRange: string;
  code: string;
  gradeNum: number;
}

export const ZAMBIAN_GRADE_STRUCTURE: GradeStructureInfo[] = [
  // Early Childhood Education (ECE)
  { id: "Baby Class", name: "Baby Class", section: "Early Childhood", stage: "Early Childhood Education (ECE)", ageRange: "3 - 4 Years", code: "ECE-BC", gradeNum: 0 },
  { id: "Middle Class", name: "Middle Class", section: "Early Childhood", stage: "Early Childhood Education (ECE)", ageRange: "4 - 5 Years", code: "ECE-MC", gradeNum: 0 },
  { id: "Reception", name: "Reception", section: "Early Childhood", stage: "Early Childhood Education (ECE)", ageRange: "5 - 6 Years", code: "ECE-REC", gradeNum: 0 },

  // Primary School (Grades 1 to 7)
  { id: "Grade 1", name: "Grade 1", section: "Primary", stage: "Lower Primary", ageRange: "6 - 7 Years", code: "PRI-G1", gradeNum: 1 },
  { id: "Grade 2", name: "Grade 2", section: "Primary", stage: "Lower Primary", ageRange: "7 - 8 Years", code: "PRI-G2", gradeNum: 2 },
  { id: "Grade 3", name: "Grade 3", section: "Primary", stage: "Lower Primary", ageRange: "8 - 9 Years", code: "PRI-G3", gradeNum: 3 },
  { id: "Grade 4", name: "Grade 4", section: "Primary", stage: "Upper Primary", ageRange: "9 - 10 Years", code: "PRI-G4", gradeNum: 4 },
  { id: "Grade 5", name: "Grade 5", section: "Primary", stage: "Upper Primary", ageRange: "10 - 11 Years", code: "PRI-G5", gradeNum: 5 },
  { id: "Grade 6", name: "Grade 6", section: "Primary", stage: "Upper Primary", ageRange: "11 - 12 Years", code: "PRI-G6", gradeNum: 6 },
  { id: "Grade 7", name: "Grade 7", section: "Primary", stage: "Upper Primary (Primary Leaving Exam)", ageRange: "12 - 13 Years", code: "PRI-G7", gradeNum: 7 },

  // Secondary School (Form 1 to Form 4)
  { id: "Form 1", name: "Form 1", section: "Secondary", stage: "Junior Secondary", ageRange: "13 - 14 Years", code: "SEC-F1", gradeNum: 8 },
  { id: "Form 2", name: "Form 2", section: "Secondary", stage: "Junior Secondary (JSCE Exam)", ageRange: "14 - 15 Years", code: "SEC-F2", gradeNum: 9 },
  { id: "Form 3", name: "Form 3", section: "Secondary", stage: "Senior Secondary (Pathways)", ageRange: "15 - 16 Years", code: "SEC-F3", gradeNum: 10 },
  { id: "Form 4", name: "Form 4", section: "Secondary", stage: "Senior Secondary (Graduating Form / School Leaving)", ageRange: "16 - 17 Years", code: "SEC-F4", gradeNum: 12 }
];

export function calculateEczGrade(score: number, maxScale: number = 100): { point: EczGradePoint; label: string; remark: string } {
  // If maxScale is 150 or score is > 100, calculate percentage equivalent from 150
  const effectivePct = maxScale === 150 || score > 100
    ? Math.min(100, Math.round((score / (maxScale === 150 ? 150 : (score > 100 ? 150 : 100))) * 100))
    : Math.round(score);

  if (effectivePct >= 75) return { point: 1, label: "Distinction", remark: "Distinction (Outstanding performance)" };
  if (effectivePct >= 70) return { point: 2, label: "Distinction", remark: "Distinction (Very good understanding)" };
  if (effectivePct >= 65) return { point: 3, label: "Merit", remark: "Merit (Good command of subject)" };
  if (effectivePct >= 60) return { point: 4, label: "Merit", remark: "Merit (Above average work)" };
  if (effectivePct >= 55) return { point: 5, label: "Credit", remark: "Credit (Sound understanding)" };
  if (effectivePct >= 50) return { point: 6, label: "Credit", remark: "Credit (Satisfactory progress)" };
  if (effectivePct >= 45) return { point: 7, label: "Satisfactory", remark: "Satisfactory (Basic pass level)" };
  if (effectivePct >= 40) return { point: 8, label: "Satisfactory", remark: "Satisfactory (Marginal pass)" };
  return { point: 9, label: "Unsatisfactory", remark: "Unsatisfactory (Needs urgent improvement)" };
}

/**
 * Official Grade 7 ECZ Final Exam Grading Function
 * Maps raw score (out of 150 or percentage 0-100%) to:
 * - Grade 1 (75-100%): Distinction (Division 1)
 * - Grade 2 (65-74%): Merit (Division 2)
 * - Grade 3 (50-64%): Credit (Division 3)
 * - Grade 4 (40-49%): Satisfactory / Pass (Division 4)
 * - Grade 5 (0-39%): Unsatisfactory / Fail (Ungraded)
 */
export function calculateGrade7EczGrade(score: number, maxScale: number = 100): {
  point: 1 | 2 | 3 | 4 | 5;
  label: "Distinction" | "Merit" | "Credit" | "Satisfactory" | "Unsatisfactory";
  remark: string;
  division: "Division 1" | "Division 2" | "Division 3" | "Division 4" | "Ungraded";
  badgeColor: string;
  selectionPlacement: string;
} {
  const rounded = maxScale === 150 || score > 100
    ? Math.min(100, Math.round((score / (maxScale === 150 ? 150 : (score > 100 ? 150 : 100))) * 100))
    : Math.round(score);

  if (rounded >= 75) {
    return {
      point: 1,
      label: "Distinction",
      remark: "Distinction (Outstanding primary leaving standard)",
      division: "Division 1",
      badgeColor: "#16a34a",
      selectionPlacement: "National & STEM Secondary Placement"
    };
  }
  if (rounded >= 65) {
    return {
      point: 2,
      label: "Merit",
      remark: "Merit (Very good performance)",
      division: "Division 2",
      badgeColor: "#0284c7",
      selectionPlacement: "Provincial Secondary Placement"
    };
  }
  if (rounded >= 50) {
    return {
      point: 3,
      label: "Credit",
      remark: "Credit (Good solid pass)",
      division: "Division 3",
      badgeColor: "#d97706",
      selectionPlacement: "Day Secondary Placement"
    };
  }
  if (rounded >= 40) {
    return {
      point: 4,
      label: "Satisfactory",
      remark: "Satisfactory (Basic pass)",
      division: "Division 4",
      badgeColor: "#64748b",
      selectionPlacement: "Basic Primary Leaving Pass"
    };
  }
  return {
    point: 5,
    label: "Unsatisfactory",
    remark: "Unsatisfactory (Below pass mark)",
    division: "Ungraded",
    badgeColor: "#ef4444",
    selectionPlacement: "Below Selection Cut-off"
  };
}

/**
 * Calculates overall Grade 7 Composite Exam Division and placement for a student
 */
export function calculateGrade7CandidateDivision(subjectScores: { subject: string; score: number }[]): {
  division: "Division 1" | "Division 2" | "Division 3" | "Division 4" | "Ungraded";
  aggregateScore: number;
  averageScore: number;
  best6Aggregate: number;
  distinctionCount: number;
  meritCount: number;
  creditCount: number;
  passCount: number;
  failCount: number;
  recommendation: string;
  placementBadgeColor: string;
} {
  if (!subjectScores || subjectScores.length === 0) {
    return {
      division: "Ungraded",
      aggregateScore: 0,
      averageScore: 0,
      best6Aggregate: 0,
      distinctionCount: 0,
      meritCount: 0,
      creditCount: 0,
      passCount: 0,
      failCount: 0,
      recommendation: "No assessment data recorded",
      placementBadgeColor: "#64748b"
    };
  }

  let totalScore = 0;
  let distinctionCount = 0;
  let meritCount = 0;
  let creditCount = 0;
  let passCount = 0;
  let failCount = 0;

  const pointScores: number[] = [];

  subjectScores.forEach(({ score }) => {
    totalScore += score;
    const g7 = calculateGrade7EczGrade(score);
    pointScores.push(g7.point);
    if (g7.point === 1) distinctionCount++;
    else if (g7.point === 2) meritCount++;
    else if (g7.point === 3) creditCount++;
    else if (g7.point === 4) passCount++;
    else failCount++;
  });

  const averageScore = Math.round(totalScore / subjectScores.length);
  
  // Best 6 points (1 = best, 5 = worst)
  pointScores.sort((a, b) => a - b);
  const best6Points = pointScores.slice(0, 6);
  const best6Aggregate = best6Points.reduce((acc, p) => acc + p, 0);

  let division: "Division 1" | "Division 2" | "Division 3" | "Division 4" | "Ungraded";
  let recommendation = "";
  let placementBadgeColor = "#16a34a";

  if (averageScore >= 75 || (distinctionCount + meritCount >= 5 && failCount === 0)) {
    division = "Division 1";
    recommendation = "Selected for National & STEM Technical Secondary School Placement";
    placementBadgeColor = "#16a34a";
  } else if (averageScore >= 65 || (distinctionCount + meritCount + creditCount >= 5 && failCount === 0)) {
    division = "Division 2";
    recommendation = "Selected for Provincial & Boarding Secondary School Placement";
    placementBadgeColor = "#0284c7";
  } else if (averageScore >= 50 || (passCount + creditCount + meritCount + distinctionCount >= 5)) {
    division = "Division 3";
    recommendation = "Selected for Regular Day Secondary School Placement";
    placementBadgeColor = "#d97706";
  } else if (averageScore >= 40) {
    division = "Division 4";
    recommendation = "Primary School Leaving Certificate Awarded (General Placement)";
    placementBadgeColor = "#64748b";
  } else {
    division = "Ungraded";
    recommendation = "Unsatisfactory / Below Selection Cut-off (Remedial Study Required)";
    placementBadgeColor = "#ef4444";
  }

  return {
    division,
    aggregateScore: totalScore,
    averageScore,
    best6Aggregate,
    distinctionCount,
    meritCount,
    creditCount,
    passCount,
    failCount,
    recommendation,
    placementBadgeColor
  };
}

/**
 * Calculates official ECZ Candidate Division & Placement for Primary Grades 4 to 7 final examination assessments.
 */
export const calculatePrimaryCandidateDivision = calculateGrade7CandidateDivision;

/**
 * Checks if a grade number, string, or student grade belongs to Primary Grades 4 to 7 (Upper Primary Final Exams Scale).
 */
export function isGrade4to7Grade(gradeInput?: number | string | null): boolean {
  if (gradeInput === undefined || gradeInput === null) return false;
  if (typeof gradeInput === "number") {
    return gradeInput >= 4 && gradeInput <= 7;
  }
  const gStr = String(gradeInput).toLowerCase().trim();
  if (
    gStr.includes("form") ||
    gStr.includes("grade 8") ||
    gStr.includes("grade 9") ||
    gStr.includes("grade 10") ||
    gStr.includes("grade 11") ||
    gStr.includes("grade 12") ||
    gStr.includes("g8") ||
    gStr.includes("g9") ||
    gStr.includes("g10") ||
    gStr.includes("g11") ||
    gStr.includes("g12")
  ) {
    return false;
  }
  if (
    gStr.includes("grade 4") ||
    gStr.includes("grade 5") ||
    gStr.includes("grade 6") ||
    gStr.includes("grade 7") ||
    gStr.includes("g4") ||
    gStr.includes("g5") ||
    gStr.includes("g6") ||
    gStr.includes("g7") ||
    gStr === "4" ||
    gStr === "5" ||
    gStr === "6" ||
    gStr === "7"
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if a class stream or class name belongs to Primary Grades 4 to 7.
 */
export function isGrade4to7Class(cls?: { gradeNum?: number; name?: string; section?: string } | string | number | null): boolean {
  if (!cls) return false;
  if (typeof cls === "number") return cls >= 4 && cls <= 7;
  if (typeof cls === "string") return isGrade4to7Grade(cls);
  if (typeof cls.gradeNum === "number" && cls.gradeNum >= 4 && cls.gradeNum <= 7) return true;
  if (cls.name && isGrade4to7Grade(cls.name)) return true;
  return false;
}

export function isGrade7Class(cls?: { gradeNum?: number; name?: string } | null): boolean {
  if (!cls) return false;
  if (cls.gradeNum === 7) return true;
  if (cls.name && (cls.name.toLowerCase().includes("grade 7") || cls.name.toLowerCase().includes("g7"))) return true;
  return false;
}

export function getZambianSubjectsForGrade(gradeInput: number | string, pathway?: SecondaryPathway): string[] {
  const gStr = String(gradeInput).toLowerCase().trim();

  // Early Childhood Education (Baby Class, Middle Class, Reception)
  if (
    gStr.includes("baby") ||
    gStr.includes("middle") ||
    gStr.includes("reception") ||
    gStr.includes("ece") ||
    gradeInput === 0
  ) {
    return [
      "Language & Pre-Literacy",
      "Early Numbers & Mathematical Concepts",
      "Social & Environmental Exploration",
      "Creative & Expressive Arts",
      "Physical Development & Motor Skills",
      "Christian Character & Moral Values"
    ];
  }

  // Lower Primary (Grades 1-4)
  if (
    gStr === "1" || gStr === "2" || gStr === "3" || gStr === "4" ||
    gStr === "grade 1" || gStr === "grade 2" || gStr === "grade 3" || gStr === "grade 4" ||
    (typeof gradeInput === "number" && gradeInput >= 1 && gradeInput <= 4)
  ) {
    return [
      "Literacy & English",
      "Icibemba / Zambian Language",
      "Mathematics",
      "Integrated Science",
      "Social & Development Studies",
      "Creative & Technology Studies (CTS)"
    ];
  }

  // Grade 7 (Official ECZ Primary School Leaving Composite Examination Papers)
  if (
    gStr === "7" || gStr === "grade 7" || gStr.includes("grade 7") ||
    gradeInput === 7
  ) {
    return [
      "English Language",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Icibemba / Cinyanja (Zambian Language)",
      "Creative & Technology Studies (CTS)",
      "Special Paper 1 (Reasoning)",
      "Special Paper 2 (Aptitude)"
    ];
  }

  // Upper Primary (Grades 5-6)
  if (
    gStr === "5" || gStr === "6" ||
    gStr === "grade 5" || gStr === "grade 6" ||
    (typeof gradeInput === "number" && gradeInput >= 5 && gradeInput <= 6)
  ) {
    return [
      "English Language",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Icibemba / Cinyanja (Zambian Language)",
      "Creative & Technology Studies (CTS)",
      "Expressive Arts & R.E."
    ];
  }

  // Junior Secondary (Form 1, Form 2 or Grade 8-9)
  if (
    gStr.includes("form 1") || gStr.includes("form 2") ||
    gStr.includes("grade 8") || gStr.includes("grade 9") ||
    gradeInput === 8 || gradeInput === 9
  ) {
    return [
      "English Language",
      "Mathematics",
      "Integrated Science",
      "Social Studies",
      "Civic Education",
      "Business Studies",
      "Computer Studies",
      "Agricultural Science",
      "Religious Education"
    ];
  }

  // Senior Secondary (Form 3, Form 4 or Grade 10-12) mapped to Pathway
  switch (pathway) {
    case "Natural Sciences":
      return [
        "English Language",
        "Mathematics",
        "Civic Education",
        "Pure Physics",
        "Pure Chemistry",
        "Biology",
        "Additional Mathematics",
        "Computer Science"
      ];
    case "Business & Commercial":
      return [
        "English Language",
        "Mathematics",
        "Civic Education",
        "Principles of Accounts",
        "Commerce",
        "Economics",
        "Business Studies",
        "Information Technology"
      ];
    case "Social Sciences & Humanities":
      return [
        "English Language",
        "Mathematics",
        "Civic Education",
        "History",
        "Geography",
        "Literature in English",
        "Religious Education (2046)",
        "Zambian Languages (Icibemba / Cinyanja)"
      ];
    case "Technical & Vocational":
      return [
        "English Language",
        "Mathematics",
        "Civic Education",
        "Design & Technology",
        "Technical Drawing",
        "Agricultural Science",
        "Food & Nutrition",
        "Computer Studies"
      ];
    default:
      return [
        "English Language",
        "Mathematics",
        "Civic Education",
        "Pure Physics",
        "Pure Chemistry",
        "Biology",
        "Principles of Accounts",
        "History"
      ];
  }
}

export const initialBatches: AcademicBatch[] = [];

export const initialSubjectsCatalog: SubjectDefinition[] = [
  // Primary Core Subjects
  {
    id: "SUB-PRI-ENG",
    code: "101",
    name: "English Language & Literacy",
    category: "Core",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6, 7],
    passMark: 50,
    weeklyPeriods: 7,
    department: "Languages",
    description: "Reading comprehension, creative writing, grammar, phonics and communicative competence."
  },
  {
    id: "SUB-PRI-MATH",
    code: "102",
    name: "Mathematics",
    category: "Core",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6, 7],
    passMark: 50,
    weeklyPeriods: 7,
    department: "Mathematics & Computing",
    description: "Numeracy, arithmetic, basic geometry, fractions, percentages and word problem solving."
  },
  {
    id: "SUB-PRI-SCI",
    code: "103",
    name: "Integrated Science",
    category: "Core",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6, 7],
    passMark: 50,
    weeklyPeriods: 5,
    department: "Natural Sciences",
    description: "Human body, plant and animal biology, environment, energy, weather and matter."
  },
  {
    id: "SUB-PRI-SOC",
    code: "104",
    name: "Social Studies",
    category: "Core",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6, 7],
    passMark: 45,
    weeklyPeriods: 4,
    department: "Social Sciences",
    description: "Zambian history, geography, governance, civic duty and cultural heritage."
  },
  {
    id: "SUB-PRI-ZAM",
    code: "105",
    name: "Icibemba / Cinyanja (Zambian Language)",
    category: "Core",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6, 7],
    passMark: 45,
    weeklyPeriods: 4,
    department: "Languages",
    description: "Mother tongue literacy, local proverbs, oral traditions and Zambian cultural expression."
  },
  {
    id: "SUB-PRI-CTS",
    code: "106",
    name: "Creative & Technology Studies (CTS)",
    category: "Vocational / Practical",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6, 7],
    passMark: 45,
    weeklyPeriods: 3,
    department: "Practical Skills",
    description: "Arts, physical education, practical crafts, music and foundational computer awareness."
  },
  {
    id: "SUB-PRI-RE",
    code: "107",
    name: "Religious Education & Christian Values",
    category: "Religious & Moral",
    section: "Primary",
    gradesApplicable: [1, 2, 3, 4, 5, 6],
    passMark: 50,
    weeklyPeriods: 3,
    department: "Social Sciences",
    description: "Biblical ethics, character development, moral integrity and Christian living."
  },
  {
    id: "SUB-PRI-SP1",
    code: "107",
    name: "Special Paper 1 (Reasoning)",
    category: "Core",
    section: "Primary",
    gradesApplicable: [7],
    passMark: 40,
    weeklyPeriods: 3,
    department: "Examination & Aptitude",
    description: "ECZ Grade 7 Non-verbal and spatial abstract reasoning composite examination paper."
  },
  {
    id: "SUB-PRI-SP2",
    code: "108",
    name: "Special Paper 2 (Aptitude)",
    category: "Core",
    section: "Primary",
    gradesApplicable: [7],
    passMark: 40,
    weeklyPeriods: 3,
    department: "Examination & Aptitude",
    description: "ECZ Grade 7 Quantitative, logical, and verbal aptitude composite examination paper."
  },

  // Junior & Senior Secondary Subjects
  {
    id: "SUB-SEC-ENG",
    code: "1121",
    name: "English Language",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [8, 9, 10, 11, 12],
    passMark: 50,
    weeklyPeriods: 6,
    department: "Languages",
    description: "ECZ Paper 1 (Composition & Summary) and Paper 2 (Comprehension & Structures)."
  },
  {
    id: "SUB-SEC-MATH",
    code: "4024",
    name: "Mathematics",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [8, 9, 10, 11, 12],
    passMark: 50,
    weeklyPeriods: 7,
    department: "Mathematics & Computing",
    description: "Algebra, trigonometry, statistics, calculus, matrices, vectors and coordinate geometry."
  },
  {
    id: "SUB-SEC-CIV",
    code: "2030",
    name: "Civic Education",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [8, 9, 10, 11, 12],
    passMark: 50,
    weeklyPeriods: 4,
    department: "Social Sciences",
    description: "Constitution, human rights, rule of law, anti-corruption, democracy and international relations."
  },
  {
    id: "SUB-SEC-PHY",
    code: "5124",
    name: "Pure Physics",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Natural Sciences",
    passMark: 50,
    weeklyPeriods: 6,
    department: "Natural Sciences",
    description: "Mechanics, thermal physics, wave optics, electricity, electromagnetism and modern nuclear physics."
  },
  {
    id: "SUB-SEC-CHE",
    code: "5070",
    name: "Pure Chemistry",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Natural Sciences",
    passMark: 50,
    weeklyPeriods: 6,
    department: "Natural Sciences",
    description: "Atomic structure, stoichiometry, chemical bonding, organic chemistry and laboratory analysis."
  },
  {
    id: "SUB-SEC-BIO",
    code: "5090",
    name: "Biology",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Natural Sciences",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Natural Sciences",
    description: "Human physiology, cell biology, genetics, ecology, botany and microbiology."
  },
  {
    id: "SUB-SEC-ADDM",
    code: "4037",
    name: "Additional Mathematics",
    category: "Elective",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Natural Sciences",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Mathematics & Computing",
    description: "Advanced calculus, binomial series, circular measure, permutations and trigonometry."
  },
  {
    id: "SUB-SEC-ACC",
    code: "7110",
    name: "Principles of Accounts",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Business & Commercial",
    passMark: 50,
    weeklyPeriods: 6,
    department: "Business Studies",
    description: "Ledger entries, trial balances, financial statements, bank reconciliations and partnership accounting."
  },
  {
    id: "SUB-SEC-COM",
    code: "7100",
    name: "Commerce",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Business & Commercial",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Business Studies",
    description: "Trade, banking, insurance, transportation, marketing and international commerce."
  },
  {
    id: "SUB-SEC-ECO",
    code: "2281",
    name: "Economics",
    category: "Elective",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Business & Commercial",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Business Studies",
    description: "Microeconomics, macroeconomic policy, inflation, monetary systems and global economic trade."
  },
  {
    id: "SUB-SEC-LIT",
    code: "2010",
    name: "Literature in English",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Social Sciences & Humanities",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Languages",
    description: "African prose, Shakespearean drama, world poetry and literary critical appreciation."
  },
  {
    id: "SUB-SEC-HIS",
    code: "2167",
    name: "History",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Social Sciences & Humanities",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Social Sciences",
    description: "Central African history, pre-colonial civilizations, nationalism, and 20th-century world events."
  },
  {
    id: "SUB-SEC-GEO",
    code: "2218",
    name: "Geography",
    category: "Core",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Social Sciences & Humanities",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Social Sciences",
    description: "Physical geography, map reading, climatology, economic geography of Zambia and SADC region."
  },
  {
    id: "SUB-SEC-RE2046",
    code: "2046",
    name: "Religious Education (2046)",
    category: "Elective",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Social Sciences & Humanities",
    passMark: 50,
    weeklyPeriods: 4,
    department: "Social Sciences",
    description: "Christian teachings, moral dilemmas, social justice, ethics and contemporary spiritual issues."
  },
  {
    id: "SUB-SEC-CS",
    code: "7010",
    name: "Computer Studies & ICT",
    category: "Vocational / Practical",
    section: "Secondary",
    gradesApplicable: [8, 9, 10, 11, 12],
    passMark: 50,
    weeklyPeriods: 5,
    department: "Mathematics & Computing",
    description: "Algorithm design, database systems, spreadsheets, network fundamentals and introductory coding."
  },
  {
    id: "SUB-SEC-DT",
    code: "6043",
    name: "Design & Technology (D&T)",
    category: "Vocational / Practical",
    section: "Secondary",
    gradesApplicable: [10, 11, 12],
    pathway: "Technical & Vocational",
    passMark: 50,
    weeklyPeriods: 6,
    department: "Practical Skills",
    description: "Orthographic projection, workshop fabrication, electronics, materials science and product design."
  },
  {
    id: "SUB-SEC-AGRI",
    code: "5038",
    name: "Agricultural Science",
    category: "Vocational / Practical",
    section: "Secondary",
    gradesApplicable: [8, 9, 10, 11, 12],
    pathway: "Technical & Vocational",
    passMark: 50,
    weeklyPeriods: 5,
    department: "Practical Skills",
    description: "Crop husbandry, animal science, soil fertility, farm management and agricultural mechanization."
  }
];

export const initialClasses: ClassStream[] = [];

export const initialResultsApprovals: Record<number, Record<string, TermResultsApproval>> = {};

export const initialTeachers: Teacher[] = [];

export const initialStudents: Student[] = [];

export const initialParentAccounts: ParentAccount[] = [];

export function buildDefaultGradebook(): GradebookData {
  const gb: GradebookData = {};
  initialClasses.forEach(cls => {
    gb[cls.id] = { "Term 1": {}, "Term 2": {}, "Term 3": {} };
    const subs = getZambianSubjectsForGrade(cls.gradeNum, cls.pathway);
    ["Term 1", "Term 2", "Term 3"].forEach(termKey => {
      subs.forEach(subj => {
        if (!gb[cls.id][termKey][subj]) {
          gb[cls.id][termKey][subj] = {};
        }
      });
    });
  });
  return gb;
}

export const initialTermlyReports: Record<number, Record<string, TermlyReportCard>> = {};

export const initialFees: FeeItem[] = [];

export const initialHomework: HomeworkTask[] = [];

export const initialExams: ExamSchedule[] = [];

export const initialBooks: LibraryBook[] = [
  { id: 1, title: "Zambian Primary Mathematics Grade 7", author: "CDC / Ministry of Education", category: "Mathematics", totalCopies: 25, availableCopies: 18 },
  { id: 2, title: "Zambian Primary Science & Environment", author: "Longman Zambia", category: "Science & Nature", totalCopies: 20, availableCopies: 12 },
  { id: 3, title: "Social Studies Pupil's Book Grade 5", author: "Macmillan Zambia", category: "Zambian History & Social", totalCopies: 15, availableCopies: 9 },
  { id: 4, title: "Senior Secondary Physics for Zambia", author: "Longman / CDC", category: "Science & Nature", totalCopies: 30, availableCopies: 24 },
  { id: 5, title: "Principles of Accounts for Senior Secondary", author: "Frank Wood & O. Sangster", category: "Reference & Dictionary", totalCopies: 25, availableCopies: 19 },
  { id: 6, title: "Stories from Zambia: Kalulu the Hare", author: "Stephen A. Mpashi", category: "Story Books", totalCopies: 10, availableCopies: 4 },
  { id: 7, title: "Secondary School English Dictionary & Grammar", author: "Oxford University Press", category: "Reference & Dictionary", totalCopies: 20, availableCopies: 15 },
];

export const initialRoutes: TransportRoute[] = [
  {
    id: 1,
    name: "Route 1: Chelstone – Avondale – Great East Corridor",
    routeName: "Route 1: Chelstone – Avondale – Great East Corridor",
    routeCode: "RT-01",
    zone: "East Lusaka",
    driverName: "Mr. Peter Chitembo",
    driverPhone: "+260 977 881122",
    driverNrc: "201948/11/1",
    driverLicenseNo: "PSV-99214-ZM",
    busNumber: "ALB 4022 ZM",
    busRegNo: "ALB 4022 ZM",
    capacity: 30,
    monthlyFeeZMW: 850,
    termFareZMW: 2400,
    morningDepartureTime: "06:30 AM",
    afternoonDepartureTime: "15:45 PM",
    status: "Active",
    studentCount: 0,
    stops: [
      { name: "Chelstone Market Main Gate", time: "06:40 AM", morningPickupTime: "06:40 AM", afternoonDropoffTime: "16:20 PM", landmark: "Opposite Police Post" },
      { name: "Avondale Roundabout Shelter", time: "06:55 AM", morningPickupTime: "06:55 AM", afternoonDropoffTime: "16:05 PM", landmark: "Near Total Energies" },
      { name: "Munali Flyover Bus Bay", time: "07:10 AM", morningPickupTime: "07:10 AM", afternoonDropoffTime: "15:50 PM", landmark: "Great East Road Turnoff" },
      { name: "Bread of Life Main Campus", time: "07:25 AM", morningPickupTime: "07:25 AM", afternoonDropoffTime: "15:30 PM", landmark: "School Dropoff Bay" }
    ]
  },
  {
    id: 2,
    name: "Route 2: Woodlands – Kabulonga – Ibex Hill Express",
    routeName: "Route 2: Woodlands – Kabulonga – Ibex Hill Express",
    routeCode: "RT-02",
    zone: "South-East Lusaka",
    driverName: "Mr. Francis Maboshe",
    driverPhone: "+260 966 332211",
    driverNrc: "189402/67/1",
    driverLicenseNo: "PSV-84102-ZM",
    busNumber: "BAC 1109 ZM",
    busRegNo: "BAC 1109 ZM",
    capacity: 26,
    monthlyFeeZMW: 900,
    termFareZMW: 2550,
    morningDepartureTime: "06:30 AM",
    afternoonDepartureTime: "15:45 PM",
    status: "Active",
    studentCount: 0,
    stops: [
      { name: "Woodlands Shopping Mall", time: "06:40 AM", morningPickupTime: "06:40 AM", afternoonDropoffTime: "16:25 PM", landmark: "Pick n Pay Entrance" },
      { name: "Kabulonga Boys Secondary Gate", time: "06:55 AM", morningPickupTime: "06:55 AM", afternoonDropoffTime: "16:10 PM", landmark: "Kabulonga Road" },
      { name: "Ibex Hill Twin Palm Mall", time: "07:10 AM", morningPickupTime: "07:10 AM", afternoonDropoffTime: "15:55 PM", landmark: "Main Gate Bus Stop" },
      { name: "Bread of Life Main Campus", time: "07:30 AM", morningPickupTime: "07:30 AM", afternoonDropoffTime: "15:30 PM", landmark: "School Dropoff Bay" }
    ]
  }
];

export const ACADEMIC_TERMS_2026: AcademicTerm[] = [
  {
    id: "Term 1",
    name: "Term 1 (First Term)",
    year: 2026,
    startDate: "2026-01-12",
    endDate: "2026-04-17",
    weeks: 14,
    totalInstructionDays: 68,
    midTermBreak: {
      startDate: "2026-02-20",
      endDate: "2026-02-23",
      description: "Term 1 Mid-Term Long Weekend Break"
    },
    holidayBreak: {
      startDate: "2026-04-18",
      endDate: "2026-05-10",
      description: "First Term School Holiday & Teacher Planning Break (3 Weeks)"
    },
    keyFocus: "Foundational syllabus coverage, baseline diagnostic tests, secondary pathway orientation, and inter-house athletic trials.",
    theme: "Laying Firm Academic & Moral Foundations",
    status: "Completed"
  },
  {
    id: "Term 2",
    name: "Term 2 (Second Term)",
    year: 2026,
    startDate: "2026-05-11",
    endDate: "2026-08-07",
    weeks: 13,
    totalInstructionDays: 64,
    midTermBreak: {
      startDate: "2026-06-19",
      endDate: "2026-06-26",
      description: "Term 2 Mid-Term Holiday Break (1 Week)"
    },
    holidayBreak: {
      startDate: "2026-08-08",
      endDate: "2026-08-30",
      description: "Second Term School Holiday & National Exam Revision Clinics (3 Weeks)"
    },
    keyFocus: "Grade 7, Grade 9 & Grade 12 National Mock Exams, STEM Fair, Career Pathway Guidance, and Inter-House Sports Day.",
    theme: "Excellence Through Dedicated Discipline",
    status: "Active"
  },
  {
    id: "Term 3",
    name: "Term 3 (Third Term)",
    year: 2026,
    startDate: "2026-08-31",
    endDate: "2026-12-04",
    weeks: 14,
    totalInstructionDays: 67,
    midTermBreak: {
      startDate: "2026-10-09",
      endDate: "2026-10-12",
      description: "Term 3 Mid-Term Break & Independence Preparations"
    },
    holidayBreak: {
      startDate: "2026-12-05",
      endDate: "2027-01-10",
      description: "Long End-of-Year Holiday & Festive Recess (5 Weeks)"
    },
    keyFocus: "Examinations Council of Zambia (ECZ) National Final Examinations (Grades 7, 9 & 12), Graduation & Valedictory Ceremony, Annual Prize Giving Day.",
    theme: "Victory, Harvest & Transition to Greater Heights",
    status: "Upcoming"
  }
];

export const ZAMBIAN_HOLIDAYS_2026: ZambianHoliday[] = [
  {
    id: 1,
    name: "New Year's Day",
    date: "2026-01-01",
    dayOfWeek: "Thursday",
    type: "National Public Holiday",
    description: "First day of the new Gregorian calendar year, celebrated nationwide."
  },
  {
    id: 2,
    name: "International Women's Day",
    date: "2026-03-08",
    dayOfWeek: "Sunday",
    type: "Commemoration",
    description: "Celebration of women's social, economic, cultural, and political achievements."
  },
  {
    id: 3,
    name: "Youth Day",
    date: "2026-03-12",
    dayOfWeek: "Thursday",
    type: "National Public Holiday",
    description: "Commemoration of the youth contribution to Zambia's liberation struggle and national development."
  },
  {
    id: 4,
    name: "Good Friday",
    date: "2026-04-03",
    dayOfWeek: "Friday",
    type: "Christian Holiday",
    description: "Solemn Christian commemoration of the crucifixion of Jesus Christ."
  },
  {
    id: 5,
    name: "Holy Saturday",
    date: "2026-04-04",
    dayOfWeek: "Saturday",
    type: "Christian Holiday",
    description: "Easter Eve in the Christian calendar."
  },
  {
    id: 6,
    name: "Easter Monday",
    date: "2026-04-06",
    dayOfWeek: "Monday",
    type: "Christian Holiday",
    description: "Public holiday following Easter Sunday celebrating the resurrection of Christ."
  },
  {
    id: 7,
    name: "Labour Day",
    date: "2026-05-01",
    dayOfWeek: "Friday",
    type: "National Public Holiday",
    description: "Honouring workers' and teachers' contributions across Zambia with marches and awards."
  },
  {
    id: 8,
    name: "Africa Freedom Day",
    date: "2026-05-25",
    dayOfWeek: "Monday",
    type: "National Public Holiday",
    description: "Commemorating the founding of the Organization of African Unity (now African Union) and liberation."
  },
  {
    id: 9,
    name: "Heroes' Day",
    date: "2026-07-06",
    dayOfWeek: "Monday",
    type: "National Public Holiday",
    description: "Honouring the gallant sons and daughters who died fighting for Zambia's freedom."
  },
  {
    id: 10,
    name: "Unity Day",
    date: "2026-07-07",
    dayOfWeek: "Tuesday",
    type: "National Public Holiday",
    description: "Promoting national unity and solidarity under the motto 'One Zambia, One Nation'."
  },
  {
    id: 11,
    name: "Farmers' Day",
    date: "2026-08-03",
    dayOfWeek: "Monday",
    type: "National Public Holiday",
    description: "Recognizing agricultural producers and food security champions across the nation."
  },
  {
    id: 12,
    name: "National Day of Prayer, Fasting, Repentance & Reconciliation",
    date: "2026-10-18",
    dayOfWeek: "Sunday",
    type: "National Public Holiday",
    description: "National day of solemn prayer, thanksgiving, and reconciliation in Christian fellowship."
  },
  {
    id: 13,
    name: "Independence Day",
    date: "2026-10-24",
    dayOfWeek: "Saturday",
    type: "National Public Holiday",
    description: "Zambia's 62nd Independence Anniversary commemorating sovereignty from colonial rule."
  },
  {
    id: 14,
    name: "Christmas Day",
    date: "2026-12-25",
    dayOfWeek: "Friday",
    type: "Christian Holiday",
    description: "Celebrating the birth of Jesus Christ, Saviour and Lord."
  }
];

export const initialEvents: SchoolEvent[] = [
  // Term 1 Events (Jan - Apr 2026)
  {
    id: 101,
    title: "Term 1 School Opening & Dedication Chapel",
    date: "2026-01-12",
    time: "07:30 AM - 10:00 AM",
    category: "Term Dates",
    term: "Term 1",
    targetAudience: "All School",
    location: "Main Assembly Pavilion",
    description: "Official re-opening for Term 1, welcoming new Grade 1 pupils and Grade 8 secondary entrants with a dedicatory chapel service.",
    isImportant: true
  },
  {
    id: 102,
    title: "Secondary Pathway Orientation & Subject Briefing",
    date: "2026-01-23",
    time: "09:00 AM - 13:00 PM",
    category: "Academic",
    term: "Term 1",
    targetAudience: "Secondary Section",
    location: "Secondary Science Complex",
    description: "Guidance on Senior Secondary career pathways (Natural Sciences, Business, Social Sciences, TEVET) for Grade 10 and Grade 8 pupils."
  },
  {
    id: 103,
    title: "Term 1 Mid-Term Long Weekend Break",
    date: "2026-02-20",
    endDate: "2026-02-23",
    category: "Holiday",
    term: "Term 1",
    targetAudience: "All School",
    description: "School closes on Friday afternoon and resumes on Tuesday morning for mid-term rest."
  },
  {
    id: 104,
    title: "Youth Day Parade & National Celebrations",
    date: "2026-03-12",
    time: "08:00 AM - 14:00 PM",
    category: "National Holiday",
    term: "Term 1",
    targetAudience: "All School",
    location: "Freedom Statue & School Campus",
    description: "Bread of Life Scouts and Girl Guides lead the Youth Day contingent parade.",
    isImportant: true
  },
  {
    id: 105,
    title: "PTA Annual General Meeting (AGM)",
    date: "2026-03-27",
    time: "14:00 PM - 17:00 PM",
    category: "PTA Meeting",
    term: "Term 1",
    targetAudience: "Parents & PTA",
    location: "Bread of Life Main Hall",
    description: "Annual meeting of parents, guardians, and teaching management to review school developments and approve the budget.",
    isImportant: true
  },
  {
    id: 106,
    title: "Term 1 End-of-Term Assessment Week",
    date: "2026-04-06",
    endDate: "2026-04-10",
    time: "08:00 AM - 15:30 PM",
    category: "Examinations",
    term: "Term 1",
    targetAudience: "All School",
    location: "Examination Halls",
    description: "Term 1 formal assessments across all primary and secondary subject divisions."
  },
  {
    id: 107,
    title: "Term 1 Closing & Report Card Issuance",
    date: "2026-04-17",
    time: "08:00 AM - 12:00 PM",
    category: "Term Dates",
    term: "Term 1",
    targetAudience: "All School",
    location: "Respective Classrooms",
    description: "Official conclusion of Term 1. Termly report cards distributed to parents and guardians."
  },

  // Term 2 Events (May - Aug 2026)
  {
    id: 201,
    title: "Term 2 School Re-Opening & Assembly",
    date: "2026-05-11",
    time: "07:30 AM - 09:30 AM",
    category: "Term Dates",
    term: "Term 2",
    targetAudience: "All School",
    location: "School Grounds",
    description: "Term 2 begins with full academic schedule and continuous assessment rollout.",
    isImportant: true
  },
  {
    id: 202,
    title: "Africa Freedom Day Commemoration",
    date: "2026-05-25",
    category: "National Holiday",
    term: "Term 2",
    targetAudience: "All School",
    description: "National public holiday. School closed in honour of African unity and liberation."
  },
  {
    id: 203,
    title: "National Mock Examinations (Grades 7, 9 & 12)",
    date: "2026-06-08",
    endDate: "2026-06-16",
    time: "08:00 AM - 16:00 PM",
    category: "Examinations",
    term: "Term 2",
    targetAudience: "Exam Candidates (Grades 7, 9, 12)",
    location: "Secondary Hall B & Exam Suites",
    description: "Full simulation of ECZ examination conditions for primary and secondary candidate classes.",
    isImportant: true
  },
  {
    id: 204,
    title: "Term 2 Mid-Term Holiday Break",
    date: "2026-06-19",
    endDate: "2026-06-26",
    category: "Holiday",
    term: "Term 2",
    targetAudience: "All School",
    description: "Mid-term recess for pupils. School offices remain open for administrative consultations."
  },
  {
    id: 205,
    title: "Inter-House Sports Day & Cultural Gala",
    date: "2026-07-03",
    time: "08:00 AM - 16:30 PM",
    category: "Sports & Culture",
    term: "Term 2",
    targetAudience: "All School",
    location: "Heroes National Stadium Grounds",
    description: "Track and field events, relay races, traditional Zambian dance showcases, and house trophy awarding.",
    isImportant: true
  },
  {
    id: 206,
    title: "Heroes & Unity Days Long Weekend",
    date: "2026-07-06",
    endDate: "2026-07-07",
    category: "National Holiday",
    term: "Term 2",
    targetAudience: "All School",
    description: "Consecutive national public holidays honouring Zambian national heroes and national solidarity."
  },
  {
    id: 207,
    title: "Parent-Teacher Consultation & Academic Review Day",
    date: "2026-07-17",
    time: "13:30 PM - 17:30 PM",
    category: "PTA Meeting",
    term: "Term 2",
    targetAudience: "Parents & PTA",
    location: "School Main Hall & Classrooms",
    description: "One-on-one academic consultations between guardians and subject teachers ahead of Term 3 exams."
  },
  {
    id: 208,
    title: "Science Fair, Robotics & STEM Innovation Expo",
    date: "2026-07-24",
    time: "09:00 AM - 15:00 PM",
    category: "Academic",
    term: "Term 2",
    targetAudience: "All School",
    location: "Secondary Science Complex",
    description: "Pupil-led science experiments, solar energy models, mobile app prototypes, and agricultural demonstrations."
  },
  {
    id: 209,
    title: "Term 2 Official Closing & Report Card Collection",
    date: "2026-08-07",
    time: "08:00 AM - 12:00 PM",
    category: "Term Dates",
    term: "Term 2",
    targetAudience: "All School",
    location: "Respective Classrooms",
    description: "End of Term 2. Distribution of continuous assessment score summaries and report cards."
  },

  // Term 3 Events (Aug - Dec 2026)
  {
    id: 301,
    title: "Term 3 School Re-Opening & Final Term Dedication",
    date: "2026-08-31",
    time: "07:30 AM - 09:30 AM",
    category: "Term Dates",
    term: "Term 3",
    targetAudience: "All School",
    location: "Main Assembly Pavilion",
    description: "Term 3 commences with intense focus on final ECZ national examinations and end-of-year assessments.",
    isImportant: true
  },
  {
    id: 302,
    title: "Grade 7 Composite Examination (ECZ Final)",
    date: "2026-09-21",
    endDate: "2026-09-25",
    time: "08:30 AM - 13:00 PM",
    category: "Examinations",
    term: "Term 3",
    targetAudience: "Exam Candidates (Grades 7, 9, 12)",
    location: "National Examination Centre A",
    description: "Official Examinations Council of Zambia primary school leaving certificate examinations.",
    isImportant: true
  },
  {
    id: 303,
    title: "Term 3 Mid-Term Break",
    date: "2026-10-09",
    endDate: "2026-10-12",
    category: "Holiday",
    term: "Term 3",
    targetAudience: "All School",
    description: "Mid-term long weekend break."
  },
  {
    id: 304,
    title: "National Day of Prayer & Repentance",
    date: "2026-10-18",
    category: "National Holiday",
    term: "Term 3",
    targetAudience: "All School",
    location: "Bread of Life Worship Sanctuary",
    description: "Special inter-denominational school prayer service for examination candidates and peace in Zambia."
  },
  {
    id: 305,
    title: "Zambia Independence Day Jubilee Celebrations",
    date: "2026-10-24",
    time: "08:30 AM - 14:00 PM",
    category: "National Holiday",
    term: "Term 3",
    targetAudience: "All School",
    location: "Main Campus Grounds",
    description: "Parades, poetry, traditional food exhibitions, and historical plays honoring Zambia's independence.",
    isImportant: true
  },
  {
    id: 306,
    title: "Grade 9 (JSSLE) & Grade 12 (ECZ) National Final Examinations",
    date: "2026-10-26",
    endDate: "2026-11-20",
    time: "08:00 AM - 16:30 PM",
    category: "Examinations",
    term: "Term 3",
    targetAudience: "Exam Candidates (Grades 7, 9, 12)",
    location: "Secondary Examination Halls",
    description: "National secondary school leaving certification examinations written under invigilation.",
    isImportant: true
  },
  {
    id: 307,
    title: "Annual Speech, Prize Giving Day & Cultural Festival",
    date: "2026-11-27",
    time: "09:00 AM - 15:30 PM",
    category: "Religious & School Ceremony",
    term: "Term 3",
    targetAudience: "All School",
    location: "Bread of Life Cathedral Hall",
    description: "Rewarding academic distinction, leadership excellence, best sporting achievements, and pathway medals.",
    isImportant: true
  },
  {
    id: 308,
    title: "Graduation & Valedictory Ceremony (Grades 7 & 12)",
    date: "2026-12-03",
    time: "09:30 AM - 14:00 PM",
    category: "Religious & School Ceremony",
    term: "Term 3",
    targetAudience: "All School",
    location: "Main Auditorium",
    description: "Graduation service and valedictory speeches for graduating primary pupils and secondary school leavers.",
    isImportant: true
  },
  {
    id: 309,
    title: "Term 3 School Closing & Long Holiday Recess",
    date: "2026-12-04",
    time: "08:00 AM - 12:00 PM",
    category: "Term Dates",
    term: "Term 3",
    targetAudience: "All School",
    location: "Respective Classrooms",
    description: "Official end of 2026 academic year. Collection of annual report cards and promotion certificates.",
    isImportant: true
  }
];

export const initialMessages: UserMessage[] = [
  { id: 1, fromName: "Mr. Davison Banda (Head Teacher)", fromRole: "Head Teacher", toName: "Bwalya Joseph", toRole: "Parent", subject: "Grade 7 Mock Exam Preparation", body: "Dear Parent, please ensure Chanda spends time revising his Mathematics & Science past papers daily in preparation for the upcoming mock exams.", date: "2026-05-20", read: true, channel: "Internal Message" },
  { id: 2, fromName: "Mrs. Beauty Tembo", fromRole: "Teacher", toName: "Zimba George", toRole: "Parent", subject: "Welcome to Grade 1 Blue", body: "Tiseke is settling in well with his literacy lessons. Please check his homework book daily.", date: "2026-05-22", read: false, channel: "SMS Alert" },
  { id: 3, fromName: "Mr. Chileshe Mumba (Bursar)", fromRole: "Accountant", toName: "All Parents", toRole: "Parent", subject: "Term 2 Fee Clearance Notice", body: "Gentle reminder: All term 2 tuition and examination fees must be settled prior to the commencement of mid-term examinations.", date: "2026-05-25", read: false, channel: "WhatsApp Notice" }
];

export const initialStaffData: StaffMember[] = [
  {
    id: 1,
    name: "Eng. Kelvin Chileshe",
    nrc: "294812/11/1",
    phone: "+260 977 100200",
    email: "superadmin@ryntech.edu.zm",
    role: "super_admin",
    roleTitle: "Super Administrator / IT Director",
    department: "Executive Management & ICT",
    employmentDate: "2020-01-15",
    status: "Active",
    qualifications: "M.Sc. Information Systems, B.Eng. Computer Engineering (UNZA)",
    leaveDaysRemaining: 24,
    salaryZMW: 32000,
    username: "superadmin"
  },
  {
    id: 2,
    name: "Mrs. Grace Mwape",
    nrc: "184920/67/1",
    phone: "+260 978 223344",
    email: "admin@ryntech.edu.zm",
    role: "school_admin",
    roleTitle: "School Administrator & Registrar",
    department: "School Administration",
    employmentDate: "2021-03-01",
    status: "Active",
    qualifications: "B.A. Educational Administration & Management (CBU)",
    leaveDaysRemaining: 18,
    salaryZMW: 24000,
    username: "admin"
  }
];

export const initialDisciplineData: DisciplineRecord[] = [];

export const initialInventoryData: InventoryItem[] = [
  {
    id: 1,
    code: "ICT-PC-001",
    name: "HP ProDesk Desktop Computers (Core i5, 16GB)",
    category: "Computers & ICT",
    quantity: 35,
    condition: "Excellent",
    location: "Main Computer Laboratory (Room 12)",
    purchaseDate: "2024-02-15",
    purchasePriceZMW: 285000,
    supplier: "Bytes & Chips Technologies Zambia Ltd",
    assignedDepartment: "Mathematics & Computing",
    serialNumber: "HP-LAB-01 TO HP-LAB-35",
    maintenanceNotes: "Quarterly antivirus updates and OS maintenance scheduled for July 2026."
  },
  {
    id: 2,
    code: "FUR-DSK-001",
    name: "Standard Dual Pupil Hardwood Desks & Metal Frames",
    category: "Desks & Tables",
    quantity: 180,
    condition: "Good",
    location: "Primary & Secondary Classrooms",
    purchaseDate: "2023-08-20",
    purchasePriceZMW: 162000,
    supplier: "Lusaka Timber & Furniture Craftsmen",
    assignedDepartment: "General School Property",
    maintenanceNotes: "Inspected annually before commencement of Term 1."
  },
  {
    id: 3,
    code: "SCI-MIC-001",
    name: "Olympus Binocular Compound Microscopes (1000x)",
    category: "Laboratory Equipment",
    quantity: 16,
    condition: "Excellent",
    location: "Senior Biology Laboratory",
    purchaseDate: "2025-01-10",
    purchasePriceZMW: 84000,
    supplier: "Scientific & Educational Supplies Zambia",
    assignedDepartment: "Natural Sciences",
    serialNumber: "OLY-MIC-101 TO OLY-MIC-116",
    maintenanceNotes: "Lenses cleaned and optical alignment calibrated."
  },
  {
    id: 4,
    code: "VEH-BUS-001",
    name: "Toyota Coaster 30-Seater School Bus (Reg: BAF 4219 ZM)",
    category: "Vehicles",
    quantity: 1,
    condition: "Good",
    location: "Campus Transport Depot",
    purchaseDate: "2022-05-18",
    purchasePriceZMW: 650000,
    supplier: "Toyota Zambia Ltd",
    assignedDepartment: "School Transport Operations",
    serialNumber: "JT751928401",
    maintenanceNotes: "RTSA Road Fitness renewed May 2026. Servicing done every 5,000 km."
  },
  {
    id: 5,
    code: "SPT-KIT-001",
    name: "Football & Netball Tournament Match Kits & Goal Posts",
    category: "Sports & Physical Ed",
    quantity: 24,
    condition: "Good",
    location: "Sports Pavilion Equipment Store",
    purchaseDate: "2025-03-01",
    purchasePriceZMW: 26000,
    supplier: "Decathlon Sports Africa",
    assignedDepartment: "Expressive & Performing Arts"
  }
];

export const initialHostelData: HostelDormitory[] = [
  {
    id: 1,
    name: "Dag Hammarskjöld Hall (Senior Boys)",
    gender: "Boys",
    houseName: "Eagle House",
    houseMasterName: "Mr. Kelvin Phiri",
    houseMasterPhone: "+260 977 889900",
    capacity: 48,
    occupiedBeds: 36,
    roomCount: 12,
    termFeeZMW: 4500,
    status: "Available"
  },
  {
    id: 2,
    name: "Mama Julia Chikamoneka Hall (Senior Girls)",
    gender: "Girls",
    houseName: "Victoria House",
    houseMasterName: "Mrs. Gertrude Tembo",
    houseMasterPhone: "+260 977 451325",
    capacity: 48,
    occupiedBeds: 42,
    roomCount: 12,
    termFeeZMW: 4500,
    status: "Available"
  }
];

export const initialHostelAllocations: HostelAllocation[] = [];

export const initialLibraryCheckouts: BookCheckout[] = [];

export const initialReceiptsData: PaymentReceipt[] = [];

export const initialAuditLogs: AuditLogEntry[] = [
  {
    id: "LOG-1001",
    timestamp: "2026-05-24 09:14:22",
    userName: "Eng. Kelvin Chileshe",
    userRole: "Super Administrator",
    action: "System Initialization & Role Audit",
    module: "Security & Access Control",
    details: "Verified system permissions and active user sessions across 10 institutional roles.",
    ipAddress: "196.14.88.102 (Lusaka, ZM)"
  },
  {
    id: "LOG-1002",
    timestamp: "2026-05-24 10:30:15",
    userName: "Mr. Chileshe Mumba",
    userRole: "Accountant / Bursar",
    action: "Fee Payment Recorded",
    module: "Fees & Kwacha Accounts",
    recordId: "RCT-2026-00891",
    details: "Recorded K3,200 payment for pupil Chanda Bwalya (Grade 7 Eagle) via Airtel Money.",
    previousValue: "Balance: K3,200",
    newValue: "Balance: K0.00 (Fully Cleared)",
    ipAddress: "196.14.88.105 (Lusaka, ZM)"
  },
  {
    id: "LOG-1003",
    timestamp: "2026-05-24 11:45:00",
    userName: "Mr. Davison Banda",
    userRole: "Head Teacher",
    action: "Term 2 Results Batch Approval",
    module: "Examinations & Grading",
    recordId: "CLASS-G7-EAGLE",
    details: "Approved Continuous Assessment (CA) and Mid-Term examination results for publishing.",
    previousValue: "Status: Pending_Approval",
    newValue: "Status: Approved_Published",
    ipAddress: "196.14.88.103 (Lusaka, ZM)"
  }
];

export const initialTransportData: TransportVehicle[] = [
  {
    id: 1,
    registrationNumber: "BAF 4219 ZM",
    model: "Toyota Coaster (30-Seater)",
    capacity: 30,
    driverName: "Mr. Patrick Mwale",
    driverPhone: "+260 977 341829",
    routeZone: "Woodlands - Kabulonga - Ibex Hill",
    status: "Active",
    insuranceExpiry: "2026-11-30",
    fitnessExpiry: "2026-12-15",
    termFeeZMW: 1200
  },
  {
    id: 2,
    registrationNumber: "BCA 8812 ZM",
    model: "Mitsubishi Rosa (26-Seater)",
    capacity: 26,
    driverName: "Mr. Christopher Zulu",
    driverPhone: "+260 976 554433",
    routeZone: "Chelstone - Avondale - Salama Park",
    status: "Active",
    insuranceExpiry: "2026-10-15",
    fitnessExpiry: "2026-10-30",
    termFeeZMW: 1350
  },
  {
    id: 3,
    registrationNumber: "BAG 1104 ZM",
    model: "Toyota HiAce (16-Seater)",
    capacity: 16,
    driverName: "Mr. John Tembo",
    driverPhone: "+260 978 998877",
    routeZone: "Chilenje - Libala - Kamwala South",
    status: "Maintenance",
    insuranceExpiry: "2026-09-20",
    fitnessExpiry: "2026-09-30",
    termFeeZMW: 1100
  }
];

export const initialTransportPupils: TransportPupilAssignment[] = [];

export const initialPupilApplications: PupilApplication[] = [
  {
    id: "APP-2026-1048",
    submissionDate: "2026-08-25",
    section: "Secondary",
    desiredGrade: "Grade 10",
    desiredStream: "Science Stream",
    pathway: "Natural Sciences & STEM",
    boardingStatus: "Day Scholar",
    transportNeeded: true,
    transportRouteId: 1,
    transportPickupPoint: "Woodlands Shopping Complex",
    pupilFullName: "Natasha Naomi Lungu",
    gender: "Female",
    dob: "2010-04-14",
    age: 16,
    nrcOrBirthCertNo: "BC-2010/LSK/49102",
    previousSchool: "Kabulonga Girls Secondary School",
    previousGrade: "Grade 9",
    lastExamScore: "ECZ Grade 9 Certificate: 6 Distinctions, 2 Merits",
    residentialAddress: "Plot 14, Cedar Road, Woodlands, Lusaka",
    district: "Lusaka",
    province: "Lusaka Province",
    specialNeedsOrMedical: "Mild Asthma (inhaler kept with student)",
    allergies: "Penicillin",
    bloodGroup: "O+",
    guardianFullName: "Dr. Emmanuel Lungu",
    guardianRelationship: "Father",
    guardianNrc: "349102/11/1",
    guardianPhone: "+260 977 448811",
    guardianAltPhone: "+260 966 223344",
    guardianEmail: "e.lungu@hospital.gov.zm",
    guardianOccupation: "Medical Officer / Surgeon",
    guardianEmployerOrBusiness: "University Teaching Hospital (UTH)",
    emergencyContactName: "Mrs. Grace Lungu (Mother)",
    emergencyContactPhone: "+260 977 990011",
    status: "Pending"
  },
  {
    id: "APP-2026-1049",
    submissionDate: "2026-08-26",
    section: "Primary",
    desiredGrade: "Grade 1",
    desiredStream: "Eagle",
    boardingStatus: "Day Scholar",
    transportNeeded: true,
    transportRouteId: 2,
    transportPickupPoint: "Avondale Roundabout",
    pupilFullName: "Kabwe Kelvin Mwansa",
    gender: "Male",
    dob: "2019-11-03",
    age: 6,
    nrcOrBirthCertNo: "BC-2019/LSK/08412",
    previousSchool: "Sunflowers Nursery & Early Learning",
    previousGrade: "Reception",
    lastExamScore: "Early Childhood Readiness: Excellent",
    residentialAddress: "House 28, Twin Palm Road, Avondale, Lusaka",
    district: "Lusaka",
    province: "Lusaka Province",
    specialNeedsOrMedical: "None",
    allergies: "Peanuts",
    bloodGroup: "A+",
    guardianFullName: "Mrs. Brenda Mwansa",
    guardianRelationship: "Mother",
    guardianNrc: "482019/67/1",
    guardianPhone: "+260 978 123987",
    guardianEmail: "brenda.mwansa@zamtel.co.zm",
    guardianOccupation: "Telecommunications Specialist",
    guardianEmployerOrBusiness: "Zamtel Head Office",
    emergencyContactName: "Mr. Kelvin Mwansa Sr. (Father)",
    emergencyContactPhone: "+260 971 445566",
    status: "Pending"
  },
  {
    id: "APP-2026-1050",
    submissionDate: "2026-08-27",
    section: "Secondary",
    desiredGrade: "Grade 8",
    desiredStream: "Junior Secondary A",
    boardingStatus: "Boarding",
    transportNeeded: false,
    pupilFullName: "Kondwani Joseph Zulu",
    gender: "Male",
    dob: "2012-07-22",
    age: 14,
    nrcOrBirthCertNo: "BC-2012/NDL/12933",
    previousSchool: "Ndola Primary School",
    previousGrade: "Grade 7",
    lastExamScore: "Grade 7 ECZ National Exam: 785/800 Composite",
    residentialAddress: "Plot 805, Kansenshi, Ndola, Copperbelt",
    district: "Ndola",
    province: "Copperbelt Province",
    specialNeedsOrMedical: "None",
    bloodGroup: "B+",
    guardianFullName: "Mr. Joseph Zulu",
    guardianRelationship: "Father",
    guardianNrc: "192837/10/1",
    guardianPhone: "+260 966 887711",
    guardianEmail: "joseph.zulu@copperbeltmines.zm",
    guardianOccupation: "Mining Electrical Engineer",
    guardianEmployerOrBusiness: "Mopani Copper Mines",
    emergencyContactName: "Mrs. Mary Zulu (Mother)",
    emergencyContactPhone: "+260 966 887722",
    status: "Pending"
  }
];



