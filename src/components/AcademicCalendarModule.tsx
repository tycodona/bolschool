import React, { useState, useMemo } from "react";
import {
  SchoolEvent,
  AcademicTerm,
  ZambianHoliday,
  UserSession,
  EventCategory
} from "../types";
import {
  ACADEMIC_TERMS_2026,
  ZAMBIAN_HOLIDAYS_2026,
  SCHOOL_NAME
} from "../data/zambianSchoolData";
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  BookmarkCheck,
  Flag,
  Trophy,
  GraduationCap,
  Bell,
  Trash2,
  Edit2,
  X,
  Layers,
  List,
  Grid,
  Sun,
  ShieldCheck,
  Share2
} from "lucide-react";

interface AcademicCalendarModuleProps {
  session?: UserSession;
  events: SchoolEvent[];
  onAddEvent?: (event: Omit<SchoolEvent, "id">) => void;
  onUpdateEvent?: (event: SchoolEvent) => void;
  onDeleteEvent?: (eventId: number) => void;
  canManage?: boolean;
}

export function AcademicCalendarModule({
  session,
  events,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  canManage
}: AcademicCalendarModuleProps) {
  const isRoleAdmin = session?.role === "admin" || canManage === true;
  const isRoleTeacher = session?.role === "teacher";
  const canManageEvents = canManage !== undefined ? canManage : (isRoleAdmin || isRoleTeacher);

  // View state
  const [activeView, setActiveView] = useState<"terms" | "calendar" | "agenda" | "holidays">("terms");
  const [selectedTerm, setSelectedTerm] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedAudience, setSelectedAudience] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Month navigation for Grid view
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date(2026, 4, 1)); // Default May 2026 (Term 2)
  const [selectedDateEvents, setSelectedDateEvents] = useState<{ dateStr: string; events: SchoolEvent[]; holiday?: ZambianHoliday } | null>(null);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    date: string;
    endDate: string;
    time: string;
    category: EventCategory;
    term: "Term 1" | "Term 2" | "Term 3" | "Holiday Period";
    targetAudience: "All School" | "Primary Section" | "Secondary Section" | "Staff & Teachers" | "Parents & PTA" | "Exam Candidates (Grades 7, 9, 12)";
    location: string;
    description: string;
    isImportant: boolean;
  }>({
    title: "",
    date: new Date().toISOString().split("T")[0],
    endDate: "",
    time: "",
    category: "Academic",
    term: "Term 2",
    targetAudience: "All School",
    location: "",
    description: "",
    isImportant: false
  });

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotificationToast(msg);
    setTimeout(() => setNotificationToast(null), 3500);
  };

  // Merge events with Zambian public holidays for unified viewing
  const allEventsCombined = useMemo(() => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date));
  }, [events]);

  // Filtered Events for Agenda & Search
  const filteredEvents = useMemo(() => {
    return allEventsCombined.filter(ev => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTerm = selectedTerm === "All" || ev.term === selectedTerm;
      const matchCategory = selectedCategory === "All" || ev.category === selectedCategory;
      const matchAudience =
        selectedAudience === "All" ||
        ev.targetAudience === "All School" ||
        ev.targetAudience === selectedAudience;

      return matchSearch && matchTerm && matchCategory && matchAudience;
    });
  }, [allEventsCombined, searchQuery, selectedTerm, selectedCategory, selectedAudience]);

  // Get color styles for category tags
  const getCategoryBadgeClass = (category: EventCategory) => {
    switch (category) {
      case "Term Dates":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "National Holiday":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "Holiday":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "Examinations":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "Sports & Culture":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "PTA Meeting":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Religious & School Ceremony":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "Academic":
      default:
        return "bg-sky-100 text-sky-800 border-sky-300";
    }
  };

  const getCategoryDotColor = (category: EventCategory) => {
    switch (category) {
      case "Term Dates": return "bg-emerald-500";
      case "National Holiday": return "bg-amber-500";
      case "Holiday": return "bg-orange-500";
      case "Examinations": return "bg-rose-500";
      case "Sports & Culture": return "bg-purple-500";
      case "PTA Meeting": return "bg-blue-500";
      case "Religious & School Ceremony": return "bg-indigo-500";
      case "Academic":
      default: return "bg-sky-500";
    }
  };

  // Helper to format dates
  const formatDateDisplay = (dateString: string) => {
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric"
        });
      }
      return dateString;
    } catch {
      return dateString;
    }
  };

  // Month grid helpers
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString("en-GB", { month: "long", year: "numeric" });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  const handleOpenAddModal = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      date: new Date().toISOString().split("T")[0],
      endDate: "",
      time: "",
      category: "Academic",
      term: "Term 2",
      targetAudience: "All School",
      location: "",
      description: "",
      isImportant: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event: SchoolEvent) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      endDate: event.endDate || "",
      time: event.time || "",
      category: event.category,
      term: event.term || "Term 2",
      targetAudience: event.targetAudience || "All School",
      location: event.location || "",
      description: event.description || "",
      isImportant: !!event.isImportant
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      showToast("Please provide event title and date.");
      return;
    }

    if (editingEvent && onUpdateEvent) {
      onUpdateEvent({
        ...editingEvent,
        ...formData
      });
      showToast(`Updated "${formData.title}" successfully.`);
    } else if (onAddEvent) {
      onAddEvent(formData);
      showToast(`Event "${formData.title}" added to academic calendar.`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: number, title: string) => {
    if (confirm(`Are you sure you want to remove the event "${title}"?`)) {
      if (onDeleteEvent) {
        onDeleteEvent(id);
        showToast("Event removed from academic calendar.");
      }
    }
  };

  // Export iCalendar (.ics) format
  const handleExportICS = () => {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Bread of Life School//Academic Calendar//EN\nCALSCALE:GREGORIAN\nMETHOD:PUBLISH\n";

    allEventsCombined.forEach(ev => {
      const cleanDate = ev.date.replace(/-/g, "");
      const uid = `bol-event-${ev.id}@myblci.org`;
      icsContent += "BEGIN:VEVENT\n";
      icsContent += `UID:${uid}\n`;
      icsContent += `DTSTAMP:${cleanDate}T000000Z\n`;
      icsContent += `DTSTART;VALUE=DATE:${cleanDate}\n`;
      if (ev.endDate) {
        const cleanEndDate = ev.endDate.replace(/-/g, "");
        icsContent += `DTEND;VALUE=DATE:${cleanEndDate}\n`;
      }
      icsContent += `SUMMARY:${ev.title.replace(/,/g, "\\,")}\n`;
      icsContent += `DESCRIPTION:${(ev.description + (ev.time ? " - Time: " + ev.time : "")).replace(/,/g, "\\,").replace(/\n/g, "\\n")}\n`;
      if (ev.location) {
        icsContent += `LOCATION:${ev.location.replace(/,/g, "\\,")}\n`;
      }
      icsContent += `CATEGORIES:${ev.category}\n`;
      icsContent += "END:VEVENT\n";
    });

    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `Bread_of_Life_Academic_Calendar_2026.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded iCalendar (.ics) file! You can import this into Google Calendar or Apple Calendar.");
  };

  // Print Calendar
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 font-sans pb-12">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <CalendarDays className="w-3.5 h-3.5" />
              2026 Academic Year
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
              Term 2 in Session
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-2 font-serif">
            Academic Calendar & School Term Dates
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Official term opening & closing dates, mid-term breaks, ECZ examinations schedule, Zambian national public holidays, and school-wide events.
          </p>
        </div>

        {/* Global Calendar Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {canManageEvents && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add School Event</span>
            </button>
          )}

          <button
            onClick={handleExportICS}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors"
            title="Download iCalendar file (.ics) to sync with Google Calendar / Outlook"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export (.ics)</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors hidden sm:flex"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Quick Status KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Current Academic Term</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-lg font-bold text-slate-900 mt-1">Term 2 (Second Term)</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>May 11, 2026 – Aug 07, 2026 (13 Weeks)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Upcoming Mid-Term Break</span>
          <div className="text-lg font-bold text-amber-600 mt-1">19 – 26 June 2026</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <BookmarkCheck className="w-3 h-3 text-amber-500" />
            <span>1 Week Recess for Pupils</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">National Exam Season</span>
          <div className="text-lg font-bold text-rose-600 mt-1">Mock & ECZ Finals</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 text-rose-500" />
            <span>Grades 7, 9 & 12 Candidate Tracks</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Public & School Holidays</span>
          <div className="text-lg font-bold text-indigo-600 mt-1">14 Gazette Holidays</div>
          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
            <Flag className="w-3 h-3 text-indigo-500" />
            <span>Zambian National Calendar</span>
          </div>
        </div>
      </div>

      {/* Navigation View Switcher Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveView("terms")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === "terms"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Term Schedules</span>
          </button>

          <button
            onClick={() => setActiveView("calendar")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === "calendar"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Month Calendar</span>
          </button>

          <button
            onClick={() => setActiveView("agenda")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === "agenda"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Events Agenda</span>
          </button>

          <button
            onClick={() => setActiveView("holidays")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === "holidays"
                ? "bg-white text-emerald-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Zambian Holidays</span>
          </button>
        </div>

        {/* View Details Search & Filters (Available in Agenda and Calendar views) */}
        {(activeView === "agenda" || activeView === "calendar") && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, exams, sports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-60 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs"
            >
              <option value="All">All Terms</option>
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 shadow-2xs hidden sm:inline-block"
            >
              <option value="All">All Categories</option>
              <option value="Term Dates">Term Dates</option>
              <option value="Examinations">Examinations & Mocks</option>
              <option value="Sports & Culture">Sports & Culture</option>
              <option value="PTA Meeting">PTA Meetings</option>
              <option value="National Holiday">National Holidays</option>
              <option value="Religious & School Ceremony">Ceremonies</option>
              <option value="Academic">Academic Events</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 1: TERM SCHEDULES & TIMELINES */}
      {activeView === "terms" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ACADEMIC_TERMS_2026.map((term, index) => {
              const isActive = term.status === "Active";
              const isCompleted = term.status === "Completed";
              const termEvents = allEventsCombined.filter(e => e.term === term.id);

              return (
                <div
                  key={term.id}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${
                    isActive
                      ? "border-emerald-400 shadow-md ring-2 ring-emerald-500/20"
                      : isCompleted
                      ? "border-slate-200 opacity-95 shadow-2xs"
                      : "border-slate-200 shadow-2xs"
                  }`}
                >
                  <div>
                    {/* Term Header Strip */}
                    <div className={`p-4 border-b ${
                      isActive
                        ? "bg-emerald-50/80 border-emerald-100"
                        : isCompleted
                        ? "bg-slate-50 border-slate-100"
                        : "bg-amber-50/60 border-amber-100"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
                          Term 0{index + 1} • {term.year}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isActive
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : isCompleted
                            ? "bg-slate-200 text-slate-700 border-slate-300"
                            : "bg-amber-100 text-amber-800 border-amber-300"
                        }`}>
                          {term.status}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-2 font-serif">
                        {term.name}
                      </h3>
                      <p className="text-xs text-slate-600 italic mt-0.5">
                        "{term.theme}"
                      </p>
                    </div>

                    {/* Term Schedule Metrics */}
                    <div className="p-4 space-y-3.5 text-xs">
                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-500">Term Duration:</span>
                          <span className="font-bold text-slate-900">{formatDateDisplay(term.startDate)} – {formatDateDisplay(term.endDate)}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="font-semibold text-slate-500">Total Instructional Time:</span>
                          <span className="font-bold text-emerald-700">{term.weeks} Weeks ({term.totalInstructionDays} School Days)</span>
                        </div>
                      </div>

                      {/* Mid-term & Holiday Break Details */}
                      <div className="space-y-2 border-t border-slate-100 pt-3">
                        <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-200">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Mid-Term Break:</span>
                          </div>
                          <p className="text-slate-800 mt-0.5 text-[11px]">
                            {formatDateDisplay(term.midTermBreak.startDate)} – {formatDateDisplay(term.midTermBreak.endDate)}
                          </p>
                          <p className="text-slate-600 text-[10px] mt-0.5">
                            {term.midTermBreak.description}
                          </p>
                        </div>

                        <div className="bg-sky-50/70 p-2.5 rounded-lg border border-sky-200">
                          <div className="flex items-center gap-1.5 font-bold text-sky-900 text-[11px]">
                            <Sun className="w-3.5 h-3.5 text-sky-700" />
                            <span>Holiday Recess:</span>
                          </div>
                          <p className="text-slate-800 mt-0.5 text-[11px]">
                            {formatDateDisplay(term.holidayBreak.startDate)} – {formatDateDisplay(term.holidayBreak.endDate)}
                          </p>
                          <p className="text-slate-600 text-[10px] mt-0.5">
                            {term.holidayBreak.description}
                          </p>
                        </div>
                      </div>

                      {/* Key Academic Focus */}
                      <div className="border-t border-slate-100 pt-3">
                        <span className="font-bold text-slate-700 block mb-1">Key Curriculum & Activities Focus:</span>
                        <p className="text-slate-600 leading-relaxed text-[11px]">
                          {term.keyFocus}
                        </p>
                      </div>

                      {/* Highlights / Major Events count */}
                      <div className="border-t border-slate-100 pt-3">
                        <div className="flex items-center justify-between text-slate-700 mb-2">
                          <span className="font-bold">Scheduled Milestones ({termEvents.length}):</span>
                          <button
                            onClick={() => {
                              setSelectedTerm(term.id);
                              setActiveView("agenda");
                            }}
                            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline"
                          >
                            View Agenda →
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {termEvents.slice(0, 3).map(ev => (
                            <div key={ev.id} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg text-[11px]">
                              <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${getCategoryDotColor(ev.category)}`} />
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 truncate">{ev.title}</p>
                                <p className="text-slate-500 text-[10px]">{formatDateDisplay(ev.date)}</p>
                              </div>
                            </div>
                          ))}
                          {termEvents.length > 3 && (
                            <p className="text-[10px] text-slate-500 text-center pt-1 font-medium">
                              + {termEvents.length - 3} more scheduled events in this term
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Action */}
                  <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        setSelectedTerm(term.id);
                        setActiveView("agenda");
                      }}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-bold text-emerald-700 hover:bg-emerald-100/60 border border-emerald-200 transition-colors"
                    >
                      Explore {term.id} Detailed Dates
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ministry of Education & ECZ Compliance Note */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <h4 className="font-bold text-emerald-900 text-sm">
                Ministry of Education Official Academic Framework Compliance
              </h4>
              <p className="text-emerald-800 leading-relaxed">
                The Bread of Life School Academic Calendar adheres strictly to the Ministry of Education (MoE) Zambia standard 3-term operational schedule, ensuring a minimum of 190 instructional days per academic year. All national examinations for Grade 7, Grade 9 (JSSLE), and Grade 12 Senior Secondary are synchronized with the official Examinations Council of Zambia (ECZ) national timetables.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE MONTH GRID CALENDAR */}
      {activeView === "calendar" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
            {/* Month Header Controller */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 font-serif">
                    {monthName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Click on any highlighted date to inspect events and holiday details
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setCurrentMonthDate(new Date(2026, 4, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Term 2 Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Calendar Category Legend */}
            <div className="flex flex-wrap items-center gap-3 mb-4 pb-3 border-b border-slate-100 text-[11px]">
              <span className="font-semibold text-slate-500">Key:</span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Term Opening / Closing</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>Examinations / Mocks</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Zambian Public Holidays</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Sports & Culture</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span>PTA Meetings</span>
              </span>
            </div>

            {/* 7-Day Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 py-2">
                  {day}
                </div>
              ))}

              {/* Prev Month Inactive Days */}
              {Array.from({ length: firstDayIndex }).map((_, i) => {
                const dayNum = daysInPrevMonth - firstDayIndex + i + 1;
                return (
                  <div
                    key={`prev-${i}`}
                    className="min-h-[70px] sm:min-h-[90px] p-1.5 rounded-xl bg-slate-50/50 border border-slate-100 text-slate-300 text-xs"
                  >
                    <span className="font-mono">{dayNum}</span>
                  </div>
                );
              })}

              {/* Current Month Days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const formattedMonth = String(month + 1).padStart(2, "0");
                const formattedDay = String(dayNum).padStart(2, "0");
                const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

                // Check events and holidays on this day
                const dayEvents = allEventsCombined.filter(ev => {
                  if (ev.date === dateStr) return true;
                  if (ev.endDate && ev.date <= dateStr && ev.endDate >= dateStr) return true;
                  return false;
                });

                const dayHoliday = ZAMBIAN_HOLIDAYS_2026.find(h => h.date === dateStr);
                const hasEvents = dayEvents.length > 0 || !!dayHoliday;

                const isSelected = selectedDateEvents?.dateStr === dateStr;

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      if (hasEvents) {
                        setSelectedDateEvents({ dateStr, events: dayEvents, holiday: dayHoliday });
                      } else {
                        setSelectedDateEvents(null);
                      }
                    }}
                    className={`min-h-[70px] sm:min-h-[90px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between ${
                      hasEvents
                        ? "cursor-pointer hover:border-emerald-500 hover:shadow-xs bg-white"
                        : "bg-slate-50/30 border-slate-100 text-slate-600"
                    } ${
                      isSelected
                        ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50/30"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold font-mono ${
                        dayHoliday ? "text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full" : "text-slate-800"
                      }`}>
                        {dayNum}
                      </span>

                      {dayHoliday && (
                        <Flag className="w-3 h-3 text-amber-600" aria-label={dayHoliday.name} />
                      )}
                    </div>

                    {/* Event Dots & Mini Labels */}
                    <div className="space-y-1 mt-1 overflow-hidden">
                      {dayHoliday && (
                        <div className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-1 rounded truncate">
                          {dayHoliday.name}
                        </div>
                      )}

                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] sm:text-[10px] font-semibold px-1 py-0.5 rounded truncate border ${getCategoryBadgeClass(ev.category)}`}
                          title={`${ev.title} (${ev.category})`}
                        >
                          {ev.title}
                        </div>
                      ))}

                      {dayEvents.length > 2 && (
                        <div className="text-[9px] text-slate-500 font-bold px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Date Details Panel (Slide-in / Expand) */}
          {selectedDateEvents && (
            <div className="bg-white rounded-2xl border border-emerald-300 shadow-md p-5 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Events Scheduled on {formatDateDisplay(selectedDateEvents.dateStr)}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedDateEvents(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {selectedDateEvents.holiday && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <Flag className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <h4 className="font-bold text-xs text-amber-900">
                          {selectedDateEvents.holiday.name} ({selectedDateEvents.holiday.type})
                        </h4>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {selectedDateEvents.holiday.description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDateEvents.events.map(ev => (
                  <div key={ev.id} className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadgeClass(ev.category)}`}>
                          {ev.category}
                        </span>
                        {ev.term && (
                          <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                            {ev.term}
                          </span>
                        )}
                        {ev.isImportant && (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Important
                          </span>
                        )}
                      </div>

                      <h4 className="font-bold text-xs text-slate-900">{ev.title}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{ev.description}</p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 pt-1">
                        {ev.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {ev.time}
                          </span>
                        )}
                        {ev.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {ev.location}
                          </span>
                        )}
                        {ev.targetAudience && (
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            Audience: {ev.targetAudience}
                          </span>
                        )}
                      </div>
                    </div>

                    {canManageEvents && (
                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                        <button
                          onClick={() => handleOpenEditModal(ev)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-200 transition-colors"
                          title="Edit Event"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, ev.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: COMPREHENSIVE EVENTS AGENDA (Filterable & Searchable) */}
      {activeView === "agenda" && (
        <div className="space-y-4">
          {/* Active Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-900">{filteredEvents.length}</strong> academic events & milestones
            </span>

            <div className="flex items-center gap-2">
              {selectedTerm !== "All" && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  Term: {selectedTerm}
                  <button onClick={() => setSelectedTerm("All")}>
                    <X className="w-3 h-3 hover:text-emerald-950" />
                  </button>
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="bg-sky-100 text-sky-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory("All")}>
                    <X className="w-3 h-3 hover:text-sky-950" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 hover:text-amber-950" />
                  </button>
                </span>
              )}
            </div>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No matching events found</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try clearing your search query or selecting "All Terms" and "All Categories".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedTerm("All");
                  setSelectedCategory("All");
                  setSelectedAudience("All");
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((ev) => {
                return (
                  <div
                    key={ev.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 transition-all shadow-2xs hover:shadow-xs flex flex-col md:flex-row md:items-start justify-between gap-4 ${
                      ev.isImportant ? "border-rose-200 bg-rose-50/20" : "border-slate-200"
                    }`}
                  >
                    {/* Left: Date Badge Box */}
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          {new Date(ev.date).toLocaleString("en-GB", { month: "short" })}
                        </span>
                        <span className="text-lg font-extrabold font-mono leading-none mt-0.5">
                          {ev.date.split("-")[2]}
                        </span>
                      </div>

                      {/* Middle: Event Title, Description & Metadata */}
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getCategoryBadgeClass(ev.category)}`}>
                            {ev.category}
                          </span>

                          {ev.term && (
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                              {ev.term}
                            </span>
                          )}

                          {ev.isImportant && (
                            <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              High Priority
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">{ev.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                          {ev.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateDisplay(ev.date)}
                            {ev.endDate && ` – ${formatDateDisplay(ev.endDate)}`}
                          </span>

                          {ev.time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {ev.time}
                            </span>
                          )}

                          {ev.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400" />
                              {ev.location}
                            </span>
                          )}

                          {ev.targetAudience && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold">{ev.targetAudience}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    {canManageEvents && (
                      <div className="flex items-center gap-1.5 self-end md:self-start pt-2 md:pt-0">
                        <button
                          onClick={() => handleOpenEditModal(ev)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-emerald-700 border border-slate-200 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(ev.id, ev.title)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
                          title="Delete Event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: OFFICIAL ZAMBIAN NATIONAL PUBLIC HOLIDAYS */}
      {activeView === "holidays" && (
        <div className="space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 font-serif">
                  Republic of Zambia Public Holidays (2026 Gazette)
                </h2>
                <p className="text-xs text-slate-500">
                  Official statutory national, commemorative, and religious holidays recognized by the Ministry of General Education.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {ZAMBIAN_HOLIDAYS_2026.map(holiday => (
                <div
                  key={holiday.id}
                  className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex items-start gap-3.5 transition-all hover:bg-white hover:border-amber-300 hover:shadow-2xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex flex-col items-center justify-center shrink-0 font-mono shadow-xs">
                    <span className="text-[9px] uppercase font-bold text-amber-100">
                      {new Date(holiday.date).toLocaleString("en-GB", { month: "short" })}
                    </span>
                    <span className="text-base font-bold leading-none mt-0.5">
                      {holiday.date.split("-")[2]}
                    </span>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{holiday.name}</h4>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                        {holiday.dayOfWeek}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {holiday.description}
                    </p>

                    <span className="inline-block text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {holiday.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EVENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">
                  {editingEvent ? "Edit School Event" : "Add Academic Event to Calendar"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inter-House Sports Day / Mock Examinations"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as EventCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-medium"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Examinations">Examinations & Mocks</option>
                    <option value="Sports & Culture">Sports & Culture</option>
                    <option value="PTA Meeting">PTA Meeting</option>
                    <option value="Term Dates">Term Dates</option>
                    <option value="Holiday">School Holiday</option>
                    <option value="National Holiday">National Holiday</option>
                    <option value="Religious & School Ceremony">School Ceremony</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Term *</label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-medium"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                    <option value="Holiday Period">Holiday Period</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800 font-medium"
                  >
                    <option value="All School">All School</option>
                    <option value="Primary Section">Primary Section</option>
                    <option value="Secondary Section">Secondary Section</option>
                    <option value="Exam Candidates (Grades 7, 9, 12)">Exam Candidates (Grades 7, 9, 12)</option>
                    <option value="Staff & Teachers">Staff & Teachers</option>
                    <option value="Parents & PTA">Parents & PTA</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time (e.g. 08:00 - 13:00)</label>
                  <input
                    type="text"
                    placeholder="08:00 AM - 14:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Venue</label>
                <input
                  type="text"
                  placeholder="e.g. Bread of Life Main Hall / Sports Grounds"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  placeholder="Detailed notes for pupils, teachers, or parents..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isImportant"
                  checked={formData.isImportant}
                  onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isImportant" className="font-semibold text-slate-700 text-xs cursor-pointer">
                  Mark as High Priority / Important School Milestone
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                >
                  {editingEvent ? "Save Changes" : "Publish Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
