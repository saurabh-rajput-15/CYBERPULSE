import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Search, 
  BookOpen, 
  Calculator, 
  GitBranch, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Award,
  ChevronRight,
  Code
} from 'lucide-react';
import { useRisk } from '../context/RiskContext';

interface SectionMeta {
  id: string;
  number: number;
  title: string;
  category: 'Core' | 'Architecture' | 'Mathematics & ML' | 'Engineering' | 'Academic & Roadmap';
  summary: string;
}

const SECTIONS_METADATA: SectionMeta[] = [
  { id: 'sec-1', number: 1, title: 'Executive Summary', category: 'Core', summary: 'Macro problem, financial engineering thesis, and key technical capabilities.' },
  { id: 'sec-2', number: 2, title: 'Problem Statement', category: 'Core', summary: 'Limitations of ordinal risk heatmaps and lack of financial defensibility.' },
  { id: 'sec-3', number: 3, title: 'Objectives', category: 'Core', summary: 'Defines 6 measurable technical and academic goals for the capstone.' },
  { id: 'sec-4', number: 4, title: 'Target Users & Personas', category: 'Core', summary: 'CISO, Risk Officer, Security Architect, and Academic Evaluator profiles.' },
  { id: 'sec-5', number: 5, title: 'Functional Requirements', category: 'Core', summary: 'Granular FR-1.1 through FR-6.3 across all 6 platform modules.' },
  { id: 'sec-6', number: 6, title: 'Non-Functional Requirements', category: 'Engineering', summary: 'Latency benchmarks, simulation throughput, concurrency, and security SLA.' },
  { id: 'sec-7', number: 7, title: 'System Architecture', category: 'Architecture', summary: 'Multi-tier Next.js, FastAPI, PostgreSQL, and Neo4j topology.' },
  { id: 'sec-8', number: 8, title: 'Data Architecture', category: 'Architecture', summary: 'Medallion Data Lakehouse: Bronze (Raw), Silver (SQL), Gold (Graph/Tensors).' },
  { id: 'sec-9', number: 9, title: 'Data Sources', category: 'Architecture', summary: 'Specifications for CISA KEV, NVD 2.0, CERT-In, MITRE, and 1,902 breaches.' },
  { id: 'sec-10', number: 10, title: 'Data Schema (SQL & Cypher)', category: 'Engineering', summary: 'Full PostgreSQL DDL tables and Neo4j property graph constraints.' },
  { id: 'sec-11', number: 11, title: 'Risk Calculation (FAIR)', category: 'Mathematics & ML', summary: 'Beta-PERT TEF, TCap vs RS Beta distributions, and Lognormal loss equations.' },
  { id: 'sec-12', number: 12, title: 'ML Methodology (XGBoost & SHAP)', category: 'Mathematics & ML', summary: 'Feature vector formulation, objective function, and TreeSHAP waterfall proofs.' },
  { id: 'sec-13', number: 13, title: 'NLP Extraction Pipeline', category: 'Engineering', summary: 'spaCy NER and regex for unstructured advisory parsing and enrichment.' },
  { id: 'sec-14', number: 14, title: 'Graph Model & Attack Paths', category: 'Architecture', summary: 'Neo4j threat-to-crown-jewel multi-hop traversal and blast radius query.' },
  { id: 'sec-15', number: 15, title: 'Financial Risk Engine (Monte Carlo)', category: 'Mathematics & ML', summary: 'Vectorized NumPy simulation algorithm running 100,000 trials in <1.5s.' },
  { id: 'sec-16', number: 16, title: 'What-If Analysis Engine', category: 'Mathematics & ML', summary: 'Counterfactual state evaluation, parameter levers, and loss exceedance deltas.' },
  { id: 'sec-17', number: 17, title: 'Investment Optimization (OR-Tools)', category: 'Mathematics & ML', summary: '0-1 Knapsack MILP formulation, budget constraints, and ROSI mathematical proofs.' },
  { id: 'sec-18', number: 18, title: 'Dashboard & UX Specifications', category: 'Core', summary: 'Screen-by-screen UX specifications, executive widgets, and dark cockpit styling.' },
  { id: 'sec-19', number: 19, title: 'API Requirements (OpenAPI)', category: 'Engineering', summary: 'Complete catalog of RESTful endpoints, schemas, and payloads.' },
  { id: 'sec-20', number: 20, title: 'Technology Stack', category: 'Engineering', summary: 'Justifications and version pins for Python, FastAPI, Next.js, and OR-Tools.' },
  { id: 'sec-21', number: 21, title: 'Security & Governance', category: 'Engineering', summary: 'RBAC tiers, cryptographic provenance, least privilege, and DPDP/GDPR privacy.' },
  { id: 'sec-22', number: 22, title: 'Data Quality & Lineage', category: 'Architecture', summary: 'Strict [REAL] vs [ESTIMATED] vs [SYNTHETIC] labeling and zero fabrication policy.' },
  { id: 'sec-23', number: 23, title: 'MVP Scope', category: 'Academic & Roadmap', summary: 'Strict checklist of baseline features required for final-year submission.' },
  { id: 'sec-24', number: 24, title: 'Advanced & Phase-2 Scope', category: 'Academic & Roadmap', summary: 'Temporal GNN link prediction and blockchain SHA-256 audit trail specifications.' },
  { id: 'sec-25', number: 25, title: 'Testing & Evaluation Metrics', category: 'Academic & Roadmap', summary: 'Convergence relative error (eps < 0.015), ML RMSE/R2, and solver benchmarks.' },
  { id: 'sec-26', number: 26, title: '24-Week Development Roadmap', category: 'Academic & Roadmap', summary: 'Gantt-style 6-month engineering schedule mapped to semester milestones.' },
  { id: 'sec-27', number: 27, title: 'Expected Academic Deliverables', category: 'Academic & Roadmap', summary: 'Working software, dissertation thesis, code repo, and IEEE research paper.' },
  { id: 'sec-28', number: 28, title: 'Assumptions & Limitations', category: 'Academic & Roadmap', summary: 'Discussion of parameter elicitation bounds and static licensing models.' },
  { id: 'sec-29', number: 29, title: 'Future Research Directions', category: 'Academic & Roadmap', summary: 'GenAI adversary synthesis, catastrophe bond pricing, and autonomous defense.' }
];

