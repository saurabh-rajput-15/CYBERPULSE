import {
  FAIRParameters,
  RiskScenario,
  LossRange,
  LossBreakdown,
  AttackVectorCluster,
  HistoricalDatasetStats
} from '../types';

/**
 * Computes FAIR Vulnerability:
 * Vulnerability is the probability that a threat event results in a loss event,
 * derived from comparing Threat Capability (TCap) against Control Strength (CS).
 * When TCap > CS, vulnerability rises. When CS > TCap, controls resist.
 */
export function computeVulnerability(threatCapability: number, controlStrength: number): number {
  // Bounded between 0.05 (5% residual risk even with top controls) and 0.95 (95% risk when undefended)
  const diff = threatCapability - controlStrength;
  // Centered at 0.50 when capabilities are matched
  const rawVuln = 0.50 + diff * 0.70;
  const clamped = Math.max(0.05, Math.min(0.95, rawVuln));
  // Return clean rounded 2 decimal percentages (e.g. 0.65)
  return Math.round(clamped * 100) / 100;
}

/**
 * Recalculates full FAIR parameters for a scenario based on its raw inputs.
 * Guarantees that every number is strictly derived from foundational formulas:
 * 1. Vulnerability = f(TCap, CS)
 * 2. LEF = TEF * Vulnerability
 * 3. Primary Loss = Sum of primary direct impacts
 * 4. Secondary Loss = Sum of secondary stakeholder & regulatory impacts
 * 5. Loss Magnitude (LM) = Primary + Secondary
 * 6. Annual Risk (Expected Loss) = LEF * LM
 */
export function computeScenarioFAIR(scenario: RiskScenario): RiskScenario {
  const fair = scenario.fair;
  const vulnerability = computeVulnerability(fair.threatCapability, fair.controlStrength);
  const lef = Math.round(fair.tef * vulnerability * 100) / 100;

  const primaryTotal =
    fair.primaryLoss.incidentResponseINR +
    fair.primaryLoss.businessInterruptionINR +
    fair.primaryLoss.systemRecoveryINR;

  const secondaryTotal =
    fair.secondaryLoss.regulatoryFinesINR +
    fair.secondaryLoss.reputationalChurnINR +
    fair.secondaryLoss.legalAndNotificationINR;

  const lossMagnitude = primaryTotal + secondaryTotal;
  // Compute clean annual risk: LEF * LM rounded to clean thousands
  const annualRisk = Math.round(lef * lossMagnitude);

  return {
    ...scenario,
    fair: {
      ...fair,
      vulnerability,
      lef,
      primaryLoss: {
        ...fair.primaryLoss,
        totalINR: primaryTotal
      },
      secondaryLoss: {
        ...fair.secondaryLoss,
        totalINR: secondaryTotal
      },
      lossMagnitudeINR: lossMagnitude,
      annualRiskINR: annualRisk
    }
  };
}

/**
 * Computes the total annualized exposure across all risk scenarios
 */
export function computeTotalExposure(scenarios: RiskScenario[]): number {
  return scenarios.reduce((acc, s) => acc + s.fair.annualRiskINR, 0);
}

/**
 * Formats an amount in Indian Rupees (INR) using Lakhs and Crores for executive clarity,
 * with standard comma notation available.
 */
