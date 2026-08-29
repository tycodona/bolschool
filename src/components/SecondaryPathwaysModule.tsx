import React, { useState } from "react";
import { Student, ClassStream, SecondaryPathway, UserSession, SecondaryPathwayInfo, SubjectDefinition } from "../types";
import { SECONDARY_PATHWAYS } from "../data/zambianSchoolData";
import {
  Atom,
  TrendingUp,
  BookOpen,
  Wrench,
  GraduationCap,
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  Download,
  Info,
  Sparkles,
  Settings2,
  RotateCcw,
  BookMarked,
  Tag,
  Palette,
  X
} from "lucide-react";
import { downloadCsvFile, escapeCsvCell } from "../utils/csvExporter";

interface SecondaryPathwaysModuleProps {
  session?: UserSession;
  students: Student[];
  classes: ClassStream[];
  pathways?: SecondaryPathwayInfo[];
  subjectsCatalog?: SubjectDefinition[];
  onUpdateStudent: (updated: Student) => void;
  onAddPathway?: (pathway: SecondaryPathwayInfo) => void;
  onUpdatePathway?: (pathway: SecondaryPathwayInfo) => void;
  onDeletePathway?: (pathwayId: string) => void;
  onResetPathways?: () => void;
  onResetDefaultPathways?: () => void;
  showToast?: (msg: string) => void;
  canManage?: boolean;
}

const COLOR_PRESETS = [
  { label: "Emerald Green", hex: "#059669", accent: "emerald" },
  { label: "Indigo Blue", hex: "#4f46e5", accent: "indigo" },
  { label: "Amber Orange", hex: "#d97706", accent: "amber" },
  { label: "Purple / Violet", hex: "#7c3aed", accent: "purple" },
  { label: "Sky Blue", hex: "#0284c7", accent: "sky" },
  { label: "Rose Pink", hex: "#e11d48", accent: "rose" },
  { label: "Teal", hex: "#0d9488", accent: "teal" },
  { label: "Slate Gray", hex: "#475569", accent: "slate" },
];

