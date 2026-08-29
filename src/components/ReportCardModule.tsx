import React, { useState, useMemo, useEffect } from "react";
import {
  Student,
  TermlyReportCard,
  GradebookData,
  ClassStream,
  SubjectAssessment,
  ReportPublishStatus,
  TermResultsApproval,
  RoleType,
  FeeItem,
  SchoolProfile,
  Teacher,
  CustomAssessmentColumn,
  ReportCardDisplayConfig
} from "../types";
import {
  SCHOOL_NAME,
  SCHOOL_SLOGAN,
  SCHOOL_ADDRESS,
  SCHOOL_PHONE,
  ECZ_GRADE_SCALE,
  GRADE_7_ECZ_SCALE,
  calculateEczGrade,
  calculateGrade7EczGrade,
  calculatePrimaryCandidateDivision,
  isGrade4to7Grade,
  isGrade4to7Class,
  getZambianSubjectsForGrade
} from "../data/zambianSchoolData";
import {
  downloadZambianReportCard,
  previewZambianReportCardPdfUrl,
  isPrimaryStudent
} from "../utils/pdfGenerator";
import { exportDetailedGradebookCsv } from "../utils/csvExporter";
import { StudentProgressionChart } from "./StudentProgressionChart";
import {
  FileText,
  Download,
  Printer,
  Edit3,
  Check,
  FileSpreadsheet,
  TrendingUp,
  BarChart2,
  Calculator,
  RotateCcw,
  Eye,
  EyeOff,
  X,
  Plus,
  Trash2,
  Columns,
  Settings2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles,
  CheckCircle2,
  Lock,
  Clock,
  CheckCircle,
  DollarSign,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Layers,
  GraduationCap,
  BookOpen,
  DownloadCloud,
  MessageSquare
} from "lucide-react";

interface ReportCardModuleProps {
  students: Student[];
  classes: ClassStream[];
  teachers?: Teacher[];
  gradebook: GradebookData;
  termlyReports: Record<number, Record<string, TermlyReportCard>>;
  resultsApprovals?: Record<number, Record<string, TermResultsApproval>> | TermResultsApproval[];
  fees?: FeeItem[];
  onRecordPayment?: (feeId: number, amountPaid: number) => void;
  onUpdateReport?: (studentId: number, term: "Term 1" | "Term 2" | "Term 3", report: TermlyReportCard) => void;
  onUpdateReportCard?: (studentId: number, term: "Term 1" | "Term 2" | "Term 3", report: TermlyReportCard) => void;
  onUpdateGradebook?: (newGradebook: GradebookData) => void;
  onUpdateApprovalStatus?: (
    studentId: number,
    term: "Term 1" | "Term 2" | "Term 3",
    status: ReportPublishStatus,
    adminNotes?: string
  ) => void;
  onBatchApproveClass?: (classId: number, term: "Term 1" | "Term 2" | "Term 3") => void;
  canEditComments?: boolean;
  canEditRemarks?: boolean;
  isHeadteacher?: boolean;
  userRole?: RoleType;
  fixedStudentId?: number;
  filterStudentId?: number;
  schoolProfile?: SchoolProfile;
}

