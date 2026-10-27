import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  RefreshCw,
  Building2,
  FileText,
  Database,
  Sun,
  Moon,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Activity
} from 'lucide-react';

import { useRisk } from '../../hooks/useRisk';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onOpenMobileSidebar?: () => void;
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Executive Risk Overview',
    subtitle: 'Quantitative FAIR financial exposure & key risk indicators'
  },
  scenario: {
    title: 'Risk Scenarios & FAIR Decomposition',
    subtitle: 'Threat event frequencies, vulnerability, and loss magnitude analysis'
  },
  feed: {
    title: 'Threat Intelligence & Scraper Hub',
    subtitle: 'Consolidated CISA KEV feeds, real-time Cheerio scraper, and threat awareness metrics'
  },
  awareness: {
    title: 'Threat Awareness & Security Metrics',
    subtitle: 'CVSS severity distributions, weaponized exploit analytics, and executive brief'
  },
  budget: {
    title: 'Security Budget & Capital Optimizer',
    subtitle: '0-1 Knapsack branch-and-bound defense resource allocation'
  },
  'real-data': {
    title: 'Empirical Breach Datasets & Simulators',
    subtitle: '1,902 verified enterprise security breaches, loss benchmarks, and Monte Carlo models'
  },
  'zk-pace': {
    title: 'Zero-Knowledge Protocol & Proofs',
    subtitle: 'Privacy-preserving loss bounds verification via Groth16 zk-SNARKs'
  },
  prd: {
    title: 'Product Requirements Document (PRD)',
    subtitle: '29-section academic and technical engineering specification'
  },
  scraper: {
    title: 'Live Threat Intelligence Scraper',
    subtitle: 'Multi-source automated scraper console and on-demand web advisory ingestor'
  }
};

export const Header: React.FC<HeaderProps> = ({ onOpenMobileSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const {
    activeTab,
    sector,
    toggleSector,
    exposureData,
    isRefreshingFeed,
    refreshFeed,
    isCustomOrg,
    setIsBoardBriefOpen,
    setIsDataLineageOpen,
    setIsOrgConfigOpen,
    feedLatencyMs
  } = useRisk();

  const org = exposureData?.organization;
  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'Cyber Risk Quantification',
    subtitle: 'Enterprise security engineering platform'
  };



  return (
    <header className="bg-[#ffffff]/90 dark:bg-[#0c121e]/90 backdrop-blur-md border-b border-[#e5e5e5] dark:border-[#1e293b] sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile Menu Trigger + Clean Breadcrumbs */}
          <div className="flex items-center space-x-3 min-w-0">
            {onOpenMobileSidebar && (
              <button
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-2 rounded-xl text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:text-[#ffffff] hover:bg-[#faf5e8] dark:hover:bg-[#172033] border border-[#e5e5e5] dark:border-[#1e293b] transition-all shrink-0 cursor-pointer"
                aria-label="Open sidebar menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center space-x-2 text-xs text-[#6a6a6a] dark:text-[#94a3b8]">
                <span className="font-semibold text-[#0a0a0a] dark:text-[#f8fafc] tracking-tight">
                  ZK-PACE
                </span>
                <span className="text-[#a0a0a0] dark:text-[#64748b]">/</span>
                <span className="truncate font-medium text-[#4a4a4a] dark:text-[#cbd5e1]">
                  {currentTabInfo.title}
                </span>
              </div>
              <p className="text-[11px] text-[#7a7a7a] dark:text-[#94a3b8] hidden sm:block truncate mt-0.5">
                {currentTabInfo.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Sector Toggle, Sync Button, Theme Toggle & Board Brief */}
          <div className="flex items-center space-x-2.5 shrink-0">


            {/* Target Org Badge Trigger */}
            <button
              onClick={() => setIsOrgConfigOpen(true)}
              title={org ? `${org.name} (${org.industry})` : 'Target Organization'}
              className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#faf5e8] dark:bg-[#172033] hover:bg-[#f5f0e0] dark:bg-[#2a374a] text-[#0a0a0a] dark:text-[#f8fafc] text-xs font-medium border border-[#e5e5e5] dark:border-[#1e293b] transition-all cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#ff4d8b]" />
              <span className="max-w-[100px] truncate font-medium">
                {org?.name || 'ApexFin Ltd.'}
              </span>
              {isCustomOrg && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d8b]" />
              )}
            </button>

            {/* Live Threat Sync Action */}
            <button
              onClick={refreshFeed}
              disabled={isRefreshingFeed}
              title={`Pull live CISA KEV threat telemetry (${feedLatencyMs || 18}ms)`}
              className="p-2 rounded-lg text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-[#ffffff] hover:bg-[#faf5e8] dark:hover:bg-[#172033] border border-[#e5e5e5] dark:border-[#1e293b] transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 text-[#ff4d8b] ${isRefreshingFeed ? 'animate-spin' : ''}`}
              />
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              aria-label="Toggle color theme"
              className="p-2 rounded-lg text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a] dark:hover:text-[#ffffff] hover:bg-[#faf5e8] dark:hover:bg-[#172033] border border-[#e5e5e5] dark:border-[#1e293b] transition-all cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-[#1a3a3a]" />
              ) : (
                <Sun className="w-4 h-4 text-[#ffb084]" />
              )}
            </button>

            {/* Board Brief Export Action */}
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5 text-[#ffb084] dark:text-[#ff4d8b]" />}
              onClick={() => setIsBoardBriefOpen(true)}
            >
              <span className="hidden sm:inline">Board Brief</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
