
export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
  SCANNING = 'SCANNING',
  ERROR = 'ERROR'
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

export interface TrafficPoint {
  time: string;
  upload: number;
  download: number;
}

export interface VpnStats {
  ipAddress: string;
  protocol: string;
  uptime: string;
  bytesIn: string;
  bytesOut: string;
}

export interface Vulnerability {
  id: string;
  cveId: string;
  title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  recommendation: string;
}

export interface Certification {
  id: string;
  name: string;
  standard: string;
  issuer: 'BSI' | 'Deloitte';
  validUntil?: string;
  status: 'Active' | 'Verified' | 'Audit Complete';
}
