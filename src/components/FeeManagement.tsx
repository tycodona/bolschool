import React, { useState, FormEvent } from "react";
import { Student, FeeItem, SchoolProfile, ClassStream, PaymentReceipt } from "../types";
import { SCHOOL_NAME } from "../data/zambianSchoolData";
import {
  DollarSign,
  Plus,
  Receipt,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Landmark,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CreditCard,
  FileText,
  Download,
  FileSpreadsheet
} from "lucide-react";
import { exportFeeInvoicesCsv, exportStudentFeeSummaryCsv } from "../utils/csvExporter";

interface FeeManagementProps {
  fees: FeeItem[];
  students: Student[];
  classes?: ClassStream[];
  receipts?: PaymentReceipt[];
  onAddFee: (fee: Omit<FeeItem, "id">) => void;
  onEditFee?: (fee: FeeItem) => void;
  onDeleteFee?: (id: number) => void;
  onRecordPayment: (feeId: number, amountPaidZMW: number) => void;
  canManage: boolean;
  filterStudentId?: number; // Pre-filtered for parent/student role
  schoolProfile?: SchoolProfile;
}

export function FeeManagement({
  fees,
  students,
  classes = [],
  receipts = [],
  onAddFee,
  onEditFee,
  onDeleteFee,
  onRecordPayment,
  canManage,
  filterStudentId,
  schoolProfile
}: FeeManagementProps) {
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [clearanceFilter, setClearanceFilter] = useState<"all" | "unlocked" | "withheld">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeItem | null>(null);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState<FeeItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Form state
  const [formStudentId, setFormStudentId] = useState<number>(students[0]?.id || 101);
  const [formDesc, setFormDesc] = useState("Term 2 School Tuition & Academic Levy");
  const [formTerm, setFormTerm] = useState<"Term 1" | "Term 2" | "Term 3">("Term 2");
  const [formAmount, setFormAmount] = useState("1250");
  const [formDueDate, setFormDueDate] = useState("2026-06-15");
  const [formStatus, setFormStatus] = useState<"Paid" | "Unpaid" | "Partially Paid">("Unpaid");

  // Record payment popup
  const [paymentFeeId, setPaymentFeeId] = useState<number | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState("");

  const filteredFees = fees.filter(f => {
    const matchesStudent = !filterStudentId || f.studentId === filterStudentId;
    const matchesTerm = selectedTerm === "all" || f.term === selectedTerm;
    const isCleared = f.status === "Paid" || (f.amountZMW - f.paidAmountZMW <= 0);
    const matchesClearance =
      clearanceFilter === "all" ? true :
      clearanceFilter === "unlocked" ? isCleared :
      !isCleared;

    return matchesStudent && matchesTerm && matchesClearance;
  });

  const totalBilledZMW = fees.filter(f => !filterStudentId || f.studentId === filterStudentId).reduce((sum, f) => sum + f.amountZMW, 0);
  const totalPaidZMW = fees.filter(f => !filterStudentId || f.studentId === filterStudentId).reduce((sum, f) => sum + f.paidAmountZMW, 0);
  const totalOutstandingZMW = Math.max(0, totalBilledZMW - totalPaidZMW);

  // Count unique students with full clearance vs withheld
  const studentClearanceStats = students.map(s => {
    const sFees = fees.filter(f => f.studentId === s.id);
    const billed = sFees.reduce((sum, f) => sum + f.amountZMW, 0);
    const paid = sFees.reduce((sum, f) => sum + f.paidAmountZMW, 0);
    const isPaidInFull = sFees.length > 0 ? (billed - paid <= 0) : true;
    return { studentId: s.id, isPaidInFull };
  });

  const totalPupilsCleared = studentClearanceStats.filter(s => s.isPaidInFull).length;
  const totalPupilsWithheld = studentClearanceStats.filter(s => !s.isPaidInFull).length;

  const handleOpenAddModal = () => {
    setEditingFee(null);
    setFormStudentId(students[0]?.id || 101);
    setFormDesc("Term 2 Tuition & Activity Levy");
    setFormTerm(schoolProfile?.activeTerm || "Term 2");
    setFormAmount("1250");
    setFormDueDate("2026-06-15");
    setFormStatus("Unpaid");
    setShowModal(true);
  };

  const handleOpenEditModal = (fee: FeeItem) => {
    setEditingFee(fee);
    setFormStudentId(fee.studentId);
    setFormDesc(fee.description);
    setFormTerm(fee.term);
    setFormAmount(String(fee.amountZMW));
    setFormDueDate(fee.dueDate);
    setFormStatus(fee.status);
    setShowModal(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formAmount) || 0;

    if (editingFee) {
      onEditFee?.({
        ...editingFee,
        studentId: formStudentId,
        description: formDesc,
        term: formTerm,
        amountZMW: parsedAmount,
        dueDate: formDueDate,
        status: formStatus
      });
    } else {
      onAddFee({
        studentId: formStudentId,
        description: formDesc,
        term: formTerm,
        year: schoolProfile?.currentYear || 2026,
        amountZMW: parsedAmount,
        paidAmountZMW: 0,
        dueDate: formDueDate,
        status: formStatus
      });
    }
    setShowModal(false);
  };

  const handlePaymentSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (paymentFeeId) {
      onRecordPayment(paymentFeeId, parseFloat(paymentAmountInput) || 0);
      setPaymentFeeId(null);
      setPaymentAmountInput("");
    }
  };

  const handleQuickClearFee = (fee: FeeItem) => {
    const bal = fee.amountZMW - fee.paidAmountZMW;
    if (bal > 0) {
      onRecordPayment(fee.id, bal);
    }
  };

  const currentSchoolName = schoolProfile?.name || SCHOOL_NAME;

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Policy Banner: Results Access Gatekeeping */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-sm border border-blue-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-700/60 border border-blue-400/40 text-blue-200 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-serif text-white tracking-wide">
                  Academic Results & Fee Clearance Gatekeeper
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Strict Enforcement
                </span>
              </div>
              <p className="text-xs text-blue-200/90 mt-1 max-w-2xl leading-relaxed">
                In accordance with <strong>{currentSchoolName}</strong> policy, only pupils with <strong>100% full fee clearance (K0 balance)</strong> are permitted to view academic report cards and termly results. Defaulters will find their report cards withheld automatically.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/15">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-blue-200 block">Results Clearance</span>
              <span className="text-xs font-bold text-white">
                <strong className="text-emerald-400">{totalPupilsCleared}</strong> Cleared • <strong className="text-rose-400">{totalPupilsWithheld}</strong> Withheld
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 border-l-4 border-l-emerald-600 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Fees Collected</p>
          <p className="text-2xl font-black text-emerald-800 mt-1 font-mono">
            K{totalPaidZMW.toLocaleString()} ZMW
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Paid into School Accounts</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 border-l-4 border-l-amber-600 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Outstanding Balance</p>
          <p className="text-2xl font-black text-amber-700 mt-1 font-mono">
            K{totalOutstandingZMW.toLocaleString()} ZMW
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Pending Parent Settlement</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 border-l-4 border-l-sky-600 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Invoiced</p>
          <p className="text-2xl font-black text-sky-800 mt-1 font-mono">
            K{totalBilledZMW.toLocaleString()} ZMW
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Academic {schoolProfile?.currentYear || 2026}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 border-l-4 border-l-indigo-600 shadow-2xs">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pupils Access Status</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalPupilsCleared}</span>
            <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Unlocked
            </span>
            <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {totalPupilsWithheld} Locked
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Based on Zero Balance Policy</p>
        </div>
      </div>

      {/* Control Header & Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 font-serif">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                School Fees & PTA Levy Management (ZMW)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Kwacha Accounts
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Track Zambian Kwacha tuition, PTA levies, record payments, and manage results access clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Term */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Term Filter</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:border-emerald-600 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Academic Terms</option>
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            {/* Filter by Results Clearance */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Results Access</label>
              <select
                value={clearanceFilter}
                onChange={(e) => setClearanceFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:border-emerald-600 focus:bg-white focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Pupils</option>
                <option value="unlocked">🟢 Unlocked (Fully Paid)</option>
                <option value="withheld">🔒 Withheld (Outstanding Arrears)</option>
              </select>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  exportFeeInvoicesCsv(filteredFees, students, classes, { term: selectedTerm });
                  showToast(`Exported ${filteredFees.length} fee transactions to CSV ledger.`);
                }}
                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Export detailed fee ledger matching current filters"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Ledger CSV</span>
              </button>

              <button
                onClick={() => {
                  exportStudentFeeSummaryCsv(students, fees, classes);
                  showToast(`Exported ${students.length} pupil clearance summaries to CSV.`);
                }}
                className="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Export pupil-by-pupil fee balance and clearance status"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Clearance Summary CSV</span>
              </button>
            </div>

            {canManage && (
              <div className="pt-4 md:pt-0">
                <button
                  onClick={handleOpenAddModal}
                  className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Issue Fee Billing</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fees Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Pupil Name</th>
                <th className="py-3 px-4">Fee Description</th>
                <th className="py-3 px-4">Term</th>
                <th className="py-3 px-4">Billed (ZMW)</th>
                <th className="py-3 px-4">Paid (ZMW)</th>
                <th className="py-3 px-4">Balance (ZMW)</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Fee Status</th>
                <th className="py-3 px-4">Results Access</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredFees.map((fee) => {
                const st = students.find(s => s.id === fee.studentId);
                const balance = fee.amountZMW - fee.paidAmountZMW;
                const isCleared = fee.status === "Paid" || balance <= 0;

                return (
                  <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>
                        {st?.name || "Pupil"}
                        <span className="text-[10px] text-slate-400 font-normal block">
                          {st?.grade} {st?.stream}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">{fee.description}</td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">{fee.term}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">K{fee.amountZMW.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-800 font-bold">K{fee.paidAmountZMW.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-mono text-amber-700 font-bold">
                      {balance > 0 ? `K${balance.toLocaleString()}` : "K0"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{fee.dueDate}</td>
                    <td className="py-3.5 px-4">
                      {fee.status === "Paid" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          Paid in Full
                        </span>
                      ) : fee.status === "Partially Paid" ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          Partial (K{balance})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isCleared ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          <span>Results Unlocked</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                          <Lock className="w-3 h-3 text-rose-600" />
                          <span>Results Withheld</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManage && balance > 0 && (
                          <button
                            onClick={() => handleQuickClearFee(fee)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                            title="Clear full balance & immediately unlock report card"
                          >
                            <CreditCard className="w-3 h-3" />
                            <span>Clear & Unlock</span>
                          </button>
                        )}

                        {canManage && fee.status !== "Paid" && (
                          <button
                            onClick={() => {
                              setPaymentFeeId(fee.id);
                              setPaymentAmountInput(String(balance));
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                          >
                            Record Custom
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedFeeForReceipt(fee)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-1.5 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          title="View Official Kwacha Receipt"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>

                        {canManage && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(fee)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                              title="Edit fee invoice"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteFee && (
                              <button
                                onClick={() => {
                                  if (window.confirm("Delete this fee invoice record?")) {
                                    onDeleteFee(fee.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                                title="Delete fee record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {filteredFees.length > 0 && (
              <tfoot className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-800 text-xs">
                <tr>
                  <td colSpan={3} className="py-3 px-4 uppercase text-[10px] tracking-wider text-slate-500">
                    Filtered Summary Total ({filteredFees.length} Records)
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    K{filteredFees.reduce((s, f) => s + f.amountZMW, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                    K{filteredFees.reduce((s, f) => s + f.paidAmountZMW, 0).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-red-600">
                    K{Math.max(0, filteredFees.reduce((s, f) => s + (f.amountZMW - f.paidAmountZMW), 0)).toLocaleString()}
                  </td>
                  <td colSpan={4} className="py-3 px-4 text-right text-[11px] font-normal text-slate-500">
                    Showing {selectedTerm === "all" ? "All Terms" : selectedTerm}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add / Edit Fee Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                {editingFee ? "Edit Fee Invoice" : "Issue New Kwacha Fee Invoice"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Select Pupil</label>
                <select
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold text-slate-800"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade} {s.stream})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Fee Description</label>
                <input
                  type="text"
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Academic Term</label>
                  <select
                    value={formTerm}
                    onChange={(e) => setFormTerm(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Amount (ZMW)</label>
                  <input
                    type="number"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Payment Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  >
                    <option value="Unpaid">Unpaid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid in Full</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  {editingFee ? "Save Changes" : "Create Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentFeeId !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 font-serif flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-700" />
                Record Kwacha Fee Payment
              </h3>
              <button
                onClick={() => setPaymentFeeId(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                  Payment Amount Received (ZMW)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">K</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-2 pl-8 pr-3 text-sm font-mono font-bold text-slate-900"
                    placeholder="e.g. 1250"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Note: Settling the remaining balance in full will automatically unlock report cards and academic results for this pupil.
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPaymentFeeId(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Confirm & Post Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {selectedFeeForReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-sm text-slate-900 font-serif">Official Kwacha School Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedFeeForReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3">
              <div className="text-center border-b border-slate-200 pb-2">
                {schoolProfile?.logoUrl ? (
                  <img
                    src={schoolProfile.logoUrl}
                    alt="School Logo"
                    className="w-10 h-10 object-contain mx-auto mb-1.5"
                  />
                ) : null}
                <h4 className="font-serif font-black text-slate-900 text-sm">{currentSchoolName}</h4>
                <p className="text-[10px] text-slate-500">{schoolProfile?.address || "Lusaka, Zambia"}</p>
                <p className="text-[10px] text-slate-500 font-mono">Receipt No: BOL-REC-2026-{selectedFeeForReceipt.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Pupil Name:</span>
                  <span className="font-bold text-slate-800">
                    {students.find(s => s.id === selectedFeeForReceipt.studentId)?.name || "Pupil"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Academic Session:</span>
                  <span className="font-bold text-slate-800">{selectedFeeForReceipt.term} {selectedFeeForReceipt.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Fee Description:</span>
                  <span className="text-slate-800 font-medium">{selectedFeeForReceipt.description}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">Results Clearance:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedFeeForReceipt.status === "Paid" ? "✅ Results Cleared & Unlocked" : "🔒 Results Withheld"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-700">Total Paid:</span>
                <span className="font-black text-emerald-800 font-mono">
                  K{selectedFeeForReceipt.paidAmountZMW.toLocaleString()} ZMW
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs"
              >
                Print Official Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
