# CyberPulse — Product Requirements Document

**Tagline:** *From threat noise to boardroom decisions — quantify cyber risk in money, not just severity scores.*

| Field | Value |
|---|---|
| Document type | Product Requirements Document (PRD) |
| Product | CyberPulse — Quantitative Cyber-Risk Platform |
| Version | 1.0 (Draft) |
| Status | Phase 1 scope locked, Phase 2–3 provisional |
| Prepared for | Academic capstone / SIH-track submission |

> **Note on assumptions:** This PRD assumes a small student team (2–5 people), a build window measured in weeks-to-a-few-months rather than a single 36-hour sprint, and access only to free/open datasets and simulated enterprise data (no real SIEM/EDR production access). Where the source context didn't specify a detail, I've made the most defensible assumption and flagged it inline as **[ASSUMPTION]** so you can correct it in one pass.

---

## 1. Executive Summary

CyberPulse is a quantitative cyber-risk management platform that ingests cyber-threat and organizational security data, translates raw technical signals (vulnerabilities, incidents, misconfigurations, threat intel) into **financial risk exposure** using the **FAIR (Factor Analysis of Information Risk)** methodology, predicts how that risk will trend, and recommends where a limited security budget should be spent to reduce expected loss the most.

The core insight CyberPulse sells is the same one the real CRQ (Cyber Risk Quantification) industry sells (Kovrr, Black Kite, Trend Micro, Safe Security, RiskLens): **CISOs lose budget fights because they speak in CVSS scores and boards think in rupees.** CyberPulse closes that gap.

The system is built in three deliberately sequenced phases so that a working, demonstrable product exists early and complexity is added only once the foundation is solid:

1. **Phase 1 — Quantitative Risk Core (MVP):** Manual/CSV + simulated data in, FAIR-based LEF × LM risk scoring out, a dashboard that shows risk in currency.
2. **Phase 2 — Intelligence Layer:** Live-ish data ingestion (feeds, CVE/NVD, security advisories), NLP extraction from unstructured threat text, ML-based risk trend prediction (XGBoost).
3. **Phase 3 — Optimization Layer:** Budget allocation optimizer (OR-Tools) that recommends which controls to fund for maximum expected-loss reduction per rupee.

---

## 2. Problem Statement

Organizations — especially small and mid-sized ones without a mature GRC function — struggle to answer three questions that matter more than any vulnerability count:

1. **"How much money are we actually exposed to losing this year because of our cyber risk posture?"**
2. **"Is that exposure getting better or worse, and why?"**
3. **"If we have ₹X to spend on security this quarter, what should we buy first to reduce that exposure the most?"**

Existing tools (SIEM dashboards, vulnerability scanners, EDR consoles) answer *technical* questions — how many criticals, how many open alerts — but don't translate that into financial terms a CFO or board can act on. Commercial CRQ platforms (RiskLens, Kovrr, Safe Security's SAFE) do this, but are enterprise-priced, closed-source, and opaque about their models — making them unsuitable as a reference for students and unaffordable for the SMEs who need this the most.

**[ASSUMPTION]** The target beneficiary is framed as an SME / mid-market organization (100–2000 employees) that has *some* security tooling but no dedicated risk-quantification function — this is also the segment India's own cybersecurity push (CERT-In advisories, DPDP Act compliance pressure) is trying to uplift, which gives the project a strong "why India, why now" narrative for SIH-style evaluation.

---

## 3. Goals and Non-Goals

### 3.1 Goals

- Translate technical security findings into **expected financial loss** using a transparent, defensible model (FAIR), not a black-box score.
- Provide a **trend view** of risk over time, not just a point-in-time snapshot.
- Recommend **specific budget allocations** across candidate security controls, ranked by risk reduction per rupee spent.
- Be **explainable at every step** — every number the dashboard shows should be traceable back to the inputs and formula that produced it. This is a research/evaluation requirement as much as a UX one.
- Be **buildable and demoable** by a small student team without dependency on paid enterprise data feeds.

### 3.2 Non-Goals (explicitly out of scope)

