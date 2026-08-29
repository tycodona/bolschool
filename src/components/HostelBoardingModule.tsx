import React, { useState } from "react";
import { HostelDormitory, HostelAllocation, Student } from "../types";
import {
  Bed,
  Search,
  Plus,
  Home,
  UserCheck,
  Phone,
  CheckCircle,
  AlertCircle,
  Users,
  Building2,
  X,
  LogIn,
  LogOut
} from "lucide-react";

interface HostelBoardingModuleProps {
  dormitories: HostelDormitory[];
  allocations: HostelAllocation[];
  students: Student[];
  userRole?: string;
  canManage?: boolean;
  onAddDormitory: (dorm: HostelDormitory) => void;
  onAllocateStudent?: (allocation: HostelAllocation) => void;
  onAllocateBed?: (allocation: HostelAllocation) => void;
  onUpdateAllocationStatus?: (id: number, status: HostelAllocation["status"]) => void;
  onReleaseBed?: (id: number) => void;
}

export function HostelBoardingModule({
  dormitories,
  allocations,
  students,
  userRole,
  canManage: canManageProp,
  onAddDormitory,
  onAllocateStudent,
  onAllocateBed,
  onUpdateAllocationStatus,
  onReleaseBed
}: HostelBoardingModuleProps) {
  const [activeTab, setActiveTab] = useState<"dorms" | "allocations">("dorms");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDormModal, setShowAddDormModal] = useState(false);
  const [showAllocateModal, setShowAllocateModal] = useState(false);

  // New Dorm State
  const [dormName, setDormName] = useState("");
  const [gender, setGender] = useState<HostelDormitory["gender"]>("Boys");
  const [houseName, setHouseName] = useState("Eagle House");
  const [houseMasterName, setHouseMasterName] = useState("Mr. Kelvin Phiri");
  const [houseMasterPhone, setHouseMasterPhone] = useState("+260 977 889900");
  const [capacity, setCapacity] = useState(48);
  const [roomCount, setRoomCount] = useState(12);
  const [termFeeZMW, setTermFeeZMW] = useState(4500);

  // Allocation State
  const [selectedStudentId, setSelectedStudentId] = useState<number>(students[0]?.id || 0);
  const [selectedDormId, setSelectedDormId] = useState<number>(dormitories[0]?.id || 0);
  const [roomNumber, setRoomNumber] = useState("Room 101");
  const [bedNumber, setBedNumber] = useState("Bed B-01");
  const [emergencyContact, setEmergencyContact] = useState("+260 977 000000");

  const totalBeds = dormitories.reduce((acc, d) => acc + d.capacity, 0);
  const totalOccupied = dormitories.reduce((acc, d) => acc + d.occupiedBeds, 0);
  const totalAvailable = totalBeds - totalOccupied;

  const handleCreateDorm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dormName.trim()) return;

    const dorm: HostelDormitory = {
      id: Date.now(),
      name: dormName.trim(),
      gender,
      houseName,
      houseMasterName: houseMasterName.trim(),
      houseMasterPhone: houseMasterPhone.trim(),
      capacity: Number(capacity) || 30,
      occupiedBeds: 0,
      roomCount: Number(roomCount) || 10,
      termFeeZMW: Number(termFeeZMW) || 4000,
      status: "Available"
    };

    onAddDormitory(dorm);
    setShowAddDormModal(false);
    setDormName("");
  };

  const handleCreateAllocation = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === Number(selectedStudentId));
    const dorm = dormitories.find(d => d.id === Number(selectedDormId));
    if (!student || !dorm) return;

    const alloc: HostelAllocation = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      gender: student.gender,
      dormitoryId: dorm.id,
      dormitoryName: dorm.name,
      roomNumber: roomNumber.trim(),
      bedNumber: bedNumber.trim(),
      checkInDate: new Date().toISOString().split("T")[0],
      status: "Boarding Active",
      emergencyContact: emergencyContact.trim()
    };

    if (onAllocateStudent) {
      onAllocateStudent(alloc);
    } else if (onAllocateBed) {
      onAllocateBed(alloc);
    }
    setShowAllocateModal(false);
  };

  const canManage = canManageProp !== undefined ? canManageProp : (userRole === "super_admin" || userRole === "school_admin" || userRole === "head_teacher" || userRole === "admin");

  return (
    <div id="hostel-boarding-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
              <Building2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              Hostel & Boarding House Management
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Dormitory allocations, residential house masters, room assignments, and boarding pupil rosters.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllocateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Allocate Pupil to Bed</span>
            </button>
            <button
              onClick={() => setShowAddDormModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dormitory</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hostel Halls</div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-serif">{dormitories.length} Dormitories</div>
          <div className="text-xs text-slate-500 mt-1">Senior & Junior residences</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bed Capacity</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1 font-serif">{totalBeds} Beds</div>
          <div className="text-xs text-slate-500 mt-1">Approved institutional capacity</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Occupied Beds</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">{totalOccupied} Boarders</div>
          <div className="text-xs text-emerald-600 mt-1">
            {totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0}% Occupancy rate
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Vacant Beds Available</div>
          <div className="text-2xl font-bold text-sky-700 mt-1 font-serif">{totalAvailable} Spaces</div>
          <div className="text-xs text-slate-500 mt-1">Ready for incoming term intake</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("dorms")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "dorms"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Dormitory Halls ({dormitories.length})
        </button>
        <button
          onClick={() => setActiveTab("allocations")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "allocations"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Active Boarder Allocations ({allocations.length})
        </button>
      </div>

      {/* Tab 1: Dorms Grid */}
      {activeTab === "dorms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dormitories.map((dorm) => (
            <div key={dorm.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    dorm.gender === "Boys" ? "bg-blue-100 text-blue-800" : dorm.gender === "Girls" ? "bg-pink-100 text-pink-800" : "bg-purple-100 text-purple-800"
                  }`}>
                    {dorm.gender} Dormitory
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1 font-serif">{dorm.name}</h3>
                  <div className="text-xs text-slate-500">Affiliated to {dorm.houseName}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-800 font-mono">K{dorm.termFeeZMW.toLocaleString()}</div>
                  <div className="text-[11px] text-slate-400">per term fee</div>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1 font-medium">
                  <span>Occupancy: {dorm.occupiedBeds} / {dorm.capacity} Beds</span>
                  <span>{Math.round((dorm.occupiedBeds / dorm.capacity) * 100)}% Full</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${Math.min(100, (dorm.occupiedBeds / dorm.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Master Details */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs text-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{dorm.houseMasterName}</div>
                  <div className="text-slate-400">House Master in Charge</div>
                </div>
                <div className="flex items-center gap-1 font-mono text-emerald-800 font-semibold">
                  <Phone className="w-3.5 h-3.5" />
                  <span>{dorm.houseMasterPhone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Allocations Table */}
      {activeTab === "allocations" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Pupil Details</th>
                    <th className="py-3 px-4">Dormitory Hall</th>
                    <th className="py-3 px-4">Room & Bed</th>
                    <th className="py-3 px-4">Check-in Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allocations.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{a.studentName}</div>
                        <div className="text-xs text-slate-400">{a.grade} • {a.gender}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {a.dormitoryName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        <div className="text-slate-800 font-semibold">{a.roomNumber}</div>
                        <div className="text-slate-500">{a.bedNumber}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        {a.checkInDate}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canManage && a.status === "Boarding Active" && (
                          <button
                            onClick={() => onUpdateAllocationStatus(a.id, "Vacated / Checked Out")}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                          >
                            Check Out
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allocations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                        No active boarder allocations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Dormitory */}
      {showAddDormModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Add Boarding Dormitory</h3>
              </div>
              <button
                onClick={() => setShowAddDormModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDorm} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Dormitory / Hall Name *</label>
                <input
                  type="text"
                  required
                  value={dormName}
                  onChange={(e) => setDormName(e.target.value)}
                  placeholder="e.g. Kenneth Kaunda Hall (Senior Boys)"
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    <option value="Boys">Boys Hall</option>
                    <option value="Girls">Girls Hall</option>
                    <option value="Mixed">Mixed / Junior</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliated House</label>
                  <input
                    type="text"
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    placeholder="e.g. Eagle House"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Count</label>
                  <input
                    type="number"
                    min="1"
                    value={roomCount}
                    onChange={(e) => setRoomCount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Term Fee (ZMW)</label>
                  <input
                    type="number"
                    value={termFeeZMW}
                    onChange={(e) => setTermFeeZMW(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">House Master / Mistress</label>
                  <input
                    type="text"
                    value={houseMasterName}
                    onChange={(e) => setHouseMasterName(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Phone</label>
                  <input
                    type="text"
                    value={houseMasterPhone}
                    onChange={(e) => setHouseMasterPhone(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDormModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Dormitory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Allocate Student */}
      {showAllocateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Allocate Boarding Bed</h3>
              </div>
              <button
                onClick={() => setShowAllocateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAllocation} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Pupil *</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.grade} {s.stream} • {s.gender})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Dormitory *</label>
                <select
                  value={selectedDormId}
                  onChange={(e) => setSelectedDormId(Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                >
                  {dormitories.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.gender} • {d.capacity - d.occupiedBeds} beds free)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. Room 102"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bed Number</label>
                  <input
                    type="text"
                    value={bedNumber}
                    onChange={(e) => setBedNumber(e.target.value)}
                    placeholder="e.g. Bed B-04"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. +260 977 123456 (Mr. Bwalya)"
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
