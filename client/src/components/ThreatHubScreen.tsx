import React, { useState, useEffect } from 'react';
import {
  Globe,
  ActivitySquare,
  Bug,
  Radio,
  Server,
  Sparkles,
  Layers
} from 'lucide-react';
import { ThreatFeedScreen } from './ThreatFeedScreen';
import { AwarenessDashboard } from './AwarenessDashboard';
import { ScraperScreen } from './ScraperScreen';
import {
  CisaKevFeedItem,
  RiskScenario,
  ScrapedIntelItem
} from '../types';

export interface ThreatHubScreenProps {
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
  initialSubTab?: 'feed' | 'awareness' | 'scraper';
}

export const ThreatHubScreen: React.FC<ThreatHubScreenProps> = (props) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'awareness' | 'scraper'>(
    props.initialSubTab || 'feed'
  );

  useEffect(() => {
    if (props.initialSubTab) {
      setActiveTab(props.initialSubTab);
    }
  }, [props.initialSubTab]);

  return (
    <div id="threat-hub-screen" className="space-y-6">
      {/* Unified Hub Navigation Header */}
      <div className="bg-[#ffffff] dark:bg-[#0c121e] border border-[#e5e5e5] dark:border-[#1e293b] rounded-[24px] p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span>INTEGRATED ENGINE (PORT 3000)</span>
              </span>
              <span className="text-[11px] font-mono text-[#6a6a6a] dark:text-[#94a3b8]">
                6 Unified Intelligence Feeds
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0a0a0a] dark:text-[#ffffff] mt-1 tracking-tight">
              Threat Intelligence & Scraper Hub
            </h1>
            <p className="text-xs sm:text-sm text-[#6a6a6a] dark:text-[#94a3b8] mt-0.5">
              Consolidated CISA KEV feeds, real-time Cheerio web scrapers, and executive threat awareness metrics.
            </p>
          </div>

          {/* Sub-navigation Pills */}
          <div className="flex items-center space-x-1.5 bg-[#faf5e8] dark:bg-[#1e293b] p-1.5 rounded-[16px] border border-[#e5e5e5] dark:border-[#1e293b] self-start lg:self-auto overflow-x-auto max-w-full">
            <button
              id="hub-tab-feed"
              onClick={() => setActiveTab('feed')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-[12px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'feed'
                  ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                  : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-[#1a3a3a] dark:text-[#38bdf8]" />
              <span>Threat Feed & Ingest</span>
            </button>

            <button
              id="hub-tab-awareness"
              onClick={() => setActiveTab('awareness')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-[12px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'awareness'
                  ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                  : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
              }`}
            >
              <ActivitySquare className="w-3.5 h-3.5 text-[#ff4d8b]" />
              <span>Threat Awareness</span>
            </button>

            <button
              id="hub-tab-scraper"
              onClick={() => setActiveTab('scraper')}
              className={`inline-flex items-center space-x-2 px-3.5 py-2 rounded-[12px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'scraper'
                  ? 'bg-[#ffffff] dark:bg-[#0c121e] text-[#0a0a0a] dark:text-[#ffffff] shadow-xs border border-[#e5e5e5] dark:border-[#1e293b]'
                  : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff]'
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Live Data Scraper</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Active Sub-View */}
      {activeTab === 'feed' && (
        <ThreatFeedScreen
          feedItems={props.feedItems}
          isRefreshing={props.isRefreshing}
          onRefreshFeed={props.onRefreshFeed}
          isLiveFeed={props.isLiveFeed}
          lastSyncTime={props.lastSyncTime}
          catalogCount={props.catalogCount}
          scenarios={props.scenarios}
          onSelectScenario={props.onSelectScenario}
          latencyMs={props.latencyMs}
          onIngestScrapedItem={props.onIngestScrapedItem}
          sector={props.sector}
        />
      )}

      {activeTab === 'awareness' && (
        <AwarenessDashboard />
      )}

      {activeTab === 'scraper' && (
        <ScraperScreen />
      )}
    </div>
  );
};
