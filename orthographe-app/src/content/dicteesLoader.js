const modules = import.meta.glob('./dictees/*.json', { eager: true });

// Load shared words if the file exists, otherwise empty object
const sharedWordsModule = modules['./dictees/shared-words.json'];
const _sharedWordsRaw = sharedWordsModule ? sharedWordsModule.default || {} : {};
// shared-words.json is an array of { id: "shared-<name>", ... }; build a lookup by name
const sharedWords = Array.isArray(_sharedWordsRaw)
  ? Object.fromEntries(_sharedWordsRaw.map(w => [w.id.replace(/^shared-/, ''), w]))
  : _sharedWordsRaw;

/**
 * Resolve $ref entries in a word list.
 * A ref looks like { "$ref": "shared:wordname" } and pulls from shared-words.json.
 */
function resolveWord(word) {
  if (word && word.$ref && typeof word.$ref === 'string') {
    const match = word.$ref.match(/^shared:(.+)$/);
    if (match) {
      const resolved = sharedWords[match[1]];
      if (resolved) return resolved;
      console.warn(`[dicteesLoader] shared word not found: "${match[1]}"`);
    }
    return null;
  }
  return word;
}

function resolveWordList(list) {
  if (!Array.isArray(list)) return [];
  return list.map(resolveWord).filter(Boolean);
}

/**
 * Build resolved dictée objects from all JSON modules
 * (skip shared-words.json itself).
 */
export const allDictees = Object.entries(modules)
  .filter(([path]) => !path.endsWith('shared-words.json'))
  .map(([, mod]) => {
    const raw = mod.default || mod;
    const words = raw.words || {};
    return {
      ...raw,
      words: {
        level1: resolveWordList(words.level1),
        level2: resolveWordList(words.level2),
        level3: resolveWordList(words.level3),
      },
    };
  })
  .sort((a, b) => (a.number || 0) - (b.number || 0));

/* ---------- Level metadata ---------- */

export const LEVELS = ['level1', 'level2', 'level3'];

export const LEVEL_LABELS = {
  level1: 'Aventurier',
  level2: 'Héros',
  level3: 'Légende',
};

export const LEVEL_COLORS = {
  level1: '#f5b800',  // jaune
  level2: '#4ade80',  // vert
  level3: '#a78bfa',  // violet
};

/**
 * Build the audio URL for a given dictée word.
 * Convention: /audio/dictees/<dicteeId>/<audioFile>
 *  → served by Vite from public/.
 */
export function getAudioUrl(dictee, word) {
  if (!dictee || !word || !word.audioFile) return null;
  return `/audio/dictees/${dictee.id}/${word.audioFile}`;
}

/**
 * Stable quiz identifier used for progression / persistance:
 *   dictee-25-level1, dictee-25-level2, …
 */
export function getQuizId(dictee, level) {
  return `${dictee.id}-${level}`;
}

/**
 * Return the cumulative word list for a given level.
 *  - level1 → level1
 *  - level2 → level1 + level2
 *  - level3 → level1 + level2 + level3
 */
export function getDicteeWordsForLevel(dictee, level) {
  const w = dictee.words || {};
  const l1 = w.level1 || [];
  const l2 = w.level2 || [];
  const l3 = w.level3 || [];

  if (level === 'level1') return [...l1];
  if (level === 'level2') return [...l1, ...l2];
  if (level === 'level3') return [...l1, ...l2, ...l3];
  return [];
}

/**
 * Find a dictée by its id.
 */
export function getDicteeById(id) {
  return allDictees.find(d => d.id === id) || null;
}
