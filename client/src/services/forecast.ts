import {
  RiskScenario,
  AttackVectorCluster,
  SynthesizedEvent,
  PatternForecast,
  ForecastBand
} from '../types';
import { computeTotalExposure } from './fairEngine';
import { getAttackVectorClusters, getSynthesizedEvents } from './realDataService';

export interface ForecastMonth {
  month: string;
  isHistorical: boolean;
  unmitigatedExposureINR: number;
  mitigatedExposureINR: number;
  confidenceLowerINR: number;
  confidenceUpperINR: number;
  threatEventsCount: number;
  actualCount?: number;
  projectedCount?: number;
  trendMethod?: 'wma' | 'ols-regression';
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getNextMonthString(monthStr: string, offset: number): string {
  const parts = monthStr.split(' ');
  const mIdx = MONTH_NAMES.indexOf(parts[0]);
  const year = parseInt(parts[1], 10);
  if (mIdx === -1 || isNaN(year)) {
    return `Month +${offset}`;
  }
  const targetDate = new Date(year, mIdx + offset, 1);
  return `${MONTH_NAMES[targetDate.getMonth()]} ${targetDate.getFullYear()}`;
}

/**
 * Groups synthesized events by calendar month string "MMM YYYY" and counts per month for an attack type
 */
export function getMonthlyFrequencyTimeSeries(
  attackType: string,
  synthesizedEvents: SynthesizedEvent[]
): { month: string; count: number }[] {
  const normTarget = attackType.toLowerCase();

  // Fuzzy match on attackType
  let matched = synthesizedEvents.filter((e) => {
    const norm = e.attackType.toLowerCase();
    return norm.includes(normTarget) || normTarget.includes(norm);
  });

  // If no direct substring match, map keywords
  if (matched.length === 0) {
    let fallbackType = '';
    if (normTarget.includes('network') || normTarget.includes('vulnerabilit') || normTarget.includes('exploit')) {
      fallbackType = 'zero-day';
    } else if (normTarget.includes('phish') || normTarget.includes('email') || normTarget.includes('social')) {
      fallbackType = 'phishing';
    } else if (normTarget.includes('ransom')) {
      fallbackType = 'ransomware';
    } else if (normTarget.includes('insider') || normTarget.includes('credential') || normTarget.includes('auth')) {
      fallbackType = 'brute force';
    } else if (normTarget.includes('malware')) {
      fallbackType = 'malware';
    }

    if (fallbackType) {
      matched = synthesizedEvents.filter((e) => e.attackType.toLowerCase().includes(fallbackType));
    }
  }

  // Fallback to all synthesized events if still empty
  if (matched.length === 0) {
    matched = synthesizedEvents;
  }

  const monthMap: Record<string, { count: number; sortKey: number; monthStr: string }> = {};

  for (const e of matched) {
    if (!e.timestamp) continue;
    const d = e.timestamp;
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
    if (!monthMap[key]) {
      monthMap[key] = {
        count: 0,
        sortKey: year * 100 + monthIdx,
        monthStr: `${MONTH_NAMES[monthIdx]} ${year}`
      };
    }
    monthMap[key].count++;
  }

  return Object.values(monthMap)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((item) => ({ month: item.monthStr, count: item.count }));
}

/**
 * Computes 3-month Weighted Moving Average (weights [0.5, 0.3, 0.2] on last 3 values)
 */
export function computeWMA(recentCounts: number[]): number {
  const n = recentCounts.length;
  if (n === 0) return 0;
  if (n === 1) return recentCounts[0];
  if (n === 2) return Math.round(recentCounts[1] * 0.6 + recentCounts[0] * 0.4);

  const wma = recentCounts[n - 1] * 0.5 + recentCounts[n - 2] * 0.3 + recentCounts[n - 3] * 0.2;
  return Math.max(0, Math.round(wma));
}

/**
 * Computes Ordinary Least Squares slope and intercept for monthly frequency data
 */
export function computeOLSSlope(
  monthlyData: { month: string; count: number }[]
): { slope: number; intercept: number } {
  const n = monthlyData.length;
  if (n < 2) {
    return { slope: 0, intercept: monthlyData[0]?.count || 0 };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (let i = 0; i < n; i++) {
    const x = i;
    const y = monthlyData[i].count;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) {
    return { slope: 0, intercept: sumY / n };
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Builds 12-month PatternForecast for an attack vector cluster
 */
export function buildPatternForecast(
  cluster: AttackVectorCluster,
  synthesizedEvents: SynthesizedEvent[],
  mitigatedFraction = 0.42
): PatternForecast {
  const timeSeries = getMonthlyFrequencyTimeSeries(cluster.primaryVector, synthesizedEvents);

  // Take up to 12 months, or use whatever is available
  let historicalMonths = timeSeries.slice(-6);
  if (historicalMonths.length === 0) {
    historicalMonths = [
      { month: 'Apr 2026', count: Math.round(cluster.incidentCount / 12) || 5 },
      { month: 'May 2026', count: Math.round(cluster.incidentCount / 12) || 6 },
      { month: 'Jun 2026', count: Math.round(cluster.incidentCount / 12) || 6 },
      { month: 'Jul 2026', count: Math.round(cluster.incidentCount / 12) || 7 },
      { month: 'Aug 2026', count: Math.round(cluster.incidentCount / 12) || 8 },
      { month: 'Sep 2026', count: Math.round(cluster.incidentCount / 12) || 8 }
    ];
  } else if (historicalMonths.length < 6) {
    const padCount = 6 - historicalMonths.length;
    const padded: { month: string; count: number }[] = [];
    for (let p = padCount; p >= 1; p--) {
      padded.push({
        month: getNextMonthString(historicalMonths[0].month, -p),
        count: Math.round(historicalMonths[0].count * 0.9)
      });
    }
    historicalMonths = [...padded, ...historicalMonths];
  }

  // Count months with non-zero data
  const nonZeroCount = historicalMonths.filter((m) => m.count > 0).length;
  const useWMA = nonZeroCount >= 3;
  const trendMethod: 'wma' | 'ols-regression' = useWMA ? 'wma' : 'ols-regression';

  const ols = computeOLSSlope(historicalMonths);

  // Project next 6 months
  const projectedMonths: { month: string; count: number }[] = [];
  const runningCounts = historicalMonths.map((m) => m.count);
  const lastHistoricalMonth = historicalMonths[historicalMonths.length - 1].month;

  for (let i = 1; i <= 6; i++) {
    const nextMonth = getNextMonthString(lastHistoricalMonth, i);
    let count: number;

    if (useWMA) {
      count = computeWMA(runningCounts);
      runningCounts.push(count);
    } else {
      const x = historicalMonths.length + i - 1;
      count = Math.max(0, Math.round(ols.slope * x + ols.intercept));
    }

    projectedMonths.push({ month: nextMonth, count });
  }

  // Build 12 bands (6 historical + 6 projected)
  const bands: ForecastBand[] = [];
  let totalHistoricalCount = 0;

  for (const h of historicalMonths) {
    totalHistoricalCount += h.count;
    bands.push({
      month: h.month,
      isHistorical: true,
      actualCount: h.count,
      projectedCount: h.count,
      threatEventsCount: h.count,
      trendMethod,
      unmitigatedExposureINR: Math.round(h.count * cluster.p50INR),
      mitigatedExposureINR: Math.round(h.count * cluster.p50INR),
      confidenceLowerINR: Math.round(h.count * cluster.p10INR * 0.8),
      confidenceUpperINR: Math.round(h.count * cluster.p90INR * 1.2)
    });
  }

  for (let i = 0; i < projectedMonths.length; i++) {
    const p = projectedMonths[i];
    const deploymentProgress = Math.min(1.0, (i + 1) * 0.25);
    const effectiveMitigation = mitigatedFraction * deploymentProgress;

    bands.push({
      month: p.month,
      isHistorical: false,
      projectedCount: p.count,
      threatEventsCount: p.count,
      trendMethod,
      unmitigatedExposureINR: Math.round(p.count * cluster.p50INR),
      mitigatedExposureINR: Math.round(p.count * cluster.p50INR * (1 - effectiveMitigation)),
      confidenceLowerINR: Math.round(p.count * cluster.p10INR * 0.8),
      confidenceUpperINR: Math.round(p.count * cluster.p90INR * 1.2)
    });
  }

  return {
    attackVector: cluster.primaryVector,
    bands,
    totalHistoricalCount,
    trendSlope: Math.round(ols.slope * 100) / 100
  };
}

export function generateExposureForecast(
  scenarios: RiskScenario[],
  mitigatedTotalExposureINR?: number,
  synthesizedEvents?: SynthesizedEvent[]
): ForecastMonth[] {
  const events = synthesizedEvents && synthesizedEvents.length > 0
    ? synthesizedEvents
    : getSynthesizedEvents();

  // If synthesized events are available, generate pattern-based forecast
  if (events && events.length > 0) {
    const clusters = getAttackVectorClusters();
    const currentTotal = computeTotalExposure(scenarios);
    const mitigatedFraction = mitigatedTotalExposureINR !== undefined && currentTotal > 0
      ? Math.max(0, Math.min(0.9, 1 - (mitigatedTotalExposureINR / currentTotal)))
      : 0.42;

    const activeClusters = clusters.slice(0, 4);
    if (activeClusters.length > 0) {
      const vectorForecasts = activeClusters.map((c) =>
        buildPatternForecast(c, events, mitigatedFraction)
      );

      const numBands = vectorForecasts[0].bands.length;
      const aggregated: ForecastMonth[] = [];

      for (let bIdx = 0; bIdx < numBands; bIdx++) {
        let unmitigated = 0;
        let mitigated = 0;
        let lower = 0;
        let upper = 0;
        let eventsCount = 0;
        let actual = 0;
        let projected = 0;
        const baseBand = vectorForecasts[0].bands[bIdx];

        for (const vf of vectorForecasts) {
          const band = vf.bands[bIdx];
          if (band) {
            unmitigated += band.unmitigatedExposureINR;
            mitigated += band.mitigatedExposureINR;
            lower += band.confidenceLowerINR;
            upper += band.confidenceUpperINR;
            eventsCount += band.threatEventsCount;
            actual += band.actualCount || 0;
            projected += band.projectedCount;
          }
        }

        aggregated.push({
          month: baseBand.month,
          isHistorical: baseBand.isHistorical,
          unmitigatedExposureINR: unmitigated,
          mitigatedExposureINR: mitigated,
          confidenceLowerINR: lower,
          confidenceUpperINR: upper,
          threatEventsCount: eventsCount,
          actualCount: baseBand.isHistorical ? actual : undefined,
          projectedCount: projected,
          trendMethod: baseBand.trendMethod
        });
      }

      return aggregated;
    }
  }

  // Fallback linear forecast logic (unchanged)
  const currentTotal = computeTotalExposure(scenarios);
  const targetMitigated = mitigatedTotalExposureINR !== undefined
    ? mitigatedTotalExposureINR
    : Math.round(currentTotal * 0.42);

  const months = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027'];
  const baseGrowthRates = [0.82, 0.86, 0.90, 0.93, 0.97, 1.00];
  const forecastData: ForecastMonth[] = [];

  for (let i = 0; i < 6; i++) {
    const historicalExposure = Math.round(currentTotal * baseGrowthRates[i]);
    forecastData.push({
      month: months[i],
      isHistorical: true,
      unmitigatedExposureINR: historicalExposure,
      mitigatedExposureINR: historicalExposure,
      confidenceLowerINR: Math.round(historicalExposure * 0.92),
      confidenceUpperINR: Math.round(historicalExposure * 1.08),
      threatEventsCount: Math.round(14 + i * 2.2)
    });
  }

  for (let i = 1; i <= 6; i++) {
    const monthIndex = 5 + i;
    const compoundInflation = Math.pow(1.042, i);
    const unmitigated = Math.round(currentTotal * compoundInflation);
    const deploymentProgress = Math.min(1.0, i * 0.25);
    const mitigated = Math.round(
      currentTotal - (currentTotal - targetMitigated) * deploymentProgress
    );
    const uncertaintySpread = 0.05 + i * 0.02;

    forecastData.push({
      month: months[monthIndex],
      isHistorical: false,
      unmitigatedExposureINR: unmitigated,
      mitigatedExposureINR: mitigated,
      confidenceLowerINR: Math.round(unmitigated * (1 - uncertaintySpread)),
      confidenceUpperINR: Math.round(unmitigated * (1 + uncertaintySpread)),
      threatEventsCount: Math.round(26 + i * 2.5)
    });
  }

  return forecastData;
}
