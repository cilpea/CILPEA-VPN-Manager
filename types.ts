export enum ConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTING = 'DISCONNECTING',
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