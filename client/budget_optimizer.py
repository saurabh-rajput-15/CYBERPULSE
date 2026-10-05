"""
CyberPulse Constrained Security Budget Optimizer
Formulates the security control selection as a 0-1 Knapsack / CP-SAT Integer Programming Problem.

Objective:
    Maximize: Sum(x_i * Delta_Risk_i)
Subject to:
    Sum(x_i * Cost_i) <= Budget
    x_i in {0, 1}
"""

def solve_security_budget(budget: float, controls: list, scenarios: list) -> dict:
    """
    Solves 0-1 Knapsack control allocation.
    Evaluates candidate subsets within budget to maximize total risk reduction.
    """
    n = len(controls)
    best_subset = []
    max_reduction = 0
    best_cost = 0

    for mask in range(1 << n):
        candidate = [controls[i] for i in range(n) if (mask & (1 << i))]
        cost = sum(c["annual_cost_inr"] for c in candidate)
        if cost <= budget:
            # Calculate portfolio risk reduction
            reduction = sum(c["expected_risk_reduction_inr"] for c in candidate)
            if reduction > max_reduction or (reduction == max_reduction and cost < best_cost):
                max_reduction = reduction
                best_subset = candidate
                best_cost = cost

    return {
        "budget": budget,
        "allocated": best_cost,
        "unspent": budget - best_cost,
        "risk_reduced": max_reduction,
        "selected_controls": [c["code"] for c in best_subset]
    }

if __name__ == "__main__":
    demo_controls = [
        {"code": "CTRL-01", "annual_cost_inr": 1_200_000, "expected_risk_reduction_inr": 43_680_000},
        {"code": "CTRL-02", "annual_cost_inr": 850_000, "expected_risk_reduction_inr": 34_020_000},
        {"code": "CTRL-03", "annual_cost_inr": 1_500_000, "expected_risk_reduction_inr": 33_810_000},
        {"code": "CTRL-04", "annual_cost_inr": 600_000, "expected_risk_reduction_inr": 9_487_500},
        {"code": "CTRL-05", "annual_cost_inr": 2_400_000, "expected_risk_reduction_inr": 35_000_000},
        {"code": "CTRL-06", "annual_cost_inr": 1_800_000, "expected_risk_reduction_inr": 30_000_000},
    ]

    print("--- Sanity Check: Tiny Budget (₹10 Lakhs) ---")
    res_tiny = solve_security_budget(1_000_000, demo_controls, [])
    print(f"Selected: {res_tiny['selected_controls']}, Spent: ₹{res_tiny['allocated']:,}, Reduced: ₹{res_tiny['risk_reduced']:,}")
    # Should select CTRL-02 (₹8.5L) or CTRL-04 (₹6L)
    assert len(res_tiny["selected_controls"]) >= 1

    print("--- Sanity Check: Large Budget (₹1 Crore) ---")
    res_large = solve_security_budget(10_000_000, demo_controls, [])
    print(f"Selected: {res_large['selected_controls']}, Spent: ₹{res_large['allocated']:,}, Reduced: ₹{res_large['risk_reduced']:,}")
    assert len(res_large["selected_controls"]) == len(demo_controls)
    print("Sanity Checks Passed Successfully.")
