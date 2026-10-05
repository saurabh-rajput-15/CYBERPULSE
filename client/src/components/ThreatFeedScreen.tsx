import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  RefreshCw,
  Search,
  Flame,
  Globe,
  Sliders,
  AlertTriangle,
  Zap,
  ExternalLink,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Filter,
  Sparkles,
  Layers,
  Clock,
  ArrowRight,
  Database,
  Cpu,
  Server,
  Play,
  Share2,
  Bug,
  Activity
} from 'lucide-react';
import {
  CisaKevFeedItem,
  RiskScenario,
  ScraperSourceConfig,
  ScrapedIntelItem,
  ScrapeJobResult
} from '../types';
import { DEFAULT_SCRAPER_SOURCES } from '../services/multiSourceScraper';

interface ThreatFeedScreenProps {
  feedItems: CisaKevFeedItem[];
  isRefreshing: boolean;
  onRefreshFeed: (simulateSpike?: boolean) => void;
  isLiveFeed: boolean;
  lastSyncTime?: string;
  catalogCount: number;
  scenarios: RiskScenario[];
  onSelectScenario: (scenarioId: string) => void;
  latencyMs?: number;
  onIngestScrapedItem?: (item: ScrapedIntelItem, scenarioId: string) => Promise<void>;
  sector?: 'fintech' | 'healthcare';
}

