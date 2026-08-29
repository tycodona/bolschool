export type EczGradePoint = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type SchoolSection = "Early Childhood" | "Primary" | "Secondary";

export type ReportPublishStatus = "Draft" | "Pending_Approval" | "Approved_Published" | "Rejected";

export type UserRole =
  | "super_admin"
  | "school_admin"
  | "head_teacher"
  | "deputy_head"
  | "teacher"
  | "accountant"
  | "secretary"
  | "librarian"
  | "parent"
  | "student"
  | "admin";

export type RoleType = UserRole | "admin"; // Backward-compatibility alias

export interface TermResultsApproval {
  studentId: number;
  term: "Term 1" | "Term 2" | "Term 3";
  year: number;
  status: ReportPublishStatus;
  submittedByTeacherName?: string;
  submittedDate?: string;
  approvedByAdminName?: string;
  approvedDate?: string;
  adminNotes?: string;
}

export type SecondaryPathway = string;

export interface SecondaryPathwayInfo {
  id: string;
  name: string;
  code: string;
  description: string;
  badgeColor?: string;
  accentColor?: string;
  iconName?: string;
  level: "Junior Secondary (Grades 8-9)" | "Senior Secondary (Grades 10-12)" | "All Secondary (Grades 8-12)" | string;
  coreSubjects: string[];
  specializationSubjects: string[];
  careerPaths: string[];
  entryRequirements: string;
  isCustom?: boolean;
}

export interface EczGradeInfo {
  point: EczGradePoint;
  label: "Distinction" | "Merit" | "Credit" | "Satisfactory" | "Unsatisfactory";
  description: string;
  badgeColor: string;
}

export type Grade7EczGradePoint = 1 | 2 | 3 | 4 | 5;
export type Grade7Division = "Division 1" | "Division 2" | "Division 3" | "Division 4" | "Ungraded";

export interface Grade7GradeInfo {
  point: Grade7EczGradePoint;
  label: "Distinction" | "Merit" | "Credit" | "Satisfactory" | "Unsatisfactory";
  division: Grade7Division;
  description: string;
  badgeColor: string;
  selectionPlacement: string;
}

export interface TransferRecord {
  id: number;
  date: string;
  fromClass: string;
  toClass: string;
  reason: string;
  approvedBy: string;
}

export interface StudentAcademicHistory {
  year: number;
  term: "Term 1" | "Term 2" | "Term 3";
  grade: string;
  averageScore: number;
  rank?: number;
  overallRemark: string;
}

export interface Student {
  id: number;
  eczNo: string; // Pupil Reference Number / Student ID
  name: string;
  gender: "Male" | "Female";
  grade: string; // e.g. "Grade 7", "Grade 10"
  stream: string; // e.g. "Eagle", "Science", "Commerce"
  classId: number; // reference to ClassStream
  batchId?: string; // reference to AcademicBatch
  age: number;
  dob?: string; // Date of Birth YYYY-MM-DD
  section?: SchoolSection; // "Primary" or "Secondary"
  pathway?: SecondaryPathway; // Pathway for secondary students
  house?: string; // e.g. "Eagle House", "Kafue House", "Victoria House", "Zambezi House"
  province?: string; // e.g. "Lusaka Province", "Copperbelt Province"
  district?: string; // e.g. "Lusaka District", "Ndola District"
  admissionDate?: string;
  previousSchool?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  allergies?: string;
  bloodGroup?: string;
  address?: string;
  isBoarding?: boolean;
  boardingStatus?: "Boarding" | "Day Scholar";
  status: "Active" | "Transferred" | "Graduated" | "Withdrawn" | "Archived" | "Inactive";
  username: string;
  password?: string;
  routeId?: number;
  enrollmentDate?: string;
  transferRecords?: TransferRecord[];
  academicHistory?: StudentAcademicHistory[];
}

export interface Teacher {
  id: number;
  name: string;
  tscNumber: string; // Teaching Council of Zambia registration number
  nrcNumber?: string; // Zambian NRC
  primarySubject: string;
  classesAssigned: number[]; // array of classIds
  experienceYrs: number;
  qualifications?: string; // e.g. "B.Ed. Secondary Mathematics, UNZA"
  department?: string; // "Mathematics & Computing", "Natural Sciences", etc.
  employmentDate?: string;
  employmentStatus?: "Full-Time" | "Part-Time" | "Contract" | "On Leave";
  section?: SchoolSection | "Both";
  pathways?: SecondaryPathway[];
  status: "Active" | "On Leave" | "Inactive";
  username: string;
  password?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
}

