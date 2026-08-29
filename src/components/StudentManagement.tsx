import React, { useState, useMemo } from "react";
import {
  Student,
  ClassStream,
  Teacher,
  AcademicBatch,
  SubjectDefinition,
  SecondaryPathway,
  SchoolSection,
  SchoolProfile
} from "../types";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Upload,
  Download,
  FileSpreadsheet,
  GraduationCap,
  Sparkles,
  Layers,
  BookOpen,
  BookmarkCheck,
  Building2,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Filter,
  UserCheck,
  IdCard,
  Eye,
  X,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
  UserCheck2,
  ShieldCheck,
  ExternalLink,
  School
} from "lucide-react";
import { BulkStudentImportModal } from "./BulkStudentImportModal";
import { ClassCreationModal } from "./ClassCreationModal";
import { BatchCreationModal } from "./BatchCreationModal";
import { SubjectCreationModal } from "./SubjectCreationModal";
import { StudentCreationModal } from "./StudentCreationModal";
import {
  downloadStudentImportTemplateCsv,
  exportStudentRosterCsv,
  exportClassesCsv,
  exportBatchesCsv,
  exportSubjectsCatalogCsv
} from "../utils/csvExporter";
import { SECONDARY_PATHWAYS } from "../data/zambianSchoolData";

export interface StudentManagementProps {
  students: Student[];
  classes: ClassStream[];
  teachers?: Teacher[];
  batches?: AcademicBatch[];
  subjectsCatalog?: SubjectDefinition[];
  onAddStudent: (newStudent: Omit<Student, "id">) => void;
  onAddBulkStudents?: (newStudents: Omit<Student, "id">[]) => void;
  onEditStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (id: number) => void;
  onAddClass?: (newClass: Omit<ClassStream, "id"> | ClassStream) => void;
  onEditClass?: (updatedClass: ClassStream) => void;
  onDeleteClass?: (classId: number) => void;
  onAddBatch?: (newBatch: AcademicBatch) => void;
  onEditBatch?: (updatedBatch: AcademicBatch) => void;
  onDeleteBatch?: (batchId: string) => void;
  onAddSubject?: (newSubject: SubjectDefinition) => void;
  onEditSubject?: (updatedSubject: SubjectDefinition) => void;
  onDeleteSubject?: (subjectId: string) => void;
  canManage: boolean;
  schoolProfile?: SchoolProfile;
}

// Helper function to check if student is primary
const checkIsPrimary = (s: Student) => {
  if (s.section === "Primary" || s.section === "Early Childhood") return true;
  const gLower = (s.grade || "").toLowerCase();
  return gLower.includes("grade 1") || gLower.includes("grade 2") || gLower.includes("grade 3") ||
         gLower.includes("grade 4") || gLower.includes("grade 5") || gLower.includes("grade 6") ||
         gLower.includes("grade 7") || gLower.includes("baby") || gLower.includes("middle") || gLower.includes("reception");
};

