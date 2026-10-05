# CyberPulse (ZK-PACE)

> **Quantitative Cyber-Risk Platform & Boardroom Decision Engine**  
> *From threat noise to boardroom decisions — quantify cyber risk in currency (₹ INR), forecast exposure trends, and mathematically optimize security spend using FAIR and 0-1 Knapsack algorithms.*

---

## 📌 Executive Summary

Organizations face millions of vulnerability alerts and CVSS scores, but boardrooms and CFOs do not speak CVSS—**they speak in currency**. CISOs routinely struggle to answer three fundamental questions:

1. **"What is our annualized financial risk exposure (₹) right now?"**
2. **"Is our risk trending up or down due to emerging threats and zero-days?"**
3. **"Given a capped security budget (e.g., ₹25 Lakhs), exactly which security controls should we buy to maximize risk reduction per rupee?"**

**CyberPulse** bridges the gap between technical vulnerability findings and executive balance sheets. Built on the **FAIR™ (Factor Analysis of Information Risk)** international standard, CyberPulse continuously ingests threat feeds (CISA KEV, ThreatFox, GitHub Advisory Database, NIST NVD, CERT-In), maps active exploits to organizational attack surfaces, calculates granular Annualized Loss Exposure (ALE = LEF × LM), and executes an Integer Programming 0-1 Knapsack solver to deliver provably optimal defense spending plans.

Furthermore, CyberPulse incorporates **ZK-PACE (Zero-Knowledge Privacy-Preserving Automated Cyber-risk Evaluation)**: an advanced cryptographic layer enabling enterprises to prove compliance and bounded risk exposure to third-party insurers, auditors, and regulators using zk-SNARKs (Groth16 over BN254) *without leaking confidential internal infrastructure, topology, or vulnerability findings*.

---

## 🚀 Key Platform Capabilities

### 1. 🧮 Transparent FAIR™ Quantitative Risk Engine
- Implements standard Factor Analysis of Information Risk equations:
  - **Vulnerability ($V$)**: $P(\text{Threat Capability} > \text{Control Strength})$, computed from CVSS scores, patch latency, and asset exposure factors.
  - **Loss Event Frequency ($\text{LEF}$)**: $\text{Threat Event Frequency (TEF)} \times \text{Vulnerability}$.
  - **Loss Magnitude ($\text{LM}$)**: $\text{Primary Loss (Downtime, Incident Response, Forensics)} + \text{Secondary Loss (DPDP Fines, Reputational Churn)}$.
  - **Annualized Loss Exposure ($\text{ALE}$)**: $\text{LEF} \times \text{LM}$.
- **Zero Black Boxes**: Every metric is interactive and expandable down to its underlying mathematical formula derivation and data provenance.

### 2. 📡 Multi-Source Threat Intelligence Scraper & Live Feeds
- **Standalone Microservice**: Dedicated high-throughput scraper running independently on port `3001`.
- **Integrated Intelligence Sources**:
  - **CISA KEV**: Known Exploited Vulnerabilities catalog (real-time exploit tracking).
  - **ThreatFox (abuse.ch)**: Real-time malware IOCs, botnets, and ransomware campaigns.
  - **GitHub GHSA**: Upstream supply chain and software package security advisories.
  - **NIST NVD**: National Vulnerability Database CVE records.
  - **CERT-In**: National advisory web ingestion.
  - **On-Demand URL Scraper**: Live extraction of CVEs, CVSS ratings, and attack vectors from arbitrary threat URLs using Cheerio.
- **One-Click Scenario Escalation**: Ingest newly discovered CVEs directly into active threat scenarios to immediately recompute organization-wide risk exposure.

### 3. 🎯 0-1 Knapsack Security Budget Optimizer
- Solves constrained defense allocation as an Integer Linear Programming problem:
  $$\max \sum_{i=1}^{n} x_i \cdot \Delta \text{Risk}_i \quad \text{subject to} \quad \sum_{i=1}^{n} x_i \cdot \text{Cost}_i \le \text{Budget}, \quad x_i \in \{0, 1\}$$
