export interface OrganizationProfile {
  id: string;
  name: string;
  industry: string;
  annualRevenueINR: number;
  assetsMonitored: number;
  criticalDatabases: number;
  cloudWorkloads: number;
  complianceFramework: string;
  currency: string;
}

export interface FAIRParameters {
  tef: number; // Threat Event Frequency (attempts per year)
  tefSource?: string; // Empirical source citation (e.g., CERT-In 2024)
  threatCapability: number; // TCap (0.0 to 1.0)
  threatCapabilitySource?: string;
  controlStrength: number; // CS (0.0 to 1.0)
  controlStrengthSource?: string;
  vulnerability: number; // P(TCap > CS) (0.0 to 1.0)
  lef: number; // Loss Event Frequency = TEF * Vulnerability
  primaryLoss: {
    incidentResponseINR: number;
    businessInterruptionINR: number;
    systemRecoveryINR: number;
    totalINR: number;
    breakdownDetails?: string;
  };
  secondaryLoss: {
    regulatoryFinesINR: number; // e.g. DPDP / RBI penalties
    reputationalChurnINR: number;
    legalAndNotificationINR: number;
    totalINR: number;
    breakdownDetails?: string;
  };
  lossMagnitudeINR: number; // Primary + Secondary
  annualRiskINR: number; // LEF * Loss Magnitude
  benchmarkSource?: string;
  annualRiskRange?: LossRange;
  lossBreakdownItems?: LossBreakdown[];
}

export interface LinkedCVE {
  cveId: string;
  vulnerabilityName: string;
  vendorProject: string;
  product: string;
  dateAdded: string;
  shortDescription: string;
  isActivelyExploited: boolean;
  cvssScore?: number;
}

export interface RiskScenario {
  id: string;
  title: string;
  category: 'Ransomware' | 'Cloud Misconfiguration' | 'Credential Stuffing' | 'Supply Chain';
  threatActor: string;
  targetedAsset: string;
  description: string;
  fair: FAIRParameters;
  linkedCVEs: LinkedCVE[];
  activelyExploitedInWild: boolean;
  mitigationControlIds: string[];
  statusSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  derivedFromCluster?: string;
  sourceIncidentIds?: string[];
  isRealData?: boolean;
}

export interface CandidateControl {
  id: string;
  code: string;
  name: string;
  category: 'Protection' | 'Detection' | 'Response' | 'Governance';
  annualCostINR: number;
  description: string;
  targetScenarioIds: string[];
  // Risk reduction percentage when deployed (e.g., 0.65 means 65% reduction in expected loss of targeted scenarios)
  effectivenessPercent: number;
  implementationTimeDays: number;
  keyBenefits: string[];
}

export interface RecommendationResult {
  budgetINR: number;
  allocatedBudgetINR: number;
  unspentBudgetINR: number;
  baselineExposureINR: number;
  postMitigationExposureINR: number;
  totalRiskReductionINR: number;
  netBenefitINR: number;
  roiMultiplier: number;
  selectedControls: (CandidateControl & {
    scenarioRiskReducedINR: number;
    justification: string;
  })[];
  deferredControls: (CandidateControl & {
    reasonDeferred: string;
  })[];
}

export interface CisaKevFeedItem {
  cveID: string;
  vendorProject: string;
  product: string;
  vulnerabilityName: string;
  dateAdded: string;
  shortDescription: string;
  requiredAction: string;
  dueDate: string;
  knownRansomwareCampaignUse?: string;
  matchedScenarioId?: string;
}

export interface ExposureResponse {
  organization: OrganizationProfile;
  totalExposureINR: number;
  formattedTotalINR: string;
  totalScenarios: number;
  activeExploitedCount: number;
  scenarios: RiskScenario[];
  candidateControls: CandidateControl[];
  lastFeedRefresh: string;
  isLiveFeedConnected: boolean;
  dataProvenance?: {
    historicalIncidentsLoaded: number;
    synthesizedEventsLoaded: number;
    cisaKevLoaded: number;
    scenariosFromRealData: boolean;
  };
  isRealDataAvailable?: boolean;
}

export type ScraperSourceId = 'cisa-kev' | 'cert-in' | 'nvd-nist' | 'github-ghsa' | 'threatfox-abuse' | 'custom-url';

export interface ScraperSourceConfig {
  id: ScraperSourceId;
  name: string;
  category: 'Vulnerability Catalog' | 'National CERT' | 'Open Source Advisory' | 'Threat Telemetry' | 'Custom Web Ingestor';
  targetUrl: string;
  status: 'ONLINE' | 'SCRAPING' | 'ERROR' | 'IDLE';
  lastScraped: string;
  latencyMs: number;
  itemsFound: number;
  enabled: boolean;
  description: string;
}