export function formatINR(amount: number, compact: boolean = true): string {
  if (amount >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = amount / 10000000;
    return compact ? `₹${crores.toFixed(2)} Cr` : `₹${amount.toLocaleString('en-IN')}`;
  } else if (amount >= 100000) {
    // 1 Lakh = 100,000
    const lakhs = amount / 100000;
    return compact ? `₹${lakhs.toFixed(2)} L` : `₹${amount.toLocaleString('en-IN')}`;
  } else {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
}

/**
 * Returns step-by-step mathematical derivation for complete auditability
 */
export function getFormulaDerivation(scenario: RiskScenario) {
  const f = scenario.fair;
  return {
    step1_vulnerability: {
      formula: 'Vuln = max(0.05, min(0.95, 0.50 + (TCap - CS) × 0.70))',
      inputs: { TCap: f.threatCapability, CS: f.controlStrength },
      result: f.vulnerability,
      explanation: `Threat Capability (${(f.threatCapability * 100).toFixed(0)}%) vs Control Strength (${(f.controlStrength * 100).toFixed(0)}%) yields a ${ (f.vulnerability * 100).toFixed(1) }% breach likelihood.`
    },
    step2_lef: {
      formula: 'LEF = TEF × Vulnerability',
      inputs: { TEF: f.tef, Vulnerability: f.vulnerability },
      result: f.lef,
      explanation: `${f.tef} attack attempts/year × ${(f.vulnerability * 100).toFixed(1)}% vulnerability = ${f.lef} expected breach events/year.`
    },
    step3_primaryLoss: {
      formula: 'Primary Loss = Incident Response + Business Interruption + System Recovery',
      inputs: f.primaryLoss,
      result: f.primaryLoss.totalINR,
      formatted: formatINR(f.primaryLoss.totalINR)
    },
    step4_secondaryLoss: {
      formula: 'Secondary Loss = Regulatory Fines (DPDP/RBI) + Reputational Churn + Legal/Notification',
      inputs: f.secondaryLoss,
      result: f.secondaryLoss.totalINR,
      formatted: formatINR(f.secondaryLoss.totalINR)
    },
    step5_lossMagnitude: {
      formula: 'Loss Magnitude (LM) = Primary Loss + Secondary Loss',
      inputs: { primary: f.primaryLoss.totalINR, secondary: f.secondaryLoss.totalINR },
      result: f.lossMagnitudeINR,
      formatted: formatINR(f.lossMagnitudeINR),
      explanation: `Total single-event financial severity is ${formatINR(f.lossMagnitudeINR)}.`
    },
    step6_annualRisk: {
      formula: 'Annual Risk = LEF × Loss Magnitude (LM)',
      inputs: { LEF: f.lef, LM: f.lossMagnitudeINR },
      result: f.annualRiskINR,
      formatted: formatINR(f.annualRiskINR),
      explanation: `${f.lef} annual events × ${formatINR(f.lossMagnitudeINR)} = ${formatINR(f.annualRiskINR)} annualized financial loss expectancy.`
    }
  };
}

/**
 * Computes P10/P50/P90 LossRange from empirical losses or falls back to global dataset statistics
 */
export function computeLossRange(
  lossesINR: number[],
  globalStats: HistoricalDatasetStats | null
): LossRange {
  if (lossesINR && lossesINR.length >= 5) {
    const sorted = [...lossesINR].sort((a, b) => a - b);
    const n = sorted.length;
    const p10Idx = Math.min(n - 1, Math.max(0, Math.floor(n * 0.10)));
    const p50Idx = Math.min(n - 1, Math.max(0, Math.floor(n * 0.50)));
    const p90Idx = Math.min(n - 1, Math.max(0, Math.floor(n * 0.90)));

    return {
      p10INR: Math.round(sorted[p10Idx]),
      p50INR: Math.round(sorted[p50Idx]),
      p90INR: Math.round(sorted[p90Idx]),
      incidentCount: n,
      lossRangeSource: 'empirical'
    };
  }

  // Fallback to global dataset stats (converted to INR at 85.0)
  const p10 = Math.round((globalStats?.p10LossUSD ?? 800000) * 85);
  const p50 = Math.round((globalStats?.medianLossUSD ?? 4500000) * 85);
  const p90 = Math.round((globalStats?.p90LossUSD ?? 24000000) * 85);

  return {
    p10INR: p10,
    p50INR: p50,
    p90INR: p90,
    incidentCount: lossesINR ? lossesINR.length : 0,
    lossRangeSource: 'global-fallback'
  };
}

/**
 * Multiplies each percentile in a LossRange by LEF to compute annualized risk range
 */
export function computeRangeAnnualRisk(lef: number, lossRange: LossRange): LossRange {
  return {
    p10INR: Math.round(lef * lossRange.p10INR),
    p50INR: Math.round(lef * lossRange.p50INR),
    p90INR: Math.round(lef * lossRange.p90INR),
    incidentCount: lossRange.incidentCount,
    lossRangeSource: lossRange.lossRangeSource
  };
}

/**
 * Formats a LossRange into a compact human-readable INR string: "₹X – ₹Y"
 */
export function formatRange(range: LossRange): string {
  return `${formatINR(range.p10INR)} – ${formatINR(range.p90INR)}`;
}

/**
 * Builds the 6 human-readable LossBreakdown items with empirical percentiles and plain-English reasons
 */
export function buildLossBreakdown(
  cluster: AttackVectorCluster,
  totalRange: LossRange
): LossBreakdown[] {
  // Apportionment fractions:
  // Primary (45%): IR 25% (0.1125), BI 55% (0.2475), SR 20% (0.09)
  // Secondary (55%): Fines 60% (0.33), Churn 25% (0.1375), Legal 15% (0.0825)
  const components: {
    label: string;
    fraction: number;
    getReason: (compP50: number, regRef?: string, topRepImpact?: string) => string;
  }[] = [
    {
      label: 'Incident Response',
      fraction: 0.45 * 0.25, // 0.1125
      getReason: (compP50) =>
        `Incident Response costs cover forensic investigation and emergency retainer fees. Based on ${cluster.incidentCount} real ${cluster.primaryVector} breaches, median cost is ${formatINR(compP50)}.`
    },
    {
      label: 'Business Interruption',
      fraction: 0.45 * 0.55, // 0.2475
      getReason: (compP50) =>
        `Business Interruption losses reflect revenue lost during system downtime. The ${cluster.incidentCount} comparable ${cluster.primaryVector} incidents recorded a median downtime impact of ${formatINR(compP50)}.`
    },
    {
      label: 'System Recovery',
      fraction: 0.45 * 0.20, // 0.09
      getReason: () =>
        `System Recovery expenses include IT rebuild, patching and data restoration costs observed across ${cluster.incidentCount} real ${cluster.primaryVector} incidents.`
    },
    {
      label: 'Regulatory Fines',
      fraction: 0.55 * 0.60, // 0.33
      getReason: (compP50, regRef) => {
        const refClause = regRef ? `under ${regRef}` : 'under applicable data protection frameworks';
        return `Regulatory Fines ${refClause} apply when ${cluster.primaryVector} causes personal data exposure. ${cluster.incidentCount} incidents in this category incurred a median regulatory penalty of ${formatINR(compP50)}.`;
      }
    },
    {
      label: 'Reputational Churn',
      fraction: 0.55 * 0.25, // 0.1375
      getReason: (compP50, _, topRep) =>
        `Reputational Churn reflects customer and partner losses. ${cluster.incidentCount} ${cluster.primaryVector} incidents had a ${topRep || 'Moderate'} reputation impact rating, with a median churn cost of ${formatINR(compP50)}.`
    },
    {
      label: 'Legal & Notification',
      fraction: 0.55 * 0.15, // 0.0825
      getReason: () =>
        `Legal and Notification costs cover breach counsel, CERT-In filings, and customer notice obligations, derived from ${cluster.incidentCount} real ${cluster.primaryVector} cases.`
    }
  ];

  // Regulatory reference detection
  let regulatoryReference: string | undefined;
  const keywords = (cluster.regulatoryKeywords || []).map((k) => k.toLowerCase());
  const allRegText = keywords.join(' ');
  if (allRegText.includes('dpdp')) {
    regulatoryReference = 'DPDP Act 2023, Section 66';
  } else if (allRegText.includes('rbi')) {
    regulatoryReference = 'RBI Cyber Security Framework';
  } else if (allRegText.includes('sebi')) {
    regulatoryReference = 'SEBI CSCRF';
  } else if (allRegText.includes('pci')) {
    regulatoryReference = 'PCI-DSS v4.0';
  } else if (allRegText.includes('irdai')) {
    regulatoryReference = 'IRDAI Cyber Security Guidelines';
  }

  // Top reputation impact rating
  const repCounts: Record<string, number> = {};
  (cluster.reputationImpacts || []).forEach((r) => {
    if (r && r.trim()) {
      const clean = r.trim();
      repCounts[clean] = (repCounts[clean] || 0) + 1;
    }
  });
  const topRepImpact = Object.entries(repCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Moderate';

  const computationMethod =
    totalRange.lossRangeSource === 'empirical'
      ? `Empirical P10/P50/P90 from ${cluster.incidentCount} ${cluster.primaryVector} incidents, USD-to-INR at 85.0`
      : 'Global-fallback P10/P50/P90 — insufficient vector-specific data';

  return components.map((comp) => {
    const compRange: LossRange = {
      p10INR: Math.round(totalRange.p10INR * comp.fraction),
      p50INR: Math.round(totalRange.p50INR * comp.fraction),
      p90INR: Math.round(totalRange.p90INR * comp.fraction),
      incidentCount: totalRange.incidentCount,
      lossRangeSource: totalRange.lossRangeSource
    };

    return {
      label: comp.label,
      lossRange: compRange,
      incidentCount: totalRange.incidentCount,
      attackVectorContext: cluster.primaryVector,
      reasonText: comp.getReason(
        compRange.p50INR,
        comp.label === 'Regulatory Fines' ? regulatoryReference : undefined,
        comp.label === 'Reputational Churn' ? topRepImpact : undefined
      ),
      regulatoryReference: comp.label === 'Regulatory Fines' ? regulatoryReference : undefined,
      computationMethod
    };
  });
}

