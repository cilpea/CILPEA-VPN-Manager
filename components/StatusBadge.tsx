import React from 'react';
import { ConnectionStatus } from '../types';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ConnectionStatus;
  detail?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, detail }) => {
  const renderContent = (label: string, icon: React.ReactNode, baseColors: string, spin: boolean = false) => (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${baseColors} transition-all duration-300`}>
      <div className={spin ? 'animate-spin' : ''}>{icon}</div>
      <div className="flex flex-col leading-none">
        <span className="font-semibold tracking-wide text-xs md:text-sm uppercase">{label}</span>
        {detail && <span className="text-[10px] md:text-xs opacity-80 font-normal">{detail}</span>}
      </div>
    </div>
  );

  switch (status) {
    case ConnectionStatus.CONNECTED:
      return renderContent(
        'Connected',
        <Wifi className="w-4 h-4" />,
        'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
      );
    case ConnectionStatus.CONNECTING:
      return renderContent(
        'Connecting',
        <RefreshCw className="w-4 h-4" />,
        'bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse',
        true
      );
    case ConnectionStatus.DISCONNECTING:
      return renderContent(
        'Disconnecting',
        <RefreshCw className="w-4 h-4" />,
        'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse',
        true
      );
    case ConnectionStatus.ERROR:
      return renderContent(
        'Error',
        <AlertTriangle className="w-4 h-4" />,
        'bg-red-500/10 border-red-500/20 text-red-400'
      );
    case ConnectionStatus.DISCONNECTED:
    default:
      return renderContent(
        'Disconnected',
        <WifiOff className="w-4 h-4" />,
        'bg-slate-700/30 border-slate-600/50 text-slate-400'
      );
  }
};

export default StatusBadge;