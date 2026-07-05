import React, { useState, useEffect } from "react";
import { 
  User, 
  Shield, 
  BookOpen, 
  Bookmark, 
  Trash2, 
  ShieldCheck, 
  Building, 
  Clock, 
  Activity, 
  Key, 
  Lock, 
  HelpCircle,
  Users,
  ChevronRight,
  AlertTriangle,
  Loader2
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  role: string;
  name: string;
  createdAt?: string;
}

interface ProfileProps {
  token: string;
  currentUser: UserProfile | null;
}

export default function Profile({ token, currentUser }: ProfileProps) {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Selected Manual Doc
  const [selectedDocIndex, setSelectedDocIndex] = useState<number | null>(0);

  // Knowledge base list
  const knowledgeBaseDocs = [
    {
      title: "SC-404 Screw Compressor Operations Manual",
      id: "DOC-SC404-01",
      category: "Air Compressor Systems",
      content: "Equipment: Model SC-404 Air Compressor.\n\nNormal Operating Ranges:\n- Discharge Temperature: 40°C to 65°C\n- Operating Pressure: 7.5 to 10.0 Bar\n- Main Frame Vibration: Under 2.5 mm/s\n\nCommon Failures & Troubleshooting Guidelines:\n1. Over-temperature Fault (>85°C):\n   - Probable cause: Clogged air filter, oil cooler blockage, or low lubricating oil volume.\n   - Corrective actions: Clean intake filters immediately, inspect oil levels, flush cooling coils.\n2. Pressure Drop Anomalies (<6.5 Bar):\n   - Probable cause: Damaged compressor belt slipping, supply hose leaks, or separator valve wear.\n   - Corrective actions: Adjust tension on driving belts, perform sonic leak inspections on headers, service separating cartridges."
    },
    {
      title: "DMG MORI Spindle CNC Milling Technical Guide",
      id: "DOC-DMG-02",
      category: "CNC Machining Centers",
      content: "Equipment: DMG MORI Spindle Drive System.\n\nNormal Operating Ranges:\n- Drive Motor Temperature: 25°C to 45°C\n- Rotational Shaft Vibration: Under 1.8 mm/s\n- Operating Noise Level: Under 75 dB\n- Standard Speed: 1500 to 5000 RPM\n\nCommon Failures & Troubleshooting Guidelines:\n1. Extreme Chassis Vibration (>4.5 mm/s):\n   - Probable cause: Rotational spindle unbalance, structural looseness, or bearing wear.\n   - Corrective actions: Suspend CNC operations, recalibrate shaft balancing, inspect spindle lock collars.\n2. High-Pitch Acoustic Whining (>80 dB):\n   - Probable cause: Bearing lubrication film depletion, or spindle motor rotor misalignment.\n   - Corrective actions: Inject lubricant grease, check motor mounting alignment pins."
    },
    {
      title: "HP-202 Hydraulic Pressure Press Service Manual",
      id: "DOC-HP202-03",
      category: "Hydraulic Forming Equipment",
      content: "Equipment: Model HP-202 Heavy Duty Press.\n\nNormal Operating Ranges:\n- Fluid Operating Pressure: 130 to 165 Bar\n- Fluid Temperature: 30°C to 55°C\n- Oil Leakage Indicator: Absolute Zero\n\nCommon Failures & Troubleshooting Guidelines:\n1. Active Fluid Leakage:\n   - Probable cause: Main piston seal deterioration, flange joint loosening, or pressure hose cracking.\n   - Corrective actions: Shut down hydraulic pumps immediately. Replace seal kit (P/N SK-HP202), retighten flange bolt arrays, replace high-pressure lines.\n2. Pressure Drop below standard operating parameters (<120 Bar):\n   - Probable cause: Internal fluid bypass, faulty relief valve, or fluid pump degradation.\n   - Corrective actions: Replace relief manifold, verify pump rotor clearances."
    }
  ];

  const fetchUsers = async () => {
    if (!currentUser || currentUser.role !== "admin") return;
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Could not retrieve user directory.");
      const data = await res.json();
      setUsersList(data);
    } catch (err: any) {
      setUsersError(err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token, currentUser]);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete user.");
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="flex-1 p-8 bg-slate-50/50 space-y-6 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Upper Layout: User Metadata Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-6 space-y-5 flex flex-col justify-between h-72">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg font-sans border border-blue-100">
                {currentUser?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 font-sans tracking-tight">{currentUser?.name}</h3>
                <span className={`inline-block mt-0.5 px-2 py-0.5 text-[9px] font-mono font-bold rounded ${
                  currentUser?.role === 'admin' 
                    ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                    : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {currentUser?.role.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-4 text-xs font-sans text-slate-500">
              <div className="flex justify-between">
                <span>System Username:</span>
                <strong className="text-slate-700">{currentUser?.username}</strong>
              </div>
              <div className="flex justify-between">
                <span>Corporate Email:</span>
                <strong className="text-slate-700">{currentUser?.email}</strong>
              </div>
              <div className="flex justify-between">
                <span>Factory Location:</span>
                <strong className="text-slate-700">Sector Alpha / Floor A</strong>
              </div>
            </div>
          </div>

          <div className="p-2.5 bg-blue-50/50 border border-blue-100 rounded-lg flex gap-2 items-center text-[10px] text-slate-500">
            <Shield className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Encrypted credentials are certified compliant with smart asset protocols.</span>
          </div>
        </div>

        {/* ChromaDB RAG Stats Card */}
        <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-6 space-y-4 h-72">
          <div>
            <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-0.5">
              CHROMADB RAG MATRIX OVERVIEW
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Dynamic system diagnostics vector catalog metrics
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">VECTOR INDEX STATUS</span>
              <span className="text-xs font-bold text-emerald-600 font-sans mt-1 inline-flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                ONLINE
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">RETRIEVAL METRIC</span>
              <span className="text-xs font-bold text-slate-800 font-sans mt-1 block">Cosine Similarity</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">COLLECTED INDEXES</span>
              <span className="text-xs font-bold text-blue-600 font-mono mt-1 block">3 Manuals</span>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">CONTEXT SIZE EXTRACTED</span>
              <span className="text-xs font-bold text-slate-800 font-mono mt-1 block">~1.2k Tokens</span>
            </div>
          </div>
        </div>

        {/* Security / System compliance info */}
        <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-6 space-y-4 h-72 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-0.5">
              SYSTEM CERTIFICATION
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Cybersecurity and framework compliance tags
            </p>
          </div>

          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>JWT Decryption Protocols Active</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>SHA-256 One-Way Passphrase Hashing</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>ISO 13374 Telemetry & Prognostics Standard</span>
            </div>
          </div>

          <p className="text-[9px] font-mono text-slate-400">
            System uptime clock running securely on sandboxed container environment.
          </p>
        </div>

      </div>

      {/* Lower Layout Grid: RAG Document Manual Explorer & Admin User Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* RAG Knowledge Base Document Explorer */}
        <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-6 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-0.5">
              CHROMADB RAG MANUAL EXPLORER
            </h3>
            <p className="text-[10px] text-slate-400 font-sans">
              Read manuals injected into Gemini prompts when matching parameters are flagged
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {knowledgeBaseDocs.map((doc, idx) => {
              const isSelected = selectedDocIndex === idx;
              return (
                <button
                  key={idx}
                  id={`btn-manual-${idx}`}
                  onClick={() => setSelectedDocIndex(idx)}
                  className={`p-3 text-left border rounded-xl transition-all cursor-pointer flex flex-col justify-between h-24 select-none ${
                    isSelected 
                      ? "bg-blue-50 border-blue-500 text-blue-700" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-wider">
                    {doc.id}
                  </span>
                  <h4 className="text-[11px] font-bold font-sans tracking-tight leading-snug truncate w-full mt-1">
                    {doc.title}
                  </h4>
                  <span className="text-[9px] font-mono font-semibold text-slate-400 mt-2 block">
                    {doc.category}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedDocIndex !== null && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 pb-2 border-b border-slate-200">
                <BookOpen className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-bold text-slate-700 font-sans">
                  {knowledgeBaseDocs[selectedDocIndex].title} Content
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line font-sans font-normal max-h-60 overflow-y-auto pr-1">
                {knowledgeBaseDocs[selectedDocIndex].content}
              </p>
            </div>
          )}
        </div>

        {/* Admin User Management panel */}
        {currentUser?.role === "admin" ? (
          <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-0.5">
                ROOT ACCOUNT CONTROL DIRECTORY
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Manage registered engineers, authorize credentials, and revoke tokens
              </p>
            </div>

            {loadingUsers ? (
              <div className="h-44 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              </div>
            ) : usersError ? (
              <p className="text-xs text-rose-500">{usersError}</p>
            ) : (
              <div className="border border-slate-150 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 font-mono uppercase text-[9px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Engineer Name</th>
                      <th className="py-2.5 px-3">Username</th>
                      <th className="py-2.5 px-3">Role Status</th>
                      <th className="py-2.5 px-3 text-right">Revoke</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {u.name}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-mono">
                          {u.username}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded font-bold uppercase ${
                            u.role === 'admin' 
                              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            id={`btn-del-user-${u.id}`}
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === currentUser.id}
                            className={`p-1 hover:bg-slate-100 rounded text-slate-400 transition-colors cursor-pointer ${
                              u.id === currentUser.id 
                                ? 'opacity-30 cursor-not-allowed text-slate-200' 
                                : 'hover:text-rose-600'
                            }`}
                            title={u.id === currentUser.id ? "Cannot revoke self" : "Revoke Access"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center h-[380px] flex flex-col justify-center items-center">
            <Lock className="w-10 h-10 text-slate-300 mb-2" />
            <h4 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">RESTRICTED ADMIN MATRIX</h4>
            <p className="text-xs text-slate-400 mt-2 max-w-xs font-sans">
              Root account control panel and user directories are visible strictly to authorized System Administrators.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
