#!/usr/bin/env node
/**
 * One-time repair: push live lab spellings into root-candidates + approved-roots.
 * CLI: npm run fonoran:reconcile-inventory
 */

import { reconcileInventoryFromLab } from '../tools/fonoran-root-store.js';

const result = await reconcileInventoryFromLab();
console.log(`Reconciled ${result.reconciled} concept(s) from lab.`);
for (const item of result.items) {
  console.log(`  ${item.concept_id} → ${item.spelling} (${item.state})`);
}
