import React, { useState } from "react";
import { Student, ClassStream, AttendanceStatus, AttendanceRecord } from "../types";
import { CheckSquare, Calendar, UserCheck, AlertCircle, Clock, Check, X, ShieldAlert } from "lucide-react";

interface AttendanceModuleProps {
  classes: ClassStream[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (newRecords: AttendanceRecord[]) => void;
  canEdit?: boolean;
  canMarkAttendance?: boolean;
  filterStudentId?: number;
}

export function AttendanceModule({
  classes,
  students,
  attendanceRecords,
  onUpdateAttendance,
  canEdit,
  canMarkAttendance,
  filterStudentId
}: AttendanceModuleProps) {
  const canModify = canMarkAttendance !== undefined ? canMarkAttendance : (canEdit !== undefined ? canEdit : true);
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 1);
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-23");
  const [session, setSession] = useState<"Morning" | "Afternoon">("Morning");

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const classStudents = students.filter(s => s.classId === selectedClassId && (!filterStudentId || s.id === filterStudentId));

  // Filter current session records
  const currentRecords = attendanceRecords.filter(
    r => r.classId === selectedClassId && r.date === selectedDate && r.session === session
  );

  const getStudentStatus = (studentId: number): AttendanceStatus => {
    const rec = currentRecords.find(r => r.studentId === studentId);
    return rec ? rec.status : "Present"; // Default to Present
  };

  const setStudentStatus = (studentId: number, status: AttendanceStatus) => {
    if (!canModify) return;

    const filtered = attendanceRecords.filter(
      r => !(r.classId === selectedClassId && r.date === selectedDate && r.session === session && r.studentId === studentId)
    );

    const newRecord: AttendanceRecord = {
      id: `${selectedClassId}_${selectedDate}_${session}_${studentId}`,
      date: selectedDate,
      classId: selectedClassId,
      studentId,
      status,
      session
    };

    onUpdateAttendance([...filtered, newRecord]);
  };

  const markAll = (status: AttendanceStatus) => {
    if (!canEdit) return;

    const filtered = attendanceRecords.filter(
      r => !(r.classId === selectedClassId && r.date === selectedDate && r.session === session)
    );

    const newBatch: AttendanceRecord[] = classStudents.map(s => ({
      id: `${selectedClassId}_${selectedDate}_${session}_${s.id}`,
      date: selectedDate,
      classId: selectedClassId,
      studentId: s.id,
      status,
      session
    }));

    onUpdateAttendance([...filtered, ...newBatch]);
  };

  // Summary counts
  const presentCount = classStudents.filter(s => getStudentStatus(s.id) === "Present").length;
  const lateCount = classStudents.filter(s => getStudentStatus(s.id) === "Late").length;
  const absentCount = classStudents.filter(s => getStudentStatus(s.id) === "Absent").length;
  const excusedCount = classStudents.filter(s => getStudentStatus(s.id) === "Excused").length;
  const attendancePercentage = classStudents.length
    ? Math.round(((presentCount + lateCount) / classStudents.length) * 100)
    : 100;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Controls Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-serif">
              <CheckSquare className="w-5 h-5 text-emerald-600" />
              Daily Attendance Register
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Morning & Afternoon roll call records feed directly into official termly report cards
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Class Stream</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.teacherName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Session</label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as "Morning" | "Afternoon")}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Morning">Morning Session (07:30 - 12:00)</option>
                <option value="Afternoon">Afternoon Session (12:30 - 16:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Register Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Quick Bulk Actions */}
        {canEdit && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500 font-bold">Bulk Register Actions:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAll("Present")}
                className="bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" /> Mark All Present
              </button>
              <button
                onClick={() => markAll("Late")}
                className="bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Clock className="w-3.5 h-3.5" /> Mark All Late
              </button>
              <button
                onClick={() => markAll("Absent")}
                className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <X className="w-3.5 h-3.5" /> Mark All Absent
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Pupils</p>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{classStudents.length}</p>
          <p className="text-[11px] text-slate-500">{currentClass.name}</p>
        </div>

        <div className="bg-white border border-emerald-200 border-l-4 border-l-emerald-600 rounded-xl p-4 shadow-sm bg-emerald-50/20">
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present</p>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">{presentCount}</p>
          <p className="text-[11px] text-slate-500">On Time</p>
        </div>

        <div className="bg-white border border-amber-200 border-l-4 border-l-amber-600 rounded-xl p-4 shadow-sm bg-amber-50/20">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Late</p>
          <p className="text-2xl font-black text-amber-700 mt-1 font-mono">{lateCount}</p>
          <p className="text-[11px] text-slate-500">Arrived After 08:00</p>
        </div>

        <div className="bg-white border border-rose-200 border-l-4 border-l-rose-600 rounded-xl p-4 shadow-sm bg-rose-50/20">
          <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Absent</p>
          <p className="text-2xl font-black text-rose-700 mt-1 font-mono">{absentCount}</p>
          <p className="text-[11px] text-slate-500">Unexcused</p>
        </div>

        <div className="bg-white border border-sky-200 border-l-4 border-l-sky-600 rounded-xl p-4 shadow-sm bg-sky-50/20 col-span-2 md:col-span-1">
          <p className="text-[10px] font-bold text-sky-800 uppercase tracking-wider">Session Rate</p>
          <p className="text-2xl font-black text-sky-700 mt-1 font-mono">{attendancePercentage}%</p>
          <p className="text-[11px] text-slate-500">Daily Attendance</p>
        </div>
      </div>

      {/* Register Student Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Roll Call Register: <span className="text-emerald-700">{currentClass.name}</span> — {session} ({selectedDate})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Class Teacher: {currentClass.teacherName}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Pupil Name</th>
                <th className="py-3 px-4">Gender</th>
                <th className="py-3 px-4">Guardian Contact</th>
                <th className="py-3 px-4 text-center">Register Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {classStudents.map((student) => {
                const status = getStudentStatus(student.id);

                return (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{student.name}</td>
                    <td className="py-3 px-4 text-slate-600">{student.gender}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{student.guardianName} ({student.guardianPhone})</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          disabled={!canEdit}
                          onClick={() => setStudentStatus(student.id, "Present")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                            status === "Present"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Present
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => setStudentStatus(student.id, "Late")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                            status === "Late"
                              ? "bg-amber-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Late
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => setStudentStatus(student.id, "Absent")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                            status === "Absent"
                              ? "bg-rose-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Absent
                        </button>

                        <button
                          disabled={!canEdit}
                          onClick={() => setStudentStatus(student.id, "Excused")}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
                            status === "Excused"
                              ? "bg-sky-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Excused
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

