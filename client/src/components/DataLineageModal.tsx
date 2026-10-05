import React, { useState } from 'react';
import {
  X,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  HelpCircle,
  Database,
  Scale,
  FileCheck2,
  TrendingDown
} from 'lucide-react';
import { RiskScenario } from '../types';
import { formatINR } from '../services/fairEngine';

interface DataLineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: RiskScenario[];
}

export const DataLineageModal: React.FC<DataLineageModalProps> = ({
  isOpen,
  onClose,
  scenarios
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    scenarios[0]?.id || 'scen-01'
  );

  if (!isOpen) return null;

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e5e5e5] bg-[#faf5e8] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#1a3a3a] flex items-center justify-center text-[#ffb084]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0a0a0a] flex items-center space-x-2 font-display">
                <span>Data Lineage & Mathematical Proof Transparency Guide</span>
                <span className="text-[10px] uppercase font-mono font-bold bg-[#1a3a3a]/10 text-[#1a3a3a] px-2.5 py-0.5 rounded-full border border-[#1a3a3a]/20">
                  Zero Black-Box Math
                </span>
              </h2>
              <p className="text-xs text-[#6a6a6a]">
                Every single metric in CyberPulse traces to an empirical study, statutory penalty schedule, or Open FAIR™ standard formula
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#3a3a3a]">
          {/* Executive Overview Card */}
          <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[20px] p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0a0a0a] mb-3 flex items-center space-x-2">
              <Scale className="w-4 h-4 text-[#1a3a3a]" />
              <span>The 3 Pillars of CyberPulse Quantified Risk</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5]">
                <strong className="text-[#0a0a0a] block font-semibold text-sm">1. Open FAIR™ Standard</strong>
                <p className="text-[#6a6a6a] mt-1.5 leading-relaxed">
                  International standard (ISO/IEC 27005 compliant) decomposing risk into <strong className="text-[#0a0a0a]">Loss Event Frequency (LEF)</strong> and <strong className="text-[#0a0a0a]">Loss Magnitude (LM)</strong>.
                </p>
              </div>
              <div className="p-4 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5]">
                <strong className="text-[#0a0a0a] block font-semibold text-sm">2. Empirical Telemetry</strong>
                <p className="text-[#6a6a6a] mt-1.5 leading-relaxed">
                  Calibrated against <strong className="text-[#0a0a0a]">CERT-In 2024 Threat Reports</strong>, <strong className="text-[#0a0a0a]">IBM Ponemon 2024</strong>, and CloudTrail / WAF attack log baselines.
                </p>
              </div>
              <div className="p-4 rounded-[14px] bg-[#ffffff] border border-[#e5e5e5]">
                <strong className="text-[#0a0a0a] block font-semibold text-sm">3. Real Statutory Law</strong>
                <p className="text-[#6a6a6a] mt-1.5 leading-relaxed">
                  Secondary loss figures map to <strong className="text-[#0a0a0a]">Section 33 of India DPDP Act 2023</strong> and <strong className="text-[#0a0a0a]">RBI Cyber Security Framework circulars</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Scenario Tabs (Clay pill buttons) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a]">
                Inspect Specific Scenario Lineage & Breakdown:
              </span>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScenarioId(s.id)}
                  className={`px-4 py-1.5 text-xs rounded-full font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    s.id === selectedScenarioId
                      ? 'bg-[#0a0a0a] text-[#ffffff] shadow-xs'
                      : 'bg-[#faf5e8] text-[#6a6a6a] hover:text-[#0a0a0a] border border-[#e5e5e5]'
                  }`}
                >
                  {s.id.toUpperCase()}: {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Active Scenario Detailed Lineage */}
          {activeScenario && (
            <div className="space-y-4">
              <div className="bg-[#faf5e8] p-5 rounded-[20px] border border-[#e5e5e5]">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-[#0a0a0a]">{activeScenario.title}</h4>
                  <span className="font-mono text-xs font-bold text-[#ff4d8b]">
                    Annual Risk: {formatINR(activeScenario.fair.annualRiskINR)}
                  </span>
                </div>
                <p className="text-[#6a6a6a] mt-1">{activeScenario.description}</p>
              </div>

              {/* Data Table of Parameters & Citations */}
              <div className="border border-[#e5e5e5] rounded-[20px] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#faf5e8] border-b border-[#e5e5e5] text-[11px] uppercase tracking-wider text-[#6a6a6a]">
                    <tr>
                      <th className="p-3.5 font-semibold">FAIR Parameter</th>
                      <th className="p-3.5 font-semibold">Value</th>
                      <th className="p-3.5 font-semibold">Derivation Method & Empirical Source Citation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5] text-xs">
                    <tr>
                      <td className="p-3.5 font-mono font-semibold text-[#0a0a0a]">TEF (Threat Event Frequency)</td>
                      <td className="p-3.5 font-mono text-[#1a3a3a] font-bold">{activeScenario.fair.tef} attempts/yr</td>
                      <td className="p-3.5 text-[#6a6a6a]">
                        Derived from <strong className="text-[#0a0a0a]">{activeScenario.fair.tefSource || 'CERT-In Threat Telemetry 2024'}</strong>. Represents empirical scan and reconnaissance frequency for targeted architecture.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-semibold text-[#0a0a0a]">TCap (Threat Capability)</td>
                      <td className="p-3.5 font-mono text-[#ff4d8b] font-bold">{(activeScenario.fair.threatCapability * 100).toFixed(0)}%</td>
                      <td className="p-3.5 text-[#6a6a6a]">
                        Calibrated against weaponization indicators in CISA KEV catalog and MITRE ATT&CK adversary profile (T1486 / T1078).
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-semibold text-[#0a0a0a]">CS (Control Strength)</td>
                      <td className="p-3.5 font-mono text-[#1a3a3a] font-bold">{(activeScenario.fair.controlStrength * 100).toFixed(0)}%</td>
                      <td className="p-3.5 text-[#6a6a6a]">
                        Source: <strong className="text-[#0a0a0a]">{activeScenario.fair.controlStrengthSource || 'Enterprise Architecture Audit'}</strong>. Percentage of standard attack techniques resisted by current defensive stack.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-semibold text-[#0a0a0a]">Vuln (Vulnerability)</td>
                      <td className="p-3.5 font-mono text-[#0a0a0a] font-bold">{(activeScenario.fair.vulnerability * 100).toFixed(1)}%</td>
                      <td className="p-3.5 text-[#6a6a6a]">
                        Calculated via Open FAIR formula: <code>P(TCap &gt; CS)</code>. Reflects probability of successful breach given an adversary attempt.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-semibold text-[#0a0a0a]">Primary Loss (PLM)</td>
                      <td className="p-3.5 font-mono text-[#0a0a0a] font-bold">{formatINR(activeScenario.fair.primaryLoss.totalINR)}</td>
                      <td className="p-3.5 text-[#6a6a6a]">
                        Direct operational costs: Forensics retainer + downtime business interruption + recovery infrastructure. Calibrated to IBM Ponemon Indian Enterprise breach averages.
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3.5 font-mono font-semibold text-[#0a0a0a]">Secondary Loss (SLM)</td>
                      <td className="p-3.5 font-mono text-[#ff4d8b] font-bold">{formatINR(activeScenario.fair.secondaryLoss.totalINR)}</td>
                      <td className="p-3.5 text-[#6a6a6a]">
                        Statutory penalties under <strong className="text-[#0a0a0a]">DPDP Act 2023 Schedule (Up to ₹250 Cr max cap)</strong> + RBI supervisory directives + churn customer attrition.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#faf5e8] flex items-center justify-between">
          <span className="text-xs text-[#6a6a6a]">All formulas align strictly with The Open Group Open FAIR™ Technical Standard</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-[12px] bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] text-xs font-semibold cursor-pointer shadow-xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
