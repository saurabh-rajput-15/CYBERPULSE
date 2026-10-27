#!/usr/bin/env tsx
/**
 * Fast Batch Synchronizer: SQLite cvelist_index -> Supabase Cloud PostgreSQL
 * Streams all 216k+ records from local SQLite directly into Supabase in concurrent batches.
 */

import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in client/.env');
  process.exit(1);
}

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'cvelist_index.sqlite');
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Error: SQLite index not found at ${DB_PATH}`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

const BATCH_SIZE = 500;
const CONCURRENCY = 1;

// Parse optional --start-offset
const startArgIdx = process.argv.indexOf('--start-offset');
const START_OFFSET = startArgIdx !== -1 && process.argv[startArgIdx + 1] ? Number(process.argv[startArgIdx + 1]) : 0;

async function uploadBatchWithRetry(rows: any[], offset: number, maxRetries = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { error } = await supabase.from('cves').upsert(rows);
      if (error) throw error;
      return;
    } catch (err: any) {
      if (attempt === maxRetries) {
        console.error(`\n❌ Failed batch at offset ${offset} after ${maxRetries} attempts:`, err.message || err);
        throw err;
      }
      const backoffMs = attempt * 1500;
      await new Promise((r) => setTimeout(r, backoffMs));
    }
  }
}

async function runSync() {
  console.log('====================================================');
  console.log('   CYBERPULSE: Syncing CVElistV5 to Supabase Cloud  ');
  console.log('====================================================');
  console.log(`📡 Target: ${SUPABASE_URL}`);
  console.log(`📁 Source: ${DB_PATH}`);

  const db = new DatabaseSync(DB_PATH, { readOnly: true });
  const countRow = db.prepare('SELECT COUNT(*) as count FROM cves').get() as { count: number };
  const totalRows = countRow.count;
  console.log(`📊 Total records to sync: ${totalRows.toLocaleString()}`);

  const selectStmt = db.prepare(`
    SELECT
      cve_id, year, assigner, title, description, vendor, product,
      cvss_score, severity, attack_vector, cwe_id, cwe_name,
      exploitation, automatable, technical_impact,
      date_published, date_updated
    FROM cves
    ORDER BY year DESC, cve_id ASC
    LIMIT ? OFFSET ?
  `);

  const startTime = Date.now();
  let uploadedCount = START_OFFSET;
  let currentOffset = START_OFFSET;

  async function worker() {
    while (true) {
      const offset = currentOffset;
      currentOffset += BATCH_SIZE;
      if (offset >= totalRows) break;

      const rawRows = selectStmt.all(BATCH_SIZE, offset) as any[];
      if (rawRows.length === 0) break;

      // Sanitize fields for PostgreSQL date/numeric types
      const sanitized = rawRows.map((r) => ({
        ...r,
        date_published: r.date_published && r.date_published.trim() ? r.date_published.slice(0, 10) : null,
        date_updated: r.date_updated && r.date_updated.trim() ? r.date_updated.slice(0, 10) : null,
        cvss_score: typeof r.cvss_score === 'number' && !isNaN(r.cvss_score) ? r.cvss_score : null,
        year: typeof r.year === 'number' ? r.year : null
      }));

      await uploadBatchWithRetry(sanitized, offset);
      uploadedCount += sanitized.length;

      const elapsedSec = (Date.now() - startTime) / 1000;
      const rate = Math.round(uploadedCount / (elapsedSec || 1));
      const remainingRows = totalRows - uploadedCount;
      const etaSec = rate > 0 ? Math.round(remainingRows / rate) : 0;
      const pct = ((uploadedCount / totalRows) * 100).toFixed(1);

      process.stdout.write(
        `\r⏳ [${pct}%] ${uploadedCount.toLocaleString()} / ${totalRows.toLocaleString()} synced | ${rate.toLocaleString()} rows/s | ETA: ${etaSec}s    `
      );
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n\n✅ Sync complete!');
  console.log(`⏱️  Total time: ${totalTime}s`);

  // Verify total count in Supabase
  const { count, error } = await supabase.from('cves').select('*', { count: 'exact', head: true });
  if (!error) {
    console.log(`🎉 Supabase Cloud CVE Total Count: ${count?.toLocaleString()}`);
  }
  console.log('====================================================\n');
}

runSync().catch((err) => {
  console.error('\nFatal sync error:', err);
  process.exit(1);
});
