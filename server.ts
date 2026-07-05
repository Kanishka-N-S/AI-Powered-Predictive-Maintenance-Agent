import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "predictive-maintenance-secret-key-129381";

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

const DB_FILE = path.join(DATA_DIR, "db.json");

// Define RAG manuals & cases (Enterprise Knowledge Base)
const RAG_DOCUMENTS = [
  {
    id: "doc-01",
    title: "CNC Spindle High Vibration Diagnostics Manual",
    type: "manual",
    tags: ["cnc", "spindle", "vibration", "bearing", "milling"],
    content: "Vibration thresholds for high-speed milling spindles ( DMG MORI series): Vibration exceeding 4.5 mm/s indicates early bearing misalignment. Levels exceeding 6.5 mm/s represent extreme hazard for spindle seizure. If temperature also exceeds 75°C, immediate spindle shutdown is mandatory. Corrective action: Lubricate spindle assembly, check dynamic alignment, and restrict load percentage to below 70%."
  },
  {
    id: "doc-02",
    title: "Hydraulic Press Seal and Pressure Safety Procedures",
    type: "procedure",
    tags: ["hydraulic", "press", "pressure", "leakage", "oil"],
    content: "Forming Hydraulic Presses (Schuler series) operate at a baseline of 150 Bar. A pressure drop below 130 Bar coupled with oil temperature above 65°C suggests fluid degradation or piston gasket fatigue. If oil leakage is active, pressure drop accelerates rapidly. Corrective action: Replace the outer flange gasket (Est. downtime: 4 hours) and perform a system oil purge. Do not operate below 110 Bar to prevent hydraulic lockup."
  },
  {
    id: "doc-03",
    title: "KUKA Robotics Axis Joint Overload Troubleshooting Guide",
    type: "manual",
    tags: ["robotic", "axis", "joint", "motor", "load", "overload"],
    content: "Robotic arm joint motors are rated for up to 80% continuous load. Joint torque exceeding 85% with high humidity (>60%) triggers current spikes. This degrades winding insulation and can cause motor burnout (downtime: 24 hours). Corrective action: Recalibrate axis joint encoders, reduce speed of motion paths by 15%, and adjust ambient dehumidifiers."
  },
  {
    id: "doc-04",
    title: "Rotary Screw Air Compressor Maintenance Standards",
    type: "manual",
    tags: ["compressor", "air", "noise", "operating hours", "filter"],
    content: "Industrial air compressors (Atlas Copco series) maintain noise levels below 80 dB. Noise exceeding 85 dB indicates intake filter blockage or drive belt slippage. Operating hours exceeding 6000 hours require intake valve kits, and operating hours exceeding 12000 hours require complete screw element replacement (Est. downtime: 8 hours)."
  },
  {
    id: "case-01",
    title: "DMG MORI Spindle Seizure Incident Report - March 2025",
    type: "case",
    tags: ["cnc", "spindle", "vibration", "seizure", "case-study"],
    content: "Incident: Spindle Seizure on Mill M-101. Symptom timeline: Vibration rose from 3.2 mm/s to 7.8 mm/s over 48 hours. Temperature peaked at 84°C under 90% load. The failure to shut down led to immediate spindle locking. Resolution: Full spindle bearing replacement. Total downtime: 16 hours. Preventative lesson: Implement automated shutoff when vibration exceeds 6.0 mm/s."
  },
  {
    id: "case-02",
    title: "Schuler Forming Press Gasket Blowout Case - Nov 2024",
    type: "case",
    tags: ["hydraulic", "press", "leakage", "gasket", "case-study"],
    content: "Incident: High-pressure oil line blowout on Press M-102. Symptom timeline: Pressure fluctuated between 110 Bar and 140 Bar. Small oil leaks were ignored. Eventually, the seal blew completely, spilling 40L of oil. Resolution: Main flange gasket replaced, hydraulic fluid refilled. Total downtime: 6 hours. Preventative lesson: Oil leakage must be resolved immediately if oil pressure drops below 130 Bar."
  },
  {
    id: "case-03",
    title: "Compressor Belt Slip and Noise Spike - Feb 2025",
    type: "case",
    tags: ["compressor", "noise", "belt", "case-study"],
    content: "Incident: System air supply drop in Section 4. Symptom timeline: Compressor noise level reached 88 dB, with high operating hours (9500 hrs). Vibration remained low but motor temperature spiked. Resolution: Tightened drive belt, replaced air inlet filter. Total downtime: 2 hours. Preventative lesson: Replaced drive belts proactively at 8000 hours."
  }
];

