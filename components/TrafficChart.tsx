import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Dot } from 'recharts';
import { TrafficPoint } from '../types';

interface TrafficChartProps {
  data: TrafficPoint[];
  isActive: boolean;
}

const TrafficChart: React.FC<TrafficChartProps> = ({ data, isActive }) => {
  const latestData = data[data.length - 1] || { upload: 0, download: 0 };

  // Calculate intensity factors (0 to 1) based on expected max (say 100 Mbps)
  const downloadIntensity = Math.min(latestData.download / 100, 1);
  const uploadIntensity = Math.min(latestData.upload / 100, 1);

  // Custom Dot component with a "pulse" effect for the latest point
  const RenderCustomDot = (props: any) => {
    const { cx, cy, payload, dataKey, index } = props;
    
    // Only show the pulse for the very last data point
    if (index !== data.length - 1 || !isActive) return null;

    const color = dataKey === 'download' ? '#3b82f6' : '#10b981';
    const intensity = dataKey === 'download' ? downloadIntensity : uploadIntensity;
    
    return (
      <g>
        {/* The "Ping" animation */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={4 + (intensity * 8)} 
          fill={color} 
          className="animate-ping opacity-40"
        />
        {/* The solid core */}
        <circle 
          cx={cx} 
          cy={cy} 
          r={3} 
          fill={color} 
          className="shadow-lg"
          style={{ filter: `drop-shadow(0 0 ${4 + intensity * 6}px ${color})` }}
        />
      </g>
    );
  };

  if (!isActive) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 space-y-4">
        <div className="relative w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500/30 animate-spin" />
          <div className="w-2 h-2 bg-slate-700 rounded-full animate-pulse" />
        </div>
        <p className="font-mono text-sm tracking-widest opacity-50 uppercase">Waiting for secure tunnel...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          {/* Download Gradient */}
          <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4 + downloadIntensity * 0.4} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          
          {/* Upload Gradient */}
          <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4 + uploadIntensity * 0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="#1e293b" 
            vertical={false} 
            strokeOpacity={0.3}
        />
        
        <XAxis 
            dataKey="time" 
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} 
            axisLine={false} 
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={30}
        />
        
        <YAxis 
            tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace' }} 
            axisLine={false} 
            tickLine={false}
            domain={[0, 'auto']}
        />
        
        <Tooltip 
            contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: '#1e293b', 
                borderRadius: '8px',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(51, 65, 85, 0.5)',
                color: '#f8fafc',
                fontSize: '12px'
            }}
            cursor={{ stroke: '#334155', strokeWidth: 1 }}
        />
        
        <Area 
            type="monotone" 
            dataKey="download" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorDown)" 
            strokeWidth={2.5}
            isAnimationActive={false}
            dot={<RenderCustomDot dataKey="download" />}
            style={{ filter: downloadIntensity > 0.5 ? 'url(#glow)' : 'none' }}
        />
        
        <Area 
            type="monotone" 
            dataKey="upload" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorUp)" 
            strokeWidth={2.5}
            isAnimationActive={false}
            dot={<RenderCustomDot dataKey="upload" />}
            style={{ filter: uploadIntensity > 0.5 ? 'url(#glow)' : 'none' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrafficChart;