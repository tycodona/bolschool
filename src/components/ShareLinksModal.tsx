import React, { useState } from "react";
import { Student, Teacher, ParentAccount, ClassStream, RoleType } from "../types";
import { buildPortalUrl, copyToClipboard } from "../utils/urlRouter";
import {
  Link,
  Copy,
  Check,
  ExternalLink,
  Users,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  Search,
  X,
  Share2,
  Sparkles,
  QrCode,
  FileText
} from "lucide-react";

interface ShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  teachers: Teacher[];
  students: Student[];
  parents: ParentAccount[];
  classes: ClassStream[];
  onDirectLogin?: (role: RoleType, username?: string, studentId?: number) => void;
}

export function ShareLinksModal({
  isOpen,
  onClose,
  teachers,
  students,
  parents,
  classes,
  onDirectLogin
}: ShareLinksModalProps) {
  const [activeTab, setActiveTab] = useState<"portals" | "teachers" | "parents" | "students">("portals");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (key: string, url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const mainPortals = [
    {
      id: "admin",
      role: "admin" as RoleType,
      title: "Headteacher & Administrator Portal",
      description: "Full management access: gradebook, registers, fees, timetable & pupil records",
      icon: ShieldCheck,
      color: "from-emerald-600 to-teal-700",
      badge: "Full Admin",
      url: buildPortalUrl({ role: "admin" })
    },
    {
      id: "teacher",
      role: "teacher" as RoleType,
      title: "Class Teachers Portal",
      description: "Continuous Assessment (CA) scores, daily attendance registers & report remarks",
      icon: UserCheck,
      color: "from-sky-600 to-blue-700",
      badge: "Teachers",
      url: buildPortalUrl({ role: "teacher" })
    },
    {
      id: "parent",
      role: "parent" as RoleType,
      title: "Parents & Guardians Portal",
      description: "Termly progress report cards, Kwacha fee balances & direct teacher messaging",
      icon: Users,
      color: "from-amber-600 to-orange-700",
      badge: "Parents",
      url: buildPortalUrl({ role: "parent" })
    },
    {
      id: "student",
      role: "student" as RoleType,
      title: "Pupils & Students Portal",
      description: "View termly performance grades, homework assignments & class timetables",
      icon: GraduationCap,
      color: "from-purple-600 to-indigo-700",
      badge: "Pupils",
      url: buildPortalUrl({ role: "student" })
    }
  ];

  const filteredTeachers = teachers.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.primarySubject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery) ||
    p.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.stream.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200 font-sans">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 font-serif flex items-center gap-2">
                User Portal Direct Links & Sharing
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Instant Deep-Links
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Share dedicated links for Administrators, Teachers, Parents, and Pupils
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex gap-1">
            <button
              onClick={() => { setActiveTab("portals"); setSearchQuery(""); }}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "portals"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Main Portals ({mainPortals.length})
            </button>

            <button
              onClick={() => { setActiveTab("teachers"); setSearchQuery(""); }}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "teachers"
                  ? "border-sky-600 text-sky-700 bg-sky-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              Teacher Links ({teachers.length})
            </button>

            <button
              onClick={() => { setActiveTab("parents"); setSearchQuery(""); }}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "parents"
                  ? "border-amber-600 text-amber-700 bg-amber-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Parent Links ({parents.length})
            </button>

            <button
              onClick={() => { setActiveTab("students"); setSearchQuery(""); }}
              className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "students"
                  ? "border-purple-600 text-purple-700 bg-purple-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Pupil Report Links ({students.length})
            </button>
          </div>

          {activeTab !== "portals" && (
            <div className="relative pb-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-[11px] rounded-lg pl-8 pr-2.5 py-1 focus:border-emerald-500 focus:outline-none w-36"
              />
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Main Role Portals */}
          {activeTab === "portals" && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Share these universal portal links with your school community. When clicked, users open directly into their specific login portal.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {mainPortals.map((portal) => {
                  const Icon = portal.icon;
                  const isCopied = copiedKey === portal.id;

                  return (
                    <div
                      key={portal.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-4 shadow-sm flex flex-col justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${portal.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-slate-900 text-xs truncate font-serif">
                              {portal.title}
                            </h3>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {portal.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {portal.description}
                          </p>
                        </div>
                      </div>

                      {/* URL Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 flex items-center justify-between gap-2">
                        <code className="text-[11px] font-mono text-slate-700 truncate select-all">
                          {portal.url}
                        </code>
                        <button
                          onClick={() => handleCopy(portal.id, portal.url)}
                          className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all shadow-xs ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {onDirectLogin && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400">Quick Test:</span>
                          <button
                            onClick={() => {
                              onDirectLogin(portal.role);
                              onClose();
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
                          >
                            Launch this Portal →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Teacher Direct Links */}
          {activeTab === "teachers" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Direct personal login links for each member of the teaching staff:
              </p>
              <div className="space-y-2">
                {filteredTeachers.map((teacher) => {
                  const teacherClass = classes.find(c => teacher.classesAssigned.includes(c.id));
                  const url = buildPortalUrl({
                    role: "teacher",
                    username: teacher.username,
                    tab: "Grading"
                  });
                  const isCopied = copiedKey === `teacher-${teacher.id}`;

                  return (
                    <div
                      key={teacher.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-sky-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {teacher.name.split(" ").pop()?.[0] || "T"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{teacher.name}</span>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200">
                              {teacher.tscNumber}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {teacher.primarySubject} {teacherClass ? `• ${teacherClass.name}` : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono text-slate-500 hidden lg:inline max-w-xs truncate bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {url}
                        </code>
                        <button
                          onClick={() => handleCopy(`teacher-${teacher.id}`, url)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200"
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? "Copied" : "Copy Link"}</span>
                        </button>
                        {onDirectLogin && (
                          <button
                            onClick={() => {
                              onDirectLogin("teacher", teacher.username);
                              onClose();
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                            title="Direct Login"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Parent Direct Links */}
          {activeTab === "parents" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Personal parent access links (perfect for sending via WhatsApp or SMS):
              </p>
              <div className="space-y-2">
                {filteredParents.map((parent) => {
                  const children = students.filter(s => parent.childIds.includes(s.id));
                  const url = buildPortalUrl({
                    role: "parent",
                    username: parent.username,
                    tab: "ReportCards"
                  });
                  const isCopied = copiedKey === `parent-${parent.id}`;

                  return (
                    <div
                      key={parent.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-amber-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {parent.name.split(" ").pop()?.[0] || "P"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{parent.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">{parent.phone}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Child(ren): <span className="text-slate-800 font-semibold">{children.map(c => `${c.name} (${c.grade})`).join(", ")}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono text-slate-500 hidden lg:inline max-w-xs truncate bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {url}
                        </code>
                        <button
                          onClick={() => handleCopy(`parent-${parent.id}`, url)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? "Copied" : "Copy WhatsApp Link"}</span>
                        </button>
                        {onDirectLogin && (
                          <button
                            onClick={() => {
                              onDirectLogin("parent", parent.username);
                              onClose();
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                            title="Direct Login"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student Report Links */}
          {activeTab === "students" && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500">
                Direct pupil links to instantly open their personal report card & assessment page:
              </p>
              <div className="space-y-2">
                {filteredStudents.map((student) => {
                  const url = buildPortalUrl({
                    role: "student",
                    username: student.username,
                    studentId: student.id,
                    tab: "ReportCards"
                  });
                  const isCopied = copiedKey === `student-${student.id}`;

                  return (
                    <div
                      key={student.id}
                      className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-purple-300 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {student.name.split(" ").pop()?.[0] || "S"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{student.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {student.grade} {student.stream}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Guardian: {student.guardianName} ({student.guardianPhone})
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <code className="text-[10px] font-mono text-slate-500 hidden lg:inline max-w-xs truncate bg-slate-50 px-2 py-1 rounded border border-slate-200">
                          {url}
                        </code>
                        <button
                          onClick={() => handleCopy(`student-${student.id}`, url)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isCopied
                              ? "bg-emerald-600 text-white"
                              : "bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200"
                          }`}
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? "Copied" : "Copy Pupil Link"}</span>
                        </button>
                        {onDirectLogin && (
                          <button
                            onClick={() => {
                              onDirectLogin("student", student.username, student.id);
                              onClose();
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
                            title="Direct Login"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Link className="w-3.5 h-3.5 text-emerald-600" />
            <span>Links can be bookmarked or sent to parents, teachers, and pupils directly.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