- Evaluates candidate defensive controls (e.g., EDR upgrades, Zero Trust IAM, Cloud SIEM, Phishing Simulation, Offline Immutable Backups, WAF) against targeted scenarios.
- Provides interactive budget sliders, ROI metrics, unspent capital analysis, and one-click **Executive Board Brief** PDF/summary exports.

### 4. 📊 Empirical Real-World Benchmark Calibration
- Pre-loaded with **1,902 real historical cybersecurity breach loss incidents** and **1,709 CISA KEV records**.
- Calibrates synthetic scenarios against empirical loss distributions (Ransomware, Data Breaches, DDoS, Phishing) to reflect verified industry losses under RBI Cyber Security Framework and India DPDP Act 2023 guidelines.

### 5. 🔐 ZK-PACE Cryptographic Privacy Engine
- Built-in zk-SNARK prover & verifier simulation based on Groth16 over the BN254 curve.
- Enables cryptographic witness generation to prove that:
  - Enterprise risk exposure is strictly bounded below a threshold $\tau$ ($\text{VaR}_{95\%} \le \text{Threshold}$).
  - Security controls meet required regulatory standards without disclosing internal network diagrams or asset inventories.

---

## 🏛️ System Architecture

```
                                  CYBERPULSE ECOSYSTEM
                                  
  [ External Threat Feeds ]                 [ Empirical Benchmarks ]
  • CISA KEV (Catalog API)                  • 1,902 Historical Breaches
  • ThreatFox (abuse.ch)                    • 1,709 CISA KEV Vulnerabilities
  • GitHub Advisories (GHSA)                • NIST NVD CVE Dataset
  • CERT-In & Custom Web Feeds              • Sector Loss Distributions
              │                                          │
              ▼                                          ▼
   ┌───────────────────────┐                  ┌────────────────────────┐
   │ Scraper Microservice  │                  │ Ingestion & Calibration│
   │  (Port 3001 - Express)│                  │         Engine         │
   └──────────┬────────────┘                  └───────────┬────────────┘
              │ (Proxy /scraper-api)                      │
              ▼                                           ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │                  CyberPulse Application Server                    │
   │                  (Port 3000 - Express + Vite)                     │
   ├───────────────────────────────┬───────────────────────────────────┤
   │       FAIR™ Core Engine       │     Knapsack Budget Optimizer     │
   │   • LEF = TEF × Vulnerability │     • 0-1 Integer Programming     │
   │   • LM = Primary + Secondary  │     • Maximum ROI per ₹ spent     │
   │   • Risk = LEF × LM           │     • Board Brief Generator       │
   ├───────────────────────────────┴───────────────────────────────────┤
   │                  ZK-PACE Cryptographic Prover                     │
   │       • Groth16 zk-SNARK Proof Generation (BN254 Curve)           │
   │       • Zero-Knowledge Public Verification (VaR <= tau)           │
   └───────────────────────────────┬───────────────────────────────────┘
                                   │
                                   ▼
   ┌───────────────────────────────────────────────────────────────────┐
   │                       Interactive Web UI                          │
   │             (React 19, Tailwind CSS v4, Lucide, Recharts)         │
   │  • Executive Overview (₹ ALE)   • Scenario Mathematical Lineage   │
   │  • Live Threat Intel Feed       • Interactive Knapsack Optimizer  │
   │  • Empirical Dataset Explorer   • ZK-PACE Research Paper & Prover │
   └───────────────────────────────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
CYBERPULSE/
├── CyberPulse_PRD.md             # Complete Product Requirements Document & Specifications
├── readme.md                     # Root Project Documentation (this file)
│
├── client/                       # Main Web Application & App Server
│   ├── package.json              # Client dependencies (React 19, Vite, Express, Tailwind v4)
│   ├── vite.config.ts            # Vite config with /scraper-api proxy to port 3001
│   ├── server.ts                 # Main server: Express REST API + Vite middleware (Port 3000)
│   ├── fair_engine.py            # Standalone reference FAIR calculation script (Python)
│   ├── budget_optimizer.py       # Standalone reference 0-1 Knapsack optimizer script (Python)
│   ├── data/                     # Empirical security & breach datasets
│   │   ├── Financial Data Set.csv# 1,902 real historical breach loss records
│   │   └── known_exploited_vulnerabilities.json # 1,709 CISA KEV entries
│   └── src/
│       ├── App.tsx               # Root application router and layout
│       ├── types.ts              # Domain TypeScript interfaces (FAIR, Scenarios, Controls)
│       ├── components/           # UI Screens & Interactive Views
│       │   ├── OverviewScreen.tsx           # Executive board metrics & risk exposure
│       │   ├── ScenarioDetailScreen.tsx     # Granular FAIR formula breakdown
│       │   ├── ThreatFeedScreen.tsx         # Live threat monitoring & scenario escalation
│       │   ├── BudgetRecommendationScreen.tsx# Interactive budget optimization
│       │   ├── RealDataScreen.tsx           # Empirical dataset explorer & calibration
│       │   ├── ZKPacePaperScreen.tsx        # ZK-PACE paper viewer & interactive prover
│       │   ├── ScraperScreen.tsx            # Multi-source scraper control center
│       │   ├── BoardBriefModal.tsx          # Exportable C-level executive summary
│       │   └── DataLineageModal.tsx         # Mathematical data audit trace
│       ├── context/              # React Context state management (RiskContext, ThemeContext)
│       └── services/             # Core computational engines
│           ├── fairEngine.ts        # FAIR quantitative risk calculations
│           ├── optimizer.ts         # 0-1 Knapsack budget optimization algorithms
│           ├── cisaFeed.ts          # CISA KEV catalog integration
│           ├── multiSourceScraper.ts# Multi-feed ingestion handler
│           ├── realDataService.ts   # CSV parser & statistical distribution engine
│           └── forecast.ts          # 12-month historical & forward projection engine
│
└── server/                       # Standalone Threat Intelligence Scraper Server
    ├── package.json              # Scraper server dependencies (Express, Cheerio, CORS)
    ├── scraper-server.ts         # Scraper REST microservice (Port 3001)
    └── README.md                 # Dedicated scraper server documentation
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **Python**: v3.9+ (Optional, for running reference scripts)

---

### Step 1: Install & Launch the Standalone Scraper Server

The scraper runs as an independent microservice on port **3001** to handle network-heavy threat intelligence scraping without blocking the main application.

```bash
cd server
npm install
npm run dev
```

*The Scraper Server will be active at `http://localhost:3001`.*