export interface StaffMember {
  id: number;
  name: string;
  nrc: string;
  phone: string;
  email: string;
  role: UserRole;
  roleTitle: string; // e.g. "Head Teacher", "Deputy Head Teacher", "Bursar / Accountant", "Chief Librarian", "School Secretary", "Science Lab Technician"
  department: string;
  employmentDate: string;
  status: "Active" | "On Leave" | "Suspended" | "Resigned";
  qualifications: string;
  leaveDaysRemaining: number;
  salaryZMW?: number;
  username: string;
  password?: string;
}

export interface AcademicBatch {
  id: string; // e.g. "batch-2026-general", "batch-g7-2026"
  name: string; // e.g. "2026 Academic Cohort (All Streams)", "2026 Grade 7 Candidate Batch"
  code: string; // e.g. "BAT-2026-MAIN"
  academicYear: number; // 2026
  intakeTerm: "Term 1" | "Term 2" | "Term 3";
  targetGrades: string[]; // ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"] or ["All Grades"]
  startDate: string;
  endDate: string;
  description: string;
  status: "Active" | "Graduated" | "Upcoming" | "Archived";
  maxPupils?: number;
  leadTeacherName?: string;
  leadTeacherId?: number;
}

export interface SubjectDefinition {
  id: string; // e.g. "SUB-MATH", "SUB-ENG"
  code: string; // ECZ Subject Code e.g. "4024", "1121", "5070"
  name: string; // "Mathematics", "English Language", "Physics"
  category: "Core" | "Elective" | "Vocational / Practical" | "Religious & Moral";
  section: SchoolSection | "Both";
  gradesApplicable: number[]; // e.g. [1, 2, 3, 4, 5, 6, 7] or [8, 9] or [10, 11, 12]
  pathway?: SecondaryPathway;
  passMark: number; // e.g. 50%
  weeklyPeriods: number; // e.g. 6 periods/week
  department: string; // "Mathematics & Computing", "Natural Sciences", "Languages", "Social Sciences", "Business Studies", "Practical Skills"
  assignedTeacherName?: string;
  assignedTeacherId?: number;
  description?: string;
}

export interface ClassStream {
  id: number;
  name: string; // e.g. "Grade 7 Eagle", "Grade 10 Science"
  gradeNum: number; // 1 to 12
  streamName: string; // "Eagle", "Rhino", "Science", "Commerce", "Alpha"
  section?: SchoolSection; // "Primary" (1-7) or "Secondary" (8-12)
  pathway?: SecondaryPathway;
  batchId?: string; // Associated Academic Batch
  teacherName: string;
  teacherId: number;
  room: string;
  capacity: number;
  subjects?: string[]; // Specific subject allocations for this class
  description?: string;
}

export interface CustomAssessmentColumn {
  id: string; // e.g. "test_3", "project_1", "assignment_1", "mock_exam"
  name: string; // e.g. "Test 3", "Practical Exam", "Monthly Test", "Mock Exam", "Project"
  shortLabel?: string; // e.g. "TEST 3"
  maxScore: number; // e.g. 100, 50, 20
  includeInTotal?: boolean; // whether it contributes to total score
  showOnReportCard: boolean; // whether it appears as a column on the report card
  order?: number;
}

export interface SubjectAssessment {
  caScore: number; // Continuous Assessment / Test 1
  test1Score?: number; // Test 1 Score
  test2Score?: number; // Test 2 Score
  midTermScore: number; // Mid-Term Test
  endTermScore: number; // End-of-Term exam score
  customScores?: Record<string, number>; // Map of customColumnId -> mark (e.g. { "test_3": 85 })
  totalScore: number; // Final Total Score (Editable by teacher)
  maxScore?: number; // e.g. 150 for Grades 1-7 or 100 for secondary
  percentage?: number; // Calculated Percentage (e.g. Total / maxScore * 100)
  rawScore?: number; // Direct entered raw mark if raw mode used
  scoringMode?: "raw" | "ca_weighted" | "independent" | "out_of_150" | "out_of_100" | "grade_7_exam";
  eczGrade: EczGradePoint;
  grade7Grade?: Grade7EczGradePoint;
  grade7Division?: Grade7Division;
  remark: string;
  teacherInitials: string;
}

