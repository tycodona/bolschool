import { RoleType, UserSession, Student, Teacher, ParentAccount } from "../types";

export interface ParsedRoute {
  role: RoleType | null;
  username: string | null;
  tab: string | null;
  studentId: number | null;
  autoLogin: boolean;
  isApplyPortal?: boolean;
}

/**
 * Parses URL query parameters, hash, or pathname to detect portal role and user.
 */
export function parseCurrentRoute(): ParsedRoute {
  if (typeof window === "undefined") {
    return { role: null, username: null, tab: null, studentId: null, autoLogin: false, isApplyPortal: false };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  // Special Pupil Application / Self-Registration route detection
  const isApply =
    searchParams.get("portal") === "apply" ||
    searchParams.get("apply") === "true" ||
    searchParams.get("role") === "apply" ||
    searchParams.get("tab") === "apply" ||
    hash.includes("apply") ||
    hash.includes("register") ||
    pathname.includes("/apply") ||
    pathname.includes("/register");

  // Role resolution
  let roleParam = (searchParams.get("role") || searchParams.get("portal") || "").toLowerCase();
  
  // If not in search params, check pathname or hash
  if (!roleParam) {
    if (hash.includes("admin") || pathname.includes("/admin")) roleParam = "admin";
    else if (hash.includes("teacher") || pathname.includes("/teacher")) roleParam = "teacher";
    else if (hash.includes("parent") || pathname.includes("/parent")) roleParam = "parent";
    else if (hash.includes("student") || hash.includes("pupil") || pathname.includes("/student") || pathname.includes("/pupil")) roleParam = "student";
  }

  let role: RoleType | null = null;
  if (roleParam === "admin" || roleParam === "headteacher") role = "admin";
  else if (roleParam === "teacher" || roleParam === "staff") role = "teacher";
  else if (roleParam === "parent" || roleParam === "guardian") role = "parent";
  else if (roleParam === "student" || roleParam === "pupil") role = "student";

  // Username
  const username = searchParams.get("user") || searchParams.get("username") || searchParams.get("u") || null;
  
  // Tab
  const tab = searchParams.get("tab") || null;

  // Student ID
  const studentIdParam = searchParams.get("studentId") || searchParams.get("id");
  const studentId = studentIdParam ? parseInt(studentIdParam) : null;

  // Auto login flag (default true if user or role is passed)
  const autoLogin = searchParams.get("autologin") !== "false";

  return {
    role,
    username: username ? username.trim().toLowerCase() : null,
    tab,
    studentId: studentId && !isNaN(studentId) ? studentId : null,
    autoLogin,
    isApplyPortal: isApply
  };
}

/**
 * Builds special online pupil application and registration URL.
 */
export function buildApplyUrl(params?: {
  grade?: string;
  section?: "Primary" | "Secondary";
}): string {
  if (typeof window === "undefined") {
    const q = new URLSearchParams();
    q.set("portal", "apply");
    if (params?.section) q.set("section", params.section);
    if (params?.grade) q.set("grade", params.grade);
    return `?${q.toString()}`;
  }

  const base = `${window.location.origin}${window.location.pathname}`;
  const q = new URLSearchParams();
  q.set("portal", "apply");
  if (params?.section) q.set("section", params.section);
  if (params?.grade) q.set("grade", params.grade);

  return `${base}?${q.toString()}`;
}

/**
 * Builds full absolute URL for a given role, user, tab, and optional pupil id.
 */
export function buildPortalUrl(params: {
  role: RoleType;
  username?: string;
  tab?: string;
  studentId?: number;
}): string {
  if (typeof window === "undefined") {
    const q = new URLSearchParams();
    q.set("role", params.role);
    if (params.username) q.set("user", params.username);
    if (params.tab) q.set("tab", params.tab);
    if (params.studentId) q.set("studentId", String(params.studentId));
    return `?${q.toString()}`;
  }

  const base = `${window.location.origin}${window.location.pathname}`;
  const q = new URLSearchParams();
  q.set("role", params.role);
  if (params.username) q.set("user", params.username);
  if (params.tab) q.set("tab", params.tab);
  if (params.studentId) q.set("studentId", String(params.studentId));

  return `${base}?${q.toString()}`;
}

/**
 * Updates the browser's address bar without reloading the page.
 */
export function updateBrowserUrl(session: UserSession | null, activeTab?: string) {
  if (typeof window === "undefined" || !window.history?.replaceState) return;

  const url = new URL(window.location.href);
  
  if (!session) {
    // If logged out, preserve any role hint or clear
    return;
  }

  url.searchParams.set("role", session.role);

  if (session.role === "admin") {
    url.searchParams.delete("user");
  } else if (session.role === "teacher" && session.teacher) {
    url.searchParams.set("user", session.teacher.username);
  } else if (session.role === "parent" && session.parent) {
    url.searchParams.set("user", session.parent.username);
  } else if (session.role === "student" && session.student) {
    url.searchParams.set("user", session.student.username);
  }

  if (activeTab) {
    url.searchParams.set("tab", activeTab);
  }

  window.history.replaceState({}, "", url.toString());
}

/**
 * Resolves a UserSession from parsed route parameters and data lists.
 */
export function resolveSessionFromRoute(
  route: ParsedRoute,
  teachers: Teacher[],
  students: Student[],
  parents: ParentAccount[]
): { session: UserSession | null; targetTab?: string } {
  let role = route.role;

  // Auto-detect role from username or studentId if role is not explicitly provided
  if (!role) {
    if (route.username) {
      const u = route.username.toLowerCase();
      if (u === "admin" || u === "headteacher") {
        role = "admin";
      } else if (teachers.some(t => t.username.toLowerCase() === u)) {
        role = "teacher";
      } else if (parents.some(p => p.username.toLowerCase() === u)) {
        role = "parent";
      } else if (students.some(s => s.username.toLowerCase() === u || s.eczNo.toLowerCase() === u)) {
        role = "student";
      }
    } else if (route.studentId) {
      role = "student";
    }
  }

  if (!role) return { session: null };

  if (role === "admin") {
    return {
      session: { role: "admin", adminName: "Mr. Davison Banda (Headteacher)" },
      targetTab: route.tab || "Dashboard"
    };
  }

  if (role === "teacher") {
    const teacher = route.username
      ? teachers.find(t => t.username.toLowerCase() === route.username) || teachers[0]
      : teachers[0];
    
    return {
      session: teacher ? { role: "teacher", teacher } : null,
      targetTab: route.tab || "Grading"
    };
  }

  if (role === "parent") {
    const parent = route.username
      ? parents.find(p => p.username.toLowerCase() === route.username) || parents[0]
      : parents[0];
    
    return {
      session: parent ? { role: "parent", parent } : null,
      targetTab: route.tab || "ReportCards"
    };
  }

  if (role === "student") {
    let student: Student | undefined;
    if (route.studentId) {
      student = students.find(s => s.id === route.studentId);
    }
    if (!student && route.username) {
      student = students.find(
        s => s.username.toLowerCase() === route.username || s.eczNo.toLowerCase() === route.username
      );
    }
    if (!student) {
      student = students[0];
    }

    return {
      session: student ? { role: "student", student } : null,
      targetTab: route.tab || "ReportCards"
    };
  }

  return { session: null };
}

/**
 * Helper to copy text to clipboard with fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-999999px";
      textarea.style.top = "-999999px";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    }
  } catch (err) {
    console.error("Failed to copy link:", err);
    return false;
  }
}
