import React, { useState } from 'react';
import { RiskProvider, useRisk } from './context/RiskContext';
import { ThemeProvider } from './context/ThemeContext';
import {
  Header,
  Footer,
  Sidebar,
  OverviewScreen,
  ScenarioDetailScreen,
  ThreatFeedScreen,
  BudgetRecommendationScreen,
  BoardBriefModal,
  DataLineageModal,
  OrganizationConfigModal,
  RealDataScreen,
  PRDSpecScreen,
  ZKPacePaperScreen,
  ScraperScreen
} from './components';
import { RefreshCw, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AppContent: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    activeTab,
    setActiveTab,
    sector,
    exposureData,
    forecastData,
    feedItems,
    recommendation,
    currentBudget,
    setBudget,
    selectedScenarioId,
    setSelectedScenarioId,
    selectedScenario,
    isLoading,
    isRefreshingFeed,
    feedLatencyMs,
    catalogCount,
    toast,
    refreshFeed,
    ingestScrapedItem,
    navigateToScenario,
    isBoardBriefOpen,
    setIsBoardBriefOpen,
    isDataLineageOpen,
    setIsDataLineageOpen,
    isOrgConfigOpen,
    setIsOrgConfigOpen,
    isCustomOrg,
    saveOrganization,
    resetOrganization
  } = useRisk();

  return (
    <div className="min-h-screen bg-[#fffaf0] text-[#0a0a0a] selection:bg-[#ff4d8b]/20 selection:text-[#ff4d8b]">

      {/* Fixed sidebar — 256px wide on lg+, hidden on mobile (drawer instead) */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Everything to the right of the sidebar */}
      <div className="lg:pl-64 flex flex-col min-h-screen">

        {/* Sticky top header */}
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Page content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-screen-xl w-full mx-auto">

          {/* Initial loading state */}
          {isLoading && !exposureData ? (
            <div className="flex flex-col items-center justify-center h-96 space-y-4">
              <RefreshCw className="w-8 h-8 text-[#1a3a3a] animate-spin" />
              <div className="text-sm font-semibold text-[#0a0a0a]">
                Evaluating FAIR Loss Models & Live Threat Feeds...
              </div>
              <p className="text-xs text-[#6a6a6a] font-mono">
                Connecting to live CISA KEV catalog and initializing Knapsack optimization engine
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && exposureData && (
                <OverviewScreen
                  data={exposureData}
                  onSelectScenario={navigateToScenario}
                  onGoToOptimizer={() => setActiveTab('budget')}
                  onGoToFeed={() => setActiveTab('feed')}
                  forecastData={forecastData}
                  onOpenDataLineage={() => setIsDataLineageOpen(true)}
                  onOpenOrgConfig={() => setIsOrgConfigOpen(true)}
                />
              )}

              {activeTab === 'scenario' && selectedScenario && exposureData && (
                <ScenarioDetailScreen
                  scenario={selectedScenario}
                  allScenarios={exposureData.scenarios}
                  onSelectScenario={setSelectedScenarioId}
                  onBackToOverview={() => setActiveTab('overview')}
                  candidateControls={exposureData.candidateControls}
                  onGoToOptimizer={() => setActiveTab('budget')}
                  onOpenDataLineage={() => setIsDataLineageOpen(true)}
                />
              )}

              {activeTab === 'feed' && exposureData && (
                <ThreatFeedScreen
                  feedItems={feedItems}
                  isRefreshing={isRefreshingFeed}
                  onRefreshFeed={refreshFeed}
                  isLiveFeed={exposureData.isLiveFeedConnected}
                  lastSyncTime={exposureData.lastFeedRefresh}
                  catalogCount={catalogCount}
                  scenarios={exposureData.scenarios}
                  onSelectScenario={navigateToScenario}
                  latencyMs={feedLatencyMs}
                  onIngestScrapedItem={ingestScrapedItem}
                  sector={sector}
                />
              )}

              {activeTab === 'budget' && exposureData && (
                <BudgetRecommendationScreen
                  currentRecommendation={recommendation}
                  isLoading={isLoading}
                  onBudgetChange={setBudget}
                  scenarios={exposureData.scenarios}
                  onOpenBoardBrief={() => setIsBoardBriefOpen(true)}
                />
              )}

              {activeTab === 'real-data' && (
                <RealDataScreen />
              )}

              {activeTab === 'zk-pace' && (
                <ZKPacePaperScreen />
              )}

              {activeTab === 'prd' && (
                <PRDSpecScreen />
              )}

              {activeTab === 'scraper' && (
                <ScraperScreen />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <div
            className={`flex items-center space-x-2.5 px-5 py-3.5 rounded-[16px] border shadow-lg text-xs font-medium max-w-sm ${
              toast.type === 'alert'
                ? 'bg-[#ffffff] border-[#ffb084] text-[#0a0a0a]'
                : toast.type === 'info'
                ? 'bg-[#ffffff] border-[#1a3a3a] text-[#0a0a0a]'
                : 'bg-[#ffffff] border-[#e5e5e5] text-[#0a0a0a]'
            }`}
          >
            {toast.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-[#ff6b5a] shrink-0" />
            ) : toast.type === 'info' ? (
              <Info className="w-4 h-4 text-[#1a3a3a] shrink-0" />
            ) : (
              <CheckCircle className="w-4 h-4 text-[#1a3a3a] shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      {exposureData && (
        <>
          <BoardBriefModal
            isOpen={isBoardBriefOpen}
            onClose={() => setIsBoardBriefOpen(false)}
            data={exposureData}
            recommendation={recommendation}
          />

          <DataLineageModal
            isOpen={isDataLineageOpen}
            onClose={() => setIsDataLineageOpen(false)}
            scenarios={exposureData.scenarios}
          />

          <OrganizationConfigModal
            isOpen={isOrgConfigOpen}
            onClose={() => setIsOrgConfigOpen(false)}
            currentOrg={exposureData.organization}
            onSaveOrg={saveOrganization}
            onResetOrg={resetOrganization}
            isCustomOrg={isCustomOrg}
          />
        </>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <RiskProvider>
        <AppContent />
      </RiskProvider>
    </ThemeProvider>
  );
}
