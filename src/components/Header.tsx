import React, { useState } from "react";
import { Search, Bell, Shield, ShieldAlert, Cpu, FileText, BookOpen, AlertCircle, Sparkles } from "lucide-react";

interface HeaderProps {
  user: { username: string; email: string; role: string; name: string } | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSearchQuery?: (query: string) => void;
}

export default function Header({ user, activeTab, setActiveTab, onSearchQuery }: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    {
      id: 1,
      type: "critical",
      text: "Screw Compressor-404 requires immediate filter kit replacement.",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "warning",
      text: "Hydraulic Press-202 pressure levels dropped to 125 Bar.",
      time: "1 day ago",
    },
    {
      id: 3,
      type: "healthy",
      text: "DMG MORI Spindle calibration diagnostic completed successfully.",
      time: "2 days ago",
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchQuery) {
      onSearchQuery(searchVal);
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case "dashboard":
        return "Smart Factory Dashboard";
      case "machines":
        return "Machine Fleet Inventory";
      case "analysis":
        return "Predictive Maintenance Analyzer";
      case "reports":
        return "Maintenance Records & Reports";
      case "profile":
        return "User Profile & Knowledge Base";
      default:
        return "AI-Powered Maintenance Agent";
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-150 px-8 flex items-center justify-between">
      {/* Page Title & Breadcrumb */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
            Factory Floor A
          </span>
          <span className="text-slate-300 text-[10px] font-mono">/</span>
          <span className="text-[10px] font-mono tracking-wider text-blue-500 uppercase font-semibold">
            {activeTab}
          </span>
        </div>
        <h2 className="text-base font-bold font-sans text-slate-900 leading-tight">
          {getPageTitle()}
        </h2>
      </div>

      {/* Global Search & System Status Controls */}
      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-64 md:w-80">
          <input
            id="input-global-search"
            type="text"
            placeholder="Search machines, reports, manuals..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white text-slate-700 placeholder-slate-400 transition-all duration-150"
          />
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
        </form>

        {/* AI-RAG Indicators */}
        <div className="hidden lg:flex items-center gap-2 border-l border-slate-100 pl-6 pr-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-mono font-medium text-slate-500">
            RAG Knowledge Sync Active
          </span>
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="btn-notifications-toggle"
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Maintenance Alarms</span>
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-rose-100 text-rose-600 rounded">
                  2 Pending
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3.5 hover:bg-slate-50 transition-colors flex gap-2.5">
                    <div className="mt-0.5">
                      {n.type === "critical" ? (
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                      ) : n.type === "warning" ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <Cpu className="w-4 h-4 text-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                        {n.text}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">
                        {n.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