export interface ReportCardDisplayConfig {
  showTest1: boolean;
  showTest2: boolean;
  showMidterm: boolean;
  showEndTerm: boolean;
  showTotal: boolean;
  showClassAverage: boolean;
  showGrade: boolean;
  showStandard: boolean;
  showRemarks: boolean;
  showTeacherInitials: boolean;
  scoringMode: "independent" | "ca_weighted" | "raw" | "out_of_150" | "out_of_100";
  test1Label?: string;
  test2Label?: string;
  midtermLabel?: string;
  endTermLabel?: string;
  totalLabel?: string;
  test1Max?: number;
  test2Max?: number;
  midtermMax?: number;
  endTermMax?: number;
  totalMax?: number;
  customColumns?: CustomAssessmentColumn[];
}

// Map: classId -> term -> studentId -> subjectName -> SubjectAssessment
export type GradebookData = Record<number, Record<string, Record<number, Record<string, SubjectAssessment>>>>;

export type AttendanceStatus = "Present" | "Late" | "Absent" | "Excused";

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId: number;
  studentId: number;
  status: AttendanceStatus;
  session: "Morning" | "Afternoon";
  notes?: string;
  parentNotified?: boolean;
}

export interface TermlyReportCard {
  studentId: number;
  term: "Term 1" | "Term 2" | "Term 3";
  year: number;
  daysOpened: number;
  daysPresent: number;
  daysAbsent: number;
  conduct: "Excellent" | "Good" | "Satisfactory" | "Needs Improvement";
  interests: string;
  classTeacherComment: string;
  headteacherComment: string;
  promotedTo?: string;
  reportDate: string;
}

export interface FeeItem {
  id: number;
  studentId: number;
  studentName?: string;
  description: string;
  term: "Term 1" | "Term 2" | "Term 3";
  year: number;
  category?: "Tuition" | "Examination Fee (ECZ)" | "Boarding & Catering" | "School Bus Transport" | "School Uniform" | "PTA & Development Levy" | "Computer & Science Lab Fee" | "Sports & Activities";
  amountZMW: number;
  paidAmountZMW: number;
  amount?: number;
  paid?: number;
  balance?: number;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Partially Paid";
  discountAmountZMW?: number;
  scholarshipBursaryZMW?: number;
}

export interface PaymentReceipt {
  id: number;
  receiptNumber: string;
  feeItemId: number;
  studentId: number;
  studentName: string;
  studentEczNo: string;
  grade: string;
  amountPaidZMW: number;
  paymentMethod: "Cash" | "Airtel Money" | "MTN MoMo" | "Zamtel Kwacha" | "Bank Deposit" | "Bank Transfer" | "Debit Card";
  referenceNumber: string;
  paymentDate: string;
  description: string;
  previousBalanceZMW: number;
  remainingBalanceZMW: number;
  collectedBy: string;
  verified: boolean;
  notes?: string;
}

export interface HomeworkTask {
  id: number;
  classId: number;
  subject: string;
  title: string;
  description: string;
  dueDate: string;
  assignedBy: string;
  materialsUrl?: string;
}

export interface ExamSchedule {
  id: number;
  classId: number;
  subject: string;
  date: string;
  time: string;
  room: string;
  paperType: "Mid-Term Test" | "Mock Examination" | "End-of-Term Assessment" | "ECZ National Final Examination";
  maxMarks?: number;
}

export interface LibraryBook {
  id: number;
  isbn?: string;
  title: string;
  author: string;
  category: "Mathematics" | "English & Reading" | "Science & Nature" | "Zambian History & Social" | "Reference & Dictionary" | "Story Books" | "TEVET & Vocational" | "Religious Education";
  totalCopies: number;
  availableCopies: number;
  shelfLocation?: string;
  publisher?: string;
}

export interface BookCheckout {
  id: number;
  bookId: number;
  bookTitle?: string;
  borrowerType: "Student" | "Teacher";
  borrowerId: number;
  borrowerName: string;
  studentName?: string;
  borrowerRef: string; // Student ID or TSC No
  checkoutDate: string;
  dueDate: string;
  returnDate?: string;
  status: "Active" | "Returned" | "Overdue";
  fineZMW?: number;
}

export type LibraryCheckout = BookCheckout;

export interface ClassSubject {
  id: string;
  code: string;
  name: string;
  gradeLevel: string;
  teacherName: string;
  periodsPerWeek: number;
  department?: string;
}

export interface InventoryItem {
  id: number;
  code?: string;
  assetTag?: string;
  name: string;
  category: "Computers & ICT" | "Desks & Tables" | "Chairs" | "Laboratory Equipment" | "Sports & Physical Ed" | "Vehicles" | "Office Equipment" | "Library Assets" | "General School Property" | string;
  quantity: number;
  condition: "Excellent" | "Good" | "Fair" | "Damaged" | "Needs Repair" | "Condemned" | "New";
  location: string;
  purchaseDate?: string;
  purchasePriceZMW?: number;
  supplier?: string;
  assignedDepartment?: string;
  department?: string;
  serialNumber?: string;
  maintenanceNotes?: string;
}

