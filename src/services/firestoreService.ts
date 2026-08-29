import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc,
  onSnapshot, 
  writeBatch,
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  Student, 
  Teacher, 
  StaffMember,
  ClassStream, 
  FeeItem, 
  PaymentReceipt,
  SchoolEvent, 
  UserMessage, 
  SchoolProfile,
  GradebookData,
  AttendanceRecord,
  AcademicBatch,
  SubjectDefinition,
  TimetablePeriod,
  TermlyReportCard,
  TermResultsApproval,
  DisciplineRecord,
  InventoryItem,
  LibraryBook,
  LibraryCheckout,
  HostelDormitory,
  HostelAllocation,
  TransportVehicle,
  TransportPupilAssignment,
  TransportRoute,
  HomeworkTask,
  ExamSchedule,
  AuditLogEntry,
  ParentAccount
} from '../types';

export const COLLECTIONS = {
  SCHOOL_CONFIG: 'schoolConfig',
  STUDENTS: 'students',
  TEACHERS: 'teachers',
  STAFF: 'staff',
  CLASSES: 'classes',
  BATCHES: 'batches',
  SUBJECTS: 'subjects',
  TIMETABLE: 'timetable',
  FEES: 'fees',
  RECEIPTS: 'receipts',
  EVENTS: 'events',
  MESSAGES: 'messages',
  GRADEBOOK: 'gradebook',
  ATTENDANCE: 'attendance',
  TERMLY_REPORTS: 'termlyReports',
  RESULTS_APPROVALS: 'resultsApprovals',
  DISCIPLINE: 'discipline',
  INVENTORY: 'inventory',
  LIBRARY: 'library',
  LIBRARY_CHECKOUTS: 'libraryCheckouts',
  HOSTEL_DORMS: 'hostelDorms',
  HOSTEL_ALLOCATIONS: 'hostelAllocations',
  TRANSPORT_VEHICLES: 'transportVehicles',
  TRANSPORT_PUPILS: 'transportPupils',
  TRANSPORT_ROUTES: 'transportRoutes',
  HOMEWORK: 'homework',
  EXAMS: 'exams',
  AUDIT_LOGS: 'auditLogs',
  SYNC_DATA: 'syncData',
  USER_ACCOUNTS: 'userAccounts'
};

export interface RealtimeAppSubscriptions {
  unsubscribeAll: () => void;
}

/**
 * Smart merge function to prevent remote snapshots from wiping local edits
 */
export function mergeItemsById<T extends { id: number | string }>(currentItems: T[], cloudItems: T[]): T[] {
  if (!cloudItems || cloudItems.length === 0) return currentItems;
  if (!currentItems || currentItems.length === 0) return cloudItems;

  const cloudMap = new Map<string, T>();
  cloudItems.forEach(item => {
    if (item && item.id !== undefined && item.id !== null) {
      cloudMap.set(String(item.id), item);
    }
  });

  const mergedMap = new Map<string, T>(cloudMap);

  // Preserve local items that may be newly added and not yet in the cloud snapshot
  currentItems.forEach(item => {
    if (item && item.id !== undefined && item.id !== null) {
      const key = String(item.id);
      if (!mergedMap.has(key)) {
        mergedMap.set(key, item);
      }
    }
  });

  return Array.from(mergedMap.values());
}

/**
 * Initializes Firestore on first run with complete school dataset
 * If Firestore already has data/meta, it will not overwrite existing records.
 */
