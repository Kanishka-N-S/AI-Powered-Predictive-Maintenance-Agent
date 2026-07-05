import React, { useEffect, useState } from "react";
import { 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Activity, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileCheck2
} from "lucide-react";
import { HealthDistributionChart, FailureTypesChart, MonthlyTrendChart } from "../components/Charts";

interface Prediction {
  id: string;
  machineId: string;
  machineName: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
  predictedFailure: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number;
  priority: string;
  analyzedAt: string;
  estimatedDowntime: string;
}

interface DashboardProps {
  token: string;
  setActiveTab: (tab: string) => void;
  setSelectedMachineForAnalysis?: (machineId: string) => void;
}

export default function Dashboard({ token, setActiveTab, setSelectedMachineForAnalysis }: DashboardProps) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dashboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error("Unable to fetch industrial telemetry metrics.");
      }
      const data = await res.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex-1 h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
        <p className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">
          Querying Telemetry State...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50">
        <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-100 rounded-xl p-6 text-center">
          <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-rose-800 font-sans mb-1">Telemetry Diagnostics Failed</h3>
          <p className="text-xs text-rose-600 font-sans mb-4">{error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Retry Diagnostics Loop
          </button>
        </div>
      </div>
    );
  }

  const {
    totalMachines,
    healthyMachines,
    warningMachines,
    criticalMachines,
    recentPredictions,
    failureTypesCount,
    monthlyReportCounts
  } = stats;

  return (
    <div className="flex-1 p-8 bg-slate-50/50 space-y-8 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Overview Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Machines */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 font-mono tracking-wider uppercase">
              TOTAL COMMISSIONED FLEET
            </span>
            <div className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
              {totalMachines}
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Connected factory devices
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Cpu className="w-5 h-5" />
          </div>
        </div>

        {/* Healthy Machines */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-emerald-600 font-mono tracking-wider uppercase">
              HEALTHY BENCHMARK
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 font-sans tracking-tight flex items-baseline gap-1.5">
              <span>{healthyMachines}</span>
              <span className="text-xs text-slate-400 font-normal">({totalMachines > 0 ? Math.round((healthyMachines/totalMachines)*100) : 0}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Operational stability
            </p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Warning Machines */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-amber-600 font-mono tracking-wider uppercase">
              ACTIVE STRESS WARNINGS
            </span>
            <div className="text-2xl font-extrabold text-amber-600 font-sans tracking-tight flex items-baseline gap-1.5">
              <span>{warningMachines}</span>
              <span className="text-xs text-slate-400 font-normal">({totalMachines > 0 ? Math.round((warningMachines/totalMachines)*100) : 0}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Anomalies detected in operation
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Machines */}
        <div className="bg-white p-5 rounded-xl border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-rose-600 font-mono tracking-wider uppercase">
              CRITICAL UNPLANNED ALARMS
            </span>
            <div className="text-2xl font-extrabold text-rose-600 font-sans tracking-tight flex items-baseline gap-1.5">
              <span>{criticalMachines}</span>
              <span className="text-xs text-slate-400 font-normal">({totalMachines > 0 ? Math.round((criticalMachines/totalMachines)*100) : 0}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans">
              Shutoff recommended immediately
            </p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle className="w-5 h-5 animate-bounce" />
          </div>
        </div>

      </section>

      {/* Analytics Charts Row */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HealthDistributionChart healthy={healthyMachines} warning={warningMachines} critical={criticalMachines} />
        <FailureTypesChart data={failureTypesCount} />
        <MonthlyTrendChart data={monthlyReportCounts} />
      </section>

      {/* Bottom Grid: Recent Predictions and Shortcuts */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Recent Diagnostics Table */}
        <div className="bg-white p-6 rounded-xl border border-slate-150 shadow-sm xl:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-0.5">
                RECENT PREDICTIVE ASSESSMENTS
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Latest evaluations parsed through Gemini AI and local ChromaDB manual RAG
              </p>
            </div>
            <button 
              onClick={() => setActiveTab("reports")}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View History Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-mono uppercase text-[9px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Equipment</th>
                  <th className="py-2.5 px-3">AI Failure Prediction</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3 text-center">Urgency</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPredictions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400 font-sans">
                      No predictive evaluations recorded yet. Run a Health Analysis.
                    </td>
                  </tr>
                ) : (
                  recentPredictions.map((p: Prediction) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-3 font-semibold text-slate-700 font-sans">
                        {p.machineName}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-slate-600 font-medium font-sans">
                          {p.predictedFailure === "None" ? "No Failure Predicted" : p.predictedFailure}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">
                        {p.confidenceScore}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 text-[9px] font-mono font-semibold rounded ${
                          p.healthStatus === "critical" 
                            ? "bg-rose-50 text-rose-600 border border-rose-100" 
                            : p.healthStatus === "warning" 
                              ? "bg-amber-50 text-amber-600 border border-amber-100" 
                              : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        }`}>
                          {p.healthStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                        {new Date(p.analyzedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Maintenance Workspace Shortcuts */}
        <div className="bg-white p-6 rounded-xl border border-slate-150 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-0.5">
                QUICK WORKSPACE LINKS
              </h3>
              <p className="text-[10px] text-slate-400 font-sans">
                Core actions for preventive smart factory maintenance
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                id="btn-shortcut-analysis"
                onClick={() => setActiveTab("analysis")}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 font-sans">Analyze Equipment</h4>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">Enter live sensors and run Gemini diagnostics</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="btn-shortcut-fleet"
                onClick={() => setActiveTab("machines")}
                className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 font-sans">Fleet Inventory</h4>
                    <p className="text-[10px] text-slate-400 font-sans mt-0.5">View and update active industrial equipment</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 items-center mt-4">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <FileCheck2 className="w-4 h-4 shrink-0" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-600 font-mono tracking-wider uppercase">COMPLIANCE METRIC</p>
              <p className="text-[10px] text-slate-500 font-sans mt-0.5 leading-snug">Continuous monitoring fully complies with ISO-13374 diagnostics standards.</p>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
