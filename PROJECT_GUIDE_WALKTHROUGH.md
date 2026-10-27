# CyberPulse (ZK-PACE) — Guide Walkthrough & Project Update

> **Document Purpose:** A clear, simple, non-jargon explanation of the project, recent updates, and the massive **CVElistV5 Big Data Integration**, prepared specifically for presenting to your project guide, mentor, or review panel.

---

## 1. What is CyberPulse in Plain English?

Most cybersecurity software gives security teams a list of technical alerts, scores like *CVSS 9.8*, or subjective colors (*Red / Yellow / Green*). 

**The big problem:** A Chief Executive (CEO) or Chief Financial Officer (CFO) cannot make business decisions based on a score of "9.8". They need answers to two simple business questions:
1. **"If we get hacked through this vulnerability, how much money (in ₹ Rupees) will we actually lose?"**
2. **"We only have a limited security budget (e.g., ₹50 Lakhs). Exactly which security tools should we buy to save the most money and stop the biggest disasters?"**

**CyberPulse (ZK-PACE)** solves this. It is a **Quantitative Cyber-Risk & Defense Optimization Platform**. It connects real-world vulnerability feeds (like US CISA and Indian CERT-In) with financial mathematics (the industry-standard **FAIR™ model**) and computer science algorithms (**0-1 Knapsack Optimization**) to tell an organization:
- Exactly how much money they risk losing each year (**Annualized Loss Expectancy**).
- The exact best combination of security defenses to purchase within their budget to get the highest Return on Investment (ROI).

---

## 2. The Big Dataset Integration: CVElistV5 (216,000+ Real Vulnerabilities)

One of the strongest technical highlights to show your guide is the **integration of the official CVElistV5 big dataset**.

### A. What is the CVElistV5 Dataset?
- **Source:** The official global repository of Common Vulnerabilities and Exposures (CVE), maintained by the **CVE Project (MITRE / US CISA)**.
- **Format:** In 2024, the world transitioned from legacy CVE v4 to the richer **CVE v5 JSON record format**, which adds Stakeholder-Specific Vulnerability Categorization (SSVC), automated exploitation tracking, and exact affected product coordinates.
- **Dataset Size in CyberPulse:**
  - **383,135 raw CVE records** on disk.
  - **216,413 high-performance indexed CVEs** stored in our optimized **205 MB embedded SQLite database** (`cvelist_index.sqlite`).
  - Spanning 6 continuous years (**2021 through 2026**).
  - Covering **22,012 enterprise vendors** (Microsoft, Linux, Google, Apple, Oracle, Apache, Cisco, etc.).
  - Identifying **12,647 Critical** and **54,202 High-severity** vulnerabilities.

### B. What Did It Change & What Positive Value Did It Bring?

| Before CVElistV5 Integration | After CVElistV5 Integration (Current State) | Positive Value to Project & Guide |
| :--- | :--- | :--- |
| The system relied on 4–5 hardcoded, simulated demo scenarios. | The system has access to **over 216,000 real-world software vulnerabilities**. | **Academic & Industry Credibility:** Moves the project from a "proof-of-concept toy" to a real-world enterprise analytics platform. |
| Inability to evaluate specific software in a company's actual stack. | An analyst can search **any software, vendor, or CVE ID** (e.g. Apache Log4j, OpenSSH, Palo Alto, Microsoft Exchange). | **Practical Utility:** The organization can benchmark their actual installed IT assets against the national vulnerability database. |
| Vulnerability severity was just a static CVSS number. | Every single CVE can be fed directly into our **one-click FAIR financial risk simulator**. | **The Killer Feature:** Converts any real CVE in the world into a ₹ Crore financial loss forecast. |
| High database overhead would require heavy external database servers (like Elasticsearch or MongoDB). | Engineered an embedded **SQLite FTS5 Full-Text Search** engine inside Node.js. | **Zero-Dependency Speed:** Sub-5 millisecond search queries across 216,000 records without needing extra database services. |

