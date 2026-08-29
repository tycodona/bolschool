import React, { useState } from "react";
import {
  BookOpen,
  FileCode,
  Server,
  Shield,
  Key,
  Users,
  Database,
  Terminal,
  Layers,
  HelpCircle,
  Code2,
  CheckCircle2,
  Copy,
  Check
} from "lucide-react";

export function DocumentationModule() {
  const [activeSection, setActiveSection] = useState<
    "overview" | "installation" | "schema" | "env" | "admin" | "api"
  >("overview");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div id="system-documentation-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              RYNTECH SMS — Technical & Administrative Documentation
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Complete institutional manual, installation guides, database architecture, and integration API references.
          </p>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 border-b border-slate-200 pb-4 text-xs font-semibold">
        <button
          onClick={() => setActiveSection("overview")}
          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
            activeSection === "overview"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          System Overview
        </button>
        <button
          onClick={() => setActiveSection("installation")}
          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
            activeSection === "installation"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Installation & Setup
        </button>
        <button
          onClick={() => setActiveSection("schema")}
          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
            activeSection === "schema"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Database Schema
        </button>
        <button
          onClick={() => setActiveSection("env")}
          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
            activeSection === "env"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Environment Config
        </button>
        <button
          onClick={() => setActiveSection("admin")}
          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
            activeSection === "admin"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Administrator Guide
        </button>
        <button
          onClick={() => setActiveSection("api")}
          className={`p-2.5 rounded-lg text-left transition-colors cursor-pointer ${
            activeSection === "api"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          API Endpoints & Specs
        </button>
      </div>

      {/* Section 1: Overview */}
      {activeSection === "overview" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">1. System Overview & Architecture</h3>
            <p className="text-xs text-slate-500 mt-1">
              Engineered specifically for Zambian primary, secondary, and combined educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-700" />
                <span>10 Role-Based Access Control (RBAC)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Super Administrator, School Administrator, Head Teacher, Deputy Head, Teacher, Accountant / Bursar, Secretary, Librarian, Parent / Guardian, and Pupil.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Examinations Council of Zambia (ECZ) Standard</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Built-in 9-point scale (Distinction 1-2, Merit 3-4, Credit 5-6, Pass 7-8, Unsatisfactory 9) and 3-Term academic calendar structure.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Key Functional Modules</h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Complete Student & Parent Management (ECZ numbers, NRC, addresses)</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Teacher & Staff Roster (TSC registration, qualifications, payroll)</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Fee Invoicing, Mobile Money (Airtel, MTN, Zamtel) & Printable Receipts</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Continuous Assessment (CA), Exams & Termly Official Report Cards</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Library Management, Cataloging & Overdue Tracking</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Asset & Inventory Management with Condition & Maintenance Tracking</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Hostel / Boarding Dormitories & School Bus Transport Fleet</span>
              </li>
              <li className="flex items-center gap-2 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Immutable System Audit Logs, JSON Backup & Restore Engine</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Section 2: Installation */}
      {activeSection === "installation" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">2. Deployment & Installation Guide</h3>
            <p className="text-xs text-slate-500 mt-1">
              Step-by-step instructions to run locally, on an on-premise school server, or deploy to Cloud Run / VPS.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between font-semibold text-xs text-slate-900 mb-1">
                <span>1. Clone Repository & Install Dependencies</span>
                <button
                  onClick={() => handleCopy("git clone https://github.com/ryntech/school-management.git\ncd school-management\nnpm install", "c1")}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-[11px] cursor-pointer"
                >
                  {copiedCode === "c1" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === "c1" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`git clone https://github.com/ryntech/school-management.git
cd school-management
npm install`}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between font-semibold text-xs text-slate-900 mb-1">
                <span>2. Development Server Execution (Binds to Port 3000)</span>
                <button
                  onClick={() => handleCopy("npm run dev", "c2")}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-[11px] cursor-pointer"
                >
                  {copiedCode === "c2" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === "c2" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`npm run dev`}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between font-semibold text-xs text-slate-900 mb-1">
                <span>3. Production Build & Bundling</span>
                <button
                  onClick={() => handleCopy("npm run build\nnpm start", "c3")}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-[11px] cursor-pointer"
                >
                  {copiedCode === "c3" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === "c3" ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-3 rounded-lg text-xs font-mono overflow-x-auto">
{`npm run build
npm start`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Section 3: Schema */}
      {activeSection === "schema" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">3. Relational Database Schema & Entities</h3>
            <p className="text-xs text-slate-500 mt-1">
              Core database models supporting PostgreSQL, SQLite, or Firestore storage engines.
            </p>
          </div>

          <pre className="bg-slate-950 text-sky-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`-- Students Table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    ecz_number VARCHAR(30) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female')),
    date_of_birth DATE NOT NULL,
    nrc_number VARCHAR(20),
    grade VARCHAR(20) NOT NULL,
    stream VARCHAR(30) NOT NULL,
    secondary_pathway VARCHAR(50),
    is_boarding BOOLEAN DEFAULT FALSE,
    guardian_id INTEGER REFERENCES guardians(id),
    status VARCHAR(20) DEFAULT 'Active'
);

-- Fee Payments & Invoices
CREATE TABLE fee_items (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    fee_type VARCHAR(100) NOT NULL,
    amount_zmw NUMERIC(10, 2) NOT NULL,
    paid_zmw NUMERIC(10, 2) DEFAULT 0.00,
    balance_zmw NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending'
);

-- Official Receipts
CREATE TABLE payment_receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INTEGER REFERENCES students(id),
    amount_paid_zmw NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL, -- Airtel Money, MTN MoMo, Bank
    reference_number VARCHAR(100) NOT NULL,
    payment_date DATE NOT NULL,
    collected_by VARCHAR(100) NOT NULL
);

