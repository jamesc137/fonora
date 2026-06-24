#!/usr/bin/env node
/** Run 100-concept language stress test against canonical roots. */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { runStressTest, generateStressTestMarkdown } from './fonoran-canonical-stabilization.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const registry = JSON.parse(await readFile(join(ROOT, 'data/fonoran-canonical-registry.json'), 'utf8'));
  const config = JSON.parse(await readFile(join(ROOT, 'data/fonoran-gen3-1-config.json'), 'utf8'));
  const concepts = JSON.parse(await readFile(join(ROOT, 'data/fonoran-stress-test-concepts.json'), 'utf8'));

  const report = runStressTest(concepts.concepts, registry, config);
  const md = generateStressTestMarkdown(report);
  const outMd = join(ROOT, 'reports/fonoran-stress-test.md');
  const outJson = join(ROOT, 'data/fonoran-stress-test-report.json');

  await mkdir(join(ROOT, 'reports'), { recursive: true });
  await writeFile(outMd, md + '\n');
  await writeFile(outJson, JSON.stringify(report, null, 2) + '\n');

  console.log(`Stress test: ${outMd}`);
  console.log(`Derived: ${report.derived_count}/${report.concept_count}`);
  console.log(`Avg readability: ${report.averages.readability} · elegance: ${report.averages.elegance}`);
  console.log(`Ambiguous: ${report.ambiguous_count}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