### C. The "Simulate FAIR Risk" Button on ANY Real CVE

This is the most impressive feature to demonstrate live to your guide:
1. When you search and open any CVE (for example, `CVE-2021-44228` Log4Shell or `CVE-2024-3400` PAN-OS), you can click **"Simulate FAIR Risk"**.
2. CyberPulse instantly calculates:
   - **Loss Magnitude anchored to IBM 2024 Industry Benchmarks:** Uses real Ponemon/IBM 2024 data ($5.97M for FinTech, $9.77M for Healthcare).
   - **Exploitation Velocity from CISA KEV:** Calibrates attack frequency (e.g. 24 attempts/year if actively weaponized in the wild).
   - **Itemized Cost Breakdown:** Forensics (18%), Business Interruption (28%), Regulatory Penalties (12%), and Reputational Churn (19%).
   - **India DPDP Act 2023 Statutory Penalty Floor:** Automatically accounts for statutory penalties under Indian law.
   - **Recommended Defenses:** Suggests the exact controls needed to mitigate that specific vulnerability.
   - **Real Documented Breach Citations:** Cross-references with historical damages (e.g., Log4Shell causing $4.5M ransomware breaches, EternalBlue causing $10B in global damages).

---

## 3. Core Modules & How Each One Works (Simplified)

```
[1. CVElistV5 Big Data & Live Intel] ──> [2. FAIR Financial Risk Engine] ──> [3. Monte Carlo Simulation]
     (216,000+ Real CVEs + CISA/CERT-In)      (Loss Event Frequency x Loss)            (10,000 Iterations: P10/P50/P90)
                                                                                            │
                                                                                            ▼
[Executive Decision: Max Risk Reduced] <── [5. 0-1 Knapsack Optimizer] <── [4. Blast Radius & DPDP Fines]
   (Best Controls for Given Budget)              (Dynamic Programming)              (Per-record Data Loss & Fines)
```

### Module 1: The FAIR™ Quantitative Risk Engine
- **What it does:** Calculates financial cyber-risk in real currency (₹ INR and $ USD) instead of vague "High/Medium/Low" labels.
- **The formula it uses:** 
  $$\text{Annualized Loss Expectancy (ALE)} = \text{Loss Event Frequency (LEF)} \times \text{Loss Magnitude (LM)}$$
  - **Loss Event Frequency (LEF):** How many times per year is an attack likely to succeed? (Calculated from Threat Event Frequency $\times$ Vulnerability).
  - **Loss Magnitude (LM):** When a breach happens, what is the total cost? (Forensics + Downtime + Customer Compensation + Legal Fees + DPDP Fines).

### Module 2: Monte Carlo Simulation & Loss Exceedance Curve (LEC)
- **What it does:** Cybersecurity losses are never a single fixed number. A ransomware attack could cost ₹20 Lakhs in a mild case, or ₹5 Crores if production databases are destroyed.
- **How it works:** The engine runs **10,000 randomized simulations** using statistical log-normal probability distributions.
- **What it shows the guide:**
  - **P10 (Optimistic case):** 90% chance loss will be higher than this minimum.
  - **P50 (Median realistic case):** The most probable real-world loss.
  - **P90 (Worst-case catastrophe):** The 1-in-10 disaster scenario an organization must hold capital reserves against.

### Module 3: 0-1 Knapsack Defense Budget Optimizer
- **What it does:** Eliminates human guesswork when buying security tools.
- **The algorithm:** Uses the classic computer science **0-1 Knapsack Problem** solved via Dynamic Programming.
  - **Constraint:** Total spending cannot exceed the organization's stated cybersecurity budget (e.g. ₹50 Lakhs).
  - **Objective:** Select the exact subset of candidate security controls (e.g., EDR, Multi-Factor Authentication, Immutable Backups, WAF) that eliminates the greatest amount of financial risk.
  - **Output:** Tells management: *"Invest in Controls A, C, and E. You will spend ₹42 Lakhs and eliminate ₹1.82 Crores in annual risk."*

