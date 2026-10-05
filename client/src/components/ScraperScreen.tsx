import React, { useState, useEffect, useCallback } from 'react';
import {
  Bug,
  Play,
  Square,
  RefreshCw,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Search,
  Filter,
  Globe,
  Zap,
  FileDown,
  ChevronDown,
  ChevronUp,
  Calendar,
  Shield,
  Activity,
  Server,
  ToggleLeft,
  ToggleRight,
  Plus
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// Types (mirrored from scraper server)
// ─────────────────────────────────────────────────────────────────────────────

interface ScrapedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  cveID: string;
  title: string;
  vendor: string;
  product: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore?: number;
  discoveredDate: string;
  summary: string;
  extractedUrl: string;
  attackVector?: string;
  isActivelyExploited: boolean;
  ransomwareLinked: boolean;
  correlatedScenarioId?: string;
  tags: string[];
  scrapedAt: string;
}

interface SourceConfig {
  id: string;
  name: string;
  category: string;
  targetUrl: string;
  status: 'ONLINE' | 'SCRAPING' | 'ERROR' | 'IDLE';
  lastScraped: string;
  latencyMs: number;
  itemsFound: number;
  enabled: boolean;
  description: string;
}

interface ScrapeResult {
  success: boolean;
  sourceId: string;
  sourceName: string;
  latencyMs: number;
  itemsCount: number;
  newItems: ScrapedItem[];
  logs: string[];
  timestamp: string;
  error?: string;
}

interface ScheduleState {
  cadence: string;
  intervalMs: number;
  lastRunAt: string | null;
  nextRunAt: string | null;
  runCount: number;
  isRunning: boolean;
}

type Cadence = 'off' | '30s' | '1m' | '5m' | '15m' | '1h';

// ─────────────────────────────────────────────────────────────────────────────
// .toon format helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Serialises scraped items into .toon format.
 * .toon is a structured plaintext intelligence format used by CyberPulse.
 *
 * Structure:
 *   TOON/1.0  <--- format header
 *   EXPORTED: <iso-timestamp>
 *   COUNT: <n>
 *   ────────────────────────────────────────────
 *   RECORD <n>
 *   ID: ...
 *   CVE: ...
 *   TITLE: ...
 *   SOURCE: ...
 *   SEVERITY: ...  CVSS: ...
 *   VENDOR: ...  PRODUCT: ...
 *   DATE: ...  SCRAPED_AT: ...
 *   VECTOR: ...
 *   EXPLOITED: yes/no  RANSOMWARE: yes/no
 *   SCENARIO: ...
 *   TAGS: tag1, tag2
 *   SUMMARY:
 *     <wrapped text>
 *   URL: ...
 *   ────────────────────────────────────────────
 */
