import React, { useState, useRef, ChangeEvent, DragEvent, useMemo } from "react";
import { Student, ClassStream } from "../types";
import {
  downloadClassSpecificStudentImportTemplateCsv,
  downloadStudentImportTemplateCsv,
  parseStudentImportCsv,
  ParsedStudentImportRow,
  StudentImportResult
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
  Users,
  Check,
  Sparkles,
  Info,
  GraduationCap,
  DoorOpen,
  UserCheck
} from "lucide-react";

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassStream[];
  existingStudents: Student[];
  onImportStudents: (newStudents: Omit<Student, "id">[]) => void;
  initialClassId?: number;
}

export function BulkStudentImportModal({
  isOpen,
  onClose,
  classes,
  existingStudents,
  onImportStudents,
  initialClassId
}: BulkStudentImportModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<number>(() => {
    if (initialClassId && classes.some(c => c.id === initialClassId)) {
      return initialClassId;
    }
    return classes[0]?.id || 1;
  });

  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<StudentImportResult | null>(null);
  const [defaultClassOverride, setDefaultClassOverride] = useState<string>(String(selectedClassId));
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedClass = useMemo(() => {
    return classes.find(c => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  const currentEnrolledCount = useMemo(() => {
    return existingStudents.filter(s => s.classId === selectedClassId).length;
  }, [existingStudents, selectedClassId]);

  if (!isOpen) return null;

  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    setDefaultClassOverride(String(classId));
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
        const result = parseStudentImportCsv(text, classes, existingStudents);
        setParsedData(result);
      }
      setIsProcessing(false);
    };
    reader.onerror = () => {
      alert("Error reading file. Please check file permissions and try again.");
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

  const handleDownloadClassTemplate = () => {
    if (selectedClass) {
      downloadClassSpecificStudentImportTemplateCsv(selectedClass);
    } else {
      downloadStudentImportTemplateCsv();
    }
  };

  const handleLoadSampleData = () => {
    if (!selectedClass) return;
    const isSec = selectedClass.gradeNum >= 8 || selectedClass.section === "Secondary";
    const pathway = selectedClass.pathway || (isSec ? (selectedClass.gradeNum <= 9 ? "Junior Secondary Core" : "Natural Sciences") : "");
    const baseAge = selectedClass.gradeNum === 0 ? 5 : Math.min(18, 5 + selectedClass.gradeNum);

    const sampleCsv = `Pupil Full Name,Gender,Age,Grade,Stream,Secondary Pathway,Reference No,Guardian Full Name,Guardian Phone,Guardian Email
Chilufya Mwape,Male,${baseAge},Grade ${selectedClass.gradeNum},${selectedClass.streamName},${pathway},26010045${String(selectedClass.id).padStart(2, "0")}1,Besa Mwape,+260 977 123456,besa.mwape@example.com
Mapalo Chileshe,Female,${baseAge},Grade ${selectedClass.gradeNum},${selectedClass.streamName},${pathway},26010045${String(selectedClass.id).padStart(2, "0")}2,Joyce Chileshe,+260 966 234567,joyce.c@example.com
Dalitso Sakala,Male,${baseAge},Grade ${selectedClass.gradeNum},${selectedClass.streamName},${pathway},26010045${String(selectedClass.id).padStart(2, "0")}3,Reuben Sakala,+260 955 345678,reuben.sakala@example.com
Kondwani Lungu,Male,${baseAge},Grade ${selectedClass.gradeNum},${selectedClass.streamName},${pathway},26010045${String(selectedClass.id).padStart(2, "0")}4,Patrick Lungu,+260 971 456789,patrick.l@example.com
Bupe Tembo,Female,${baseAge},Grade ${selectedClass.gradeNum},${selectedClass.streamName},${pathway},26010045${String(selectedClass.id).padStart(2, "0")}5,Dorothy Tembo,+260 978 567890,dorothy.t@example.com`;

    setFileName(`Sample_${selectedClass.name.replace(/\s+/g, "_")}_Pupils.csv`);
    setFileSize("1.2 KB");
    const result = parseStudentImportCsv(sampleCsv, classes, existingStudents);
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

    const overrideClassObj = defaultClassOverride !== "auto" 
      ? classes.find(c => c.id === parseInt(defaultClassOverride))
      : null;

    const studentsToEnrol: Omit<Student, "id">[] = parsedData.validRows.map(row => {
      const targetClass = overrideClassObj || classes.find(c => c.id === row.classId) || selectedClass || classes[0];
      const username = row.name.toLowerCase().replace(/[^a-z0-9]/g, ".") + (Math.floor(10 + Math.random() * 89));
      const gradeNum = targetClass.gradeNum;
      const isSec = gradeNum >= 8 || targetClass.section === "Secondary";

      return {
        eczNo: row.eczNo,
        name: row.name,
        gender: row.gender,
        grade: `Grade ${targetClass.gradeNum}`,
        stream: targetClass.streamName,
        classId: targetClass.id,
        section: isSec ? "Secondary" : "Primary",
        pathway: row.pathway || targetClass.pathway || (isSec ? "Junior Secondary Core" : undefined),
        age: row.age,
        guardianName: row.guardianName,
        guardianPhone: row.guardianPhone,
        guardianEmail: row.guardianEmail,
        status: "Active",
        username: username,
        password: "demo123"
      };
    });

    onImportStudents(studentsToEnrol);
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
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                Bulk Enrol Pupils by Class Stream
              </h2>
              <p className="text-xs text-slate-500">
                Download a class-tailored CSV template, fill in the pupil roster, and upload directly to that class
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
          
          {/* Class Selector Bar */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Select Target Class Stream for Template & Enrolment:</span>
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(parseInt(e.target.value))}
                  className="bg-white border border-emerald-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 shadow-2xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section || (c.gradeNum >= 8 ? "Secondary" : "Primary")}{c.pathway ? ` - ${c.pathway}` : ""})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass && (
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-900 bg-white/80 border border-emerald-200/80 px-3 py-2 rounded-xl">
                <span className="font-bold flex items-center gap-1">
                  <DoorOpen className="w-3.5 h-3.5 text-emerald-700" />
                  Room: {selectedClass.room || "Main Block"}
                </span>
                <span className="text-emerald-300">•</span>
                <span className="font-bold flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                  Teacher: {selectedClass.teacherName || "Unassigned"}
                </span>
                <span className="text-emerald-300">•</span>
                <span className="font-bold text-emerald-800">
                  Enrolled: {currentEnrolledCount} / {selectedClass.capacity || 100}
                </span>
              </div>
            )}
          </div>

          {/* Step 1 & 2 Guidance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Step 1: Download Class-Specific Template</span>
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  {selectedClass?.name || "Selected Class"}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Template pre-configured for <strong>{selectedClass?.name}</strong> with correct Grade, Stream, Section ({selectedClass?.section || (selectedClass?.gradeNum >= 8 ? "Secondary" : "Primary")}){selectedClass?.pathway ? ` and ${selectedClass.pathway}` : ""}.
              </p>
              <button
                type="button"
                onClick={handleDownloadClassTemplate}
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedClass?.name || "Class"} CSV Template</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-600" />
                  <span>Quick Test Option</span>
                </span>
                <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                  Instant Demo
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Test enrolment for <strong>{selectedClass?.name}</strong> instantly with 5 sample Zambian pupil records matching this class level.
              </p>
              <button
                type="button"
                onClick={handleLoadSampleData}
                className="w-full py-2 px-3 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded-lg font-bold text-sky-800 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Load 5 Sample Pupils for {selectedClass?.name}</span>
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
              id="csv-file-upload-input"
            />

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-emerald-500 bg-emerald-50/50 scale-[0.99]"
                  : "border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">
                    Drag and drop your completed CSV file for {selectedClass?.name} here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    or click anywhere in this box to browse from your computer
                  </p>
                </div>

                {fileName && (
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-bold border border-emerald-300">
                    <FileText className="w-4 h-4 text-emerald-700" />
                    <span>{fileName}</span>
                    <span className="text-[10px] text-emerald-700 font-mono">({fileSize})</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Parse Results Preview Table */}
          {parsedData && (
            <div className="space-y-4">
              {/* Summary Metrics Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-100 rounded-xl border border-slate-200">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{validCount} Ready for Enrolment</span>
                  </div>
                  {warningCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{warningCount} Warnings (Auto-resolved)</span>
                    </div>
                  )}
                  {invalidCount > 0 && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                      <XCircle className="w-4 h-4" />
                      <span>{invalidCount} Invalid Rows</span>
                    </div>
                  )}
                </div>

                {/* Class Assignment Target */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-medium">Assign Enrolment Class:</span>
                  <select
                    value={defaultClassOverride}
                    onChange={(e) => setDefaultClassOverride(e.target.value)}
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800"
                  >
                    <option value={String(selectedClassId)}>Selected Class: {selectedClass?.name}</option>
                    <option value="auto">Auto-detect from CSV columns</option>
                    {classes.filter(c => c.id !== selectedClassId).map(cls => (
                      <option key={cls.id} value={cls.id}>
                        Force assign to: {cls.name}
                      </option>
                    ))}
                  </select>
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
                        <th className="py-2 px-3">Gender / Age</th>
                        <th className="py-2 px-3">Target Class</th>
                        <th className="py-2 px-3">Reference No</th>
                        <th className="py-2 px-3">Guardian & Contact</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {parsedData.validRows.map((row, idx) => {
                        const targetClassObj = defaultClassOverride !== "auto"
                          ? classes.find(c => c.id === parseInt(defaultClassOverride))
                          : classes.find(c => c.id === row.classId);

                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 text-slate-400 font-mono">{idx + 1}</td>
                            <td className="py-2 px-3 font-bold text-slate-900">{row.name}</td>
                            <td className="py-2 px-3 text-slate-600">{row.gender}, {row.age} yrs</td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                {targetClassObj?.name || row.className}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-[10px] text-slate-600">{row.eczNo}</td>
                            <td className="py-2 px-3 text-slate-600">
                              <div>{row.guardianName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{row.guardianPhone}</div>
                            </td>
                            <td className="py-2 px-3 text-center">
                              {row.status === "Valid" ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <Check className="w-3 h-3" /> Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full" title={row.notes}>
                                  <AlertTriangle className="w-3 h-3" /> Adjusted
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove from import"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Users className="w-4 h-4" />
            <span>Confirm & Enrol {validCount} Pupils to {selectedClass?.name || "Class"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
