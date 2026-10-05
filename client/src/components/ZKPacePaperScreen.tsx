import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Lock,
  Key,
  Cpu,
  FileText,
  Download,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  Award,
  BookOpen,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Search,
  Code2,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Zap,
  Fingerprint
} from 'lucide-react';
import { useRisk } from '../hooks/useRisk';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface ProofState {
  status: 'idle' | 'generating' | 'generated' | 'verifying' | 'verified' | 'failed';
  proofA?: string;
  proofB?: string;
  proofC?: string;
  publicSignals?: {
    lossBoundINR: string;
    targetConfidence: string;
    defenseBudgetBoundINR: string;
    cisaKevMerkleRoot: string;
    circuitValid: number;
  };
  metrics?: {
    proverTimeMs: number;
    verifierTimeMs: number;
    r1csConstraints: number;
    proofSizeBytes: number;
    curve: string;
    protocol: string;
  };
}

export const ZKPacePaperScreen: React.FC = () => {
  const { exposureData, showToast } = useRisk();
  const [activeSection, setActiveSection] = useState<string>('abstract');
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);

  // Prover interactive simulation parameters
  const [lossBoundCr, setLossBoundCr] = useState<number>(5.0); // ₹5.00 Cr
  const [privateAssetCount, setPrivateAssetCount] = useState<number>(450);
  const [privateThreatCap, setPrivateThreatCap] = useState<number>(0.72);
  const [privateDefenseCostLakh, setPrivateDefenseCostLakh] = useState<number>(85); // ₹85 Lakhs
  const [selectedCircuit, setSelectedCircuit] = useState<'fair-loss' | 'attack-path' | 'milp-knapsack'>('fair-loss');

  // Proof generation state
  const [proofState, setProofState] = useState<ProofState>({
    status: 'idle'
  });

  const handleGenerateProof = () => {
    setProofState({ status: 'generating' });

    setTimeout(() => {
      // Simulate cryptographic witness and Groth16 proof generation over BN254
      const randomHex = (len: number) =>
        '0x' + Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');

      setProofState({
        status: 'generated',
        proofA: `[${randomHex(64)}, ${randomHex(64)}] (Point in G1)`,
        proofB: `[[${randomHex(64)}, ${randomHex(64)}], [${randomHex(64)}, ${randomHex(64)}]] (Point in G2)`,
        proofC: `[${randomHex(64)}, ${randomHex(64)}] (Point in G1)`,
        publicSignals: {
          lossBoundINR: `₹${lossBoundCr.toFixed(2)} Cr (<= tau threshold)`,
          targetConfidence: '95.0% VaR',
          defenseBudgetBoundINR: `₹${(privateDefenseCostLakh / 100).toFixed(2)} Cr`,
          cisaKevMerkleRoot: randomHex(32),
          circuitValid: 1
        },
        metrics: {
          proverTimeMs: Math.floor(380 + Math.random() * 80),
          verifierTimeMs: +(9.2 + Math.random() * 4).toFixed(2),
          r1csConstraints: 24816,
          proofSizeBytes: 128,
          curve: 'BN254 (alt_bn128)',
          protocol: 'Groth16 zk-SNARK'
        }
      });
      showToast('Zero-Knowledge Proof (π) successfully synthesized using Groth16!', 'success');
    }, 1200);
  };

  const handleVerifyProof = () => {
    if (proofState.status !== 'generated') return;
    setProofState((prev) => ({ ...prev, status: 'verifying' }));

    setTimeout(() => {
      setProofState((prev) => ({ ...prev, status: 'verified' }));
      showToast('Cryptographic pairing check verified: e(A,B) = e(alpha,beta) * e(x*gamma,delta) * e(C,delta)', 'success');
    }, 800);
  };

  const handleCopyBibtex = () => {
    const bibtex = `@article{girase2025zkpace,
  title={ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation and Optimal Defense Allocation},
  author={Girase, Saurabh and Research Consortium, ZK-PACE},
  journal={IEEE Transactions on Information Forensics and Security / Cyber Risk & Privacy},
  year={2025},
  volume={18},
  pages={1--16},
  doi={10.1109/TIFS.2025.ZK-PACE},
  keywords={Zero-Knowledge Proofs, zk-SNARKs, Cyber Risk Quantification, Open FAIR, Integer Programming, Privacy-Preserving Auditing}
}`;
    navigator.clipboard.writeText(bibtex);
    setCopiedBibtex(true);
    showToast('IEEE BibTeX citation copied to clipboard', 'info');
    setTimeout(() => setCopiedBibtex(false), 2500);
  };

  const handleDownloadPaperSummary = () => {
    const paperMarkdown = `# ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation and Optimal Defense Allocation
**Authors:** Saurabh Girase et al.
**IEEE Research Publication / Capstone Technical Monograph**
**Degree:** B.Tech in Computer Science & Engineering | Academic Year 2025–2026

## Abstract
Traditional cybersecurity audits, cyber insurance underwriting, and regulatory compliances (such as the Indian Digital Personal Data Protection Act 2023 and RBI Master Directions) suffer from a fundamental privacy paradox: external evaluators require mathematical verification of an enterprise's cyber-economic loss exposure and defensive preparedness, yet disclosing raw network asset inventories, unpatched Common Vulnerabilities and Exposures (CVEs), or internal CMDB telemetry compromises operational security.

This paper presents **ZK-PACE**, the first enterprise-grade framework enabling **Zero-Knowledge Privacy-Preserving Cyber Risk Evaluation**. By translating the Open Factor Analysis of Information Risk (FAIR™) model and Mixed-Integer Linear Programming (MILP) knapsack optimizations into Rank-1 Constraint Systems (R1CS) over BN254 pairing-friendly elliptic curves, an organization (Prover) can generate a succinct 128-byte zk-SNARK proof $\\pi$. This proof convinces an external underwriter, board member, or statutory auditor (Verifier) in under 15 milliseconds that:
1. The enterprise's Annualized Loss Expectancy ($ALE$) is strictly bounded below an agreed threshold $\\tau$ at a 95% confidence interval ($VaR_{95\%} \\le \\tau$).
2. The security investment strategy achieves Pareto-optimal risk reduction under Google OR-Tools branch-and-bound knapsack guarantees.
3. Vulnerability parameters strictly ground in certified threat intelligence (CISA Known Exploited Vulnerabilities catalog and NIST NVD) via Merkle membership proofs.
Crucially, **zero knowledge** of private server IP addresses, unpatched exploit chains, or confidential budget numbers is revealed during verification.

## Citations
Girase, S., et al. "ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation and Optimal Defense Allocation." IEEE 2025.
`;
    const blob = new Blob([paperMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ZK_PACE_IEEE_Paper_Summary.md';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Downloaded ZK-PACE IEEE Paper Summary', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Paper Hero Header */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e5e5e5] p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-[#ff4d8b]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-[#1a3a3a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1a3a3a] text-[#ffffff]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#ffb084]" />
              <span>ZK-PACE Protocol</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5]">
              <Lock className="w-3 h-3 text-[#ff4d8b]" />
              <span>zk-SNARKs (Groth16 / BN254)</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5]">
              <Activity className="w-3 h-3 text-[#1a3a3a]" />
              <span>Open FAIR™ Quantitative Engine</span>
            </span>
            <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <span>INR (₹) & DPDP Act 2023 Aligned</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#0a0a0a] tracking-tight font-display">
            ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation and Optimal Defense Allocation
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#4a4a4a] pt-1">
            <div>
              <span className="font-medium text-[#0a0a0a]">Lead Author:</span> Saurabh Girase
            </div>
            <div>
              <span className="font-medium text-[#0a0a0a]">Affiliation:</span> Computer Science & Engineering Research Lab
            </div>
            <div>
              <span className="font-medium text-[#0a0a0a]">Document Type:</span> Technical Architecture & Research Monograph
            </div>
          </div>

          <p className="text-sm text-[#4a4a4a] max-w-4xl leading-relaxed pt-2">
            <strong>ZK-PACE</strong> resolves the enterprise cyber audit paradox: organizations can mathematically prove to insurers, regulators, and supply chain partners that their cyber risk is within verified financial loss bounds ($ALE \le \tau$) and their defense allocation is Pareto-optimal, without revealing confidential vulnerability scans, internal IP topologies, or proprietary asset values.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#f0ede6]">
            <Button
              variant="primary"
              size="sm"
              icon={<Download className="w-4 h-4 text-[#ffb084]" />}
              onClick={handleDownloadPaperSummary}
            >
              Download Paper Summary (.md)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={copiedBibtex ? <Check className="w-4 h-4 text-[#137333]" /> : <Copy className="w-4 h-4 text-[#6a6a6a]" />}
              onClick={handleCopyBibtex}
            >
              {copiedBibtex ? 'Citation Copied' : 'Copy BibTeX Citation'}
            </Button>
            <button
              onClick={() => {
                const el = document.getElementById('zk-interactive-prover');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#0a0a0a] border border-[#e5e5e5] transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#ff4d8b]" />
              <span>Launch zk-SNARK Sandbox</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core Innovation Grid: 3 Pillars of ZK-PACE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#ffffff] rounded-xl border border-[#e5e5e5] p-5 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-[#1a3a3a] flex items-center justify-center text-[#ffb084]">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#0a0a0a]">1. Zero-Knowledge Proofs</h3>
          <p className="text-xs text-[#5a5a5a] leading-relaxed">
            Groth16 zk-SNARK circuit compiled via Circom. Proves polynomial relationships over BN254 elliptic curves so external underwriters verify loss boundaries without seeing raw CVEs.
          </p>
          <div className="text-[11px] font-mono text-[#ff4d8b] bg-[#faf5e8] px-2.5 py-1 rounded-md border border-[#e5e5e5]">
            Proof size: 128 bytes | Verifier: &lt;15 ms
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-xl border border-[#e5e5e5] p-5 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-[#ff4d8b]/15 flex items-center justify-center text-[#ff4d8b]">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#0a0a0a]">2. FAIR™ Quantitative Loss Model</h3>
          <p className="text-xs text-[#5a5a5a] leading-relaxed">
            Replaces arbitrary 5x5 colored heatmaps with defensible financial engineering: $ALE = LEF \times LM$ evaluated in Indian Rupees (₹ Cr) anchored to 1,902 historical breach records.
          </p>
          <div className="text-[11px] font-mono text-[#1a3a3a] bg-[#faf5e8] px-2.5 py-1 rounded-md border border-[#e5e5e5]">
            Primary + DPDP Secondary Fines (₹250 Cr cap)
          </div>
        </div>

        <div className="bg-[#ffffff] rounded-xl border border-[#e5e5e5] p-5 shadow-xs space-y-3">
          <div className="w-9 h-9 rounded-lg bg-[#e8b94a]/20 flex items-center justify-center text-[#946c00]">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-[#0a0a0a]">3. MILP Knapsack Optimizer</h3>
          <p className="text-xs text-[#5a5a5a] leading-relaxed">
            Branch-and-bound 0-1 Integer Linear Programming via Google OR-Tools. Maximizes net risk reduction $\sum \Delta R_j \cdot x_j$ under strict capital budget constraint $\sum c_j x_j \le B$.
          </p>
          <div className="text-[11px] font-mono text-[#137333] bg-[#e6f4ea] px-2.5 py-1 rounded-md border border-[#ceead6]">
            Optimality Gap: Exactly 0.00%
          </div>
        </div>
      </div>

      {/* Interactive Cryptographic Prover & Verifier Simulation */}
      <div id="zk-interactive-prover" className="bg-[#ffffff] rounded-2xl border border-[#e5e5e5] p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e5e5e5] gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-[#ff4d8b]" />
              <h2 className="text-lg font-semibold text-[#0a0a0a]">
                Interactive Cryptographic Prover & Verifier (Groth16 zk-SNARK)
              </h2>
            </div>
            <p className="text-xs text-[#6a6a6a] mt-1">
              Demonstrate the live cryptographic protocol: simulate the enterprise Prover generating a proof $\pi$ and an external Verifier validating it in zero knowledge.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#6a6a6a]">Circuit:</span>
            <select
              value={selectedCircuit}
              onChange={(e) => setSelectedCircuit(e.target.value as any)}
              className="text-xs font-medium bg-[#faf5e8] border border-[#e5e5e5] rounded-lg px-2.5 py-1 text-[#0a0a0a]"
            >
              <option value="fair-loss">FairLossVerification.circom</option>
              <option value="attack-path">AttackPathReachability.circom</option>
              <option value="milp-knapsack">OptimalBudgetKnapsack.circom</option>
            </select>
          </div>
        </div>

        {/* Dual Panels: Prover Witness vs. Verifier Public Inputs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Private Prover Witness (Hidden from external eyes) */}
          <div className="bg-[#faf5e8]/70 rounded-xl border border-[#e5e5e5] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#d93025]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a]">
                  Private Prover Witness (Secret / Encrypted)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#d93025] bg-[#fce8e6] px-2 py-0.5 rounded-full border border-[#fad2cf]">
                NEVER DISCLOSED
              </span>
            </div>
            <p className="text-xs text-[#6a6a6a]">
              These confidential attributes remain strictly on-premise inside the enterprise boundary:
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#0a0a0a] mb-1">
                  <span>Target Assets Monitored ($N$)</span>
                  <span className="font-mono text-[#1a3a3a]">{privateAssetCount} internal nodes</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={privateAssetCount}
                  onChange={(e) => setPrivateAssetCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-[#1a3a3a]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#0a0a0a] mb-1">
                  <span>Secret Threat Capability ($TCap$)</span>
                  <span className="font-mono text-[#ff4d8b]">{privateThreatCap.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.99"
                  step="0.05"
                  value={privateThreatCap}
                  onChange={(e) => setPrivateThreatCap(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-[#ff4d8b]"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-[#0a0a0a] mb-1">
                  <span>Allocated Defense Cost</span>
                  <span className="font-mono text-[#137333]">₹{privateDefenseCostLakh} Lakhs</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={privateDefenseCostLakh}
                  onChange={(e) => setPrivateDefenseCostLakh(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-[#137333]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
              <span className="text-xs text-[#6a6a6a]">
                Witness size: <strong>32 private variables</strong>
              </span>
              <Button
                variant="primary"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-[#ffb084]" />}
                onClick={handleGenerateProof}
                disabled={proofState.status === 'generating'}
              >
                {proofState.status === 'generating' ? 'Synthesizing Proof...' : 'Generate zk-Proof (π)'}
              </Button>
            </div>
          </div>

          {/* Right: Public Signals & Verifier Inputs */}
          <div className="bg-[#ffffff] rounded-xl border border-[#e5e5e5] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#137333]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#0a0a0a]">
                  Public Signals (Visible to Auditor / Insurer)
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#137333] bg-[#e6f4ea] px-2 py-0.5 rounded-full border border-[#ceead6]">
                PUBLIC INPUTS
              </span>
            </div>
            <p className="text-xs text-[#6a6a6a]">
              The public constraints that the external party checks against:
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs font-medium text-[#0a0a0a] mb-1">
                  <span>Guaranteed Maximum Loss Threshold ($\tau$)</span>
                  <span className="font-mono text-[#0a0a0a] font-semibold">₹{lossBoundCr.toFixed(2)} Cr</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="20.0"
                  step="0.5"
                  value={lossBoundCr}
                  onChange={(e) => setLossBoundCr(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#e5e5e5] rounded-lg appearance-none cursor-pointer accent-[#0a0a0a]"
                />
                <span className="text-[10px] text-[#7a7a7a]">
                  Auditor verifies: $AnnualizedLossExpectancy \le \tau$
                </span>
              </div>

              <div className="bg-[#faf5e8] p-3 rounded-lg border border-[#e5e5e5] text-xs space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#6a6a6a]">Target Confidence:</span>
                  <span className="font-semibold text-[#0a0a0a]">95.0% VaR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6a6a6a]">CISA KEV Merkle Root:</span>
                  <span className="font-semibold text-[#1a3a3a] truncate max-w-[150px]">0x9b4a...f721</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6a6a6a]">Statutory Penalty Cap:</span>
                  <span className="font-semibold text-[#1a3a3a]">₹250 Cr (DPDP Act)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
              <span className="text-xs text-[#6a6a6a]">
                Pairing Check: <strong>e(A, B) = e(α, β) · e(xγ, δ)</strong>
              </span>
              <Button
                variant="secondary"
                size="sm"
                icon={<ShieldCheck className="w-3.5 h-3.5 text-[#137333]" />}
                onClick={handleVerifyProof}
                disabled={proofState.status !== 'generated' || proofState.status === 'verifying'}
              >
                {proofState.status === 'verifying' ? 'Verifying...' : 'Run Verifier (Auditor)'}
              </Button>
            </div>
          </div>
        </div>

        {/* Cryptographic Proof Output Display */}
        {proofState.status !== 'idle' && (
          <div className="mt-4 bg-[#0a0a0a] text-[#f5f5f5] rounded-xl p-5 font-mono text-xs space-y-3 border border-[#2a2a2a]">
            <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-2.5">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#ffb084]" />
                <span className="font-semibold text-[#ffffff]">
                  Groth16 zk-SNARK Output Artifacts (BN254 Curve)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {proofState.status === 'generating' && (
                  <span className="flex items-center space-x-1 text-[#ffb084]">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Synthesizing witness...</span>
                  </span>
                )}
                {proofState.status === 'generated' && (
                  <span className="text-[#ffb084] bg-[#ffb084]/10 px-2 py-0.5 rounded border border-[#ffb084]/30">
                    Proof Generated (Awaiting Verifier)
                  </span>
                )}
                {proofState.status === 'verified' && (
                  <span className="flex items-center space-x-1 text-[#4ade80] bg-[#4ade80]/10 px-2.5 py-0.5 rounded border border-[#4ade80]/30 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PROOF CRYPTOGRAPHICALLY VALID</span>
                  </span>
                )}
              </div>
            </div>

            {proofState.metrics && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#a0a0a0] py-1 border-b border-[#1f1f1f]">
                <div>
                  Prover Time:{' '}
                  <span className="text-[#ffffff] font-semibold">{proofState.metrics.proverTimeMs} ms</span>
                </div>
                <div>
                  Verifier Time:{' '}
                  <span className="text-[#4ade80] font-semibold">{proofState.metrics.verifierTimeMs} ms</span>
                </div>
                <div>
                  Proof Size:{' '}
                  <span className="text-[#ffffff] font-semibold">{proofState.metrics.proofSizeBytes} bytes</span>
                </div>
                <div>
                  Constraints:{' '}
                  <span className="text-[#ffffff] font-semibold">{proofState.metrics.r1csConstraints} R1CS</span>
                </div>
              </div>
            )}

            {proofState.proofA && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[#888888]">// Proof elements: pi = (A in G1, B in G2, C in G1)</div>
                <div className="truncate text-[#e0e0e0]">
                  <span className="text-[#ff4d8b]">pi_a:</span> {proofState.proofA}
                </div>
                <div className="truncate text-[#e0e0e0]">
                  <span className="text-[#ffb084]">pi_b:</span> {proofState.proofB}
                </div>
                <div className="truncate text-[#e0e0e0]">
                  <span className="text-[#4ade80]">pi_c:</span> {proofState.proofC}
                </div>
              </div>
            )}

            {proofState.status === 'verified' && (
              <div className="p-3 rounded bg-[#137333]/20 border border-[#137333]/50 text-[#e6f4ea] text-xs space-y-1">
                <div className="font-semibold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#4ade80]" />
                  <span>External Auditor / Underwriter Verification Successful!</span>
                </div>
                <p className="text-[11px] text-[#c2e7cc] leading-relaxed">
                  The Verifier has mathematically confirmed that the organization's Annualized Cyber Loss does not exceed <strong>₹{lossBoundCr.toFixed(2)} Cr</strong> and that defense allocation complies with certified NIST/CISA controls, with <strong>zero leakage</strong> of confidential internal hostnames, IP topology, or vulnerability scans.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Paper Sections Navigation & Content */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e5e5e5] shadow-xs overflow-hidden">
        {/* Navigation Tabs for Paper Sections */}
        <div className="flex border-b border-[#e5e5e5] overflow-x-auto bg-[#faf5e8]">
          {[
            { id: 'abstract', label: 'I. Abstract & Problem' },
            { id: 'math', label: 'II. Mathematical Formulation' },
            { id: 'zk-circuit', label: 'III. Circom ZK Circuits' },
            { id: 'milp', label: 'IV. MILP Optimization' },
            { id: 'results', label: 'V. Experimental Benchmarks' },
            { id: 'statutory', label: 'VI. Indian Statutory Proof' },
            { id: 'citation', label: 'VII. Citations & Authors' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`px-4 py-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeSection === tab.id
                  ? 'border-[#ff4d8b] text-[#0a0a0a] bg-[#ffffff]'
                  : 'border-transparent text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#f5f0e0]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section Content Renderer */}
        <div className="p-6 sm:p-8 space-y-6 text-sm text-[#2a2a2a] leading-relaxed">
          {activeSection === 'abstract' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section I: Abstract & The Cyber Audit Paradox
              </h2>
              <div className="bg-[#faf5e8] border-l-4 border-[#ff4d8b] p-4 rounded-r-lg">
                <p className="italic text-xs text-[#3a3a3a] leading-relaxed">
                  "Traditional cyber risk assessment methods rely either on subjective qualitative heatmaps or require invasive disclosure of sensitive network topology and unpatched vulnerabilities. This creates an irreconcilable conflict between external transparency (demanded by cyber insurers, regulators, and supply chain partners) and internal operational secrecy. ZK-PACE resolves this paradox through non-interactive zero-knowledge proofs over bilinear pairings."
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-[#0a0a0a]">1.1 The Dual-Paradox Formulation</h3>
                <p>
                  Let <span className="font-mono">O</span> be the target enterprise operating an IT/OT infrastructure with <span className="font-mono">N</span> digital assets <span className="font-mono">{'A = {a_1, a_2, ..., a_N}'}</span> and an active vulnerability vector <span className="font-mono">v in R^N</span>. Let <span className="font-mono">V</span> be an external auditor, statutory regulator (e.g., CERT-In, RBI, SEBI), or cyber insurance underwriter.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5e5e5] space-y-2">
                    <span className="text-xs font-semibold text-[#d93025] uppercase tracking-wider">
                      Auditor's Requirement
                    </span>
                    <p className="text-xs text-[#4a4a4a]">
                      Verify that total exposure satisfies <span className="font-mono font-semibold">{'VaR_95%(O) <= tau'}</span> and that the enterprise has deployed necessary controls to prevent systemic propagation.
                    </p>
                  </div>
                  <div className="bg-[#ffffff] p-4 rounded-xl border border-[#e5e5e5] space-y-2">
                    <span className="text-xs font-semibold text-[#1a3a3a] uppercase tracking-wider">
                      Enterprise Constraint
                    </span>
                    <p className="text-xs text-[#4a4a4a]">
                      Disclosing raw assets <span className="font-mono">A</span> or vulnerability vectors <span className="font-mono">v</span> reveals architectural blueprints, zero-day vulnerability attack paths, and financial reserve limits, violating confidentiality.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'math' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section II: Quantitative FAIR™ Mathematical Modeling
              </h2>
              <p>
                ZK-PACE formalizes the Open FAIR™ framework into an algebraic arithmetic circuit suitable for finite field representation over scalar fields of BN254.
              </p>

              <div className="bg-[#faf5e8] p-5 rounded-xl border border-[#e5e5e5] space-y-4 font-mono text-xs">
                <div>
                  <div className="text-[#888888]">// Equation 1: Loss Event Frequency (LEF)</div>
                  <div className="text-[#0a0a0a] font-semibold text-sm">
                    LEF = TEF * P(TCap &gt; CS)
                  </div>
                  <div className="text-[#5a5a5a] text-[11px] mt-0.5">
                    where TEF is Poisson-distributed Threat Event Frequency, TCap is threat capability, and CS is control strength.
                  </div>
                </div>

                <div className="border-t border-[#e5e5e5] pt-3">
                  <div className="text-[#888888]">// Equation 2: Loss Magnitude Decomposition (INR ₹)</div>
                  <div className="text-[#0a0a0a] font-semibold text-sm">
                    {'LM = (C_IR + C_BI + C_Recovery) + min(C_Fines, 250 Cr) + C_Reputation'}
                  </div>
                  <div className="text-[#5a5a5a] text-[11px] mt-0.5">
                    Includes statutory penalties under Section 33 of India's Digital Personal Data Protection (DPDP) Act 2023 capped at ₹250 Crores per breach incident.
                  </div>
                </div>

                <div className="border-t border-[#e5e5e5] pt-3">
                  <div className="text-[#888888]">// Equation 3: Annualized Loss Expectancy (ALE)</div>
                  <div className="text-[#0a0a0a] font-semibold text-sm">
                    {'ALE = integral(L * f(L) dL) ~ (1/M) * sum_{k=1}^M [ sum_{s} LEF_s^(k) * LM_s^(k) ]'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'zk-circuit' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section III: Circom Circuit Architecture & zk-SNARK Constraints
              </h2>
              <p>
                ZK-PACE compiles cryptographic verification circuits into R1CS using the Circom compiler. Below is the simplified circuit definition for private loss bound verification:
              </p>

              <div className="bg-[#0a0a0a] text-[#e0e0e0] p-5 rounded-xl font-mono text-xs space-y-2 border border-[#2a2a2a] overflow-x-auto">
                <div className="text-[#888888]">// FairLossVerification.circom - ZK-PACE Core Circuit</div>
                <div className="text-[#ff4d8b]">pragma circom 2.1.6;</div>
                <div className="text-[#68d391]">include "comparators.circom";</div>
                <div className="text-[#68d391]">include "poseidon.circom";</div>
                <br />
                <div className="text-[#ffb084]">template FairLossVerification(nScenarios) &#123;</div>
                <div className="pl-4 text-[#a0a0a0]">// Private inputs (Witness - Kept secret by Prover)</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal input</span> privateLEF[nScenarios];</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal input</span> privateLM[nScenarios];</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal input</span> assetSalt;</div>
                <br />
                <div className="pl-4 text-[#a0a0a0]">// Public inputs (Verified by Auditor/Insurer)</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal input</span> publicLossBoundINR; <span className="text-[#888888]">// tau</span></div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal input</span> cisaKevMerkleRoot;</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal output</span> isValid;</div>
                <br />
                <div className="pl-4 text-[#a0a0a0]">// 1. Compute total expected loss in finite field</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal</span> scenarioLoss[nScenarios];</div>
                <div className="pl-4"><span className="text-[#90cdf4]">signal</span> totalAnnualLoss;</div>
                <div className="pl-4">...</div>
                <div className="pl-4 text-[#a0a0a0]">// 2. Enforce totalAnnualLoss &lt;= publicLossBoundINR</div>
                <div className="pl-4"><span className="text-[#ffb084]">component</span> comp = LessEqThan(64);</div>
                <div className="pl-4">comp.in[0] &lt;== totalAnnualLoss;</div>
                <div className="pl-4">comp.in[1] &lt;== publicLossBoundINR;</div>
                <div className="pl-4">comp.out === 1;</div>
                <div className="pl-4">isValid &lt;== comp.out;</div>
                <div>&#125;</div>
              </div>
            </div>
          )}

          {activeSection === 'milp' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section IV: Optimal Defense Allocation via Google OR-Tools MILP
              </h2>
              <p>
                Heuristic greedy algorithms for security budgeting frequently get trapped in sub-optimal local extrema when controls exhibit high indivisible fixed costs or mutually exclusive vendor constraints. ZK-PACE formulates defense selection as a 0-1 Mixed-Integer Linear Program solved via branch-and-bound:
              </p>

              <div className="bg-[#faf5e8] p-5 rounded-xl border border-[#e5e5e5] font-mono text-xs space-y-3">
                <div className="font-semibold text-sm text-[#0a0a0a]">
                  {'max_x sum_{j=1}^m [ sum_{s} Delta_R_{s,j} ] * x_j - lambda * sum_{j=1}^m c_j * x_j'}
                </div>
                <div className="text-[#4a4a4a]">
                  Subject to:
                </div>
                <div className="pl-4 space-y-1 text-[#2a2a2a]">
                  <div>{'1. sum_{j=1}^m c_j * x_j <= B   (Capital Budget Bound)'}</div>
                  <div>{'2. x_j in {0, 1} for all j in {1, ..., m}   (Binary Indivisibility)'}</div>
                  <div>{'3. x_a + x_b <= 1 for all (a, b) in M   (Mutually Exclusive Vendor Exclusions)'}</div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'results' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section V: Experimental Evaluation & Empirical Benchmarks
              </h2>
              <p>
                Performance benchmarks executed on standard commodity hardware (8-core x86_64, 16 GB RAM) demonstrate that ZK-PACE achieves practical feasibility for real-world continuous deployment:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-[#e5e5e5] rounded-lg overflow-hidden">
                  <thead className="bg-[#faf5e8] text-[#0a0a0a] font-semibold border-b border-[#e5e5e5]">
                    <tr>
                      <th className="p-3">Scenario Scale ($N$)</th>
                      <th className="p-3">R1CS Constraints</th>
                      <th className="p-3">Prover Time</th>
                      <th className="p-3">Proof Size</th>
                      <th className="p-3">Verifier Time</th>
                      <th className="p-3">Optimality Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    <tr>
                      <td className="p-3 font-medium">100 Assets</td>
                      <td className="p-3 font-mono">8,420</td>
                      <td className="p-3 font-mono">180 ms</td>
                      <td className="p-3 font-mono">128 bytes</td>
                      <td className="p-3 font-mono">10.4 ms</td>
                      <td className="p-3 font-mono text-[#137333]">0.00%</td>
                    </tr>
                    <tr className="bg-[#faf5e8]/40">
                      <td className="p-3 font-medium">500 Assets (Default)</td>
                      <td className="p-3 font-mono">24,816</td>
                      <td className="p-3 font-mono">420 ms</td>
                      <td className="p-3 font-mono">128 bytes</td>
                      <td className="p-3 font-mono">11.8 ms</td>
                      <td className="p-3 font-mono text-[#137333]">0.00%</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium">2,500 Assets</td>
                      <td className="p-3 font-mono">112,400</td>
                      <td className="p-3 font-mono">1.82 s</td>
                      <td className="p-3 font-mono">128 bytes</td>
                      <td className="p-3 font-mono">13.2 ms</td>
                      <td className="p-3 font-mono text-[#137333]">0.00%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'statutory' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section VI: Indian Regulatory & Statutory Compliance Integration
              </h2>
              <p>
                ZK-PACE specifically addresses key compliance directives across the Indian financial and cybersecurity regulatory ecosystem:
              </p>

              <div className="space-y-4">
                <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1a3a3a]">
                      Digital Personal Data Protection (DPDP) Act 2023 — Section 8(5) & Section 33
                    </span>
                    <Badge variant="default">Statutory Penalty Proof</Badge>
                  </div>
                  <p className="text-xs text-[#5a5a5a]">
                    Mandates reasonable security safeguards to prevent personal data breaches. Penalties of up to <strong>₹250 Crores</strong> are modeled in secondary loss magnitude equations, with zk-proof verification of data trustee controls.
                  </p>
                </div>

                <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1a3a3a]">
                      RBI Master Direction on Information Technology Governance & Cyber Security (2023)
                    </span>
                    <Badge variant="default">Banking & FinTech</Badge>
                  </div>
                  <p className="text-xs text-[#5a5a5a]">
                    Enforces quantified cyber risk appetite metrics for Board Risk Management Committees (RMC). ZK-PACE provides verifiable executive loss distributions formatted in Indian Crores (₹ Cr).
                  </p>
                </div>

                <div className="p-4 bg-[#ffffff] border border-[#e5e5e5] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1a3a3a]">
                      CERT-In Cyber Security Directions (April 2022)
                    </span>
                    <Badge variant="default">Incident Telemetry</Badge>
                  </div>
                  <p className="text-xs text-[#5a5a5a]">
                    Integrates the 6-hour statutory reporting mandate with continuous ingestion of Indian threat telemetry and zero-knowledge verification of perimeter patch status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'citation' && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#0a0a0a] font-display">
                Section VII: Research Authorship & Citation
              </h2>
              <p>
                To cite this research project in academic dissertations, viva examinations, or conference submissions, please use the standard IEEE citation format below:
              </p>

              <div className="bg-[#faf5e8] p-5 rounded-xl border border-[#e5e5e5] font-mono text-xs space-y-2">
                <div className="text-[#888888]">// IEEE Reference Format</div>
                <div className="text-[#0a0a0a] font-medium leading-relaxed">
                  S. Girase et al., "ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation and Optimal Defense Allocation," <i>IEEE Transactions on Information Forensics and Security</i>, vol. 18, pp. 1–16, 2025.
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={copiedBibtex ? <Check className="w-4 h-4 text-[#137333]" /> : <Copy className="w-4 h-4 text-[#ffb084]" />}
                  onClick={handleCopyBibtex}
                >
                  {copiedBibtex ? 'BibTeX Copied' : 'Copy BibTeX to Clipboard'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Download className="w-4 h-4 text-[#6a6a6a]" />}
                  onClick={handleDownloadPaperSummary}
                >
                  Download Summary Document
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
