import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Student,
  ClassStream,
  GradebookData,
  SubjectAssessment,
  EczGradePoint,
  TermResultsApproval
} from "../types";
import {
  getZambianSubjectsForGrade,
  calculateEczGrade,
  GRADE_SCALE,
  GRADE_7_ECZ_SCALE,
  calculateGrade7EczGrade,
  calculateGrade7CandidateDivision,
  calculatePrimaryCandidateDivision,
  isGrade7Class,
  isGrade4to7Class,
  isGrade4to7Grade
} from "../data/zambianSchoolData";
import {
  exportDetailedGradebookCsv,
  exportSummaryMatrixCsv
} from "../utils/csvExporter";
import { BulkMarksImportModal } from "./BulkMarksImportModal";
import {
  Award,
  Save,
  CheckCircle2,
  Calculator,
  Info,
  FileSpreadsheet,
  Download,
  Upload,
  ChevronDown,
  Check,
  Table,
  Layers,
  Sparkles,
  Sliders,
  Edit3,
  RotateCcw,
  BookOpen,
  Users,
  GraduationCap,
  Percent
} from "lucide-react";

interface GradingModuleProps {
  classes: ClassStream[];
  students: Student[];
  gradebook: GradebookData;
  onUpdateGradebook: (newGradebook: GradebookData) => void;
  canEdit: boolean;
  resultsApprovals?: Record<number, Record<string, TermResultsApproval>> | TermResultsApproval[];
  onUpdateApprovalStatus?: (studentIdOrApprovalId: any, termOrStatus: any, statusOrApprovedBy?: any, notesOrComment?: string) => void;
  onBatchApproveClass?: (classId: number, term?: any, academicYearOrApprovedBy?: any, approvedByOrComment?: string) => void;
  isHeadteacher?: boolean;
  filterTeacherName?: string;
  filterStudentId?: number;
}

interface StudentDraftScore {
  test1: string;    // Test 1 (e.g. /100, /50, /30)
  test2: string;    // Test 2 (e.g. /100, /50, /20)
  midterm: string;  // Mid-Term Test (e.g. /100, /50)
  endTerm: string;  // End of Term Exam (e.g. /100, /50)
  total: string;    // Total Mark (Editable by teacher)
  isCustomTotal: boolean; // Flag if teacher manually typed the total
}

