/**
 * Debug page that renders EndScreen with fixtures.
 * Dev mode only — never served in production.
 *
 * Usage: /debug/end-screen?case=perfect-3
 */
import { useSearchParams, Link } from 'react-router-dom';
import EndScreen from '../components/EndScreen.jsx';
import fixtures, { FIXTURE_KEYS } from '../debug/endScreenFixtures.js';

export default function DebugEndScreenPage() {
  const [params] = useSearchParams();
  const caseName = params.get('case') || FIXTURE_KEYS[0];
  const factory = fixtures[caseName];

  if (!factory) {
    return (
      <div style={{ padding: '2rem', color: '#fff', fontFamily: 'var(--font-body)' }}>
        <h1>Case "{caseName}" not found</h1>
        <p>Available cases:</p>
        <ul>
          {FIXTURE_KEYS.map(k => (
            <li key={k}><Link to={`/debug/end-screen?case=${k}`}>{k}</Link></li>
          ))}
        </ul>
      </div>
    );
  }

  const fixture = factory();

  return (
    <EndScreen
      rule={fixture.rule}
      questions={fixture.questions}
      answers={fixture.answers}
      score={fixture.score}
      onFinish={() => {}}
      characterId={fixture.characterId || null}
      shopOwned={fixture.shopOwned || []}
      isFirstSessionOfDay={fixture.isFirstSessionOfDay || false}
      hasDoubleCoinsActive={fixture.hasDoubleCoinsActive || false}
      streakMilestoneJustEarned={fixture.streakMilestoneJustEarned || null}
      levelProgress={fixture.levelProgress || null}
      coins={fixture.coins || 500}
      debugSkipAnimations
    />
  );
}