- **Not** a SIEM, EDR, or vulnerability scanner — CyberPulse *consumes* their output, it does not replace them.
- **Not** a real-time incident response or SOAR tool. No automated remediation actions.
- **Not** attempting full actuarial-grade precision. FAIR here is used in its simplified/practitioner form (see §6), not the full Monte-Carlo distribution-fitting rigor of a professional risk quantification firm — that level of statistical rigor is a stretch goal, not a Phase 1–3 requirement.
- **Not** building a threat-intel collection network from scratch — CyberPulse aggregates and interprets existing public feeds (CVE/NVD, CISA KEV, vendor advisories), it doesn't discover zero-days.
- **Not** handling real production credentials/PII in early phases — Phase 1–2 demos run on synthetic or anonymized/sample data.

---

## 4. Target Users & Personas

| Persona | Who they are | What CyberPulse gives them |
|---|---|---|
| **CISO / Security Lead** | Owns the security budget, needs to justify spend to leadership | A defensible, currency-denominated risk number and a ranked spending plan |
| **IT/Security Analyst** | Feeds data in, triages findings day-to-day | A single pane that turns scattered tool output into prioritized, quantified risk items |
| **CFO / Board Member (secondary)** | Approves budget, doesn't read CVSS scores | A trend chart in ₹ and a one-page "here's what we're exposed to and why" view |
| **Evaluator / Judge (SIH / academic reviewer)** | Assesses technical depth and real-world applicability | A working demo showing the full pipeline: raw signal → FAIR score → prediction → budget recommendation |

---

## 5. Product Overview

At its core, CyberPulse answers **Risk (₹) = Loss Event Frequency (LEF) × Loss Magnitude (LM)** for every meaningful risk scenario an organization faces (e.g., "ransomware on the finance server," "phishing-led credential compromise of an admin account," "unpatched internet-facing CVE exploited"), aggregates those into an organization-level risk exposure figure, tracks it over time, predicts where it's heading, and — given a budget constraint — recommends which controls to fund to reduce it the most.

### 5.1 High-Level Data Flow

```
[Data Sources]                [Processing Pipeline]                    [Outputs]
─────────────                 ──────────────────────                   ─────────
SIEM / EDR logs      ┐
IAM data             │
Vulnerability scans   ├─► Ingestion & Normalization ─► FAIR Risk Engine ─► Risk Dashboard (₹)
Asset inventory       │        (ETL layer)              (LEF × LM)         │
CSPM findings         │                                       │            ├─► Trend View
Threat intel feeds    │                                       ▼            │
CVE / NVD database    │                              ML Prediction Engine  ├─► Prediction Chart
Security advisories   │                                (XGBoost)           │
Cybersecurity news   ─┘              ▲                        │            └─► Budget Recommendation
                                      │                        ▼                 (OR-Tools output)
                              NLP Extraction Layer    Optimization Engine
                              (unstructured → structured)  (OR-Tools)
```

---

## 6. Methodology: FAIR Risk Quantification (the core of the product)

This is the section that gives the project technical substance and should be the centerpiece of any demo or paper. FAIR decomposes overall risk into two independently estimable branches.

### 6.1 The Core Formula

```
Risk (₹) = LEF × LM
```

Where:
- **LEF (Loss Event Frequency)** — how many times per year a loss event of this type is expected to actually occur.
- **LM (Loss Magnitude)** — how much money is lost, on average, when it does occur.

### 6.2 Decomposing LEF

```
LEF = TEF × Vulnerability
```

- **TEF (Threat Event Frequency):** how often a threat actor *attempts* the action against this asset per year. Estimated from threat intel feed volume, industry-sector attack frequency benchmarks (e.g., IBM Cost of a Data Breach, Verizon DBIR sector averages), and observed SIEM/EDR alert frequency for the relevant attack pattern.
- **Vulnerability (susceptibility), 0–1:** the probability that a given threat event *succeeds* given current controls. This is CyberPulse's **simplified susceptibility score**, computed from:

```
Vulnerability = f( CVSS-weighted open findings, patch latency, control coverage, exposure )
```

**Simplified Phase 1 formula [ASSUMPTION — tune against real benchmarks once available]:**

```
Vulnerability = clamp(
    w1 · (mean CVSS of unpatched relevant CVEs / 10)
  + w2 · (days since disclosure unpatched / 90, capped at 1)
  + w3 · (1 − control_effectiveness_score)
  + w4 · (asset exposure factor: internet-facing=1, internal=0.4, isolated=0.1),
  0, 1
)
```
with default weights `w1=0.35, w2=0.20, w3=0.30, w4=0.15` (sum to 1), exposed as tunable parameters in the admin config — not hardcoded — so the system can be recalibrated per organization or per academic experiment.

### 6.3 Decomposing LM