function toToon(items: ScrapedItem[]): string {
  const SEP = '─'.repeat(60);
  const wrap = (text: string, indent = '  ', width = 100): string =>
    text
      .replace(/\s+/g, ' ')
      .trim()
      .split(new RegExp(`.{1,${width - indent.length}}(\\s|$)`, 'g'))
      .filter(Boolean)
      .map((l) => indent + l.trim())
      .join('\n');

  const lines: string[] = [
    'TOON/1.0',
    `EXPORTED: ${new Date().toISOString()}`,
    `COUNT: ${items.length}`,
    `GENERATOR: CyberPulse ZK-PACE Threat Intelligence Scraper`,
    SEP,
    ''
  ];

  items.forEach((item, idx) => {
    lines.push(`RECORD ${idx + 1}`);
    lines.push(`ID: ${item.id}`);
    lines.push(`CVE: ${item.cveID}`);
    lines.push(`TITLE: ${item.title}`);
    lines.push(`SOURCE: ${item.sourceName}  (${item.sourceId})`);
    lines.push(`SEVERITY: ${item.severity}  CVSS: ${item.cvssScore ?? 'N/A'}`);
    lines.push(`VENDOR: ${item.vendor}  PRODUCT: ${item.product}`);
    lines.push(`DATE: ${item.discoveredDate}  SCRAPED_AT: ${item.scrapedAt}`);
    lines.push(`VECTOR: ${item.attackVector || 'Unknown'}`);
    lines.push(`EXPLOITED: ${item.isActivelyExploited ? 'yes' : 'no'}  RANSOMWARE: ${item.ransomwareLinked ? 'yes' : 'no'}`);
    lines.push(`SCENARIO: ${item.correlatedScenarioId || 'none'}`);
    lines.push(`TAGS: ${item.tags.join(', ')}`);
    lines.push('SUMMARY:');
    lines.push(wrap(item.summary));
    lines.push(`URL: ${item.extractedUrl}`);
    lines.push(SEP);
    lines.push('');
  });

  return lines.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const SCRAPER_BASE = '/scraper-api';

const SEVERITY_COLORS: Record<string, string> = {
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  HIGH:     'bg-orange-50 text-orange-700 border-orange-200',
  MEDIUM:   'bg-yellow-50 text-yellow-700 border-yellow-200',
  LOW:      'bg-green-50 text-green-700 border-green-200'
};

const CADENCE_OPTIONS: { value: Cadence; label: string }[] = [
  { value: 'off',  label: 'Manual only' },
  { value: '30s',  label: 'Every 30s' },
  { value: '1m',   label: 'Every 1 min' },
  { value: '5m',   label: 'Every 5 min' },
  { value: '15m',  label: 'Every 15 min' },
  { value: '1h',   label: 'Every hour' }
];

export const ScraperScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'run' | 'results' | 'sources' | 'custom'>('run');

  // Data
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [items, setItems] = useState<ScrapedItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduleState | null>(null);
  const [scraperOnline, setScraperOnline] = useState<boolean | null>(null);

  // Run state
  const [isScraping, setIsScraping] = useState(false);
  const [lastResults, setLastResults] = useState<ScrapeResult[]>([]);
  const [runLogs, setRunLogs] = useState<string[]>([]);

  // Custom URL
  const [customUrl, setCustomUrl] = useState('https://thehackernews.com/');
  const [customScenario, setCustomScenario] = useState('scen-01');
  const [isCustomScraping, setIsCustomScraping] = useState(false);
  const [customResult, setCustomResult] = useState<ScrapeResult | null>(null);

  // Filter
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterScenario, setFilterScenario] = useState('all');

  // Selected for download
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Schedule cadence local state
  const [cadence, setCadence] = useState<Cadence>('off');

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  const checkHealth = useCallback(async () => {
    try {
      const res = await fetch(`${SCRAPER_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      setScraperOnline(res.ok);
    } catch {
      setScraperOnline(false);
    }
  }, []);

  const loadSources = useCallback(async () => {
    try {
      const res = await fetch(`${SCRAPER_BASE}/sources`);
      if (res.ok) {
        const d = await res.json();
        setSources(d.sources || []);
      }
    } catch {}
  }, []);

  const loadItems = useCallback(async () => {
    try {
      const res = await fetch(`${SCRAPER_BASE}/items?limit=200`);
      if (res.ok) {
        const d = await res.json();
        setItems(d.items || []);
      }
    } catch {}
  }, []);

  const loadSchedule = useCallback(async () => {
    try {
      const res = await fetch(`${SCRAPER_BASE}/schedule/status`);
      if (res.ok) {
        const d = await res.json();
        setSchedule(d.schedule);
        setCadence((d.schedule?.cadence as Cadence) || 'off');
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkHealth();
    loadSources();
    loadItems();
    loadSchedule();
  }, []);

  // ── Run all scrapers ────────────────────────────────────────────────────────

  const handleRunAll = async () => {
    if (isScraping) return;
    setIsScraping(true);
    setRunLogs([`[${new Date().toISOString()}] Dispatching scrape request to all enabled sources…`]);
    try {
      const res = await fetch(`${SCRAPER_BASE}/scrape/all`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setLastResults(data.results || []);
      setItems(data.items || []);
      const logs: string[] = [];
      (data.results || []).forEach((r: ScrapeResult) => {
        logs.push(...(r.logs || []));
      });
      setRunLogs(logs);
      await loadSources();
    } catch (err: any) {
      setRunLogs((p) => [...p, `[ERROR] ${err.message}`]);
    } finally {
      setIsScraping(false);
    }
  };

  // ── Run single source ───────────────────────────────────────────────────────

  const handleRunSource = async (sourceId: string) => {
    try {
      const res = await fetch(`${SCRAPER_BASE}/scrape/source/${sourceId}`, { method: 'POST' });
      if (res.ok) {
        await loadItems();
        await loadSources();
      }
    } catch {}
  };

  // ── Custom URL scrape ───────────────────────────────────────────────────────

  const handleCustomScrape = async () => {
    if (!customUrl || isCustomScraping) return;
    setIsCustomScraping(true);
    setCustomResult(null);
    try {
      const res = await fetch(`${SCRAPER_BASE}/scrape/custom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: customUrl, targetScenarioId: customScenario })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: ScrapeResult = await res.json();
      setCustomResult(data);
      await loadItems();
    } catch (err: any) {
      setCustomResult({ success: false, error: err.message, sourceId: 'custom-url', sourceName: '', latencyMs: 0, itemsCount: 0, newItems: [], logs: [], timestamp: new Date().toISOString() });
    } finally {
      setIsCustomScraping(false);
    }
  };

  // ── Schedule ────────────────────────────────────────────────────────────────

  const handleSetCadence = async (c: Cadence) => {
    setCadence(c);
    try {
      await fetch(`${SCRAPER_BASE}/schedule/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadence: c })
      });
      await loadSchedule();
    } catch {}
  };

  // ── Toggle source ────────────────────────────────────────────────────────────

  const handleToggleSource = async (id: string, enabled: boolean) => {
    try {
      await fetch(`${SCRAPER_BASE}/sources/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      await loadSources();
    } catch {}
  };

  // ── Clear all items ──────────────────────────────────────────────────────────

  const handleClearAll = async () => {
    if (!window.confirm('Reset all scraped data to seed items?')) return;
    try {
      await fetch(`${SCRAPER_BASE}/items`, { method: 'DELETE' });
      await loadItems();
      setSelectedIds(new Set());
    } catch {}
  };

  // ── Selection ────────────────────────────────────────────────────────────────

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredItems.map((i) => i.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Download ─────────────────────────────────────────────────────────────────

  const downloadSelected = (format: 'toon' | 'json') => {
    const toDownload = selectedIds.size > 0
      ? items.filter((i) => selectedIds.has(i.id))
      : filteredItems;

    if (toDownload.length === 0) return;

    if (format === 'toon') {
      downloadFile(toToon(toDownload), `cyberpulse-intel-${timestamp()}.toon`, 'text/plain;charset=utf-8');
    } else {
      downloadFile(JSON.stringify(toDownload, null, 2), `cyberpulse-intel-${timestamp()}.json`, 'application/json');
    }
  };

  const downloadSingle = (item: ScrapedItem, format: 'toon' | 'json') => {
    if (format === 'toon') {
      downloadFile(toToon([item]), `${item.cveID}-${timestamp()}.toon`, 'text/plain;charset=utf-8');
    } else {
      downloadFile(JSON.stringify(item, null, 2), `${item.cveID}-${timestamp()}.json`, 'application/json');
    }
  };

  // ── Filter ────────────────────────────────────────────────────────────────────

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      item.cveID.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.vendor.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q));
    const matchSev = filterSeverity === 'all' || item.severity === filterSeverity;
    const matchSrc = filterSource === 'all' || item.sourceId === filterSource;
    const matchScen = filterScenario === 'all' || item.correlatedScenarioId === filterScenario;
    return matchSearch && matchSev && matchSrc && matchScen;
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const offlineBanner = scraperOnline === false && (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl px-5 py-3 flex items-center space-x-3 text-xs">
      <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
      <div>
        <span className="font-semibold text-orange-800">Scraper server offline</span>
        <span className="text-orange-600 ml-2">Start it with <code className="bg-orange-100 px-1.5 py-0.5 rounded font-mono">cd server && npm run dev</code></span>
      </div>
      <button onClick={checkHealth} className="ml-auto text-orange-600 hover:text-orange-800 font-medium flex items-center space-x-1 cursor-pointer">
        <RefreshCw className="w-3.5 h-3.5" />
        <span>Retry</span>
      </button>
    </div>
  );

  return (
    <div className="space-y-6 pb-16">

      {/* ── Hero Header ─────────────────────────────────────────────────────── */}
      <div className="bg-[#1a3a3a] rounded-[24px] p-7 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Bug className="w-5 h-5 text-[#ffb084]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Intelligence Scraper</h1>
                <p className="text-xs text-[#a4d4c5] mt-0.5">
                  Standalone scraper server — collect, store, and export threat data in .toon format
                </p>
              </div>
              <span className={`ml-2 inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                scraperOnline === true
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                  : scraperOnline === false
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-white/10 text-white/60 border border-white/20'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${scraperOnline === true ? 'bg-green-400 animate-pulse' : scraperOnline === false ? 'bg-red-400' : 'bg-gray-400'}`} />
                <span>{scraperOnline === true ? 'Server Online' : scraperOnline === false ? 'Server Offline' : 'Checking…'}</span>
              </span>
            </div>

            {/* Stats row */}
            <div className="flex items-center space-x-5 text-xs text-[#a4d4c5] font-mono">
              <span><strong className="text-white">{items.length}</strong> records in store</span>
              <span>•</span>
              <span><strong className="text-white">{sources.filter(s=>s.enabled).length}/{sources.length}</strong> sources enabled</span>
              <span>•</span>
              <span>Schedule: <strong className="text-[#ffb084]">{schedule?.cadence === 'off' || !schedule ? 'manual' : schedule.cadence}</strong></span>
              {schedule?.runCount ? <><span>•</span><span><strong className="text-white">{schedule.runCount}</strong> auto-runs</span></> : null}
            </div>
          </div>

          {/* Primary action buttons */}
          <div className="flex items-center space-x-2.5 shrink-0">
            <button
              onClick={handleRunAll}
              disabled={isScraping || scraperOnline === false}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white hover:bg-[#faf5e8] text-[#0a0a0a] font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isScraping
                ? <RefreshCw className="w-4 h-4 animate-spin" />
                : <Play className="w-4 h-4 text-[#1a3a3a]" />}
              <span>{isScraping ? 'Scraping…' : 'Run All Sources'}</span>
            </button>

            <button
              onClick={() => downloadSelected('toon')}
              disabled={filteredItems.length === 0}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#ffb084] hover:bg-[#ffa070] text-[#0a0a0a] font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Download as .toon"
            >
              <FileDown className="w-4 h-4" />
              <span>Download .toon</span>
            </button>
          </div>
        </div>
      </div>

      {offlineBanner}

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center space-x-1.5 bg-[#faf5e8] p-1.5 rounded-full border border-[#e5e5e5] w-fit">
        {(['run', 'results', 'sources', 'custom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
                : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
            }`}
          >
            {tab === 'run' && 'Run & Schedule'}
            {tab === 'results' && `Results (${items.length})`}
            {tab === 'sources' && `Sources (${sources.length})`}
            {tab === 'custom' && 'Custom URL'}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: RUN & SCHEDULE
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'run' && (
        <div className="space-y-5">

          {/* Schedule control */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-5 h-5 text-[#1a3a3a]" />
              <h2 className="text-sm font-semibold text-[#0a0a0a]">Auto-Scrape Schedule</h2>
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              {CADENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSetCadence(opt.value)}
                  disabled={scraperOnline === false}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border disabled:opacity-40 ${
                    cadence === opt.value
                      ? 'bg-[#1a3a3a] text-white border-[#1a3a3a]'
                      : 'bg-[#faf5e8] text-[#3a3a3a] border-[#e5e5e5] hover:border-[#1a3a3a]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {schedule && schedule.cadence !== 'off' && (
              <div className="mt-4 pt-4 border-t border-[#f0f0f0] flex items-center justify-between text-xs text-[#6a6a6a]">
                <span>Last run: <strong className="text-[#0a0a0a] font-mono">{schedule.lastRunAt ? new Date(schedule.lastRunAt).toLocaleTimeString() : '—'}</strong></span>
                <span>Next run: <strong className="text-[#0a0a0a] font-mono">{schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleTimeString() : '—'}</strong></span>
                <span>Total runs: <strong className="text-[#0a0a0a]">{schedule.runCount}</strong></span>
              </div>
            )}
          </div>

          {/* Source cards — each with individual run button */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {sources.filter(s => s.id !== 'custom-url').map((src) => {
              const result = lastResults.find(r => r.sourceId === src.id);
              return (
                <div key={src.id} className="bg-white border border-[#e5e5e5] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Server className="w-4 h-4 text-[#1a3a3a] shrink-0" />
                        <span className="text-xs font-semibold text-[#0a0a0a] truncate">{src.name}</span>
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        src.status === 'ONLINE'   ? 'bg-green-50 text-green-700 border-green-200'
                        : src.status === 'SCRAPING' ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : src.status === 'ERROR'    ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {src.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6a6a6a] mt-2 leading-relaxed line-clamp-2">{src.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#f0f0f0] space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-[#6a6a6a] font-mono">
                      <span>{src.itemsFound} items • {src.latencyMs}ms</span>
                      <span>{new Date(src.lastScraped).toLocaleTimeString()}</span>
                    </div>

                    {result && (
                      <div className="text-[11px] text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
                        ✓ {result.itemsCount} new items in {result.latencyMs}ms
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleSource(src.id, !src.enabled)}
                        className="flex items-center space-x-1.5 text-[11px] font-medium cursor-pointer"
                      >
                        {src.enabled
                          ? <ToggleRight className="w-4 h-4 text-[#1a3a3a]" />
                          : <ToggleLeft className="w-4 h-4 text-[#9a9a9a]" />}
                        <span className={src.enabled ? 'text-[#1a3a3a]' : 'text-[#9a9a9a]'}>
                          {src.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>

                      <button
                        onClick={() => handleRunSource(src.id)}
                        disabled={!src.enabled || scraperOnline === false}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0a0a0a] text-white text-[11px] font-semibold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Scrape Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Run logs */}
          {runLogs.length > 0 && (
            <div className="bg-[#0a0a0a] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-[#a4d4c5]" />
                  <span className="text-xs font-semibold text-[#a4d4c5]">Scrape Logs</span>
                </div>
                <button onClick={() => setRunLogs([])} className="text-[#6a6a6a] hover:text-white text-[11px] cursor-pointer">Clear</button>
              </div>
              <div className="max-h-52 overflow-y-auto space-y-0.5 no-scrollbar">
                {runLogs.map((line, i) => (
                  <p key={i} className="text-[11px] font-mono text-[#a4d4c5] leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: RESULTS
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'results' && (
        <div className="space-y-4">

          {/* Toolbar */}
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center gap-3 shadow-xs">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-[#9a9a9a] absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search CVE, vendor, summary…"
                className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-xl pl-9 pr-3 py-2 text-xs text-[#0a0a0a] placeholder-[#9a9a9a] focus:outline-none focus:border-[#1a3a3a]"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2 text-xs">
              <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer text-[#0a0a0a]">
                <option value="all">All Severity</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer text-[#0a0a0a]">
                <option value="all">All Sources</option>
                <option value="cisa-kev">CISA KEV</option>
                <option value="cert-in">CERT-In</option>
                <option value="nvd-nist">NVD NIST</option>
                <option value="github-ghsa">GitHub GHSA</option>
                <option value="threatfox-abuse">ThreatFox</option>
                <option value="custom-url">Custom URL</option>
              </select>
              <select value={filterScenario} onChange={e => setFilterScenario(e.target.value)}
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-3 py-1.5 focus:outline-none cursor-pointer text-[#0a0a0a]">
                <option value="all">All Scenarios</option>
                <option value="scen-01">Ransomware</option>
                <option value="scen-02">Cloud IAM</option>
                <option value="scen-03">API Gateway</option>
                <option value="scen-04">Supply Chain</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 ml-auto shrink-0">
              {selectedIds.size > 0 ? (
                <>
                  <span className="text-xs text-[#6a6a6a]">{selectedIds.size} selected</span>
                  <button onClick={clearSelection} className="text-xs text-[#6a6a6a] hover:text-[#0a0a0a] cursor-pointer">Clear</button>
                </>
              ) : (
                <button onClick={selectAll} className="text-xs text-[#6a6a6a] hover:text-[#0a0a0a] cursor-pointer">Select all</button>
              )}
              <button onClick={() => downloadSelected('toon')}
                disabled={filteredItems.length === 0}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#ffb084] hover:bg-[#ffa070] text-[#0a0a0a] text-xs font-semibold transition-all cursor-pointer disabled:opacity-40">
                <FileDown className="w-3.5 h-3.5" />
                <span>.toon {selectedIds.size > 0 ? `(${selectedIds.size})` : `(${filteredItems.length})`}</span>
              </button>
              <button onClick={() => downloadSelected('json')}
                disabled={filteredItems.length === 0}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#faf5e8] border border-[#e5e5e5] text-[#0a0a0a] text-xs font-semibold transition-all cursor-pointer disabled:opacity-40">
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button onClick={handleClearAll}
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold transition-all cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-2">
            {filteredItems.length === 0 && (
              <div className="text-center py-16 bg-white border border-[#e5e5e5] rounded-2xl">
                <Bug className="w-8 h-8 text-[#c0c0c0] mx-auto mb-3" />
                <p className="text-sm text-[#6a6a6a]">No records yet. Run the scraper to collect intelligence.</p>
              </div>
            )}
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              const isSelected = selectedIds.has(item.id);
              return (
                <div key={item.id}
                  className={`bg-white border rounded-2xl transition-all shadow-xs ${isSelected ? 'border-[#1a3a3a]' : 'border-[#e5e5e5]'}`}>
                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(item.id)}
                        className="mt-0.5 w-4 h-4 rounded accent-[#1a3a3a] cursor-pointer shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        {/* Header row */}
                        <div className="flex items-center flex-wrap gap-2 mb-2">
                          <span className="font-mono text-xs font-bold text-[#ff4d8b]">{item.cveID}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[item.severity] || ''}`}>
                            {item.severity}{item.cvssScore ? ` ${item.cvssScore}` : ''}
                          </span>
                          {item.isActivelyExploited && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">Exploited</span>
                          )}
                          {item.ransomwareLinked && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200">Ransomware</span>
                          )}
                          <span className="text-[10px] text-[#6a6a6a] bg-[#faf5e8] px-2 py-0.5 rounded-full border border-[#e5e5e5]">{item.sourceName}</span>
                          <span className="text-[10px] text-[#6a6a6a] font-mono ml-auto">{item.discoveredDate}</span>
                        </div>

                        <h3 className="text-sm font-semibold text-[#0a0a0a] leading-snug mb-1">{item.title}</h3>
                        <p className="text-xs text-[#5a5a5a] leading-relaxed line-clamp-2">{item.summary}</p>

                        {/* Tags */}
                        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1 mt-2">
                          {item.tags.slice(0, 6).map((tag, i) => (
                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[#faf5e8] text-[#6a6a6a] border border-[#e5e5e5] font-mono">#{tag}</span>
                          ))}
                        </div>
                      </div>

                      {/* Action column */}
                      <div className="flex flex-col items-end space-y-2 shrink-0">
                        <button
                          onClick={() => downloadSingle(item, 'toon')}
                          title="Download as .toon"
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#ffb084]/20 hover:bg-[#ffb084]/40 text-[#c05a00] text-[11px] font-semibold cursor-pointer transition-all"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                          <span>.toon</span>
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                          className="text-[11px] text-[#6a6a6a] hover:text-[#0a0a0a] flex items-center space-x-1 cursor-pointer"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          <span>{isExpanded ? 'Less' : 'More'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#f0f0f0] space-y-3">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
                          <div className="bg-[#faf5e8] rounded-xl p-3">
                            <p className="text-[#6a6a6a] uppercase font-semibold tracking-wide mb-1">Vendor</p>
                            <p className="text-[#0a0a0a] font-mono">{item.vendor}</p>
                          </div>
                          <div className="bg-[#faf5e8] rounded-xl p-3">
                            <p className="text-[#6a6a6a] uppercase font-semibold tracking-wide mb-1">Product</p>
                            <p className="text-[#0a0a0a] font-mono">{item.product}</p>
                          </div>
                          <div className="bg-[#faf5e8] rounded-xl p-3">
                            <p className="text-[#6a6a6a] uppercase font-semibold tracking-wide mb-1">Attack Vector</p>
                            <p className="text-[#0a0a0a]">{item.attackVector || '—'}</p>
                          </div>
                          <div className="bg-[#faf5e8] rounded-xl p-3">
                            <p className="text-[#6a6a6a] uppercase font-semibold tracking-wide mb-1">Scenario</p>
                            <p className="text-[#0a0a0a] font-mono">{item.correlatedScenarioId || '—'}</p>
                          </div>
                        </div>

                        {/* .toon preview */}
                        <div className="bg-[#0a0a0a] rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-semibold text-[#a4d4c5] font-mono">.toon preview</span>
                            <button onClick={() => downloadSingle(item, 'toon')}
                              className="text-[11px] text-[#ffb084] hover:text-white font-semibold cursor-pointer flex items-center space-x-1">
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </button>
                          </div>
                          <pre className="text-[10px] font-mono text-[#a4d4c5] whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto no-scrollbar">
                            {toToon([item])}
                          </pre>
                        </div>

                        <div className="flex items-center justify-between">
                          <a href={item.extractedUrl} target="_blank" rel="noreferrer"
                            className="text-xs text-[#1a3a3a] hover:text-[#ff4d8b] inline-flex items-center space-x-1 font-medium cursor-pointer">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View source advisory</span>
                          </a>
                          <span className="text-[10px] text-[#9a9a9a] font-mono">Scraped: {new Date(item.scrapedAt).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: SOURCES
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sources.map((src) => (
              <div key={src.id} className="bg-white border border-[#e5e5e5] rounded-2xl p-6 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <Globe className="w-4 h-4 text-[#1a3a3a] shrink-0" />
                      <span className="text-sm font-semibold text-[#0a0a0a]">{src.name}</span>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#faf5e8] text-[#6a6a6a] border border-[#e5e5e5]">{src.category}</span>
                    <p className="text-xs text-[#5a5a5a] mt-2 leading-relaxed">{src.description}</p>
                    {src.targetUrl && (
                      <a href={src.targetUrl} target="_blank" rel="noreferrer"
                        className="text-[11px] text-[#1a3a3a] hover:text-[#ff4d8b] inline-flex items-center space-x-1 mt-2 cursor-pointer font-mono break-all">
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-xs">{src.targetUrl}</span>
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2 shrink-0">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      src.status === 'ONLINE'   ? 'bg-green-50 text-green-700 border-green-200'
                      : src.status === 'ERROR'    ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                    }`}>{src.status}</span>
                    <button onClick={() => handleToggleSource(src.id, !src.enabled)}
                      className="flex items-center space-x-1.5 text-xs font-medium cursor-pointer">
                      {src.enabled
                        ? <ToggleRight className="w-5 h-5 text-[#1a3a3a]" />
                        : <ToggleLeft className="w-5 h-5 text-[#9a9a9a]" />}
                      <span className={src.enabled ? 'text-[#1a3a3a]' : 'text-[#9a9a9a]'}>{src.enabled ? 'On' : 'Off'}</span>
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-between text-[11px] text-[#6a6a6a] font-mono">
                  <span>{src.itemsFound} items found</span>
                  <span>{src.latencyMs}ms</span>
                  <span>Last: {new Date(src.lastScraped).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: CUSTOM URL
          ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'custom' && (
        <div className="space-y-5">
          <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-semibold text-[#0a0a0a] flex items-center space-x-2">
                <Globe className="w-5 h-5 text-[#1a3a3a]" />
                <span>Scrape Any URL</span>
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-1 leading-relaxed">
                Paste any security news page, vendor advisory, or CERT bulletin. The scraper will extract CVE IDs, threat actors, and vendor names, then save results in .toon format.
              </p>
            </div>

            {/* Quick presets */}
            <div>
              <p className="text-xs font-semibold text-[#0a0a0a] mb-2">Quick presets:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'The Hacker News', url: 'https://thehackernews.com/' },
                  { label: 'BleepingComputer', url: 'https://www.bleepingcomputer.com/news/security/' },
                  { label: 'CERT-In India', url: 'https://www.cert-in.org.in/' },
                  { label: 'CISA Advisories', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories' },
                  { label: 'NIST NVD Recent', url: 'https://nvd.nist.gov/vuln/search' }
                ].map((p) => (
                  <button key={p.url} onClick={() => setCustomUrl(p.url)}
                    className="px-3 py-1.5 rounded-full text-xs bg-[#faf5e8] border border-[#e5e5e5] hover:border-[#1a3a3a] text-[#3a3a3a] font-medium cursor-pointer transition-all">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* URL input */}
            <div className="flex items-center space-x-3">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 text-[#9a9a9a] absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com/security-advisory"
                  className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#0a0a0a] focus:outline-none focus:border-[#1a3a3a]"
                />
              </div>
              <select value={customScenario} onChange={e => setCustomScenario(e.target.value)}
                className="bg-[#faf5e8] border border-[#e5e5e5] rounded-xl px-3 py-2.5 text-xs focus:outline-none cursor-pointer text-[#0a0a0a]">
                <option value="scen-01">Ransomware</option>
                <option value="scen-02">Cloud IAM</option>
                <option value="scen-03">API Gateway</option>
                <option value="scen-04">Supply Chain</option>
              </select>
              <button
                onClick={handleCustomScrape}
                disabled={!customUrl || isCustomScraping || scraperOnline === false}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1a3a3a] hover:bg-[#2b5a5a] text-white text-sm font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isCustomScraping ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-[#ffb084]" />}
                <span>{isCustomScraping ? 'Scraping…' : 'Scrape & Save'}</span>
              </button>
            </div>

            {/* Result */}
            {customResult && (
              <div className={`rounded-2xl p-5 border ${customResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                {customResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-800">
                          {customResult.itemsCount} record{customResult.itemsCount !== 1 ? 's' : ''} scraped from {customResult.sourceName}
                        </span>
                        <span className="text-xs text-green-600 font-mono">({customResult.latencyMs}ms)</span>
                      </div>
                      <button
                        onClick={() => downloadFile(toToon(customResult.newItems), `custom-${timestamp()}.toon`, 'text/plain;charset=utf-8')}
                        disabled={customResult.newItems.length === 0}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#ffb084] text-[#0a0a0a] text-xs font-semibold cursor-pointer disabled:opacity-40 transition-all"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Download .toon</span>
                      </button>
                    </div>

                    {/* Logs */}
                    {customResult.logs.length > 0 && (
                      <div className="bg-[#0a0a0a] rounded-xl p-4 max-h-40 overflow-y-auto no-scrollbar">
                        {customResult.logs.map((l, i) => (
                          <p key={i} className="text-[11px] font-mono text-[#a4d4c5] leading-relaxed">{l}</p>
                        ))}
                      </div>
                    )}

                    {/* New items preview */}
                    {customResult.newItems.length > 0 && (
                      <div className="space-y-2">
                        {customResult.newItems.map((item) => (
                          <div key={item.id} className="bg-white rounded-xl p-4 border border-green-100">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-mono text-xs font-bold text-[#ff4d8b]">{item.cveID}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${SEVERITY_COLORS[item.severity] || ''}`}>{item.severity}</span>
                            </div>
                            <p className="text-xs font-semibold text-[#0a0a0a]">{item.title}</p>
                            <p className="text-[11px] text-[#5a5a5a] mt-1 line-clamp-2">{item.summary}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-700">{customResult.error || 'Scrape failed'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

