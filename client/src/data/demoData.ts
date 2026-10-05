import { OrganizationProfile, RiskScenario, CandidateControl, CisaKevFeedItem } from '../types';

export const fintechOrg: OrganizationProfile = {
  id: 'org-apexfin',
  name: 'ApexFin Technologies Pvt. Ltd.',
  industry: 'Fintech & Cloud Payments Infrastructure',
  annualRevenueINR: 850000000, // ₹85 Crores
  assetsMonitored: 420,
  criticalDatabases: 14,
  cloudWorkloads: 180,
  complianceFramework: 'RBI Cyber Security Framework & DPDP Act 2023',
  currency: 'INR (₹)',
};

export const healthcareOrg: OrganizationProfile = {
  id: 'org-pulsehealth',
  name: 'PulseHealth MedTech Systems',
  industry: 'Hospitality & Diagnostic Health Networks',
  annualRevenueINR: 620000000, // ₹62 Crores
  assetsMonitored: 310,
  criticalDatabases: 9,
  cloudWorkloads: 130,
  complianceFramework: 'DISHA Health Data Privacy & ISO 27799',
  currency: 'INR (₹)',
};

export const initialCandidateControls: CandidateControl[] = [
  {
    id: 'ctrl-01',
    code: 'CTRL-01',
    name: 'Air-Gapped Immutable Backups & Object Lock',
    category: 'Protection',
    annualCostINR: 1200000, // ₹12,00,000 (12 Lakhs)
    description: 'Cryptographically sealed, write-once-read-many (WORM) storage for transactional databases and master secrets.',
    targetScenarioIds: ['scen-01'],
    effectivenessPercent: 0.65, // 65% loss reduction in ransomware scenario
    implementationTimeDays: 14,
    keyBenefits: [
      'Guarantees 4-hour RTO even if hypervisor is encrypted',
      'Prevents ransom payout coercion through reliable restoration',
      'Neutralizes extortion threats targeting backup catalogs'
    ]
  },
  {
    id: 'ctrl-02',
    code: 'CTRL-02',
    name: 'Real-time CSPM & Automated Drift Remediation',
    category: 'Detection',
    annualCostINR: 850000, // ₹8,50,000 (8.5 Lakhs)
    description: 'Continuous cloud security posture management engine with automated policy checks for S3 buckets, IAM roles, and public gateways.',
    targetScenarioIds: ['scen-02'],
    effectivenessPercent: 0.75, // 75% risk reduction in cloud misconfigurations
    implementationTimeDays: 7,
    keyBenefits: [
      'Detects public object bucket drift in under 30 seconds',
      'Auto-revokes over-permissive IAM wildcard grants',
      'Maps misconfigurations to CIS Cloud Foundations Benchmark'
    ]
  },
  {
    id: 'ctrl-03',
    code: 'CTRL-03',
    name: 'Adaptive Bot Defense & API Gateway Rate Limiting',
    category: 'Protection',
    annualCostINR: 1500000, // ₹15,00,000 (15 Lakhs)
    description: 'Behavioral fingerprinting and machine-learning bot mitigation at the edge to block automated credential stuffing and scraping.',
    targetScenarioIds: ['scen-03'],
    effectivenessPercent: 0.70, // 70% risk reduction in credential stuffing
    implementationTimeDays: 10,
    keyBenefits: [
      'Drops 99.4% of credential stuffing traffic before auth microservice',
      'Reduces unnecessary compute overhead on payment endpoints',
      'Blocks residential proxy rotation attacks automatically'
    ]
  },
  {
    id: 'ctrl-04',
    code: 'CTRL-04',
    name: 'Automated SBOM & Dependency Vulnerability Quarantine',
    category: 'Governance',
    annualCostINR: 600000, // ₹6,00,000 (6 Lakhs)
    description: 'Continuous scanning of third-party libraries, NPM/PyPI packages, and SDKs with CI/CD build blocking on critical CVEs.',
    targetScenarioIds: ['scen-04'],
    effectivenessPercent: 0.55, // 55% risk reduction in supply chain
    implementationTimeDays: 5,
    keyBenefits: [
      'Blocks malicious upstream packages before deployment to production',
      'Maintains real-time inventory of all open-source packages in use',
      'Alerts security engineers within minutes of zero-day disclosures'
    ]
  },
  {
    id: 'ctrl-05',
    code: 'CTRL-05',
    name: '24/7 Managed Detection & Response (MDR / SOC)',
    category: 'Detection',
    annualCostINR: 2400000, // ₹24,00,000 (24 Lakhs)
    description: 'Around-the-clock threat hunting team with EDR agents deployed across all critical payment servers and developer workstations.',
    targetScenarioIds: ['scen-01', 'scen-03'],
    effectivenessPercent: 0.45, // 45% risk reduction across targeted high-impact scenarios
    implementationTimeDays: 21,
    keyBenefits: [
      'Sub-15 minute mean time to detect (MTTD) on anomalous execution',
      'Automated host isolation when active beaconing is spotted',
      'Direct coordination with CERT-In and incident response forensics'
    ]
  },
  {
    id: 'ctrl-06',
    code: 'CTRL-06',
    name: 'Micro-segmentation & Zero-Trust Network Access (ZTNA)',
    category: 'Protection',
    annualCostINR: 1800000, // ₹18,00,000 (18 Lakhs)
    description: 'Strict identity-aware perimeter controls between Kubernetes namespaces, payment VPCs, and administrative bastion hosts.',
    targetScenarioIds: ['scen-01', 'scen-02'],
    effectivenessPercent: 0.50, // 50% risk reduction
    implementationTimeDays: 30,
    keyBenefits: [
      'Prevents lateral movement from web tier to core database tier',
      'Eliminates persistent VPN access vulnerabilities',
      'Enforces mTLS across internal microservice communication'
    ]
  }
];

