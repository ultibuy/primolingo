/**
 * EndScreen fixtures for debug preview and documentation screenshots.
 * Each fixture provides all props needed by EndScreen.
 */

const RULE = {
  id: 'a-a-as',
  title: 'a / à / as',
  shortTitle: 'a / à / as',
  choices: [
    { id: 'a', label: 'a' },
    { id: 'as', label: 'as' },
    { id: 'ap', label: 'à' },
  ],
};

function makeQuestions(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: `q${i + 1}`,
    before: i % 2 === 0 ? 'Il ' : 'Je vais ',
    after: i % 2 === 0 ? ' faim après le sport.' : ' Paris demain.',
    answer: i % 2 === 0 ? 'a' : 'ap',
    difficulty: 1,
    explanation: i % 2 === 0
      ? 'On peut dire « il avait faim » → verbe avoir → a.'
      : 'On ne peut pas remplacer par « avait » → préposition → à.',
  }));
}

function makeAnswers(questions, correctCount) {
  return questions.map((q, i) => ({
    questionId: q.id,
    chosen: i < correctCount ? q.answer : (q.answer === 'a' ? 'ap' : 'a'),
    correct: i < correctCount,
  }));
}

const fixtures = {
  // 3/3 perfect, small session
  'perfect-3': () => {
    const questions = makeQuestions(3);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 3), score: 3,
      characterId: 'panda', shopOwned: ['panda'],
      isFirstSessionOfDay: true,
      levelProgress: { nextLevelName: 'Argent', current: 1, target: 3, message: null },
    };
  },

  // 8/10 good session
  'good-10': () => {
    const questions = makeQuestions(10);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 8), score: 8,
      characterId: 'panda', shopOwned: ['panda'],
      isFirstSessionOfDay: true,
      levelProgress: { nextLevelName: 'Couronne', current: 2, target: 3, message: null },
    };
  },

  // 4/10 errors session
  'errors-10': () => {
    const questions = makeQuestions(10);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 4), score: 4,
      characterId: 'panda', shopOwned: ['panda'],
      isFirstSessionOfDay: false,
      levelProgress: { nextLevelName: 'Argent', current: 1, target: 3, message: null },
    };
  },

  // Perfect without character
  'no-character-perfect': () => {
    const questions = makeQuestions(10);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 10), score: 10,
      characterId: null, shopOwned: [],
      isFirstSessionOfDay: true,
      levelProgress: { nextLevelName: 'Argent', current: 2, target: 3, message: null },
    };
  },

  // Fail without character
  'no-character-fail': () => {
    const questions = makeQuestions(10);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 3), score: 3,
      characterId: null, shopOwned: [],
      isFirstSessionOfDay: false,
      levelProgress: null,
    };
  },

  // With level progress bar
  'level-progress': () => {
    const questions = makeQuestions(20);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 18), score: 18,
      characterId: 'panda', shopOwned: ['panda'],
      isFirstSessionOfDay: true,
      hasDoubleCoinsActive: true,
      streakMilestoneJustEarned: { streak: 14, coins: 200 },
      levelProgress: { nextLevelName: 'Diamant', current: 2, target: 3, message: 'Encore 1 session parfaite pour le diamant' },
    };
  },

  // No objective shown
  'no-objective': () => {
    const questions = makeQuestions(20);
    return {
      rule: RULE, questions, answers: makeAnswers(questions, 20), score: 20,
      characterId: 'panda', shopOwned: ['panda'],
      isFirstSessionOfDay: true,
      levelProgress: { justLeveledUp: true, nextLevelName: 'Couronne', current: 3, target: 3 },
    };
  },
};

export default fixtures;
export const FIXTURE_KEYS = Object.keys(fixtures);
