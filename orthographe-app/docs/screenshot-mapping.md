# Mapping screenshots / scripts de capture

Ce fichier recense chaque screenshot de la doc, le script qui le produit, et signale ceux qui ne sont pas couverts.

## Scripts de capture

| Script | Commande |
|--------|----------|
| `capture-screenshots.js` | `BASE_URL=http://localhost:5173 node docs/capture-screenshots.js` |
| `capture-coaching-screenshots.js` | `BASE_URL=http://localhost:5173 node docs/capture-coaching-screenshots.js` |
| `capture-shop-rewards.js` | `BASE_URL=http://localhost:5173 node docs/capture-shop-rewards.js` |
| `capture-endscreen.js` | `BASE_URL=http://localhost:5173 node docs/capture-endscreen.js` |
| `capture-all.js` | `BASE_URL=http://localhost:5173 node docs/capture-all.js` |

## Mapping complet

| Screenshot | Script | Statut |
|------------|--------|--------|
| `01-connexion-accueil.png` | `capture-screenshots.js` | OK |
| `01-connexion-login.png` | — | non couvert (capture manuelle depuis prod) |
| `01-code-parental-setup.png` | — | non couvert (copie depuis tests/screenshots/) |
| `01-code-parental-saisie.png` | — | non couvert (copie depuis tests/screenshots/) |
| `01-login.png` | — | doublon de 01-connexion-accueil |
| `03-dashboard-accueil.png` | `capture-screenshots.js` | OK (alias de dashboard-accueil) |
| `03-dashboard-flamme.png` | `capture-screenshots.js` | OK (alias de dashboard-flamme) |
| `05-regle-memo.png` | `capture-screenshots.js` | OK (alias de regle-memo) |
| `05-regles-liste.png` | `capture-screenshots.js` | OK (alias de regles-liste) |
| `15-coaching-message.png` | — | non couvert |
| `16-parent-dashboard.png` | `capture-screenshots.js` | OK (alias de parent-dashboard) |
| `18-landing.png` | — | doublon de seo-landing |
| `18-seo-index.png` | `capture-screenshots.js` | OK (alias de seo-index) |
| `18-seo-quiz.png` | `capture-screenshots.js` | OK (alias de seo-quiz) |
| `18-seo-regle.png` | `capture-screenshots.js` | OK (alias de seo-regle) |
| `boutique-boost.png` | `capture-shop-rewards.js` | OK (alias de shop-boost) |
| `boutique-cosmetique.png` | `capture-shop-rewards.js` | OK (alias de shop-cosmetique) |
| `coaching-arc*.png` (x50) | `capture-coaching-screenshots.js` | OK |
| `coaching-bienvenue.png` | `capture-screenshots.js` | OK |
| `dashboard-accueil.png` | `capture-screenshots.js` | OK |
| `dashboard-flamme.png` | `capture-screenshots.js` | OK |
| `debug-check.png` | — | non couvert (screenshot dev) |
| `diamant-obtenu.png` | `capture-screenshots.js` | OK |
| `diamant-revue.png` | `capture-screenshots.js` | OK |
| `dictee-onglet.png` | `capture-screenshots.js` | OK |
| `dictee-quiz.png` | `capture-screenshots.js` | OK |
| `docs-*.png` | — | non couvert (screenshots manuels de la doc elle-meme) |
| `end-screen-*.png` (x12) | `capture-endscreen.js` | OK |
| `fin-score.png` | `capture-screenshots.js` | OK |
| `fin-pieces.png` | `capture-screenshots.js` | OK |
| `fin-recap.png` | `capture-screenshots.js` | OK |
| `flamme-active.png` | `capture-screenshots.js` | OK |
| `mystere-grille.png` | `capture-shop-rewards.js` | OK (alias de shop-mystere) |
| `parent-dashboard.png` | `capture-screenshots.js` | OK |
| `persos-emotions.png` | `capture-screenshots.js` | OK |
| `persos-liste.png` | `capture-shop-rewards.js` | OK (alias de shop-persos) |
| `pin-erreur.png` | `capture-screenshots.js` | OK |
| `pin-saisie.png` | `capture-screenshots.js` | OK |
| `popup-argent.png` | `capture-shop-rewards.js` | OK (LevelHelpPopup) |
| `popup-bronze.png` | `capture-shop-rewards.js` | OK (LevelHelpPopup) |
| `popup-couronne.png` | `capture-shop-rewards.js` | OK (LevelHelpPopup + alias reward) |
| `popup-diamant.png` | `capture-shop-rewards.js` | OK (alias de reward-diamant) |
| `popup-niveau.png` | `capture-shop-rewards.js` | OK (alias de reward-argent) |
| `quiz-direct.png` | `capture-screenshots.js` | OK |
| `quiz-feedback.png` | `capture-screenshots.js` | OK |
| `quiz-question.png` | `capture-screenshots.js` | OK |
| `regle-memo.png` | `capture-screenshots.js` | OK |
| `regles-liste.png` | `capture-screenshots.js` | OK |
| `retour-absence.png` | `capture-screenshots.js` | OK |
| `retour-absence-bouclier.png` | — | non couvert |
| `retour-absence-intro.png` | — | non couvert |
| `reward-*.png` (x10) | `capture-shop-rewards.js` | OK |
| `seo-index.png` | `capture-screenshots.js` | OK |
| `seo-landing.png` | `capture-screenshots.js` | OK |
| `seo-quiz.png` | `capture-screenshots.js` | OK |
| `seo-regle.png` | `capture-screenshots.js` | OK |
| `shop-*.png` (x4) | `capture-shop-rewards.js` | OK |

## Non couverts (captures manuelles)

| Screenshot | Raison |
|------------|--------|
| `01-code-parental-setup.png` | Copie depuis tests/screenshots/pin-06 |
| `01-code-parental-saisie.png` | Copie depuis tests/screenshots/pin-02 |
| `01-connexion-login.png` | Capture manuelle depuis prod (auth Google) |
| `15-coaching-message.png` | Screenshot manuel |
| `debug-check.png` | Screenshot dev |
| `docs-*.png` | Screenshots de la doc elle-meme (meta) |
| `retour-absence-bouclier.png` | Necessite un etat specifique (bouclier + absence) |
| `retour-absence-intro.png` | Necessite un etat specifique (absence longue) |
