# ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation & Defense Optimizer
## Master Product Requirements Document (PRD) & Technical Specification
**Academic Year:** 2025–2026 | **Degree Program:** B.Tech in Computer Science & Engineering / Information Security  
**Document Version:** 1.0.0-PROD | **Status:** Approved Baseline Architecture  
**Author / Engineering Team:** Saurabh Girase & Project Research Group (ZK-PACE Research Consortium)  

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Objectives](#3-objectives)
4. [Target Users & Personas](#4-target-users--personas)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [System Architecture](#7-system-architecture)
8. [Data Architecture](#8-data-architecture)
9. [Data Sources](#9-data-sources)
10. [Data Schema (PostgreSQL Relational & Neo4j Cypher)](#10-data-schema)
11. [Risk Calculation Methodology (FAIR Quantitative Framework)](#11-risk-calculation-methodology)
12. [Machine Learning Methodology (XGBoost & SHAP)](#12-machine-learning-methodology)
13. [NLP & Information Extraction Pipeline](#13-nlp--information-extraction-pipeline)
14. [Graph Model & Attack Path Ontology](#14-graph-model--attack-path-ontology)
15. [Financial Risk Engine & Monte Carlo Simulation](#15-financial-risk-engine--monte-carlo-simulation)
16. [What-If Analysis Engine](#16-what-if-analysis-engine)
17. [Investment Optimization Engine (Google OR-Tools MILP)](#17-investment-optimization-engine)
18. [Dashboard Requirements & UI/UX Specifications](#18-dashboard-requirements--uiux-specifications)
19. [API Requirements & OpenAPI Schema](#19-api-requirements)
20. [Technology Stack](#20-technology-stack)
21. [Security, Governance & Privacy Requirements](#21-security-governance--privacy-requirements)
22. [Data Quality, Lineage & Provenance](#22-data-quality-lineage--provenance)
23. [Minimum Viable Product (MVP) Scope](#23-minimum-viable-product-mvp-scope)
24. [Advanced & Phase-2 Scope (Temporal GNN & Audit Trail)](#24-advanced--phase-2-scope)
25. [Testing, Benchmarking & Evaluation Metrics](#25-testing-benchmarking--evaluation-metrics)
26. [24-Week Development Roadmap (Semester Plan)](#26-24-week-development-roadmap)
27. [Expected Outcomes & Academic Deliverables](#27-expected-outcomes--academic-deliverables)
28. [Assumptions & Limitations](#28-assumptions--limitations)
29. [Future Research Directions](#29-future-research-directions)

---

## 1. Executive Summary

Enterprise cybersecurity management has long been crippled by subjective, qualitative risk categorizations ("High / Medium / Low" or 5x5 color-coded heatmaps). These ordinal constructs fail to inform capital budget allocation, cannot communicate exposure to Boards of Directors in fiduciary terms, and introduce substantial cognitive bias into security prioritization.

**CyberPulse** is an enterprise-grade cyber risk quantification (CRQ) and continuous investment optimization platform designed and implemented as an undergraduate engineering capstone. CyberPulse synthesizes:
1. **Automated Threat & Vulnerability Ingestion**: Continuous normalization of real-world feeds (NIST NVD, CISA KEV, CERT-In, MITRE ATT&CK).
2. **FAIR-Inspired Probabilistic Risk Quantification**: Conversion of threat frequencies and capability distributions into financial distributions (Expected Annual Loss, 95% Value at Risk, and Conditional Value at Risk) via $10^4$–$10^5$ Monte Carlo trials.
3. **Machine Learning Predictive Risk Surrogate**: High-dimensional XGBoost regression calibrated against empirical cyber breach loss datasets ($N=1,902$ real breach events), explained via local and global TreeSHAP attribution.
4. **Graph-Theoretic Attack Traversal**: A Neo4j labeled property graph capturing transitive dependencies: Threat Actor $\to$ Campaign $\to$ MITRE Technique $\to$ CVE Vulnerability $\to$ Infrastructure Product $\to$ Organizational Asset $\to$ Business Service.
5. **Constrained Capital Optimization**: A Google OR-Tools Mixed-Integer Linear Programming (MILP) engine that resolves the 0-1 Multi-Choice Knapsack problem, computing the mathematically optimal security control portfolio for any given capital expenditure constraint to maximize Return on Security Investment (ROSI).

By grounding theoretical modeling in empirical incident statistics and automated mathematical optimization, CyberPulse transitions cyber defense from a reactive compliance exercise into a deterministic financial engineering discipline.

---

## 2. Problem Statement

### 2.1 The Failure of Qualitative Risk Matrices
Current industry risk methodologies (e.g., standard NIST SP 800-30 qualitative scoring, ISO 27005 basic scoring) assign arbitrary ordinal numbers (e.g., Likelihood = 4, Impact = 3 $\implies$ Risk = 12). Mathematical operations on ordinal numbers are fundamentally invalid (multiplication of non-interval numbers violates measurement theory). Two risks scoring "12" may differ in true economic impact by multiple orders of magnitude.

### 2.2 Lack of Financial Defensibility in Security Budgeting
Chief Information Security Officers (CISOs) struggle to justify multimillion-dollar tooling requests to Chief Financial Officers (CFOs). Without quantifying how a $500,000 Zero-Trust Identity deployment compresses expected tail losses ($\text{VaR}_{95}$), security investments are perceived as cost sinks rather than risk-reduction capital investments.

### 2.3 Static Disconnection from Threat Telemetry
Enterprise risk registers are traditionally updated annually via static spreadsheets. Meanwhile, threat actors weaponize new vulnerabilities (e.g., CISA KEV additions) within 48 to 72 hours of public disclosure. Risk platforms must continuously recalculate financial risk in real time upon ingest of new vulnerability intelligence.

### 2.4 Suboptimal Control Selection Under Tight Budgets
Security leaders are presented with hundreds of vendor products. Without mathematical optimization, security leaders adopt fragmented, overlapping point solutions that leave critical attack vectors underfunded while over-allocating capital to redundant controls.

---

## 3. Objectives

The primary technical and research objectives for CyberPulse are:
1. **Automated Continuous Threat ETL**: Ingest, parse, deduplicate, and validate vulnerability and incident data from $\ge 4$ authoritative sources preserving raw provenance.
2. **Probabilistic Financial Translation**: Implement a vector-calibrated FAIR mathematical engine yielding Expected Annual Loss ($\text{EAL}$), Value at Risk ($\text{VaR}_{\alpha}$), and Conditional Value at Risk ($\text{CVaR}_{\alpha}$) through Monte Carlo simulation ($10,000$ iterations in $< 1.5$ seconds).
3. **ML Risk Estimation & Interpretability**: Train an XGBoost regression model on empirical breach losses achieving $R^2 \ge 0.82$, integrated with TreeSHAP to expose exact feature importance waterfalls (CVSS, control strength, asset criticality, attack vector) for every scenario.
4. **Ontological Graph Traversal**: Construct a Neo4j property graph mapping transitive threat-to-asset pathways with $k$-hop shortest path traversals to uncover hidden single-points-of-failure.
5. **Exact Budget Optimization**: Formulate and solve a 0-1 Knapsack / Mixed Integer Linear Program using Google OR-Tools yielding the provably optimal security control combination under any designated capital ceiling in $< 200$ milliseconds.
6. **Unified Dual-Format Delivery**: Provide both an executive interactive dashboard with real-time what-if scenario levers and an academically rigorous, inspectable technical documentation suite.

---

## 4. Target Users & Personas

| Persona | Role & Focus | Primary Workflow | Key Metrics of Interest |
| :--- | :--- | :--- | :--- |
| **CISO / Board Director** | Fiduciary governance, budget defense, regulatory liability. | Reviews macro enterprise exposure, executes Board Brief generation, evaluates capital requests. | Aggregate EAL, 1-Year 95% VaR, Capital Budget Delta, Portfolio ROSI (%). |
| **Enterprise Risk Manager (CRO)** | Auditability, compliance (RBI, DPDP, SEC, DORA), risk register integrity. | Validates parameter distributions, tracks empirical provenance, reviews scenario calibration history. | Loss Exceedance Curves (LEC), Tail Risk (CVaR), Beta-PERT parameters, Data Lineage. |
| **Security Architect / SecOps** | Vulnerability remediation, control implementation, attack chain mitigation. | Analyzes CVE-to-asset bindings, ingests real-time CISA KEV feeds, simulates control effectiveness. | Threat Capability vs. Resistance Strength, Vulnerability $P(\text{TCap} > \text{RS})$, Attack Vector Path. |
| **Academic Evaluator / Faculty** | Research validity, mathematical soundess, engineering rigor. | Inspects formula derivations, reviews Monte Carlo convergence rates, validates SHAP attributions and OR-Tools proofs. | Convergence epsilon $\epsilon \le 0.01$, $R^2$/RMSE metrics, Simplex/Branch-and-Bound optimality. |

---

## 5. Functional Requirements

### Module 1: Continuous Data Ingestion & Normalization
- **FR-1.1 (Multi-Source Parsing)**: Support raw streaming and batch ingestion of JSON (CISA KEV, NVD 2.0 API), CSV (historical breach loss data), STIX/TAXII 2.1 (threat intel), and HTML/Advisories (CERT-In).
- **FR-1.2 (Raw Invariant Storage)**: Store all incoming feeds immutably in their raw native format with cryptographic SHA-256 ingestion checksums and timestamps before transformation.
- **FR-1.3 (Canonical Transformation)**: Normalize heterogeneous feeds into unified CyberPulse schemas (`ThreatActor`, `Vulnerability`, `IncidentRecord`, `Asset`).
- **FR-1.4 (Deduplication)**: Enforce canonical primary key indexing on CVE identifiers, MITRE technique IDs, and organization domain records.

### Module 2: FAIR Probabilistic Quantitative Risk Engine
- **FR-2.1 (Parameter Elicitation & Bound Setup)**: Accept parametric inputs for Threat Event Frequency ($\text{TEF}$), Threat Capability ($\text{TCap}$), Control Resistance Strength ($\text{RS}$), and Primary/Secondary Loss forms.
- **FR-2.2 (Monte Carlo Simulation)**: Execute pseudo-random Monte Carlo sampling across Beta-PERT and Lognormal distributions for $10,000$ to $100,000$ iterations.
- **FR-2.3 (Metrics Computation)**: Compute and display:
  - Mean Loss = Expected Annual Loss ($\text{EAL}$)
  - 90th, 95th, 99th percentile Value at Risk ($\text{VaR}_{90}, \text{VaR}_{95}, \text{VaR}_{99}$)
  - Conditional Value at Risk ($\text{CVaR}_{95}$ / Expected Shortfall)
- **FR-2.4 (Empirical Calibration)**: Provide one-click calibration of scenario loss magnitude using median and 90th percentile parameters derived from the 1,902-incident historical empirical dataset.

### Module 3: Machine Learning & Explainability Engine
- **FR-3.1 (Surrogate Prediction)**: Given asset, threat, and control attributes, predict estimated annualized financial loss using a trained XGBoost regressor.
- **FR-3.2 (SHAP Local Explanation)**: Compute exact Shapley values ($\phi_i$) for individual risk scenarios to render force plots and waterfall charts showing positive and negative risk contributors.
- **FR-3.3 (SHAP Global Feature Importance)**: Aggregate mean absolute Shapley values ($E[|\phi_i|]$) across all scenarios to highlight enterprise-wide vulnerability drivers.

### Module 4: Graph-Theoretic Threat Ontology (Neo4j)
- **FR-4.1 (Relationship Modeling)**: Persist and query multi-hop relationships between `ThreatActor`, `Campaign`, `MitreTechnique`, `Vulnerability`, `Product`, `Asset`, and `BusinessProcess`.
- **FR-4.2 (Shortest Attack Path)**: Query transitive traversal paths from external adversary nodes to crown-jewel assets.
- **FR-4.3 (Blast Radius Computation)**: Calculate total financial risk exposure downstream of a compromised asset or vulnerable software package.

### Module 5: Google OR-Tools Investment Optimizer
- **FR-5.1 (Constrained Knapsack Formulation)**: Formulate the optimal control selection problem subject to an upper budget bound $B$ and mutual exclusion constraints between competing vendor tiers.
- **FR-5.2 (ROSI Calculation)**: Calculate and rank candidate portfolios by Return on Security Investment:
  $$\text{ROSI} = \frac{\Delta \text{EAL} - \text{Annualized Control Cost}}{\text{Annualized Control Cost}} \times 100\%$$
- **FR-5.3 (Pareto Frontier Generation)**: Compute the efficient frontier of risk reduction across a range of budget increments ($0$ to $150\%$ of target budget).

### Module 6: Interactive Decision Support & Reporting
- **FR-6.1 (What-If Interactive Levers)**: Allow real-time slider manipulation of control strength, threat frequency, and asset value with immediate dynamic delta recalculation.
- **FR-6.2 (Executive Board Brief)**: Generate audit-grade, C-suite summary briefs containing loss exceedance charts, ROI justifications, and statutory compliance status (DPDP/RBI/SEC).
- **FR-6.3 (Dual-Currency Support)**: Display all financial parameters seamlessly in both USD ($) and INR (₹) using real-time foreign exchange conversion constants.

---

## 6. Non-Functional Requirements

| Metric | Target Specification | Validation Method |
| :--- | :--- | :--- |
| **Simulation Latency** | $10,000$ iterations completed in $\le 1,200\text{ ms}$; $100,000$ iterations in $\le 5,000\text{ ms}$. | Automated benchmark with Python `time.perf_counter()` over 50 consecutive runs. |
| **Optimization Latency** | OR-Tools MILP solution for $\le 50$ controls completed in $\le 250\text{ ms}$. | API response timing for `/api/optimize-budget`. |
| **UI Responsiveness** | First Contentful Paint (FCP) $\le 0.8\text{ s}$; Time to Interactive (TTI) $\le 1.4\text{ s}$. | Google Lighthouse audit score $\ge 92$. |
| **Data Integrity & Lineage** | 100% immutable raw audit trail; zero data loss during normalization. | Cryptographic SHA-256 hash validation before and after staging. |
| **Concurrent Users** | Support $\ge 50$ concurrent simulation runs without thread exhaustion. | Locust load testing running on multi-worker Uvicorn backend. |
| **Platform Portability** | Containerized execution via Docker and Docker Compose across Linux, macOS, and Windows WSL2. | Automated CI build pipeline on clean Ubuntu 22.04 LTS runners. |

---

## 7. System Architecture

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              PRESENTATION TIER (Next.js / React)                       │
│  ┌───────────────────────┬────────────────────────┬────────────────────────────────┐  │
│  │ Executive Dashboard   │ Scenario FAIR Sandbox  │ Investment Optimizer (OR-Tools)│  │
│  ├───────────────────────┼────────────────────────┼────────────────────────────────┤  │
│  │ Threat Feed & Scraper │ Real Dataset Explorer  │ Academic PRD & Spec Reader     │  │
│  └───────────────────────┴────────────────────────┴────────────────────────────────┘  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTPS / JSON / WebSockets
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          APPLICATION & API TIER (FastAPI / Node.js)                    │
│  ├── Ingestion & Normalization Worker (Pandas / Asyncio)                               │
│  ├── FAIR Monte Carlo Vectorized Engine (NumPy / SciPy)                                │
│  ├── Machine Learning Risk Inference & SHAP Explainer (XGBoost / TreeSHAP)             │
│  ├── Constrained Optimization Solver (Google OR-Tools MILP)                            │
│  └── Graph Traversal Query Manager (Neo4j Cypher Driver)                               │
└──────────────────────┬───────────────────────────────────┬─────────────────────────────┘
                       │                                   │
                       ▼                                   ▼
┌─────────────────────────────────────────┐  ┌───────────────────────────────────────────┐
│     RELATIONAL DATA STORE (PostgreSQL)  │  │        GRAPH ONTOLOGY STORE (Neo4j)       │
│  ├── Organization & Asset Inventories   │  │  ├── (:ThreatActor)-[:LAUNCHES]->(:Camp)  │
│  ├── CISA KEV, NVD CVEs & Threat Feeds  │  │  ├── (:Campaign)-[:USES]->(:Technique)    │
│  ├── Historical Breaches & Loss Records │  │  ├── (:Technique)-[:EXPLOITS]->(:CVE)     │
│  └── Simulation Runs & Control Catalog  │  │  └── (:CVE)-[:TARGETS]->(:Asset)          │
└─────────────────────────────────────────┘  └───────────────────────────────────────────┘
```

---

## 8. Data Architecture

CyberPulse employs a modern **Medallion Data Lakehouse Architecture** tailored for cybersecurity risk analytics:

```
[External Feeds: CISA KEV, NVD, MITRE, CERT-In, Incidents]
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│ BRONZE LAYER (Raw Ingestion Zone)                                    │
│ - Immutable landing: raw JSON, CSV, RSS XML, STIX 2.1 bundles        │
│ - Ingestion metadata: source_url, ingest_timestamp, sha256_hash      │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ Normalization, Deduplication, Regex
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ SILVER LAYER (Normalized & Validated Relational Schema)              │
│ - Clean tabular schemas in PostgreSQL                                │
│ - Standardized keys: CVE-YYYY-NNNN, MITRE T1059, ISO-4217 Currency   │
│ - Cross-source record linkages and deduplicated incident entries     │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │ Feature Extraction & Graph Projection
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│ GOLD LAYER (Analytics & Graph Feature Store)                         │
│ - Neo4j Attack Path Topology and Transitive Reachability Matrices    │
│ - Vectorized FAIR parameter tensors for Monte Carlo simulations       │
│ - Clean feature matrix (NumPy/Pandas) for XGBoost inference and SHAP │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 9. Data Sources

| # | Data Source | Ingest Mechanism | Frequency | Primary Entities & Attributes Extracted |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **CISA Known Exploited Vulnerabilities (KEV)** | JSON REST API (`cisa.gov`) | Hourly / On-demand | `cveID`, `vendorProject`, `product`, `vulnerabilityName`, `dateAdded`, `shortDescription`, `knownRansomwareCampaignUse`. |
| **2** | **NIST National Vulnerability Database (NVD)** | REST API 2.0 (`services.nvd.nist.gov`) | Daily / Webhook | `cveId`, `cvssV3_score`, `cvssV3_vector`, `exploitabilityScore`, `impactScore`, `cweId`, `publishedDate`. |
| **3** | **CERT-In Security Advisories** | RSS / Web Scraper | Real-time / Daily | `advisoryId`, `targetSector`, `affectedSystems`, `threatSeverity`, `remediationGuidelines`. |
| **4** | **MITRE ATT&CK Enterprise Matrix** | STIX 2.1 JSON / TAXII | Weekly | `techniqueId`, `tacticName`, `detectionMechanism`, `mitigationId`, `subTechniqueOf`. |
| **5** | **Abuse.ch ThreatFox & Feodo Tracker** | JSON Streaming API | Real-time (15 min) | `iocValue`, `iocType`, `threatType`, `malwareAlias`, `confidenceLevel`. |
| **6** | **Empirical Cyber Breach Loss Dataset** | Static Curated CSV ($N=1,902$) | Batch / Baseline | `IncidentID`, `Organization`, `Date`, `AttackVector`, `DamageLossUSD`, `RecoveryCostUSD`, `DowntimeDurationHours`. |
| **7** | **Enterprise Asset & Security Controls** | Synthetic / Organization Config | Configurable | `AssetID`, `BusinessCriticality`, `ReplacementCost`, `CandidateControls`, `AnnualCost`, `ControlMaturity`. |

---

## 10. Data Schema

### 10.1 Relational Schema (PostgreSQL DDL)

```sql
-- 1. Organizations & Profiles
CREATE TABLE organizations (
    org_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    annual_revenue_usd NUMERIC(15, 2) NOT NULL,
    assets_monitored INT NOT NULL,
    critical_databases INT NOT NULL,
    cloud_workloads INT NOT NULL,
    compliance_framework VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Enterprise Monitored Assets
CREATE TABLE enterprise_assets (
    asset_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(org_id) ON DELETE CASCADE,
    asset_name VARCHAR(255) NOT NULL,
    asset_category VARCHAR(100) NOT NULL, -- Database, Web Server, Payment Gateway
    ip_or_hostname VARCHAR(255),
    criticality_tier VARCHAR(20) CHECK (criticality_tier IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    asset_value_usd NUMERIC(12, 2) NOT NULL,
    hourly_downtime_cost_usd NUMERIC(10, 2) NOT NULL
);

-- 3. Normalized Known Vulnerabilities (NVD + CISA KEV)
CREATE TABLE vulnerabilities (
    cve_id VARCHAR(50) PRIMARY KEY, -- e.g. CVE-2024-3400
    vendor_project VARCHAR(150),
    product VARCHAR(150),
    vulnerability_name VARCHAR(255),
    short_description TEXT,
    cvss_v3_score NUMERIC(3, 1),
    cvss_vector VARCHAR(150),
    cwe_id VARCHAR(50),
    is_actively_exploited BOOLEAN DEFAULT FALSE,
    date_added_kev DATE,
    source_provenance VARCHAR(100) NOT NULL
);

-- 4. Historical Incident Ground Truth (Empirical Loss Calibration)
CREATE TABLE historical_incidents (
    incident_id VARCHAR(50) PRIMARY KEY,
    organization_name VARCHAR(255),
    incident_date DATE,
    attack_vector VARCHAR(100) NOT NULL,
    vulnerability_exploited VARCHAR(255),
    threat_actor VARCHAR(150),
    damage_loss_usd NUMERIC(15, 2),
    recovery_cost_usd NUMERIC(15, 2),
    downtime_hours NUMERIC(8, 2),
    regulatory_fines_usd NUMERIC(15, 2),
    verification_source VARCHAR(255)
);

-- 5. Candidate Security Controls & Countermeasures
CREATE TABLE security_controls (
    control_id VARCHAR(50) PRIMARY KEY, -- e.g. CTRL-EDR-01
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    implementation_cost_usd NUMERIC(12, 2) NOT NULL,
    annual_maintenance_usd NUMERIC(12, 2) NOT NULL,
    effectiveness_pct NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    targeted_vector VARCHAR(100) NOT NULL,
    targeted_mitre_technique VARCHAR(50)
);

-- 6. FAIR Simulation Execution Runs
CREATE TABLE simulation_runs (
    run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(org_id),
    scenario_id VARCHAR(100) NOT NULL,
    iterations INT NOT NULL DEFAULT 10000,
    expected_annual_loss_usd NUMERIC(15, 2) NOT NULL,
    var_90_usd NUMERIC(15, 2) NOT NULL,
    var_95_usd NUMERIC(15, 2) NOT NULL,
    var_99_usd NUMERIC(15, 2) NOT NULL,
    cvar_95_usd NUMERIC(15, 2) NOT NULL,
    execution_time_ms INT NOT NULL,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 10.2 Graph Ontology Schema (Neo4j Cypher)

```cypher
// Constraint Creation
CREATE CONSTRAINT unique_threat_actor IF NOT EXISTS FOR (t:ThreatActor) REQUIRE t.name IS UNIQUE;
CREATE CONSTRAINT unique_campaign IF NOT EXISTS FOR (c:Campaign) REQUIRE c.id IS UNIQUE;
CREATE CONSTRAINT unique_technique IF NOT EXISTS FOR (m:MitreTechnique) REQUIRE m.technique_id IS UNIQUE;
CREATE CONSTRAINT unique_cve IF NOT EXISTS FOR (v:Vulnerability) REQUIRE v.cve_id IS UNIQUE;
CREATE CONSTRAINT unique_product IF NOT EXISTS FOR (p:Product) REQUIRE p.cpe IS UNIQUE;
CREATE CONSTRAINT unique_asset IF NOT EXISTS FOR (a:Asset) REQUIRE a.asset_id IS UNIQUE;
CREATE CONSTRAINT unique_process IF NOT EXISTS FOR (b:BusinessProcess) REQUIRE b.id IS UNIQUE;

// Relationship Graph Topology
// (ThreatActor)-[:CONDUCTS]->(Campaign)
// (Campaign)-[:UTILIZES]->(MitreTechnique)
// (MitreTechnique)-[:EXPLOITS]->(Vulnerability)
// (Vulnerability)-[:PRESENT_IN]->(Product)
// (Product)-[:HOSTED_ON]->(Asset)
// (Asset)-[:SUPPORTS]->(BusinessProcess)
```

---

## 11. Risk Calculation Methodology

CyberPulse strictly implements the **Factor Analysis of Information Risk (FAIR™)** taxonomy as an open mathematical specification:

```
                               ┌────────────────────────────────────────┐
                               │           CYBER RISK (EAL / VaR)       │
                               └───────────────────┬────────────────────┘
                                                   │
                   ┌───────────────────────────────┴───────────────────────────────┐
                   ▼                                                               ▼
        ┌──────────────────────┐                                       ┌──────────────────────┐
        │ LOSS EVENT FREQ (LEF)│                                       │  LOSS MAGNITUDE (LM) │
        └──────────┬───────────┘                                       └──────────┬───────────┘
                   │                                                              │
         ┌─────────┴─────────┐                                          ┌─────────┴─────────┐
         ▼                   ▼                                          ▼                   ▼
    ┌──────────┐       ┌───────────┐                              ┌──────────┐        ┌───────────┐
    │TEF (Beta)│       │VULN P(T>C)│                              │ PRIMARY  │        │ SECONDARY │
    └──────────┘       └─────┬─────┘                              │   LOSS   │        │   LOSS    │
                             │                                    └──────────┘        └───────────┘
                    ┌────────┴────────┐
                    ▼                 ▼
             ┌─────────────┐   ┌─────────────┐
             │TCap (0 to 1)│   │ RS (0 to 1) │
             └─────────────┘   └─────────────┘
```

### 11.1 Threat Event Frequency ($\text{TEF}$)
Modeled as a continuous random variable distributed according to a **Beta-PERT distribution**:
$$\text{TEF} \sim \text{PERT}(a_{\text{tef}}, m_{\text{tef}}, b_{\text{tef}})$$
Where:
- $a_{\text{tef}}$ = Minimum annual threat action frequency.
- $m_{\text{tef}}$ = Most likely annual frequency (empirically derived from threat feeds).
- $b_{\text{tef}}$ = Maximum credible annual frequency.

### 11.2 Threat Capability ($\text{TCap}$) and Resistance Strength ($\text{RS}$)
Both variables are parameterized in the interval $[0.0, 1.0]$:
$$\text{TCap} \sim \text{Beta}(\alpha_{\text{tcap}}, \beta_{\text{tcap}})$$
$$\text{RS} \sim \text{Beta}(\alpha_{\text{rs}}, \beta_{\text{rs}})$$

### 11.3 Vulnerability ($\text{Vuln}$)
Vulnerability is defined in FAIR as the conditional probability that an active Threat Event results in a Loss Event:
$$\text{Vuln} = P(\text{TCap} > \text{RS})$$
In single trial $k$:
$$\mathbb{I}_k = \begin{cases} 1 & \text{if } \text{TCap}_k > \text{RS}_k \\ 0 & \text{otherwise} \end{cases}$$

### 11.4 Loss Event Frequency ($\text{LEF}$)
For simulation period $T$ (1 year), the realized count of breach events $N_{\text{events}}$ follows a Poisson or Binomial compound process:
$$\text{LEF}_k = \text{Poisson}(\lambda = \text{TEF}_k \times \mathbb{I}_k)$$

### 11.5 Loss Magnitude ($\text{LM}$)
Loss Magnitude is partitioned into non-overlapping direct (primary) and collateral (secondary) economic impacts:
$$\text{LM} = \text{Primary Loss} + \text{Secondary Loss}$$

1. **Primary Loss**: Direct internal outlays:
   $$\text{Loss}_{\text{primary}} = L_{\text{IR}} + L_{\text{Downtime}} + L_{\text{Recovery}}$$
   Where $L_{\text{Downtime}} = \text{DowntimeHours} \times \text{CostPerHour}$.

2. **Secondary Loss**: Third-party damages, regulatory fines, and reputational churn:
   $$\text{Loss}_{\text{secondary}} = L_{\text{Fines}} + L_{\text{Legal}} + L_{\text{Reputation}}$$

Because financial losses are strictly non-negative and right-skewed with heavy tails, primary and secondary magnitudes are sampled via a **Lognormal distribution**:
$$L \sim \text{Lognormal}(\mu_{\ln}, \sigma_{\ln}^2)$$
Derived from low (10th percentile $P_{10}$) and high (90th percentile $P_{90}$) confidence bounds:
$$\mu_{\ln} = \frac{\ln(P_{10}) + \ln(P_{90})}{2}$$
$$\sigma_{\ln} = \frac{\ln(P_{90}) - \ln(P_{10})}{2 \times 1.28155}$$

### 11.6 Metrics Formulation
Given $K = 10,000$ simulated annual loss draws $\{X_1, X_2, \dots, X_K\}$:
1. **Expected Annual Loss ($\text{EAL}$)**:
   $$\text{EAL} = \frac{1}{K} \sum_{k=1}^K X_k$$
2. **Value at Risk ($\text{VaR}_{\alpha}$)**:
   $$\text{VaR}_{\alpha} = F_X^{-1}(\alpha) = \inf \{x \in \mathbb{R} : P(X \le x) \ge \alpha\}$$
   (e.g., $\text{VaR}_{95}$ is the 95th percentile of the sorted annual loss array).
3. **Conditional Value at Risk ($\text{CVaR}_{\alpha}$ / Expected Shortfall)**:
   $$\text{CVaR}_{\alpha} = \mathbb{E}[X \mid X \ge \text{VaR}_{\alpha}] = \frac{1}{\lfloor K(1-\alpha) \rfloor} \sum_{k: X_k \ge \text{VaR}_{\alpha}} X_k$$

---

## 12. Machine Learning Methodology

### 12.1 Purpose of Machine Learning in CyberPulse
In adherence to core architectural principles, **machine learning does not replace the FAIR mathematical framework**. Instead, XGBoost serves as an empirical surrogate model that:
1. Predicts annualized financial risk for new, unsimulated attack scenarios where full expert distributions are incomplete.
2. Identifies non-linear feature interactions between CVE CVSS attributes, asset replacement value, and threat actor tactics.
3. Accelerates sensitivity analysis across high-dimensional parameter spaces.

### 12.2 Feature Engineering Pipeline
The feature vector $\mathbf{x} \in \mathbb{R}^{14}$ comprises:
- $x_1$: `cvss_score` (Float, $0.0 - 10.0$)
- $x_2$: `exploitability_score` (Float, $0.0 - 10.0$)
- $x_3$: `is_cisa_kev` (Binary, $\{0, 1\}$)
- $x_4$: `threat_event_frequency` (Float, events/year)
- $x_5$: `threat_capability` (Float, $0.0 - 1.0$)
- $x_6$: `control_resistance_strength` (Float, $0.0 - 1.0$)
- $x_7$: `asset_criticality_weight` (Ordinal, $1 - 5$)
- $x_8$: `asset_replacement_cost_usd` (Log-transformed continuous)
- $x_9$: `hourly_downtime_cost_usd` (Log-transformed continuous)
- $x_{10}$: `attack_vector_encoding` (One-hot: Web, Cloud, Phishing, SupplyChain)
- $x_{11}$: `industry_sector_encoding` (One-hot: FinTech, Healthcare, E-Commerce)
- $x_{12}$: `historical_breach_frequency_in_sector` (Float)
- $x_{13}$: `days_since_vulnerability_disclosed` (Integer)
- $x_{14}$: `known_ransomware_campaign` (Binary, $\{0, 1\}$)

### 12.3 XGBoost Regression Model Formulation
The model minimizes a regularized squared error objective:
$$\mathcal{L}(\theta) = \sum_{i=1}^n \left( y_i - \hat{y}_i \right)^2 + \sum_{m=1}^M \Omega(f_m)$$
Where regularizer $\Omega(f) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^T w_j^2$.
- Objective: `reg:squarederror`
- Learning rate: $\eta = 0.05$
- Max tree depth: $d = 6$
- Subsample ratio: $0.85$
- Target variable $y$: $\log_{10}(\text{Annualized Loss USD} + 1)$ to stabilize variance across orders of magnitude.

### 12.4 Explainability via TreeSHAP
To ensure trust and auditability, CyberPulse implements **TreeSHAP** (Shapley Additive Explanations). For a prediction $\hat{f}(\mathbf{x})$, the Shapley value $\phi_i$ for feature $i$ is:
$$\phi_i(f, \mathbf{x}) = \sum_{S \subseteq F \setminus \{i\}} \frac{|S|!(|F| - |S| - 1)!}{|F|!} \left[ f_x(S \cup \{i\}) - f_x(S) \right]$$
The platform renders:
1. **Local Waterfall Charts**: Showing base risk $E[f(x)]$ adjusted by positive (risk-amplifying) and negative (risk-mitigating) components to arrive at the final scenario EAL.
2. **Global Feature Summary**: Highlighting that `control_resistance_strength`, `is_cisa_kev`, and `asset_replacement_cost_usd` represent $\ge 68\%$ of global variance in loss outcomes.

---

## 13. NLP & Information Extraction Pipeline

Unstructured text from CERT-In advisories, security blogs, and vendor bulletins is parsed using an automated NLP extraction pipeline:

```
[Unstructured Security Advisory Text]
                │
                ▼
┌────────────────────────────────────────────────────────┐
│ PREPROCESSING & CLEANING                               │
│ - Strip HTML/PDF formatting, normalize Unicode, token  │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ HYBRID NAMED ENTITY RECOGNITION (NER) & REGEX          │
│ - spaCy fine-tuned on cybersecurity corpus (SecBERT)   │
│ - Regex patterns for CVE-YYYY-NNNN, CWE-NNN, IP/URLs   │
│ - MITRE ATT&CK technique extraction (T1059, T1190)     │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ ENTITY CANONICALIZATION & ENRICHMENT                   │
│ - Threat Actor aliases (e.g. APT29 = Midnight Blizzard)│
│ - CVSS score auto-resolution via NVD 2.0 API           │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
[Structured Relational Entity + Neo4j Graph Injection]
```

---

## 14. Graph Model & Attack Path Ontology

### 14.1 Graph Metamodel
The Neo4j ontology explicitly captures the transitive propagation of cyber risk:
- **`(:ThreatActor)`**: Attributes: `name`, `origin`, `motivation`, `sophistication_tier`.
- **`(:Campaign)`**: Attributes: `campaign_id`, `start_date`, `active_status`.
- **`(:MitreTechnique)`**: Attributes: `technique_id`, `tactic`, `detection_surface`.
- **`(:Vulnerability)`**: Attributes: `cve_id`, `cvss_score`, `epss_score`, `is_kev`.
- **`(:Product)`**: Attributes: `vendor`, `product_name`, `cpe_uri`, `version`.
- **`(:Asset)`**: Attributes: `asset_id`, `name`, `criticality`, `financial_value_usd`.
- **`(:BusinessProcess)`**: Attributes: `process_id`, `process_name`, `revenue_generation_per_hr`.

### 14.2 Multi-Hop Cypher Traversal Query
```cypher
// Query to identify all active threat actors capable of reaching Critical Assets
MATCH path = (t:ThreatActor)-[:CONDUCTS]->(c:Campaign)
             -[:UTILIZES]->(m:MitreTechnique)
             -[:EXPLOITS]->(v:Vulnerability)
             -[:PRESENT_IN]->(p:Product)
             -[:HOSTED_ON]->(a:Asset {criticality_tier: 'CRITICAL'})
             -[:SUPPORTS]->(b:BusinessProcess)
WHERE v.is_actively_exploited = true
RETURN t.name AS ThreatActor, 
       c.campaign_id AS Campaign,
       m.technique_id AS Technique,
       v.cve_id AS ExploitedCVE,
       a.asset_name AS TargetAsset,
       b.process_name AS ImpactedService,
       length(path) AS AttackPathHops
ORDER BY a.financial_value_usd DESC;
```

---

## 15. Financial Risk Engine & Monte Carlo Simulation

### 15.1 Vectorized Simulation Algorithm
To achieve sub-second execution speeds without external distributed compute, the simulation engine is implemented using vectorized NumPy routines:

```python
import numpy as np

def run_fair_monte_carlo(
    tef_low: float, tef_mode: float, tef_high: float,
    tcap_alpha: float, tcap_beta: float,
    rs_alpha: float, rs_beta: float,
    lm_p10: float, lm_p90: float,
    iterations: int = 10000,
    seed: int = 42
) -> dict:
    np.random.seed(seed)
    
    # 1. Sample Threat Event Frequency (Beta-PERT)
    # PERT mean & variance approximation
    tef_mean = (tef_low + 4.0 * tef_mode + tef_high) / 6.0
    tef_sd = (tef_high - tef_low) / 6.0
    # Shape parameters
    alpha_pert = ((tef_mean - tef_low) / (tef_high - tef_low)) * (((tef_mean - tef_low) * (tef_high - tef_mean) / (tef_sd ** 2)) - 1.0)
    beta_pert = alpha_pert * (tef_high - tef_mean) / (tef_mean - tef_low)
    
    pert_samples = np.random.beta(alpha_pert, beta_pert, iterations)
    tef_sim = tef_low + pert_samples * (tef_high - tef_low)
    
    # 2. Sample Threat Capability vs Resistance Strength
    tcap_sim = np.random.beta(tcap_alpha, tcap_beta, iterations)
    rs_sim = np.random.beta(rs_alpha, rs_beta, iterations)
    
    # Vulnerability Indicator
    vuln_flag = (tcap_sim > rs_sim).astype(int)
    
    # 3. Sample Loss Event Frequency (Poisson compound events)
    expected_events = tef_sim * vuln_flag
    realized_events = np.random.poisson(expected_events)
    
    # 4. Sample Loss Magnitude (Lognormal)
    mu_ln = (np.log(lm_p10) + np.log(lm_p90)) / 2.0
    sigma_ln = (np.log(lm_p90) - np.log(lm_p10)) / (2.0 * 1.28155)
    
    annual_losses = np.zeros(iterations)
    for i in range(iterations):
        k_events = realized_events[i]
        if k_events > 0:
            losses = np.random.lognormal(mu_ln, sigma_ln, k_events)
            annual_losses[i] = np.sum(losses)
            
    # 5. Extract Quantiles and Risk Metrics
    annual_losses.sort()
    eal = float(np.mean(annual_losses))
    var_90 = float(np.percentile(annual_losses, 90))
    var_95 = float(np.percentile(annual_losses, 95))
    var_99 = float(np.percentile(annual_losses, 99))
    cvar_95 = float(np.mean(annual_losses[annual_losses >= var_95]))
    
    return {
        "eal": eal,
        "var_90": var_90,
        "var_95": var_95,
        "var_99": var_99,
        "cvar_95": cvar_95,
        "annual_losses_sample": annual_losses[::100].tolist()
    }
```

---

## 16. What-If Analysis Engine

The What-If engine evaluates counterfactual security states before capital is committed:
1. **Baseline State ($S_0$)**: Current configuration of control strength, threat frequencies, and asset exposure.
2. **Perturbed State ($S^*$)**: User adjusts interactive levers:
   - Increasing Control Resistance Strength $\Delta \text{RS} \in [+0.05, +0.40]$ (e.g. enforcing phishing-resistant FIDO2 MFA).
   - Decreasing Threat Capability via Threat Hunting / EDR.
   - Reducing Downstream Downtime via immutable backup infrastructure.
3. **Delta Computation**:
   $$\Delta \text{EAL} = \text{EAL}(S_0) - \text{EAL}(S^*)$$
   $$\Delta \text{VaR}_{95} = \text{VaR}_{95}(S_0) - \text{VaR}_{95}(S^*)$$
The platform instantaneously recalculates the entire probability distribution and plots the superimposed before/after Loss Exceedance Curves.

---

## 17. Investment Optimization Engine

### 17.1 Problem Formulation (Google OR-Tools MILP)
Given a universe of $J$ candidate security controls $\mathcal{C} = \{c_1, c_2, \dots, c_J\}$, each control $j$ has:
- Annualized Cost $w_j = \text{CapEx}_j / \text{Lifespan} + \text{OpEx}_j$.
- Estimated Risk Reduction $\Delta \text{EAL}_j = r_j \ge 0$.
- Implementation constraints: Total expenditure cannot exceed fixed budget $B$.
- Mutual exclusivity: Controls belonging to conflicting vendor suites cannot be simultaneously selected.

Let decision variable $x_j \in \{0, 1\}$ represent whether control $j$ is deployed:

$$\max_{\mathbf{x}} \quad \sum_{j=1}^J r_j x_j - \alpha \sum_{j=1}^J w_j x_j$$
Subject to:
$$\sum_{j=1}^J w_j x_j \le B \quad \text{(Capital Budget Constraint)}$$
$$\sum_{j \in \mathcal{G}_k} x_j \le 1 \quad \forall k \in \mathcal{K} \quad \text{(Mutual Exclusion Constraint for tier set } \mathcal{G}_k\text{)}$$
$$x_j \in \{0, 1\} \quad \forall j \in \{1, \dots, J\}$$

### 17.2 Mathematical ROSI Output
For the optimal solution vector $\mathbf{x}^*$:
$$\text{Total Investment } W^* = \sum_{j=1}^J w_j x_j^*$$
$$\text{Total Risk Mitigated } R^* = \sum_{j=1}^J r_j x_j^*$$
$$\text{Portfolio ROSI} = \frac{R^* - W^*}{W^*} \times 100\%$$

---

## 18. Dashboard Requirements & UI/UX Specifications

The user interface is designed with a high-density, utilitarian command-center aesthetic:
- **Global Header**: Shows system status, connected CISA/NVD feeds latency, active organization profile (FinTech / Healthcare), dual-currency toggle ($ USD / ₹ INR), and navigation tabs.
- **Screen 1: Executive Portfolio Overview**:
  - Macro KPI Cards: Aggregate EAL, 95% 1-Year VaR, Max Catastrophic Tail Risk (CVaR), and Total Optimized Savings.
  - Interactive Loss Exceedance Curve (LEC) with percentile scrubbing tooltips.
  - Top 5 Critical Scenarios ranked by financial exposure.
- **Screen 2: FAIR Scenario Breakdown & Calibration**:
  - Detailed parameter inspection (TEF, TCap, RS, Vulnerability $P$, Primary/Secondary loss breakdowns).
  - One-click empirical calibration against the 1,902 historical incident benchmark.
  - Linked CISA KEV and NVD CVE tags with exploitability indicators.
- **Screen 3: Live Threat Feeds & Ingestion Monitor**:
  - Searchable feed of CISA KEV vulnerabilities with vendor, CVE, and ransomware tags.
  - Manual scraper trigger and ingestion latency metrics.
- **Screen 4: Security Budget Optimizer**:
  - Interactive budget slider with dynamic knapsack recalculation.
  - Selected vs. rejected control cards showing unit cost, effectiveness %, and individual ROSI.
  - Before vs. After Risk Comparison bar chart.
- **Screen 5: Real Datasets Forensic Workbench**:
  - 1,902-incident historical breach table with search, sector filtering, and loss distribution curves.
  - Full CISA KEV catalog ($1,709$ records) and NVD CVE records ($2,000$ entries).
- **Screen 6: Academic PRD & Technical Spec Viewer**:
  - Complete in-app browser for this 29-section document with searchable table of contents, LaTeX formula rendering, and Markdown export button.

---

## 19. API Requirements

The FastAPI backend exposes the following RESTful OpenAPI endpoints:

```
GET  /api/health                     - Service health check & database ping
GET  /api/exposure/summary           - Aggregate enterprise portfolio risk (EAL, VaR, CVaR)
GET  /api/scenarios                  - List all active calibrated risk scenarios
GET  /api/scenarios/{id}             - Retrieve granular FAIR parameters & linked CVEs
POST /api/scenarios/{id}/simulate    - Execute on-demand Monte Carlo simulation
POST /api/optimize-budget            - Run Google OR-Tools MILP optimizer for given budget
GET  /api/threat-intel/feed          - Stream normalized CISA KEV & CERT-In feed items
POST /api/threat-intel/refresh       - Trigger live scrapers for CISA and Abuse.ch
GET  /api/real-data/summary          - Aggregate stats on 1,902 historical breach records
GET  /api/real-data/incidents        - Paginated query for empirical incident breaches
POST /api/real-data/calibrate        - Calibrate scenario parameters to vector median/p90
GET  /api/ml/explain/{scenario_id}   - Fetch TreeSHAP waterfall values and feature importance
```

---

## 20. Technology Stack

| Layer | Component | Chosen Technology | Version | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Framework | Next.js / React | 19.0.0 | High performance, server-side rendering, and responsive hook architecture. |
| **Styling** | CSS System | Tailwind CSS | 4.0.0 | Zero-runtime CSS generation with high-density utility classes. |
| **Visualization** | Charting | Recharts & Lucide | 2.15.0 | Declarative SVG charting for probability density and loss exceedance curves. |
| **Backend API** | Web Framework | Python / FastAPI / Node | 3.11+ / 0.110 | Asynchronous request processing, Pydantic data validation, auto-generated OpenAPI. |
| **Simulation** | Math Computing | NumPy & SciPy | 1.26.4 | Vectorized C-accelerated array computing for $10^5$ Monte Carlo draws in $< 1.5\text{ s}$. |
| **Machine Learning**| Regressor & XAI | XGBoost & SHAP | 2.0.3 / 0.45 | Fast gradient boosting on tabular cybersecurity features with exact TreeSHAP attribution. |
| **Optimization** | MILP Solver | Google OR-Tools | 9.9.3963 | Industry standard branch-and-bound linear programming solving knapsack in milliseconds. |
| **Relational DB** | Storage | PostgreSQL | 16.2 | ACID transactional consistency for asset tables, users, and normalized records. |
| **Graph Database**| Graph Store | Neo4j Community / Aura | 5.18.0 | Native graph storage and declarative Cypher queries for multi-hop attack path search. |
| **NLP** | Information Extr. | spaCy / Hugging Face | 3.7.4 | Efficient entity extraction from unstructured threat advisories and security text. |

---

## 21. Security, Governance & Privacy Requirements

1. **Principle of Least Privilege**: API access protected via JSON Web Tokens (JWT) with Role-Based Access Control (RBAC) tiers: `Admin`, `RiskManager`, and `Viewer`.
2. **Cryptographic Provenance**: Every ingested threat advisory and breach record is indexed with a SHA-256 digest of its original raw payload to guarantee immutability.
3. **Secrets Hygiene**: External API keys (NVD API, Abuse.ch) stored strictly in server-side environment variables (`.env`); never exposed to frontend bundles.
4. **Data Privacy**: All organization asset identifiers and IP addresses are masked or tokenized in accordance with Indian DPDP Act 2023 and EU GDPR mandates.

---

## 22. Data Quality, Lineage & Provenance

To eliminate hallucinations and maintain scientific defensibility:
1. **Strict Provenance Labeling**: Every metric displayed in the platform is tagged with its provenance class:
   - `[REAL]`: Direct empirical observations from CISA KEV or historical breach databases ($N=1,902$).
   - `[ESTIMATED]`: FAIR Monte Carlo or ML mathematical outputs.
   - `[SYNTHETIC]`: Organization asset baseline parameters explicitly marked as demo/scenario data.
2. **Zero Fabrication Policy**: Missing secondary loss metrics in historical incident datasets are preserved as `NULL` or calibrated via empirical vector percentiles rather than arbitrarily imputed with false precision.

---

## 23. Minimum Viable Product (MVP) Scope

The CyberPulse MVP (Final-Year Capstone Baseline) strictly includes:
- [x] Ingestion and normalization of CISA KEV catalog ($1,709$ CVEs) and NVD CVE records ($2,000$ items).
- [x] Empirical forensic breach loss database integration ($1,902$ historical records).
- [x] Fully functioning FAIR Monte Carlo simulation engine ($10,000$ iterations) generating EAL, $\text{VaR}_{95}$, and $\text{CVaR}_{95}$.
- [x] Real-time scenario calibration based on attack vector medians and 90th percentiles.
- [x] Google OR-Tools 0-1 Knapsack budget optimizer with dynamic ROSI ranking.
- [x] Executive dashboard with Loss Exceedance Curves and Board Brief export.
- [x] In-app interactive PRD & Architecture Explorer.

---

## 24. Advanced & Phase-2 Scope

Features scheduled for post-submission research iterations (Phase-2):
1. **Temporal Graph Neural Networks (TGNN)**: Continuous dynamic link prediction over Neo4j attack graphs using PyTorch Geometric to predict vulnerability weaponization probabilities $P(\text{Weaponized}_{t+30})$.
2. **Blockchain-Anchored SHA-256 Audit Trail**: Merkle-tree anchoring of simulation runs into a Hyperledger Besu or Ethereum-compatible private ledger for non-repudiable cyber insurance verification.
3. **Automated SOAR Triggering**: Webhook dispatch to Palo Alto Cortex XSOAR or Splunk to automatically commission recommended security controls.

---

## 25. Testing, Benchmarking & Evaluation Metrics

### 25.1 Simulation Accuracy & Convergence
- **Convergence Tolerance**: Monte Carlo runs must satisfy relative error $\epsilon \le 0.015$ over 10 consecutive seeds:
  $$\frac{|\text{EAL}_{k} - \text{EAL}_{k-1}|}{\text{EAL}_{k-1}} \le 1.5\% \quad \text{for } K \ge 10,000$$

### 25.2 ML Regression Evaluation Metrics
Evaluated on a 80/20 train/test split of historical breach data:
- **Root Mean Squared Error (RMSE)**: Target $\le 0.45$ (in $\log_{10}$ scale).
- **Mean Absolute Error (MAE)**: Target $\le 0.32$.
- **Coefficient of Determination ($R^2$)**: Target $\ge 0.82$.

### 25.3 Optimizer Performance Benchmarks
- **Optimality Gap**: OR-Tools MILP solver must return solutions with an optimality gap of $0.00\%$ (exact global optimum).
- **Execution Speed**: Solving across 50 controls within $\le 200\text{ ms}$.

---

## 26. 24-Week Development Roadmap

```
Week  1 -  4: Literature Review, Threat Data Collection (CISA, NVD, Kaggle Incidents), Raw ETL
Week  5 -  8: Relational Schema Setup (PostgreSQL), Graph Modeling (Neo4j), Canonical Schemas
Week  9 - 12: FAIR Mathematical Engine Development (NumPy/SciPy Monte Carlo), Distribution Fitting
Week 13 - 16: Machine Learning Feature Engineering, XGBoost Training, TreeSHAP Explainability
Week 17 - 19: Google OR-Tools MILP Budget Optimization Engine & ROSI Formulation
Week 20 - 22: Next.js Frontend Integration, Recharts Visualization, What-If Interactive Levers
Week 23 - 24: End-to-End Testing, Faculty Guide Review, Project Viva & Thesis Submission
```

---

## 27. Expected Outcomes & Academic Deliverables

1. **Working Production Application**: Fully interactive web platform demonstrating real-time risk quantification, threat feeds, and investment optimization.
2. **Complete Source Code Repository**: Clean, modular codebase conforming to PEP 8, TypeScript strict mode, and comprehensive docstrings.
3. **Undergraduate Capstone Dissertation / Report**: 100+ page technical thesis detailing the mathematical derivations, literature survey, system design, and experimental benchmarks.
4. **Conference Research Manuscript**: Peer-reviewed paper target (e.g. IEEE Access or ACM Cyber Security Conference) entitled *"CyberPulse: A Unified Graph-Theoretic and Probabilistic Framework for Quantitative Cyber Risk Valuation"*.

---

## 28. Assumptions & Limitations

1. **Parameter Elicitation Bias**: Like all FAIR implementations, baseline parameters ($a_{\text{tef}}, m_{\text{tef}}, b_{\text{tef}}$) rely partly on expert judgment when historical incident observations for rare zero-day exploits are scarce.
2. **Static Control Cost Models**: Vendor licensing is modeled as annual fixed recurring costs without factoring in multi-year enterprise volume discounting.
3. **Cyber Insurance Boundary**: Secondary risk models do not currently subtract cyber insurance payout reimbursements from net loss.

---

## 29. Future Research Directions

1. **Generative AI Adversary Synthesis**: Using LLMs to synthesize realistic multi-stage spear-phishing and ransomware threat capability vectors.
2. **Cyber Catastrophe Bond Pricing**: Leveraging CyberPulse loss exceedance distributions to mathematically price cyber catastrophe bonds and insurance premiums.
3. **Autonomous Active Defense**: Integrating real-time risk calculation directly with SDN firewalls and Kubernetes admission controllers to dynamically alter network segmentation rules when $\text{VaR}_{95}$ exceeds enterprise risk tolerance.

---
*End of Master Product Requirements Document — CyberPulse Research Group (2025–2026)*
