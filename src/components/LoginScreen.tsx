import React, { useState, FormEvent } from "react";
import { Teacher, Student, ParentAccount, UserSession, StaffMember, SchoolProfile } from "../types";
import { SCHOOL_NAME, SCHOOL_SLOGAN } from "../data/zambianSchoolData";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  GraduationCap,
  UserCheck,
  Users,
  BookOpen,
  ShieldCheck,
  ArrowRight,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  Building2,
  DollarSign,
  Shield,
  FileSpreadsheet,
  LogIn
} from "lucide-react";

interface LoginScreenProps {
  teachers: Teacher[];
  students: Student[];
  parents: ParentAccount[];
  staffMembers?: StaffMember[];
  schoolProfile?: SchoolProfile;
  onLogin: (session: UserSession) => void;
}

export function LoginScreen({
  teachers,
  students,
  parents,
  staffMembers = [],
  schoolProfile,
  onLogin
}: LoginScreenProps) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    const rawId = identifier.trim().toLowerCase();
    const rawPass = password.trim();

    if (!rawId || !rawPass) {
      setError("Please enter both your username and password.");
      return;
    }

    setIsLoading(true);

    // Check custom saved admin credentials from localStorage
    try {
      const savedAdminCreds = localStorage.getItem("zambian_school_admin_credentials");
      if (savedAdminCreds) {
        const parsed = JSON.parse(savedAdminCreds);
        if (
          (rawId === parsed.username?.toLowerCase() || rawId === parsed.email?.toLowerCase())
        ) {
          if (!parsed.password || parsed.password === rawPass) {
            onLogin({ role: "super_admin", adminName: parsed.adminName || "Super Administrator" });
            return;
          }
        }
      }
    } catch (_) {}

    // Check registered staff members (Super Admin, Headteacher, Deputy, Bursar, Secretary, Librarian, etc.)
    const staffMatch = staffMembers.find(
      s => s.username?.toLowerCase() === rawId ||
           s.email?.toLowerCase() === rawId ||
           s.name?.toLowerCase() === rawId ||
           s.nrc?.toLowerCase() === rawId ||
           s.name?.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|eng\.|prof\.)\s*/i, "").trim().split(" ")[0] === rawId
    );
    if (staffMatch) {
      if (!staffMatch.password || staffMatch.password === rawPass) {
        onLogin({ role: staffMatch.role, adminName: staffMatch.name });
        return;
      }
    }

    // Default Super Admin / Administrative aliases
    if (
      rawId === "superadmin" ||
      rawId === "superadmin@ryntech.edu.zm" ||
      rawId === "tycodona@gmail.com" ||
      rawId === "kelvin" ||
      rawId === "super_admin"
    ) {
      onLogin({ role: "super_admin", adminName: "Super Admin (tycodona@gmail.com)" });
      return;
    }

    if (rawId === "admin" || rawId === "admin@ryntech.edu.zm") {
      onLogin({ role: "school_admin", adminName: "School Administrator" });
      return;
    }

    if (rawId === "headteacher" || rawId === "headteacher@ryntech.edu.zm" || rawId === "headmaster") {
      onLogin({ role: "head_teacher", adminName: "Mr. Davison Banda (Head Teacher)" });
      return;
    }

    if (rawId === "deputyhead" || rawId === "deputyhead@ryntech.edu.zm") {
      onLogin({ role: "deputy_head", adminName: "Mrs. Mutale Musonda (Deputy Head)" });
      return;
    }

    if (rawId === "bursar" || rawId === "accountant" || rawId === "bursar@ryntech.edu.zm") {
      onLogin({ role: "accountant", adminName: "Mr. Chileshe Mumba (Senior Bursar)" });
      return;
    }

    if (rawId === "secretary" || rawId === "secretary@ryntech.edu.zm") {
      onLogin({ role: "secretary", adminName: "Ms. Rabecca Lungu (Secretary)" });
      return;
    }

    if (rawId === "librarian" || rawId === "librarian@ryntech.edu.zm") {
      onLogin({ role: "librarian", adminName: "Mrs. Beatrice Phiri (Librarian)" });
      return;
    }

    // Teacher Authentication (support username, first name, full name, or TSC number)
    const teacher = teachers.find(t => {
      const cleanFirstName = t.name.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.|eng\.|prof\.)\s*/i, "").trim().split(" ")[0];
      return t.username.toLowerCase() === rawId ||
             t.name.toLowerCase() === rawId ||
             cleanFirstName === rawId ||
             t.tscNumber?.toLowerCase() === rawId ||
             t.email?.toLowerCase() === rawId;
    });
    if (teacher) {
      if (!teacher.password || teacher.password === rawPass) {
        onLogin({ role: "teacher", teacher });
        return;
      }
    }

    // Parent Authentication (support username, first name, full name, phone, or email)
    const parent = parents.find(p => {
      const cleanFirstName = p.name.toLowerCase().replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, "").trim().split(" ")[0];
      return p.username.toLowerCase() === rawId ||
             p.email?.toLowerCase() === rawId ||
             cleanFirstName === rawId ||
             p.phone.replace(/[^0-9]/g, "") === rawId.replace(/[^0-9]/g, "") ||
             p.name.toLowerCase() === rawId;
    });
    if (parent) {
      if (!parent.password || parent.password === rawPass) {
        onLogin({ role: "parent", parent });
        return;
      }
    }

    // Student Authentication (support username, first name, full name, or ECZ examination number)
    const student = students.find(s => {
      const firstName = s.name.toLowerCase().trim().split(" ")[0];
      return s.username.toLowerCase() === rawId ||
             s.eczNo.toLowerCase() === rawId ||
             firstName === rawId ||
             s.name.toLowerCase() === rawId;
    });
    if (student) {
      if (!student.password || student.password === rawPass) {
        onLogin({ role: "student", student });
        return;
      }
    }

    setError("Invalid credentials. Please check your username and password.");
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account"
      });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userEmail = (user.email || "").toLowerCase().trim();
      const userName = user.displayName || user.email || "Google User";

      // Check if user is teacher, staff, parent, or student by email
      const matchedStaff = staffMembers.find(s => s.email?.toLowerCase().trim() === userEmail);
      if (matchedStaff) {
        onLogin({ role: matchedStaff.role, adminName: matchedStaff.name });
        return;
      }

      const matchedTeacher = teachers.find(t => t.email?.toLowerCase().trim() === userEmail);
      if (matchedTeacher) {
        onLogin({ role: "teacher", teacher: matchedTeacher });
        return;
      }

      const matchedParent = parents.find(p => p.email?.toLowerCase().trim() === userEmail);
      if (matchedParent) {
        onLogin({ role: "parent", parent: matchedParent });
        return;
      }

      const matchedStudent = students.find(s => (s as any).email?.toLowerCase().trim() === userEmail);
      if (matchedStudent) {
        onLogin({ role: "student", student: matchedStudent });
        return;
      }

      // Default Admin / Super Admin mapping
      if (
        userEmail === "tycodona@gmail.com" ||
        userEmail === "superadmin@ryntech.edu.zm" ||
        userEmail === "bolschit26@gmail.com"
      ) {
        onLogin({
          role: "super_admin",
          adminName: user.displayName ? `${user.displayName} (Super Admin)` : `Super Administrator (${userEmail})`
        });
      } else {
        onLogin({
          role: "school_admin",
          adminName: user.displayName || userEmail || "School Administrator"
        });
      }
    } catch (err: any) {
      if (err.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup was closed before completing.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("This domain is not authorized for Google Sign-In in Firebase Console. Please add it to Authorized Domains or sign in with your username/password.");
      } else if (err.code === "auth/popup-blocked") {
        setError("Popup was blocked by your browser. Please allow popups or open the app in a new tab.");
      } else {
        setError(err.message || "Google Sign-In authentication failed. Try logging in with your username/password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans relative">
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Top Institutional Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          {schoolProfile?.logoUrl ? (
            <img
              src={schoolProfile.logoUrl}
              alt="School Logo"
              className="w-10 h-10 rounded-lg object-contain bg-white border border-emerald-500 shadow-inner p-0.5"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-serif font-bold text-lg shadow-inner">
              {(schoolProfile?.name || SCHOOL_NAME).charAt(0) || "R"}
            </div>
          )}
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
              Republic of Zambia • Ministry of Education
            </div>
            <h1 className="text-base font-bold text-white font-serif tracking-tight">
              {schoolProfile?.name || SCHOOL_NAME}
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-right">
          <div className="text-xs text-slate-400">
            <div>ECZ Examination Centre: <span className="font-mono text-slate-200 font-semibold">{schoolProfile?.examinationCenterCode || "26010045"}</span></div>
            <div className="text-[11px] text-slate-500">{schoolProfile?.city || "Lusaka"}, Zambia</div>
          </div>
        </div>
      </header>

      {/* Main Login Box */}
      <main className="relative z-10 max-w-2xl w-full mx-auto my-auto py-8">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-10">
          <div>
            <div className="mb-6 text-center sm:text-left">
              <h3 className="text-xl font-bold text-white font-serif">
                Sign In to School Portal
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your assigned username, first name, email, or pupil ECZ examination number.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username / First Name / ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="e.g. superadmin, davison, chanda, or ECZ number"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="Enter your password"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800 p-3 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{isLoading ? "Authenticating..." : "Sign In to Portal"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate-950 px-2 text-slate-500 font-medium">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-slate-900 hover:bg-slate-850 active:bg-slate-800 text-slate-200 border border-slate-700 font-semibold py-2.5 rounded-lg text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google (Firebase Verified)</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-5xl w-full mx-auto pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div>© 2026 {SCHOOL_NAME}. All rights reserved.</div>
        <div className="font-mono text-[11px]">System Release: v4.0 (Zambia MoE MIS Standard)</div>
      </footer>
    </div>
  );
}
