import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Layers,
  Cpu,
  Flame,
  CheckCircle2,
  Calculator,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sliders,
  Tag,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useRisk } from '../hooks/useRisk';
import { CveV5Record, CveV5Detail, CveV5Stats, CveV5RiskSimulation } from '../types';

export const CveCatalogView: React.FC = () => {
  const { showToast, selectedScenario, navigateToScenario } = useRisk();

  // State
  const [stats, setStats] = useState<CveV5Stats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);

  const [records, setRecords] = useState<CveV5Record[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoadingRecords, setIsLoadingRecords] = useState<boolean>(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedExploit, setSelectedExploit] = useState<string>('ALL');
  const [selectedVendor, setSelectedVendor] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 40;

  // Modals & detail
  const [selectedCveId, setSelectedCveId] = useState<string | null>(null);
  const [cveDetail, setCveDetail] = useState<CveV5Detail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);
  const [simulation, setSimulation] = useState<CveV5RiskSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationSector, setSimulationSector] = useState<string>('fintech');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load stats once
  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoadingStats(true);
        const res = await fetch('/api/cve-v5/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load CVE stats:', err);
      } finally {
        setIsLoadingStats(false);
      }
    }
    fetchStats();
  }, []);

  // Fetch CVE search results
  useEffect(() => {
    async function fetchRecords() {
      try {
        setIsLoadingRecords(true);
        const params = new URLSearchParams();
        if (debouncedQuery) params.set('query', debouncedQuery);
        if (selectedYear !== 'ALL') params.set('year', selectedYear);
        if (selectedSeverity !== 'ALL') params.set('severity', selectedSeverity);
        if (selectedExploit !== 'ALL') params.set('exploitation', selectedExploit);
        if (selectedVendor !== 'ALL') params.set('vendor', selectedVendor);
        params.set('sortBy', sortBy);
        params.set('sortDir', sortDir);
        params.set('limit', String(pageSize));
        params.set('offset', String((currentPage - 1) * pageSize));

        const res = await fetch(`/api/cve-v5/search?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(data.items || []);
          setTotalCount(data.total || 0);
        }
      } catch (err) {
        console.error('Failed to search CVE records:', err);
      } finally {
        setIsLoadingRecords(false);
      }
    }

    fetchRecords();
  }, [
    debouncedQuery,
    selectedYear,
    selectedSeverity,
    selectedExploit,
    selectedVendor,
    sortBy,
    sortDir,
    currentPage
  ]);

  // Load CVE Detail when modal opens
  const openCveModal = async (cveId: string) => {
    setSelectedCveId(cveId);
    setCveDetail(null);
    setSimulation(null);
    try {
      setIsLoadingDetail(true);
      const res = await fetch(`/api/cve-v5/detail/${cveId}`);
      if (res.ok) {
        const data = await res.json();
        setCveDetail(data);
      }
    } catch (err) {
      console.error('Failed to load CVE detail:', err);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Trigger FAIR Risk Simulation
  const handleSimulateRisk = async (cveId: string, sectorToUse: string = simulationSector) => {
    try {
      setIsSimulating(true);
      setSimulationSector(sectorToUse);
      const res = await fetch('/api/cve-v5/simulate-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cveId, sector: sectorToUse })
      });
      if (res.ok) {
        const data = await res.json();
        setSimulation(data);
        showToast(`FAIR Financial Risk quantified for ${cveId} (${sectorToUse.toUpperCase()})`, 'success');
      }
    } catch (err) {
      console.error('Failed to simulate risk:', err);
      showToast('Simulation failed', 'alert');
    } finally {
      setIsSimulating(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-4 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8] mb-1">
            <span>CVEs on Disk</span>
            <Database className="w-3.5 h-3.5 text-[#1a3a3a] dark:text-[#ffb084]" />
          </div>
          <div className="text-2xl font-medium text-[#0a0a0a] dark:text-[#ffffff] font-display">
            383,135
          </div>
          <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">Full MITRE CVE v5 Dataset</span>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-4 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8] mb-1">
            <span>Indexed for Search</span>
            <Layers className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-2xl font-medium text-blue-600 dark:text-blue-400 font-display">
            {stats?.totalIndexed ? stats.totalIndexed.toLocaleString() : '216,413'}
          </div>
          <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8]">2021–2026 Modern CVEs</span>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-4 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8] mb-1">
            <span>Critical Severity</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-medium text-rose-600 dark:text-rose-400 font-display">
            {stats?.criticalCount ? stats.criticalCount.toLocaleString() : '12,647'}
          </div>
          <span className="text-[10px] text-rose-500/80">CVSS Base Score 9.0 – 10.0</span>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-4 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8] mb-1">
            <span>Exploited in Wild / PoC</span>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-2xl font-medium text-amber-600 dark:text-amber-400 font-display">
            {stats?.activeExploitsCount ? (stats.activeExploitsCount + (stats?.pocExploitsCount || 0)).toLocaleString() : '40,187'}
          </div>
          <span className="text-[10px] text-amber-600/80">CISA ADP SSVC Decisions</span>
        </div>

        <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[20px] p-4 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8] mb-1">
            <span>Enterprise Vendors</span>
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-2xl font-medium text-emerald-600 dark:text-emerald-400 font-display">
            {stats?.uniqueVendors ? stats.uniqueVendors.toLocaleString() : '22,012'}
          </div>
          <span className="text-[10px] text-emerald-600/80">Microsoft, Linux, Google, Apple...</span>
        </div>
      </div>

      {/* Spotlight: Recent Exploited Critical Vulnerabilities */}
      {stats?.recentCriticals && stats.recentCriticals.length > 0 && (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent dark:from-rose-950/30 dark:via-amber-950/20 dark:to-transparent rounded-[24px] p-5 border border-rose-500/20 dark:border-rose-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
              <h3 className="text-sm font-semibold text-[#0a0a0a] dark:text-[#ffffff] font-display">
                High-Impact Exploit Spotlight (CISA ADP Verified Active/PoC)
              </h3>
            </div>
            <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
              Direct O(1) Local Disk Access
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {stats.recentCriticals.slice(0, 4).map((cve) => (
              <div
                key={cve.cveId}
                onClick={() => openCveModal(cve.cveId)}
                className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[16px] p-3.5 border border-[#e5e5e5] dark:border-[#1e293b] hover:border-rose-500/40 cursor-pointer transition-all hover:shadow-sm group space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 group-hover:underline">
                    {cve.cveId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                    {cve.cvssScore ? cve.cvssScore.toFixed(1) : '9.8'}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#0a0a0a] dark:text-[#ffffff] line-clamp-1">
                  {cve.title || `${cve.vendor} ${cve.product} vulnerability`}
                </p>
                <div className="flex items-center justify-between text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] pt-1 border-t border-[#e5e5e5]/50 dark:border-[#1e293b]/50">
                  <span className="truncate max-w-[120px]">{cve.vendor || 'Unknown'}</span>
                  <span className="font-medium text-rose-500 capitalize">{cve.exploitation} Exploit</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] p-5 border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#6a6a6a] dark:text-[#94a3b8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search 383,000+ CVEs (e.g. CVE-2024-2800, GitLab, SQL Injection, RCE, Log4j, Linux)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full pl-10 pr-4 py-2.5 text-xs text-[#0a0a0a] dark:text-[#ffffff] placeholder-[#6a6a6a] dark:placeholder-[#94a3b8] focus:outline-none focus:border-[#1a3a3a] dark:focus:border-[#ffb084]"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#6a6a6a] dark:text-[#94a3b8]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] rounded-full px-3 py-1.5 text-xs text-[#0a0a0a] dark:text-[#ffffff] focus:outline-none"
            >
              <option value="date">Date Published</option>
              <option value="score">CVSS Score</option>
              <option value="cve_id">CVE Identifier</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] border border-[#e5e5e5] dark:border-[#1e293b] text-xs font-mono text-[#0a0a0a] dark:text-[#ffffff]"
              title="Toggle sort direction"
            >
              {sortDir.toUpperCase()}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#e5e5e5] dark:border-[#1e293b] text-xs">
          {/* Year selector */}
          <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium mr-1">Year:</span>
          {['ALL', '2026', '2025', '2024', '2023', '2022', '2021'].map((y) => (
            <button
              key={y}
              onClick={() => {
                setSelectedYear(y);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                selectedYear === y
                  ? 'bg-[#1a3a3a] dark:bg-[#ffb084] text-[#ffffff] dark:text-[#080c14]'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-[#ffffff]'
              }`}
            >
              {y === 'ALL' ? 'All Years' : y}
            </button>
          ))}

          <span className="text-[#e5e5e5] dark:text-[#1e293b] mx-2">|</span>

          {/* Severity selector */}
          <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium mr-1">Severity:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'CRITICAL', label: 'Critical' },
            { id: 'HIGH', label: 'High' },
            { id: 'MEDIUM', label: 'Medium' },
            { id: 'LOW', label: 'Low' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSeverity(s.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                selectedSeverity === s.id
                  ? 'bg-[#1a3a3a] dark:bg-[#ffb084] text-[#ffffff] dark:text-[#080c14]'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-[#ffffff]'
              }`}
            >
              {s.label}
            </button>
          ))}

          <span className="text-[#e5e5e5] dark:text-[#1e293b] mx-2">|</span>

          {/* Exploitation Filter */}
          <span className="text-[#6a6a6a] dark:text-[#94a3b8] font-medium mr-1">SSVC Exploit:</span>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'active', label: 'Active Exploit' },
            { id: 'poc', label: 'PoC Available' }
          ].map((ex) => (
            <button
              key={ex.id}
              onClick={() => {
                setSelectedExploit(ex.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                selectedExploit === ex.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-[#faf5e8] dark:bg-[#1e293b] text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-[#ffffff]'
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search results summary & pagination header */}
      <div className="flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8] px-1">
        <div>
          Showing{' '}
          <span className="font-semibold text-[#0a0a0a] dark:text-[#ffffff]">
            {records.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} –{' '}
            {Math.min(currentPage * pageSize, totalCount)}
          </span>{' '}
          of <span className="font-semibold text-[#0a0a0a] dark:text-[#ffffff]">{totalCount.toLocaleString()}</span> records
          {debouncedQuery && <span> matching &ldquo;{debouncedQuery}&rdquo;</span>}
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage <= 1 || isLoadingRecords}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="p-1.5 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed border border-[#e5e5e5] dark:border-[#1e293b]"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages || isLoadingRecords}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="p-1.5 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed border border-[#e5e5e5] dark:border-[#1e293b]"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main CVE Table */}
      <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[24px] border border-[#e5e5e5] dark:border-[#1e293b] shadow-xs overflow-hidden">
        {isLoadingRecords ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#1a3a3a] dark:text-[#ffb084] animate-spin mx-auto" />
            <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
              Querying local high-performance CVE v5 SQLite FTS5 index...
            </p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <Database className="w-10 h-10 text-[#6a6a6a]/40 mx-auto" />
            <p className="text-sm font-medium text-[#0a0a0a] dark:text-[#ffffff]">No CVEs matched your query</p>
            <p className="text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
              Try searching by a broader keyword, clearing filters, or entering a specific CVE ID.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] border-b border-[#e5e5e5] dark:border-[#1e293b] font-semibold">
                  <th className="py-3 px-4">CVE Identifier</th>
                  <th className="py-3 px-3">CVSS</th>
                  <th className="py-3 px-4">Vulnerability Title & Summary</th>
                  <th className="py-3 px-3">Vendor / Asset</th>
                  <th className="py-3 px-3">Exploitation (SSVC)</th>
                  <th className="py-3 px-3">Published</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#1e293b]">
                {records.map((r) => {
                  const score = r.cvssScore ?? 0;
                  const isCrit = r.severity === 'CRITICAL' || score >= 9.0;
                  const isHigh = r.severity === 'HIGH' || (score >= 7.0 && score < 9.0);
                  const isMed = r.severity === 'MEDIUM' || (score >= 4.0 && score < 7.0);

                  return (
                    <tr
                      key={r.cveId}
                      className="hover:bg-[#faf5e8]/60 dark:hover:bg-[#1e293b]/40 transition-colors"
                    >
                      {/* CVE ID */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openCveModal(r.cveId)}
                          className="font-mono font-bold text-[#1a3a3a] dark:text-[#ffb084] hover:underline cursor-pointer block"
                        >
                          {r.cveId}
                        </button>
                        {r.cweId && (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-[#faf5e8] dark:bg-[#1e293b] text-[#6a6a6a] dark:text-[#94a3b8] font-mono mt-0.5">
                            {r.cweId}
                          </span>
                        )}
                      </td>

                      {/* CVSS Score & Severity */}
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full font-mono text-[11px] font-bold ${
                              isCrit
                                ? 'bg-rose-500 text-white'
                                : isHigh
                                ? 'bg-amber-500 text-white'
                                : isMed
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-400 text-white'
                            }`}
                          >
                            {r.cvssScore !== null ? r.cvssScore.toFixed(1) : 'N/A'}
                          </span>
                          <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] uppercase font-semibold">
                            {r.severity}
                          </span>
                        </div>
                        {r.attackVector && (
                          <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block mt-0.5">
                            {r.attackVector}
                          </span>
                        )}
                      </td>

                      {/* Title & Description */}
                      <td className="py-3 px-4 max-w-md">
                        <p className="font-medium text-[#0a0a0a] dark:text-[#ffffff] line-clamp-1">
                          {r.title || r.description?.slice(0, 80) || 'Vulnerability record'}
                        </p>
                        <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] line-clamp-1 mt-0.5">
                          {r.description || 'No description provided'}
                        </p>
                      </td>

                      {/* Vendor & Product */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-[#0a0a0a] dark:text-[#ffffff] block truncate max-w-[140px]">
                          {r.vendor || 'Unknown'}
                        </span>
                        <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] block truncate max-w-[140px]">
                          {r.product || 'Asset'}
                        </span>
                      </td>

                      {/* SSVC Exploitation Badge */}
                      <td className="py-3 px-3">
                        {r.exploitation === 'active' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse mr-1" />
                            Active in Wild
                          </span>
                        ) : r.exploitation === 'poc' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            PoC Available
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                            None reported
                          </span>
                        )}
                      </td>

                      {/* Published Date */}
                      <td className="py-3 px-3 font-mono text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                        {r.datePublished || 'Unknown'}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openCveModal(r.cveId)}
                            className="px-2.5 py-1 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#1a3a3a] hover:text-white dark:hover:bg-[#ffb084] dark:hover:text-[#080c14] text-[11px] font-medium cursor-pointer transition-colors"
                          >
                            Deep Dive
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Pagination */}
        <div className="p-4 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1 || isLoadingRecords}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              className="px-3 py-1.5 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] disabled:opacity-40 cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages || isLoadingRecords}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              className="px-3 py-1.5 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] disabled:opacity-40 cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CVE Deep Dive & FAIR Financial Simulator Modal */}
      {selectedCveId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#ffffff] dark:bg-[#0c121e] rounded-[28px] max-w-3xl w-full p-6 md:p-8 border border-[#e5e5e5] dark:border-[#1e293b] shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#e5e5e5] dark:border-[#1e293b]">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-base font-bold text-[#1a3a3a] dark:text-[#ffb084]">
                    {selectedCveId}
                  </span>
                  {cveDetail?.cvssScore !== null && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white">
                      CVSS {cveDetail?.cvssScore?.toFixed(1)} ({cveDetail?.severity})
                    </span>
                  )}
                  {cveDetail?.ssvcDetails?.exploitation === 'active' && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600/20 text-rose-500 border border-rose-500/30">
                      Active Wild Exploit
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-medium text-[#0a0a0a] dark:text-[#ffffff] font-display mt-1">
                  {cveDetail?.title || cveDetail?.product || selectedCveId}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#6a6a6a] dark:text-[#94a3b8] mt-1">
                  <span>Assigner: <strong>{cveDetail?.assigner || 'MITRE'}</strong></span>
                  <span>Published: <strong>{cveDetail?.datePublished}</strong></span>
                  {cveDetail?.cweId && <span>Weakness: <strong>{cveDetail.cweId}</strong></span>}
                </div>
              </div>

              <button
                onClick={() => setSelectedCveId(null)}
                className="w-8 h-8 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] flex items-center justify-center text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-[#ffffff] cursor-pointer"
              >
                ✕
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="py-16 text-center space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#1a3a3a] dark:text-[#ffb084]" />
                <p className="text-xs text-[#6a6a6a]">Reading parsed CVE v5 container...</p>
              </div>
            ) : (
              <>
                {/* Description */}
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-[#6a6a6a] dark:text-[#94a3b8] uppercase tracking-wider">
                    Vulnerability Description
                  </h4>
                  <p className="text-xs text-[#0a0a0a] dark:text-[#ffffff] leading-relaxed bg-[#faf5e8] dark:bg-[#1e293b] p-4 rounded-[16px] border border-[#e5e5e5] dark:border-[#1e293b]">
                    {cveDetail?.fullDescription || cveDetail?.description}
                  </p>
                </div>

                {/* CVSS Metrics Breakdown Grid */}
                {cveDetail?.cvssMetrics && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-[#6a6a6a] dark:text-[#94a3b8] uppercase tracking-wider">
                      CVSS v{cveDetail.cvssMetrics.version} Vector Telemetry
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-2.5 rounded-[12px]">
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">Attack Vector</span>
                        <span className="font-semibold text-[#0a0a0a] dark:text-[#ffffff]">
                          {cveDetail.cvssMetrics.attackVector}
                        </span>
                      </div>
                      <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-2.5 rounded-[12px]">
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">Complexity</span>
                        <span className="font-semibold text-[#0a0a0a] dark:text-[#ffffff]">
                          {cveDetail.cvssMetrics.attackComplexity}
                        </span>
                      </div>
                      <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-2.5 rounded-[12px]">
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">Privileges Required</span>
                        <span className="font-semibold text-[#0a0a0a] dark:text-[#ffffff]">
                          {cveDetail.cvssMetrics.privilegesRequired}
                        </span>
                      </div>
                      <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-2.5 rounded-[12px]">
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">User Interaction</span>
                        <span className="font-semibold text-[#0a0a0a] dark:text-[#ffffff]">
                          {cveDetail.cvssMetrics.userInteraction}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* CISA SSVC ADP Vulnrichment Box */}
                {cveDetail?.ssvcDetails && (
                  <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent p-4 rounded-[16px] border border-blue-500/20 text-xs space-y-2">
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 font-semibold">
                      <ShieldAlert className="w-4 h-4" />
                      <span>CISA ADP Vulnrichment / Stakeholder-Specific Decision (SSVC)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-1">
                      <div>
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">Exploitation</span>
                        <span className="font-bold text-[#0a0a0a] dark:text-[#ffffff] capitalize">
                          {cveDetail.ssvcDetails.exploitation}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">Automatable</span>
                        <span className="font-bold text-[#0a0a0a] dark:text-[#ffffff] capitalize">
                          {cveDetail.ssvcDetails.automatable}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] block">Technical Impact</span>
                        <span className="font-bold text-[#0a0a0a] dark:text-[#ffffff] capitalize">
                          {cveDetail.ssvcDetails.technicalImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Affected Versions */}
                {cveDetail?.affectedVersions && cveDetail.affectedVersions.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <h4 className="text-xs font-semibold text-[#6a6a6a] dark:text-[#94a3b8] uppercase tracking-wider">
                      Affected Software & Versions
                    </h4>
                    <div className="bg-[#faf5e8] dark:bg-[#1e293b] p-3 rounded-[16px] border border-[#e5e5e5] dark:border-[#1e293b] space-y-2 max-h-36 overflow-y-auto">
                      {cveDetail.affectedVersions.map((aff, i) => (
                        <div key={i} className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-medium text-[#0a0a0a] dark:text-[#ffffff]">
                            {aff.vendor} / {aff.product}
                          </span>
                          <span className="font-mono text-[11px] text-[#6a6a6a] dark:text-[#94a3b8]">
                            {aff.versions.map((v) => `${v.version}${v.lessThan ? ` < ${v.lessThan}` : ''}`).join(', ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAIR Financial Risk Simulator Box */}
                <div className="bg-[#1a3a3a] text-white p-5 rounded-[20px] space-y-4 shadow-sm border border-[#1a3a3a]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-[#ffb084]" />
                      <div>
                        <h4 className="text-sm font-semibold font-display text-white">
                          Empirical FAIR Financial Risk Simulation
                        </h4>
                        <p className="text-[11px] text-white/70">
                          Simulate loss exposure for your enterprise if this vulnerability remains unmitigated.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => selectedCveId && handleSimulateRisk(selectedCveId, simulationSector)}
                      disabled={isSimulating}
                      className="px-4 py-2 rounded-full bg-[#ff4d8b] hover:bg-[#e03a74] text-xs font-medium cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
                    >
                      {isSimulating ? 'Simulating...' : 'Calculate Financial Loss'}
                    </button>
                  </div>

                  {/* Industry Presets Selector */}
                  <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-white/60 font-medium mr-1">Industry Preset:</span>
                    {[
                      { id: 'fintech', label: 'FinTech', sub: 'Razorpay', badge: '$5.97M' },
                      { id: 'banking', label: 'Banking', sub: 'HDFC', badge: '$5.97M' },
                      { id: 'healthcare', label: 'Healthcare', sub: 'Apollo', badge: '$9.77M' },
                      { id: 'technology', label: 'Cloud SaaS', sub: 'Zoho', badge: '$4.97M' },
                      { id: 'manufacturing', label: 'Industrial', sub: 'Mfg', badge: '$5.56M' }
                    ].map((preset) => {
                      const isActive = simulationSector === preset.id;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSimulationSector(preset.id);
                            if (selectedCveId) handleSimulateRisk(selectedCveId, preset.id);
                          }}
                          disabled={isSimulating}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer border ${
                            isActive
                              ? 'bg-[#ff4d8b] text-white border-[#ff4d8b] shadow-xs'
                              : 'bg-white/10 text-white/80 border-white/15 hover:bg-white/20'
                          }`}
                        >
                          <span className="font-semibold">{preset.label}</span>
                          <span className="opacity-60 text-[10px] ml-1">({preset.sub})</span>
                          <span className="opacity-75 font-mono text-[9px] ml-1 text-[#ffb084]">{preset.badge}</span>
                        </button>
                      );
                    })}
                  </div>

                  {simulation && (
                    <div className="space-y-4 pt-3 border-t border-white/15 text-xs">

                      {/* IBM Benchmark Badge */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                          📊 {simulation.sectorBenchmarkSource}
                        </span>
                        <span className="text-white/50 text-[10px]">
                          Base: ${(simulation.sectorBenchmarkUSD / 1e6).toFixed(2)}M avg breach cost
                        </span>
                      </div>

                      {/* Top 4 FAIR KPIs */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-white/10 p-3 rounded-[14px]">
                          <span className="text-[10px] text-[#ffb084] block">Threat Event Freq.</span>
                          <span className="text-base font-bold text-white font-mono">
                            {simulation.estimatedTef.toFixed(1)} / yr
                          </span>
                          <span className="text-[9px] text-white/50">CISA KEV velocity</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-[14px]">
                          <span className="text-[10px] text-[#ffb084] block">P(Exploit Success)</span>
                          <span className="text-base font-bold text-white font-mono">
                            {(simulation.estimatedVulnerability * 100).toFixed(0)}%
                          </span>
                          <span className="text-[9px] text-white/50">CVSS exploitability</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-[14px]">
                          <span className="text-[10px] text-[#ffb084] block">Loss per Incident</span>
                          <span className="text-base font-bold text-[#ffb084] font-mono">
                            ₹{(simulation.lossMagnitudeINR / 1e7).toFixed(1)} Cr
                          </span>
                          <span className="text-[9px] text-white/50">${(simulation.lossMagnitudeUSD / 1e6).toFixed(2)}M USD</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-[14px]">
                          <span className="text-[10px] text-[#ffb084] block">Annual Risk (ALE)</span>
                          <span className="text-base font-bold text-rose-400 font-mono">
                            ₹{(simulation.annualRiskINR / 1e7).toFixed(1)} Cr
                          </span>
                          <span className="text-[9px] text-white/50">LEF={simulation.estimatedLef.toFixed(2)} × LM</span>
                        </div>
                      </div>

                      {/* Loss Range P10 / P50 / P90 */}
                      <div className="bg-white/5 p-3 rounded-[14px] flex items-center justify-between text-xs">
                        <span className="text-white/80">Empirical Loss Band (FAIR log-normal):</span>
                        <div className="flex items-center space-x-4 font-mono text-xs">
                          <span>P10: <strong className="text-white">₹{(simulation.lossRangeINR.p10INR / 1e7).toFixed(1)} Cr</strong></span>
                          <span>P50: <strong className="text-[#ffb084]">₹{(simulation.lossRangeINR.p50INR / 1e7).toFixed(1)} Cr</strong></span>
                          <span>P90: <strong className="text-rose-400">₹{(simulation.lossRangeINR.p90INR / 1e7).toFixed(1)} Cr</strong></span>
                        </div>
                      </div>

                      {/* Itemised Loss Component Breakdown (IBM 2024 Chapter 3) */}
                      {simulation.lossComponents && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-[#ffb084] block">
                            Loss Component Breakdown — IBM Cost of Data Breach 2024:
                          </span>
                          <div className="bg-white/5 rounded-[14px] overflow-hidden">
                            <table className="w-full text-[11px]">
                              <tbody>
                                {[
                                  { label: '🔍 Incident Response & Forensics', pct: '18%', val: simulation.lossComponents.incidentResponse },
                                  { label: '⏸ Business Interruption & Downtime', pct: '28%', val: simulation.lossComponents.businessInterruption },
                                  { label: '💾 Data Recovery & System Restoration', pct: '15%', val: simulation.lossComponents.dataRecovery },
                                  { label: '⚖️ Regulatory Fines (DPDP/RBI/SEBI)', pct: '12%+', val: simulation.lossComponents.regulatoryFines },
                                  { label: '📉 Reputational Damage & Churn', pct: '19%', val: simulation.lossComponents.reputationalChurn },
                                  { label: '📋 Legal Fees & Victim Notifications', pct: '8%', val: simulation.lossComponents.legalNotification },
                                  ...(simulation.lossComponents.ransomwarePayment ? [{ label: '💀 Ransom Payment (FBI IC3 avg 8%)', pct: '~8%', val: simulation.lossComponents.ransomwarePayment }] : [])
                                ].map((item, i) => {
                                  const pct = simulation.lossMagnitudeINR > 0
                                    ? Math.round((item.val / simulation.lossMagnitudeINR) * 100)
                                    : 0;
                                  return (
                                    <tr key={i} className="border-b border-white/5 last:border-0">
                                      <td className="px-3 py-2 text-white/80">{item.label}</td>
                                      <td className="px-3 py-2 text-white/50 text-right w-12">{item.pct}</td>
                                      <td className="px-3 py-2 text-right w-28">
                                        <span className="font-mono font-semibold text-[#ffb084]">
                                          ₹{(item.val / 1e7).toFixed(2)} Cr
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 w-24">
                                        <div className="bg-white/10 rounded-full h-1.5 overflow-hidden">
                                          <div className="bg-gradient-to-r from-[#ffb084] to-rose-400 h-full rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Documented Real-World Breaches */}
                      {simulation.realWorldBreaches && simulation.realWorldBreaches.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-rose-400 flex items-center gap-1.5">
                            📌 Documented Real-World Financial Losses for {simulation.cveId}:
                          </span>
                          <div className="space-y-2">
                            {simulation.realWorldBreaches.map((breach, i) => (
                              <div key={i} className="bg-rose-500/10 border border-rose-500/20 rounded-[12px] p-3 space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold text-white text-[11px]">{breach.incidentName} ({breach.year})</span>
                                  <span className="font-mono font-bold text-rose-300 shrink-0">
                                    ${breach.documentedLossUSD >= 1e9
                                      ? `${(breach.documentedLossUSD / 1e9).toFixed(1)}B`
                                      : breach.documentedLossUSD >= 1e6
                                        ? `${(breach.documentedLossUSD / 1e6).toFixed(1)}M`
                                        : `${(breach.documentedLossUSD / 1e3).toFixed(0)}K`
                                    } USD
                                  </span>
                                </div>
                                {breach.victimOrg && (
                                  <span className="text-[10px] text-white/60 block">Victims: {breach.victimOrg}</span>
                                )}
                                <span className="text-[10px] text-white/50 block italic">{breach.notes}</span>
                                <span className="text-[10px] text-blue-400 block">📎 {breach.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommended Controls */}
                      <div>
                        <span className="text-xs font-semibold text-[#ffb084] block mb-1">
                          Recommended Mitigation Controls:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {simulation.recommendedControls.map((ctrl, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-full bg-white/10 text-white text-[11px] font-medium"
                            >
                              {ctrl}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-[11px] text-white/70 leading-relaxed italic">
                        {simulation.justification}
                      </p>
                    </div>
                  )}

                </div>


                {/* References */}
                {cveDetail?.references && cveDetail.references.length > 0 && (
                  <div className="space-y-1 text-xs">
                    <h4 className="text-xs font-semibold text-[#6a6a6a] dark:text-[#94a3b8] uppercase tracking-wider">
                      Authoritative References & Vendor Advisories
                    </h4>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {cveDetail.references.slice(0, 6).map((ref, i) => (
                        <a
                          key={i}
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 text-blue-600 dark:text-blue-400 hover:underline truncate"
                        >
                          <ExternalLink className="w-3 h-3 shrink-0" />
                          <span className="truncate">{ref.name || ref.url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="pt-3 border-t border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between">
              <span className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-mono">
                Source: {cveDetail?.relPath || `cves/${selectedCveId}.json`}
              </span>
              <button
                onClick={() => setSelectedCveId(null)}
                className="px-4 py-2 rounded-full bg-[#faf5e8] dark:bg-[#1e293b] text-[#0a0a0a] dark:text-[#ffffff] text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
