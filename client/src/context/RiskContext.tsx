import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  ExposureResponse,
  RecommendationResult,
  CisaKevFeedItem,
  OrganizationProfile,
  ScrapedIntelItem,
  RiskScenario
} from '../types';

export type AppTab = 'overview' | 'scenario' | 'feed' | 'budget' | 'real-data' | 'zk-pace' | 'prd' | 'scraper';
export type Sector = 'fintech' | 'healthcare';

interface Toast {
  text: string;
  type: 'success' | 'alert' | 'info';
}

interface RiskContextType {
  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  selectedScenarioId: string;
  setSelectedScenarioId: (id: string) => void;
  selectedScenario: RiskScenario | null;
  
  // Sector & Organization
  sector: Sector;
  toggleSector: (newSector: Sector) => void;
  isCustomOrg: boolean;
  saveOrganization: (updatedOrg: Partial<OrganizationProfile> & { scaleScenarios?: boolean }) => Promise<void>;
  resetOrganization: () => Promise<void>;

  // Data & Results
  exposureData: ExposureResponse | null;
  forecastData: any[];
  feedItems: CisaKevFeedItem[];
  recommendation: RecommendationResult | null;
  currentBudget: number;
  setBudget: (amount: number) => void;

  // Status & Telemetry
  isLoading: boolean;
  isRefreshingFeed: boolean;
  feedLatencyMs: number;
  catalogCount: number;
  toast: Toast | null;
  showToast: (text: string, type?: 'success' | 'alert' | 'info') => void;

  // Real-time Actions
  refreshFeed: () => Promise<void>;
  ingestScrapedItem: (item: ScrapedIntelItem, scenarioId: string) => Promise<void>;
  navigateToScenario: (scenarioId: string) => void;
  calibrateScenario: (
    scenarioId: string,
    mode: 'vector-median' | 'vector-p90' | 'incident',
    incidentIdOrVector?: string
  ) => Promise<void>;

  // Modals
  isBoardBriefOpen: boolean;
  setIsBoardBriefOpen: (open: boolean) => void;
  isDataLineageOpen: boolean;
  setIsDataLineageOpen: (open: boolean) => void;
  isOrgConfigOpen: boolean;
  setIsOrgConfigOpen: (open: boolean) => void;
}

const RiskContext = createContext<RiskContextType | undefined>(undefined);

