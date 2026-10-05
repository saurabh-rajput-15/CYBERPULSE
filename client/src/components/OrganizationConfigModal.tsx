import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  Check,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Database,
  Cloud,
  DollarSign,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { OrganizationProfile } from '../types';
import { formatINR } from '../services/fairEngine';

interface OrganizationConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOrg: OrganizationProfile;
  onSaveOrg: (updatedOrg: Partial<OrganizationProfile> & { scaleScenarios?: boolean }) => Promise<void>;
  onResetOrg: () => Promise<void>;
  isCustomOrg?: boolean;
}

interface OrgPreset {
  id: string;
  name: string;
  label: string;
  industry: string;
  annualRevenueINR: number;
  assetsMonitored: number;
  criticalDatabases: number;
  cloudWorkloads: number;
  complianceFramework: string;
}

const PRESETS: OrgPreset[] = [
  {
    id: 'fintech-gateway',
    name: 'ApexFin Payments Ltd.',
    label: 'FinTech & Payments Gateway',
    industry: 'FinTech & Digital Payments',
    annualRevenueINR: 850000000, // ₹85 Cr
    assetsMonitored: 420,
    criticalDatabases: 14,
    cloudWorkloads: 180,
    complianceFramework: 'RBI Cyber Security Framework & DPDP Act 2023'
  },
  {
    id: 'bank-enterprise',
    name: 'Bharat Union Commercial Bank',
    label: 'Tier-1 Scheduled Bank',
    industry: 'Banking & Core Financial Services',
    annualRevenueINR: 24000000000, // ₹2,400 Cr
    assetsMonitored: 3200,
    criticalDatabases: 65,
    cloudWorkloads: 750,
    complianceFramework: 'RBI Master Direction, PCI-DSS v4.0 & DPDP Act 2023'
  },
  {
    id: 'hospital-network',
    name: 'ApexCare Super-Specialty Hospitals',
    label: 'Hospital Healthcare Network',
    industry: 'Healthcare & Hospital Networks',
    annualRevenueINR: 3200000000, // ₹320 Cr
    assetsMonitored: 1200,
    criticalDatabases: 22,
    cloudWorkloads: 280,
    complianceFramework: 'DISHA Health Data Privacy & ISO 27799'
  },
  {
    id: 'saas-unicorn',
    name: 'CloudScale Technologies Inc.',
    label: 'B2B Enterprise Cloud SaaS',
    industry: 'Enterprise Software & Cloud Infrastructure',
    annualRevenueINR: 1500000000, // ₹150 Cr
    assetsMonitored: 650,
    criticalDatabases: 18,
    cloudWorkloads: 420,
    complianceFramework: 'SOC 2 Type II, ISO/IEC 27001:2022 & GDPR'
  }
];

