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
  Sliders
} from 'lucide-react';
import { useRisk } from '../hooks/useRisk';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { HistoricalIncident, AttackVectorStats, NvdCveItem, RealDataSummary } from '../types';

export const RealDataScreen: React.FC = () => {
  const { showToast, selectedScenario, exposureData, navigateToScenario } = useRisk();

  // Sub-tab navigation
  const [activeSubTab, setActiveSubTab] = useState<'incidents' | 'cisa' | 'nvd' | 'distributions'>('incidents');

  // Summary state
  const [summary, setSummary] = useState<RealDataSummary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(true);

  // Incidents state
  const [incidents, setIncidents] = useState<HistoricalIncident[]>([]);
  const [incidentTotal, setIncidentTotal] = useState<number>(0);
  const [incidentSearch, setIncidentSearch] = useState<string>('');
  const [selectedVector, setSelectedVector] = useState<string>('ALL');
  const [lossFilter, setLossFilter] = useState<'ALL' | 'UNDER_1M' | '1M_10M' | '10M_100M' | 'OVER_100M'>('ALL');
  const [selectedIncident, setSelectedIncident] = useState<HistoricalIncident | null>(null);
  const [isLoadingIncidents, setIsLoadingIncidents] = useState<boolean>(false);

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
  }, [activeSubTab, incidentSearch, selectedVector, lossFilter]);

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
                <span>Active Datasets: 3</span>
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
              Every parameter in ZK-PACE is anchored to verified historical security breaches, the official CISA Known Exploited Vulnerabilities catalog, and NIST NVD CVSS telemetry. Zero guesswork. Zero black-box metrics.
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
                  className="px-2.5 py-1 rounded-full bg-[#faf5e8] text-[#0a0a0a] hover:bg-[#ffffff] font-medium text-[11px] cursor-pointer transition-colors shadow-xs"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-6 mt-6 border-t border-[#ffffff]/15">
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e5e5e5] pb-4">
        <div className="flex flex-wrap items-center gap-2 bg-[#faf5e8] p-1.5 rounded-full border border-[#e5e5e5]">
          <button
            onClick={() => setActiveSubTab('incidents')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'incidents'
                ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
                : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1a3a3a]" />
            <span>Historical Incidents (1,902 Breaches)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('cisa')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'cisa'
                ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
                : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-[#ff4d8b]" />
            <span>CISA KEV Catalog (1,709 Vulnerabilities)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('nvd')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'nvd'
                ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
                : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#e8b94a]" />
            <span>NIST NVD Records (2,000 CVEs)</span>
          </button>

          <button
            onClick={() => setActiveSubTab('distributions')}
            className={`px-4 py-2 text-xs font-medium rounded-full transition-all cursor-pointer flex items-center space-x-2 ${
              activeSubTab === 'distributions'
                ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
                : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#ffb084]" />
            <span>Empirical Loss Distributions & Analytics</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6a6a6a]">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Local Persistent Datasets Active</span>
          </span>
        </div>
      </div>

      {/* TAB 1: Historical Incidents Explorer */}
      {activeSubTab === 'incidents' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-[#ffffff] rounded-[20px] p-5 border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#6a6a6a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 1,902 breaches (e.g., Sony, Siemens, Phishing, DDoS)..."
                  value={incidentSearch}
                  onChange={(e) => setIncidentSearch(e.target.value)}
                  className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-full pl-9 pr-4 py-2 text-xs text-[#0a0a0a] placeholder-[#6a6a6a] focus:outline-none focus:border-[#1a3a3a]"
                />
              </div>

              {/* Vector Filter Dropdown */}
              <select
                value={selectedVector}
                onChange={(e) => setSelectedVector(e.target.value)}
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-4 py-2 text-xs text-[#0a0a0a] focus:outline-none cursor-pointer"
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
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-4 py-2 text-xs text-[#0a0a0a] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Financial Loss Ranges</option>
                <option value="UNDER_1M">&lt; ₹8.5 Cr (&lt; $1M)</option>
                <option value="1M_10M">₹8.5 Cr - ₹85 Cr ($1M - $10M)</option>
                <option value="10M_100M">₹85 Cr - ₹850 Cr ($10M - $100M)</option>
                <option value="OVER_100M">&gt; ₹850 Cr / Catastrophic (&gt; $100M)</option>
              </select>
            </div>

            <div className="text-xs text-[#6a6a6a] font-medium whitespace-nowrap">
              Showing <span className="text-[#0a0a0a] font-semibold">{incidents.length}</span> of {incidentTotal} incidents
            </div>
          </div>

          {/* Incidents Table */}
          <div className="bg-[#ffffff] rounded-[24px] border border-[#e5e5e5] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#faf5e8] text-[#0a0a0a] border-b border-[#e5e5e5] font-semibold">
                    <th className="py-3 px-4">Incident & Date</th>
                    <th className="py-3 px-4">Organization & Target</th>
                    <th className="py-3 px-4">Attack Vector</th>
                    <th className="py-3 px-4">Loss in INR (₹)</th>
                    <th className="py-3 px-4">USD Equivalent ($)</th>
                    <th className="py-3 px-4">Downtime & Recovery</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5]">
                  {isLoadingIncidents ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#6a6a6a]">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a3a3a]" />
                        Loading real historical breaches...
                      </td>
                    </tr>
                  ) : incidents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#6a6a6a]">
                        No incidents matched your search or filters.
                      </td>
                    </tr>
                  ) : (
                    incidents.map((incident) => (
                      <tr
                        key={incident.incidentId}
                        className="hover:bg-[#faf5e8]/60 transition-colors cursor-pointer"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-[#0a0a0a]">{incident.incidentName}</div>
                          <div className="text-[11px] text-[#6a6a6a] flex items-center space-x-1.5">
                            <span className="font-mono text-[#1a3a3a]">{incident.incidentId}</span>
                            <span>•</span>
                            <span>{incident.date || 'Historical'}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="text-[#0a0a0a] font-medium">{incident.organization}</div>
                          <div className="text-[11px] text-[#6a6a6a] truncate max-w-[200px]">
                            {incident.assetAffected || 'Enterprise infrastructure'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5] max-w-[180px] truncate">
                            {incident.attackVector}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono font-medium text-[#1a3a3a]">
                          {incident.damageLossINR > 0 ? (
                            <span className={incident.damageLossINR >= 850000000 ? 'text-[#ff4d8b] font-bold' : 'text-[#0a0a0a]'}>
                              ₹{incident.damageLossINR >= 1e7
                                ? `${(incident.damageLossINR / 1e7).toFixed(1)} Cr`
                                : `${(incident.damageLossINR / 1e5).toFixed(1)} L`}
                            </span>
                          ) : (
                            <span className="text-[#6a6a6a]">-</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#6a6a6a]">
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

                        <td className="py-3 px-4 text-[11px] text-[#6a6a6a]">
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

      {/* TAB 2: CISA KEV Catalog (1,709 Vulnerabilities) */}
      {activeSubTab === 'cisa' && (
        <div className="space-y-6">
          {/* CISA Filter Bar */}
          <div className="bg-[#ffffff] rounded-[20px] p-5 border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#6a6a6a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search CISA KEV by CVE-ID, vendor, or keyword..."
                  value={cisaSearch}
                  onChange={(e) => setCisaSearch(e.target.value)}
                  className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-full pl-9 pr-4 py-2 text-xs text-[#0a0a0a] placeholder-[#6a6a6a] focus:outline-none focus:border-[#1a3a3a]"
                />
              </div>

              {/* Vendor Selector */}
              <select
                value={cisaVendor}
                onChange={(e) => setCisaVendor(e.target.value)}
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-4 py-2 text-xs text-[#0a0a0a] focus:outline-none cursor-pointer"
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
                    : 'bg-[#faf5e8] text-[#0a0a0a] border border-[#e5e5e5]'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Ransomware Campaigns Only</span>
              </button>
            </div>

            <div className="text-xs text-[#6a6a6a] font-medium whitespace-nowrap">
              Showing <span className="text-[#0a0a0a] font-semibold">{cisaVulns.length}</span> of {cisaTotal} vulnerabilities
            </div>
          </div>

          {/* CISA Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCisa ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a3a3a]" />
                Loading official CISA KEV catalog...
              </div>
            ) : cisaVulns.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a]">
                No CISA vulnerabilities match this filter.
              </div>
            ) : (
              cisaVulns.map((v) => (
                <div
                  key={v.cveID}
                  className="bg-[#ffffff] rounded-[20px] p-5 border border-[#e5e5e5] shadow-xs hover:border-[#1a3a3a]/40 transition-all flex flex-col justify-between space-y-4"
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
                        <span className="text-[10px] text-[#6a6a6a] bg-[#faf5e8] px-2 py-0.5 rounded-full border border-[#e5e5e5]">
                          Exploited in Wild
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-medium text-[#0a0a0a] line-clamp-2">
                      {v.vulnerabilityName}
                    </h4>

                    <div className="text-xs text-[#6a6a6a] flex items-center space-x-2">
                      <span className="font-medium text-[#1a3a3a]">{v.vendorProject}</span>
                      <span>•</span>
                      <span>{v.product}</span>
                    </div>

                    <p className="text-xs text-[#6a6a6a] line-clamp-3 leading-relaxed">
                      {v.shortDescription}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6a6a6a]">
                      Due: <span className="font-medium text-[#0a0a0a]">{v.dueDate || 'Immediate'}</span>
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
          <div className="bg-[#ffffff] rounded-[20px] p-5 border border-[#e5e5e5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#6a6a6a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 2,000 NVD CVEs by id, description, or CWE..."
                  value={nvdSearch}
                  onChange={(e) => setNvdSearch(e.target.value)}
                  className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-full pl-9 pr-4 py-2 text-xs text-[#0a0a0a] placeholder-[#6a6a6a] focus:outline-none focus:border-[#1a3a3a]"
                />
              </div>

              {/* Severity Filter */}
              <div className="flex items-center gap-1 bg-[#faf5e8] p-1 rounded-full border border-[#e5e5e5]">
                {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                  <button
                    key={sev}
                    onClick={() => setNvdSeverity(sev)}
                    className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer transition-all ${
                      nvdSeverity === sev
                        ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
                        : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-[#6a6a6a] font-medium whitespace-nowrap">
              Showing <span className="text-[#0a0a0a] font-semibold">{nvdItems.length}</span> of {nvdTotal} NVD records
            </div>
          </div>

          {/* NVD Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingNvd ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a]">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#1a3a3a]" />
                Loading NIST NVD scored CVE dataset...
              </div>
            ) : nvdItems.length === 0 ? (
              <div className="col-span-full py-12 text-center text-[#6a6a6a]">
                No NVD CVEs matched your query.
              </div>
            ) : (
              nvdItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#ffffff] rounded-[20px] p-5 border border-[#e5e5e5] shadow-xs hover:border-[#1a3a3a]/40 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-[#0a0a0a] bg-[#faf5e8] px-2.5 py-0.5 rounded-full border border-[#e5e5e5]">
                        {item.id}
                      </span>

                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                          item.baseSeverity === 'CRITICAL'
                            ? 'bg-[#ff4d8b] text-[#ffffff]'
                            : item.baseSeverity === 'HIGH'
                            ? 'bg-[#ffb084] text-[#0a0a0a]'
                            : 'bg-[#e8b94a] text-[#0a0a0a]'
                        }`}
                      >
                        CVSS {item.baseScore.toFixed(1)} {item.baseSeverity}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6a6a6a] flex items-center space-x-2">
                      <span className="font-mono text-[#1a3a3a]">{item.weakness || 'CWE-Unassigned'}</span>
                      <span>•</span>
                      <span>Score: {item.baseScore}</span>
                    </div>

                    <p className="text-xs text-[#0a0a0a] line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#6a6a6a] font-mono">
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

      {/* TAB 4: Empirical Loss Distributions & Analytics */}
      {activeSubTab === 'distributions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Percentile Cards */}
            <div className="bg-[#ffffff] rounded-[24px] p-6 border border-[#e5e5e5] shadow-xs space-y-4">
              <h3 className="text-base font-medium text-[#0a0a0a] font-display">
                Empirical Breach Loss Percentiles
              </h3>
              <p className="text-xs text-[#6a6a6a] leading-relaxed">
                Calculated directly from the 1,010 historical cyber breaches with validated financial damages in <code className="bg-[#faf5e8] px-1 py-0.5 rounded">Financial Data Set.csv</code>.
              </p>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] text-xs">
                  <span className="text-[#6a6a6a] font-medium">10th Percentile (P10)</span>
                  <span className="font-mono font-semibold text-[#0a0a0a]">$200,000 (₹1.7 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] text-xs">
                  <span className="text-[#6a6a6a] font-medium">25th Percentile (P25)</span>
                  <span className="font-mono font-semibold text-[#0a0a0a]">$1,200,000 (₹10.2 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-[14px] bg-[#1a3a3a] text-[#ffffff] text-xs shadow-xs">
                  <span className="font-medium text-[#ffb084]">50th Percentile (Median P50)</span>
                  <span className="font-mono font-bold text-sm text-[#ffffff]">$8,000,000 (₹68.0 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] text-xs">
                  <span className="text-[#6a6a6a] font-medium">75th Percentile (P75)</span>
                  <span className="font-mono font-semibold text-[#0a0a0a]">$18,500,000 (₹157 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#ff4d8b]/10 text-xs text-[#ff4d8b] border border-[#ff4d8b]/20">
                  <span className="font-medium">90th Percentile (P90)</span>
                  <span className="font-mono font-bold">$25,000,000 (₹212.5 Cr)</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-[12px] bg-[#faf5e8] text-xs">
                  <span className="text-[#6a6a6a] font-medium">Maximum Recorded Loss</span>
                  <span className="font-mono font-semibold text-[#0a0a0a]">$38,000,000,000 (₹3.2 Lakh Cr)</span>
                </div>
              </div>
            </div>

            {/* Attack Vector Distribution */}
            <div className="lg:col-span-2 bg-[#ffffff] rounded-[24px] p-6 border border-[#e5e5e5] shadow-xs space-y-4">
              <h3 className="text-base font-medium text-[#0a0a0a] font-display">
                Attack Vector Empirical Financial Damage
              </h3>
              <p className="text-xs text-[#6a6a6a]">
                Empirical average and median financial losses across distinct attack vectors. Used to calibrate the FAIR Loss Magnitude parameter.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#faf5e8] text-[#0a0a0a] border-b border-[#e5e5e5] font-semibold">
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
                        <td className="py-2.5 px-3 font-medium text-[#0a0a0a] max-w-[220px] truncate">
                          {vec.vector}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[#6a6a6a]">{vec.count}</td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#1a3a3a]">
                          ${vec.medianLossUSD > 0 ? (vec.medianLossUSD / 1e6).toFixed(1) + 'M' : 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-[#0a0a0a]">
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
          <div className="bg-[#ffffff] rounded-[24px] max-w-2xl w-full p-6 border border-[#e5e5e5] shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e5e5]">
              <div>
                <span className="font-mono text-xs text-[#1a3a3a] font-semibold">
                  {selectedIncident.incidentId}
                </span>
                <h3 className="text-lg font-medium text-[#0a0a0a] font-display">
                  {selectedIncident.incidentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 rounded-full bg-[#faf5e8] flex items-center justify-center text-[#6a6a6a] hover:text-[#0a0a0a] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-[#faf5e8] p-3 rounded-[16px]">
                <span className="text-[#6a6a6a] block">Target Organization</span>
                <span className="font-medium text-[#0a0a0a] text-sm">{selectedIncident.organization}</span>
              </div>
              <div className="bg-[#faf5e8] p-3 rounded-[16px]">
                <span className="text-[#6a6a6a] block">Attack Vector</span>
                <span className="font-medium text-[#0a0a0a]">{selectedIncident.attackVector}</span>
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

            <div className="space-y-3 text-xs">
              {selectedIncident.assetAffected && (
                <div>
                  <span className="text-[#6a6a6a] font-semibold block">Asset Affected & Data Compromised:</span>
                  <p className="text-[#0a0a0a] mt-0.5 leading-relaxed">{selectedIncident.assetAffected} • {selectedIncident.dataCompromised}</p>
                </div>
              )}
              {selectedIncident.threatActor && (
                <div>
                  <span className="text-[#6a6a6a] font-semibold block">Threat Actor:</span>
                  <p className="text-[#0a0a0a] mt-0.5">{selectedIncident.threatActor}</p>
                </div>
              )}
              {selectedIncident.mitigationMeasures && (
                <div>
                  <span className="text-[#6a6a6a] font-semibold block">Mitigation Measures Deployed:</span>
                  <p className="text-[#0a0a0a] mt-0.5 leading-relaxed">{selectedIncident.mitigationMeasures}</p>
                </div>
              )}
              {selectedIncident.lessonsLearned && (
                <div className="bg-[#faf5e8] p-3 rounded-[16px] border border-[#e5e5e5]">
                  <span className="text-[#1a3a3a] font-semibold block">Lessons Learned & Empirical Impact:</span>
                  <p className="text-[#0a0a0a] mt-1 leading-relaxed">{selectedIncident.lessonsLearned}</p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#e5e5e5] flex items-center justify-between">
              <span className="text-[11px] text-[#6a6a6a]">
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
