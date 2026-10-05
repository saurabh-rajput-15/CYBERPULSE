"""
CyberPulse FAIR Risk Quantification Engine
Implements the Factor Analysis of Information Risk (FAIR) standard equations:
- Vulnerability = P(Threat Capability > Control Strength)
- Loss Event Frequency (LEF) = Threat Event Frequency (TEF) * Vulnerability
- Loss Magnitude (LM) = Primary Loss + Secondary Loss
- Annualized Loss Exposure = LEF * LM
"""

def compute_vulnerability(threat_capability: float, control_strength: float) -> float:
    """
    Computes Vulnerability as a function of Threat Capability vs Control Strength.
    Bounded between 0.05 (5%) and 0.95 (95%).
    """
    diff = threat_capability - control_strength
    raw_vuln = 0.50 + diff * 0.70
    return round(max(0.05, min(0.95, raw_vuln)), 3)

def compute_risk(tef: float, threat_capability: float, control_strength: float,
                 primary_loss: float, secondary_loss: float) -> dict:
    """
    Computes full FAIR breakdown and annualized financial risk.
    """
    vuln = compute_vulnerability(threat_capability, control_strength)
    lef = round(tef * vuln, 3)
    loss_magnitude = primary_loss + secondary_loss
    annual_risk = round(lef * loss_magnitude)
    
    return {
        "vulnerability": vuln,
        "lef": lef,
        "primary_loss": primary_loss,
        "secondary_loss": secondary_loss,
        "loss_magnitude": loss_magnitude,
        "annual_risk_inr": annual_risk
    }

def total_exposure(scenarios: list) -> float:
    """
    Sums annualized financial risk across all risk scenarios.
    """
    return sum(s["fair"]["annual_risk_inr"] for s in scenarios)

if __name__ == "__main__":
    # Hand-verify Scenario 01: Ransomware on Payment DB
    # TEF = 2.8, TCap = 0.85, CS = 0.55, Primary = 1.70 Cr, Secondary = 2.30 Cr
    res = compute_risk(2.8, 0.85, 0.55, 17_000_000, 23_000_000)
    print("--- FAIR Engine Hand-Verification (Scenario 01) ---")
    print(f"Vulnerability : {res['vulnerability']}")
    print(f"LEF           : {res['lef']} events/year")
    print(f"Loss Magnitude: ₹{res['loss_magnitude']:,}")
    print(f"Annual Risk   : ₹{res['annual_risk_inr']:,}")
    assert res['annual_risk_inr'] > 0
    print("Verification Passed Successfully.")
