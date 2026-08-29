import React, { useState, FormEvent } from "react";
import { UserMessage, SchoolEvent, UserSession, EventCategory } from "../types";
import {
  MessageSquare,
  Bell,
  Send,
  CheckCircle2,
  Search,
  Mail,
  Plus,
  Edit2,
  Trash2,
  X,
  Calendar,
  AlertCircle
} from "lucide-react";

interface CommunicationModuleProps {
  session: UserSession;
  messages: UserMessage[];
  events: SchoolEvent[];
  onSendMessage: (to: string, subject: string, body: string) => void;
  onAddEvent?: (event: Omit<SchoolEvent, "id">) => void;
  onUpdateEvent?: (event: SchoolEvent) => void;
  onDeleteEvent?: (id: number) => void;
  defaultView?: "messages" | "announcements";
}

export function CommunicationModule({
  session,
  messages,
  events,
  onSendMessage,
  onAddEvent,
  onUpdateEvent,
  onDeleteEvent,
  defaultView = "messages"
}: CommunicationModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<"messages" | "announcements">(defaultView);
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [sentNotice, setSentNotice] = useState(false);

  // Announcement modal state
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<SchoolEvent | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("2026-06-10");
  const [eventCategory, setEventCategory] = useState<EventCategory>("Academic");
  const [eventTarget, setEventTarget] = useState<SchoolEvent["targetAudience"]>("All School");
  const [eventDesc, setEventDesc] = useState("");
  const [eventIsImportant, setEventIsImportant] = useState(false);

  const isRoleAdmin = session.role === "admin";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!recipient.trim() || !subject.trim() || !body.trim()) return;

    onSendMessage(recipient, subject, body);
    setRecipient("");
    setSubject("");
    setBody("");
    setSentNotice(true);
    setTimeout(() => setSentNotice(false), 3500);
  };

  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEventTitle("");
    setEventDate("2026-06-10");
    setEventCategory("Academic");
    setEventTarget("All School");
    setEventDesc("");
    setEventIsImportant(false);
    setShowEventModal(true);
  };

  const handleOpenEditEvent = (ev: SchoolEvent) => {
    setEditingEvent(ev);
    setEventTitle(ev.title);
    setEventDate(ev.date);
    setEventCategory(ev.category);
    setEventTarget(ev.targetAudience || "All School");
    setEventDesc(ev.description);
    setEventIsImportant(!!ev.isImportant);
    setShowEventModal(true);
  };

  const handleEventSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDesc.trim()) return;

    if (editingEvent) {
      onUpdateEvent?.({
        ...editingEvent,
        title: eventTitle,
        date: eventDate,
        category: eventCategory,
        targetAudience: eventTarget,
        description: eventDesc,
        isImportant: eventIsImportant
      });
    } else {
      onAddEvent?.({
        title: eventTitle,
        date: eventDate,
        category: eventCategory,
        targetAudience: eventTarget,
        description: eventDesc,
        isImportant: eventIsImportant
      });
    }
    setShowEventModal(false);
  };

  const filteredMessages = messages.filter(m =>
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.fromName.toLowerCase().includes(search.toLowerCase()) ||
    m.toName.toLowerCase().includes(search.toLowerCase()) ||
    m.body.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Header Bar with Subtab navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900">
              School Communication & Notice Board
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Official Messages
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official messaging between administrators, class teachers, guardians, and pupils
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setActiveSubTab("messages")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "messages"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages ({messages.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("announcements")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "announcements"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Circulars & Notices ({events.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === "messages" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Compose Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-serif">
              <Send className="w-4 h-4 text-emerald-700" />
              Compose Message / Parent Notice
            </h2>

            {sentNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-center font-bold flex items-center justify-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Message dispatched successfully!</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">To Recipient</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mr. Davison Banda or Class Teacher"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Term 2 Progress Consultation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write clear message details..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Inbox Stream */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-serif">
                <Mail className="w-4 h-4 text-emerald-700" />
                Inbox & Dialogue History
              </h2>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 pr-3.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-emerald-600 w-full sm:w-56"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredMessages.map(msg => (
                <div key={msg.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs">{msg.fromName}</span>
                      <span className="text-slate-400 text-[10px]">→ {msg.toName}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500">
                      {msg.date}
                    </span>
                  </div>
                  <p className="font-bold text-slate-800 text-xs">{msg.subject}</p>
                  <p className="text-slate-600 text-xs leading-relaxed">{msg.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "announcements" && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 font-serif flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-700" />
              Official Circulars & School Notices
            </h2>

            {isRoleAdmin && (
              <button
                onClick={handleOpenAddEvent}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Post New Notice</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {events.map(ev => (
              <div key={ev.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 hover:border-emerald-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {ev.category}
                    </span>
                    {ev.targetAudience && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
                        {ev.targetAudience}
                      </span>
                    )}
                    {ev.isImportant && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Important
                      </span>
                    )}
                    <h3 className="font-bold text-slate-900 text-sm ml-1">{ev.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      {ev.date}
                    </span>

                    {isRoleAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditEvent(ev)}
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded-md hover:bg-slate-100 cursor-pointer"
                          title="Edit circular"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteEvent && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete notice "${ev.title}"?`)) {
                                onDeleteEvent(ev.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 cursor-pointer"
                            title="Delete notice"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed">{ev.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notice / Circular Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-700" />
                {editingEvent ? "Edit Circular Notice" : "Post Official Circular Notice"}
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Notice Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Term 2 General PTA Meeting"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category</label>
                  <select
                    value={eventCategory}
                    onChange={(e) => setEventCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="Academic">Academic</option>
                    <option value="PTA Meeting">PTA Meeting</option>
                    <option value="Examinations">Examinations</option>
                    <option value="Term Dates">Term Dates</option>
                    <option value="Sports & Culture">Sports & Culture</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Religious & School Ceremony">Religious & School Ceremony</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Event / Notice Date</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Target Audience</label>
                <select
                  value={eventTarget}
                  onChange={(e) => setEventTarget(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="All School">All School (Pupils, Staff & Parents)</option>
                  <option value="Primary Section">Primary Section (Grades 1-7)</option>
                  <option value="Secondary Section">Secondary Section (Forms 1-4)</option>
                  <option value="Parents & PTA">Parents & Guardians</option>
                  <option value="Staff & Teachers">Staff & Teachers</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Notice Content / Instructions *</label>
                <textarea
                  rows={4}
                  required
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="Details of the circular..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="importantCheck"
                  checked={eventIsImportant}
                  onChange={(e) => setEventIsImportant(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                <label htmlFor="importantCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Mark as High Priority / Urgent Notice
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  {editingEvent ? "Save Notice" : "Publish Notice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
