import React, { useState, FormEvent, useEffect } from "react";
import { SchoolProfile, UserSession } from "../types";
import {
  Building2,
  Save,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Landmark,
  Award,
  BookOpen,
  Eye,
  CreditCard,
  Shield,
  Sparkles,
  Info,
  Database,
  CloudCheck,
  RefreshCw,
  Server,
  CloudUpload,
  Download,
  ExternalLink,
  FolderSync,
  Copy,
  Check,
  FileCode2,
  KeyRound,
  Lock,
  User,
  Upload,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { initialSchoolProfile } from "../data/zambianSchoolData";
import { testFirestoreConnection, db } from "../firebase";
import { syncEntireDatasetToFirestore, loadEntireDatasetFromFirestore, purgeAllDemoSchoolData } from "../services/firestoreService";
import {
  generateSchoolBackupBundle,
  downloadBackupJson,
  openGoogleDriveUpload
} from "../services/googleDriveService";
import firebaseConfig from "../../firebase-applet-config.json";

interface SchoolSettingsModuleProps {
  session: UserSession;
  schoolProfile: SchoolProfile;
  onUpdateSchoolProfile: (updatedProfile: SchoolProfile) => void;
  showToast: (msg: string) => void;
  allSchoolData?: {
    students: any[];
    teachers: any[];
    classes: any[];
    fees: any[];
    receipts: any[];
    events: any[];
    gradebook: any;
    attendanceRecords: any[];
    messages: any[];
  };
}

export function SchoolSettingsModule({
  session,
  schoolProfile,
  onUpdateSchoolProfile,
  showToast,
  allSchoolData
}: SchoolSettingsModuleProps) {
  const [formData, setFormData] = useState<SchoolProfile>({ ...schoolProfile });
  const [activeSubTab, setActiveSubTab] = useState<"general" | "leadership" | "academic" | "financial" | "statements" | "credentials" | "database" | "infinityfree">("general");
  const [savedRecently, setSavedRecently] = useState(false);
  const [dbStatus, setDbStatus] = useState<"connected" | "connecting" | "error">("connecting");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [copiedHtaccess, setCopiedHtaccess] = useState(false);

  // Custom Super Admin credentials state
  const [customUsername, setCustomUsername] = useState(() => {
    try {
      const saved = localStorage.getItem("zambian_school_admin_credentials");
      return saved ? JSON.parse(saved).username || "superadmin" : "superadmin";
    } catch (_) {
      return "superadmin";
    }
  });
  const [customEmail, setCustomEmail] = useState(() => {
    try {
      const saved = localStorage.getItem("zambian_school_admin_credentials");
      return saved ? JSON.parse(saved).email || "tycodona@gmail.com" : "tycodona@gmail.com";
    } catch (_) {
      return "tycodona@gmail.com";
    }
  });
  const [customPassword, setCustomPassword] = useState(() => {
    try {
      const saved = localStorage.getItem("zambian_school_admin_credentials");
      return saved ? JSON.parse(saved).password || "" : "";
    } catch (_) {
      return "";
    }
  });
  const [customAdminName, setCustomAdminName] = useState(() => {
    try {
      const saved = localStorage.getItem("zambian_school_admin_credentials");
      return saved ? JSON.parse(saved).adminName || "Super Administrator" : "Super Administrator";
    } catch (_) {
      return "Super Administrator";
    }
  });

  // Purge demo data state
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeConfirmationText, setPurgeConfirmationText] = useState("");
  const [isPurging, setIsPurging] = useState(false);

  const handlePurgeAllData = async () => {
    if (purgeConfirmationText.trim().toUpperCase() !== "DELETE") {
      showToast("Please type DELETE to confirm data purge.");
      return;
    }
    setIsPurging(true);
    try {
      const result = await purgeAllDemoSchoolData();
      if (result.success) {
        showToast("All demo pupils, fees, gradebook, and records have been completely cleared!");
        setShowPurgeModal(false);
        setPurgeConfirmationText("");
        // Reload after short delay to refresh all state cleanly
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        showToast(`Failed to purge demo data: ${result.error}`);
      }
    } catch (err: any) {
      showToast(`Error during purge: ${err?.message || "Unknown error"}`);
    } finally {
      setIsPurging(false);
    }
  };

  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setDbStatus(connected ? "connected" : "error");
    });
  }, []);

  useEffect(() => {
    if (schoolProfile) {
      setFormData({ ...schoolProfile });
    }
  }, [schoolProfile]);

  const isSuperAdmin = session.role === "super_admin" || session.role === "admin";
  const isRoleAdmin = isSuperAdmin || session.role === "school_admin" || session.role === "head_teacher" || session.role === "deputy_head";

  const handleSaveCredentials = (e: FormEvent) => {
    e.preventDefault();
    const creds = {
      username: customUsername.trim().toLowerCase(),
      email: customEmail.trim().toLowerCase(),
      password: customPassword.trim(),
      adminName: customAdminName.trim()
    };
    try {
      localStorage.setItem("zambian_school_admin_credentials", JSON.stringify(creds));
      showToast("Super Admin login credentials updated and saved!");
    } catch (_) {
      showToast("Failed to save credentials to local storage.");
    }
  };

  const handleChange = (field: keyof SchoolProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload an image file (PNG, JPG, WEBP, SVG).");
      return;
    }

    // Limit to 2MB to prevent localStorage overflow
    if (file.size > 2 * 1024 * 1024) {
      showToast("Logo image size should be under 2MB.");
      return;
    }

    // If file is an image, compress/resize it via HTML Canvas to optimal web resolution (~256px, <100KB)
    // to guarantee it never exceeds LocalStorage quotas or Firestore document sizes.
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const rawDataUrl = loadEvent.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 320;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL("image/png", 0.9);
          const updated = {
            ...formData,
            logoUrl: compressedBase64
          };
          setFormData(updated);
          onUpdateSchoolProfile(updated);
          showToast("School logo uploaded, optimized, and saved permanently!");
        } else {
          const updated = {
            ...formData,
            logoUrl: rawDataUrl
          };
          setFormData(updated);
          onUpdateSchoolProfile(updated);
          showToast("School logo uploaded and saved!");
        }
      };
      img.onerror = () => {
        const updated = {
          ...formData,
          logoUrl: rawDataUrl
        };
        setFormData(updated);
        onUpdateSchoolProfile(updated);
        showToast("School logo uploaded and saved!");
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const updated = {
      ...formData,
      logoUrl: undefined
    };
    setFormData(updated);
    onUpdateSchoolProfile(updated);
    showToast("School logo cleared. Default institutional crest restored.");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onUpdateSchoolProfile(formData);
    setSavedRecently(true);
    showToast("School Profile & System Settings saved successfully!");
    setTimeout(() => setSavedRecently(false), 3000);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all institutional settings to default?")) {
      setFormData({ ...initialSchoolProfile });
      onUpdateSchoolProfile({ ...initialSchoolProfile });
      showToast("School settings reset to standard institutional defaults.");
    }
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900">
              Institutional Profile & School Settings
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin Configuration
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Customize institutional identity, leadership details, academic terms, contact info, and official statements.
          </p>
        </div>

        {isRoleAdmin && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-sm transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {savedRecently && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2 font-bold text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All updates have been saved and applied across the entire management system!</span>
        </div>
      )}

      {/* Subtabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("general")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "general"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Building2 className="w-4 h-4" />
          School Identity & Address
        </button>

        <button
          onClick={() => setActiveSubTab("leadership")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "leadership"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Award className="w-4 h-4" />
          School Leadership & ECZ Center
        </button>

        <button
          onClick={() => setActiveSubTab("academic")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "academic"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Calendar className="w-4 h-4" />
          Academic Year & Active Term
        </button>

        <button
          onClick={() => setActiveSubTab("financial")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "financial"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Landmark className="w-4 h-4" />
          Kwacha Tuition & Banking Info
        </button>

        <button
          onClick={() => setActiveSubTab("statements")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === "statements"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Mission, Vision & Philosophy
        </button>

        {isSuperAdmin && (
          <button
            onClick={() => setActiveSubTab("credentials")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "credentials"
                ? "bg-purple-900 text-white shadow-xs"
                : "bg-white text-purple-900 border border-purple-300 hover:bg-purple-50"
            }`}
          >
            <KeyRound className="w-4 h-4 text-purple-600" />
            Super Admin Passwords & Logins
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveSubTab("database")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "database"
                ? "bg-emerald-900 text-white shadow-xs"
                : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            <Database className="w-4 h-4" />
            Firebase Cloud Database
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={() => setActiveSubTab("infinityfree")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === "infinityfree"
                ? "bg-emerald-900 text-white shadow-xs"
                : "bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50"
            }`}
          >
            <CloudUpload className="w-4 h-4" />
            InfinityFree & Google Drive Backup
          </button>
        )}
      </div>

      {/* Main Content Sections */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. GENERAL IDENTITY & CONTACT */}
        {activeSubTab === "general" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-700" />
                School Name & Branding
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Official School Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isRoleAdmin}
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Appears on headers, report cards, fee receipts, and portal logins.</p>
                </div>

                {/* School Logo Upload & URL Box */}
                <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-700" />
                      School Logo / Institutional Emblem
                    </label>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Custom Logo
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Logo Preview Avatar */}
                    <div className="w-16 h-16 rounded-xl border border-slate-300 bg-white flex items-center justify-center overflow-hidden shadow-xs shrink-0">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="School Logo"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <div className="w-full h-full bg-emerald-800 text-white flex items-center justify-center font-serif text-2xl font-bold">
                          {formData.name.charAt(0) || "R"}
                        </div>
                      )}
                    </div>

                    {/* Upload button & Direct Link input */}
                    <div className="flex-1 w-full space-y-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Upload Logo File (PNG/JPG)</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="hidden"
                            disabled={!isRoleAdmin}
                          />
                        </label>
                        <span className="text-[10px] text-slate-400">or paste image URL below</span>
                      </div>

                      <input
                        type="text"
                        placeholder="https://example.com/school-logo.png"
                        value={formData.logoUrl || ""}
                        disabled={!isRoleAdmin}
                        onChange={(e) => handleChange("logoUrl", e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Uploaded logos are rendered instantly across the main navigation sidebar, official termly report cards, and printed fee receipts.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    School Slogan
                  </label>
                  <input
                    type="text"
                    disabled={!isRoleAdmin}
                    value={formData.slogan}
                    onChange={(e) => handleChange("slogan", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    School Motto
                  </label>
                  <input
                    type="text"
                    disabled={!isRoleAdmin}
                    value={formData.motto}
                    onChange={(e) => handleChange("motto", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  Campus Physical Address & Contacts
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Campus Physical Plot / Street Address
                    </label>
                    <input
                      type="text"
                      disabled={!isRoleAdmin}
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City / District
                    </label>
                    <input
                      type="text"
                      disabled={!isRoleAdmin}
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      disabled={!isRoleAdmin}
                      value={formData.country}
                      onChange={(e) => handleChange("country", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Primary Phone (Admissions & Enquiries)
                    </label>
                    <input
                      type="text"
                      disabled={!isRoleAdmin}
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Secondary / Accounts Phone
                    </label>
                    <input
                      type="text"
                      disabled={!isRoleAdmin}
                      value={formData.altPhone}
                      onChange={(e) => handleChange("altPhone", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Official Enquiries Email
                    </label>
                    <input
                      type="email"
                      disabled={!isRoleAdmin}
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Live Header Preview
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
                    Official
                  </span>
                </div>

                <div className="mt-4 text-center space-y-1.5">
                  {formData.logoUrl ? (
                    <div className="w-14 h-14 rounded-xl bg-white border border-emerald-500 mx-auto flex items-center justify-center shadow-inner overflow-hidden p-1">
                      <img
                        src={formData.logoUrl}
                        alt="Preview Logo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-800 border border-emerald-500 mx-auto flex items-center justify-center font-serif text-xl font-bold text-white shadow-inner">
                      {formData.name.charAt(0) || "R"}
                    </div>
                  )}
                  <h3 className="text-base font-black font-serif tracking-tight text-white mt-2">
                    {formData.name || "School Name"}
                  </h3>
                  <p className="text-[11px] text-emerald-300 font-medium italic">
                    "{formData.slogan || "School Slogan"}"
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono pt-1">
                    {formData.address}, {formData.city}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Tel: {formData.phone} • Email: {formData.email}
                  </p>
                </div>

                <div className="mt-5 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-[10px] space-y-1 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ministry Reg No:</span>
                    <span className="font-bold text-white font-mono">{formData.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ECZ Centre Code:</span>
                    <span className="font-bold text-emerald-400 font-mono">{formData.examinationCenterCode}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Headteacher:</span>
                    <span className="font-bold text-white">{formData.headteacherName}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                Changes saved here reflect instantly on all Report Cards, PDF exports, Fee statements, and Notice boards.
              </div>
            </div>
          </div>
        )}

        {/* 2. LEADERSHIP & MINISTRY CODES */}
        {activeSubTab === "leadership" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-700" />
                School Executive Leadership & Accreditation
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure names of the Headteacher, Deputy Head, and Ministry of Education official registration numbers.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Headteacher / Principal Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={!isRoleAdmin}
                  value={formData.headteacherName}
                  onChange={(e) => handleChange("headteacherName", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">Signed on official report cards, certifications, and circulars.</p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Deputy Headteacher Name
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.deputyHeadName}
                  onChange={(e) => handleChange("deputyHeadName", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ministry of Education Registration No.
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange("registrationNumber", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  ECZ Examination Centre Code
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.examinationCenterCode}
                  onChange={(e) => handleChange("examinationCenterCode", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. ACADEMIC YEAR & ACTIVE TERM */}
        {activeSubTab === "academic" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                Academic Term Dates & Active Session
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Set the active school year and term. This automatically controls grading calculations, default fee terms, and timetable periods.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Current Academic Year *
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2035"
                  required
                  disabled={!isRoleAdmin}
                  value={formData.currentYear}
                  onChange={(e) => handleChange("currentYear", Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Active Operating Term *
                </label>
                <select
                  disabled={!isRoleAdmin}
                  value={formData.activeTerm}
                  onChange={(e) => handleChange("activeTerm", e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="Term 1">Term 1 (January - April)</option>
                  <option value="Term 2">Term 2 (May - August)</option>
                  <option value="Term 3">Term 3 (September - December)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Term Start Date
                </label>
                <input
                  type="date"
                  disabled={!isRoleAdmin}
                  value={formData.termStartDate || "2026-05-11"}
                  onChange={(e) => handleChange("termStartDate", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Term Closing Date
                </label>
                <input
                  type="date"
                  disabled={!isRoleAdmin}
                  value={formData.termEndDate || "2026-08-07"}
                  onChange={(e) => handleChange("termEndDate", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Next Term Re-Opening Date
                </label>
                <input
                  type="date"
                  disabled={!isRoleAdmin}
                  value={formData.nextTermStartDate || "2026-08-31"}
                  onChange={(e) => handleChange("nextTermStartDate", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. FINANCIAL & BANKING */}
        {activeSubTab === "financial" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Landmark className="w-4 h-4 text-emerald-700" />
                Kwacha Tuition Banking & Mobile Money Information
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                These bank account and mobile payment details are rendered on all pupil fee invoices and payment receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.bankName}
                  onChange={(e) => handleChange("bankName", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.bankAccountName}
                  onChange={(e) => handleChange("bankAccountName", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.bankAccountNumber}
                  onChange={(e) => handleChange("bankAccountNumber", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.bankBranch}
                  onChange={(e) => handleChange("bankBranch", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Airtel Money Merchant / MTN MoMo Pay Details
                </label>
                <input
                  type="text"
                  disabled={!isRoleAdmin}
                  value={formData.mobileMoneyNumber}
                  onChange={(e) => handleChange("mobileMoneyNumber", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        )}

        {/* 5. MISSION & VISION STATEMENTS */}
        {activeSubTab === "statements" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-700" />
                Institutional Mission, Vision & Character Statements
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Articulate the school's Christian philosophy, vision for national development, and pupil character outcomes.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  School Mission Statement
                </label>
                <textarea
                  rows={3}
                  disabled={!isRoleAdmin}
                  value={formData.missionStatement}
                  onChange={(e) => handleChange("missionStatement", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  School Vision Statement
                </label>
                <textarea
                  rows={3}
                  disabled={!isRoleAdmin}
                  value={formData.visionStatement}
                  onChange={(e) => handleChange("visionStatement", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. SUPER ADMIN CREDENTIALS & PASSWORDS */}
        {activeSubTab === "credentials" && isSuperAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-purple-700" />
                  Super Admin Credentials & Login Passwords
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Customize the Super Admin login username, email, and password for direct administrative access.
                </p>
              </div>
              <div className="px-3 py-1 bg-purple-100 border border-purple-300 text-purple-900 font-bold rounded-lg text-xs flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-purple-700" />
                Super Admin Access Only
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  Super Admin Username & Identity
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Primary Username
                  </label>
                  <input
                    type="text"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    placeholder="e.g. superadmin, admin, kelvin"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    You can type this username in the login portal.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Super Admin Email
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. tycodona@gmail.com"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Your personal email is also recognized as Super Admin.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={customAdminName}
                    onChange={(e) => setCustomAdminName(e.target.value)}
                    placeholder="e.g. Super Administrator"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-600" />
                  Password & Security Settings
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Super Admin Password
                  </label>
                  <input
                    type="password"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    placeholder="Enter new administrator password (optional)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-purple-900 focus:border-purple-600 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Leave blank for open administrative development access, or set a secure password.
                  </span>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1.5 text-[11px] text-purple-900">
                  <div className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-700" />
                    Active Logins Recognized by the Portal:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[10px] text-purple-800 font-mono">
                    <li>Username: <strong>{customUsername}</strong> or <strong>{customEmail}</strong></li>
                    <li>Password: <strong>{customPassword ? "••••••••" : "No password required"}</strong></li>
                  </ul>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveCredentials}
                    className="w-full px-4 py-2.5 bg-purple-800 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save & Update Super Admin Credentials
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Reference Table for All 10 Institutional Roles */}
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-emerald-400 font-serif">
                  Standard School Role Credentials Reference
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Direct Login Identifiers</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-purple-400 font-bold text-[10px]">Super Admin</div>
                  <div className="font-mono text-slate-200">superadmin</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-emerald-400 font-bold text-[10px]">School Admin</div>
                  <div className="font-mono text-slate-200">admin</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-emerald-400 font-bold text-[10px]">Head Teacher</div>
                  <div className="font-mono text-slate-200">headteacher</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-teal-400 font-bold text-[10px]">Deputy Head</div>
                  <div className="font-mono text-slate-200">deputyhead</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-sky-400 font-bold text-[10px]">Teacher</div>
                  <div className="font-mono text-slate-200">kphiri</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-amber-400 font-bold text-[10px]">Bursar / Accounts</div>
                  <div className="font-mono text-slate-200">bursar</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-pink-400 font-bold text-[10px]">Secretary</div>
                  <div className="font-mono text-slate-200">secretary</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-indigo-400 font-bold text-[10px]">Librarian</div>
                  <div className="font-mono text-slate-200">librarian</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-emerald-400 font-bold text-[10px]">Parent</div>
                  <div className="font-mono text-slate-200">bwalya</div>
                </div>
                <div className="p-2 bg-slate-800/80 rounded-lg">
                  <div className="text-blue-400 font-bold text-[10px]">Pupil</div>
                  <div className="font-mono text-slate-200">chanda</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. CLOUD DATABASE & FIRESTORE INTEGRATION */}
        {activeSubTab === "database" && isSuperAdmin && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-700" />
                  Google Cloud Firestore Database
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Manage cloud synchronization, live replica backup, and multi-device persistence for pupil records and financial accounts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  dbStatus === "connected"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : dbStatus === "connecting"
                    ? "bg-amber-100 text-amber-800 border border-amber-300"
                    : "bg-rose-100 text-rose-800 border border-rose-300"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    dbStatus === "connected" ? "bg-emerald-600 animate-pulse" : dbStatus === "connecting" ? "bg-amber-600" : "bg-rose-600"
                  }`} />
                  {dbStatus === "connected" ? "Cloud Connected" : dbStatus === "connecting" ? "Checking Connection..." : "Offline / Local Mode"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-700" />
                  Firebase Project ID
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 break-all">
                  {firebaseConfig.projectId || "sage-map-r2t1j"}
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  Firestore Database ID
                </div>
                <div className="text-xs font-mono font-bold text-slate-800 break-all">
                  {firebaseConfig.firestoreDatabaseId || "default"}
                </div>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-emerald-950">Immediate Cloud Synchronization</h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Trigger an instant snapshot sync of all pupil records, continuous assessments, receipts, and school assets to the cloud database.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={async () => {
                    setIsSyncing(true);
                    try {
                      await syncEntireDatasetToFirestore({
                        schoolProfile: formData,
                        syncedBy: session.adminName || session.role
                      });
                      setLastSyncTime(new Date().toLocaleTimeString());
                      showToast("School configuration successfully synced to Firestore!");
                    } catch (e) {
                      showToast("Failed to sync to Firestore.");
                    } finally {
                      setIsSyncing(false);
                    }
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Settings Now"}
                </button>
              </div>
              {lastSyncTime && (
                <div className="text-[10px] text-emerald-700 font-mono">
                  Last successful sync: Today at {lastSyncTime}
                </div>
              )}
            </div>

            {/* Clear / Purge All Demo Data Section */}
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-700" />
                    Reset & Remove Demo Data (Start Fresh)
                  </h3>
                  <p className="text-[11px] text-rose-800 mt-0.5 max-w-xl">
                    Permanently wipe all demo pupils, parents, fee invoices, payment receipts, attendance registers, and continuous assessment marks to start entering your school's real data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPurgeModal(true)}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Purge All Demo Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 8. INFINITYFREE DEPLOYMENT & GOOGLE DRIVE BACKUP */}
        {activeSubTab === "infinityfree" && isSuperAdmin && (
          <div className="space-y-6">
            {/* Google Drive Backup Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                    <FolderSync className="w-4 h-4 text-emerald-700" />
                    Google Drive Backup & School Snapshot
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Generate complete, encrypted JSON backups containing all pupils, ECZ marks, fees, and staff rosters to save to your personal Google Drive.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const bundle = generateSchoolBackupBundle({
                        schoolProfile: formData,
                        students: allSchoolData?.students || [],
                        teachers: allSchoolData?.teachers || [],
                        classes: allSchoolData?.classes || [],
                        fees: allSchoolData?.fees || [],
                        receipts: allSchoolData?.receipts || [],
                        events: allSchoolData?.events || [],
                        gradebook: allSchoolData?.gradebook || {},
                        attendanceRecords: allSchoolData?.attendanceRecords || [],
                        messages: allSchoolData?.messages || []
                      });
                      downloadBackupJson(bundle);
                      showToast("School backup bundle downloaded! Ready to upload to Google Drive.");
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Backup (.json)
                  </button>
                  <button
                    type="button"
                    onClick={openGoogleDriveUpload}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                    Open Google Drive
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  How Cloud & Google Drive Persistence Works:
                </div>
                <p className="text-[11px] leading-relaxed">
                  1. <strong>Live Cloud (Firestore):</strong> Every change made by teachers or parents is <em>already saved permanently in the cloud</em> in real time on Google Cloud.<br/>
                  2. <strong>Periodic Google Drive Snapshot:</strong> Download the complete backup bundle above and save it into a folder in your Google Drive named <code>Zambian_School_Backups/</code> for long-term offsite storage and audit compliance.
                </p>
              </div>
            </div>

            {/* InfinityFree Deployment Guide */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-700" />
                  How to Deploy to InfinityFree (Step-by-Step)
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Deploy this system to your free or custom domain on InfinityFree hosting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">1</div>
                  <h3 className="text-xs font-bold text-slate-900">Build the Project</h3>
                  <p className="text-[11px] text-slate-600">
                    In your computer terminal, run <code>npm run build</code>. This generates a production-ready <code>dist/</code> folder containing all HTML, CSS, and JS.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">2</div>
                  <h3 className="text-xs font-bold text-slate-900">Upload to htdocs/</h3>
                  <p className="text-[11px] text-slate-600">
                    Log in to InfinityFree File Manager or FileZilla FTP. Open the <code>htdocs/</code> folder and upload all files from inside your <code>dist/</code> folder.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-800 text-white font-bold text-xs flex items-center justify-center">3</div>
                  <h3 className="text-xs font-bold text-slate-900">Create .htaccess</h3>
                  <p className="text-[11px] text-slate-600">
                    Create a file named <code>.htaccess</code> inside <code>htdocs/</code> and paste the routing code below so single-page navigation works.
                  </p>
                </div>
              </div>

              {/* .htaccess Code Block */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <FileCode2 className="w-4 h-4 text-emerald-700" />
                    Hardened Production <code>.htaccess</code> (HTTPS + Security Headers + SPA Routing)
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const htaccessCode = `# ----------------------------------------------------------------------
# 1. FORCE HTTPS / SSL REDIRECTION (Security Hardening)
# ----------------------------------------------------------------------
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# ----------------------------------------------------------------------
# 2. SECURITY HEADERS
# ----------------------------------------------------------------------
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# ----------------------------------------------------------------------
# 3. BLOCK ACCESS TO SENSITIVE FILES (.map, .json, .env, hidden files)
# ----------------------------------------------------------------------
Options -Indexes
<FilesMatch "\\.(map|env|json|lock)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# ----------------------------------------------------------------------
# 4. SINGLE PAGE APPLICATION (SPA) ROUTING
# ----------------------------------------------------------------------
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`;
                      navigator.clipboard.writeText(htaccessCode);
                      setCopiedHtaccess(true);
                      setTimeout(() => setCopiedHtaccess(false), 2500);
                      showToast("Hardened .htaccess code copied to clipboard!");
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedHtaccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHtaccess ? "Copied!" : "Copy Hardened .htaccess Code"}
                  </button>
                </div>
                <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800">
{`# 1. FORCE HTTPS / SSL REDIRECTION
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTPS} off
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# 2. SECURITY HEADERS
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# 3. BLOCK ACCESS TO SENSITIVE FILES (.map, .env, hidden files)
Options -Indexes
<FilesMatch "\\.(map|env|json|lock)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# 4. SPA CLIENT ROUTING
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {isRoleAdmin && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-md transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save All Institutional Settings
            </button>
          </div>
        )}
      </form>

      {/* Purge Demo Data Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-serif">
                  Wipe All Demo School Data?
                </h3>
                <p className="text-[11px] text-slate-500">
                  This action clears all demo pupils, parents, marks, and fees.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 text-xs text-rose-900">
              <div className="font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-700" />
                What will be removed:
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-800">
                <li>All demo pupils & student profiles</li>
                <li>All parent and guardian accounts</li>
                <li>All term continuous assessment & exam marks</li>
                <li>All fee invoices, balances & payment receipts</li>
                <li>All discipline records & hostel allocations</li>
              </ul>
              <div className="text-[10px] text-rose-700 pt-1">
                Your school profile (name, logo, bank details, grading system) will be preserved.
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-700">
                Type <span className="font-mono text-rose-700 font-black">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={purgeConfirmationText}
                onChange={(e) => setPurgeConfirmationText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-rose-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isPurging}
                onClick={() => {
                  setShowPurgeModal(false);
                  setPurgeConfirmationText("");
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPurging || purgeConfirmationText.trim().toUpperCase() !== "DELETE"}
                onClick={handlePurgeAllData}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {isPurging ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Clearing Data...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Confirm & Wipe Demo Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
