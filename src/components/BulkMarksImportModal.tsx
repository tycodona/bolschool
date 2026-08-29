import React, { useState, useRef, ChangeEvent, DragEvent, useMemo } from "react";
import { Student, ClassStream, GradebookData } from "../types";
import {
  downloadClassMarksTemplateCsv,
  parseClassMarksCsv,
  ParsedClassMarkRow,
  ClassMarksImportResult
} from "../utils/csvExporter";
import {
  Upload,
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  Trash2,
  Check,
  Sparkles,
  Layers,
  GraduationCap,
  Award,
  BookOpen,
  Sliders
} from "lucide-react";
import { getZambianSubjectsForGrade, calculateEczGrade, calculateGrade7EczGrade, isGrade4to7Class } from "../data/zambianSchoolData";

interface BulkMarksImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassStream[];
  students: Student[];
  gradebook: GradebookData;
  onUpdateGradebook: (newGradebook: GradebookData) => void;
  initialClassId?: number;
  initialTerm?: string;
  initialSubject?: string;
  scoringMode?: "ca_weighted" | "raw" | "independent";
  maxScale?: 150 | 100;
}

export function BulkMarksImportModal({
  isOpen,
  onClose,
  classes,
  students,
  gradebook,
  onUpdateGradebook,
  initialClassId,
  initialTerm = "Term 1",
  initialSubject,
  scoringMode = "raw",
  maxScale = 100
}: BulkMarksImportModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<number>(() => {
    if (initialClassId && classes.some(c => c.id === initialClassId)) {
      return initialClassId;
    }
    return classes[0]?.id || 1;
  });

  const [selectedTerm, setSelectedTerm] = useState<string>(initialTerm);
  
  const targetClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const availableSubjects = useMemo(() => {
    return getZambianSubjectsForGrade(targetClass?.gradeNum || 7, targetClass?.pathway);
  }, [targetClass]);

  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    if (initialSubject && availableSubjects.includes(initialSubject)) {
      return initialSubject;
    }
    return availableSubjects[0] || "English Language";
  });

  const isPrimary = (targetClass?.gradeNum ?? 7) <= 7 || targetClass?.section === "Primary";
  const isUpperPrimary = isGrade4to7Class(targetClass);
  const [activeScale, setActiveScale] = useState<150 | 100>(() => {
    if (maxScale === 150) return 150;
    if (maxScale === 100) return 100;
    return isUpperPrimary ? 150 : 100;
  });

  const [activeScoringMode, setActiveScoringMode] = useState<"ca_weighted" | "raw" | "independent">(scoringMode);

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ClassMarksImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const classStudents = useMemo(() => {
    return students.filter(s => s.classId === selectedClassId);
  }, [students, selectedClassId]);

  if (!isOpen) return null;

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    const cls = classes.find(c => c.id === classId) || classes[0];
    const subjs = getZambianSubjectsForGrade(cls.gradeNum, cls.pathway);
    if (!subjs.includes(selectedSubject)) {
      setSelectedSubject(subjs[0] || "English Language");
    }
    const clsIsUpperPrimary = isGrade4to7Class(cls);
    setActiveScale(clsIsUpperPrimary ? 150 : 100);
    setParsedData(null);
    setFileName(null);
  };

  const handleDownloadTemplate = () => {
    if (!targetClass) return;
    downloadClassMarksTemplateCsv({
      targetClass,
      term: selectedTerm,
      subject: selectedSubject,
      students,
      gradebook,
      scoringMode: activeScoringMode,
      maxScale: activeScale
    });
  };

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      alert("Please select a valid CSV (.csv) file format.");
      return;
    }

    setFileName(file.name);
    setFileSize((file.size / 1024).toFixed(1) + " KB");
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const result = parseClassMarksCsv(
          text,
          targetClass,
          selectedTerm,
          selectedSubject,
          classStudents,
          activeScoringMode,
          activeScale
        );
        setParsedData(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert("Error reading file. Please check permissions and try again.");
      setIsProcessing(false);
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleMarks = () => {
    if (classStudents.length === 0) {
      alert(`No pupils currently enrolled in ${targetClass.name}. Enrol pupils first to upload marks.`);
      return;
    }

    const test1Limit = activeScale === 150 ? 45 : 25;
    const test2Limit = activeScale === 150 ? 45 : 18;
    const endTermLimit = activeScale === 150 ? 45 : 45;

    const sampleRows = classStudents.slice(0, 15).map((s, idx) => {
      const t1 = Math.min(test1Limit, 25 + ((idx * 7) % 20));
      const t2 = Math.min(test2Limit, 12 + ((idx * 5) % 15));
      const end = Math.min(endTermLimit, 28 + ((idx * 6) % 20));
      const tot = t1 + t2 + end;
      return `${s.id},${s.eczNo},${s.name},${s.gender},${targetClass.name},${selectedTerm},${selectedSubject},${t1},${t2},${end},${tot},Satisfactory performance`;
    });

    const csvText = `# BREAD OF LIFE SCHOOL - CLASS MARKSHEET UPLOAD TEMPLATE
# Target Class: ${targetClass.name} | Term: ${selectedTerm} | Subject: ${selectedSubject}
Pupil ID,Reference No,Pupil Full Name,Gender,Class Stream,Academic Term,Subject,Test 1 / C.A.,Test 2 / Midterm,End of Term Exam,Total Mark,Teacher Remark
${sampleRows.join("\n")}`;

    setFileName(`Sample_${targetClass.name.replace(/\s+/g, "_")}_${selectedSubject.replace(/\s+/g, "_")}_Marks.csv`);
    setFileSize("1.5 KB");
    const result = parseClassMarksCsv(
      csvText,
      targetClass,
      selectedTerm,
      selectedSubject,
      classStudents,
      activeScoringMode,
      activeScale
    );
    setParsedData(result);
  };

  const handleRemoveRow = (index: number) => {
    if (!parsedData) return;
    const updated = [...parsedData.validRows];
    updated.splice(index, 1);
    setParsedData({
      ...parsedData,
      validRows: updated
    });
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.validRows.length === 0) return;

    const updatedGb: GradebookData = JSON.parse(JSON.stringify(gradebook));

    if (!updatedGb[selectedClassId]) updatedGb[selectedClassId] = {};
    if (!updatedGb[selectedClassId][selectedTerm]) updatedGb[selectedClassId][selectedTerm] = {};
    if (!updatedGb[selectedClassId][selectedTerm][selectedSubject]) {
      updatedGb[selectedClassId][selectedTerm][selectedSubject] = {};
    }

    const isGrade4to7 = isGrade4to7Class(targetClass);

    parsedData.validRows.forEach(row => {
      const percentage = activeScale === 150 ? Math.min(100, Math.round((row.totalScore / 150) * 100)) : row.totalScore;
      const gz = calculateEczGrade(percentage);
      const g7z = calculateGrade7EczGrade(percentage);

      updatedGb[selectedClassId][selectedTerm][selectedSubject][row.studentId] = {
        caScore: row.test1Score,
        test1Score: row.test1Score,
        test2Score: row.test2Score,
        midTermScore: row.test2Score,
        endTermScore: row.endTermScore,
        totalScore: row.totalScore,
        maxScore: activeScale,
        percentage,
        rawScore: row.totalScore,
        scoringMode: activeScoringMode,
        eczGrade: isGrade4to7 ? (g7z.point as any) : (gz.point as any),
        grade7Grade: isGrade4to7 ? g7z.point : undefined,
        grade7Division: isGrade4to7 ? g7z.division : undefined,
        remark: row.remark || (isGrade4to7 ? `${g7z.label} (${g7z.division})` : gz.label),
        teacherInitials: targetClass.teacherName ? targetClass.teacherName.split(" ").map(w => w[0]).join("") : "T.C."
      };
    });

    onUpdateGradebook(updatedGb);
    onClose();
  };

  const validCount = parsedData?.validRows.length || 0;
  const invalidCount = parsedData?.invalidRows.length || 0;
  const warningCount = parsedData?.validRows.filter(r => r.status === "Warning").length || 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Bulk Upload Marks & Results by Class
              </h2>
              <p className="text-xs text-slate-500">
                Download pre-populated class marksheet with enrolled pupils, fill test scores, and import in batch
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          
          {/* Class, Term & Subject Configuration Bar */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Class Selector */}
              <div>
                <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Target Class Stream:</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(parseInt(e.target.value))}
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section || (c.gradeNum >= 8 ? "Secondary" : "Primary")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Term Selector */}
              <div>
                <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Academic Term:</span>
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>

              {/* Subject Selector */}
              <div>
                <label className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Subject:</span>
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {availableSubjects.map(sub => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Scale & Mode Options */}
            <div className="pt-2 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-[11px]">
              <div className="flex items-center gap-3">
                <span className="font-bold text-indigo-950 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-700" /> Scoring Mode:
                </span>
                <label className="inline-flex items-center gap-1 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="modalScoringMode"
                    value="ca_weighted"
                    checked={activeScoringMode === "ca_weighted"}
                    onChange={() => setActiveScoringMode("ca_weighted")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>C.A. + Midterm + End Term</span>
                </label>
                <label className="inline-flex items-center gap-1 font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="modalScoringMode"
                    value="raw"
                    checked={activeScoringMode === "raw"}
                    onChange={() => setActiveScoringMode("raw")}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Raw Total Mark</span>
                </label>
              </div>

              {isPrimary && (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-indigo-950">Scale:</span>
                  <div className="inline-flex bg-white border border-indigo-200 rounded-lg p-0.5 font-bold">
                    <button
                      type="button"
                      onClick={() => setActiveScale(150)}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeScale === 150 ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Max 150 (Primary)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveScale(100)}
                      className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                        activeScale === 100 ? "bg-indigo-600 text-white" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Max 100
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-600" />
                  <span>Step 1: Download Class Marksheet Template</span>
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                  {classStudents.length} Pupils Enrolled
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Pre-populated with all pupils in <strong>{targetClass.name}</strong> for <strong>{selectedSubject}</strong> ({selectedTerm}).
              </p>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {targetClass.name} Marksheet (.csv)</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Quick Test Option</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Instant Preview
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Generate sample mock test scores for {targetClass.name} pupils to preview and verify calculations before saving.
              </p>
              <button
                type="button"
                onClick={handleLoadSampleMarks}
                className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg font-bold text-emerald-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load Sample Marks for {targetClass.name}</span>
              </button>
            </div>
          </div>

          {/* Upload Drop Zone */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              onChange={handleFileInput}
              className="hidden"
              id="csv-marks-file-upload-input"
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
                  : "border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Drag and drop your completed Marksheet CSV for {targetClass.name} ({selectedSubject})
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    or click anywhere in this box to browse from your computer
                  </p>
                </div>

                {fileName && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-100 text-indigo-900 rounded-lg text-xs font-bold border border-indigo-300">
                    <FileText className="w-4 h-4 text-indigo-700" />
                    <span>{fileName}</span>
                    <span className="text-[10px] text-indigo-700 font-mono">({fileSize})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Parse Results Preview Table */}
          {parsedData && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validCount} Marks Ready to Commit</span>
                  </div>
                  {warningCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{warningCount} Warnings</span>
                    </div>
                  )}
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                      <XCircle className="w-4 h-4" />
                      <span>{invalidCount} Invalid Rows</span>
                    </div>
                  )}
                </div>

                <div className="text-[11px] font-bold text-slate-600">
                  Target: <span className="text-indigo-800">{targetClass.name}</span> • <span className="text-indigo-800">{selectedSubject}</span> ({selectedTerm})
                </div>
              </div>

              {/* Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-700 font-bold">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Pupil Name</th>
                        <th className="py-2 px-3">Reference No</th>
                        <th className="py-2 px-3 text-center">Test 1</th>
                        <th className="py-2 px-3 text-center">Test 2</th>
                        <th className="py-2 px-3 text-center">End Term</th>
                        <th className="py-2 px-3 text-center">Total Mark</th>
                        <th className="py-2 px-3 text-center">ECZ Grade</th>
                        <th className="py-2 px-3">Teacher Remark</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parsedData.validRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                          <td className="py-2 px-3 font-bold text-slate-900">{row.studentName}</td>
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{row.eczNo}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">{row.test1Score}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">{row.test2Score}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">{row.endTermScore}</td>
                          <td className="py-2 px-3 text-center">
                            <span className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {row.totalScore} / {activeScale}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isUpperPrimary
                                ? row.eczGrade === 1 ? "bg-emerald-100 text-emerald-800" :
                                  row.eczGrade === 2 ? "bg-sky-100 text-sky-800" :
                                  row.eczGrade === 3 ? "bg-amber-100 text-amber-800" :
                                  row.eczGrade === 4 ? "bg-slate-100 text-slate-800" :
                                  "bg-rose-100 text-rose-800"
                                : row.eczGrade <= 2 ? "bg-emerald-100 text-emerald-800" :
                                  row.eczGrade <= 4 ? "bg-sky-100 text-sky-800" :
                                  row.eczGrade <= 6 ? "bg-amber-100 text-amber-800" :
                                  row.eczGrade <= 8 ? "bg-slate-100 text-slate-800" :
                                  "bg-rose-100 text-rose-800"
                            }`}>
                              Grade {row.eczGrade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 italic truncate max-w-[140px]">{row.remark}</td>
                          <td className="py-2 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-slate-700 text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!parsedData || validCount === 0}
            onClick={handleConfirmImport}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>Commit {validCount} Marks to Gradebook for {targetClass.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