### Module 4: Blast Radius & DPDP Regulatory Penalties
- **What it does:** Tailored specifically for **Indian Data Protection Law (DPDP Act 2023)** and global frameworks (GDPR / HIPAA).
- **How it works:** Simulates an attacker breaching specific corporate asset tiers (Customer PII, Financial PCI records, Source Code, Healthcare PHI).
- **Output:** Calculates statutory penalty tiers (up to the ₹250 Crore statutory penalty threshold for egregious data neglect) and customer notification costs.

### Module 5: Containment Velocity (Dwell Time Curve)
- **What it does:** Measures the financial value of speed in Incident Response.
- **How it works:** Studies the attacker's "dwell time" (how many hours/days an attacker stays inside the network before being caught).
- **Takeaway:** Shows management that cutting detection time from 21 days down to 4 hours saves ₹1.2+ Crores in data exfiltration damage.

### Module 6: Live Threat Intelligence & Scraper Hub
- **What it does:** Automatically monitors 5 global security catalogs:
  1. **US CISA KEV:** Real-time weaponized zero-days.
  2. **Indian CERT-In:** Statutory security bulletins for Core Banking, UPI, and financial switches.
  3. **GitHub GHSA:** Supply-chain open-source flaws (`npm`, `PyPI`, `Go`).
  4. **NIST NVD:** High & Critical CVSS-scored vulnerabilities.
  5. **ThreatFox (Abuse.ch):** Live ransomware indicators & C2 IP addresses.
- **The Live Link:** When a new exploited zero-day is found, it automatically links to your risk scenario and escalates its attack probability (**TEF +0.30/yr**), instantly recalculating the financial loss in real time.

---

## 4. What We Accomplished in the Last 2 Days (Project Update)

| Phase | What Was Done | Why It Was Done / Benefit |
| :--- | :--- | :--- |
| **Phase 1: Clutter Removal** | Deleted redundant data dumps (`new-1.json`, `new-2.json`, `new-1.toon`, `financial_dataset.csv`, `PROJECT.txt`). | Freed over 15+ MB of redundant data; removed confusing duplicate files. |
| **Phase 2: Dead Code Elimination** | Removed dead standalone prototype scripts (`apply_global_theme.js`, `budget_optimizer.py`, `fair_engine.py`, `bun.lock`). | Cleaned repository of unused experiments; eliminated Python/Node confusion. |
| **Phase 3: Package Optimization** | Uninstalled heavy unused npm packages (`@google/genai`, `motion`), pruning 41 packages. | Faster startup, smaller build bundle, no unnecessary external AI API dependencies. |
| **Phase 4: Unified Architecture on Port 3000** | Consolidated the Express backend, Scraper API, and React/Vite frontend into a single server on port `3000`. Removed port `3001` dual-server requirement. | One single command (`npm run dev`) launches the entire application. No port conflicts, no proxy failures. |
| **Phase 5: Screen Consolidation** | Merged 3 separate screens (*Threat Feed*, *Awareness Dashboard*, *Live Scraper*) into one cohesive **Threat Intelligence Hub**. Re-grouped Sidebar into 4 clean sections. | Eliminated clutter and repetitive navigation; the UI looks professional, intuitive, and executive-ready. |
| **Phase 6: Fixed Scraper Stalling Bug** | Diagnosed and solved why live scraping was stuck on 6 records: replaced static stub filters with active parsing for CISA, GitHub, ThreatFox, NIST, and CERT-In, plus an automated scheduler. | Scraping is dynamic; items count expands from 6 to **38+ verified intelligence records** and keeps growing on new scrapes. |

---

## 5. Guide Q&A: How to Answer Common Questions

### Q1: "Why did you integrate CVElistV5 instead of just using a small sample?"
> **Answer:** *"A small sample of 10 or 20 CVEs does not reflect real-world enterprise infrastructure. By indexing 216,413 real vulnerabilities from 2021 to 2026 across 22,012 vendors, our system can evaluate any real corporate tech stack. More importantly, it proves our database indexing and full-text search architecture can handle big data at scale with sub-5 millisecond response times."*

