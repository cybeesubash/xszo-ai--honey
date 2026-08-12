export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface DeviceStatus {
  chipId: string;
  deviceName: string;
  firmwareVersion: string;
  macAddress: string;
  ipAddress: string;
  status: 'Online' | 'Offline';
  wifiRssi: number;
  cpuUsage: number;
  ramUsage: number;
  honeypotEnabled: boolean;
  lastSeen: string;
}

export interface AIThreatReport {
  attackType: string;
  threatScore: number; // 0-100
  severity: SeverityLevel;
  confidence: number; // 0-100
  summary: string;
  mitreAttack: string;
  possibleCve: string;
  firewallRule: string;
  yaraRule: string;
  sigmaRule: string;
  snortRule: string;
  suricataRule: string;
  recommendations: string[];
  incidentSummary: string;
  riskRating: SeverityLevel;
}

export interface AttackEvent {
  id: string;
  chipId: string;
  deviceName: string;
  sourceIP: string;
  country: string;
  countryCode: string;
  destPort: number;
  protocol: string;
  payload: string;
  connectionCount: number;
  timestamp: string;
  aiAnalyzed: boolean;
  analysis?: AIThreatReport;
}

export interface SOCStats {
  totalAttacks: number;
  liveConnections: number;
  averageThreatScore: number;
  blockedIPsCount: number;
  onlineDevicesCount: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SECURITY';
  source: string;
  message: string;
}
