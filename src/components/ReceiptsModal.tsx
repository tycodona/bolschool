import React, { useState } from "react";
import { PaymentReceipt } from "../types";
import {
  Printer,
  Download,
  X,
  CheckCircle,
  ShieldCheck,
  Building,
  CreditCard,
  Calendar,
  FileText
} from "lucide-react";

interface ReceiptsModalProps {
  receipt: PaymentReceipt;
  schoolName?: string;
  onClose: () => void;
}

export function ReceiptsModal({ receipt, schoolName = "RYNTECH School Management System", onClose }: ReceiptsModalProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h3 className="text-base font-bold text-slate-800 font-serif">
              Official Electronic Fee Receipt
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Receipt Body */}
        <div id="printable-official-receipt" className="pt-6 space-y-6 text-slate-800 font-sans">
          
          {/* Header */}
          <div className="text-center border-b-2 border-emerald-800 pb-4">
            <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              Republic of Zambia • Ministry of Education
            </div>
            <h1 className="text-xl font-bold font-serif text-slate-900 mt-1">
              {schoolName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              P.O. Box 30122, Lusaka, Zambia • Tel: +260 211 234567 • Email: accounts@ryntech.edu.zm
            </p>
            <div className="mt-2 inline-block px-4 py-1 bg-emerald-50 border border-emerald-200 rounded text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Official Bursar Fee Payment Receipt
            </div>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500">Receipt No: </span>
                <span className="font-mono font-bold text-slate-900">{receipt.receiptNumber}</span>
              </div>
              <div>
                <span className="text-slate-500">Date Issued: </span>
                <span className="font-semibold text-slate-900">{receipt.paymentDate}</span>
              </div>
              <div>
                <span className="text-slate-500">Payment Channel: </span>
                <span className="font-semibold text-emerald-800">{receipt.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-500">Txn Ref: </span>
                <span className="font-mono text-slate-700">{receipt.referenceNumber}</span>
              </div>
            </div>

            <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                <span className="text-slate-500">Pupil Name: </span>
                <span className="font-bold text-slate-900">{receipt.studentName}</span>
              </div>
              <div>
                <span className="text-slate-500">ECZ Exam No: </span>
                <span className="font-mono font-bold text-slate-900">{receipt.studentEczNo}</span>
              </div>
              <div>
                <span className="text-slate-500">Class / Grade: </span>
                <span className="font-semibold text-slate-900">{receipt.grade}</span>
              </div>
              <div>
                <span className="text-slate-500">Academic Term: </span>
                <span className="font-semibold text-slate-900">Term 2, 2026</span>
              </div>
            </div>
          </div>

          {/* Fee Itemization Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3 text-right">Previous Balance</th>
                  <th className="py-2.5 px-3 text-right">Amount Paid</th>
                  <th className="py-2.5 px-3 text-right">Remaining Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{receipt.description}</div>
                    <div className="text-[11px] text-slate-500">{receipt.notes || "Tuition & School Services Levy"}</div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600">
                    K{receipt.previousBalanceZMW.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800 text-sm">
                    K{receipt.amountPaidZMW.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    K{receipt.remainingBalanceZMW.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Amount in Words Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg text-xs">
            <div className="text-slate-500 font-medium">Amount Received in Zambian Kwacha:</div>
            <div className="font-bold text-emerald-950 font-serif text-sm mt-0.5">
              ZMW {receipt.amountPaidZMW.toLocaleString()}.00 (Verified Instant Electronic Settlement)
            </div>
          </div>

          {/* Signatures & Security Stamp */}
          <div className="grid grid-cols-2 pt-6 gap-6 text-xs border-t border-slate-200">
            <div>
              <div className="text-slate-500">Collected & Authorized by:</div>
              <div className="font-bold text-slate-900 mt-1">{receipt.collectedBy}</div>
              <div className="text-[11px] text-slate-500">Accounts & Bursar Department</div>
              <div className="mt-4 pt-2 border-t border-dashed border-slate-300 w-36 text-center text-[10px] text-slate-400">
                Bursar Signature
              </div>
            </div>

            <div className="text-right flex flex-col items-end justify-between">
              <div className="w-24 h-24 border-2 border-emerald-700/60 rounded-full flex flex-col items-center justify-center text-center p-1 text-emerald-800 rotate-[-12deg] shadow-xs">
                <div className="text-[8px] font-black uppercase tracking-tighter">RYNTECH SMS</div>
                <div className="text-[10px] font-bold">FEES PAID</div>
                <div className="text-[8px] font-mono font-semibold">{receipt.paymentDate}</div>
                <div className="text-[7px] uppercase font-semibold">OFFICIAL STAMP</div>
              </div>
              <div className="text-[10px] text-slate-400 mt-2 font-mono">
                Verification Code: {receipt.receiptNumber}-SEC
              </div>
            </div>
          </div>

          {/* Footnote */}
          <div className="text-center text-[10px] text-slate-400 pt-3 border-t border-slate-100">
            This is an official computer-generated receipt from the RYNTECH School Management System. Valid without manual signature when stamped.
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
          >
            Close Receipt
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Official Copy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
