function stripTrailingColon(text = '') {
  return text.replace(/\s*:\s*$/, '.');
}

function getLevelText(seo) {
  return seo?.niveaux ? `les classes ${seo.niveaux}` : 'le primaire';
}

export function getEditorialFaqs(rule, seo = {}) {
  const ruleLabel = (seo?.h1?.split(':')[0] || rule?.title || 'cette règle').trim();
  const replacementTest = rule?.memoCard?.rows?.[0]?.test;
  const methodIntro = seo.astuceIntro
    ? stripTrailingColon(seo.astuceIntro)
    : `Le plus efficace est de partir d'une phrase courte, puis de faire verbaliser le choix.`;
  const testSentence = replacementTest
    ? ` Le premier test à montrer est : ${replacementTest}.`
    : '';

  return [
    {
      question: `Comment expliquer ${ruleLabel} à un enfant ?`,
      answer: `${methodIntro}${testSentence} Faites ensuite deux exemples à voix haute avant de passer à l'écrit.`,
    },
    {
      question: `À quel niveau cette règle est-elle utile ?`,
      answer: `Cette règle concerne surtout ${getLevelText(seo)}. Elle revient souvent en dictée, car les formes se prononcent de la même façon ou demandent un raisonnement grammatical rapide.`,
    },
    {
      question: `Comment s'entraîner efficacement ?`,
      answer: `Commencez par quelques phrases courtes, corrigez immédiatement avec l'explication, puis revenez sur la règle quelques jours plus tard. Cette répétition espacée aide l'enfant à garder le bon réflexe.`,
    },
  ];
}
