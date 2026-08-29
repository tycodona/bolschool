import React, { useState } from "react";
import { DisciplineRecord, Student } from "../types";
import {
  ShieldAlert,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  X,
  PhoneCall,
  FileCheck,
  Filter
} from "lucide-react";

interface DisciplineManagementModuleProps {
  records?: DisciplineRecord[];
  disciplineRecords?: DisciplineRecord[];
  students: Student[];
  userRole?: string;
  canManage?: boolean;
  onAddRecord: (record: DisciplineRecord) => void;
  onResolveRecord?: (id: number, notes: string) => void;
  onUpdateRecord?: (record: DisciplineRecord) => void;
  onDeleteRecord?: (id: number) => void;
}

export function DisciplineManagementModule({
  records,
  disciplineRecords,
  students,
  userRole,
  canManage: canManageProp,
  onAddRecord,
  onResolveRecord,
  onUpdateRecord,
  onDeleteRecord
}: DisciplineManagementModuleProps) {
  const activeRecords = records || disciplineRecords || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecordForResolution, setSelectedRecordForResolution] = useState<DisciplineRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  // New Record Form
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 0);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState<DisciplineRecord["category"]>("Lateness / Truancy");
  const [description, setDescription] = useState("");
  const [actionTaken, setActionTaken] = useState<DisciplineRecord["actionTaken"]>("Verbal Warning");
  const [parentNotified, setParentNotified] = useState(true);
  const [followUpDate, setFollowUpDate] = useState("");

  const categories: DisciplineRecord["category"][] = [
    "Minor Infraction",
    "Lateness / Truancy",
    "Uniform / Grooming Violation",
    "Fighting / Bullying",
    "Academic Dishonesty",
    "Property Damage",
    "Insubordination",
    "Severe Misconduct"
  ];

  const actions: DisciplineRecord["actionTaken"][] = [
    "Verbal Warning",
    "Written Warning",
    "Detention",
    "Parent Conference Required",
    "Suspension (3-7 Days)",
    "Community Service / Campus Clean-Up",
    "Expulsion Recommendation"
  ];

  const filteredRecords = activeRecords.filter(r => {
    const matchesSearch = r.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || r.resolutionStatus === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const openIncidents = activeRecords.filter(r => r.resolutionStatus !== "Resolved");
  const resolvedIncidents = activeRecords.filter(r => r.resolutionStatus === "Resolved");

  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === Number(selectedStudentId));
    if (!student || !description.trim()) return;

    const newRec: DisciplineRecord = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      stream: student.stream,
      incidentDate,
      category,
      description: description.trim(),
      actionTaken,
      recordedBy: "Authorized Staff Member",
      recordedByRole: userRole || "Teacher",
      parentNotified,
      followUpDate: followUpDate || undefined,
      resolutionStatus: "Open"
    };

    onAddRecord(newRec);
    setShowAddModal(false);
    setDescription("");
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordForResolution) return;
    if (onResolveRecord) {
      onResolveRecord(selectedRecordForResolution.id, resolutionNotes);
    } else if (onUpdateRecord) {
      onUpdateRecord({
        ...selectedRecordForResolution,
        resolutionStatus: "Resolved",
        resolutionNotes
      });
    }
    setSelectedRecordForResolution(null);
    setResolutionNotes("");
  };

  const canManage = canManageProp !== undefined ? canManageProp : (userRole === "super_admin" || userRole === "school_admin" || userRole === "head_teacher" || userRole === "deputy_head" || userRole === "teacher" || userRole === "admin");

  return (
    <div id="discipline-management-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              Pupil Conduct & Discipline Management
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Confidential incident records, corrective actions, guardian communications, and resolution monitoring.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record Incident</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Incident Logs</div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-serif">{records.length}</div>
          <div className="text-xs text-slate-500 mt-1">Term 2 Academic Session</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Open / Pending Follow-Up</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-serif">{openIncidents.length}</div>
          <div className="text-xs text-amber-600 mt-1">Under investigation or counseling</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Cases</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">{resolvedIncidents.length}</div>
          <div className="text-xs text-emerald-600 mt-1">Disciplinary corrective action completed</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Guardian Notifications</div>
          <div className="text-2xl font-bold text-sky-700 mt-1 font-serif">
            {records.filter(r => r.parentNotified).length} / {records.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Parents officially briefed</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search pupil name, grade, or infraction description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium"
        >
          <option value="all">All Incident Types ({records.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date & Pupil</th>
                <th className="py-3 px-4">Category & Incident</th>
                <th className="py-3 px-4">Corrective Action</th>
                <th className="py-3 px-4">Parent Notified</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{r.studentName}</div>
                    <div className="text-xs text-slate-400 font-medium">
                      {r.grade} {r.stream} • <span className="font-mono">{r.incidentDate}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-800 border border-rose-100 mb-1">
                      {r.category}
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-2">{r.description}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 text-xs">{r.actionTaken}</div>
                    <div className="text-[11px] text-slate-400">By: {r.recordedBy}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    {r.parentNotified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Notified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.resolutionStatus === "Resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {r.resolutionStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {canManage && r.resolutionStatus !== "Resolved" && (
                      <button
                        onClick={() => {
                          setSelectedRecordForResolution(r);
                          setResolutionNotes(r.resolutionNotes || "");
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Resolve Case</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    No disciplinary records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Incident */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Record Disciplinary Incident</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Pupil *</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade} {s.stream})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Date</label>
                  <input
                    type="date"
                    value={incidentDate}
                    onChange={(e) => setIncidentDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Infraction Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Corrective Action Taken</label>
                  <select
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {actions.map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Incident Description & Circumstances *</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise details of the observed infraction, location, and witnesses..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="parentNotifyCheck"
                  checked={parentNotified}
                  onChange={(e) => setParentNotified(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="parentNotifyCheck" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Send notification notice to parent / guardian phone & portal
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Incident Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Resolve Case */}
      {selectedRecordForResolution && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Case Resolution & Closeout</h3>
              </div>
              <button
                onClick={() => setSelectedRecordForResolution(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mt-3 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800">{selectedRecordForResolution.studentName} ({selectedRecordForResolution.grade})</div>
              <div className="text-slate-500 mt-0.5">{selectedRecordForResolution.description}</div>
            </div>

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resolution & Counseling Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Pupil served 1 hour study detention, completed written apology, and guardian attended review meeting."
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedRecordForResolution(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Mark Case Resolved
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
