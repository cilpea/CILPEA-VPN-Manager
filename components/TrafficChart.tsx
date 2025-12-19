import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrafficPoint } from '../types';

interface TrafficChartProps {
  data: TrafficPoint[];
  isActive: boolean;
}

const TrafficChart: React.FC<TrafficChartProps> = ({ data, isActive }) => {
  if (!isActive) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-slate-600 space-y-4">
        <div className="w-16 h-16 rounded-full border-2 border-slate-800 flex items-center justify-center">
          <div className="w-2 h-2 bg-slate-700 rounded-full animate-pulse" />
        </div>
        <p className="font-mono text-sm">WAITING FOR TRAFFIC...</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis 
            dataKey="time" 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false}
        />
        <YAxis 
            tick={{ fill: '#64748b', fontSize: 10 }} 
            axisLine={false} 
            tickLine={false}
        />
        <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
            itemStyle={{ fontSize: 12 }}
        />
        <Area 
            type="monotone" 
            dataKey="download" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorDown)" 
            strokeWidth={2}
            isAnimationActive={false}
        />
        <Area 
            type="monotone" 
            dataKey="upload" 
            stroke="#10b981" 
            fillOpacity={1} 
            fill="url(#colorUp)" 
            strokeWidth={2}
            isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrafficChart;