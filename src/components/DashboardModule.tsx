import React from "react";
import { Student, Teacher, ClassStream, FeeItem, SchoolEvent } from "../types";
import { SCHOOL_NAME } from "../data/zambianSchoolData";
import {
  Calendar,
  Users,
  UserCheck,
  DollarSign,
  Share2,
  ArrowRight,
  FileText,
  CheckCircle2,
  GraduationCap,
  Percent,
  Clock,
  Layers
} from "lucide-react";

interface DashboardModuleProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassStream[];
  fees: FeeItem[];
  events: SchoolEvent[];
  onNavigateTab: (tabId: string) => void;
  onOpenShareModal: () => void;
}

export function DashboardModule({
  students,
  teachers,
  classes,
  fees,
  events,
  onNavigateTab,
  onOpenShareModal
}: DashboardModuleProps) {
  const totalPaidZMW = fees.reduce((a, f) => a + f.paidAmountZMW, 0);
  const totalBilledZMW = fees.reduce((a, f) => a + f.amountZMW, 0);
  const feeCollectionRate = totalBilledZMW > 0 ? Math.round((totalPaidZMW / totalBilledZMW) * 100) : 0;
  
  const boysCount = students.filter(s => s.gender === "Male").length;
  const girlsCount = students.filter(s => s.gender === "Female").length;
  const candidateStudents = students.filter(s => s.grade === "Grade 7" || s.grade === "Grade 9" || s.grade === "Grade 12");

  return (
    <div className="space-y-6 font-sans">
      {/* Official Institutional Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-serif font-bold text-xl shadow-xs shrink-0">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold font-serif text-slate-900 tracking-tight">
                  {SCHOOL_NAME}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  MoE Registered
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span>School Centre: <strong className="font-mono text-slate-800">2</strong></span>
                <span>•</span>
                <span>District: <strong className="text-slate-800">Lusaka District</strong></span>
                <span>•</span>
                <span>Academic Session: <strong className="text-slate-800">Term 2, Bread of Life</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={onOpenShareModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Portal Access</span>
            </button>
          </div>
        </div>
      </div>

      {/* Institutional Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Pupil Enrollment */}
        <div 
          onClick={() => onNavigateTab("Students")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Total Enrolled Pupils</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {students.length}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Boys: <strong className="text-slate-700">{boysCount}</strong> • Girls: <strong className="text-slate-700">{girlsCount}</strong></span>
            <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Roster <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 2: Certified Teachers */}
        <div 
          onClick={() => onNavigateTab("Teachers")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Teaching Faculty</span>
            <UserCheck className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {teachers.length}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Teaching Council Registered</span>
            <span className="text-slate-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Staff <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 3: Fee Invoicing & Recovery */}
        <div 
          onClick={() => onNavigateTab("Fees")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Kwacha Fees Collected</span>
            <DollarSign className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            K{totalPaidZMW.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>{feeCollectionRate}% of K{totalBilledZMW.toLocaleString()}</span>
            <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Ledger <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Metric 4: Active Class Streams */}
        <div 
          onClick={() => onNavigateTab("Students")}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Class Streams & Cohorts</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {classes.length} Streams
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Grades 1 through 12</span>
            <span className="text-slate-700 font-semibold group-hover:underline flex items-center gap-0.5">
              Manage <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Main Operations & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Administrative Operations & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Routine Operations */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 font-serif mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Standard Academic Workflows</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <button
                onClick={() => onNavigateTab("Grading")}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>Continuous Assessment (CA)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Record term tests, project marks & compute ECZ scale grades.</p>
              </button>

              <button
                onClick={() => onNavigateTab("Attendance")}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>Daily Class Register</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Mark morning roll call and track pupil absence reasons.</p>
              </button>

              <button
                onClick={() => onNavigateTab("ReportCards")}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>Termly Report Cards</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Generate official PDF term report cards with teacher remarks.</p>
              </button>

              <button
                onClick={() => onNavigateTab("Students")}
                className="p-3 rounded-lg border border-slate-200 hover:border-emerald-600 bg-slate-50/60 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer group"
              >
                <div className="font-semibold text-slate-900 group-hover:text-emerald-900 flex items-center justify-between">
                  <span>Pupil Admissions & Batches</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Admit new pupils, import CSV rosters and manage class streams.</p>
              </button>
            </div>
          </div>

          {/* ECZ Examination Candidates Overview */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>ECZ National Examination Candidates</span>
              </h2>
              <span className="text-[11px] font-mono text-slate-500">Grades 7, 9 & 12</span>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden text-xs">
              {candidateStudents.slice(0, 5).map(st => (
                <div key={st.id} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{st.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                      <span>ECZ No: <strong className="text-slate-700">{st.eczNo}</strong></span>
                      <span>•</span>
                      <span>{st.grade} ({st.stream})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab("ReportCards")}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors cursor-pointer"
                  >
                    View Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Academic Calendar & Term Notices */}
        <div className="space-y-6">
          {/* Term Dates & Milestones */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <span>Term 2 Schedule (2026)</span>
              </h2>
              <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                13 Weeks
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              {events.slice(0, 4).map(ev => (
                <div key={ev.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">{ev.title}</span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                      {ev.date}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1 leading-snug">{ev.description}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigateTab("AcademicCalendar")}
              className="w-full mt-3 py-2 text-center text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              View Full Academic Calendar
            </button>
          </div>

          {/* Ministry Compliance Badge */}
          <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800 text-xs space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Curriculum Standard
            </div>
            <div className="font-semibold text-white">
              Republic of Zambia MoE Framework
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Fully aligned with ECZ standard grading, continuous assessment weightings (CA 30% / Exam 70%), and secondary pathway divisions.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