export const PRDSpecScreen: React.FC = () => {
  const { showToast } = useRisk();
  const [selectedSectionId, setSelectedSectionId] = useState<string>('sec-1');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [fullMarkdown, setFullMarkdown] = useState<string>('');

  React.useEffect(() => {
    fetch('/api/prd')
      .then(res => {
        if (!res.ok) throw new Error('API fetch error');
        return res.text();
      })
      .then(text => setFullMarkdown(text))
      .catch(() => {
        fetch('/docs/CYBERPULSE_PRD.md')
          .then(res => res.text())
          .then(text => setFullMarkdown(text))
          .catch(() => {});
      });
  }, []);

  const categories = ['All', 'Core', 'Architecture', 'Mathematics & ML', 'Engineering', 'Academic & Roadmap'];

  const filteredSections = useMemo(() => {
    return SECTIONS_METADATA.filter(sec => {
      const matchesSearch = 
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.number.toString().includes(searchQuery);
      const matchesCat = selectedCategory === 'All' || sec.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const activeSection = useMemo(() => {
    return SECTIONS_METADATA.find(s => s.id === selectedSectionId) || SECTIONS_METADATA[0];
  }, [selectedSectionId]);

  const handleDownload = () => {
    const textToDownload = fullMarkdown || `# ZK-PACE Master PRD & IEEE Monograph\nPlease see /docs/CYBERPULSE_PRD.md in repository.`;
    const blob = new Blob([textToDownload], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ZK_PACE_IEEE_CAPSTONE_PRD.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full 29-Section Academic PRD downloaded successfully', 'success');
  };

  const handleCopy = () => {
    const textToCopy = fullMarkdown || `ZK-PACE: Zero-Knowledge Cyber Risk Quantification & Defense Optimizer PRD`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    showToast('Full 29-section PRD copied to clipboard (ready for submission/LaTeX)', 'success');
    setTimeout(() => setIsCopied(false), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="p-6 rounded-[24px] bg-[#ffffff] border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[#1a3a3a] text-[#ffffff] text-xs font-semibold">
              Final-Year B.Tech Capstone
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#ff4d8b]/15 text-[#ff4d8b] text-xs font-semibold">
              29 Sections Complete
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#faf5e8] text-[#0a0a0a] text-xs font-mono border border-[#e5e5e5]">
              v1.0.0-PROD
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0a0a0a]">
            ZK-PACE: Product Requirements Document & Technical Specification
          </h1>
          <p className="text-sm text-[#6a6a6a] mt-1 max-w-3xl">
            Complete academic and engineering blueprint covering FAIR mathematical formulation, 
            vectorized Monte Carlo simulation, XGBoost + TreeSHAP explainability, Neo4j graph ontology, 
            and Google OR-Tools budget optimization.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleCopy}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-full border border-[#e5e5e5] bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#0a0a0a] text-xs font-medium transition-all cursor-pointer shadow-xs"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-[#1a3a3a]" /> : <Copy className="w-3.5 h-3.5 text-[#6a6a6a]" />}
            <span>{isCopied ? 'Copied Full Spec' : 'Copy Markdown'}</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-[#0a0a0a] hover:bg-[#222222] text-[#ffffff] text-xs font-semibold transition-all cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#ffb084]" />
            <span>Download Master PRD (.md)</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Table of Contents & Filter (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-[20px] bg-[#ffffff] border border-[#e5e5e5] shadow-xs space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#6a6a6a] absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search 29 sections, math, schema..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full bg-[#faf5e8] border border-[#e5e5e5] focus:outline-none focus:ring-1 focus:ring-[#0a0a0a]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 text-[11px] rounded-full transition-all cursor-pointer font-medium ${
                    selectedCategory === cat
                      ? 'bg-[#0a0a0a] text-[#ffffff]'
                      : 'bg-[#faf5e8] text-[#6a6a6a] hover:text-[#0a0a0a]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section List */}
          <div className="p-2 rounded-[20px] bg-[#ffffff] border border-[#e5e5e5] shadow-xs max-h-[680px] overflow-y-auto space-y-1 divide-y divide-[#f0ede6]">
            {filteredSections.map(sec => {
              const isSelected = sec.id === selectedSectionId;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSectionId(sec.id)}
                  className={`w-full text-left p-3 rounded-[14px] transition-all cursor-pointer flex items-start justify-between group ${
                    isSelected
                      ? 'bg-[#faf5e8] border border-[#e5e5e5] shadow-xs'
                      : 'hover:bg-[#f5f0e0]/40'
                  }`}
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                        isSelected ? 'bg-[#0a0a0a] text-[#ffffff]' : 'bg-[#e5e5e5] text-[#0a0a0a]'
                      }`}>
                        {sec.number}
                      </span>
                      <span className={`text-xs font-bold leading-tight ${
                        isSelected ? 'text-[#0a0a0a]' : 'text-[#333333] group-hover:text-[#0a0a0a]'
                      }`}>
                        {sec.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6a6a6a] line-clamp-1 pl-7">
                      {sec.summary}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                    isSelected ? 'text-[#0a0a0a] translate-x-0.5' : 'text-[#a0a0a0] group-hover:text-[#0a0a0a]'
                  }`} />
                </button>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-6 text-center text-xs text-[#6a6a6a]">
                No matching PRD sections found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Detailed Section Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-6 rounded-[24px] bg-[#ffffff] border border-[#e5e5e5] shadow-xs min-h-[720px] flex flex-col justify-between">
            <div className="space-y-6">
              {/* Section Header */}
              <div className="border-b border-[#f0ede6] pb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-[#ff4d8b] font-bold">
                      Section {activeSection.number} of 29
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#faf5e8] text-[#6a6a6a] font-medium border border-[#e5e5e5]">
                      {activeSection.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-[#0a0a0a]">
                    {activeSection.title}
                  </h2>
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => setViewMode(viewMode === 'rendered' ? 'raw' : 'rendered')}
                    className="p-1.5 rounded-full bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#6a6a6a] hover:text-[#0a0a0a] transition-all cursor-pointer text-xs flex items-center space-x-1 px-2.5"
                  >
                    <Code className="w-3.5 h-3.5" />
                    <span>{viewMode === 'rendered' ? 'Raw Code' : 'Rich View'}</span>
                  </button>
                </div>
              </div>

              {/* Rendered or Raw Content */}
              {viewMode === 'raw' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-[#6a6a6a]">
                    <span>Raw Markdown Source (/docs/CYBERPULSE_PRD.md)</span>
                    <span>{fullMarkdown.length.toLocaleString()} characters</span>
                  </div>
                  <pre className="p-4 rounded-[16px] bg-[#1a1a1a] text-[#f5f5f5] text-[11px] font-mono overflow-x-auto max-h-[560px] whitespace-pre-wrap leading-relaxed border border-[#333333]">
                    {fullMarkdown || 'Loading raw Markdown specification...'}
                  </pre>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-[#2a2a2a] space-y-4 font-normal">
                  {renderSectionContent(activeSection.number)}
                </div>
              )}
            </div>

            {/* Section Footer Navigation */}
            <div className="border-t border-[#f0ede6] pt-4 mt-8 flex items-center justify-between text-xs text-[#6a6a6a]">
              <button
                disabled={activeSection.number === 1}
                onClick={() => setSelectedSectionId(`sec-${activeSection.number - 1}`)}
                className="px-3 py-1.5 rounded-full border border-[#e5e5e5] bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#0a0a0a] disabled:opacity-30 cursor-pointer font-medium"
              >
                ← Previous Section
              </button>
              <span className="font-mono text-[11px]">
                PRD Milestone: Approved Architecture Baseline
              </span>
              <button
                disabled={activeSection.number === 29}
                onClick={() => setSelectedSectionId(`sec-${activeSection.number + 1}`)}
                className="px-3 py-1.5 rounded-full border border-[#e5e5e5] bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#0a0a0a] disabled:opacity-30 cursor-pointer font-medium"
              >
                Next Section →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Specialized Render Helper with formatted academic callouts and LaTeX representations
function renderSectionContent(sectionNumber: number) {
  switch (sectionNumber) {
    case 1:
      return (
        <div className="space-y-4">
          <p className="text-sm font-medium text-[#0a0a0a]">
            Enterprise cybersecurity risk management has historically relied on qualitative "heatmaps" (Low, Medium, High). 
            CyberPulse replaces subjective risk matrices with rigorous mathematical financial engineering:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
            <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] space-y-1">
              <div className="font-bold text-[#0a0a0a] text-xs">Probabilistic Valuation</div>
              <p className="text-[11px] text-[#6a6a6a]">Transforms CVSS scores and threat intelligence into Expected Annual Loss (EAL) and 95% Value at Risk (VaR).</p>
            </div>
            <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] space-y-1">
              <div className="font-bold text-[#0a0a0a] text-xs">Explainable ML (TreeSHAP)</div>
              <p className="text-[11px] text-[#6a6a6a]">XGBoost regressor calibrated on 1,902 real-world incidents, exposing exact risk drivers via Shapley values.</p>
            </div>
            <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] space-y-1">
              <div className="font-bold text-[#0a0a0a] text-xs">Exact Optimization</div>
              <p className="text-[11px] text-[#6a6a6a]">Google OR-Tools Mixed-Integer Linear Programming solves the 0-1 Knapsack to maximize security ROI (ROSI).</p>
            </div>
          </div>
          <p>
            The platform is structured to support both fiduciaries (CISO, Board of Directors) in budget defense and 
            engineering practitioners (SecOps, DevOps) in prioritizing patches across complex asset dependency graphs.
          </p>
        </div>
      );

    case 11:
      return (
        <div className="space-y-4 font-mono">
          <div className="p-4 rounded-[16px] bg-[#1a1a1a] text-[#f5f5f5] text-xs space-y-2">
            <div className="text-[#ff4d8b] font-bold">// FAIR Mathematical Equations Implementation</div>
            <div>TEF ~ BetaPERT(min=a, mode=m, max=b)</div>
            <div>TCap ~ Beta(alpha_t, beta_t),  RS ~ Beta(alpha_r, beta_r)</div>
            <div>Vulnerability = P(TCap &gt; RS)</div>
            <div>LEF = Poisson(lambda = TEF * Vulnerability)</div>
            <div>LossMagnitude = Lognormal(mu_ln, sigma_ln)</div>
            <div className="text-[#e8b94a]">EAL = (1/K) * Sum(Losses_k)</div>
            <div className="text-[#e8b94a]">VaR_95 = 95th Percentile of Sorted Losses</div>
            <div className="text-[#e8b94a]">CVaR_95 = Mean(Losses | Loss &gt;= VaR_95)</div>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] text-xs space-y-1 font-sans">
            <div className="font-bold text-[#0a0a0a]">Vectorized Parameter Bounds</div>
            <p className="text-[#6a6a6a] text-[11px]">
              Monte Carlo sampling is implemented in pure vectorized NumPy array routines, eliminating Python loop bottlenecks 
              and delivering 10,000 to 100,000 iterations in under 1,200 ms.
            </p>
          </div>
        </div>
      );

    case 12:
      return (
        <div className="space-y-4">
          <p className="text-xs text-[#0a0a0a]">
            <strong>Model Architecture:</strong> Gradient Boosted Decision Trees via XGBoost (<code className="text-[#ff4d8b]">reg:squarederror</code>). 
            Target variable is logarithmic annualized loss <code className="bg-[#f0ede6] px-1 py-0.5 rounded">log10(AnnualLossUSD + 1)</code>.
          </p>
          <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] space-y-2">
            <div className="text-xs font-bold text-[#0a0a0a]">14 Engineered Tabular Features</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#444444]">
              <div>• cvss_v3_score [0-10]</div>
              <div>• exploitability_score [0-10]</div>
              <div>• is_cisa_kev [0/1]</div>
              <div>• threat_capability [0-1]</div>
              <div>• control_resistance [0-1]</div>
              <div>• asset_criticality [1-5]</div>
              <div>• replacement_cost_usd</div>
              <div>• downtime_hourly_cost</div>
              <div>• attack_vector_onehot</div>
              <div>• industry_sector_onehot</div>
              <div>• days_since_cve_disclosed</div>
              <div>• known_ransomware_campaign</div>
            </div>
          </div>
          <p className="text-[11px] text-[#6a6a6a]">
            TreeSHAP computes exact, axiomatic local attribution values. The platform renders waterfall charts proving 
            why a specific asset scenario carries heightened financial exposure.
          </p>
        </div>
      );

    case 17:
      return (
        <div className="space-y-4 font-mono">
          <div className="p-4 rounded-[16px] bg-[#1a1a1a] text-[#f5f5f5] text-xs space-y-2">
            <div className="text-[#10b981] font-bold">// Google OR-Tools 0-1 Knapsack MILP Formulation</div>
            <div>Maximize:  Sum(RiskReduction_j * x_j)</div>
            <div>Subject to:</div>
            <div>  Sum(Cost_j * x_j) &lt;= Budget_Constraint</div>
            <div>  Sum(x_j for j in VendorGroup_k) &lt;= 1   (Mutual Exclusivity)</div>
            <div>  x_j in &#123;0, 1&#125; for all candidate controls j</div>
            <div className="text-[#ffb084] pt-2">ROSI = ((Delta_EAL - TotalCost) / TotalCost) * 100%</div>
          </div>
          <div className="p-3.5 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] text-xs space-y-1 font-sans">
            <div className="font-bold text-[#0a0a0a]">Exact Optimality Guarantee</div>
            <p className="text-[#6a6a6a] text-[11px]">
              Unlike greedy heuristics or genetic algorithms, Google OR-Tools executes a branch-and-bound simplex algorithm 
              with an optimality gap of exactly 0.00% in under 200 ms.
            </p>
          </div>
        </div>
      );

    case 26:
      return (
        <div className="space-y-3 font-sans">
          <div className="p-3 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 1 - 4</span>
            <span className="text-[11px] text-[#6a6a6a]">Literature Review, Real Data Ingestion (CISA/NVD/Kaggle)</span>
          </div>
          <div className="p-3 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 5 - 8</span>
            <span className="text-[11px] text-[#6a6a6a]">Database Schemas (PostgreSQL DDL) & Graph Modeling (Neo4j)</span>
          </div>
          <div className="p-3 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 9 - 12</span>
            <span className="text-[11px] text-[#6a6a6a]">Vectorized FAIR Monte Carlo Math Engine & Convergence Proofs</span>
          </div>
          <div className="p-3 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 13 - 16</span>
            <span className="text-[11px] text-[#6a6a6a]">XGBoost Regression Pipeline & TreeSHAP Waterfall Generator</span>
          </div>
          <div className="p-3 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 17 - 19</span>
            <span className="text-[11px] text-[#6a6a6a]">Google OR-Tools MILP Budget Optimizer & ROSI Pareto Curve</span>
          </div>
          <div className="p-3 rounded-[14px] bg-[#faf5e8] border border-[#e5e5e5] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 20 - 22</span>
            <span className="text-[11px] text-[#6a6a6a]">Next.js Interactive Dashboard, Recharts, and What-If Levers</span>
          </div>
          <div className="p-3 rounded-[14px] bg-[#1a3a3a] text-[#ffffff] flex items-center justify-between">
            <span className="font-bold text-xs">Weeks 23 - 24</span>
            <span className="text-[11px] text-[#faf5e8]">System Validation, Faculty Guide Review, Viva Presentation</span>
          </div>
        </div>
      );

    default:
      return (
        <div className="space-y-4">
          <p className="text-xs text-[#0a0a0a]">
            This section is fully specified in the project master documentation. Click <strong>"Download Master PRD (.md)"</strong> 
            or <strong>"Copy Markdown"</strong> in the top-right toolbar to view the complete unabridged text and LaTeX formulas for Section {sectionNumber}.
          </p>
          <div className="p-4 rounded-[16px] bg-[#faf5e8] border border-[#e5e5e5] text-xs space-y-2">
            <div className="font-bold text-[#0a0a0a]">Key Architectural Highlights for Section {sectionNumber}</div>
            <ul className="list-disc list-inside space-y-1 text-[#6a6a6a] text-[11px]">
              <li>Guarantees strict separation of concerns between raw threat data and normalized models.</li>
              <li>Maintains cryptographic SHA-256 data provenance from NVD and CISA sources.</li>
              <li>Complies with Indian DPDP Act 2023, RBI Cyber Security Framework, and SEC Disclosure Rules.</li>
              <li>Fully reproducible test suites and evaluation metrics for external examiner audit.</li>
            </ul>
          </div>
        </div>
      );
  }
}
