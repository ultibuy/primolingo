import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rulesDir = join(__dirname, '../src/content/rules');
const outDir = join(__dirname, '../src/data/generated');
const outPath = join(outDir, 'seoRules.json');

function pickQuizQuestions(rule) {
  const questions = rule.questions || [];
  const easy = questions.filter(q => q.difficulty === 1);
  const quizPool = easy.length >= 2 ? easy : questions;
  return quizPool.slice(0, 2);
}

function pickTrapQuestions(rule) {
  return (rule.questions || [])
    .filter(q => q.difficulty >= 2)
    .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
    .slice(0, 3);
}

function compactQuestion(q) {
  return {
    id: q.id,
    before: q.before || '',
    after: q.after || '',
    answer: q.answer,
    difficulty: q.difficulty || 1,
    explanation: q.explanation || '',
    choices: q.choices,
  };
}

function compactRule(rule, id) {
  const picked = [...pickQuizQuestions(rule), ...pickTrapQuestions(rule)];
  const seen = new Set();
  const questions = picked
    .filter(q => {
      if (!q?.id || seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    })
    .map(compactQuestion);

  return {
    id,
    title: rule.title,
    shortTitle: rule.shortTitle,
    description: rule.description,
    choices: rule.choices || [],
    decisionAxes: rule.decisionAxes || [],
    memoCard: rule.memoCard || null,
    questions,
  };
}

const rules = readdirSync(rulesDir)
  .filter(file => file.endsWith('.json'))
  .sort()
  .map(file => {
    const id = file.replace(/\.json$/, '');
    const rule = JSON.parse(readFileSync(join(rulesDir, file), 'utf8'));
    return compactRule(rule, id);
  });

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, `${JSON.stringify(rules, null, 2)}\n`, 'utf8');
console.log(`Generated ${rules.length} SEO rules -> src/data/generated/seoRules.json`);