export const OrganizationConfigModal: React.FC<OrganizationConfigModalProps> = ({
  isOpen,
  onClose,
  currentOrg,
  onSaveOrg,
  onResetOrg,
  isCustomOrg = false
}) => {
  const [name, setName] = useState(currentOrg.name);
  const [industry, setIndustry] = useState(currentOrg.industry);
  const [revenueCr, setRevenueCr] = useState<number>(Math.round(currentOrg.annualRevenueINR / 10000000));
  const [assetsMonitored, setAssetsMonitored] = useState(currentOrg.assetsMonitored);
  const [criticalDatabases, setCriticalDatabases] = useState(currentOrg.criticalDatabases);
  const [cloudWorkloads, setCloudWorkloads] = useState(currentOrg.cloudWorkloads);
  const [complianceFramework, setComplianceFramework] = useState(currentOrg.complianceFramework);
  const [scaleScenarios, setScaleScenarios] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    setName(currentOrg.name);
    setIndustry(currentOrg.industry);
    setRevenueCr(Math.round(currentOrg.annualRevenueINR / 10000000));
    setAssetsMonitored(currentOrg.assetsMonitored);
    setCriticalDatabases(currentOrg.criticalDatabases);
    setCloudWorkloads(currentOrg.cloudWorkloads);
    setComplianceFramework(currentOrg.complianceFramework);
  }, [currentOrg]);

  if (!isOpen) return null;

  const handleApplyPreset = (preset: OrgPreset) => {
    setActivePreset(preset.id);
    setName(preset.name);
    setIndustry(preset.industry);
    setRevenueCr(Math.round(preset.annualRevenueINR / 10000000));
    setAssetsMonitored(preset.assetsMonitored);
    setCriticalDatabases(preset.criticalDatabases);
    setCloudWorkloads(preset.cloudWorkloads);
    setComplianceFramework(preset.complianceFramework);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveOrg({
        name: name.trim(),
        industry,
        annualRevenueINR: revenueCr * 10000000,
        assetsMonitored: Number(assetsMonitored) || 100,
        criticalDatabases: Number(criticalDatabases) || 5,
        cloudWorkloads: Number(cloudWorkloads) || 50,
        complianceFramework,
        scaleScenarios
      });
      onClose();
    } catch (err) {
      console.error('Failed to update organization profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    setIsSubmitting(true);
    try {
      await onResetOrg();
      onClose();
    } catch (err) {
      console.error('Failed to reset organization:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0a0a]/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-[#ffffff] border border-[#e5e5e5] rounded-[24px] max-w-2xl w-full shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#e5e5e5] flex items-center justify-between bg-[#faf5e8]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#0a0a0a] flex items-center justify-center text-[#ffb084]">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-semibold text-[#0a0a0a] font-display">Configure Target Organization</h2>
                {isCustomOrg && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#ff4d8b]/15 text-[#ff4d8b] font-semibold">
                    Custom Profile Active
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6a6a6a]">
                Calibrate FAIR risk formulas, asset exposure, and Board Briefs to your company.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#6a6a6a] hover:text-[#0a0a0a] hover:bg-[#e5e5e5] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <label className="text-xs font-semibold text-[#0a0a0a] block mb-2 flex items-center justify-between">
              <span>Industry Presets</span>
              <span className="text-[11px] text-[#6a6a6a] font-normal">Or customize your profile below</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = activePreset === preset.id || name === preset.name;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3 text-left rounded-[14px] border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0a0a0a] text-[#ffffff] border-[#0a0a0a] font-semibold shadow-xs'
                        : 'bg-[#faf5e8] border-[#e5e5e5] text-[#3a3a3a] hover:bg-[#f5f0e0]'
                    }`}
                  >
                    <div className="font-medium truncate">{preset.label}</div>
                    <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-[#ffb084]' : 'text-[#6a6a6a]'}`}>
                      {formatINR(preset.annualRevenueINR)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Organization Name */}
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#0a0a0a] block mb-1.5">
                Organization Legal / Brand Name <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setActivePreset(null);
                }}
                placeholder="e.g., Tata Digital, Razorpay, HDFC Bank, Apollo Hospitals"
                className="w-full bg-[#faf5e8] border border-[#e5e5e5] focus:border-[#0a0a0a] rounded-[12px] px-3.5 py-2.5 text-xs text-[#0a0a0a] placeholder-[#9a9a9a] outline-none transition-all font-medium"
              />
              <p className="text-[11px] text-[#6a6a6a] mt-1">
                Addressed on the Executive Board Brief, audit reports, and Knapsack solver outputs.
              </p>
            </div>

            {/* Industry Vertical */}
            <div>
              <label className="text-xs font-semibold text-[#0a0a0a] block mb-1.5">
                Industry & Operating Sector
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. FinTech, Healthcare, Banking, SaaS"
                className="w-full bg-[#faf5e8] border border-[#e5e5e5] focus:border-[#0a0a0a] rounded-[12px] px-3.5 py-2 text-xs text-[#0a0a0a] placeholder-[#9a9a9a] outline-none transition-all"
              />
            </div>

            {/* Annual Revenue */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#0a0a0a]">
                  Annual Revenue (in Crores INR)
                </label>
                <span className="text-xs font-mono text-[#0a0a0a] font-bold">
                  ₹{revenueCr} Cr
                </span>
              </div>
              <input
                type="number"
                min="1"
                max="50000"
                value={revenueCr}
                onChange={(e) => setRevenueCr(Math.max(1, Number(e.target.value)))}
                className="w-full bg-[#faf5e8] border border-[#e5e5e5] focus:border-[#0a0a0a] rounded-[12px] px-3.5 py-2 text-xs text-[#0a0a0a] font-mono outline-none transition-all"
              />
            </div>
          </div>

          {/* Quick Revenue Selector Buttons (Clay pill buttons) */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="text-[11px] text-[#6a6a6a]">Quick Scale:</span>
            {[25, 85, 250, 750, 2000].map((cr) => (
              <button
                key={cr}
                type="button"
                onClick={() => setRevenueCr(cr)}
                className={`px-3 py-1 rounded-full text-[11px] font-mono border transition-all cursor-pointer ${
                  revenueCr === cr
                    ? 'bg-[#0a0a0a] border-[#0a0a0a] text-[#ffffff] font-bold shadow-xs'
                    : 'bg-[#faf5e8] border-[#e5e5e5] text-[#6a6a6a] hover:text-[#0a0a0a]'
                }`}
              >
                ₹{cr} Cr
              </button>
            ))}
          </div>

          {/* Compliance Framework */}
          <div>
            <label className="text-xs font-semibold text-[#0a0a0a] block mb-1.5">
              Primary Regulatory & Compliance Standard
            </label>
            <input
              type="text"
              value={complianceFramework}
              onChange={(e) => setComplianceFramework(e.target.value)}
              placeholder="e.g. DPDP Act 2023, RBI Cyber Security Framework, ISO 27001"
              className="w-full bg-[#faf5e8] border border-[#e5e5e5] focus:border-[#0a0a0a] rounded-[12px] px-3.5 py-2 text-xs text-[#0a0a0a] outline-none transition-all"
            />
          </div>

          {/* Asset & Infrastructure Footprint */}
          <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[16px] p-4 space-y-3">
            <div className="text-xs font-semibold text-[#0a0a0a] flex items-center space-x-2">
              <Database className="w-4 h-4 text-[#1a3a3a]" />
              <span>Digital Asset Inventory & Attack Surface</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#6a6a6a] block mb-1">Critical Databases</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={criticalDatabases}
                  onChange={(e) => setCriticalDatabases(Number(e.target.value))}
                  className="w-full bg-[#ffffff] border border-[#e5e5e5] rounded-[10px] px-2.5 py-1.5 text-xs text-[#0a0a0a] font-mono"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#6a6a6a] block mb-1">Cloud Workloads</span>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={cloudWorkloads}
                  onChange={(e) => setCloudWorkloads(Number(e.target.value))}
                  className="w-full bg-[#ffffff] border border-[#e5e5e5] rounded-[10px] px-2.5 py-1.5 text-xs text-[#0a0a0a] font-mono"
                />
              </div>
              <div>
                <span className="text-[11px] text-[#6a6a6a] block mb-1">Monitored Assets</span>
                <input
                  type="number"
                  min="10"
                  max="50000"
                  value={assetsMonitored}
                  onChange={(e) => setAssetsMonitored(Number(e.target.value))}
                  className="w-full bg-[#ffffff] border border-[#e5e5e5] rounded-[10px] px-2.5 py-1.5 text-xs text-[#0a0a0a] font-mono"
                />
              </div>
            </div>
          </div>

          {/* Proportional Scaling Option */}
          <div className="bg-[#faf5e8] border border-[#e5e5e5] rounded-[14px] p-3.5 flex items-start space-x-3">
            <input
              type="checkbox"
              id="scaleScenarios"
              checked={scaleScenarios}
              onChange={(e) => setScaleScenarios(e.target.checked)}
              className="mt-0.5 rounded border-[#e5e5e5] text-[#0a0a0a] focus:ring-[#0a0a0a] w-4 h-4 cursor-pointer"
            />
            <label htmlFor="scaleScenarios" className="text-xs text-[#3a3a3a] cursor-pointer">
              <span className="font-semibold text-[#0a0a0a] block">
                Scale financial loss magnitude proportionally to company revenue
              </span>
              <span className="text-[11px] text-[#6a6a6a] block mt-0.5">
                Automatically adjusts business downtime and reputational churn loss to match your enterprise size (baseline: ₹85 Cr).
              </span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-[#e5e5e5]">
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="text-xs text-[#6a6a6a] hover:text-[#0a0a0a] flex items-center space-x-1.5 py-2 px-3 rounded-[12px] hover:bg-[#faf5e8] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim()}
                className="px-5 py-2.5 rounded-[12px] text-xs font-semibold bg-[#0a0a0a] hover:bg-[#1f1f1f] text-[#ffffff] flex items-center space-x-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4 text-[#ffb084]" />
                <span>{isSubmitting ? 'Calibrating...' : 'Apply Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