```
LM = Primary Loss + Secondary Loss
```

- **Primary Loss:** direct cost — incident response, forensics, system downtime/productivity loss, data recovery, legal/regulatory (e.g., DPDP Act penalties for Indian entities), customer notification cost.
- **Secondary Loss:** downstream cost — reputational damage (estimated via customer churn %), competitive disadvantage, increased insurance premiums.

**Simplified Phase 1 formula:**

```
Primary Loss   = (downtime_hours × hourly_revenue_impact)
               + incident_response_flat_cost
               + (records_exposed × per_record_regulatory_cost)

Secondary Loss = Primary Loss × secondary_loss_multiplier
```
where `secondary_loss_multiplier` defaults to an industry-sector value (e.g., 0.3–0.6 for finance/healthcare, lower for less regulated sectors) — sourced from public breach-cost reports (IBM Cost of a Data Breach, sector-segmented) rather than invented.

### 6.4 Aggregation

Organization-level exposure is the sum across all modeled risk scenarios:

```
Total Annualized Risk Exposure (₹) = Σ (LEF_i × LM_i)  for each scenario i
```

This is CyberPulse's headline number — the one thing a CFO sees first.

### 6.5 Why "simplified" is a feature, not a shortcut

Full FAIR practice uses Monte Carlo simulation over probability distributions (min/likely/max estimates) rather than point estimates. CyberPulse's Phase 1–3 scope intentionally uses **point-estimate FAIR** for buildability and explainability, with **Monte Carlo simulation as an explicit Phase 4 stretch goal** (see §12) — this framing itself is a legitimate research contribution: "how much accuracy do you lose going from full FAIR to a point-estimate approximation, and is it worth it for SME-scale organizations?" is a genuinely publishable question for a capstone.

---

## 7. Data Sources & Ingestion

| Source category | Examples | Phase | Format | Notes |
|---|---|---|---|---|
| Vulnerability scanners | OpenVAS, Nessus exports | 1 | CSV/JSON export | Simulated/sample data acceptable |
| Asset inventory | Manual entry / CSV | 1 | CSV | Defines what's being protected & its value |
| CVE / NVD database | NVD API | 1–2 | JSON via API | Public, free, no auth needed for basic use |
| CISA KEV (Known Exploited Vulnerabilities) | CISA feed | 2 | JSON | Prioritization signal — "actively exploited" flag |
| Security advisories | Vendor bulletins, CERT-In advisories | 2 | HTML/text | Feeds the NLP extraction layer |
| Cybersecurity news | RSS feeds (BleepingComputer, The Hacker News, etc.) | 2 | RSS/HTML | Feeds the NLP extraction layer |
| SIEM / EDR logs | Simulated log format (e.g., sample Splunk/Wazuh exports) | 2–3 | JSON/CSV | Real production access not required |
| IAM data | Sample user/privilege export | 2 | CSV | Used for identity-risk scenarios |
| CSPM findings | Sample cloud misconfig report | 2–3 | JSON | Optional if cloud scope is added |

