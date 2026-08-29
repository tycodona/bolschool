import React, { useState, useEffect } from "react";
import { AcademicBatch, Teacher } from "../types";
import { X, Calendar, BookOpen, Users, CheckCircle2, Award } from "lucide-react";

interface BatchCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBatch: (batchData: AcademicBatch) => void;
  editingBatch?: AcademicBatch | null;
  teachers: Teacher[];
}

export function BatchCreationModal({
  isOpen,
  onClose,
  onSaveBatch,
  editingBatch,
  teachers
}: BatchCreationModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [academicYear, setAcademicYear] = useState<number>(2026);
  const [intakeTerm, setIntakeTerm] = useState<"Term 1" | "Term 2" | "Term 3">("Term 1");
  const [targetGrades, setTargetGrades] = useState<string[]>(["All Grades (Grades 1 to 12)"]);
  const [startDate, setStartDate] = useState("2026-01-12");
  const [endDate, setEndDate] = useState("2026-12-04");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Upcoming" | "Graduated" | "Archived">("Active");
  const [maxPupils, setMaxPupils] = useState<number>(100);
  const [leadTeacherId, setLeadTeacherId] = useState<number>(teachers[0]?.id || 1);

  const availableGradeOptions = [
    "All Grades (Grades 1 to 12)",
    "Primary (Grades 1-7)",
    "Grade 7 (Primary Exam)",
    "Junior Secondary (Grades 8-9)",
    "Grade 9 (JSSLE Exam)",
    "Senior Secondary (Grades 10-12)",
    "Grade 10",
    "Grade 11",
    "Grade 12 (ECZ Final)"
  ];

  useEffect(() => {
    if (editingBatch) {
      setName(editingBatch.name);
      setCode(editingBatch.code);
      setAcademicYear(editingBatch.academicYear);
      setIntakeTerm(editingBatch.intakeTerm);
      setTargetGrades(editingBatch.targetGrades && editingBatch.targetGrades.length ? editingBatch.targetGrades : ["All Grades (Grades 1 to 12)"]);
      setStartDate(editingBatch.startDate || "2026-01-12");
      setEndDate(editingBatch.endDate || "2026-12-04");
      setDescription(editingBatch.description || "");
      setStatus(editingBatch.status || "Active");
      setMaxPupils(editingBatch.maxPupils || 100);
      setLeadTeacherId(editingBatch.leadTeacherId || teachers[0]?.id || 1);
    } else {
      setName("2026 Academic Cohort");
      setCode(`BAT-${Date.now().toString().slice(-4)}`);
      setAcademicYear(2026);
      setIntakeTerm("Term 1");
      setTargetGrades(["All Grades (Grades 1 to 12)"]);
      setStartDate("2026-01-12");
      setEndDate("2026-12-04");
      setDescription("");
      setStatus("Active");
      setMaxPupils(100);
      setLeadTeacherId(teachers[0]?.id || 1);
    }
  }, [editingBatch, isOpen, teachers]);

  if (!isOpen) return null;

  const toggleGradeOption = (opt: string) => {
    if (opt === "All Grades (Grades 1 to 12)") {
      setTargetGrades(["All Grades (Grades 1 to 12)"]);
      return;
    }
    const filtered = targetGrades.filter(g => g !== "All Grades (Grades 1 to 12)");
    if (filtered.includes(opt)) {
      const next = filtered.filter(g => g !== opt);
      setTargetGrades(next.length ? next : ["All Grades (Grades 1 to 12)"]);
    } else {
      setTargetGrades([...filtered, opt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTeacher = teachers.find(t => t.id === leadTeacherId);
    const leadTeacherName = selectedTeacher ? selectedTeacher.name : undefined;

    const payload: AcademicBatch = {
      id: editingBatch ? editingBatch.id : `batch-${academicYear}-${Date.now().toString().slice(-4)}`,
      code: code.trim() || `BAT-${academicYear}`,
      name: name.trim() || `${academicYear} Academic Cohort`,
      academicYear: Number(academicYear) || 2026,
      intakeTerm,
      targetGrades,
      startDate,
      endDate,
      description: description.trim(),
      status,
      maxPupils: Number(maxPupils) || 100,
      leadTeacherName,
      leadTeacherId
    };

    onSaveBatch(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                {editingBatch ? "Edit Academic Batch / Cohort" : "Create New Academic Batch"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Group pupil streams into academic years, cohorts, and intake terms
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Batch Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Batch Title / Cohort Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 2026 Grade 7 Candidate Cohort"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs text-slate-800 font-medium"
                required
              />
            </div>

            {/* Batch Code */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Batch Code</label>
              <input
                type="text"
                placeholder="e.g. BAT-2026-G7"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Academic Year */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Academic Year</label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {[2025, 2026, 2027, 2028].map(yr => (
                  <option key={yr} value={yr}>{yr} Session</option>
                ))}
              </select>
            </div>

            {/* Intake Term */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Intake Term</label>
              <select
                value={intakeTerm}
                onChange={(e) => setIntakeTerm(e.target.value as "Term 1" | "Term 2" | "Term 3")}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                <option value="Term 1">Term 1 (January Intake)</option>
                <option value="Term 2">Term 2 (May Intake)</option>
                <option value="Term 3">Term 3 (September Intake)</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Cohort Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                <option value="Active">Active (Current)</option>
                <option value="Upcoming">Upcoming (Admissions)</option>
                <option value="Graduated">Graduated / Alumni</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Target Grades Tag Grid */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Applicable Grade Levels</span>
              <span className="text-[10px] text-slate-400">Click tags to toggle</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
              {availableGradeOptions.map(opt => {
                const isSelected = targetGrades.includes(opt);
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => toggleGradeOption(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1 ${
                      isSelected
                        ? "bg-amber-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>End / Graduation Date</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Lead Teacher / Coordinator */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Cohort Lead Teacher / Patron</span>
              </label>
              <select
                value={leadTeacherId}
                onChange={(e) => setLeadTeacherId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.primarySubject})
                  </option>
                ))}
              </select>
            </div>

            {/* Max Capacity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Max Pupil Cohort Capacity</span>
              </label>
              <input
                type="number"
                min="20"
                max="800"
                value={maxPupils}
                onChange={(e) => setMaxPupils(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Batch Description & Cohort Objective</label>
            <textarea
              rows={2}
              placeholder="e.g. National examination candidate batch with Saturday coaching and continuous assessment focus..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-xs text-slate-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{editingBatch ? "Save Batch Changes" : "Create Academic Batch"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
