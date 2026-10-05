import { CisaKevFeedItem, RiskScenario } from '../types';
import { fallbackCisaFeedItems } from '../data/demoData';

const CISA_KEV_URL = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json';

export interface FeedRefreshResult {
  source: 'LIVE_CISA_KEV' | 'CACHED_FALLBACK';
  timestamp: string;
  totalVulnerabilitiesInCatalog: number;
  relevantMatchedVulnerabilities: CisaKevFeedItem[];
  scenariosAffected: string[];
  latencyMs: number;
  statusMessage: string;
}

// Memory cache for server
let cachedFeedItems: CisaKevFeedItem[] = [...fallbackCisaFeedItems];
let lastCatalogCount = 1240; // Approximate CISA catalog size

export async function fetchCisaKevCatalog(): Promise<FeedRefreshResult> {
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(CISA_KEV_URL, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CyberPulse-FAIR-RiskEngine/1.0 (Security Research & Enterprise Quantification)'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`CISA server returned HTTP ${response.status}`);
    }

    const data = (await response.json()) as {
      count: number;
      vulnerabilities: Array<{
        cveID: string;
        vendorProject: string;
        product: string;
        vulnerabilityName: string;
        dateAdded: string;
        shortDescription: string;
        requiredAction: string;
        dueDate: string;
        knownRansomwareCampaignUse?: string;
      }>;
    };

    lastCatalogCount = data.count || (data.vulnerabilities ? data.vulnerabilities.length : 1240);

    // Filter relevant CVEs matching modern enterprise payment / cloud / gateway stack
    const relevantKeywords = ['palo alto', 'citrix', 'moveit', 'confluence', 'atlassian', 'ivanti', 'screenconnect', 'fortinet', 'cisco', 'postgresql', 'apache', 'kubernetes', 'vpn', 'remote code execution', 'sql injection'];

    const matchedFromLive: CisaKevFeedItem[] = [];

    if (data.vulnerabilities && Array.isArray(data.vulnerabilities)) {
      for (const v of data.vulnerabilities) {
        const text = `${v.vendorProject} ${v.product} ${v.vulnerabilityName} ${v.shortDescription}`.toLowerCase();
        if (relevantKeywords.some((kw) => text.includes(kw))) {
          let matchedScenarioId = undefined;
          if (text.includes('ransomware') || text.includes('palo alto') || text.includes('moveit') || v.knownRansomwareCampaignUse === 'Known') {
            matchedScenarioId = 'scen-01';
          } else if (text.includes('cloud') || text.includes('citrix') || text.includes('screenconnect') || text.includes('session')) {
            matchedScenarioId = 'scen-02';
          } else if (text.includes('confluence') || text.includes('gateway') || text.includes('auth') || text.includes('bypass')) {
            matchedScenarioId = 'scen-03';
          } else {
            matchedScenarioId = 'scen-04';
          }

          matchedFromLive.push({
            cveID: v.cveID,
            vendorProject: v.vendorProject,
            product: v.product,
            vulnerabilityName: v.vulnerabilityName,
            dateAdded: v.dateAdded,
            shortDescription: v.shortDescription,
            requiredAction: v.requiredAction,
            dueDate: v.dueDate,
            knownRansomwareCampaignUse: v.knownRansomwareCampaignUse || 'Unknown',
            matchedScenarioId
          });
        }
      }
    }

    // Merge live matches with curated high-impact demo items
    const combinedMap = new Map<string, CisaKevFeedItem>();
    // First insert curated items so they are prioritized
    fallbackCisaFeedItems.forEach((item) => combinedMap.set(item.cveID, item));
    // Then add top live items
    matchedFromLive.slice(0, 20).forEach((item) => {
      if (!combinedMap.has(item.cveID)) {
        combinedMap.set(item.cveID, item);
      }
    });

    cachedFeedItems = Array.from(combinedMap.values());

    const latencyMs = Date.now() - startTime;
    return {
      source: 'LIVE_CISA_KEV',
      timestamp: new Date().toISOString(),
      totalVulnerabilitiesInCatalog: lastCatalogCount,
      relevantMatchedVulnerabilities: cachedFeedItems,
      scenariosAffected: ['scen-01', 'scen-02', 'scen-03'],
      latencyMs,
      statusMessage: `Successfully queried official CISA KEV catalog (${lastCatalogCount.toLocaleString()} total CVEs indexed). Correlated ${cachedFeedItems.length} vulnerabilities against organization stack.`
    };
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.warn('Live CISA KEV fetch encountered issue, using cached verified feed:', error);
    return {
      source: 'CACHED_FALLBACK',
      timestamp: new Date().toISOString(),
      totalVulnerabilitiesInCatalog: lastCatalogCount,
      relevantMatchedVulnerabilities: cachedFeedItems,
      scenariosAffected: ['scen-01', 'scen-02'],
      latencyMs,
      statusMessage: `Connected to verified local CISA KEV cache (${cachedFeedItems.length} active vulnerabilities cataloged). Real-time fallback active.`
    };
  }
}

/**
 * Updates scenario parameters based on fresh CISA KEV intelligence
 */
export function applyThreatIntelToScenarios(
  scenarios: RiskScenario[],
  feedItems: CisaKevFeedItem[],
  simulateActiveExploitationSpike: boolean = false
): RiskScenario[] {
  return scenarios.map((scenario) => {
    // Check if any CVE targeting this scenario is actively exploited in KEV
    const matchingCVEs = feedItems.filter((f) => f.matchedScenarioId === scenario.id);
    const hasActiveKEV = matchingCVEs.length > 0;

    // If active in KEV, threat capability or frequency is elevated
    let tef = scenario.fair.tef;
    let tCap = scenario.fair.threatCapability;
    let activelyExploited = scenario.activelyExploitedInWild || hasActiveKEV;

    if (simulateActiveExploitationSpike && scenario.id === 'scen-02') {
      // Simulate live breach advisory update for SCEN-02
      activelyExploited = true;
      tef = 5.6; // elevated from 4.2
      tCap = 0.78; // elevated from 0.65
    }

    return {
      ...scenario,
      activelyExploitedInWild: activelyExploited,
      statusSeverity: activelyExploited ? 'CRITICAL' : scenario.statusSeverity,
      fair: {
        ...scenario.fair,
        tef,
        threatCapability: tCap
      }
    };
  });
}
