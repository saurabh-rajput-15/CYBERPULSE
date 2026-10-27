import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  TrendingDown,
  DollarSign,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  FileText,
  Clock,
  Layers,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { RecommendationResult, CandidateControl, RiskScenario } from '../types';
import { formatINR, computeALERange } from '../services/fairEngine';

interface BudgetRecommendationScreenProps {
  currentRecommendation: RecommendationResult | null;
  isLoading: boolean;
  onBudgetChange: (budgetINR: number) => void;
  scenarios: RiskScenario[];
  onOpenBoardBrief: () => void;
}

export const BudgetRecommendationScreen: React.FC<BudgetRecommendationScreenProps> = ({
  currentRecommendation,
  isLoading,
  onBudgetChange,
  scenarios,
  onOpenBoardBrief
}) => {
  const [sliderValue, setSliderValue] = useState<number>(
    currentRecommendation ? currentRecommendation.budgetINR : 2500000
  );

  // Sync slider if currentRecommendation changes externally
  useEffect(() => {
    if (currentRecommendation && currentRecommendation.budgetINR !== sliderValue) {
      setSliderValue(currentRecommendation.budgetINR);
    }
  }, [currentRecommendation?.budgetINR]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setSliderValue(val);
    onBudgetChange(val);
  };

  const handlePresetSelect = (amount: number) => {
    setSliderValue(amount);
    onBudgetChange(amount);
  };

  const rec = currentRecommendation;

  // Compute P10/P50/P90 ranges for baseline and post-mitigation
  const baselineRange = rec ? computeALERange(rec.baselineExposureINR) : null;
  const residualRange = rec ? computeALERange(rec.postMitigationExposureINR) : null;

  // Chart data: Baseline vs Residual
  const comparisonData = rec
    ? [
        {
          name: 'Baseline Loss',
          amountCr: Number((rec.baselineExposureINR / 10000000).toFixed(2)),
          color: '#ff4d8b'
        },
        {
          name: 'Residual Risk',
          amountCr: Number((rec.postMitigationExposureINR / 10000000).toFixed(2)),
          color: '#1a3a3a'
        }
      ]
    : [];

  return (
    <div id="budget-recommendation-screen" className="space-y-8 pb-16">
      {/* Screen Title & High-Leverage Header (Clay Deep Teal Card) */}
      <div className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ffffff]/10 border border-[#ffffff]/15 text-[#a4d4c5] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-[#ffb084]" />
                <span>0-1 KNAPSACK MATHEMATICAL SOLVER</span>
              </span>
              <span className="text-xs text-[#a4d4c5] font-mono">
                Constrained Integer Optimization
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#ffffff] mt-3 font-display">
              Security Capital & Budget Optimizer
            </h1>
            <p className="text-sm text-[#a4d4c5] mt-2 leading-relaxed">
              Designate your budget ceiling. The mathematical solver evaluates all candidate combinations to identify the exact portfolio of controls that maximizes financial risk reduction per rupee spent.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              id="btn-export-board-brief"
              onClick={onOpenBoardBrief}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#ffffff] dark:bg-[#0c121e] hover:bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] text-xs font-semibold rounded-[12px] shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-[#ff4d8b]" />
              <span>Export Board Brief</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Budget Slider Control Panel */}
      <div className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-8 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-[#1a3a3a]" />
            <span className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] uppercase tracking-wider">
              Allocated Security Budget Ceiling
            </span>
          </div>
          <div className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] font-display">
            {formatINR(sliderValue, false)}
            <span className="text-xs font-normal text-[#6a6a6a] dark:text-[#94a3b8] ml-2">
              ({formatINR(sliderValue, true)})
            </span>
          </div>
        </div>

        {/* The Slider */}
        <div className="py-2">
          <input
            id="slider-budget-input"
            type="range"
            min="500000" // 5 Lakhs
            max="7500000" // 75 Lakhs
            step="250000" // 2.5 Lakhs increments
            value={sliderValue}
            onChange={handleSliderChange}
            className="w-full h-2.5 bg-[#faf5e8] dark:bg-[#1e293b] rounded-lg appearance-none cursor-pointer accent-[#0a0a0a]"
          />
          <div className="flex justify-between text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono mt-2 font-medium">
            <span>Min: ₹5.00 L</span>
            <span>₹25.00 L</span>
            <span>₹50.00 L</span>
            <span>Max: ₹75.00 L</span>
          </div>
        </div>

        {/* Quick Demo Preset Buttons (Clay pill buttons) */}
        <div className="mt-4 pt-4 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between flex-wrap gap-3 text-xs">
          <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-semibold">Optimization Presets:</span>
          <div className="flex items-center space-x-2 flex-wrap gap-1.5">
            <button
              onClick={() => handlePresetSelect(1000000)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                sliderValue === 1000000
                  ? 'bg-[#0a0a0a] text-[#ffffff] font-bold shadow-xs'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#f5f0e0] dark:bg-[#2a374a] border border-[#e5e5e5] dark:border-[#1e293b]'
              }`}
            >
              Lean (₹10L)
            </button>
            <button
              onClick={() => handlePresetSelect(2500000)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                sliderValue === 2500000
                  ? 'bg-[#0a0a0a] text-[#ffffff] font-bold shadow-xs'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#f5f0e0] dark:bg-[#2a374a] border border-[#e5e5e5] dark:border-[#1e293b]'
              }`}
            >
              Recommended (₹25L)
            </button>
            <button
              onClick={() => handlePresetSelect(4500000)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                sliderValue === 4500000
                  ? 'bg-[#0a0a0a] text-[#ffffff] font-bold shadow-xs'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#f5f0e0] dark:bg-[#2a374a] border border-[#e5e5e5] dark:border-[#1e293b]'
              }`}
            >
              Comprehensive (₹45L)
            </button>
            <button
              onClick={() => handlePresetSelect(7000000)}
              className={`px-4 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                sliderValue === 7000000
                  ? 'bg-[#0a0a0a] text-[#ffffff] font-bold shadow-xs'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#f5f0e0] dark:bg-[#2a374a] border border-[#e5e5e5] dark:border-[#1e293b]'
              }`}
            >
              Max Defense (₹70L)
            </button>
          </div>
        </div>
      </div>

      {/* Solver Metric Outcomes Cards (Clay Saturated Cards Palette) */}
      {rec && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Saturated Deep Teal - Allocated Spend */}
          <div className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[1.5px] font-semibold text-[#a4d4c5] flex items-center justify-between">
                <span>Optimized Spend</span>
                <DollarSign className="w-4 h-4 text-[#ffffff]" />
              </div>
              <div className="text-3xl font-medium tracking-tight text-[#ffffff] font-display mt-2">
                {formatINR(rec.allocatedBudgetINR)}
              </div>
              <p className="text-[13px] text-[#a4d4c5] mt-1.5">
                Buffer: <strong className="text-[#ffffff] font-mono">{formatINR(rec.unspentBudgetINR)}</strong>
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#ffffff]/15 text-[12px] text-[#a4d4c5]">
              {rec.selectedControls.length} of 6 Controls Funded
            </div>
          </div>

          {/* Card 2: Hot Pink - Loss Reduced */}
          <div className="bg-[#ff4d8b] text-[#ffffff] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[1.5px] font-semibold text-[#ffffff]/80 flex items-center justify-between">
                <span>Loss Reduced</span>
                <TrendingDown className="w-4 h-4 text-[#ffffff]" />
              </div>
              <div className="text-3xl font-medium tracking-tight text-[#ffffff] font-display mt-2">
                {formatINR(rec.totalRiskReductionINR)}
              </div>
              <p className="text-[13px] text-[#ffffff]/90 mt-1.5">
                {(
                  (rec.totalRiskReductionINR / rec.baselineExposureINR) *
                  100
                ).toFixed(1)}% of exposure eliminated
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#ffffff]/20 text-[12px] text-[#ffffff]/80">
              Gross expected loss avoided
            </div>
          </div>

          {/* Card 3: Peach - Residual Exposure */}
          <div className="bg-[#ffb084] text-[#0a0a0a] dark:text-[#ffffff] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[1.5px] font-semibold text-[#0a0a0a]/70 flex items-center justify-between">
                <span>Residual Exposure</span>
                <ShieldCheck className="w-4 h-4 text-[#0a0a0a] dark:text-[#ffffff]" />
              </div>
              {/* P50 headline */}
              <div className="text-3xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] font-display mt-2">
                {formatINR(rec.postMitigationExposureINR)}
              </div>
              <div className="text-[11px] text-[#0a0a0a]/70 mt-0.5">P50 Median</div>
              {/* P10–P90 range */}
              {residualRange && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-center">
                    <div className="text-[9px] text-[#1a5c1a] font-bold">P10</div>
                    <div className="text-[11px] font-mono font-semibold text-[#1a5c1a]">{formatINR(residualRange.p10INR)}</div>
                  </div>
                  <div className="flex-1 h-1 rounded-full bg-[#0a0a0a]/20" />
                  <div className="text-center">
                    <div className="text-[9px] text-[#8b3c00] font-bold">P90</div>
                    <div className="text-[11px] font-mono font-semibold text-[#8b3c00]">{formatINR(residualRange.p90INR)}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 pt-3 border-t border-[#0a0a0a]/15 text-[12px] text-[#0a0a0a]/80">
              Retained annualized exposure range
            </div>
          </div>

          {/* Card 4: Ochre - Security ROI */}
          <div className="bg-[#e8b94a] text-[#0a0a0a] dark:text-[#ffffff] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[1.5px] font-semibold text-[#0a0a0a]/70 flex items-center justify-between">
                <span>Security ROI</span>
                <Sparkles className="w-4 h-4 text-[#0a0a0a] dark:text-[#ffffff]" />
              </div>
              <div className="text-3xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] font-display mt-2">
                {rec.roiMultiplier}x
              </div>
              <p className="text-[13px] text-[#0a0a0a]/80 mt-1.5">
                Net gain: {formatINR(rec.netBenefitINR)}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#0a0a0a]/15 text-[12px] text-[#0a0a0a]/80 font-mono">
              (Risk Reduction - Cost) / Cost
            </div>
          </div>
        </div>
      )}

      {/* Visual Comparison: Baseline vs Residual Exposure & Narrative */}
      {rec && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Card */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-semibold text-[#0a0a0a] dark:text-[#ffffff] mb-1">
                Exposure Reduction Comparison
              </h3>
              <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] mb-4">
                Financial loss exposure before vs after portfolio deployment (₹ Crores)
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                      formatter={(value: any) => [`₹${value} Cr`, 'Financial Exposure']}
                    />
                    <Bar dataKey="amountCr" radius={[6, 6, 0, 0]}>
                      {comparisonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-[#0a0a0a] dark:text-[#ffffff] font-semibold bg-[#faf5e8] dark:bg-[#1e293b] p-3 rounded-[12px] border border-[#e5e5e5] dark:border-[#1e293b]">
              Net Financial Protection: {formatINR(rec.totalRiskReductionINR)}
            </div>
          </div>

          {/* Solver Explanation & Executive Narrative */}
          <div className="lg:col-span-2 bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-7 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1a3a3a]" />
                <h3 className="text-base font-semibold text-[#0a0a0a] dark:text-[#ffffff] uppercase tracking-wider">
                  Knapsack Solver Execution Summary
                </h3>
              </div>
              <p className="text-xs text-[#3a3a3a] mt-3 leading-relaxed">
                With a designated budget ceiling of <strong className="text-[#0a0a0a] dark:text-[#ffffff]">{formatINR(rec.budgetINR)}</strong>, the knapsack optimizer selected <strong className="text-[#0a0a0a] dark:text-[#ffffff]">{rec.selectedControls.length} controls</strong> totaling <strong className="text-[#0a0a0a] dark:text-[#ffffff]">{formatINR(rec.allocatedBudgetINR)}</strong>, retaining an unspent buffer of <strong className="text-[#6a6a6a] dark:text-[#94a3b8]">{formatINR(rec.unspentBudgetINR)}</strong>.
              </p>
              <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] mt-2.5 leading-relaxed">
                This configuration mathematically prioritizes the highest marginal risk reduction per rupee invested, shrinking total company risk exposure from <strong className="text-[#ff4d8b]">{formatINR(rec.baselineExposureINR)}</strong> down to <strong className="text-[#1a3a3a]">{formatINR(rec.postMitigationExposureINR)}</strong> — delivering a defensible <strong className="text-[#0a0a0a] dark:text-[#ffffff]">{rec.roiMultiplier}x ROI</strong>.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between text-xs">
              <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-mono text-[11px]">Solver state: Optimal global solution found</span>
              <button
                onClick={onOpenBoardBrief}
                className="text-[#0a0a0a] dark:text-[#ffffff] hover:text-[#ff4d8b] font-semibold inline-flex items-center space-x-1 cursor-pointer"
              >
                <span>Preview Board of Directors Slides</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ranked Controls Breakdown: Funded vs Deferred */}
      {rec && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] flex items-center space-x-2 font-display">
              <span>Portfolio Allocation Breakdown</span>
            </h2>
            <span className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] font-medium bg-[#faf5e8] dark:bg-[#1e293b] px-3 py-1 rounded-full border border-[#e5e5e5] dark:border-[#1e293b]">
              {rec.selectedControls.length} Funded, {rec.deferredControls.length} Deferred
            </span>
          </div>

          {/* Funded Controls */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a3a3a] flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#1a3a3a]" />
              <span>Funded Candidate Controls ({rec.selectedControls.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rec.selectedControls.map((ctrl) => (
                <div
                  key={ctrl.id}
                  className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] hover:border-[#1a3a3a] rounded-[20px] p-6 shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#1a3a3a] bg-[#1a3a3a]/10 px-2.5 py-0.5 rounded-full">
                          {ctrl.code}
                        </span>
                        <span className="text-[10px] font-semibold uppercase text-[#6a6a6a] dark:text-[#94a3b8]">
                          {ctrl.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] mt-2">{ctrl.name}</h4>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#0a0a0a] dark:text-[#ffffff] block">
                        {formatINR(ctrl.annualCostINR)}/yr
                      </span>
                      <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                        {ctrl.implementationTimeDays} days deploy
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#3a3a3a]">{ctrl.description}</p>

                  <div className="text-xs bg-[#faf5e8] dark:bg-[#1e293b] p-3 rounded-[12px] border border-[#e5e5e5] dark:border-[#1e293b] text-[#3a3a3a]">
                    <span className="text-[10px] text-[#0a0a0a] dark:text-[#ffffff] uppercase font-bold block mb-0.5">
                      Optimization Rationale:
                    </span>
                    {ctrl.justification}
                  </div>

                  <div className="pt-2 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>Target Scenarios: <strong className="text-[#0a0a0a] dark:text-[#ffffff]">{ctrl.targetScenarioIds.join(', ').toUpperCase()}</strong></span>
                    <span className="text-[#1a3a3a] font-semibold font-mono">
                      -{(ctrl.effectivenessPercent * 100).toFixed(0)}% Risk
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deferred Controls */}
          {rec.deferredControls.length > 0 && (
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6a6a6a] dark:text-[#94a3b8] flex items-center space-x-1.5">
                <XCircle className="w-4 h-4 text-[#9a9a9a]" />
                <span>Deferred Candidate Controls ({rec.deferredControls.length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rec.deferredControls.map((ctrl) => (
                  <div
                    key={ctrl.id}
                    className="bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[20px] p-6 shadow-xs space-y-3 opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#6a6a6a] dark:text-[#94a3b8] bg-[#ffffff] dark:bg-[#0c121e] px-2.5 py-0.5 rounded-full border border-[#e5e5e5] dark:border-[#1e293b]">
                            {ctrl.code}
                          </span>
                          <span className="text-[10px] font-semibold uppercase text-[#6a6a6a] dark:text-[#94a3b8]">
                            {ctrl.category}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] mt-2">{ctrl.name}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono font-semibold text-[#0a0a0a] dark:text-[#ffffff] block">
                          {formatINR(ctrl.annualCostINR)}/yr
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8]">{ctrl.description}</p>

                    <div className="text-xs bg-[#ffffff] dark:bg-[#0c121e] p-3 rounded-[12px] border border-[#e5e5e5] dark:border-[#1e293b] text-[#6a6a6a] dark:text-[#94a3b8]">
                      <span className="text-[10px] text-[#0a0a0a] dark:text-[#ffffff] uppercase font-bold block mb-0.5">
                        Solver Deferral Justification:
                      </span>
                      {ctrl.reasonDeferred}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
