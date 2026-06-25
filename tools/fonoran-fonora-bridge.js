/**
 * Map Fonoran roman spellings to Fonora script symbols via language-rules.md.
 */
import { parseSyllable } from './fonoran-pronunciation.js';
import { encodeSounds } from '../js/encode.js';

/** Roman syllable → concatenated phoneme-key string for encodeSounds. */
export function syllableToPhonemeString(spelling) {
  const s = parseSyllable(spelling);
  if (!s || s.unparsed) return null;
  return [s.onset, s.vowel, s.coda].filter(Boolean).join('');
}

/** One roman phoneme piece (onset, vowel, or coda) → Fonora glyphs. */
export function pieceToFonoraSymbols(piece, rules) {
  if (!piece || !rules) return '';
  const { symbols, warnings } = encodeSounds(piece, rules);
  if (!symbols || symbols === '?' || warnings?.length) return '';
  return symbols;
}

/** One roman syllable → Fonora glyphs. */
export function syllableToFonoraSymbols(spelling, rules) {
  const phonemeString = syllableToPhonemeString(spelling);
  if (!phonemeString || !rules) return { symbols: '', phonemeString: null, warnings: ['Could not parse syllable'] };
  const encoded = encodeSounds(phonemeString, rules);
  return { symbols: encoded.symbols, phonemeString, warnings: encoded.warnings };
}

/** Sound or compound (parts array) → Fonora script phrase (syllables coinjoined: one word, no spaces). */
export function romanToFonoraScript(input, rules) {
  if (!rules) return { phrase: '', syllables: [], warnings: ['Rules not loaded'] };
  const parts = Array.isArray(input) ? input : [input];
  const syllables = [];
  const warnings = [];
  for (const roman of parts) {
    const row = syllableToFonoraSymbols(roman, rules);
    syllables.push({ roman, symbols: row.symbols, phonemeString: row.phonemeString });
    if (row.warnings?.length) warnings.push(...row.warnings);
  }
  const phrase = syllables.map(s => s.symbols).filter(Boolean).join('');
  return { phrase, syllables, warnings };
}
