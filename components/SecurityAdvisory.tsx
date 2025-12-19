
import React from 'react';
import { Vulnerability } from '../types';
import { ShieldAlert, ExternalLink, ShieldCheck } from 'lucide-react';

interface SecurityAdvisoryProps {
  vulnerabilities: Vulnerability[];
  isScanning: boolean;
}

const SecurityAdvisory: React.FC<SecurityAdvisoryProps> = ({ vulnerabilities, isScanning }) => {
  if (isScanning) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 py-12">
        <div className="relative">
          <ShieldAlert className="w-12 h-12 text-emerald-500 animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 bg-emerald-500/20 rounded-full animate-ping" />
        </div>
        <p className="text-slate-400 font-mono text-sm animate-pulse">Analyzing system configurations...</p>
      </div>
    );
  }

  if (vulnerabilities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-slate-600 border-2 border-dashed border-slate-800 rounded-xl">
        <ShieldCheck className="w-12 h-12 mb-3 opacity-20" />
        <p className="text-sm">No active scan results. Run audit to check for CVEs.</p>
      </div>
    );
  }

  const severityColors = {
    Critical: 'text-red-500 bg-red-500/10 border-red-500/20',
    High: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    Medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    Low: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-hide">
      {vulnerabilities.map((vuln) => (
        <div 
          key={vuln.id} 
          className="bg-slate-900/40 border border-slate-800 rounded-lg p-4 hover:border-slate-700 transition-colors group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityColors[vuln.severity]}`}>
              {vuln.severity}
            </span>
            <span className="text-xs font-mono text-slate-500 group-hover:text-slate-300 transition-colors flex items-center gap-1">
              {vuln.cveId}
              <ExternalLink className="w-3 h-3" />
            </span>
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-1">{vuln.title}</h3>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">{vuln.description}</p>
          <div className="bg-emerald-500/5 border-l-2 border-emerald-500/30 p-2 rounded-r">
            <p className="text-[10px] text-emerald-400 font-medium">RECOMMENDATION:</p>
            <p className="text-xs text-slate-300">{vuln.recommendation}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SecurityAdvisory;
