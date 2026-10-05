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
  ingestScrapedItemIntoScenario
} from './src/services/multiSourceScraper';
import {
  initializeRealData,
  getRealDataSummary,
  getHistoricalIncidents,
  getHistoricalStats,
  getCisaKevCatalog,
  getNvdCves,
  calibrateScenarioWithRealData,
  getApiKeys
} from './src/services/realDataService';

async function startServer() {
  // Pre-load and index real datasets (Financial Data Set, CISA KEV JSON, NVD CSV)
  initializeRealData();

  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory state
  let currentScenarios: Record<string, RiskScenario[]> = {
    fintech: initialFintechScenarios.map(computeScenarioFAIR),
    healthcare: initialFintechScenarios.map((s) => {
      // Healthcare variant: higher regulatory risk from health data, slightly different baseline
      const clone = JSON.parse(JSON.stringify(s)) as RiskScenario;
      if (clone.id === 'scen-01') {
        clone.title = 'Ransomware Outage on Hospital PACS & EMR Core';
        clone.targetedAsset = 'Epic/Cerner Electronic Health Records & PACS Imagery';
        clone.fair.primaryLoss.businessInterruptionINR = 14000000; // 1.4 Cr
      }
      return computeScenarioFAIR(clone);
    })
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
      currentScenarios[sector] = currentScenarios[sector].map((s) => {
        const clone = JSON.parse(JSON.stringify(s)) as RiskScenario;
        // Scale business interruption and reputational loss by ratio
        clone.fair.primaryLoss.businessInterruptionINR = Math.round(clone.fair.primaryLoss.businessInterruptionINR * ratio);
        clone.fair.secondaryLoss.reputationalChurnINR = Math.round(clone.fair.secondaryLoss.reputationalChurnINR * ratio);
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
      fintech: initialFintechScenarios.map(computeScenarioFAIR),
      healthcare: initialFintechScenarios.map((s) => {
        const clone = JSON.parse(JSON.stringify(s)) as RiskScenario;
        if (clone.id === 'scen-01') {
          clone.title = 'Ransomware Outage on Hospital PACS & EMR Core';
          clone.targetedAsset = 'Epic/Cerner Electronic Health Records & PACS Imagery';
          clone.fair.primaryLoss.businessInterruptionINR = 14000000;
        }
        return computeScenarioFAIR(clone);
      })
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

  // 7. GET /api/scraper/sources - List of all configured intelligence resources
  app.get('/api/scraper/sources', (req, res) => {
    res.json({
      sources: getScraperSources()
    });
  });

  // 8. GET /api/scraper/items - Retrieve all real-time scraped intelligence
  app.get('/api/scraper/items', (req, res) => {
    res.json({
      items: getScrapedItems()
    });
  });

  // 9. POST /api/scraper/scrape-custom - Scrape custom URL in real time
  app.post('/api/scraper/scrape-custom', async (req, res) => {
    try {
      const { url, targetScenarioId } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Valid URL is required for scraping' });
      }

      const result = await scrapeCustomUrl(url, targetScenarioId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Scraping failed'
      });
    }
  });

  // 10. POST /api/scraper/scrape-all - Trigger live scraping on all resources
  app.post('/api/scraper/scrape-all', async (req, res) => {
    try {
      const results = await scrapeAllSources();
      res.json({
        success: true,
        results,
        items: getScrapedItems(),
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Multi-source scraping failed'
      });
    }
  });

  // 11. POST /api/scraper/ingest - Ingest scraped vulnerability into active risk scenario
  app.post('/api/scraper/ingest', (req, res) => {
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
      const minLoss = req.query.minLoss ? Number(req.query.minLoss) : undefined;
      const maxLoss = req.query.maxLoss ? Number(req.query.maxLoss) : undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const offset = req.query.offset ? Number(req.query.offset) : 0;

      const result = getHistoricalIncidents({
        search,
        vector,
        minLoss,
        maxLoss,
        limit,
        offset
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