export const RiskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [sector, setSector] = useState<Sector>('fintech');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scen-01');

  const [exposureData, setExposureData] = useState<ExposureResponse | null>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [feedItems, setFeedItems] = useState<CisaKevFeedItem[]>([]);
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshingFeed, setIsRefreshingFeed] = useState<boolean>(false);
  const [currentBudget, setCurrentBudget] = useState<number>(2500000); // ₹25 Lakhs
  const [feedLatencyMs, setFeedLatencyMs] = useState<number>(142);
  const [catalogCount, setCatalogCount] = useState<number>(1703);

  const [toast, setToast] = useState<Toast | null>(null);
  const [isBoardBriefOpen, setIsBoardBriefOpen] = useState<boolean>(false);
  const [isDataLineageOpen, setIsDataLineageOpen] = useState<boolean>(false);
  const [isOrgConfigOpen, setIsOrgConfigOpen] = useState<boolean>(false);

  const [isCustomOrg, setIsCustomOrg] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('cyberpulse_custom_org'));
  });

  const showToast = (text: string, type: 'success' | 'alert' | 'info' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Fetch exposure
  const fetchExposure = useCallback(async (currentSec: Sector = sector) => {
    try {
      const res = await fetch(`/api/exposure?sector=${currentSec}`);
      if (!res.ok) throw new Error(`Exposure fetch failed: ${res.status}`);
      const data: ExposureResponse = await res.json();
      setExposureData(data);
      return data;
    } catch (err) {
      console.error('Error fetching exposure:', err);
      return null;
    }
  }, [sector]);

  // 2. Fetch forecast
  const fetchForecast = useCallback(async (currentSec: Sector = sector) => {
    try {
      const res = await fetch(`/api/forecast?sector=${currentSec}`);
      if (!res.ok) throw new Error(`Forecast fetch failed: ${res.status}`);
      const json = await res.json();
      setForecastData(json.forecast || []);
    } catch (err) {
      console.error('Error fetching forecast:', err);
    }
  }, [sector]);

  // 3. Fetch threat feed
  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/feed');
      if (!res.ok) throw new Error(`Feed fetch failed: ${res.status}`);
      const json = await res.json();
      setFeedItems(json.items || []);
      if (json.status?.totalVulnerabilitiesInCatalog) {
        setCatalogCount(json.status.totalVulnerabilitiesInCatalog);
      }
      if (json.status?.latencyMs) {
        setFeedLatencyMs(json.status.latencyMs);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    }
  }, []);

  // 4. Fetch budget recommendation
  const fetchRecommendation = useCallback(async (budget: number, currentSec: Sector = sector) => {
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budget, sector: currentSec })
      });
      if (!res.ok) throw new Error(`Recommendation fetch failed: ${res.status}`);
      const data: RecommendationResult = await res.json();
      setRecommendation(data);
    } catch (err) {
      console.error('Error fetching recommendation:', err);
    }
  }, [sector]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchExposure(sector),
        fetchForecast(sector),
        fetchFeed(),
        fetchRecommendation(currentBudget, sector)
      ]);
      setIsLoading(false);
    };
    init();
  }, []);

  // Sector switcher
  const toggleSector = async (newSector: Sector) => {
    if (newSector === sector) return;
    setSector(newSector);
    setIsLoading(true);
    await Promise.all([
      fetchExposure(newSector),
      fetchForecast(newSector),
      fetchRecommendation(currentBudget, newSector)
    ]);
    setIsLoading(false);
    showToast(
      `Switched context to ${newSector === 'fintech' ? 'FinTech & Payments Gateway' : 'Healthcare & Hospitals Network'}`,
      'info'
    );
  };

  // Refresh live feed
  const refreshFeed = async () => {
    setIsRefreshingFeed(true);
    try {
      const res = await fetch('/api/feed/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sector })
      });
      if (!res.ok) throw new Error('Refresh failed');
      const json = await res.json();
      await Promise.all([
        fetchExposure(sector),
        fetchForecast(sector),
        fetchRecommendation(currentBudget, sector),
        fetchFeed()
      ]);
      showToast(
        `Live CISA KEV catalog sync complete (${json.status.totalVulnerabilitiesInCatalog} CVEs checked in ${json.status.latencyMs}ms)`,
        'success'
      );
    } catch (err) {
      console.error('Failed to refresh feed:', err);
      showToast('Threat feed sync encountered network latency. Reverted to cached snapshot.', 'alert');
    } finally {
      setIsRefreshingFeed(false);
    }
  };

  // Budget change
  const setBudget = (amount: number) => {
    setCurrentBudget(amount);
    fetchRecommendation(amount, sector);
  };

  // Organization save
  const saveOrganization = async (updatedOrg: Partial<OrganizationProfile> & { scaleScenarios?: boolean }) => {
    try {
      const res = await fetch('/api/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedOrg, sector })
      });
      if (!res.ok) throw new Error('Failed to update organization profile');
      localStorage.setItem('cyberpulse_custom_org', 'true');
      setIsCustomOrg(true);
      await Promise.all([
        fetchExposure(sector),
        fetchForecast(sector),
        fetchRecommendation(currentBudget, sector)
      ]);
      showToast(
        `Target organization calibrated to "${updatedOrg.name}". FAIR models scaled.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to update organization:', err);
      showToast('Could not save organization profile', 'alert');
      throw err;
    }
  };

  // Organization reset
  const resetOrganization = async () => {
    try {
      const res = await fetch('/api/organization/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset failed');
      localStorage.removeItem('cyberpulse_custom_org');
      setIsCustomOrg(false);
      await Promise.all([
        fetchExposure(sector),
        fetchForecast(sector),
        fetchRecommendation(currentBudget, sector)
      ]);
      showToast('Reset organization profile to standard baseline.', 'info');
    } catch (err) {
      console.error('Failed to reset organization:', err);
      showToast('Could not reset organization profile', 'alert');
      throw err;
    }
  };

  // Ingest scraped intelligence
  const ingestScrapedItem = async (item: ScrapedIntelItem, scenarioId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/scraper/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item, scenarioId, sector })
      });
      if (!res.ok) throw new Error('Ingestion failed');
      const json = await res.json();
      await Promise.all([
        fetchExposure(sector),
        fetchForecast(sector),
        fetchRecommendation(currentBudget, sector)
      ]);
      setIsLoading(false);
      showToast(
        `Scraped intelligence ${item.cveID} correlated to [${scenarioId}]. FAIR loss recalculated to ${json.formattedTotalINR}.`,
        'alert'
      );
    } catch (err) {
      console.error('Failed to ingest scraped item:', err);
      setIsLoading(false);
      showToast('Could not ingest scraped intelligence record', 'alert');
    }
  };

  // Empirical calibration using real incident datasets
  const calibrateScenario = async (
    scenarioId: string,
    mode: 'vector-median' | 'vector-p90' | 'incident',
    incidentIdOrVector?: string
  ) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/real-data/calibrate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioId, sector, mode, incidentIdOrVector })
      });
      if (!res.ok) throw new Error('Calibration failed');
      const json = await res.json();
      await Promise.all([
        fetchExposure(sector),
        fetchForecast(sector),
        fetchRecommendation(currentBudget, sector)
      ]);
      setIsLoading(false);
      showToast(
        `Calibrated [${scenarioId}] to empirical real breach data. Exposure updated to ${json.formattedTotalINR}.`,
        'success'
      );
    } catch (err) {
      console.error('Failed to calibrate scenario:', err);
      setIsLoading(false);
      showToast('Could not calibrate scenario with real data', 'alert');
    }
  };

  const navigateToScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    setActiveTab('scenario');
  };

  const selectedScenario =
    exposureData?.scenarios.find((s) => s.id === selectedScenarioId) ||
    exposureData?.scenarios[0] ||
    null;

  return (
    <RiskContext.Provider
      value={{
        activeTab,
        setActiveTab,
        selectedScenarioId,
        setSelectedScenarioId,
        selectedScenario,
        sector,
        toggleSector,
        isCustomOrg,
        saveOrganization,
        resetOrganization,
        exposureData,
        forecastData,
        feedItems,
        recommendation,
        currentBudget,
        setBudget,
        isLoading,
        isRefreshingFeed,
        feedLatencyMs,
        catalogCount,
        toast,
        showToast,
        refreshFeed,
        ingestScrapedItem,
        navigateToScenario,
        calibrateScenario,
        isBoardBriefOpen,
        setIsBoardBriefOpen,
        isDataLineageOpen,
        setIsDataLineageOpen,
        isOrgConfigOpen,
        setIsOrgConfigOpen
      }}
    >
      {children}
    </RiskContext.Provider>
  );
};

export const useRisk = () => {
  const context = useContext(RiskContext);
  if (!context) {
    throw new Error('useRisk must be used within a RiskProvider');
  }
  return context;
};
