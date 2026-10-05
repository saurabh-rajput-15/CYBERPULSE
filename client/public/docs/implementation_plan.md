# CyberPulse: AI-Powered Continuous Cyber Risk Quantification & Investment Optimization Platform
**Final-Year B.Tech Project – Product Requirements Document (PRD) & Implementation Architecture**

CyberPulse is an enterprise-grade cyber risk engineering platform that converts ambiguous ordinal risk matrices (High/Medium/Low) into rigorous probabilistic financial exposure metrics (Expected Annual Loss, Value at Risk, and Conditional Value at Risk). It integrates real-time threat intelligence feeds, graph ontology modeling, machine-learning-driven loss estimation with SHAP explainability, and linear-programming-based security investment optimization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and evaluation priorities have been confirmed based on user feedback and will govern the complete 29-section specification:

- **Documentation Format**: **Executive and Technical Dual-Format Specification** — Delivers high-level CISO/board summaries and ROI metrics alongside rigorous, reproducible algorithmic specifications for university evaluation.
- **Academic Focus**: **Dual-Engine Rigor** — In-depth treatment of both:
  1. *FAIR-inspired Monte Carlo simulation* ($10^4$ to $10^5$ iterations with Beta-PERT and lognormal loss distributions) and *Google OR-Tools 0-1 Knapsack & Mixed Integer Linear Programming (MILP)* for optimal budget allocation.
  2. *XGBoost tabular risk prediction* alongside *TreeSHAP* local and global feature attribution for transparency.
- **System Architecture**: **Full-Stack Implementation Blueprint** — FastAPI asynchronous Python microservices for analytics, PostgreSQL for relational telemetry, Neo4j for graph threat paths, and Next.js / React with Tailwind CSS for interactive visualization and dashboard reporting.
- **Dual Delivery**: A standalone, publication-grade academic document (`docs/CYBERPULSE_PRD.md`) alongside an interactive, searchable in-app PRD reader with PDF/Markdown export for vivas and demonstrations.

---

## 1. Overview & Core Concept

### 1.1 What It Does
CyberPulse transforms qualitative cybersecurity findings into defensible monetary terms. The system ingests vulnerability advisories (NVD CVEs, CISA KEV, CERT-In, MITRE ATT&CK), pairs them with enterprise asset inventories and incident records, simulates probabilistic loss distributions via the FAIR model, predicts future breach impact using an XGBoost surrogate, and runs Google OR-Tools to solve for the mathematically optimal security control portfolio given a strict budgetary constraint.

### 1.2 Target Audience & Personas
1. **Chief Information Security Officer (CISO) & Board Members**: Seek quantifiable risk in dollars/rupees, Return on Security Investment (ROSI), and defensible capital budget justification.
2. **Enterprise Risk & Compliance Officers**: Require audit trails, regulatory exposure tracking, and empirical calibration against real historical breaches.
3. **Security Operations & Engineering Leads**: Need concrete CVE-to-asset mapping, attack vector vulnerability graphs, and prioritized control implementation roadmaps.
4. **Academic Evaluators / Viva Examiners**: Scrutinize mathematical modeling validity, simulation convergence, ML generalization and explainability, and engineering clean-code principles.

### 1.3 Key Value & Differentiation
- **Elimination of "High/Medium/Low" Guesswork**: Computes exact 90th/95th/99th percentile Value at Risk ($\text{VaR}_\alpha$) and Tail Risk / Conditional VaR ($\text{CVaR}_\alpha$).
- **Explainable AI (XAI)**: Replaces opaque risk scores with TreeSHAP waterfall charts explaining exactly which threat actor capability, asset criticality, or control deficit drove the predicted financial exposure.
- **Constrained Optimization**: Instead of arbitrary vendor tool selection, Google OR-Tools computes the maximum risk reduction achievable within any specified budget boundary.

---

## 2. User Experience & Visual Design

### 2.1 Key User Flows
1. **Executive Portfolio & Macro Exposure Flow**: View enterprise aggregated EAL, 95% 1-year VaR, loss exceedance curves (LECs), and historical breach benchmarks.
2. **FAIR Scenario Calibration & Simulation Flow**: Select or import scenarios, adjust Threat Event Frequency (TEF) and Threat Capability (TCap) vs. Resistance Strength (RS), configure primary/secondary loss distributions, and execute 10,000-run Monte Carlo trials with real-time histogram convergence.
3. **XGBoost & SHAP Risk Intelligence Flow**: Train/evaluate ML risk models on empirical historical breach datasets, inspect ROC-AUC/RMSE metrics, and generate instant waterfall and bee-swarm SHAP explanations for any asset or attack vector.
4. **OR-Tools Security Investment Optimizer Flow**: Input organizational capital budget, candidate security controls, costs, and effectiveness matrix; execute solver; review Pareto frontier curve and selected control portfolio with calculated ROSI.
5. **Interactive PRD & Architecture Explorer**: A dedicated in-platform tab allowing examiners to review all 29 PRD sections, interact with live mathematical formula proofs, copy code snippets, and download the full technical report.

