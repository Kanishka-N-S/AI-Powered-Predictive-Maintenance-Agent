import React from "react";

interface HealthDistributionProps {
  healthy: number;
  warning: number;
  critical: number;
}

// Chart 1: Machine Health Distribution Donut
export function HealthDistributionChart({ healthy, warning, critical }: HealthDistributionProps) {
  const total = healthy + warning + critical || 1;
  const healthyPct = Math.round((healthy / total) * 100);
  const warningPct = Math.round((warning / total) * 100);
  const criticalPct = Math.round((critical / total) * 100);

  // Donut SVG calculations
  const r = 50;
  const circ = 2 * Math.PI * r;
  
  const healthyOffset = circ - (healthy / total) * circ;
  const warningOffset = circ - (warning / total) * circ;
  const criticalOffset = circ - (critical / total) * circ;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-150 flex flex-col justify-between h-80">
      <div>
        <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-1">
          FLEET HEALTH SENSORS
        </h3>
        <p className="text-[10px] text-slate-400 font-sans">
          Real-time proportion of active equipment health states
        </p>
      </div>

      <div className="flex items-center justify-around my-4">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Circle */}
            <circle
              cx="60"
              cy="60"
              r={r}
              className="stroke-slate-100 fill-none"
              strokeWidth="12"
            />
            {/* Healthy Segment */}
            <circle
              cx="60"
              cy="60"
              r={r}
              className="stroke-emerald-500 fill-none transition-all duration-1000"
              strokeWidth="12"
              strokeDasharray={circ}
              strokeDashoffset={healthyOffset}
              strokeLinecap="round"
            />
            {/* Warning Segment (dashed overlay simulation) */}
            <circle
              cx="60"
              cy="60"
              r={r}
              className="stroke-amber-500 fill-none transition-all duration-1000"
              strokeWidth="12"
              strokeDasharray={circ}
              strokeDashoffset={circ - (warning / total) * circ + (healthy / total) * circ} // shift segment
              style={{ transform: `rotate(${(healthy / total) * 360}deg)`, transformOrigin: "60px 60px" }}
              strokeLinecap="round"
            />
            {/* Critical Segment */}
            <circle
              cx="60"
              cy="60"
              r={r}
              className="stroke-rose-500 fill-none transition-all duration-1000"
              strokeWidth="12"
              strokeDasharray={circ}
              strokeDashoffset={circ - (critical / total) * circ + ((healthy + warning) / total) * circ}
              style={{ transform: `rotate(${((healthy + warning) / total) * 360}deg)`, transformOrigin: "60px 60px" }}
              strokeLinecap="round"
            />
          </svg>
          {/* Inner Content */}
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-extrabold text-slate-800 font-sans tracking-tight">
              {total}
            </span>
            <span className="text-[9px] font-mono tracking-wider text-slate-400 uppercase">
              Machines
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full"></span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-slate-800 font-sans">{healthy}</span>
                <span className="text-[10px] text-slate-500">Healthy</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{healthyPct}% of fleet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-amber-500 rounded-full"></span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-slate-800 font-sans">{warning}</span>
                <span className="text-[10px] text-slate-500">Warning</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{warningPct}% of fleet</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 bg-rose-500 rounded-full"></span>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-slate-800 font-sans">{critical}</span>
                <span className="text-[10px] text-slate-500">Critical</span>
              </div>
              <span className="text-[9px] text-slate-400 font-mono">{criticalPct}% of fleet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FailureTypesProps {
  data: { type: string; count: number }[];
}

