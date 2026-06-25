#!/usr/bin/env node
/**
 * Export PostgreSQL lab bucket to JSON backup.
 */
import { exportPostgresToJson, BUCKET_PATH, closeStore } from '../tools/fonoran-store.js';

const jsonPath = process.argv[2] || BUCKET_PATH;

try {
  const result = await exportPostgresToJson(jsonPath);
  console.log(`Exported ${result.sounds} roots and ${result.compounds} words to ${result.to}`);
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
} finally {
  await closeStore();
}
