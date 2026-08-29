import React, { useState, useEffect } from "react";
import { Teacher, ClassStream, SchoolSection, SecondaryPathway } from "../types";
import { SECONDARY_PATHWAYS } from "../data/zambianSchoolData";
import { X, UserCheck, ShieldCheck, GraduationCap, Phone, Mail, BookOpen, Layers, KeyRound } from "lucide-react";

interface TeacherCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTeacher: (teacherData: Omit<Teacher, "id"> | Teacher) => void;
  editingTeacher?: Teacher | null;
  classes: ClassStream[];
}

export function TeacherCreationModal({
  isOpen,
  onClose,
  onSaveTeacher,
  editingTeacher,
  classes
}: TeacherCreationModalProps) {
  const [name, setName] = useState("");
  const [tscNumber, setTscNumber] = useState("");
  const [primarySubject, setPrimarySubject] = useState("Mathematics");
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [experienceYrs, setExperienceYrs] = useState("5");
  const [section, setSection] = useState<SchoolSection | "Both">("Primary");
  const [pathways, setPathways] = useState<SecondaryPathway[]>([]);
  const [phone, setPhone] = useState("+260 97");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"Active" | "On Leave" | "Inactive">("Active");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (editingTeacher) {
      setName(editingTeacher.name);
      setTscNumber(editingTeacher.tscNumber);
      setPrimarySubject(editingTeacher.primarySubject);
      setSelectedClassIds(editingTeacher.classesAssigned || []);
      setExperienceYrs(String(editingTeacher.experienceYrs || 5));
      setSection(editingTeacher.section || "Primary");
      setPathways(editingTeacher.pathways || []);
      setPhone(editingTeacher.phone || "+260 97");
      setEmail(editingTeacher.email || "");
      setStatus(editingTeacher.status || "Active");
      setUsername(editingTeacher.username || editingTeacher.name.replace(/^(mr\.|mrs\.|ms\.|dr\.|eng\.|prof\.)\s*/i, "").trim().split(" ")[0].toLowerCase());
      setPassword(editingTeacher.password || "");
    } else {
      setName("");
      const randNum = Math.floor(10000 + Math.random() * 90000);
      setTscNumber(`TCZ/2026/${randNum}`);
      setPrimarySubject("Mathematics");
      setSelectedClassIds(classes[0] ? [classes[0].id] : []);
      setExperienceYrs("5");
      setSection("Primary");
      setPathways([]);
      setPhone("+260 977 123456");
      setEmail("");
      setStatus("Active");
      setUsername("");
      setPassword("");
    }
  }, [editingTeacher, isOpen, classes]);

  const handleGenerateTcz = () => {
    const yr = new Date().getFullYear();
    const randNum = Math.floor(10000 + Math.random() * 90000);
    setTscNumber(`TCZ/${yr}/${randNum}`);
  };

  const toggleClassAssignment = (classId: number) => {
    setSelectedClassIds(prev =>
      prev.includes(classId) ? prev.filter(id => id !== classId) : [...prev, classId]
    );
  };

  const togglePathway = (p: SecondaryPathway) => {
    setPathways(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanFirstName = name.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|eng\.|prof\.)\s*/i, "").trim().split(" ")[0] || "teacher";
    const finalUsername = (username.trim() || cleanFirstName).toLowerCase();
    const finalPassword = password.trim();

    const payload: Omit<Teacher, "id"> = {
      name: name.trim(),
      tscNumber: tscNumber.trim(),
      primarySubject: primarySubject.trim(),
      classesAssigned: selectedClassIds,
      experienceYrs: parseInt(experienceYrs) || 5,
      section,
      pathways: pathways.length > 0 ? pathways : undefined,
      status,
      username: finalUsername,
      password: finalPassword || editingTeacher?.password || undefined,
      phone: phone.trim(),
      email: email.trim() || `${finalUsername}@ryntech.edu.zm`
    };

    if (editingTeacher) {
      onSaveTeacher({
        ...editingTeacher,
        ...payload
      });
    } else {
      onSaveTeacher(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 text-xs font-sans text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-serif">
                {editingTeacher ? "Edit Teacher Profile" : "Register New Teacher / Instructor"}
              </h3>
              <p className="text-[11px] text-slate-500">
                Teaching Council of Zambia (TCZ) academic staff portal registration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Personal Info */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              <span>Teacher Identity & TCZ Accreditation</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Full Name & Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Davison Banda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    TCZ Registration Number <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateTcz}
                    className="text-[10px] text-sky-600 hover:text-sky-800 font-bold underline"
                  >
                    Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="TCZ/2026/08492"
                  value={tscNumber}
                  onChange={(e) => setTscNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Academic Specialization & Teaching Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span>Teaching Specialization & Section</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Primary Subject / Specialty <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics & Science"
                  value={primarySubject}
                  onChange={(e) => setPrimarySubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Teaching Section</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                >
                  <option value="Early Childhood">Early Childhood (Baby to Reception)</option>
                  <option value="Primary">Primary Section (Grade 1 - 7)</option>
                  <option value="Secondary">Secondary Section (Form 1 - Form 4)</option>
                  <option value="Both">Both Primary & Secondary</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="45"
                  value={experienceYrs}
                  onChange={(e) => setExperienceYrs(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Assigned Classes */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <label className="block text-[11px] font-bold text-slate-700">
              Assigned Class Streams (Select all that apply):
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-lg">
              {classes.map(cls => {
                const isSelected = selectedClassIds.includes(cls.id);
                return (
                  <label
                    key={cls.id}
                    className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all text-[11px] ${
                      isSelected
                        ? "bg-sky-50 border-sky-300 text-sky-900 font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleClassAssignment(cls.id)}
                      className="rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <span className="truncate">{cls.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Secondary Pathways if Secondary */}
          {(section === "Secondary" || section === "Both") && (
            <div className="space-y-2 pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-700">
                Secondary Career Pathways Allocation:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.values(SECONDARY_PATHWAYS).map(p => {
                  const isChecked = pathways.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all text-[11px] ${
                        isChecked
                          ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-bold"
                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePathway(p.id)}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{p.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-600" />
              <span>Contact & Staff Status</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+260 977 000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="teacher@myblci.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Employment Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
                >
                  <option value="Active">Active Duty</option>
                  <option value="On Leave">On Study / Maternity Leave</option>
                  <option value="Inactive">Inactive / Transferred</option>
                </select>
              </div>
            </div>
          </div>

          {/* Teacher Login & Portal Credentials */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Teacher Portal Login Credentials</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Set an optional login password for instructor portal access. Username defaults to teacher's first name.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Login Username (First Name)
                </label>
                <input
                  type="text"
                  placeholder={name ? name.replace(/^(mr\.|mrs\.|ms\.|dr\.|eng\.|prof\.)\s*/i, "").trim().split(" ")[0].toLowerCase() : "e.g. davison"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Portal Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Set custom password (optional)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold transition-all text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all text-xs flex items-center gap-1.5 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{editingTeacher ? "Save Teacher Details" : "Register Teacher"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
