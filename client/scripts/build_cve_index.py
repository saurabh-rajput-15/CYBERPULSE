#!/usr/bin/env python3
"""
High-Performance CVE v5 SQLite Indexer for CYBERPULSE
Parses CVE JSON files from the official cvelistV5 dataset and indexes them into
a compact, fast SQLite database with FTS5 full-text search.
"""

import os
import glob
import json
import sqlite3
import time
from concurrent.futures import ThreadPoolExecutor

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)

CVELIST_DIR = os.path.join(WORKSPACE_DIR, 'cvelistV5')
if not os.path.exists(CVELIST_DIR):
    CVELIST_DIR = os.path.join(WORKSPACE_DIR, 'cvelistV5-main')

DB_PATH = os.path.join(BASE_DIR, 'data', 'cvelist_index.sqlite')

YEARS_TO_INDEX = ['2021', '2022', '2023', '2024', '2025', '2026']

def parse_cve_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as fp:
            d = json.load(fp)
            
        cve_meta = d.get('cveMetadata', {})
        cve_id = cve_meta.get('cveId')
        if not cve_id:
            return None
            
        parts = cve_id.split('-')
        year = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 2024
        assigner = cve_meta.get('assignerShortName') or ''
        date_published = (cve_meta.get('datePublished') or '')[:10]
        date_updated = (cve_meta.get('dateUpdated') or '')[:10]
        
        cna = d.get('containers', {}).get('cna', {})
        title = (cna.get('title') or '').strip()
        
        # Description
        description = ''
        for desc_item in cna.get('descriptions', []):
            if desc_item.get('lang') == 'en':
                description = desc_item.get('value', '').strip()
                break
        if not description and cna.get('descriptions'):
            description = cna['descriptions'][0].get('value', '').strip()
        # Truncate description for index to save memory/storage (full description available via detail)
        desc_indexed = description[:400]
        
        # Vendor & Product
        vendor = ''
        product = ''
        for aff in cna.get('affected', []):
            v = aff.get('vendor')
            p = aff.get('product')
            if v and v not in ('n/a', 'N/A', 'unknown') and not vendor:
                vendor = v
            if p and p not in ('n/a', 'N/A', 'unknown') and not product:
                product = p
            if vendor and product:
                break
                
        # Metrics / CVSS
        cvss_score = None
        severity = 'UNKNOWN'
        attack_vector = ''
        
        for metric in cna.get('metrics', []):
            cvss = (metric.get('cvssV3_1') or metric.get('cvssV3_0') or
                    metric.get('cvssV4_0') or metric.get('cvssV2_0'))
            if cvss:
                score = cvss.get('baseScore')
                if score is not None:
                    try:
                        cvss_score = float(score)
                    except (ValueError, TypeError):
                        pass
                sev = cvss.get('baseSeverity') or ''
                if sev:
                    severity = sev.upper()
                vec = cvss.get('attackVector') or ''
                if vec:
                    attack_vector = vec.upper()
                break
                
        # If severity is still unknown but we have a score, compute standard CVSS v3 severity
        if severity == 'UNKNOWN' and cvss_score is not None:
            if cvss_score >= 9.0:
                severity = 'CRITICAL'
            elif cvss_score >= 7.0:
                severity = 'HIGH'
            elif cvss_score >= 4.0:
                severity = 'MEDIUM'
            elif cvss_score > 0:
                severity = 'LOW'

        # Problem Types / CWE
        cwe_id = ''
        cwe_name = ''
        for pt in cna.get('problemTypes', []):
            for ptd in pt.get('descriptions', []):
                cid = ptd.get('cweId')
                cname = ptd.get('description') or ''
                if cid:
                    cwe_id = cid
                    cwe_name = cname
                    break
            if cwe_id:
                break

        # ADP / CISA Vulnrichment (SSVC decisions)
        exploitation = 'none'
        automatable = 'no'
        technical_impact = 'partial'
        
        for adp in d.get('containers', {}).get('adp', []):
            for m in adp.get('metrics', []):
                other = m.get('other', {})
                if other.get('type') == 'ssvc':
                    content = other.get('content', {})
                    options = content.get('options', [])
                    for opt in options:
                        if 'Exploitation' in opt:
                            exploitation = str(opt['Exploitation']).lower()
                        if 'Automatable' in opt:
                            automatable = str(opt['Automatable']).lower()
                        if 'Technical Impact' in opt:
                            technical_impact = str(opt['Technical Impact']).lower()

        # Relative path inside cvelistV5
        rel_path = os.path.relpath(file_path, CVELIST_DIR)

        return (
            cve_id,
            year,
            assigner[:60],
            title[:150],
            desc_indexed,
            vendor[:80],
            product[:80],
            cvss_score,
            severity[:15],
            attack_vector[:20],
            cwe_id[:20],
            cwe_name[:120],
            exploitation[:15],
            automatable[:10],
            technical_impact[:15],
            date_published,
            date_updated,
            rel_path
        )
    except Exception:
        return None

