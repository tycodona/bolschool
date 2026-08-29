import React, { useState } from "react";
import {
  TransportRoute,
  TransportVehicle,
  TransportPupilAssignment,
  TransportStopDetail,
  Student
} from "../types";
import {
  Bus,
  Search,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Clock,
  User,
  Phone,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  X,
  Users,
  Download,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Briefcase
} from "lucide-react";
import { downloadCsvFile, escapeCsvCell } from "../utils/csvExporter";

interface TransportManagementModuleProps {
  routes?: TransportRoute[];
  vehicles: TransportVehicle[];
  assignments?: TransportPupilAssignment[];
  students: Student[];
  userRole?: string;
  canManage?: boolean;
  onAddRoute?: (route: Omit<TransportRoute, "id">) => void;
  onUpdateRoute?: (route: TransportRoute) => void;
  onDeleteRoute?: (id: number) => void;
  onAddVehicle: (vehicle: TransportVehicle) => void;
  onUpdateVehicle?: (vehicle: TransportVehicle) => void;
  onDeleteVehicle?: (id: number) => void;
  onAssignPupil?: (assignment: TransportPupilAssignment) => void;
  onRemovePupil?: (id: number) => void;
  showToast?: (msg: string) => void;
}

export function TransportManagementModule({
  routes = [],
  vehicles = [],
  assignments = [],
  students = [],
  userRole,
  canManage: canManageProp,
  onAddRoute,
  onUpdateRoute,
  onDeleteRoute,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  onAssignPupil,
  onRemovePupil,
  showToast
}: TransportManagementModuleProps) {
  const [activeTab, setActiveTab] = useState<"routes" | "fleet" | "passengers">("routes");
  const [searchTerm, setSearchTerm] = useState("");

  // Route Modal States
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [routeModalMode, setRouteModalMode] = useState<"create" | "edit">("create");
  const [editingRouteId, setEditingRouteId] = useState<number | null>(null);
  const [routeName, setRouteName] = useState("");
  const [routeCode, setRouteCode] = useState("RT-01");
  const [routeZone, setRouteZone] = useState("East Lusaka");
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("+260 977 ");
  const [driverNrc, setDriverNrc] = useState("");
  const [driverLicenseNo, setDriverLicenseNo] = useState("");
  const [busRegNo, setBusRegNo] = useState("ALB 4022 ZM");
  const [routeCapacity, setRouteCapacity] = useState(30);
  const [monthlyFeeZMW, setMonthlyFeeZMW] = useState(850);
  const [termFareZMW, setTermFareZMW] = useState(2400);
  const [morningDepartureTime, setMorningDepartureTime] = useState("06:30 AM");
  const [afternoonDepartureTime, setAfternoonDepartureTime] = useState("15:45 PM");
  const [routeStatus, setRouteStatus] = useState<"Active" | "Maintenance" | "Standby" | "Inactive">("Active");
  const [routeNotes, setRouteNotes] = useState("");

  // Dynamic Stops Builder
  const [stopsList, setStopsList] = useState<TransportStopDetail[]>([]);
  const [stopNameInput, setStopNameInput] = useState("");
  const [stopMorningTimeInput, setStopMorningTimeInput] = useState("06:45 AM");
  const [stopAfternoonTimeInput, setStopAfternoonTimeInput] = useState("16:15 PM");
  const [stopLandmarkInput, setStopLandmarkInput] = useState("");

  // Vehicle Modal States
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleModalMode, setVehicleModalMode] = useState<"create" | "edit">("create");
  const [editingVehicleId, setEditingVehicleId] = useState<number | null>(null);
  const [vehRegNumber, setVehRegNumber] = useState("");
  const [vehModel, setVehModel] = useState("Toyota Coaster (30 Seater)");
  const [vehSeatCapacity, setVehSeatCapacity] = useState(30);
  const [vehDriverName, setVehDriverName] = useState("");
  const [vehDriverPhone, setVehDriverPhone] = useState("+260 977 ");
  const [vehRouteZone, setVehRouteZone] = useState("Lusaka Metropolitan");
  const [vehFitnessExpiry, setVehFitnessExpiry] = useState("2026-11-30");
  const [vehInsuranceExpiry, setVehInsuranceExpiry] = useState("2026-12-31");
  const [vehStatus, setVehStatus] = useState<string>("Active & Fit");

  // Passenger Assignment Modal
  const [showAssignPupilModal, setShowAssignPupilModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [selectedRouteId, setSelectedRouteId] = useState<number | "">("");
  const [pickupStopSelection, setPickupStopSelection] = useState("");
  const [dropoffStopSelection, setDropoffStopSelection] = useState("");
  const [guardianPhoneInput, setGuardianPhoneInput] = useState("");

  const canManage = canManageProp !== undefined ? canManageProp : (userRole === "super_admin" || userRole === "school_admin" || userRole === "head_teacher" || userRole === "admin");

  const totalTransportPupils = assignments.length;

  // Open Create Route Modal
  const handleOpenCreateRoute = () => {
    setRouteModalMode("create");
    setEditingRouteId(null);
    setRouteName("");
    setRouteCode(`RT-0${routes.length + 1}`);
    setRouteZone("Lusaka Central");
    setDriverName("");
    setDriverPhone("+260 977 ");
    setDriverNrc("");
    setDriverLicenseNo("");
    setBusRegNo(vehicles[0]?.registrationNumber || "ALB 4022 ZM");
    setRouteCapacity(30);
    setMonthlyFeeZMW(850);
    setTermFareZMW(2400);
    setMorningDepartureTime("06:30 AM");
    setAfternoonDepartureTime("15:45 PM");
    setRouteStatus("Active");
    setRouteNotes("");
    setStopsList([
      { name: "First Pickup Point", morningPickupTime: "06:40 AM", afternoonDropoffTime: "16:20 PM", landmark: "Bus Shelter" },
      { name: "School Main Gate", morningPickupTime: "07:25 AM", afternoonDropoffTime: "15:30 PM", landmark: "School Dropoff Bay" }
    ]);
    setStopNameInput("");
    setStopLandmarkInput("");
    setShowRouteModal(true);
  };

  // Open Edit Route Modal
  const handleOpenEditRoute = (route: TransportRoute) => {
    setRouteModalMode("edit");
    setEditingRouteId(route.id);
    setRouteName(route.routeName || route.name || "");
    setRouteCode(route.routeCode || `RT-${route.id}`);
    setRouteZone(route.zone || "Lusaka");
    setDriverName(route.driverName || "");
    setDriverPhone(route.driverPhone || "+260 977 ");
    setDriverNrc(route.driverNrc || "");
    setDriverLicenseNo(route.driverLicenseNo || "");
    setBusRegNo(route.busRegNo || route.busNumber || "");
    setRouteCapacity(route.capacity || 30);
    setMonthlyFeeZMW(route.monthlyFeeZMW || 850);
    setTermFareZMW(route.termFareZMW || 2400);
    setMorningDepartureTime(route.morningDepartureTime || "06:30 AM");
    setAfternoonDepartureTime(route.afternoonDepartureTime || "15:45 PM");
    setRouteStatus(route.status || "Active");
    setRouteNotes(route.notes || "");

    // Convert stops to TransportStopDetail objects
    const formattedStops: TransportStopDetail[] = (route.stops || []).map(s => {
      if (typeof s === "string") {
        return { name: s, morningPickupTime: "06:45 AM", afternoonDropoffTime: "16:15 PM" };
      }
      return {
        name: s.name,
        morningPickupTime: s.morningPickupTime || s.time || "06:45 AM",
        afternoonDropoffTime: s.afternoonDropoffTime || "16:15 PM",
        landmark: s.landmark || ""
      };
    });
    setStopsList(formattedStops);
    setStopNameInput("");
    setStopLandmarkInput("");
    setShowRouteModal(true);
  };

  const handleAddStop = () => {
    if (!stopNameInput.trim()) return;
    setStopsList([
      ...stopsList,
      {
        name: stopNameInput.trim(),
        morningPickupTime: stopMorningTimeInput.trim() || "06:45 AM",
        afternoonDropoffTime: stopAfternoonTimeInput.trim() || "16:15 PM",
        landmark: stopLandmarkInput.trim()
      }
    ]);
    setStopNameInput("");
    setStopLandmarkInput("");
  };

  const handleRemoveStop = (index: number) => {
    setStopsList(stopsList.filter((_, i) => i !== index));
  };

  const handleSaveRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeName.trim() || !driverName.trim()) {
      if (showToast) showToast("Route name and driver name are required.");
      return;
    }

    const payload: Omit<TransportRoute, "id"> = {
      name: routeName.trim(),
      routeName: routeName.trim(),
      routeCode: routeCode.trim().toUpperCase(),
      zone: routeZone.trim(),
      driverName: driverName.trim(),
      driverPhone: driverPhone.trim(),
      driverNrc: driverNrc.trim(),
      driverLicenseNo: driverLicenseNo.trim(),
      busNumber: busRegNo.trim(),
      busRegNo: busRegNo.trim(),
      capacity: Number(routeCapacity) || 30,
      monthlyFeeZMW: Number(monthlyFeeZMW) || 850,
      termFareZMW: Number(termFareZMW) || 2400,
      morningDepartureTime: morningDepartureTime.trim(),
      afternoonDepartureTime: afternoonDepartureTime.trim(),
      status: routeStatus,
      notes: routeNotes.trim(),
      studentCount: assignments.filter(a => a.vehicleReg === busRegNo).length,
      stops: stopsList.length > 0 ? stopsList : [{ name: "School Dropoff Bay", time: "07:30 AM" }]
    };

    if (routeModalMode === "create") {
      if (onAddRoute) onAddRoute(payload);
      if (showToast) showToast(`Bus Route "${payload.routeName}" created.`);
    } else if (editingRouteId) {
      if (onUpdateRoute) onUpdateRoute({ ...payload, id: editingRouteId });
      if (showToast) showToast(`Bus Route "${payload.routeName}" updated.`);
    }

    setShowRouteModal(false);
  };

  const handleDeleteRouteAction = (id: number, name: string) => {
    if (confirm(`Are you sure you want to remove route "${name}"?`)) {
      if (onDeleteRoute) onDeleteRoute(id);
      if (showToast) showToast(`Route "${name}" removed.`);
    }
  };

  // Open Create Vehicle Modal
  const handleOpenCreateVehicle = () => {
    setVehicleModalMode("create");
    setEditingVehicleId(null);
    setVehRegNumber("");
    setVehModel("Toyota Coaster (30 Seater)");
    setVehSeatCapacity(30);
    setVehDriverName("");
    setVehDriverPhone("+260 977 ");
    setVehRouteZone("Lusaka Metropolitan");
    setVehFitnessExpiry("2026-11-30");
    setVehInsuranceExpiry("2026-12-31");
    setVehStatus("Active & Fit");
    setShowVehicleModal(true);
  };

  const handleOpenEditVehicle = (veh: TransportVehicle) => {
    setVehicleModalMode("edit");
    setEditingVehicleId(veh.id);
    setVehRegNumber(veh.registrationNumber);
    setVehModel(veh.model);
    setVehSeatCapacity(veh.capacity);
    setVehDriverName(veh.driverName || "");
    setVehDriverPhone(veh.driverPhone || "+260 977 ");
    setVehRouteZone(veh.routeZone || "Lusaka Metropolitan");
    setVehFitnessExpiry(veh.rtsaFitnessExpiry || veh.fitnessExpiry || "2026-11-30");
    setVehInsuranceExpiry(veh.insuranceExpiry || "2026-12-31");
    setVehStatus(veh.status || "Active & Fit");
    setShowVehicleModal(true);
  };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehRegNumber.trim()) {
      if (showToast) showToast("Vehicle registration number is required.");
      return;
    }

    const payload: TransportVehicle = {
      id: vehicleModalMode === "create" ? Date.now() : editingVehicleId || Date.now(),
      registrationNumber: vehRegNumber.trim().toUpperCase(),
      model: vehModel.trim(),
      capacity: Number(vehSeatCapacity) || 30,
      driverName: vehDriverName.trim() || "Assigned School Driver",
      driverPhone: vehDriverPhone.trim(),
      routeZone: vehRouteZone.trim(),
      rtsaFitnessExpiry: vehFitnessExpiry,
      insuranceExpiry: vehInsuranceExpiry,
      status: vehStatus
    };

    if (vehicleModalMode === "create") {
      onAddVehicle(payload);
      if (showToast) showToast(`Vehicle "${payload.registrationNumber}" registered.`);
    } else if (onUpdateVehicle) {
      onUpdateVehicle(payload);
      if (showToast) showToast(`Vehicle "${payload.registrationNumber}" updated.`);
    }

    setShowVehicleModal(false);
  };

  const handleDeleteVehicleAction = (id: number, reg: string) => {
    if (confirm(`Are you sure you want to remove vehicle "${reg}" from fleet records?`)) {
      if (onDeleteVehicle) onDeleteVehicle(id);
      if (showToast) showToast(`Vehicle "${reg}" removed.`);
    }
  };

  // Open Assign Pupil Modal
  const handleOpenAssignPupil = () => {
    setSelectedStudentId(students[0]?.id || "");
    const firstRoute = routes[0];
    setSelectedRouteId(firstRoute ? firstRoute.id : "");
    const firstStop = firstRoute?.stops[0];
    const stopName = typeof firstStop === "string" ? firstStop : firstStop?.name || "";
    setPickupStopSelection(stopName);
    setDropoffStopSelection("School Main Gate");
    setGuardianPhoneInput(students[0]?.guardianPhone || "+260 977 ");
    setShowAssignPupilModal(true);
  };

  const handleSavePupilAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedRouteId) {
      if (showToast) showToast("Please select both a student and a route.");
      return;
    }

    const student = students.find(s => s.id === Number(selectedStudentId));
    const route = routes.find(r => r.id === Number(selectedRouteId));

    if (!student || !route) return;

    const assignment: TransportPupilAssignment = {
      id: Date.now(),
      studentId: student.id,
      studentName: student.name,
      grade: student.grade,
      vehicleId: route.id,
      vehicleReg: route.busRegNo || route.busNumber || "School Bus",
      pickupPoint: pickupStopSelection || "Designated Stop",
      dropoffPoint: dropoffStopSelection || "School Main Gate",
      guardianPhone: guardianPhoneInput.trim() || student.guardianPhone || "",
      status: "Active"
    };

    if (onAssignPupil) {
      onAssignPupil(assignment);
    }
    if (showToast) {
      showToast(`${student.name} assigned to "${route.routeName || route.name}".`);
    }
    setShowAssignPupilModal(false);
  };

  const handleExportBusManifest = () => {
    const headers = [
      "Assignment ID",
      "Student Name",
      "Grade",
      "Bus / Vehicle Reg",
      "Pickup Stop",
      "Dropoff Stop",
      "Guardian Contact",
      "Status"
    ];

    const rows = assignments.map(a => [
      escapeCsvCell(String(a.id)),
      escapeCsvCell(a.studentName),
      escapeCsvCell(a.grade),
      escapeCsvCell(a.vehicleReg),
      escapeCsvCell(a.pickupPoint),
      escapeCsvCell(a.dropoffPoint),
      escapeCsvCell(a.guardianPhone),
      escapeCsvCell(a.status)
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    downloadCsvFile(csvContent, `School_Transport_Passenger_Manifest_${new Date().toISOString().split("T")[0]}.csv`);
    if (showToast) showToast("Transport Passenger Manifest exported to CSV.");
  };

  const filteredRoutes = routes.filter(r => {
    const q = searchTerm.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.routeName && r.routeName.toLowerCase().includes(q)) ||
      (r.routeCode && r.routeCode.toLowerCase().includes(q)) ||
      (r.driverName && r.driverName.toLowerCase().includes(q)) ||
      (r.busRegNo && r.busRegNo.toLowerCase().includes(q))
    );
  });

  const filteredVehicles = vehicles.filter(v => {
    const q = searchTerm.toLowerCase();
    return (
      v.registrationNumber.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      (v.driverName && v.driverName.toLowerCase().includes(q)) ||
      (v.routeZone && v.routeZone.toLowerCase().includes(q))
    );
  });

  const filteredAssignments = assignments.filter(a => {
    const q = searchTerm.toLowerCase();
    return (
      a.studentName.toLowerCase().includes(q) ||
      a.grade.toLowerCase().includes(q) ||
      a.pickupPoint.toLowerCase().includes(q) ||
      a.vehicleReg.toLowerCase().includes(q)
    );
  });

  return (
    <div id="transport-management-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Bus className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              School Transport & Fleet Operations
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure bus routes, pickup schedules, vehicle road fitness, drivers, and pupil subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManage && (
            <>
              <button
                onClick={handleOpenCreateRoute}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Configure Route</span>
              </button>
              <button
                onClick={handleOpenCreateVehicle}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle</span>
              </button>
              <button
                onClick={handleOpenAssignPupil}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Register Pupil</span>
              </button>
            </>
          )}

          <button
            onClick={handleExportBusManifest}
            className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg border border-slate-300 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Manifest</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Bus Routes</div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-serif">{routes.length} Routes</div>
          <div className="text-xs text-slate-500 mt-1">Metropolitan pickup corridors</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transport Pupils</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">{totalTransportPupils} Passengers</div>
          <div className="text-xs text-slate-500 mt-1">Daily morning & afternoon service</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">School Fleet</div>
          <div className="text-2xl font-bold text-indigo-700 mt-1 font-serif">{vehicles.length} Vehicles</div>
          <div className="text-xs text-slate-500 mt-1">Buses, Coasters & Vans</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">RTSA Compliance</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">100% Certified</div>
          <div className="text-xs text-emerald-600 mt-1">All road fitness up to date</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab("routes")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "routes"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Bus Routes & Timetables ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab("fleet")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "fleet"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Fleet & Vehicle Registration ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab("passengers")}
          className={`pb-3 relative cursor-pointer ${
            activeTab === "passengers"
              ? "text-emerald-700 font-semibold border-b-2 border-emerald-700"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Pupil Passenger Manifest ({assignments.length})
        </button>
      </div>

      {/* Tab 1: Bus Routes */}
      {activeTab === "routes" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search route, zone or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRoutes.length > 0 ? (
              filteredRoutes.map((route) => {
                const assignedPupils = assignments.filter(a => a.vehicleReg === (route.busRegNo || route.busNumber)).length;

                return (
                  <div key={route.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {route.routeCode || `RT-${route.id}`}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">{route.zone || "Metropolitan"}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 font-serif mt-1">
                          {route.routeName || route.name}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                          <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                            {route.busRegNo || route.busNumber}
                          </span>
                          <span>• Capacity: {route.capacity || 30} Seats</span>
                          <span className="text-emerald-700 font-semibold">• {assignedPupils} Subscribed</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold text-emerald-800 font-mono">
                          K{route.monthlyFeeZMW?.toLocaleString() || 850}
                        </div>
                        <div className="text-[11px] text-slate-400">per month (K{route.termFareZMW?.toLocaleString() || 2400}/term)</div>
                      </div>
                    </div>

                    {/* Schedule times */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400">Morning Pickup Departure:</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{route.morningDepartureTime || "06:30 AM"}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Afternoon Dropoff Departure:</span>
                        <div className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-amber-700" />
                          <span>{route.afternoonDepartureTime || "15:45 PM"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stops List */}
                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Designated Neighborhood Stops ({route.stops?.length || 0}):</span>
                      </div>
                      <div className="space-y-1">
                        {route.stops && route.stops.map((stop, idx) => {
                          const isObj = typeof stop === "object";
                          const stopName = isObj ? stop.name : stop;
                          const morningTime = isObj ? (stop.morningPickupTime || stop.time) : null;
                          const afternoonTime = isObj ? stop.afternoonDropoffTime : null;
                          const landmark = isObj ? stop.landmark : null;

                          return (
                            <div key={idx} className="p-2 rounded-md bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                                  {idx + 1}
                                </span>
                                <div>
                                  <div className="font-semibold text-slate-800">{stopName}</div>
                                  {landmark && <div className="text-[11px] text-slate-500">{landmark}</div>}
                                </div>
                              </div>
                              <div className="text-right text-[11px] font-mono text-slate-600">
                                {morningTime && <span>AM: {morningTime}</span>}
                                {afternoonTime && <span className="ml-2 text-amber-800">PM: {afternoonTime}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Driver info & Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="p-2 bg-emerald-50/70 rounded-lg border border-emerald-100 text-xs flex items-center gap-2 flex-1">
                        <User className="w-4 h-4 text-emerald-700 shrink-0" />
                        <div className="truncate">
                          <div className="font-semibold text-slate-900 truncate">{route.driverName}</div>
                          <div className="font-mono text-emerald-800 text-[11px]">{route.driverPhone}</div>
                        </div>
                      </div>

                      {canManage && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditRoute(route)}
                            title="Edit Route"
                            className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRouteAction(route.id, route.routeName || route.name || "")}
                            title="Delete Route"
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-slate-200 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-12 text-center bg-white rounded-xl border border-slate-200">
                <Bus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-700">No bus routes configured.</p>
                <p className="text-xs text-slate-400 mt-1">Click "Configure Route" above to add your school's designated bus routes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Fleet */}
      {activeTab === "fleet" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search registration, model or driver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
              />
            </div>
            {canManage && (
              <button
                onClick={handleOpenCreateVehicle}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Vehicle</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Registration #</th>
                  <th className="py-3 px-4">Make & Model</th>
                  <th className="py-3 px-4 text-center">Capacity</th>
                  <th className="py-3 px-4">Assigned Driver</th>
                  <th className="py-3 px-4">RTSA Road Fitness</th>
                  <th className="py-3 px-4">Insurance Expiry</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {v.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        {v.model}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {v.capacity} Seats
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                        <div>{v.driverName}</div>
                        <div className="font-mono text-slate-400">{v.driverPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        {v.rtsaFitnessExpiry || v.fitnessExpiry || "2026-11-30"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-700">
                        {v.insuranceExpiry || "2026-12-31"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>{v.status || "Active & Fit"}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {canManage && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditVehicle(v)}
                              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicleAction(v.id, v.registrationNumber)}
                              className="p-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No vehicles registered in fleet records.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Passengers Manifest */}
      {activeTab === "passengers" && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search passenger pupil or stop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
              />
            </div>

            {canManage && (
              <button
                onClick={handleOpenAssignPupil}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register Pupil for Transport</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Pupil Name</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Assigned Vehicle / Route</th>
                  <th className="py-3 px-4">Pickup Point</th>
                  <th className="py-3 px-4">Guardian Phone</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {a.studentName}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {a.grade}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-800">
                        {a.vehicleReg}
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          <span>{a.pickupPoint}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {a.guardianPhone}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canManage && (
                          <button
                            onClick={() => {
                              if (confirm(`Remove transport allocation for ${a.studentName}?`)) {
                                if (onRemovePupil) onRemovePupil(a.id);
                                if (showToast) showToast(`Transport assignment for ${a.studentName} removed.`);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm font-medium text-slate-700">No pupils currently assigned to bus transport.</p>
                      <p className="text-xs text-slate-400 mt-1">Click "Register Pupil for Transport" above to subscribe students.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create or Edit Route */}
      {showRouteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Bus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 font-serif">
                    {routeModalMode === "create" ? "Configure New Bus Route" : `Edit Route: ${routeName}`}
                  </h3>
                  <p className="text-xs text-slate-500">Define route corridor, driver details, fares and timetable stops</p>
                </div>
              </div>
              <button
                onClick={() => setShowRouteModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoute} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Route Name & Corridor Description *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g. Route 1 - Chelstone / Avondale / Great East"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Route Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={routeCode}
                    onChange={(e) => setRouteCode(e.target.value)}
                    placeholder="e.g. RT-01"
                    className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Coverage Zone
                  </label>
                  <input
                    type="text"
                    value={routeZone}
                    onChange={(e) => setRouteZone(e.target.value)}
                    placeholder="e.g. East Lusaka"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Vehicle / Reg #
                  </label>
                  <input
                    type="text"
                    value={busRegNo}
                    onChange={(e) => setBusRegNo(e.target.value)}
                    placeholder="e.g. ALB 4022 ZM"
                    className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={routeCapacity}
                    onChange={(e) => setRouteCapacity(Number(e.target.value))}
                    min={5}
                    max={80}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Driver Details */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Assigned Driver Credentials</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Driver Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      placeholder="e.g. Mr. Peter Chitembo"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Driver Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(e.target.value)}
                      placeholder="+260 977 123456"
                      className="w-full px-2.5 py-1.5 text-xs bg-white font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Driver NRC / PSV License
                    </label>
                    <input
                      type="text"
                      value={driverLicenseNo}
                      onChange={(e) => setDriverLicenseNo(e.target.value)}
                      placeholder="PSV-89102-ZM"
                      className="w-full px-2.5 py-1.5 text-xs bg-white font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                    />
                  </div>
                </div>
              </div>

              {/* Fares & Schedule Times */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Monthly Fee (ZMW)
                  </label>
                  <input
                    type="number"
                    value={monthlyFeeZMW}
                    onChange={(e) => setMonthlyFeeZMW(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Term Fee (ZMW)
                  </label>
                  <input
                    type="number"
                    value={termFareZMW}
                    onChange={(e) => setTermFareZMW(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Morning Departure
                  </label>
                  <input
                    type="text"
                    value={morningDepartureTime}
                    onChange={(e) => setMorningDepartureTime(e.target.value)}
                    placeholder="06:30 AM"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Afternoon Departure
                  </label>
                  <input
                    type="text"
                    value={afternoonDepartureTime}
                    onChange={(e) => setAfternoonDepartureTime(e.target.value)}
                    placeholder="15:45 PM"
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              {/* Dynamic Stops Builder */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Route Stops & Pickup Schedule
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    value={stopNameInput}
                    onChange={(e) => setStopNameInput(e.target.value)}
                    placeholder="Stop Name (e.g. Chelstone Market)"
                    className="sm:col-span-2 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <input
                    type="text"
                    value={stopMorningTimeInput}
                    onChange={(e) => setStopMorningTimeInput(e.target.value)}
                    placeholder="Pickup (e.g. 06:45 AM)"
                    className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Add Stop
                  </button>
                </div>

                {/* Stops Preview List */}
                <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 bg-slate-50 rounded-lg border border-slate-200">
                  {stopsList.length > 0 ? (
                    stopsList.map((stop, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-1.5 bg-white rounded border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800">{stop.name}</span>
                          <span className="text-slate-400 font-mono">({stop.morningPickupTime || stop.time})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-400 text-center py-2">No stops added yet.</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {routeModalMode === "create" ? "Save Bus Route" : "Update Route Configuration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Vehicle */}
      {showVehicleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <Bus className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800 font-serif">
                    {vehicleModalMode === "create" ? "Register Fleet Vehicle" : `Edit Vehicle: ${vehRegNumber}`}
                  </h3>
                  <p className="text-xs text-slate-500">RTSA road fitness and vehicle specifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowVehicleModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  required
                  value={vehRegNumber}
                  onChange={(e) => setVehRegNumber(e.target.value)}
                  placeholder="e.g. ALB 4022 ZM"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vehicle Model & Make
                  </label>
                  <input
                    type="text"
                    value={vehModel}
                    onChange={(e) => setVehModel(e.target.value)}
                    placeholder="Toyota Coaster"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seating Capacity
                  </label>
                  <input
                    type="number"
                    value={vehSeatCapacity}
                    onChange={(e) => setVehSeatCapacity(Number(e.target.value))}
                    min={5}
                    max={80}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Driver Name
                </label>
                <input
                  type="text"
                  value={vehDriverName}
                  onChange={(e) => setVehDriverName(e.target.value)}
                  placeholder="e.g. Mr. Peter Chitembo"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    RTSA Fitness Expiry
                  </label>
                  <input
                    type="date"
                    value={vehFitnessExpiry}
                    onChange={(e) => setVehFitnessExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Insurance Expiry
                  </label>
                  <input
                    type="date"
                    value={vehInsuranceExpiry}
                    onChange={(e) => setVehInsuranceExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Status
                </label>
                <select
                  value={vehStatus}
                  onChange={(e) => setVehStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800 bg-white"
                >
                  <option value="Active & Fit">Active & Fit</option>
                  <option value="Service Due">Service Due</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Standby">Standby</option>
                  <option value="Off-Road">Off-Road</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVehicleModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Vehicle Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register Pupil for Transport */}
      {showAssignPupilModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800 font-serif">
                    Register Pupil for Transport
                  </h3>
                  <p className="text-xs text-slate-500">Subscribe student to daily pickup service</p>
                </div>
              </div>
              <button
                onClick={() => setShowAssignPupilModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePupilAssignment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Pupil *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const stId = Number(e.target.value);
                    setSelectedStudentId(stId);
                    const st = students.find(s => s.id === stId);
                    if (st) setGuardianPhoneInput(st.guardianPhone || "");
                  }}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800 bg-white"
                >
                  <option value="">-- Choose Pupil --</option>
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.grade})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designated Bus Route *
                </label>
                <select
                  value={selectedRouteId}
                  onChange={(e) => {
                    const rId = Number(e.target.value);
                    setSelectedRouteId(rId);
                    const r = routes.find(rt => rt.id === rId);
                    if (r && r.stops.length > 0) {
                      const firstStop = r.stops[0];
                      setPickupStopSelection(typeof firstStop === "string" ? firstStop : firstStop.name);
                    }
                  }}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800 bg-white"
                >
                  <option value="">-- Choose Route --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.routeCode || `RT-${r.id}`}: {r.routeName || r.name} (K{r.monthlyFeeZMW}/mo)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pickup Point / Neighborhood Stop
                </label>
                <input
                  type="text"
                  value={pickupStopSelection}
                  onChange={(e) => setPickupStopSelection(e.target.value)}
                  placeholder="e.g. Chelstone Market Roundabout"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Guardian Emergency Phone
                </label>
                <input
                  type="text"
                  value={guardianPhoneInput}
                  onChange={(e) => setGuardianPhoneInput(e.target.value)}
                  placeholder="+260 977 123456"
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-emerald-600 text-slate-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignPupilModal(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Subscribe Pupil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
