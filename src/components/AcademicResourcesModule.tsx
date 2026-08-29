import { useState, FormEvent } from "react";
import {
  ClassStream,
  HomeworkTask,
  ExamSchedule,
  LibraryBook,
  TransportRoute,
  Student
} from "../types";
import {
  BookOpen,
  Calendar,
  Bus,
  Library,
  Plus,
  Clock,
  CheckCircle,
  FileText,
  Search,
  Phone,
  UserCheck,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  MapPin
} from "lucide-react";

interface AcademicResourcesModuleProps {
  classes: ClassStream[];
  students: Student[];
  homeworkTasks: HomeworkTask[];
  onAddHomework: (task: Omit<HomeworkTask, "id">) => void;
  onEditHomework?: (task: HomeworkTask) => void;
  onDeleteHomework?: (id: number) => void;
  examSchedules: ExamSchedule[];
  onAddExam?: (exam: Omit<ExamSchedule, "id">) => void;
  onEditExam?: (exam: ExamSchedule) => void;
  onDeleteExam?: (id: number) => void;
  libraryBooks: LibraryBook[];
  onAddBook?: (book: Omit<LibraryBook, "id">) => void;
  onEditBook?: (book: LibraryBook) => void;
  onDeleteBook?: (id: number) => void;
  transportRoutes: TransportRoute[];
  onAddRoute?: (route: Omit<TransportRoute, "id">) => void;
  onEditRoute?: (route: TransportRoute) => void;
  onDeleteRoute?: (id: number) => void;
  canManage: boolean; // teacher or admin
}

