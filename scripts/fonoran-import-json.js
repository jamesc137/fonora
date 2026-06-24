#!/usr/bin/env node
/**
 * Import local fonoran-sound-bucket.json into PostgreSQL.
 * Does not delete the JSON file.
 */
import { importJsonToPostgres, BUCKET_PATH, closeStore } from '../tools/fonoran-store.js';

const jsonPath = process.argv[2] || BUCKET_PATH;

try {
  const result = await importJsonToPostgres(jsonPath);
  console.log(`Imported ${result.sounds} roots and ${result.compounds} words from ${result.from}`);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await closeStore();
}