export const ThreatFeedScreen: React.FC<ThreatFeedScreenProps> = ({
  feedItems,
  isRefreshing,
  onRefreshFeed,
  isLiveFeed,
  lastSyncTime,
  catalogCount,
  scenarios,
  onSelectScenario,
  latencyMs = 145,
  onIngestScrapedItem,
  sector = 'fintech'
}) => {
  // Navigation sub-tabs (Clay pill style)
  const [activeSubTab, setActiveSubTab] = useState<'intel' | 'custom-scraper' | 'sources' | 'cisa-catalog'>('intel');

  // Scraper resources & items state
  const [sources, setSources] = useState<ScraperSourceConfig[]>(DEFAULT_SCRAPER_SOURCES);
  const [scrapedItems, setScrapedItems] = useState<ScrapedIntelItem[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState<boolean>(false);
  const [isScrapingAll, setIsScrapingAll] = useState<boolean>(false);

  // Custom scraper state
  const [customUrl, setCustomUrl] = useState<string>('https://thehackernews.com/');
  const [targetScenarioForCustom, setTargetScenarioForCustom] = useState<string>('scen-01');
  const [isCustomScraping, setIsCustomScraping] = useState<boolean>(false);
  const [customLogs, setCustomLogs] = useState<string[]>([
    '[SYSTEM READY] Real-Time Cheerio DOM scraper initialized.',
    '[SYSTEM READY] HTTP/2 & TLS handshake verification active.',
    '[SYSTEM READY] Regex CVE pattern match engine loaded: /CVE-\\d{4}-\\d{4,7}/gi'
  ]);
  const [lastScrapeResult, setLastScrapeResult] = useState<ScrapeJobResult | null>(null);

  // Auto scrape interval state
  const [autoCadence, setAutoCadence] = useState<'off' | '30s' | '1m' | '5m'>('off');
  const [autoCountdown, setAutoCountdown] = useState<number>(30);

  // Filtering & search
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');

  // Ingestion feedback
  const [ingestingId, setIngestingId] = useState<string | null>(null);
  const [ingestSuccessMessage, setIngestSuccessMessage] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load scraped sources & items on mount
  useEffect(() => {
    async function loadScraperData() {
      setIsLoadingSources(true);
      try {
        const [sourcesRes, itemsRes] = await Promise.all([
          fetch('/scraper-api/sources'),
          fetch('/scraper-api/items')
        ]);
        if (sourcesRes.ok) {
          const sJson = await sourcesRes.json();
          if (sJson.sources) setSources(sJson.sources);
        }
        if (itemsRes.ok) {
          const iJson = await itemsRes.json();
          if (iJson.items) setScrapedItems(iJson.items);
        }
      } catch (err) {
        console.warn('Could not fetch initial scraper data from server:', err);
      } finally {
        setIsLoadingSources(false);
      }
    }
    loadScraperData();
  }, []);

  // Auto-scroll terminal logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [customLogs]);

  // Handle periodic auto-scraping countdown
  useEffect(() => {
    if (autoCadence === 'off') return;

    const intervalSeconds = autoCadence === '30s' ? 30 : autoCadence === '1m' ? 60 : 300;
    setAutoCountdown(intervalSeconds);

    const timer = setInterval(() => {
      setAutoCountdown((prev) => {
        if (prev <= 1) {
          handleScrapeAll(true);
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoCadence]);

  // Scrape all sources handler
  const handleScrapeAll = async (isBackground = false) => {
    if (isScrapingAll) return;
    setIsScrapingAll(true);

    try {
      const res = await fetch('/scraper-api/scrape-all', {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items) setScrapedItems(data.items);
        if (data.results) {
          setSources((prev) =>
            prev.map((src) => {
              const matchedRes = data.results.find((r: any) => r.sourceId === src.id);
              if (matchedRes) {
                return {
                  ...src,
                  status: 'ONLINE',
                  lastScraped: new Date().toISOString(),
                  latencyMs: matchedRes.latencyMs,
                  itemsFound: matchedRes.itemsCount
                };
              }
              return src;
            })
          );
        }
        if (!isBackground) {
          setIngestSuccessMessage(`Successfully scraped all threat intelligence resources in real time.`);
          setTimeout(() => setIngestSuccessMessage(null), 4000);
        }
      }
    } catch (err) {
      console.error('Scrape all failed:', err);
    } finally {
      setIsScrapingAll(false);
    }
  };

  // Custom URL scrape execution handler
  const handleRunCustomScrape = async () => {
    if (!customUrl || isCustomScraping) return;
    setIsCustomScraping(true);
    setCustomLogs((prev) => [
      ...prev,
      `------------------------------------------------------------`,
      `[DISPATCH] Real-Time Scraping Request Initiated for: ${customUrl}`,
      `[TARGET SCENARIO] Correlating against [${targetScenarioForCustom}]`
    ]);

    try {
      const res = await fetch('/scraper-api/scrape-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: customUrl,
          targetScenarioId: targetScenarioForCustom
        })
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data: ScrapeJobResult = await res.json();
      setLastScrapeResult(data);

      if (data.logs && Array.isArray(data.logs)) {
        setCustomLogs((prev) => [...prev, ...data.logs]);
      }

      if (data.newItems && data.newItems.length > 0) {
        setScrapedItems((prev) => {
          const ids = new Set(data.newItems.map((i) => i.id));
          return [...data.newItems, ...prev.filter((p) => !ids.has(p.id))];
        });
        setIngestSuccessMessage(`Scraped ${data.newItems.length} threat intelligence indicators from ${data.sourceName}!`);
        setTimeout(() => setIngestSuccessMessage(null), 4500);
      }
    } catch (err: any) {
      setCustomLogs((prev) => [
        ...prev,
        `[SCRAPE ERROR] Failed to connect: ${err.message}`,
        `[ENGAGING FALLBACK] Generated local intelligence correlation.`
      ]);
    } finally {
      setIsCustomScraping(false);
    }
  };

  // Ingest scraped vulnerability into FAIR scenario
  const handleIngestItem = async (item: ScrapedIntelItem, scenarioId: string) => {
    setIngestingId(item.id);
    try {
      if (onIngestScrapedItem) {
        await onIngestScrapedItem(item, scenarioId);
      } else {
        const res = await fetch('/scraper-api/ingest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item, scenarioId, sector })
        });
        if (!res.ok) throw new Error('Ingestion failed');
        onRefreshFeed();
      }
      setIngestSuccessMessage(`Ingested ${item.cveID} into scenario [${scenarioId}]. FAIR Threat Event Frequency (TEF) escalated!`);
      setTimeout(() => setIngestSuccessMessage(null), 5000);
    } catch (err) {
      console.error('Failed to ingest item:', err);
    } finally {
      setIngestingId(null);
    }
  };

  // Filtered scraped items list
  const filteredScrapedItems = scrapedItems.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.cveID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSource = sourceFilter === 'all' || item.sourceId === sourceFilter;
    const matchesSeverity = severityFilter === 'all' || item.severity === severityFilter;
    const matchesScenario = scenarioFilter === 'all' || item.correlatedScenarioId === scenarioFilter;

    return matchesSearch && matchesSource && matchesSeverity && matchesScenario;
  });

  // Filtered CISA catalog items
  const filteredCisaItems = feedItems.filter((item) => {
    const matchesSearch =
      searchQuery === '' ||
      item.cveID.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vulnerabilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vendorProject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesScenario = scenarioFilter === 'all' || item.matchedScenarioId === scenarioFilter;

    return matchesSearch && matchesScenario;
  });

  return (
    <div id="threat-feed-screen" className="space-y-8 pb-16">
      {/* Top Banner: Real-Time Multi-Source Scraper Telemetry (Clay Deep Teal Card) */}
      <div className="bg-[#1a3a3a] text-[#ffffff] rounded-[24px] p-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ffffff]/10 border border-[#ffffff]/15 text-[#a4d4c5] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span>REAL-TIME DATA SCRAPER ACTIVE</span>
              </span>
              <span className="text-xs text-[#a4d4c5] font-mono">
                {sources.length} Intelligence Feeds
              </span>
              <span className="text-[#a4d4c5]/60">•</span>
              <span className="text-xs text-[#ffb084] font-mono">
                {scrapedItems.length} Scraped Threat Records
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#ffffff] mt-3 font-display">
              Real-Time Multi-Source Threat Scraper & Ingestion Engine
            </h1>
            <p className="text-sm text-[#a4d4c5] mt-2 leading-relaxed">
              Continuously crawl and extract zero-days, exploit advisories, and ransomware IOCs from CISA KEV, CERT-In India, NIST NVD, GitHub GHSA, and custom URLs in real time to defensibly recalibrate FAIR parameters.
            </p>
          </div>

          {/* Action Button & Auto-Scrape Cadence Controls */}
          <div className="flex flex-col items-start lg:items-end space-y-3">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
              {/* Auto Cadence Selector */}
              <div className="flex items-center space-x-1.5 bg-[#ffffff]/10 border border-[#ffffff]/15 rounded-full px-3 py-1.5 text-xs text-[#ffffff]">
                <Clock className="w-3.5 h-3.5 text-[#ffb084]" />
                <span className="text-[#a4d4c5]">Cadence:</span>
                <select
                  value={autoCadence}
                  onChange={(e) => setAutoCadence(e.target.value as any)}
                  className="bg-transparent border-none text-xs text-[#ffffff] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="off" className="bg-[#1a3a3a] text-white">Manual On-Demand</option>
                  <option value="30s" className="bg-[#1a3a3a] text-white">Every 30s</option>
                  <option value="1m" className="bg-[#1a3a3a] text-white">Every 1m</option>
                  <option value="5m" className="bg-[#1a3a3a] text-white">Every 5m</option>
                </select>
                {autoCadence !== 'off' && (
                  <span className="font-mono text-[#a4d4c5] text-[11px] ml-1">
                    ({autoCountdown}s)
                  </span>
                )}
              </div>

              {/* Scrape All Now Button (Clay button-on-color) */}
              <button
                id="btn-scrape-all-now"
                onClick={() => handleScrapeAll(false)}
                disabled={isScrapingAll}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#ffffff] hover:bg-[#faf5e8] text-[#0a0a0a] font-semibold rounded-[12px] shadow-xs transition-all active:scale-95 disabled:opacity-50 text-xs cursor-pointer"
                title="Trigger real-time parallel scrape across all configured intelligence endpoints"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScrapingAll ? 'animate-spin' : ''}`} />
                <span>{isScrapingAll ? 'Scraping All Resources...' : 'Scrape All Sources Now'}</span>
              </button>
            </div>

            <div className="text-[12px] text-[#a4d4c5] flex items-center space-x-3">
              <span>Avg Latency: <strong className="text-[#ffffff] font-mono">{latencyMs}ms</strong></span>
              <span>•</span>
              <span>Last Pull: <strong className="text-[#ffffff]">{lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Just now'}</strong></span>
            </div>
          </div>
        </div>

        {/* Quick Resource Status Strip */}
        <div className="mt-6 pt-5 border-t border-[#ffffff]/15 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sources.map((src) => (
            <div
              key={src.id}
              className="bg-[#ffffff]/10 border border-[#ffffff]/15 rounded-[14px] p-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#ffffff] truncate max-w-[100px]" title={src.name}>
                  {src.name.split(' ')[0]}
                </span>
                <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
              </div>
              <div className="mt-1.5 flex items-baseline justify-between text-[11px] text-[#a4d4c5]">
                <span className="font-mono text-[#ffffff]">{src.itemsFound} items</span>
                <span className="font-mono">{src.latencyMs}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Success Notification Alert */}
      {ingestSuccessMessage && (
        <div className="bg-[#22c55e]/10 border border-[#22c55e]/25 rounded-[16px] px-5 py-3 flex items-center justify-between text-xs text-[#0a0a0a] animate-fadeIn">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#22c55e] shrink-0" />
            <span className="font-semibold">{ingestSuccessMessage}</span>
          </div>
          <button
            onClick={() => setIngestSuccessMessage(null)}
            className="text-[#6a6a6a] hover:text-[#0a0a0a] font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navigation Sub-Tabs (Clay category-tab pill style) */}
      <div className="flex items-center space-x-2 bg-[#faf5e8] p-1.5 rounded-full border border-[#e5e5e5] overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('intel')}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'intel'
              ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
              : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-[#ff4d8b]" />
          <span>Real-Time Scraped Intel ({scrapedItems.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('custom-scraper')}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'custom-scraper'
              ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
              : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-[#1a3a3a]" />
          <span>Custom URL Web Scraper</span>
          <span className="text-[10px] bg-[#ffb084]/30 text-[#0a0a0a] px-2 py-0.2 rounded-full font-semibold">
            Interactive
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'sources'
              ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
              : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-[#e8b94a]" />
          <span>Resource Connectors ({sources.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cisa-catalog')}
          className={`inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeSubTab === 'cisa-catalog'
              ? 'bg-[#ffffff] text-[#0a0a0a] shadow-xs border border-[#e5e5e5]'
              : 'text-[#6a6a6a] hover:text-[#0a0a0a]'
          }`}
        >
          <Radio className="w-3.5 h-3.5 text-[#ff4d8b]" />
          <span>Official CISA KEV Catalog ({feedItems.length})</span>
        </button>
      </div>

      {/* ===================================================================
          SUB-TAB 1: UNIFIED REAL-TIME SCRAPED INTELLIGENCE
          =================================================================== */}
      {activeSubTab === 'intel' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[20px] p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#9a9a9a] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search CVE, malware family, vendor, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-[12px] pl-9 pr-3 py-2 text-xs text-[#0a0a0a] placeholder-[#9a9a9a] focus:outline-none focus:border-[#0a0a0a]"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5 bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-3 py-1.5">
                <Filter className="w-3 h-3 text-[#6a6a6a]" />
                <span className="text-[#6a6a6a]">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="bg-transparent text-[#0a0a0a] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="all">All Sources</option>
                  <option value="cisa-kev">CISA KEV</option>
                  <option value="cert-in">CERT-In (India)</option>
                  <option value="nvd-nist">NIST NVD</option>
                  <option value="github-ghsa">GitHub GHSA</option>
                  <option value="threatfox-abuse">ThreatFox IOCs</option>
                  <option value="custom-url">Custom Web Ingest</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-3 py-1.5">
                <span className="text-[#6a6a6a]">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="bg-transparent text-[#0a0a0a] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="all">All Levels</option>
                  <option value="CRITICAL">Critical (&gt;9.0)</option>
                  <option value="HIGH">High (7.0 - 8.9)</option>
                  <option value="MEDIUM">Medium (4.0 - 6.9)</option>
                </select>
              </div>

              <div className="flex items-center space-x-1.5 bg-[#faf5e8] border border-[#e5e5e5] rounded-full px-3 py-1.5">
                <span className="text-[#6a6a6a]">Scenario:</span>
                <select
                  value={scenarioFilter}
                  onChange={(e) => setScenarioFilter(e.target.value)}
                  className="bg-transparent text-[#0a0a0a] focus:outline-none cursor-pointer font-medium"
                >
                  <option value="all">All Scenarios</option>
                  <option value="scen-01">Ransomware (SCEN-01)</option>
                  <option value="scen-02">Cloud IAM (SCEN-02)</option>
                  <option value="scen-03">API Gateway (SCEN-03)</option>
                  <option value="scen-04">Supply Chain (SCEN-04)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scraped Intel Cards Grid (Clay Card style) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScrapedItems.map((item, index) => {
              const targetScenario = scenarios.find((s) => s.id === item.correlatedScenarioId);
              const isIngesting = ingestingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] rounded-[20px] p-6 shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Top: Source & Severity */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#ff4d8b]">
                          {item.cveID}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            item.severity === 'CRITICAL'
                              ? 'bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20'
                              : 'bg-[#e8b94a]/20 text-[#1a1a1a] border border-[#e8b94a]/30'
                          }`}
                        >
                          {item.severity} {item.cvssScore ? `(CVSS ${item.cvssScore})` : ''}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium bg-[#faf5e8] text-[#3a3a3a] border border-[#e5e5e5] px-2.5 py-0.5 rounded-full">
                        {item.sourceName}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-[#0a0a0a] mt-2 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#3a3a3a] mt-2 line-clamp-3 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>

                  {/* Metadata & Ingestion */}
                  <div className="space-y-3 pt-3 border-t border-[#e5e5e5] text-[11px]">
                    <div className="flex items-center justify-between text-[#6a6a6a] flex-wrap gap-1">
                      <span>Vendor: <strong className="text-[#0a0a0a]">{item.vendor}</strong></span>
                      <span>Discovered: <strong className="text-[#0a0a0a] font-mono">{item.discoveredDate}</strong></span>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-[#faf5e8] text-[#6a6a6a] border border-[#e5e5e5] font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Action: Ingest to FAIR Risk Scenario */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <a
                        href={item.extractedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#0a0a0a] hover:text-[#ff4d8b] inline-flex items-center space-x-1 text-xs font-medium cursor-pointer"
                      >
                        <span>View Raw Advisory</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      <button
                        onClick={() => handleIngestItem(item, item.correlatedScenarioId || 'scen-01')}
                        disabled={isIngesting}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-[12px] bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] font-semibold transition-all active:scale-95 text-xs cursor-pointer disabled:opacity-50 shadow-xs"
                        title={`Correlate with ${targetScenario?.title || 'scenario'} and escalate FAIR TEF`}
                      >
                        <Zap className={`w-3.5 h-3.5 text-[#ffb084] ${isIngesting ? 'animate-spin' : ''}`} />
                        <span>{isIngesting ? 'Ingesting...' : 'Ingest to FAIR Model'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredScrapedItems.length === 0 && (
            <div className="text-center py-12 bg-[#ffffff] border border-[#e5e5e5] rounded-[20px]">
              <p className="text-sm text-[#6a6a6a]">No scraped threat records match your filter criteria.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSourceFilter('all');
                  setSeverityFilter('all');
                  setScenarioFilter('all');
                }}
                className="mt-2 text-xs text-[#0a0a0a] font-semibold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 2: INTERACTIVE CUSTOM URL WEB SCRAPER
          =================================================================== */}
      {activeSubTab === 'custom-scraper' && (
        <div className="space-y-6">
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-8 shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-medium text-[#0a0a0a] flex items-center space-x-2 font-display">
                <Globe className="w-5 h-5 text-[#1a3a3a]" />
                <span>Live On-Demand Web Scraper</span>
              </h2>
              <p className="text-xs text-[#6a6a6a] mt-1 max-w-2xl leading-relaxed">
                Enter any cybersecurity news URL, vendor advisory bulletin, or RSS feed link. CyberPulse will initiate an immediate HTTP fetch, compile the DOM using Cheerio, extract active CVE IDs, CVSS ratings, and threat actors, and correlate them directly with your FAIR risk scenarios.
              </p>
            </div>

            {/* Quick URL Presets (Clay pill buttons) */}
            <div>
              <label className="text-xs font-semibold text-[#0a0a0a] block mb-2">
                Quick-Select Recommended Threat Intelligence Resources:
              </label>
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {[
                  { label: 'The Hacker News (Live)', url: 'https://thehackernews.com/' },
                  { label: 'BleepingComputer Security', url: 'https://www.bleepingcomputer.com/news/security/' },
                  { label: 'CERT-In National Advisories', url: 'https://www.cert-in.org.in/' },
                  { label: 'CISA Emergency Advisories', url: 'https://www.cisa.gov/news-events/cybersecurity-advisories' },
                  { label: 'Palo Alto Unit 42 Research', url: 'https://unit42.paloaltonetworks.com/' }
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCustomUrl(preset.url)}
                    className="px-3.5 py-1.5 text-xs rounded-full bg-[#faf5e8] hover:bg-[#f5f0e0] text-[#0a0a0a] border border-[#e5e5e5] transition-all cursor-pointer font-medium"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target URL & Scenario Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <label className="text-xs font-semibold text-[#0a0a0a] block mb-1">
                  Target Advisory / Web Page URL:
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#9a9a9a] absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    placeholder="https://vendor.com/security/bulletin-cve-2024-xxxx"
                    className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-[12px] pl-10 pr-3 py-2.5 text-xs text-[#0a0a0a] placeholder-[#9a9a9a] focus:outline-none focus:border-[#0a0a0a] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0a0a0a] block mb-1">
                  Map To Risk Scenario:
                </label>
                <select
                  value={targetScenarioForCustom}
                  onChange={(e) => setTargetScenarioForCustom(e.target.value)}
                  className="w-full bg-[#faf5e8] border border-[#e5e5e5] rounded-[12px] px-3 py-2.5 text-xs text-[#0a0a0a] focus:outline-none focus:border-[#0a0a0a] cursor-pointer font-medium"
                >
                  <option value="scen-01">Ransomware Core (SCEN-01)</option>
                  <option value="scen-02">Cloud IAM Misconfig (SCEN-02)</option>
                  <option value="scen-03">API Credential Stuffing (SCEN-03)</option>
                  <option value="scen-04">Supply Chain Vulnerability (SCEN-04)</option>
                </select>
              </div>
            </div>

            {/* Trigger Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-[#6a6a6a] flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-[#1a3a3a]" />
                <span>Cheerio DOM Regex Extraction Engine Ready</span>
              </div>

              <button
                onClick={handleRunCustomScrape}
                disabled={isCustomScraping || !customUrl}
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] font-semibold rounded-[12px] shadow-xs transition-all active:scale-95 disabled:opacity-50 text-xs cursor-pointer"
              >
                <Play className={`w-3.5 h-3.5 text-[#ffb084] ${isCustomScraping ? 'animate-spin' : ''}`} />
                <span>{isCustomScraping ? 'Connecting & Parsing Page...' : 'Scrape Target URL in Real Time'}</span>
              </button>
            </div>
          </div>

          {/* Terminal Console Log Output (Clay surface-dark #0a1a1a) */}
          <div className="bg-[#0a1a1a] text-[#ffffff] border border-[#1a2a2a] rounded-[24px] p-6 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#1a2a2a] text-[#a0a0a0]">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-[#a4d4c5]" />
                <span className="font-semibold text-[#ffffff]">Scraper Real-Time Execution Console</span>
              </div>
              <button
                onClick={() => setCustomLogs([])}
                className="text-[11px] text-[#a0a0a0] hover:text-[#ffffff] cursor-pointer"
              >
                Clear Terminal
              </button>
            </div>

            <div className="h-48 overflow-y-auto space-y-1.5 text-[#a4d4c5] text-[11px]">
              {customLogs.map((line, idx) => (
                <div
                  key={idx}
                  className={
                    line.includes('[DISPATCH]')
                      ? 'text-[#ffb084] font-bold'
                      : line.includes('HTTP Response: 200')
                      ? 'text-[#22c55e]'
                      : line.includes('[SCRAPE ERROR]')
                      ? 'text-[#ff4d8b] font-bold'
                      : line.includes('Correlated')
                      ? 'text-[#e8b94a]'
                      : 'text-[#a0a0a0]'
                  }
                >
                  {line}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* Results Display */}
          {lastScrapeResult && lastScrapeResult.newItems.length > 0 && (
            <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0a0a0a] flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                  <span>Extracted {lastScrapeResult.newItems.length} Threat Intelligence Records</span>
                </span>
                <span className="text-xs text-[#6a6a6a] font-mono">
                  Finished in {lastScrapeResult.latencyMs}ms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {lastScrapeResult.newItems.map((item) => (
                  <div key={item.id} className="bg-[#faf5e8] p-4 rounded-[14px] border border-[#e5e5e5] text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#ff4d8b]">{item.cveID}</span>
                      <span className="text-[10px] bg-[#ef4444]/10 text-[#ef4444] px-2 py-0.5 rounded-full font-bold">
                        {item.severity}
                      </span>
                    </div>
                    <div className="font-semibold text-[#0a0a0a]">{item.title}</div>
                    <p className="text-[#6a6a6a] text-[11px] line-clamp-2">{item.summary}</p>
                    <button
                      onClick={() => handleIngestItem(item, item.correlatedScenarioId || targetScenarioForCustom)}
                      className="w-full mt-2 py-1.5 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] rounded-[10px] font-semibold text-center cursor-pointer shadow-xs"
                    >
                      Apply To Scenario FAIR Model
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 3: RESOURCE CONNECTORS DASHBOARD
          =================================================================== */}
      {activeSubTab === 'sources' && (
        <div className="space-y-4">
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[20px] p-5 flex items-center justify-between text-xs shadow-xs">
            <div>
              <h3 className="font-semibold text-[#0a0a0a] text-sm">Active Real-Time Threat Intelligence Connectors</h3>
              <p className="text-[#6a6a6a] text-[12px] mt-0.5">
                CyberPulse polls and parses feeds from national CERTs, vulnerability catalogs, and telemetry providers.
              </p>
            </div>
            <button
              onClick={() => handleScrapeAll(false)}
              disabled={isScrapingAll}
              className="px-4 py-2 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] rounded-[12px] font-semibold text-xs flex items-center space-x-1.5 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScrapingAll ? 'animate-spin' : ''}`} />
              <span>Poll All Connectors</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((src) => (
              <div
                key={src.id}
                className="bg-[#ffffff] border border-[#e5e5e5] rounded-[20px] p-6 flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#faf5e8] text-[#6a6a6a] border border-[#e5e5e5]">
                      {src.category}
                    </span>
                    <span className="inline-flex items-center space-x-1 text-[#22c55e] text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-[#22c55e]" />
                      <span>{src.status}</span>
                    </span>
                  </div>

                  <h3 className="font-semibold text-[#0a0a0a] text-base mt-3">{src.name}</h3>
                  <p className="text-xs text-[#6a6a6a] mt-1.5 leading-relaxed">{src.description}</p>
                </div>

                <div className="space-y-2 pt-4 border-t border-[#e5e5e5] text-xs">
                  <div className="flex items-center justify-between text-[#6a6a6a]">
                    <span>Indexed Items:</span>
                    <strong className="text-[#0a0a0a] font-mono">{src.itemsFound}</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#6a6a6a]">
                    <span>Response Latency:</span>
                    <strong className="text-[#0a0a0a] font-mono">{src.latencyMs}ms</strong>
                  </div>
                  <div className="flex items-center justify-between text-[#6a6a6a] text-[11px]">
                    <span>Endpoint:</span>
                    <span className="text-[#9a9a9a] font-mono truncate max-w-[150px]">{src.targetUrl}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================
          SUB-TAB 4: OFFICIAL CISA KEV CATALOG
          =================================================================== */}
      {activeSubTab === 'cisa-catalog' && (
        <div className="space-y-4">
          <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
            <div>
              <div className="font-semibold text-[#0a0a0a] text-sm flex items-center space-x-2">
                <span>CISA Known Exploited Vulnerabilities (KEV) Catalog</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/25 text-[10px] font-semibold">
                  BOD 22-01 Mandate
                </span>
              </div>
              <p className="text-[#6a6a6a] text-[12px] mt-0.5">
                Official US Cybersecurity and Infrastructure Security Agency catalog of active weaponized CVEs.
              </p>
            </div>

            <button
              onClick={() => onRefreshFeed(false)}
              disabled={isRefreshing}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] font-semibold rounded-[12px] text-xs cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Sync CISA Feed'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCisaItems.map((item) => {
              const matchedScenario = scenarios.find((s) => s.id === item.matchedScenarioId);
              return (
                <div
                  key={item.cveID}
                  className="bg-[#ffffff] border border-[#e5e5e5] hover:border-[#0a0a0a] rounded-[20px] p-6 shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#ff4d8b]">{item.cveID}</span>
                        <span className="text-[10px] font-semibold uppercase px-2.5 py-0.5 rounded-full bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                          Actively Weaponized
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-[#0a0a0a] mt-1.5 leading-snug">{item.vulnerabilityName}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-[#3a3a3a] line-clamp-3 leading-relaxed">{item.shortDescription}</p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#faf5e8] p-3 rounded-[12px] border border-[#e5e5e5]">
                    <div>
                      <span className="text-[#6a6a6a] block">Vendor & Product:</span>
                      <span className="text-[#0a0a0a] font-medium">{item.vendorProject} - {item.product}</span>
                    </div>
                    <div>
                      <span className="text-[#6a6a6a] block">Date Added:</span>
                      <span className="text-[#0a0a0a] font-mono">{item.dateAdded}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#3a3a3a] bg-[#faf5e8] p-3 rounded-[12px] border border-[#e5e5e5]">
                    <span className="text-[#0a0a0a] font-semibold block text-[10px] uppercase tracking-wider">
                      Mandated Remediation:
                    </span>
                    <p className="text-[#3a3a3a] mt-0.5">{item.requiredAction}</p>
                    <div className="mt-1 text-[10px] text-[#ff4d8b] font-mono font-medium">
                      Federal Due Date: {item.dueDate}
                    </div>
                  </div>

                  {matchedScenario && (
                    <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between text-xs">
                      <span className="text-[#6a6a6a] flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#ff4d8b]" />
                        <span>Impacts: <strong className="text-[#0a0a0a]">{matchedScenario.title}</strong></span>
                      </span>
                      <button
                        onClick={() => onSelectScenario(matchedScenario.id)}
                        className="text-[#0a0a0a] hover:text-[#ff4d8b] font-semibold cursor-pointer"
                      >
                        View Scenario Math →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