export function GradingModule({
  classes,
  students,
  gradebook,
  onUpdateGradebook,
  canEdit,
  resultsApprovals = [],
  onUpdateApprovalStatus,
  onBatchApproveClass,
  isHeadteacher = false,
  filterTeacherName,
  filterStudentId
}: GradingModuleProps) {
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 1);
  const [selectedTerm, setSelectedTerm] = useState<string>("Term 1");

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const isPrimary = (currentClass?.gradeNum ?? 7) <= 7 || currentClass?.section === "Primary" || currentClass?.section === "Early Childhood";
  const isUpperPrimary = isGrade4to7Class(currentClass);
  const isGrade4to7 = isUpperPrimary;
  const isGrade7 = isGrade7Class(currentClass);

  // Assessment Mode: "independent" (Standalone Test 1, Test 2, Midterm, End of Term) vs "ca_weighted" (Summed to total) vs "raw" (Single raw mark)
  const [scoringMode, setScoringMode] = useState<"independent" | "ca_weighted" | "raw">(isPrimary ? "independent" : "raw");

  // Primary Scale: 150 for Upper Primary (Grades 4-7, 50/50/50 C.A.) or 100 (Standard)
  const [primaryMaxScale, setPrimaryMaxScale] = useState<150 | 100>(isUpperPrimary ? 150 : 100);

  // Independent Test Max Limits (e.g. 100 or 50)
  const [testMaxScore, setTestMaxScore] = useState<100 | 50>(100);

  // Column visibility inside grading entry
  const [showMidtermColumn, setShowMidtermColumn] = useState<boolean>(true);

  const classSubjects = getZambianSubjectsForGrade(currentClass?.gradeNum || 7, currentClass?.pathway);
  const initialSubject = classSubjects[0] || "English Language";
  const [selectedSubject, setSelectedSubject] = useState<string>(initialSubject);

  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  // Draft scores without default pre-filled marks (defaults to empty strings "")
  const [draftScores, setDraftScores] = useState<Record<number, StudentDraftScore>>(() => {
    const init: Record<number, StudentDraftScore> = {};
    classStudents.forEach(s => {
      const existing = gradebook[selectedClassId]?.[selectedTerm]?.[initialSubject]?.[s.id];
      if (existing && (existing.totalScore > 0 || existing.caScore > 0 || existing.endTermScore > 0 || (existing.test1Score ?? 0) > 0 || (existing.test2Score ?? 0) > 0)) {
        init[s.id] = {
          test1: existing.test1Score ? String(existing.test1Score) : (existing.caScore ? String(existing.caScore) : ""),
          test2: existing.test2Score ? String(existing.test2Score) : "",
          midterm: existing.midTermScore ? String(existing.midTermScore) : "",
          endTerm: existing.endTermScore ? String(existing.endTermScore) : "",
          total: existing.totalScore ? String(existing.totalScore) : "",
          isCustomTotal: false
        };
      } else {
        // CLEAN SLATE: No default pre-filled marks
        init[s.id] = {
          test1: "",
          test2: "",
          midterm: "",
          endTerm: "",
          total: "",
          isCustomTotal: false
        };
      }
    });
    return init;
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showBulkMarksModal, setShowBulkMarksModal] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync draft scores when class/term/subject changes
  const handleSubjectOrClassChange = (classId: number, term: string, subject: string) => {
    setSelectedClassId(classId);
    setSelectedTerm(term);
    setSelectedSubject(subject);

    const cls = classes.find(c => c.id === classId) || classes[0];
    const clsIsPrimary = (cls?.gradeNum ?? 7) <= 7 || cls?.section === "Primary" || cls?.section === "Early Childhood";
    const clsIsUpperPrimary = Boolean(
      (cls?.gradeNum !== undefined && cls.gradeNum >= 4 && cls.gradeNum <= 7) ||
      ["Grade 4", "Grade 5", "Grade 6", "Grade 7"].some(g => cls?.name?.includes(g))
    );
    setScoringMode(clsIsPrimary ? "independent" : "raw");
    setPrimaryMaxScale(clsIsUpperPrimary ? 150 : 100);

    const targetStudents = students.filter(s => s.classId === classId);
    const newDraft: Record<number, StudentDraftScore> = {};
    targetStudents.forEach(s => {
      const existing = gradebook[classId]?.[term]?.[subject]?.[s.id];
      if (existing && (existing.totalScore > 0 || existing.caScore > 0 || existing.endTermScore > 0 || (existing.test1Score ?? 0) > 0 || (existing.test2Score ?? 0) > 0)) {
        newDraft[s.id] = {
          test1: existing.test1Score ? String(existing.test1Score) : (existing.caScore ? String(existing.caScore) : ""),
          test2: existing.test2Score ? String(existing.test2Score) : "",
          midterm: existing.midTermScore ? String(existing.midTermScore) : "",
          endTerm: existing.endTermScore ? String(existing.endTermScore) : "",
          total: existing.totalScore ? String(existing.totalScore) : "",
          isCustomTotal: false
        };
      } else {
        // Clean slate: No default pre-filled marks
        newDraft[s.id] = {
          test1: "",
          test2: "",
          midterm: "",
          endTerm: "",
          total: "",
          isCustomTotal: false
        };
      }
    });
    setDraftScores(newDraft);
  };

  // Max component limits based on primary/secondary and selected scale
  const currentMaxTotal = scoringMode === "independent" ? (isPrimary ? primaryMaxScale : testMaxScore) : (isPrimary ? primaryMaxScale : 100);
  const maxTest1 = scoringMode === "independent" ? testMaxScore : (isPrimary ? (primaryMaxScale === 150 ? 50 : 30) : 30);
  const maxTest2 = scoringMode === "independent" ? testMaxScore : (isPrimary ? (primaryMaxScale === 150 ? 50 : 20) : 20);
  const maxMidterm = scoringMode === "independent" ? testMaxScore : (isPrimary ? (primaryMaxScale === 150 ? 50 : 20) : 20);
  const maxEndTerm = scoringMode === "independent" ? currentMaxTotal : (isPrimary ? primaryMaxScale : 100);

  // Handle changes to individual score inputs
  const handleScoreChange = (
    studentId: number,
    field: "test1" | "test2" | "midterm" | "endTerm" | "total",
    val: string
  ) => {
    setDraftScores(prev => {
      const current = prev[studentId] || { test1: "", test2: "", midterm: "", endTerm: "", total: "", isCustomTotal: false };
      
      if (field === "total") {
        // Teacher directly typed/edited the Final Mark (out of 150 / active scale)
        return {
          ...prev,
          [studentId]: {
            ...current,
            total: val,
            isCustomTotal: true
          }
        };
      }

      // Teacher entered a component mark (test1, test2, midterm, or endTerm)
      // Test 1 and Test 2 are strictly independent and DO NOT affect endTerm!
      const updated = { ...current, [field]: val };
      
      if (scoringMode === "independent") {
        // INDEPENDENT MODE: Tests are standalone. Test 1 and Test 2 do NOT affect End of Term marks.
        // If End of Term is entered and total wasn't custom typed, default final mark to End of Term mark
        if (!current.isCustomTotal) {
          if (field === "endTerm" && updated.endTerm.trim() !== "") {
            updated.total = updated.endTerm;
          }
        }
      } else if (scoringMode === "ca_weighted") {
        // CA WEIGHTED MODE: Sum components dynamically
        const t1 = parseInt(updated.test1) || 0;
        const t2 = parseInt(updated.test2) || 0;
        const mid = parseInt(updated.midterm) || 0;
        const end = parseInt(updated.endTerm) || 0;

        const hasAnyComponent = updated.test1.trim() !== "" || updated.test2.trim() !== "" || updated.midterm.trim() !== "" || updated.endTerm.trim() !== "";
        
        if (hasAnyComponent) {
          const sum = t1 + t2 + mid + end;
          updated.total = String(sum);
          updated.isCustomTotal = false;
        } else if (!current.isCustomTotal) {
          updated.total = "";
        }
      }

      return {
        ...prev,
        [studentId]: updated
      };
    });
  };

  // Clear all drafts to start clean
  const handleClearAllDrafts = () => {
    const cleared: Record<number, StudentDraftScore> = {};
    classStudents.forEach(s => {
      cleared[s.id] = { test1: "", test2: "", midterm: "", endTerm: "", total: "", isCustomTotal: false };
    });
    setDraftScores(cleared);
  };

  // Save assessment marks to gradebook
  const handleSaveGrades = () => {
    const updatedGb: GradebookData = JSON.parse(JSON.stringify(gradebook));

    if (!updatedGb[selectedClassId]) updatedGb[selectedClassId] = {};
    if (!updatedGb[selectedClassId][selectedTerm]) updatedGb[selectedClassId][selectedTerm] = {};
    if (!updatedGb[selectedClassId][selectedTerm][selectedSubject]) {
      updatedGb[selectedClassId][selectedTerm][selectedSubject] = {};
    }

    classStudents.forEach(s => {
      const draft = draftScores[s.id] || { test1: "", test2: "", midterm: "", endTerm: "", total: "", isCustomTotal: false };
      
      const t1 = parseInt(draft.test1) || 0;
      const t2 = parseInt(draft.test2) || 0;
      const mid = parseInt(draft.midterm) || 0;
      const end = parseInt(draft.endTerm) || 0;
      
      let total = parseInt(draft.total) || 0;
      if (scoringMode === "ca_weighted" && !draft.isCustomTotal && (draft.test1 || draft.test2 || draft.midterm || draft.endTerm)) {
        total = t1 + t2 + mid + end;
      } else if (scoringMode === "independent" && !draft.isCustomTotal) {
        total = parseInt(draft.total) || (end > 0 ? end : 0);
      }

      // Calculate percentage based on active scale
      const maxScale = currentMaxTotal;
      const percentage = maxScale > 0 ? Math.min(100, Math.round((total / maxScale) * 100)) : total;
      const gz = calculateEczGrade(percentage);
      const g7z = calculateGrade7EczGrade(percentage);

      updatedGb[selectedClassId][selectedTerm][selectedSubject][s.id] = {
        caScore: t1,
        test1Score: t1,
        test2Score: t2,
        midTermScore: mid || t2,
        endTermScore: end,
        totalScore: total,
        maxScore: maxScale,
        percentage,
        rawScore: total,
        scoringMode,
        eczGrade: isGrade4to7 ? (g7z.point as any) : gz.point,
        grade7Grade: isGrade4to7 ? g7z.point : undefined,
        grade7Division: isGrade4to7 ? g7z.division : undefined,
        remark: isGrade4to7 ? g7z.label : gz.label,
        teacherInitials: currentClass.teacherName ? currentClass.teacherName.split(" ").map(w => w[0]).join("") : "T.C."
      };
    });

    onUpdateGradebook(updatedGb);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  // CSV Export Handlers
  const handleExportCurrentSubject = () => {
    exportDetailedGradebookCsv(students, classes, gradebook, {
      classId: selectedClassId,
      term: selectedTerm,
      subject: selectedSubject
    });
    setExportNotice(`Exported ${selectedSubject} Grade Sheet for ${currentClass.name}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportClassMatrix = () => {
    exportSummaryMatrixCsv(selectedClassId, selectedTerm, students, classes, gradebook);
    setExportNotice(`Exported Master Assessment Summary Matrix for ${currentClass.name}`);
    setTimeout(() => setExportNotice(null), 4000);
  };

  // Compute live statistics for entered marks
  const statistics = useMemo(() => {
    let enteredCount = 0;
    let sumPercentages = 0;
    let distinctions = 0;
    let merits = 0;
    let credits = 0;
    let passCount = 0;
    let unassigned = 0;

    classStudents.forEach(s => {
      const draft = draftScores[s.id];
      const hasMark = draft && draft.total.trim() !== "";
      if (hasMark) {
        enteredCount++;
        const total = parseInt(draft.total) || 0;
        const pct = currentMaxTotal > 0 ? Math.min(100, Math.round((total / currentMaxTotal) * 100)) : total;
        sumPercentages += pct;
        
        if (isGrade4to7) {
          const g7z = calculateGrade7EczGrade(pct);
          if (g7z.point === 1) distinctions++;
          else if (g7z.point === 2) merits++;
          else if (g7z.point === 3) credits++;
          else if (g7z.point === 4) passCount++;
        } else {
          const gz = calculateEczGrade(pct);
          if (gz.point <= 2) distinctions++;
          else if (gz.point <= 4) merits++;
          else if (gz.point <= 6) credits++;
          else if (gz.point <= 8) passCount++;
        }
      } else {
        unassigned++;
      }
    });

    const avgPercent = enteredCount > 0 ? Math.round(sumPercentages / enteredCount) : 0;
    return { enteredCount, totalCount: classStudents.length, avgPercent, distinctions, merits, credits, passCount, unassigned };
  }, [classStudents, draftScores, currentMaxTotal, isGrade4to7]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              isGrade4to7
                ? "bg-purple-100 text-purple-900 border border-purple-300"
                : isPrimary
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-indigo-100 text-indigo-800 border border-indigo-300"
            }`}>
              {isGrade7 ? "Grade 7 Final Examination (ECZ Composite Exam)" : isGrade4to7 ? "Upper Primary (Grades 4–7 Final Exam Standard)" : isPrimary ? "Lower Primary Section (Grades 1 – 3)" : "Secondary Section (Forms 1 – 4)"}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Class Teacher: {currentClass.teacherName}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-serif flex items-center gap-2">
            <span>{isGrade4to7 ? `${currentClass.name} Final Examination & Assessment Module` : "Continuous Assessment & Grading Module"}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isGrade4to7
              ? "Official ECZ Grade 7 Final Examination Standard (5-Point Scale Grades 1–5, Divisions 1–4) for Primary Grades 4 to 7."
              : "Official ECZ Grading Standards • Choose Raw Marks Mode or C.A. Weighted Out of 150 / 100 with editable total marks."}
          </p>
        </div>

        {/* Action Buttons: Bulk Upload & Export */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowBulkMarksModal(true)}
            className="w-full sm:w-auto bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-between sm:justify-start gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Bulk Upload Marks ({currentClass.name})</span>
          </button>

          {/* Global Export Options Dropdown */}
          <div className="relative shrink-0" ref={exportMenuRef}>
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full sm:w-auto bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-xs flex items-center justify-between sm:justify-start gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export Marksheets (.CSV)</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-30 p-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Export Options
                </div>
                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    handleExportCurrentSubject();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Table className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Current Subject Sheet</p>
                    <p className="text-[10px] text-slate-400">{selectedSubject} • {currentClass.name}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowExportMenu(false);
                    handleExportClassMatrix();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-sky-600 shrink-0" />
                  <div>
                    <p className="font-bold">Class Assessment Matrix</p>
                    <p className="text-[10px] text-slate-400">All subjects for {currentClass.name}</p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selectors Bar: Class, Term, Subject & Mode Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Class Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Select Class Stream</span>
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleSubjectOrClassChange(parseInt(e.target.value), selectedTerm, selectedSubject)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.section || "Primary"}) • Teacher: {c.teacherName}
                </option>
              ))}
            </select>
          </div>

          {/* Academic Term */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic Term</span>
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => handleSubjectOrClassChange(selectedClassId, e.target.value, selectedSubject)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="Term 1">Term 1 (Opening Assessment)</option>
              <option value="Term 2">Term 2 (Mid-Year Assessment)</option>
              <option value="Term 3">Term 3 (End of Year Promotion)</option>
            </select>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Subject Area</span>
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => handleSubjectOrClassChange(selectedClassId, selectedTerm, e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-slate-50 font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {classSubjects.map(sub => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Teacher Mode Controls: Independent Assessments vs CA Weighted Mode vs Raw Marks */}
        <div className="pt-3 border-t border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 shrink-0">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>Assessment Mode:</span>
            </span>

            {/* Mode A: Independent Assessments Mode */}
            <label className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              scoringMode === "independent"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}>
              <input
                type="radio"
                name="scoringMode"
                value="independent"
                checked={scoringMode === "independent"}
                onChange={() => setScoringMode("independent")}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Independent Assessments (Test 1, Test 2, Midterm & End Exam — No auto CA sum)</span>
            </label>

            {/* Mode B: C.A. Weighted Mode */}
            <label className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              scoringMode === "ca_weighted"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}>
              <input
                type="radio"
                name="scoringMode"
                value="ca_weighted"
                checked={scoringMode === "ca_weighted"}
                onChange={() => setScoringMode("ca_weighted")}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Cumulative C.A. Sum (Combined components)</span>
            </label>

            {/* Mode C: Raw Final Marks Mode */}
            <label className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition-all ${
              scoringMode === "raw"
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}>
              <input
                type="radio"
                name="scoringMode"
                value="raw"
                checked={scoringMode === "raw"}
                onChange={() => setScoringMode("raw")}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span>Single Final Mark (Out of 100)</span>
            </label>
          </div>

          {/* Scale & Column Toggles */}
          <div className="flex flex-wrap items-center gap-3 self-end lg:self-auto">
            {scoringMode === "independent" && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-600">Test Scale:</span>
                <div className="inline-flex bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setTestMaxScore(100)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      testMaxScore === 100 ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    /100
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestMaxScore(50)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                      testMaxScore === 50 ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    /50
                  </button>
                </div>
              </div>
            )}

            {isPrimary && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-600">Total Scale:</span>
                <div className="inline-flex bg-white border border-slate-300 rounded-lg p-0.5 shadow-2xs text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setPrimaryMaxScale(150)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      primaryMaxScale === 150 ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Upper Primary (Grades 4-7) Standard: 50 + 50 + 50 = 150"
                  >
                    <span>/150</span>
                    <span className="text-[9px] opacity-80">(Upper Primary)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrimaryMaxScale(100)}
                    className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      primaryMaxScale === 100 ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Lower Primary / Standard: /100"
                  >
                    <span>/100</span>
                    <span className="text-[9px] opacity-80">(Lower Primary)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Overview Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Pupils</p>
          <p className="text-xl font-black text-slate-900 mt-0.5">{statistics.totalCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">{statistics.enteredCount} marks entered</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Average</p>
          <p className="text-xl font-black text-emerald-700 mt-0.5">{statistics.avgPercent}%</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Scale out of {currentMaxTotal}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isGrade4to7 ? "Grade 1 (Distinction)" : "Distinctions (1-2)"}
          </p>
          <p className="text-xl font-black text-emerald-600 mt-0.5">{statistics.distinctions}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isGrade4to7 ? "75% – 100% • Division 1" : "70% – 100% standard"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isGrade4to7 ? "Grade 2 (Merit)" : "Merits (3-4)"}
          </p>
          <p className="text-xl font-black text-sky-600 mt-0.5">{statistics.merits}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isGrade4to7 ? "65% – 74% • Division 2" : "60% – 69% standard"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {isGrade4to7 ? "Grade 3 & 4 (Credits/Pass)" : "Credits & Passes (5-8)"}
          </p>
          <p className="text-xl font-black text-amber-600 mt-0.5">{statistics.credits + statistics.passCount}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {isGrade4to7 ? "40% – 64% • Div 3 & 4" : "40% – 59% standard"}
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unentered Marks</p>
          <p className="text-xl font-black text-slate-400 mt-0.5">{statistics.unassigned}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Pending teacher entry</p>
        </div>
      </div>

      {/* Grading Legend Banner */}
      <div className={`${isGrade4to7 ? "bg-purple-50/70 border-purple-200" : isPrimary ? "bg-emerald-50/70 border-emerald-200" : "bg-indigo-50/70 border-indigo-200"} border rounded-xl p-3.5 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-xs`}>
        <div className="flex items-center gap-2">
          <Info className={`w-4 h-4 ${isGrade4to7 ? "text-purple-700" : isPrimary ? "text-emerald-700" : "text-indigo-700"} shrink-0`} />
          <span className={`font-bold ${isGrade4to7 ? "text-purple-950" : isPrimary ? "text-emerald-950" : "text-indigo-950"}`}>
            {isGrade4to7 ? "ECZ Upper Primary (Grades 4–7) Examination Scale (5 Points & Divisions):" : isPrimary ? `Primary Grading Scale (Max Total: ${currentMaxTotal} Marks):` : "Secondary ECZ 9-Point Scale:"}
          </span>
          <span className="text-slate-500 text-[11px]">
            {scoringMode === "ca_weighted" ? "• C.A., Mid-Term & End of Term dynamically compute Total" : "• Enter Raw Marks directly as shown on report cards"}
            {" • Total marks are directly editable"}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          {isGrade4to7 ? (
            <>
              <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">Grade 1: Distinction (75-100% • Div 1)</span>
              <span className="bg-sky-100 border border-sky-300 text-sky-900 px-2 py-0.5 rounded font-mono font-bold">Grade 2: Merit (65-74% • Div 2)</span>
              <span className="bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">Grade 3: Credit (50-64% • Div 3)</span>
              <span className="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">Grade 4: Pass (40-49% • Div 4)</span>
              <span className="bg-rose-100 border border-rose-300 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">Grade 5: Unsatisfactory (0-39% • Ungraded)</span>
            </>
          ) : (
            <>
              <span className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-2 py-0.5 rounded font-mono font-bold">1-2: Distinction (70-100%)</span>
              <span className="bg-sky-100 border border-sky-300 text-sky-900 px-2 py-0.5 rounded font-mono font-bold">3-4: Merit (60-69%)</span>
              <span className="bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-mono font-bold">5-6: Credit (50-59%)</span>
              <span className="bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">7-8: Pass (40-49%)</span>
              <span className="bg-rose-100 border border-rose-300 text-rose-900 px-2 py-0.5 rounded font-mono font-bold">9: Unsatisfactory (0-39%)</span>
            </>
          )}
        </div>
      </div>

      {/* Export Notice Feedback */}
      {exportNotice && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-3.5 text-xs text-sky-900 flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span className="font-bold">{exportNotice}</span>
          </div>
          <span className="text-[10px] text-sky-600 font-mono">Downloaded (.CSV)</span>
        </div>
      )}

      {/* Grade Entry Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>Grade Sheet:</span>
              <span className={isPrimary ? "text-emerald-700 font-extrabold" : "text-indigo-700 font-extrabold"}>{selectedSubject}</span>
              <span className="text-slate-400">—</span>
              <span className="text-slate-800">{currentClass.name}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {classStudents.length} enrolled pupils for {selectedTerm} • {scoringMode === "ca_weighted" ? `Component Breakdown (Max Total: ${currentMaxTotal})` : "Raw Direct Mark Entry"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <button
                type="button"
                onClick={handleClearAllDrafts}
                className="bg-white border border-slate-300 hover:border-slate-400 text-slate-600 font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                title="Reset sheet to clean state"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Clear Drafts</span>
              </button>
            )}

            <button
              onClick={handleExportCurrentSubject}
              className="bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Download CSV for this subject"
            >
              <Download className={`w-3.5 h-3.5 ${isPrimary ? "text-emerald-600" : "text-indigo-600"}`} />
              <span>Export CSV</span>
            </button>

            {canEdit && (
              <button
                onClick={handleSaveGrades}
                className={`${isPrimary ? "bg-emerald-600 hover:bg-emerald-700" : "bg-indigo-700 hover:bg-indigo-800"} text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer`}
              >
                <Save className="w-4 h-4" />
                <span>Save Assessment Marks</span>
              </button>
            )}
          </div>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2 justify-center font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Marks out of {currentMaxTotal} and ECZ grade points successfully saved to database!
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              {scoringMode === "raw" ? (
                // Raw Direct Mark Mode Headers
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Pupil Name & ECZ No</th>
                  <th className="py-3 px-4 text-center w-40">Final Raw Mark ({currentMaxTotal})</th>
                  <th className="py-3 px-4 text-center w-28">Percentage (%)</th>
                  <th className="py-3 px-4 text-center w-32">ECZ Grade Point</th>
                  <th className="py-3 px-4 text-center w-36">Standard</th>
                  <th className="py-3 px-4">Performance Remark</th>
                </tr>
              ) : scoringMode === "independent" ? (
                // Independent Standalone Assessments Headers (Test 1, Test 2, Midterm, End of Term independent)
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Pupil Name & ECZ No</th>
                  <th className="py-3 px-4 text-center w-28 text-emerald-800 bg-emerald-50/50">Test 1 ({maxTest1})</th>
                  <th className="py-3 px-4 text-center w-28 text-teal-800 bg-teal-50/50">Test 2 ({maxTest2})</th>
                  <th className="py-3 px-4 text-center w-28 text-sky-800 bg-sky-50/50">Mid-Term ({maxMidterm})</th>
                  <th className="py-3 px-4 text-center w-28 text-indigo-800 bg-indigo-50/50">End Exam ({maxEndTerm})</th>
                  <th className="py-3 px-4 text-center w-32 bg-amber-50/80 text-amber-950">
                    Final Mark ({currentMaxTotal}) <span className="text-[9px] text-amber-600 block lowercase font-normal">(Editable)</span>
                  </th>
                  <th className="py-3 px-4 text-center w-20">Percent</th>
                  <th className="py-3 px-4 text-center w-28">Grade Point</th>
                  <th className="py-3 px-4">Standard & Remark</th>
                </tr>
              ) : (
                // C.A. & Component Weighted Mode Headers (Cumulative Sum out of 150 / 100)
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Pupil Name & ECZ No</th>
                  <th className="py-3 px-4 text-center w-28">Test 1 / C.A. ({maxTest1})</th>
                  <th className="py-3 px-4 text-center w-28">Midterm Test ({maxTest2})</th>
                  <th className="py-3 px-4 text-center w-28">End of Term ({maxEndTerm})</th>
                  <th className="py-3 px-4 text-center w-36 bg-amber-50/80 text-amber-950">
                    Total Mark ({currentMaxTotal}) <span className="text-[9px] text-amber-600 block lowercase font-normal">(Sum / Editable)</span>
                  </th>
                  <th className="py-3 px-4 text-center w-24">Percentage</th>
                  <th className="py-3 px-4 text-center w-28">Grade Point</th>
                  <th className="py-3 px-4">Standard & Remark</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No pupils currently enrolled in {currentClass.name}. Add pupils from Pupil Directory.
                  </td>
                </tr>
              ) : (
                classStudents.map((student) => {
                  const draft = draftScores[student.id] || { test1: "", test2: "", midterm: "", endTerm: "", total: "", isCustomTotal: false };
                  
                  const t1Val = draft.test1 !== "" ? Math.min(maxTest1, Math.max(0, parseInt(draft.test1) || 0)) : null;
                  const t2Val = draft.test2 !== "" ? Math.min(maxTest2, Math.max(0, parseInt(draft.test2) || 0)) : null;
                  const midVal = draft.midterm !== "" ? Math.min(maxMidterm, Math.max(0, parseInt(draft.midterm) || 0)) : null;
                  const endVal = draft.endTerm !== "" ? Math.min(maxEndTerm, Math.max(0, parseInt(draft.endTerm) || 0)) : null;
                  
                  const hasEnteredAny = draft.total.trim() !== "" || draft.test1.trim() !== "" || draft.test2.trim() !== "" || draft.midterm.trim() !== "" || draft.endTerm.trim() !== "";
                  
                  let totalVal = 0;
                  if (draft.total.trim() !== "") {
                    totalVal = Math.min(currentMaxTotal, Math.max(0, parseInt(draft.total) || 0));
                  } else if (scoringMode === "independent") {
                    totalVal = endVal !== null ? endVal : 0;
                  } else if (t1Val !== null || t2Val !== null || midVal !== null || endVal !== null) {
                    totalVal = (t1Val || 0) + (t2Val || 0) + (midVal || 0) + (endVal || 0);
                  }

                  const percentageVal = hasEnteredAny ? Math.min(100, Math.round((totalVal / currentMaxTotal) * 100)) : null;
                  const gz = percentageVal !== null ? calculateEczGrade(percentageVal) : null;
                  const g7z = percentageVal !== null && isGrade4to7 ? calculateGrade7EczGrade(percentageVal) : null;
                  const scaleInfo = isGrade4to7
                    ? (g7z ? { label: g7z.label, description: `${g7z.division} • ${g7z.selectionPlacement}` } : null)
                    : (gz ? (GRADE_SCALE[gz.point] || { label: gz.label, description: "Standard" }) : null);

                  if (scoringMode === "raw") {
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Ref: {student.eczNo} • {student.grade} {student.stream}</p>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {canEdit ? (
                            <div className="inline-flex items-center gap-1.5 justify-center">
                              <input
                                type="number"
                                min={0}
                                max={currentMaxTotal}
                                value={draft.total}
                                onChange={(e) => handleScoreChange(student.id, "total", e.target.value)}
                                className="w-20 bg-white border-2 border-indigo-200 focus:border-indigo-600 rounded-lg px-2.5 py-1 text-center font-bold text-indigo-950 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-100"
                                placeholder="0-100"
                              />
                              <span className="text-slate-400 font-bold text-xs">/ {currentMaxTotal}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-sm text-indigo-950 font-mono">
                              {hasEnteredAny ? totalVal : "—"}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-xs text-slate-700">
                            {percentageVal !== null ? `${percentageVal}%` : "—"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-center">
                          {isGrade4to7 && g7z ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border ${
                              g7z.point === 1
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : g7z.point === 2
                                ? "bg-sky-100 text-sky-800 border-sky-300"
                                : g7z.point === 3
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : g7z.point === 4
                                ? "bg-slate-100 text-slate-800 border-slate-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}>
                              Grade {g7z.point}
                            </span>
                          ) : gz ? (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black border ${
                              gz.point <= 2
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : gz.point <= 4
                                ? "bg-sky-100 text-sky-800 border-sky-300"
                                : gz.point <= 6
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : gz.point <= 8
                                ? "bg-slate-100 text-slate-800 border-slate-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}>
                              Grade {gz.point}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span className="font-bold uppercase text-[11px] text-slate-800">
                            {isGrade4to7 ? (g7z ? g7z.division : "—") : (gz ? gz.label : "Pending")}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-slate-600 font-medium text-xs">
                            {scaleInfo ? scaleInfo.description : "No marks entered yet"}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  if (scoringMode === "independent") {
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/90 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Ref: {student.eczNo} • {student.grade} {student.stream}</p>
                        </td>

                        {/* Test 1 */}
                        <td className="py-3 px-4 text-center">
                          {canEdit ? (
                            <input
                              type="number"
                              min={0}
                              max={maxTest1}
                              value={draft.test1}
                              onChange={(e) => handleScoreChange(student.id, "test1", e.target.value)}
                              className="w-16 bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                              placeholder={`/${maxTest1}`}
                              title="Test 1 (Independent)"
                            />
                          ) : (
                            <span className="font-bold text-slate-700">{t1Val !== null ? t1Val : "—"}</span>
                          )}
                        </td>

                        {/* Test 2 */}
                        <td className="py-3 px-4 text-center">
                          {canEdit ? (
                            <input
                              type="number"
                              min={0}
                              max={maxTest2}
                              value={draft.test2}
                              onChange={(e) => handleScoreChange(student.id, "test2", e.target.value)}
                              className="w-16 bg-white border border-slate-300 focus:border-teal-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                              placeholder={`/${maxTest2}`}
                              title="Test 2 (Independent)"
                            />
                          ) : (
                            <span className="font-bold text-slate-700">{t2Val !== null ? t2Val : "—"}</span>
                          )}
                        </td>

                        {/* Mid-Term */}
                        <td className="py-3 px-4 text-center">
                          {canEdit ? (
                            <input
                              type="number"
                              min={0}
                              max={maxMidterm}
                              value={draft.midterm}
                              onChange={(e) => handleScoreChange(student.id, "midterm", e.target.value)}
                              className="w-16 bg-white border border-slate-300 focus:border-sky-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                              placeholder={`/${maxMidterm}`}
                              title="Mid-Term Test (Independent)"
                            />
                          ) : (
                            <span className="font-bold text-slate-700">{midVal !== null ? midVal : "—"}</span>
                          )}
                        </td>

                        {/* End of Term Exam */}
                        <td className="py-3 px-4 text-center">
                          {canEdit ? (
                            <input
                              type="number"
                              min={0}
                              max={maxEndTerm}
                              value={draft.endTerm}
                              onChange={(e) => handleScoreChange(student.id, "endTerm", e.target.value)}
                              className="w-16 bg-white border border-slate-300 focus:border-indigo-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                              placeholder={`/${maxEndTerm}`}
                              title="End of Term Exam (Independent)"
                            />
                          ) : (
                            <span className="font-bold text-slate-700">{endVal !== null ? endVal : "—"}</span>
                          )}
                        </td>

                        {/* Final / Total Mark */}
                        <td className="py-3 px-4 text-center bg-amber-50/40">
                          {canEdit ? (
                            <div className="inline-flex items-center gap-1 justify-center">
                              <input
                                type="number"
                                min={0}
                                max={currentMaxTotal}
                                value={draft.total}
                                onChange={(e) => handleScoreChange(student.id, "total", e.target.value)}
                                className="w-16 bg-white border-2 border-amber-300 focus:border-amber-600 rounded px-2 py-1 text-center font-bold text-amber-950 text-xs focus:outline-hidden"
                                placeholder={`/${currentMaxTotal}`}
                                title="Final subject mark (defaults to End Exam or custom)"
                              />
                              <span className="text-[10px] text-amber-700 font-bold">/{currentMaxTotal}</span>
                            </div>
                          ) : (
                            <span className="font-bold text-sm text-slate-900 font-mono">
                              {hasEnteredAny ? `${totalVal} / ${currentMaxTotal}` : "—"}
                            </span>
                          )}
                        </td>

                        {/* Percentage */}
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono font-bold text-xs text-slate-800">
                            {percentageVal !== null ? `${percentageVal}%` : "—"}
                          </span>
                        </td>

                        {/* ECZ Grade Point */}
                        <td className="py-3 px-4 text-center">
                          {isGrade4to7 && g7z ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                              g7z.point === 1
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : g7z.point === 2
                                ? "bg-sky-100 text-sky-800 border-sky-300"
                                : g7z.point === 3
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : g7z.point === 4
                                ? "bg-slate-100 text-slate-800 border-slate-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}>
                              Grade {g7z.point}
                            </span>
                          ) : gz ? (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                              gz.point <= 2
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : gz.point <= 4
                                ? "bg-sky-100 text-sky-800 border-sky-300"
                                : gz.point <= 6
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : gz.point <= 8
                                ? "bg-slate-100 text-slate-800 border-slate-300"
                                : "bg-rose-100 text-rose-800 border-rose-300"
                            }`}>
                              Grade {gz.point}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-mono">—</span>
                          )}
                        </td>

                        {/* Descriptor */}
                        <td className="py-3 px-4">
                          <span className="text-slate-700 font-medium text-xs">
                            {isGrade4to7 && g7z ? `${g7z.label} (${g7z.division})` : gz ? gz.label : "Pending entry"}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  // C.A. & Component Weighted Mode Row (Cumulative Sum)
                  return (
                    <tr key={student.id} className="hover:bg-slate-50/90 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-900">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Ref: {student.eczNo} • {student.grade} {student.stream}</p>
                      </td>

                      {/* Test 1 / C.A. */}
                      <td className="py-3 px-4 text-center">
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            max={maxTest1}
                            value={draft.test1}
                            onChange={(e) => handleScoreChange(student.id, "test1", e.target.value)}
                            className="w-16 bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                            placeholder={`/${maxTest1}`}
                          />
                        ) : (
                          <span className="font-bold text-slate-700">{t1Val !== null ? t1Val : "—"}</span>
                        )}
                      </td>

                      {/* Midterm Test */}
                      <td className="py-3 px-4 text-center">
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            max={maxTest2}
                            value={draft.test2}
                            onChange={(e) => handleScoreChange(student.id, "test2", e.target.value)}
                            className="w-16 bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                            placeholder={`/${maxTest2}`}
                          />
                        ) : (
                          <span className="font-bold text-slate-700">{t2Val !== null ? t2Val : "—"}</span>
                        )}
                      </td>

                      {/* End of Term Exam */}
                      <td className="py-3 px-4 text-center">
                        {canEdit ? (
                          <input
                            type="number"
                            min={0}
                            max={maxEndTerm}
                            value={draft.endTerm}
                            onChange={(e) => handleScoreChange(student.id, "endTerm", e.target.value)}
                            className="w-16 bg-white border border-slate-300 focus:border-emerald-500 rounded px-2 py-1 text-center font-bold text-slate-800 focus:outline-hidden"
                            placeholder={`/${maxEndTerm}`}
                          />
                        ) : (
                          <span className="font-bold text-slate-700">{endVal !== null ? endVal : "—"}</span>
                        )}
                      </td>

                      {/* Total Mark - ALWAYS EDITABLE */}
                      <td className="py-3 px-4 text-center bg-amber-50/40">
                        {canEdit ? (
                          <div className="inline-flex items-center gap-1 justify-center">
                            <input
                              type="number"
                              min={0}
                              max={currentMaxTotal}
                              value={draft.total}
                              onChange={(e) => handleScoreChange(student.id, "total", e.target.value)}
                              className="w-16 bg-white border-2 border-amber-300 focus:border-amber-600 rounded px-2 py-1 text-center font-bold text-amber-950 text-xs focus:outline-hidden"
                              placeholder={`/${currentMaxTotal}`}
                              title="Editable total mark (override or sum)"
                            />
                            <span className="text-[10px] text-amber-700 font-bold">/{currentMaxTotal}</span>
                          </div>
                        ) : (
                          <span className="font-bold text-sm text-slate-900 font-mono">
                            {hasEnteredAny ? `${totalVal} / ${currentMaxTotal}` : "—"}
                          </span>
                        )}
                      </td>

                      {/* Percentage */}
                      <td className="py-3 px-4 text-center">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {percentageVal !== null ? `${percentageVal}%` : "—"}
                        </span>
                      </td>

                      {/* ECZ Grade Point */}
                      <td className="py-3 px-4 text-center">
                        {isGrade4to7 && g7z ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                            g7z.point === 1
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : g7z.point === 2
                              ? "bg-sky-100 text-sky-800 border-sky-300"
                              : g7z.point === 3
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : g7z.point === 4
                              ? "bg-slate-100 text-slate-800 border-slate-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}>
                            Grade {g7z.point}
                          </span>
                        ) : gz ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${
                            gz.point <= 2
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : gz.point <= 4
                              ? "bg-sky-100 text-sky-800 border-sky-300"
                              : gz.point <= 6
                              ? "bg-amber-100 text-amber-800 border-amber-300"
                              : gz.point <= 8
                              ? "bg-slate-100 text-slate-800 border-slate-300"
                              : "bg-rose-100 text-rose-800 border-rose-300"
                          }`}>
                            Grade {gz.point}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono">—</span>
                        )}
                      </td>

                      {/* Descriptor */}
                      <td className="py-3 px-4">
                        <span className="text-slate-700 font-medium text-xs">
                          {isGrade4to7 && g7z ? `${g7z.label} (${g7z.division})` : gz ? gz.label : "Pending entry"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Marks / Results CSV Import Modal */}
      {showBulkMarksModal && (
        <BulkMarksImportModal
          isOpen={showBulkMarksModal}
          onClose={() => setShowBulkMarksModal(false)}
          classes={classes}
          students={students}
          gradebook={gradebook}
          onUpdateGradebook={onUpdateGradebook}
          initialClassId={selectedClassId}
          initialTerm={selectedTerm}
          initialSubject={selectedSubject}
          scoringMode={scoringMode}
          maxScale={primaryMaxScale}
        />
      )}
    </div>
  );
}
