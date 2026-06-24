/**
 * Fonoran lab storage — PostgreSQL when configured, JSON file fallback.
 * Local JSON is never deleted; it remains the portable backup format.
 */

import { readFile, writeFile, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const BUCKET_PATH = join(ROOT, 'data/fonoran-sound-bucket.json');

const SCHEMA_VERSION = 1;

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS fonoran_lab_meta (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  schema_version INTEGER NOT NULL DEFAULT 1,
  imported_from_json_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS fonoran_lab_bucket (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  version TEXT,
  philosophy TEXT,
  seeded_from TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  compounds JSONB NOT NULL DEFAULT '[]'::jsonb,
  history JSONB NOT NULL DEFAULT '[]'::jsonb,
  events JSONB NOT NULL DEFAULT '[]'::jsonb
);

INSERT INTO fonoran_lab_meta (id, schema_version)
VALUES (1, ${SCHEMA_VERSION})
ON CONFLICT (id) DO NOTHING;
`;

/** @returns {'json' | 'postgres'} */
export function resolveStorageMode() {
  const explicit = process.env.FONORAN_STORAGE?.trim().toLowerCase();
  if (explicit === 'json') return 'json';
  if (explicit === 'postgres') return 'postgres';
  if (process.env.DATABASE_URL) return 'postgres';
  return 'json';
}

let pool = null;

async function getPool() {
  if (pool) return pool;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is not set');
  const { default: pg } = await import('pg');
  pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.PGSSLMODE === 'disable' ? false : { rejectUnauthorized: false },
  });
  return pool;
}

export async function ensurePgSchema() {
  const client = await (await getPool()).connect();
  try {
    await client.query(INIT_SQL);
  } finally {
    client.release();
  }
}

function bucketFromRow(row) {
  return {
    version: row.version ?? '2.0-blank-slate',
    philosophy: row.philosophy ?? null,
    seeded_from: row.seeded_from ?? null,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at,
    sounds: row.sounds ?? [],
    compounds: row.compounds ?? [],
    history: row.history ?? [],
    events: row.events ?? [],
  };
}

async function readBucketFromJson() {
  try {
    return JSON.parse(await readFile(BUCKET_PATH, 'utf8'));
  } catch {
    return null;
  }
}

async function writeBucketToJson(bucket) {
  await writeFile(BUCKET_PATH, JSON.stringify(bucket, null, 2) + '\n');
}

async function readBucketFromPg() {
  await ensurePgSchema();
  const client = await (await getPool()).connect();
  try {
    const { rows } = await client.query('SELECT * FROM fonoran_lab_bucket WHERE id = 1');
    if (!rows.length) return null;
    return bucketFromRow(rows[0]);
  } finally {
    client.release();
  }
}

async function writeBucketToPg(bucket) {
  await ensurePgSchema();
  const client = await (await getPool()).connect();
  try {
    await client.query(
      `INSERT INTO fonoran_lab_bucket (id, version, philosophy, seeded_from, updated_at, sounds, compounds, history, events)
       VALUES (1, $1, $2, $3, $4, $5::jsonb, $6::jsonb, $7::jsonb, $8::jsonb)
       ON CONFLICT (id) DO UPDATE SET
         version = EXCLUDED.version,
         philosophy = EXCLUDED.philosophy,
         seeded_from = EXCLUDED.seeded_from,
         updated_at = EXCLUDED.updated_at,
         sounds = EXCLUDED.sounds,
         compounds = EXCLUDED.compounds,
         history = EXCLUDED.history,
         events = EXCLUDED.events`,
      [
        bucket.version ?? null,
        bucket.philosophy ?? null,
        bucket.seeded_from ?? null,
        bucket.updated_at ?? new Date().toISOString(),
        JSON.stringify(bucket.sounds ?? []),
        JSON.stringify(bucket.compounds ?? []),
        JSON.stringify(bucket.history ?? []),
        JSON.stringify(bucket.events ?? []),
      ],
    );
  } finally {
    client.release();
  }
}

export async function pgBucketIsEmpty() {
  if (resolveStorageMode() !== 'postgres') return true;
  const bucket = await readBucketFromPg();
  if (!bucket) return true;
  return (bucket.sounds?.length ?? 0) === 0 && (bucket.compounds?.length ?? 0) === 0;
}

async function jsonFileExists() {
  try {
    await access(BUCKET_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read the raw bucket object from the active store.
 * @returns {Promise<object | null>}
 */
export async function readBucketRaw() {
  if (resolveStorageMode() === 'postgres') {
    return readBucketFromPg();
  }
  return readBucketFromJson();
}

/**
 * Persist the raw bucket object to the active store.
 * JSON backup is also written when using PostgreSQL (unless FONORAN_SKIP_JSON_MIRROR=1).
 */
export async function writeBucketRaw(bucket) {
  bucket.updated_at = new Date().toISOString();
  if (resolveStorageMode() === 'postgres') {
    await writeBucketToPg(bucket);
    if (process.env.FONORAN_SKIP_JSON_MIRROR !== '1') {
      await writeBucketToJson(bucket);
    }
    return bucket;
  }
  await writeBucketToJson(bucket);
  return bucket;
}

/**
 * Import bucket JSON from disk into PostgreSQL (does not delete the JSON file).
 * @param {string} [jsonPath]
 */
export async function importJsonToPostgres(jsonPath = BUCKET_PATH) {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for PostgreSQL import');
  }
  const raw = await readFile(jsonPath, 'utf8');
  const bucket = JSON.parse(raw);
  await writeBucketToPg(bucket);

  await ensurePgSchema();
  const client = await (await getPool()).connect();
  try {
    await client.query(
      `INSERT INTO fonoran_lab_meta (id, schema_version, imported_from_json_at)
       VALUES (1, $1, NOW())
       ON CONFLICT (id) DO UPDATE SET imported_from_json_at = NOW()`,
      [SCHEMA_VERSION],
    );
  } finally {
    client.release();
  }

  return {
    imported: true,
    from: jsonPath,
    sounds: bucket.sounds?.length ?? 0,
    compounds: bucket.compounds?.length ?? 0,
  };
}

/**
 * Export PostgreSQL bucket to a JSON file (backup).
 * @param {string} [jsonPath]
 */
export async function exportPostgresToJson(jsonPath = BUCKET_PATH) {
  const bucket = await readBucketFromPg();
  if (!bucket) throw new Error('PostgreSQL lab bucket is empty');
  await writeFile(jsonPath, JSON.stringify(bucket, null, 2) + '\n');
  return {
    exported: true,
    to: jsonPath,
    sounds: bucket.sounds?.length ?? 0,
    compounds: bucket.compounds?.length ?? 0,
  };
}

/**
 * On server startup: if PostgreSQL is empty and local JSON exists, import it.
 */
export async function maybeAutoImportOnStartup() {
  if (resolveStorageMode() !== 'postgres') return { skipped: true, reason: 'json mode' };
  const empty = await pgBucketIsEmpty();
  if (!empty) return { skipped: true, reason: 'postgres already has data' };
  if (!(await jsonFileExists())) return { skipped: true, reason: 'no local json file' };

  const jsonBucket = await readBucketFromJson();
  if (!jsonBucket) return { skipped: true, reason: 'json unreadable' };
  if ((jsonBucket.sounds?.length ?? 0) === 0 && (jsonBucket.compounds?.length ?? 0) === 0) {
    return { skipped: true, reason: 'json bucket empty' };
  }

  const result = await importJsonToPostgres(BUCKET_PATH);
  console.log(
    `Fonoran: imported local JSON into PostgreSQL (${result.sounds} roots, ${result.compounds} words)`,
  );
  return { imported: true, ...result };
}

export async function closeStore() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
