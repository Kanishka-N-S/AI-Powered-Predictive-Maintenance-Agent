import React, { useState, useEffect } from "react";
import { 
  Activity, 
  Cpu, 
  ChevronRight, 
  FileText, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Calendar,
  Sparkles,
  BookOpen,
  Bookmark,
  Printer,
  XCircle,
  TrendingUp,
  Sliders,
  CheckCircle2,
  FileCheck2,
  Loader2
} from "lucide-react";

interface Machine {
  id: string;
  machineId: string;
  name: string;
  type: string;
  manufacturer: string;
  department: string;
  status: string;
}

interface AnalysisProps {
  token: string;
  selectedMachineId: string | null;
  clearSelectedMachineId: () => void;
}

export default function Analysis({ token, selectedMachineId, clearSelectedMachineId }: AnalysisProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [targetMachineId, setTargetMachineId] = useState("");
  const [loadingMachines, setLoadingMachines] = useState(true);

  // Form Parameters
  const [temperature, setTemperature] = useState<number>(45);
  const [pressure, setPressure] = useState<number>(145);
  const [vibrationLevel, setVibrationLevel] = useState<number>(1.8);
  const [noiseLevel, setNoiseLevel] = useState<number>(75);
  const [operatingHours, setOperatingHours] = useState<number>(1200);
  const [humidity, setHumidity] = useState<number>(45);
  const [oilLeakage, setOilLeakage] = useState<boolean>(false);
  const [powerConsumption, setPowerConsumption] = useState<number>(30);
  const [loadPercentage, setLoadPercentage] = useState<number>(65);
  const [motorSpeed, setMotorSpeed] = useState<number>(1500);
  const [engineerNotes, setEngineerNotes] = useState<string>("");

  // Analyzer Diagnostics States
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeStep, setAnalyzeStep] = useState(0);
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Machines List
  useEffect(() => {
    const fetchMachinesList = async () => {
      try {
        setLoadingMachines(true);
        const res = await fetch("/api/machines", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMachines(data);
          
          // Pre-select if directed from machine fleet list
          if (selectedMachineId) {
            setTargetMachineId(selectedMachineId);
          } else if (data.length > 0) {
            setTargetMachineId(data[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to load machines ledger.", e);
      } finally {
        setLoadingMachines(false);
      }
    };
    fetchMachinesList();
  }, [token, selectedMachineId]);

  // Handle preset templates for rapid testing of different equipment anomalies
  const handleApplyPreset = (type: "normal" | "cnc_fail" | "hydraulic_fail" | "compressor_fail") => {
    setError(null);
    setPredictionResult(null);
    switch (type) {
      case "normal":
        setTemperature(42);
        setPressure(148);
        setVibrationLevel(1.5);
        setNoiseLevel(72);
        setOperatingHours(1800);
        setHumidity(40);
        setOilLeakage(false);
        setPowerConsumption(28);
        setLoadPercentage(60);
        setMotorSpeed(1450);
        setEngineerNotes("Routine scheduled shift evaluation. Spindle running quietly.");
        break;
      case "cnc_fail":
        setTemperature(82);
        setPressure(145);
        setVibrationLevel(7.2);
        setNoiseLevel(84);
        setOperatingHours(7200);
        setHumidity(45);
        setOilLeakage(false);
        setPowerConsumption(45);
        setLoadPercentage(92);
        setMotorSpeed(4800);
        setEngineerNotes("Spindle has high pitch grinding noise. Operators noted excessive chassis warmth.");
        break;
      case "hydraulic_fail":
        setTemperature(69);
        setPressure(118);
        setVibrationLevel(2.1);
        setNoiseLevel(76);
        setOperatingHours(5400);
        setHumidity(55);
        setOilLeakage(true);
        setPowerConsumption(38);
        setLoadPercentage(82);
        setMotorSpeed(1440);
        setEngineerNotes("Active dark fluid leakage pooled beneath main press flange. Hydraulic lines vibrating.");
        break;
      case "compressor_fail":
        setTemperature(88);
        setPressure(9.2);
        setVibrationLevel(3.8);
        setNoiseLevel(89);
        setOperatingHours(9500);
        setHumidity(62);
        setOilLeakage(false);
        setPowerConsumption(85);
        setLoadPercentage(95);
        setMotorSpeed(2950);
        setEngineerNotes("Accumulated supply lines dropping air pressure. Air compressor running extremely loud, belt squealing.");
        break;
    }
  };

  const handleRunPredictiveAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetMachineId) {
      setError("Please select a target equipment asset to perform diagnostics.");
      return;
    }

    setAnalyzing(true);
    setAnalyzeStep(1); // Starting ChromaDB manual index
    setError(null);
    setPredictionResult(null);

    // Reassurance loader animation simulation
    const steps = [
      "Accessing local ChromaDB indexes...",
      "Querying and fetching historical maintenance cases...",
      "Integrating manuals and similar procedures into context...",
      "Encrypting payload and transmitting to Gemini 3.5-flash LLM...",
      "Inferring predictive model and resolving failure confidence score...",
      "Successfully finalized diagnostic certificate..."
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAnalyzeStep(i + 1);
    }

    const payload = {
      machineId: targetMachineId,
      parameters: {
        temperature,
        pressure,
        vibrationLevel,
        noiseLevel,
        operatingHours,
        humidity,
        oilLeakage,
        powerConsumption,
        loadPercentage,
        motorSpeed
      },
      engineerNotes
    };

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "A problem occurred generating predictive diagnostics.");
      }

      setPredictionResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
      setAnalyzeStep(0);
      clearSelectedMachineId();
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="flex-1 p-8 bg-slate-50/50 space-y-6 select-none overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Templates/Shortcuts bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-150 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[9px] font-bold text-blue-600 font-mono tracking-wider uppercase">SIMULATION PRESET DECK</span>
          <p className="text-[10px] text-slate-400 font-sans">Inject simulated sensor anomalies to evaluate prediction and RAG R-score.</p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full md:w-auto">
          <button
            id="btn-preset-normal"
            onClick={() => handleApplyPreset("normal")}
            className="flex-1 md:flex-initial text-center px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[10px] font-mono text-slate-600 rounded border border-slate-200 cursor-pointer transition-colors"
          >
            Normal State Preset
          </button>
          <button
            id="btn-preset-cnc"
            onClick={() => handleApplyPreset("cnc_fail")}
            className="flex-1 md:flex-initial text-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-[10px] font-mono text-rose-600 rounded border border-rose-200 cursor-pointer transition-colors"
          >
            CNC Grinding Spindle
          </button>
          <button
            id="btn-preset-hydraulic"
            onClick={() => handleApplyPreset("hydraulic_fail")}
            className="flex-1 md:flex-initial text-center px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[10px] font-mono text-amber-600 rounded border border-amber-200 cursor-pointer transition-colors"
          >
            Hydraulic Seal Leak
          </button>
          <button
            id="btn-preset-compressor"
            onClick={() => handleApplyPreset("compressor_fail")}
            className="flex-1 md:flex-initial text-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-[10px] font-mono text-red-600 rounded border border-red-200 cursor-pointer transition-colors"
          >
            Compressor Belt Slip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Form Container */}
        <div className="bg-white rounded-xl border border-slate-150 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-700 tracking-wider font-mono uppercase">
              Sensor Parameter Registry
            </h3>
          </div>

          {loadingMachines ? (
            <div className="h-44 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : (
            <form onSubmit={handleRunPredictiveAI} className="space-y-4">
              
              {/* Machine Selection Dropdown */}
              <div>
                <label htmlFor="select-machine-target" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                  Target Asset Under Review
                </label>
                <select
                  id="select-machine-target"
                  value={targetMachineId}
                  onChange={(e) => setTargetMachineId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700 font-sans"
                >
                  <option value="" disabled>-- Select Connected Asset --</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.machineId}) • {m.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grid 2x2 for parameters */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Temperature */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="param-temp" className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      Temperature (°C)
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{temperature}°C</span>
                  </div>
                  <input
                    id="param-temp"
                    type="range"
                    min="10"
                    max="120"
                    step="1"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Threshold: Warning &gt;65°C | Critical &gt;80°C</span>
                </div>

                {/* Pressure */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="param-pressure" className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      Pressure (Bar)
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{pressure} Bar</span>
                  </div>
                  <input
                    id="param-pressure"
                    type="range"
                    min="0"
                    max="250"
                    step="1"
                    value={pressure}
                    onChange={(e) => setPressure(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Hydraulic standard: 130 - 165 Bar</span>
                </div>

                {/* Vibration */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="param-vib" className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      Vibration Level (mm/s)
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{vibrationLevel} mm/s</span>
                  </div>
                  <input
                    id="param-vib"
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={vibrationLevel}
                    onChange={(e) => setVibrationLevel(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Spindle benchmark: &gt;4.5 Warning | &gt;6.5 Critical</span>
                </div>

                {/* Noise */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="param-noise" className="text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
                      Noise Level (dB)
                    </label>
                    <span className="text-[10px] font-mono font-bold text-slate-600">{noiseLevel} dB</span>
                  </div>
                  <input
                    id="param-noise"
                    type="range"
                    min="40"
                    max="110"
                    step="1"
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Standard floor safety threshold: 85 dB</span>
                </div>

                {/* Operating Hours */}
                <div>
                  <label htmlFor="param-hours" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Operating Hours (hrs)
                  </label>
                  <input
                    id="param-hours"
                    type="number"
                    min="0"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>

                {/* Humidity */}
                <div>
                  <label htmlFor="param-humidity" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Ambient Humidity (%)
                  </label>
                  <input
                    id="param-humidity"
                    type="number"
                    min="0"
                    max="100"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>

                {/* Power Consumption */}
                <div>
                  <label htmlFor="param-power" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Power Consumption (kW)
                  </label>
                  <input
                    id="param-power"
                    type="number"
                    min="0"
                    value={powerConsumption}
                    onChange={(e) => setPowerConsumption(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>

                {/* Load Percentage */}
                <div>
                  <label htmlFor="param-load" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Operating Load (%)
                  </label>
                  <input
                    id="param-load"
                    type="number"
                    min="0"
                    max="100"
                    value={loadPercentage}
                    onChange={(e) => setLoadPercentage(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>

                {/* Motor Speed */}
                <div>
                  <label htmlFor="param-speed" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                    Motor Speed (RPM)
                  </label>
                  <input
                    id="param-speed"
                    type="number"
                    min="0"
                    value={motorSpeed}
                    onChange={(e) => setMotorSpeed(Number(e.target.value))}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                  />
                </div>

                {/* Oil Leakage Active checkbox toggle */}
                <div className="flex flex-col justify-end pb-1.5">
                  <div className="flex items-center gap-2 h-9 pl-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <input
                      id="param-leak"
                      type="checkbox"
                      checked={oilLeakage}
                      onChange={(e) => setOilLeakage(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                    />
                    <label htmlFor="param-leak" className="text-xs text-slate-600 font-sans font-semibold select-none cursor-pointer">
                      Oil Leakage Detected
                    </label>
                  </div>
                </div>

              </div>

              {/* Engineer Observation notes */}
              <div>
                <label htmlFor="param-notes" className="block text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">
                  Manual Inspection Notes
                </label>
                <textarea
                  id="param-notes"
                  rows={2}
                  placeholder="Record structural details, noises, fluid colors, ambient smells..."
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-700"
                ></textarea>
              </div>

              <button
                id="btn-run-analyzer"
                type="submit"
                disabled={analyzing}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg shadow-blue-500/15 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer font-sans"
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>Run Predictive AI Diagnostics</span>
              </button>
            </form>
          )}
        </div>

        {/* Prediction Results / Reassurance screen */}
        <div className="space-y-4">
          
          {/* Reassurance Loader screen while analyzing */}
          {analyzing && (
            <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-8 shadow-2xl h-[480px] flex flex-col justify-between overflow-hidden relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Cpu className="w-64 h-64 text-blue-500 animate-spin-slow" style={{ animationDuration: "25s" }} />
              </div>

              <div>
                <span className="text-[9px] font-mono tracking-wider text-blue-400 uppercase font-bold">
                  ACTIVE PIPELINE DIAGNOSTIC PROCESS
                </span>
                <h3 className="text-base font-bold font-sans mt-1">Smart Engine Active</h3>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 my-6 relative z-10">
                {[
                  "Acquiring ChromaDB vectors...",
                  "Extracting manuals and history reports...",
                  "Establishing similar case reference context...",
                  "Injecting context to Gemini LLM prompt...",
                  "Evaluating anomaly matrices...",
                  "Finalizing maintenance certificate..."
                ].map((step, idx) => {
                  const stepNumber = idx + 1;
                  const isDone = analyzeStep > stepNumber;
                  const isCurrent = analyzeStep === stepNumber;
                  const isFuture = analyzeStep < stepNumber;

                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 transition-opacity duration-300 ${
                        isFuture ? "opacity-30" : "opacity-100"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isDone 
                          ? "bg-blue-500 text-white" 
                          : isCurrent 
                            ? "bg-slate-700 text-blue-400 border border-blue-500/50 animate-pulse" 
                            : "bg-slate-800 text-slate-500"
                      }`}>
                        {isDone ? "✓" : stepNumber}
                      </div>
                      <span className={`text-[11px] font-mono ${isCurrent ? "text-blue-400 font-bold" : "text-slate-300"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 border-t border-slate-800 pt-4">
                <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />
                <span className="text-[10px] font-mono text-slate-500">Executing full-stack RAG prompt assembly...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 text-center shadow-sm">
              <XCircle className="w-12 h-12 text-rose-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-rose-800 font-sans">Prediction Engine Error</h3>
              <p className="text-xs text-rose-600 font-sans mt-1">{error}</p>
            </div>
          )}

          {/* Idle screen state */}
          {!analyzing && !predictionResult && !error && (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center h-[480px] flex flex-col justify-center items-center">
              <Activity className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-xs font-bold text-slate-700 font-mono tracking-wider uppercase">Prediction Output Ready</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-sm font-sans leading-relaxed">Select your target machinery asset, adjust the telemetry sensors to trigger alerts, and run the diagnostics process.</p>
            </div>
          )}

          {/* Printable Report Display when analysis resolves successfully! */}
          {predictionResult && (
            <div 
              id="printable-report"
              className="bg-white rounded-xl border border-slate-150 shadow-lg p-6 space-y-6 h-[480px] overflow-y-auto print:shadow-none print:border-none relative"
            >
              {/* Brand Header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-150">
                <div>
                  <span className="text-[9px] font-bold text-blue-600 font-mono tracking-wider uppercase block">
                    SMARTMAINT DIAGNOSTIC REPORT
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 font-sans tracking-tight mt-0.5">
                    {predictionResult.machineName}
                  </h4>
                  <span className="text-[9px] font-mono text-slate-400">
                    ID Ref: {predictionResult.machineId} • Analyzed: {new Date(predictionResult.analyzedAt).toLocaleString()}
                  </span>
                </div>

                <button
                  id="btn-print-report"
                  onClick={handlePrintCertificate}
                  className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 border border-slate-100 cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>

              {/* Status Pills */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">HEALTH STATE</span>
                  <span className={`inline-block text-[10px] font-bold font-mono uppercase mt-0.5 ${
                    predictionResult.healthStatus === "critical" 
                      ? "text-rose-500" 
                      : predictionResult.healthStatus === "warning" 
                        ? "text-amber-500" 
                        : "text-emerald-500"
                  }`}>
                    {predictionResult.healthStatus}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">RISK INDEX</span>
                  <span className="text-[10px] font-bold text-slate-800 font-sans mt-0.5 block">
                    {predictionResult.riskLevel}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">CONFIDENCE</span>
                  <span className="text-[10px] font-bold text-blue-600 font-mono mt-0.5 block">
                    {predictionResult.confidenceScore}%
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center">
                  <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider block">URGENCY PRIORITY</span>
                  <span className={`inline-block text-[10px] font-bold font-mono uppercase mt-0.5 ${
                    predictionResult.priority === "Immediate" 
                      ? "text-rose-600" 
                      : predictionResult.priority === "High" 
                        ? "text-amber-600" 
                        : "text-slate-600"
                  }`}>
                    {predictionResult.priority}
                  </span>
                </div>
              </div>

              {/* Anomaly section */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">DIAGNOSED FAILURE ANOMALY</span>
                <p className="text-xs font-bold text-slate-800 font-sans bg-slate-50 border border-slate-150 rounded px-3 py-2 flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${predictionResult.healthStatus === 'healthy' ? 'text-emerald-500' : 'text-rose-500 animate-bounce'}`} />
                  <span>{predictionResult.predictedFailure === "None" ? "No Imminent Fault Predicted" : predictionResult.predictedFailure}</span>
                </p>
              </div>

              {/* Explanation */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">TECHNICAL AUDIT REASONING</span>
                <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 font-normal">
                  {predictionResult.technicalExplanation}
                </p>
              </div>

              {/* Recommendations */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ACTIONABLE CREW DIRECTIVES</span>
                <div className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50/50 p-3.5 rounded-lg border border-slate-100 whitespace-pre-line font-medium">
                  {predictionResult.maintenanceRecommendation}
                </div>
              </div>

              {/* RAG metadata similar cases */}
              {predictionResult.retrievedSimilarCases && predictionResult.retrievedSimilarCases.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    CHROMADB RAG: REFERENCE DOCUMENTS INSTANTIATED
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {predictionResult.retrievedSimilarCases.map((docTitle: string, index: number) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50/60 border border-blue-100 rounded text-[10px] font-sans font-semibold text-blue-700"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>{docTitle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Maintenance parameters footer */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-[10px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Downtime Estimate: <strong className="text-slate-600 font-semibold">{predictionResult.estimatedDowntime}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Next inspection: <strong className="text-slate-600 font-semibold">{predictionResult.nextInspectionDate}</strong></span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
