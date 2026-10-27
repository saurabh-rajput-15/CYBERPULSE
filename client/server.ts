import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  fintechOrg,
  healthcareOrg,
  initialCandidateControls,
  initialFintechScenarios,
  fallbackCisaFeedItems
} from './src/data/demoData';
import {
  computeScenarioFAIR,
  computeTotalExposure,
  formatINR,
  getFormulaDerivation
} from './src/services/fairEngine';
import { solveOptimalControls } from './src/services/optimizer';
import {
  fetchCisaKevCatalog,
  applyThreatIntelToScenarios,
  FeedRefreshResult
} from './src/services/cisaFeed';
import { generateExposureForecast } from './src/services/forecast';
import { RiskScenario, OrganizationProfile, ScrapedIntelItem } from './src/types';
import {
  getScraperSources,
  getScrapedItems,
  scrapeCustomUrl,
  scrapeAllSources,
  ingestScrapedItemIntoScenario,
  clearScrapedItems,
  removeScrapedItem,
  getScraperSchedule,
  setScraperSchedule,
  toggleScraperSource,
  scrapeSource,
  resetScrapedItemsToSeed,
  getScraperLogs
} from './src/services/multiSourceScraper';
import {
  initializeRealData,
  getRealDataSummary,
  getHistoricalIncidents,
  getHistoricalStats,
  getCisaKevCatalog,
  getNvdCves,
  calibrateScenarioWithRealData,
  getDerivedScenarios,
  getApiKeys,
  runMonteCarloSimulation,
  simulateContainmentVelocity,
  calculateBlastRadius,
  DATA_CLASSIFICATION_PROFILES
} from './src/services/realDataService';
import {
  searchCveRecords,
  getCveDetail,
  getCveStats,
  simulateCveRisk
} from './src/services/cveV5Service';

