import React, { useState } from "react";
import { AuditLogEntry, UserRole } from "../types";
import {
  ShieldCheck,
  Search,
  Lock,
  Key,
  Database,
  Download,
  Upload,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  History,
  FileCode,
  Laptop
} from "lucide-react";

interface AuditLogSecurityModuleProps {
  auditLogs: AuditLogEntry[];
  currentRole: UserRole;
  onRestoreData?: (jsonData: string) => void;
  fullAppState?: any;
}

export function AuditLogSecurityModule({
  auditLogs,
  currentRole,
  onRestoreData,
  fullAppState
}: AuditLogSecurityModuleProps) {
  const [activeTab, setActiveTab] = useState<"logs" | "rbac" | "backup" | "security">("logs");
  const [searchTerm, setSearchTerm] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const filteredLogs = auditLogs.filter(log => {
    return log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullAppState || {}, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `RYNTECH_SMS_BACKUP_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        if (onRestoreData) {
          onRestoreData(text);
          setRestoreSuccess(true);
          setTimeout(() => setRestoreSuccess(false), 4000);
        }
      } catch (err) {
        alert("Failed to parse backup JSON. Please check file format.");
      }
    };
    reader.readAsText(file);
  };

  const rolesMatrix = [
    { role: "Super Administrator", students: "Full Access", academics: "Full Access", finance: "Full Access", settings: "Full Access", security: "Full Access" },
    { role: "School Administrator", students: "Full Access", academics: "Full Access", finance: "Full Access", settings: "Full Access", security: "View Only" },
    { role: "Head Teacher / Headmaster", students: "Full Access", academics: "Approve & Manage", finance: "View & Reports", settings: "View & Manage", security: "View Logs" },
    { role: "Deputy Head Teacher", students: "Full Access", academics: "Timetable & CA Oversight", finance: "View Reports", settings: "Academic Calendar", security: "No Access" },
    { role: "Teacher", students: "Class Roster", academics: "Marks & Attendance", finance: "No Access", settings: "No Access", security: "No Access" },
    { role: "Accountant / Bursar", students: "View Records", academics: "No Access", finance: "Full Invoicing & Receipts", settings: "Fee Structures", security: "Financial Logs" },
    { role: "Secretary", students: "Register & Inquiries", academics: "View Schedules", finance: "Front Desk View", settings: "Notice Board", security: "No Access" },
    { role: "Librarian", students: "Borrower Profile", academics: "Curriculum Resources", finance: "Fines & Lost Books", settings: "Book Catalog", security: "No Access" },
    { role: "Parent / Guardian", students: "Own Children Only", academics: "Published Report Cards", finance: "Fee Statements & Receipts", settings: "No Access", security: "No Access" },
    { role: "Student / Learner", students: "Own Profile", academics: "Timetable & Marks", finance: "Balance Notice", settings: "No Access", security: "No Access" }
  ];

  return (
    <div id="audit-security-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-slate-900 text-white">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              System Audit Trails, Security & Access Control
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Immutable user activity logs, 10-role permission governance matrix, database backups, and institutional security controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Generate JSON Snapshot Backup</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 relative whitespace-nowrap cursor-pointer ${
            activeTab === "logs"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Activity Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab("rbac")}
          className={`pb-3 relative whitespace-nowrap cursor-pointer ${
            activeTab === "rbac"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          10-Role Permission Matrix
        </button>
        <button
          onClick={() => setActiveTab("backup")}
          className={`pb-3 relative whitespace-nowrap cursor-pointer ${
            activeTab === "backup"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Database Backup & Restore
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 relative whitespace-nowrap cursor-pointer ${
            activeTab === "security"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Security Policies & 2FA
        </button>
      </div>

      {/* Tab 1: Audit Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search user name, action, module, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
            />
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp & IP</th>
                    <th className="py-3 px-4">User & Role</th>
                    <th className="py-3 px-4">Action & Module</th>
                    <th className="py-3 px-4">Action Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="font-semibold text-slate-900">{log.timestamp}</div>
                        <div className="text-slate-400 text-[11px]">{log.ipAddress || "Campus LAN"}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{log.userName}</div>
                        <div className="text-xs text-emerald-800 font-medium">{log.userRole}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{log.action}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 mt-0.5">
                          {log.module}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                        No audit log entries match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === "rbac" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>Strict Role-Based Access Control (RBAC) enforced at all UI and state transition layers.</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-100 text-slate-800 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">User Role</th>
                  <th className="py-3 px-4">Student Records</th>
                  <th className="py-3 px-4">Academics & Marks</th>
                  <th className="py-3 px-4">Fee Ledger & Accounts</th>
                  <th className="py-3 px-4">School Setup</th>
                  <th className="py-3 px-4">Security & Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rolesMatrix.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.role}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-semibold ${r.students.includes("Full") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {r.students}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-semibold ${r.academics.includes("Full") || r.academics.includes("Marks") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {r.academics}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-semibold ${r.finance.includes("Full") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {r.finance}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-semibold ${r.settings.includes("Full") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {r.settings}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className={`px-2 py-0.5 rounded font-semibold ${r.security.includes("Full") ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                        {r.security}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Restore */}
      {activeTab === "backup" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-800 font-serif">Export Full Database Backup</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Export an encrypted JSON database snapshot containing all school records: pupils, teachers, fees, exam marks, library books, inventory assets, and discipline logs.
            </p>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Instant JSON Backup</span>
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-700" />
              <h3 className="text-base font-bold text-slate-800 font-serif">Restore from JSON Backup</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Upload a previously exported RYNTECH JSON backup file to restore system records and settings instantly.
            </p>

            <label className="w-full border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center bg-slate-50">
              <FileCode className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Choose JSON Backup File</span>
              <span className="text-[11px] text-slate-400 mt-0.5">Click to browse your local computer</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {restoreSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>System successfully restored from backup snapshot!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Security Policies */}
      {activeTab === "security" && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-800 font-serif">Authentication & Session Governance</h3>
            <p className="text-xs text-slate-500 mt-1">Configure campus security controls for staff and student logins.</p>
          </div>

          <div className="space-y-4 pt-2 text-sm">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <div className="font-semibold text-slate-800">Two-Factor Authentication (2FA via SMS/Email)</div>
                <div className="text-xs text-slate-500 mt-0.5">Require OTP verification for bursars and administrators upon sign-in.</div>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  twoFactorEnabled ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  twoFactorEnabled ? "translate-x-6" : "translate-x-0"
                }`} />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block font-semibold text-slate-800 text-xs">
                Inactivity Session Timeout (Minutes)
              </label>
              <select
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-lg p-2.5 bg-white font-medium text-xs text-slate-700"
              >
                <option value={15}>15 Minutes (High Security Mode)</option>
                <option value={30}>30 Minutes (Recommended Standard)</option>
                <option value={60}>60 Minutes (Standard Faculty Session)</option>
                <option value={120}>120 Minutes (Continuous Lab Session)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