export function AcademicResourcesModule({
  classes,
  students,
  homeworkTasks,
  onAddHomework,
  onEditHomework,
  onDeleteHomework,
  examSchedules,
  onAddExam,
  onEditExam,
  onDeleteExam,
  libraryBooks,
  onAddBook,
  onEditBook,
  onDeleteBook,
  transportRoutes,
  onAddRoute,
  onEditRoute,
  onDeleteRoute,
  canManage
}: AcademicResourcesModuleProps) {
  const [subTab, setSubTab] = useState<"Homework" | "Exams" | "Library" | "Transport">("Homework");

  // Homework state
  const [showHwModal, setShowHwModal] = useState(false);
  const [editingHw, setEditingHw] = useState<HomeworkTask | null>(null);
  const [hwClassId, setHwClassId] = useState<number>(classes[0]?.id || 1);
  const [hwSubject, setHwSubject] = useState("Mathematics");
  const [hwTitle, setHwTitle] = useState("");
  const [hwDesc, setHwDesc] = useState("");
  const [hwDueDate, setHwDueDate] = useState("2026-06-05");
  const [completedHwIds, setCompletedHwIds] = useState<number[]>([]);

  // Exam state
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamSchedule | null>(null);
  const [examClassId, setExamClassId] = useState<number>(classes[0]?.id || 1);
  const [examSubject, setExamSubject] = useState("Mathematics");
  const [examDate, setExamDate] = useState("2026-06-15");
  const [examTime, setExamTime] = useState("08:30 - 10:30");
  const [examRoom, setExamRoom] = useState("Hall A");
  const [examPaperType, setExamPaperType] = useState<ExamSchedule["paperType"]>("Mid-Term Test");

  // Library state
  const [showBookModal, setShowBookModal] = useState(false);
  const [editingBook, setEditingBook] = useState<LibraryBook | null>(null);
  const [bookTitle, setBookTitle] = useState("");
  const [bookAuthor, setBookAuthor] = useState("");
  const [bookCategory, setBookCategory] = useState<LibraryBook["category"]>("Mathematics");
  const [bookTotal, setBookTotal] = useState(40);
  const [bookAvailable, setBookAvailable] = useState(35);
  const [bookQuery, setBookQuery] = useState("");

  // Transport state
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [routeName, setRouteName] = useState("");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("+260 ");
  const [busRegNo, setBusRegNo] = useState("ALB ");
  const [stopsText, setStopsText] = useState("Chelstone Roundabout (06:30), Munali Mall (06:50), Bread of Life Campus (07:15)");

  // HOMEWORK HANDLERS
  const handleOpenAddHw = () => {
    setEditingHw(null);
    setHwClassId(classes[0]?.id || 1);
    setHwSubject("Mathematics");
    setHwTitle("");
    setHwDesc("");
    setHwDueDate("2026-06-05");
    setShowHwModal(true);
  };

  const handleOpenEditHw = (task: HomeworkTask) => {
    setEditingHw(task);
    setHwClassId(task.classId);
    setHwSubject(task.subject);
    setHwTitle(task.title);
    setHwDesc(task.description);
    setHwDueDate(task.dueDate);
    setShowHwModal(true);
  };

  const handleHwSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!hwTitle.trim() || !hwDesc.trim()) return;

    if (editingHw) {
      onEditHomework?.({
        ...editingHw,
        classId: hwClassId,
        subject: hwSubject,
        title: hwTitle,
        description: hwDesc,
        dueDate: hwDueDate
      });
    } else {
      onAddHomework({
        classId: hwClassId,
        subject: hwSubject,
        title: hwTitle,
        description: hwDesc,
        dueDate: hwDueDate,
        assignedBy: "Class Teacher"
      });
    }
    setShowHwModal(false);
  };

  const toggleHwComplete = (id: number) => {
    setCompletedHwIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // EXAM HANDLERS
  const handleOpenAddExam = () => {
    setEditingExam(null);
    setExamClassId(classes[0]?.id || 1);
    setExamSubject("Mathematics");
    setExamDate("2026-06-15");
    setExamTime("08:30 - 10:30");
    setExamRoom("Hall A");
    setExamPaperType("Mid-Term Test");
    setShowExamModal(true);
  };

  const handleOpenEditExam = (exam: ExamSchedule) => {
    setEditingExam(exam);
    setExamClassId(exam.classId);
    setExamSubject(exam.subject);
    setExamDate(exam.date);
    setExamTime(exam.time);
    setExamRoom(exam.room);
    setExamPaperType(exam.paperType);
    setShowExamModal(true);
  };

  const handleExamSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (editingExam) {
      onEditExam?.({
        ...editingExam,
        classId: examClassId,
        subject: examSubject,
        date: examDate,
        time: examTime,
        room: examRoom,
        paperType: examPaperType
      });
    } else {
      onAddExam?.({
        classId: examClassId,
        subject: examSubject,
        date: examDate,
        time: examTime,
        room: examRoom,
        paperType: examPaperType
      });
    }
    setShowExamModal(false);
  };

  // LIBRARY HANDLERS
  const handleOpenAddBook = () => {
    setEditingBook(null);
    setBookTitle("");
    setBookAuthor("");
    setBookCategory("Mathematics");
    setBookTotal(40);
    setBookAvailable(35);
    setShowBookModal(true);
  };

  const handleOpenEditBook = (book: LibraryBook) => {
    setEditingBook(book);
    setBookTitle(book.title);
    setBookAuthor(book.author);
    setBookCategory(book.category);
    setBookTotal(book.totalCopies);
    setBookAvailable(book.availableCopies);
    setShowBookModal(true);
  };

  const handleBookSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!bookTitle.trim()) return;

    if (editingBook) {
      onEditBook?.({
        ...editingBook,
        title: bookTitle,
        author: bookAuthor,
        category: bookCategory,
        totalCopies: Number(bookTotal),
        availableCopies: Number(bookAvailable)
      });
    } else {
      onAddBook?.({
        title: bookTitle,
        author: bookAuthor,
        category: bookCategory,
        totalCopies: Number(bookTotal),
        availableCopies: Number(bookAvailable)
      });
    }
    setShowBookModal(false);
  };

  // TRANSPORT HANDLERS
  const handleOpenAddRoute = () => {
    setEditingRoute(null);
    setRouteName("Chelstone - Avondale - Campus");
    setDriverName("Mr. Mutale Phiri");
    setDriverPhone("+260 977 123456");
    setBusRegNo("ALB 4412");
    setStopsText("Chelstone (06:30), Avondale Roundabout (06:45), School Campus (07:15)");
    setShowRouteModal(true);
  };

  const handleOpenEditRoute = (route: TransportRoute) => {
    setEditingRoute(route);
    setRouteName(route.routeName || route.name || "");
    setDriverName(route.driverName);
    setDriverPhone(route.driverPhone);
    setBusRegNo(route.busRegNo || route.busNumber || "");
    setStopsText(
      route.stops
        .map(s => (typeof s === "string" ? s : `${s.name} (${s.time})`))
        .join(", ")
    );
    setShowRouteModal(true);
  };

  const handleRouteSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedStops = stopsText.split(",").map(part => {
      const trimmed = part.trim();
      const match = trimmed.match(/(.+)\s*\((.+)\)/);
      if (match) {
        return { name: match[1].trim(), time: match[2].trim() };
      }
      return { name: trimmed, time: "07:00" };
    });

    if (editingRoute) {
      onEditRoute?.({
        ...editingRoute,
        routeName,
        driverName,
        driverPhone,
        busRegNo,
        stops: parsedStops
      });
    } else {
      onAddRoute?.({
        routeName,
        driverName,
        driverPhone,
        busRegNo,
        stops: parsedStops
      });
    }
    setShowRouteModal(false);
  };

  const filteredBooks = libraryBooks.filter(b =>
    b.title.toLowerCase().includes(bookQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(bookQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(bookQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Sub-tab selection bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-700" />
              Academic Resources & Services
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              Curriculum Hub
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage homework exercises, examination schedules, library textbooks catalog, and school bus routes.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setSubTab("Homework")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "Homework"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Homework ({homeworkTasks.length})</span>
          </button>

          <button
            onClick={() => setSubTab("Exams")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "Exams"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Exams ({examSchedules.length})</span>
          </button>

          <button
            onClick={() => setSubTab("Library")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "Library"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Library className="w-4 h-4" />
            <span>Library ({libraryBooks.length})</span>
          </button>

          <button
            onClick={() => setSubTab("Transport")}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              subTab === "Transport"
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bus className="w-4 h-4" />
            <span>Bus Routes ({transportRoutes.length})</span>
          </button>
        </div>
      </div>

      {/* 1. HOMEWORK SUB-TAB */}
      {subTab === "Homework" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-serif">
              Assigned Homework & Revision Exercises
            </h3>
            {canManage && (
              <button
                onClick={handleOpenAddHw}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Assign New Homework</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {homeworkTasks.map((task) => {
              const cls = classes.find(c => c.id === task.classId);
              const isDone = completedHwIds.includes(task.id);

              return (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all bg-white shadow-2xs space-y-3 ${
                    isDone ? "border-emerald-300 bg-emerald-50/30" : "border-slate-200 hover:border-emerald-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {task.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {cls ? cls.name : "Class Stream"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleHwComplete(task.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isDone
                            ? "bg-emerald-700 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {isDone ? "Completed" : "Mark Done"}
                      </button>

                      {canManage && (
                        <>
                          <button
                            onClick={() => handleOpenEditHw(task)}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded-md hover:bg-slate-100 cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onDeleteHomework && (
                            <button
                              onClick={() => {
                                if (window.confirm("Remove this homework task?")) {
                                  onDeleteHomework(task.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 cursor-pointer"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{task.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1 font-mono font-medium">
                      <Clock className="w-3.5 h-3.5 text-emerald-700" />
                      Due Date: <strong className="text-slate-800">{task.dueDate}</strong>
                    </span>
                    <span>Assigned by: {task.assignedBy}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. EXAM TIMETABLE SUB-TAB */}
      {subTab === "Exams" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">
                Mid-Term & Final Examination Schedules
              </h3>
              <p className="text-xs text-slate-500">Official timetable for Grade 1 through Form 4 school assessments</p>
            </div>

            {canManage && (
              <button
                onClick={handleOpenAddExam}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exam Schedule</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3.5">Examination Date</th>
                  <th className="py-3 px-3.5">Time Slot</th>
                  <th className="py-3 px-3.5">Class / Stream</th>
                  <th className="py-3 px-3.5">Subject</th>
                  <th className="py-3 px-3.5">Paper Category</th>
                  <th className="py-3 px-3.5">Exam Hall</th>
                  {canManage && <th className="py-3 px-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {examSchedules.map((exam) => {
                  const cls = classes.find(c => c.id === exam.classId);
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3.5 font-mono font-bold text-slate-900">{exam.date}</td>
                      <td className="py-3.5 px-3.5 text-slate-600 font-mono">{exam.time}</td>
                      <td className="py-3.5 px-3.5 font-bold text-slate-800">{cls?.name || "All Grades"}</td>
                      <td className="py-3.5 px-3.5 font-bold text-emerald-800">{exam.subject}</td>
                      <td className="py-3.5 px-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          {exam.paperType}
                        </span>
                      </td>
                      <td className="py-3.5 px-3.5 text-slate-600">{exam.room}</td>
                      {canManage && (
                        <td className="py-3.5 px-3.5 text-right space-x-1">
                          <button
                            onClick={() => handleOpenEditExam(exam)}
                            className="p-1 text-slate-400 hover:text-emerald-700 rounded-md hover:bg-slate-100 cursor-pointer"
                            title="Edit exam"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline" />
                          </button>
                          {onDeleteExam && (
                            <button
                              onClick={() => {
                                if (window.confirm("Remove this exam schedule?")) {
                                  onDeleteExam(exam.id);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 cursor-pointer"
                              title="Delete exam"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. LIBRARY SUB-TAB */}
      {subTab === "Library" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-serif">
                Bread of Life School Library Catalog
              </h3>
              <p className="text-xs text-slate-500">Browse and manage textbooks, readers & syllabus references</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search title, author, category..."
                  value={bookQuery}
                  onChange={(e) => setBookQuery(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden w-64"
                />
              </div>

              {canManage && (
                <button
                  onClick={handleOpenAddBook}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Library Book</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200 uppercase">
                      {book.category}
                    </span>
                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditBook(book)}
                          className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                          title="Edit book"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteBook && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete "${book.title}" from library?`)) {
                                onDeleteBook(book.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete book"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight mt-2">{book.title}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">Author: {book.author}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-600">Total: {book.totalCopies}</span>
                  <span className="font-bold text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {book.availableCopies} Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. TRANSPORT SUB-TAB */}
      {subTab === "Transport" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 font-serif">
              School Bus Routes & Transport Logistics
            </h3>
            {canManage && (
              <button
                onClick={handleOpenAddRoute}
                className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Bus Route</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transportRoutes.map((route) => (
              <div key={route.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 hover:border-emerald-400 transition-all">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{route.routeName}</h4>
                    <p className="text-xs text-emerald-800 font-mono font-bold">Bus Reg: {route.busRegNo}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bus className="w-5 h-5 text-emerald-700" />
                    {canManage && (
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => handleOpenEditRoute(route)}
                          className="p-1 text-slate-400 hover:text-emerald-700 cursor-pointer"
                          title="Edit route"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {onDeleteRoute && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete route "${route.routeName}"?`)) {
                                onDeleteRoute(route.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-700">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Driver: <strong>{route.driverName}</strong></span>
                  <span className="text-slate-300">|</span>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{route.driverPhone}</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block">Pickup Schedule & Stops</span>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                    {route.stops.map((stop, idx) => {
                      const stopName = typeof stop === "string" ? stop : stop.name;
                      const stopTime = typeof stop === "string" ? "Scheduled" : stop.time;
                      return (
                        <div key={idx} className="flex justify-between items-center text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {stopName}
                          </span>
                          <span className="font-mono font-bold text-emerald-800">{stopTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* Homework Modal */}
      {showHwModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                {editingHw ? "Edit Homework Task" : "Assign New Homework Task"}
              </h3>
              <button onClick={() => setShowHwModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleHwSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Class Stream</label>
                <select
                  value={hwClassId}
                  onChange={(e) => setHwClassId(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Subject</label>
                <input
                  type="text"
                  required
                  value={hwSubject}
                  onChange={(e) => setHwSubject(e.target.value)}
                  placeholder="e.g. Mathematics, English Language, Physics"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Homework Title</label>
                <input
                  type="text"
                  required
                  value={hwTitle}
                  onChange={(e) => setHwTitle(e.target.value)}
                  placeholder="e.g. Fractions and Ratios Practice"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Instructions / Description</label>
                <textarea
                  rows={3}
                  required
                  value={hwDesc}
                  onChange={(e) => setHwDesc(e.target.value)}
                  placeholder="Detailed instructions for pupils..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Due Date</label>
                <input
                  type="date"
                  required
                  value={hwDueDate}
                  onChange={(e) => setHwDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowHwModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  {editingHw ? "Update Task" : "Post Homework"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                {editingExam ? "Edit Examination Schedule" : "Add Examination Schedule"}
              </h3>
              <button onClick={() => setShowExamModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Class / Grade Stream</label>
                <select
                  value={examClassId}
                  onChange={(e) => setExamClassId(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={examSubject}
                  onChange={(e) => setExamSubject(e.target.value)}
                  placeholder="e.g. Mathematics Paper 1"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Time Slot</label>
                  <input
                    type="text"
                    required
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    placeholder="08:30 - 10:30"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Exam Hall / Room</label>
                  <input
                    type="text"
                    required
                    value={examRoom}
                    onChange={(e) => setExamRoom(e.target.value)}
                    placeholder="Hall A or Science Lab"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Paper Category</label>
                  <select
                    value={examPaperType}
                    onChange={(e) => setExamPaperType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  >
                    <option value="Mid-Term Test">Mid-Term Test</option>
                    <option value="Mock Examination">Mock Examination</option>
                    <option value="End-of-Term Assessment">End-of-Term Assessment</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowExamModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  {editingExam ? "Update Schedule" : "Add Exam"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Library Book Modal */}
      {showBookModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <Library className="w-4 h-4 text-emerald-700" />
                {editingBook ? "Edit Library Book" : "Add Book to Catalog"}
              </h3>
              <button onClick={() => setShowBookModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Book Title *</label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. Senior Secondary Mathematics Book 10"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Author / Publisher</label>
                <input
                  type="text"
                  required
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="e.g. MOE / Longman Zambia"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Category</label>
                <select
                  value={bookCategory}
                  onChange={(e) => setBookCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English & Reading">English & Reading</option>
                  <option value="Science & Nature">Science & Nature</option>
                  <option value="Zambian History & Social">Zambian History & Social</option>
                  <option value="Reference & Dictionary">Reference & Dictionary</option>
                  <option value="Story Books">Story Books</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bookTotal}
                    onChange={(e) => setBookTotal(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Available Copies</label>
                  <input
                    type="number"
                    min="0"
                    max={bookTotal}
                    required
                    value={bookAvailable}
                    onChange={(e) => setBookAvailable(parseInt(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  {editingBook ? "Update Book" : "Add to Library"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transport Route Modal */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-700" />
                {editingRoute ? "Edit Transport Route" : "Add School Bus Route"}
              </h3>
              <button onClick={() => setShowRouteModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRouteSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Route Name *</label>
                <input
                  type="text"
                  required
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="e.g. Chelstone - Munali - School"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Driver Name</label>
                  <input
                    type="text"
                    required
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Mr. Mutale Phiri"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Bus Registration No</label>
                  <input
                    type="text"
                    required
                    value={busRegNo}
                    onChange={(e) => setBusRegNo(e.target.value)}
                    placeholder="e.g. ALB 4412"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Driver Phone Number</label>
                <input
                  type="text"
                  required
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  placeholder="+260 977 123456"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Stops & Times (comma separated)</label>
                <textarea
                  rows={3}
                  required
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  placeholder="Chelstone (06:30), Munali Mall (06:50), Campus (07:15)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: Stop Name (HH:MM), Next Stop (HH:MM)</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs cursor-pointer shadow-sm"
                >
                  {editingRoute ? "Update Route" : "Add Bus Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