### 2.2 Visual Identity & Layout
- **Aesthetic Direction**: High-density, utilitarian cyber-command cockpit adhering to dark-mode security operations aesthetics (`zinc-950` foundation, `slate-900` cards, subtle `cyan-500`/`emerald-500` accents for safe/optimal states, and `rose-500` for catastrophic tail risk).
- **Typography**: Monospace numerals (`JetBrains Mono` / `Fira Code`) for currency amounts, percentiles, and CVE identifiers; clean sans-serif (`Inter`) for body narrative and executive summaries.
- **Charts & Spatial Analytics**: Recharts and Canvas-based probability distribution curves, cumulative loss exceedance plots, and Sankey/Graph visualizations for threat actor attack chains.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Academic & Practical Rationale | Alternatives Considered & Rejected |
| :--- | :--- | :--- | :--- |
| **Risk Engine Decoupling** | Strict separation between FAIR Monte Carlo calculation and XGBoost ML prediction. | Preserves sound financial physics. ML predicts risk trajectories and fills feature gaps; it never obscures the verifiable math of FAIR. | Single black-box deep learning model predicting dollar loss directly (rejected due to hallucinations and lack of auditability). |
| **Loss Distribution Modeling** | Beta-PERT for frequency/capability bounds; Lognormal for financial loss magnitude ($LM$). | Standard in actuarial science and FAIR Institute guidelines; handles fat-tail catastrophic cyber loss distributions. | Normal/Gaussian distribution (rejected because cyber losses are strictly non-negative and heavily right-skewed). |
| **Optimization Formulation** | 0-1 Multi-Choice Knapsack & Mixed-Integer Linear Programming (MILP) via Google OR-Tools. | Guarantees mathematically optimal control selection in sub-second execution with precise constraint enforcement. | Genetic algorithms or greedy heuristics (rejected due to non-deterministic solutions and suboptimal local minima). |
| **Graph & Threat Mapping** | Dual representation: PostgreSQL relational schema for transactions + Neo4j labeled property graph for MITRE/CVE paths. | Maximizes transactional query performance while enabling native graph traversal ($O(1)$ pointer-chasing for multi-hop attack graphs). | Storing graph relationships purely in SQL joins (rejected due to exponential join degradation on deep attack chains). |
| **Phase Boundaries** | Core FAIR + XGBoost/SHAP + OR-Tools + Data Normalization in MVP; Temporal GNNs & Blockchain Audit in Phase-2. | Guarantees a fully functional, bug-free, defensible MVP for B.Tech project submission within timeline. | Attempting all Phase-2 features simultaneously, leading to half-finished prototypes. |

---

## 4. Technical Architecture & System Blueprint

### 4.1 System Topology Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               CYBERPULSE CLIENT (Next.js / React)                      │
│   ┌─────────────────────┬────────────────────┬────────────────────┬────────────────┐   │
│   │ Executive Dashboard │ Scenario FAIR Sim  │ ML & SHAP Analysis │ OR-Tools Opt.  │   │
│   ├─────────────────────┴────────────────────┴────────────────────┴────────────────┤   │
│   │               Interactive 29-Section Academic PRD & Spec Viewer                │   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ HTTP / REST / JSON
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY & ORCHESTRATION LAYER (FastAPI)                     │
│   ├── Authentication & RBAC Middleware        ├── OpenAPI / Swagger Auto-Docs          │
│   ├── Rate Limiting & Validation Pipelines    ├── ETL Scraper & Ingestion Triggers     │
└───────┬───────────────────────────┬────────────────────────────┬───────────────────────┘
        │                           │                            │
        ▼                           ▼                            ▼
┌──────────────────┐       ┌──────────────────┐        ┌──────────────────┐
│ FAIR SIM ENGINE  │       │ ML PREDICTOR &   │        │ INVESTMENT       │
│ (NumPy / SciPy)  │       │ EXPLAINABILITY   │        │ OPTIMIZER        │
│ ├── Beta-PERT    │       │ ├── XGBoost Reg. │        │ (Google OR-Tools)│
│ ├── 10^5 Iter.   │       │ ├── TreeSHAP     │        │ ├── 0-1 Knapsack │
│ └── VaR / CVaR   │       │ └── Feature Eng. │        │ └── ROSI Calc.   │
└───────┬──────────┘       └────────┬─────────┘        └────────┬─────────┘
        │                           │                           │
        └───────────────────────────┼───────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                PERSISTENCE & ONTOLOGY LAYER                            │