def main():
    print(f"=== CYBERPULSE CVE v5 Indexer ===")
    print(f"Dataset root: {CVELIST_DIR}")
    print(f"Target DB:    {DB_PATH}")

    if not os.path.exists(CVELIST_DIR):
        print(f"Error: {CVELIST_DIR} does not exist!")
        return

    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    temp_db_path = DB_PATH + '.tmp'
    if os.path.exists(temp_db_path):
        os.remove(temp_db_path)

    conn = sqlite3.connect(temp_db_path)
    conn.execute("PRAGMA journal_mode = WAL")
    conn.execute("PRAGMA synchronous = NORMAL")
    conn.execute("PRAGMA temp_store = MEMORY")
    conn.execute("PRAGMA cache_size = -100000") # 100MB cache

    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE cves (
        cve_id TEXT PRIMARY KEY,
        year INTEGER,
        assigner TEXT,
        title TEXT,
        description TEXT,
        vendor TEXT,
        product TEXT,
        cvss_score REAL,
        severity TEXT,
        attack_vector TEXT,
        cwe_id TEXT,
        cwe_name TEXT,
        exploitation TEXT,
        automatable TEXT,
        technical_impact TEXT,
        date_published TEXT,
        date_updated TEXT,
        rel_path TEXT
    )
    """)

    cur.execute("CREATE INDEX idx_cves_year_sev ON cves (year, severity)")
    cur.execute("CREATE INDEX idx_cves_score ON cves (cvss_score DESC)")
    cur.execute("CREATE INDEX idx_cves_vendor ON cves (vendor)")
    cur.execute("CREATE INDEX idx_cves_exploit ON cves (exploitation)")
    cur.execute("CREATE INDEX idx_cves_published ON cves (date_published DESC)")

    # Virtual FTS5 table
    cur.execute("""
    CREATE VIRTUAL TABLE cves_fts USING fts5(
        cve_id, title, description, vendor, product, cwe_id,
        content='cves', content_rowid='rowid'
    )
    """)

    all_files = []
    t_scan_start = time.time()
    for y in YEARS_TO_INDEX:
        year_path = os.path.join(CVELIST_DIR, 'cves', y)
        if os.path.exists(year_path):
            files = glob.glob(os.path.join(year_path, '*', '*.json'))
            print(f"  Year {y}: found {len(files):,} files")
            all_files.extend(files)

    print(f"Total files found to index: {len(all_files):,} in {time.time()-t_scan_start:.2f}s")

    t_parse_start = time.time()
    batch_size = 5000
    total_indexed = 0

    with ThreadPoolExecutor(max_workers=10) as executor:
        for i in range(0, len(all_files), batch_size):
            chunk = all_files[i:i+batch_size]
            results = list(executor.map(parse_cve_file, chunk))
            valid_rows = [r for r in results if r is not None]
            
            cur.executemany("""
            INSERT OR IGNORE INTO cves (
                cve_id, year, assigner, title, description, vendor, product,
                cvss_score, severity, attack_vector, cwe_id, cwe_name,
                exploitation, automatable, technical_impact,
                date_published, date_updated, rel_path
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, valid_rows)
            
            total_indexed += len(valid_rows)
            elapsed = time.time() - t_parse_start
            rate = total_indexed / elapsed if elapsed > 0 else 0
            print(f"  Indexed {total_indexed:,} / {len(all_files):,} ({total_indexed/len(all_files)*100:.1f}%) - {rate:.0f} files/s", end='\r')

    conn.commit()
    print(f"\nFinished parsing & inserting {total_indexed:,} records in {time.time()-t_parse_start:.2f}s!")

    print("Building full-text search index (FTS5)...")
    t_fts = time.time()
    cur.execute("INSERT INTO cves_fts(cves_fts) VALUES('rebuild')")
    conn.commit()
    print(f"FTS5 index built in {time.time()-t_fts:.2f}s!")

    # Check stats
    cur.execute("SELECT COUNT(*), COUNT(DISTINCT vendor), SUM(CASE WHEN severity='CRITICAL' THEN 1 ELSE 0 END), SUM(CASE WHEN exploitation IN ('active', 'poc') THEN 1 ELSE 0 END) FROM cves")
    row = cur.fetchone()
    print(f"Database Stats:")
    print(f"  Total CVEs:        {row[0]:,}")
    print(f"  Unique Vendors:    {row[1]:,}")
    print(f"  Critical CVEs:     {row[2]:,}")
    print(f"  Active/PoC Exploits: {row[3]:,}")

    conn.close()

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
    os.rename(temp_db_path, DB_PATH)

    db_size_mb = os.path.getsize(DB_PATH) / (1024 * 1024)
    print(f"Successfully generated {DB_PATH} ({db_size_mb:.2f} MB)")

if __name__ == '__main__':
    main()
