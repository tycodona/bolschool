import React, { useState } from "react";
import { UserSession, Student, Teacher, StaffMember, ParentAccount } from "../types";
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  Save,
  KeyRound,
  GraduationCap,
  Briefcase
} from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onUpdateSession: (updatedSession: UserSession) => void;
  onUpdateStudent?: (student: Student) => void;
  onUpdateTeacher?: (teacher: Teacher) => void;
  onUpdateStaff?: (staff: StaffMember) => void;
  showToast: (msg: string) => void;
}

export function UserProfileModal({
  isOpen,
  onClose,
  session,
  onUpdateSession,
  onUpdateStudent,
  onUpdateTeacher,
  onUpdateStaff,
  showToast
}: UserProfileModalProps) {
  const role = session.role;

  // Derive initial values from active session
  const getInitialName = () => {
    if (session.teacher) return session.teacher.name;
    if (session.student) return session.student.name;
    if (session.parent) return session.parent.name;
    return session.adminName || "Administrator";
  };

  const getInitialUsername = () => {
    if (session.teacher) return session.teacher.username;
    if (session.student) return session.student.username;
    if (session.parent) return session.parent.username;
    try {
      const saved = localStorage.getItem("zambian_school_admin_credentials");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username) return parsed.username;
      }
    } catch (_) {}
    return "superadmin";
  };

  const getInitialEmail = () => {
    if (session.teacher) return session.teacher.email || "";
    if (session.student) return session.student.guardianEmail || "";
    if (session.parent) return session.parent.email || "";
    try {
      const saved = localStorage.getItem("zambian_school_admin_credentials");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.email) return parsed.email;
      }
    } catch (_) {}
    return "tycodona@gmail.com";
  };

  const getInitialPhone = () => {
    if (session.teacher) return session.teacher.phone || "";
    if (session.student) return session.student.guardianPhone || "";
    if (session.parent) return session.parent.phone || "";
    return "";
  };

  const getInitialAddress = () => {
    if (session.teacher) return session.teacher.address || "";
    if (session.student) return session.student.address || "";
    return "";
  };

  const [name, setName] = useState(getInitialName);
  const [username, setUsername] = useState(getInitialUsername);
  const [email, setEmail] = useState(getInitialEmail);
  const [phone, setPhone] = useState(getInitialPhone);
  const [address, setAddress] = useState(getInitialAddress);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getRoleTitle = () => {
    if (role === "super_admin") return "Super Administrator";
    if (role === "school_admin" || role === "admin") return "School Administrator";
    if (role === "head_teacher") return "Head Teacher / Headmaster";
    if (role === "deputy_head") return "Deputy Head Teacher";
    if (role === "accountant") return "Senior Bursar / Accountant";
    if (role === "secretary") return "Executive Secretary";
    if (role === "librarian") return "Chief Librarian";
    if (role === "teacher") return "Teaching Faculty";
    if (role === "parent") return "Parent / Guardian";
    return "Pupil / Learner";
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // If new password is provided, validate confirmation
    if (newPassword) {
      if (newPassword.length < 4) {
        setError("New password must be at least 4 characters.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setError("New password and confirm password do not match.");
        return;
      }
    }

    const effectivePassword = newPassword.trim() || undefined;

    // 1. Teacher Update
    if (role === "teacher" && session.teacher) {
      const updatedTeacher: Teacher = {
        ...session.teacher,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        ...(effectivePassword ? { password: effectivePassword } : {})
      };
      if (onUpdateTeacher) onUpdateTeacher(updatedTeacher);
      onUpdateSession({ ...session, teacher: updatedTeacher });
      showToast("Your teacher profile and password have been saved!");
      onClose();
      return;
    }

    // 2. Student Update
    if (role === "student" && session.student) {
      const updatedStudent: Student = {
        ...session.student,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        guardianEmail: email.trim(),
        guardianPhone: phone.trim(),
        address: address.trim(),
        ...(effectivePassword ? { password: effectivePassword } : {})
      };
      if (onUpdateStudent) onUpdateStudent(updatedStudent);
      onUpdateSession({ ...session, student: updatedStudent });
      showToast("Your pupil profile and password have been saved!");
      onClose();
      return;
    }

    // 3. Parent Update
    if (role === "parent" && session.parent) {
      const updatedParent: ParentAccount = {
        ...session.parent,
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        phone: phone.trim(),
        ...(effectivePassword ? { password: effectivePassword } : {})
      };
      try {
        const parentsRaw = localStorage.getItem("zambian_school_parents");
        const parentsList: ParentAccount[] = parentsRaw ? JSON.parse(parentsRaw) : [];
        const updatedList = parentsList.map(p => p.id === updatedParent.id ? updatedParent : p);
        localStorage.setItem("zambian_school_parents", JSON.stringify(updatedList));
      } catch (_) {}
      onUpdateSession({ ...session, parent: updatedParent });
      showToast("Parent profile and password updated!");
      onClose();
      return;
    }

    // 4. Admin / Super Admin / Custom Staff
    const adminCreds = {
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      ...(effectivePassword ? { password: effectivePassword } : {}),
      adminName: name.trim()
    };

    try {
      localStorage.setItem("zambian_school_admin_credentials", JSON.stringify(adminCreds));
    } catch (_) {}

    onUpdateSession({
      ...session,
      adminName: name.trim()
    });

    showToast("Profile information and password saved successfully!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 my-8 text-xs font-sans text-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                My Profile & Account Security
              </h3>
              <p className="text-[11px] text-slate-500">
                Update your personal details, contact info, and login password
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Pill Banner */}
        <div className="px-6 py-3 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-emerald-950 text-xs">
              {getRoleTitle()}
            </span>
          </div>
          {session.student && (
            <span className="font-mono text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
              ECZ: {session.student.eczNo}
            </span>
          )}
          {session.teacher && (
            <span className="font-mono text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
              TSC: {session.teacher.tscNumber}
            </span>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Personal Details */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personal Information</span>
            </h4>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Username (Login ID)
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+260 97X XXX XXX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Residential Address / City
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Woodlands, Lusaka"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Password & Security Section */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Change Login Password</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Leave blank if you do not wish to change your existing password.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3 pr-9 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-950/10 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile & Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