export function SecondaryPathwaysModule({
  session,
  students,
  classes,
  pathways: pathwaysProp,
  subjectsCatalog = [],
  onUpdateStudent,
  onAddPathway,
  onUpdatePathway,
  onDeletePathway,
  onResetPathways,
  onResetDefaultPathways,
  showToast,
  canManage = true
}: SecondaryPathwaysModuleProps) {
  // Local fallback if pathways are not passed from parent state
  const defaultPathwaysList: SecondaryPathwayInfo[] = Object.values(SECONDARY_PATHWAYS);
  const activePathways = pathwaysProp && pathwaysProp.length > 0 ? pathwaysProp : defaultPathwaysList;

  const [selectedPathwayTab, setSelectedPathwayTab] = useState<string>("All");
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedPathwayDetails, setSelectedPathwayDetails] = useState<SecondaryPathwayInfo | null>(
    activePathways[0] || null
  );

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [studentToAssign, setStudentToAssign] = useState<Student | null>(null);
  const [newPathwaySelection, setNewPathwaySelection] = useState<string>(activePathways[0]?.id || "");
  const [assignmentNote, setAssignmentNote] = useState("");

  // Pathway Create / Edit Modal
  const [isPathwayModalOpen, setIsPathwayModalOpen] = useState(false);
  const [pathwayModalMode, setPathwayModalMode] = useState<"create" | "edit">("create");
  const [pathwayFormId, setPathwayFormId] = useState("");
  const [pathwayFormName, setPathwayFormName] = useState("");
  const [pathwayFormCode, setPathwayFormCode] = useState("");
  const [pathwayFormDescription, setPathwayFormDescription] = useState("");
  const [pathwayFormLevel, setPathwayFormLevel] = useState<string>("Senior Secondary (Grades 10-12)");
  const [pathwayFormBadgeColor, setPathwayFormBadgeColor] = useState("#059669");
  const [pathwayFormAccentColor, setPathwayFormAccentColor] = useState("emerald");
  const [pathwayFormEntryReq, setPathwayFormEntryReq] = useState("");
  
  // Tag Inputs
  const [coreSubjectsList, setCoreSubjectsList] = useState<string[]>([]);
  const [coreInput, setCoreInput] = useState("");
  const [specSubjectsList, setSpecSubjectsList] = useState<string[]>([]);
  const [specInput, setSpecInput] = useState("");
  const [careerPathsList, setCareerPathsList] = useState<string[]>([]);
  const [careerInput, setCareerInput] = useState("");

  // Filter only secondary students (Grades 8 to 12)
  const secondaryStudents = students.filter(s => {
    const num = parseInt(s.grade.replace(/\D/g, ""), 10);
    return num >= 8 && num <= 12;
  });

  // Filtered secondary students
  const filteredStudents = secondaryStudents.filter(s => {
    const matchesPathway =
      selectedPathwayTab === "All" ||
      s.pathway === selectedPathwayTab ||
      (!s.pathway && selectedPathwayTab === "Junior Secondary Core" && (s.grade === "Grade 8" || s.grade === "Grade 9"));

    const matchesGrade = selectedGradeFilter === "All" || s.grade === selectedGradeFilter;

    const matchesSearch =
      searchQuery.trim() === "" ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.eczNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.guardianName && s.guardianName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPathway && matchesGrade && matchesSearch;
  });

  const getPathwayIcon = (pathway: SecondaryPathwayInfo) => {
    const code = (pathway.code || pathway.id || "").toLowerCase();
    if (code.includes("sci") || code.includes("stem")) return <Atom className="w-5 h-5" />;
    if (code.includes("bus") || code.includes("com") || code.includes("fin")) return <TrendingUp className="w-5 h-5" />;
    if (code.includes("soc") || code.includes("hum") || code.includes("art")) return <BookOpen className="w-5 h-5" />;
    if (code.includes("tech") || code.includes("voc") || code.includes("agri")) return <Wrench className="w-5 h-5" />;
    return <GraduationCap className="w-5 h-5" />;
  };

  const handleOpenCreatePathway = () => {
    setPathwayModalMode("create");
    setPathwayFormId("");
    setPathwayFormName("");
    setPathwayFormCode("");
    setPathwayFormDescription("");
    setPathwayFormLevel("Senior Secondary (Grades 10-12)");
    setPathwayFormBadgeColor("#059669");
    setPathwayFormAccentColor("emerald");
    setPathwayFormEntryReq("Grade 9 ECZ Junior Certificate with Distinction or Merit in core prerequisite subjects.");
    setCoreSubjectsList(["English Language", "Mathematics", "Civic Education"]);
    setSpecSubjectsList([]);
    setCareerPathsList([]);
    setCoreInput("");
    setSpecInput("");
    setCareerInput("");
    setIsPathwayModalOpen(true);
  };

  const handleOpenEditPathway = (p: SecondaryPathwayInfo) => {
    setPathwayModalMode("edit");
    setPathwayFormId(p.id);
    setPathwayFormName(p.name);
    setPathwayFormCode(p.code);
    setPathwayFormDescription(p.description || "");
    setPathwayFormLevel(p.level || "Senior Secondary (Grades 10-12)");
    setPathwayFormBadgeColor(p.badgeColor || "#059669");
    setPathwayFormAccentColor(p.accentColor || "emerald");
    setPathwayFormEntryReq(p.entryRequirements || "");
    setCoreSubjectsList([...(p.coreSubjects || [])]);
    setSpecSubjectsList([...(p.specializationSubjects || [])]);
    setCareerPathsList([...(p.careerPaths || [])]);
    setCoreInput("");
    setSpecInput("");
    setCareerInput("");
    setIsPathwayModalOpen(true);
  };

  const handleSavePathway = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pathwayFormName.trim() || !pathwayFormCode.trim()) {
      if (showToast) showToast("Pathway name and code are required.");
      return;
    }

    const pathwayId = pathwayModalMode === "create" ? pathwayFormName.trim() : pathwayFormId;

    const updatedPathway: SecondaryPathwayInfo = {
      id: pathwayId,
      name: pathwayFormName.trim(),
      code: pathwayFormCode.trim().toUpperCase(),
      description: pathwayFormDescription.trim(),
      level: pathwayFormLevel,
      badgeColor: pathwayFormBadgeColor,
      accentColor: pathwayFormAccentColor,
      iconName: "Atom",
      coreSubjects: coreSubjectsList.length > 0 ? coreSubjectsList : ["English Language", "Mathematics", "Civic Education"],
      specializationSubjects: specSubjectsList,
      careerPaths: careerPathsList,
      entryRequirements: pathwayFormEntryReq.trim(),
      isCustom: true
    };

    if (pathwayModalMode === "create") {
      if (onAddPathway) {
        onAddPathway(updatedPathway);
      }
      if (showToast) showToast(`Pathway "${updatedPathway.name}" created successfully.`);
    } else {
      if (onUpdatePathway) {
        onUpdatePathway(updatedPathway);
      }
      if (showToast) showToast(`Pathway "${updatedPathway.name}" updated.`);
    }

    setSelectedPathwayDetails(updatedPathway);
    setIsPathwayModalOpen(false);
  };

  const handleDeletePathwayAction = (pId: string, pName: string) => {
    if (confirm(`Are you sure you want to remove the pathway "${pName}"? Secondary students enrolled in this pathway will need to be re-allocated.`)) {
      if (onDeletePathway) {
        onDeletePathway(pId);
      }
      if (selectedPathwayDetails?.id === pId) {
        setSelectedPathwayDetails(activePathways.find(p => p.id !== pId) || null);
      }
      if (showToast) showToast(`Pathway "${pName}" removed.`);
    }
  };

  const handleAddCoreSubject = () => {
    if (coreInput.trim() && !coreSubjectsList.includes(coreInput.trim())) {
      setCoreSubjectsList([...coreSubjectsList, coreInput.trim()]);
      setCoreInput("");
    }
  };

  const handleAddSpecSubject = () => {
    if (specInput.trim() && !specSubjectsList.includes(specInput.trim())) {
      setSpecSubjectsList([...specSubjectsList, specInput.trim()]);
      setSpecInput("");
    }
  };

  const handleAddCareer = () => {
    if (careerInput.trim() && !careerPathsList.includes(careerInput.trim())) {
      setCareerPathsList([...careerPathsList, careerInput.trim()]);
      setCareerInput("");
    }
  };

  const handleOpenAssignModal = (student: Student) => {
    setStudentToAssign(student);
    setNewPathwaySelection(student.pathway || activePathways[0]?.id || "");
    setAssignmentNote("");
    setIsAssignModalOpen(true);
  };

  const handleSavePathwayAssignment = () => {
    if (!studentToAssign) return;

    const gradeNum = parseInt(studentToAssign.grade.replace(/\D/g, ""), 10);
    const targetClass = classes.find(
      c => c.gradeNum === gradeNum && (c.pathway === newPathwaySelection || !c.pathway)
    ) || classes.find(c => c.gradeNum === gradeNum);

    const updatedStudent: Student = {
      ...studentToAssign,
      pathway: newPathwaySelection,
      classId: targetClass ? targetClass.id : studentToAssign.classId
    };

    onUpdateStudent(updatedStudent);
    if (showToast) {
      showToast(`${studentToAssign.name} assigned to "${newPathwaySelection}" pathway.`);
    }
    setIsAssignModalOpen(false);
    setStudentToAssign(null);
  };

  const handleExportPathwayRoster = () => {
    const headers = [
      "Student ID",
      "Full Name",
      "ECZ Candidate #",
      "Grade",
      "Pathway Assigned",
      "Gender",
      "Guardian Name",
      "Guardian Phone",
      "Fee Status"
    ];

    const rows = filteredStudents.map(s => [
      escapeCsvCell(String(s.id)),
      escapeCsvCell(s.name),
      escapeCsvCell(s.eczNo || "Pending"),
      escapeCsvCell(s.grade),
      escapeCsvCell(s.pathway || "Unassigned"),
      escapeCsvCell(s.gender),
      escapeCsvCell(s.guardianName || ""),
      escapeCsvCell(s.guardianPhone || ""),
      escapeCsvCell(s.status || "Active")
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadCsvFile(csvContent, `Zambian_Secondary_Pathways_Roster_${new Date().toISOString().split("T")[0]}.csv`);
    if (showToast) showToast("Secondary Pathway roster exported to CSV.");
  };

  return (
    <div id="secondary-pathways-module" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <Layers className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              Secondary School Pathways & Curriculum Streams
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure Ministry-aligned and customized academic pathways, core & specialization subjects, career routes, and student allocations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManage && (
            <button
              onClick={handleOpenCreatePathway}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Pathway</span>
            </button>
          )}

          <button
            onClick={handleExportPathwayRoster}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Roster</span>
          </button>

          {canManage && (onResetDefaultPathways || onResetPathways) && (
            <button
              onClick={() => {
                if (confirm("Reset pathways back to default Zambian ECZ Curriculum framework?")) {
                  if (onResetDefaultPathways) onResetDefaultPathways();
                  else if (onResetPathways) onResetPathways();
                  if (showToast) showToast("Pathways restored to default framework.");
                }
              }}
              title="Reset to default Ministry pathways"
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Pathway Overview Cards Carousel/Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            Academic Pathways Directory ({activePathways.length})
          </h3>
          <span className="text-xs text-slate-500">Click a pathway card to view details or edit configuration</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activePathways.map((pathway) => {
            const studentCount = secondaryStudents.filter(
              s => s.pathway === pathway.id || (!s.pathway && pathway.id === "Junior Secondary Core" && (s.grade === "Grade 8" || s.grade === "Grade 9"))
            ).length;
            const isSelected = selectedPathwayDetails?.id === pathway.id;

            return (
              <div
                key={pathway.id}
                onClick={() => setSelectedPathwayDetails(pathway)}
                className={`bg-white rounded-xl border p-5 transition-all cursor-pointer relative shadow-xs ${
                  isSelected
                    ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                      style={{ backgroundColor: pathway.badgeColor || "#059669" }}
                    >
                      {getPathwayIcon(pathway)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-serif leading-tight">
                        {pathway.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          {pathway.code}
                        </span>
                        <span className="text-xs text-slate-500">{pathway.level}</span>
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleOpenEditPathway(pathway)}
                        title="Edit / Customize Pathway"
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {activePathways.length > 1 && (
                        <button
                          onClick={() => handleDeletePathwayAction(pathway.id, pathway.name)}
                          title="Delete Pathway"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-3 leading-relaxed">
                  {pathway.description || "No description provided for this academic pathway."}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    <strong className="text-slate-800 font-semibold">{pathway.specializationSubjects?.length || 0}</strong> Specializations
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <Users className="w-3 h-3" />
                    {studentCount} Enrolled
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Pathway Deep-Dive & Syllabus Info */}
      {selectedPathwayDetails && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: selectedPathwayDetails.badgeColor || "#059669" }}
              >
                {getPathwayIcon(selectedPathwayDetails)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-serif">
                  {selectedPathwayDetails.name} ({selectedPathwayDetails.code})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedPathwayDetails.level}</p>
              </div>
            </div>

            {canManage && (
              <button
                onClick={() => handleOpenEditPathway(selectedPathwayDetails)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Configure Syllabus & Subjects</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            {/* Core & Specialization Subjects */}
            <div className="space-y-4 md:col-span-2">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <BookMarked className="w-4 h-4 text-emerald-700" />
                  <span>Compulsory Core Subjects</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPathwayDetails.coreSubjects && selectedPathwayDetails.coreSubjects.length > 0 ? (
                    selectedPathwayDetails.coreSubjects.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-800">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None defined</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Specialization & Elective Subjects</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPathwayDetails.specializationSubjects && selectedPathwayDetails.specializationSubjects.length > 0 ? (
                    selectedPathwayDetails.specializationSubjects.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-semibold text-emerald-800">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No specialization subjects configured</span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Target Career & Higher Education Trajectories</span>
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                  {selectedPathwayDetails.careerPaths && selectedPathwayDetails.careerPaths.length > 0 ? (
                    selectedPathwayDetails.careerPaths.map((c, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">No career paths specified</span>
                  )}
                </ul>
              </div>
            </div>

            {/* Entry Requirement Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <Info className="w-4 h-4 text-slate-600" />
                  <span>Placement / Entry Requirements</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {selectedPathwayDetails.entryRequirements || "General secondary admission standards apply."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
                <span>Code: </span>
                <strong className="font-mono text-slate-800">{selectedPathwayDetails.code}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Enrollment & Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 uppercase">Filter Pathway:</span>
            <select
              value={selectedPathwayTab}
              onChange={(e) => setSelectedPathwayTab(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800 focus:outline-emerald-600"
            >
              <option value="All">All Secondary Pathways ({secondaryStudents.length})</option>
              {activePathways.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
              ))}
            </select>

            <select
              value={selectedGradeFilter}
              onChange={(e) => setSelectedGradeFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-800 focus:outline-emerald-600"
            >
              <option value="All">All Secondary Grades (8-12)</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search secondary pupil..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Pupil Name</th>
                <th className="py-3 px-4">Grade & ECZ Candidate</th>
                <th className="py-3 px-4">Enrolled Academic Pathway</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s) => {
                  const assignedPathwayInfo = activePathways.find(p => p.id === s.pathway);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400">ID #{s.id} • {s.gender}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{s.grade}</div>
                        <div className="font-mono text-xs text-slate-500">{s.eczNo || "ECZ Reg Pending"}</div>
                      </td>
                      <td className="py-3 px-4">
                        {assignedPathwayInfo ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: `${assignedPathwayInfo.badgeColor || "#059669"}15`,
                              color: assignedPathwayInfo.badgeColor || "#059669",
                              borderColor: `${assignedPathwayInfo.badgeColor || "#059669"}40`,
                              borderWidth: "1px"
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignedPathwayInfo.badgeColor || "#059669" }} />
                            {assignedPathwayInfo.name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                            Unallocated Pathway
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <div className="font-medium text-slate-700">{s.guardianName || "Not Recorded"}</div>
                        <div className="font-mono text-slate-500">{s.guardianPhone || "—"}</div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage && (
                          <button
                            onClick={() => handleOpenAssignModal(s)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Change Pathway</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No secondary students match the current filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Secondary students added to Grades 8 to 12 will appear here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create or Edit Pathway */}
      {isPathwayModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                  <Layers className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-serif">
                    {pathwayModalMode === "create" ? "Create Custom Secondary Pathway" : `Configure Pathway: ${pathwayFormName}`}
                  </h3>
                  <p className="text-xs text-slate-500">Define syllabus standards, subjects, and prerequisites</p>
                </div>
              </div>
              <button
                onClick={() => setIsPathwayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePathway} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pathway Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={pathwayFormName}
                    onChange={(e) => setPathwayFormName(e.target.value)}
                    placeholder="e.g. Agricultural Sciences & Agribusiness"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pathway Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={pathwayFormCode}
                    onChange={(e) => setPathwayFormCode(e.target.value)}
                    placeholder="e.g. AGR-SCI"
                    className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Applicable Secondary Level
                  </label>
                  <select
                    value={pathwayFormLevel}
                    onChange={(e) => setPathwayFormLevel(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800 bg-white"
                  >
                    <option value="Senior Secondary (Grades 10-12)">Senior Secondary (Grades 10-12)</option>
                    <option value="Junior Secondary (Grades 8-9)">Junior Secondary (Grades 8-9)</option>
                    <option value="All Secondary (Grades 8-12)">All Secondary (Grades 8-12)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Theme / Badge Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pathwayFormBadgeColor}
                      onChange={(e) => setPathwayFormBadgeColor(e.target.value)}
                      className="w-10 h-9 p-1 rounded border border-slate-300 cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-1">
                      {COLOR_PRESETS.map(preset => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => {
                            setPathwayFormBadgeColor(preset.hex);
                            setPathwayFormAccentColor(preset.accent);
                          }}
                          className="w-6 h-6 rounded-full border border-slate-200 cursor-pointer"
                          style={{ backgroundColor: preset.hex }}
                          title={preset.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description & Pathway Objective
                </label>
                <textarea
                  rows={2}
                  value={pathwayFormDescription}
                  onChange={(e) => setPathwayFormDescription(e.target.value)}
                  placeholder="Detailed explanation of what this pathway prepares students for..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              {/* Core Subjects Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compulsory Core Subjects
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={coreInput}
                    onChange={(e) => setCoreInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCoreSubject(); } }}
                    placeholder="Type subject (e.g. English Language) and press Enter or Add"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCoreSubject}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300"
                  >
                    Add Core
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {coreSubjectsList.map((subj, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-800">
                      {subj}
                      <button
                        type="button"
                        onClick={() => setCoreSubjectsList(coreSubjectsList.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Specialization Subjects Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Specialization / Elective Subjects
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={specInput}
                    onChange={(e) => setSpecInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddSpecSubject(); } }}
                    placeholder="Type specialization subject (e.g. Pure Physics, Accounts) and press Enter"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecSubject}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200"
                  >
                    Add Elective
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {specSubjectsList.map((subj, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-medium text-emerald-800">
                      {subj}
                      <button
                        type="button"
                        onClick={() => setSpecSubjectsList(specSubjectsList.filter((_, i) => i !== idx))}
                        className="text-emerald-500 hover:text-red-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Career Paths Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Career / University Trajectories
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={careerInput}
                    onChange={(e) => setCareerInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCareer(); } }}
                    placeholder="Type career option (e.g. Medicine & Surgery, Agribusiness) and press Enter"
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddCareer}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-lg border border-indigo-200"
                  >
                    Add Career
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {careerPathsList.map((c, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-md text-xs text-indigo-800">
                      {c}
                      <button
                        type="button"
                        onClick={() => setCareerPathsList(careerPathsList.filter((_, i) => i !== idx))}
                        className="text-indigo-400 hover:text-red-600 ml-1"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Entry Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Entry & Placement Criteria
                </label>
                <input
                  type="text"
                  value={pathwayFormEntryReq}
                  onChange={(e) => setPathwayFormEntryReq(e.target.value)}
                  placeholder="e.g. Distinction or Merit in Grade 9 Mathematics and Integrated Science"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPathwayModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {pathwayModalMode === "create" ? "Save New Pathway" : "Update Pathway Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Assign Student to Pathway */}
      {isAssignModalOpen && studentToAssign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
                  <Edit2 className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800 font-serif">
                    Assign Secondary Pathway
                  </h3>
                  <p className="text-xs text-slate-500">{studentToAssign.name} ({studentToAssign.grade})</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Target Pathway
                </label>
                <select
                  value={newPathwaySelection}
                  onChange={(e) => setNewPathwaySelection(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800 bg-white"
                >
                  {activePathways.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Pathway Preview in Modal */}
              {activePathways.find(p => p.id === newPathwaySelection) && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="font-semibold text-slate-800">
                    {activePathways.find(p => p.id === newPathwaySelection)?.name}
                  </div>
                  <p className="text-slate-600 line-clamp-2">
                    {activePathways.find(p => p.id === newPathwaySelection)?.description}
                  </p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <strong>Prerequisites: </strong>
                    {activePathways.find(p => p.id === newPathwaySelection)?.entryRequirements}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guidance & Counseling Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  placeholder="Record ECZ Grade 9 qualification scores or career counseling notes..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSavePathwayAssignment}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