// Database structure
interface DB {
  users: any[];
  machines: any[];
  predictions: any[];
}

// Helpers to load and save DB
function readDB(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Failed to read database, resetting.", e);
  }
  
  // Default Seed Data
  const defaultDB: DB = {
    users: [
      {
        id: "usr-admin",
        username: "admin",
        email: "admin@factory.com",
        password: crypto.createHash("sha256").update("admin123").digest("hex"),
        role: "admin",
        name: "Enterprise Administrator"
      },
      {
        id: "usr-eng",
        username: "engineer",
        email: "engineer@factory.com",
        password: crypto.createHash("sha256").update("engineer123").digest("hex"),
        role: "engineer",
        name: "Senior Maintenance Engineer"
      }
    ],
    machines: [
      {
        id: "mach-1",
        machineId: "CNC-M-101",
        name: "CNC Spindle Mill-101",
        type: "CNC Milling Machine",
        manufacturer: "DMG MORI",
        department: "Machining Dept A",
        installationDate: "2023-04-12",
        status: "healthy"
      },
      {
        id: "mach-2",
        machineId: "HYD-P-202",
        name: "Heavy Hydraulic Press-202",
        type: "Hydraulic Press",
        manufacturer: "Schuler Group",
        department: "Forming Dept B",
        installationDate: "2022-08-20",
        status: "warning"
      },
      {
        id: "mach-3",
        machineId: "ROB-W-303",
        name: "6-Axis Welder-303",
        type: "6-Axis Robotic Arm",
        manufacturer: "KUKA Robotics",
        department: "Assembly Line 1",
        installationDate: "2024-01-15",
        status: "healthy"
      },
      {
        id: "mach-4",
        machineId: "COMP-U-404",
        name: "Screw Air Compressor-404",
        type: "Rotary Air Compressor",
        manufacturer: "Atlas Copco",
        department: "Utilities Yard",
        installationDate: "2021-11-05",
        status: "critical"
      }
    ],
    predictions: [
      {
        id: "pred-1",
        machineId: "HYD-P-202",
        machineName: "Heavy Hydraulic Press-202",
        healthStatus: "warning",
        predictedFailure: "Piston Seal Gasket Leakage",
        riskLevel: "Medium",
        confidenceScore: 88,
        technicalExplanation: "The operating pressure is fluctuating near 125 Bar (baseline 150 Bar), accompanied by minor oil leakage and hydraulic fluid temperature at 68°C. This perfectly mirrors Schuler Press maintenance protocol doc-02, which notes gasket seal wear at temperatures above 65°C and pressures below 130 Bar.",
        maintenanceRecommendation: "Schedule replacement of flange gasket seal. Inspect hydraulic line fittings and top up hydraulic fluid levels. Avoid running machine continuously at full load.",
        priority: "High",
        estimatedDowntime: "4 hours",
        nextInspectionDate: "2026-07-10",
        retrievedSimilarCases: ["Hydraulic Press Seal and Pressure Safety Procedures", "Schuler Forming Press Gasket Blowout Case - Nov 2024"],
        engineerNotes: "Added to warning list. Gasket replacement kit ordered from stock.",
        analyzedAt: "2026-07-02T14:30:00Z",
        parameters: {
          temperature: 68,
          pressure: 125,
          vibrationLevel: 1.8,
          noiseLevel: 72,
          operatingHours: 7240,
          humidity: 45,
          oilLeakage: true,
          powerConsumption: 42,
          loadPercentage: 80,
          motorSpeed: 1450
        }
      },
      {
        id: "pred-2",
        machineId: "COMP-U-404",
        machineName: "Screw Air Compressor-404",
        healthStatus: "critical",
        predictedFailure: "Drive Belt Slippage and Air Filter Clogging",
        riskLevel: "High",
        confidenceScore: 92,
        technicalExplanation: "Extreme noise level observed at 89 dB (exceeding safety limits of 80 dB), coupled with high compressor operating hours of 11,200 hours. This is highly aligned with standard compressor failure modes where belt slippage and dirty intake filters degrade efficiency and generate heavy decibel output.",
        maintenanceRecommendation: "1. Stop compressor immediately.\n2. Replace drive belt and intake air filter.\n3. Verify intake valve integrity since operating hours exceed 8000 hours.",
        priority: "Immediate",
        estimatedDowntime: "6 hours",
        nextInspectionDate: "2026-07-05",
        retrievedSimilarCases: ["Rotary Screw Air Compressor Maintenance Standards", "Compressor Belt Slip and Noise Spike - Feb 2025"],
        engineerNotes: "Compressor shut down. Urgent work order dispatched to maintenance team.",
        analyzedAt: "2026-07-03T09:15:00Z",
        parameters: {
          temperature: 82,
          pressure: 8.5,
          vibrationLevel: 3.2,
          noiseLevel: 89,
          operatingHours: 11200,
          humidity: 58,
          oilLeakage: false,
          powerConsumption: 75,
          loadPercentage: 90,
          motorSpeed: 2950
        }
      }
    ]
  };
  fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2), "utf-8");
  return defaultDB;
}

