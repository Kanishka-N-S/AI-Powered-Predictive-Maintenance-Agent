import React, { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  ChevronRight, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Calendar, 
  BookOpen, 
  Clock, 
  Printer, 
  X,
  XCircle,
  Loader2,
  Lock,
  Download
} from "lucide-react";

interface Prediction {
  id: string;
  machineId: string;
  machineName: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
  predictedFailure: string;
  technicalExplanation: string;
  maintenanceRecommendation: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number;
  priority: string;
  analyzedAt: string;
  estimatedDowntime: string;
  nextInspectionDate: string;
  retrievedSimilarCases?: string[];
  parameters?: any;
}

interface ReportsProps {
  token: string;
  userRole: string;
}

export default function Reports({ token, userRole }: ReportsProps) {
  const [reports, setReports] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("date_desc");

  // Detailed Modal view
  const [selectedReport, setSelectedReport] = useState<Prediction | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = `/api/reports?search=${encodeURIComponent(search)}`;
      if (statusFilter) {
        url += `&status=${statusFilter}`;
      }
      url += `&sortBy=${sortBy}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Unable to retrieve maintenance ledger history.");
      const data = await res.json();
      setReports(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sortBy, token]);

  const handleDeleteReport = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering details modal
    if (userRole !== "admin") {
      alert("Unauthorized: Root Administrator privilege required to remove permanent ledger entries.");
      return;
    }
    if (!confirm("Are you sure you want to permanently delete this diagnostic report? This is an irreversible audit action.")) {
      return;
    }

    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "File lock failure.");
      }
      fetchReports();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-8 bg-slate-50/50 space-y-6 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-150">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            id="input-reports-search"
            type="text"
            placeholder="Search equipment, anomalies, reason codes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-700 placeholder-slate-400"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            id="select-reports-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-600 font-sans cursor-pointer"
          >
            <option value="">All Health Statuses</option>
            <option value="healthy">Healthy</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <select
            id="select-reports-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none text-slate-600 font-sans cursor-pointer"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="confidence_desc">Confidence (High to Low)</option>
            <option value="risk_desc">Risk Rating (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Reports Table / Cards list */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600 mb-2" />
          <p className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">Loading Diagnostic Ledger...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center max-w-xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <p className="text-xs text-rose-700 font-sans">{error}</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700 font-sans">No maintenance records recorded</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Adjust search parameters or run a health analysis to record a new predictive inspection profile.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-150 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-mono uppercase text-[9px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Equipment Unit</th>
                  <th className="py-3 px-4">Anomalies Detected</th>
                  <th className="py-3 px-4">Risk Rating</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4 text-center">Urgency</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {reports.map((r) => (
                  <tr 
                    key={r.id} 
                    id={`report-row-${r.id}`}
                    onClick={() => setSelectedReport(r)}
                    className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {r.machineName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {r.predictedFailure === "None" ? "No Fault Detected" : r.predictedFailure}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {r.riskLevel}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {r.confidenceScore}%
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                        r.healthStatus === "critical" 
                          ? "bg-rose-50 text-rose-600 border border-rose-100 animate-pulse" 
                          : r.healthStatus === "warning" 
                            ? "bg-amber-50 text-amber-600 border border-amber-100" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        {r.healthStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[10px]">
                      {new Date(r.analyzedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        id={`btn-del-report-${r.id}`}
                        onClick={(e) => handleDeleteReport(e, r.id)}
                        className={`p-1.5 hover:bg-slate-100 rounded-md transition-colors cursor-pointer ${
                          userRole === "admin" ? "text-slate-400 hover:text-rose-600" : "text-slate-200 cursor-not-allowed"
                        }`}
                        title={userRole === "admin" ? "Delete Report" : "Admin Auth Required"}
                        disabled={userRole !== "admin"}
                      >
                        {userRole === "admin" ? (
                          <Trash2 className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report detailed Certificate popover view modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col justify-between max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono tracking-wider uppercase text-slate-700">
                  Equipment Audit Certificate
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-print-popup"
                  onClick={handlePrint}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 border border-slate-200 flex items-center gap-1 text-[10px] font-semibold cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content - print targets this entire container! */}
            <div id="printable-area" className="p-6 overflow-y-auto space-y-6">
              
              {/* Report Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-150">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight">
                    {selectedReport.machineName}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                    Reference Code: {selectedReport.machineId} • Diagnostic Timestamp: {new Date(selectedReport.analyzedAt).toLocaleString()}
                  </span>
                </div>
                
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                  selectedReport.healthStatus === "critical" 
                    ? "bg-rose-50 text-rose-600 border border-rose-100" 
                    : selectedReport.healthStatus === "warning" 
                      ? "bg-amber-50 text-amber-600 border border-amber-100" 
                      : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}>
                  {selectedReport.healthStatus.toUpperCase()}
                </span>
              </div>

              {/* Status parameters grids */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">RISK WEIGHT</span>
                  <span className="text-[10px] font-bold text-slate-800 font-sans mt-1 block">
                    {selectedReport.riskLevel}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">INFERENCE CONFIDENCE</span>
                  <span className="text-[10px] font-bold text-blue-600 font-mono mt-1 block">
                    {selectedReport.confidenceScore}%
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">URGENCY PRIORITY</span>
                  <span className={`inline-block text-[10px] font-bold font-mono uppercase mt-1 ${
                    selectedReport.priority === "Immediate" 
                      ? "text-rose-600" 
                      : selectedReport.priority === "High" 
                        ? "text-amber-600" 
                        : "text-slate-600"
                  }`}>
                    {selectedReport.priority}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">DOWNTIME COST</span>
                  <span className="text-[10px] font-bold text-slate-700 font-sans mt-1 block">
                    {selectedReport.estimatedDowntime}
                  </span>
                </div>
              </div>

              {/* Anomaly Mode */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">DIAGNOSED FAILURE ANOMALY</span>
                <p className="text-xs font-bold text-slate-800 font-sans bg-slate-50 border border-slate-150 rounded px-3 py-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{selectedReport.predictedFailure === "None" ? "No Imminent Fault Predicted" : selectedReport.predictedFailure}</span>
                </p>
              </div>

              {/* Parameters at inspection time */}
              {selectedReport.parameters && (
                <div className="space-y-1.5">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">HISTORIC TELEMETRY CAPTURE</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 text-[10px] font-mono">
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block">Temperature:</span>
                      <span className="font-bold text-slate-700">{selectedReport.parameters.temperature}°C</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block">Pressure:</span>
                      <span className="font-bold text-slate-700">{selectedReport.parameters.pressure} Bar</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block">Vibration:</span>
                      <span className="font-bold text-slate-700">{selectedReport.parameters.vibrationLevel} mm/s</span>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 block">Operating Hours:</span>
                      <span className="font-bold text-slate-700">{selectedReport.parameters.operatingHours} hrs</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical explanation reasoning */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">TECHNICAL EVALUATION REASONING</span>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100 whitespace-pre-line font-sans font-normal">
                  {selectedReport.technicalExplanation}
                </p>
              </div>

              {/* Action recommendations */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ACTIONABLE CREW DIRECTIVES</span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-4 rounded-lg border border-slate-100 whitespace-pre-line font-sans font-medium">
                  {selectedReport.maintenanceRecommendation}
                </p>
              </div>

              {/* RAG references */}
              {selectedReport.retrievedSimilarCases && selectedReport.retrievedSimilarCases.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">RAG REFERENCE DOCUMENTS INDEXED</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.retrievedSimilarCases.map((doc, i) => (
                      <span key={i} className="px-2.5 py-1 bg-blue-50 border border-blue-100 rounded text-[10px] font-sans font-semibold text-blue-700">
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Next inspections footer */}
              <div className="border-t border-slate-150 pt-4 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Downtime Estimate: <strong className="text-slate-600 font-semibold">{selectedReport.estimatedDowntime}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Schedule next audit: <strong className="text-slate-600 font-semibold">{selectedReport.nextInspectionDate}</strong></span>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-150 flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