export interface DisciplineRecord {
  id: number;
  studentId: number;
  studentName: string;
  grade: string;
  stream?: string;
  incidentDate: string;
  category?: "Minor Infraction" | "Lateness / Truancy" | "Uniform / Grooming Violation" | "Fighting / Bullying" | "Academic Dishonesty" | "Property Damage" | "Insubordination" | "Severe Misconduct" | string;
  infractionType?: string;
  severity?: "Minor" | "Moderate" | "Major" | "Critical" | string;
  description: string;
  actionTaken: "Verbal Warning" | "Written Warning" | "Detention" | "Parent Conference Required" | "Suspension (3-7 Days)" | "Community Service / Campus Clean-Up" | "Expulsion Recommendation" | string;
  recordedBy: string;
  recordedByRole?: string;
  parentNotified?: boolean;
  followUpDate?: string;
  resolutionStatus?: "Open" | "Under Investigation" | "In Progress" | "Resolved";
  status?: string;
  resolutionNotes?: string;
}

export interface HostelDormitory {
  id: number;
  name: string;
  gender: "Boys" | "Girls";
  houseName: string;
  houseMasterName: string;
  houseMasterPhone: string;
  capacity: number;
  occupiedBeds: number;
  roomCount: number;
  termFeeZMW: number;
  status: "Available" | "Full" | "Maintenance";
}

export interface HostelAllocation {
  id: number;
  studentId: number;
  studentName: string;
  grade: string;
  gender: "Male" | "Female";
  dormitoryId: number;
  dormitoryName: string;
  roomNumber: string;
  bedNumber: string;
  checkInDate: string;
  status: "Boarding Active" | "Checked Out" | "On Weekend Pass" | "Vacated / Checked Out" | string;
  emergencyContact: string;
}

export interface TransportStopDetail {
  id?: string;
  name: string;
  morningPickupTime?: string;
  afternoonDropoffTime?: string;
  time?: string;
  landmark?: string;
}

export interface TransportRoute {
  id: number;
  name?: string;
  routeName?: string;
  routeCode?: string;
  zone?: string;
  driverName: string;
  driverPhone: string;
  driverNrc?: string;
  driverLicenseNo?: string;
  busNumber?: string;
  busRegNo?: string;
  vehicleId?: number;
  capacity?: number;
  assignedPupilsCount?: number;
  studentCount?: number;
  termFareZMW?: number;
  monthlyFeeZMW?: number;
  morningDepartureTime?: string;
  afternoonDepartureTime?: string;
  status?: "Active" | "Maintenance" | "Standby" | "Inactive";
  notes?: string;
  stops: (string | TransportStopDetail)[];
}

export interface TransportVehicle {
  id: number;
  registrationNumber: string;
  model: string;
  capacity: number;
  driverName?: string;
  driverPhone?: string;
  routeZone?: string;
  status?: "Active" | "Maintenance" | "Active & Fit" | "Off-Road" | string;
  rtsaFitnessExpiry?: string;
  insuranceExpiry?: string;
  fitnessExpiry?: string;
  termFeeZMW?: number;
}

export interface TransportPupilAssignment {
  id: number;
  studentId: number;
  studentName: string;
  grade: string;
  vehicleId: number;
  vehicleReg: string;
  pickupPoint: string;
  dropoffPoint: string;
  guardianPhone: string;
  status: "Active" | "Suspended" | "Cancelled";
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  recordId?: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  ipAddress?: string;
}

export type EventCategory =
  | "Academic"
  | "Examinations"
  | "Sports & Culture"
  | "PTA Meeting"
  | "Holiday"
  | "Term Dates"
  | "National Holiday"
  | "Religious & School Ceremony";

export interface AcademicTerm {
  id: "Term 1" | "Term 2" | "Term 3";
  name: string;
  year: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  weeks: number;
  totalInstructionDays: number;
  midTermBreak: {
    startDate: string;
    endDate: string;
    description: string;
  };
  holidayBreak: {
    startDate: string;
    endDate: string;
    description: string;
  };
  keyFocus: string;
  theme: string;
  status: "Completed" | "Active" | "Upcoming";
}

export interface ZambianHoliday {
  id: number;
  name: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  type: "National Public Holiday" | "Commemoration" | "Christian Holiday";
  description: string;
}

export interface SchoolEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // Optional end date for multi-day events
  time?: string; // e.g. "08:30 AM - 14:00 PM"
  category: EventCategory;
  description: string;
  term?: "Term 1" | "Term 2" | "Term 3" | "Holiday Period";
  targetAudience?: "All School" | "Primary Section" | "Secondary Section" | "Staff & Teachers" | "Parents & PTA" | "Exam Candidates (Grades 7, 9, 12)";
  location?: string;
  isImportant?: boolean;
}

export interface UserMessage {
  id: number;
  fromName: string;
  fromRole?: string;
  toName: string;
  toRole?: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  channel?: "Internal Message" | "SMS Alert" | "WhatsApp Notice" | "Email";
}

export interface ParentAccount {
  id: number;
  name: string;
  nrcNumber: string; // Zambian National Registration Card
  phone: string;
  email: string;
  childIds: number[];
  occupation?: string;
  address?: string;
  username: string;
  password?: string;
}

export interface SchoolHouse {
  id: string;
  name: string;
  color: string;
  motto: string;
  patronName: string;
  studentCount: number;
}

export interface SchoolProfile {
  name: string;
  logoUrl?: string; // Base64 data URI or image URL
  systemName?: string; // "RYNTECH School Management System"
  slogan: string;
  motto: string;
  registrationNumber: string;
  examinationCenterCode: string;
  schoolType: "Primary School" | "Secondary School" | "Combined School (Primary & Secondary)" | "Early Childhood & Primary";
  ownership: "Government / Public School" | "Private (Mission / Church)" | "Private (Commercial / Independent)" | "Grant-Aided";
  headteacherName: string;
  deputyHeadName: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  district: string;
  country: string;
  currentYear: number;
  activeTerm: "Term 1" | "Term 2" | "Term 3";
  termStartDate?: string;
  termEndDate?: string;
  nextTermStartDate?: string;
  missionStatement: string;
  visionStatement: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankBranch: string;
  mobileMoneyNumber: string;
  themeColor?: string;
  houses?: SchoolHouse[];
  departments?: string[];
  currency?: string; // "ZMW"
  smsGatewayEnabled?: boolean;
  whatsappGatewayEnabled?: boolean;
  momoGatewayEnabled?: boolean;
}

export interface TimetablePeriod {
  id: string;
  classId: number;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  time: string; // e.g. "07:30 - 08:30"
  subject: string;
  teacher: string;
  room?: string;
  isBreak?: boolean;
}

export interface UserSession {
  role: UserRole;
  userName?: string;
  userRoleTitle?: string;
  adminName?: string; // backward compat
  teacher?: Teacher;
  parent?: ParentAccount;
  student?: Student;
  staff?: StaffMember;
  permissions?: string[];
}

export type ApplicationStatus = "Pending" | "Under Review" | "Approved" | "Rejected" | "Waitlisted";

export interface PupilApplication {
  id: string; // e.g. "APP-2026-8492"
  submissionDate: string; // ISO string or YYYY-MM-DD
  section: SchoolSection; // "Primary" | "Secondary" | "Early Childhood"
  desiredGrade: string; // e.g. "Grade 1", "Grade 7", "Grade 10"
  desiredStream?: string; // e.g. "Eagle", "Science", "Commerce"
  desiredClassId?: number; // chosen class ID
  pathway?: SecondaryPathway; // for secondary: STEM, Business, etc.
  boardingStatus: "Day Scholar" | "Boarding";
  transportNeeded?: boolean;
  transportRouteId?: number;
  transportPickupPoint?: string;

  // Pupil Details
  pupilFullName: string;
  gender: "Male" | "Female";
  dob: string; // YYYY-MM-DD
  age: number;
  nrcOrBirthCertNo?: string;
  previousSchool?: string;
  previousGrade?: string;
  lastExamScore?: string; // e.g. "Grade 7 Composite: 730"
  residentialAddress: string;
  district?: string;
  province?: string;
  specialNeedsOrMedical?: string;
  allergies?: string;
  bloodGroup?: string;

  // Guardian Details
  guardianFullName: string;
  guardianRelationship: string; // Father, Mother, Legal Guardian, Uncle, Aunt, Grandparent
  guardianNrc: string;
  guardianPhone: string;
  guardianAltPhone?: string;
  guardianEmail: string;
  guardianOccupation?: string;
  guardianEmployerOrBusiness?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;

  // Review & Approval status
  status: ApplicationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  enrolledStudentId?: number; // ID of the Student once approved
}