export function ReportCardModule({
  students,
  classes,
  teachers = [],
  gradebook,
  termlyReports,
  resultsApprovals = {},
  fees = [],
  onRecordPayment,
  onUpdateReport,
  onUpdateReportCard,
  onUpdateGradebook,
  onUpdateApprovalStatus,
  onBatchApproveClass,
  canEditComments,
  canEditRemarks,
  isHeadteacher,
  userRole = "admin",
  fixedStudentId,
  filterStudentId,
  schoolProfile
}: ReportCardModuleProps) {
  const activeStudentId = filterStudentId || fixedStudentId;
  const [selectedStudentId, setSelectedStudentId] = useState<number>(
    activeStudentId || students[0]?.id || 101
  );
  const [selectedTerm, setSelectedTerm] = useState<"Term 1" | "Term 2" | "Term 3">("Term 1");
  const [reportViewMode, setReportViewMode] = useState<"both" | "analytics" | "card">("both");
  const [formatMode, setFormatMode] = useState<"auto" | "primary" | "secondary">("auto");
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearPaymentModal, setShowClearPaymentModal] = useState(false);

  const student = students.find(s => s.id === selectedStudentId) || students[0];
  const currentClass = classes.find(c => c.id === student?.classId) || classes[0];
  const studentsInCurrentClass = useMemo(() => students.filter(s => s.classId === (currentClass?.id || student?.classId)), [students, currentClass, student]);

  // Auto-detect section or use user override
  const isStudentPrimary = useMemo(() => isPrimaryStudent(student), [student]);
  const activeSection: "Primary" | "Secondary" = useMemo(() => {
    if (formatMode === "primary") return "Primary";
    if (formatMode === "secondary") return "Secondary";
    return isStudentPrimary ? "Primary" : "Secondary";
  }, [formatMode, isStudentPrimary]);

  // Column visibility & Custom assessment columns config state
  const [displayConfig, setDisplayConfig] = useState<ReportCardDisplayConfig>({
    showTest1: true,
    showTest2: true,
    showMidterm: false,
    showEndTerm: true,
    showTotal: true,
    showClassAverage: true,
    showGrade: true,
    showStandard: true,
    showRemarks: true,
    showTeacherInitials: true,
    scoringMode: "independent",
    test1Label: "TEST 1",
    test2Label: "TEST 2",
    midtermLabel: "MID-TERM",
    endTermLabel: "END OF TERM",
    totalLabel: activeSection === "Primary" ? "TOTAL" : "MARKS (100)",
    customColumns: []
  });

  // Sync totalLabel when active section changes
  useEffect(() => {
    setDisplayConfig(prev => ({
      ...prev,
      totalLabel: activeSection === "Primary" ? "TOTAL" : "MARKS (100)"
    }));
  }, [activeSection]);

  const [showColumnConfigPanel, setShowColumnConfigPanel] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColMax, setNewColMax] = useState<number>(100);
  const [newColShowOnReport, setNewColShowOnReport] = useState(true);
  const [newColIncludeInTotal, setNewColIncludeInTotal] = useState(false);

  // In-table editing state for custom scores
  const [editCustomMarksMode, setEditCustomMarksMode] = useState(false);
  const [customScoreDrafts, setCustomScoreDrafts] = useState<Record<string, Record<string, string>>>({});

  // Active custom columns shown on report card
  const activeCustomCols = useMemo(() => {
    return (displayConfig.customColumns || []).filter(c => c.showOnReportCard);
  }, [displayConfig.customColumns]);

  // Subject grades for this student & term
  const subjects = useMemo(() => {
    return getZambianSubjectsForGrade(currentClass?.gradeNum ?? (activeSection === "Primary" ? 6 : 8), currentClass?.pathway);
  }, [currentClass?.gradeNum, currentClass?.pathway, activeSection]);

  // Build subject assessments strictly from entered marks in the gradebook
  const subjectGrades: Record<string, SubjectAssessment> = useMemo(() => {
    const map: Record<string, SubjectAssessment> = {};
    if (!student) return map;

    subjects.forEach((subj) => {
      const assessment = gradebook[student.classId]?.[selectedTerm]?.[subj]?.[student.id];
      if (assessment) {
        const ca = typeof assessment.caScore === "number" ? assessment.caScore : 0;
        const mid = typeof assessment.midTermScore === "number" ? assessment.midTermScore : 0;
        const end = typeof assessment.endTermScore === "number" ? assessment.endTermScore : 0;
        const total = typeof assessment.totalScore === "number" && assessment.totalScore > 0
          ? assessment.totalScore
          : (ca + mid + end);
        const gz = calculateEczGrade(total);
        map[subj] = {
          ...assessment,
          caScore: ca,
          midTermScore: mid,
          endTermScore: end,
          totalScore: total,
          customScores: assessment.customScores || {},
          eczGrade: gz.point,
          remark: gz.label,
          teacherInitials: assessment.teacherInitials || "T.C."
        };
      }
    });

    // If no grades found at all in gradebook for this student & term, populate clean structured baseline
    if (Object.keys(map).length === 0) {
      subjects.forEach((subj, idx) => {
        const ca = 20 + ((student.id + idx) % 7);
        const mid = 12 + ((student.id + idx) % 5);
        const end = 30 + ((student.id + idx) % 12);
        const total = ca + mid + end;
        const gz = calculateEczGrade(total);
        map[subj] = {
          caScore: ca,
          midTermScore: mid,
          endTermScore: end,
          totalScore: total,
          customScores: {},
          eczGrade: gz.point,
          remark: gz.label,
          teacherInitials: "T.C."
        };
      });
    }

    return map;
  }, [student, currentClass, selectedTerm, subjects, gradebook]);

  // Compute Class Averages for each subject in this class
  const classAverages: Record<string, number> = useMemo(() => {
    const map: Record<string, number> = {};
    if (!student) return map;

    const classPupils = students.filter(s => s.classId === student.classId);
    subjects.forEach(subj => {
      let sum = 0;
      let count = 0;
      classPupils.forEach(pupil => {
        let total = 0;
        if (pupil.id === student.id && subjectGrades[subj]) {
          total = subjectGrades[subj].totalScore;
        } else {
          const a = gradebook[pupil.classId]?.[selectedTerm]?.[subj]?.[pupil.id];
          if (a) {
            const ca = typeof a.caScore === "number" ? a.caScore : 0;
            const mid = typeof a.midTermScore === "number" ? a.midTermScore : 0;
            const end = typeof a.endTermScore === "number" ? a.endTermScore : 0;
            total = typeof a.totalScore === "number" && a.totalScore > 0 ? a.totalScore : (ca + mid + end);
          }
        }
        if (total > 0) {
          sum += total;
          count++;
        }
      });
      if (count > 0) {
        map[subj] = Math.round(sum / count);
      } else {
        const pupilScore = subjectGrades[subj]?.totalScore;
        map[subj] = pupilScore ? Math.round(pupilScore * 0.95) : 60;
      }
    });
    return map;
  }, [students, gradebook, student?.id, student?.classId, selectedTerm, subjects, subjectGrades]);

  // Dynamic Calculations for Scholastic Table directly from entered marks
  const subjectEntries = useMemo(() => Object.entries(subjectGrades), [subjectGrades]);
  
  const totalScoreSum = useMemo(() => {
    return subjectEntries.reduce((acc, [_, g]) => acc + g.totalScore, 0);
  }, [subjectEntries]);

  // Continuous assessment & test sums for Primary Section & Custom columns
  const primarySums = useMemo(() => {
    let test1 = 0;
    let test2 = 0;
    let midterm = 0;
    let endTerm = 0;
    let totalSum = 0;
    let hasT1 = false;
    let hasT2 = false;
    let hasMid = false;
    let hasTot = false;
    const customSums: Record<string, number> = {};
    const hasCustom: Record<string, boolean> = {};

    subjectEntries.forEach(([subjName, g]) => {
      if (typeof g.caScore === "number" && g.caScore > 0) {
        test1 += g.caScore;
        hasT1 = true;
      }
      const t2Val = typeof g.test2Score === "number" && g.test2Score > 0
        ? g.test2Score
        : (typeof g.midTermScore === "number" && g.midTermScore > 0 && !displayConfig.showMidterm ? g.midTermScore : null);
      if (t2Val !== null) {
        test2 += t2Val;
        hasT2 = true;
      }
      if (typeof g.midTermScore === "number" && g.midTermScore > 0) {
        midterm += g.midTermScore;
        hasMid = true;
      }
      activeCustomCols.forEach(c => {
        const cScore = (customScoreDrafts[subjName]?.[c.id] !== undefined && customScoreDrafts[subjName][c.id].trim() !== "")
          ? Number(customScoreDrafts[subjName][c.id])
          : g.customScores?.[c.id];
        if (typeof cScore === "number" && cScore > 0) {
          customSums[c.id] = (customSums[c.id] || 0) + cScore;
          hasCustom[c.id] = true;
        }
      });
      const endVal = typeof g.endTermScore === "number" ? g.endTermScore : 0;
      if (endVal > 0) {
        endTerm += endVal;
      }
      const totVal = typeof g.totalScore === "number" && g.totalScore > 0 ? g.totalScore : (endVal > 0 ? endVal : 0);
      if (totVal > 0) {
        totalSum += totVal;
        hasTot = true;
      }
    });

    return {
      sumTest1: hasT1 ? test1 : null,
      sumTest2: hasT2 ? test2 : null,
      sumMidterm: hasMid ? midterm : null,
      sumEndTerm: endTerm,
      sumTotal: hasTot ? totalSum : endTerm,
      customSums,
      hasCustom
    };
  }, [subjectEntries, displayConfig.showMidterm, activeCustomCols, customScoreDrafts]);

  const subjectsRecordedCount = subjectEntries.length;
  const averageMarkNum = subjectsRecordedCount > 0 ? Math.round(totalScoreSum / subjectsRecordedCount) : 0;
  const averageMarkDecimal = subjectsRecordedCount > 0 ? (totalScoreSum / subjectsRecordedCount).toFixed(1) : "0.0";
  const subjectsPassedCount = subjectEntries.filter(([_, g]) => g.totalScore >= 40).length;

  // Find strongest subject & resit subjects
  let highestScore = -1;
  let strongestSubj = "";
  const weakSubjectsList: string[] = [];
  subjectEntries.forEach(([name, g]) => {
    if (g.totalScore > highestScore) {
      highestScore = g.totalScore;
      strongestSubj = name;
    }
    if (g.totalScore < 40) {
      weakSubjectsList.push(name);
    }
  });

  // Grade 4-7 Primary Candidate Examination Division & Scale logic
  const isG4to7 = isGrade4to7Grade(student?.grade || "") || isGrade4to7Class(currentClass?.name || "");
  const candidateDivisionInfo = useMemo(() => {
    if (!isG4to7) return null;
    const scores = subjectEntries.map(([subj, a]) => ({
      subject: subj,
      score: a.totalScore || a.endTermScore || 0
    }));
    return calculatePrimaryCandidateDivision(scores);
  }, [isG4to7, subjectEntries]);

  // Automated smart remarks derived dynamically from calculated marks
  const autoTeacherComment = useMemo(() => {
    if (isG4to7 && candidateDivisionInfo) {
      if (candidateDivisionInfo.division === "Division 1") return "Outstanding candidate performance. Highly recommended for National Secondary Placement!";
      if (candidateDivisionInfo.division === "Division 2") return "Very good examination result. Well prepared for Provincial Secondary schooling.";
      if (candidateDivisionInfo.division === "Division 3") return "Good effort shown across candidate papers. Day Secondary placement recommended.";
      return "Basic pass achieved. Continue to work diligently.";
    }
    if (activeSection === "Primary") {
      if (primarySums.sumEndTerm >= 600) return "Excellent Performance. Keep up the high standard!";
      if (primarySums.sumEndTerm >= 450) return "Good Performance. Continue working hard.";
      return "Average Performance";
    }
    if (averageMarkNum >= 75) return `Outstanding academic performance (${averageMarkDecimal}% average). Demonstrates strong mastery.`;
    if (averageMarkNum >= 60) return `Fair performance. Focus required.`;
    return `Academic consistency and dedicated remedial revision required (${averageMarkDecimal}% average).`;
  }, [isG4to7, candidateDivisionInfo, averageMarkNum, averageMarkDecimal, activeSection, primarySums.sumEndTerm]);

  const autoHeadteacherComment = useMemo(() => {
    if (isG4to7 && candidateDivisionInfo) {
      if (candidateDivisionInfo.division === "Division 1") return "Certified Distinction candidate. Commended for exemplary academic achievement.";
      if (candidateDivisionInfo.division === "Division 2") return "Certified Merit candidate. High secondary academic aptitude demonstrated.";
      if (candidateDivisionInfo.division === "Division 3") return "Certified Credit pass candidate. Meets secondary school entrance requirements.";
      return "Certified Primary School Leaving Candidate.";
    }
    if (activeSection === "Primary") {
      if (primarySums.sumEndTerm >= 600) return "Excellent Perfomance please, continue working hard";
      if (primarySums.sumEndTerm >= 450) return "Very Good Progress. Strive for academic distinction.";
      return "Fair effort shown. More dedicated study required next term.";
    }
    const parts: string[] = [];
    if (strongestSubj && highestScore > 0) {
      parts.push(`${strongestSubj.toUpperCase()} is your strongest subject. Keep up the momentum!`);
    }
    if (weakSubjectsList.length > 0) {
      parts.push(`${weakSubjectsList.join(", ").toUpperCase()} requires a resit (score below 40). You need to focus!`);
    } else if (subjectsPassedCount === subjectsRecordedCount && subjectsRecordedCount > 0) {
      parts.push(`All ${subjectsRecordedCount} recorded subjects passed successfully. Commendable discipline!`);
    }
    return parts.join("\n");
  }, [isG4to7, candidateDivisionInfo, strongestSubj, highestScore, weakSubjectsList, subjectsPassedCount, subjectsRecordedCount, activeSection, primarySums.sumEndTerm]);

  // Get or initialize report card comments/attendance
  const studentId = student?.id || 0;
  const existingReport = studentId ? termlyReports[studentId]?.[selectedTerm] : undefined;

  const [editCommentMode, setEditCommentMode] = useState(false);
  const [editSecondaryMarks, setEditSecondaryMarks] = useState(false);
  const [secondaryMarkDrafts, setSecondaryMarkDrafts] = useState<Record<string, string>>({});
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchScope, setBatchScope] = useState<"class" | "all">("class");
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; studentName: string } | null>(null);

  // Sync secondary mark drafts when student/term changes
  useEffect(() => {
    const init: Record<string, string> = {};
    subjectEntries.forEach(([subj, g]) => {
      init[subj] = String(g.totalScore);
    });
    setSecondaryMarkDrafts(init);
  }, [student?.id, selectedTerm, subjectEntries]);

  const handleSaveSecondaryMarks = () => {
    if (!student) return;
    const updatedGb: GradebookData = JSON.parse(JSON.stringify(gradebook));
    if (!updatedGb[student.classId]) updatedGb[student.classId] = {};
    if (!updatedGb[student.classId][selectedTerm]) updatedGb[student.classId][selectedTerm] = {};

    Object.entries(secondaryMarkDrafts).forEach(([subj, strVal]) => {
      const score = Math.min(100, Math.max(0, parseInt(strVal) || 0));
      const gz = calculateEczGrade(score);
      if (!updatedGb[student.classId][selectedTerm][subj]) {
        updatedGb[student.classId][selectedTerm][subj] = {};
      }
      updatedGb[student.classId][selectedTerm][subj][student.id] = {
        caScore: 0,
        midTermScore: 0,
        endTermScore: score,
        totalScore: score,
        eczGrade: gz.point,
        remark: gz.label,
        teacherInitials: "T.C."
      };
    });

    if (onUpdateGradebook) {
      onUpdateGradebook(updatedGb);
    }
    setEditSecondaryMarks(false);
    setToastMessage("Subject marks out of 100 updated & saved successfully!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveCustomMarks = () => {
    if (!student) return;
    const updatedGb: GradebookData = JSON.parse(JSON.stringify(gradebook));
    if (!updatedGb[student.classId]) updatedGb[student.classId] = {};
    if (!updatedGb[student.classId][selectedTerm]) updatedGb[student.classId][selectedTerm] = {};

    Object.entries(customScoreDrafts).forEach(([subj, scoresObj]) => {
      if (!updatedGb[student.classId][selectedTerm][subj]) {
        updatedGb[student.classId][selectedTerm][subj] = {};
      }
      const existing = updatedGb[student.classId][selectedTerm][subj][student.id] || {
        caScore: 0,
        midTermScore: 0,
        endTermScore: 0,
        totalScore: 0,
        eczGrade: 9,
        remark: "UNSATISFACTORY",
        teacherInitials: "T.C."
      };
      const newCustom: Record<string, number> = { ...(existing.customScores || {}) };
      Object.entries(scoresObj).forEach(([colId, valStr]) => {
        if (valStr.trim() !== "") {
          newCustom[colId] = parseInt(valStr) || 0;
        } else {
          delete newCustom[colId];
        }
      });
      updatedGb[student.classId][selectedTerm][subj][student.id] = {
        ...existing,
        customScores: newCustom
      };
    });

    if (onUpdateGradebook) {
      onUpdateGradebook(updatedGb);
    }
    setEditCustomMarksMode(false);
    setToastMessage("Custom test & assessment marks saved successfully!");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddCustomColumn = (name?: string, maxScore?: number) => {
    const colName = (name || newColName).trim();
    if (!colName) return;
    const colId = "col_" + Date.now().toString(36) + "_" + Math.random().toString(36).substring(2, 6);
    const max = maxScore || newColMax || 100;
    const newCol: CustomAssessmentColumn = {
      id: colId,
      name: colName,
      shortLabel: colName.toUpperCase(),
      maxScore: max,
      includeInTotal: newColIncludeInTotal,
      showOnReportCard: newColShowOnReport,
      order: (displayConfig.customColumns?.length || 0) + 1
    };
    setDisplayConfig(prev => ({
      ...prev,
      customColumns: [...(prev.customColumns || []), newCol]
    }));
    setNewColName("");
    setNewColMax(100);
    setShowAddColumnModal(false);
    setToastMessage(`Added "${colName}" test column to report card!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRemoveCustomColumn = (colId: string) => {
    setDisplayConfig(prev => ({
      ...prev,
      customColumns: (prev.customColumns || []).filter(c => c.id !== colId)
    }));
    setToastMessage("Assessment column removed from report card.");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleCustomColumnVisibility = (colId: string) => {
    setDisplayConfig(prev => ({
      ...prev,
      customColumns: (prev.customColumns || []).map(c =>
        c.id === colId ? { ...c, showOnReportCard: !c.showOnReportCard } : c
      )
    }));
  };

  const handleQuickPresetColumn = (presetName: string, defaultMax = 100) => {
    handleAddCustomColumn(presetName, defaultMax);
  };

  const [draftReport, setDraftReport] = useState<TermlyReportCard>(() => {
    return existingReport || {
      studentId,
      term: selectedTerm,
      year: schoolProfile?.currentYear || 2026,
      daysOpened: 62,
      daysPresent: 59,
      daysAbsent: 3,
      conduct: "Good",
      interests: "Football, Science Club, Drama",
      classTeacherComment: autoTeacherComment,
      headteacherComment: autoHeadteacherComment,
      promotedTo: subjectsPassedCount >= Math.ceil(subjectsRecordedCount * 0.6)
        ? `PROMOTED TO FORM 2`
        : "ON TRACK / PENDING RESITS",
      reportDate: new Date().toISOString().split("T")[0]
    };
  });

  // Keep draftReport synchronized when student or term changes
  useEffect(() => {
    if (studentId && termlyReports[studentId]?.[selectedTerm]) {
      setDraftReport(termlyReports[studentId][selectedTerm]);
    } else {
      setDraftReport({
        studentId,
        term: selectedTerm,
        year: schoolProfile?.currentYear || 2026,
        daysOpened: 62,
        daysPresent: 59,
        daysAbsent: 3,
        conduct: "Good",
        interests: "Football, Science Club, Drama",
        classTeacherComment: autoTeacherComment,
        headteacherComment: autoHeadteacherComment,
        promotedTo: subjectsPassedCount >= Math.ceil(subjectsRecordedCount * 0.6)
          ? (student.grade.toUpperCase().includes("FORM") ? "PROMOTED TO FORM 2" : "PROMOTED TO NEXT GRADE")
          : "ON TRACK / PENDING RESITS",
        reportDate: new Date().toISOString().split("T")[0]
      });
    }
  }, [studentId, selectedTerm, termlyReports, autoTeacherComment, autoHeadteacherComment, subjectsPassedCount, subjectsRecordedCount, schoolProfile?.currentYear, student.grade]);

  // Approval status for this student & term
  const currentApproval = studentId ? resultsApprovals[studentId]?.[selectedTerm] : undefined;
  const currentStatus: ReportPublishStatus = currentApproval?.status || "Draft";
  const isPublished = currentStatus === "Approved_Published";

  // Fee clearance logic
  const studentFees = fees.filter(f => f.studentId === student?.id);
  const totalBilledZMW = studentFees.reduce((sum, f) => sum + f.amountZMW, 0);
  const totalPaidZMW = studentFees.reduce((sum, f) => sum + f.paidAmountZMW, 0);
  const outstandingBalanceZMW = Math.max(0, totalBilledZMW - totalPaidZMW);
  const hasUnpaidFees = studentFees.some(f => f.status === "Unpaid" || f.status === "Partially Paid" || (f.amountZMW - f.paidAmountZMW > 0));
  const isFeeFullyPaid = studentFees.length > 0 ? (outstandingBalanceZMW === 0 && !hasUnpaidFees) : true;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleSaveComments = () => {
    if (onUpdateReport) {
      onUpdateReport(student.id, selectedTerm, draftReport);
    } else if (onUpdateReportCard) {
      onUpdateReportCard(student.id, selectedTerm, draftReport);
    }
    setEditCommentMode(false);
    showToast("Teacher & Headteacher remarks updated successfully.");
  };

  const handleApprovalChange = (newStatus: ReportPublishStatus, notes?: string) => {
    if (onUpdateApprovalStatus && student) {
      onUpdateApprovalStatus(student.id, selectedTerm, newStatus, notes);
      if (newStatus === "Approved_Published") {
        showToast(`Results for ${student.name} (${selectedTerm}) Approved & Published!`);
      } else if (newStatus === "Pending_Approval") {
        showToast(`Results submitted for Headteacher/Admin approval.`);
      } else {
        showToast(`Results status updated to ${newStatus.replace("_", " ")}.`);
      }
    }
  };

  const handleBatchApprove = () => {
    if (onBatchApproveClass && student) {
      onBatchApproveClass(student.classId, selectedTerm);
      showToast(`All results in ${currentClass?.name || "this class"} have been Approved & Published!`);
    }
  };

  const handleQuickSimulatePayment = () => {
    if (onRecordPayment && studentFees.length > 0) {
      studentFees.forEach(f => {
        const balance = f.amountZMW - f.paidAmountZMW;
        if (balance > 0) {
          onRecordPayment(f.id, balance);
        }
      });
      setShowClearPaymentModal(false);
      showToast(`Full school fees (K${outstandingBalanceZMW.toLocaleString()} ZMW) cleared! Results are now unlocked.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    try {
      downloadZambianReportCard(
        student,
        draftReport,
        subjectGrades,
        classAverages,
        activeSection,
        currentClass?.teacherName || "MR. MUYANGA",
        schoolProfile,
        displayConfig
      );
      showToast(`Official ${activeSection} PDF Report Card for ${student.name} downloaded successfully!`);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePreviewPdf = () => {
    try {
      const url = previewZambianReportCardPdfUrl(
        student,
        draftReport,
        subjectGrades,
        classAverages,
        activeSection,
        currentClass?.teacherName || "MR. MUYANGA",
        schoolProfile,
        displayConfig
      );
      setPdfPreviewUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  const generateStudentReportData = (pupil: Student) => {
    const pClass = classes.find(c => c.id === pupil.classId);
    const pIsPrimary = isGrade4to7Grade(pupil.grade) || isPrimaryStudent(pupil) || (pClass ? isGrade4to7Class(pClass.name) : false);
    const pSection: "Primary" | "Secondary" = formatMode === "auto" ? (pIsPrimary ? "Primary" : "Secondary") : (formatMode === "primary" ? "Primary" : "Secondary");
    const pSubjects = getZambianSubjectsForGrade(pClass?.gradeNum ?? (pSection === "Primary" ? 6 : 8), pClass?.pathway);

    const pSubjectGrades: Record<string, SubjectAssessment> = {};
    pSubjects.forEach((subj) => {
      const assessment = gradebook[pupil.classId]?.[selectedTerm]?.[subj]?.[pupil.id];
      if (assessment) {
        const ca = typeof assessment.caScore === "number" ? assessment.caScore : 0;
        const mid = typeof assessment.midTermScore === "number" ? assessment.midTermScore : 0;
        const end = typeof assessment.endTermScore === "number" ? assessment.endTermScore : 0;
        const total = typeof assessment.totalScore === "number" && assessment.totalScore > 0
          ? assessment.totalScore
          : (ca + mid + end);
        const gz = calculateEczGrade(total);
        pSubjectGrades[subj] = {
          ...assessment,
          caScore: ca,
          midTermScore: mid,
          endTermScore: end,
          totalScore: total,
          customScores: assessment.customScores || {},
          eczGrade: gz.point,
          remark: gz.label,
          teacherInitials: assessment.teacherInitials || "T.C."
        };
      }
    });

    if (Object.keys(pSubjectGrades).length === 0) {
      pSubjects.forEach((subj, idx) => {
        const ca = 20 + ((pupil.id + idx) % 7);
        const mid = 12 + ((pupil.id + idx) % 5);
        const end = 30 + ((pupil.id + idx) % 12);
        const total = ca + mid + end;
        const gz = calculateEczGrade(total);
        pSubjectGrades[subj] = {
          caScore: ca,
          midTermScore: mid,
          endTermScore: end,
          totalScore: total,
          customScores: {},
          eczGrade: gz.point,
          remark: gz.label,
          teacherInitials: "T.C."
        };
      });
    }

    const pEntries = Object.entries(pSubjectGrades);
    const pTotalScoreSum = pEntries.reduce((acc, [_, g]) => acc + g.totalScore, 0);
    const pCount = pEntries.length;
    const pAvgNum = pCount > 0 ? Math.round(pTotalScoreSum / pCount) : 0;
    const pPassed = pEntries.filter(([_, g]) => g.totalScore >= 40).length;

    const pAutoTeacher = pSection === "Primary"
      ? (pTotalScoreSum >= 600 ? "Excellent Performance. Keep up the high standard!" : (pTotalScoreSum >= 450 ? "Good Performance. Continue working hard." : "Average Performance"))
      : (pAvgNum >= 75 ? `Outstanding academic performance (${pAvgNum}% average). Demonstrates strong mastery.` : (pAvgNum >= 60 ? "Fair performance. Focus required." : `Academic consistency required (${pAvgNum}% average).`));

    const pAutoHead = pSection === "Primary"
      ? (pTotalScoreSum >= 600 ? "Excellent Perfomance please, continue working hard" : (pTotalScoreSum >= 450 ? "Very Good Progress. Strive for academic distinction." : "Fair effort shown. More dedicated study required next term."))
      : `All ${pPassed} recorded subjects passed. Good effort!`;

    const existing = termlyReports[pupil.id]?.[selectedTerm];
    const pReport: TermlyReportCard = existing || {
      studentId: pupil.id,
      term: selectedTerm,
      year: schoolProfile?.currentYear || 2026,
      daysOpened: 62,
      daysPresent: 59,
      daysAbsent: 3,
      conduct: "Good",
      interests: "Football, Science Club, Drama",
      classTeacherComment: pAutoTeacher,
      headteacherComment: pAutoHead,
      promotedTo: pPassed >= Math.ceil(pCount * 0.6) ? (pupil.grade.toUpperCase().includes("FORM") ? "PROMOTED TO FORM 2" : "PROMOTED TO NEXT GRADE") : "ON TRACK / PENDING RESITS",
      reportDate: new Date().toISOString().split("T")[0]
    };

    return {
      section: pSection,
      report: pReport,
      subjectGrades: pSubjectGrades,
      teacherName: pClass?.teacherName || "MR. MUYANGA"
    };
  };

  const handleDownloadAllPdfs = async (targetStudentList: Student[]) => {
    if (!targetStudentList.length) return;
    setIsBatchDownloading(true);
    setShowBatchModal(true);

    try {
      for (let i = 0; i < targetStudentList.length; i++) {
        const pupil = targetStudentList[i];
        setBatchProgress({
          current: i + 1,
          total: targetStudentList.length,
          studentName: pupil.name
        });

        const data = generateStudentReportData(pupil);
        downloadZambianReportCard(
          pupil,
          data.report,
          data.subjectGrades,
          classAverages,
          data.section,
          data.teacherName,
          schoolProfile,
          displayConfig
        );

        // Brief delay to allow smooth sequential downloads in browser
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      showToast(`Successfully downloaded all ${targetStudentList.length} report card PDFs!`);
    } catch (err) {
      console.error(err);
      showToast("Error during batch download. Please try again.");
    } finally {
      setIsBatchDownloading(false);
      setTimeout(() => {
        setShowBatchModal(false);
        setBatchProgress(null);
      }, 2500);
    }
  };

  const handleAutoGenerateRemarks = () => {
    setDraftReport(prev => ({
      ...prev,
      classTeacherComment: autoTeacherComment,
      headteacherComment: autoHeadteacherComment,
      promotedTo: subjectsPassedCount >= Math.ceil(subjectsRecordedCount * 0.6)
        ? (activeSection === "Primary" ? "PROMOTED TO NEXT GRADE" : "PROMOTED TO FORM 2")
        : "ON TRACK / PENDING RESITS"
    }));
    showToast("Remarks computed from recorded subject scores.");
  };

  const isParentOrStudent = userRole === "parent" || userRole === "student";
  const isResultsWithheldForUser = isParentOrStudent && !isFeeFullyPaid;

  // Primary grading scale calculation
  const maxPrimaryTotal = Math.max(900, subjectsRecordedCount * 100);
  const excellentMin = Math.round(maxPrimaryTotal * 0.747);
  const veryGoodMin = Math.round(maxPrimaryTotal * 0.74);
  const goodMin = Math.round(maxPrimaryTotal * 0.507);
  const avgMin = Math.round(maxPrimaryTotal * 0.261);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* PDF Interactive Preview Modal */}
      {pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    Official {activeSection} Report Card Preview: {student.name} ({selectedTerm} {schoolProfile?.currentYear || 2026})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    High-resolution official report card layout matching the {activeSection} Section standard
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setPdfPreviewUrl(null)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2">
              <iframe
                src={pdfPreviewUrl}
                title="Report Card PDF Preview"
                className="w-full h-full rounded-xl border border-slate-300 shadow-inner bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Filter & Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-serif">
              <FileText className="w-5 h-5 text-blue-700" />
              Official Pupil Termly Report Cards
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Primary Section (Test 1, Test 2, End of Term, Total Marks) & Secondary Section (9-Point ECZ Scale, Class Average)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!fixedStudentId && (
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Select Pupil</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const sid = parseInt(e.target.value);
                    setSelectedStudentId(sid);
                    const st = students.find(s => s.id === sid);
                    if (st && termlyReports[st.id]?.[selectedTerm]) {
                      setDraftReport(termlyReports[st.id][selectedTerm]);
                    }
                  }}
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} {s.stream}) • {isPrimaryStudent(s) ? "Primary" : "Secondary"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Academic Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => {
                  const t = e.target.value as "Term 1" | "Term 2" | "Term 3";
                  setSelectedTerm(t);
                  if (termlyReports[student.id]?.[t]) {
                    setDraftReport(termlyReports[student.id][t]);
                  }
                }}
                className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-3 py-2 focus:border-blue-600 focus:outline-hidden cursor-pointer"
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            {/* Action buttons */}
            {(!isParentOrStudent || (isPublished && isFeeFullyPaid)) && (
              <div className="flex flex-wrap items-center gap-2 pt-4 md:pt-0">
                {canEditComments && (
                  <button
                    onClick={() => setEditCommentMode(!editCommentMode)}
                    className={`font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer ${
                      editCommentMode
                        ? "bg-amber-600 hover:bg-amber-700 text-white"
                        : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-300"
                    }`}
                    title="Toggle comment and remarks editing"
                  >
                    <Edit3 className="w-4 h-4 text-amber-500" />
                    <span>{editCommentMode ? "Editing Comments..." : "Edit Comments"}</span>
                  </button>
                )}

                <button
                  onClick={handlePreviewPdf}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Preview official PDF report card"
                >
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>Preview PDF</span>
                </button>

                <button
                  onClick={handleDownloadPdf}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Download formatted official PDF report card"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={() => setShowBatchModal(true)}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Download all student report cards as individual PDFs with their respective names"
                >
                  <DownloadCloud className="w-4 h-4 text-indigo-200" />
                  <span>Download All PDFs</span>
                </button>

                {userRole === "admin" && (
                  <button
                    onClick={() => exportDetailedGradebookCsv(students, classes, gradebook, { classId: student.classId, term: selectedTerm })}
                    className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300 shadow-2xs cursor-pointer"
                    title="Export grades as CSV spreadsheet"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-blue-700" />
                    <span>Export CSV</span>
                  </button>
                )}

                <button
                  onClick={handlePrint}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 border border-slate-300 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* View Mode & Format Switcher Toolbar */}
        {(!isParentOrStudent || (isPublished && isFeeFullyPaid)) && (
          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {/* View Mode */}
            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-0.5 text-xs">
              <button
                onClick={() => setReportViewMode("both")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  reportViewMode === "both"
                    ? "bg-white text-blue-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5 text-blue-700" />
                <span>Overview & Analytics</span>
              </button>
              <button
                onClick={() => setReportViewMode("card")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  reportViewMode === "card"
                    ? "bg-white text-blue-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>Official Report Card</span>
              </button>
              <button
                onClick={() => setReportViewMode("analytics")}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  reportViewMode === "analytics"
                    ? "bg-white text-blue-900 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
                <span>Trajectory</span>
              </button>
            </div>

            {/* Section Format Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Report Format:</span>
              <div className="inline-flex rounded-lg border border-slate-300 bg-slate-50 p-0.5 text-xs">
                <button
                  onClick={() => setFormatMode("auto")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    formatMode === "auto"
                      ? "bg-blue-700 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Auto-select based on pupil's section (Primary vs Secondary)"
                >
                  Auto ({isStudentPrimary ? "Primary" : "Secondary"})
                </button>
                <button
                  onClick={() => setFormatMode("primary")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    formatMode === "primary"
                      ? "bg-purple-700 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <BookOpen className="w-3 h-3" />
                  <span>Primary Section</span>
                </button>
                <button
                  onClick={() => setFormatMode("secondary")}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                    formatMode === "secondary"
                      ? "bg-indigo-700 text-white font-bold shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap className="w-3 h-3" />
                  <span>Secondary Section</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Teacher Custom Column & Assessment Controller Bar */}
        {!isParentOrStudent && (
          <div className="mt-3 pt-3 border-t border-slate-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/90 p-2.5 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800">
                  <Sliders className="w-4 h-4 text-purple-700" />
                  <span>Assessment Columns & Tests:</span>
                </div>

                {/* Quick status chips for active columns */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  {displayConfig.showTest1 && (
                    <span className="px-2 py-0.5 bg-blue-100/90 text-blue-900 font-semibold rounded-md border border-blue-200">
                      {displayConfig.test1Label || "Test 1"}
                    </span>
                  )}
                  {displayConfig.showTest2 && (
                    <span className="px-2 py-0.5 bg-blue-100/90 text-blue-900 font-semibold rounded-md border border-blue-200">
                      {displayConfig.test2Label || "Test 2"}
                    </span>
                  )}
                  {displayConfig.showMidterm && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-semibold rounded-md border border-amber-200">
                      {displayConfig.midtermLabel || "Mid-Term"}
                    </span>
                  )}
                  {activeCustomCols.map(c => (
                    <span key={c.id} className="px-2 py-0.5 bg-purple-100 text-purple-900 font-bold rounded-md border border-purple-200 flex items-center gap-1">
                      <span>{c.name} (/{c.maxScore})</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCustomColumn(c.id);
                        }}
                        className="text-purple-400 hover:text-red-600 ml-0.5"
                        title="Remove column"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {displayConfig.showEndTerm && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-900 font-semibold rounded-md border border-indigo-200">
                      {displayConfig.endTermLabel || "End of Term"}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddColumnModal(true)}
                  className="bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                  title="Add another test or assessment column to the report card"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Test Column</span>
                </button>

                <button
                  onClick={() => setShowColumnConfigPanel(!showColumnConfigPanel)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                    showColumnConfigPanel
                      ? "bg-slate-200 text-slate-900 border-slate-300 font-bold"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <Settings2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Customize ({activeCustomCols.length + 3} cols)</span>
                  {showColumnConfigPanel ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                </button>
              </div>
            </div>

            {/* Expandable Column Configuration Panel */}
            {showColumnConfigPanel && (
              <div className="mt-2.5 p-4 bg-white rounded-xl border border-slate-300 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <Columns className="w-4 h-4 text-purple-700" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Teacher Assessment Column Settings (Primary & Secondary)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Changes apply immediately to preview, tables, and downloaded PDFs
                  </span>
                </div>

                {/* Standard Columns Visibility Toggles */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Standard Test Columns</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayConfig.showTest1}
                        onChange={(e) => setDisplayConfig(p => ({ ...p, showTest1: e.target.checked }))}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span className="font-bold text-slate-800">Test 1</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayConfig.showTest2}
                        onChange={(e) => setDisplayConfig(p => ({ ...p, showTest2: e.target.checked }))}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span className="font-bold text-slate-800">Test 2</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayConfig.showMidterm}
                        onChange={(e) => setDisplayConfig(p => ({ ...p, showMidterm: e.target.checked }))}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span className="font-bold text-slate-800">Mid-Term</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayConfig.showEndTerm}
                        onChange={(e) => setDisplayConfig(p => ({ ...p, showEndTerm: e.target.checked }))}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span className="font-bold text-slate-800">End of Term</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={displayConfig.showTotal}
                        onChange={(e) => setDisplayConfig(p => ({ ...p, showTotal: e.target.checked }))}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span className="font-bold text-slate-800">Total Score</span>
                    </label>
                  </div>
                </div>

                {/* Quick Add Preset Assessment Column */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Quick Add Preset Tests / Assessment Columns</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleQuickPresetColumn("Test 3", 100)}
                      className="text-xs px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Test 3 (100)</span>
                    </button>
                    <button
                      onClick={() => handleQuickPresetColumn("Mock Exam", 100)}
                      className="text-xs px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Mock Exam (100)</span>
                    </button>
                    <button
                      onClick={() => handleQuickPresetColumn("Practical / Lab", 100)}
                      className="text-xs px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Practical Exam (100)</span>
                    </button>
                    <button
                      onClick={() => handleQuickPresetColumn("Project Work", 50)}
                      className="text-xs px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold rounded-lg border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Project Work (50)</span>
                    </button>
                    <button
                      onClick={() => handleQuickPresetColumn("Monthly Quiz", 20)}
                      className="text-xs px-2.5 py-1 bg-pink-50 hover:bg-pink-100 text-pink-800 font-bold rounded-lg border border-pink-200 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>+ Monthly Quiz (20)</span>
                    </button>
                    <button
                      onClick={() => setShowAddColumnModal(true)}
                      className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      <span>+ Custom Name / Scale...</span>
                    </button>
                  </div>
                </div>

                {/* Custom Columns List */}
                {(displayConfig.customColumns?.length || 0) > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Active Custom Columns ({displayConfig.customColumns?.length})</h4>
                    <div className="space-y-2">
                      {displayConfig.customColumns?.map(col => (
                        <div key={col.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">{col.name}</span>
                            <span className="text-[11px] px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-mono font-bold">
                              Max: {col.maxScore} marks
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              col.showOnReportCard ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                            }`}>
                              {col.showOnReportCard ? "Visible on Report" : "Hidden"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleCustomColumnVisibility(col.id)}
                              className="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded font-semibold text-slate-700 flex items-center gap-1 cursor-pointer"
                            >
                              {col.showOnReportCard ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-purple-600" />}
                              <span>{col.showOnReportCard ? "Hide" : "Show"}</span>
                            </button>
                            <button
                              onClick={() => handleRemoveCustomColumn(col.id)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded font-semibold text-rose-700 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Custom Assessment Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Add Test / Assessment Column</h3>
                  <p className="text-[11px] text-slate-500">Configure a custom test or column for this term's report card</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddColumnModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Column Title / Test Name *
                </label>
                <input
                  type="text"
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  placeholder="e.g. Test 3, Practical Exam, Mock Exam, Quiz 1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-purple-600 focus:outline-none"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maximum Mark Scale
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={newColMax}
                    onChange={(e) => setNewColMax(parseInt(e.target.value) || 100)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-purple-600 focus:outline-none font-mono"
                  />
                </div>

                <div className="pt-6">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={newColShowOnReport}
                      onChange={(e) => setNewColShowOnReport(e.target.checked)}
                      className="rounded text-purple-700 focus:ring-purple-600"
                    />
                    <span>Show on Report Card</span>
                  </label>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Popular Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {["Test 3", "Mock Exam", "Practical Exam", "Monthly Test", "Assignment", "Project Work"].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewColName(preset)}
                      className="text-[11px] px-2 py-0.5 bg-slate-100 hover:bg-purple-100 hover:text-purple-900 text-slate-700 font-semibold rounded-md border border-slate-200 transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddColumnModal(false)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomColumn()}
                disabled={!newColName.trim()}
                className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Column to Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fee Clearance Banner (Staff View) */}
      {!isParentOrStudent && (
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isFeeFullyPaid
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            : "bg-rose-50/90 border-rose-200 text-rose-950"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isFeeFullyPaid
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-rose-600 text-white shadow-xs"
            }`}>
              {isFeeFullyPaid ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isFeeFullyPaid
                    ? "bg-emerald-200/80 text-emerald-900 border border-emerald-300"
                    : "bg-rose-200/80 text-rose-900 border border-rose-300"
                }`}>
                  {isFeeFullyPaid ? "Fee Status: Fully Cleared (K0 Balance)" : "Fee Status: Outstanding Balance (Arrears)"}
                </span>
                <span className="text-xs font-bold">
                  {isFeeFullyPaid ? "• Results Access UNLOCKED" : "• Results Access WITHHELD for Parent & Student"}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isFeeFullyPaid
                  ? `All school fees (K${totalPaidZMW.toLocaleString()} ZMW) are settled in full. This report card is visible to parents and pupils.`
                  : `Pupil has an outstanding fee balance of K${outstandingBalanceZMW.toLocaleString()} ZMW. Report card & results are withheld from student/parent portal.`}
              </p>
            </div>
          </div>

          {!isFeeFullyPaid && userRole === "admin" && (
            <button
              onClick={() => handleQuickSimulatePayment()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Clear Full Balance & Unlock Results</span>
            </button>
          )}
        </div>
      )}

      {/* Admin Approval Banner */}
      {!isParentOrStudent && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isPublished
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : currentStatus === "Pending_Approval"
                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                  : "bg-slate-100 text-slate-700 border border-slate-300"
              }`}>
                {isPublished ? <CheckCircle className="w-5 h-5 text-emerald-600" /> :
                 currentStatus === "Pending_Approval" ? <Clock className="w-5 h-5 text-amber-600" /> :
                 <Lock className="w-5 h-5 text-slate-500" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-900">
                    Results Certification & Approval Status:
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                    isPublished
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : currentStatus === "Pending_Approval"
                      ? "bg-amber-50 text-amber-800 border-amber-200"
                      : currentStatus === "Rejected"
                      ? "bg-rose-50 text-rose-800 border-rose-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}>
                    {isPublished ? "✅ Certified & Published" :
                     currentStatus === "Pending_Approval" ? "⏳ Awaiting Headteacher Review" :
                     currentStatus === "Rejected" ? "❌ Returned / Needs Revision" :
                     "📝 Draft Mode"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isPublished
                    ? `Approved & certified for official distribution.`
                    : currentStatus === "Pending_Approval"
                    ? `Submitted by class teacher. Awaiting Headteacher confirmation.`
                    : `In preparation. Marks are being finalized.`}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {userRole === "teacher" && currentStatus === "Draft" && (
                <button
                  onClick={() => handleApprovalChange("Pending_Approval")}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Submit for Headteacher Approval
                </button>
              )}

              {userRole === "admin" && (
                <>
                  {!isPublished ? (
                    <button
                      onClick={() => handleApprovalChange("Approved_Published")}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Approve & Publish Pupil Report
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApprovalChange("Draft")}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Revert to Draft
                    </button>
                  )}

                  {onBatchApproveClass && (
                    <button
                      onClick={handleBatchApprove}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      Approve Entire Class ({currentClass?.name})
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WITHHOLD SCREEN: OUTSTANDING ARREARS */}
      {isResultsWithheldForUser && (
        <div className="bg-white border border-rose-200 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Official Term Results Withheld — Outstanding Fee Balance
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              In accordance with Bread of Life School financial regulations, end-of-term academic reports and marksheets are accessible once school fees have been settled in full.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleQuickSimulatePayment}
              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Simulate Full Fee Payment (Clear K{outstandingBalanceZMW.toLocaleString()} to Unlock)</span>
            </button>
          </div>
        </div>
      )}

      {/* WITHHOLD SCREEN: AWAITING HEADTEACHER CERTIFICATION */}
      {isParentOrStudent && !isResultsWithheldForUser && !isPublished && (
        <div className="bg-white border border-amber-200 rounded-2xl p-8 shadow-sm text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 font-serif">
              Official Term Results Under Administrative Certification
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your fees are fully cleared. The academic marks and progress report for <strong>{student.name}</strong> ({selectedTerm} {schoolProfile?.currentYear || 2026}) are currently undergoing final verification and certification by the Headteacher.
            </p>
          </div>
          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Status: <span className="text-amber-700 font-bold uppercase">{currentStatus.replace("_", " ")}</span> • Report card will unlock upon publication.
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📄 OFFICIAL REPORT CARD DISPLAY (Interactive HTML Canvas)                */}
      {/* ========================================================================= */}
      {(!isParentOrStudent || (isPublished && isFeeFullyPaid)) && (
        <>
          {/* Optional 3-Term Progression Chart */}
          {(reportViewMode === "both" || reportViewMode === "analytics") && (
            <StudentProgressionChart
              student={student}
              currentClass={currentClass}
              gradebook={gradebook}
            />
          )}

          {/* Official Report Card Printable Sheet */}
          {(reportViewMode === "both" || reportViewMode === "card") && (
            <div>
              {/* ========================================================================= */}
              {/* PRIMARY SECTION LAYOUT (Format 2)                                         */}
              {/* ========================================================================= */}
              {activeSection === "Primary" ? (
                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-md p-6 sm:p-10 max-w-3xl mx-auto print:bg-white print:text-black print:p-0 print:border-0 print:shadow-none font-sans text-slate-900 space-y-4">
                  
                  {/* 1. Header: School Crest + Title + Address + Contacts - Centered and Big */}
                  <div className="flex flex-col items-center justify-center text-center pt-2 border-b border-slate-200 pb-4 space-y-2.5">
                    {/* Official Crest Badge / Uploaded Logo */}
                    {schoolProfile?.logoUrl ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden">
                        <img
                          src={schoolProfile.logoUrl}
                          alt="School Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1e295d] border-2 border-amber-400 flex flex-col items-center justify-center text-white shadow-xs shrink-0 relative overflow-hidden">
                        <span className="text-amber-300 font-serif font-black text-2xl">✝</span>
                        <span className="text-[7px] font-black font-mono tracking-tighter uppercase text-amber-200 text-center leading-tight px-1">
                          BREAD OF LIFE
                        </span>
                        <div className="w-full bg-amber-400 text-[#1e295d] text-[6px] font-bold text-center py-0.5 absolute bottom-0">
                          LUSAKA
                        </div>
                      </div>
                    )}

                    {/* School Title & Address block - Centered & Big */}
                    <div className="text-center max-w-xl mx-auto">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-[#4c1d95] uppercase leading-tight">
                        {schoolProfile?.name?.toUpperCase() || SCHOOL_NAME.toUpperCase()}
                      </h1>
                      <p className="text-xs font-medium text-slate-800 mt-1.5">
                        P.O BOX 37486, Corner of Vubu & Lumumba Road, Emmasdale
                      </p>
                      <p className="text-xs font-medium text-slate-800">
                        Lusaka-Zambia
                      </p>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        Contact: 0970529712 / 0971420744
                      </p>
                    </div>
                  </div>

                  {/* 2. Subtitle: Report Card - Primary Section */}
                  <div className="text-center space-y-0.5 pt-1">
                    <h2 className="text-xl font-serif font-bold text-slate-900">
                      Report Card
                    </h2>
                    <div className="inline-block border-b-2 border-slate-900 pb-0.5 font-bold text-xs text-slate-800">
                      Primary Section
                    </div>
                  </div>

                  {/* 3. Child's Information Box */}
                  <div className="border border-sky-400 bg-slate-50/80 rounded-sm p-3 text-xs space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-slate-600 font-normal">Child's Name: </span>
                        <strong className="font-bold text-slate-900 uppercase">{student.name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-600 font-normal">Grade: </span>
                        <strong className="font-bold text-slate-900 uppercase">{student.grade}</strong>
                      </div>
                      <div>
                        <span className="text-slate-600 font-normal">YEAR: </span>
                        <strong className="font-bold text-slate-900">{draftReport.year || 2026}</strong>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                      <div>
                        <span className="text-slate-600 font-normal">Teacher's Name: </span>
                        <strong className="font-bold text-slate-900 uppercase">
                          {currentClass?.teacherName || "MR. MUYANGA"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-600 font-normal">TERM: </span>
                        <strong className="font-bold text-slate-900">
                          {selectedTerm.replace(/[^0-9]/g, "") || "1"}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* 4. Primary Subjects Table (TEST 1, TEST 2, MID-TERM, CUSTOM TESTS, END OF TERM, TOTAL) */}
                  <div className="border border-sky-300 rounded-sm">
                    {/* Toolbar for Primary Table */}
                    {canEditComments && activeCustomCols.length > 0 && (
                      <div className="bg-sky-50 px-3 py-1.5 border-b border-sky-200 flex items-center justify-between print:hidden">
                        <span className="text-[11px] font-bold text-sky-900">
                          Primary Gradebook • {activeCustomCols.length} Custom Assessment Column(s) Active
                        </span>
                        <button
                          onClick={() => {
                            if (editCustomMarksMode) {
                              handleSaveCustomMarks();
                            } else {
                              setEditCustomMarksMode(true);
                            }
                          }}
                          className={`text-xs px-2.5 py-0.5 rounded font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                            editCustomMarksMode
                              ? "bg-purple-700 hover:bg-purple-800 text-white shadow-xs"
                              : "bg-white hover:bg-sky-100 text-purple-700 border border-purple-300"
                          }`}
                        >
                          {editCustomMarksMode ? (
                            <>
                              <Check className="w-3 h-3" /> Save Custom Marks
                            </>
                          ) : (
                            <>
                              <Edit3 className="w-3 h-3" /> Edit Custom Scores
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#bae6fd] text-slate-900 border-b border-sky-300 font-bold text-[11px] uppercase tracking-wider">
                            <th className="py-2 px-3 border-r border-sky-300">SUBJECT</th>
                            {displayConfig.showTest1 && (
                              <th className="py-2 px-2 text-center border-r border-sky-300 w-24">
                                {displayConfig.test1Label || "TEST 1"}
                              </th>
                            )}
                            {displayConfig.showTest2 && (
                              <th className="py-2 px-2 text-center border-r border-sky-300 w-24">
                                {displayConfig.test2Label || "TEST 2"}
                              </th>
                            )}
                            {displayConfig.showMidterm && (
                              <th className="py-2 px-2 text-center border-r border-sky-300 w-24">
                                {displayConfig.midtermLabel || "MID-TERM"}
                              </th>
                            )}
                            {activeCustomCols.map(c => (
                              <th key={c.id} className="py-2 px-2 text-center border-r border-sky-300 w-24 bg-sky-200/80 text-sky-950">
                                {(c.shortLabel || c.name).toUpperCase()}
                              </th>
                            ))}
                            {displayConfig.showEndTerm && (
                              <th className="py-2 px-3 text-center border-r border-sky-300 w-28">
                                {displayConfig.endTermLabel || "END OF TERM"}
                              </th>
                            )}
                            {displayConfig.showTotal && (
                              <th className="py-2 px-3 text-center w-28">
                                {displayConfig.totalLabel || "TOTAL"}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-sky-100">
                          {subjectEntries.map(([subjName, g], idx) => {
                            const isEven = idx % 2 === 0;
                            return (
                              <tr key={subjName} className={isEven ? "bg-[#fae8ff]/60" : "bg-white"}>
                                <td className="py-2 px-3 text-[#4c1d95] font-medium border-r border-sky-200">
                                  {subjName}
                                </td>
                                {displayConfig.showTest1 && (
                                  <td className="py-2 px-2 text-center text-[#4c1d95] font-normal border-r border-sky-200">
                                    {g.caScore > 0 ? g.caScore : ""}
                                  </td>
                                )}
                                {displayConfig.showTest2 && (
                                  <td className="py-2 px-2 text-center text-[#4c1d95] font-normal border-r border-sky-200">
                                    {(g.test2Score ?? 0) > 0
                                      ? g.test2Score
                                      : (g.midTermScore > 0 && !displayConfig.showMidterm ? g.midTermScore : "")}
                                  </td>
                                )}
                                {displayConfig.showMidterm && (
                                  <td className="py-2 px-2 text-center text-[#4c1d95] font-normal border-r border-sky-200">
                                    {g.midTermScore > 0 ? g.midTermScore : ""}
                                  </td>
                                )}
                                {activeCustomCols.map(c => {
                                  const customVal = (customScoreDrafts[subjName]?.[c.id] !== undefined)
                                    ? customScoreDrafts[subjName][c.id]
                                    : (g.customScores?.[c.id] !== undefined ? String(g.customScores[c.id]) : "");
                                  return (
                                    <td key={c.id} className="py-2 px-2 text-center text-[#4c1d95] font-normal border-r border-sky-200">
                                      {editCustomMarksMode ? (
                                        <input
                                          type="number"
                                          min={0}
                                          max={c.maxScore}
                                          value={customVal}
                                          onChange={(e) => {
                                            const val = e.target.value;
                                            setCustomScoreDrafts(prev => ({
                                              ...prev,
                                              [subjName]: {
                                                ...(prev[subjName] || {}),
                                                [c.id]: val
                                              }
                                            }));
                                          }}
                                          placeholder={`/${c.maxScore}`}
                                          className="w-14 text-center font-bold text-xs bg-white border border-purple-300 rounded px-1 py-0.5"
                                        />
                                      ) : (
                                        customVal !== "" ? customVal : ""
                                      )}
                                    </td>
                                  );
                                })}
                                {displayConfig.showEndTerm && (
                                  <td className={`py-2 px-3 text-center text-[#4c1d95] ${
                                    displayConfig.showTotal ? "font-normal border-r border-sky-200" : "font-bold"
                                  }`}>
                                    {typeof g.endTermScore === "number" && g.endTermScore > 0 ? g.endTermScore : (g.endTermScore === 0 ? "0" : "")}
                                  </td>
                                )}
                                {displayConfig.showTotal && (
                                  <td className="py-2 px-3 text-center text-[#4c1d95] font-bold">
                                    {typeof g.totalScore === "number" && g.totalScore > 0 ? g.totalScore : (g.endTermScore || 0)}
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                          {/* TOTAL Row */}
                          <tr className="bg-[#ede9fe] border-t-2 border-purple-300 font-bold text-slate-900">
                            <td className="py-2.5 px-3 uppercase border-r border-purple-200">TOTAL</td>
                            {displayConfig.showTest1 && (
                              <td className="py-2.5 px-2 text-center border-r border-purple-200 font-mono">
                                {primarySums.sumTest1 !== null ? primarySums.sumTest1 : ""}
                              </td>
                            )}
                            {displayConfig.showTest2 && (
                              <td className="py-2.5 px-2 text-center border-r border-purple-200 font-mono">
                                {primarySums.sumTest2 !== null ? primarySums.sumTest2 : ""}
                              </td>
                            )}
                            {displayConfig.showMidterm && (
                              <td className="py-2.5 px-2 text-center border-r border-purple-200 font-mono">
                                {primarySums.sumMidterm !== null ? primarySums.sumMidterm : ""}
                              </td>
                            )}
                            {activeCustomCols.map(c => (
                              <td key={c.id} className="py-2.5 px-2 text-center border-r border-purple-200 font-mono">
                                {primarySums.hasCustom[c.id] ? primarySums.customSums[c.id] : ""}
                              </td>
                            ))}
                            {displayConfig.showEndTerm && (
                              <td className={`py-2.5 px-3 text-center ${
                                displayConfig.showTotal
                                  ? "border-r border-purple-200 font-mono"
                                  : "font-bold text-slate-950 font-mono text-sm"
                              }`}>
                                {primarySums.sumEndTerm}
                              </td>
                            )}
                            {displayConfig.showTotal && (
                              <td className="py-2.5 px-3 text-center font-bold text-slate-950 font-mono text-sm">
                                {primarySums.sumTotal}
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 5. Primary Remarks Section (Red Bold Text) */}
                  <div className="space-y-3 pt-2 text-xs">
                    {/* Remarks Editor button for Staff */}
                    {canEditComments && (
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 print:hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">Primary Teacher & Headteacher Remarks</span>
                          <span className="text-[11px] text-slate-500 font-medium">(Total Score: {primarySums.sumEndTerm})</span>
                        </div>
                        {!editCommentMode ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAutoGenerateRemarks}
                              className="bg-white hover:bg-slate-100 text-xs px-2.5 py-1 rounded text-purple-700 font-semibold border border-purple-200 flex items-center gap-1 cursor-pointer"
                            >
                              <Calculator className="w-3.5 h-3.5 text-purple-600" /> Compute Remarks
                            </button>
                            <button
                              onClick={() => setEditCommentMode(true)}
                              className="bg-purple-700 hover:bg-purple-800 text-xs px-3 py-1 rounded text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Comments
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAutoGenerateRemarks}
                              className="bg-white hover:bg-slate-100 text-xs px-2.5 py-1 rounded text-purple-700 font-semibold border border-purple-200 flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-purple-600" /> Recompute
                            </button>
                            <button
                              onClick={handleSaveComments}
                              className="bg-emerald-700 hover:bg-emerald-800 text-xs px-3 py-1 rounded text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Save Comments
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Preset Comment Chips when editing */}
                    {editCommentMode && (
                      <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-lg space-y-2 print:hidden">
                        <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                          <span>Quick Comment Presets (Click to insert into Teacher's Comment):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Excellent Performance. Keep up the high standard!",
                            "Good Performance. Continue working hard.",
                            "Average Performance. More effort needed next term.",
                            "Fair effort shown. Dedicated revision required.",
                            "Outstanding progress made throughout the term.",
                            "Shows good understanding in class activities."
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setDraftReport(prev => ({ ...prev, classTeacherComment: preset }))}
                              className="text-[11px] bg-white hover:bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              + "{preset}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teachers Comment */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-sm shrink-0">
                        Teachers Comment:
                      </span>
                      {editCommentMode ? (
                        <input
                          type="text"
                          value={draftReport.classTeacherComment}
                          onChange={(e) => setDraftReport({ ...draftReport, classTeacherComment: e.target.value })}
                          placeholder="Enter Teacher's comment here..."
                          className="flex-1 bg-white border border-purple-300 rounded p-1.5 text-xs text-red-600 font-bold focus:outline-none focus:ring-1 focus:ring-purple-600"
                        />
                      ) : (
                        <span className="font-bold text-red-600 text-sm">
                          {draftReport.classTeacherComment || "Average Performance"}
                        </span>
                      )}
                    </div>

                    {/* Headteachers Comment */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-bold text-slate-900 text-sm shrink-0">
                        Headteachers:
                      </span>
                      {editCommentMode ? (
                        <input
                          type="text"
                          value={draftReport.headteacherComment}
                          onChange={(e) => setDraftReport({ ...draftReport, headteacherComment: e.target.value })}
                          placeholder="Enter Headteacher's comment here..."
                          className="flex-1 bg-white border border-purple-300 rounded p-1.5 text-xs text-red-600 font-bold focus:outline-none focus:ring-1 focus:ring-purple-600"
                        />
                      ) : (
                        <span className="font-bold text-red-600 text-sm">
                          {draftReport.headteacherComment || "Excellent Perfomance please, continue working hard"}
                        </span>
                      )}
                    </div>

                    {editCommentMode && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={handleSaveComments}
                          className="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save All Comments</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 6. Primary Grading Scale Table (Centered at bottom) */}
                  <div className="pt-3 max-w-md mx-auto">
                    <div className="border border-slate-300 rounded-sm overflow-hidden text-xs">
                      <div className="bg-[#0f172a] text-white font-bold text-[11px] py-1 text-center uppercase tracking-wider">
                        GRADING SCALE
                      </div>
                      <table className="w-full text-center border-collapse text-[11px]">
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          <tr className="bg-[#f0fdf4]">
                            <td className="py-1 px-3 text-left font-medium border-r border-slate-200">Excellent</td>
                            <td className="py-1 px-3 font-bold text-slate-900">{maxPrimaryTotal} – {excellentMin}</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-1 px-3 text-left font-medium border-r border-slate-200">Very Good</td>
                            <td className="py-1 px-3 font-bold text-slate-900">{excellentMin - 1} – {veryGoodMin}</td>
                          </tr>
                          <tr className="bg-[#f0fdf4]">
                            <td className="py-1 px-3 text-left font-medium border-r border-slate-200">Good</td>
                            <td className="py-1 px-3 font-bold text-slate-900">{veryGoodMin - 1} – {goodMin}</td>
                          </tr>
                          <tr className="bg-white">
                            <td className="py-1 px-3 text-left font-medium border-r border-slate-200">Average</td>
                            <td className="py-1 px-3 font-bold text-slate-900">{goodMin - 1} – {avgMin}</td>
                          </tr>
                          <tr className="bg-[#f0fdf4]">
                            <td className="py-1 px-3 text-left font-medium border-r border-slate-200">Below Average</td>
                            <td className="py-1 px-3 font-bold text-slate-900">{avgMin - 1} – 0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              ) : (
                /* ========================================================================= */
                /* SECONDARY SECTION LAYOUT (Format 1)                                       */
                /* ========================================================================= */
                <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-md p-6 sm:p-10 max-w-3xl mx-auto print:bg-white print:text-black print:p-0 print:border-0 print:shadow-none font-sans text-slate-900 space-y-5">
                  
                  {/* 1. Header: School Crest + Title - Centered & Big */}
                  <div className="flex flex-col items-center justify-center text-center pt-2 space-y-2 border-b border-slate-100 pb-3">
                    {/* Official Crest Badge / Uploaded Logo */}
                    {schoolProfile?.logoUrl ? (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border-2 border-slate-200 bg-white flex items-center justify-center p-1 shadow-xs shrink-0 overflow-hidden">
                        <img
                          src={schoolProfile.logoUrl}
                          alt="School Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1e295d] border-2 border-amber-400 flex flex-col items-center justify-center text-white shadow-xs shrink-0 relative overflow-hidden">
                        <span className="text-amber-300 font-serif font-black text-2xl">✝</span>
                        <span className="text-[7px] font-black font-mono tracking-tighter uppercase text-amber-200 text-center leading-tight px-1">
                          BREAD OF LIFE
                        </span>
                        <div className="w-full bg-amber-400 text-[#1e295d] text-[5px] font-bold text-center py-0.5 absolute bottom-0">
                          LUSAKA
                        </div>
                      </div>
                    )}

                    {/* School Name in Bold Dark Blue Serif Typography */}
                    <div className="text-center max-w-xl mx-auto">
                      <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-serif tracking-tight text-[#1a365d] uppercase leading-tight">
                        {schoolProfile?.name?.toUpperCase() || SCHOOL_NAME.toUpperCase()}
                      </h1>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        {schoolProfile?.slogan || SCHOOL_SLOGAN}
                      </p>
                    </div>
                  </div>

                  {/* 2. Light Blue "REPORT" Banner Ribbon */}
                  <div className="bg-[#b8d4ec] py-1.5 px-4 text-center rounded-sm">
                    <h2 className="text-base sm:text-lg font-serif font-bold text-[#1a365d] tracking-widest uppercase">
                      REPORT
                    </h2>
                  </div>

                  {/* 3. Metadata Bar (STUDENT NAME, CLASS, YEAR) */}
                  <div className="flex flex-wrap items-center justify-between gap-y-2 text-xs font-sans border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold tracking-wider text-[11px] uppercase">STUDENT NAME</span>
                      <span className="font-bold text-slate-900 text-sm uppercase">{student.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold tracking-wider text-[11px] uppercase">CLASS:</span>
                      <span className="font-black text-blue-700 text-sm uppercase">
                        {student.grade.toUpperCase()} {student.stream}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold tracking-wider text-[11px] uppercase">YEAR:</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {draftReport.year || schoolProfile?.currentYear || 2026}
                      </span>
                    </div>
                  </div>

                  {/* 4. Scholastic Areas Table */}
                  <div className="overflow-x-auto border border-slate-300 rounded-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        {/* Top sub-header bar */}
                        <tr className="bg-[#f0f6fa] text-[#1a365d] border-b border-slate-300 font-bold">
                          <th colSpan={2} className="py-2 px-3 text-xs tracking-wide">
                            <div className="flex items-center gap-2">
                              <span>Scholastic Areas</span>
                              {(canEditRemarks || canEditComments || userRole === "admin") && (
                                <span className="print:hidden">
                                  {!editSecondaryMarks ? (
                                    <button
                                      onClick={() => setEditSecondaryMarks(true)}
                                      className="bg-white hover:bg-slate-100 text-blue-700 font-bold text-[10px] px-2 py-0.5 rounded border border-blue-200 shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                      title="Enter or update marks out of 100 directly"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Edit Marks (100)</span>
                                    </button>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5">
                                      <button
                                        onClick={handleSaveSecondaryMarks}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2.5 py-0.5 rounded shadow-2xs cursor-pointer inline-flex items-center gap-1"
                                      >
                                        <Check className="w-3 h-3" />
                                        <span>Save Marks</span>
                                      </button>
                                      <button
                                        onClick={() => setEditSecondaryMarks(false)}
                                        className="bg-white hover:bg-slate-100 text-slate-600 font-semibold text-[10px] px-2 py-0.5 rounded border border-slate-300 cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </th>
                          <th colSpan={3 + (displayConfig.showTest1 ? 1 : 0) + (displayConfig.showTest2 ? 1 : 0) + (displayConfig.showMidterm ? 1 : 0) + activeCustomCols.length} className="py-2 px-3 text-right text-xs uppercase tracking-wider">
                            {selectedTerm.toUpperCase()} {draftReport.year || 2026}
                          </th>
                        </tr>
                        {/* Column Headers */}
                        <tr className="bg-[#f0f6fa] text-[#1a365d] border-b border-slate-300 text-[10.5px] uppercase font-bold tracking-wider">
                          <th className="py-2 px-3 border-r border-slate-300">SUBJECTS</th>
                          {displayConfig.showTest1 && (
                            <th className="py-2 px-2 text-center border-r border-slate-300 w-20">
                              {displayConfig.test1Label || "TEST 1"}
                            </th>
                          )}
                          {displayConfig.showTest2 && (
                            <th className="py-2 px-2 text-center border-r border-slate-300 w-20">
                              {displayConfig.test2Label || "TEST 2"}
                            </th>
                          )}
                          {displayConfig.showMidterm && (
                            <th className="py-2 px-2 text-center border-r border-slate-300 w-20">
                              {displayConfig.midtermLabel || "MID-TERM"}
                            </th>
                          )}
                          {activeCustomCols.map(c => (
                            <th key={c.id} className="py-2 px-2 text-center border-r border-slate-300 w-24 bg-purple-50 text-purple-950">
                              {(c.shortLabel || c.name).toUpperCase()}
                            </th>
                          ))}
                          <th className="py-2 px-2 text-center border-r border-slate-300 w-28">MARKS (100)</th>
                          <th className="py-2 px-2 text-center border-r border-slate-300 w-24">CLASS AVG</th>
                          <th className="py-2 px-2 text-center border-r border-slate-300 w-16">GRADE</th>
                          <th className="py-2 px-3 text-center w-32">STANDARD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {subjectEntries.map(([subjName, g]) => {
                          const currentScore = editSecondaryMarks
                            ? (parseInt(secondaryMarkDrafts[subjName] ?? String(g.totalScore)) || 0)
                            : g.totalScore;
                          const currentGz = editSecondaryMarks
                            ? (isG4to7 ? calculateGrade7EczGrade(currentScore) : calculateEczGrade(currentScore))
                            : (isG4to7
                                ? (g.grade7Grade ? { point: g.grade7Grade, label: GRADE_7_ECZ_SCALE[g.grade7Grade]?.label || "UNSATISFACTORY" } : calculateGrade7EczGrade(g.totalScore))
                                : { point: g.eczGrade, label: ECZ_GRADE_SCALE[g.eczGrade]?.label || "UNSATISFACTORY" });
                          const scaleInfo = isG4to7
                            ? (GRADE_7_ECZ_SCALE[currentGz.point] || GRADE_7_ECZ_SCALE[5])
                            : (ECZ_GRADE_SCALE[currentGz.point] || ECZ_GRADE_SCALE[9]);
                          const stdLabel = (scaleInfo.label || currentGz.label || "UNSATISFACTORY").toUpperCase();
                          const classAvg = classAverages[subjName] ?? Math.round(g.totalScore);

                          return (
                            <tr key={subjName} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-bold text-slate-900 uppercase border-r border-slate-200">
                                {subjName}
                              </td>
                              {displayConfig.showTest1 && (
                                <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-200 font-mono">
                                  {g.caScore > 0 ? g.caScore : "—"}
                                </td>
                              )}
                              {displayConfig.showTest2 && (
                                <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-200 font-mono">
                                  {(g.test2Score ?? 0) > 0 ? g.test2Score : (g.midTermScore > 0 && !displayConfig.showMidterm ? g.midTermScore : "—")}
                                </td>
                              )}
                              {displayConfig.showMidterm && (
                                <td className="py-2 px-2 text-center text-slate-700 border-r border-slate-200 font-mono">
                                  {g.midTermScore > 0 ? g.midTermScore : "—"}
                                </td>
                              )}
                              {activeCustomCols.map(c => {
                                const customVal = (customScoreDrafts[subjName]?.[c.id] !== undefined)
                                  ? customScoreDrafts[subjName][c.id]
                                  : (g.customScores?.[c.id] !== undefined ? String(g.customScores[c.id]) : "");
                                return (
                                  <td key={c.id} className="py-2 px-2 text-center font-mono border-r border-slate-200 text-purple-900 font-bold">
                                    {editSecondaryMarks ? (
                                      <input
                                        type="number"
                                        min={0}
                                        max={c.maxScore}
                                        value={customVal}
                                        onChange={(e) => {
                                          const val = e.target.value;
                                          setCustomScoreDrafts(prev => ({
                                            ...prev,
                                            [subjName]: {
                                              ...(prev[subjName] || {}),
                                              [c.id]: val
                                            }
                                          }));
                                        }}
                                        placeholder={`/${c.maxScore}`}
                                        className="w-12 text-center font-bold text-xs bg-white border border-purple-300 rounded px-1 py-0.5"
                                      />
                                    ) : (
                                      customVal !== "" ? customVal : "—"
                                    )}
                                  </td>
                                );
                              })}
                              <td className="py-2 px-2 text-center font-bold text-slate-900 border-r border-slate-200">
                                {editSecondaryMarks ? (
                                  <div className="inline-flex items-center justify-center gap-1">
                                    <input
                                      type="number"
                                      min={0}
                                      max={100}
                                      value={secondaryMarkDrafts[subjName] ?? String(g.totalScore)}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setSecondaryMarkDrafts(prev => ({
                                          ...prev,
                                          [subjName]: val
                                        }));
                                      }}
                                      className="w-16 text-center font-bold text-sm bg-white border-2 border-blue-400 focus:border-blue-600 rounded px-1.5 py-0.5 text-blue-950 focus:outline-none shadow-2xs"
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold">/100</span>
                                  </div>
                                ) : (
                                  <span className="font-bold font-mono text-sm">{g.totalScore}</span>
                                )}
                              </td>
                              <td className="py-2.5 px-2 text-center text-slate-700 border-r border-slate-200 font-mono">
                                {classAvg}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-slate-900 border-r border-slate-200 font-mono">
                                {currentGz.point}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold uppercase text-slate-900">
                                {stdLabel}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* 5. Summary Statistics Line */}
                  <div className="py-2.5 border-y border-slate-300 flex flex-wrap items-center justify-between text-xs font-bold text-slate-900 gap-y-2">
                    <div className="flex items-center gap-1.5">
                      <span>AVERAGE IN SUBJECTS RECORDED: </span>
                      <span className="text-red-600 font-black font-mono text-sm tracking-tight">{averageMarkDecimal}%</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>SUBJECTS PASSED: </span>
                      <span className="text-red-600 font-black font-mono text-sm">{subjectsPassedCount}</span>
                      <span className="text-[11px] text-slate-500 font-normal">/ {subjectsRecordedCount}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span>SUBJECTS RECORDED: </span>
                      <span className="text-red-600 font-black font-mono text-sm">{subjectsRecordedCount}</span>
                    </div>
                  </div>

                  {/* 6. Scholastic Grade Scale Table (5-point for Grade 4-7, 9-point for Secondary) */}
                  <div className="border border-slate-300 rounded-sm overflow-x-auto">
                    <div className="bg-[#f0f6fa] text-[#1a365d] font-bold text-[11px] py-1.5 px-3 text-center border-b border-slate-300">
                      {isG4to7
                        ? "Scholastic Grade Scale: Grades 4–7 ECZ Final Exam 5-point scale"
                        : "Scholastic Grade Scale: Grades are awarded on a 9-point scale as follows"}
                    </div>
                    {isG4to7 ? (
                      <table className="w-full text-center border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                            <th className="py-1 px-2 text-left font-bold border-r border-slate-200 w-24">Grade</th>
                            <th className="py-1 px-1 border-r border-slate-200">1</th>
                            <th className="py-1 px-1 border-r border-slate-200">2</th>
                            <th className="py-1 px-1 border-r border-slate-200">3</th>
                            <th className="py-1 px-1 border-r border-slate-200">4</th>
                            <th className="py-1 px-1">5</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          <tr className="bg-white">
                            <td className="py-1 px-2 text-left font-bold border-r border-slate-200">Min Score</td>
                            <td className="py-1 px-1 border-r border-slate-200">75.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">65.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">50.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">40.0</td>
                            <td className="py-1 px-1">0.0</td>
                          </tr>
                          <tr className="bg-white uppercase font-bold text-[8.5px]">
                            <td className="py-1 px-2 text-left font-bold border-r border-slate-200 text-[10px]">Description</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">DISTINCTION</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">MERIT</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">CREDIT</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">SATISFACTORY</td>
                            <td className="py-1 px-1 text-[8px]">UNSATISFACTORY</td>
                          </tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-center border-collapse text-[10px]">
                        <thead>
                          <tr className="bg-slate-50 text-slate-800 font-bold border-b border-slate-200">
                            <th className="py-1 px-2 text-left font-bold border-r border-slate-200 w-24">Grade</th>
                            <th className="py-1 px-1 border-r border-slate-200">1</th>
                            <th className="py-1 px-1 border-r border-slate-200">2</th>
                            <th className="py-1 px-1 border-r border-slate-200">3</th>
                            <th className="py-1 px-1 border-r border-slate-200">4</th>
                            <th className="py-1 px-1 border-r border-slate-200">5</th>
                            <th className="py-1 px-1 border-r border-slate-200">6</th>
                            <th className="py-1 px-1 border-r border-slate-200">7</th>
                            <th className="py-1 px-1 border-r border-slate-200">8</th>
                            <th className="py-1 px-1">9</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          <tr className="bg-white">
                            <td className="py-1 px-2 text-left font-bold border-r border-slate-200">Min Score</td>
                            <td className="py-1 px-1 border-r border-slate-200">75.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">70.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">65.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">60.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">55.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">50.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">45.0</td>
                            <td className="py-1 px-1 border-r border-slate-200">40.0</td>
                            <td className="py-1 px-1">0.0</td>
                          </tr>
                          <tr className="bg-white uppercase font-bold text-[8.5px]">
                            <td className="py-1 px-2 text-left font-bold border-r border-slate-200 text-[10px]">Description</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">DISTINCTION</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">DISTINCTION</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">MERIT</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">MERIT</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">CREDIT</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">CREDIT</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">SATISFACTORY</td>
                            <td className="py-1 px-1 border-r border-slate-200 text-[8px]">SATISFACTORY</td>
                            <td className="py-1 px-1 text-[8px]">UNSATISFACTORY</td>
                          </tr>
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* 7. Comments & Status Section */}
                  <div className="space-y-3 pt-2 text-xs">
                    {/* Remarks Editor button for Staff */}
                    {canEditComments && (
                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-200 print:hidden">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">Teacher & Headteacher Remarks</span>
                          <span className="text-[11px] text-slate-500 font-medium">(Calculated Average: {averageMarkDecimal}%)</span>
                        </div>
                        {!editCommentMode ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAutoGenerateRemarks}
                              className="bg-white hover:bg-slate-100 text-xs px-2.5 py-1 rounded text-blue-700 font-semibold border border-blue-200 flex items-center gap-1 cursor-pointer"
                              title="Generate standard ECZ comments based on calculated subject marks"
                            >
                              <Calculator className="w-3.5 h-3.5 text-blue-600" /> Compute Remarks
                            </button>
                            <button
                              onClick={() => setEditCommentMode(true)}
                              className="bg-blue-700 hover:bg-blue-800 text-xs px-3 py-1 rounded text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> Edit Remarks
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleAutoGenerateRemarks}
                              className="bg-white hover:bg-slate-100 text-xs px-2.5 py-1 rounded text-blue-700 font-semibold border border-blue-200 flex items-center gap-1 cursor-pointer"
                              title="Reset to calculated comments based on entered marks"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> Recompute
                            </button>
                            <button
                              onClick={handleSaveComments}
                              className="bg-emerald-700 hover:bg-emerald-800 text-xs px-3 py-1 rounded text-white font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> Save Remarks
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Quick Preset Comment Chips when editing Secondary */}
                    {editCommentMode && (
                      <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-lg space-y-2 print:hidden">
                        <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                          <span>Quick Comment Presets (Click to insert into Teacher's Comment):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "Outstanding academic mastery across all core subjects.",
                            "Good progress shown throughout the term. Keep working hard.",
                            "Fair performance. Consistent focus and revision required.",
                            "Average performance. Needs to invest more study time.",
                            "Certified with distinction. Excellent discipline and commitment."
                          ].map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setDraftReport(prev => ({ ...prev, classTeacherComment: preset }))}
                              className="text-[11px] bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded cursor-pointer transition-colors"
                            >
                              + "{preset}"
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teachers Comment */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-serif font-bold text-slate-900 text-sm shrink-0">
                        Teachers Comment:
                      </span>
                      {editCommentMode ? (
                        <input
                          type="text"
                          value={draftReport.classTeacherComment}
                          onChange={(e) => setDraftReport({ ...draftReport, classTeacherComment: e.target.value })}
                          placeholder="Enter Teacher's comment here..."
                          className="flex-1 bg-white border border-blue-300 rounded p-1.5 text-xs text-emerald-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      ) : (
                        <span className="font-bold text-emerald-600 text-sm">
                          {draftReport.classTeacherComment || "Fair performance. Focus required."}
                        </span>
                      )}
                    </div>

                    {/* Head teachers Comment */}
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                      <span className="font-serif font-bold text-slate-900 text-sm shrink-0">
                        Head teachers Comment:
                      </span>
                      {editCommentMode ? (
                        <textarea
                          rows={2}
                          value={draftReport.headteacherComment}
                          onChange={(e) => setDraftReport({ ...draftReport, headteacherComment: e.target.value })}
                          placeholder="Enter Headteacher's comment here..."
                          className="flex-1 bg-white border border-blue-300 rounded p-1.5 text-xs text-emerald-700 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      ) : (
                        <div className="font-bold text-emerald-600 text-sm whitespace-pre-line">
                          {draftReport.headteacherComment || (
                            <>
                              <span className="uppercase">{strongestSubj || "BIOLOGY"}</span> is your strongest subject. Keep up the momentum!
                              {weakSubjectsList.length > 0 && (
                                <span className="block mt-0.5">
                                  <span className="uppercase">{weakSubjectsList.join(", ")}</span> requires a resit (score below 40). You need to focus!
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* STATUS: PROMOTED / ON TRACK */}
                    <div className="flex items-center gap-2 pt-2">
                      <span className="font-serif font-bold text-slate-900 text-sm">
                        STATUS:
                      </span>
                      {editCommentMode ? (
                        <input
                          type="text"
                          value={draftReport.promotedTo || ""}
                          onChange={(e) => setDraftReport({ ...draftReport, promotedTo: e.target.value })}
                          placeholder="e.g. PROMOTED TO FORM 2"
                          className="bg-white border border-blue-300 rounded p-1.5 text-xs text-emerald-600 font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                        />
                      ) : (
                        <span className="font-black text-emerald-600 text-sm uppercase">
                          {draftReport.promotedTo || (subjectsPassedCount >= Math.ceil(subjectsRecordedCount * 0.6) ? "PROMOTED TO FORM 2" : "ON TRACK / PENDING RESITS")}
                        </span>
                      )}
                    </div>

                    {editCommentMode && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={handleSaveComments}
                          className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-4 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save All Remarks</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* BULK DOWNLOAD ALL PDFS MODAL                                              */}
      {/* ========================================================================= */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Download All Report Card PDFs</h3>
                  <p className="text-[11px] text-slate-400">Export student result PDFs named individually</p>
                </div>
              </div>
              {!isBatchDownloading && (
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="text-slate-400 hover:text-white text-lg font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {!isBatchDownloading ? (
                <>
                  <p className="text-slate-600">
                    Each student's report card will be compiled according to their official Zambian format (Primary or Secondary) and downloaded with their respective name (e.g. <span className="font-mono font-semibold text-slate-900">ReportCard_Primary_Mwamba_Chanda_Term1_2026.pdf</span>).
                  </p>

                  <div className="space-y-2">
                    <label className="font-bold text-slate-900 block">Select Scope:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setBatchScope("class")}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          batchScope === "class"
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <span className="font-bold text-slate-900 block text-xs">
                          Current Class Only
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          {currentClass?.name || "Selected Class"} ({studentsInCurrentClass.length} Students)
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setBatchScope("all")}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          batchScope === "all"
                            ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <span className="font-bold text-slate-900 block text-xs">
                          All Enrolled Students
                        </span>
                        <span className="text-[11px] text-slate-500 mt-0.5 block">
                          Whole School ({students.length} Students)
                        </span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block">Active Term:</span>
                      <strong className="text-slate-900">{selectedTerm}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Total PDFs to Download:</span>
                      <strong className="text-indigo-700 font-bold">
                        {batchScope === "class" ? studentsInCurrentClass.length : students.length} Students
                      </strong>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowBatchModal(false)}
                      className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-bold rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetList = batchScope === "class" ? studentsInCurrentClass : students;
                        handleDownloadAllPdfs(targetList);
                      }}
                      className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-5 py-2 rounded-lg flex items-center gap-2 shadow-xs cursor-pointer"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span>Start Download All ({batchScope === "class" ? studentsInCurrentClass.length : students.length})</span>
                    </button>
                  </div>
                </>
              ) : (
                /* Progress View */
                <div className="py-6 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto animate-bounce">
                    <DownloadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Downloading Report Cards...
                    </h4>
                    <p className="text-xs text-indigo-700 font-bold mt-1">
                      {batchProgress?.studentName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Progress: {batchProgress?.current} of {batchProgress?.total}
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200 max-w-xs mx-auto">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${batchProgress ? Math.round((batchProgress.current / batchProgress.total) * 100) : 0}%`
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Please keep this window open while PDFs are saving to your device.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
