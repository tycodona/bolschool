import React, { useState, useMemo } from "react";
import {
  ClassStream,
  SecondaryPathwayInfo,
  TransportRoute,
  PupilApplication,
  SchoolProfile,
  SecondaryPathway,
  SchoolSection
} from "../types";
import {
  SCHOOL_NAME,
  SCHOOL_SLOGAN,
  SCHOOL_ADDRESS,
  SCHOOL_PHONE,
  SCHOOL_EMAIL,
  CENTRE_CODE,
  ZAMBIAN_PROVINCES,
  SECONDARY_PATHWAYS
} from "../data/zambianSchoolData";
import {
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  Bus,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  Search,
  BookOpen,
  Atom,
  Briefcase,
  Wrench,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  HeartPulse,
  Home,
  Users
} from "lucide-react";
import { copyToClipboard } from "../utils/urlRouter";

interface OnlinePupilApplicationPortalProps {
  classes: ClassStream[];
  routes?: TransportRoute[];
  pathways?: SecondaryPathwayInfo[];
  schoolProfile?: SchoolProfile;
  existingApplications?: PupilApplication[];
  onSubmitApplication: (application: PupilApplication) => void;
  onNavigateToLogin: () => void;
}

export function OnlinePupilApplicationPortal({
  classes,
  routes = [],
  pathways = SECONDARY_PATHWAYS,
  schoolProfile,
  existingApplications = [],
  onSubmitApplication,
  onNavigateToLogin
}: OnlinePupilApplicationPortalProps) {
  // Mode: "apply" | "track" | "success"
  const [viewMode, setViewMode] = useState<"apply" | "track" | "success">("apply");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedAppId, setCopiedAppId] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<PupilApplication | null>(null);

  // Status Tracking State
  const [trackQuery, setTrackQuery] = useState("");
  const [trackedApplication, setTrackedApplication] = useState<PupilApplication | null>(null);
  const [trackError, setTrackError] = useState("");

  // Form Fields State
  const [section, setSection] = useState<SchoolSection>("Primary");
  const [desiredGrade, setDesiredGrade] = useState<string>("Grade 1");
  const [desiredClassId, setDesiredClassId] = useState<number | undefined>(undefined);
  const [selectedPathway, setSelectedPathway] = useState<SecondaryPathway>("Natural Sciences & STEM");
  const [boardingStatus, setBoardingStatus] = useState<"Day Scholar" | "Boarding">("Day Scholar");
  const [transportNeeded, setTransportNeeded] = useState(false);
  const [transportRouteId, setTransportRouteId] = useState<number | undefined>(undefined);
  const [transportPickupPoint, setTransportPickupPoint] = useState("");

  // Pupil Details
  const [pupilFullName, setPupilFullName] = useState("");
  const [gender, setGender] = useState<"Male" | "Female">("Male");
  const [dob, setDob] = useState("2015-05-12");
  const [nrcOrBirthCertNo, setNrcOrBirthCertNo] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [previousGrade, setPreviousGrade] = useState("");
  const [lastExamScore, setLastExamScore] = useState("");
  const [residentialAddress, setResidentialAddress] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("Lusaka Province");
  const [selectedDistrict, setSelectedDistrict] = useState("Lusaka");
  const [specialNeedsOrMedical, setSpecialNeedsOrMedical] = useState("");
  const [allergies, setAllergies] = useState("");
  const [bloodGroup, setBloodGroup] = useState("O+");

  // Guardian Details
  const [guardianFullName, setGuardianFullName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("Father");
  const [guardianNrc, setGuardianNrc] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("+260 ");
  const [guardianAltPhone, setGuardianAltPhone] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [guardianOccupation, setGuardianOccupation] = useState("");
  const [guardianEmployerOrBusiness, setGuardianEmployerOrBusiness] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");

  // Declaration
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [formError, setFormError] = useState("");

  // Compute calculated age from DOB
  const calculatedAge = useMemo(() => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return Math.max(0, age);
  }, [dob]);

  // Available grade options based on section
  const gradeOptions = useMemo(() => {
    if (section === "Early Childhood") return ["Baby Class", "Middle Class", "Reception"];
    if (section === "Primary") return ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7"];
    return ["Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  }, [section]);

  // Filter available classes matching section & grade
  const matchingClasses = useMemo(() => {
    return classes.filter(c => {
      const gLower = (c.name || "").toLowerCase();
      const desiredLower = desiredGrade.toLowerCase();
      return gLower.includes(desiredLower);
    });
  }, [classes, desiredGrade]);

  // Auto-update default grade when section changes
  const handleSectionChange = (newSec: SchoolSection) => {
    setSection(newSec);
    if (newSec === "Early Childhood") {
      setDesiredGrade("Reception");
      setDesiredClassId(undefined);
    } else if (newSec === "Primary") {
      setDesiredGrade("Grade 1");
      setDesiredClassId(undefined);
    } else {
      setDesiredGrade("Grade 8");
      setDesiredClassId(undefined);
    }
  };

  // Districts for selected province
  const availableDistricts = useMemo(() => {
    return ZAMBIAN_PROVINCES[selectedProvince] || ["Lusaka"];
  }, [selectedProvince]);

  // Validation per step
  const validateStep = (step: number): boolean => {
    setFormError("");
    if (step === 1) {
      if (!desiredGrade) {
        setFormError("Please select the desired enrollment grade.");
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!pupilFullName.trim()) {
        setFormError("Please enter the pupil's full official name.");
        return false;
      }
      if (!dob) {
        setFormError("Please enter the pupil's date of birth.");
        return false;
      }
      if (!residentialAddress.trim()) {
        setFormError("Please provide the pupil's physical residential address.");
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!guardianFullName.trim()) {
        setFormError("Please enter the primary parent/guardian's full name.");
        return false;
      }
      if (!guardianNrc.trim()) {
        setFormError("Please enter the parent/guardian NRC number (e.g. 123456/11/1).");
        return false;
      }
      if (!guardianPhone.trim() || guardianPhone.trim() === "+260") {
        setFormError("Please enter a valid WhatsApp or SMS contact phone number.");
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!agreedTerms) {
        setFormError("Please check the declaration box to confirm that the information provided is accurate.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setFormError("");
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  // Submit Final Application
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    // Generate unique Zambian school application reference ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedId = `APP-2026-${randomNum}`;

    const chosenClass = classes.find(c => c.id === desiredClassId);

    const newApplication: PupilApplication = {
      id: generatedId,
      submissionDate: new Date().toISOString().split("T")[0],
      section,
      desiredGrade,
      desiredStream: chosenClass?.streamName || (matchingClasses[0]?.streamName || "General"),
      desiredClassId: desiredClassId || matchingClasses[0]?.id,
      pathway: section === "Secondary" ? selectedPathway : undefined,
      boardingStatus,
      transportNeeded,
      transportRouteId: transportNeeded ? transportRouteId : undefined,
      transportPickupPoint: transportNeeded ? transportPickupPoint : undefined,
      
      // Pupil Details
      pupilFullName: pupilFullName.trim(),
      gender,
      dob,
      age: calculatedAge,
      nrcOrBirthCertNo: nrcOrBirthCertNo.trim() || `TMP-${randomNum}`,
      previousSchool: previousSchool.trim() || "N/A",
      previousGrade: previousGrade.trim() || "N/A",
      lastExamScore: lastExamScore.trim() || "N/A",
      residentialAddress: residentialAddress.trim(),
      district: selectedDistrict,
      province: selectedProvince,
      specialNeedsOrMedical: specialNeedsOrMedical.trim() || "None",
      allergies: allergies.trim() || "None",
      bloodGroup: bloodGroup || "O+",

      // Guardian Details
      guardianFullName: guardianFullName.trim(),
      guardianRelationship,
      guardianNrc: guardianNrc.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianAltPhone: guardianAltPhone.trim(),
      guardianEmail: guardianEmail.trim() || `${pupilFullName.toLowerCase().replace(/\s+/g, ".")}@guardian.zm`,
      guardianOccupation: guardianOccupation.trim() || "Employed / Business",
      guardianEmployerOrBusiness: guardianEmployerOrBusiness.trim(),
      emergencyContactName: emergencyContactName.trim() || guardianFullName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim() || guardianPhone.trim(),

      status: "Pending"
    };

    onSubmitApplication(newApplication);
    setSubmittedApp(newApplication);
    setViewMode("success");
  };

  // Application Tracker lookup
  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError("");
    setTrackedApplication(null);

    const q = trackQuery.trim().toLowerCase();
    if (!q) {
      setTrackError("Please enter your Application Reference Number or Guardian Phone Number.");
      return;
    }

    const found = existingApplications.find(
      app =>
        app.id.toLowerCase() === q ||
        app.guardianPhone.replace(/\s+/g, "").includes(q.replace(/\s+/g, "")) ||
        app.pupilFullName.toLowerCase().includes(q) ||
        (app.nrcOrBirthCertNo && app.nrcOrBirthCertNo.toLowerCase() === q)
    );

    if (found) {
      setTrackedApplication(found);
    } else {
      setTrackError(`No application record found matching "${trackQuery}". Please double check your reference code or phone number.`);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-600 selection:text-white pb-16">
      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight font-serif text-sm sm:text-base">
                  {schoolProfile?.name || SCHOOL_NAME}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  {CENTRE_CODE}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[280px] sm:max-w-md">
                Online Pupil Admission & Self-Registration Portal
              </p>
            </div>
          </div>

          {/* Quick Nav Options */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setViewMode(viewMode === "track" ? "apply" : "track");
                setTrackedApplication(null);
                setTrackError("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === "track"
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>{viewMode === "track" ? "New Application" : "Track Application"}</span>
            </button>

            <button
              onClick={onNavigateToLogin}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Staff / Portal Login</span>
              <span className="sm:hidden">Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {/* ===================== VIEW MODE: TRACK APPLICATION ===================== */}
        {viewMode === "track" && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="text-center max-w-lg mx-auto space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-white font-serif">
                Track Pupil Admission Status
              </h2>
              <p className="text-xs text-slate-400">
                Enter the Application Reference Code (e.g. <span className="font-mono text-emerald-400">APP-2026-1048</span>) or Guardian Phone Number provided during submission.
              </p>
            </div>

            <form onSubmit={handleTrackSubmit} className="max-w-md mx-auto space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="e.g. APP-2026-1048 or 0977448811"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {trackError && (
                <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950"
                >
                  <Search className="w-4 h-4" />
                  <span>Check Admission Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("apply")}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Found Record Result Display */}
            {trackedApplication && (
              <div className="mt-8 border-t border-slate-800 pt-6 space-y-4 animate-in fade-in slide-in-from-bottom-3">
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                          {trackedApplication.id}
                        </span>
                        <span className="text-xs text-slate-400">
                          Submitted on {trackedApplication.submissionDate}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {trackedApplication.pupilFullName}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Applying for <span className="text-slate-200 font-semibold">{trackedApplication.desiredGrade} ({trackedApplication.section} Section)</span>
                      </p>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {trackedApplication.status === "Pending" && (
                        <div className="px-3 py-1.5 rounded-xl bg-amber-950/70 border border-amber-600/70 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                          <span>Pending Administrative Review</span>
                        </div>
                      )}
                      {trackedApplication.status === "Approved" && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Approved & Enrolled</span>
                        </div>
                      )}
                      {trackedApplication.status === "Waitlisted" && (
                        <div className="px-3 py-1.5 rounded-xl bg-indigo-950/80 border border-indigo-600 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>Waitlisted</span>
                        </div>
                      )}
                      {trackedApplication.status === "Rejected" && (
                        <div className="px-3 py-1.5 rounded-xl bg-rose-950/80 border border-rose-600 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-rose-400" />
                          <span>Application Declined</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-slate-500">Gender & Age</div>
                      <div className="text-slate-200 font-semibold mt-0.5">{trackedApplication.gender}, {trackedApplication.age} years old</div>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-slate-500">Guardian Contact</div>
                      <div className="text-slate-200 font-semibold mt-0.5">{trackedApplication.guardianFullName} ({trackedApplication.guardianPhone})</div>
                    </div>
                    <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800/80">
                      <div className="text-slate-500">Boarding / Transport</div>
                      <div className="text-slate-200 font-semibold mt-0.5">
                        {trackedApplication.boardingStatus} {trackedApplication.transportNeeded ? "• Bus Route Requested" : ""}
                      </div>
                    </div>
                  </div>

                  {trackedApplication.adminNotes && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                      <span className="font-bold text-slate-300">Administration Note: </span>
                      <span className="text-slate-400">{trackedApplication.adminNotes}</span>
                    </div>
                  )}

                  {trackedApplication.status === "Approved" && (
                    <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Congratulations! Your application has been approved. </span>
                        <span>Please visit the school administration bursar's office to finalize fee payment and collect your orientation package.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== VIEW MODE: APPLICATION SUCCESS SLIP ===================== */}
        {viewMode === "success" && submittedApp && (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-700 uppercase tracking-wider">
                  Application Successfully Submitted
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white font-serif mt-2">
                  Welcome to {schoolProfile?.name || SCHOOL_NAME}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto mt-1">
                  Your pupil admission application has been registered in the school database and queued for administrative review.
                </p>
              </div>

              {/* Reference ID Pill */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 max-w-md mx-auto flex items-center justify-between gap-3">
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Application Reference Number</div>
                  <div className="text-lg font-black text-emerald-400 font-mono tracking-wider">{submittedApp.id}</div>
                </div>
                <button
                  onClick={async () => {
                    await copyToClipboard(submittedApp.id);
                    setCopiedAppId(true);
                    setTimeout(() => setCopiedAppId(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedAppId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAppId ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={handlePrintSlip}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-emerald-950 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Official Application Slip</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode("track");
                    setTrackQuery(submittedApp.id);
                    setTrackedApplication(submittedApp);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>View in Status Tracker</span>
                </button>
                <button
                  onClick={() => {
                    // Reset form for another application
                    setViewMode("apply");
                    setCurrentStep(1);
                    setPupilFullName("");
                    setNrcOrBirthCertNo("");
                    setSubmittedApp(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                >
                  Register Another Pupil
                </button>
              </div>
            </div>

            {/* Printable Official Application Slip Card */}
            <div id="printable-application-slip" className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              {/* Slip Header */}
              <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
                <div className="space-y-1">
                  <div className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                    Republic of Zambia • Ministry of Education (MoE)
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                    {schoolProfile?.name || SCHOOL_NAME}
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    {schoolProfile?.address || SCHOOL_ADDRESS} • Tel: {schoolProfile?.phone || SCHOOL_PHONE}
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    ECZ Examination Centre Code: {CENTRE_CODE}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="px-3 py-1 bg-emerald-100 text-emerald-900 rounded-lg text-xs font-black border border-emerald-300">
                    ADMISSION APPLICATION SLIP
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                    {submittedApp.id}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Date: {submittedApp.submissionDate}
                  </div>
                </div>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Applicant Full Name</span>
                  <span className="text-slate-900 font-bold text-sm">{submittedApp.pupilFullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Target Grade & Section</span>
                  <span className="text-slate-900 font-bold">{submittedApp.desiredGrade} ({submittedApp.section})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Stream / Class Preference</span>
                  <span className="text-slate-900 font-bold">{submittedApp.desiredStream || "General Stream"}</span>
                </div>

                {submittedApp.pathway && (
                  <div>
                    <span className="text-slate-500 font-medium block">Secondary Pathway</span>
                    <span className="text-slate-900 font-bold text-emerald-700">{submittedApp.pathway}</span>
                  </div>
                )}

                <div>
                  <span className="text-slate-500 font-medium block">Gender & Age</span>
                  <span className="text-slate-900 font-bold">{submittedApp.gender}, {submittedApp.age} Years (DOB: {submittedApp.dob})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Birth Cert / Reg No</span>
                  <span className="text-slate-900 font-bold">{submittedApp.nrcOrBirthCertNo || "Temporary Registration"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Boarding / Transport</span>
                  <span className="text-slate-900 font-bold">{submittedApp.boardingStatus} {submittedApp.transportNeeded ? "• Bus Transport" : ""}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Primary Guardian</span>
                  <span className="text-slate-900 font-bold">{submittedApp.guardianFullName} ({submittedApp.guardianRelationship})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Guardian Phone / NRC</span>
                  <span className="text-slate-900 font-bold">{submittedApp.guardianPhone} • {submittedApp.guardianNrc}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-slate-500 font-medium block">Residential Address</span>
                  <span className="text-slate-900 font-semibold">{submittedApp.residentialAddress}, {submittedApp.district}, {submittedApp.province}</span>
                </div>
              </div>

              {/* Instructions Notice */}
              <div className="bg-slate-50 border border-slate-300 rounded-xl p-4 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Next Steps for Enrollment:</span>
                </div>
                <p className="text-slate-600">
                  1. Keep this Application Slip safely or screenshot the reference code: <strong className="font-mono">{submittedApp.id}</strong>.
                </p>
                <p className="text-slate-600">
                  2. Our Admissions Registrar will review your submission and you will receive an SMS notification at <strong className="font-mono">{submittedApp.guardianPhone}</strong>.
                </p>
                <p className="text-slate-600">
                  3. You can check the approval status anytime via the online status tracker at this portal link.
                </p>
              </div>

              {/* Footer Sign-off */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                <div>Generated electronically by {SCHOOL_NAME} Admission System</div>
                <div className="font-serif italic">"Quality Education in a Christian Environment"</div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== VIEW MODE: MULTI-STEP APPLICATION FORM ===================== */}
        {viewMode === "apply" && (
          <div className="space-y-6">
            {/* Header Title Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase tracking-wider mb-1">
                    Academic Year 2026 Admissions
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
                    Pupil Registration & Admission Application
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Complete the online application form to register a new pupil for enrollment at {schoolProfile?.name || SCHOOL_NAME}.
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <div className="text-right text-xs">
                    <span className="text-slate-400">Step {currentStep} of 4</span>
                    <div className="text-[11px] font-bold text-emerald-400">
                      {currentStep === 1 && "Placement"}
                      {currentStep === 2 && "Pupil Details"}
                      {currentStep === 3 && "Guardian Contacts"}
                      {currentStep === 4 && "Review & Submit"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Step Progress Indicator */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { step: 1, title: "1. Section & Class" },
                  { step: 2, title: "2. Pupil Identity" },
                  { step: 3, title: "3. Parent Details" },
                  { step: 4, title: "4. Submission" }
                ].map((s) => (
                  <button
                    key={s.step}
                    type="button"
                    onClick={() => {
                      if (s.step < currentStep) setCurrentStep(s.step);
                    }}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      s.step === currentStep
                        ? "bg-emerald-500 ring-2 ring-emerald-500/30"
                        : s.step < currentStep
                        ? "bg-emerald-700"
                        : "bg-slate-800"
                    }`}
                    title={s.title}
                  />
                ))}
              </div>
            </div>

            {/* Error banner */}
            {formError && (
              <div className="p-4 bg-rose-950/80 border border-rose-700 text-rose-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{formError}</span>
              </div>
            )}

            {/* Form Container */}
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              {/* ----------------- STEP 1: SECTION, GRADE & PLACEMENT ----------------- */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-emerald-400" />
                      <span>Step 1: Academic Section, Grade & Class Stream</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Select the appropriate school section, target grade level, and optional stream or pathway.
                    </p>
                  </div>

                  {/* Section Selector Pills */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                      1. Select School Section *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "Early Childhood" as SchoolSection,
                          title: "Early Childhood",
                          desc: "Baby Class, Middle Class & Reception (Ages 3-5)"
                        },
                        {
                          id: "Primary" as SchoolSection,
                          title: "Primary School",
                          desc: "Grades 1 to 7 (ECZ Curriculum, Ages 6-13)"
                        },
                        {
                          id: "Secondary" as SchoolSection,
                          title: "Secondary School",
                          desc: "Junior (Grades 8-9) & Senior (Grades 10-12)"
                        }
                      ].map((sec) => (
                        <button
                          key={sec.id}
                          type="button"
                          onClick={() => handleSectionChange(sec.id)}
                          className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                            section === sec.id
                              ? "bg-emerald-950/70 border-emerald-500 ring-1 ring-emerald-500 shadow-md shadow-emerald-950"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-bold ${section === sec.id ? "text-white" : "text-slate-300"}`}>
                              {sec.title}
                            </span>
                            {section === sec.id && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {sec.desc}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Grade Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        2. Target Enrollment Grade *
                      </label>
                      <select
                        value={desiredGrade}
                        onChange={(e) => {
                          setDesiredGrade(e.target.value);
                          setDesiredClassId(undefined);
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {gradeOptions.map((g) => (
                          <option key={g} value={g} className="bg-slate-900 text-white">
                            {g}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specific Stream/Class Preference */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        3. Class Stream Preference (Optional)
                      </label>
                      <select
                        value={desiredClassId || ""}
                        onChange={(e) => setDesiredClassId(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        <option value="" className="bg-slate-900 text-slate-400">
                          {matchingClasses.length > 0
                            ? `Select Preferred Stream (e.g. ${matchingClasses.map(c => c.name).join(", ")})`
                            : "Auto-assign by Administration"}
                        </option>
                        {matchingClasses.map((c) => (
                          <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                            {c.name} {c.room ? `• Room ${c.room}` : ""} {c.teacherName ? `(Tr. ${c.teacherName})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Secondary Pathway Selection (for Senior Secondary) */}
                  {section === "Secondary" && (desiredGrade.includes("10") || desiredGrade.includes("11") || desiredGrade.includes("12")) && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center gap-2">
                        <Atom className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Senior Secondary Academic Pathway (MoE Curriculum)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Choose the pupil's specialized career pathway for Grades 10-12 ECZ syllabus:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {pathways.map((pw) => (
                          <button
                            key={pw.id}
                            type="button"
                            onClick={() => setSelectedPathway(pw.name as SecondaryPathway)}
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              selectedPathway === pw.name
                                ? "bg-emerald-950/90 border-emerald-500 ring-1 ring-emerald-500 text-white"
                                : "bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white">{pw.name}</span>
                              {selectedPathway === pw.name && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                              Core subjects: {pw.compulsorySubjects.slice(0, 4).join(", ")}...
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Boarding vs Day Scholar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        4. Enrollment Status *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setBoardingStatus("Day Scholar")}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            boardingStatus === "Day Scholar"
                              ? "bg-emerald-950 border-emerald-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Home className="w-3.5 h-3.5" />
                          <span>Day Scholar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setBoardingStatus("Boarding")}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            boardingStatus === "Boarding"
                              ? "bg-emerald-950 border-emerald-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span>Boarding Pupil</span>
                        </button>
                      </div>
                    </div>

                    {/* School Bus Option */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        5. School Bus Transport Service
                      </label>
                      <div className="flex items-center gap-3 h-[42px] px-3.5 bg-slate-950 border border-slate-700 rounded-xl">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium w-full">
                          <input
                            type="checkbox"
                            checked={transportNeeded}
                            onChange={(e) => setTransportNeeded(e.target.checked)}
                            className="w-4 h-4 rounded-sm bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <Bus className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Requires School Bus Pickup & Dropoff</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Route details if transport needed */}
                  {transportNeeded && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="text-xs font-bold text-slate-200">
                        Bus Corridor & Pickup Landmark
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Select Bus Route</label>
                          <select
                            value={transportRouteId || ""}
                            onChange={(e) => setTransportRouteId(e.target.value ? Number(e.target.value) : undefined)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          >
                            <option value="">Select School Bus Route</option>
                            {routes.map(r => (
                              <option key={r.id} value={r.id}>
                                {r.name} ({r.zone})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Pickup / Dropoff Landmark</label>
                          <input
                            type="text"
                            value={transportPickupPoint}
                            onChange={(e) => setTransportPickupPoint(e.target.value)}
                            placeholder="e.g. Woodlands Shopping Complex or Avondale Roundabout"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ----------------- STEP 2: PUPIL PERSONAL DETAILS ----------------- */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-400" />
                      <span>Step 2: Pupil Personal Identity & Academic History</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enter official particulars as appearing on the birth certificate or previous school records.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Pupil Full Legal Name (First, Middle, Surname) *
                      </label>
                      <input
                        type="text"
                        required
                        value={pupilFullName}
                        onChange={(e) => setPupilFullName(e.target.value)}
                        placeholder="e.g. Mwamba Natasha Chilufya"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Gender *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setGender("Male")}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            gender === "Male"
                              ? "bg-emerald-950 border-emerald-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          Male
                        </button>
                        <button
                          type="button"
                          onClick={() => setGender("Female")}
                          className={`py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            gender === "Female"
                              ? "bg-emerald-950 border-emerald-500 text-white"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          Female
                        </button>
                      </div>
                    </div>

                    {/* Date of Birth & Calculated Age */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Date of Birth (Age: {calculatedAge} Yrs) *
                      </label>
                      <input
                        type="date"
                        required
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Birth Certificate or National ID */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Birth Certificate No. / NRC / ID
                      </label>
                      <input
                        type="text"
                        value={nrcOrBirthCertNo}
                        onChange={(e) => setNrcOrBirthCertNo(e.target.value)}
                        placeholder="e.g. BC-2015/LSK/1892"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Blood Group */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Blood Group
                      </label>
                      <select
                        value={bloodGroup}
                        onChange={(e) => setBloodGroup(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-", "Unknown"].map(b => (
                          <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Previous School */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Previous School Attended (If Any)
                      </label>
                      <input
                        type="text"
                        value={previousSchool}
                        onChange={(e) => setPreviousSchool(e.target.value)}
                        placeholder="e.g. Lusaka Primary School"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Last Exam Results */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Last Academic / ECZ Examination Score
                      </label>
                      <input
                        type="text"
                        value={lastExamScore}
                        onChange={(e) => setLastExamScore(e.target.value)}
                        placeholder="e.g. Grade 7 composite: 730/800 or Grade 9 Certificate"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Physical Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Physical Residential Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={residentialAddress}
                        onChange={(e) => setResidentialAddress(e.target.value)}
                        placeholder="e.g. Plot 18, Independence Avenue, Woodlands, Lusaka"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Province */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Province *
                      </label>
                      <select
                        value={selectedProvince}
                        onChange={(e) => {
                          setSelectedProvince(e.target.value);
                          setSelectedDistrict(ZAMBIAN_PROVINCES[e.target.value]?.[0] || "Lusaka");
                        }}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {Object.keys(ZAMBIAN_PROVINCES).map(p => (
                          <option key={p} value={p} className="bg-slate-900 text-white">{p}</option>
                        ))}
                      </select>
                    </div>

                    {/* District */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        District *
                      </label>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => setSelectedDistrict(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {availableDistricts.map(d => (
                          <option key={d} value={d} className="bg-slate-900 text-white">{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Medical details */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Medical Conditions / Special Needs
                      </label>
                      <input
                        type="text"
                        value={specialNeedsOrMedical}
                        onChange={(e) => setSpecialNeedsOrMedical(e.target.value)}
                        placeholder="e.g. Asthma, Spectacles, or None"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Known Food / Drug Allergies
                      </label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="e.g. Peanuts, Penicillin, or None"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- STEP 3: PARENT / GUARDIAN CONTACTS ----------------- */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <span>Step 3: Primary Parent / Legal Guardian Information</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      This information links the guardian account for school notices, termly report cards, and fee invoices.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Guardian Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Guardian Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={guardianFullName}
                        onChange={(e) => setGuardianFullName(e.target.value)}
                        placeholder="e.g. Mr. Patrick Banda"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Relationship */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Relationship to Pupil *
                      </label>
                      <select
                        value={guardianRelationship}
                        onChange={(e) => setGuardianRelationship(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      >
                        {["Father", "Mother", "Legal Guardian", "Uncle", "Aunt", "Grandparent", "Brother", "Sister"].map(r => (
                          <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                        ))}
                      </select>
                    </div>

                    {/* Guardian NRC */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Guardian NRC Number (National Registration) *
                      </label>
                      <input
                        type="text"
                        required
                        value={guardianNrc}
                        onChange={(e) => setGuardianNrc(e.target.value)}
                        placeholder="e.g. 239104/11/1"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium font-mono"
                      />
                    </div>

                    {/* WhatsApp / SMS Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Primary WhatsApp / SMS Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={guardianPhone}
                        onChange={(e) => setGuardianPhone(e.target.value)}
                        placeholder="e.g. +260 977 123456"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Alt Phone */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Alternative Phone Number
                      </label>
                      <input
                        type="tel"
                        value={guardianAltPhone}
                        onChange={(e) => setGuardianAltPhone(e.target.value)}
                        placeholder="e.g. +260 966 987654"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Guardian Email Address
                      </label>
                      <input
                        type="email"
                        value={guardianEmail}
                        onChange={(e) => setGuardianEmail(e.target.value)}
                        placeholder="e.g. p.banda@gmail.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Occupation / Workplace */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Occupation / Profession
                      </label>
                      <input
                        type="text"
                        value={guardianOccupation}
                        onChange={(e) => setGuardianOccupation(e.target.value)}
                        placeholder="e.g. Accountant, Civil Servant, Business Owner"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Employer / Business Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Employer / Company / Organization
                      </label>
                      <input
                        type="text"
                        value={guardianEmployerOrBusiness}
                        onChange={(e) => setGuardianEmployerOrBusiness(e.target.value)}
                        placeholder="e.g. Ministry of Finance or Self-Employed"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Emergency Contact Person (Alt Guardian)
                      </label>
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Mrs. Mary Banda (Mother / Aunt)"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="e.g. +260 971 112233"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ----------------- STEP 4: REVIEW & DECLARATION ----------------- */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <div className="border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Step 4: Review Application & Declaration</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Verify all particulars before final submission into the school registry.
                    </p>
                  </div>

                  {/* Summary Card */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Pupil Full Name</span>
                        <span className="text-white font-bold">{pupilFullName || "—"}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Enrolling Grade & Section</span>
                        <span className="text-emerald-400 font-bold">{desiredGrade} ({section})</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Gender & Age</span>
                        <span className="text-white font-bold">{gender}, {calculatedAge} Years</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Boarding / Transport</span>
                        <span className="text-white font-bold">{boardingStatus} {transportNeeded ? "• Bus" : ""}</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Primary Guardian</span>
                        <span className="text-white font-bold">{guardianFullName} ({guardianRelationship})</span>
                      </div>
                      <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">Guardian Phone / NRC</span>
                        <span className="text-white font-bold">{guardianPhone} • {guardianNrc}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400">
                      <span className="font-bold text-slate-300">Physical Address: </span>
                      <span>{residentialAddress}, {selectedDistrict}, {selectedProvince}</span>
                    </div>
                  </div>

                  {/* Declaration Checkbox */}
                  <div className="p-4 bg-emerald-950/40 border border-emerald-700/60 rounded-xl space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-200">
                      <input
                        type="checkbox"
                        required
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded-sm bg-slate-900 border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                      />
                      <span>
                        I hereby declare that the particulars provided in this admission application are true and complete to the best of my knowledge, and agree to abide by the school rules, regulations, and fee policies of {schoolProfile?.name || SCHOOL_NAME}.
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Controls Bar */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous Step</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onNavigateToLogin}
                    className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    Back to School Portal
                  </button>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-md shadow-emerald-950 cursor-pointer ml-auto"
                  >
                    <span>Continue to Step {currentStep + 1}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950 cursor-pointer ml-auto uppercase tracking-wider"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit Admission Application</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
