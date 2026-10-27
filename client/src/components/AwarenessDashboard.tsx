import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Globe,
  Flame,
  ShieldAlert,
  Activity,
  Clock,
  ExternalLink,
  Server,
  TrendingUp,
  Lock,
  FileDown
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { ScrapedIntelItem } from '../types';

export const AwarenessDashboard: React.FC = () => {
  const [items, setItems] = useState<ScrapedIntelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
    const interval = setInterval(fetchItems, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/scraper/items');
      if (!res.ok) throw new Error('Failed to fetch from Scraper Server');
      const data = await res.json();
      setItems(data.items || []);
      setError(null);
    } catch (err: any) {
      setError('Cannot load live threat intelligence items.');
    } finally {
      setIsLoading(false);
    }
  };

  // KPIs
  const totalThreats = items.length;
  const criticalThreats = items.filter(i => i.severity === 'CRITICAL').length;
  const activeExploits = items.filter(i => i.isActivelyExploited).length;
  const ransomwareLinked = items.filter(i => i.ransomwareLinked).length;

  // Chart Data: Severity Breakdown
  const severityCount = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
  items.forEach(i => {
    if (severityCount[i.severity] !== undefined) {
      severityCount[i.severity]++;
    }
  });

  const severityData = [
    { name: 'CRITICAL', value: severityCount.CRITICAL, color: '#ef4444' }, // Red
    { name: 'HIGH', value: severityCount.HIGH, color: '#f97316' },       // Orange
    { name: 'MEDIUM', value: severityCount.MEDIUM, color: '#eab308' },   // Yellow
    { name: 'LOW', value: severityCount.LOW, color: '#3b82f6' }          // Blue
  ].filter(d => d.value > 0);

  // Top Actionable Threats (Recent 10)
  const topThreats = items.slice(0, 10);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Activity className="w-8 h-8 text-[#ff4d8b] animate-pulse" />
        <div className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff]">Loading Global Threat Intelligence...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4 text-center max-w-md mx-auto">
        <AlertTriangle className="w-10 h-10 text-[#ef4444]" />
        <div className="text-base font-semibold text-[#0a0a0a] dark:text-[#ffffff]">Connection Error</div>
        <p className="text-sm text-[#6a6a6a] dark:text-[#94a3b8]">{error}</p>
      </div>
    );
  }

  return (
    <div id="awareness-screen" className="space-y-6 pb-16 print:space-y-4 print:pb-0 print:m-0 print:p-0">
      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; width: 100%; margin: 0; padding: 0; }
            
            /* FORCE OVERRIDE APP.TSX LAYOUT */
            div[class*="lg:pl-64"] { padding-left: 0 !important; margin-left: 0 !important; }
            main { padding: 0 !important; margin: 0 !important; max-width: 100% !important; width: 100% !important; }
            
            /* Hide UI chrome */
            header, nav, aside, footer { display: none !important; }
            .print-hide { display: none !important; }
            
            /* Ensure grids don't collapse */
            .print-kpi-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 0.5rem !important; }
            .print-bottom-grid { display: grid !important; grid-template-columns: 1fr 2fr !important; gap: 1rem !important; }
            
            /* Page breaks */
            .print-break-inside-avoid { page-break-inside: avoid; break-inside: avoid; }
          }
        `}
      </style>

      {/* Executive Briefing Hero */}
      <div className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-6 shadow-xs relative overflow-hidden print:rounded-lg print:shadow-none print-break-inside-avoid print:p-0 print:bg-transparent print:text-black">
        <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10 print:gap-4 print:border-b print:border-slate-300 print:pb-4">
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ffffff]/10 border border-[#ffffff]/15 text-[#a4d4c5] text-xs font-semibold print:bg-slate-100 print:text-slate-800 print:border-slate-300">
                  <Globe className="w-3 h-3" />
                  <span>GLOBAL INTELLIGENCE BRIEF</span>
                </span>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ff4d8b]/20 border border-[#ff4d8b]/30 text-[#ffb084] text-xs font-semibold animate-pulse print:bg-red-50 print:text-red-700 print:border-red-200 print:animate-none">
                  <Activity className="w-3 h-3" />
                  <span>LIVE FEED</span>
                </span>
              </div>
              <button 
                onClick={() => window.print()}
                className="print-hide inline-flex items-center space-x-2 bg-[#ffffff] dark:bg-[#0c121e] hover:bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <FileDown className="w-3.5 h-3.5 text-[#ff4d8b]" />
                <span>Export PDF</span>
              </button>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#ffffff] font-display print:text-slate-900 print:text-2xl">
              Executive Threat Awareness
            </h1>
            <p className="text-sm text-[#a4d4c5] mt-2 leading-relaxed print:text-slate-700 print:text-xs">
              Based on continuous telemetry from global CERTs, CISA, and active incident response engagements, we are tracking <strong className="print:text-black">{activeExploits}</strong> actively weaponized campaigns. Ransomware affiliates and supply-chain compromises remain the primary attack vectors targeting enterprise infrastructure this week.
            </p>
          </div>
          <div className="bg-[#0a0a0a]/30 border border-[#ffffff]/10 rounded-[20px] p-4 lg:min-w-[280px] print:bg-slate-50 print:border-slate-200 print:text-slate-800">
             <h3 className="text-xs font-bold uppercase tracking-wider text-[#a4d4c5] mb-1.5 flex items-center gap-2 print:text-slate-900 print:text-[10px]">
               <ShieldAlert className="w-3.5 h-3.5 print:text-slate-700" /> Immediate Action Required
             </h3>
             <ul className="text-[12px] text-[#ffffff]/90 space-y-1 mt-2 list-disc list-inside print:text-slate-800 print:text-[10px]">
               <li>Audit edge firewalls for CISA KEV additions.</li>
               <li>Rotate privileged service credentials.</li>
               <li>Review vendor supply-chain exposure.</li>
             </ul>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print-kpi-grid print-break-inside-avoid">
        <div className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-6 shadow-xs flex flex-col justify-between print:rounded-lg print:p-4">
          <div className="flex items-center justify-between text-[#6a6a6a] dark:text-[#94a3b8] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Total Monitored</span>
            <Server className="w-4 h-4" />
          </div>
          <div className="text-3xl font-medium text-[#0a0a0a] dark:text-[#ffffff] font-display print:text-2xl">{totalThreats}</div>
          <div className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] mt-2">Active records</div>
        </div>

        <div className="bg-[#fff0f0] border border-[#ffcdd2] rounded-[24px] p-6 shadow-xs flex flex-col justify-between print:rounded-lg print:p-4">
          <div className="flex items-center justify-between text-[#ef4444] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Critical Severity</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-3xl font-medium text-[#ef4444] font-display print:text-2xl">{criticalThreats}</div>
          <div className="text-xs text-[#ef4444]/80 mt-2">CVSS 9.0+</div>
        </div>

        <div className="bg-[#fff8e1] border border-[#ffe082] rounded-[24px] p-6 shadow-xs flex flex-col justify-between print:rounded-lg print:p-4">
          <div className="flex items-center justify-between text-[#d97706] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Weaponized</span>
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-3xl font-medium text-[#d97706] font-display print:text-2xl">{activeExploits}</div>
          <div className="text-xs text-[#d97706]/80 mt-2">Exploited in wild</div>
        </div>

        <div className="bg-[#f3e5f5] border border-[#e1bee7] rounded-[24px] p-6 shadow-xs flex flex-col justify-between print:rounded-lg print:p-4">
          <div className="flex items-center justify-between text-[#8e24aa] mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold">Ransomware</span>
            <Lock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-medium text-[#8e24aa] font-display print:text-2xl">{ransomwareLinked}</div>
          <div className="text-xs text-[#8e24aa]/80 mt-2">Known campaigns</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print-bottom-grid">
        {/* Threat Distribution Chart */}
        <div className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-6 shadow-xs lg:col-span-1 flex flex-col print:rounded-lg print:shadow-none print-break-inside-avoid print:p-4">
          <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] mb-1">Threat Landscape Profile</h3>
          <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] mb-4">Distribution by CVSS severity categorization</p>
          
          <div className="w-full h-[220px] print:h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '12px' }}
                  itemStyle={{ color: '#0a0a0a', fontWeight: '600' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            {severityData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#0a0a0a] dark:text-[#ffffff]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>

        {/* Priority Action Radar */}
        <div className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-6 shadow-xs lg:col-span-2 flex flex-col print:rounded-lg print:shadow-none print-break-inside-avoid print:p-4">
           <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] mb-1 flex items-center gap-2 print:text-xs">
                <TrendingUp className="w-4 h-4 text-[#ef4444]" />
                Top Trending Threats
              </h3>
              <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] print:hidden">Prioritized list of the most critical recent intelligence</p>
            </div>
          </div>

          <div className="overflow-y-auto pr-2 space-y-3 flex-1 print:overflow-visible">
            {topThreats.slice(0, 5).map(threat => (
              <div key={threat.id} className="p-4 rounded-[16px] border border-[#e5e5e5] dark:border-[#1e293b] hover:bg-[#faf5e8] dark:bg-[#1e293b] transition-colors group print:rounded-md print:break-inside-avoid print:p-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 print:mb-1">
                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        threat.severity === 'CRITICAL' ? 'bg-[#fff0f0] text-[#ef4444] border-[#ffcdd2]' :
                        threat.severity === 'HIGH' ? 'bg-[#fff7ed] text-[#f97316] border-[#fed7aa]' :
                        'bg-[#fefce8] text-[#eab308] border-[#fef08a]'
                      } print:bg-transparent print:border-slate-300`}>
                        {threat.severity}
                      </span>
                      {threat.isActivelyExploited && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#ef4444] bg-[#ef4444]/10 px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3 animate-pulse" /> Exploited
                        </span>
                      )}
                      {threat.ransomwareLinked && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-[#8e24aa] bg-[#f3e5f5] px-2 py-0.5 rounded-full">
                          <Lock className="w-3 h-3" /> Ransomware
                        </span>
                      )}
                    </div>
                    <a 
                      href={threat.extractedUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] group-hover:text-[#1a3a3a] group-hover:underline flex items-center gap-1.5"
                    >
                      {threat.title}
                      <ExternalLink className="w-3 h-3 text-[#6a6a6a] dark:text-[#94a3b8]" />
                    </a>
                    <div className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] mt-1 flex items-center gap-2">
                      <span className="font-mono text-[#0a0a0a] dark:text-[#ffffff]">{threat.cveID}</span>
                      <span>•</span>
                      <span>Target: {threat.vendor} {threat.product}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" />
                      {threat.discoveredDate}
                    </span>
                    <span className="text-[10px] font-mono mt-1 text-[#0a0a0a] dark:text-[#ffffff] bg-[#e5e5e5]/50 px-1.5 py-0.5 rounded inline-block">
                      {threat.sourceName}
                    </span>
                  </div>
                </div>
                <p className="text-[12px] text-[#3a3a3a] mt-3 line-clamp-2">
                  {threat.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
