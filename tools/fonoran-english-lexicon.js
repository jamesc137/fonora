/**
 * Concept lexicon for Fonoran naming tools.
 * Built from root candidates — concepts, not loose English words.
 */

import { writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConceptInventory, loadRuntimeConceptInventory } from './fonoran-concepts.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const LEXICON_PATH = join(ROOT, 'data/fonoran-english-lexicon.json');

/** @returns {Promise<{ version: string, concepts: object[], words: object[], categories: string[] }>} */
export async function buildEnglishLexicon(lab = null) {
  const inventory = lab
    ? await loadRuntimeConceptInventory({ lab })
    : await loadConceptInventory();
  const words = [];
  const seen = new Set();

  for (const c of inventory.concepts) {
    words.push({
      word: c.id,
      gloss: c.concept,
      category: c.domain,
      source: 'concept',
      concept_id: c.id,
      aliases: c.aliases,
      spelling: c.spelling,
    });
    for (const alias of c.aliases) {
      const a = alias.toLowerCase();
      if (seen.has(a)) continue;
      seen.add(a);
      if (a === c.id) continue;
      words.push({
        word: a,
        gloss: c.concept,
        category: c.domain,
        source: 'alias',
        concept_id: c.id,
        aliases: c.aliases,
        spelling: c.spelling,
      });
    }
  }

  words.sort((a, b) => a.word.localeCompare(b.word));
  const categories = [...new Set(inventory.concepts.map(c => c.domain))].sort();

  return {
    version: '2.0-concepts',
    description: 'Fonoran root concepts from root-candidates. Aliases support fuzzy English matching.',
    generated_at: new Date().toISOString(),
    concept_count: inventory.concept_count,
    word_count: words.length,
    categories,
    concepts: inventory.concepts,
    words,
  };
}

export async function writeEnglishLexicon() {
  const lexicon = await buildEnglishLexicon();
  await writeFile(LEXICON_PATH, JSON.stringify(lexicon, null, 2) + '\n');
  return lexicon;
}

export async function loadEnglishLexicon(lab = null) {
  const lexicon = await buildEnglishLexicon(lab);
  return lexicon;
}
