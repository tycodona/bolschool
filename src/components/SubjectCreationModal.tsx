import React, { useState, useEffect } from "react";
import { SubjectDefinition, Teacher, SecondaryPathway, SchoolSection } from "../types";
import { X, BookOpen, Users, Clock, Award, BookmarkCheck, CheckCircle2 } from "lucide-react";

interface SubjectCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSubject: (subjectData: SubjectDefinition) => void;
  editingSubject?: SubjectDefinition | null;
  teachers: Teacher[];
}

export function SubjectCreationModal({
  isOpen,
  onClose,
  onSaveSubject,
  editingSubject,
  teachers
}: SubjectCreationModalProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState<"Core" | "Elective" | "Vocational / Practical" | "Religious & Moral">("Core");
  const [section, setSection] = useState<SchoolSection | "Both">("Secondary");
  const [gradesApplicable, setGradesApplicable] = useState<number[]>([10, 11, 12]);
  const [pathway, setPathway] = useState<SecondaryPathway | "">("");
  const [passMark, setPassMark] = useState<number>(50);
  const [weeklyPeriods, setWeeklyPeriods] = useState<number>(5);
  const [department, setDepartment] = useState("Natural Sciences");
  const [assignedTeacherId, setAssignedTeacherId] = useState<number>(teachers[0]?.id || 1);
  const [description, setDescription] = useState("");

  const departmentList = [
    "Mathematics & Computing",
    "Natural Sciences",
    "Languages",
    "Social Sciences",
    "Business Studies",
    "Practical Skills",
    "Religious & Moral Studies",
    "Creative & Expressive Arts"
  ];

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name);
      setCode(editingSubject.code);
      setCategory(editingSubject.category);
      setSection(editingSubject.section);
      setGradesApplicable(editingSubject.gradesApplicable || [10, 11, 12]);
      setPathway(editingSubject.pathway || "");
      setPassMark(editingSubject.passMark || 50);
      setWeeklyPeriods(editingSubject.weeklyPeriods || 5);
      setDepartment(editingSubject.department || "Natural Sciences");
      setAssignedTeacherId(editingSubject.assignedTeacherId || teachers[0]?.id || 1);
      setDescription(editingSubject.description || "");
    } else {
      setName("");
      setCode("");
      setCategory("Core");
      setSection("Secondary");
      setGradesApplicable([8, 9, 10, 11, 12]);
      setPathway("");
      setPassMark(50);
      setWeeklyPeriods(5);
      setDepartment("Natural Sciences");
      setAssignedTeacherId(teachers[0]?.id || 1);
      setDescription("");
    }
  }, [editingSubject, isOpen, teachers]);

  if (!isOpen) return null;

  const toggleGrade = (grade: number) => {
    if (gradesApplicable.includes(grade)) {
      const next = gradesApplicable.filter(g => g !== grade);
      setGradesApplicable(next.length ? next : [grade]);
    } else {
      setGradesApplicable([...gradesApplicable, grade].sort((a, b) => a - b));
    }
  };

  const handleSelectGradeGroup = (type: "primary" | "junior" | "senior" | "all") => {
    if (type === "primary") setGradesApplicable([1, 2, 3, 4, 5, 6, 7]);
    if (type === "junior") setGradesApplicable([8, 9]);
    if (type === "senior") setGradesApplicable([10, 11, 12]);
    if (type === "all") setGradesApplicable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTeacher = teachers.find(t => t.id === assignedTeacherId);
    const assignedTeacherName = selectedTeacher ? selectedTeacher.name : undefined;

    const payload: SubjectDefinition = {
      id: editingSubject ? editingSubject.id : `SUB-${code || Date.now().toString().slice(-4)}`,
      code: code.trim() || "N/A",
      name: name.trim(),
      category,
      section,
      gradesApplicable,
      pathway: pathway ? (pathway as SecondaryPathway) : undefined,
      passMark: Number(passMark) || 50,
      weeklyPeriods: Number(weeklyPeriods) || 5,
      department,
      assignedTeacherName,
      assignedTeacherId,
      description: description.trim()
    };

    onSaveSubject(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                {editingSubject ? "Edit Curriculum Subject" : "Add New Subject to Curriculum"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Define ECZ exam code, applicable grade levels, department, and teacher allocation
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
            {/* Subject Name */}
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Subject Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Pure Physics / Additional Mathematics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs text-slate-800 font-medium"
                required
              />
            </div>

            {/* Subject Code */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">ECZ / School Code</label>
              <input
                type="text"
                placeholder="e.g. 5124, 4024"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Department */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {departmentList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                <option value="Core">Core (Compulsory)</option>
                <option value="Elective">Elective Option</option>
                <option value="Vocational / Practical">Vocational / Practical</option>
                <option value="Religious & Moral">Religious & Moral</option>
              </select>
            </div>

            {/* Section */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">School Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                <option value="Primary">Primary Only (Grades 1-7)</option>
                <option value="Secondary">Secondary Only (Grades 8-12)</option>
                <option value="Both">Both (Full School)</option>
              </select>
            </div>
          </div>

          {/* Applicable Grades Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">Target Grade Levels</label>
              <div className="flex gap-1 text-[10px]">
                <button type="button" onClick={() => handleSelectGradeGroup("primary")} className="text-emerald-700 hover:underline">Primary</button>
                <span>•</span>
                <button type="button" onClick={() => handleSelectGradeGroup("junior")} className="text-sky-700 hover:underline">Junior</button>
                <span>•</span>
                <button type="button" onClick={() => handleSelectGradeGroup("senior")} className="text-purple-700 hover:underline">Senior</button>
                <span>•</span>
                <button type="button" onClick={() => handleSelectGradeGroup("all")} className="text-amber-700 hover:underline">All</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => {
                const isSelected = gradesApplicable.includes(g);
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => toggleGrade(g)}
                    className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pathway Mapping */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Senior Pathway Mapping (Optional)</label>
            <select
              value={pathway}
              onChange={(e) => setPathway(e.target.value as SecondaryPathway)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
            >
              <option value="">-- General / Applicable Across All Pathways --</option>
              <option value="Natural Sciences">Natural Sciences & STEM</option>
              <option value="Business & Commercial">Business & Commercial</option>
              <option value="Social Sciences & Humanities">Social Sciences & Humanities</option>
              <option value="Technical & Vocational">Technical & Vocational (TEVET)</option>
              <option value="Junior Secondary Core">Junior Secondary Foundational Core</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pass Mark */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Pass Mark (%)</span>
              </label>
              <input
                type="number"
                min="30"
                max="80"
                value={passMark}
                onChange={(e) => setPassMark(parseInt(e.target.value) || 50)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>

            {/* Weekly Periods */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Weekly Periods</span>
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={weeklyPeriods}
                onChange={(e) => setWeeklyPeriods(parseInt(e.target.value) || 5)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>

            {/* Subject Head / Assigned Teacher */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Subject Head</span>
              </label>
              <select
                value={assignedTeacherId}
                onChange={(e) => setAssignedTeacherId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Subject Syllabus & Learning Focus</label>
            <textarea
              rows={2}
              placeholder="e.g. ECZ syllabus specifications, laboratory requirements, and continuous assessment tests..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-xs text-slate-800"
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
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>{editingSubject ? "Save Subject Changes" : "Add Subject"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
