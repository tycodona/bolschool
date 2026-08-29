import React, { useState, useEffect } from "react";
import { ClassStream, Teacher, AcademicBatch, SecondaryPathway, SchoolSection } from "../types";
import { SECONDARY_PATHWAYS } from "../data/zambianSchoolData";
import { X, Layers, Users, BookOpen, GraduationCap, Building2 } from "lucide-react";

interface ClassCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveClass: (classData: Omit<ClassStream, "id"> | ClassStream) => void;
  editingClass?: ClassStream | null;
  teachers: Teacher[];
  batches: AcademicBatch[];
}

export function ClassCreationModal({
  isOpen,
  onClose,
  onSaveClass,
  editingClass,
  teachers,
  batches
}: ClassCreationModalProps) {
  const [gradeLevelKey, setGradeLevelKey] = useState<string>("Grade 7");
  const [streamName, setStreamName] = useState<string>("Eagle");
  const [customStreamName, setCustomStreamName] = useState<string>("");
  const [section, setSection] = useState<SchoolSection>("Primary");
  const [pathway, setPathway] = useState<SecondaryPathway | "">("");
  const [teacherId, setTeacherId] = useState<number>(teachers[0]?.id || 1);
  const [batchId, setBatchId] = useState<string>(batches[0]?.id || "batch-2026-main");
  const [room, setRoom] = useState<string>("Block C - Room 2");
  const [capacity, setCapacity] = useState<number>(40);
  const [description, setDescription] = useState<string>("");

  useEffect(() => {
    if (editingClass) {
      if (editingClass.name.toLowerCase().includes("baby")) setGradeLevelKey("Baby Class");
      else if (editingClass.name.toLowerCase().includes("middle")) setGradeLevelKey("Middle Class");
      else if (editingClass.name.toLowerCase().includes("reception")) setGradeLevelKey("Reception");
      else if (editingClass.name.toLowerCase().includes("form 1")) setGradeLevelKey("Form 1");
      else if (editingClass.name.toLowerCase().includes("form 2")) setGradeLevelKey("Form 2");
      else if (editingClass.name.toLowerCase().includes("form 3")) setGradeLevelKey("Form 3");
      else if (editingClass.name.toLowerCase().includes("form 4")) setGradeLevelKey("Form 4");
      else setGradeLevelKey(`Grade ${editingClass.gradeNum || 7}`);

      const standardStreams = ["Eagle", "Rhino", "Blue", "Gold", "Alpha", "Beta", "Science", "Commerce", "Arts", "Technical", "STEM", "Sunshine", "Rainbow", "Stars"];
      if (standardStreams.includes(editingClass.streamName)) {
        setStreamName(editingClass.streamName);
        setCustomStreamName("");
      } else {
        setStreamName("Custom");
        setCustomStreamName(editingClass.streamName);
      }
      setSection(editingClass.section || "Primary");
      setPathway(editingClass.pathway || "");
      setTeacherId(editingClass.teacherId || teachers[0]?.id || 1);
      setBatchId(editingClass.batchId || batches[0]?.id || "batch-2026-main");
      setRoom(editingClass.room || "Block A - Room 1");
      setCapacity(editingClass.capacity || 40);
      setDescription(editingClass.description || "");
    } else {
      setGradeLevelKey("Grade 7");
      setStreamName("Eagle");
      setCustomStreamName("");
      setSection("Primary");
      setPathway("");
      setTeacherId(teachers[0]?.id || 1);
      setBatchId(batches[0]?.id || "batch-2026-main");
      setRoom("Block C - Room 2");
      setCapacity(40);
      setDescription("");
    }
  }, [editingClass, isOpen, teachers, batches]);

  // Handle grade change and auto-set section & pathway defaults
  const handleGradeKeyChange = (newKey: string) => {
    setGradeLevelKey(newKey);
    if (newKey === "Baby Class" || newKey === "Middle Class" || newKey === "Reception") {
      setSection("Early Childhood");
      setPathway("");
    } else if (newKey.startsWith("Grade")) {
      setSection("Primary");
      setPathway("");
    } else if (newKey === "Form 1" || newKey === "Form 2") {
      setSection("Secondary");
      setPathway("Junior Secondary Core");
    } else {
      setSection("Secondary");
      if (!pathway || pathway === "Junior Secondary Core") {
        setPathway("Natural Sciences");
      }
    }
  };

  if (!isOpen) return null;

  const actualStream = streamName === "Custom" ? customStreamName.trim() || "Stream A" : streamName;
  const isExamClass = gradeLevelKey === "Grade 7" || gradeLevelKey === "Form 2" || gradeLevelKey === "Form 4";
  const computedClassName = `${gradeLevelKey} ${actualStream}${isExamClass ? " (Exam)" : ""}`;

  let numericGrade = 7;
  if (gradeLevelKey.startsWith("Grade")) {
    numericGrade = parseInt(gradeLevelKey.replace("Grade ", "")) || 7;
  } else if (gradeLevelKey === "Form 1") numericGrade = 8;
  else if (gradeLevelKey === "Form 2") numericGrade = 9;
  else if (gradeLevelKey === "Form 3") numericGrade = 10;
  else if (gradeLevelKey === "Form 4") numericGrade = 12;
  else numericGrade = 0;

  const gradeNum = numericGrade;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedTeacher = teachers.find(t => t.id === teacherId);
    const teacherName = selectedTeacher ? selectedTeacher.name : "Assigned Class Teacher";

    const payload = {
      name: computedClassName,
      gradeNum: numericGrade,
      streamName: actualStream,
      section,
      pathway: pathway ? (pathway as SecondaryPathway) : undefined,
      batchId,
      teacherId,
      teacherName,
      room: room.trim() || "Main Classroom",
      capacity: Number(capacity) || 40,
      description: description.trim()
    };

    if (editingClass) {
      onSaveClass({
        ...editingClass,
        ...payload
      });
    } else {
      onSaveClass(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                {editingClass ? "Edit Class / Stream Details" : "Create New Class / Stream"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Configure grade level, stream name, class teacher, and academic cohort
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
          {/* Live Preview Pill */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-800">Preview Class Name</span>
              <div className="text-sm font-bold text-emerald-950 font-serif">{computedClassName}</div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              section === "Primary"
                ? "bg-amber-100 text-amber-800 border-amber-300"
                : "bg-sky-100 text-sky-800 border-sky-300"
            }`}>
              {section} Section
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Grade Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Grade Level <span className="text-rose-500">*</span>
              </label>
              <select
                value={gradeLevelKey}
                onChange={(e) => handleGradeKeyChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                <optgroup label="Early Childhood Education (ECE)">
                  <option value="Baby Class">Baby Class (Ages 3 - 4)</option>
                  <option value="Middle Class">Middle Class (Ages 4 - 5)</option>
                  <option value="Reception">Reception (Ages 5 - 6)</option>
                </optgroup>
                <optgroup label="Primary Section (Grades 1 - 7)">
                  {[1, 2, 3, 4, 5, 6, 7].map(g => (
                    <option key={g} value={`Grade ${g}`}>Grade {g} {g === 7 ? "• ECZ Exam Candidate" : ""}</option>
                  ))}
                </optgroup>
                <optgroup label="Junior Secondary (Forms 1 - 2)">
                  <option value="Form 1">Form 1 (Junior Secondary)</option>
                  <option value="Form 2">Form 2 (JSCE Exam Candidate)</option>
                </optgroup>
                <optgroup label="Senior Secondary (Forms 3 - 4)">
                  <option value="Form 3">Form 3 (Senior Pathway Placements)</option>
                  <option value="Form 4">Form 4 (ECZ Graduating Finalist)</option>
                </optgroup>
              </select>
            </div>

            {/* Stream Selection */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Stream / Division Name <span className="text-rose-500">*</span>
              </label>
              <select
                value={streamName}
                onChange={(e) => setStreamName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                <option value="Eagle">Eagle</option>
                <option value="Rhino">Rhino</option>
                <option value="Blue">Blue</option>
                <option value="Gold">Gold</option>
                <option value="Alpha">Alpha</option>
                <option value="Beta">Beta</option>
                <option value="Science">Science</option>
                <option value="Commerce">Commerce</option>
                <option value="Arts">Arts</option>
                <option value="Technical">Technical</option>
                <option value="STEM">STEM</option>
                <option value="Custom">+ Custom Stream Name...</option>
              </select>
            </div>
          </div>

          {/* Custom Stream Input if selected */}
          {streamName === "Custom" && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Custom Stream Title</label>
              <input
                type="text"
                placeholder="e.g. Victoria / Zambezi / Diamond"
                value={customStreamName}
                onChange={(e) => setCustomStreamName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                required
              />
            </div>
          )}

          {/* Secondary Pathway (For Grades 8-12) */}
          {gradeNum >= 8 && (
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                <span>Secondary Career Pathway</span>
              </label>
              <select
                value={pathway}
                onChange={(e) => setPathway(e.target.value as SecondaryPathway)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {gradeNum <= 9 ? (
                  <option value="Junior Secondary Core">Junior Secondary Foundational Core</option>
                ) : (
                  <>
                    <option value="Natural Sciences">Natural Sciences & STEM (Physics, Chemistry, Biology)</option>
                    <option value="Business & Commercial">Business & Commercial (Accounts, Commerce, Economics)</option>
                    <option value="Social Sciences & Humanities">Social Sciences & Humanities (History, Literature, Geography)</option>
                    <option value="Technical & Vocational">Technical & Vocational TEVET (D&T, Agribusiness, Tech Drawing)</option>
                  </>
                )}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned Class Teacher */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Class Teacher <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.primarySubject})
                  </option>
                ))}
              </select>
            </div>

            {/* Academic Batch Cohort */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Academic Batch Cohort <span className="text-rose-500">*</span></span>
              </label>
              <select
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
              >
                {batches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.academicYear})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Room / Venue */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Assigned Classroom / Lab</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Block C - Room 3 / Science Lab 1"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
              />
            </div>

            {/* Max Capacity */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Max Class Capacity (Up to 100 Pupils)</label>
              <input
                type="number"
                min="5"
                max="100"
                value={capacity}
                onChange={(e) => setCapacity(Math.min(100, Math.max(1, parseInt(e.target.value) || 40)))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                placeholder="e.g. 50 (Max 100)"
              />
              <p className="text-[10px] text-slate-400 mt-1">Maximum capacity allowed is 100 pupils per stream.</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Class Stream Notes / Description</label>
            <textarea
              rows={2}
              placeholder="e.g. Primary exam candidate stream with intensive morning revision program..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
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
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{editingClass ? "Save Changes" : "Create Class Stream"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
