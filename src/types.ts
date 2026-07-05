export interface Machine {
  id: string;
  machineId: string;
  name: string;
  type: string;
  manufacturer: string;
  department: string;
  installationDate: string;
  status: 'healthy' | 'warning' | 'critical';
}

export interface HealthParameters {
  temperature: number;
  pressure: number;
  vibrationLevel: number;
  noiseLevel: number;
  operatingHours: number;
  humidity: number;
  oilLeakage: boolean;
  powerConsumption: number;
  loadPercentage: number;
  motorSpeed: number;
}

export interface Prediction {
  id: string;
  machineId: string;
  machineName: string;
  healthStatus: 'healthy' | 'warning' | 'critical';
  predictedFailure: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number; // percentage (e.g. 92)
  technicalExplanation: string;
  maintenanceRecommendation: string;
  priority: 'Low' | 'Medium' | 'High' | 'Immediate';
  estimatedDowntime: string;
  nextInspectionDate: string;
  retrievedSimilarCases: string[];
  engineerNotes?: string;
  analyzedAt: string;
  parameters: HealthParameters;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'engineer';
}

export interface RAGDocument {
  id: string;
  title: string;
  type: 'manual' | 'procedure' | 'case';
  content: string;
  tags: string[];
}
