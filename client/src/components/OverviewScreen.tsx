import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  ChevronRight,
  Sparkles,
  Building2,
  Activity,
  CheckCircle2,
  Database
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useRisk } from '../hooks/useRisk';
import { ExposureResponse, RiskScenario } from '../types';
import { formatINR } from '../services/fairEngine';

interface OverviewScreenProps {
  data: ExposureResponse;
  onSelectScenario: (scenarioId: string) => void;
  onGoToOptimizer: () => void;
  onGoToFeed: () => void;
  forecastData?: any[];
  onOpenDataLineage: () => void;
  onOpenOrgConfig?: () => void;
}

export const OverviewScreen: React.FC<OverviewScreenProps> = ({
  data,
  onSelectScenario,
  onGoToOptimizer,
  onGoToFeed,
  forecastData = [],
  onOpenDataLineage,
  onOpenOrgConfig
}) => {
  const { setActiveTab } = useRisk();
  const totalLef = data.scenarios.reduce((sum, s) => sum + s.fair.lef, 0);
  const totalPrimaryLoss = data.scenarios.reduce((sum, s) => sum + s.fair.primaryLoss.totalINR, 0);
  const totalSecondaryLoss = data.scenarios.reduce((sum, s) => sum + s.fair.secondaryLoss.totalINR, 0);

  // Prepare chart data for Scenario comparison
  const scenarioBarData = data.scenarios.map((s) => ({
    name: s.id.toUpperCase(),
    title: s.title,
    primaryCrores: Number((s.fair.primaryLoss.totalINR / 10000000).toFixed(2)),
    secondaryCrores: Number((s.fair.secondaryLoss.totalINR / 10000000).toFixed(2)),
    annualRiskCrores: Number((s.fair.annualRiskINR / 10000000).toFixed(2)),
    riskFormatted: formatINR(s.fair.annualRiskINR)
  }));

  // Forecast chart data formatting
  const chartForecast = forecastData.map((f) => ({
    month: f.month,
    unmitigatedCr: Number((f.unmitigatedExposureINR / 10000000).toFixed(2)),
    mitigatedCr: Number((f.mitigatedExposureINR / 10000000).toFixed(2)),
    isHistorical: f.isHistorical
  }));

  return (
    <div id="overview-screen" className="space-y-8 pb-16">
      {/* Target Organization Customization Bar */}
      <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[16px] px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-[12px] bg-[#0a0a0a] flex items-center justify-center text-[#ffb084] shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-[#0a0a0a] text-sm tracking-tight">{data.organization.name}</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f5f0e0] text-[#0a0a0a] border border-[#e5e5e5] font-medium">
                {data.organization.industry}
              </span>
            </div>
            <div className="text-[12px] text-[#6a6a6a] mt-0.5 flex items-center flex-wrap gap-x-3 gap-y-1">
              <span>Annual Revenue: <strong className="text-[#0a0a0a] font-mono">{formatINR(data.organization.annualRevenueINR)}</strong></span>
              <span>•</span>
              <span>Compliance: <strong className="text-[#0a0a0a]">{data.organization.complianceFramework}</strong></span>
              <span>•</span>
              <span>Infra: <strong className="text-[#0a0a0a] font-mono">{data.organization.criticalDatabases}</strong> Core DBs, <strong className="text-[#0a0a0a] font-mono">{data.organization.cloudWorkloads}</strong> Workloads</span>
            </div>
          </div>
        </div>

        {onOpenOrgConfig && (
          <button
            onClick={onOpenOrgConfig}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[12px] text-[13px] font-semibold bg-[#ffffff] hover:bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5] transition-all shrink-0 active:scale-95 cursor-pointer shadow-xs"
            title="Configure ZK-PACE for your company or switch enterprise presets"
          >
            <Building2 className="w-3.5 h-3.5 text-[#ff4d8b]" />
            <span>Customize Company Profile</span>
          </button>
        )}
      </div>

      {/* Real Datasets & Historical Breaches Banner */}
      <div className="bg-[#ffffff] rounded-[24px] p-6 border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-[16px] bg-[#1a3a3a] flex items-center justify-center text-[#ffb084] shrink-0 shadow-xs">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-[#0a0a0a] font-display">
                Powered by 1,902 Real Historical Breaches & CISA KEV
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ff4d8b]/15 text-[#ff4d8b]">
                Empirical Ground Truth
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1a3a3a] text-[#ffffff]">
                $142.8B Tracked Losses
              </span>
            </div>
            <p className="text-xs text-[#6a6a6a] mt-1 leading-relaxed">
              Every financial risk figure is calibrated against verified enterprise incident losses from <code className="bg-[#faf5e8] px-1 py-0.5 rounded font-mono">Financial Data Set.csv</code>, 1,709 active CISA KEV vulnerabilities, and 2,000 scored NVD CVE records.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('real-data')}
            className="px-4 py-2 rounded-full text-xs font-semibold bg-[#1a3a3a] text-[#ffffff] hover:bg-[#2b5a5a] transition-all cursor-pointer shadow-xs flex items-center space-x-2 whitespace-nowrap"
          >
            <span>Explore 1,902 Breaches</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#ffb084]" />
          </button>
        </div>
      </div>

      {/* Hero 4 Saturated Feature Cards Grid (Clay signature style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Featured Deep Teal Card - Total Loss Exposure */}
        <div id="card-total-exposure" className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-7 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#a0a0a0] mb-2">
              <span className="font-semibold uppercase tracking-[1.5px] text-[#a4d4c5]">Total Loss Exposure</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ffffff]/10 text-[#ffffff] border border-[#ffffff]/20">
                FAIR Model
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-medium tracking-[-0.04em] text-[#ffffff] font-display mt-2">
              {data.formattedTotalINR}
            </div>
            <p className="text-[13px] text-[#a4d4c5] mt-2 leading-relaxed">
              Annualized financial risk across {data.totalScenarios} active threat scenarios.
            </p>
          </div>

          {/* Embedded mini UI fragment */}
          <div className="mt-5 pt-4 border-t border-[#ffffff]/15 flex items-center justify-between text-[12px]">
            <button
              onClick={onOpenDataLineage}
              className="text-[#a4d4c5] hover:text-[#ffffff] transition-colors flex items-center space-x-1 cursor-pointer font-medium"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Audit FAIR Math</span>
            </button>
            <button
              onClick={onGoToOptimizer}
              className="text-[#ffffff] hover:text-[#ffb084] font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Reduce Risk</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Warm Peach Card - Annual Breach Events */}
        <div id="card-annual-frequency" className="bg-[#ffb084] text-[#0a0a0a] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#0a0a0a]/70 mb-2">
              <span className="font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">Breach Events</span>
              <Zap className="w-4 h-4 text-[#0a0a0a]" />
            </div>
            <div className="text-3xl sm:text-4xl font-medium tracking-[-0.04em] text-[#0a0a0a] font-display mt-2">
              {totalLef.toFixed(2)} <span className="text-sm font-normal text-[#0a0a0a]/70">/ year</span>
            </div>
            <p className="text-[13px] text-[#0a0a0a]/80 mt-2 leading-relaxed">
              Aggregate Loss Event Frequency (LEF = TEF × Vulnerability).
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#0a0a0a]/15 text-[12px] flex items-center justify-between">
            <span className="font-medium text-[#0a0a0a]/80">Live Telemetry Calibrated</span>
            <span className="px-2 py-0.5 rounded-full bg-[#0a0a0a]/10 text-[#0a0a0a] text-[10px] font-semibold">
              High Probability
            </span>
          </div>
        </div>

        {/* Card 3: Hot Pink Card - CISA KEV Exploitations */}
        <div id="card-cisa-alerts" className="bg-[#ff4d8b] text-[#ffffff] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#ffffff]/80 mb-2">
              <span className="font-semibold uppercase tracking-[1.5px] text-[#ffffff]">Weaponized CVEs</span>
              <Flame className="w-4 h-4 text-[#ffffff]" />
            </div>
            <div className="text-3xl sm:text-4xl font-medium tracking-[-0.04em] text-[#ffffff] font-display mt-2">
              {data.activeExploitedCount} <span className="text-sm font-normal text-[#ffffff]/80">Active</span>
            </div>
            <p className="text-[13px] text-[#ffffff]/90 mt-2 leading-relaxed">
              Vulnerabilities under active weaponized exploitation in the wild.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#ffffff]/20 text-[12px] flex items-center justify-between">
            <span className="text-[#ffffff]/80">BOD 22-01 Catalogs</span>
            <button
              onClick={onGoToFeed}
              className="text-[#ffffff] hover:underline font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>View Feed</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Ochre Card - Mitigation Capacity */}
        <div id="card-optimizer-teaser" className="bg-[#e8b94a] text-[#0a0a0a] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[11px] text-[#0a0a0a]/70 mb-2">
              <span className="font-semibold uppercase tracking-[1.5px] text-[#0a0a0a]">Mitigation ROI</span>
              <ShieldCheck className="w-4 h-4 text-[#0a0a0a]" />
            </div>
            <div className="text-3xl sm:text-4xl font-medium tracking-[-0.04em] text-[#0a0a0a] font-display mt-2">
              Up to 65%
            </div>
            <p className="text-[13px] text-[#0a0a0a]/80 mt-2 leading-relaxed">
              Risk reduction achievable via 0-1 Knapsack security optimization.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-[#0a0a0a]/15 text-[12px] flex items-center justify-between">
            <span className="text-[#0a0a0a]/80 font-medium">6 Candidate Controls</span>
            <button
              onClick={onGoToOptimizer}
              className="text-[#0a0a0a] hover:underline font-semibold inline-flex items-center space-x-1 cursor-pointer"
            >
              <span>Solve Knapsack</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Risk Scenarios Breakdown Grid (Clay Multi-Color Card Palette) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-[#0a0a0a] flex items-center space-x-2 font-display">
              <span>Risk Scenarios Breakdown</span>
            </h2>
            <p className="text-xs text-[#6a6a6a] mt-0.5">
              Click any scenario to audit FAIR mathematical parameters, Monte Carlo curves, and mitigation controls.
            </p>
          </div>
          <span className="text-xs text-[#6a6a6a] font-medium bg-[#faf5e8] px-3 py-1 rounded-full border border-[#e5e5e5]">
            4 Evaluated Scenarios
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.scenarios.map((scenario, index) => {
            const isActivelyExploited = scenario.activelyExploitedInWild;
            const fair = scenario.fair;

            // Cycle colors for accent cards: Lavender, Peach, Mint, Ochre
            const accentBg =
              index === 0
                ? 'border-l-4 border-l-[#ff4d8b]'
                : index === 1
                ? 'border-l-4 border-l-[#1a3a3a]'
                : index === 2
                ? 'border-l-4 border-l-[#b8a4ed]'
                : 'border-l-4 border-l-[#e8b94a]';

            const badgeBg =
              index === 0
                ? 'bg-[#ff4d8b]/10 text-[#ff4d8b]'
                : index === 1
                ? 'bg-[#1a3a3a]/10 text-[#1a3a3a]'
                : index === 2
                ? 'bg-[#b8a4ed]/25 text-[#1a1a1a]'
                : 'bg-[#e8b94a]/25 text-[#1a1a1a]';

            return (
              <div
                key={scenario.id}
                id={`scenario-card-${scenario.id}`}
                onClick={() => onSelectScenario(scenario.id)}
                className={`group bg-[#ffffff] hover:bg-[#faf5e8] border border-[#e5e5e5] rounded-[20px] p-6 cursor-pointer transition-all duration-200 shadow-xs relative flex flex-col justify-between ${accentBg}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${badgeBg}`}>
                        {scenario.category}
                      </span>
                      <span className="text-[11px] font-mono text-[#6a6a6a] uppercase">
                        {scenario.id}
                      </span>
                    </div>

                    {isActivelyExploited && (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 px-2.5 py-0.5 rounded-full">
                        <Flame className="w-3 h-3 text-[#ef4444] animate-pulse" />
                        <span>Exploited in Wild</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-[#0a0a0a] mt-3 group-hover:text-[#ff4d8b] transition-colors leading-snug">
                    {scenario.title}
                  </h3>

                  <p className="text-[13px] text-[#3a3a3a] mt-2 line-clamp-2 leading-relaxed font-normal">
                    {scenario.description}
                  </p>

                  <div className="mt-3 text-[12px] text-[#6a6a6a] bg-[#faf5e8] px-3 py-1.5 rounded-[10px] border border-[#e5e5e5] flex items-center justify-between">
                    <span>Target: <strong className="text-[#0a0a0a] font-medium">{scenario.targetedAsset}</strong></span>
                    <span className="text-[11px] font-mono text-[#6a6a6a]">{scenario.mitigationControlIds.length} controls</span>
                  </div>
                </div>

                {/* Embedded Mini FAIR Metrics Table */}
                <div className="mt-4 pt-3 border-t border-[#e5e5e5]">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#faf5e8] p-2.5 rounded-[12px] border border-[#e5e5e5]">
                      <span className="text-[10px] text-[#6a6a6a] block uppercase font-medium">LEF (Freq)</span>
                      <span className="text-xs font-semibold text-[#0a0a0a] font-mono">
                        {fair.lef.toFixed(2)}/yr
                      </span>
                    </div>
                    <div className="bg-[#faf5e8] p-2.5 rounded-[12px] border border-[#e5e5e5]">
                      <span className="text-[10px] text-[#6a6a6a] block uppercase font-medium">Loss Mag (LM)</span>
                      <span className="text-xs font-semibold text-[#0a0a0a] font-mono">
                        {formatINR(fair.lossMagnitudeINR)}
                      </span>
                    </div>
                    <div className="bg-[#ff4d8b]/10 p-2.5 rounded-[12px] border border-[#ff4d8b]/20">
                      <span className="text-[10px] text-[#ff4d8b] block uppercase font-bold">Annual Risk</span>
                      <span className="text-xs font-bold text-[#ff4d8b] font-mono">
                        {formatINR(fair.annualRiskINR)}
                      </span>
                    </div>
                  </div>

                  {/* Formula Proof Pill */}
                  <div className="mt-2.5 px-3 py-1.5 rounded-[10px] bg-[#fffaf0] border border-[#e5e5e5] text-[11px] font-mono text-[#6a6a6a] flex items-center justify-between">
                    <span>Formula:</span>
                    <span className="text-[#0a0a0a] font-semibold">
                      {fair.lef.toFixed(2)} × {formatINR(fair.lossMagnitudeINR)} = {formatINR(fair.annualRiskINR)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[12px] text-[#6a6a6a] group-hover:text-[#0a0a0a] transition-colors">
                    <span className="font-medium">Inspect Lineage & Monte Carlo curves →</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-[#ff4d8b]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics: FAIR Loss Composition & 12-Month Predictive Exposure */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Loss Magnitude Breakdown (Primary vs Secondary) */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
                <Layers className="w-4 h-4 text-[#1a3a3a]" />
                <span>Primary vs. Secondary Loss Magnitude</span>
              </h3>
              <p className="text-xs text-[#6a6a6a] mt-0.5">
                Direct incident response costs vs statutory fines (DPDP/RBI) and reputational churn (₹ Crores)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6a6a6a" fontSize={11} tickLine={false} />
                <YAxis stroke="#6a6a6a" fontSize={11} tickLine={false} unit=" Cr" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e5e5',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0a0a0a',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                  formatter={(value: any, name: any) => [
                    `₹${value} Cr`,
                    name === 'primaryCrores' ? 'Primary Direct Loss' : 'Secondary Fines & Churn'
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => (value === 'primaryCrores' ? 'Primary Loss' : 'Secondary Loss')}
                />
                <Bar dataKey="primaryCrores" fill="#1a3a3a" radius={[6, 6, 0, 0]} name="primaryCrores" />
                <Bar dataKey="secondaryCrores" fill="#ff4d8b" radius={[6, 6, 0, 0]} name="secondaryCrores" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-xs text-[#6a6a6a] flex items-center justify-between">
            <span>Total Direct Primary: <strong className="text-[#0a0a0a] font-mono">{formatINR(totalPrimaryLoss)}</strong></span>
            <span>Total Secondary: <strong className="text-[#0a0a0a] font-mono">{formatINR(totalSecondaryLoss)}</strong></span>
          </div>
        </div>

        {/* Right: 12-Month Predictive Exposure Forecast (Unmitigated vs Mitigated) */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#ff4d8b]" />
                <span>12-Month Annual Loss Exposure Trajectory</span>
              </h3>
              <p className="text-xs text-[#6a6a6a] mt-0.5">
                Baseline exposure trend vs projected exposure post-Knapsack control allocation (₹ Crores)
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="unmitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d8b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ff4d8b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="mitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1a3a3a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1a3a3a" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#6a6a6a" fontSize={11} tickLine={false} />
                <YAxis stroke="#6a6a6a" fontSize={11} tickLine={false} unit=" Cr" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e5e5',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0a0a0a',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
                  }}
                  formatter={(value: any, name: any) => [
                    `₹${value} Cr`,
                    name === 'unmitigatedCr' ? 'Baseline Unmitigated' : 'Post-Mitigation Trajectory'
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => (value === 'unmitigatedCr' ? 'Baseline Exposure' : 'Mitigated Exposure')}
                />
                <Area
                  type="monotone"
                  dataKey="unmitigatedCr"
                  stroke="#ff4d8b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#unmitigatedGrad)"
                  name="unmitigatedCr"
                />
                <Area
                  type="monotone"
                  dataKey="mitigatedCr"
                  stroke="#1a3a3a"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#mitigatedGrad)"
                  name="mitigatedCr"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-[#e5e5e5] text-xs text-[#6a6a6a] flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#1a3a3a]" />
              <span>Projected Savings: <strong className="text-[#0a0a0a] font-mono">₹4.80 Cr+</strong></span>
            </span>
            <button
              onClick={onGoToOptimizer}
              className="text-[#0a0a0a] font-semibold hover:text-[#ff4d8b] cursor-pointer flex items-center space-x-1"
            >
              <span>Explore Budget Optimizer →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