export async function ensureInitialFirestoreData(initialData: {
  students: Student[];
  teachers: Teacher[];
  staff: StaffMember[];
  classes: ClassStream[];
  batches: AcademicBatch[];
  subjects: SubjectDefinition[];
  timetable: TimetablePeriod[];
  fees: FeeItem[];
  events: SchoolEvent[];
  messages: UserMessage[];
  gradebook: GradebookData;
  schoolProfile: SchoolProfile;
  termlyReports: Record<number, Record<string, TermlyReportCard>>;
  resultsApprovals: Record<number, Record<string, TermResultsApproval>>;
}): Promise<void> {
  const metaPath = `${COLLECTIONS.SCHOOL_CONFIG}/meta`;
  try {
    const metaSnap = await getDoc(doc(db, COLLECTIONS.SCHOOL_CONFIG, 'meta'));
    if (metaSnap.exists()) {
      return;
    }

    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (!studentsSnap.empty) {
      await setDoc(doc(db, COLLECTIONS.SCHOOL_CONFIG, 'meta'), {
        isInitialized: true,
        initializedAt: new Date().toISOString()
      }, { merge: true });
      return;
    }

    // First time setup - seed Firestore with initial data
    const batch = writeBatch(db);

    // 1. Meta
    batch.set(doc(db, COLLECTIONS.SCHOOL_CONFIG, 'meta'), {
      isInitialized: true,
      initializedAt: new Date().toISOString(),
      version: '1.0'
    });

    // 2. Profile
    batch.set(doc(db, COLLECTIONS.SCHOOL_CONFIG, 'profile'), {
      ...initialData.schoolProfile,
      lastSyncedAt: new Date().toISOString()
    });

    // 3. Students
    initialData.students.forEach(s => {
      batch.set(doc(db, COLLECTIONS.STUDENTS, String(s.id)), s);
    });

    // 4. Teachers
    initialData.teachers.forEach(t => {
      batch.set(doc(db, COLLECTIONS.TEACHERS, String(t.id)), t);
    });

    // 5. Staff
    initialData.staff.forEach(st => {
      batch.set(doc(db, COLLECTIONS.STAFF, String(st.id)), st);
    });

    // 6. Classes
    initialData.classes.forEach(c => {
      batch.set(doc(db, COLLECTIONS.CLASSES, String(c.id)), c);
    });

    // 7. Batches
    initialData.batches.forEach(b => {
      batch.set(doc(db, COLLECTIONS.BATCHES, String(b.id)), b);
    });

    // 8. Subjects
    initialData.subjects.forEach(sub => {
      batch.set(doc(db, COLLECTIONS.SUBJECTS, String(sub.id)), sub);
    });

    // 9. Fees
    initialData.fees.forEach(f => {
      batch.set(doc(db, COLLECTIONS.FEES, String(f.id)), f);
    });

    // 10. Events
    initialData.events.forEach(e => {
      batch.set(doc(db, COLLECTIONS.EVENTS, String(e.id)), e);
    });

    // 11. Messages
    initialData.messages.forEach(m => {
      batch.set(doc(db, COLLECTIONS.MESSAGES, String(m.id)), m);
    });

    // 12. Timetable
    batch.set(doc(db, COLLECTIONS.TIMETABLE, 'master_schedule'), {
      periods: initialData.timetable,
      updatedAt: new Date().toISOString()
    });

    // 13. Gradebook
    batch.set(doc(db, COLLECTIONS.GRADEBOOK, 'master_gradebook'), initialData.gradebook);

    // 14. Termly Reports
    batch.set(doc(db, COLLECTIONS.TERMLY_REPORTS, 'master_reports'), {
      reports: initialData.termlyReports,
      updatedAt: new Date().toISOString()
    });

    // 15. Results Approvals
    batch.set(doc(db, COLLECTIONS.RESULTS_APPROVALS, 'master_approvals'), {
      approvals: initialData.resultsApprovals,
      updatedAt: new Date().toISOString()
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, metaPath);
  }
}

/**
 * Saves or updates school configuration/profile
 */
export async function saveSchoolProfileToFirestore(profile: SchoolProfile): Promise<void> {
  const path = `${COLLECTIONS.SCHOOL_CONFIG}/profile`;
  try {
    await setDoc(doc(db, COLLECTIONS.SCHOOL_CONFIG, 'profile'), {
      ...profile,
      lastSyncedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Full master snapshot synchronization to Firestore
 * Guarantees cross-device / cross-session persistence
 */
export async function syncEntireDatasetToFirestore(payload: Record<string, any>): Promise<void> {
  const path = `${COLLECTIONS.SYNC_DATA}/main_school_dataset`;
  try {
    await setDoc(doc(db, COLLECTIONS.SYNC_DATA, 'main_school_dataset'), {
      ...payload,
      syncedAt: new Date().toISOString()
    }, { merge: true });

    // In parallel, persist primary collections so granular listeners get updated
    if (payload.schoolProfile) {
      saveSchoolProfileToFirestore(payload.schoolProfile).catch(() => {});
    }
    if (Array.isArray(payload.students)) {
      payload.students.forEach((s: Student) => {
        saveStudentToFirestore(s).catch(() => {});
      });
    }
    if (Array.isArray(payload.teachers)) {
      payload.teachers.forEach((t: Teacher) => {
        saveTeacherToFirestore(t).catch(() => {});
      });
    }
    if (Array.isArray(payload.classes)) {
      payload.classes.forEach((c: ClassStream) => {
        saveClassToFirestore(c).catch(() => {});
      });
    }
    if (payload.gradebook) {
      saveGradebookToFirestore(payload.gradebook).catch(() => {});
    }
    if (payload.attendanceRecords) {
      saveAttendanceToFirestore(payload.attendanceRecords).catch(() => {});
    }
    if (payload.termlyReports) {
      saveTermlyReportsToFirestore(payload.termlyReports).catch(() => {});
    }
    if (payload.resultsApprovals) {
      saveResultsApprovalsToFirestore(payload.resultsApprovals).catch(() => {});
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Loads cloud dataset snapshot on app start
 */
export async function loadEntireDatasetFromFirestore(): Promise<Record<string, any> | null> {
  const path = `${COLLECTIONS.SYNC_DATA}/main_school_dataset`;
  try {
    const snap = await getDoc(doc(db, COLLECTIONS.SYNC_DATA, 'main_school_dataset'));
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Purges all demo pupils, fees, marks, attendance, and transactional records from Cloud Firestore & LocalStorage
 * Leaves a 100% clean school database ready for user to enter their own real school data.
 */
export async function purgeAllDemoSchoolData(options?: {
  purgeStudentsOnly?: boolean;
  purgeTeachersToo?: boolean;
  purgeClassesToo?: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const collectionsToPurge = [
      COLLECTIONS.STUDENTS,
      COLLECTIONS.RECEIPTS,
      COLLECTIONS.ATTENDANCE,
      COLLECTIONS.DISCIPLINE,
      COLLECTIONS.EVENTS,
      COLLECTIONS.MESSAGES,
      COLLECTIONS.HOMEWORK,
      COLLECTIONS.EXAMS,
      COLLECTIONS.LIBRARY_CHECKOUTS,
      COLLECTIONS.HOSTEL_ALLOCATIONS,
      COLLECTIONS.TRANSPORT_PUPILS
    ];

    if (!options?.purgeStudentsOnly) {
      collectionsToPurge.push(COLLECTIONS.FEES);
    }
    if (options?.purgeTeachersToo) {
      collectionsToPurge.push(COLLECTIONS.TEACHERS);
      collectionsToPurge.push(COLLECTIONS.STAFF);
    }
    if (options?.purgeClassesToo) {
      collectionsToPurge.push(COLLECTIONS.CLASSES);
      collectionsToPurge.push(COLLECTIONS.BATCHES);
    }

    // Purge items from each collection
    for (const collName of collectionsToPurge) {
      try {
        const snap = await getDocs(collection(db, collName));
        if (!snap.empty) {
          const batch = writeBatch(db);
          snap.forEach(d => {
            batch.delete(d.ref);
          });
          await batch.commit();
        }
      } catch (err) {
        console.warn(`Notice while purging collection ${collName}:`, err);
      }
    }

    // Reset master docs in Firestore
    try {
      await setDoc(doc(db, COLLECTIONS.GRADEBOOK, 'master_gradebook'), { assessments: [], updatedAt: new Date().toISOString() });
      await setDoc(doc(db, COLLECTIONS.TERMLY_REPORTS, 'master_reports'), { reports: [], updatedAt: new Date().toISOString() });
      await setDoc(doc(db, COLLECTIONS.RESULTS_APPROVALS, 'master_approvals'), { approvals: [], updatedAt: new Date().toISOString() });
      await setDoc(doc(db, COLLECTIONS.SCHOOL_CONFIG, 'meta'), {
        isInitialized: true,
        cleanedForUser: true,
        cleanedAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("Notice while resetting master docs:", err);
    }

    // Set empty arrays in localStorage so reload starts fresh without re-seeding demo records
    const emptyKeys: Record<string, string> = {
      zambian_school_students: "[]",
      zambian_school_receipts: "[]",
      zambian_school_attendance: "[]",
      zambian_school_gradebook: JSON.stringify({ assessments: [] }),
      zambian_school_termly_reports: "[]",
      zambian_school_results_approvals: "[]",
      zambian_school_discipline: "[]",
      zambian_school_events: "[]",
      zambian_school_messages: "[]",
      zambian_school_homework: "[]",
      zambian_school_exams: "[]",
      zambian_school_library_checkouts: "[]",
      zambian_school_hostel_allocations: "[]",
      zambian_school_transport_pupils: "[]"
    };

    if (!options?.purgeStudentsOnly) {
      emptyKeys["zambian_school_fees"] = "[]";
    }
    if (options?.purgeTeachersToo) {
      emptyKeys["zambian_school_teachers"] = "[]";
      emptyKeys["zambian_school_staff"] = "[]";
    }
    if (options?.purgeClassesToo) {
      emptyKeys["zambian_school_classes"] = "[]";
      emptyKeys["zambian_school_batches"] = "[]";
    }

    Object.entries(emptyKeys).forEach(([k, v]) => {
      try {
        localStorage.setItem(k, v);
      } catch (_) {}
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error during school data purge:", error);
    return { success: false, error: error?.message || "Unknown error during purge" };
  }
}

/**
 * Student CRUD in Firestore
 */
export async function saveStudentToFirestore(student: Student): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${student.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STUDENTS, String(student.id)), {
      ...student,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStudentFromFirestore(studentId: number | string): Promise<void> {
  const path = `${COLLECTIONS.STUDENTS}/${studentId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, String(studentId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Teacher CRUD in Firestore
 */
export async function saveTeacherToFirestore(teacher: Teacher): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacher.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TEACHERS, String(teacher.id)), {
      ...teacher,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTeacherFromFirestore(teacherId: number | string): Promise<void> {
  const path = `${COLLECTIONS.TEACHERS}/${teacherId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TEACHERS, String(teacherId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Staff CRUD in Firestore
 */
export async function saveStaffMemberToFirestore(staff: StaffMember): Promise<void> {
  const path = `${COLLECTIONS.STAFF}/${staff.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.STAFF, String(staff.id)), {
      ...staff,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteStaffMemberFromFirestore(staffId: number | string): Promise<void> {
  const path = `${COLLECTIONS.STAFF}/${staffId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.STAFF, String(staffId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Class Stream CRUD in Firestore
 */
export async function saveClassToFirestore(cls: ClassStream): Promise<void> {
  const path = `${COLLECTIONS.CLASSES}/${cls.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.CLASSES, String(cls.id)), {
      ...cls,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteClassFromFirestore(classId: number | string): Promise<void> {
  const path = `${COLLECTIONS.CLASSES}/${classId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.CLASSES, String(classId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Batch CRUD in Firestore
 */
export async function saveBatchToFirestore(batch: AcademicBatch): Promise<void> {
  const path = `${COLLECTIONS.BATCHES}/${batch.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.BATCHES, String(batch.id)), {
      ...batch,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBatchFromFirestore(batchId: string): Promise<void> {
  const path = `${COLLECTIONS.BATCHES}/${batchId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.BATCHES, String(batchId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subject Curriculum CRUD in Firestore
 */
export async function saveSubjectToFirestore(subject: SubjectDefinition): Promise<void> {
  const path = `${COLLECTIONS.SUBJECTS}/${subject.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.SUBJECTS, String(subject.id)), {
      ...subject,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSubjectFromFirestore(subjectId: string): Promise<void> {
  const path = `${COLLECTIONS.SUBJECTS}/${subjectId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.SUBJECTS, String(subjectId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Class Timetable in Firestore
 */
export async function saveTimetableToFirestore(periods: TimetablePeriod[]): Promise<void> {
  const path = `${COLLECTIONS.TIMETABLE}/master_schedule`;
  try {
    await setDoc(doc(db, COLLECTIONS.TIMETABLE, 'master_schedule'), {
      periods,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Fee Invoices & Receipts in Firestore
 */
export async function saveFeeToFirestore(fee: FeeItem): Promise<void> {
  const path = `${COLLECTIONS.FEES}/${fee.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.FEES, String(fee.id)), {
      ...fee,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFeeFromFirestore(feeId: number | string): Promise<void> {
  const path = `${COLLECTIONS.FEES}/${feeId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.FEES, String(feeId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveReceiptToFirestore(receipt: PaymentReceipt): Promise<void> {
  const path = `${COLLECTIONS.RECEIPTS}/${receipt.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.RECEIPTS, String(receipt.id)), {
      ...receipt,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Calendar Events in Firestore
 */
export async function saveEventToFirestore(event: SchoolEvent): Promise<void> {
  const path = `${COLLECTIONS.EVENTS}/${event.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EVENTS, String(event.id)), {
      ...event,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEventFromFirestore(eventId: number | string): Promise<void> {
  const path = `${COLLECTIONS.EVENTS}/${eventId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EVENTS, String(eventId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Broadcasts & Internal Messages
 */
export async function saveMessageToFirestore(msg: UserMessage): Promise<void> {
  const path = `${COLLECTIONS.MESSAGES}/${msg.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.MESSAGES, String(msg.id)), {
      ...msg,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Master Gradebook & ECZ Examination Marks
 */
export async function saveGradebookToFirestore(gradebook: GradebookData): Promise<void> {
  const path = `${COLLECTIONS.GRADEBOOK}/master_gradebook`;
  try {
    await setDoc(doc(db, COLLECTIONS.GRADEBOOK, 'master_gradebook'), gradebook, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Master Attendance Records
 */
export async function saveAttendanceToFirestore(records: AttendanceRecord[]): Promise<void> {
  const path = `${COLLECTIONS.ATTENDANCE}/master_attendance`;
  try {
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, 'master_attendance'), {
      records,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Termly Report Card Remarks
 */
export async function saveTermlyReportsToFirestore(reports: Record<number, Record<string, TermlyReportCard>>): Promise<void> {
  const path = `${COLLECTIONS.TERMLY_REPORTS}/master_reports`;
  try {
    await setDoc(doc(db, COLLECTIONS.TERMLY_REPORTS, 'master_reports'), {
      reports,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Term Results Approval Workflow
 */
export async function saveResultsApprovalsToFirestore(approvals: Record<number, Record<string, TermResultsApproval>>): Promise<void> {
  const path = `${COLLECTIONS.RESULTS_APPROVALS}/master_approvals`;
  try {
    await setDoc(doc(db, COLLECTIONS.RESULTS_APPROVALS, 'master_approvals'), {
      approvals,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Homework Tasks
 */
export async function saveHomeworkToFirestore(task: HomeworkTask): Promise<void> {
  const path = `${COLLECTIONS.HOMEWORK}/${task.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.HOMEWORK, String(task.id)), {
      ...task,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteHomeworkFromFirestore(taskId: number): Promise<void> {
  const path = `${COLLECTIONS.HOMEWORK}/${taskId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.HOMEWORK, String(taskId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Examination Timetable Schedules
 */
export async function saveExamToFirestore(exam: ExamSchedule): Promise<void> {
  const path = `${COLLECTIONS.EXAMS}/${exam.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.EXAMS, String(exam.id)), {
      ...exam,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExamFromFirestore(examId: number): Promise<void> {
  const path = `${COLLECTIONS.EXAMS}/${examId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.EXAMS, String(examId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * School Library & Circulation
 */
export async function saveLibraryBookToFirestore(book: LibraryBook): Promise<void> {
  const path = `${COLLECTIONS.LIBRARY}/${book.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.LIBRARY, String(book.id)), {
      ...book,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteLibraryBookFromFirestore(bookId: number): Promise<void> {
  const path = `${COLLECTIONS.LIBRARY}/${bookId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.LIBRARY, String(bookId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Transport Routes
 */
export async function saveTransportRouteToFirestore(route: TransportRoute): Promise<void> {
  const path = `${COLLECTIONS.TRANSPORT_ROUTES}/${route.id}`;
  try {
    await setDoc(doc(db, COLLECTIONS.TRANSPORT_ROUTES, String(route.id)), {
      ...route,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteTransportRouteFromFirestore(routeId: number): Promise<void> {
  const path = `${COLLECTIONS.TRANSPORT_ROUTES}/${routeId}`;
  try {
    await deleteDoc(doc(db, COLLECTIONS.TRANSPORT_ROUTES, String(routeId)));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time bidirectional Firestore subscriptions for all modules
 */
export function subscribeToRealtimeSchoolData(callbacks: {
  onProfileChange?: (profile: SchoolProfile) => void;
  onStudentsChange?: (students: Student[]) => void;
  onTeachersChange?: (teachers: Teacher[]) => void;
  onStaffChange?: (staff: StaffMember[]) => void;
  onClassesChange?: (classes: ClassStream[]) => void;
  onBatchesChange?: (batches: AcademicBatch[]) => void;
  onSubjectsChange?: (subjects: SubjectDefinition[]) => void;
  onTimetableChange?: (timetable: TimetablePeriod[]) => void;
  onFeesChange?: (fees: FeeItem[]) => void;
  onReceiptsChange?: (receipts: PaymentReceipt[]) => void;
  onEventsChange?: (events: SchoolEvent[]) => void;
  onMessagesChange?: (messages: UserMessage[]) => void;
  onGradebookChange?: (gradebook: GradebookData) => void;
  onAttendanceChange?: (attendance: AttendanceRecord[]) => void;
  onTermlyReportsChange?: (reports: Record<number, Record<string, TermlyReportCard>>) => void;
  onResultsApprovalsChange?: (approvals: Record<number, Record<string, TermResultsApproval>>) => void;
  onHomeworkChange?: (homework: HomeworkTask[]) => void;
  onExamsChange?: (exams: ExamSchedule[]) => void;
  onLibraryChange?: (books: LibraryBook[]) => void;
  onTransportRoutesChange?: (routes: TransportRoute[]) => void;
}): RealtimeAppSubscriptions {
  const unsubscribers: Unsubscribe[] = [];

  // 1. Profile
  if (callbacks.onProfileChange) {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.SCHOOL_CONFIG, 'profile'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SchoolProfile;
          if (data && Object.keys(data).length > 2) {
            callbacks.onProfileChange!(data);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.SCHOOL_CONFIG}/profile`)
    );
    unsubscribers.push(unsub);
  }

  // 2. Students Collection
  if (callbacks.onStudentsChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.STUDENTS),
      (snapshot) => {
        const list: Student[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as Student;
          if (val && val.name) list.push(val);
        });
        callbacks.onStudentsChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.STUDENTS)
    );
    unsubscribers.push(unsub);
  }

  // 3. Teachers Collection
  if (callbacks.onTeachersChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.TEACHERS),
      (snapshot) => {
        const list: Teacher[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as Teacher;
          if (val && val.name) list.push(val);
        });
        callbacks.onTeachersChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TEACHERS)
    );
    unsubscribers.push(unsub);
  }

  // 4. Staff Collection
  if (callbacks.onStaffChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.STAFF),
      (snapshot) => {
        const list: StaffMember[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as StaffMember;
          if (val && val.name) list.push(val);
        });
        callbacks.onStaffChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.STAFF)
    );
    unsubscribers.push(unsub);
  }

  // 5. Classes Collection
  if (callbacks.onClassesChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.CLASSES),
      (snapshot) => {
        const list: ClassStream[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as ClassStream;
          if (val && val.name) list.push(val);
        });
        callbacks.onClassesChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.CLASSES)
    );
    unsubscribers.push(unsub);
  }

  // 6. Batches Collection
  if (callbacks.onBatchesChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.BATCHES),
      (snapshot) => {
        const list: AcademicBatch[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as AcademicBatch;
          if (val && val.name) list.push(val);
        });
        callbacks.onBatchesChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.BATCHES)
    );
    unsubscribers.push(unsub);
  }

  // 7. Subjects Collection
  if (callbacks.onSubjectsChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.SUBJECTS),
      (snapshot) => {
        const list: SubjectDefinition[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as SubjectDefinition;
          if (val && val.name) list.push(val);
        });
        callbacks.onSubjectsChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.SUBJECTS)
    );
    unsubscribers.push(unsub);
  }

  // 8. Timetable
  if (callbacks.onTimetableChange) {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.TIMETABLE, 'master_schedule'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.periods)) {
            callbacks.onTimetableChange!(data.periods as TimetablePeriod[]);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.TIMETABLE}/master_schedule`)
    );
    unsubscribers.push(unsub);
  }

  // 9. Fees Collection
  if (callbacks.onFeesChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.FEES),
      (snapshot) => {
        const list: FeeItem[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as FeeItem;
          if (val && val.id) list.push(val);
        });
        callbacks.onFeesChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.FEES)
    );
    unsubscribers.push(unsub);
  }

  // 10. Receipts Collection
  if (callbacks.onReceiptsChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.RECEIPTS),
      (snapshot) => {
        const list: PaymentReceipt[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as PaymentReceipt;
          if (val && val.id) list.push(val);
        });
        callbacks.onReceiptsChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.RECEIPTS)
    );
    unsubscribers.push(unsub);
  }

  // 11. Events Collection
  if (callbacks.onEventsChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.EVENTS),
      (snapshot) => {
        const list: SchoolEvent[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as SchoolEvent;
          if (val && val.title) list.push(val);
        });
        callbacks.onEventsChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.EVENTS)
    );
    unsubscribers.push(unsub);
  }

  // 12. Messages Collection
  if (callbacks.onMessagesChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.MESSAGES),
      (snapshot) => {
        const list: UserMessage[] = [];
        snapshot.forEach((d) => {
          const val = d.data() as UserMessage;
          if (val && val.subject) list.push(val);
        });
        callbacks.onMessagesChange!(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.MESSAGES)
    );
    unsubscribers.push(unsub);
  }

  // 13. Gradebook
  if (callbacks.onGradebookChange) {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.GRADEBOOK, 'master_gradebook'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as GradebookData;
          if (data && Object.keys(data).length > 0) {
            callbacks.onGradebookChange!(data);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.GRADEBOOK}/master_gradebook`)
    );
    unsubscribers.push(unsub);
  }

  // 14. Attendance
  if (callbacks.onAttendanceChange) {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.ATTENDANCE, 'master_attendance'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && Array.isArray(data.records) && data.records.length > 0) {
            callbacks.onAttendanceChange!(data.records as AttendanceRecord[]);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.ATTENDANCE}/master_attendance`)
    );
    unsubscribers.push(unsub);
  }

  // 15. Termly Reports
  if (callbacks.onTermlyReportsChange) {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.TERMLY_REPORTS, 'master_reports'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.reports) {
            callbacks.onTermlyReportsChange!(data.reports);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.TERMLY_REPORTS}/master_reports`)
    );
    unsubscribers.push(unsub);
  }

  // 16. Results Approvals
  if (callbacks.onResultsApprovalsChange) {
    const unsub = onSnapshot(
      doc(db, COLLECTIONS.RESULTS_APPROVALS, 'master_approvals'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && data.approvals) {
            callbacks.onResultsApprovalsChange!(data.approvals);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `${COLLECTIONS.RESULTS_APPROVALS}/master_approvals`)
    );
    unsubscribers.push(unsub);
  }

  // 17. Homework
  if (callbacks.onHomeworkChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.HOMEWORK),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: HomeworkTask[] = [];
          snapshot.forEach((d) => {
            const val = d.data() as HomeworkTask;
            if (val && val.title) list.push(val);
          });
          if (list.length > 0) {
            callbacks.onHomeworkChange!(list);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.HOMEWORK)
    );
    unsubscribers.push(unsub);
  }

  // 18. Exams
  if (callbacks.onExamsChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.EXAMS),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: ExamSchedule[] = [];
          snapshot.forEach((d) => {
            const val = d.data() as ExamSchedule;
            if (val && val.subject) list.push(val);
          });
          if (list.length > 0) {
            callbacks.onExamsChange!(list);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.EXAMS)
    );
    unsubscribers.push(unsub);
  }

  // 19. Library Books
  if (callbacks.onLibraryChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.LIBRARY),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: LibraryBook[] = [];
          snapshot.forEach((d) => {
            const val = d.data() as LibraryBook;
            if (val && val.title) list.push(val);
          });
          if (list.length > 0) {
            callbacks.onLibraryChange!(list);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.LIBRARY)
    );
    unsubscribers.push(unsub);
  }

  // 20. Transport Routes
  if (callbacks.onTransportRoutesChange) {
    const unsub = onSnapshot(
      collection(db, COLLECTIONS.TRANSPORT_ROUTES),
      (snapshot) => {
        if (!snapshot.empty) {
          const list: TransportRoute[] = [];
          snapshot.forEach((d) => {
            const val = d.data() as TransportRoute;
            if (val && val.routeName) list.push(val);
          });
          if (list.length > 0) {
            callbacks.onTransportRoutesChange!(list);
          }
        }
      },
      (err) => handleFirestoreError(err, OperationType.LIST, COLLECTIONS.TRANSPORT_ROUTES)
    );
    unsubscribers.push(unsub);
  }

  return {
    unsubscribeAll: () => {
      unsubscribers.forEach((u) => {
        try {
          u();
        } catch (_) {}
      });
    }
  };
}