---

### Step 2: Install & Launch the CyberPulse Client & Main Server

In a new terminal window, start the main application server (which combines the Express API and Vite React frontend on port **3000**):

```bash
cd client
npm install
npm run dev
```

*Open your browser and navigate to **`http://localhost:3000`**.*

> **Network Configuration Note:**  
> The Vite development server automatically proxies any calls made to `/scraper-api/*` directly to `http://localhost:3001/*`. Both servers should remain running concurrently for full live scraping functionality.

---

### Step 3: (Optional) Run Standalone Mathematical Verification Scripts

You can independently verify the FAIR formula and Knapsack optimization logic using the included Python scripts:

```bash
cd client

# Verify FAIR quantitative risk computations:
python fair_engine.py

# Verify 0-1 Knapsack defense allocation:
python budget_optimizer.py
```

---

## 📡 REST API Reference

### Main Application API (Port `3000`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and system timestamp |
| `GET` | `/api/exposure?sector=fintech` | Organization profile, total annualized risk (₹), and scenario breakdown |
| `GET` | `/api/scenario/:id` | Detailed scenario metrics with complete FAIR formula derivation |
| `POST` | `/api/recommend` | Knapsack optimization engine `{ budget: number, sector: string }` |
| `GET` | `/api/feed` | Current catalog of threat feed items and live CVE mappings |
| `POST` | `/api/feed/refresh` | Trigger live synchronization with CISA KEV catalog |
| `GET` | `/api/forecast` | 12-month historical exposure and projected future risk |
| `GET` | `/api/real-data/summary` | Aggregate metrics across empirical breach datasets |
| `GET` | `/api/real-data/incidents` | Query 1,902 historical breach loss records (`?search=&vector=&limit=`) |
| `GET` | `/api/real-data/cisa-kev` | Search 1,709 real CISA KEV vulnerabilities |
| `POST` | `/api/real-data/calibrate-scenario` | Calibrate scenario loss magnitude using empirical incident medians |
| `POST` | `/api/organization` | Update custom organizational profile, revenue, and asset metrics |

