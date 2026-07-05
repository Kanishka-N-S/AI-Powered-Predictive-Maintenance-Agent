import React from "react";
import { 
  LayoutDashboard, 
  Cpu, 
  Activity, 
  FileText, 
  User, 
  LogOut, 
  Settings, 
  ShieldAlert 
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: { username: string; email: string; role: string; name: string } | null;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", name: "Executive Dashboard", icon: LayoutDashboard },
    { id: "machines", name: "Machine Fleet", icon: Cpu },
    { id: "analysis", name: "Health Analyzer", icon: Activity },
    { id: "reports", name: "Predictive Reports", icon: FileText },
    { id: "profile", name: "Engineer Profile", icon: User },
  ];

  return (
    <aside id="sidebar-container" className="fixed top-0 left-0 z-40 w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg shadow-blue-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-semibold tracking-wide text-white font-sans">
                SMARTMAINT
              </h1>
              <p className="text-[10px] font-mono tracking-wider text-slate-400">
                AI PREDICTIVE AGENT
              </p>
            </div>
          </div>
        </div>

        {/* User Info Capsule */}
        {user && (
          <div className="px-4 py-4 border-b border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 font-bold font-sans">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-100 truncate">{user.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`px-1.5 py-0.5 text-[8px] font-mono rounded tracking-wider ${
                    user.role === 'admin' 
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {user.role.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate">
                    {user.username}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`btn-nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-md shadow-blue-600/10"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer / Action */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <button
          id="btn-logout"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Exit System</span>
        </button>
      </div>
    </aside>
  );
}