**[ASSUMPTION]** Given "buildable for a student project," Phase 1–2 should rely on **public, free, no-auth-required sources** (NVD, CISA KEV, RSS feeds) plus **synthetic organizational data** the team generates themselves (a fictional company's asset inventory, sample vuln scan output). This avoids the single biggest risk to a student project: blocked on data access.

---

## 8. NLP Extraction Layer (Phase 2)

**Purpose:** Convert unstructured text (advisories, news articles, CVE descriptions) into structured fields the FAIR engine can consume.

**Extraction targets per document:**
- Affected product/technology (entity extraction)
- CVE ID(s) referenced (regex + NER)
- Severity/CVSS if mentioned
- Exploitation status ("actively exploited in the wild" vs. "proof-of-concept only") — this is a **classification** sub-task, directly feeds the Vulnerability/TEF estimate
- Attack vector category (phishing, RCE, supply chain, etc.) — feeds scenario mapping

**Suggested approach [ASSUMPTION — pick based on team's ML comfort level]:**
- Start with a lightweight approach: regex/rule-based CVE and product extraction + a pretrained NER model (spaCy) for entity extraction — fast to build, defensible baseline.
- Layer in a fine-tuned or prompted classifier (can use a small transformer or even a well-prompted LLM call) for the "exploitation status" and "attack vector category" classification tasks, since these are more semantic and rule-based extraction will underperform.
- Keep a clear evaluation set (even 50–100 hand-labeled advisories) so extraction accuracy can be reported as a number in the write-up — this materially strengthens the "research-worthy" angle.

---

## 9. ML Prediction Engine (Phase 2)

**Purpose:** Predict how an organization's risk exposure will trend, not just report where it is today.

- **Model:** XGBoost regressor (as specified), predicting either (a) next-period Total Annualized Risk Exposure, or (b) probability of a loss event occurring in a given scenario within the next N days.
- **Features:** historical LEF/LM values per scenario, patch latency trends, alert volume trends, CVE disclosure rate for the asset's tech stack, sector-level breach frequency benchmarks, seasonality (e.g., known spikes around tax season, festival-season phishing in India).
- **Training data reality check [ASSUMPTION]:** a single organization's real incident history will almost certainly be too sparse to train on directly. Recommend either (a) training on a **public breach/incident dataset** (e.g., VERIS Community Database, aggregated breach reports) to learn general risk-trend patterns, then applying the model to the organization's current feature vector, or (b) generating a **synthetic time series** with realistic noise/seasonality for demo purposes and being explicit about this limitation in the write-up. Judges/evaluators respond well to honesty about data limitations paired with a clear plan for real deployment.
- **Output:** a trend line/forecast band shown alongside the current exposure figure on the dashboard.

---

## 10. Optimization Engine (Phase 3)

**Purpose:** Given a fixed security budget, recommend which controls to fund to maximize risk reduction.

- **Formulation:** a **knapsack-style constrained optimization problem.**
  - Decision variables: binary/fractional investment in each candidate control (e.g., "deploy MFA org-wide," "patch management tooling," "EDR upgrade," "security awareness training").
  - Objective: maximize `Σ (risk reduction_i × control_i)` subject to `Σ (cost_i × control_i) ≤ Budget`.
  - Risk reduction per control estimated by re-running the FAIR engine with the control's expected effect on `Vulnerability` or `secondary_loss_multiplier` and taking the delta in Total Annualized Risk Exposure.
- **Tooling:** Google OR-Tools (CP-SAT solver or the linear/MIP solver) as specified — this is a well-scoped, well-documented use of OR-Tools and a strong "technically substantial" component for evaluation.
- **Output:** a ranked list of recommended investments with cost, expected ₹ risk reduction, and "risk reduction per rupee" efficiency score — this is the single most boardroom-friendly artifact CyberPulse produces.

---

## 11. Dashboard Requirements

| Screen | Contents | Priority |
|---|---|---|
| **Overview** | Total Annualized Risk Exposure (₹), trend sparkline, top 5 risk scenarios by ₹ exposure | Phase 1 |
| **Risk Scenario Detail** | LEF/LM breakdown for a single scenario, contributing factors, data sources feeding it | Phase 1 |
| **Trend & Prediction** | Historical exposure over time + XGBoost forecast band | Phase 2 |
| **Threat Feed** | Recent advisories/CVEs, NLP-extracted structured fields, relevance to org's asset inventory | Phase 2 |
| **Budget Recommendation** | Ranked control investments, cost vs. risk-reduction chart, "what if" slider to change budget and see recommendation update | Phase 3 |
| **Admin / Config** | Tunable FAIR weights, asset inventory management, data source connections | Phase 1 (basic), expanded later |

**Non-negotiable UX principle:** every number shown must be clickable/expandable down to "here's exactly how we calculated this" — this is both good product design and directly supports the "explainable, research-worthy" requirement.

---

## 12. Phased Roadmap

### Phase 1 — Quantitative Risk Core (MVP) — *Buildability priority*
- [ ] Define 8–12 representative risk scenarios for a sample organization
- [ ] Build asset inventory + manual/CSV vulnerability data ingestion
- [ ] Implement FAIR engine (LEF × LM, with tunable weights per §6)
- [ ] Build Overview + Risk Scenario Detail dashboard screens
- [ ] Demo: raw CSV in → ₹ risk exposure out, fully explainable

### Phase 2 — Intelligence Layer
- [ ] Integrate NVD/CISA KEV live feeds
- [ ] Build NLP extraction pipeline for advisories/news (regex+NER baseline, then classifier layer)
- [ ] Train XGBoost prediction model (public dataset + org feature vector)
- [ ] Add Trend & Prediction and Threat Feed dashboard screens

### Phase 3 — Optimization Layer
- [ ] Define candidate control library with cost + effectiveness estimates
- [ ] Implement OR-Tools budget optimizer
- [ ] Add Budget Recommendation screen with interactive "what-if" budget slider
- [ ] End-to-end demo: threat lands → risk recalculates → prediction updates → budget recommendation adjusts

### Phase 4 — Stretch Goals (post-core, only if time permits)
- Monte Carlo FAIR (full distribution-based estimation instead of point estimates)
- Multi-tenant support (multiple organizations)
- Real SIEM/EDR connector (e.g., Wazuh, Elastic) instead of file import
- Automated control-effectiveness calibration from historical data instead of static estimates

---

## 13. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Explainability** | Every computed number must trace to its formula and inputs (§11 principle) |
| **Configurability** | FAIR weights, control cost/effectiveness estimates must be admin-editable, not hardcoded |
| **Performance** | Dashboard interactions <2s for a sample org with up to ~500 assets / ~50 scenarios |
| **Data handling** | No real PII/production credentials in Phase 1–2 demo data; synthetic/sample data only |
| **Portability** | Should run locally / on a single demo server — no dependency on paid cloud infra for the core demo |
| **Auditability** | Historical risk calculations should be versioned/timestamped, not just showing the latest number |

---

## 14. Suggested Tech Stack

**[ASSUMPTION — adjust to team's existing strengths; this is a reasonable default given the stated ML/optimization requirements]**

| Layer | Suggestion |
|---|---|
| Backend / API | Python (FastAPI) — natural fit given XGBoost, OR-Tools, NLP libraries are all Python-native |
| FAIR engine | Plain Python module, unit-tested independently of the API |
| ML | XGBoost, scikit-learn for preprocessing |
| NLP | spaCy (NER) + a lightweight classifier or prompted LLM call for semantic extraction tasks |
| Optimization | Google OR-Tools (CP-SAT) |
| Database | PostgreSQL (structured risk/asset data) |
| Frontend | React + a charting library (Recharts/Chart.js) for dashboard |
| Data ingestion | Scheduled Python jobs (APScheduler or simple cron) pulling NVD/CISA/RSS feeds |

---

## 15. Success Metrics

| Metric | Target |
|---|---|
| Demo completeness | Full pipeline (raw data → ₹ risk → prediction → budget rec.) runs end-to-end without manual intervention |
| Explainability | 100% of dashboard figures have a visible "how this was calculated" trace |
| NLP extraction accuracy | Reportable precision/recall on a hand-labeled evaluation set (target: document the number, not a specific threshold — the honesty of reporting matters more than hitting an arbitrary bar) |
| Prediction usefulness | Forecast direction (risk rising/falling) correct against held-out historical/synthetic data more often than a naive baseline (e.g., "assume no change") |
| Optimization correctness | Optimizer output is verifiably optimal (or near-optimal with documented gap) for the given budget constraint — testable directly since OR-Tools reports solver status |

---

## 16. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| No access to real organizational data | Build a well-documented synthetic org (assets, vuln history, incident history) — treat this as a first-class deliverable, not an afterthought |
| FAIR weight estimates feel arbitrary to evaluators | Cite public benchmarks (Verizon DBIR, IBM Cost of a Data Breach) for every default constant used; make all weights visibly configurable |
| Scope creep across 3 phases | Hard-gate: Phase 2 work does not start until Phase 1 demo runs cleanly end-to-end |
| ML model looks like a "black box bolted on" | Keep XGBoost feature importances visible in the dashboard/write-up — ties back to the explainability principle |
| Optimization results feel disconnected from the FAIR engine | Make sure control effectiveness deltas are computed *by re-running the same FAIR engine*, not a separate ad hoc scoring function |

---

## 17. Open Questions for the Team

1. What's the actual build timeline — a hackathon sprint, a semester-long capstone, or both (hackathon MVP first, expanded for capstone submission)?
2. Team size and skill split — who owns NLP/ML vs. backend/FAIR engine vs. frontend/dashboard vs. OR-Tools optimization?
3. Is this being positioned for SIH submission specifically (in which case alignment to a specific problem statement's exact wording matters — see prior conversation on PS 26105), for a standalone capstone, or both?
4. Should Phase 1's risk scenarios be generic (any org) or tailored to a specific sector (e.g., Indian fintech/healthcare) to sharpen the "why this matters" narrative?

---

*End of PRD v1.0 — ready for section-by-section refinement. Flag any assumption above that's wrong and I'll adjust the doc directly rather than regenerating it from scratch.*
