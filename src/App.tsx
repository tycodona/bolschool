import { useState, useEffect, useMemo } from "react";
import { testFirestoreConnection } from "./firebase";
import {
  saveSchoolProfileToFirestore,
  saveStudentToFirestore,
  deleteStudentFromFirestore,
  saveTeacherToFirestore,
  deleteTeacherFromFirestore,
  saveClassToFirestore,
  deleteClassFromFirestore,
  saveFeeToFirestore,
  deleteFeeFromFirestore,
  saveEventToFirestore,
  deleteEventFromFirestore,
  saveMessageToFirestore,
  saveGradebookToFirestore,
  saveAttendanceToFirestore,
  subscribeToRealtimeSchoolData,
  syncEntireDatasetToFirestore,
  loadEntireDatasetFromFirestore,
  ensureInitialFirestoreData,
  mergeItemsById
} from "./services/firestoreService";
import {
  UserSession,
  Student,
  Teacher,
  ClassStream,
  GradebookData,
  AttendanceRecord,
  TermlyReportCard,
  FeeItem,
  UserMessage,
  SchoolEvent,
  HomeworkTask,
  ExamSchedule,
  LibraryBook,
  TransportRoute,
  RoleType,
  AcademicBatch,
  SubjectDefinition,
  ReportPublishStatus,
  TermResultsApproval,
  SchoolProfile,
  TimetablePeriod,
  StaffMember,
  DisciplineRecord,
  InventoryItem,
  HostelDormitory,
  HostelAllocation,
  PaymentReceipt,
  LibraryCheckout,
  AuditLogEntry,
  TransportVehicle,
  TransportPupilAssignment,
  ClassSubject,
  SecondaryPathwayInfo
} from "./types";
import {
  initialStudents,
  initialTeachers,
  initialClasses,
  initialBatches,
  initialSubjectsCatalog,
  initialParentAccounts,
  buildDefaultGradebook,
  initialTermlyReports,
  initialResultsApprovals,
  initialFees,
  initialEvents,
  initialMessages,
  initialHomework,
  initialExams,
  initialBooks,
  initialRoutes,
  initialSchoolProfile,
  initialTimetableData,
  initialStaffData,
  initialDisciplineData,
  initialInventoryData,
  initialHostelData,
  initialHostelAllocations,
  initialReceiptsData,
  initialLibraryCheckouts,
  initialAuditLogs,
  initialTransportData,
  initialTransportPupils,
  SECONDARY_PATHWAYS
} from "./data/zambianSchoolData";

import { LoginScreen } from "./components/LoginScreen";
import { HeaderAndSidebar } from "./components/HeaderAndSidebar";
import { DashboardModule } from "./components/DashboardModule";
import { AcademicCalendarModule } from "./components/AcademicCalendarModule";
import { GradingModule } from "./components/GradingModule";
import { AttendanceModule } from "./components/AttendanceModule";
import { ReportCardModule } from "./components/ReportCardModule";
import { SecondaryPathwaysModule } from "./components/SecondaryPathwaysModule";
import { StudentManagement } from "./components/StudentManagement";
import { StaffModule } from "./components/StaffModule";
import { FeeManagement } from "./components/FeeManagement";
import { AcademicResourcesModule } from "./components/AcademicResourcesModule";
import { TimetableModule } from "./components/TimetableModule";
import { CommunicationModule } from "./components/CommunicationModule";
import { SchoolSettingsModule } from "./components/SchoolSettingsModule";
import { LibraryManagementModule } from "./components/LibraryManagementModule";
import { InventoryManagementModule } from "./components/InventoryManagementModule";
import { DisciplineManagementModule } from "./components/DisciplineManagementModule";
import { HostelBoardingModule } from "./components/HostelBoardingModule";
import { TransportManagementModule } from "./components/TransportManagementModule";
import { ReportsModule } from "./components/ReportsModule";
import { AuditLogSecurityModule } from "./components/AuditLogSecurityModule";
import { DocumentationModule } from "./components/DocumentationModule";
import { ShareLinksModal } from "./components/ShareLinksModal";
import { UserProfileModal } from "./components/UserProfileModal";

import {
  parseCurrentRoute,
  updateBrowserUrl,
  resolveSessionFromRoute,
  buildPortalUrl,
  copyToClipboard
} from "./utils/urlRouter";

import {
  Share2,
  Copy,
  Check,
  Menu,
  CheckCircle2,
  Database,
  RefreshCw,
  Wifi,
  WifiOff
} from "lucide-react";

export default function App() {
  // Parse initial route from URL parameters
  const initialRoute = parseCurrentRoute();
  const initialResolved = resolveSessionFromRoute(
    initialRoute,
    initialTeachers,
    initialStudents,
    initialParentAccounts
  );

  const [session, setSession] = useState<UserSession | null>(() => {
    if (initialRoute.autoLogin && initialResolved.session) {
      return initialResolved.session;
    }
    try {
      const savedSession = localStorage.getItem("zambian_school_session");
      if (savedSession) {
        return JSON.parse(savedSession);
      }
    } catch (_) {}
    return null;
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialResolved.targetTab) return initialResolved.targetTab;
    try {
      const savedTab = localStorage.getItem("zambian_school_active_tab");
      if (savedTab) return savedTab;
    } catch (_) {}
    return "Dashboard";
  });
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<"checking" | "connected" | "offline">("checking");
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  // Clean initialization: ensure demo grades, cohorts, streams, teaching faculty and approvals are cleared so the administrator starts with a fresh custom setup
  try {
    if (typeof window !== "undefined" && localStorage.getItem("zambian_school_clean_slate_v4") !== "true") {
      localStorage.removeItem("zambian_school_classes");
      localStorage.removeItem("zambian_school_batches");
      localStorage.removeItem("zambian_school_teachers");
      localStorage.removeItem("zambian_school_staff");
      localStorage.removeItem("zambian_school_timetable");
      localStorage.removeItem("zambian_school_students");
      localStorage.removeItem("zambian_school_gradebook");
      localStorage.removeItem("zambian_school_results_approvals");
      localStorage.removeItem("zambian_school_termly_reports");
      localStorage.removeItem("zambian_school_attendance");
      localStorage.removeItem("zambian_school_transport_pupils");
      localStorage.setItem("zambian_school_clean_slate_v4", "true");
    }
  } catch (_) {}

  // Core School Data State with LocalStorage Persistence
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_profile");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialSchoolProfile;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_students");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialStudents;
  });

  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_teachers");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialTeachers;
  });

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_staff");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialStaffData;
  });

  const [classes, setClasses] = useState<ClassStream[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_classes");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialClasses;
  });

  const [batches, setBatches] = useState<AcademicBatch[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_batches");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialBatches;
  });

  const [subjectsCatalog, setSubjectsCatalog] = useState<SubjectDefinition[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_subjects");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialSubjectsCatalog;
  });

  const [timetableData, setTimetableData] = useState<TimetablePeriod[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_timetable");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialTimetableData;
  });
  
  const [gradebook, setGradebook] = useState<GradebookData>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_gradebook");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return buildDefaultGradebook();
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_attendance");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return [];
  });

  const [termlyReports, setTermlyReports] = useState<Record<number, Record<string, TermlyReportCard>>>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_termly_reports");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialTermlyReports;
  });

  const [resultsApprovals, setResultsApprovals] = useState<Record<number, Record<string, TermResultsApproval>>>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_results_approvals");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialResultsApprovals;
  });
  
  // Finance, Receipts & Invoices
  const [fees, setFees] = useState<FeeItem[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_fees");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialFees;
  });

  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_receipts");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialReceiptsData;
  });

  // Discipline, Inventory, Library, Boarding, Transport with LocalStorage
  const [disciplineRecords, setDisciplineRecords] = useState<DisciplineRecord[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_discipline");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialDisciplineData;
  });

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_inventory");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialInventoryData;
  });

  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_library_books");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialBooks;
  });

  const [libraryCheckouts, setLibraryCheckouts] = useState<LibraryCheckout[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_library_checkouts");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialLibraryCheckouts;
  });

  const [hostelDorms, setHostelDorms] = useState<HostelDormitory[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_hostel_dorms");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialHostelData;
  });

  const [hostelAllocations, setHostelAllocations] = useState<HostelAllocation[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_hostel_allocations");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialHostelAllocations;
  });

  const [transportVehicles, setTransportVehicles] = useState<TransportVehicle[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_transport_vehicles");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialTransportData;
  });

  const [transportPupils, setTransportPupils] = useState<TransportPupilAssignment[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_transport_pupils");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialTransportPupils;
  });

  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_transport_routes");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialRoutes;
  });

  const [secondaryPathways, setSecondaryPathways] = useState<SecondaryPathwayInfo[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_pathways");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return Object.values(SECONDARY_PATHWAYS);
  });

  // Communications & Audit
  const [messages, setMessages] = useState<UserMessage[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_messages");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialMessages;
  });

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_events");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialEvents;
  });

  const [homeworkTasks, setHomeworkTasks] = useState<HomeworkTask[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_homework");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialHomework;
  });

  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_exams");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialExams;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem("zambian_school_audit_logs");
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return initialAuditLogs;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace("T", " ").slice(0, 19),
      userName: session?.adminName || session?.teacher?.name || session?.parent?.name || session?.student?.name || "System User",
      userRole: session?.role || "admin",
      action,
      module,
      details,
      ipAddress: "196.14.88.100 (Lusaka, ZM)"
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Sync to LocalStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_profile", JSON.stringify(schoolProfile));
    } catch (_) {}
  }, [schoolProfile]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_students", JSON.stringify(students));
    } catch (_) {}
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_teachers", JSON.stringify(teachers));
    } catch (_) {}
  }, [teachers]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_staff", JSON.stringify(staffMembers));
    } catch (_) {}
  }, [staffMembers]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_classes", JSON.stringify(classes));
    } catch (_) {}
  }, [classes]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_batches", JSON.stringify(batches));
    } catch (_) {}
  }, [batches]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_subjects", JSON.stringify(subjectsCatalog));
    } catch (_) {}
  }, [subjectsCatalog]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_timetable", JSON.stringify(timetableData));
    } catch (_) {}
  }, [timetableData]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_fees", JSON.stringify(fees));
    } catch (_) {}
  }, [fees]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_receipts", JSON.stringify(receipts));
    } catch (_) {}
  }, [receipts]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_events", JSON.stringify(events));
    } catch (_) {}
  }, [events]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_messages", JSON.stringify(messages));
    } catch (_) {}
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_gradebook", JSON.stringify(gradebook));
    } catch (_) {}
  }, [gradebook]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_attendance", JSON.stringify(attendanceRecords));
    } catch (_) {}
  }, [attendanceRecords]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_termly_reports", JSON.stringify(termlyReports));
    } catch (_) {}
  }, [termlyReports]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_results_approvals", JSON.stringify(resultsApprovals));
    } catch (_) {}
  }, [resultsApprovals]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_discipline", JSON.stringify(disciplineRecords));
    } catch (_) {}
  }, [disciplineRecords]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_inventory", JSON.stringify(inventoryItems));
    } catch (_) {}
  }, [inventoryItems]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_library_books", JSON.stringify(libraryBooks));
    } catch (_) {}
  }, [libraryBooks]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_library_checkouts", JSON.stringify(libraryCheckouts));
    } catch (_) {}
  }, [libraryCheckouts]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_hostel_dorms", JSON.stringify(hostelDorms));
    } catch (_) {}
  }, [hostelDorms]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_hostel_allocations", JSON.stringify(hostelAllocations));
    } catch (_) {}
  }, [hostelAllocations]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_transport_vehicles", JSON.stringify(transportVehicles));
    } catch (_) {}
  }, [transportVehicles]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_transport_pupils", JSON.stringify(transportPupils));
    } catch (_) {}
  }, [transportPupils]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_transport_routes", JSON.stringify(transportRoutes));
    } catch (_) {}
  }, [transportRoutes]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_homework", JSON.stringify(homeworkTasks));
    } catch (_) {}
  }, [homeworkTasks]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_exams", JSON.stringify(examSchedules));
    } catch (_) {}
  }, [examSchedules]);

  useEffect(() => {
    try {
      localStorage.setItem("zambian_school_audit_logs", JSON.stringify(auditLogs));
    } catch (_) {}
  }, [auditLogs]);

  // Initial Firestore Connectivity Check & Live Realtime Subscriptions
  useEffect(() => {
    testFirestoreConnection().then(connected => {
      setCloudSyncStatus(connected ? "connected" : "offline");
      if (connected) {
        // Ensure cloud database has initial records if it was newly created
        ensureInitialFirestoreData({
          students: initialStudents,
          teachers: initialTeachers,
          staff: initialStaffData,
          classes: initialClasses,
          batches: initialBatches,
          subjects: initialSubjectsCatalog,
          timetable: initialTimetableData,
          fees: initialFees,
          events: initialEvents,
          messages: initialMessages,
          gradebook: buildDefaultGradebook(),
          schoolProfile: initialSchoolProfile,
          termlyReports: initialTermlyReports,
          resultsApprovals: initialResultsApprovals
        }).catch(err => {
          console.warn("Firestore initialization notice:", err);
        });
      }
    });

    const sub = subscribeToRealtimeSchoolData({
      onProfileChange: (cloudProfile) => {
        setCloudSyncStatus("connected");
        if (cloudProfile && Object.keys(cloudProfile).length > 2) {
          setSchoolProfile(prev => {
            // Never overwrite a user-uploaded custom logo with an empty/undefined remote field
            const resolvedLogo = prev.logoUrl && !cloudProfile.logoUrl ? prev.logoUrl : (cloudProfile.logoUrl || prev.logoUrl);
            return {
              ...prev,
              ...cloudProfile,
              ...(resolvedLogo ? { logoUrl: resolvedLogo } : {})
            };
          });
        }
      },
      onStudentsChange: (cloudStudents) => {
        if (cloudStudents) {
          setStudents(prev => {
            const merged = mergeItemsById(prev, cloudStudents);
            try {
              localStorage.setItem("zambian_school_students", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      onTeachersChange: (cloudTeachers) => {
        if (cloudTeachers) {
          setTeachers(prev => {
            const merged = mergeItemsById(prev, cloudTeachers);
            try {
              localStorage.setItem("zambian_school_teachers", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      onStaffChange: (cloudStaff) => {
        if (cloudStaff) {
          setStaffMembers(prev => mergeItemsById(prev, cloudStaff));
        }
      },
      onClassesChange: (cloudClasses) => {
        if (cloudClasses) {
          setClasses(prev => {
            const merged = mergeItemsById(prev, cloudClasses);
            try {
              localStorage.setItem("zambian_school_classes", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      onBatchesChange: (cloudBatches) => {
        if (cloudBatches) {
          setBatches(prev => mergeItemsById(prev, cloudBatches));
        }
      },
      onSubjectsChange: (cloudSubjects) => {
        if (cloudSubjects) {
          setSubjectsCatalog(prev => mergeItemsById(prev, cloudSubjects));
        }
      },
      onTimetableChange: (cloudTimetable) => {
        if (cloudTimetable) {
          setTimetableData(cloudTimetable);
        }
      },
      onFeesChange: (cloudFees) => {
        if (cloudFees) {
          setFees(prev => {
            const merged = mergeItemsById(prev, cloudFees);
            try {
              localStorage.setItem("zambian_school_fees", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      onReceiptsChange: (cloudReceipts) => {
        if (cloudReceipts) {
          setReceipts(prev => mergeItemsById(prev, cloudReceipts));
        }
      },
      onEventsChange: (cloudEvents) => {
        if (cloudEvents) {
          setEvents(prev => {
            const merged = mergeItemsById(prev, cloudEvents);
            try {
              localStorage.setItem("zambian_school_events", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      onMessagesChange: (cloudMessages) => {
        if (cloudMessages) {
          setMessages(prev => {
            const merged = mergeItemsById(prev, cloudMessages);
            try {
              localStorage.setItem("zambian_school_messages", JSON.stringify(merged));
            } catch (_) {}
            return merged;
          });
        }
      },
      onGradebookChange: (cloudGradebook) => {
        if (cloudGradebook && Object.keys(cloudGradebook).length > 0) {
          setGradebook(prev => ({
            ...prev,
            ...cloudGradebook
          }));
        }
      },
      onAttendanceChange: (cloudAttendance) => {
        if (cloudAttendance) {
          setAttendanceRecords(cloudAttendance);
        }
      },
      onTermlyReportsChange: (cloudReports) => {
        if (cloudReports) {
          setTermlyReports(cloudReports);
        }
      },
      onResultsApprovalsChange: (cloudApprovals) => {
        if (cloudApprovals) {
          setResultsApprovals(cloudApprovals);
        }
      },
      onHomeworkChange: (cloudHomework) => {
        if (cloudHomework) {
          setHomeworkTasks(cloudHomework);
        }
      },
      onExamsChange: (cloudExams) => {
        if (cloudExams) {
          setExamSchedules(cloudExams);
        }
      },
      onLibraryChange: (cloudBooks) => {
        if (cloudBooks) {
          setLibraryBooks(cloudBooks);
        }
      },
      onTransportRoutesChange: (cloudRoutes) => {
        if (cloudRoutes) {
          setTransportRoutes(cloudRoutes);
        }
      }
    });

    return () => {
      sub.unsubscribeAll();
    };
  }, []);

  // Sync browser URL whenever session or activeTab changes
  useEffect(() => {
    updateBrowserUrl(session, activeTab);
  }, [session, activeTab]);

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem("zambian_school_session", JSON.stringify(newSession));
    } catch (_) {}
    addAuditLog("User Sign In", "Authentication", `Logged in with role: ${newSession.role}`);
    
    let target = "Dashboard";
    switch (newSession.role) {
      case "super_admin":
      case "school_admin":
      case "head_teacher":
      case "deputy_head":
      case "admin":
        target = "Dashboard";
        break;
      case "teacher":
        target = "Grading";
        break;
      case "accountant":
        target = "Fees";
        break;
      case "librarian":
        target = "Library";
        break;
      case "secretary":
        target = "Students";
        break;
      case "parent":
      case "student":
        target = "ReportCards";
        break;
    }
    setActiveTab(target);
    try {
      localStorage.setItem("zambian_school_active_tab", target);
    } catch (_) {}
  };

  const handleLogout = () => {
    addAuditLog("User Sign Out", "Authentication", "Session terminated by user");
    try {
      localStorage.removeItem("zambian_school_session");
      localStorage.removeItem("zambian_school_active_tab");
    } catch (_) {}
    setSession(null);
  };

  const handleDirectDemoLogin = (role: RoleType, user?: string, studentId?: number) => {
    let s: UserSession;
    let target = "Dashboard";
    if (role === "admin" || role === "super_admin" || role === "school_admin") {
      s = { role: "admin", adminName: `${schoolProfile.headteacherName} (Headteacher)` };
      target = "Dashboard";
    } else if (role === "teacher") {
      const t = user ? teachers.find(item => item.username === user) || teachers[0] : teachers[0];
      s = { role: "teacher", teacher: t };
      target = "Grading";
    } else if (role === "parent") {
      const p = user ? initialParentAccounts.find(item => item.username === user) || initialParentAccounts[0] : initialParentAccounts[0];
      s = { role: "parent", parent: p };
      target = "ReportCards";
    } else {
      const st = studentId
        ? students.find(item => item.id === studentId) || students[0]
        : user
        ? students.find(item => item.username === user) || students[0]
        : students[0];
      s = { role: "student", student: st };
      target = "ReportCards";
    }
    setSession(s);
    setActiveTab(target);
    try {
      localStorage.setItem("zambian_school_session", JSON.stringify(s));
      localStorage.setItem("zambian_school_active_tab", target);
    } catch (_) {}
    setShowShareModal(false);
  };

  const isSuperAdmin = session?.role === "super_admin" || session?.role === "admin";
  const isRoleAdmin = isSuperAdmin || session?.role === "school_admin" || session?.role === "head_teacher" || session?.role === "deputy_head";
  const isRoleTeacher = session?.role === "teacher";
  const isRoleBursar = session?.role === "accountant";
  const isRoleSecretary = session?.role === "secretary";
  const isRoleLibrarian = session?.role === "librarian";
  const isRoleParent = session?.role === "parent";
  const isRoleStudent = session?.role === "student";

  // Pre-filtered Student ID for parent/student views
  let fixedStudentId: number | undefined;
  if (isRoleParent && session?.parent?.childIds?.[0]) {
    fixedStudentId = session.parent.childIds[0];
  } else if (isRoleStudent && session?.student) {
    fixedStudentId = session.student.id;
  }

  const [showProfileModal, setShowProfileModal] = useState(false);

  // Teacher restricted view for assigned classes, batches, and pupils with strict Primary vs Secondary separation
  const teacherAssignedClassIds = session?.teacher?.classesAssigned || [];
  const teacherSection = session?.teacher?.section; // "Primary" or "Secondary"

  const visibleClasses = useMemo(() => {
    if (isRoleTeacher && session?.teacher) {
      const teacherName = (session.teacher.name || "").toLowerCase();
      return classes.filter(c => {
        // Strict Section Isolation: Primary teacher cannot see Secondary classes, Secondary teacher cannot see Primary classes
        if (teacherSection === "Primary" && (c.section === "Secondary" || (c.gradeNum && c.gradeNum >= 8))) {
          return false;
        }
        if (teacherSection === "Secondary" && (c.section === "Primary" || c.section === "Early Childhood" || (c.gradeNum && c.gradeNum <= 7))) {
          return false;
        }
        return (
          teacherAssignedClassIds.includes(c.id) ||
          c.teacherId === session.teacher?.id ||
          (c.teacherName && c.teacherName.toLowerCase() === teacherName)
        );
      });
    }
    return classes;
  }, [classes, isRoleTeacher, session?.teacher, teacherAssignedClassIds, teacherSection]);

  const visibleBatches = useMemo(() => {
    if (isRoleTeacher && session?.teacher) {
      const teacherName = (session.teacher.name || "").toLowerCase();
      const visibleClassNames = visibleClasses.map(c => c.name);
      return batches.filter(b => {
        if (teacherSection === "Primary" && b.targetGrades.some(g => g.includes("Grade 8") || g.includes("Grade 9") || g.includes("Grade 10") || g.includes("Grade 11") || g.includes("Grade 12") || g.includes("Form"))) {
          if (!b.targetGrades.some(g => g.includes("Grade 1") || g.includes("Grade 7") || g.includes("All Grades"))) return false;
        }
        if (teacherSection === "Secondary" && b.targetGrades.every(g => g.includes("Grade 1") || g.includes("Grade 2") || g.includes("Grade 3") || g.includes("Grade 4") || g.includes("Grade 5") || g.includes("Grade 6") || g.includes("Grade 7"))) {
          return false;
        }
        return (
          b.leadTeacherId === session.teacher?.id ||
          (b.leadTeacherName && b.leadTeacherName.toLowerCase() === teacherName) ||
          b.targetGrades.some(g => visibleClassNames.some(cName => cName.includes(g))) ||
          visibleClasses.some(c => c.batchId === b.id)
        );
      });
    }
    return batches;
  }, [batches, visibleClasses, isRoleTeacher, session?.teacher, teacherSection]);

  const visibleStudents = useMemo(() => {
    if (isRoleTeacher && session?.teacher) {
      const visibleClassIds = visibleClasses.map(c => c.id);
      return students.filter(s => {
        if (teacherSection === "Primary" && (s.section === "Secondary" || s.grade.includes("Grade 8") || s.grade.includes("Grade 9") || s.grade.includes("Grade 10") || s.grade.includes("Grade 11") || s.grade.includes("Grade 12") || s.grade.includes("Form"))) {
          return false;
        }
        if (teacherSection === "Secondary" && (s.section === "Primary" || s.section === "Early Childhood" || s.grade.includes("Grade 1") || s.grade.includes("Grade 2") || s.grade.includes("Grade 3") || s.grade.includes("Grade 4") || s.grade.includes("Grade 5") || s.grade.includes("Grade 6") || s.grade.includes("Grade 7"))) {
          return false;
        }
        return visibleClassIds.includes(s.classId);
      });
    }
    if (fixedStudentId) {
      return students.filter(s => s.id === fixedStudentId);
    }
    return students;
  }, [students, visibleClasses, isRoleTeacher, session?.teacher, teacherSection, fixedStudentId]);

  if (!session) {
    return (
      <LoginScreen
        teachers={teachers}
        students={students}
        parents={initialParentAccounts}
        staffMembers={staffMembers}
        schoolProfile={schoolProfile}
        onLogin={handleLogin}
      />
    );
  }

  // School Profile Handlers
  const handleUpdateSchoolProfile = (updatedProfile: SchoolProfile) => {
    setSchoolProfile(updatedProfile);
    saveSchoolProfileToFirestore(updatedProfile).catch(() => {});
    addAuditLog("School Profile Updated", "Settings", `Updated school motto, address and contact info.`);
    showToast("School Profile & Institutional details updated.");
  };

  // Timetable Handlers
  const handleUpdateTimetable = (newPeriods: TimetablePeriod[]) => {
    setTimetableData(newPeriods);
    addAuditLog("Master Timetable Updated", "Timetable", `Updated class timetable allocation periods.`);
    showToast("Master timetable schedules saved.");
  };

  // Student CRUD
  const handleAddStudent = (newPupil: Omit<Student, "id">) => {
    const id = Date.now();
    const fullStudent: Student = { ...newPupil, id };
    const updated = [...students, fullStudent];
    setStudents(updated);
    try {
      localStorage.setItem("zambian_school_students", JSON.stringify(updated));
    } catch (_) {}
    saveStudentToFirestore(fullStudent).catch(() => {});
    addAuditLog("Pupil Enrolled", "Students", `Admitted ${newPupil.name} (${newPupil.grade}) with ECZ ${newPupil.eczNo}`);
    showToast(`Pupil ${newPupil.name} registered successfully.`);
  };

  const handleAddBulkStudents = (newPupils: Omit<Student, "id">[]) => {
    const baseId = Date.now();
    const created: Student[] = newPupils.map((p, idx) => ({
      ...p,
      id: baseId + idx
    }));
    const updated = [...students, ...created];
    setStudents(updated);
    try {
      localStorage.setItem("zambian_school_students", JSON.stringify(updated));
    } catch (_) {}
    created.forEach(s => saveStudentToFirestore(s).catch(() => {}));
    addAuditLog("Bulk Pupil Enrollment", "Students", `Imported ${created.length} students via CSV.`);
    showToast(`Successfully enrolled ${created.length} pupils via bulk import.`);
  };

  const handleEditStudent = (updatedPupil: Student) => {
    const updated = students.map(s => s.id === updatedPupil.id ? updatedPupil : s);
    setStudents(updated);
    try {
      localStorage.setItem("zambian_school_students", JSON.stringify(updated));
    } catch (_) {}
    saveStudentToFirestore(updatedPupil).catch(() => {});
    addAuditLog("Pupil Record Updated", "Students", `Updated bio and class stream for ${updatedPupil.name}`);
    showToast(`Record for ${updatedPupil.name} updated.`);
  };

  const handleDeleteStudent = (id: number) => {
    const target = students.find(s => s.id === id);
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    try {
      localStorage.setItem("zambian_school_students", JSON.stringify(updated));
    } catch (_) {}
    deleteStudentFromFirestore(id).catch(() => {});
    addAuditLog("Pupil Record Deleted", "Students", `Removed pupil ${target?.name || id}`);
    showToast("Pupil record removed.");
  };

  // Class Stream Handlers
  const handleAddClass = (newClass: Omit<ClassStream, "id"> | ClassStream) => {
    const id = "id" in newClass ? newClass.id : Math.max(0, ...classes.map(c => c.id)) + 1;
    const fullClass: ClassStream = { ...newClass, id };
    const updated = [...classes, fullClass];
    setClasses(updated);
    try {
      localStorage.setItem("zambian_school_classes", JSON.stringify(updated));
    } catch (_) {}
    saveClassToFirestore(fullClass).catch(() => {});
    showToast(`Class stream "${fullClass.name}" created successfully!`);
  };

  const handleEditClass = (updatedClass: ClassStream) => {
    const updated = classes.map(c => c.id === updatedClass.id ? updatedClass : c);
    setClasses(updated);
    try {
      localStorage.setItem("zambian_school_classes", JSON.stringify(updated));
    } catch (_) {}
    saveClassToFirestore(updatedClass).catch(() => {});
    showToast(`Class "${updatedClass.name}" updated successfully!`);
  };

  const handleDeleteClass = (classId: number) => {
    const updated = classes.filter(c => c.id !== classId);
    setClasses(updated);
    try {
      localStorage.setItem("zambian_school_classes", JSON.stringify(updated));
    } catch (_) {}
    deleteClassFromFirestore(classId).catch(() => {});
    showToast(`Class stream removed.`);
  };

  // Academic Batch Handlers
  const handleAddBatch = (newBatch: AcademicBatch) => {
    setBatches(prev => [...prev, newBatch]);
    showToast(`Academic batch "${newBatch.name}" created successfully!`);
  };

  const handleEditBatch = (updatedBatch: AcademicBatch) => {
    setBatches(prev => prev.map(b => b.id === updatedBatch.id ? updatedBatch : b));
    showToast(`Batch "${updatedBatch.name}" updated successfully!`);
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatches(prev => prev.filter(b => b.id !== batchId));
    showToast(`Academic batch removed.`);
  };

  // Subject Catalogue Handlers
  const handleAddSubject = (newSubject: SubjectDefinition) => {
    setSubjectsCatalog(prev => [...prev, newSubject]);
    showToast(`Subject "${newSubject.name}" added to curriculum!`);
  };

  const handleEditSubject = (updatedSubject: SubjectDefinition) => {
    setSubjectsCatalog(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
    showToast(`Subject "${updatedSubject.name}" updated successfully!`);
  };

  const handleDeleteSubject = (subjectId: string) => {
    setSubjectsCatalog(prev => prev.filter(s => s.id !== subjectId));
    showToast(`Subject removed from curriculum.`);
  };

  // Fee Operations
  const handleAddFee = (newFee: Omit<FeeItem, "id">) => {
    const fullFee: FeeItem = { ...newFee, id: Date.now() };
    const updated = [...fees, fullFee];
    setFees(updated);
    try {
      localStorage.setItem("zambian_school_fees", JSON.stringify(updated));
    } catch (_) {}
    saveFeeToFirestore(fullFee).catch(() => {});
    const stud = students.find(s => s.id === newFee.studentId);
    const amountVal = newFee.amountZMW ?? newFee.amount ?? 0;
    const studName = stud?.name || newFee.studentName || `Pupil #${newFee.studentId}`;
    addAuditLog("Fee Invoiced", "Fees", `Invoiced K${amountVal} for ${studName}`);
    showToast("Fee item invoiced.");
  };

  const handleEditFee = (updatedFee: FeeItem) => {
    const updated = fees.map(f => f.id === updatedFee.id ? updatedFee : f);
    setFees(updated);
    try {
      localStorage.setItem("zambian_school_fees", JSON.stringify(updated));
    } catch (_) {}
    saveFeeToFirestore(updatedFee).catch(() => {});
    showToast("Fee invoice updated.");
  };

  const handleDeleteFee = (feeId: number) => {
    const updated = fees.filter(f => f.id !== feeId);
    setFees(updated);
    try {
      localStorage.setItem("zambian_school_fees", JSON.stringify(updated));
    } catch (_) {}
    deleteFeeFromFirestore(feeId).catch(() => {});
    showToast("Fee invoice removed.");
  };

  const handleRecordPayment = (feeId: number, amountPaid: number) => {
    const targetFee = fees.find(f => f.id === feeId);
    setFees(prev => prev.map(f => {
      if (f.id === feeId) {
        const totalAmount = f.amountZMW || f.amount || 0;
        const currentPaid = f.paidAmountZMW || f.paid || 0;
        const newPaid = currentPaid + amountPaid;
        const newStatus: "Paid" | "Partially Paid" | "Unpaid" = newPaid >= totalAmount ? "Paid" : newPaid > 0 ? "Partially Paid" : "Unpaid";
        const newBalance = Math.max(0, totalAmount - newPaid);
        return {
          ...f,
          paidAmountZMW: newPaid,
          paid: newPaid,
          balance: newBalance,
          status: newStatus
        };
      }
      return f;
    }));

    if (targetFee) {
      const student = students.find(s => s.id === targetFee.studentId);
      const receiptNo = `RCT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const newReceipt: PaymentReceipt = {
        id: Date.now(),
        receiptNumber: receiptNo,
        feeItemId: feeId,
        studentId: targetFee.studentId,
        studentName: targetFee.studentName || student?.name || "Pupil",
        studentEczNo: student?.eczNo || `ECZ-2026-0412-${targetFee.studentId}`,
        grade: student?.grade || "Grade 7",
        amountPaidZMW: amountPaid,
        paymentMethod: "Airtel Money",
        referenceNumber: `TXN-MO-${Date.now().toString().slice(-6)}`,
        paymentDate: new Date().toISOString().split("T")[0],
        description: targetFee.description || targetFee.category || "School Fee Payment",
        previousBalanceZMW: (targetFee.amountZMW || 0) - (targetFee.paidAmountZMW || 0),
        remainingBalanceZMW: Math.max(0, (targetFee.amountZMW || 0) - (targetFee.paidAmountZMW || 0) - amountPaid),
        collectedBy: session.adminName || "Accounts Bursar",
        verified: true,
        notes: "Electronic receipt issued via Zambian SMS gateway."
      };
      setReceipts(prev => [newReceipt, ...prev]);
      addAuditLog("Payment Stamped & Receipted", "Fees", `Issued receipt ${receiptNo} for K${amountPaid} to ${newReceipt.studentName}`);
    }

    showToast(`Payment of K${amountPaid} ZMW recorded and receipt issued.`);
  };

  // Teacher Management Handlers
  const handleAddTeacher = (newTeacher: Omit<Teacher, "id">) => {
    const id = Date.now();
    const created: Teacher = { ...newTeacher, id };
    const updated = [...teachers, created];
    setTeachers(updated);
    try {
      localStorage.setItem("zambian_school_teachers", JSON.stringify(updated));
    } catch (_) {}
    saveTeacherToFirestore(created).catch(() => {});
    addAuditLog("Faculty Member Added", "Faculty", `Registered teacher ${newTeacher.name} (TSC: ${newTeacher.tscNumber})`);
    showToast(`Teacher "${newTeacher.name}" registered successfully.`);
  };

  const handleEditTeacher = (updatedTeacher: Teacher) => {
    const updated = teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t);
    setTeachers(updated);
    try {
      localStorage.setItem("zambian_school_teachers", JSON.stringify(updated));
    } catch (_) {}
    saveTeacherToFirestore(updatedTeacher).catch(() => {});
    showToast(`Staff profile for ${updatedTeacher.name} updated.`);
  };

  const handleDeleteTeacher = (teacherId: number) => {
    const updated = teachers.filter(t => t.id !== teacherId);
    setTeachers(updated);
    try {
      localStorage.setItem("zambian_school_teachers", JSON.stringify(updated));
    } catch (_) {}
    deleteTeacherFromFirestore(teacherId).catch(() => {});
    showToast("Teacher record removed.");
  };

  // Term Results Approval Workflow Handlers
  const handleUpdateApprovalStatus = (
    studentId: number,
    term: string,
    status: ReportPublishStatus,
    adminNotes?: string
  ) => {
    const today = new Date().toISOString().split("T")[0];
    const isApproved = status === "Approved_Published";
    const isSubmitted = status === "Pending_Approval";
    const validatedTerm = (term === "Term 1" || term === "Term 2" || term === "Term 3") ? term : "Term 2";

    setResultsApprovals(prev => {
      const studentApprovals = prev[studentId] || {};
      const existing = studentApprovals[validatedTerm] || {
        studentId,
        term: validatedTerm,
        year: schoolProfile.currentYear || 2026,
        status: "Draft" as ReportPublishStatus
      };

      const updated: TermResultsApproval = {
        ...existing,
        status,
        adminNotes: adminNotes ?? existing.adminNotes,
        ...(isSubmitted ? {
          submittedByTeacherName: session.teacher?.name || "Assigned Class Teacher",
          submittedDate: today
        } : {}),
        ...(isApproved ? {
          approvedByAdminName: session.adminName || `${schoolProfile.headteacherName} (Headteacher)`,
          approvedDate: today
        } : {})
      };

      return {
        ...prev,
        [studentId]: {
          ...studentApprovals,
          [validatedTerm]: updated
        }
      };
    });
  };

  const handleBatchApproveClass = (classId: number, term: string) => {
    const today = new Date().toISOString().split("T")[0];
    const classPupils = students.filter(s => s.classId === classId);
    const validatedTerm = (term === "Term 1" || term === "Term 2" || term === "Term 3") ? term : "Term 2";

    setResultsApprovals(prev => {
      const copy = { ...prev };
      classPupils.forEach(pupil => {
        const studentApprovals = copy[pupil.id] || {};
        const existing = studentApprovals[validatedTerm] || {
          studentId: pupil.id,
          term: validatedTerm,
          year: schoolProfile.currentYear || 2026,
          status: "Draft" as ReportPublishStatus
        };

        copy[pupil.id] = {
          ...studentApprovals,
          [validatedTerm]: {
            ...existing,
            status: "Approved_Published",
            approvedByAdminName: session.adminName || `${schoolProfile.headteacherName} (Headteacher)`,
            approvedDate: today,
            adminNotes: "Batch approved and certified for publication by Headteacher."
          }
        };
      });
      return copy;
    });
    addAuditLog("Term Results Batch Certified", "Report Cards", `Head Teacher certified results for class ${classId}`);
    showToast(`Batch approved ${classPupils.length} pupil results for ${term}.`);
  };

  // Report Card remarks update
  const handleUpdateReportCard = (studentId: number, term: string, report: TermlyReportCard) => {
    setTermlyReports(prev => {
      const copy = { ...prev };
      if (!copy[studentId]) copy[studentId] = {};
      copy[studentId][term] = report;
      return copy;
    });
    showToast("Report Card remarks saved.");
  };

  // Academic Calendar Events / Notices
  const handleAddEvent = (newEvent: Omit<SchoolEvent, "id">) => {
    const created: SchoolEvent = { ...newEvent, id: Date.now() };
    const updated = [...events, created];
    setEvents(updated);
    try {
      localStorage.setItem("zambian_school_events", JSON.stringify(updated));
    } catch (_) {}
    saveEventToFirestore(created).catch(() => {});
    showToast(`Notice/Event "${created.title}" published.`);
  };

  const handleUpdateEvent = (updatedEvent: SchoolEvent) => {
    const updated = events.map(e => e.id === updatedEvent.id ? updatedEvent : e);
    setEvents(updated);
    try {
      localStorage.setItem("zambian_school_events", JSON.stringify(updated));
    } catch (_) {}
    saveEventToFirestore(updatedEvent).catch(() => {});
    showToast(`Notice/Event "${updatedEvent.title}" updated.`);
  };

  const handleDeleteEvent = (eventId: number) => {
    const updated = events.filter(e => e.id !== eventId);
    setEvents(updated);
    try {
      localStorage.setItem("zambian_school_events", JSON.stringify(updated));
    } catch (_) {}
    deleteEventFromFirestore(eventId).catch(() => {});
    showToast("Notice/Event removed.");
  };

  // Homework Tasks
  const handleAddHomework = (task: Omit<HomeworkTask, "id">) => {
    setHomeworkTasks(prev => [...prev, { ...task, id: Date.now() }]);
    showToast("Homework task published.");
  };

  const handleEditHomework = (task: HomeworkTask) => {
    setHomeworkTasks(prev => prev.map(t => t.id === task.id ? task : t));
    showToast("Homework task updated.");
  };

  const handleDeleteHomework = (id: number) => {
    setHomeworkTasks(prev => prev.filter(t => t.id !== id));
    showToast("Homework task removed.");
  };

  // Exam Schedules
  const handleAddExam = (exam: Omit<ExamSchedule, "id">) => {
    setExamSchedules(prev => [...prev, { ...exam, id: Date.now() }]);
    showToast("Examination schedule added.");
  };

  const handleEditExam = (exam: ExamSchedule) => {
    setExamSchedules(prev => prev.map(e => e.id === exam.id ? exam : e));
    showToast("Examination schedule updated.");
  };

  const handleDeleteExam = (id: number) => {
    setExamSchedules(prev => prev.filter(e => e.id !== id));
    showToast("Examination schedule removed.");
  };

  // Library Books
  const handleAddBook = (book: Omit<LibraryBook, "id">) => {
    setLibraryBooks(prev => [...prev, { ...book, id: Date.now() }]);
    showToast("Book added to school library.");
  };

  const handleEditBook = (book: LibraryBook) => {
    setLibraryBooks(prev => prev.map(b => b.id === book.id ? book : b));
    showToast("Library book record updated.");
  };

  const handleDeleteBook = (id: number) => {
    setLibraryBooks(prev => prev.filter(b => b.id !== id));
    showToast("Book removed from library catalog.");
  };

  // Secondary Pathways Handlers
  const handleAddPathway = (newPathway: SecondaryPathwayInfo) => {
    setSecondaryPathways(prev => {
      const updated = [...prev, newPathway];
      try {
        localStorage.setItem("zambian_school_pathways", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast(`Secondary pathway "${newPathway.name}" created.`);
  };

  const handleUpdatePathway = (updatedPathway: SecondaryPathwayInfo) => {
    setSecondaryPathways(prev => {
      const updated = prev.map(p => p.id === updatedPathway.id ? updatedPathway : p);
      try {
        localStorage.setItem("zambian_school_pathways", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast(`Secondary pathway "${updatedPathway.name}" updated.`);
  };

  const handleDeletePathway = (pathwayId: string) => {
    setSecondaryPathways(prev => {
      const updated = prev.filter(p => p.id !== pathwayId);
      try {
        localStorage.setItem("zambian_school_pathways", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast("Secondary pathway removed.");
  };

  const handleResetPathways = () => {
    const defaultList = Object.values(SECONDARY_PATHWAYS);
    setSecondaryPathways(defaultList);
    try {
      localStorage.setItem("zambian_school_pathways", JSON.stringify(defaultList));
    } catch (_) {}
    showToast("Reset secondary pathways to Ministry of Education defaults.");
  };

  // Transport Routes & Fleet Handlers
  const handleAddRoute = (route: Omit<TransportRoute, "id">) => {
    const created: TransportRoute = { ...route, id: Date.now() };
    setTransportRoutes(prev => {
      const updated = [created, ...prev];
      try {
        localStorage.setItem("zambian_school_transport_routes", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast("Bus route configured.");
  };

  const handleEditRoute = (route: TransportRoute) => {
    setTransportRoutes(prev => {
      const updated = prev.map(r => r.id === route.id ? route : r);
      try {
        localStorage.setItem("zambian_school_transport_routes", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast("Bus route updated.");
  };

  const handleDeleteRoute = (id: number) => {
    setTransportRoutes(prev => {
      const updated = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem("zambian_school_transport_routes", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast("Bus route removed.");
  };

  const handleAddVehicle = (v: TransportVehicle) => {
    setTransportVehicles(prev => {
      const updated = [v, ...prev];
      try {
        localStorage.setItem("zambian_school_transport_vehicles", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast(`Vehicle ${v.registrationNumber} registered.`);
  };

  const handleEditVehicle = (v: TransportVehicle) => {
    setTransportVehicles(prev => {
      const updated = prev.map(item => item.id === v.id ? v : item);
      try {
        localStorage.setItem("zambian_school_transport_vehicles", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast(`Vehicle ${v.registrationNumber} updated.`);
  };

  const handleDeleteVehicle = (id: number) => {
    setTransportVehicles(prev => {
      const updated = prev.filter(v => v.id !== id);
      try {
        localStorage.setItem("zambian_school_transport_vehicles", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast("Vehicle record removed.");
  };

  const handleAssignPupil = (assignment: TransportPupilAssignment) => {
    setTransportPupils(prev => {
      const updated = [assignment, ...prev];
      try {
        localStorage.setItem("zambian_school_transport_pupils", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast(`Assigned ${assignment.studentName} to bus route.`);
  };

  const handleRemovePupil = (id: number) => {
    setTransportPupils(prev => {
      const updated = prev.filter(a => a.id !== id);
      try {
        localStorage.setItem("zambian_school_transport_pupils", JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    showToast("Transport assignment removed.");
  };

  // Messages
  const handleSendMessage = (to: string, subject: string, body: string) => {
    let senderName = "Administrator";
    if (session.role === "teacher" && session.teacher) senderName = session.teacher.name;
    if (session.role === "parent" && session.parent) senderName = session.parent.name;
    if (session.role === "student" && session.student) senderName = session.student.name;

    const newMsg: UserMessage = {
      id: Date.now(),
      fromName: senderName,
      toName: to,
      subject: subject,
      body: body,
      date: new Date().toISOString().split("T")[0],
      read: false
    };

    setMessages(prev => [newMsg, ...prev]);
    showToast("Message dispatched.");
  };

  const handleCopyCurrentPageLink = async () => {
    const url = buildPortalUrl({
      role: session.role,
      username: session.teacher?.username || session.parent?.username || session.student?.username,
      studentId: fixedStudentId,
      tab: activeTab
    });
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  const fullAppState = {
    schoolProfile,
    students,
    teachers,
    staffMembers,
    classes,
    batches,
    subjectsCatalog,
    fees,
    receipts,
    inventoryItems,
    disciplineRecords,
    hostelDorms,
    libraryBooks,
    transportVehicles
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Standardized Responsive Sidebar */}
      <HeaderAndSidebar
        session={session}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        unreadCount={unreadMessagesCount}
        schoolProfile={schoolProfile}
        onOpenShareModal={() => setShowShareModal(true)}
        onOpenProfileModal={() => setShowProfileModal(true)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Institutional Top Navigation Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500 hidden sm:inline">
                {schoolProfile.name}
              </span>
              <span className="text-slate-300 hidden sm:inline">/</span>
              <h2 className="text-sm font-bold text-slate-900 truncate font-serif">
                {activeTab === "Dashboard" ? "Executive Dashboard" :
                 activeTab === "Students" ? "Pupil Admissions & Class Streams" :
                 activeTab === "Grading" ? "Continuous Assessment & Grading" :
                 activeTab === "Attendance" ? "Daily Class Register" :
                 activeTab === "ReportCards" ? "Termly Report Cards" :
                 activeTab === "SecondaryPathways" ? "Secondary Section & Pathways" :
                 activeTab === "Teachers" ? "Faculty & Staff Directory" :
                 activeTab === "Fees" ? "Kwacha Fee Accounts & Receipts" :
                 activeTab === "AcademicCalendar" ? "Academic Term Calendar" :
                 activeTab === "AcademicResources" ? "Curriculum, Homework & Catalog" :
                 activeTab === "Timetable" ? "Master Timetable" :
                 activeTab === "Library" ? "Library & Textbooks Management" :
                 activeTab === "Inventory" ? "School Assets & Inventory Register" :
                 activeTab === "Discipline" ? "Student Conduct & Discipline Records" :
                 activeTab === "Hostel" ? "Boarding Halls & Bed Allocations" :
                 activeTab === "Transport" ? "School Transport & Bus Fleet" :
                 activeTab === "Reports" ? "Institutional Reports & Analytics" :
                 activeTab === "AuditSecurity" ? "Security Policies & Audit Trail" :
                 activeTab === "Documentation" ? "Technical Manual & System Docs" :
                 activeTab === "SchoolSettings" ? "Institution Profile & School Settings" :
                 activeTab === "Messages" ? "Staff & Parent Messages" : "School Notices"}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Cloud Sync Badge & Instant Sync Button */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-medium transition-colors bg-slate-50 border-slate-200">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                cloudSyncStatus === "connected" ? "bg-emerald-500 animate-pulse" :
                cloudSyncStatus === "checking" ? "bg-amber-500" : "bg-slate-400"
              }`} />
              <span className="text-slate-700">
                {cloudSyncStatus === "connected" ? "Cloud Synced" :
                 cloudSyncStatus === "checking" ? "Checking Sync..." : "Local / Offline"}
              </span>
              <button
                type="button"
                disabled={isCloudSyncing}
                onClick={async () => {
                  setIsCloudSyncing(true);
                  try {
                    await syncEntireDatasetToFirestore({
                      schoolProfile,
                      students,
                      teachers,
                      classes,
                      fees,
                      gradebook,
                      attendanceRecords,
                      termlyReports,
                      resultsApprovals,
                      events,
                      messages,
                      syncedBy: session.adminName || session.role
                    });
                    setCloudSyncStatus("connected");
                    showToast("Database successfully synced to Cloud Firestore!");
                  } catch (e) {
                    showToast("Sync completed locally (offline fallback active).");
                  } finally {
                    setIsCloudSyncing(false);
                  }
                }}
                className="ml-1 p-0.5 text-slate-500 hover:text-emerald-700 rounded transition-colors cursor-pointer"
                title="Force Sync to Cloud Database Now"
              >
                <RefreshCw className={`w-3 h-3 ${isCloudSyncing ? "animate-spin text-emerald-600" : ""}`} />
              </button>
            </div>

            {/* User Badge - Clickable to open Profile & Password Modal */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors cursor-pointer text-left"
              title="Click to edit profile & change password"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span className="font-semibold text-slate-800 truncate max-w-[140px]">
                {session.adminName || session.teacher?.name || session.parent?.name || session.student?.name}
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 capitalize">
                {session.role}
              </span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={handleCopyCurrentPageLink}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border cursor-pointer ${
                  copiedLink
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}
                title="Copy direct portal link to this view (Super Admin only)"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Copy Link</span>
                  </>
                )}
              </button>
            )}

            {isSuperAdmin && (
              <button
                onClick={() => setShowShareModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white shadow-2xs transition-colors cursor-pointer"
                title="Super Admin Portal Links"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Portals</span>
              </button>
            )}
          </div>
        </header>

        {/* Standardized Tab Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* 1. Dashboard Module */}
          {activeTab === "Dashboard" && (
            <DashboardModule
              students={visibleStudents}
              teachers={teachers}
              classes={visibleClasses}
              fees={fees}
              events={events}
              onNavigateTab={setActiveTab}
              onOpenShareModal={() => setShowShareModal(true)}
            />
          )}

          {/* 2. Pupil Admissions & Student Management */}
          {activeTab === "Students" && (
            <StudentManagement
              students={visibleStudents}
              classes={visibleClasses}
              teachers={teachers}
              batches={visibleBatches}
              subjectsCatalog={subjectsCatalog}
              onAddStudent={handleAddStudent}
              onAddBulkStudents={handleAddBulkStudents}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
              onAddClass={handleAddClass}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
              onAddBatch={handleAddBatch}
              onEditBatch={handleEditBatch}
              onDeleteBatch={handleDeleteBatch}
              onAddSubject={handleAddSubject}
              onEditSubject={handleEditSubject}
              onDeleteSubject={handleDeleteSubject}
              canManage={isRoleAdmin || isRoleSecretary}
              schoolProfile={schoolProfile}
            />
          )}

          {/* 3. Continuous Assessment & Grading */}
          {activeTab === "Grading" && (
            <GradingModule
              students={visibleStudents}
              classes={visibleClasses}
              gradebook={gradebook}
              onUpdateGradebook={setGradebook}
              resultsApprovals={resultsApprovals}
              onUpdateApprovalStatus={handleUpdateApprovalStatus}
              onBatchApproveClass={handleBatchApproveClass}
              canEdit={isRoleTeacher || isRoleAdmin}
              isHeadteacher={isRoleAdmin}
              filterTeacherName={session.teacher?.name}
              filterStudentId={fixedStudentId}
            />
          )}

          {/* 4. Daily Attendance Register */}
          {activeTab === "Attendance" && (
            <AttendanceModule
              students={visibleStudents}
              classes={visibleClasses}
              attendanceRecords={attendanceRecords}
              onUpdateAttendance={setAttendanceRecords}
              canMarkAttendance={isRoleTeacher || isRoleAdmin}
              filterStudentId={fixedStudentId}
            />
          )}

          {/* 5. Official Termly Report Cards */}
          {activeTab === "ReportCards" && (
            <ReportCardModule
              students={visibleStudents}
              classes={visibleClasses}
              teachers={teachers}
              gradebook={gradebook}
              termlyReports={termlyReports}
              resultsApprovals={resultsApprovals}
              onUpdateReport={handleUpdateReportCard}
              onUpdateGradebook={setGradebook}
              canEditRemarks={isRoleTeacher || isRoleAdmin}
              schoolProfile={schoolProfile}
              filterStudentId={fixedStudentId}
            />
          )}

          {/* 6. Secondary Section & Career Pathways */}
          {activeTab === "SecondaryPathways" && (
            <SecondaryPathwaysModule
              students={visibleStudents}
              classes={visibleClasses}
              pathways={secondaryPathways}
              onAddPathway={handleAddPathway}
              onUpdatePathway={handleUpdatePathway}
              onDeletePathway={handleDeletePathway}
              onResetDefaultPathways={handleResetPathways}
              onUpdateStudent={handleEditStudent}
              canManage={isRoleAdmin || isRoleTeacher}
            />
          )}

          {/* 7. Teaching Staff & Faculty Directory */}
          {activeTab === "Teachers" && (
            <StaffModule
              teachers={teachers}
              classes={visibleClasses}
              onOpenShareModal={() => setShowShareModal(true)}
              onAddTeacher={handleAddTeacher}
              onEditTeacher={handleEditTeacher}
              onDeleteTeacher={handleDeleteTeacher}
              canManage={isRoleAdmin}
              isSuperAdmin={isSuperAdmin}
            />
          )}

          {/* 8. Kwacha Fees & Receipts Module */}
          {activeTab === "Fees" && (
            <FeeManagement
              fees={fees}
              students={visibleStudents}
              classes={visibleClasses}
              receipts={receipts}
              onAddFee={handleAddFee}
              onEditFee={handleEditFee}
              onDeleteFee={handleDeleteFee}
              onRecordPayment={handleRecordPayment}
              canManage={isRoleAdmin || isRoleBursar}
              filterStudentId={fixedStudentId}
              schoolProfile={schoolProfile}
            />
          )}

          {/* 9. Academic Resources & Homework */}
          {activeTab === "AcademicResources" && (
            <AcademicResourcesModule
              classes={visibleClasses}
              students={visibleStudents}
              homeworkTasks={homeworkTasks}
              onAddHomework={handleAddHomework}
              onEditHomework={handleEditHomework}
              onDeleteHomework={handleDeleteHomework}
              examSchedules={examSchedules}
              onAddExam={handleAddExam}
              onEditExam={handleEditExam}
              onDeleteExam={handleDeleteExam}
              libraryBooks={libraryBooks}
              onAddBook={handleAddBook}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
              transportRoutes={transportRoutes}
              onAddRoute={handleAddRoute}
              onEditRoute={handleEditRoute}
              onDeleteRoute={handleDeleteRoute}
              canManage={isRoleAdmin || isRoleTeacher || isRoleLibrarian}
            />
          )}

          {/* 10. Class Timetable Module */}
          {activeTab === "Timetable" && (
            <TimetableModule
              classes={visibleClasses}
              teachers={teachers}
              subjectsCatalog={subjectsCatalog}
              timetableData={timetableData}
              onUpdateTimetable={handleUpdateTimetable}
              canEdit={isRoleAdmin}
            />
          )}

          {/* 11. Academic Calendar */}
          {activeTab === "AcademicCalendar" && (
            <AcademicCalendarModule
              events={events}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              canManage={isRoleAdmin}
            />
          )}

          {/* 12. Library Management Module */}
          {activeTab === "Library" && (
            <LibraryManagementModule
              books={libraryBooks}
              checkouts={libraryCheckouts}
              students={students}
              onAddBook={handleAddBook}
              onEditBook={handleEditBook}
              onDeleteBook={handleDeleteBook}
              onIssueLoan={(checkout) => {
                setLibraryCheckouts(prev => [checkout, ...prev]);
                showToast(`Book loaned to ${checkout.studentName}.`);
              }}
              onReturnLoan={(checkoutId) => {
                setLibraryCheckouts(prev => prev.map(c => c.id === checkoutId ? { ...c, status: "Returned", returnDate: new Date().toISOString().split("T")[0] } : c));
                showToast("Book returned and inventory updated.");
              }}
              canManage={isRoleAdmin || isRoleLibrarian}
            />
          )}

          {/* 13. Inventory & Assets Module */}
          {activeTab === "Inventory" && (
            <InventoryManagementModule
              inventory={inventoryItems}
              onAddItem={(item) => {
                setInventoryItems(prev => [item, ...prev]);
                showToast(`Asset "${item.name}" registered.`);
              }}
              onEditItem={(item) => {
                setInventoryItems(prev => prev.map(i => i.id === item.id ? item : i));
                showToast(`Asset "${item.name}" updated.`);
              }}
              onDeleteItem={(id) => {
                setInventoryItems(prev => prev.filter(i => i.id !== id));
                showToast("Asset record removed.");
              }}
              canManage={isRoleAdmin || isRoleBursar}
            />
          )}

          {/* 14. Discipline & Conduct Module */}
          {activeTab === "Discipline" && (
            <DisciplineManagementModule
              disciplineRecords={disciplineRecords}
              students={students}
              onAddRecord={(record) => {
                setDisciplineRecords(prev => [record, ...prev]);
                addAuditLog("Disciplinary Record Logged", "Discipline", `Logged infraction for ${record.studentName}`);
                showToast("Discipline incident recorded.");
              }}
              onUpdateRecord={(record) => {
                setDisciplineRecords(prev => prev.map(r => r.id === record.id ? record : r));
                showToast("Discipline record updated.");
              }}
              onDeleteRecord={(id) => {
                setDisciplineRecords(prev => prev.filter(r => r.id !== id));
                showToast("Record removed.");
              }}
              canManage={isRoleAdmin || isRoleTeacher}
            />
          )}

          {/* 15. Hostel & Boarding Module */}
          {activeTab === "Hostel" && (
            <HostelBoardingModule
              dormitories={hostelDorms}
              allocations={hostelAllocations}
              students={students}
              onAddDormitory={(dorm) => {
                setHostelDorms(prev => [dorm, ...prev]);
                showToast(`Dormitory "${dorm.name}" created.`);
              }}
              onAllocateBed={(alloc) => {
                setHostelAllocations(prev => [alloc, ...prev]);
                showToast(`Bed allocated to ${alloc.studentName}.`);
              }}
              onReleaseBed={(allocId) => {
                setHostelAllocations(prev => prev.filter(a => a.id !== allocId));
                showToast("Bed allocation released.");
              }}
              canManage={isRoleAdmin}
            />
          )}

          {/* 16. School Transport Fleet Module */}
          {activeTab === "Transport" && (
            <TransportManagementModule
              routes={transportRoutes}
              vehicles={transportVehicles}
              assignments={transportPupils}
              students={students}
              onAddRoute={handleAddRoute}
              onUpdateRoute={handleEditRoute}
              onDeleteRoute={handleDeleteRoute}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleEditVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              onAssignPupil={handleAssignPupil}
              onRemovePupil={handleRemovePupil}
              showToast={showToast}
              canManage={isRoleAdmin || isRoleSecretary}
            />
          )}

          {/* 17. Institutional Reports & Analytics Engine */}
          {activeTab === "Reports" && (
            <ReportsModule
              students={students}
              teachers={teachers}
              staff={staffMembers}
              fees={fees}
              receipts={receipts}
              subjects={subjectsCatalog}
              discipline={disciplineRecords}
              inventory={inventoryItems}
              books={libraryBooks}
              schoolProfile={schoolProfile}
            />
          )}

          {/* 18. Security, Audit Logs & Backup */}
          {activeTab === "AuditSecurity" && (
            <AuditLogSecurityModule
              auditLogs={auditLogs}
              currentRole={session.role}
              fullAppState={fullAppState}
              onRestoreData={(jsonStr) => {
                try {
                  const parsed = JSON.parse(jsonStr);
                  if (parsed.students) setStudents(parsed.students);
                  if (parsed.fees) setFees(parsed.fees);
                  if (parsed.schoolProfile) setSchoolProfile(parsed.schoolProfile);
                  showToast("Full database successfully restored from JSON snapshot!");
                } catch (e) {
                  showToast("Restore failed: Invalid JSON format.");
                }
              }}
            />
          )}

          {/* 19. System Documentation Module */}
          {activeTab === "Documentation" && (
            <DocumentationModule />
          )}

          {/* 20. School Settings Module */}
          {activeTab === "SchoolSettings" && isRoleAdmin && (
            <SchoolSettingsModule
              session={session}
              schoolProfile={schoolProfile}
              onUpdateSchoolProfile={handleUpdateSchoolProfile}
              showToast={showToast}
              allSchoolData={{
                students,
                teachers,
                classes,
                fees,
                receipts,
                events,
                gradebook,
                attendanceRecords,
                messages
              }}
            />
          )}

          {/* 21. Messages Module */}
          {activeTab === "Messages" && (
            <CommunicationModule
              session={session}
              messages={messages}
              events={events}
              onSendMessage={handleSendMessage}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              defaultView="messages"
            />
          )}

          {/* 22. Notice Board */}
          {activeTab === "Announcements" && (
            <CommunicationModule
              session={session}
              messages={messages}
              events={events}
              onSendMessage={handleSendMessage}
              onAddEvent={handleAddEvent}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              defaultView="announcements"
            />
          )}
        </main>
      </div>

      {/* Share Links Dialog */}
      <ShareLinksModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        teachers={teachers}
        students={students}
        parents={initialParentAccounts}
        classes={classes}
        onDirectLogin={handleDirectDemoLogin}
      />

      {/* User Profile & Password Modal */}
      {showProfileModal && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          session={session}
          onUpdateSession={setSession}
          onUpdateStudent={handleEditStudent}
          onUpdateTeacher={handleEditTeacher}
          showToast={showToast}
        />
      )}
    </div>
  );
}
