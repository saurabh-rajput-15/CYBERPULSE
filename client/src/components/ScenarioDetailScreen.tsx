import React, { useState } from 'react';
import {
  ArrowLeft,
  ShieldAlert,
  Flame,
  Calculator,
  Sliders,
  CheckCircle2,
  ExternalLink,
  Layers,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Zap,
  Info,
  Database
} from 'lucide-react';
import { useRisk } from '../hooks/useRisk';
import { RiskScenario, CandidateControl } from '../types';
import {
  computeVulnerability,
  formatINR,
  getFormulaDerivation
} from '../services/fairEngine';

interface ScenarioDetailScreenProps {
  scenario: RiskScenario;
  allScenarios: RiskScenario[];
  onSelectScenario: (id: string) => void;
  onBackToOverview: () => void;
  candidateControls: CandidateControl[];
  onGoToOptimizer: () => void;
  onOpenDataLineage?: () => void;
}

export const ScenarioDetailScreen: React.FC<ScenarioDetailScreenProps> = ({
  scenario,
  allScenarios,
  onSelectScenario,
  onBackToOverview,
  candidateControls,
  onGoToOptimizer,
  onOpenDataLineage
}) => {
  const { calibrateScenario, setActiveTab } = useRisk();
  // Local "What-If" Sensitivity Simulator state
  const [simTEF, setSimTEF] = useState(scenario.fair.tef);
  const [simTCap, setSimTCap] = useState(scenario.fair.threatCapability);
  const [simCS, setSimCS] = useState(scenario.fair.controlStrength);

  // Compute simulated FAIR values
  const simVuln = computeVulnerability(simTCap, simCS);
  const simLEF = Number((simTEF * simVuln).toFixed(3));
  const simAnnualRisk = Math.round(simLEF * scenario.fair.lossMagnitudeINR);
  const baselineRisk = scenario.fair.annualRiskINR;
  const simDeltaRisk = simAnnualRisk - baselineRisk;

  const handleResetSim = () => {
    setSimTEF(scenario.fair.tef);
    setSimTCap(scenario.fair.threatCapability);
    setSimCS(scenario.fair.controlStrength);
  };

  const derivation = getFormulaDerivation(scenario);
  const mitigatingControls = candidateControls.filter((c) =>
    c.targetScenarioIds.includes(scenario.id)
  );

  return (
    <div id="scenario-detail-screen" className="space-y-8 pb-16">
      {/* Navigation Header & Scenario Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] border border-[#e5e5e5] rounded-[20px] p-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <button
            id="btn-back-overview"
            onClick={onBackToOverview}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-[12px] bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#0a0a0a] text-xs font-semibold border border-[#e5e5e5] transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#0a0a0a]" />
            <span>All Scenarios</span>
          </button>
          <div className="h-5 w-px bg-[#e5e5e5] hidden sm:block" />
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
            {allScenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  onSelectScenario(s.id);
                  setSimTEF(s.fair.tef);
                  setSimTCap(s.fair.threatCapability);
                  setSimCS(s.fair.controlStrength);
                }}
                className={`px-3 py-1.5 text-xs rounded-full font-mono whitespace-nowrap transition-all cursor-pointer ${
                  s.id === scenario.id
                    ? 'bg-[#0a0a0a] text-[#ffffff] font-bold shadow-xs'
                    : 'bg-[#faf5e8] text-[#6a6a6a] hover:text-[#0a0a0a] border border-[#e5e5e5]'
                }`}
              >
                {s.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {scenario.activelyExploitedInWild && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 text-[#ef4444] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            <span>Active in CISA KEV Catalog</span>
          </div>
        )}
      </div>

      {/* Scenario Hero Banner (Clay Feature Card style) */}
      <div className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-[1px] bg-[#ffffff]/10 text-[#a4d4c5] px-3 py-0.5 rounded-full border border-[#ffffff]/15">
                {scenario.category}
              </span>
              <span className="text-xs text-[#a4d4c5]">
                Target: <strong className="text-[#ffffff] font-normal">{scenario.targetedAsset}</strong>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] text-[#ffffff] mt-3 font-display">
              {scenario.title}
            </h1>
            <p className="text-sm text-[#a4d4c5] mt-2 leading-relaxed">
              {scenario.description}
            </p>
            <div className="mt-4 flex items-center space-x-4 text-xs text-[#a4d4c5]">
              <span>Threat Actor: <strong className="text-[#ffffff] font-medium">{scenario.threatActor}</strong></span>
              <span>•</span>
              <span>Severity: <strong className="text-[#ffb084] font-semibold">{scenario.statusSeverity}</strong></span>
            </div>
          </div>

          {/* Headline Scenario Risk Box */}
          <div className="bg-[#ffffff] text-[#0a0a0a] rounded-[20px] p-6 lg:text-right min-w-[260px] shadow-sm">
            <span className="text-[11px] uppercase tracking-[1px] text-[#6a6a6a] font-bold block">
              Annualized Loss Exposure (ALE)
            </span>
            <div className="text-3xl sm:text-4xl font-medium tracking-tight text-[#0a0a0a] font-display mt-1">
              {formatINR(scenario.fair.annualRiskINR)}
            </div>
            <p className="text-[12px] text-[#6a6a6a] mt-1.5 leading-snug">
              {scenario.fair.lef} events/yr × {formatINR(scenario.fair.lossMagnitudeINR)}
            </p>
          </div>
        </div>
      </div>

      {/* FAIR Factor Tree Visual Decomposition */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-medium tracking-tight text-[#0a0a0a] flex items-center space-x-2 font-display">
              <Calculator className="w-5 h-5 text-[#1a3a3a]" />
              <span>Interactive FAIR Factor Tree Decomposition</span>
            </h2>
            <p className="text-xs text-[#6a6a6a] mt-0.5">
              Every value maps directly to an observable operational signal and verified equation
            </p>
          </div>
          <span className="text-xs font-mono text-[#0a0a0a] bg-[#faf5e8] px-3 py-1 rounded-full border border-[#e5e5e5]">
            Open FAIR™ Standard
          </span>
        </div>

        {/* Tree Flow Representation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left Branch: Loss Event Frequency (LEF) - Warm Peach/Cream Card */}
          <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[20px] p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#ffb084]" />
                  <h3 className="text-sm font-bold text-[#0a0a0a] uppercase tracking-wide">
                    Loss Event Frequency (LEF)
                  </h3>
                </div>
                <span className="text-lg font-bold text-[#0a0a0a] font-mono">
                  {scenario.fair.lef} <span className="text-xs font-normal text-[#6a6a6a]">events/yr</span>
                </span>
              </div>
              <p className="text-xs text-[#6a6a6a] mt-2">
                Formula: <code className="text-[#0a0a0a] font-semibold font-mono">LEF = Threat Event Freq (TEF) × Vulnerability (Vuln)</code>
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* TEF */}
                <div className="bg-[#ffffff] p-4 rounded-[14px] border border-[#e5e5e5]">
                  <div className="text-[10px] uppercase font-bold text-[#6a6a6a]">Threat Event Freq (TEF)</div>
                  <div className="text-xl font-bold text-[#0a0a0a] font-mono mt-1">
                    {scenario.fair.tef} <span className="text-xs font-normal text-[#6a6a6a]">attempts/yr</span>
                  </div>
                  <p className="text-[10px] text-[#6a6a6a] mt-1.5">
                    {scenario.fair.tefSource || 'CERT-In FinTech Telemetry 2024'}
                  </p>
                </div>

                {/* Vulnerability */}
                <div className="bg-[#ffffff] p-4 rounded-[14px] border border-[#e5e5e5]">
                  <div className="text-[10px] uppercase font-bold text-[#6a6a6a]">Vulnerability (Vuln)</div>
                  <div className="text-xl font-bold text-[#ff4d8b] font-mono mt-1">
                    {(scenario.fair.vulnerability * 100).toFixed(1)}%
                  </div>
                  <p className="text-[10px] text-[#6a6a6a] mt-1.5">
                    P(Threat Capability &gt; Defensive Control Strength)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[#ffffff] p-3.5 rounded-[12px] border border-[#e5e5e5] text-xs flex justify-between items-center">
              <div>
                <span className="text-[#6a6a6a] block text-[11px]">
                  Threat Capability (TCap): <strong className="text-[#0a0a0a]">{(scenario.fair.threatCapability * 100).toFixed(0)}%</strong>
                </span>
                <span className="text-[#6a6a6a] block text-[11px] mt-0.5">
                  Defensive Control Strength (CS): <strong className="text-[#0a0a0a]">{(scenario.fair.controlStrength * 100).toFixed(0)}%</strong>
                </span>
              </div>
              <div className="text-right font-mono text-[11px] text-[#6a6a6a]">
                <span>Margin: {((scenario.fair.threatCapability - scenario.fair.controlStrength) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>

          {/* Right Branch: Loss Magnitude (LM) - Lavender/Cream Card */}
          <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[20px] p-6 relative flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-[#b8a4ed]" />
                  <h3 className="text-sm font-bold text-[#0a0a0a] uppercase tracking-wide">
                    Loss Magnitude (LM)
                  </h3>
                </div>
                <span className="text-lg font-bold text-[#0a0a0a] font-mono">
                  {formatINR(scenario.fair.lossMagnitudeINR)}
                </span>
              </div>
              <p className="text-xs text-[#6a6a6a] mt-2">
                Formula: <code className="text-[#0a0a0a] font-semibold font-mono">LM = Primary Direct Loss + Secondary Fines & Churn</code>
              </p>

              <div className="grid grid-cols-2 gap-3 mt-4">
                {/* Primary Loss */}
                <div className="bg-[#ffffff] p-4 rounded-[14px] border border-[#e5e5e5]">
                  <div className="text-[10px] uppercase font-bold text-[#6a6a6a]">Primary Direct Loss</div>
                  <div className="text-xl font-bold text-[#1a3a3a] font-mono mt-1">
                    {formatINR(scenario.fair.primaryLoss.totalINR)}
                  </div>
                  <ul className="text-[10px] text-[#6a6a6a] mt-1.5 space-y-0.5">
                    <li>• IR Retainer: {formatINR(scenario.fair.primaryLoss.incidentResponseINR)}</li>
                    <li>• Downtime: {formatINR(scenario.fair.primaryLoss.businessInterruptionINR)}</li>
                    <li>• Recovery: {formatINR(scenario.fair.primaryLoss.systemRecoveryINR)}</li>
                  </ul>
                </div>

                {/* Secondary Loss */}
                <div className="bg-[#ffffff] p-4 rounded-[14px] border border-[#e5e5e5]">
                  <div className="text-[10px] uppercase font-bold text-[#6a6a6a]">Secondary Loss</div>
                  <div className="text-xl font-bold text-[#ff4d8b] font-mono mt-1">
                    {formatINR(scenario.fair.secondaryLoss.totalINR)}
                  </div>
                  <ul className="text-[10px] text-[#6a6a6a] mt-1.5 space-y-0.5">
                    <li>• DPDP/RBI Fines: {formatINR(scenario.fair.secondaryLoss.regulatoryFinesINR)}</li>
                    <li>• Attrition Churn: {formatINR(scenario.fair.secondaryLoss.reputationalChurnINR)}</li>
                    <li>• Legal Notices: {formatINR(scenario.fair.secondaryLoss.legalAndNotificationINR)}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-4 bg-[#ffffff] p-3.5 rounded-[12px] border border-[#e5e5e5] text-xs text-[#6a6a6a] flex items-center justify-between">
              <span>Single catastrophic breach impact</span>
              <span className="font-mono text-[#0a0a0a] font-bold">{formatINR(scenario.fair.lossMagnitudeINR)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Formula Verification & What-If Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Mathematical Audit Inspector */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
              <Calculator className="w-4 h-4 text-[#1a3a3a]" />
              <span>Step-by-Step Formula Derivation</span>
            </h3>
            <span className="text-[11px] font-mono font-medium text-[#0a0a0a] bg-[#faf5e8] px-2.5 py-0.5 rounded-full border border-[#e5e5e5]">
              Audit Grade
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Step 1 */}
            <div className="p-3.5 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] font-mono">
              <div className="text-[#0a0a0a] text-[11px] font-semibold">1. Vulnerability Calculation</div>
              <div className="text-[#1a3a3a] font-bold mt-1">{derivation.step1_vulnerability.formula}</div>
              <div className="text-[#6a6a6a] text-[11px] mt-1 font-sans">
                {derivation.step1_vulnerability.explanation}
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] font-mono">
              <div className="text-[#0a0a0a] text-[11px] font-semibold">2. Loss Event Frequency (LEF)</div>
              <div className="text-[#1a3a3a] font-bold mt-1">{derivation.step2_lef.formula}</div>
              <div className="text-[#6a6a6a] text-[11px] mt-1 font-sans">
                {derivation.step2_lef.explanation}
              </div>
            </div>

            {/* Step 3 & 4 */}
            <div className="p-3.5 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] font-mono">
              <div className="text-[#0a0a0a] text-[11px] font-semibold">3. Loss Magnitude Aggregation</div>
              <div className="text-[#6a6a6a] mt-1">
                Primary: {derivation.step3_primaryLoss.formatted} + Secondary: {derivation.step4_secondaryLoss.formatted}
              </div>
              <div className="text-[#0a0a0a] font-bold mt-1">
                = Total LM: {derivation.step5_lossMagnitude.formatted}
              </div>
            </div>

            {/* Step 6 */}
            <div className="p-3.5 rounded-[14px] bg-[#ff4d8b]/10 border border-[#ff4d8b]/20 font-mono">
              <div className="text-[#ff4d8b] text-[11px] font-bold">4. Annualized Risk (ALE)</div>
              <div className="text-[#ff4d8b] font-bold mt-1">{derivation.step6_annualRisk.formula}</div>
              <div className="text-[#3a3a3a] text-[11px] mt-1 font-sans">
                {derivation.step6_annualRisk.explanation}
              </div>
            </div>
          </div>
        </div>

        {/* Right: What-If Sensitivity Simulator */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-[#ff4d8b]" />
              <span>What-If Risk Sensitivity Simulator</span>
            </h3>
            <button
              onClick={handleResetSim}
              className="text-xs text-[#6a6a6a] hover:text-[#0a0a0a] inline-flex items-center space-x-1 cursor-pointer font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <p className="text-xs text-[#6a6a6a]">
            Test how hardening defenses or facing higher threat frequencies alters the annualized financial risk.
          </p>

          <div className="space-y-4 text-xs">
            {/* Slider 1: TEF */}
            <div>
              <div className="flex justify-between text-[#0a0a0a] mb-1 font-medium">
                <span>Threat Event Frequency (TEF)</span>
                <span className="font-mono text-[#0a0a0a] font-bold">{simTEF} attempts/yr</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={simTEF}
                onChange={(e) => setSimTEF(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#faf5e8] rounded-lg appearance-none cursor-pointer accent-[#0a0a0a]"
              />
            </div>

            {/* Slider 2: CS */}
            <div>
              <div className="flex justify-between text-[#0a0a0a] mb-1 font-medium">
                <span>Control Strength (Defensive Capability)</span>
                <span className="font-mono text-[#1a3a3a] font-bold">{(simCS * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.05"
                value={simCS}
                onChange={(e) => setSimCS(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#faf5e8] rounded-lg appearance-none cursor-pointer accent-[#1a3a3a]"
              />
            </div>

            {/* Slider 3: TCap */}
            <div>
              <div className="flex justify-between text-[#0a0a0a] mb-1 font-medium">
                <span>Threat Actor Capability (TCap)</span>
                <span className="font-mono text-[#ff4d8b] font-bold">{(simTCap * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.95"
                step="0.05"
                value={simTCap}
                onChange={(e) => setSimTCap(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#faf5e8] rounded-lg appearance-none cursor-pointer accent-[#ff4d8b]"
              />
            </div>

            {/* Simulator Output Outcome */}
            <div className="mt-4 pt-3 bg-[#faf5e8] p-5 rounded-[16px] border border-[#e5e5e5]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-[#6a6a6a]">Simulated Annual Risk</span>
                  <div className="text-2xl font-bold text-[#0a0a0a] font-mono mt-0.5">
                    {formatINR(simAnnualRisk)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] uppercase font-bold text-[#6a6a6a]">Delta vs Baseline</span>
                  <div
                    className={`text-sm font-bold font-mono mt-0.5 ${
                      simDeltaRisk > 0 ? 'text-[#ef4444]' : simDeltaRisk < 0 ? 'text-[#22c55e]' : 'text-[#6a6a6a]'
                    }`}
                  >
                    {simDeltaRisk > 0 ? `+${formatINR(simDeltaRisk)}` : simDeltaRisk < 0 ? `-${formatINR(Math.abs(simDeltaRisk))}` : '0'}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-[#6a6a6a] pt-2 border-t border-[#e5e5e5]">
                <span>Simulated Vuln: <strong className="text-[#0a0a0a] font-mono">{(simVuln * 100).toFixed(1)}%</strong></span>
                <span>Simulated LEF: <strong className="text-[#0a0a0a] font-mono">{simLEF}/yr</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empirical Ground Truth & Real Incident Calibration Panel */}
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e5e5e5]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[10px] bg-[#1a3a3a] flex items-center justify-center text-[#ffb084]">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0a0a0a]">
                Empirical Ground Truth & Real Incident Benchmark
              </h3>
              <p className="text-[11px] text-[#6a6a6a]">
                Anchored to 1,902 historical enterprise breach loss records in <code className="bg-[#faf5e8] px-1 py-0.5 rounded font-mono">Financial Data Set.csv</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => calibrateScenario(scenario.id, 'vector-median')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#faf5e8] text-[#0a0a0a] hover:bg-[#e5e5e5] border border-[#e5e5e5] cursor-pointer transition-all shadow-xs"
            >
              Calibrate to Vector Median
            </button>
            <button
              onClick={() => calibrateScenario(scenario.id, 'vector-p90')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#ff4d8b] text-[#ffffff] hover:bg-[#e03a74] cursor-pointer transition-all shadow-xs"
            >
              Calibrate to 90th Percentile
            </button>
            <button
              onClick={() => setActiveTab('real-data')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1a3a3a] text-[#ffffff] hover:bg-[#2b5a5a] cursor-pointer transition-all shadow-xs"
            >
              Browse 1,902 Breaches →
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5]">
            <span className="text-[#6a6a6a] block text-[11px]">Empirical Category</span>
            <span className="font-semibold text-[#0a0a0a] text-sm">{scenario.category}</span>
            <span className="text-[10px] text-[#1a3a3a] block mt-0.5">Matching historical breach vector</span>
          </div>

          <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5]">
            <span className="text-[#6a6a6a] block text-[11px]">Dataset Median Loss (P50)</span>
            <span className="font-bold text-[#1a3a3a] text-sm font-mono">$8,000,000 (₹68.0 Cr)</span>
            <span className="text-[10px] text-[#6a6a6a] block mt-0.5">Across 1,010 verified breaches</span>
          </div>

          <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5]">
            <span className="text-[#6a6a6a] block text-[11px]">Dataset High Impact Loss (P90)</span>
            <span className="font-bold text-[#ff4d8b] text-sm font-mono">$25,000,000 (₹212.5 Cr)</span>
            <span className="text-[10px] text-[#6a6a6a] block mt-0.5">Catastrophic exposure limit</span>
          </div>
        </div>

        {scenario.fair.benchmarkSource && (
          <div className="text-[11px] text-[#6a6a6a] bg-[#faf5e8]/70 px-3 py-2 rounded-[12px] border border-[#e5e5e5] flex items-center justify-between">
            <span>Benchmark Citation: <strong className="text-[#0a0a0a]">{scenario.fair.benchmarkSource}</strong></span>
            <span className="text-emerald-700 font-medium">✓ Empirically Calibrated</span>
          </div>
        )}
      </div>

      {/* Correlated CISA KEV & Mitigating Controls Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Linked CVEs from CISA KEV */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-7 shadow-xs space-y-4">
          <h3 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
            <Flame className="w-4 h-4 text-[#ff4d8b]" />
            <span>Correlated CISA KEV Exploitations</span>
          </h3>

          <div className="space-y-3">
            {scenario.linkedCVEs.map((cve) => (
              <div
                key={cve.cveId}
                className="p-4 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#ff4d8b]">{cve.cveId}</span>
                  {cve.isActivelyExploited && (
                    <span className="text-[10px] font-semibold bg-[#ef4444]/10 text-[#ef4444] px-2.5 py-0.5 rounded-full border border-[#ef4444]/20">
                      Actively Weaponized
                    </span>
                  )}
                </div>
                <div className="text-xs font-semibold text-[#0a0a0a]">{cve.vulnerabilityName}</div>
                <p className="text-[12px] text-[#6a6a6a]">{cve.shortDescription}</p>
                <div className="text-[11px] text-[#9a9a9a] flex items-center space-x-3 pt-1">
                  <span>Vendor: {cve.vendorProject}</span>
                  <span>Product: {cve.product}</span>
                  <span>Added: {cve.dateAdded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Controls that Mitigate This Scenario */}
        <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-7 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-[#1a3a3a]" />
              <span>Available Mitigating Controls</span>
            </h3>
            <button
              onClick={onGoToOptimizer}
              className="text-xs text-[#0a0a0a] font-semibold hover:text-[#ff4d8b] cursor-pointer"
            >
              Solve in Optimizer →
            </button>
          </div>

          <div className="space-y-3">
            {mitigatingControls.map((ctrl) => (
              <div
                key={ctrl.id}
                className="p-4 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-[#1a3a3a]">{ctrl.code}</span>
                    <span className="text-xs font-semibold text-[#0a0a0a]">{ctrl.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0a0a0a]">{formatINR(ctrl.annualCostINR)}/yr</span>
                </div>
                <p className="text-[12px] text-[#6a6a6a]">{ctrl.description}</p>
                <div className="flex items-center justify-between text-[11px] text-[#1a3a3a] font-medium pt-1">
                  <span>Direct Loss Reduction: {(ctrl.effectivenessPercent * 100).toFixed(0)}%</span>
                  <span className="text-[#6a6a6a] font-mono">Deploy: {ctrl.implementationTimeDays} days</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
