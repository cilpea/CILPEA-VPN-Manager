
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus, LogEntry, TrafficPoint, VpnStats, Vulnerability, Certification } from './types';
import { connectVpn, disconnectVpn } from './services/vpnService';
import StatusBadge from './components/StatusBadge';
import TrafficChart from './components/TrafficChart';
import TerminalLog from './components/TerminalLog';
import SecurityAdvisory from './components/SecurityAdvisory';
import CertificationsPanel from './components/CertificationsPanel';
import { Shield, Power, Activity, Lock, RefreshCw, ShieldAlert, Bug, Timer, Award } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [statusDetail, setStatusDetail] = useState<string>('Ready');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(false);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'audit' | 'certs'>('audit');
  const [reconnectCountdown, setReconnectCountdown] = useState<number | null>(null);
  const [stats, setStats] = useState<VpnStats>({
    ipAddress: '---.---.---.---',
    protocol: 'UDP/443',
    uptime: '00:00:00',
    bytesIn: '0 MB',
    bytesOut: '0 MB'
  });

  const certifications: Certification[] = [
    { id: '1', issuer: 'BSI', standard: 'ISO/IEC 27001:2013', name: 'Information Security Management', validUntil: '2028-08-21', status: 'Active' },
    { id: '2', issuer: 'BSI', standard: 'ISO/IEC 27017:2015', name: 'ISMS Cloud Security', validUntil: '2028-08-21', status: 'Active' },
    { id: '3', issuer: 'BSI', standard: 'ISO/IEC 27018:2019', name: 'PII Protection in Public Clouds', validUntil: '2028-08-21', status: 'Active' },
    { id: '4', issuer: 'Deloitte', standard: 'SOC 2 Type 2', name: 'Security, Availability, Privacy', validUntil: '2024-09-30', status: 'Verified' },
    { id: '5', issuer: 'Deloitte', standard: 'GoBD Compliance', name: 'Tax-Compliant Data Processing', status: 'Audit Complete' },
    { id: '6', issuer: 'BSI', standard: 'ISO/IEC 27701:2019', name: 'Privacy Information Management', validUntil: '2028-08-21', status: 'Active' },
  ];

  const trafficIntervalRef = useRef<number | null>(null);
  const uptimeIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const userInitiatedDisconnect = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, []);

  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: '00:00',
      upload: 0,
      download: 0
    }));
    setTrafficData(initialData);
    addLog('CILPEA VPN Manager Core v1.0.4 loaded.', 'success');
  }, [addLog]);

  const handleConnect = async () => {
    if (status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING) return;
    userInitiatedDisconnect.current = false;
    setReconnectCountdown(null);
    setStatus(ConnectionStatus.CONNECTING);
    setStatusDetail('Initializing...');
    addLog('Initiating connection sequence...', 'info');
    try {
      const success = await connectVpn();
      if (success) {
        setStatus(ConnectionStatus.CONNECTED);
        setStatusDetail('AES-256-GCM');
        addLog('Initialization Sequence Completed.', 'success');
        startTimeRef.current = Date.now();
        setStats(prev => ({ ...prev, ipAddress: '10.8.0.45' }));
        startTrafficSimulation();
        startUptimeCounter();
      }
    } catch (error) {
      setStatus(ConnectionStatus.ERROR);
      addLog('Failed to establish connection.', 'error');
    }
  };

  const handleDisconnect = async () => {
    userInitiatedDisconnect.current = true;
    setReconnectCountdown(null);
    setStatus(ConnectionStatus.DISCONNECTING);
    setStatusDetail('Terminating...');
    try {
      await disconnectVpn();
      stopSimulation();
      setStatus(ConnectionStatus.DISCONNECTED);
      setStatusDetail('Ready');
      addLog('Connection terminated by user.', 'warning');
      setStats(prev => ({ ...prev, ipAddress: '---.---.---.---', uptime: '00:00:00', bytesIn: '0 MB', bytesOut: '0 MB' }));
    } catch (error) {
      setStatus(ConnectionStatus.ERROR);
    }
  };

  useEffect(() => {
    let countdownInterval: number | null = null;
    if (autoReconnect && !userInitiatedDisconnect.current && (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.ERROR)) {
      addLog('Connection lost. Auto-reconnect enabled.', 'warning');
      let timeLeft = 5;
      setReconnectCountdown(timeLeft);
      countdownInterval = window.setInterval(() => {
        timeLeft -= 1;
        setReconnectCountdown(timeLeft);
        if (timeLeft <= 0) {
          if (countdownInterval) clearInterval(countdownInterval);
          addLog('Attempting auto-reconnection...', 'info');
          handleConnect();
        }
      }, 1000);
    }
    return () => { if (countdownInterval) clearInterval(countdownInterval); };
  }, [status, autoReconnect]);

  const handleSecurityAudit = async () => {
    if (isScanning) return;
    setIsScanning(true);
    addLog('Starting comprehensive security audit...', 'info');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "List 4-5 real and relevant CVEs or security advisories for a Linux system running OpenVPN. Format as JSON array.",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                cveId: { type: Type.STRING },
                title: { type: Type.STRING },
                severity: { type: Type.STRING },
                description: { type: Type.STRING },
                recommendation: { type: Type.STRING }
              },
              required: ["id", "cveId", "title", "severity", "description", "recommendation"]
            }
          }
        }
      });
      const data = JSON.parse(response.text);
      setVulnerabilities(data);
      addLog(`Security audit complete. Found ${data.length} advisories.`, 'warning');
    } catch (error) {
      addLog('Failed to fetch security advisories.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const startTrafficSimulation = () => {
    if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    trafficIntervalRef.current = window.setInterval(() => {
      setTrafficData(prev => {
        const timeStr = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        return [...prev.slice(1), { time: timeStr, download: Math.floor(Math.random() * 80) + 10, upload: Math.floor(Math.random() * 30) + 5 }];
      });
      setStats(prev => ({
          ...prev,
          bytesIn: (parseFloat(prev.bytesIn) + (Math.random() * 0.5)).toFixed(1) + ' MB',
          bytesOut: (parseFloat(prev.bytesOut) + (Math.random() * 0.2)).toFixed(1) + ' MB'
      }));
    }, 1000);
  };

  const startUptimeCounter = () => {
      if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
      uptimeIntervalRef.current = window.setInterval(() => {
          if (!startTimeRef.current) return;
          const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const h = Math.floor(diff / 3600).toString().padStart(2, '0');
          const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
          const s = (diff % 60).toString().padStart(2, '0');
          setStats(prev => ({ ...prev, uptime: `${h}:${m}:${s}` }));
      }, 1000);
  };

  const stopSimulation = () => {
    if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
  };

  const simulateDrop = () => {
    if (status !== ConnectionStatus.CONNECTED) return;
    addLog('Simulating unexpected connection drop...', 'error');
    stopSimulation();
    setStatus(ConnectionStatus.ERROR);
    setStatusDetail('CRITICAL_DROP_01');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col font-sans selection:bg-emerald-500/30">
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20 group cursor-default">
            <Shield className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase tracking-widest">CILPEA VPN</h1>
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                SECURE TUNNEL INFRASTRUCTURE <span className="text-emerald-500/50">•</span> v1.0.4
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {status === ConnectionStatus.CONNECTED && (
            <button onClick={simulateDrop} className="text-[10px] uppercase font-bold text-slate-600 hover:text-red-500 transition-colors">Simulate Drop</button>
          )}
          <StatusBadge status={status} detail={statusDetail} />
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all duration-700" />
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
                <span>Access Management</span>
                {status === ConnectionStatus.CONNECTED && <Lock className="w-3 h-3 text-emerald-500 animate-pulse" />}
            </h2>
            <div className="flex justify-center mb-6 relative">
              <button
                onClick={status === ConnectionStatus.CONNECTED ? handleDisconnect : handleConnect}
                disabled={status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-800 focus:ring-offset-2 focus:ring-offset-slate-950
                  ${status === ConnectionStatus.CONNECTED 
                    ? 'bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                  }
                `}
              >
                <Power className="w-10 h-10" />
              </button>
              {reconnectCountdown !== null && (
                <div className="absolute -bottom-2 flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 border border-blue-500/30 rounded text-[10px] font-mono text-blue-400">
                  <Timer className="w-3 h-3 animate-pulse" />
                  RECONNECTING IN {reconnectCountdown}s
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-2 pt-4 border-t border-slate-800">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 font-mono">
                    <RefreshCw className={`w-3 h-3 ${autoReconnect ? 'text-emerald-400 rotate-180 transition-transform' : 'text-slate-600'}`} />
                    <span>AUTO-RECONNECT</span>
                  </div>
                </div>
                <button
                  onClick={() => { setAutoReconnect(!autoReconnect); addLog(`Auto-reconnect ${!autoReconnect ? 'enabled' : 'disabled'}.`, 'info'); }}
                  className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${autoReconnect ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-700'}`}
                >
                  <span className={`absolute left-1 top-1 w-3 h-3 rounded-full bg-white transition-transform ${autoReconnect ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
          </div>

          {/* Trust & Security Panel */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl flex-1 flex flex-col min-h-[400px]">
            <div className="flex gap-4 border-b border-slate-800 mb-6">
              <button 
                onClick={() => setActiveTab('audit')}
                className={`pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'audit' ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <div className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5" /> Audit</div>
                {activeTab === 'audit' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_10px_#10b981]" />}
              </button>
              <button 
                onClick={() => setActiveTab('certs')}
                className={`pb-3 text-[10px] font-bold uppercase tracking-widest transition-all relative ${activeTab === 'certs' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <div className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Compliance</div>
                {activeTab === 'certs' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_#3b82f6]" />}
              </button>
            </div>
            
            {activeTab === 'audit' ? (
              <>
                <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] text-slate-500 uppercase font-mono">Live Vulnerability Scan</p>
                    <button 
                      onClick={handleSecurityAudit}
                      disabled={isScanning}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold uppercase rounded border border-slate-700 transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <Bug className="w-3 h-3" />
                      {isScanning ? 'Scanning...' : 'Run Audit'}
                    </button>
                </div>
                <SecurityAdvisory vulnerabilities={vulnerabilities} isScanning={isScanning} />
              </>
            ) : (
              <CertificationsPanel certs={certifications} />
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6 overflow-hidden">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-lg">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Network Analytics
                </h2>
                <div className="flex gap-4 text-[10px] font-mono">
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> UP: <span className="text-slate-200">{stats.bytesOut}</span></span>
                    <span className="flex items-center gap-1 text-slate-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> DOWN: <span className="text-slate-200">{stats.bytesIn}</span></span>
                </div>
             </div>
             <div className="h-[220px] w-full">
                <TrafficChart data={trafficData} isActive={status === ConnectionStatus.CONNECTED} />
             </div>
             <div className="grid grid-cols-3 gap-4 mt-6 border-t border-slate-800 pt-6">
                <div className="group cursor-default">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 group-hover:text-emerald-500 transition-colors tracking-tighter">Virtual Tunnel IP</p>
                    <p className="font-mono text-emerald-400 text-sm">{stats.ipAddress}</p>
                </div>
                <div className="group cursor-default">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 group-hover:text-blue-500 transition-colors tracking-tighter">Session Duration</p>
                    <p className="font-mono text-blue-400 text-sm">{stats.uptime}</p>
                </div>
                <div className="group cursor-default">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1 group-hover:text-amber-500 transition-colors tracking-tighter">Cipher Protocol</p>
                    <p className="font-mono text-amber-400 text-[10px] leading-relaxed uppercase">{status === ConnectionStatus.CONNECTED ? 'AES-256-GCM / 4096-bit' : 'Not Established'}</p>
                </div>
             </div>
          </div>
          <div className="flex-1 min-h-[250px] overflow-hidden">
            <TerminalLog logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
