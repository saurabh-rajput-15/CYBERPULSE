import { CandidateControl, RecommendationResult, RiskScenario } from '../types';
import { computeTotalExposure, formatINR } from './fairEngine';

/**
 * Computes the total risk reduction if a given subset of controls is active.
 * Uses realistic multi-control interaction:
 * If multiple controls mitigate the same scenario (e.g., Backups + MDR against Ransomware),
 * the combined risk reduction is calculated via independent mitigation efficacy:
 * Combined efficacy = 1 - (1 - e1) * (1 - e2)...
 */
export function calculateScenarioRiskReduction(
  scenario: RiskScenario,
  activeControls: CandidateControl[]
): number {
  const mitigatingControls = activeControls.filter((c) =>
    c.targetScenarioIds.includes(scenario.id)
  );

  if (mitigatingControls.length === 0) return 0;

  // Joint effectiveness: 1 - Product(1 - effectiveness)
  const residualFactor = mitigatingControls.reduce(
    (product, ctrl) => product * (1 - ctrl.effectivenessPercent),
    1
  );
  const jointReductionFraction = 1 - residualFactor;

  // Maximum capped at 90% reduction to reflect realistic non-zero residual risk
  const cappedFraction = Math.min(0.90, jointReductionFraction);
  return Math.round(scenario.fair.annualRiskINR * cappedFraction);
}

/**
 * Evaluates the net risk reduction across all scenarios for a candidate subset of controls
 */
export function evaluatePortfolioRiskReduction(
  scenarios: RiskScenario[],
  activeControls: CandidateControl[]
): number {
  return scenarios.reduce((totalReduction, scenario) => {
    return totalReduction + calculateScenarioRiskReduction(scenario, activeControls);
  }, 0);
}

/**
 * Constrained 0-1 Knapsack Optimizer (equivalent to OR-Tools CP-SAT formulation):
 * Maximize: Total Financial Loss Reduction (Delta Risk)
 * Subject to: Sum of Annual Control Costs <= Budget
 */
export function solveOptimalControls(
  budgetINR: number,
  allControls: CandidateControl[],
  scenarios: RiskScenario[]
): RecommendationResult {
  const baselineExposure = computeTotalExposure(scenarios);
  const n = allControls.length;

  let bestCombination: CandidateControl[] = [];
  let maxRiskReduction = 0;
  let bestCost = 0;

  // 2^n combination exploration (n=6 -> 64 combinations)
  // Provides mathematically exact optimal solution indistinguishable from CP-SAT
  const totalCombinations = 1 << n;

  for (let mask = 0; mask < totalCombinations; mask++) {
    const candidateSubset: CandidateControl[] = [];
    let subsetCost = 0;

    for (let i = 0; i < n; i++) {
      if ((mask & (1 << i)) !== 0) {
        candidateSubset.push(allControls[i]);
        subsetCost += allControls[i].annualCostINR;
      }
    }

    if (subsetCost <= budgetINR) {
      const riskReduction = evaluatePortfolioRiskReduction(scenarios, candidateSubset);
      if (
        riskReduction > maxRiskReduction ||
        (riskReduction === maxRiskReduction && subsetCost < bestCost)
      ) {
        maxRiskReduction = riskReduction;
        bestCombination = candidateSubset;
        bestCost = subsetCost;
      }
    }
  }

  // Generate explainability justifications for selected and deferred controls
  const selectedIds = new Set(bestCombination.map((c) => c.id));

  const selectedControls = bestCombination.map((control) => {
    const soloReduction = scenarios.reduce((acc, s) => {
      if (control.targetScenarioIds.includes(s.id)) {
        return acc + Math.round(s.fair.annualRiskINR * control.effectivenessPercent);
      }
      return acc;
    }, 0);

    const roi = ((soloReduction - control.annualCostINR) / control.annualCostINR).toFixed(1);

    return {
      ...control,
      scenarioRiskReducedINR: soloReduction,
      justification: `Delivers ${formatINR(soloReduction)} in direct loss mitigation against ${control.targetScenarioIds.join(', ').toUpperCase()} (${roi}x ROI). Selected by knapsack solver for optimal marginal risk reduction.`
    };
  });

  const deferredControls = allControls
    .filter((c) => !selectedIds.has(c.id))
    .map((control) => {
      const unspent = budgetINR - bestCost;
      let reason = '';
      if (control.annualCostINR > unspent) {
        reason = `Excluded: Cost (${formatINR(control.annualCostINR)}) exceeds remaining unspent budget (${formatINR(unspent)}). Increase budget by ${formatINR(control.annualCostINR - unspent)} to unlock.`;
      } else {
        reason = `Excluded: Solver identified higher marginal risk-per-rupee yield in selected controls portfolio.`;
      }
      return {
        ...control,
        reasonDeferred: reason
      };
    });

  const postMitigationExposure = Math.max(0, baselineExposure - maxRiskReduction);
  const unspentBudget = Math.max(0, budgetINR - bestCost);
  const netBenefit = maxRiskReduction - bestCost;
  const roiMultiplier = bestCost > 0 ? Number((netBenefit / bestCost).toFixed(2)) : 0;

  return {
    budgetINR,
    allocatedBudgetINR: bestCost,
    unspentBudgetINR: unspentBudget,
    baselineExposureINR: baselineExposure,
    postMitigationExposureINR: postMitigationExposure,
    totalRiskReductionINR: maxRiskReduction,
    netBenefitINR: netBenefit,
    roiMultiplier,
    selectedControls,
    deferredControls
  };
}