function writeDB(data: DB) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// Custom JWT sign/verify
function signToken(user: any): string {
  const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
  const header = { alg: "HS256", typ: "JWT" };
  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest("base64url");
  return `${base64Header}.${base64Payload}.${signature}`;
}

function verifyToken(token: string): any {
  try {
    const [base64Header, base64Payload, signature] = token.split(".");
    const expectedSig = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${base64Header}.${base64Payload}`)
      .digest("base64url");
    if (signature !== expectedSig) return null;
    return JSON.parse(Buffer.from(base64Payload, "base64url").toString("utf-8"));
  } catch (e) {
    return null;
  }
}

// Authentication Middleware
function authenticate(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Token missing." });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Access denied. Invalid or expired token." });
  }
  req.user = decoded;
  next();
}

// RAG Engine: Simple keyword matching and TF-IDF calculation
function retrieveRelatedDocs(machineType: string, params: any): any[] {
  const queryWords = `${machineType} ${params.oilLeakage ? "leakage oil" : ""} ${params.vibrationLevel > 4 ? "vibration bearing" : ""} ${params.noiseLevel > 80 ? "noise filter belt" : ""} ${params.pressure > 100 || params.pressure < 12 ? "pressure gasket" : ""}`.toLowerCase().split(/\s+/);
  
  const scoredDocs = RAG_DOCUMENTS.map((doc) => {
    let score = 0;
    const docText = `${doc.title} ${doc.content} ${doc.tags.join(" ")}`.toLowerCase();
    
    // Exact tag match boost
    doc.tags.forEach(tag => {
      if (machineType.toLowerCase().includes(tag) || queryWords.includes(tag)) {
        score += 15;
      }
    });

    // Term frequency overlap
    queryWords.forEach((word) => {
      if (word.length > 2 && docText.includes(word)) {
        const regex = new RegExp(`\\b${word}\\b`, "g");
        const count = (docText.match(regex) || []).length;
        score += count * 2 + 3;
      }
    });

    return { doc, score };
  });

  // Sort by score descending and return top 2
  return scoredDocs
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.doc)
    .slice(0, 2);
}

// Express parsing middlewares
app.use(express.json());

// API: Auth endpoints
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, name, role } = req.body;
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: "Missing required registration parameters." });
  }

  const db = readDB();
  const emailLower = email.toLowerCase();
  
  if (db.users.some(u => u.email.toLowerCase() === emailLower || u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: "Username or email already exists." });
  }

  const newUser = {
    id: "usr-" + crypto.randomUUID().slice(0, 8),
    username,
    email: emailLower,
    password: crypto.createHash("sha256").update(password).digest("hex"),
    role: role === "admin" ? "admin" : "engineer",
    name
  };

  db.users.push(newUser);
  writeDB(db);

  const token = signToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ user: userWithoutPassword, token });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password." });
  }

  const db = readDB();
  const emailLower = email.toLowerCase();
  const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

  const user = db.users.find(u => u.email.toLowerCase() === emailLower && u.password === hashedPassword);
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = signToken(user);
  const { password: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword, token });
});

// API: Dashboard stats
app.get("/api/dashboard", authenticate, (req, res) => {
  const db = readDB();
  
  const totalMachines = db.machines.length;
  const healthyMachines = db.machines.filter(m => m.status === "healthy").length;
  const warningMachines = db.machines.filter(m => m.status === "warning").length;
  const criticalMachines = db.machines.filter(m => m.status === "critical").length;

  const recentPredictions = db.predictions
    .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())
    .slice(0, 5);

  // Generate failure types counts
  const failureCounts: { [key: string]: number } = {};
  db.predictions.forEach((pred) => {
    if (pred.predictedFailure && pred.predictedFailure !== "None" && pred.healthStatus !== "healthy") {
      failureCounts[pred.predictedFailure] = (failureCounts[pred.predictedFailure] || 0) + 1;
    }
  });
  const failureTypesCount = Object.entries(failureCounts).map(([type, count]) => ({ type, count }));

  // Generate monthly reports distribution for last 5 months
  const months = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
  const monthlyReportCounts = months.map((month, idx) => {
    const monthlyPreds = db.predictions.filter((p) => {
      const date = new Date(p.analyzedAt);
      return date.getMonth() === (new Date().getMonth() - (5 - idx) + 12) % 12;
    });

    return {
      month,
      healthy: monthlyPreds.filter(p => p.healthStatus === "healthy").length,
      warning: monthlyPreds.filter(p => p.healthStatus === "warning").length,
      critical: monthlyPreds.filter(p => p.healthStatus === "critical").length,
    };
  });

  res.json({
    totalMachines,
    healthyMachines,
    warningMachines,
    criticalMachines,
    recentPredictions,
    failureTypesCount,
    monthlyReportCounts
  });
});

// API: Machines Management
app.get("/api/machines", authenticate, (req, res) => {
  const db = readDB();
  const { search, status, department } = req.query;
  let results = [...db.machines];

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(m => 
      m.name.toLowerCase().includes(q) || 
      m.machineId.toLowerCase().includes(q) || 
      m.type.toLowerCase().includes(q) || 
      m.manufacturer.toLowerCase().includes(q)
    );
  }

  if (status) {
    results = results.filter(m => m.status === status);
  }

  if (department) {
    results = results.filter(m => m.department === department);
  }

  res.json(results);
});

app.post("/api/machines", authenticate, (req, res) => {
  const { machineId, name, type, manufacturer, department, installationDate, status } = req.body;
  
  if (!machineId || !name || !type || !manufacturer || !department || !installationDate) {
    return res.status(400).json({ error: "Missing required machine parameters." });
  }

  const db = readDB();
  if (db.machines.some(m => m.machineId.toLowerCase() === machineId.toLowerCase())) {
    return res.status(400).json({ error: "Machine ID code already exists." });
  }

  const newMachine = {
    id: "mach-" + crypto.randomUUID().slice(0, 8),
    machineId,
    name,
    type,
    manufacturer,
    department,
    installationDate,
    status: status || "healthy"
  };

  db.machines.push(newMachine);
  writeDB(db);
  res.json(newMachine);
});

app.put("/api/machines/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const { name, type, manufacturer, department, installationDate, status } = req.body;

  const db = readDB();
  const machineIndex = db.machines.findIndex(m => m.id === id);
  if (machineIndex === -1) {
    return res.status(404).json({ error: "Machine not found." });
  }

  db.machines[machineIndex] = {
    ...db.machines[machineIndex],
    name: name || db.machines[machineIndex].name,
    type: type || db.machines[machineIndex].type,
    manufacturer: manufacturer || db.machines[machineIndex].manufacturer,
    department: department || db.machines[machineIndex].department,
    installationDate: installationDate || db.machines[machineIndex].installationDate,
    status: status || db.machines[machineIndex].status,
  };

  writeDB(db);
  res.json(db.machines[machineIndex]);
});

app.delete("/api/machines/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const machineExists = db.machines.some(m => m.id === id);
  if (!machineExists) {
    return res.status(404).json({ error: "Machine not found." });
  }

  db.machines = db.machines.filter(m => m.id !== id);
  writeDB(db);
  res.json({ message: "Machine deleted successfully." });
});

// API: Search overall system
app.get("/api/search", authenticate, (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.json({ machines: [], reports: [], manuals: [] });
  }

  const db = readDB();
  const searchStr = (q as string).toLowerCase();

  const machines = db.machines.filter(m => 
    m.name.toLowerCase().includes(searchStr) || 
    m.machineId.toLowerCase().includes(searchStr) ||
    m.type.toLowerCase().includes(searchStr)
  );

  const reports = db.predictions.filter(p => 
    p.machineName.toLowerCase().includes(searchStr) || 
    p.predictedFailure.toLowerCase().includes(searchStr) ||
    p.technicalExplanation.toLowerCase().includes(searchStr)
  );

  const manuals = RAG_DOCUMENTS.filter(doc => 
    doc.title.toLowerCase().includes(searchStr) || 
    doc.content.toLowerCase().includes(searchStr) ||
    doc.tags.some(t => t.toLowerCase().includes(searchStr))
  );

  res.json({ machines, reports, manuals });
});

// API: Reports List
app.get("/api/reports", authenticate, (req, res) => {
  const db = readDB();
  const { search, riskLevel, healthStatus, sort } = req.query;
  let results = [...db.predictions];

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(p => 
      p.machineName.toLowerCase().includes(q) || 
      p.machineId.toLowerCase().includes(q) ||
      p.predictedFailure.toLowerCase().includes(q) ||
      p.technicalExplanation.toLowerCase().includes(q)
    );
  }

  if (riskLevel) {
    results = results.filter(p => p.riskLevel === riskLevel);
  }

  if (healthStatus) {
    results = results.filter(p => p.healthStatus === healthStatus);
  }

  if (sort === "oldest") {
    results.sort((a, b) => new Date(a.analyzedAt).getTime() - new Date(b.analyzedAt).getTime());
  } else if (sort === "confidence") {
    results.sort((a, b) => b.confidenceScore - a.confidenceScore);
  } else {
    // Default: newest first
    results.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
  }

  res.json(results);
});

app.delete("/api/reports/:id", authenticate, (req, res) => {
  const { id } = req.params;
  const db = readDB();

  const reportIndex = db.predictions.findIndex(p => p.id === id);
  if (reportIndex === -1) {
    return res.status(404).json({ error: "Maintenance report not found." });
  }

  db.predictions.splice(reportIndex, 1);
  writeDB(db);
  res.json({ message: "Maintenance report deleted successfully." });
});

// Admin Users management endpoint
app.get("/api/admin/users", authenticate, (req: any, res: any) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  const db = readDB();
  const users = db.users.map(({ password: _, ...u }) => u);
  res.json(users);
});

app.delete("/api/admin/users/:id", authenticate, (req: any, res: any) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden. Admin access required." });
  }
  const { id } = req.params;
  if (id === "usr-admin") {
    return res.status(400).json({ error: "Cannot delete the default root admin user." });
  }
  const db = readDB();
  db.users = db.users.filter(u => u.id !== id);
  writeDB(db);
  res.json({ message: "User deleted successfully." });
});

// API: AI-Powered Predictive Analysis with RAG & Gemini
app.post("/api/predict", authenticate, async (req, res) => {
  const { machineId, parameters, engineerNotes } = req.body;

  if (!machineId || !parameters) {
    return res.status(400).json({ error: "Missing machineId or sensor parameters." });
  }

  const db = readDB();
  const machine = db.machines.find(m => m.id === machineId || m.machineId === machineId);
  if (!machine) {
    return res.status(404).json({ error: "Machine not found in database." });
  }

  // Parse sensor parameters strictly
  const {
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
  } = parameters;

  // 1. RAG Retrieve: Search Similar Cases and Manuals from ChromaDB (Simulated with local knowledge base)
  const retrievedDocs = retrieveRelatedDocs(machine.type, parameters);
  const contextText = retrievedDocs
    .map((doc, idx) => `[REFERENCE #${idx + 1}] Title: ${doc.title}\nType: ${doc.type}\nContent: ${doc.content}`)
    .join("\n\n");

  const similarTitles = retrievedDocs.map(d => d.title);

  // Fallback prediction if Gemini API Key is missing or service fails
  const getFallbackPrediction = (errMessage?: string) => {
    // Generate intelligent deterministic calculations based on parameters and manuals
    let healthStatus: 'healthy' | 'warning' | 'critical' = "healthy";
    let predictedFailure = "None";
    let riskLevel: 'Low' | 'Medium' | 'High' | 'Critical' = "Low";
    let confidenceScore = 95;
    let technicalExplanation = "All sensor parameters are within standard operating benchmarks. Continuous oil flow, thermal balance, and vibration dynamics are completely normal.";
    let maintenanceRecommendation = "Continue regular daily inspections. No emergency maintenance intervention is needed at this time.";
    let priority: 'Low' | 'Medium' | 'High' | 'Immediate' = "Low";
    let estimatedDowntime = "None";
    let nextInspectionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // +30 days

    if (oilLeakage || vibrationLevel > 4.5 || temperature > 70 || pressure < 120 || noiseLevel > 80 || loadPercentage > 85) {
      healthStatus = "warning";
      riskLevel = "Medium";
      priority = "Medium";
      confidenceScore = 80;
      nextInspectionDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // +7 days

      if (machine.type.toLowerCase().includes("cnc") || machine.type.toLowerCase().includes("mill")) {
        if (vibrationLevel > 5 || temperature > 75) {
          predictedFailure = "Spindle Bearing Wear and Alignment Fault";
          technicalExplanation = `Vibration has reached ${vibrationLevel} mm/s (acceptable threshold < 4.5 mm/s) accompanied by elevated spindle temperature at ${temperature}°C. This strongly correlates with CNC High Vibration Diagnostics Manual (doc-01) indicating advanced spindle bearing fatigue.`;
          maintenanceRecommendation = "1. Schedule spindle shutdown within 48 hours.\n2. Apply dynamic lubrication to spindle bearings.\n3. Check axis alignment and run spindle at reduced load (<70%).";
          estimatedDowntime = "4 hours";
          riskLevel = "High";
          priority = "High";
        } else {
          predictedFailure = "Minor Mechanical Looseness or Unbalance";
          technicalExplanation = `Slightly elevated vibration levels (${vibrationLevel} mm/s) under standard load. Spindle temperature is stable.`;
          maintenanceRecommendation = "Tighten structural bolts, check coupling torque, and inspect for feed tool imbalances.";
          estimatedDowntime = "1 hour";
        }
      } else if (machine.type.toLowerCase().includes("press") || machine.type.toLowerCase().includes("hydraulic")) {
        if (oilLeakage || pressure < 130) {
          predictedFailure = "Piston Flange Gasket Degradation";
          technicalExplanation = `Hydraulic oil leakage detected with working pressure dropping to ${pressure} Bar (baseline 150 Bar) and oil temperature at ${temperature}°C. This aligns with standard safety procedures warning of seal fatigue above 65°C.`;
          maintenanceRecommendation = "1. Check for visible line leakage around outer piston assembly.\n2. Replace main piston seal flange gasket.\n3. Verify oil level and top up hydraulic fluid.";
          estimatedDowntime = "4 hours";
          riskLevel = "High";
          priority = "High";
        }
      } else if (machine.type.toLowerCase().includes("robot") || machine.type.toLowerCase().includes("arm")) {
        if (loadPercentage > 85 || humidity > 60) {
          predictedFailure = "Joint Motor Winding Overheating";
          technicalExplanation = `Robotic joint operating load is at ${loadPercentage}% coupled with elevated ambient humidity of ${humidity}%. Elevated humidity accelerates winding insulation degradation.`;
          maintenanceRecommendation = "1. Adjust motions to decrease path speed by 15% to lower joint duty cycle.\n2. Recalibrate joint axis encoders.\n3. Set ambient dehumidifier to maintain relative humidity below 50%.";
          estimatedDowntime = "2 hours";
          priority = "High";
        }
      } else if (machine.type.toLowerCase().includes("compressor")) {
        if (noiseLevel > 83 || operatingHours > 8000) {
          predictedFailure = "Compressor Intake Valve Clogging & Belt Wear";
          technicalExplanation = `Compressor noise has peaked at ${noiseLevel} dB (standard < 80 dB) under high accumulated operating hours (${operatingHours} hrs). Belt slip or severe intake flow restriction is highly indicated.`;
          maintenanceRecommendation = "1. Shut down unit and check drive belt tension.\n2. Replace the primary intake air filter kit immediately.\n3. Proactively replace intake valve if operating hours exceed 8000 hours.";
          estimatedDowntime = "6 hours";
          riskLevel = "High";
          priority = "High";
        }
      }
    }

    if (vibrationLevel > 6.5 || temperature > 80 || (pressure > 0 && pressure < 115) || noiseLevel > 87) {
      healthStatus = "critical";
      riskLevel = "Critical";
      priority = "Immediate";
      confidenceScore = 90;
      estimatedDowntime = estimatedDowntime === "None" ? "8 hours" : estimatedDowntime;
      nextInspectionDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // tomorrow
    }

    // Append fallback disclaimer to explanation
    if (errMessage) {
      technicalExplanation += `\n\n[System Notice: Active Diagnostics generated locally by Enterprise Rule-Engine. Details: ${errMessage}]`;
    }

    return {
      id: "pred-" + crypto.randomUUID().slice(0, 8),
      machineId: machine.id,
      machineName: machine.name,
      healthStatus,
      predictedFailure,
      riskLevel,
      confidenceScore,
      technicalExplanation,
      maintenanceRecommendation,
      priority,
      estimatedDowntime,
      nextInspectionDate,
      retrievedSimilarCases: similarTitles.length > 0 ? similarTitles : ["Standard Predictive Maintenance Manual"],
      engineerNotes: engineerNotes || "",
      analyzedAt: new Date().toISOString(),
      parameters
    };
  };

  // 2. Build the Gemini AI call with Role Prompting, Few-Shot examples, and injected RAG Context!
  const systemPrompt = `You are a Senior Manufacturing Maintenance Engineer with elite expertise in industrial machine diagnostics and predictive maintenance.
Your task is to analyze current machine parameters and predict potential failures, explain the technical reasons, assign risk levels, and provide exact actionable maintenance suggestions.

You MUST integrate and refer to the retrieved database context (manuals or historical cases) in your explanation if relevant.

Return a strictly validated JSON object containing EXACTLY these keys. Do not include any other commentary or markdown formatting other than the JSON itself.

RESPONSE SCHEMA FORMAT:
{
  "healthStatus": "healthy" | "warning" | "critical",
  "predictedFailure": "Clear specific name of predicted failure or 'None'",
  "riskLevel": "Low" | "Medium" | "High" | "Critical",
  "confidenceScore": number (integer between 0 and 100 representing certainty),
  "technicalExplanation": "Detailed technical reasoning referencing current parameters and retrieved manuals/cases",
  "maintenanceRecommendation": "Actionable, numbered step-by-step recommendations for maintenance crew",
  "priority": "Low" | "Medium" | "High" | "Immediate",
  "estimatedDowntime": "Estimated downtime (e.g., '2 hours', '8 hours', 'None')",
  "nextInspectionDate": "YYYY-MM-DD format"
}`;

  const prompt = `MACHINE DETAILS:
- Name: ${machine.name}
- Type: ${machine.type}
- Manufacturer: ${machine.manufacturer}
- Department: ${machine.department}

CURRENT SENSOR READINGS (MANUALLY RECORDED):
- Temperature: ${temperature}°C
- Pressure: ${pressure} Bar
- Vibration Level: ${vibrationLevel} mm/s
- Noise Level: ${noiseLevel} dB
- Operating Hours: ${operatingHours} hours
- Humidity: ${humidity}%
- Oil Leakage: ${oilLeakage ? "YES (ACTIVE LEAK)" : "NO"}
- Power Consumption: ${powerConsumption} kW
- Load Percentage: ${loadPercentage}%
- Motor Speed: ${motorSpeed} RPM

RETRIEVED CONTEXT FROM CHROMADB (KNOWLEDGE BASE & CASES):
${contextText || "No similar manual context found. Use standard predictive maintenance guidelines."}

ENGINEER COMMENTS/OBSERVATIONS:
${engineerNotes || "None"}

Please analyze and return the predictive diagnostic report JSON now.`;

  try {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("MY_GEMINI_API_KEY")) {
      throw new Error("Gemini API key is not configured.");
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Invoke Gemini 3.5-flash
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthStatus: { type: Type.STRING },
            predictedFailure: { type: Type.STRING },
            riskLevel: { type: Type.STRING },
            confidenceScore: { type: Type.INTEGER },
            technicalExplanation: { type: Type.STRING },
            maintenanceRecommendation: { type: Type.STRING },
            priority: { type: Type.STRING },
            estimatedDowntime: { type: Type.STRING },
            nextInspectionDate: { type: Type.STRING }
          },
          required: [
            "healthStatus",
            "predictedFailure",
            "riskLevel",
            "confidenceScore",
            "technicalExplanation",
            "maintenanceRecommendation",
            "priority",
            "estimatedDowntime",
            "nextInspectionDate"
          ]
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response returned from Gemini API.");
    }

    const parsedOutput = JSON.parse(outputText.trim());
    
    // Save prediction record to database
    const newPrediction = {
      id: "pred-" + crypto.randomUUID().slice(0, 8),
      machineId: machine.id,
      machineName: machine.name,
      healthStatus: parsedOutput.healthStatus || "healthy",
      predictedFailure: parsedOutput.predictedFailure || "None",
      riskLevel: parsedOutput.riskLevel || "Low",
      confidenceScore: parsedOutput.confidenceScore || 90,
      technicalExplanation: parsedOutput.technicalExplanation,
      maintenanceRecommendation: parsedOutput.maintenanceRecommendation,
      priority: parsedOutput.priority || "Low",
      estimatedDowntime: parsedOutput.estimatedDowntime || "None",
      nextInspectionDate: parsedOutput.nextInspectionDate || new Date().toISOString().split("T")[0],
      retrievedSimilarCases: similarTitles.length > 0 ? similarTitles : ["General Machinery Diagnostics standards"],
      engineerNotes: engineerNotes || "",
      analyzedAt: new Date().toISOString(),
      parameters
    };

    // Update machine status in database to match the predicted health status
    const machineIndex = db.machines.findIndex(m => m.id === machine.id);
    if (machineIndex !== -1) {
      db.machines[machineIndex].status = newPrediction.healthStatus;
    }

    db.predictions.push(newPrediction);
    writeDB(db);

    res.json(newPrediction);
  } catch (error: any) {
    console.error("Gemini API prediction failed, using fallback engine:", error.message);
    const fallbackReport = getFallbackPrediction(error.message || "Unknown API error");
    
    // Also save fallback reports to DB so they show in history
    const machineIndex = db.machines.findIndex(m => m.id === machine.id);
    if (machineIndex !== -1) {
      db.machines[machineIndex].status = fallbackReport.healthStatus;
    }
    db.predictions.push(fallbackReport);
    writeDB(db);

    res.json(fallbackReport);
  }
});

// Vite server middleware setup for development, static file serving in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Enterprise Predictive Maintenance server listening at http://0.0.0.0:${PORT}`);
  });
}

// Boot up server seed data
readDB();

startServer();
