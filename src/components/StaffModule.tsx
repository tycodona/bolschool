import React, { useState } from "react";
import { Teacher, ClassStream, SchoolSection } from "../types";
import { buildPortalUrl, copyToClipboard } from "../utils/urlRouter";
import { UserCheck, Plus, Share2, Copy, Check, Search, ShieldCheck, Edit3, Trash2, Filter } from "lucide-react";
import { TeacherCreationModal } from "./TeacherCreationModal";

interface StaffModuleProps {
  teachers: Teacher[];
  classes: ClassStream[];
  onOpenShareModal: () => void;
  onAddTeacher?: (newTeacher: Omit<Teacher, "id">) => void;
  onEditTeacher?: (updatedTeacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: number) => void;
  canManage?: boolean;
  isSuperAdmin?: boolean;
}

export function StaffModule({
  teachers,
  classes,
  onOpenShareModal,
  onAddTeacher,
  onEditTeacher,
  onDeleteTeacher,
  canManage = true,
  isSuperAdmin = false
}: StaffModuleProps) {
  const [search, setSearch] = useState("");
  const [sectionFilter, setSectionFilter] = useState<SchoolSection | "Both" | "all">("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tscNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.primarySubject.toLowerCase().includes(search.toLowerCase());

    const matchesSection = sectionFilter === "all" || t.section === sectionFilter || t.section === "Both";

    return matchesSearch && matchesSection;
  });

  const handleCopyLink = async (t: Teacher) => {
    const url = buildPortalUrl({ role: "teacher", username: t.username });
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(t.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const handleSaveTeacher = (teacherData: Omit<Teacher, "id"> | Teacher) => {
    if ("id" in teacherData && onEditTeacher) {
      onEditTeacher(teacherData as Teacher);
    } else if (onAddTeacher) {
      onAddTeacher(teacherData as Omit<Teacher, "id">);
    }
    setEditingTeacher(null);
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900">Teaching Staff & TCZ Directory</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
              {teachers.length} Instructors
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Teaching Council of Zambia (TCZ) certified academic educators across Early Childhood, Primary & Secondary sections
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canManage && onAddTeacher && (
            <button
              onClick={() => {
                setEditingTeacher(null);
                setShowCreateModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Teacher</span>
            </button>
          )}

          {isSuperAdmin && (
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Share2 className="w-4 h-4" />
              <span>Generate Staff Links</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search teacher by name, TCZ number or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-sky-500 font-medium"
            >
              <option value="all">All School Sections</option>
              <option value="Early Childhood">Early Childhood (ECE)</option>
              <option value="Primary">Primary Section (Grades 1-7)</option>
              <option value="Secondary">Secondary Section (Forms 1-4)</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            Showing {filteredTeachers.length} of {teachers.length}
          </span>
        </div>
      </div>

      {/* Standardized Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 uppercase font-bold text-[10px]">
                <th className="py-3 px-4">TCZ Registration</th>
                <th className="py-3 px-4">Teacher Name</th>
                <th className="py-3 px-4">Specialization</th>
                <th className="py-3 px-4">Assigned Stream</th>
                <th className="py-3 px-4">Experience</th>
                <th className="py-3 px-4">Direct Portal Link</th>
                <th className="py-3 px-4 text-center">Status</th>
                {canManage && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-900">
              {filteredTeachers.map(t => {
                const assignedClassNames = classes
                  .filter(c => (t.classesAssigned || []).includes(c.id) || c.teacherId === t.id)
                  .map(c => c.name);
                const isCopied = copiedId === t.id;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-sky-700">{t.tscNumber}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div>
                        <span>{t.name}</span>
                        {t.phone && <span className="block text-[10px] text-slate-400 font-normal">{t.phone}</span>}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{t.primarySubject}</td>
                    <td className="py-3 px-4">
                      {assignedClassNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {assignedClassNames.map(clsName => (
                            <span key={clsName} className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {clsName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs">Subject Specialist</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{t.experienceYrs} Years</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleCopyLink(t)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                          isCopied
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-slate-50 hover:bg-slate-100 text-sky-700 border-slate-200"
                        }`}
                      >
                        {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? "Link Copied!" : "Copy Link"}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === "Active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : t.status === "On Leave"
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingTeacher(t);
                              setShowCreateModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition-colors"
                            title="Edit teacher"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteTeacher && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Remove teacher record for ${t.name}?`)) {
                                  onDeleteTeacher(t.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                              title="Delete teacher"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Registration & Edit Modal */}
      <TeacherCreationModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingTeacher(null);
        }}
        onSaveTeacher={handleSaveTeacher}
        editingTeacher={editingTeacher}
        classes={classes}
      />
    </div>
  );
}