### Scraper Microservice API (Port `3001` / Proxied via `/scraper-api`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Scraper liveness and scheduled task status |
| `GET` | `/sources` | Status of configured sources (CISA, ThreatFox, GitHub, NVD, CERT-In) |
| `POST` | `/scrape/all` | Trigger immediate scraping across all enabled threat sources |
| `POST` | `/scrape/source/:id` | Trigger a targeted scrape on a single source |
| `POST` | `/scrape/custom` | Extract threat intelligence from an arbitrary URL `{ url, targetScenarioId? }` |
| `POST` | `/schedule/set` | Configure automated scrape intervals `{ cadence: "30s" \| "5m" \| "1h" \| "off" }` |
| `GET` | `/items` | Scraped threat intelligence items (`?source=&severity=&search=`) |

---

## 📐 Mathematical Formulation

### 1. Factor Analysis of Information Risk (FAIR™)
$$\text{Annualized Risk (₹)} = \text{LEF} \times \text{LM}$$

$$\text{LEF} = \text{TEF} \times \text{Vulnerability}$$

$$\text{Vulnerability} = \text{clamp}\left(0.50 + 0.70 \times (\text{Threat Capability} - \text{Control Strength}), 0.05, 0.95\right)$$

$$\text{Loss Magnitude (LM)} = \text{Primary Loss} + \text{Secondary Loss}$$
- **Primary Loss**: Direct incident response, system downtime, forensics, and data reconstruction.
- **Secondary Loss**: Regulatory penalties (e.g., DPDP Act 2023), customer churn, and reputation damage.

### 2. Optimal Security Control Allocation (0-1 Knapsack)
Given candidate defensive controls $\{C_1, C_2, \dots, C_n\}$ with cost $c_i$ and expected risk reduction $\Delta R_i$:

$$\max \sum_{i=1}^{n} x_i \cdot \Delta R_i \quad \text{subject to} \quad \sum_{i=1}^{n} x_i \cdot c_i \le B, \quad x_i \in \{0, 1\}$$

where $B$ is the maximum security budget and $x_i$ represents the binary decision to fund control $i$.

---

## 🔬 Academic Citation (ZK-PACE)

If you use CyberPulse or the ZK-PACE quantitative evaluation framework in your academic research or capstone evaluations, please cite:

```bibtex
@article{girase2025zkpace,
  title={ZK-PACE: Zero-Knowledge Privacy-Preserving Cyber-Economic Risk Evaluation and Optimal Defense Allocation},
  author={Girase, Saurabh and Research Consortium, ZK-PACE},
  journal={IEEE Transactions on Information Forensics and Security / Cyber Risk & Privacy},
  year={2025}
}
```

---

## 📜 Compliance & Regulatory Alignments

- **FAIR™ Standard**: Factor Analysis of Information Risk (The Open Group)
- **DPDP Act 2023**: Digital Personal Data Protection Act (India)
- **RBI Cyber Security Framework**: Mandated Cyber Risk Quantification & Incident Reporting
- **CISA KEV Catalog**: Binding Operational Directive 22-01 (Federal Known Exploited Vulnerabilities)
- **NIST SP 800-30 / 800-53**: Risk Assessment and Security Controls Framework

---

## 👥 Contributors & License

Developed as part of the **CyberPulse Research & Development Initiative**.  
Licensed under the [MIT License](LICENSE).
