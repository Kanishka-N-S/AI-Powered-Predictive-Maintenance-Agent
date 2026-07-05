import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Machines from "./pages/Machines";
import Analysis from "./pages/Analysis";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("smartmaint_token"));
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);

  const [loadingSession, setLoadingSession] = useState(true);

  // Auto session verification on boot
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoadingSession(false);
        return;
      }

      try {
        // Simple profile fetch to check JWT authenticity
        const res = await fetch("/api/dashboard", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error("Expired session token");
        }
        
        // Deconstruct cached user
        const cachedUser = localStorage.getItem("smartmaint_user");
        if (cachedUser) {
          setUser(JSON.parse(cachedUser));
        }
      } catch (err) {
        // Clear stale session
        localStorage.removeItem("smartmaint_token");
        localStorage.removeItem("smartmaint_user");
        setToken(null);
        setUser(null);
      } finally {
        setLoadingSession(false);
      }
    };

    verifySession();
  }, [token]);

  const handleLoginSuccess = (loggedInUser: any, jwtToken: string) => {
    localStorage.setItem("smartmaint_token", jwtToken);
    localStorage.setItem("smartmaint_user", JSON.stringify(loggedInUser));
    setToken(jwtToken);
    setUser(loggedInUser);
    setActiveTab("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("smartmaint_token");
    localStorage.removeItem("smartmaint_user");
    setToken(null);
    setUser(null);
    setActiveTab("dashboard");
  };

  const handleGlobalSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Simple intelligence: route user to specific tab depending on search terms
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("manual") || lowerQuery.includes("guide") || lowerQuery.includes("sc-") || lowerQuery.includes("mor") || lowerQuery.includes("doc-")) {
      setActiveTab("profile");
    } else if (lowerQuery.includes("report") || lowerQuery.includes("predict") || lowerQuery.includes("diagnost")) {
      setActiveTab("reports");
    } else if (lowerQuery.includes("analyze") || lowerQuery.includes("temp") || lowerQuery.includes("press") || lowerQuery.includes("leak")) {
      setActiveTab("analysis");
    } else {
      setActiveTab("machines");
    }
  };

  const selectMachineForAnalysis = (machineId: string) => {
    setSelectedMachineId(machineId);
  };

  const clearSelectedMachineId = () => {
    setSelectedMachineId(null);
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="p-3 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-500/20 mb-3 animate-pulse">
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-xs font-mono font-bold text-slate-400 tracking-wider uppercase">
          COMMISSIONING SECURITY HANDSHAKE...
        </p>
      </div>
    );
  }

  // Not Authenticated
  if (!token || !user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Authenticated Dashboard Shell Layout
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Permanent Fixed Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
        onLogout={handleLogout} 
      />

      {/* Main Viewport Content Block */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <Header 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          onSearchQuery={handleGlobalSearch}
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {activeTab === "dashboard" && (
            <Dashboard 
              token={token} 
              setActiveTab={setActiveTab} 
              setSelectedMachineForAnalysis={selectMachineForAnalysis}
            />
          )}
          {activeTab === "machines" && (
            <Machines 
              token={token} 
              userRole={user.role} 
              setActiveTab={setActiveTab} 
              setSelectedMachineForAnalysis={selectMachineForAnalysis}
            />
          )}
          {activeTab === "analysis" && (
            <Analysis 
              token={token} 
              selectedMachineId={selectedMachineId} 
              clearSelectedMachineId={clearSelectedMachineId} 
            />
          )}
          {activeTab === "reports" && (
            <Reports 
              token={token} 
              userRole={user.role} 
            />
          )}
          {activeTab === "profile" && (
            <Profile 
              token={token} 
              currentUser={user} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
