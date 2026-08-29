import React, { useState, useEffect } from "react";
import { Student, ClassStream, AcademicBatch, SecondaryPathway, SchoolSection } from "../types";
import { SECONDARY_PATHWAYS } from "../data/zambianSchoolData";
import { X, UserPlus, Users, Sparkles, BookOpen, GraduationCap, Phone, Mail, Home, KeyRound } from "lucide-react";

interface StudentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveStudent: (studentData: Omit<Student, "id"> | Student) => void;
  editingStudent?: Student | null;
  classes: ClassStream[];
  batches: AcademicBatch[];
}

export function StudentCreationModal({
  isOpen,
  onClose,
  onSaveStudent,
  editingStudent,
  classes,
  batches
}: StudentCreationModalProps) {
  const [name, setName] = useState("");
  const [eczNo, setEczNo] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [classId, setClassId] = useState<number>(classes[0]?.id || 1);
  const [batchId, setBatchId] = useState<string>(batches[0]?.id || "batch-2026-main");
  const [age, setAge] = useState("12");
  const [dob, setDob] = useState("2014-05-15");
  const [pathway, setPathway] = useState<SecondaryPathway | "">("");
  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianRelation, setGuardianRelation] = useState("Parent / Guardian");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Student["status"]>("Active");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Selected Class details
  const selectedClass = classes.find(c => c.id === classId) || classes[0];

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setEczNo(editingStudent.eczNo);
      setGender(editingStudent.gender);
      setClassId(editingStudent.classId);
      setBatchId(editingStudent.batchId || batches[0]?.id || "batch-2026-main");
      setAge(editingStudent.age.toString());
      setDob(editingStudent.dob || "2014-05-15");
      setPathway(editingStudent.pathway || "");
      setGuardianName(editingStudent.guardianName);
      setGuardianPhone(editingStudent.guardianPhone);
      setGuardianEmail(editingStudent.guardianEmail);
      setGuardianRelation(editingStudent.guardianRelation || "Parent / Guardian");
      setAddress(editingStudent.address || "");
      setStatus(editingStudent.status);
      setUsername(editingStudent.username || editingStudent.name.trim().split(" ")[0].toLowerCase());
      setPassword(editingStudent.password || "");
    } else {
      setName("");
      const randNum = Math.floor(1000 + Math.random() * 9000);
      setEczNo(`26010045${randNum}`);
      setGender("Male");
      setClassId(classes[0]?.id || 1);
      setBatchId(batches[0]?.id || "batch-2026-main");
      setAge("12");
      setDob("2014-05-15");
      setPathway(classes[0]?.pathway || "");
      setGuardianName("");
      setGuardianPhone("+260 97");
      setGuardianEmail("");
      setGuardianRelation("Parent / Guardian");
      setAddress("Lusaka, Zambia");
      setStatus("Active");
      setUsername("");
      setPassword("");
    }
  }, [editingStudent, isOpen, classes, batches]);

  // When class changes, adjust pathway if needed
  const handleClassChange = (newClassId: number) => {
    setClassId(newClassId);
    const cls = classes.find(c => c.id === newClassId);
    if (cls) {
      if (cls.pathway) {
        setPathway(cls.pathway);
      } else if (cls.gradeNum >= 8) {
        setPathway(cls.gradeNum <= 9 ? "Junior Secondary Core" : "Natural Sciences");
      } else {
        setPathway("");
      }
      if (cls.batchId) {
        setBatchId(cls.batchId);
      }
    }
  };

  const handleGenerateEcz = () => {
    const yr = "26"; // 2026
    const centre = "010045";
    const seq = Math.floor(1000 + Math.random() * 9000);
    setEczNo(`${yr}${centre}${seq}`);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cls = selectedClass;
    let grade = "Grade 7";
    if (cls) {
      if (cls.name.toLowerCase().includes("baby")) grade = "Baby Class";
      else if (cls.name.toLowerCase().includes("middle")) grade = "Middle Class";
      else if (cls.name.toLowerCase().includes("reception")) grade = "Reception";
      else if (cls.name.toLowerCase().includes("form 1")) grade = "Form 1";
      else if (cls.name.toLowerCase().includes("form 2")) grade = "Form 2";
      else if (cls.name.toLowerCase().includes("form 3")) grade = "Form 3";
      else if (cls.name.toLowerCase().includes("form 4")) grade = "Form 4";
      else if (cls.name.toLowerCase().startsWith("grade")) {
        const parts = cls.name.split(" ");
        grade = `${parts[0]} ${parts[1] || cls.gradeNum}`;
      } else {
        grade = `Grade ${cls.gradeNum}`;
      }
    }
    const stream = cls?.streamName || "Eagle";
    const section: SchoolSection = cls?.section || (cls?.gradeNum === 0 ? "Early Childhood" : ((cls?.gradeNum || 7) >= 8 ? "Secondary" : "Primary"));

    const firstName = name.trim().split(" ")[0].toLowerCase() || "student";
    const finalUsername = (username.trim() || firstName).toLowerCase();
    const finalPassword = password.trim();

    const payload = {
      name: name.trim(),
      eczNo: eczNo.trim(),
      gender,
      grade,
      stream,
      classId,
      batchId,
      age: parseInt(age) || 12,
      dob,
      section,
      pathway: pathway ? (pathway as SecondaryPathway) : undefined,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianEmail: guardianEmail.trim() || `${finalUsername}.guardian@gmail.com`,
      guardianRelation,
      address: address.trim(),
      status,
      username: finalUsername,
      password: finalPassword || editingStudent?.password || undefined,
      enrollmentDate: editingStudent?.enrollmentDate || "2026-01-12"
    };

    if (editingStudent) {
      onSaveStudent({
        ...editingStudent,
        ...payload
      });
    } else {
      onSaveStudent(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                {editingStudent ? "Edit Pupil Profile" : "Enrol New Pupil / Candidate"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Register pupil bio-data, assign class stream, academic batch, and guardian details
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
          {/* Pupil Bio Data Section */}
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pupil Academic & Identity Data</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pupil Full Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pupil Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kondwani Tembo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-medium"
                  required
                />
              </div>

              {/* ECZ Number / Candidate ID */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    ECZ / Candidate No. <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateEcz}
                    className="text-[10px] text-emerald-700 hover:underline flex items-center gap-0.5"
                  >
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Auto-Gen</span>
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="e.g. 26010045009"
                  value={eczNo}
                  onChange={(e) => setEczNo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              {/* Gender */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as "Male" | "Female")}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Age */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="5"
                  max="22"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
                >
                  <option value="Active">Active Enrolled</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Class & Batch Assignment */}
          <div className="border-b border-slate-100 pb-3">
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 text-xs">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              <span>Class Stream & Academic Cohort Assignment</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Class Stream */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Class Stream <span className="text-rose-500">*</span>
                </label>
                <select
                  value={classId}
                  onChange={(e) => handleClassChange(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.teacherName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Batch */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Academic Batch Cohort</label>
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

            {/* Relational Link Summary Pill */}
            {selectedClass && (
              <div className="mt-2.5 p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-emerald-950 font-medium">
                <div>
                  <span className="text-emerald-700 font-bold">Section:</span>{" "}
                  <span className="font-bold">{selectedClass.section}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold">Class Teacher:</span>{" "}
                  <span className="font-bold">{selectedClass.teacherName || "Unassigned"}</span>
                </div>
                <div>
                  <span className="text-emerald-700 font-bold">Stream:</span>{" "}
                  <span className="font-mono">{selectedClass.streamName || "Main Stream"}</span>
                </div>
              </div>
            )}

            {/* Secondary Pathway */}
            {selectedClass && selectedClass.gradeNum >= 8 && (
              <div className="mt-3">
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Secondary Pathway Specialization</span>
                </label>
                <select
                  value={pathway}
                  onChange={(e) => setPathway(e.target.value as SecondaryPathway)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs bg-white text-slate-800 font-medium"
                >
                  {selectedClass.gradeNum <= 9 ? (
                    <option value="Junior Secondary Core">Junior Secondary Foundational Core</option>
                  ) : (
                    <>
                      <option value="Natural Sciences">Natural Sciences & STEM</option>
                      <option value="Business & Commercial">Business & Commercial</option>
                      <option value="Social Sciences & Humanities">Social Sciences & Humanities</option>
                      <option value="Technical & Vocational">Technical & Vocational (TEVET)</option>
                    </>
                  )}
                </select>
              </div>
            )}
          </div>

          {/* Guardian & Contact Info */}
          <div>
            <h4 className="font-bold text-slate-900 mb-2.5 flex items-center gap-1.5 text-xs">
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>Parent / Guardian Contact Details</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Guardian Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guardian Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mr. Joseph Bwalya"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                  required
                />
              </div>

              {/* Guardian Phone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guardian Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. +260 977 123456"
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {/* Guardian Email */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guardian Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. guardian@gmail.com"
                  value={guardianEmail}
                  onChange={(e) => setGuardianEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. Plot 452, Rhodes Park, Lusaka"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Pupil Login & Portal Credentials */}
          <div className="border-t border-slate-100 pt-3">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pupil Portal Login Credentials</span>
            </h4>
            <p className="text-[11px] text-slate-500 mb-2.5">
              Set an optional login password for pupil portal access. Username defaults to pupil's first name.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Login Username (First Name)
                </label>
                <input
                  type="text"
                  placeholder={name ? name.trim().split(" ")[0].toLowerCase() : "e.g. kondwani"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Portal Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Set custom password (optional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-mono"
                />
              </div>
            </div>
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
              <UserPlus className="w-3.5 h-3.5" />
              <span>{editingStudent ? "Save Changes" : "Enrol Pupil"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
