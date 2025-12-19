
import React from 'react';
import { Certification } from '../types';
import { Award, CheckCircle2, ShieldCheck, Info } from 'lucide-react';

interface CertificationsPanelProps {
  certs: Certification[];
}

const CertificationsPanel: React.FC<CertificationsPanelProps> = ({ certs }) => {
  return (
    <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1 scrollbar-hide">
      {certs.map((cert) => (
        <div 
          key={cert.id} 
          className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
            {cert.issuer === 'BSI' ? <Award className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
          </div>
          
          <div className="flex items-start gap-3">
            <div className={`mt-1 p-1.5 rounded bg-slate-800 border border-slate-700 ${cert.issuer === 'BSI' ? 'text-emerald-400' : 'text-blue-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{cert.issuer} Verified</span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  {cert.status}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-200 truncate pr-4">{cert.standard}</h3>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{cert.name}</p>
              {cert.validUntil && (
                <div className="mt-2 flex items-center gap-1.5 text-[9px] text-slate-400 font-mono">
                  <Info className="w-2.5 h-2.5 text-slate-600" />
                  VALID UNTIL: {cert.validUntil}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CertificationsPanel;
