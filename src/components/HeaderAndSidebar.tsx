import React from "react";
import { UserSession, SchoolProfile } from "../types";
import { SCHOOL_NAME } from "../data/zambianSchoolData";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calculator,
  CheckSquare,
  FileText,
  DollarSign,
  Calendar,
  CalendarDays,
  MessageSquare,
  Bell,
  LogOut,
  Shield,
  FolderKanban,
  Share2,
  X,
  GraduationCap,
  Building2,
  Settings,
  BookOpen,
  Package,
  ShieldAlert,
  Bed,
  Bus,
  BarChart3,
  Lock,
  HelpCircle,
  Receipt,
  FileSpreadsheet
} from "lucide-react";

interface HeaderAndSidebarProps {
  session: UserSession;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  unreadCount: number;
  schoolProfile?: SchoolProfile;
  onOpenShareModal?: () => void;
  onOpenProfileModal?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavSection {
  title?: string;
  items: {
    id: string;
    label: string;
    icon: any;
    badge?: number;
  }[];
}

export function HeaderAndSidebar({
  session,
  activeTab,
  onTabChange,
  onLogout,
  unreadCount,
  schoolProfile,
  onOpenShareModal,
  onOpenProfileModal,
  mobileOpen = false,
  onCloseMobile
}: HeaderAndSidebarProps) {
  const getNavSections = (): NavSection[] => {
    const role = session.role;

    // Super Admin & School Admin
    if (role === "super_admin" || role === "school_admin" || role === "admin") {
      return [
        {
          title: "Executive Overview",
          items: [
            { id: "Dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
            { id: "Reports", label: "Reports & Analytics", icon: BarChart3 },
            { id: "AcademicCalendar", label: "School Calendar", icon: CalendarDays }
          ]
        },
        {
          title: "Pupils & Academic Structure",
          items: [
            { id: "Students", label: "Pupil Admissions & Rosters", icon: Users },
            { id: "SecondaryPathways", label: "Secondary & Pathways", icon: GraduationCap },
            { id: "Teachers", label: "Staff & Faculty Roster", icon: UserCheck },
            { id: "Timetable", label: "Master Timetable", icon: Calendar }
          ]
        },
        {
          title: "Examinations & Finance",
          items: [
            { id: "Grading", label: "Continuous Assessment", icon: Calculator },
            { id: "Attendance", label: "Daily Attendance", icon: CheckSquare },
            { id: "ReportCards", label: "Termly Report Cards", icon: FileText },
            { id: "Fees", label: "Fees & Kwacha Accounts", icon: DollarSign }
          ]
        },
        {
          title: "Campus Facilities & Life",
          items: [
            { id: "Library", label: "Library & Textbooks", icon: BookOpen },
            { id: "Inventory", label: "Assets & Inventory", icon: Package },
            { id: "Discipline", label: "Conduct & Discipline", icon: ShieldAlert },
            { id: "Hostel", label: "Hostel & Boarding", icon: Bed },
            { id: "Transport", label: "School Transport Fleet", icon: Bus }
          ]
        },
        {
          title: "Communication & Notices",
          items: [
            { id: "Messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "School Notice Board", icon: Bell },
            { id: "AcademicResources", label: "Homework & Syllabus", icon: FolderKanban }
          ]
        },
        {
          title: "System & Governance",
          items: [
            { id: "AuditSecurity", label: "Security & Audit Logs", icon: Lock },
            { id: "SchoolSettings", label: "School Setup & Config", icon: Building2 },
            { id: "Documentation", label: "System Documentation", icon: HelpCircle }
          ]
        }
      ];
    }

    // Head Teacher / Headmaster
    if (role === "head_teacher") {
      return [
        {
          title: "Academic Leadership",
          items: [
            { id: "Dashboard", label: "Executive Dashboard", icon: LayoutDashboard },
            { id: "ReportCards", label: "Report Card Approvals", icon: FileText },
            { id: "Reports", label: "Academic Reports", icon: BarChart3 },
            { id: "Students", label: "Student Registers", icon: Users },
            { id: "Teachers", label: "Staff & Faculty", icon: UserCheck }
          ]
        },
        {
          title: "Curriculum & Standards",
          items: [
            { id: "Grading", label: "Continuous Assessment", icon: Calculator },
            { id: "Attendance", label: "Attendance Monitoring", icon: CheckSquare },
            { id: "SecondaryPathways", label: "Secondary Pathways", icon: GraduationCap },
            { id: "Timetable", label: "Master Timetable", icon: Calendar },
            { id: "AcademicCalendar", label: "School Calendar", icon: CalendarDays }
          ]
        },
        {
          title: "Campus Operations",
          items: [
            { id: "Discipline", label: "Discipline & Conduct", icon: ShieldAlert },
            { id: "Fees", label: "Fee Collection Overview", icon: DollarSign },
            { id: "Library", label: "Library Resources", icon: BookOpen },
            { id: "Hostel", label: "Boarding Halls", icon: Bed },
            { id: "Messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "Notice Board", icon: Bell },
            { id: "Documentation", label: "Documentation", icon: HelpCircle }
          ]
        }
      ];
    }

    // Deputy Head Teacher
    if (role === "deputy_head") {
      return [
        {
          title: "Academic Operations",
          items: [
            { id: "Dashboard", label: "Operations Dashboard", icon: LayoutDashboard },
            { id: "Timetable", label: "Master Timetable", icon: Calendar },
            { id: "Students", label: "Pupil Allocations", icon: Users },
            { id: "Grading", label: "CA & Examination Marks", icon: Calculator },
            { id: "Attendance", label: "Attendance Registers", icon: CheckSquare },
            { id: "ReportCards", label: "Termly Report Cards", icon: FileText }
          ]
        },
        {
          title: "Curriculum & Conduct",
          items: [
            { id: "SecondaryPathways", label: "Secondary Pathways", icon: GraduationCap },
            { id: "Discipline", label: "Disciplinary Incidents", icon: ShieldAlert },
            { id: "Teachers", label: "Teaching Faculty", icon: UserCheck },
            { id: "AcademicCalendar", label: "Term Dates", icon: CalendarDays },
            { id: "Messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "Notice Board", icon: Bell }
          ]
        }
      ];
    }

    // Teacher
    if (role === "teacher") {
      return [
        {
          title: "Classroom Teaching",
          items: [
            { id: "Students", label: "Pupils & Class Roster", icon: Users },
            { id: "Grading", label: "Marks & CA Entry", icon: Calculator },
            { id: "Attendance", label: "Daily Class Register", icon: CheckSquare },
            { id: "ReportCards", label: "Termly Report Cards", icon: FileText },
            { id: "SecondaryPathways", label: "Secondary & Pathways", icon: GraduationCap }
          ]
        },
        {
          title: "Curriculum & Campus",
          items: [
            { id: "Timetable", label: "Class Timetable", icon: Calendar },
            { id: "AcademicResources", label: "Homework & Syllabi", icon: FolderKanban },
            { id: "Library", label: "Library Catalog & Loans", icon: BookOpen },
            { id: "Discipline", label: "Record Disciplinary Issue", icon: ShieldAlert },
            { id: "AcademicCalendar", label: "Academic Calendar", icon: CalendarDays }
          ]
        },
        {
          title: "Communication",
          items: [
            { id: "Messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "Notice Board", icon: Bell }
          ]
        }
      ];
    }

    // Accountant / Bursar
    if (role === "accountant") {
      return [
        {
          title: "Accounts & Bursar",
          items: [
            { id: "Fees", label: "Fee Invoicing & Payments", icon: DollarSign },
            { id: "Reports", label: "Financial Reports & Ledger", icon: BarChart3 },
            { id: "Students", label: "Student Directory", icon: Users },
            { id: "Inventory", label: "Fixed Asset Register", icon: Package }
          ]
        },
        {
          title: "Communication & Audit",
          items: [
            { id: "AuditSecurity", label: "Financial Audit Trail", icon: Lock },
            { id: "Messages", label: "Parent Billing Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "School Notices", icon: Bell },
            { id: "AcademicCalendar", label: "Term Dates", icon: CalendarDays }
          ]
        }
      ];
    }

    // Secretary
    if (role === "secretary") {
      return [
        {
          title: "Front Office & Registry",
          items: [
            { id: "Students", label: "Pupil Admissions & Records", icon: Users },
            { id: "Teachers", label: "Staff Directory", icon: UserCheck },
            { id: "AcademicCalendar", label: "School Calendar & Events", icon: CalendarDays },
            { id: "Announcements", label: "School Notice Board", icon: Bell },
            { id: "Messages", label: "Inquiries & Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Transport", label: "Bus Route Information", icon: Bus }
          ]
        }
      ];
    }

    // Librarian
    if (role === "librarian") {
      return [
        {
          title: "Library Resource Centre",
          items: [
            { id: "Library", label: "Book Catalog & Circulation", icon: BookOpen },
            { id: "AcademicResources", label: "Academic Resources", icon: FolderKanban },
            { id: "Students", label: "Pupil Directory", icon: Users },
            { id: "Teachers", label: "Teacher Directory", icon: UserCheck },
            { id: "Messages", label: "Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "Notice Board", icon: Bell }
          ]
        }
      ];
    }

    // Parent / Guardian
    if (role === "parent") {
      return [
        {
          title: "Pupil Progress",
          items: [
            { id: "ReportCards", label: "Termly Report Cards", icon: FileText },
            { id: "Grading", label: "Continuous Assessment", icon: Calculator },
            { id: "SecondaryPathways", label: "Secondary Pathway", icon: GraduationCap },
            { id: "Attendance", label: "Attendance Record", icon: CheckSquare }
          ]
        },
        {
          title: "Finance & Campus",
          items: [
            { id: "Fees", label: "Fee Statements & Receipts", icon: DollarSign },
            { id: "AcademicResources", label: "Homework & Syllabus", icon: FolderKanban },
            { id: "Timetable", label: "Class Timetable", icon: Calendar },
            { id: "Hostel", label: "Boarding Hall Info", icon: Bed },
            { id: "Transport", label: "Bus Route Info", icon: Bus },
            { id: "AcademicCalendar", label: "Term Calendar", icon: CalendarDays }
          ]
        },
        {
          title: "School Notices",
          items: [
            { id: "Messages", label: "Teacher Messages", icon: MessageSquare, badge: unreadCount },
            { id: "Announcements", label: "School Notices", icon: Bell }
          ]
        }
      ];
    }

    // Student / Learner
    return [
      {
        title: "My Academics",
        items: [
          { id: "ReportCards", label: "My Report Card", icon: FileText },
          { id: "Grading", label: "Marks & Assessments", icon: Calculator },
          { id: "SecondaryPathways", label: "My Secondary Pathway", icon: GraduationCap },
          { id: "Attendance", label: "My Attendance", icon: CheckSquare }
        ]
      },
      {
        title: "Class Schedule & Campus",
        items: [
          { id: "Timetable", label: "Weekly Timetable", icon: Calendar },
          { id: "AcademicResources", label: "Homework & Tasks", icon: FolderKanban },
          { id: "Library", label: "Library Catalog & Books", icon: BookOpen },
          { id: "Hostel", label: "My Boarding Dormitory", icon: Bed },
          { id: "Transport", label: "My Bus Route", icon: Bus },
          { id: "Fees", label: "Fee Balance Status", icon: DollarSign },
          { id: "AcademicCalendar", label: "School Calendar", icon: CalendarDays },
          { id: "Announcements", label: "School Notices", icon: Bell }
        ]
      }
    ];
  };

  const sections = getNavSections();

  const getPortalLabel = () => {
    const role = session.role;
    if (role === "super_admin") return "Super Administrator";
    if (role === "school_admin" || role === "admin") return "School Administrator";
    if (role === "head_teacher") return "Head Teacher / Headmaster";
    if (role === "deputy_head") return "Deputy Head Teacher";
    if (role === "accountant") return "Senior Bursar / Accountant";
    if (role === "secretary") return "Executive Secretary";
    if (role === "librarian") return "Chief Librarian";
    if (role === "teacher") return session.teacher ? session.teacher.name : "Faculty Teacher";
    if (role === "parent") return session.parent ? session.parent.name : "Parent / Guardian";
    if (role === "student") return session.student ? session.student.name : "Registered Pupil";
    return "Authorized User";
  };

  const getRoleBadge = () => {
    const role = session.role;
    if (role === "super_admin") return "Super Admin";
    if (role === "school_admin" || role === "admin") return "School Admin";
    if (role === "head_teacher") return "Headmaster";
    if (role === "deputy_head") return "Deputy Head";
    if (role === "accountant") return "Bursar";
    if (role === "secretary") return "Secretary";
    if (role === "librarian") return "Librarian";
    if (role === "teacher") return "Teacher";
    if (role === "parent") return "Parent";
    return "Pupil";
  };

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 font-sans min-h-screen transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-4">
          {/* School Emblem & Header */}
          <div className="flex items-center justify-between px-1 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              {schoolProfile?.logoUrl ? (
                <img
                  src={schoolProfile.logoUrl}
                  alt={schoolProfile.name || "School Logo"}
                  className="w-9 h-9 rounded-lg object-cover border border-emerald-500 shadow-xs shrink-0 bg-white"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-serif font-bold text-base shadow-xs shrink-0">
                  {(schoolProfile?.name || SCHOOL_NAME).charAt(0) || "R"}
                </div>
              )}
              <div className="min-w-0">
                <h1 className="font-bold text-white text-xs truncate font-serif">
                  {schoolProfile?.name || SCHOOL_NAME}
                </h1>
                <p className="text-[10px] text-emerald-400 font-mono font-medium truncate">
                  ECZ Centre: {schoolProfile?.examinationCenterCode || "26010045"}
                </p>
              </div>
            </div>

            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* User Session Profile Badge */}
          <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-white truncate">
                <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{getPortalLabel()}</span>
              </div>
              {onOpenProfileModal && (
                <button
                  type="button"
                  onClick={onOpenProfileModal}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 hover:underline shrink-0 cursor-pointer font-medium"
                  title="Edit My Profile & Password"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                {getRoleBadge()}
              </span>
              <span className="text-emerald-400">Term 2, 2026</span>
            </div>
          </div>

          {/* Categorized Navigation */}
          <nav className="space-y-4 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 text-xs">
            {sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {section.title && (
                  <div className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                    {section.title}
                  </div>
                )}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSelectTab(item.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg font-medium transition-colors text-left cursor-pointer ${
                          isActive
                            ? "bg-emerald-700 text-white font-semibold shadow-xs"
                            : "text-slate-300 hover:text-white hover:bg-slate-800/70"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
                          <span className="truncate text-xs">{item.label}</span>
                        </div>
                        {item.badge ? (
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full font-mono ${
                            isActive ? "bg-white text-emerald-900" : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          }`}>
                            {item.badge}
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 space-y-1">
          {onOpenProfileModal && (
            <button
              onClick={onOpenProfileModal}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>My Profile & Password</span>
            </button>
          )}

          {session.role === "super_admin" && onOpenShareModal && (
            <button
              onClick={onOpenShareModal}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-300 hover:text-white hover:bg-slate-800 border border-emerald-900/60 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal Direct Links</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Share</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
