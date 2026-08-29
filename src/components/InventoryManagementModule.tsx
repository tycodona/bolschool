import React, { useState } from "react";
import { InventoryItem } from "../types";
import {
  Package,
  Search,
  Plus,
  Wrench,
  CheckCircle,
  AlertCircle,
  Building,
  DollarSign,
  Tag,
  Calendar,
  X,
  FileSpreadsheet
} from "lucide-react";

interface InventoryManagementModuleProps {
  items?: InventoryItem[];
  inventory?: InventoryItem[];
  userRole?: string;
  canManage?: boolean;
  onAddItem: (item: InventoryItem) => void;
  onUpdateCondition?: (id: number, condition: InventoryItem["condition"], notes?: string) => void;
  onEditItem?: (item: InventoryItem) => void;
  onDeleteItem?: (id: number) => void;
}

export function InventoryManagementModule({
  items,
  inventory,
  userRole,
  canManage: canManageProp,
  onAddItem,
  onUpdateCondition,
  onEditItem,
  onDeleteItem
}: InventoryManagementModuleProps) {
  const activeItems = items || inventory || [];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCondition, setSelectedCondition] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItemForMaintenance, setSelectedItemForMaintenance] = useState<InventoryItem | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  const [newCondition, setNewCondition] = useState<InventoryItem["condition"]>("Good");

  // Add Item State
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryItem["category"]>("Computers & ICT");
  const [quantity, setQuantity] = useState(1);
  const [condition, setCondition] = useState<InventoryItem["condition"]>("Excellent");
  const [location, setLocation] = useState("Main Computer Laboratory (Room 12)");
  const [purchaseDate, setPurchaseDate] = useState("2026-01-15");
  const [purchasePriceZMW, setPurchasePriceZMW] = useState(15000);
  const [supplier, setSupplier] = useState("Lusaka Educational Equipment Ltd");
  const [assignedDepartment, setAssignedDepartment] = useState("Mathematics & Computing");
  const [serialNumber, setSerialNumber] = useState("");

  const categories: InventoryItem["category"][] = [
    "Computers & ICT",
    "Desks & Tables",
    "Chairs",
    "Laboratory Equipment",
    "Sports & Physical Ed",
    "Vehicles",
    "Office Equipment",
    "Library Assets",
    "General School Property"
  ];

  const conditions: InventoryItem["condition"][] = [
    "Excellent",
    "Good",
    "Fair",
    "Damaged",
    "Needs Repair",
    "Condemned"
  ];

  const filteredItems = activeItems.filter(i => {
    const itemCode = i.code || i.assetTag || "";
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.serialNumber && i.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || i.category === selectedCategory;
    const matchesCondition = selectedCondition === "all" || i.condition === selectedCondition;
    return matchesSearch && matchesCategory && matchesCondition;
  });

  const totalAssetValueZMW = activeItems.reduce((acc, i) => acc + (i.purchasePriceZMW || 0), 0);
  const totalPhysicalUnits = activeItems.reduce((acc, i) => acc + (i.quantity || 0), 0);
  const itemsNeedingRepair = activeItems.filter(i => i.condition === "Needs Repair" || i.condition === "Damaged");

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newItem: InventoryItem = {
      id: Date.now(),
      code: code.trim() || `AST-${String(category).slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      category,
      quantity: Number(quantity) || 1,
      condition,
      location: location.trim(),
      purchaseDate,
      purchasePriceZMW: Number(purchasePriceZMW) || 0,
      supplier: supplier.trim(),
      assignedDepartment: assignedDepartment.trim(),
      serialNumber: serialNumber.trim() || undefined
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setName("");
    setCode("");
  };

  const handleSaveMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForMaintenance) return;
    if (onUpdateCondition) {
      onUpdateCondition(selectedItemForMaintenance.id, newCondition, maintenanceNotes);
    } else if (onEditItem) {
      onEditItem({
        ...selectedItemForMaintenance,
        condition: newCondition,
        maintenanceNotes
      });
    }
    setSelectedItemForMaintenance(null);
    setMaintenanceNotes("");
  };

  const canManage = canManageProp !== undefined ? canManageProp : (userRole === "super_admin" || userRole === "school_admin" || userRole === "head_teacher" || userRole === "accountant" || userRole === "admin");

  return (
    <div id="inventory-management-module" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Package className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-800 font-serif">
              Institutional Asset & Inventory Management
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Tracking school furniture, laboratory apparatus, ICT computers, vehicles, and campus maintenance schedules.
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-medium rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Asset</span>
            </button>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Asset Value</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-serif">
            K{totalAssetValueZMW.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-1">Zambian Kwacha capital assets</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Physical Count</div>
          <div className="text-2xl font-bold text-slate-800 mt-1 font-serif">
            {totalPhysicalUnits} Units
          </div>
          <div className="text-xs text-slate-500 mt-1">Across {items.length} registered asset categories</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Optimal Condition</div>
          <div className="text-2xl font-bold text-sky-700 mt-1 font-serif">
            {items.filter(i => i.condition === "Excellent" || i.condition === "Good").length} Assets
          </div>
          <div className="text-xs text-slate-500 mt-1">Good working order</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Repair & Maintenance</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-serif">
            {itemsNeedingRepair.length}
          </div>
          <div className="text-xs text-amber-600 mt-1">Scheduled for inspection</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search asset name, code, serial number, or room location..."
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
          <option value="all">All Categories ({items.length})</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium"
        >
          <option value="all">All Conditions</option>
          {conditions.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Assets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Asset Code & Name</th>
                <th className="py-3 px-4">Category & Department</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Value (ZMW)</th>
                <th className="py-3 px-4 text-center">Condition</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono">Code: {item.code}</div>
                    {item.serialNumber && (
                      <div className="text-[11px] text-slate-400">S/N: {item.serialNumber}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                      {item.category}
                    </span>
                    <div className="text-xs text-slate-400 mt-0.5">{item.assignedDepartment}</div>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                    {item.location}
                  </td>
                  <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                    {item.quantity}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-emerald-800">
                    K{item.purchasePriceZMW.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      item.condition === "Excellent"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.condition === "Good"
                        ? "bg-sky-100 text-sky-800"
                        : item.condition === "Fair"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}>
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {canManage && (
                      <button
                        onClick={() => {
                          setSelectedItemForMaintenance(item);
                          setNewCondition(item.condition);
                          setMaintenanceNotes(item.maintenanceNotes || "");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5 text-slate-500" />
                        <span>Maintenance</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    No asset records match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Register Asset */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Register New School Asset</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Code / Tag</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. ICT-PC-045"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Name & Description *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Epson 3LCD Interactive Projector with Ceiling Mount"
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:bg-white font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-medium"
                  >
                    {conditions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Total Value (ZMW)</label>
                  <input
                    type="number"
                    value={purchasePriceZMW}
                    onChange={(e) => setPurchasePriceZMW(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Science Laboratory 2"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Department</label>
                  <input
                    type="text"
                    value={assignedDepartment}
                    onChange={(e) => setAssignedDepartment(e.target.value)}
                    placeholder="e.g. Natural Sciences"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    placeholder="e.g. Sharp Electronics Zambia"
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-mono text-xs"
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
                  Save Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Maintenance Update */}
      {selectedItemForMaintenance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-700" />
                <h3 className="text-lg font-bold text-slate-800 font-serif">Asset Maintenance & Condition</h3>
              </div>
              <button
                onClick={() => setSelectedItemForMaintenance(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mt-3 border border-slate-200 text-xs">
              <div className="font-bold text-slate-800">{selectedItemForMaintenance.name}</div>
              <div className="text-slate-500 font-mono">Code: {selectedItemForMaintenance.code} • Location: {selectedItemForMaintenance.location}</div>
            </div>

            <form onSubmit={handleSaveMaintenance} className="mt-4 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Updated Condition Status</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 font-semibold"
                >
                  {conditions.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance & Service Log Notes</label>
                <textarea
                  rows={3}
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  placeholder="e.g. Replaced optical lamp, tested projection resolution. Next inspection due in 6 months."
                  className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItemForMaintenance(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Update Asset Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
