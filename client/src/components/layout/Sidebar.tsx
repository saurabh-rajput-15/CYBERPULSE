import React from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Globe,
  Sliders,
  Database,
  ShieldCheck,
  FileText,
  Building2,
  Sun,
  Moon,
  X,
  Activity,
  Layers,
  Sparkles,
  Lock,
  ChevronRight,
  Bug
} from 'lucide-react';
import { useRisk } from '../../hooks/useRisk';
import { useTheme } from '../../context/ThemeContext';
import { AppTab } from '../../context/RiskContext';

interface SidebarProps {
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: AppTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: 'live' | 'neutral' | 'accent' | 'new';
}

const NAV_GROUPS: { groupTitle: string; items: NavItem[] }[] = [
  {
    groupTitle: 'RISK & TELEMETRY',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'scenario', label: 'Scenarios', icon: AlertTriangle, badge: '4 Active' },
      { id: 'feed', label: 'Threat Feed', icon: Globe, badge: 'Live', badgeType: 'live' }
    ]
  },
  {
    groupTitle: 'QUANTITATIVE ALLOCATION',
    items: [
      { id: 'budget', label: 'Budget Optimizer', icon: Sliders },
      { id: 'real-data', label: 'Real Breach Data', icon: Database, badge: '1,902' }
    ]
  },
  {
    groupTitle: 'INTELLIGENCE COLLECTION',
    items: [
      { id: 'scraper', label: 'Data Scraper', icon: Bug, badge: 'New', badgeType: 'new' }
    ]
  },
  {
    groupTitle: 'GOVERNANCE & CRYPTO',
    items: [
      { id: 'zk-pace', label: 'ZK Protocol & Proofs', icon: ShieldCheck, badge: 'Groth16', badgeType: 'accent' },
      { id: 'prd', label: 'Academic PRD', icon: FileText, badge: '29 Secs' }
    ]
  }
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    activeTab,
    setActiveTab,
    sector,
    toggleSector,
    exposureData,
    isCustomOrg,
    setIsOrgConfigOpen,
    setIsDataLineageOpen,
    setIsBoardBriefOpen,
    catalogCount,
    feedLatencyMs
  } = useRisk();

  const { theme, toggleTheme } = useTheme();
  const org = exposureData?.organization;

  const handleNavClick = (tabId: AppTab) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#ffffff] dark:bg-[#0c121e] border-r border-[#e5e5e5] dark:border-[#1e293b] select-none">
      {/* Brand & Platform Header */}
      <div className="p-5 border-b border-[#e5e5e5] dark:border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a3a3a] dark:bg-[#ff4d8b]/15 flex items-center justify-center text-[#ffb084] dark:text-[#ff4d8b] shadow-xs shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-semibold tracking-[-0.03em] text-[#0a0a0a] dark:text-[#f8fafc] font-display">
                ZK-<span className="text-[#ff4d8b]">PACE</span>
              </span>
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-[#faf5e8] dark:bg-[#172033] text-[#6a6a6a] dark:text-[#94a3b8] border border-[#e5e5e5] dark:border-[#1e293b]">
                v1.2
              </span>
            </div>
            <p className="text-[11px] text-[#6a6a6a] dark:text-[#94a3b8] font-normal leading-tight mt-0.5">
              Zero-Knowledge Cyber Risk Engine
            </p>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#faf5e8] dark:hover:bg-[#172033]"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Target Organization Selector Card */}
      <div className="p-3.5 mx-3 mt-3 rounded-xl bg-[#faf5e8]/80 dark:bg-[#131d2e] border border-[#e5e5e5] dark:border-[#1e293b]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="w-4 h-4 text-[#ff4d8b] shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#0a0a0a] dark:text-[#f8fafc] truncate">
                {org?.name || 'ApexFin Ltd.'}
              </p>
              <p className="text-[10px] text-[#6a6a6a] dark:text-[#94a3b8] truncate">
                {org?.industry || 'FinTech Gateway'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOrgConfigOpen(true)}
            className="text-[11px] text-[#ff4d8b] hover:underline font-medium shrink-0 ml-2"
          >
            Edit
          </button>
        </div>

        {/* Sector Segmented Switcher */}
        <div className="grid grid-cols-2 gap-1 mt-2.5 p-0.5 rounded-lg bg-[#ffffff] dark:bg-[#0a0f19] border border-[#e5e5e5] dark:border-[#1e293b]">
          <button
            onClick={() => toggleSector('fintech')}
            className={`py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              sector === 'fintech'
                ? 'bg-[#1a3a3a] text-white shadow-xs'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a]'
            }`}
          >
            FinTech
          </button>
          <button
            onClick={() => toggleSector('healthcare')}
            className={`py-1 text-[11px] font-medium rounded-md transition-all cursor-pointer ${
              sector === 'healthcare'
                ? 'bg-[#1a3a3a] text-white shadow-xs'
                : 'text-[#6a6a6a] dark:text-[#94a3b8] hover:text-[#0a0a0a]'
            }`}
          >
            Healthcare
          </button>
        </div>
      </div>

      {/* Nav List grouped by category */}
      <div className="flex-1 px-3 py-4 space-y-5 overflow-y-auto no-scrollbar">
        {NAV_GROUPS.map((group) => (
          <div key={group.groupTitle} className="space-y-1">
            <div className="px-3 text-[10px] font-semibold tracking-wider text-[#8a8a8a] dark:text-[#64748b]">
              {group.groupTitle}
            </div>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition-all text-left cursor-pointer ${
                      isActive
                        ? 'bg-[#1a3a3a] text-white dark:bg-[#ff4d8b] dark:text-white shadow-xs'
                        : 'text-[#4a4a4a] dark:text-[#cbd5e1] hover:bg-[#faf5e8] dark:hover:bg-[#172033] hover:text-[#0a0a0a] dark:hover:text-[#ffffff]'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-white'
                            : 'text-[#7a7a7a] dark:text-[#94a3b8]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeType === 'live'
                            ? 'bg-[#e6f4ea] text-[#137333] dark:bg-[#137333]/30 dark:text-[#4ade80]'
                            : item.badgeType === 'accent'
                            ? 'bg-[#ff4d8b]/15 text-[#ff4d8b]'
                            : item.badgeType === 'new'
                            ? 'bg-[#ffb084]/30 text-[#c05a00] dark:bg-[#ffb084]/20 dark:text-[#ffb084]'
                            : 'bg-[#faf5e8] dark:bg-[#172033] text-[#6a6a6a] dark:text-[#94a3b8] border border-[#e5e5e5] dark:border-[#1e293b]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Bottom Controls */}
      <div className="p-3 border-t border-[#e5e5e5] dark:border-[#1e293b] space-y-2 bg-[#ffffff] dark:bg-[#0c121e]">
        {/* Quick Actions: Lineage & Theme */}
        <div className="flex items-center justify-between gap-1">
          <button
            onClick={() => setIsDataLineageOpen(true)}
            title="Inspect Data Lineage & Proof Chain"
            className="flex-1 flex items-center justify-center space-x-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-[#faf5e8] dark:bg-[#172033] hover:bg-[#f5f0e0] text-[#0a0a0a] dark:text-[#f8fafc] border border-[#e5e5e5] dark:border-[#1e293b] transition-all cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-[#1a3a3a] dark:text-[#ffb084]" />
            <span>Lineage</span>
          </button>

          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            className="flex items-center justify-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#faf5e8] dark:bg-[#172033] hover:bg-[#f5f0e0] text-[#0a0a0a] dark:text-[#f8fafc] border border-[#e5e5e5] dark:border-[#1e293b] transition-all cursor-pointer"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-3.5 h-3.5 text-[#1a3a3a]" />
                <span className="text-[11px]">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 text-[#ffb084]" />
                <span className="text-[11px]">Light</span>
              </>
            )}
          </button>
        </div>

        {/* Board Brief Export Action */}
        <button
          onClick={() => setIsBoardBriefOpen(true)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg bg-[#0a0a0a] text-white hover:bg-[#1f1f1f] dark:bg-[#f8fafc] dark:text-[#0a0a0a] shadow-xs transition-all cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5 text-[#ffb084] dark:text-[#ff4d8b]" />
          <span>Export Board Brief</span>
        </button>

        {/* System Telemetry Indicator */}
        <div className="pt-1 flex items-center justify-between text-[10px] text-[#7a7a7a] dark:text-[#64748b] px-1 font-mono">
          <span className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#137333] animate-pulse" />
            <span>CISA KEV Feed</span>
          </span>
          <span>{feedLatencyMs || 18}ms</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#ffffff] dark:bg-[#0c121e] shadow-xl z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
