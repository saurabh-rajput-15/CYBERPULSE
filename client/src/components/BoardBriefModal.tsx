import React, { useState } from 'react';
import { X, Copy, Check, Printer, Building2, Shield, DollarSign, Layers } from 'lucide-react';
import { ExposureResponse, RecommendationResult } from '../types';
import { formatINR } from '../services/fairEngine';

interface BoardBriefModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ExposureResponse;
  recommendation: RecommendationResult | null;
}

export const BoardBriefModal: React.FC<BoardBriefModalProps> = ({
  isOpen,
  onClose,
  data,
  recommendation
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyText = () => {
    const text = `
CYBERPULSE EXECUTIVE RISK BRIEF & BOARD MEMORANDUM
Organization: ${data.organization.name}
Industry: ${data.organization.industry}
Regulatory Standards: ${data.organization.complianceFramework}
Date: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}

1. FINANCIAL RISK SUMMARY
Current Annualized Loss Exposure (ALE): ${data.formattedTotalINR}
Annual Expected Breach Frequency: ${(data.scenarios.reduce((acc, s) => acc + s.fair.lef, 0)).toFixed(2)} events/year
Active Weaponized Exploitations in Wild: ${data.activeExploitedCount} of ${data.totalScenarios} scenarios

2. SCENARIO RISK BREAKDOWN:
${data.scenarios
  .map(
    (s) =>
      `• ${s.title} (${s.category})
   - Expected Loss: ${formatINR(s.fair.annualRiskINR)}
   - Single-event Severity: ${formatINR(s.fair.lossMagnitudeINR)} (Primary: ${formatINR(
        s.fair.primaryLoss.totalINR
      )}, Regulatory/Secondary: ${formatINR(s.fair.secondaryLoss.totalINR)})
   - Weaponized in CISA KEV: ${s.activelyExploitedInWild ? 'YES' : 'NO'}`
  )
  .join('\n')}

3. SECURITY BUDGET OPTIMIZATION (0-1 KNAPSACK SOLVER):
Allocated Budget Ceiling: ${recommendation ? formatINR(recommendation.budgetINR) : 'N/A'}
Optimized Spend: ${recommendation ? formatINR(recommendation.allocatedBudgetINR) : 'N/A'}
Expected Loss Eliminated: ${recommendation ? formatINR(recommendation.totalRiskReductionINR) : 'N/A'}
Post-Mitigation Residual Exposure: ${recommendation ? formatINR(recommendation.postMitigationExposureINR) : 'N/A'}
Estimated Net Security ROI: ${recommendation ? `${recommendation.roiMultiplier}x` : 'N/A'}

Funded Controls:
${
  recommendation?.selectedControls
    .map((c) => `• [${c.code}] ${c.name} (${formatINR(c.annualCostINR)}/yr) - ${c.justification}`)
    .join('\n') || 'None'
}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e5e5e5] bg-[#faf5e8] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0a0a0a] flex items-center justify-center text-[#ffb084]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0a0a0a] font-display">Executive Cyber Risk Brief (Board of Directors)</h2>
              <p className="text-xs text-[#6a6a6a]">Financial loss exposure, CISA threat activity, and budget ROI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#3a3a3a]">
          {/* Org meta card */}
          <div className="bg-[#faf5e8] p-4 rounded-[16px] border border-[#e5e5e5] flex flex-wrap justify-between gap-3">
            <div>
              <span className="text-[#6a6a6a] block">Target Organization:</span>
              <strong className="text-[#0a0a0a] text-sm">{data.organization.name}</strong>
            </div>
            <div>
              <span className="text-[#6a6a6a] block">Compliance Standard:</span>
              <strong className="text-[#0a0a0a]">{data.organization.complianceFramework}</strong>
            </div>
            <div>
              <span className="text-[#6a6a6a] block">Methodology:</span>
              <strong className="text-[#1a3a3a] font-mono">Open FAIR™ Standard (ISO 27005)</strong>
            </div>
          </div>

          {/* Section 1: Financial Loss Exposure */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a0a0a] mb-2.5">
              1. Current Financial Loss Exposure
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-[#faf5e8] rounded-[14px] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#6a6a6a] uppercase font-medium block">Total Annual Exposure</span>
                <span className="text-xl font-bold text-[#ff4d8b] font-mono mt-1 block">
                  {data.formattedTotalINR}
                </span>
              </div>
              <div className="p-4 bg-[#faf5e8] rounded-[14px] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#6a6a6a] uppercase font-medium block">Expected Loss Frequency</span>
                <span className="text-xl font-bold text-[#0a0a0a] font-mono mt-1 block">
                  {(data.scenarios.reduce((acc, s) => acc + s.fair.lef, 0)).toFixed(2)}/yr
                </span>
              </div>
              <div className="p-4 bg-[#faf5e8] rounded-[14px] border border-[#e5e5e5]">
                <span className="text-[10px] text-[#6a6a6a] uppercase font-medium block">CISA Weaponized</span>
                <span className="text-xl font-bold text-[#0a0a0a] font-mono mt-1 block">
                  {data.activeExploitedCount} Active
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Recommended Security Budget Allocation */}
          {recommendation && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a0a0a] mb-2.5">
                2. Recommended Security Budget Allocation (Knapsack Solver Optimal)
              </h3>
              <div className="p-5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] space-y-3">
                <div className="flex items-center justify-between text-[#3a3a3a]">
                  <span>Proposed Security Investment:</span>
                  <strong className="font-mono text-[#0a0a0a] text-sm">{formatINR(recommendation.allocatedBudgetINR)}</strong>
                </div>
                <div className="flex items-center justify-between text-[#3a3a3a]">
                  <span>Expected Annual Risk Reduction:</span>
                  <strong className="font-mono text-[#1a3a3a] text-sm">{formatINR(recommendation.totalRiskReductionINR)}</strong>
                </div>
                <div className="flex items-center justify-between text-[#3a3a3a]">
                  <span>Residual Financial Exposure:</span>
                  <strong className="font-mono text-[#0a0a0a] text-sm">{formatINR(recommendation.postMitigationExposureINR)}</strong>
                </div>
                <div className="flex items-center justify-between text-[#3a3a3a] pt-2 border-t border-[#e5e5e5]">
                  <span>Net Portfolio Return on Investment:</span>
                  <strong className="font-mono text-[#ff4d8b] text-sm">{recommendation.roiMultiplier}x ROI</strong>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-semibold text-[#6a6a6a] uppercase">Funded Controls Portfolio:</span>
                {recommendation.selectedControls.map((c) => (
                  <div key={c.id} className="p-3 rounded-[12px] bg-[#ffffff] border border-[#e5e5e5] text-xs flex justify-between items-center">
                    <div>
                      <strong className="text-[#1a3a3a] font-mono mr-2">{c.code}</strong>
                      <span className="text-[#0a0a0a] font-medium">{c.name}</span>
                    </div>
                    <span className="text-[#6a6a6a] font-mono font-medium">{formatINR(c.annualCostINR)}/yr</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#faf5e8] flex items-center justify-between">
          <span className="text-xs text-[#6a6a6a] font-mono">Generated by ZK-PACE Zero-Knowledge & FAIR Engine</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[12px] bg-[#ffffff] hover:bg-[#f5f0e0] text-[#0a0a0a] text-xs font-semibold border border-[#e5e5e5] transition-all cursor-pointer shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#22c55e]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Text'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-[12px] bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#ffb084]" />
              <span>Print Brief</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