export interface ScrapedIntelItem {
  id: string;
  sourceId: ScraperSourceId;
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
}

export interface ScrapeJobResult {
  success: boolean;
  sourceId: string;
  sourceName: string;
  latencyMs: number;
  itemsCount: number;
  newItems: ScrapedIntelItem[];
  logs: string[];
  timestamp: string;
}

export interface HistoricalIncident {
  incidentId: string;
  incidentName: string;
  date: string;
  organization: string;
  attackVector: string;
  vulnerabilityExploited: string;
  threatActor: string;
  assetAffected: string;
  dataCompromised: string;
  detectionMethod: string;
  responseTime: string;
  mitigationMeasures: string;
  damageLossUSD: number;
  damageLossINR: number;
  recoveryCost: string;
  downtimeDuration: string;
  reputationImpact: string;
  regulatoryImplications: string;
  validatingSource: string;
  incidentClosureDate: string;
  lessonsLearned: string;
}

export interface AttackVectorStats {
  vector: string;
  count: number;
  totalLossUSD: number;
  avgLossUSD: number;
  medianLossUSD: number;
  avgLossINR: number;
  medianLossINR: number;
}

export interface HistoricalDatasetStats {
  totalIncidents: number;
  incidentsWithLoss: number;
  totalLossUSD: number;
  totalLossINR: number;
  meanLossUSD: number;
  medianLossUSD: number;
  p10LossUSD: number;
  p25LossUSD: number;
  p75LossUSD: number;
  p90LossUSD: number;
  maxLossUSD: number;
  attackVectorDistribution: AttackVectorStats[];
  topBreaches: HistoricalIncident[];
}

export interface NvdCveItem {
  id: string;
  sourceIdentifier: string;
  published: string;
  lastModified: string;
  vulnStatus: string;
  description: string;
  weakness: string;
  affectedProducts: string;
  cvssVersion: string;
  cvssVector: string;
  baseScore: number;
  baseSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  exploitabilityScore: number;
  impactScore: number;
  references: string;
}

export interface RealDataSummary {
  historicalIncidentsCount: number;
  cisaKevCount: number;
  nvdCveCount: number;
  cisaRansomwareCount: number;
  cisaRecentCount: number;
  totalHistoricalLossUSD: number;
  medianHistoricalLossUSD: number;
  nvdCriticalCount: number;
  nvdHighCount: number;
  activeApiKeys: {
    nvd: boolean;
    abuseCh: boolean;
  };
}

// P10/P50/P90 range for any financial figure
export interface LossRange {
  p10INR: number;
  p50INR: number;
  p90INR: number;
  incidentCount: number;
  lossRangeSource: 'empirical' | 'global-fallback';
}

// One item in the human-readable breakdown (6 per scenario)
export interface LossBreakdown {
  label: string;
  lossRange: LossRange;
  incidentCount: number;
  attackVectorContext: string;
  reasonText: string;
  regulatoryReference?: string;
  computationMethod: string;
}

// A cluster of historical incidents sharing an attack vector
export interface AttackVectorCluster {
  primaryVector: string;
  incidentCount: number;
  incidentIds: string[];
  losses: number[];        // damageLossUSD values (non-zero only)
  allLossesINR: number[];  // damageLossINR values (non-zero only)
  p10USD: number;
  p50USD: number;
  p90USD: number;
  p10INR: number;
  p50INR: number;
  p90INR: number;
  topAssets: string[];
  dateRange: { earliest: string; latest: string };
  reputationImpacts: string[];
  regulatoryKeywords: string[];
}

// One month in the pattern forecast
export interface ForecastBand {
  month: string;
  isHistorical: boolean;
  actualCount?: number;
  projectedCount: number;
  trendMethod: 'wma' | 'ols-regression';
  unmitigatedExposureINR: number;
  mitigatedExposureINR: number;
  confidenceLowerINR: number;
  confidenceUpperINR: number;
  threatEventsCount: number;
}

// Per-vector 12-month forecast
export interface PatternForecast {
  attackVector: string;
  bands: ForecastBand[];
  totalHistoricalCount: number;
  trendSlope: number;
}

// A parsed record from cybersecurity synthesized data.csv
export interface SynthesizedEvent {
  attackType: string;
  timestamp: Date | null;
  attackSeverity: number;
  outcome: string;
  industry: string;
  responseTimeMin: number;
}


