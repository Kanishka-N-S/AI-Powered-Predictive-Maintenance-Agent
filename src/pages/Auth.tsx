import React, { useState } from "react";
import { Cpu, ShieldCheck, Mail, Lock, User, Key, KeyRound, AlertCircle } from "lucide-react";

interface AuthProps {
  onLoginSuccess: (user: any, token: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("engineer"); // engineer or admin

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin 
      ? { email, password } 
      : { username, email, password, name, role };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed. Please verify credentials.");
      }

      // Success
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || "Connection error. Factory backend offline.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDemoAccount = (roleType: "admin" | "engineer") => {
    if (roleType === "admin") {
      setEmail("admin@factory.com");
      setPassword("admin123");
    } else {
      setEmail("engineer@factory.com");
      setPassword("engineer123");
    }
    setIsLogin(true);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      {/* Abstract Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/60 via-slate-950 to-slate-950 z-0"></div>
      
      {/* Decorative Matrix Grid */}
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-600 rounded-xl text-white shadow-xl shadow-blue-500/25">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
        </div>
        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight font-sans">
          Smart Factory Maintenance Control
        </h2>
        <p className="mt-2 text-center text-xs font-mono text-slate-400 tracking-wide uppercase">
          AI-Powered Predictive Maintenance Agent
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 relative">
        <div className="bg-slate-900/90 py-8 px-6 shadow-2xl rounded-2xl border border-slate-800/80 backdrop-blur-md sm:px-10">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-800 pb-4 mb-6">
            <button
              id="btn-tab-login"
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 text-center pb-2 text-xs font-bold font-mono uppercase tracking-wider transition-all duration-150 ${
                isLogin ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Access Portal
            </button>
            <button
              id="btn-tab-register"
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 text-center pb-2 text-xs font-bold font-mono uppercase tracking-wider transition-all duration-150 ${
                !isLogin ? "text-blue-500 border-b-2 border-blue-500" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              Commission Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 flex gap-2 items-center text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="font-sans font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="reg-name" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <input
                      id="reg-name"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
                    />
                    <User className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-username" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    System Username
                  </label>
                  <div className="relative">
                    <input
                      id="reg-username"
                      type="text"
                      required
                      placeholder="e.g. engineer_john"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
                    />
                    <Key className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-600" />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-role" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Assigned Factory Role
                  </label>
                  <select
                    id="reg-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-300 transition-all"
                  >
                    <option value="engineer">Senior Maintenance Engineer</option>
                    <option value="admin">System Administrator (Root Admin)</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="reg-email" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                Corporate Email Address
              </label>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="e.g. engineer@factory.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
                />
                <Mail className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                System Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-slate-600 transition-all"
                />
                <Lock className="absolute left-3 top-3 w-3.5 h-3.5 text-slate-600" />
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-auth-submit"
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer font-sans"
              >
                {loading ? "Decrypting Protocols..." : isLogin ? "Decrypt Security Token" : "Generate Account Token"}
              </button>
            </div>
          </form>

          {/* Quick-Access Demo Credentials for assessment */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-[9px] font-mono text-center text-slate-500 uppercase tracking-widest mb-3">
              DEMO ACCESS KEYS (ONE-CLICK BYPASS)
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="btn-demo-engineer"
                type="button"
                onClick={() => handleSetDemoAccount("engineer")}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-[10px] font-mono text-slate-300 rounded border border-slate-800/80 cursor-pointer"
              >
                <KeyRound className="w-3 h-3 text-emerald-500" />
                <span>Engineer Access</span>
              </button>
              <button
                id="btn-demo-admin"
                type="button"
                onClick={() => handleSetDemoAccount("admin")}
                className="flex items-center justify-center gap-1.5 py-1.5 px-2 bg-slate-950 hover:bg-slate-800 text-[10px] font-mono text-slate-300 rounded border border-slate-800/80 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-rose-500" />
                <span>Admin Access</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
