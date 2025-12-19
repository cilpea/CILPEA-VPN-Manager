import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog: React.FC<TerminalLogProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-lg border border-slate-800 overflow-hidden font-mono text-xs shadow-inner">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-b border-slate-800">
        <Terminal className="w-3 h-3 text-slate-500" />
        <span className="text-slate-400">System Output</span>
      </div>
      <div className="flex-1 p-3 overflow-y-auto space-y-1">
        {logs.length === 0 && (
          <div className="text-slate-700 italic">No activity recorded.</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 break-all">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span
              className={`
                ${log.type === 'error' ? 'text-red-400' : ''}
                ${log.type === 'success' ? 'text-emerald-400' : ''}
                ${log.type === 'warning' ? 'text-amber-400' : ''}
                ${log.type === 'info' ? 'text-slate-300' : ''}
              `}
            >
              {log.type === 'success' ? '> ' : ''}{log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default TerminalLog;