│   ┌──────────────────────────────────────────┬─────────────────────────────────────┐   │
│   │       PostgreSQL Relational Storage      │       Neo4j Property Graph DB       │   │
│   │ ├── Normalized Incidents & Losses        │ ├── Threat Actor → Campaign         │   │
│   │ ├── CISA KEV & NVD CVE Catalog           │ ├── MITRE ATT&CK Techniques         │   │
│   │ ├── Asset Criticality & Financials       │ ├── Vulnerabilities (CVE/CWE)       │   │
│   │ └── Simulation Runs & Control Catalog    │ └── Crown-Jewel Asset Attack Paths  │   │
│   └──────────────────────────────────────────┴─────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 PRD Delivery Structure (Complete 29 Sections)
1. **Executive Summary**: High-level motivation, quantitative thesis, and business impact.
2. **Problem Statement**: Flaws of ordinal risk heatmaps, regulatory compliance mandates (DORA, SEC, CERT-In).
3. **Objectives**: Quantifiable accuracy, optimization efficiency, and operational SLAs.
4. **Target Users**: Personas, access tiers, and operational user stories.
5. **Functional Requirements**: Granular capability specifications across the 6 major modules.
6. **Non-Functional Requirements**: Latency, scalability, reproducibility, and security tolerances.
7. **System Architecture**: Multi-tier architecture, service interfaces, and deployment models.
8. **Data Architecture**: Data lake/raw landing vs. bronze/silver/gold normalization layers.
9. **Data Sources**: Specifications for NVD, CISA KEV, CERT-In, MITRE ATT&CK, Advisories, and Financial datasets.
10. **Data Schema**: Complete relational DDL (PostgreSQL) and Cypher graph schemas (Neo4j).
11. **Risk Calculation Methodology**: Complete mathematical formulation of FAIR (TEF, TCap, RS, Vulnerability, LEF, Primary/Secondary Loss, LM, EAL, VaR, CVaR).
12. **Machine Learning Methodology**: Feature engineering, XGBoost objective function, hyperparameter optimization, and TreeSHAP formulations.
13. **NLP Pipeline**: spaCy / Hugging Face NER and regex extraction for unstructured security advisories.
14. **Graph Model**: Entity-relationship ontology, Cypher traversal queries, and shortest attack path formulations.
15. **Financial Risk Engine**: Monte Carlo sampling algorithms, convergence criteria, and percentile interpolations.
16. **What-If Analysis Engine**: Counterfactual risk delta simulation before and after control deployments.
17. **Investment Optimization**: 0-1 Knapsack and Mixed-Integer Linear Programming via Google OR-Tools, budget constraints, and ROSI equations.
18. **Dashboard Requirements**: Screen-by-screen UX specifications, widgets, and data refresh cycles.
19. **API Requirements**: RESTful OpenAPI endpoint catalog with request/response payloads.
20. **Technology Stack**: Justifications and version locks for Python, FastAPI, Next.js, PostgreSQL, Neo4j, OR-Tools, and XGBoost.
21. **Security & Privacy Requirements**: Zero Trust data handling, encryption at rest/transit, API key segregation, and provenance tracking.
22. **Data Quality & Provenance**: Ground truth vs. synthetic distinction, data lineage validation, and anomaly detection.
23. **MVP Scope**: Detailed feature checklist required for the initial functional milestone.
24. **Advanced / Phase-2 Scope**: Temporal Graph Neural Networks (TGNN) and SHA-256 blockchain audit trail.
25. **Testing & Evaluation Metrics**: Unit, simulation convergence, ML evaluation (RMSE, MAE, R²), and OR-Tools benchmark suites.
26. **24-Week Development Roadmap**: Gantt-style 6-month timeline mapped to B.Tech semester milestones.
27. **Expected Outcomes**: Academic project deliverables, code repositories, research paper targets, and defense artifacts.
28. **Limitations**: Assumptions regarding cyber loss volatility, sample sizes, and parameter elicitation.
29. **Future Scope**: Autonomous control orchestration, cyber insurance underwriting APIs, and real-time SIEM/SOAR streaming.

---

## 5. Implementation Steps for Next Turn

1. **Author the Master PRD File (`docs/CYBERPULSE_PRD.md`)**:
   - Write out all 29 sections in full technical and mathematical detail with zero placeholder sections or abbreviations.
   - Embed exact LaTeX formulas for FAIR, Monte Carlo sampling, XGBoost gradient boosting loss, and OR-Tools MILP constraints.
   - Include complete SQL table definitions, Neo4j Cypher node/relationship creation statements, and OpenAPI JSON schemas.

2. **Integrate In-App PRD Explorer Component**:
   - Add a dedicated "PRD & Research Spec" viewer screen into the CyberPulse UI.
   - Include category navigation, full-text search across sections, one-click Markdown copy/download, and clean typography.
   - Ensure seamless integration with the existing Real Data Catalog, FAIR Simulator, and OR-Tools Optimizer.

3. **Verify and Validate**:
   - Run linter and TypeScript compilation to guarantee zero errors and clean build output.
