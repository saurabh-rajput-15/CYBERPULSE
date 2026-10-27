import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  Building2,
  DollarSign,
  Clock,
  Key,
  Flame,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  Sliders,
  Target,
  ShieldCheck,
  Zap,
  Timer,
  Scale,
  FileText,
  Lock
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useRisk } from '../hooks/useRisk';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import {
  HistoricalIncident,
  AttackVectorStats,
  NvdCveItem,
  RealDataSummary,
  MonteCarloSimulationResult,
  ContainmentVelocityResult,
  DataClassificationTier,
  BlastRadiusResult
} from '../types';
import { CveCatalogView } from './CveCatalogView';

export const RealDataScreen: React.FC = () => {
  const { showToast, selectedScenario, exposureData, navigateToScenario } = useRisk();

  // Sub-tab navigation
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'cvelist' | 'cisa' | 'nvd' | 'distributions'>('incidents');

  // Summary state
  const [summary, setSummary] = useState<RealDataSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);

  // Incidents state
  const [incidents, setIncidents] = useState<HistoricalIncident[]>([]);
  const [incidentTotal, setIncidentTotal] = useState<number>(0);
  const [incidentSearch, setIncidentSearch] = useState<string>('');
  const [selectedVector, setSelectedVector] = useState<string>('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [isPeerModeActive, setIsPeerModeActive] = useState<boolean>(false);
  const [lossFilter, setLossFilter] = useState<'ALL' | 'UNDER_1M' | '1M_10M' | '10M_100M' | 'OVER_100M'>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<HistoricalIncident | null>(null);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Map active organization preset to detected industry sector
  const peerIndustry = React.useMemo(() => {
    const ind = exposureData?.organization?.industry?.toLowerCase() || '';
    const name = exposureData?.organization?.name?.toLowerCase() || '';
    if (ind.includes('health') || ind.includes('hospital') || name.includes('apollo')) return 'Healthcare';
    if (ind.includes('fintech') || ind.includes('payment') || ind.includes('bank') || name.includes('razorpay') || name.includes('hdfc')) return 'FinTech & Banking';
    if (ind.includes('software') || ind.includes('cloud') || ind.includes('saas') || name.includes('zoho')) return 'Technology & Cloud SaaS';
    return 'FinTech & Banking';
  }, [exposureData]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedIncidents = React.useMemo(() => {
    if (!sortConfig) return incidents;
    return [...incidents].sort((a, b) => {
      let aVal: any = a[sortConfig.key as keyof HistoricalIncident];
      let bVal: any = b[sortConfig.key as keyof HistoricalIncident];

      if (sortConfig.key === 'loss') {
        aVal = a.damageLossINR;
        bVal = b.damageLossINR;
      }

      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [incidents, sortConfig]);

  // CISA KEV state
  const [cisaVulns, setCisaVulns] = useState<any[]>([]);
  const [cisaTotal, setCisaTotal] = useState<number>(0);
  const [cisaSearch, setCisaSearch] = useState<string>('');
  const [cisaVendor, setCisaVendor] = useState<string>('ALL');
  const [cisaVendorsList, setCisaVendorsList] = useState<{ vendor: string; count: number }[]>([]);
  const [ransomwareOnly, setRansomwareOnly] = useState<boolean>(false);
  const [isLoadingCisa, setIsLoadingCisa] = useState<boolean>(false);

  // NVD CVE state
  const [nvdItems, setNvdItems] = useState<NvdCveItem[]>([]);
  const [nvdTotal, setNvdTotal] = useState<number>(0);
  const [nvdSearch, setNvdSearch] = useState<string>('');
  const [nvdSeverity, setNvdSeverity] = useState<string>('ALL');
  const [nvdSeverityBreakdown, setNvdSeverityBreakdown] = useState<Record<string, number>>({});
  const [isLoadingNvd, setIsLoadingNvd] = useState<boolean>(false);

  // Stats state
  const [stats, setStats] = useState<any>(null);

  // Dwell Time & Velocity Simulator Steps
  const DWELL_STEPS = [
    { hours: 0.5, label: '30m', title: '30 Mins (Zero Trust Isolation)' },
    { hours: 1, label: '1h', title: '1 Hour (Sub-Hour Response)' },
    { hours: 2, label: '2h', title: '2 Hours' },
    { hours: 4, label: '4h', title: '4 Hours (Rapid Containment)' },
    { hours: 8, label: '8h', title: '8 Hours' },
    { hours: 12, label: '12h', title: '12 Hours (Automated SOAR)' },
    { hours: 24, label: '1d', title: '24 Hours (1 Day)' },
    { hours: 48, label: '2d', title: '48 Hours (2 Days)' },
    { hours: 72, label: '3d', title: '72 Hours (DPDP Notification Window)' },
    { hours: 168, label: '7d', title: '7 Days (1 Week)' },
    { hours: 360, label: '15d', title: '15 Days' },
    { hours: 720, label: '30d', title: '30 Days (1 Month)' },
    { hours: 864, label: '36d', title: '36 Days (24/7 Managed SOC)' },
    { hours: 1440, label: '60d', title: '60 Days' },
    { hours: 4440, label: '185d', title: '185 Days (Reactive EDR/SIEM)' },
    { hours: 6648, label: '277d', title: '277 Days (Legacy Auditing Baseline)' },
  ];

  const VELOCITY_PRESETS = [
    { id: 'zero-trust', name: 'Zero-Trust ZK-PACE', hours: 0.5, tag: '30m', desc: 'Autonomous micro-isolation & continuous attestation' },
    { id: 'soar-ai', name: 'Automated SOAR', hours: 12, tag: '12h', desc: 'Pre-scripted playbooks & SIEM API quarantine' },
    { id: 'managed-soc', name: 'Managed SOC / MDR', hours: 864, tag: '36d', desc: '24/7 human analysts triage alerts within SLAs' },
    { id: 'reactive', name: 'Reactive EDR / Alerts', hours: 4440, tag: '185d', desc: 'Standard alerting without automated response' },
    { id: 'legacy', name: 'Legacy Auditing', hours: 6648, tag: '277d', desc: 'Post-incident forensics discovered by third parties' },
  ];

  // Containment Velocity state
  const [dwellStepIndex, setDwellStepIndex] = useState<number>(5); // Default 12 hours
  const [velocityPreset, setVelocityPreset] = useState<string>('soar-ai');
  const [velocityResult, setVelocityResult] = useState<ContainmentVelocityResult | null>(null);
  const [isLoadingVelocity, setIsLoadingVelocity] = useState<boolean>(false);

  const fetchVelocity = async (hours: number, sector = mcSector) => {
    try {
      setIsLoadingVelocity(true);
      const params = new URLSearchParams();
      params.set('dwellHours', String(hours));
      if (sector !== 'ALL') params.set('sector', sector);

      const res = await fetch(`/api/real-data/containment-velocity?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setVelocityResult(data);
      }
    } catch (err) {
      console.error('Failed to simulate containment velocity:', err);
    } finally {
      setIsLoadingVelocity(false);
    }
  };

  // Monte Carlo Simulation state
  const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloSimulationResult | null>(null);
  const [mcIterations, setMcIterations] = useState<number>(10000);
  const [mcSector, setMcSector] = useState<string>('ALL');
  const [mcRiskAppetiteCr, setMcRiskAppetiteCr] = useState<number>(50); // ₹50 Cr default
  const [isLoadingMonteCarlo, setIsLoadingMonteCarlo] = useState<boolean>(false);

  const fetchMonteCarlo = async (iterations = mcIterations, sector = mcSector, appetiteCr = mcRiskAppetiteCr) => {
    try {
      setIsLoadingMonteCarlo(true);
      const params = new URLSearchParams();
      params.set('iterations', String(iterations));
      if (sector !== 'ALL') params.set('sector', sector);
      params.set('riskAppetiteINR', String(appetiteCr * 10000000));

      const res = await fetch(`/api/real-data/monte-carlo?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMonteCarloResult(data);
      }
    } catch (err) {
      console.error('Failed to load Monte Carlo simulation:', err);
    } finally {
      setIsLoadingMonteCarlo(false);
    }
  };

  // Data Exposure Blast Radius state
  const defaultDataTier = React.useMemo<DataClassificationTier>(() => {
    const ind = exposureData?.organization?.industry?.toLowerCase() || '';
    const name = exposureData?.organization?.name?.toLowerCase() || '';
    if (ind.includes('health') || ind.includes('hospital') || name.includes('apollo')) return 'HEALTHCARE_PHI';
    if (ind.includes('fintech') || ind.includes('payment') || ind.includes('bank') || name.includes('razorpay') || name.includes('hdfc')) return 'FINANCIAL_PCI';
    if (ind.includes('software') || ind.includes('cloud') || ind.includes('saas') || name.includes('zoho')) return 'CUSTOMER_PII';
    return 'FINANCIAL_PCI';
  }, [exposureData]);

  const [selectedDataTier, setSelectedDataTier] = useState<DataClassificationTier>('FINANCIAL_PCI');
  const [recordsExposed, setRecordsExposed] = useState<number>(250000);
  const [blastRadiusResult, setBlastRadiusResult] = useState<BlastRadiusResult | null>(null);
  const [isLoadingBlastRadius, setIsLoadingBlastRadius] = useState<boolean>(false);

  const fetchBlastRadius = async (records = recordsExposed, tier = selectedDataTier) => {
    try {
      setIsLoadingBlastRadius(true);
      const params = new URLSearchParams();
      params.set('recordsExposed', String(records));
      params.set('tier', tier);

      const res = await fetch(`/api/real-data/blast-radius?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBlastRadiusResult(data);
      }
    } catch (err) {
      console.error('Failed to calculate blast radius:', err);
    } finally {
      setIsLoadingBlastRadius(false);
    }
  };

  useEffect(() => {
    if (defaultDataTier) {
      setSelectedDataTier(defaultDataTier);
      if (activeSubTab === 'distributions') {
        fetchBlastRadius(recordsExposed, defaultDataTier);
      }
    }
  }, [defaultDataTier]);

  useEffect(() => {
    if (activeSubTab === 'distributions') {
      if (!monteCarloResult) fetchMonteCarlo();
      if (!velocityResult) fetchVelocity(DWELL_STEPS[dwellStepIndex].hours, mcSector);
      if (!blastRadiusResult) fetchBlastRadius(recordsExposed, selectedDataTier);
    }
  }, [activeSubTab]);

  // 1. Fetch Real Data Summary
  useEffect(() => {
    async function loadSummary() {
      try {
        setIsLoadingSummary(true);
        const res = await fetch('/api/real-data/summary');
        if (res.ok) {
          const data = await res.json();
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to load real data summary:', err);
      } finally {
        setIsLoadingSummary(false);
      }
    }
    loadSummary();
  }, []);

  // 2. Fetch Incidents
  useEffect(() => {
    async function loadIncidents() {
      try {
        setIsLoadingIncidents(true);
        let minLoss: number | undefined = undefined;
        let maxLoss: number | undefined = undefined;

        if (lossFilter === 'UNDER_1M') {
          maxLoss = 1000000;
        } else if (lossFilter === '1M_10M') {
          minLoss = 1000000;
          maxLoss = 10000000;
        } else if (lossFilter === '10M_100M') {
          minLoss = 10000000;
          maxLoss = 100000000;
        } else if (lossFilter === 'OVER_100M') {
          minLoss = 100000000;
        }

        const params = new URLSearchParams();
        if (incidentSearch) params.set('search', incidentSearch);
        if (selectedVector !== 'ALL') params.set('vector', selectedVector);
        if (selectedYear !== 'ALL') params.set('year', selectedYear);
        if (selectedIndustry !== 'ALL') params.set('industry', selectedIndustry);
        if (minLoss !== undefined) params.set('minLoss', String(minLoss));
        if (maxLoss !== undefined) params.set('maxLoss', String(maxLoss));
        params.set('limit', '60');

        const res = await fetch(`/api/real-data/incidents?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setIncidents(data.incidents || []);
          setIncidentTotal(data.total || 0);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error('Failed to load incidents:', err);
      } finally {
        setIsLoadingIncidents(false);
      }
    }

    if (activeSubTab === 'incidents' || activeSubTab === 'distributions') {
      loadIncidents();
    }
  }, [activeSubTab, incidentSearch, selectedVector, selectedIndustry, lossFilter, selectedYear]);

  // 3. Fetch CISA KEV
  useEffect(() => {
    async function loadCisa() {
      try {
        setIsLoadingCisa(true);
        const params = new URLSearchParams();
        if (cisaSearch) params.set('search', cisaSearch);
        if (cisaVendor !== 'ALL') params.set('vendor', cisaVendor);
        if (ransomwareOnly) params.set('ransomwareOnly', 'true');
        params.set('limit', '50');

        const res = await fetch(`/api/real-data/cisa-kev?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCisaVulns(data.vulnerabilities || []);
          setCisaTotal(data.total || 0);
          if (data.topVendors) setCisaVendorsList(data.topVendors);
        }
      } catch (err) {
        console.error('Failed to load CISA KEV:', err);
      } finally {
        setIsLoadingCisa(false);
      }
    }

    if (activeSubTab === 'cisa') {
      loadCisa();
    }
  }, [activeSubTab, cisaSearch, cisaVendor, ransomwareOnly]);

  // 4. Fetch NVD CVEs
  useEffect(() => {
    async function loadNvd() {
      try {
        setIsLoadingNvd(true);
        const params = new URLSearchParams();
        if (nvdSearch) params.set('search', nvdSearch);
        if (nvdSeverity !== 'ALL') params.set('severity', nvdSeverity);
        params.set('limit', '50');

        const res = await fetch(`/api/real-data/nvd-cves?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setNvdItems(data.cves || []);
          setNvdTotal(data.total || 0);
          if (data.severityBreakdown) setNvdSeverityBreakdown(data.severityBreakdown);
        }
      } catch (err) {
        console.error('Failed to load NVD CVEs:', err);
      } finally {
        setIsLoadingNvd(false);
      }
    }

    if (activeSubTab === 'nvd') {
      loadNvd();
    }
  }, [activeSubTab, nvdSearch, nvdSeverity]);

  // Handle scenario calibration from incident
  const handleCalibrateFromIncident = async (incident: HistoricalIncident) => {
    if (!selectedScenario) return;
    try {
      const res = await fetch('/api/real-data/calibrate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          mode: 'incident',
          incidentIdOrVector: incident.incidentId
        })
      });
      if (res.ok) {
        showToast(
          `Calibrated [${selectedScenario.id}] to real incident: ${incident.incidentName} ($${(incident.damageLossUSD / 1e6).toFixed(1)}M / ₹${(incident.damageLossINR / 1e7).toFixed(1)} Cr)`,
          'success'
        );
        navigateToScenario(selectedScenario.id);
      }
    } catch (err) {
      showToast('Calibration failed', 'alert');
    }
  };

  const handleCalibrateVector = async (mode: 'vector-median' | 'vector-p90') => {
    if (!selectedScenario) return;
    try {
      const res = await fetch('/api/real-data/calibrate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          mode,
          incidentIdOrVector: selectedScenario.category
        })
      });
      if (res.ok) {
        showToast(
          `Calibrated [${selectedScenario.id}] to empirical ${mode === 'vector-p90' ? '90th percentile' : 'median'} of real breach dataset.`,
          'success'
        );
        navigateToScenario(selectedScenario.id);
      }
    } catch (err) {
      showToast('Calibration failed', 'alert');
    }
  };

  return (
    <div id="real-data-catalog-screen" className="space-y-8 pb-12">
      {/* Hero Banner: Real Ground Truth Intelligence */}
      <div className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-7 md:p-8 shadow-xs border border-[#1a3a3a]/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#ff4d8b]/15 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#faf5e8]/15 text-[#ffb084] text-xs font-medium tracking-wide">
                <Database className="w-3.5 h-3.5 text-[#ffb084]" />
                <span>Empirical Ground Truth Engine</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#ff4d8b]/20 text-[#ff4d8b] text-[11px] font-semibold">
                <span>Active Datasets: 4</span>
              </span>
              {summary?.activeApiKeys.nvd && (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-[#e8b94a]/20 text-[#e8b94a] text-[11px] font-semibold">
                  <Key className="w-3 h-3" />
                  <span>NVD & Abuse.ch Authenticated</span>
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-medium tracking-[-0.03em] font-display text-[#ffffff]">
              Real Data Sets & Empirical Breach Catalog
            </h1>
            <p className="text-sm text-[#ffffff]/80 font-normal leading-relaxed">
              Every parameter in ZK-PACE is anchored to verified historical security breaches, the official CISA Known Exploited Vulnerabilities catalog, NIST NVD CVSS telemetry, and the massive 383,000+ MITRE CVE v5 national catalog. Zero guesswork. Zero black-box metrics.
            </p>
          </div>

          {/* Quick Scenario Link Badge */}
          {selectedScenario && (
            <div className="bg-[#ffffff]/10 backdrop-blur-xs rounded-[20px] p-4 border border-[#ffffff]/15 min-w-[260px] text-xs space-y-2">
              <div className="text-[11px] text-[#ffb084] font-medium flex items-center justify-between">
                <span>Active Scenario Calibrated</span>
                <span className="font-mono text-[#ffffff]">{selectedScenario.id.toUpperCase()}</span>
              </div>
              <p className="text-[#ffffff] font-medium truncate">{selectedScenario.title}</p>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleCalibrateVector('vector-median')}
                  className="px-2.5 py-1 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#ffffff] dark:bg-[#0c121e] font-medium text-[11px] cursor-pointer transition-colors shadow-xs"
                >
                  Calibrate Median
                </button>
                <button
                  onClick={() => handleCalibrateVector('vector-p90')}
                  className="px-2.5 py-1 rounded-full bg-[#ff4d8b] text-[#ffffff] hover:bg-[#e03a74] font-medium text-[11px] cursor-pointer transition-colors shadow-xs"
                >
                  Calibrate P90
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Real Data KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 mt-6 border-t border-[#ffffff]/15">
          <div className="bg-[#ffffff]/5 rounded-[16px] p-3 border border-[#ffffff]/10">
            <span className="text-[11px] text-[#ffffff]/70 block font-normal">CVE v5 Catalog</span>
            <div className="text-xl sm:text-2xl font-medium text-blue-400 font-display">
              383,135
            </div>
            <span className="text-[10px] text-[#ffffff]/60">cvelistV5 (216K Indexed)</span>
          </div>

          <div className="bg-[#ffffff]/5 rounded-[16px] p-3 border border-[#ffffff]/10">
            <span className="text-[11px] text-[#ffffff]/70 block font-normal">Historical Breaches</span>
            <div className="text-xl sm:text-2xl font-medium text-[#ffffff] font-display">
              {summary?.historicalIncidentsCount.toLocaleString() || '1,902'}
            </div>
            <span className="text-[10px] text-[#ffb084]">Financial Data Set.csv</span>
          </div>

          <div className="bg-[#ffffff]/5 rounded-[16px] p-3 border border-[#ffffff]/10">
            <span className="text-[11px] text-[#ffffff]/70 block font-normal">Empirical Losses Tracked</span>
            <div className="text-xl sm:text-2xl font-medium text-[#ffb084] font-display">
              ₹12.1 Lakh Cr
            </div>
            <span className="text-[10px] text-[#ffffff]/60">$142.8B Global</span>
          </div>

          <div className="bg-[#ffffff]/5 rounded-[16px] p-3 border border-[#ffffff]/10">
            <span className="text-[11px] text-[#ffffff]/70 block font-normal">Median Breach Cost</span>
            <div className="text-xl sm:text-2xl font-medium text-[#e8b94a] font-display">
              ₹68.0 Cr
            </div>
            <span className="text-[10px] text-[#ffffff]/60">${(summary ? summary.medianHistoricalLossUSD / 1e6 : 8.0).toFixed(1)}M (P50)</span>
          </div>

          <div className="bg-[#ffffff]/5 rounded-[16px] p-3 border border-[#ffffff]/10">
            <span className="text-[11px] text-[#ffffff]/70 block font-normal">CISA KEV Catalog</span>
            <div className="text-xl sm:text-2xl font-medium text-[#ff4d8b] font-display">
              {summary?.cisaKevCount.toLocaleString() || '1,709'}
            </div>
            <span className="text-[10px] text-[#ffffff]/60">Active in the Wild</span>
          </div>

          <div className="bg-[#ffffff]/5 rounded-[16px] p-3 border border-[#ffffff]/10">
            <span className="text-[11px] text-[#ffffff]/70 block font-normal">NIST NVD Scored CVEs</span>
            <div className="text-xl sm:text-2xl font-medium text-[#ffffff] font-display">
              {summary?.nvdCveCount.toLocaleString() || '2,000'}
            </div>
            <span className="text-[10px] text-[#ffffff]/60">CVSS v2/v3 Scored</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] dark:border-[#1e293b] pb-4">
        <div className="flex flex-wrap items-center gap-2 bg-[#faf5e8] dark:bg-[#1e293b] p-1.5 rounded-full border border-[#e5e5e5] dark:border-[#1e293b]">
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'incidents'
                ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1a3a3a]" />
            <span>Historical Incidents (1,902 Breaches)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cvelist')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'cvelist'
                ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span>CVE v5 National Catalog (383K Records)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cisa')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'cisa'
                ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff4d8b]" />
            <span>CISA KEV Catalog (1,709 Vulnerabilities)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nvd')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'nvd'
                ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#e8b94a]" />
            <span>NIST NVD Records (2,000 CVEs)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('distributions')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'distributions'
                ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#ffb084]" />
            <span>Empirical Loss Distributions & Analytics</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local Persistent Datasets Active</span>
          </span>
        </div>
      </div>

      {/* TAB 1: Historical Incidents Explorer */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-6">
          {/* Filter Bar with Breaches Like Mine */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-5 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* Breaches Like Mine Pill Button */}
                <button
                  onClick={() => {
                    if (isPeerModeActive) {
                      setIsPeerModeActive(false);
                      setSelectedIndustry('ALL');
                    } else {
                      setIsPeerModeActive(true);
                      setSelectedIndustry(peerIndustry);
                    }
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition-all border shrink-0 ${
                    isPeerModeActive
                      ? 'bg-[#ff4d8b] text-white border-[#ff4d8b] shadow-xs'
                      : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#1e293b] hover:border-[#ff4d8b]'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>🎯 Breaches Like Mine ({peerIndustry})</span>
                </button>

                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 text-[#6a6a6a] dark:text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search 1,902 breaches (e.g., Sony, Siemens, Phishing, DDoS)..."
                    value={incidentSearch}
                    onChange={(e) => setIncidentSearch(e.target.value)}
                    className="w-full bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full pl-9 pr-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] placeholder-[#6a6a6a] focus:outline-none focus:border-[#1a3a3a]"
                  />
                </div>

                {/* Industry / Sector Filter Dropdown */}
                <select
                  value={selectedIndustry}
                  onChange={(e) => {
                    setSelectedIndustry(e.target.value);
                    setIsPeerModeActive(e.target.value === peerIndustry);
                  }}
                  className="bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full px-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Sectors & Industries</option>
                  <option value="FinTech & Banking">💳 FinTech & Banking (256)</option>
                  <option value="Technology & Cloud SaaS">☁️ Technology & Cloud SaaS (223)</option>
                  <option value="Healthcare">🏥 Healthcare & Hospital Networks (71)</option>
                  <option value="Retail & E-Commerce">🛍️ Retail & E-Commerce (27)</option>
                  <option value="Government & Public Sector">🏛️ Government & Public Sector (20)</option>
                  <option value="Energy & Critical Infra">⚡ Energy & Critical Infra (16)</option>
                  <option value="General Enterprise">🏢 General Enterprise (1,289)</option>
                </select>

                {/* Vector Filter Dropdown */}
                <select
                  value={selectedVector}
                  onChange={(e) => setSelectedVector(e.target.value)}
                  className="bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full px-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Attack Vectors</option>
                  <option value="network">Network vulnerabilities</option>
                  <option value="phishing">Phishing Emails</option>
                  <option value="insider">Insider Threat</option>
                  <option value="ddos">Distributed Denial of Service (DDoS)</option>
                  <option value="malware">Malware & Ransomware</option>
                  <option value="unknown">Unspecified Vectors</option>
                </select>

                {/* Loss Range Filter */}
                <select
                  value={lossFilter}
                  onChange={(e) => setLossFilter(e.target.value as any)}
                  className="bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full px-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Financial Loss Ranges</option>
                  <option value="UNDER_1M">&lt; ₹8.5 Cr (&lt; $1M)</option>
                  <option value="1M_10M">₹8.5 Cr - ₹85 Cr ($1M - $10M)</option>
                  <option value="10M_100M">₹85 Cr - ₹850 Cr ($10M - $100M)</option>
                  <option value="OVER_100M">&gt; ₹850 Cr / Catastrophic (&gt; $100M)</option>
                </select>
              </div>

              <div className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] font-medium whitespace-nowrap">
                Showing <span className="text-[#0a0a0a] dark:text-[#ffffff] font-semibold">{incidents.length}</span> of {incidentTotal} incidents
              </div>
            </div>
          </div>

          {/* Peer Threat Intelligence Banner (when peer mode or industry filter active) */}
          {(isPeerModeActive || selectedIndustry !== 'ALL') && (
            <div className="bg-gradient-to-r from-[#1a3a3a] to-[#254646] text-white p-5 rounded-[22px] shadow-sm border border-[#1a3a3a] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffb084]/20 flex items-center justify-center text-[#ffb084] shrink-0">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#ffb084]">
                        Smart Peer Threat Intelligence
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        {exposureData?.organization?.name || 'Active Profile'}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white font-display">
                      Peer Breaches: {isPeerModeActive ? peerIndustry : selectedIndustry} Sector ({incidentTotal} Verified Incidents)
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedIndustry('ALL');
                    setIsPeerModeActive(false);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer transition-colors shrink-0"
                >
                  Clear Peer Filter
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="bg-white/10 p-3 rounded-[14px]">
                  <span className="text-[10px] text-[#ffb084] block font-medium">Peer Incident Pool</span>
                  <span className="text-base font-bold text-white font-mono">{incidentTotal} Breaches</span>
                  <span className="text-[9px] text-white/60 block">In {isPeerModeActive ? peerIndustry : selectedIndustry}</span>
                </div>
                <div className="bg-white/10 p-3 rounded-[14px]">
                  <span className="text-[10px] text-[#ffb084] block font-medium">Median Peer Loss</span>
                  <span className="text-base font-bold text-[#ffb084] font-mono">
                    ₹{(((stats?.industryDistribution?.find((i: any) => i.industry === (isPeerModeActive ? peerIndustry : selectedIndustry))?.medianLossUSD || 7000000) * 85) / 1e7).toFixed(1)} Cr
                  </span>
                  <span className="text-[9px] text-white/60 block">${((stats?.industryDistribution?.find((i: any) => i.industry === (isPeerModeActive ? peerIndustry : selectedIndustry))?.medianLossUSD || 7000000) / 1e6).toFixed(1)}M USD (P50)</span>
                </div>
                <div className="bg-white/10 p-3 rounded-[14px]">
                  <span className="text-[10px] text-[#ffb084] block font-medium">Dominant Vector</span>
                  <span className="text-xs font-bold text-white truncate block">Network / Ransomware</span>
                  <span className="text-[9px] text-white/60 block">Most prevalent exploit</span>
                </div>
                <div className="bg-white/10 p-3 rounded-[14px]">
                  <span className="text-[10px] text-[#ffb084] block font-medium">Regulatory Regime</span>
                  <span className="text-xs font-medium text-white truncate block">{exposureData?.organization?.complianceFramework || 'RBI / DPDP Act / HIPAA'}</span>
                  <span className="text-[9px] text-white/60 block">Statutory Exposure</span>
                </div>
              </div>
            </div>
          )}

          {/* Incidents Table */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border-b border-[#e5e5e5] dark:border-[#1e293b] font-semibold">
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('incidentName')}>
                      <div className="flex items-center space-x-1"><span>Incident</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'incidentName' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('date')}>
                      <div className="flex items-center space-x-1"><span>Date</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'date' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('organization')}>
                      <div className="flex items-center space-x-1"><span>Organization & Target</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'organization' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('attackVector')}>
                      <div className="flex items-center space-x-1"><span>Attack Vector</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'attackVector' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('loss')}>
                      <div className="flex items-center space-x-1"><span>Loss in INR (₹)</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'loss' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('loss')}>
                      <div className="flex items-center space-x-1"><span>USD Equivalent ($)</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'loss' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 cursor-pointer hover:text-[#ff4d8b] transition-colors group" onClick={() => handleSort('downtimeDuration')}>
                      <div className="flex items-center space-x-1"><span>Downtime & Recovery</span><ArrowUpDown className={`w-3.5 h-3.5 ${sortConfig?.key === 'downtimeDuration' ? 'text-[#ff4d8b]' : 'text-[#6a6a6a] group-hover:text-[#ff4d8b]'}`} /></div>
                    </th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {isLoadingIncidents ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#6a6a6a] dark:text-[#94a3b8]">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a3a3a]" />
                        Loading real historical breaches...
                      </td>
                    </tr>
                  ) : incidents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#6a6a6a] dark:text-[#94a3b8]">
                        No incidents matched your search or filters.
                      </td>
                    </tr>
                  ) : (
                    sortedIncidents.map((incident) => (
                      <tr
                        key={incident.incidentId}
                        className="hover:bg-[#faf5e8]/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#0a0a0a] dark:text-[#ffffff]">{incident.incidentName}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                              {incident.incidentId}
                            </span>
                            {incident.mitreTechniqueId && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/20" title={incident.mitreTechniqueName}>
                                {incident.mitreTechniqueId}
                              </span>
                            )}
                            {incident.detectedIndustry && incident.detectedIndustry !== 'General Enterprise' && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                {incident.detectedIndustry}
                              </span>
                            )}
                            {incident.mitigatingControlCodes && incident.mitigatingControlCodes.length > 0 && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" title={`Mitigated by ${incident.mitigatingControlCodes.join(', ')}`}>
                                🛡️ {incident.mitigatingControlCodes[0]}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[#6a6a6a] dark:text-[#94a3b8]">
                          {incident.date || 'Historical'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-[#0a0a0a] dark:text-[#ffffff] font-medium">{incident.organization}</div>
                          <div className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] truncate max-w-[200px]">
                            {incident.assetAffected || 'Enterprise infrastructure'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#1e293b] max-w-[180px] truncate">
                            {incident.attackVector}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-[#1a3a3a]">
                          {incident.damageLossINR > 0 ? (
                            <span className={incident.damageLossINR >= 850000000 ? 'text-[#ff4d8b] font-bold' : 'text-[#0a0a0a] dark:text-[#ffffff]'}>
                              ₹{incident.damageLossINR >= 1e7
                                ? `${(incident.damageLossINR / 1e7).toFixed(1)} Cr`
                                : `${(incident.damageLossINR / 1e5).toFixed(1)} L`}
                            </span>
                          ) : (
                            <span className="text-[#6a6a6a] dark:text-[#94a3b8]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                          {incident.damageLossUSD > 0 ? (
                            <span>
                              ${incident.damageLossUSD >= 1e9
                                ? `${(incident.damageLossUSD / 1e9).toFixed(2)}B`
                                : incident.damageLossUSD >= 1e6
                                ? `${(incident.damageLossUSD / 1e6).toFixed(2)}M`
                                : incident.damageLossUSD.toLocaleString()}
                            </span>
                          ) : (
                            <span>Undisclosed</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                          <div>{incident.downtimeDuration || 'Variable'}</div>
                          <div className="text-[10px] text-[#1a3a3a] font-medium">
                            {incident.recoveryCost ? `Cost: ${incident.recoveryCost}` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCalibrateFromIncident(incident);
                            }}
                            title="Calibrate active FAIR scenario with this incident loss"
                            className="px-3 py-1 rounded-full text-[11px] font-medium bg-[#1a3a3a] text-[#ffffff] hover:bg-[#2b5a5a] transition-all cursor-pointer shadow-xs whitespace-nowrap"
                          >
                            Calibrate FAIR
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CVE v5 National Catalog (383,000+ CVEs from cvelistV5) */}
      {activeSubTab === 'cvelist' && (
        <CveCatalogView />
      )}

      {/* TAB 3: CISA KEV Catalog (1,709 Vulnerabilities) */}
      {activeSubTab === 'cisa' && (
        <div className="space-y-6">
          {/* CISA Filter Bar */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-5 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#6a6a6a] dark:text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search CISA KEV by CVE-ID, vendor, or keyword..."
                  value={cisaSearch}
                  onChange={(e) => setCisaSearch(e.target.value)}
                  className="w-full bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full pl-9 pr-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] placeholder-[#6a6a6a] focus:outline-none focus:border-[#1a3a3a]"
                />
              </div>

              {/* Vendor Selector */}
              <select
                value={cisaVendor}
                onChange={(e) => setCisaVendor(e.target.value)}
                className="bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full px-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Vendors (1,709 CVEs)</option>
                {cisaVendorsList.map((v) => (
                  <option key={v.vendor} value={v.vendor}>
                    {v.vendor} ({v.count})
                  </option>
                ))}
              </select>

              {/* Ransomware Flag Toggle */}
              <button
                onClick={() => setRansomwareOnly(!ransomwareOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all flex items-center space-x-1.5 ${
                  ransomwareOnly
                    ? 'bg-[#ff4d8b] text-[#ffffff] shadow-xs'
                    : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#1e293b]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Ransomware Campaigns Only</span>
              </button>
            </div>

            <div className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] font-medium whitespace-nowrap">
              Showing <span className="text-[#0a0a0a] dark:text-[#ffffff] font-semibold">{cisaVulns.length}</span> of {cisaTotal} vulnerabilities
            </div>
          </div>

          {/* CISA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCisa ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a] dark:text-[#94a3b8]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a3a3a]" />
                Loading official CISA KEV catalog...
              </div>
            ) : cisaVulns.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a] dark:text-[#94a3b8]">
                No CISA vulnerabilities match this filter.
              </div>
            ) : (
              cisaVulns.map((v) => (
                <div
                  key={v.cveID}
                  className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-5 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs hover:border-[#1a3a3a]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#ff4d8b] bg-[#ff4d8b]/10 px-2.5 py-0.5 rounded-full">
                        {v.cveID}
                      </span>
                      {v.knownRansomwareCampaignUse === 'Known' ? (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#ff4d8b] text-[#ffffff] flex items-center space-x-1">
                          <Flame className="w-3 h-3" />
                          <span>Ransomware</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] bg-[#faf5e8] dark:bg-[#1e293b] px-2 py-0.5 rounded-full border border-[#e5e5e5] dark:border-[#1e293b]">
                          Exploited in Wild
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-medium text-[#0a0a0a] dark:text-[#ffffff] line-clamp-2">
                      {v.vulnerabilityName}
                    </h4>

                    <div className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] flex items-center space-x-2">
                      <span className="font-medium text-[#1a3a3a]">{v.vendorProject}</span>
                      <span>•</span>
                      <span>{v.product}</span>
                    </div>

                    <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] line-clamp-3 leading-relaxed">
                      {v.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                      Due: <span className="font-medium text-[#0a0a0a] dark:text-[#ffffff]">{v.dueDate || 'Immediate'}</span>
                    </span>
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${v.cveID}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1a3a3a] font-medium hover:underline flex items-center space-x-1"
                    >
                      <span>NIST Advisory</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NIST NVD CVE Catalog (2,000 Records) */}
      {activeSubTab === 'nvd' && (
        <div className="space-y-6">
          {/* NVD Filter Bar */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-5 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#6a6a6a] dark:text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 2,000 NVD CVEs by id, description, or CWE..."
                  value={nvdSearch}
                  onChange={(e) => setNvdSearch(e.target.value)}
                  className="w-full bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full pl-9 pr-4 py-2 text-xs text-[#0a0a0a] dark:text-[#ffffff] placeholder-[#6a6a6a] focus:outline-none focus:border-[#1a3a3a]"
                />
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 bg-[#faf5e8] dark:bg-[#1e293b] p-1 rounded-full border border-[#e5e5e5] dark:border-[#1e293b]">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setNvdSeverity(sev)}
                    className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all ${
                      nvdSeverity === sev
                        ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                        : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] font-medium whitespace-nowrap">
              Showing <span className="text-[#0a0a0a] dark:text-[#ffffff] font-semibold">{nvdItems.length}</span> of {nvdTotal} NVD records
            </div>
          </div>

          {/* NVD Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingNvd ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a] dark:text-[#94a3b8]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a3a3a]" />
                Loading NIST NVD scored CVE dataset...
              </div>
            ) : nvdItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a] dark:text-[#94a3b8]">
                No NVD CVEs matched your query.
              </div>
            ) : (
              nvdItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-5 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs hover:border-[#1a3a3a]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#0a0a0a] dark:text-[#ffffff] bg-[#faf5e8] dark:bg-[#1e293b] px-2.5 py-0.5 rounded-full border border-[#e5e5e5] dark:border-[#1e293b]">
                        {item.id}
                      </span>

                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          item.baseSeverity === 'CRITICAL'
                            ? 'bg-[#ff4d8b] text-[#ffffff]'
                            : item.baseSeverity === 'HIGH'
                            ? 'bg-[#ffb084] text-[#0a0a0a] dark:text-[#ffffff]'
                            : 'bg-[#e8b94a] text-[#0a0a0a] dark:text-[#ffffff]'
                        }`}
                      >
                        CVSS {item.baseScore.toFixed(1)} {item.baseSeverity}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] flex items-center space-x-2">
                      <span className="font-mono text-[#1a3a3a]">{item.weakness || 'CWE-Unassigned'}</span>
                      <span>•</span>
                      <span>Score: {item.baseScore}</span>
                    </div>

                    <p className="text-xs text-[#0a0a0a] dark:text-[#ffffff] line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                      v{item.cvssVersion} Vector
                    </span>
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#1a3a3a] font-medium hover:underline flex items-center space-x-1"
                    >
                      <span>NIST Source</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: Empirical Loss Distributions & Monte Carlo Analytics */}
      {activeSubTab === 'distributions' && (
        <div className="space-y-6">
          {/* Monte Carlo Stochastic Simulation & PML Dashboard */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] p-6 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold tracking-wide border border-purple-500/25">
                    STOCHASTIC MONTE CARLO ENGINE
                  </span>
                  <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                    Open FAIR Standard (ISO/IEC 27005)
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] font-display mt-1">
                  Loss Exceedance Curve & Probable Maximum Loss (PML)
                </h2>
                <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] mt-1 max-w-2xl">
                  {monteCarloResult?.sourceDescription || '10,000 stochastic simulation iterations parameterized from 1,008 real breach financial damages.'}
                </p>
              </div>

              {/* Simulation Levers */}
              <div className="flex flex-wrap items-center gap-2.5 bg-[#faf5e8] dark:bg-[#1e293b] p-2 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b]">
                {/* Iterations Selector */}
                <div className="flex items-center space-x-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium pl-1">Trials:</span>
                  {[10000, 25000, 50000].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        setMcIterations(count);
                        fetchMonteCarlo(count, mcSector, mcRiskAppetiteCr);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                        mcIterations === count
                          ? 'bg-[#1a3a3a] text-white shadow-xs'
                          : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-white'
                      }`}
                    >
                      {count >= 1000 ? `${count / 1000}K` : count}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-[#e5e5e5] dark:bg-[#2e3e56]" />

                {/* Sector Selector */}
                <select
                  value={mcSector}
                  onChange={(e) => {
                    const sec = e.target.value;
                    setMcSector(sec);
                    fetchMonteCarlo(mcIterations, sec, mcRiskAppetiteCr);
                    fetchVelocity(DWELL_STEPS[dwellStepIndex].hours, sec);
                  }}
                  className="bg-white dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#2e3e56] rounded-full px-3 py-1 text-xs text-[#0a0a0a] dark:text-white focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Industries</option>
                  <option value="FinTech & Banking">FinTech & Banking</option>
                  <option value="Technology & Cloud SaaS">Technology & SaaS</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Retail & E-Commerce">Retail</option>
                </select>

                <div className="h-4 w-px bg-[#e5e5e5] dark:bg-[#2e3e56]" />

                {/* Risk Appetite Lever */}
                <div className="flex items-center space-x-1.5 pl-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">Appetite:</span>
                  <select
                    value={mcRiskAppetiteCr}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setMcRiskAppetiteCr(val);
                      fetchMonteCarlo(mcIterations, mcSector, val);
                    }}
                    className="bg-white dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#2e3e56] rounded-full px-2.5 py-1 text-xs font-mono font-semibold text-[#0a0a0a] dark:text-white focus:outline-none cursor-pointer"
                  >
                    <option value={25}>₹25 Cr</option>
                    <option value={50}>₹50 Cr</option>
                    <option value={100}>₹100 Cr</option>
                    <option value={200}>₹200 Cr</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 4 Multi-Year Horizon PML Metric Cards */}
            {monteCarloResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* P50 Median Annual Risk */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    P50 Median Annual Loss
                  </span>
                  <div className="text-xl font-bold font-mono text-[#0a0a0a] dark:text-[#ffffff]">
                    ₹{(monteCarloResult.inherentPML.p50.inr / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>${(monteCarloResult.inherentPML.p50.usd / 1e6).toFixed(1)}M USD</span>
                    <span className="text-emerald-500 font-semibold">
                      Residual: ₹{(monteCarloResult.residualPML.p50.inr / 1e7).toFixed(1)} Cr
                    </span>
                  </div>
                </div>

                {/* P90 1-in-10 Year Severe Loss */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    1-in-10 Year Loss (P90)
                  </span>
                  <div className="text-xl font-bold font-mono text-[#ffb084]">
                    ₹{(monteCarloResult.inherentPML.p90_10yr.inr / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>${(monteCarloResult.inherentPML.p90_10yr.usd / 1e6).toFixed(1)}M USD</span>
                    <span className="text-emerald-500 font-semibold">
                      Residual: ₹{(monteCarloResult.residualPML.p90_10yr.inr / 1e7).toFixed(1)} Cr
                    </span>
                  </div>
                </div>

                {/* P98 1-in-50 Year Critical Loss */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    1-in-50 Year Loss (P98)
                  </span>
                  <div className="text-xl font-bold font-mono text-[#ff6b5a]">
                    ₹{(monteCarloResult.inherentPML.p98_50yr.inr / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>${(monteCarloResult.inherentPML.p98_50yr.usd / 1e6).toFixed(1)}M USD</span>
                    <span className="text-emerald-500 font-semibold">
                      Residual: ₹{(monteCarloResult.residualPML.p98_50yr.inr / 1e7).toFixed(1)} Cr
                    </span>
                  </div>
                </div>

                {/* P99 1-in-100 Year Catastrophe PML */}
                <div className="bg-gradient-to-br from-[#1a3a3a] to-[#254646] p-4 rounded-[18px] border border-[#1a3a3a] text-white space-y-1">
                  <span className="text-[11px] text-[#ffb084] font-semibold block">
                    1-in-100 Year Catastrophe (P99 PML)
                  </span>
                  <div className="text-xl font-bold font-mono text-[#ff4d8b]">
                    ₹{(monteCarloResult.inherentPML.p99_100yr.inr / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-white/70">
                    <span>${(monteCarloResult.inherentPML.p99_100yr.usd / 1e6).toFixed(1)}M USD</span>
                    <span className="text-emerald-300 font-semibold">
                      Cut to: ₹{(monteCarloResult.residualPML.p99_100yr.inr / 1e7).toFixed(1)} Cr
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Loss Exceedance Curve (LEC) Graph */}
            <div className="bg-[#faf5e8]/50 dark:bg-[#1e293b]/50 p-5 rounded-[22px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-[#0a0a0a] dark:text-white font-display">
                    Annual Loss Exceedance Curve (LEC)
                  </h4>
                  <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    Probability that annual cyber losses will exceed the specified financial loss threshold.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff4d8b]" />
                    <span className="text-[#0a0a0a] dark:text-white font-medium">Inherent Risk</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-[#0a0a0a] dark:text-white font-medium">Residual (With ZK-PACE)</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
                    <span className="text-amber-600 dark:text-amber-400 font-medium">Appetite (₹{mcRiskAppetiteCr} Cr)</span>
                  </div>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-72 w-full pt-2">
                {isLoadingMonteCarlo ? (
                  <div className="h-full flex items-center justify-center text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#ff4d8b]" />
                    Running {mcIterations.toLocaleString()} Monte Carlo stochastic trials...
                  </div>
                ) : monteCarloResult?.curveData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={monteCarloResult.curveData}
                      margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="inherentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff4d8b" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#ff4d8b" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="residualGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis
                        dataKey="lossLabelINR"
                        tick={{ fontSize: 10, fill: '#888888' }}
                        interval={3}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: '#888888' }}
                        tickFormatter={(v) => `${v}%`}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload || !payload.length) return null;
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#1a3a3a] text-white p-3 rounded-[14px] shadow-xl text-xs space-y-1.5 border border-white/10">
                              <div className="font-bold font-mono text-[#ffb084] text-sm">
                                Loss Threshold: {data.lossLabelINR} (${(data.lossUSD / 1e6).toFixed(1)}M USD)
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-white/80">Inherent Exceedance:</span>
                                <span className="font-mono font-bold text-[#ff4d8b]">{data.inherentProb}%</span>
                              </div>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-white/80">Residual Exceedance:</span>
                                <span className="font-mono font-bold text-emerald-400">{data.residualProb}%</span>
                              </div>
                              <div className="pt-1 border-t border-white/15 text-[10px] text-emerald-300 font-semibold">
                                Risk Reduction: {(data.inherentProb - data.residualProb).toFixed(1)}% reduction in likelihood
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="inherentProb"
                        stroke="#ff4d8b"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#inherentGrad)"
                        name="Inherent Risk"
                      />
                      <Area
                        type="monotone"
                        dataKey="residualProb"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#residualGrad)"
                        name="Residual Risk"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : null}
              </div>

              {/* Solvency & Risk Appetite Analysis Footer */}
              {monteCarloResult && (
                <div className="bg-white dark:bg-[#0c121e] p-3.5 rounded-[16px] border border-[#e5e5e5] dark:border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping shrink-0" />
                    <div>
                      <span className="font-semibold text-[#0a0a0a] dark:text-white">
                        Board Risk Appetite Solvency: ₹{mcRiskAppetiteCr} Cr
                      </span>
                      <span className="text-[#6a6a6a] dark:text-[#94a3b8] ml-2">
                        Likelihood of annual loss exceeding board tolerance:
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 text-xs shrink-0">
                    <span className="text-[#ff4d8b] font-mono font-bold">
                      Inherent: {monteCarloResult.inherentPML.riskAppetiteExceedance.inherentProbPct}%
                    </span>
                    <span>→</span>
                    <span className="text-emerald-500 font-mono font-bold">
                      Residual: {monteCarloResult.residualPML.riskAppetiteExceedance.residualProbPct}%
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] border border-emerald-500/20">
                      {Math.max(0, Math.round(((monteCarloResult.inherentPML.riskAppetiteExceedance.inherentProbPct - monteCarloResult.residualPML.riskAppetiteExceedance.residualProbPct) / (monteCarloResult.inherentPML.riskAppetiteExceedance.inherentProbPct || 1)) * 100))}% Solvency Protection
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Containment Velocity & MTTR / Dwell Time Impact Simulator */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] p-6 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold tracking-wide border border-emerald-500/25 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-500" />
                    CONTAINMENT VELOCITY & MTTR ENGINE
                  </span>
                  <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                    IBM Ponemon 2024 & 100K Synthesized Incidents Benchmark
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] font-display mt-1">
                  Mean-Time-To-Contain (MTTC) Financial Impact Simulator
                </h2>
                <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] mt-1 max-w-2xl">
                  Quantify how accelerating dwell-time containment from the global 258-day baseline down to minutes collapses financial breach losses, halts data exfiltration, and maintains India DPDP Act safe-harbor compliance.
                </p>
              </div>

              {/* Presets Bar */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#faf5e8] dark:bg-[#1e293b] p-1.5 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b]">
                {VELOCITY_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setVelocityPreset(p.id);
                      const foundIdx = DWELL_STEPS.findIndex((s) => s.hours === p.hours);
                      if (foundIdx !== -1) setDwellStepIndex(foundIdx);
                      fetchVelocity(p.hours, mcSector);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center space-x-1.5 ${
                      velocityPreset === p.id
                        ? 'bg-[#1a3a3a] text-white shadow-xs font-semibold'
                        : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-white'
                    }`}
                    title={p.desc}
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] font-mono opacity-80">({p.tag})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Dwell Time Slider & Step Controller */}
            <div className="bg-[#faf5e8] dark:bg-[#1e293b]/50 p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-[#0a0a0a] dark:text-white">
                    Active Dwell Time / Mean-Time-to-Contain (MTTC):
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-[#1a3a3a] text-emerald-400">
                    {DWELL_STEPS[dwellStepIndex].title}
                  </span>
                </div>
                <div className="text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
                  Baseline Comparison: <span className="font-mono font-semibold text-rose-500">258 Days (Global Uncontained)</span>
                </div>
              </div>

              {/* Range Slider */}
              <div className="space-y-1.5 pt-1">
                <input
                  type="range"
                  min={0}
                  max={DWELL_STEPS.length - 1}
                  step={1}
                  value={dwellStepIndex}
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    setDwellStepIndex(idx);
                    setVelocityPreset('custom');
                    fetchVelocity(DWELL_STEPS[idx].hours, mcSector);
                  }}
                  className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6a6a6a] dark:text-[#94a3b8] px-1">
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">⚡ 30m (Micro-Isolation)</span>
                  <span>12h (SOAR)</span>
                  <span className="text-amber-500 font-semibold">3d (DPDP Window)</span>
                  <span>36d (MDR)</span>
                  <span>185d (Reactive)</span>
                  <span className="text-rose-500 font-bold">277d (Legacy)</span>
                </div>
              </div>
            </div>

            {/* 4 Dynamic Financial & Operational Impact Cards */}
            {velocityResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Projected Loss */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    Projected Breach Loss
                  </span>
                  <div className="text-xl font-bold font-mono text-[#0a0a0a] dark:text-[#ffffff]">
                    ₹{(velocityResult.projectedCostINR / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>${(velocityResult.projectedCostUSD / 1e6).toFixed(2)}M USD</span>
                    <span className="line-through text-rose-400">₹{(velocityResult.baselineCostINR / 1e7).toFixed(1)} Cr base</span>
                  </div>
                </div>

                {/* Capital Preserved / Net Savings */}
                <div className="bg-emerald-500/10 p-4 rounded-[18px] border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
                    Net Capital Preserved (ROI)
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{(velocityResult.netSavingsINR / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300">
                    <span>${(velocityResult.netSavingsUSD / 1e6).toFixed(2)}M saved</span>
                    <span className="font-bold font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      +{velocityResult.costReductionPct}%
                    </span>
                  </div>
                </div>

                {/* Exfiltration Blast Radius */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    Exfiltration Blast Radius
                  </span>
                  <div className="text-xl font-bold font-mono text-[#0a0a0a] dark:text-[#ffffff]">
                    {velocityResult.dataExfiltratedGB} GB
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      {velocityResult.dataMitigatedGB} GB saved
                    </span>
                    <span>from 68 GB cap</span>
                  </div>
                </div>

                {/* DPDP Act & Statutory Fine Risk */}
                <div className={`p-4 rounded-[18px] border space-y-1 ${
                  velocityResult.regulatoryFineRiskINR === 0
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : velocityResult.regulatoryFineRiskINR <= 50000000
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <span className="text-[11px] font-medium block text-[#0a0a0a] dark:text-white">
                    DPDP Act Penalty Risk
                  </span>
                  <div className={`text-xl font-bold font-mono ${
                    velocityResult.regulatoryFineRiskINR === 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : velocityResult.regulatoryFineRiskINR <= 50000000
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {velocityResult.regulatoryFineRiskINR === 0
                      ? '₹0 Cr (Safe Harbor)'
                      : `₹${(velocityResult.regulatoryFineRiskINR / 1e7).toFixed(0)} Cr Exposure`}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>{velocityResult.currentDwellHours <= 6 ? 'CERT-In 6h Compliant' : 'Uncontained Liability'}</span>
                    <span>Max ₹250 Cr Cap</span>
                  </div>
                </div>
              </div>
            )}

            {/* Two-Column Analytics: Left = Velocity Curve, Right = Kill-Chain & Tool Benchmarks */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Velocity Escalation Curve */}
              <div className="lg:col-span-7 bg-[#faf5e8] dark:bg-[#1e293b] p-5 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                      Dwell Time vs. Financial Loss Escalation Curve
                    </h3>
                    <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                      Non-linear empirical cost model calibrated from 100,000 synthesized attacks and IBM Ponemon benchmarks.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/15">
                    {velocityResult?.industryMultiplier.industry || 'All Sectors'}
                  </span>
                </div>

                <div className="h-64 w-full">
                  {isLoadingVelocity ? (
                    <div className="h-full flex items-center justify-center text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
                      <RefreshCw className="w-4 h-4 animate-spin mr-2 text-emerald-500" />
                      Recalibrating velocity curve...
                    </div>
                  ) : velocityResult?.empiricalCurvePoints ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={velocityResult.empiricalCurvePoints}
                        margin={{ top: 10, right: 15, left: 0, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#888888' }} interval={2} />
                        <YAxis
                          tick={{ fontSize: 10, fill: '#888888' }}
                          tickFormatter={(v) => `₹${(v / 1e7).toFixed(0)}Cr`}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (!active || !payload || !payload.length) return null;
                            const data = payload[0].payload;
                            return (
                              <div className="bg-[#1a3a3a] text-white p-3 rounded-[14px] shadow-xl text-xs space-y-1.5 border border-white/10">
                                <div className="font-bold font-mono text-[#ffb084] text-sm">
                                  MTTC Dwell Time: {data.label} ({data.dwellDays >= 1 ? `${data.dwellDays} days` : `${data.dwellHours} hrs`})
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-white/80">Projected Loss:</span>
                                  <span className="font-mono font-bold text-emerald-400">
                                    ₹{(data.projectedCostINR / 1e7).toFixed(1)} Cr (${(data.projectedCostUSD / 1e6).toFixed(2)}M)
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-white/80">Exfiltrated Data:</span>
                                  <span className="font-mono font-bold text-[#ffb084]">{data.dataExfiltratedGB} GB</span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-white/80">Regulatory Exposure:</span>
                                  <span className="font-mono font-bold text-rose-400">{data.regulatoryRiskSeverity}</span>
                                </div>
                              </div>
                            );
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="projectedCostINR"
                          stroke="#10b981"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#velocityGrad)"
                          name="Projected Breach Cost"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : null}
                </div>
              </div>

              {/* Right Column: MITRE Kill-Chain Interruption & Real Tool Benchmarks */}
              <div className="lg:col-span-5 space-y-4">
                {/* MITRE Kill-Chain Severance Box */}
                {velocityResult && (
                  <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#6a6a6a] dark:text-[#94a3b8] font-bold">
                        MITRE ATT&CK KILL-CHAIN STATUS
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                        SEVERED
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-sm font-bold text-[#0a0a0a] dark:text-white flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{velocityResult.mitreStageSevered.stage}</span>
                      </div>
                      <div className="text-[11px] font-mono text-purple-600 dark:text-purple-400 font-semibold">
                        Technique: {velocityResult.mitreStageSevered.techniqueId}
                      </div>
                      <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] leading-relaxed pt-1">
                        {velocityResult.mitreStageSevered.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Empirical Defense Tool Speed Benchmark */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6a6a6a] dark:text-[#94a3b8] font-bold">
                      EMPIRICAL RESPONSE SPEEDS (100K EVENTS)
                    </span>
                    <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">Avg MTTR</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {velocityResult?.empiricalToolStats.slice(0, 5).map((tool, idx) => (
                      <div key={tool.tool} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={`font-medium ${idx === 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-[#0a0a0a] dark:text-white'}`}>
                            {tool.tool}
                          </span>
                          <span className="font-mono font-semibold">
                            {tool.avgResponseMin} min
                          </span>
                        </div>
                        <div className="w-full bg-[#e5e5e5] dark:bg-[#2e3e56] h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              idx === 0
                                ? 'bg-emerald-500'
                                : tool.avgResponseMin > 90
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(100, (tool.avgResponseMin / 95) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Exposure Blast Radius & Regulatory Penalty Simulator */}
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] p-6 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] font-mono font-bold tracking-wide border border-blue-500/25 flex items-center gap-1">
                    <Database className="w-3 h-3 text-blue-500" />
                    DATA EXPOSURE BLAST RADIUS ENGINE
                  </span>
                  <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                    India DPDP Act 2023 §33 & Ponemon Unit Economics
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#0a0a0a] dark:text-[#ffffff] font-display mt-1">
                  Per-Record Unit Economics & Regulatory Penalty Simulator
                </h2>
                <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] mt-1 max-w-2xl">
                  Calculate exact financial exposure based on exfiltrated record volume, data sensitivity tiers ($142 to $363/record), and statutory India DPDP Act penalties (up to ₹250 Crores).
                </p>
              </div>

              {/* Quick Presets for Records */}
              <div className="flex items-center gap-1.5 bg-[#faf5e8] dark:bg-[#1e293b] p-1.5 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b]">
                <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] pl-1 font-medium">Quick Vol:</span>
                {[50000, 250000, 1000000, 5000000].map((count) => (
                  <button
                    key={count}
                    onClick={() => {
                      setRecordsExposed(count);
                      fetchBlastRadius(count, selectedDataTier);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                      recordsExposed === count
                        ? 'bg-[#1a3a3a] text-white shadow-xs'
                        : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-white'
                    }`}
                  >
                    {count >= 1000000 ? `${count / 1000000}M` : `${count / 1000}K`}
                  </button>
                ))}
              </div>
            </div>

            {/* 5 Data Classification Tier Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                {
                  id: 'HEALTHCARE_PHI' as DataClassificationTier,
                  name: 'Healthcare PHI / EHR',
                  costUSD: 363,
                  framework: 'HIPAA & DISHA',
                  icon: '🏥'
                },
                {
                  id: 'FINANCIAL_PCI' as DataClassificationTier,
                  name: 'Financial Accounts & Cardholder',
                  costUSD: 275,
                  framework: 'RBI & PCI-DSS v4.0',
                  icon: '💳'
                },
                {
                  id: 'CUSTOMER_PII' as DataClassificationTier,
                  name: 'Customer PII & SaaS Accounts',
                  costUSD: 182,
                  framework: 'India DPDP Act & GDPR',
                  icon: '👤'
                },
                {
                  id: 'SOURCE_CODE_IP' as DataClassificationTier,
                  name: 'Source Code & Secrets',
                  costUSD: 158,
                  framework: 'Trade Secrets & ISO 27001',
                  icon: '💻'
                },
                {
                  id: 'CREDENTIALS_AUTH' as DataClassificationTier,
                  name: 'Employee Credentials & IAM',
                  costUSD: 142,
                  framework: 'NIST SP 800-63',
                  icon: '🔑'
                }
              ].map((tier) => {
                const isSelected = selectedDataTier === tier.id;
                const isPeer = defaultDataTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    onClick={() => {
                      setSelectedDataTier(tier.id);
                      fetchBlastRadius(recordsExposed, tier.id);
                    }}
                    className={`p-3.5 rounded-[18px] border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#1a3a3a] text-white border-transparent shadow-md ring-2 ring-blue-500/40'
                        : 'bg-[#faf5e8] dark:bg-[#1e293b] border-[#e5e5e5] dark:border-[#1e293b] hover:border-blue-400 text-[#0a0a0a] dark:text-white'
                    }`}
                  >
                    {isPeer && (
                      <span className="absolute -top-2 right-2 px-1.5 py-0.2 rounded-full bg-blue-500 text-white text-[9px] font-mono font-bold shadow-xs">
                        Sector Match
                      </span>
                    )}
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-base">{tier.icon}</span>
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-[#0a0a0a] dark:text-white'}`}>
                          {tier.name}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono opacity-80 mt-1">
                        {tier.framework}
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                      <span className="text-[10px] opacity-75">Unit Cost:</span>
                      <span className={`font-mono text-xs font-bold ${isSelected ? 'text-[#ffb084]' : 'text-blue-600 dark:text-blue-400'}`}>
                        ${tier.costUSD} (₹{Math.round((tier.costUSD * 85) / 1000)}k)
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Interactive Blast Radius Slider & Exfiltration Volume */}
            <div className="bg-[#faf5e8] dark:bg-[#1e293b]/50 p-4 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-[#0a0a0a] dark:text-white">
                    Compromised Data Records:
                  </span>
                  <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-[#1a3a3a] text-blue-400">
                    {recordsExposed.toLocaleString()} Records
                  </span>
                  {blastRadiusResult && (
                    <span className="text-xs font-mono text-[#6a6a6a] dark:text-[#94a3b8]">
                      (~{blastRadiusResult.dataVolumeGB} GB Data Dump)
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
                  <span>Database Exposure:</span>
                  <span className="font-mono font-bold text-[#0a0a0a] dark:text-white">
                    {blastRadiusResult?.databaseExposedPct || 5.0}% of 5,000,000 Records
                  </span>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1.5 pt-1">
                <input
                  type="range"
                  min={10000}
                  max={5000000}
                  step={10000}
                  value={recordsExposed}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setRecordsExposed(val);
                    fetchBlastRadius(val, selectedDataTier);
                  }}
                  className="w-full accent-blue-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#6a6a6a] dark:text-[#94a3b8] px-1">
                  <span>10K Records</span>
                  <span>250K</span>
                  <span>1.0M</span>
                  <span>2.5M</span>
                  <span className="text-rose-500 font-bold">5.0M (Full DB Dump)</span>
                </div>
              </div>
            </div>

            {/* 4 Dynamic Financial & Operational Impact Cards */}
            {blastRadiusResult && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Total Inherent Loss */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    Total Inherent Breach Loss
                  </span>
                  <div className="text-xl font-bold font-mono text-[#ff4d8b]">
                    ₹{(blastRadiusResult.totalInherentBreachLossINR / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>${(blastRadiusResult.totalInherentBreachLossUSD / 1e6).toFixed(1)}M USD</span>
                    <span className="font-medium text-rose-500">Unmitigated</span>
                  </div>
                </div>

                {/* India DPDP Act Penalty Tier */}
                <div className={`p-4 rounded-[18px] border space-y-1 ${
                  blastRadiusResult.dpdpPenaltyINR <= 10000000
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : blastRadiusResult.dpdpPenaltyINR <= 500000000
                    ? 'bg-amber-500/10 border-amber-500/20'
                    : 'bg-rose-500/10 border-rose-500/20'
                }`}>
                  <span className="text-[11px] font-medium block text-[#0a0a0a] dark:text-white">
                    India DPDP Act Statutory Penalty
                  </span>
                  <div className={`text-xl font-bold font-mono ${
                    blastRadiusResult.dpdpPenaltyINR <= 10000000
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : blastRadiusResult.dpdpPenaltyINR <= 500000000
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    ₹{(blastRadiusResult.dpdpPenaltyINR / 1e7).toFixed(0)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span className="font-semibold uppercase tracking-wide">
                      {blastRadiusResult.dpdpPenaltyTier.replace(/_/g, ' ')}
                    </span>
                    <span>Max ₹250 Cr Cap</span>
                  </div>
                </div>

                {/* Direct Record Remediation */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1">
                  <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-medium block">
                    Direct Identity Remediation
                  </span>
                  <div className="text-xl font-bold font-mono text-[#0a0a0a] dark:text-[#ffffff]">
                    ₹{(blastRadiusResult.directRemediationLossINR / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">
                    <span>${(blastRadiusResult.directRemediationLossUSD / 1e6).toFixed(1)}M USD</span>
                    <span>${blastRadiusResult.classification.costPerRecordUSD}/record</span>
                  </div>
                </div>

                {/* Residual Loss with ZK Enclave Protection */}
                <div className="bg-emerald-500/10 p-4 rounded-[18px] border border-emerald-500/20 space-y-1">
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium block">
                    Residual with ZK-PACE Protection
                  </span>
                  <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ₹{(blastRadiusResult.residualBreachLossINR / 1e7).toFixed(1)} Cr
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300">
                    <span>₹{(blastRadiusResult.capitalPreservedINR / 1e7).toFixed(1)} Cr preserved</span>
                    <span className="font-bold font-mono bg-emerald-500/20 px-1.5 py-0.5 rounded">
                      +{blastRadiusResult.riskReductionPct}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Two-Column Analytics: Cost Composition Breakdown vs DPDP Safe Harbor & Enclave Audit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left Column: Cost Composition Breakdown */}
              <div className="lg:col-span-7 bg-[#faf5e8] dark:bg-[#1e293b] p-5 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-white">
                      Breach Financial Expense Breakdown
                    </h3>
                    <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                      Proportional liability distribution based on verified corporate breach settlement records.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded bg-blue-500/15">
                    {blastRadiusResult?.classification.name.split('(')[0].trim()}
                  </span>
                </div>

                {/* Expense Bars */}
                <div className="space-y-3 pt-1">
                  {blastRadiusResult?.costBreakdown.map((item) => (
                    <div key={item.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#0a0a0a] dark:text-white">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-2 font-mono text-xs">
                          <span className="text-[#6a6a6a] dark:text-[#94a3b8]">
                            ₹{(item.inherentINR / 1e7).toFixed(1)} Cr
                          </span>
                          <span className="font-bold text-[#0a0a0a] dark:text-white bg-black/5 dark:bg-white/10 px-1.5 py-0.2 rounded text-[11px]">
                            {item.pctOfTotal}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#e5e5e5] dark:bg-[#2e3e56] h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            item.category.includes('DPDP')
                              ? 'bg-rose-500'
                              : item.category.includes('Direct')
                              ? 'bg-blue-500'
                              : item.category.includes('Churn')
                              ? 'bg-amber-500'
                              : 'bg-purple-500'
                          }`}
                          style={{ width: `${Math.max(3, item.pctOfTotal)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: DPDP Safe Harbor & Enclave Attestation Audit */}
              <div className="lg:col-span-5 space-y-4">
                {/* Safe Harbor Box */}
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-5 rounded-[20px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6a6a6a] dark:text-[#94a3b8] font-bold">
                      INDIA DPDP ACT 2023 SAFE HARBOR
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      CRYPTOGRAPHIC RELIEF
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-start space-x-2">
                      <Lock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <p className="text-[#0a0a0a] dark:text-white leading-relaxed">
                        <strong className="text-emerald-600 dark:text-emerald-400">Section 33 Compliance: </strong>
                        Under India DPDP Act 2023, data encrypted at rest and in transit via hardware enclaves (Intel SGX / AWS Nitro) qualifies as taking reasonable security safeguards.
                      </p>
                    </div>

                    <div className="p-3 rounded-[14px] bg-white dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6a6a] dark:text-[#94a3b8]">Inherent Fine Risk:</span>
                        <span className="font-mono font-bold text-rose-500">
                          ₹{(blastRadiusResult?.dpdpPenaltyINR || 0) / 1e7} Crores
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6a6a] dark:text-[#94a3b8]">Residual with ZK-PACE:</span>
                        <span className="font-mono font-bold text-emerald-500">
                          ₹0 (Statutory Safe Harbor)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#6a6a6a] dark:text-[#94a3b8]">Notification Mandate:</span>
                        <span className="font-mono font-bold text-emerald-500">
                          Waived (Zero Plaintext Egress)
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] leading-relaxed">
                      By preventing exfiltration of unencrypted records, ZK-PACE eliminates individual consumer liability and avoids the ₹250 Crore penalty ceiling.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Percentile Cards */}
            <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] p-6 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-4">
              <h3 className="text-base font-medium text-[#0a0a0a] dark:text-[#ffffff] font-display">
                Empirical Breach Loss Percentiles
              </h3>
              <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8] leading-relaxed">
                Calculated directly from the 1,008 historical cyber breaches with validated financial damages in <code className="bg-[#faf5e8] dark:bg-[#1e293b] px-1 py-0.5 rounded">Financial Data Set.csv</code>.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] dark:bg-[#1e293b] text-xs">
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium">10th Percentile (P10)</span>
                  <span className="font-mono font-semibold text-[#0a0a0a] dark:text-[#ffffff]">$200,000 (₹1.7 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] dark:bg-[#1e293b] text-xs">
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium">25th Percentile (P25)</span>
                  <span className="font-mono font-semibold text-[#0a0a0a] dark:text-[#ffffff]">$1,200,000 (₹10.2 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#1a3a3a] text-[#ffffff] text-xs shadow-xs">
                  <span className="font-medium text-[#ffb084]">50th Percentile (Median P50)</span>
                  <span className="font-mono font-bold text-sm text-[#ffffff]">$8,000,000 (₹68.0 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] dark:bg-[#1e293b] text-xs">
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium">75th Percentile (P75)</span>
                  <span className="font-mono font-semibold text-[#0a0a0a] dark:text-[#ffffff]">$18,500,000 (₹157 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#ff4d8b]/10 text-xs text-[#ff4d8b] border border-[#ff4d8b]/20">
                  <span className="font-medium">90th Percentile (P90)</span>
                  <span className="font-mono font-bold">$25,000,000 (₹212.5 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] dark:bg-[#1e293b] text-xs">
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium">Maximum Recorded Loss</span>
                  <span className="font-mono font-semibold text-[#0a0a0a] dark:text-[#ffffff]">$38,000,000,000 (₹3.2 Lakh Cr)</span>
                </div>
              </div>
            </div>

            {/* Attack Vector Distribution */}
            <div className="lg:col-span-2 bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] p-6 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-4">
              <h3 className="text-base font-medium text-[#0a0a0a] dark:text-[#ffffff] font-display">
                Attack Vector Empirical Financial Damage
              </h3>
              <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
                Empirical average and median financial losses across distinct attack vectors. Used to calibrate the FAIR Loss Magnitude parameter.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border-b border-[#e5e5e5] dark:border-[#1e293b] font-semibold">
                      <th className="py-2.5 px-3">Attack Vector</th>
                      <th className="py-2.5 px-3">Incidents</th>
                      <th className="py-2.5 px-3">Median Loss ($)</th>
                      <th className="py-2.5 px-3">Average Loss ($)</th>
                      <th className="py-2.5 px-3">Equivalent in INR</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5]">
                    {stats?.attackVectorDistribution?.slice(0, 8).map((vec: AttackVectorStats) => (
                      <tr key={vec.vector} className="hover:bg-[#faf5e8]/50">
                        <td className="py-2.5 px-3 font-medium text-[#0a0a0a] dark:text-[#ffffff] max-w-[220px] truncate">
                          {vec.vector}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#6a6a6a] dark:text-[#94a3b8]">{vec.count}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#1a3a3a]">
                          ${vec.medianLossUSD > 0 ? (vec.medianLossUSD / 1e6).toFixed(1) + 'M' : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#0a0a0a] dark:text-[#ffffff]">
                          ${vec.avgLossUSD > 0 ? (vec.avgLossUSD / 1e6).toFixed(1) + 'M' : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#ff4d8b]">
                          ₹{vec.medianLossINR > 0 ? (vec.medianLossINR / 1e7).toFixed(1) + ' Cr' : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Incident Forensics Detail Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] max-w-2xl w-full p-6 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5] dark:border-[#1e293b]">
              <div>
                <span className="font-mono text-xs text-[#1a3a3a] font-semibold">
                  {selectedIncident.incidentId}
                </span>
                <h3 className="text-lg font-medium text-[#0a0a0a] dark:text-[#ffffff] font-display">
                  {selectedIncident.incidentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] flex items-center justify-center text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-3 rounded-[16px]">
                <span className="text-[#6a6a6a] dark:text-[#94a3b8] block">Target Organization</span>
                <span className="font-medium text-[#0a0a0a] dark:text-[#ffffff] text-sm">{selectedIncident.organization}</span>
              </div>
              <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-3 rounded-[16px]">
                <span className="text-[#6a6a6a] dark:text-[#94a3b8] block">Attack Vector</span>
                <span className="font-medium text-[#0a0a0a] dark:text-[#ffffff]">{selectedIncident.attackVector}</span>
              </div>
              <div className="bg-[#1a3a3a] text-[#ffffff] p-3 rounded-[16px]">
                <span className="text-[#ffb084] block">Verified Loss (USD)</span>
                <span className="font-mono font-bold text-base text-[#ffffff]">
                  ${selectedIncident.damageLossUSD.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#1a3a3a] text-[#ffffff] p-3 rounded-[16px]">
                <span className="text-[#ffb084] block">Verified Loss (INR)</span>
                <span className="font-mono font-bold text-base text-[#ffffff]">
                  ₹{(selectedIncident.damageLossINR / 1e7).toFixed(1)} Crores
                </span>
              </div>
            </div>

            {/* MITRE ATT&CK & Defense Kill-Chain Card */}
            <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[18px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-2.5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#ff4d8b]/15 text-[#ff4d8b] border border-[#ff4d8b]/30">
                    {selectedIncident.mitreTechniqueId || 'T1190'}
                  </span>
                  <span className="font-semibold text-xs text-[#0a0a0a] dark:text-[#ffffff]">
                    {selectedIncident.mitreTechniqueName || 'Exploit Public-Facing Application'}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] bg-blue-500/15 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/25">
                  Sector: {selectedIncident.detectedIndustry || 'General Enterprise'}
                </span>
              </div>
              <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] leading-relaxed">
                ZK-PACE Kill-Chain Defense: Automated candidate controls configured to intercept and break this exact attack vector:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {(selectedIncident.mitigatingControlCodes || ['CTRL-01', 'CTRL-06']).map((code) => (
                  <span key={code} className="px-3 py-1 rounded-full bg-[#1a3a3a] text-white text-[11px] font-medium font-mono shadow-xs flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3 text-[#ffb084]" />
                    <span>{code}</span>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {selectedIncident.assetAffected && (
                <div>
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-semibold block">Asset Affected & Data Compromised:</span>
                  <p className="text-[#0a0a0a] dark:text-[#ffffff] mt-0.5 leading-relaxed">{selectedIncident.assetAffected} • {selectedIncident.dataCompromised}</p>
                </div>
              )}
              {selectedIncident.threatActor && (
                <div>
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-semibold block">Threat Actor:</span>
                  <p className="text-[#0a0a0a] dark:text-[#ffffff] mt-0.5">{selectedIncident.threatActor}</p>
                </div>
              )}
              {selectedIncident.vulnerabilityExploited && (
                <div>
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-semibold block">Vulnerability / Exploit Details:</span>
                  <p className="text-[#0a0a0a] dark:text-[#ffffff] mt-0.5">{selectedIncident.vulnerabilityExploited}</p>
                </div>
              )}
              {selectedIncident.detectionMethod && (
                <div>
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-semibold block">Detection Method:</span>
                  <p className="text-[#0a0a0a] dark:text-[#ffffff] mt-0.5">{selectedIncident.detectionMethod}</p>
                </div>
              )}
              {selectedIncident.mitigationMeasures && (
                <div>
                  <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-semibold block">Mitigation Measures Deployed:</span>
                  <p className="text-[#0a0a0a] dark:text-[#ffffff] mt-0.5 leading-relaxed">{selectedIncident.mitigationMeasures}</p>
                </div>
              )}
              {selectedIncident.lessonsLearned && (
                <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-3 rounded-[16px] border border-[#e5e5e5] dark:border-[#1e293b]">
                  <span className="text-[#1a3a3a] font-semibold block">Lessons Learned & Empirical Impact:</span>
                  <p className="text-[#0a0a0a] dark:text-[#ffffff] mt-1 leading-relaxed">{selectedIncident.lessonsLearned}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between">
              <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                Source: {selectedIncident.validatingSource || 'Industry telemetry'}
              </span>
              <button
                onClick={() => {
                  handleCalibrateFromIncident(selectedIncident);
                  setSelectedIncident(null);
                }}
                className="px-4 py-2 rounded-full bg-[#ff4d8b] text-[#ffffff] hover:bg-[#e03a74] text-xs font-medium cursor-pointer shadow-xs"
              >
                Calibrate Active FAIR Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