// Chart 2: Failure Types Horizontal Histogram
export function FailureTypesChart({ data }: FailureTypesProps) {
  const maxVal = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-150 flex flex-col justify-between h-80">
      <div>
        <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-1">
          DIAGNOSED FAILURE ANOMALIES
        </h3>
        <p className="text-[10px] text-slate-400 font-sans">
          Most recurrent failure classes flagged by predictive agent
        </p>
      </div>

      <div className="space-y-4 my-2 overflow-y-auto max-h-52 pr-1">
        {data.length === 0 ? (
          <div className="h-32 flex flex-col items-center justify-center text-center">
            <p className="text-xs font-medium text-slate-400">No predictions recorded yet</p>
          </div>
        ) : (
          data.map((item, idx) => {
            const widthPct = Math.round((item.count / maxVal) * 100);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-sans">
                  <span className="text-slate-600 font-semibold truncate max-w-[220px]">{item.type}</span>
                  <span className="text-slate-400 font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                    {item.count} Cases
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

interface MonthlyTrendProps {
  data: { month: string; healthy: number; warning: number; critical: number }[];
}

// Chart 3: Monthly Trend Segmented Area Chart
export function MonthlyTrendChart({ data }: MonthlyTrendProps) {
  // Simple custom SVG bar chart to represent monthly trend
  const maxTotal = Math.max(...data.map(d => d.healthy + d.warning + d.critical), 4);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-150 flex flex-col justify-between h-80">
      <div>
        <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase mb-1">
          HISTORICAL REPORT VOLUME
        </h3>
        <p className="text-[10px] text-slate-400 font-sans">
          Historical breakdown of predictive diagnostics run monthly
        </p>
      </div>

      {/* SVG Chart */}
      <div className="relative h-44 flex items-end gap-5 px-4 pt-4 border-b border-slate-100">
        {data.map((m, idx) => {
          const total = m.healthy + m.warning + m.critical;
          const healthyHeight = total > 0 ? (m.healthy / maxTotal) * 100 : 0;
          const warningHeight = total > 0 ? (m.warning / maxTotal) * 100 : 0;
          const criticalHeight = total > 0 ? (m.critical / maxTotal) * 100 : 0;

          return (
            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer">
              {/* Stacked Bar */}
              <div className="w-full rounded-t-sm overflow-hidden flex flex-col justify-end h-full">
                {/* Critical section */}
                <div
                  className="bg-rose-500 w-full transition-all duration-500 hover:brightness-105"
                  style={{ height: `${criticalHeight}%` }}
                  title={`Critical: ${m.critical}`}
                />
                {/* Warning section */}
                <div
                  className="bg-amber-400 w-full transition-all duration-500 hover:brightness-105"
                  style={{ height: `${warningHeight}%` }}
                  title={`Warning: ${m.warning}`}
                />
                {/* Healthy section */}
                <div
                  className="bg-emerald-500 w-full transition-all duration-500 hover:brightness-105"
                  style={{ height: `${healthyHeight}%` }}
                  title={`Healthy: ${m.healthy}`}
                />
              </div>

              {/* Month Label */}
              <span className="text-[10px] font-mono text-slate-400 mt-2 block">
                {m.month}
              </span>

              {/* Hover Tooltip */}
              <div className="absolute bottom-16 bg-slate-900 text-white rounded p-2 text-[9px] font-mono leading-tight shadow-xl border border-slate-800 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-20 w-28">
                <p className="font-bold border-b border-slate-800 pb-1 mb-1">{m.month} Diagnostics</p>
                <p className="text-emerald-400">● Healthy: {m.healthy}</p>
                <p className="text-amber-400">● Warning: {m.warning}</p>
                <p className="text-rose-400">● Critical: {m.critical}</p>
                <p className="text-slate-300 font-bold border-t border-slate-800 pt-1 mt-1">Total: {total}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Legend */}
      <div className="flex justify-center gap-6 mt-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
          <span className="text-[10px] font-medium text-slate-500 font-sans">Healthy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-amber-400 rounded-full"></span>
          <span className="text-[10px] font-medium text-slate-500 font-sans">Warning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 bg-rose-500 rounded-full"></span>
          <span className="text-[10px] font-medium text-slate-500 font-sans">Critical</span>
        </div>
      </div>
    </div>
  );
}
