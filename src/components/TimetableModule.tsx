import React, { useState, FormEvent } from "react";
import { ClassStream, TimetablePeriod, Teacher, SubjectDefinition } from "../types";
import {
  Calendar,
  Clock,
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  RotateCcw,
  Printer,
  Shield,
  CheckCircle2,
  X
} from "lucide-react";
import { initialTimetableData } from "../data/zambianSchoolData";

interface TimetableModuleProps {
  classes: ClassStream[];
  teachers?: Teacher[];
  subjectsCatalog?: SubjectDefinition[];
  timetableData?: TimetablePeriod[];
  onUpdateTimetable?: (periods: TimetablePeriod[]) => void;
  canEdit?: boolean;
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as const;

export function TimetableModule({
  classes,
  teachers = [],
  subjectsCatalog = [],
  timetableData = initialTimetableData,
  onUpdateTimetable,
  canEdit = true
}: TimetableModuleProps) {
  const [selectedClassId, setSelectedClassId] = useState<number>(classes[0]?.id || 1);
  const [periods, setPeriods] = useState<TimetablePeriod[]>(timetableData);
  const [showModal, setShowModal] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<TimetablePeriod | null>(null);

  // Form state
  const [formDay, setFormDay] = useState<typeof DAYS_OF_WEEK[number]>("Monday");
  const [formStartTime, setFormStartTime] = useState("07:30");
  const [formEndTime, setFormEndTime] = useState("08:30");
  const [formSubject, setFormSubject] = useState("Mathematics");
  const [formTeacher, setFormTeacher] = useState(teachers[0]?.name || "Mr. Davison Banda");
  const [formRoom, setFormRoom] = useState("Room 1");
  const [formIsBreak, setFormIsBreak] = useState(false);

  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  // Filter periods for this class (or fallback to shared periods)
  const classPeriods = periods.filter(p => p.classId === selectedClassId || (!p.classId && selectedClassId === 1));

  const handleOpenAddModal = (day: typeof DAYS_OF_WEEK[number]) => {
    setEditingPeriod(null);
    setFormDay(day);
    setFormStartTime("07:30");
    setFormEndTime("08:30");
    setFormSubject("Mathematics");
    setFormTeacher(currentClass?.teacherName || teachers[0]?.name || "Class Teacher");
    setFormRoom(currentClass?.room || "Room 1");
    setFormIsBreak(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (period: TimetablePeriod) => {
    setEditingPeriod(period);
    setFormDay(period.day);
    const times = period.time.split("-").map(t => t.trim());
    setFormStartTime(times[0] || "07:30");
    setFormEndTime(times[1] || "08:30");
    setFormSubject(period.subject);
    setFormTeacher(period.teacher);
    setFormRoom(period.room || currentClass?.room || "Room 1");
    setFormIsBreak(!!period.isBreak);
    setShowModal(true);
  };

  const handleDeletePeriod = (id: string) => {
    if (window.confirm("Are you sure you want to remove this lesson period from the timetable?")) {
      const updated = periods.filter(p => p.id !== id);
      setPeriods(updated);
      onUpdateTimetable?.(updated);
    }
  };

  const handleSavePeriod = (e: FormEvent) => {
    e.preventDefault();
    const timeFormatted = `${formStartTime} - ${formEndTime}`;

    if (editingPeriod) {
      const updated = periods.map(p =>
        p.id === editingPeriod.id
          ? {
              ...p,
              day: formDay,
              time: timeFormatted,
              subject: formIsBreak ? formSubject || "Break" : formSubject,
              teacher: formIsBreak ? "Duty Staff" : formTeacher,
              room: formRoom,
              isBreak: formIsBreak
            }
          : p
      );
      setPeriods(updated);
      onUpdateTimetable?.(updated);
    } else {
      const newPeriod: TimetablePeriod = {
        id: `p-${Date.now()}`,
        classId: selectedClassId,
        day: formDay,
        time: timeFormatted,
        subject: formIsBreak ? formSubject || "Break" : formSubject,
        teacher: formIsBreak ? "Duty Staff" : formTeacher,
        room: formRoom,
        isBreak: formIsBreak
      };
      const updated = [...periods, newPeriod];
      setPeriods(updated);
      onUpdateTimetable?.(updated);
    }
    setShowModal(false);
  };

  const handleResetToStandard = () => {
    if (window.confirm(`Reset timetable for ${currentClass?.name} to standard schedule?`)) {
      const regenerated: TimetablePeriod[] = initialTimetableData.map(p => ({
        ...p,
        id: `p-${selectedClassId}-${p.id}`,
        classId: selectedClassId
      }));
      const others = periods.filter(p => p.classId !== selectedClassId);
      const updated = [...others, ...regenerated];
      setPeriods(updated);
      onUpdateTimetable?.(updated);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900">Weekly Academic Class Timetable</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active Term Schedule
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standardized lesson periods • Class Teacher: <span className="font-bold text-slate-800">{currentClass?.teacherName}</span> • Room: <span className="font-bold text-slate-800">{currentClass?.room}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600">Select Stream:</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600 focus:bg-white cursor-pointer"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (Room {c.room})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Print Class Timetable"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {canEdit && (
            <button
              onClick={handleResetToStandard}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Reset to Ministry standard lesson schedule"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Stream</span>
            </button>
          )}
        </div>
      </div>

      {/* 5-Day Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const dayPeriods = classPeriods
            .filter(p => p.day === day)
            .sort((a, b) => a.time.localeCompare(b.time));

          return (
            <div key={day} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <span className="font-bold text-sm tracking-wide font-serif">{day}</span>
                {canEdit && (
                  <button
                    onClick={() => handleOpenAddModal(day)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-emerald-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
                    title={`Add period to ${day}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="p-3 space-y-2.5 flex-1 bg-slate-50/50">
                {dayPeriods.length === 0 ? (
                  <div className="p-4 text-center text-slate-400 font-medium">
                    No periods configured.
                    {canEdit && (
                      <button
                        onClick={() => handleOpenAddModal(day)}
                        className="mt-2 text-[11px] text-emerald-700 font-bold underline block mx-auto cursor-pointer"
                      >
                        + Add First Period
                      </button>
                    )}
                  </div>
                ) : (
                  dayPeriods.map((p) =>
                    p.isBreak ? (
                      <div
                        key={p.id}
                        className="group relative p-2.5 bg-amber-100/70 border border-amber-300 text-amber-900 text-center rounded-xl font-bold text-[10px] flex items-center justify-between"
                      >
                        <span className="truncate">☕ {p.subject} ({p.time})</span>
                        {canEdit && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-1">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1 text-amber-800 hover:text-amber-950 cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeletePeriod(p.id)}
                              className="p-1 text-red-600 hover:text-red-800 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        key={p.id}
                        className="group relative p-3 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1 hover:border-emerald-500 transition-all"
                      >
                        <div className="flex items-center justify-between text-[10px] text-emerald-700 font-mono font-bold">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            {p.time}
                          </span>
                          {p.room && (
                            <span className="text-slate-400 font-sans text-[9px] bg-slate-100 px-1.5 py-0.2 rounded">
                              {p.room}
                            </span>
                          )}
                        </div>

                        <p className="font-bold text-slate-900 text-xs">{p.subject}</p>
                        <p className="text-[10px] text-slate-500 truncate">{p.teacher}</p>

                        {canEdit && (
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-1 py-0.5 rounded-md shadow-xs border border-slate-200">
                            <button
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1 text-slate-600 hover:text-emerald-700 cursor-pointer"
                              title="Edit period"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeletePeriod(p.id)}
                              className="p-1 text-slate-600 hover:text-red-600 cursor-pointer"
                              title="Delete period"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Period Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                {editingPeriod ? "Edit Lesson Period" : `Add Lesson Period (${formDay})`}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePeriod} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={formDay}
                    onChange={(e) => setFormDay(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Period Type</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isBreakCheck"
                      checked={formIsBreak}
                      onChange={(e) => setFormIsBreak(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <label htmlFor="isBreakCheck" className="text-xs font-medium text-slate-700 cursor-pointer">
                      Break / Assembly
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {formIsBreak ? "Break Description" : "Subject Name *"}
                </label>
                {formIsBreak ? (
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Morning Tea Break or Assembly"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                ) : (
                  <input
                    type="text"
                    required
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Mathematics, English Language, Physics"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                )}
              </div>

              {!formIsBreak && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject Teacher</label>
                    <input
                      type="text"
                      value={formTeacher}
                      onChange={(e) => setFormTeacher(e.target.value)}
                      placeholder="e.g. Mr. Davison Banda"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Classroom / Lab</label>
                    <input
                      type="text"
                      value={formRoom}
                      onChange={(e) => setFormRoom(e.target.value)}
                      placeholder="e.g. Room 1 or Science Lab"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-700 shadow-sm transition-colors cursor-pointer"
                >
                  {editingPeriod ? "Update Period" : "Add Period"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