-- Academic Marks & Continuous Assessment
CREATE TABLE marks_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    subject_code VARCHAR(30) NOT NULL,
    term VARCHAR(20) NOT NULL,
    academic_year INTEGER NOT NULL,
    ca_score NUMERIC(5, 2), -- 40% Continuous Assessment
    exam_score NUMERIC(5, 2), -- 60% End of Term Examination
    total_score NUMERIC(5, 2),
    ecz_grade VARCHAR(10),
    teacher_remarks TEXT
);`}
          </pre>
        </div>
      )}

      {/* Section 4: Env */}
      {activeSection === "env" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">4. Environment Variable Configuration</h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure sandbox or production payment credentials, SMS gateways, and server runtime variables.
            </p>
          </div>

          <pre className="bg-slate-950 text-amber-300 p-4 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
{`# Server Runtime
PORT=3000
NODE_ENV=production
SESSION_SECRET=ryntech-sms-secure-jwt-secret-2026

# Zambian Mobile Money Gateways (Sandbox / Live)
AIRTEL_MONEY_CLIENT_ID=ryntech_airtel_sandbox_id
AIRTEL_MONEY_SECRET=ryntech_airtel_sandbox_key
MTN_MOMO_API_KEY=ryntech_mtn_sandbox_key
MTN_MOMO_SUBSCRIPTION_KEY=ryntech_mtn_sub_key

# Bulk SMS & WhatsApp Integration (Zambia Local Telecom)
ZAMBIA_SMS_API_ENDPOINT=https://api.smszambia.co.zm/v1/send
ZAMBIA_SMS_SENDER_ID=RYNTECH
ZAMBIA_SMS_API_KEY=zm_sms_live_token_secret`}
          </pre>
        </div>
      )}

      {/* Section 5: Admin */}
      {activeSection === "admin" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">5. School Administrator Operating Guide</h3>
            <p className="text-xs text-slate-500 mt-1">
              Standard operating procedures for school term setup, student admissions, fee reconciliation, and report card publishing.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">A. Term Transition & Calendar Setup</h4>
              <p className="text-xs text-slate-600 mt-1">
                At the beginning of each term (Term 1: Jan–Apr, Term 2: May–Aug, Term 3: Sep–Dec), navigate to <strong>School Setup</strong> to verify the active academic year, term start and end dates, and examination weeks.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">B. Student Enrollment & Batch Imports</h4>
              <p className="text-xs text-slate-600 mt-1">
                Admissions can be entered individually with ECZ examination numbers or uploaded in bulk via CSV spreadsheet in <strong>Pupil Admissions</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-900 text-sm">C. End-of-Term Report Card Approvals</h4>
              <p className="text-xs text-slate-600 mt-1">
                Class teachers record marks and continuous assessment. The Head Teacher reviews class rankings and approves final report cards, making them instantly available for parents to view and download.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Section 6: API */}
      {activeSection === "api" && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-sm text-slate-700">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif">6. RESTful API Endpoints Specification</h3>
            <p className="text-xs text-slate-500 mt-1">
              Standardized HTTP JSON API routes for mobile applications and external ministry portals.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-emerald-800">GET /api/v1/students</span>
              <span className="text-slate-500">List all enrolled pupils with pagination and grade filters</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-blue-800">POST /api/v1/students</span>
              <span className="text-slate-500">Create pupil profile with ECZ verification</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-emerald-800">GET /api/v1/fees/receipts</span>
              <span className="text-slate-500">Fetch electronic fee payment receipts with tamper-proof signature</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-blue-800">POST /api/v1/payments/momo-webhook</span>
              <span className="text-slate-500">Airtel / MTN Mobile Money instant payment confirmation webhook</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="font-bold text-emerald-800">GET /api/v1/reports/report-card/:studentId</span>
              <span className="text-slate-500">Generate official ECZ formatted termly report card PDF</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
