import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ConnectionStatus, LogEntry, TrafficPoint, VpnStats } from './types';
import { connectVpn, disconnectVpn } from './services/vpnService';
import StatusBadge from './components/StatusBadge';
import TrafficChart from './components/TrafficChart';
import TerminalLog from './components/TerminalLog';
import { Shield, Power, Globe, Activity, Lock, Settings, RefreshCw, ZapOff } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>(ConnectionStatus.DISCONNECTED);
  const [statusDetail, setStatusDetail] = useState<string>('Ready');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [trafficData, setTrafficData] = useState<TrafficPoint[]>([]);
  const [autoReconnect, setAutoReconnect] = useState<boolean>(false);
  const [stats, setStats] = useState<VpnStats>({
    ipAddress: '---.---.---.---',
    protocol: 'UDP/443',
    uptime: '00:00:00',
    bytesIn: '0 MB',
    bytesOut: '0 MB'
  });

  const trafficIntervalRef = useRef<number | null>(null);
  const uptimeIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toLocaleTimeString([], { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-49), newLog]);
  }, []);

  // Initialize Traffic Data with empty points
  useEffect(() => {
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: '00:00',
      upload: 0,
      download: 0
    }));
    setTrafficData(initialData);
    addLog('System initialized. Ready to connect.', 'info');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-reconnect Logic
  useEffect(() => {
    if (autoReconnect && status === ConnectionStatus.ERROR) {
      addLog('Connection lost unexpectedly. Auto-reconnect enabled.', 'warning');
      addLog('Attempting to reconnect in 3 seconds...', 'info');
      
      let countdown = 3;
      setStatusDetail(`Retrying in ${countdown}s`);
      
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = window.setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
            setStatusDetail(`Retrying in ${countdown}s`);
        } else {
            setStatusDetail('Initiating retry...');
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        }
      }, 1000);

      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        handleConnect();
      }, 3000);
    }

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, autoReconnect]);

  const handleConnect = async () => {
    if (status === ConnectionStatus.CONNECTED || status === ConnectionStatus.CONNECTING) return;

    setStatus(ConnectionStatus.CONNECTING);
    setStatusDetail('Initializing...');
    addLog('Initiating connection sequence...', 'info');
    addLog('Loading configuration from /etc/openvpn/client/my_vpn.ovpn...', 'info');

    // Simulate detailed connection steps
    const step1 = setTimeout(() => setStatusDetail('Handshaking...'), 600);
    const step2 = setTimeout(() => {
        setStatusDetail('Verifying Keys...');
        addLog('Verifying remote server certificate...', 'info');
    }, 1200);
    const step3 = setTimeout(() => setStatusDetail('Configuring Route...'), 1600);

    try {
      const success = await connectVpn();
      if (success) {
        setStatus(ConnectionStatus.CONNECTED);
        setStatusDetail('AES-256-GCM');
        addLog('Handshake successful. TLS negotiation complete.', 'success');
        addLog('Tunnel interface tun0 opened.', 'success');
        addLog('Initialization Sequence Completed.', 'success');
        startTimeRef.current = Date.now();
        setStats(prev => ({ ...prev, ipAddress: '10.8.0.45' })); // Mock IP
        startTrafficSimulation();
        startUptimeCounter();
      } else {
        throw new Error('Connection timeout');
      }
    } catch (error) {
      setStatus(ConnectionStatus.ERROR);
      setStatusDetail('Code: 504 (Timeout)');
      addLog('Failed to establish connection.', 'error');
      // If auto-reconnect is OFF, reset to disconnected after a while
      if (!autoReconnect) {
        setTimeout(() => {
            setStatus(ConnectionStatus.DISCONNECTED);
            setStatusDetail('Ready');
        }, 3000);
      }
    } finally {
        clearTimeout(step1);
        clearTimeout(step2);
        clearTimeout(step3);
    }
  };

  const handleDisconnect = async () => {
    if (status === ConnectionStatus.DISCONNECTED || status === ConnectionStatus.DISCONNECTING) return;

    setStatus(ConnectionStatus.DISCONNECTING);
    setStatusDetail('Terminating...');
    addLog('Sending termination signal...', 'warning');

    try {
      await disconnectVpn();
      stopSimulation();
      setStatus(ConnectionStatus.DISCONNECTED);
      setStatusDetail('Ready');
      addLog('Connection terminated by user.', 'warning');
      setStats(prev => ({
        ...prev,
        ipAddress: '---.---.---.---',
        uptime: '00:00:00',
        bytesIn: '0 MB',
        bytesOut: '0 MB'
      }));
    } catch (error) {
      addLog('Error terminating process.', 'error');
      setStatus(ConnectionStatus.ERROR);
      setStatusDetail('Code: 500');
    }
  };

  const simulateDrop = () => {
    if (status !== ConnectionStatus.CONNECTED) return;
    addLog('SIMULATING NETWORK FAILURE...', 'error');
    stopSimulation();
    setStatus(ConnectionStatus.ERROR);
    setStatusDetail('NetLink Down');
  };

  const startTrafficSimulation = () => {
    if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);

    trafficIntervalRef.current = window.setInterval(() => {
      setTrafficData(prev => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        // Random traffic generation
        const newDownload = Math.floor(Math.random() * 80) + 10;
        const newUpload = Math.floor(Math.random() * 30) + 5;

        const newPoint = { time: timeStr, download: newDownload, upload: newUpload };
        return [...prev.slice(1), newPoint];
      });
      
      // Update stats randomly
      setStats(prev => {
          const currentIn = parseFloat(prev.bytesIn);
          const currentOut = parseFloat(prev.bytesOut);
          return {
              ...prev,
              bytesIn: (currentIn + (Math.random() * 0.5)).toFixed(1) + ' MB',
              bytesOut: (currentOut + (Math.random() * 0.2)).toFixed(1) + ' MB'
          };
      });

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
  }

  const stopSimulation = () => {
    if (trafficIntervalRef.current) clearInterval(trafficIntervalRef.current);
    if (uptimeIntervalRef.current) clearInterval(uptimeIntervalRef.current);
    
    // Flatline the chart
    setTrafficData(prev => {
        const lastPoints = prev.map(p => ({ ...p, upload: 0, download: 0 }));
        return lastPoints;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">CILPEA VPN</h1>
            <p className="text-xs text-slate-500 font-mono">SECURE TUNNEL MANAGER v1.0.4</p>
          </div>
        </div>
        <StatusBadge status={status} detail={statusDetail} />
      </header>

      {/* Main Grid */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls & Info */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Main Control Card */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all duration-700" />
            
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6">Connection Control</h2>
            
            <div className="flex justify-center mb-4">
              <button
                onClick={status === ConnectionStatus.CONNECTED ? handleDisconnect : handleConnect}
                disabled={status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING}
                className={`
                  relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
                  focus:outline-none focus:ring-4 focus:ring-slate-800 focus:ring-offset-2 focus:ring-offset-slate-950
                  ${status === ConnectionStatus.CONNECTED 
                    ? 'bg-red-500/10 hover:bg-red-500/20 border-2 border-red-500 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.2)]' 
                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-2 border-emerald-500 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                  }
                  ${(status === ConnectionStatus.CONNECTING || status === ConnectionStatus.DISCONNECTING) ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-105'}
                `}
              >
                <Power className={`w-10 h-10 ${status === ConnectionStatus.CONNECTED ? '' : ''}`} />
              </button>
            </div>
            
            <p className="text-center text-slate-500 text-sm mb-6">
              {status === ConnectionStatus.CONNECTED 
                ? 'Tap to terminate secure session' 
                : 'Tap to initiate secure handshake'}
            </p>

            {/* Auto Reconnect Toggle */}
            <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <RefreshCw className={`w-4 h-4 ${autoReconnect ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span>Auto-Reconnect</span>
                </div>
                <button
                  onClick={() => {
                    const newValue = !autoReconnect;
                    setAutoReconnect(newValue);
                    addLog(`Auto-reconnect ${newValue ? 'enabled' : 'disabled'}.`, 'info');
                  }}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    autoReconnect ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      autoReconnect ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

               {/* Debug Tool: Simulate Drop */}
               {status === ConnectionStatus.CONNECTED && (
                <button 
                  onClick={simulateDrop}
                  className="w-full mt-2 py-2 px-3 text-xs font-mono text-slate-500 hover:text-red-400 hover:bg-red-950/20 rounded border border-transparent hover:border-red-900/30 transition-all flex items-center justify-center gap-2 group/drop"
                >
                  <ZapOff className="w-3 h-3 group-hover/drop:animate-pulse" />
                  Simulate Network Drop
                </button>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-mono">VIRTUAL IP</span>
              </div>
              <div className="font-mono text-lg text-emerald-400">{stats.ipAddress}</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Settings className="w-4 h-4" />
                <span className="text-xs font-mono">PROTOCOL</span>
              </div>
              <div className="font-mono text-lg text-blue-400">{stats.protocol}</div>
            </div>
            <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 col-span-2 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-1 text-slate-500">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-mono">SESSION UPTIME</span>
                </div>
                <div className="font-mono text-xl text-white tracking-widest">{stats.uptime}</div>
              </div>
              <Lock className={`w-8 h-8 ${status === ConnectionStatus.CONNECTED ? 'text-emerald-500' : 'text-slate-700'}`} />
            </div>
          </div>
        </div>

        {/* Right Column: Visualization & Logs */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-full min-h-[500px]">
          
          {/* Traffic Chart */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex-1 shadow-lg relative min-h-[250px]">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Network Traffic
                </h2>
                <div className="flex gap-4 text-xs font-mono">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> UP: {stats.bytesOut}</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> DOWN: {stats.bytesIn}</span>
                </div>
             </div>
             <div className="h-[200px] w-full">
                <TrafficChart data={trafficData} isActive={status === ConnectionStatus.CONNECTED} />
             </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 min-h-[200px]">
            <TerminalLog logs={logs} />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;