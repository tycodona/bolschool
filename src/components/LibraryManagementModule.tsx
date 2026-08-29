import React, { useState } from "react";
import { LibraryBook, BookCheckout, Student, Teacher } from "../types";
import {
  BookOpen,
  Search,
  Plus,
  ArrowRightLeft,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  GraduationCap,
  Calendar,
  X,
  BookmarkCheck
} from "lucide-react";

interface LibraryManagementModuleProps {
  books: LibraryBook[];
  checkouts: BookCheckout[];
  students: Student[];
  teachers?: Teacher[];
  userRole?: string;
  canManage?: boolean;
  onAddBook: (book: LibraryBook | Omit<LibraryBook, "id">) => void;
  onCheckoutBook?: (checkout: BookCheckout) => void;
  onIssueLoan?: (checkout: BookCheckout) => void;
  onReturnBook?: (checkoutId: number) => void;
  onReturnLoan?: (checkoutId: number) => void;
  onEditBook?: (book: LibraryBook) => void;
  onDeleteBook?: (id: number) => void;
}

export function LibraryManagementModule({
  books,
  checkouts,
  students,
  teachers = [],
  userRole,
  canManage: canManageProp,
  onAddBook,
  onCheckoutBook,
  onIssueLoan,
  onReturnBook,
  onReturnLoan,
  onEditBook,
  onDeleteBook
}: LibraryManagementModuleProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "borrowings" | "overdue">("catalog");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedBookForCheckout, setSelectedBookForCheckout] = useState<LibraryBook | null>(null);

  // New Book Form
  const [newTitle, setNewTitle] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newCategory, setNewCategory] = useState<LibraryBook["category"]>("Mathematics");
  const [newIsbn, setNewIsbn] = useState("");
  const [newQuantity, setNewQuantity] = useState(10);
  const [newLocation, setNewLocation] = useState("Section A - Shelf 2");
  const [newPublisher, setNewPublisher] = useState("Zambia Educational Publishing House (ZEPH)");

  // Checkout Form
  const [borrowerType, setBorrowerType] = useState<"Student" | "Teacher">("Student");
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 0);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number>(teachers[0]?.id || 0);
  const [loanDays, setLoanDays] = useState(14);

  const categories = [
    "Mathematics",
    "English & Reading",
    "Science & Nature",
    "Zambian History & Social",
    "Reference & Dictionary",
    "Story Books",
    "TEVET & Vocational",
    "Religious Education"
  ];

  const filteredBooks = books.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const activeCheckouts = checkouts.filter(c => c.status === "Active" || c.status === "Overdue");
  const overdueCheckouts = checkouts.filter(c => {
    if (c.status === "Returned") return false;
    const due = new Date(c.dueDate);
    const today = new Date();
    return due < today;
  });

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) return;

    const book: LibraryBook = {
      id: Date.now(),
      title: newTitle.trim(),
      author: newAuthor.trim(),
      category: newCategory,
      isbn: newIsbn.trim() || `ISBN-978-9982-${Math.floor(1000 + Math.random() * 9000)}`,
      totalCopies: Number(newQuantity) || 1,
      availableCopies: Number(newQuantity) || 1,
      shelfLocation: newLocation.trim(),
      publisher: newPublisher.trim()
    };

    onAddBook(book);
    setShowAddModal(false);
    setNewTitle("");
    setNewAuthor("");
  };

  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForCheckout) return;

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + loanDays);

    let borrowerName = "";
    let borrowerRef = "";
    let borrowerId = 0;

    if (borrowerType === "Student") {
      const pupil = students.find(s => s.id === Number(selectedStudentId));
      if (pupil) {
        borrowerName = pupil.name;
        borrowerRef = pupil.eczNo;
        borrowerId = pupil.id;
      }
    } else {
      const tutor = teachers.find(t => t.id === Number(selectedTeacherId));
      if (tutor) {
        borrowerName = tutor.name;
        borrowerRef = tutor.tscNumber || `TSC-${tutor.id}`;
        borrowerId = tutor.id;
      }
    }

    const checkout: BookCheckout = {
      id: Date.now(),
      bookId: selectedBookForCheckout.id,
      bookTitle: selectedBookForCheckout.title,
      borrowerType,
      borrowerId,
      borrowerName,
      borrowerRef,
      checkoutDate: today.toISOString().split("T")[0],
      dueDate: dueDate.toISOString().split("T")[0],
      status: "Active"
    };

    if (onIssueLoan) {
      onIssueLoan(checkout);
    } else if (onCheckoutBook) {
      onCheckoutBook(checkout);
    }
    setShowCheckoutModal(false);
    setSelectedBookForCheckout(null);
  };

  const handleReturn = (checkoutId: number) => {
    if (onReturnLoan) {
      onReturnLoan(checkoutId);
    } else if (onReturnBook) {
      onReturnBook(checkoutId);
    }
  };

  const canManage = canManageProp !== undefined ? canManageProp : (userRole === "super_admin" || userRole === "school_admin" || userRole === "librarian" || userRole === "head_teacher" || userRole === "admin");

  return (
    <div id="library-management-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              Library & Learning Resource Centre
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Zambian syllabus textbook catalog, curriculum reference collections, and active pupil/teacher loan circulation.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Catalog New Book</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Titles</div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-serif">{books.length}</div>
          <div className="text-xs text-slate-500 mt-1">Cataloged academic books</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Copies</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">
            {books.reduce((acc, b) => acc + b.availableCopies, 0)}
          </div>
          <div className="text-xs text-slate-500 mt-1">Ready for on-campus reading or loan</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Loans</div>
          <div className="text-2xl font-bold text-sky-700 mt-1 font-serif">{activeCheckouts.length}</div>
          <div className="text-xs text-slate-500 mt-1">With pupils and teaching staff</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overdue Returns</div>
          <div className="text-2xl font-bold text-rose-700 mt-1 font-serif">{overdueCheckouts.length}</div>
          <div className="text-xs text-rose-600 mt-1">Requires librarian follow-up</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("catalog")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "catalog"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setActiveTab("borrowings")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "borrowings"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Active Loans & History ({checkouts.length})
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "overdue"
              ? "text-rose-700 font-semibold border-b-2 border-rose-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Overdue Track ({overdueCheckouts.length})
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium"
            >
              <option value="all">All Categories ({books.length})</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Book Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Title & Author</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">ISBN / Shelf</th>
                    <th className="py-3 px-4 text-center">Total Copies</th>
                    <th className="py-3 px-4 text-center">Available</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBooks.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{b.title}</div>
                        <div className="text-xs text-slate-500">By {b.author}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {b.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="text-slate-700">{b.isbn || "N/A"}</div>
                        <div className="text-slate-400">{b.shelfLocation || "General Stacks"}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {b.totalCopies}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${
                          b.availableCopies > 0
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}>
                          {b.availableCopies} available
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canManage && (
                          <button
                            disabled={b.availableCopies <= 0}
                            onClick={() => {
                              setSelectedBookForCheckout(b);
                              setShowCheckoutModal(true);
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                              b.availableCopies > 0
                                ? "bg-slate-900 hover:bg-slate-800 text-white"
                                : "bg-slate-100 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" />
                            <span>Issue Loan</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredBooks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                        No books match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Borrowings */}
      {activeTab === "borrowings" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Checkout Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checkouts.map((c) => {
                  const isOverdue = c.status !== "Returned" && new Date(c.dueDate) < new Date();
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {c.bookTitle || `Book ID #${c.bookId}`}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{c.borrowerName}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {c.borrowerType}: {c.borrowerRef}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">{c.checkoutDate}</td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-slate-800">{c.dueDate}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          c.status === "Returned"
                            ? "bg-slate-100 text-slate-700"
                            : isOverdue
                            ? "bg-rose-100 text-rose-800"
                            : "bg-sky-100 text-sky-800"
                        }`}>
                          {c.status === "Returned" ? "Returned" : isOverdue ? "Overdue" : "Active Loan"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canManage && c.status !== "Returned" && (
                          <button
                            onClick={() => handleReturn(c.id)}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Mark Returned</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Overdue Track */}
      {activeTab === "overdue" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong>Librarian Overdue Notice Protocol:</strong> Overdue textbooks are flagged for retrieval before end-of-term results release. Standard reminder alerts can be sent directly to class teachers and guardians.
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Borrower Details</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Days Overdue</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {overdueCheckouts.map((c) => {
                    const due = new Date(c.dueDate);
                    const today = new Date();
                    const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));

                    return (
                      <tr key={c.id} className="hover:bg-rose-50/40">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">{c.bookTitle}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{c.borrowerName}</div>
                          <div className="text-xs text-slate-400 font-mono">{c.borrowerRef}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-rose-700 font-bold">{c.dueDate}</td>
                        <td className="py-3.5 px-4 font-bold text-rose-600">{diffDays} days</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleReturn(c.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium cursor-pointer"
                          >
                            Return Book
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {overdueCheckouts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-emerald-600 text-sm font-medium">
                        All library borrowings are within their due dates. No overdue records.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Book */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Catalog New Academic Book</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Secondary Chemistry for Zambia"
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Author / Editor *</label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder="e.g. Dr. C. Chomba"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">ISBN / ECZ Code</label>
                  <input
                    type="text"
                    value={newIsbn}
                    onChange={(e) => setNewIsbn(e.target.value)}
                    placeholder="978-9982-12-345-6"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity of Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="e.g. Section B - Shelf 3"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Publisher</label>
                  <input
                    type="text"
                    value={newPublisher}
                    onChange={(e) => setNewPublisher(e.target.value)}
                    placeholder="e.g. Longman Zambia"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Book to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Issue Loan */}
      {showCheckoutModal && selectedBookForCheckout && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Issue Book Loan</h3>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl mt-3 border border-emerald-100 text-xs text-emerald-900">
              <div className="font-bold">{selectedBookForCheckout.title}</div>
              <div>Author: {selectedBookForCheckout.author} | Copies Left: {selectedBookForCheckout.availableCopies}</div>
            </div>

            <form onSubmit={handleIssueBook} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Borrower Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBorrowerType("Student")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer ${
                      borrowerType === "Student"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Pupil / Learner</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBorrowerType("Teacher")}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 cursor-pointer ${
                      borrowerType === "Teacher"
                        ? "bg-emerald-700 text-white border-emerald-700"
                        : "bg-slate-50 text-slate-700 border-slate-200"
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Teacher / Faculty</span>
                  </button>
                </div>
              </div>

              {borrowerType === "Student" ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Pupil</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.grade} {s.stream} • {s.eczNo})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select Teacher</label>
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.primarySubject} • {t.tscNumber})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Loan Period (Days)</label>
                <select
                  value={loanDays}
                  onChange={(e) => setLoanDays(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                >
                  <option value={7}>7 Days (Standard Reading)</option>
                  <option value={14}>14 Days (Two Weeks Standard)</option>
                  <option value={21}>21 Days (Three Weeks Examination Prep)</option>
                  <option value={30}>30 Days (Full Month Syllabus Reserve)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Confirm & Issue Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
