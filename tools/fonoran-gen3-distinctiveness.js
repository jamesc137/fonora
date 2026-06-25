/**
 * Fonoran Gen 3.1 — phonetic distinctiveness utilities.
 * Semantic DDA unchanged; scores phonetic root forms only.
 */

export const VOWEL_SUFFIXES = ['ee', 'ae', 'oh', 'a', 'e', 'i', 'o', 'u'];

export function rhymeKey(root) {
  if (!root) return '';
  for (const v of VOWEL_SUFFIXES) {
    const idx = root.lastIndexOf(v);
    if (idx === -1) continue;
    const after = root.slice(idx + v.length);
    if (after.length === 0) return v;
    if (after.length === 1 && /[^aeiou]/i.test(after)) return v + after;
  }
  return root.slice(-2);
}

export function splitRoot(root) {
  if (!root) return { onset: '', ending: '' };
  for (const v of VOWEL_SUFFIXES) {
    if (root.endsWith(v)) {
      return { onset: root.slice(0, -v.length), ending: v };
    }
  }
  return { onset: root.slice(0, -1), ending: root.slice(-1) };
}

export function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

export function isPrefixAllowed(shorter, longer, allowedPairs = []) {
  if (!shorter || !longer || shorter === longer) return true;
  if (!longer.startsWith(shorter)) return true;
  return allowedPairs.some(([a, b]) =>
    (a === shorter && b === longer) || (a === longer && b === shorter),
  );
}

export function distinctivenessPenalty(root, ctx) {
  const {
    usedRoots = [],
    vowelEndingCounts = new Map(),
    weights = {},
    maxVowelEnding = 3,
    allowedPrefixPairs = [],
  } = ctx;

  const w = {
    duplicate_root: 10000,
    prefix_overlap: 5000,
    vowel_ending_cap: 800,
    same_onset: 120,
    same_rhyme: 80,
    one_vowel_diff: 90,
    one_onset_diff: 70,
    similarity_high: 100,
    ...weights,
  };

  if (!root) return w.duplicate_root;

  let penalty = 0;
  const { onset, ending } = splitRoot(root);

  if (usedRoots.includes(root)) penalty += w.duplicate_root;

  const endingCount = vowelEndingCounts.get(ending) ?? 0;
  if (endingCount >= maxVowelEnding) penalty += w.vowel_ending_cap;

  for (const other of usedRoots) {
    if (other === root) continue;
    const o = splitRoot(other);

    if (other.startsWith(root) || root.startsWith(other)) {
      const shorter = root.length < other.length ? root : other;
      const longer = root.length >= other.length ? root : other;
      if (!isPrefixAllowed(shorter, longer, allowedPrefixPairs)) {
        penalty += w.prefix_overlap;
      }
    }

    if (onset && onset === o.onset) {
      penalty += w.same_onset;
      if (ending !== o.ending) penalty += w.one_vowel_diff;
    }

    if (ending && ending === o.ending && onset !== o.onset) {
      penalty += w.same_rhyme;
      if (levenshtein(onset, o.onset) === 1) penalty += w.one_onset_diff;
    }

    const dist = levenshtein(root, other);
    const maxLen = Math.max(root.length, other.length);
    const sim = 1 - dist / maxLen;
    if (sim >= 0.75) penalty += w.similarity_high;
  }

  return penalty;
}

export function distinctivenessScore(root, ctx) {
  return Math.max(0, 1000 - distinctivenessPenalty(root, ctx));
}

export function countVowelEndings(inventory) {
  const counts = new Map();
  for (const item of inventory) {
    const { ending } = splitRoot(item.root);
    counts.set(ending, (counts.get(ending) ?? 0) + 1);
  }
  return counts;
}
