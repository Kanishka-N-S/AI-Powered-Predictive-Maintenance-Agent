import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  Cpu, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Wrench, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  Calendar,
  Layers,
  Building,
  Loader2,
  Lock,
  User,
  Activity,
  AlertCircle
} from "lucide-react";

interface Machine {
  id: string;
  machineId: string;
  name: string;
  type: string;
  manufacturer: string;
  department: string;
  installationDate: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface MachinesProps {
  token: string;
  userRole: string;
  setActiveTab: (tab: string) => void;
  setSelectedMachineForAnalysis?: (machineId: string) => void;
}

export default function Machines({ token, userRole, setActiveTab, setSelectedMachineForAnalysis }: MachinesProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMachineId, setCurrentMachineId] = useState<string | null>(null);

  // Form Fields
  const [machineId, setMachineId] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [department, setDepartment] = useState("");
  const [installationDate, setInstallationDate] = useState("");
  const [status, setStatus] = useState<'healthy' | 'warning' | 'critical'>("healthy");

  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Departments list for filter
  const departments = [
    "Machining Dept A",
    "Forming Dept B",
    "Assembly Line 1",
    "Utilities Yard",
  ];

  const fetchMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/machines?search=${encodeURIComponent(search)}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      if (deptFilter) url += `&department=${encodeURIComponent(deptFilter)}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not fetch machinery inventory.");
      const data = await res.json();
      setMachines(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMachines();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, statusFilter, deptFilter, token]);

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentMachineId(null);
    setMachineId("");
    setName("");
    setType("");
    setManufacturer("");
    setDepartment(departments[0]);
    setInstallationDate(new Date().toISOString().split("T")[0]);
    setStatus("healthy");
    setFormError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (m: Machine) => {
    setIsEditing(true);
    setCurrentMachineId(m.id);
    setMachineId(m.machineId);
    setName(m.name);
    setType(m.type);
    setManufacturer(m.manufacturer);
    setDepartment(m.department);
    setInstallationDate(m.installationDate);
    setStatus(m.status);
    setFormError(null);
    setShowModal(true);
  };

  const handleDeleteMachine = async (id: string) => {
    if (userRole !== "admin") {
      alert("Unauthorized: Root Administrator privilege required to decommission factory assets.");
      return;
    }
    if (!confirm("Are you sure you want to decommission this machinery asset? All telemetry history will be removed.")) {
      return;
    }

    try {
      const res = await fetch(`/api/machines/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Decommission file lock failure.");
      }
      fetchMachines();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSubmitting(true);

    if (!machineId || !name || !type || !manufacturer || !department || !installationDate) {
      setFormError("All machine asset fields are mandatory.");
      setFormSubmitting(false);
      return;
    }

    const payload = {
      machineId,
      name,
      type,
      manufacturer,
      department,
      installationDate,
      status
    };

    const url = isEditing ? `/api/machines/${currentMachineId}` : "/api/machines";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to commit machine record.");
      }

      setShowModal(false);
      fetchMachines();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleAnalyzeRedirect = (m: Machine) => {
    if (setSelectedMachineForAnalysis) {
      setSelectedMachineForAnalysis(m.id);
    }
    setActiveTab("analysis");
  };

  return (
    <div className="flex-1 p-8 bg-slate-50/50 space-y-6 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Controls / Filter row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-150">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            id="input-machine-search"
            type="text"
            placeholder="Search code, name, type, builder..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-700 placeholder-slate-400"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Filter Badges & Selects */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            id="select-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-600 font-sans cursor-pointer"
          >
            <option value="">All Health States</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <select
            id="select-dept-filter"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-600 font-sans cursor-pointer"
          >
            <option value="">All Departments</option>
            {departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>

          <button
            id="btn-add-machine"
            onClick={handleOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/15 transition-all ml-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset</span>
          </button>
        </div>
      </div>

      {/* Grid or Table of machines */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">Loading Machinery Ledger...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center max-w-xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-rose-700 font-sans">{error}</p>
        </div>
      ) : machines.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 font-sans">No matching equipment assets</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">Configure your search terms or register a new equipment block to begin capturing smart diagnostics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {machines.map((m) => (
            <div 
              key={m.id} 
              id={`machine-card-${m.id}`}
              className="bg-white rounded-xl border border-slate-150 shadow-sm p-5 hover:shadow-md transition-shadow relative flex flex-col justify-between h-56"
            >
              <div>
                {/* Header Status Bar */}
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[10px] font-bold font-mono tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                    {m.machineId}
                  </span>
                  
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                    m.status === "healthy" 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : m.status === "warning" 
                        ? "bg-amber-50 text-amber-600 border border-amber-100" 
                        : "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse"
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      m.status === "healthy" ? "bg-emerald-500" : m.status === "warning" ? "bg-amber-500" : "bg-rose-500"
                    }`}></span>
                    {m.status.toUpperCase()}
                  </span>
                </div>

                {/* Machine Name */}
                <h4 className="text-sm font-bold text-slate-800 font-sans tracking-tight truncate">
                  {m.name}
                </h4>
                
                {/* Sub-details */}
                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{m.type}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{m.manufacturer} • {m.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px] font-mono">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Installed: {new Date(m.installationDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between mt-4">
                <button
                  id={`btn-analyze-${m.id}`}
                  onClick={() => handleAnalyzeRedirect(m)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Analyze Health</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    id={`btn-edit-${m.id}`}
                    onClick={() => handleOpenEditModal(m)}
                    className="p-1.5 hover:bg-slate-50 rounded-md text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Edit Record"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`btn-delete-${m.id}`}
                    onClick={() => handleDeleteMachine(m.id)}
                    className={`p-1.5 hover:bg-slate-50 rounded-md transition-colors cursor-pointer ${
                      userRole === "admin" ? "text-slate-400 hover:text-rose-600" : "text-slate-300 cursor-not-allowed"
                    }`}
                    title={userRole === "admin" ? "Decommission Asset" : "Admin Approval Required"}
                    disabled={userRole !== "admin"}
                  >
                    {userRole === "admin" ? (
                      <Trash2 className="w-3.5 h-3.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Commission Modal dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-800">
                <Wrench className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase">
                  {isEditing ? "Modify Equipment Profile" : "Register Machinery Asset"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="font-medium font-sans">{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-mach-id" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Equipment ID Code
                  </label>
                  <input
                    id="form-mach-id"
                    type="text"
                    required
                    placeholder="e.g. CNC-M-110"
                    disabled={isEditing}
                    value={machineId}
                    onChange={(e) => setMachineId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                </div>
                <div>
                  <label htmlFor="form-mach-name" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Asset Name
                  </label>
                  <input
                    id="form-mach-name"
                    type="text"
                    required
                    placeholder="e.g. DMG MORI Spindle-110"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-mach-type" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Equipment Class
                  </label>
                  <input
                    id="form-mach-type"
                    type="text"
                    required
                    placeholder="e.g. CNC Milling Machine"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
                <div>
                  <label htmlFor="form-mach-manuf" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    OEM Manufacturer
                  </label>
                  <input
                    id="form-mach-manuf"
                    type="text"
                    required
                    placeholder="e.g. DMG MORI"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="form-mach-dept" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Factory Sector/Dept
                  </label>
                  <select
                    id="form-mach-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600"
                  >
                    {departments.map((dept, i) => (
                      <option key={i} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="form-mach-date" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Installation Date
                  </label>
                  <input
                    id="form-mach-date"
                    type="date"
                    required
                    value={installationDate}
                    onChange={(e) => setInstallationDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600"
                  />
                </div>
              </div>

              {isEditing && (
                <div>
                  <label htmlFor="form-mach-status" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Current Health Status Override
                  </label>
                  <select
                    id="form-mach-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600"
                  >
                    <option value="healthy">Healthy</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-500 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="btn-mach-submit"
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-500/15 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {formSubmitting ? "Committing Ledger..." : isEditing ? "Save Adjustments" : "Register Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