### Q2: "Why use FAIR instead of existing standards like CVSS or ISO 27001?"
> **Answer:** *"CVSS only measures technical severity (e.g. 9.8 out of 10) in isolation. It does not consider asset value or likelihood. A CVSS 9.8 flaw on an isolated offline lab server causes ₹0 financial damage, while a CVSS 7.0 flaw on our core payment gateway could cost ₹10 Crores. ISO 27001 is a checklist of controls, not a mathematical loss model. FAIR translates technical vulnerabilities into exact financial terms (ALE in ₹) that executive boards understand."*

### Q3: "How does the Monte Carlo simulation improve accuracy?"
> **Answer:** *"In cybersecurity, losses are uncertain. Giving a single number like 'a breach will cost ₹50 Lakhs' is misleading. By running 10,000 statistical simulations using log-normal probability distributions, we generate a Loss Exceedance Curve showing the minimum, most likely (P50), and worst-case 90th percentile (P90) financial loss, giving management realistic risk boundaries."*

### Q4: "Why did you use the 0-1 Knapsack algorithm for defense budget optimization?"
> **Answer:** *"Every company has a limited security budget. You cannot buy every tool on the market. In computer science, selecting items with specific costs to maximize total value without exceeding a capacity limit is the classic 0-1 Knapsack problem. By mapping each security control's cost to the 'weight' and its risk reduction to the 'value', dynamic programming guarantees the mathematically optimal defense portfolio."*

### Q5: "How does live threat intelligence affect the risk calculation?"
> **Answer:** *"When our scraper discovers that a vulnerability is actively weaponized in the wild by ransomware groups (e.g. via CISA KEV or ThreatFox), the system dynamically increases Threat Event Frequency (TEF) by +0.30 attempts per year. This automatically flows through the FAIR engine to raise the scenario's Annualized Loss Expectancy, proving that external threat telemetry directly drives internal financial risk."*

---

## 6. Live Demonstration Steps for Your Guide (5-Minute Walkthrough)

When presenting to your guide, follow this exact sequence:

1. **Dashboard Overview (`/`)**:
   - Point to the **Total Inherent Exposure (₹ INR)** and show how high-risk scenarios are quantified financially.
2. **Detailed Scenario Breakdown**:
   - Click any scenario (e.g. *Ransomware Extortion* or *Core Banking API BOLA*).
   - Show the transparent mathematical derivation: **Threat Event Frequency $\times$ Vulnerability $\times$ Primary/Secondary Loss**.
3. **The Big Dataset Showcase (`/real-data`)**:
   - Go to **Historical Incidents & Data** ➔ click on **"CVE v5 National Catalog"**.
   - Show the banner: **216,413 Indexed CVEs, 22,012 Vendors, 12,647 Critical Flaws**.
   - Search for a famous CVE: type `CVE-2021-44228` (Log4Shell) or `CVE-2024-3400` (Palo Alto GlobalProtect).
   - Click the blue **"Simulate FAIR Risk"** button:
     - Show how it calculates the **Annual Risk Exposure (in ₹ Crores)**.
     - Show the **IBM 2024 sector benchmark** ($5.97M FinTech), the itemized loss breakdown (Downtime 28%, Incident Response 18%, DPDP Fines), and documented real breach losses!
4. **Budget Optimizer (`/optimizer`)**:
   - Move the Budget Slider (e.g. set to ₹40 Lakhs).
   - Click **Optimize Budget** to show how the Knapsack algorithm selects the exact best controls and plots the Inherent vs. Residual risk curve.
5. **Threat Intelligence Hub (`/threat-hub`)**:
   - Click the **Live Data Scraper** tab.
   - Show the **38+ live records** pulled from CISA, CERT-In, GitHub, and ThreatFox.
   - Click **"Scrape All Sources Now"** to demonstrate live real-time ingestion and log output.