async function startServer() {
  // Pre-load and index real datasets (Financial Data Set, CISA KEV JSON, NVD CSV)
  initializeRealData();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory state
  let currentScenarios: Record<string, RiskScenario[]> = {
    fintech: getDerivedScenarios('fintech').map(computeScenarioFAIR),
    healthcare: getDerivedScenarios('healthcare').map(computeScenarioFAIR)
  };

  let lastRefreshTimestamp = new Date().toISOString();
  let liveFeedStatus: FeedRefreshResult = {
    source: 'CACHED_FALLBACK',
    timestamp: lastRefreshTimestamp,
    totalVulnerabilitiesInCatalog: 1240,
    relevantMatchedVulnerabilities: fallbackCisaFeedItems,
    scenariosAffected: ['scen-01'],
    latencyMs: 12,
    statusMessage: 'Initialized with verified enterprise security catalog.'
  };

  let customOrg: OrganizationProfile | null = null;

  // Helper to get active scenarios
  const getScenarios = (sector: string = 'fintech') => {
    return currentScenarios[sector] || currentScenarios.fintech;
  };

  const getOrg = (sector: string = 'fintech') => {
    if (customOrg) return customOrg;
    return sector === 'healthcare' ? healthcareOrg : fintechOrg;
  };

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Organization endpoints
  app.get('/api/organization', (req, res) => {
    const sector = (req.query.sector as string) || 'fintech';
    res.json({
      organization: getOrg(sector),
      isCustom: Boolean(customOrg)
    });
  });

  app.post('/api/organization', (req, res) => {
    const {
      name,
      industry,
      annualRevenueINR,
      assetsMonitored,
      criticalDatabases,
      cloudWorkloads,
      complianceFramework,
      scaleScenarios
    } = req.body;

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Organization name is required.' });
    }

    const updatedOrg: OrganizationProfile = {
      id: customOrg?.id || `org-${Date.now()}`,
      name: name.trim(),
      industry: industry || 'Fintech & Cloud Payments Infrastructure',
      annualRevenueINR: Number(annualRevenueINR) || 850000000,
      assetsMonitored: Number(assetsMonitored) || 420,
      criticalDatabases: Number(criticalDatabases) || 14,
      cloudWorkloads: Number(cloudWorkloads) || 180,
      complianceFramework: complianceFramework || 'RBI Cyber Security Framework & DPDP Act 2023',
      currency: 'INR (₹)'
    };

    customOrg = updatedOrg;

    // Optional: scale loss figures if company revenue is significantly different
    if (scaleScenarios && updatedOrg.annualRevenueINR) {
      const baseRev = 850000000; // Baseline ₹85 Cr
      const ratio = Math.max(0.3, Math.min(5.0, updatedOrg.annualRevenueINR / baseRev));
      
      const sector = (req.body.sector as string) || 'fintech';
      const baseScenarios = getDerivedScenarios(sector);
      currentScenarios[sector] = baseScenarios.map((s) => {
        const clone = JSON.parse(JSON.stringify(s)) as RiskScenario;
        // Scale business interruption and reputational loss by ratio
        clone.fair.primaryLoss.businessInterruptionINR = Math.round(clone.fair.primaryLoss.businessInterruptionINR * ratio);
        clone.fair.secondaryLoss.reputationalChurnINR = Math.round(clone.fair.secondaryLoss.reputationalChurnINR * ratio);
        
        if (clone.fair.annualRiskRange) {
          clone.fair.annualRiskRange.p10INR = Math.round(clone.fair.annualRiskRange.p10INR * ratio);
          clone.fair.annualRiskRange.p50INR = Math.round(clone.fair.annualRiskRange.p50INR * ratio);
          clone.fair.annualRiskRange.p90INR = Math.round(clone.fair.annualRiskRange.p90INR * ratio);
        }
        
        return computeScenarioFAIR(clone);
      });
    }

    res.json({
      success: true,
      organization: customOrg
    });
  });

  app.post('/api/organization/reset', (req, res) => {
    customOrg = null;
    // Reset scenarios to initial values
    currentScenarios = {
      fintech: getDerivedScenarios('fintech').map(computeScenarioFAIR),
      healthcare: getDerivedScenarios('healthcare').map(computeScenarioFAIR)
    };
    res.json({
      success: true,
      organization: fintechOrg
    });
  });

  // 1. GET /api/exposure - Overview financial risk & scenarios
  app.get('/api/exposure', (req, res) => {
    const sector = (req.query.sector as string) || 'fintech';
    const scenarios = getScenarios(sector);
    const org = getOrg(sector);
    const totalExposure = computeTotalExposure(scenarios);
    const activeExploited = scenarios.filter((s) => s.activelyExploitedInWild).length;

    res.json({
      organization: org,
      totalExposureINR: totalExposure,
      formattedTotalINR: formatINR(totalExposure),
      totalScenarios: scenarios.length,
      activeExploitedCount: activeExploited,
      scenarios,
      candidateControls: initialCandidateControls,
      lastFeedRefresh: lastRefreshTimestamp,
      isLiveFeedConnected: liveFeedStatus.source === 'LIVE_CISA_KEV'
    });
  });

  // 2. GET /api/scenario/:id - Detail view & explainable formula derivation
  app.get('/api/scenario/:id', (req, res) => {
    const sector = (req.query.sector as string) || 'fintech';
    const scenarios = getScenarios(sector);
    const scenario = scenarios.find((s) => s.id === req.params.id);

    if (!scenario) {
      return res.status(404).json({ error: `Scenario with ID ${req.params.id} not found.` });
    }

    const derivation = getFormulaDerivation(scenario);
    const controls = initialCandidateControls.filter((c) =>
      c.targetScenarioIds.includes(scenario.id)
    );

    res.json({
      scenario,
      derivation,
      mitigatingControls: controls
    });
  });

  // 3. POST /api/feed/refresh - Live CISA KEV fetch & scenario escalation
  app.post('/api/feed/refresh', async (req, res) => {
    const sector = (req.body.sector as string) || 'fintech';
    const simulateSpike = Boolean(req.body.simulateSpike);

    const feedResult = await fetchCisaKevCatalog();
    liveFeedStatus = feedResult;
    lastRefreshTimestamp = feedResult.timestamp;

    // Apply live threat intel to active scenarios
    currentScenarios[sector] = applyThreatIntelToScenarios(
      currentScenarios[sector],
      feedResult.relevantMatchedVulnerabilities,
      simulateSpike
    ).map(computeScenarioFAIR);

    const updatedScenarios = currentScenarios[sector];
    const totalExposure = computeTotalExposure(updatedScenarios);

    res.json({
      success: true,
      feedResult,
      status: feedResult,
      updatedTotalExposureINR: totalExposure,
      formattedTotalINR: formatINR(totalExposure),
      scenarios: updatedScenarios
    });
  });

  // 4. GET /api/feed - View threat feed items
  app.get('/api/feed', (req, res) => {
    res.json({
      status: liveFeedStatus,
      items: liveFeedStatus.relevantMatchedVulnerabilities
    });
  });

  // 5. POST /api/recommend - Constrained 0-1 Knapsack budget optimizer
  app.post('/api/recommend', (req, res) => {
    const budget = Number(req.body.budget) || 2500000; // Default ₹25 Lakhs
    const sector = (req.body.sector as string) || 'fintech';
    const scenarios = getScenarios(sector);

    const result = solveOptimalControls(budget, initialCandidateControls, scenarios);
    res.json(result);
  });

  // 6. GET /api/forecast - 6-month historical & 6-month future projected risk
  app.get('/api/forecast', (req, res) => {
    const sector = (req.query.sector as string) || 'fintech';
    const scenarios = getScenarios(sector);
    const mitigatedTarget = req.query.mitigated ? Number(req.query.mitigated) : undefined;

    const forecast = generateExposureForecast(scenarios, mitigatedTarget);
    res.json({ forecast });
  });

  // --- Integrated Threat Intelligence & Scraper Router ---
  // Mounts on both /scraper-api/* and /api/scraper/* to serve all screens seamlessly
  const scraperRouter = express.Router();

  // Health check
  scraperRouter.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      server: 'CyberPulse-Integrated-Scraper',
      time: new Date().toISOString(),
      itemsInStore: getScrapedItems().length
    });
  });

  // Sources listing
  scraperRouter.get('/sources', (_req, res) => {
    res.json({ sources: getScraperSources() });
  });

  // Toggle a source enabled/disabled
  scraperRouter.patch('/sources/:id', (req, res) => {
    const updated = toggleScraperSource(req.params.id, Boolean(req.body.enabled));
    if (!updated) return res.status(404).json({ error: 'Source not found' });
    res.json({ source: updated });
  });

  // Scraped Items listing with query filters
  scraperRouter.get('/items', (req, res) => {
    const { source, severity, scenario, search, limit, offset } = req.query as Record<string, string>;
    let items = getScrapedItems();

    if (source && source !== 'all') items = items.filter((i) => i.sourceId === source);
    if (severity && severity !== 'all') items = items.filter((i) => i.severity === severity);
    if (scenario && scenario !== 'all') items = items.filter((i) => i.correlatedScenarioId === scenario);
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.cveID?.toLowerCase().includes(q) ||
          i.title?.toLowerCase().includes(q) ||
          i.vendor?.toLowerCase().includes(q) ||
          i.summary?.toLowerCase().includes(q) ||
          i.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const total = items.length;
    const off = Number(offset) || 0;
    const lim = Math.min(Number(limit) || 200, 500);
    const page = items.slice(off, off + lim);

    res.json({
      total,
      count: page.length,
      items: page
    });
  });

  // Delete a specific scraped item
  scraperRouter.delete('/items/:id', (req, res) => {
    const deleted = removeScrapedItem(req.params.id);
    res.json({ success: deleted, deleted: deleted ? 1 : 0 });
  });

  // Reset or clear scraped items
  scraperRouter.delete('/items', (_req, res) => {
    const seeded = resetScrapedItemsToSeed();
    res.json({ success: true, seeded, items: getScrapedItems() });
  });

  // Scrape triggers: all sources (aliases: /scrape/all and /scrape-all)
  const handleScrapeAll = async (_req: express.Request, res: express.Response) => {
    try {
      const results = await scrapeAllSources();
      const currentItems = getScrapedItems();
      res.json({
        success: true,
        results,
        items: currentItems,
        totalItems: currentItems.length,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Scrape all failed'
      });
    }
  };
  scraperRouter.post('/scrape/all', handleScrapeAll);
  scraperRouter.post('/scrape-all', handleScrapeAll);

  // Scrape single source
  scraperRouter.post('/scrape/source/:id', async (req, res) => {
    try {
      const result = await scrapeSource(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Source scraping failed' });
    }
  });

  // Scrape custom URL (aliases: /scrape/custom and /scrape-custom)
  const handleScrapeCustom = async (req: express.Request, res: express.Response) => {
    try {
      const { url, targetScenarioId, correlateScenarioId } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Valid URL is required for scraping' });
      }
      const result = await scrapeCustomUrl(url, targetScenarioId || correlateScenarioId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Custom scraping failed'
      });
    }
  };
  scraperRouter.post('/scrape/custom', handleScrapeCustom);
  scraperRouter.post('/scrape-custom', handleScrapeCustom);

  // Scheduler endpoints
  scraperRouter.get('/schedule/status', (_req, res) => {
    res.json(getScraperSchedule());
  });

  scraperRouter.post('/schedule/set', (req, res) => {
    const cadence = req.body?.cadence || 'off';
    const schedule = setScraperSchedule(cadence);
    res.json(schedule);
  });

  // Scraper logs
  scraperRouter.get('/logs', (_req, res) => {
    res.json({ logs: getScraperLogs() });
  });

  // Ingest scraped item into scenario
  scraperRouter.post('/ingest', (req, res) => {
    try {
      const { item, scenarioId, sector = 'fintech' } = req.body;
      if (!item || !scenarioId) {
        return res.status(400).json({ error: 'Item and scenarioId are required' });
      }

      const activeSector = sector as 'fintech' | 'healthcare';
      currentScenarios[activeSector] = ingestScrapedItemIntoScenario(
        item as ScrapedIntelItem,
        scenarioId,
        currentScenarios[activeSector]
      );

      const totalExposure = computeTotalExposure(currentScenarios[activeSector]);

      res.json({
        success: true,
        message: `Ingested ${item.cveID} into scenario [${scenarioId}] and recalculated FAIR model.`,
        updatedTotalExposureINR: totalExposure,
        formattedTotalINR: formatINR(totalExposure),
        scenarios: currentScenarios[activeSector]
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Ingestion failed'
      });
    }
  });

  // Mount unified router to both paths
  app.use('/scraper-api', scraperRouter);
  app.use('/api/scraper', scraperRouter);

  // --- Real Data Ingestion & Empirical Benchmark Endpoints ---

  // 12. GET /api/real-data/summary - Aggregate metrics across all 3 real datasets
  app.get('/api/real-data/summary', (req, res) => {
    try {
      const summary = getRealDataSummary();
      res.json(summary);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get summary' });
    }
  });

  // 13. GET /api/real-data/incidents - 1,902 historical breach loss records
  app.get('/api/real-data/incidents', (req, res) => {
    try {
      const search = req.query.search as string;
      const vector = req.query.vector as string;
      const industry = req.query.industry as string;
      const minLoss = req.query.minLoss ? Number(req.query.minLoss) : undefined;
      const maxLoss = req.query.maxLoss ? Number(req.query.maxLoss) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const year = req.query.year as string;

      const result = getHistoricalIncidents({
        search,
        vector,
        industry,
        minLoss,
        maxLoss,
        limit,
        offset,
        year
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to query historical incidents' });
    }
  });

  // 14. GET /api/real-data/stats - Empirical distributions & top breaches
  app.get('/api/real-data/stats', (req, res) => {
    try {
      const stats = getHistoricalStats();
      res.json({ stats });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to query stats' });
    }
  });

  // 15. GET /api/real-data/cisa-kev - 1,709 real CISA KEV vulnerabilities
  app.get('/api/real-data/cisa-kev', (req, res) => {
    try {
      const search = req.query.search as string;
      const vendor = req.query.vendor as string;
      const ransomwareOnly = req.query.ransomwareOnly === 'true';
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;

      const result = getCisaKevCatalog({
        search,
        vendor,
        ransomwareOnly,
        limit,
        offset
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to query CISA catalog' });
    }
  });

  // 16. GET /api/real-data/nvd-cves - 2,000 real NIST NVD records
  app.get('/api/real-data/nvd-cves', (req, res) => {
    try {
      const search = req.query.search as string;
      const severity = req.query.severity as string;
      const minScore = req.query.minScore ? Number(req.query.minScore) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;

      const result = getNvdCves({
        search,
        severity,
        minScore,
        limit,
        offset
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to query NVD CVEs' });
    }
  });

  // 16.5 GET /api/real-data/monte-carlo - 10,000-trial Monte Carlo Loss Exceedance Curve & PML
  app.get('/api/real-data/monte-carlo', (req, res) => {
    try {
      const iterations = req.query.iterations ? Number(req.query.iterations) : 10000;
      const sector = (req.query.sector as string) || 'ALL';
      const revenueRatio = req.query.revenueRatio ? Number(req.query.revenueRatio) : 1.0;
      const riskAppetiteINR = req.query.riskAppetiteINR ? Number(req.query.riskAppetiteINR) : 500000000;

      const result = runMonteCarloSimulation({
        iterations,
        sector,
        revenueRatio,
        riskAppetiteINR
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to run Monte Carlo simulation' });
    }
  });

  // 16.6 GET /api/real-data/containment-velocity - Velocity & MTTR / Dwell Time impact quantification
  app.get('/api/real-data/containment-velocity', (req, res) => {
    try {
      const dwellDays = req.query.dwellDays ? Number(req.query.dwellDays) : undefined;
      const dwellHours = req.query.dwellHours ? Number(req.query.dwellHours) : undefined;
      const sector = (req.query.sector as string) || 'ALL';
      const revenueRatio = req.query.revenueRatio ? Number(req.query.revenueRatio) : 1.0;

      const result = simulateContainmentVelocity({
        dwellDays,
        dwellHours,
        sector,
        revenueRatio
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to simulate containment velocity' });
    }
  });

  // 16.7 GET /api/real-data/blast-radius - Data exposure blast radius & DPDP Act penalty calculator
  app.get('/api/real-data/blast-radius', (req, res) => {
    try {
      const recordsExposed = req.query.recordsExposed ? Number(req.query.recordsExposed) : undefined;
      const dataVolumeGB = req.query.dataVolumeGB ? Number(req.query.dataVolumeGB) : undefined;
      const tier = (req.query.tier as any) || 'FINANCIAL_PCI';
      const totalDatabaseRecords = req.query.totalDatabaseRecords ? Number(req.query.totalDatabaseRecords) : 5000000;

      const result = calculateBlastRadius({
        recordsExposed,
        dataVolumeGB,
        tier,
        totalDatabaseRecords
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to calculate blast radius' });
    }
  });

  // 16.8 GET /api/real-data/data-profiles - Return available data classification profiles
  app.get('/api/real-data/data-profiles', (req, res) => {
    res.json(DATA_CLASSIFICATION_PROFILES);
  });

  // 17. POST /api/real-data/calibrate-scenario - Calibrate FAIR loss using real incident data
  app.post('/api/real-data/calibrate-scenario', (req, res) => {
    try {
      const { scenarioId, sector = 'fintech', mode = 'vector-median', incidentIdOrVector } = req.body;
      const activeSector = sector as 'fintech' | 'healthcare';
      const scenarios = currentScenarios[activeSector];
      const targetScenario = scenarios.find((s) => s.id === scenarioId);

      if (!targetScenario) {
        return res.status(404).json({ error: `Scenario ${scenarioId} not found` });
      }

      const calibrated = calibrateScenarioWithRealData(targetScenario, mode, incidentIdOrVector);

      currentScenarios[activeSector] = scenarios.map((s) =>
        s.id === scenarioId ? calibrated : s
      );

      const totalExposure = computeTotalExposure(currentScenarios[activeSector]);

      res.json({
        success: true,
        calibratedScenario: calibrated,
        updatedTotalExposureINR: totalExposure,
        formattedTotalINR: formatINR(totalExposure),
        scenarios: currentScenarios[activeSector]
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to calibrate scenario' });
    }
  });

  // --- CVE v5 Massive Catalog Endpoints (383,000+ CVEs from cvelistV5) ---

  // 18. GET /api/cve-v5/stats - Statistics on cvelistV5 indexed catalog
  app.get('/api/cve-v5/stats', (req, res) => {
    try {
      const stats = getCveStats();
      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch CVE v5 stats' });
    }
  });

  // 19. GET /api/cve-v5/search - Fast FTS5 search & multi-attribute filter
  app.get('/api/cve-v5/search', (req, res) => {
    try {
      const query = req.query.query as string;
      const year = req.query.year as string;
      const severity = req.query.severity as string;
      const minScore = req.query.minScore ? Number(req.query.minScore) : undefined;
      const maxScore = req.query.maxScore ? Number(req.query.maxScore) : undefined;
      const vendor = req.query.vendor as string;
      const exploitation = req.query.exploitation as string;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;
      const sortBy = req.query.sortBy as string;
      const sortDir = req.query.sortDir as 'asc' | 'desc';

      const result = searchCveRecords({
        query,
        year,
        severity,
        minScore,
        maxScore,
        vendor,
        exploitation,
        limit,
        offset,
        sortBy,
        sortDir
      });

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to search CVE v5 catalog' });
    }
  });

  // 20. GET /api/cve-v5/detail/:cveId - Full parsed CVE v5 record with SSVC & affected software
  app.get('/api/cve-v5/detail/:cveId', (req, res) => {
    try {
      const { cveId } = req.params;
      const detail = getCveDetail(cveId);
      if (!detail) {
        return res.status(404).json({ error: `CVE ${cveId} not found in local catalog` });
      }
      res.json(detail);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to get CVE detail' });
    }
  });

  // 21. POST /api/cve-v5/simulate-risk - FAIR financial risk simulation for any CVE
  app.post('/api/cve-v5/simulate-risk', (req, res) => {
    try {
      const { cveId, sector = 'fintech' } = req.body;
      if (!cveId) {
        return res.status(400).json({ error: 'cveId is required' });
      }
      const simulation = simulateCveRisk(cveId, sector);
      res.json(simulation);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to simulate CVE risk' });
    }
  });

  app.get('/api/prd', (req, res) => {
    try {
      const prdPath = path.join(process.cwd(), 'docs', 'CYBERPULSE_PRD.md');
      if (fs.existsSync(prdPath)) {
        const content = fs.readFileSync(prdPath, 'utf-8');
        res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
        return res.send(content);
      }
      return res.status(404).json({ error: 'PRD document not found' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to read PRD' });
    }
  });

  app.use('/docs', express.static(path.join(process.cwd(), 'docs')));

  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ZK-PACE server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ZK-PACE server:', err);
});
