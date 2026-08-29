import { useState } from "react";
import {
  Student,
  Teacher,
  StaffMember,
  FeeItem,
  PaymentReceipt,
  SubjectDefinition,
  DisciplineRecord,
  InventoryItem,
  LibraryBook,
  SchoolProfile
} from "../types";
import {
  BarChart3,
  FileSpreadsheet,
  Users,
  DollarSign,
  GraduationCap,
  AlertTriangle,
  Package,
  BookOpen,
  Calendar,
  Download,
  Printer
} from "lucide-react";
import { exportToCsv } from "../utils/csvExporter";

interface ReportsModuleProps {
  students: Student[];
  teachers: Teacher[];
  staff: StaffMember[];
  fees: FeeItem[];
  receipts: PaymentReceipt[];
  subjects: SubjectDefinition[];
  discipline: DisciplineRecord[];
  inventory: InventoryItem[];
  books: LibraryBook[];
  schoolProfile: SchoolProfile;
}

export function ReportsModule({
  students,
  teachers,
  staff,
  fees,
  receipts,
  subjects,
  discipline,
  inventory,
  books,
  schoolProfile
}: ReportsModuleProps) {
  const [reportCategory, setReportCategory] = useState<"enrollment" | "academic" | "finance" | "attendance" | "discipline" | "inventory">("enrollment");

  // Enrollment computations
  const totalStudents = students.length;
  const boysCount = students.filter(s => s.gender === "Male").length;
  const girlsCount = students.filter(s => s.gender === "Female").length;
  const boardingCount = students.filter(s => s.isBoarding).length;
  const dayCount = totalStudents - boardingCount;

  // Group by grade
  const gradeDistribution = students.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Finance computations
  const totalBilled = fees.reduce((acc, f) => acc + (f.amountZMW || 0), 0);
  const totalPaid = fees.reduce((acc, f) => acc + (f.paidAmountZMW || 0), 0);
  const totalBalance = Math.max(0, totalBilled - totalPaid);
  const collectionRate = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0;

  // Inventory computations
  const totalInventoryValue = inventory.reduce((acc, i) => acc + (i.purchasePriceZMW || 0), 0);

  const handleExportCurrentReport = () => {
    const filename = `RYNTECH_${reportCategory.toUpperCase()}_REPORT_2026`;
    let data: Record<string, unknown>[] = [];

    if (reportCategory === "enrollment") {
      data = students.map(s => ({
        "ECZ Number": s.eczNo,
        "Full Name": s.name,
        "Grade": s.grade,
        "Stream": s.stream,
        "Gender": s.gender,
        "Boarding Status": s.isBoarding ? "Boarding" : "Day Scholar",
        "Guardian": s.guardianName,
        "Guardian Phone": s.guardianPhone,
        "Status": s.status
      }));
    } else if (reportCategory === "finance") {
      data = fees.map(f => {
        const pupil = students.find(s => s.id === f.studentId);
        const bal = Math.max(0, (f.amountZMW || 0) - (f.paidAmountZMW || 0));
        return {
          "Student ID": f.studentId,
          "Student Name": pupil?.name || "Pupil",
          "Grade": pupil?.grade || "N/A",
          "Fee Type": f.description,
          "Total Billed (ZMW)": f.amountZMW,
          "Amount Paid (ZMW)": f.paidAmountZMW,
          "Remaining Balance (ZMW)": bal,
          "Status": f.status,
          "Due Date": f.dueDate
        };
      });
    } else if (reportCategory === "academic") {
      data = subjects.map(sub => ({
        "Subject Code": sub.code,
        "Subject Name": sub.name,
        "Applicable Grades": sub.gradesApplicable ? sub.gradesApplicable.join(", ") : "All",
        "Lead Teacher": sub.assignedTeacherName || "Department Head",
        "Weekly Periods": sub.weeklyPeriods,
        "Department": sub.department || "Academic",
        "Category": sub.category
      }));
    } else if (reportCategory === "discipline") {
      data = discipline.map(d => ({
        "Incident ID": d.id,
        "Student": d.studentName,
        "Grade": d.grade,
        "Infraction Type": d.infractionType,
        "Severity": d.severity,
        "Incident Date": d.incidentDate,
        "Action Taken": d.actionTaken,
        "Status": d.status
      }));
    } else if (reportCategory === "inventory") {
      data = inventory.map(i => ({
        "Asset Tag": i.assetTag,
        "Item Name": i.name,
        "Category": i.category,
        "Department": i.department,
        "Quantity": i.quantity,
        "Condition": i.condition,
        "Value (ZMW)": i.purchasePriceZMW,
        "Location": i.location
      }));
    }

    if (data.length > 0) {
      exportToCsv(filename, data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-serif">
                Institutional Reports & Statistical Analytics
              </h1>
              <p className="text-xs text-slate-500">
                Official Ministry of Education compliant reporting and data exports for {schoolProfile?.name || "RYNTECH School"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCurrentReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Sheet</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs for report categories */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setReportCategory("enrollment")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportCategory === "enrollment"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          Enrollment & Demographics
        </button>
        <button
          onClick={() => setReportCategory("finance")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportCategory === "finance"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Kwacha Fees & Revenue
        </button>
        <button
          onClick={() => setReportCategory("academic")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportCategory === "academic"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          Curriculum & Subject Catalog
        </button>
        <button
          onClick={() => setReportCategory("discipline")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportCategory === "discipline"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Discipline & Pastoral Conduct
        </button>
        <button
          onClick={() => setReportCategory("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            reportCategory === "inventory"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Package className="w-4 h-4" />
          Assets & School Property
        </button>
      </div>

      {/* Category 1: Enrollment */}
      {reportCategory === "enrollment" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrollment</div>
              <div className="text-3xl font-bold text-slate-900 mt-1 font-serif">{totalStudents}</div>
              <div className="text-xs text-slate-500 mt-1">Registered pupils in school</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender Breakdown</div>
              <div className="text-2xl font-bold text-slate-800 mt-1 font-serif">
                {boysCount} Boys / {girlsCount} Girls
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {Math.round((boysCount / totalStudents) * 100)}% Male • {Math.round((girlsCount / totalStudents) * 100)}% Female
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Boarding vs Day</div>
              <div className="text-2xl font-bold text-indigo-700 mt-1 font-serif">
                {boardingCount} Boarders
              </div>
              <div className="text-xs text-slate-500 mt-1">{dayCount} Day scholars</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Teaching Faculty</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">{teachers.length} Teachers</div>
              <div className="text-xs text-slate-500 mt-1">Pupil-teacher ratio: ~{Math.round(totalStudents / Math.max(1, teachers.length))}:1</div>
            </div>
          </div>

          {/* Grade Distribution Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Grade-by-Grade Pupil Distribution Roster
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Grade Level</th>
                    <th className="py-3 px-4 text-center">Boys</th>
                    <th className="py-3 px-4 text-center">Girls</th>
                    <th className="py-3 px-4 text-center">Total Pupils</th>
                    <th className="py-3 px-4 text-center">% of Student Body</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(gradeDistribution).map(([grade, count]) => {
                    const gradeBoys = students.filter(s => s.grade === grade && s.gender === "Male").length;
                    const gradeGirls = students.filter(s => s.grade === grade && s.gender === "Female").length;
                    const pct = Math.round((count / totalStudents) * 100);

                    return (
                      <tr key={grade} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{grade}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-blue-700">{gradeBoys}</td>
                        <td className="py-3.5 px-4 text-center font-medium text-pink-700">{gradeGirls}</td>
                        <td className="py-3.5 px-4 text-center font-bold text-slate-800">{count}</td>
                        <td className="py-3.5 px-4 text-center font-mono text-xs font-semibold text-slate-700">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category 2: Finance */}
      {reportCategory === "finance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed Revenue</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-serif">K{totalBilled.toLocaleString()}</div>
              <div className="text-xs text-slate-500 mt-1">Term 2 Total Fees</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kwacha Collected</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">K{totalPaid.toLocaleString()}</div>
              <div className="text-xs text-emerald-600 mt-1 font-semibold">{collectionRate}% Collection rate</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Arrears</div>
              <div className="text-2xl font-bold text-rose-700 mt-1 font-serif">K{totalBalance.toLocaleString()}</div>
              <div className="text-xs text-rose-600 mt-1">Pending parent payments</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Electronic Receipts</div>
              <div className="text-2xl font-bold text-sky-700 mt-1 font-serif">{receipts.length} Issued</div>
              <div className="text-xs text-slate-500 mt-1">Airtel, MTN, Bank deposits</div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Student Fee Ledgers & Arrears Aging Statement
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pupil Name</th>
                    <th className="py-3 px-4">Grade & Stream</th>
                    <th className="py-3 px-4">Fee Item</th>
                    <th className="py-3 px-4 text-right">Billed (ZMW)</th>
                    <th className="py-3 px-4 text-right">Paid (ZMW)</th>
                    <th className="py-3 px-4 text-right">Balance (ZMW)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fees.map((f) => {
                    const pupil = students.find(s => s.id === f.studentId);
                    const bal = Math.max(0, (f.amountZMW || 0) - (f.paidAmountZMW || 0));
                    return (
                      <tr key={f.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{pupil?.name || "Pupil"}</td>
                        <td className="py-3.5 px-4 text-xs text-slate-500">{pupil?.grade || "Grade"}</td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{f.description}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs">K{(f.amountZMW || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-emerald-700">K{(f.paidAmountZMW || 0).toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-rose-700">K{bal.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              f.status === "Paid" || bal === 0
                                ? "bg-emerald-100 text-emerald-800"
                                : f.paidAmountZMW > 0
                                ? "bg-amber-100 text-amber-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {f.status === "Paid" || bal === 0 ? "Paid Full" : f.paidAmountZMW > 0 ? "Partially Paid" : "Unpaid"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category 3: Academic / Curriculum */}
      {reportCategory === "academic" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Approved Zambia National Curriculum Subject Master List
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Name</th>
                    <th className="py-3 px-4">Applicable Grades</th>
                    <th className="py-3 px-4">Subject Lead / Teacher</th>
                    <th className="py-3 px-4 text-center">Periods / Wk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subjects.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-600">{s.code}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        {s.gradesApplicable ? `Grades ${s.gradesApplicable.join(", ")}` : "All"}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-emerald-800">{s.assignedTeacherName || "Staff"}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-bold text-slate-800">{s.weeklyPeriods}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category 4: Discipline */}
      {reportCategory === "discipline" && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Student Conduct & Pastoral Log Summary
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Incident Date</th>
                    <th className="py-3 px-4">Pupil Name</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Infraction Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Action Administered</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {discipline.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 text-xs text-slate-500">{d.incidentDate}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{d.studentName}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{d.grade}</td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">{d.infractionType}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.severity === "Critical" ? "bg-rose-100 text-rose-800" :
                          d.severity === "Major" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-800"
                        }`}>
                          {d.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-700">{d.actionTaken}</td>
                      <td className="py-3.5 px-4 text-center text-xs font-semibold text-slate-700">{d.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category 5: Inventory */}
      {reportCategory === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total School Assets</div>
              <div className="text-3xl font-bold text-slate-900 mt-1 font-serif">{inventory.length} Registered</div>
              <div className="text-xs text-slate-500 mt-1">Catalogued institutional equipment</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Valuation</div>
              <div className="text-2xl font-bold text-emerald-800 mt-1 font-serif">K{totalInventoryValue.toLocaleString()} ZMW</div>
              <div className="text-xs text-slate-500 mt-1">Calculated inventory net value</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Library Holdings</div>
              <div className="text-2xl font-bold text-indigo-700 mt-1 font-serif">{books.length} Books</div>
              <div className="text-xs text-slate-500 mt-1">Textbooks, reference & readers</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-sm text-slate-800">
              Institutional Asset Register & Inventory List
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Asset Tag</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Qty</th>
                    <th className="py-3 px-4">Condition</th>
                    <th className="py-3 px-4 text-right">Value (ZMW)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">{item.assetTag}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{item.category}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{item.location}</td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs font-bold">{item.quantity}</td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.condition === "Good" || item.condition === "New" ? "bg-emerald-100 text-emerald-800" :
                          item.condition === "Fair" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
                        }`}>
                          {item.condition}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-xs font-bold text-slate-800">
                        K{(item.purchasePriceZMW || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