export const initialFintechScenarios: RiskScenario[] = [
  {
    id: 'scen-01',
    title: 'Ransomware & Double Extortion on Payment Core DB',
    category: 'Ransomware',
    threatActor: 'Organized Cybercrime Syndicate (LockBit / BlackCat style)',
    targetedAsset: 'PostgreSQL RDS Cluster & Settlement Ledger',
    description: 'Threat actor leverages exposed edge appliance or compromised credentials to execute double-extortion ransomware on primary customer transactional data.',
    activelyExploitedInWild: true, // Correlated with CISA KEV CVE-2024-3400
    statusSeverity: 'CRITICAL',
    mitigationControlIds: ['ctrl-01', 'ctrl-05', 'ctrl-06'],
    linkedCVEs: [
      {
        cveId: 'CVE-2024-3400',
        vulnerabilityName: 'Palo Alto PAN-OS Command Injection',
        vendorProject: 'Palo Alto Networks',
        product: 'PAN-OS GlobalProtect',
        dateAdded: '2024-04-12',
        shortDescription: 'Command injection vulnerability in the GlobalProtect feature enables unauthenticated remote code execution.',
        isActivelyExploited: true,
        cvssScore: 10.0
      },
      {
        cveId: 'CVE-2023-34362',
        vulnerabilityName: 'MOVEit Transfer SQL Injection Vulnerability',
        vendorProject: 'Progress Software',
        product: 'MOVEit Transfer',
        dateAdded: '2023-06-02',
        shortDescription: 'SQL injection leading to unauthorized access and mass data exfiltration prior to ransomware deployment.',
        isActivelyExploited: true,
        cvssScore: 9.8
      }
    ],
    fair: {
      tef: 2.0, // 2.0 threat events attempted per year
      tefSource: 'CERT-In Annual FinTech Sector Threat Telemetry 2024 (Table 3.4)',
      threatCapability: 0.80, // High threat actor capability
      threatCapabilitySource: 'MITRE ATT&CK Group T1486 (LockBit 3.0 / BlackCat RaaS)',
      controlStrength: 0.55, // Baseline controls
      controlStrengthSource: 'CIS Critical Security Controls v8 Audit Score (ApexFin: 55/100)',
      vulnerability: 0.65, // P(TCap > CS) ~ 65%
      lef: 1.30, // 2.0 * 0.65 = 1.30 loss events/year
      primaryLoss: {
        incidentResponseINR: 0,
        businessInterruptionINR: 0,
        systemRecoveryINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      secondaryLoss: {
        regulatoryFinesINR: 0,
        reputationalChurnINR: 0,
        legalAndNotificationINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      lossMagnitudeINR: 0,
      annualRiskINR: 0,
      benchmarkSource: 'Fallback demo — real data unavailable'
    }
  },
  {
    id: 'scen-02',
    title: 'Cloud IAM Privilege Escalation & KYC S3 Data Leak',
    category: 'Cloud Misconfiguration',
    threatActor: 'External Opportunistic Attacker & Disgruntled Contractor',
    targetedAsset: 'AWS S3 Customer Verification (KYC) Store & IAM Roles',
    description: 'Misconfigured public read ACL or excessive wildcard IAM permission leads to unauthenticated exfiltration of Aadhaar/PAN identity documents.',
    activelyExploitedInWild: false,
    statusSeverity: 'HIGH',
    mitigationControlIds: ['ctrl-02', 'ctrl-06'],
    linkedCVEs: [
      {
        cveId: 'CVE-2023-4966',
        vulnerabilityName: 'Citrix NetScaler ADC Information Disclosure (Citrix Bleed)',
        vendorProject: 'Citrix',
        product: 'NetScaler ADC and Gateway',
        dateAdded: '2023-10-18',
        shortDescription: 'Buffer overflow vulnerability in NetScaler allows extraction of persistent session tokens.',
        isActivelyExploited: true,
        cvssScore: 9.4
      }
    ],
    fair: {
      tef: 3.0, // 3.0 threat events per year
      tefSource: 'AWS GuardDuty & CloudTrail anomalous reconnaissance logs (3 per annum)',
      threatCapability: 0.65,
      threatCapabilitySource: 'Opportunistic external cloud scanners & automated reconnaissance scripts',
      controlStrength: 0.60,
      controlStrengthSource: 'AWS Security Hub CIS AWS Foundations Benchmark (ApexFin: 60/100)',
      vulnerability: 0.50, // 50% probability of breach
      lef: 1.50, // 3.0 * 0.50 = 1.50 events/year
      primaryLoss: {
        incidentResponseINR: 0,
        businessInterruptionINR: 0,
        systemRecoveryINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      secondaryLoss: {
        regulatoryFinesINR: 0,
        reputationalChurnINR: 0,
        legalAndNotificationINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      lossMagnitudeINR: 0,
      annualRiskINR: 0,
      benchmarkSource: 'Fallback demo — real data unavailable'
    }
  },
  {
    id: 'scen-03',
    title: 'Automated Credential Stuffing & Merchant Account Takeover',
    category: 'Credential Stuffing',
    threatActor: 'Distributed Botnet Operator (Proxy-based scraping swarm)',
    targetedAsset: 'Merchant Auth API & Payment Gateway Portal',
    description: 'High-frequency credential stuffing campaign against merchant login endpoints using credential dumps from unrelated commercial breaches.',
    activelyExploitedInWild: false,
    statusSeverity: 'HIGH',
    mitigationControlIds: ['ctrl-03', 'ctrl-05'],
    linkedCVEs: [
      {
        cveId: 'CVE-2023-22515',
        vulnerabilityName: 'Atlassian Confluence Broken Access Control',
        vendorProject: 'Atlassian',
        product: 'Confluence Server and Data Center',
        dateAdded: '2023-10-04',
        shortDescription: 'Privilege escalation allowing unauthenticated attackers to create admin accounts.',
        isActivelyExploited: true,
        cvssScore: 10.0
      }
    ],
    fair: {
      tef: 10.0, // 10 bot campaigns per year
      tefSource: 'Akamai & Cloudflare WAF bot intelligence (~10 distributed waves annually)',
      threatCapability: 0.50,
      threatCapabilitySource: 'Commodity proxy-rotating credential stuffing botnets (Sentry MBA / OpenBullet)',
      controlStrength: 0.55,
      controlStrengthSource: 'Web Application Firewall edge rate limiting (55% efficacy against residential proxies)',
      vulnerability: 0.45,
      lef: 4.50, // 10.0 * 0.45 = 4.50 events/year
      primaryLoss: {
        incidentResponseINR: 0,
        businessInterruptionINR: 0,
        systemRecoveryINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      secondaryLoss: {
        regulatoryFinesINR: 0,
        reputationalChurnINR: 0,
        legalAndNotificationINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      lossMagnitudeINR: 0,
      annualRiskINR: 0,
      benchmarkSource: 'Fallback demo — real data unavailable'
    }
  },
  {
    id: 'scen-04',
    title: 'Third-Party SDK / NPM Dependency Supply Chain Poisoning',
    category: 'Supply Chain',
    threatActor: 'Nation-State / Advanced Persistent Threat (APT29 / UNC style)',
    targetedAsset: 'CI/CD Pipeline & Payment Checkout JS Bundle',
    description: 'Compromise of an open-source analytics dependency embedded within the payment checkout iframe to harvest card numbers and CVV codes.',
    activelyExploitedInWild: false,
    statusSeverity: 'MEDIUM',
    mitigationControlIds: ['ctrl-04'],
    linkedCVEs: [
      {
        cveId: 'CVE-2023-38606',
        vulnerabilityName: 'Apple iOS/macOS WebKit Zero-Day',
        vendorProject: 'Apple',
        product: 'WebKit',
        dateAdded: '2023-07-26',
        shortDescription: 'Memory corruption leading to unauthorized web-context code execution.',
        isActivelyExploited: true,
        cvssScore: 8.8
      }
    ],
    fair: {
      tef: 1.0,
      tefSource: 'Sonatype 2024: 1 major dependency typosquatting or poisoned sub-dependency detected per annum',
      threatCapability: 0.80,
      threatCapabilitySource: 'Targeted supply-chain threat actors (Magecart / Lazarus checkout skimmers)',
      controlStrength: 0.50,
      controlStrengthSource: 'Current npm audit in CI/CD pipeline (50% coverage, lacks real-time runtime monitoring)',
      vulnerability: 0.70,
      lef: 0.70, // 1.0 * 0.70 = 0.70 events/year
      primaryLoss: {
        incidentResponseINR: 0,
        businessInterruptionINR: 0,
        systemRecoveryINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      secondaryLoss: {
        regulatoryFinesINR: 0,
        reputationalChurnINR: 0,
        legalAndNotificationINR: 0,
        totalINR: 0,
        breakdownDetails: 'Pending real data load'
      },
      lossMagnitudeINR: 0,
      annualRiskINR: 0,
      benchmarkSource: 'Fallback demo — real data unavailable'
    }
  }
];

export const fallbackCisaFeedItems: CisaKevFeedItem[] = [
  {
    cveID: 'CVE-2024-3400',
    vendorProject: 'Palo Alto Networks',
    product: 'PAN-OS GlobalProtect',
    vulnerabilityName: 'PAN-OS GlobalProtect Remote Code Execution',
    dateAdded: '2024-04-12',
    shortDescription: 'Command injection vulnerability in PAN-OS GlobalProtect gateway enables unauthenticated attackers to execute arbitrary OS commands with root privileges.',
    requiredAction: 'Apply vendor hotfixes or mitigate telemetry buffer inspection per vendor guidance.',
    dueDate: '2024-04-19',
    knownRansomwareCampaignUse: 'Known',
    matchedScenarioId: 'scen-01'
  },
  {
    cveID: 'CVE-2023-34362',
    vendorProject: 'Progress Software',
    product: 'MOVEit Transfer',
    vulnerabilityName: 'MOVEit Transfer SQL Injection Vulnerability',
    dateAdded: '2023-06-02',
    shortDescription: 'SQL injection vulnerability in MOVEit Transfer web application could allow an unauthenticated attacker to gain unauthorized access to database contents.',
    requiredAction: 'Apply vendor patches immediately and audit database access logs.',
    dueDate: '2023-06-16',
    knownRansomwareCampaignUse: 'Known',
    matchedScenarioId: 'scen-01'
  },
  {
    cveID: 'CVE-2023-4966',
    vendorProject: 'Citrix',
    product: 'NetScaler ADC and Gateway',
    vulnerabilityName: 'Citrix Bleed Sensitive Information Disclosure',
    dateAdded: '2023-10-18',
    shortDescription: 'Memory buffer leak in NetScaler ADC allows unauthorized threat actors to extract authenticated session tokens, bypassing MFA.',
    requiredAction: 'Upgrade to patched firmware and invalidate all active session tokens.',
    dueDate: '2023-11-08',
    knownRansomwareCampaignUse: 'Known',
    matchedScenarioId: 'scen-02'
  },
  {
    cveID: 'CVE-2023-22515',
    vendorProject: 'Atlassian',
    product: 'Confluence Server and Data Center',
    vulnerabilityName: 'Confluence Broken Access Control Vulnerability',
    dateAdded: '2023-10-04',
    shortDescription: 'Improper access control in publicly accessible Confluence endpoints enables creation of administrative accounts.',
    requiredAction: 'Upgrade to fixed version or block external access to setup endpoints.',
    dueDate: '2023-10-25',
    knownRansomwareCampaignUse: 'Known',
    matchedScenarioId: 'scen-03'
  },
  {
    cveID: 'CVE-2023-38606',
    vendorProject: 'Apple',
    product: 'WebKit & Safari',
    vulnerabilityName: 'Apple WebKit Zero-Day Memory Corruption',
    dateAdded: '2023-07-26',
    shortDescription: 'A state violation in WebKit allows arbitrary code execution during processing of malicious third-party script web payloads.',
    requiredAction: 'Apply latest operating system and browser runtime security patches.',
    dueDate: '2023-08-16',
    knownRansomwareCampaignUse: 'Unknown',
    matchedScenarioId: 'scen-04'
  },
  {
    cveID: 'CVE-2024-21887',
    vendorProject: 'Ivanti',
    product: 'Connect Secure and Policy Secure',
    vulnerabilityName: 'Ivanti Command Injection Vulnerability',
    dateAdded: '2024-01-12',
    shortDescription: 'A command injection vulnerability in web components allows authenticated administrators to send crafted requests and execute arbitrary commands on the appliance.',
    requiredAction: 'Apply vendor mitigation patch or factory reset appliance.',
    dueDate: '2024-01-22',
    knownRansomwareCampaignUse: 'Known',
    matchedScenarioId: 'scen-01'
  },
  {
    cveID: 'CVE-2024-1709',
    vendorProject: 'ConnectWise',
    product: 'ScreenConnect',
    vulnerabilityName: 'ConnectWise ScreenConnect Authentication Bypass',
    dateAdded: '2024-02-22',
    shortDescription: 'Authentication bypass allows an attacker with network access to the management console to create administrative accounts without credentials.',
    requiredAction: 'Upgrade to ScreenConnect version 23.9.8 or higher.',
    dueDate: '2024-02-29',
    knownRansomwareCampaignUse: 'Known',
    matchedScenarioId: 'scen-02'
  }
];