export function StudentManagement({
  students,
  classes,
  teachers = [],
  batches = [],
  subjectsCatalog = [],
  onAddStudent,
  onAddBulkStudents,
  onEditStudent,
  onDeleteStudent,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onAddBatch,
  onEditBatch,
  onDeleteBatch,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  canManage = true,
  schoolProfile
}: StudentManagementProps) {
  // Main Sub-Tab Navigation: pupils | classes | batches | subjects
  const [activeSubTab, setActiveSubTab] = useState<"pupils" | "classes" | "batches" | "subjects">("pupils");

  // Separate Pupil Directory Views: "primary" | "secondary" | "all"
  const [directorySectionView, setDirectorySectionView] = useState<"primary" | "secondary" | "all">(() => {
    if (students.length > 0 && students.every(s => !checkIsPrimary(s))) return "secondary";
    return "primary";
  });

  // Filter States for Pupils
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassFilter, setSelectedClassFilter] = useState<number | "all">("all");
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string | "all">("all");
  const [selectedPathwayFilter, setSelectedPathwayFilter] = useState<SecondaryPathway | "all">("all");

  // Filter States for Classes
  const [classSectionFilter, setClassSectionFilter] = useState<SchoolSection | "all">("all");
  const [classSearch, setClassSearch] = useState("");

  // Filter States for Subjects
  const [subjectDeptFilter, setSubjectDeptFilter] = useState<string>("all");
  const [subjectSearch, setSubjectSearch] = useState("");

  // Filter States for Batches
  const [batchStatusFilter, setBatchStatusFilter] = useState<string>("all");

  // Modals state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showBulkStudentModal, setShowBulkStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassStream | null>(null);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<AcademicBatch | null>(null);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectDefinition | null>(null);

  // Student Profile Quick View Modal
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick navigation helper from classes/batches to pupils
  const handleDrillDownClassPupils = (classId: number) => {
    const targetClass = classes.find(c => c.id === classId);
    if (targetClass) {
      if (targetClass.section === "Secondary" || (targetClass.gradeNum && targetClass.gradeNum >= 8)) {
        setDirectorySectionView("secondary");
      } else {
        setDirectorySectionView("primary");
      }
      setSelectedClassFilter(classId);
      setSelectedBatchFilter("all");
      setActiveSubTab("pupils");
    }
  };

  const handleDrillDownBatchPupils = (batchId: string) => {
    setSelectedBatchFilter(batchId);
    setSelectedClassFilter("all");
    setDirectorySectionView("all");
    setActiveSubTab("pupils");
  };

  // Quick Class Teacher Assignment direct from card
  const handleAssignClassTeacher = (classId: number, teacherId: number) => {
    if (!onEditClass) return;
    const targetClass = classes.find(c => c.id === classId);
    const teacher = teachers.find(t => t.id === teacherId);
    if (targetClass && teacher) {
      const updated: ClassStream = {
        ...targetClass,
        teacherId: teacher.id,
        teacherName: teacher.name
      };
      onEditClass(updated);
      triggerToast(`Assigned ${teacher.name} as Class Teacher for ${targetClass.name}.`);
    }
  };

  // --- SEPARATED PUPIL FILTERING ---
  const primaryStudentsList = useMemo(() => students.filter(checkIsPrimary), [students]);
  const secondaryStudentsList = useMemo(() => students.filter(s => !checkIsPrimary(s)), [students]);

  const activeDirectoryStudents = useMemo(() => {
    if (directorySectionView === "primary") return primaryStudentsList;
    if (directorySectionView === "secondary") return secondaryStudentsList;
    return students;
  }, [directorySectionView, primaryStudentsList, secondaryStudentsList, students]);

  const filteredStudents = useMemo(() => {
    return activeDirectoryStudents.filter(s => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.eczNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.pathway && s.pathway.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesClass = selectedClassFilter === "all" || s.classId === selectedClassFilter;
      const matchesBatch = selectedBatchFilter === "all" || s.batchId === selectedBatchFilter;
      const matchesPathway = selectedPathwayFilter === "all" || s.pathway === selectedPathwayFilter;

      return matchesSearch && matchesClass && matchesBatch && matchesPathway;
    });
  }, [activeDirectoryStudents, searchQuery, selectedClassFilter, selectedBatchFilter, selectedPathwayFilter]);

  // --- CLASS FILTERING ---
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const matchesSec = classSectionFilter === "all" || c.section === classSectionFilter;
      const matchesSearch =
        c.name.toLowerCase().includes(classSearch.toLowerCase()) ||
        c.teacherName.toLowerCase().includes(classSearch.toLowerCase()) ||
        c.streamName.toLowerCase().includes(classSearch.toLowerCase()) ||
        (c.room && c.room.toLowerCase().includes(classSearch.toLowerCase()));
      return matchesSec && matchesSearch;
    });
  }, [classes, classSectionFilter, classSearch]);

  // --- SUBJECT FILTERING ---
  const filteredSubjects = useMemo(() => {
    return subjectsCatalog.filter(sub => {
      const matchesDept = subjectDeptFilter === "all" || sub.department === subjectDeptFilter;
      const matchesSearch =
        sub.name.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        sub.code.toLowerCase().includes(subjectSearch.toLowerCase()) ||
        (sub.assignedTeacherName && sub.assignedTeacherName.toLowerCase().includes(subjectSearch.toLowerCase()));
      return matchesDept && matchesSearch;
    });
  }, [subjectsCatalog, subjectDeptFilter, subjectSearch]);

  // --- BATCH FILTERING ---
  const filteredBatches = useMemo(() => {
    return batches.filter(b => {
      const matchesStatus = batchStatusFilter === "all" || b.status === batchStatusFilter;
      return matchesStatus;
    });
  }, [batches, batchStatusFilter]);

  // Available classes for dropdowns depending on selected directory view
  const availableClassesForDirectory = useMemo(() => {
    if (directorySectionView === "primary") {
      return classes.filter(c => c.section === "Primary" || c.section === "Early Childhood" || (c.gradeNum && c.gradeNum <= 7));
    }
    if (directorySectionView === "secondary") {
      return classes.filter(c => c.section === "Secondary" || (c.gradeNum && c.gradeNum >= 8));
    }
    return classes;
  }, [classes, directorySectionView]);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner & Data Structure Flow Diagram */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                Academic Management Architecture
              </span>
              <span className="text-xs text-slate-400 font-medium">Session 2026</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 font-serif mt-1 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>Pupil Directory, Class Streams & Academic Batches</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured hierarchical flow linking Pupils ➔ Assigned Class Teachers & Streams (Max 100) ➔ Academic Cohort Batches.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-center min-w-[75px]">
              <div className="text-xs font-black text-emerald-900">{primaryStudentsList.length}</div>
              <div className="text-[10px] text-emerald-700 font-bold">Primary</div>
            </div>
            <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-xl text-center min-w-[75px]">
              <div className="text-xs font-black text-indigo-900">{secondaryStudentsList.length}</div>
              <div className="text-[10px] text-indigo-700 font-bold">Secondary</div>
            </div>
            <div className="px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-xl text-center min-w-[75px]">
              <div className="text-xs font-black text-sky-900">{classes.length}</div>
              <div className="text-[10px] text-sky-700 font-bold">Streams</div>
            </div>
            <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-center min-w-[75px]">
              <div className="text-xs font-black text-amber-900">{batches.length}</div>
              <div className="text-[10px] text-amber-700 font-bold">Batches</div>
            </div>
          </div>
        </div>

        {/* Visual Data Flow Breadcrumb Banner (Requirement 1) */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex flex-col md:flex-row items-center justify-between gap-2">
          <span className="font-bold text-slate-700 shrink-0">Data Dependency Flow:</span>
          <div className="flex items-center gap-2 flex-wrap text-[11px]">
            <button
              onClick={() => setActiveSubTab("pupils")}
              className="px-2.5 py-1 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-900 font-bold hover:bg-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Users className="w-3 h-3 text-emerald-700" />
              <span>1. Pupils Directory ({students.length})</span>
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => setActiveSubTab("classes")}
              className="px-2.5 py-1 rounded-lg bg-sky-100/80 border border-sky-300 text-sky-900 font-bold hover:bg-sky-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Layers className="w-3 h-3 text-sky-700" />
              <span>2. Class Streams (Teacher Assigned, Max 100)</span>
            </button>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => setActiveSubTab("batches")}
              className="px-2.5 py-1 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-900 font-bold hover:bg-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-amber-700" />
              <span>3. Academic Batches ({batches.length})</span>
            </button>
          </div>
        </div>

        {/* 4 Primary Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("pupils")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === "pupils"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pupil Directory & Admissions ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("classes")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === "classes"
                ? "bg-sky-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Classes & Streams ({classes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("batches")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === "batches"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Academic Batches & Cohorts ({batches.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("subjects")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeSubTab === "subjects"
                ? "bg-purple-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Curriculum Subjects ({subjectsCatalog.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: SEPARATED PUPIL DIRECTORY & ADMISSIONS (Requirements 1, 2, 4)  */}
      {/* ========================================================================= */}
      {activeSubTab === "pupils" && (
        <div className="space-y-4">
          {/* Section Segregation Selector (Requirement 2 & 4) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
              {(primaryStudentsList.length > 0 || directorySectionView === "primary") && (
                <button
                  type="button"
                  onClick={() => {
                    setDirectorySectionView("primary");
                    setSelectedClassFilter("all");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    directorySectionView === "primary"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🎒 Primary Pupil Directory</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    directorySectionView === "primary" ? "bg-emerald-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {primaryStudentsList.length}
                  </span>
                </button>
              )}

              {(secondaryStudentsList.length > 0 || directorySectionView === "secondary") && (
                <button
                  type="button"
                  onClick={() => {
                    setDirectorySectionView("secondary");
                    setSelectedClassFilter("all");
                  }}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    directorySectionView === "secondary"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🎓 Secondary Pupil Directory</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    directorySectionView === "secondary" ? "bg-indigo-700 text-white" : "bg-slate-200 text-slate-700"
                  }`}>
                    {secondaryStudentsList.length}
                  </span>
                </button>
              )}

              {primaryStudentsList.length > 0 && secondaryStudentsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDirectorySectionView("all");
                    setSelectedClassFilter("all");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    directorySectionView === "all"
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🌐 All Pupils Master</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {directorySectionView === "primary"
                  ? "Showing only Primary pupils (Grades 1 – 7 & ECE). Separated from Secondary."
                  : directorySectionView === "secondary"
                  ? "Showing only Secondary pupils (Forms 1 – 4). Separated from Primary."
                  : "Master directory showing all registered pupils across school sections."}
              </span>
            </div>
          </div>

          {/* Action & Filter Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={`Search ${directorySectionView === "primary" ? "primary" : directorySectionView === "secondary" ? "secondary" : "all"} pupils by name, ECZ no, guardian...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-slate-800 bg-slate-50/50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    const filterDesc =
                      selectedClassFilter !== "all"
                        ? classes.find((c) => c.id === selectedClassFilter)?.name
                        : directorySectionView;
                    exportStudentRosterCsv(filteredStudents, classes, filterDesc, batches);
                    triggerToast(`Exported ${filteredStudents.length} pupil records to CSV / Excel format.`);
                  }}
                  className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  title="Export filtered pupil table to CSV / Excel"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Export CSV ({filteredStudents.length})</span>
                </button>

                {canManage && (
                  <>
                    <button
                      onClick={() => setShowBulkStudentModal(true)}
                      className="px-3 py-2 border border-emerald-200 bg-emerald-50/80 rounded-xl text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Bulk CSV Import</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingStudent(null);
                        setShowStudentModal(true);
                      }}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Enrol New Pupil</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filters:
              </span>

              {/* Class Stream Filter */}
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value === "all" ? "all" : parseInt(e.target.value))}
                className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
              >
                <option value="all">All Class Streams ({availableClassesForDirectory.length})</option>
                {availableClassesForDirectory.map(c => (
                  <option key={c.id} value={c.id}>{c.name} • {c.teacherName}</option>
                ))}
              </select>

              {/* Batch Cohort Filter */}
              {batches.length > 0 && (
                <select
                  value={selectedBatchFilter}
                  onChange={(e) => setSelectedBatchFilter(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                >
                  <option value="all">All Academic Batches</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              )}

              {/* Pathway Filter if secondary */}
              {directorySectionView !== "primary" && (
                <select
                  value={selectedPathwayFilter}
                  onChange={(e) => setSelectedPathwayFilter(e.target.value as any)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium"
                >
                  <option value="all">All Secondary Pathways</option>
                  <option value="Natural Sciences">Natural Sciences</option>
                  <option value="Business & Commercial">Business & Commercial</option>
                  <option value="Social Sciences & Humanities">Social Sciences & Humanities</option>
                  <option value="Technical & Vocational">Technical & Vocational</option>
                  <option value="Junior Secondary Core">Junior Secondary Core</option>
                </select>
              )}

              {(searchQuery || selectedClassFilter !== "all" || selectedBatchFilter !== "all" || selectedPathwayFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedClassFilter("all");
                    setSelectedBatchFilter("all");
                    setSelectedPathwayFilter("all");
                  }}
                  className="text-[11px] text-rose-600 hover:underline ml-auto font-medium cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Pupils Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Pupil Bio & ECZ No.</th>
                    <th className="py-3 px-4">Class Stream</th>
                    <th className="py-3 px-4">Assigned Class Teacher</th>
                    <th className="py-3 px-4">Academic Batch</th>
                    <th className="py-3 px-4">Guardian Contact</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">No pupils found in this directory</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Click "+ Enrol New Pupil" or adjust search filters</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((st) => {
                      const cls = classes.find(c => c.id === st.classId);
                      const batch = batches.find(b => b.id === (st.batchId || cls?.batchId));
                      const isSec = (cls?.gradeNum || 7) >= 8 || st.section === "Secondary";

                      return (
                        <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Pupil Bio */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                st.gender === "Female"
                                  ? "bg-rose-100 text-rose-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}>
                                {st.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{st.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                                  <span>ECZ: {st.eczNo}</span>
                                  <span>•</span>
                                  <span>{st.gender}, {st.age} yrs</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Class Stream */}
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-800">{cls?.name || `${st.grade} ${st.stream}`}</span>
                            <div className="text-[10px] text-slate-400">{cls?.room || "Main Wing"}</div>
                          </td>

                          {/* Assigned Class Teacher (Requirement 3) */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <UserCheck2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="font-bold text-slate-800">{cls?.teacherName || "Unassigned"}</span>
                            </div>
                          </td>

                          {/* Academic Batch */}
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-900 border border-amber-200 inline-block max-w-[150px] truncate">
                              {batch?.name || "2026 Main Cohort"}
                            </span>
                          </td>

                          {/* Guardian Contact */}
                          <td className="py-3 px-4">
                            <div className="text-slate-800 font-medium">{st.guardianName}</div>
                            <div className="text-[10px] text-slate-400">{st.guardianPhone}</div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : st.status === "Withdrawn" || st.status === "Inactive"
                                ? "bg-rose-100 text-rose-800"
                                : "bg-slate-100 text-slate-600"
                            }`}>
                              {st.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setViewingStudent(st)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                                title="View Pupil ID Card"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {canManage && (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingStudent(st);
                                      setShowStudentModal(true);
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                    title="Edit Pupil Details"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete ${st.name}?`)) {
                                        onDeleteStudent(st.id);
                                        triggerToast(`Pupil ${st.name} removed.`);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                    title="Delete Pupil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Showing {filteredStudents.length} of {activeDirectoryStudents.length} pupils in this section directory</span>
              <button
                onClick={() => downloadStudentImportTemplateCsv()}
                className="text-emerald-700 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample CSV Template</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: CLASSES & STREAMS MANAGEMENT (Requirements 1, 3, 9)           */}
      {/* ========================================================================= */}
      {activeSubTab === "classes" && (
        <div className="space-y-4">
          {/* Classes Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search class, stream, teacher..."
                  value={classSearch}
                  onChange={(e) => setClassSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-sky-500 focus:outline-hidden text-slate-800"
                />
              </div>

              <select
                value={classSectionFilter}
                onChange={(e) => setClassSectionFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="all">All Sections ({classes.length})</option>
                <option value="Primary">Primary (Grades 1-7)</option>
                <option value="Secondary">Secondary (Grades 8-12)</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  exportClassesCsv(filteredClasses, students, batches);
                  triggerToast(`Exported ${filteredClasses.length} class streams to CSV.`);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                title="Export classes and capacity utilization to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Classes CSV</span>
              </button>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingClass(null);
                    setShowClassModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Class Stream</span>
                </button>
              )}
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClasses.map((cls) => {
              const enrolledInClass = students.filter(s => s.classId === cls.id);
              const maxCapacity = cls.capacity || 100;
              const fillPercentage = Math.min(100, Math.round((enrolledInClass.length / maxCapacity) * 100));
              const batch = batches.find(b => b.id === cls.batchId);
              const isExam = cls.gradeNum === 7 || cls.gradeNum === 9 || cls.gradeNum === 12;

              return (
                <div
                  key={cls.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Name & Section Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 font-serif text-sm">
                            {cls.name}
                          </h3>
                          {isExam && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200">
                              ECZ Exam
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{cls.room || "Main Class"}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        cls.section === "Primary"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-sky-50 text-sky-800 border-sky-200"
                      }`}>
                        {cls.section || (cls.gradeNum >= 8 ? "Secondary" : "Primary")}
                      </span>
                    </div>

                    {/* Pathway Info if secondary */}
                    {cls.pathway && (
                      <div className="mt-3 p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate font-medium">{cls.pathway}</span>
                      </div>
                    )}

                    {/* Assigned Class Teacher Card (Requirement 3) */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                        <span>Assigned Class Teacher</span>
                        {canManage && (
                          <span className="text-emerald-700 lowercase font-normal">edit inline</span>
                        )}
                      </div>

                      {canManage && teachers.length > 0 ? (
                        <select
                          value={cls.teacherId || ""}
                          onChange={(e) => handleAssignClassTeacher(cls.id, parseInt(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="">-- Assign Teacher --</option>
                          {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.section})</option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <UserCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{cls.teacherName || "Unassigned"}</span>
                        </div>
                      )}
                    </div>

                    {/* Cohort Batch Link */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500">
                      <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
                      <span className="truncate">Cohort: <span className="font-medium text-slate-800">{batch?.name || "2026 Main"}</span></span>
                    </div>
                  </div>

                  {/* Bottom: Capacity Bar & Actions (Requirement 9: Capacity up to 100) */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-600">Enrolled Pupils (Max 100):</span>
                      <span className="font-mono font-bold text-slate-900">{enrolledInClass.length} / {maxCapacity} ({fillPercentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          fillPercentage > 90
                            ? "bg-rose-500"
                            : fillPercentage > 70
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {/* One-Click Drill Down to View Pupils (Requirement 1) */}
                      <button
                        onClick={() => handleDrillDownClassPupils(cls.id)}
                        className="text-xs font-bold text-sky-700 hover:text-sky-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>View Class Pupils ({enrolledInClass.length})</span>
                      </button>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingClass(cls);
                              setShowClassModal(true);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                            title="Edit Class Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteClass && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${cls.name}?`)) {
                                  onDeleteClass(cls.id);
                                  triggerToast(`Class stream ${cls.name} deleted.`);
                                }
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Class"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: ACADEMIC BATCHES & COHORTS (Requirement 1)                    */}
      {/* ========================================================================= */}
      {activeSubTab === "batches" && (
        <div className="space-y-4">
          {/* Batches Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">Filter Status:</span>
              <select
                value={batchStatusFilter}
                onChange={(e) => setBatchStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="all">All Cohort Statuses ({batches.length})</option>
                <option value="Active">Active Cohorts</option>
                <option value="Upcoming">Upcoming Admissions</option>
                <option value="Graduated">Graduated / Alumni</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  exportBatchesCsv(filteredBatches, classes, students);
                  triggerToast(`Exported ${filteredBatches.length} academic cohort batches to CSV.`);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                title="Export cohort batches to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Batches CSV</span>
              </button>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingBatch(null);
                    setShowBatchModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Academic Batch</span>
                </button>
              )}
            </div>
          </div>

          {/* Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBatches.map((batch) => {
              const enrolledClasses = classes.filter(c => c.batchId === batch.id);
              const enrolledPupils = students.filter(s => s.batchId === batch.id || enrolledClasses.some(c => c.id === s.classId));

              return (
                <div
                  key={batch.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200">
                          {batch.code}
                        </span>
                        <h3 className="font-bold text-slate-900 font-serif text-sm mt-1">
                          {batch.name}
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        batch.status === "Active"
                          ? "bg-emerald-100 text-emerald-800"
                          : batch.status === "Upcoming"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-slate-100 text-slate-600"
                      }`}>
                        {batch.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                      {batch.description || "Academic year cohort encompassing scheduled examinations and coursework."}
                    </p>

                    {/* Metadata Badges */}
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl">
                      <div>
                        <div className="text-[10px] text-slate-400">Academic Year</div>
                        <div className="font-bold text-slate-800">{batch.academicYear} ({batch.intakeTerm})</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400">Lead Patron</div>
                        <div className="font-bold text-slate-800 truncate">{batch.leadTeacherName || "Head of Section"}</div>
                      </div>
                    </div>

                    {/* Linked Classes List */}
                    <div className="mt-2.5">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Linked Classes ({enrolledClasses.length})
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {enrolledClasses.length > 0 ? (
                          enrolledClasses.map(c => (
                            <span key={c.id} className="px-1.5 py-0.5 bg-sky-50 text-sky-800 border border-sky-200 rounded-md text-[10px] font-medium">
                              {c.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400">No classes assigned yet</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats & Drill Down Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleDrillDownBatchPupils(batch.id)}
                        className="text-xs font-bold text-amber-800 hover:text-amber-950 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-amber-700" />
                        <span>View Batch Pupils ({enrolledPupils.length})</span>
                      </button>

                      {canManage && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingBatch(batch);
                              setShowBatchModal(true);
                            }}
                            className="p-1 rounded-md text-slate-400 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Edit Batch"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteBatch && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete batch ${batch.name}?`)) {
                                  onDeleteBatch(batch.id);
                                  triggerToast(`Batch ${batch.name} deleted.`);
                                }
                              }}
                              className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Batch"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-TAB: CURRICULUM SUBJECTS CATALOGUE                                */}
      {/* ========================================================================= */}
      {activeSubTab === "subjects" && (
        <div className="space-y-4">
          {/* Subjects Toolbar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subject, ECZ code, teacher..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden text-slate-800"
                />
              </div>

              <select
                value={subjectDeptFilter}
                onChange={(e) => setSubjectDeptFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
              >
                <option value="all">All Departments</option>
                <option value="Mathematics & Computing">Mathematics & Computing</option>
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Languages">Languages</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Business Studies">Business Studies</option>
                <option value="Practical Skills">Practical Skills</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  exportSubjectsCatalogCsv(filteredSubjects);
                  triggerToast(`Exported ${filteredSubjects.length} curriculum subjects to CSV.`);
                }}
                className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                title="Export subjects catalog to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Subjects CSV</span>
              </button>

              {canManage && (
                <button
                  onClick={() => {
                    setEditingSubject(null);
                    setShowSubjectModal(true);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subject to Curriculum</span>
                </button>
              )}
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="py-3 px-4">Subject Name & Code</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Category / Section</th>
                    <th className="py-3 px-4">Applicable Grades</th>
                    <th className="py-3 px-4">Periods & Pass Mark</th>
                    <th className="py-3 px-4">Subject Head</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        <BookmarkCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">No curriculum subjects found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((sub) => (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name & Code */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {sub.code ? sub.code.slice(0, 3) : "SUB"}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{sub.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ECZ Code: {sub.code}</div>
                            </div>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-700">{sub.department}</span>
                        </td>

                        {/* Category / Section */}
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1 items-start">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sub.category === "Core"
                                ? "bg-emerald-100 text-emerald-800"
                                : sub.category === "Elective"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-sky-100 text-sky-800"
                            }`}>
                              {sub.category}
                            </span>
                            <span className="text-[10px] text-slate-400">{sub.section}</span>
                          </div>
                        </td>

                        {/* Applicable Grades */}
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[180px]">
                            {sub.gradesApplicable.map(g => (
                              <span key={g} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold">
                                G{g}
                              </span>
                            ))}
                          </div>
                          {sub.pathway && (
                            <div className="text-[10px] text-emerald-700 mt-0.5 font-medium">{sub.pathway}</div>
                          )}
                        </td>

                        {/* Periods & Pass Mark */}
                        <td className="py-3 px-4">
                          <div className="text-slate-800 font-medium">{sub.weeklyPeriods} periods / wk</div>
                          <div className="text-[10px] text-slate-400">Pass: {sub.passMark}%</div>
                        </td>

                        {/* Subject Head */}
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">{sub.assignedTeacherName || "Department Head"}</span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          {canManage && (
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditingSubject(sub);
                                  setShowSubjectModal(true);
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                                title="Edit Subject"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              {onDeleteSubject && (
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete subject ${sub.name}?`)) {
                                      onDeleteSubject(sub.id);
                                      triggerToast(`Subject ${sub.name} deleted.`);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete Subject"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION                                                           */}
      {/* ========================================================================= */}

      {/* 1. Pupil Creation / Edit Modal */}
      <StudentCreationModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSaveStudent={(data) => {
          if (editingStudent) {
            onEditStudent(data as Student);
            triggerToast(`Pupil ${data.name} profile updated successfully.`);
          } else {
            onAddStudent(data as Omit<Student, "id">);
            triggerToast(`New pupil ${data.name} enrolled successfully.`);
          }
        }}
        editingStudent={editingStudent}
        classes={classes}
        batches={batches}
      />

      {/* 2. Bulk Student CSV Import Modal */}
      <BulkStudentImportModal
        isOpen={showBulkStudentModal}
        onClose={() => setShowBulkStudentModal(false)}
        classes={availableClassesForDirectory}
        existingStudents={students}
        initialClassId={typeof selectedClassFilter === "number" ? selectedClassFilter : undefined}
        onImportStudents={(imported) => {
          if (onAddBulkStudents) {
            onAddBulkStudents(imported);
          } else {
            imported.forEach(st => onAddStudent(st));
          }
          triggerToast(`Successfully imported ${imported.length} pupils from CSV!`);
        }}
      />

      {/* 3. Class Creation / Edit Modal */}
      <ClassCreationModal
        isOpen={showClassModal}
        onClose={() => setShowClassModal(false)}
        onSaveClass={(data) => {
          if (editingClass && onEditClass) {
            onEditClass(data as ClassStream);
            triggerToast(`Class ${data.name} updated successfully.`);
          } else if (onAddClass) {
            onAddClass(data);
            triggerToast(`New class stream ${data.name} created successfully.`);
          }
        }}
        editingClass={editingClass}
        teachers={teachers}
        batches={batches}
      />

      {/* 4. Batch Creation / Edit Modal */}
      <BatchCreationModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
        onSaveBatch={(data) => {
          if (editingBatch && onEditBatch) {
            onEditBatch(data);
            triggerToast(`Batch ${data.name} updated successfully.`);
          } else if (onAddBatch) {
            onAddBatch(data);
            triggerToast(`New academic batch ${data.name} created successfully.`);
          }
        }}
        editingBatch={editingBatch}
        teachers={teachers}
      />

      {/* 5. Subject Creation / Edit Modal */}
      <SubjectCreationModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        onSaveSubject={(data) => {
          if (editingSubject && onEditSubject) {
            onEditSubject(data);
            triggerToast(`Subject ${data.name} updated successfully.`);
          } else if (onAddSubject) {
            onAddSubject(data);
            triggerToast(`New subject ${data.name} added to curriculum.`);
          }
        }}
        editingSubject={editingSubject}
        teachers={teachers}
      />

      {/* 6. Pupil ID Profile Card Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            {/* ID Card Header */}
            <div className="bg-emerald-800 text-white p-5 text-center relative">
              <button
                onClick={() => setViewingStudent(null)}
                className="absolute right-3 top-3 p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white text-emerald-800 flex items-center justify-center mx-auto font-bold text-lg shadow-md mb-2">
                {viewingStudent.name.charAt(0)}
              </div>
              <h3 className="font-bold font-serif text-base">{viewingStudent.name}</h3>
              <p className="text-xs text-emerald-200 font-mono">ECZ: {viewingStudent.eczNo}</p>
            </div>

            {/* ID Details Body */}
            <div className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Class Stream</div>
                  <div className="font-bold text-slate-800">
                    {classes.find(c => c.id === viewingStudent.classId)?.name || `${viewingStudent.grade} ${viewingStudent.stream}`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Section & Level</div>
                  <div className="font-bold text-slate-800">
                    {viewingStudent.section || classes.find(c => c.id === viewingStudent.classId)?.section || "Primary"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Class Teacher</div>
                  <div className="font-bold text-emerald-800">
                    {classes.find(c => c.id === viewingStudent.classId)?.teacherName || "Assigned Teacher"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Gender & Age</div>
                  <div className="font-bold text-slate-800">{viewingStudent.gender}, {viewingStudent.age} Years</div>
                </div>
              </div>

              {/* Batch link */}
              {viewingStudent.batchId && (
                <div className="p-2.5 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold text-amber-900 uppercase">Academic Batch:</span>
                  <span className="font-bold text-amber-950">
                    {batches.find(b => b.id === viewingStudent.batchId)?.name || "2026 Academic Cohort"}
                  </span>
                </div>
              )}

              {viewingStudent.pathway && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">Secondary Career Pathway</div>
                  <div className="font-bold text-emerald-950">{viewingStudent.pathway}</div>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Guardian: <strong className="text-slate-900">{viewingStudent.guardianName}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Phone: <strong className="text-slate-900">{viewingStudent.guardianPhone}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Email: <strong className="text-slate-900">{viewingStudent.guardianEmail}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  onClick={() => setViewingStudent(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
