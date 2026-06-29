/**
 * Priority class ↔ numeric weight mapping for Fonoran root generation.
 *
 * Human reviewers think in labels (essential, common, …); every algorithm
 * works from the integer weight so future tuning is a one-line change here.
 */

export const PRIORITY_WEIGHTS = {
  essential: 100,
  common: 80,
  useful: 60,
  extended: 40,
  questionable: 20,
};

export const DEFAULT_PRIORITY_CLASS = 'common';

/** Resolve a priority class label to its numeric weight. */
export function priorityWeight(priorityClass) {
  return PRIORITY_WEIGHTS[priorityClass] ?? PRIORITY_WEIGHTS[DEFAULT_PRIORITY_CLASS];
}

/**
 * Derive a numeric ordering priority. Higher weight always wins; the inventory
 * index breaks ties so the original ordering is preserved within a class.
 * Class bands are 20000 apart and the index is far smaller, so bands never overlap.
 */
export function derivePriority(priorityClass, inventoryIndex) {
  return priorityWeight(priorityClass) * 1000 - inventoryIndex;
}
