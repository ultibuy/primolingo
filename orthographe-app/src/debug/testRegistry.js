/**
 * Test Registry — single source of truth for test documentation.
 *
 * Used by:
 *   - src/components/DebugTestPanel.jsx (renders the debug panel)
 *   - tests/runners/run-unit.js (runs unit tests)
 *   - tests/runners/run-e2e.js (runs E2E tests)
 *   - tests/runners/run-predeploy.js (runs predeploy checks)
 *
 * This file is metadata-only: no Playwright, no child_process, no Node APIs.
 */

const testRegistry = [
  // ── COACHING — Messages de motivation ──
  { id: 'C01', category: 'coaching', categoryLabel: 'Coaching — Messages de motivation', categoryIcon: 'target', rule: 'Un nouvel utilisateur voit le message de bienvenue', criteria: "Le message \"premier quiz\" s'affiche quand le joueur n'a fait aucune session", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C02', category: 'coaching', rule: 'Un message déjà vu ne réapparaît pas', criteria: "Après affichage, le même message ne revient plus (marqué comme vu)", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C03', category: 'coaching', rule: 'La flamme en danger alerte après 16h', criteria: "Le soir (à partir de 16h), si le joueur n'a pas joué et a un streak actif, l'alerte flamme apparaît", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C04', category: 'coaching', rule: "Pas d'alerte flamme avant 16h", criteria: "Avant 16h, l'alerte flamme n'apparaît pas même si le joueur n'a pas joué", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C05', category: 'coaching', rule: 'Les messages uniques sont marqués définitivement', criteria: "Après affichage d'un message unique, il est enregistré avec la date du jour et ne reviendra jamais", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C06', category: 'coaching', rule: 'Les messages récurrents peuvent revenir', criteria: "Un message récurrent est noté dans l'historique mais n'est pas bloqué définitivement", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C07', category: 'coaching', rule: 'Le compteur de messages repart à zéro chaque jour', criteria: "Le lendemain, le compteur repasse à 1 au lieu de cumuler avec la veille", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C08', category: 'coaching', rule: "L'écran de fin ne montre que certains messages", criteria: "Seuls les messages de progression (argent, couronne, diamant, flamme) apparaissent après un quiz", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C09', category: 'coaching', rule: 'Le message de bienvenue est réservé au dashboard', criteria: "Le message d'onboarding n'apparaît jamais sur l'écran de fin de quiz", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C10', category: 'coaching', rule: 'Le message le plus prioritaire gagne', criteria: "Quand deux messages sont éligibles en même temps, celui de plus haute priorité est choisi", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C11', category: 'coaching', rule: "Assez de pièces sans personnage → suggestion d'achat", criteria: "Le joueur avec 250+ pièces et 0 personnage reçoit un message l'invitant à en acheter un", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C12', category: 'coaching', rule: 'Longue série sans bouclier → alerte urgente', criteria: "Le joueur avec un streak de 7+ jours et 0 bouclier voit un message mentionnant son nombre de jours", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C13', category: 'coaching', rule: 'Perte du streak → message de réconfort', criteria: "Le joueur dont la série est tombée à 0 voit un encouragement pour repartir", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C14', category: 'coaching', rule: 'Le total de sessions est bien calculé', criteria: "La somme des sessions guidées et directes de toutes les règles donne le bon total", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C15', category: 'coaching', rule: 'Seuls les personnages sont comptés', criteria: "Les émotions et les thèmes achetés ne sont pas comptés comme des personnages", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },
  { id: 'C16', category: 'coaching', rule: 'Les émotions sont filtrées par personnage', criteria: "Les émotions achetées pour le dragon ne comptent pas dans celles du panda", file: 'coaching-banner.test.js', type: 'unit', predeploy: true },

  // ── AUTH — Inscription et connexion ──
  { id: 'L01', category: 'auth', categoryLabel: 'Auth — Inscription et connexion', categoryIcon: 'lock', rule: 'Deux méthodes de connexion : Google et e-mail/mot de passe', criteria: 'Les deux options sont visibles sur la page de connexion', file: 'auth-flow.test.js', type: 'e2e', predeploy: true },
  { id: 'L02', category: 'auth', rule: 'La première connexion crée automatiquement le compte', criteria: "Le mode inscription affiche le bouton Google d'inscription et le formulaire de création e-mail", file: 'auth-flow.test.js', type: 'e2e', predeploy: true },
  { id: 'L03', category: 'auth', rule: 'Après connexion, le parent arrive sur son tableau de bord', criteria: 'La route parent est protégée ; en AUTH_REAL=1, le compte test e-mail se connecte et arrive sur /parent', file: 'auth-flow.test.js', type: 'e2e', predeploy: true },
  { id: 'L04', category: 'auth', rule: 'La session reste active tant que le parent ne se déconnecte pas', criteria: "Firebase Auth est initialisé avec une instance persistante pour conserver la session locale", file: 'auth-flow.test.js', type: 'e2e', predeploy: true },
  { id: 'L05', category: 'auth', rule: 'Le code parental est haché avant stockage', criteria: "Le hash du PIN ne contient jamais les 4 chiffres en clair et vérifie uniquement le bon code", file: 'auth-flow.test.js', type: 'e2e', predeploy: true },
  { id: 'L06', category: 'auth', rule: 'Les erreurs de connexion sont affichées en français', criteria: 'Une erreur e-mail invalide affiche un message utilisateur en français', file: 'auth-flow.test.js', type: 'e2e', predeploy: true },
  { id: 'L07', category: 'auth', rule: 'Le CTA "Créer un compte gratuit" de la page d’accueil ouvre la page de connexion en mode inscription', criteria: 'Le CTA mène vers /login?mode=register avec les libellés inscription Google et e-mail', file: 'auth-flow.test.js', type: 'e2e', predeploy: true },

  // ── BOUTIQUE & QUIZ — Achat et jeu ──
  { id: 'S01', category: 'shop', categoryLabel: 'Boutique & Quiz — Achat et jeu', categoryIcon: 'coins', rule: "L'achat déduit les pièces", criteria: "Le solde diminue du prix exact après confirmation d'achat du personnage", file: 'personas-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'S02', category: 'shop', rule: 'Un personnage acheté est marqué "Possédé"', criteria: 'La carte affiche "Possédé" à la place du prix après achat', file: 'personas-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'S03', category: 'shop', rule: "On peut équiper une émotion", criteria: "Après achat de l'émotion \"Dodo\", elle est sélectionnable et le personnage l'adopte", file: 'personas-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'S04', category: 'shop', rule: 'Le personnage est visible pendant le quiz', criteria: "Le sprite animé apparaît au-dessus de la barre de progression pendant les questions", file: 'personas-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'S05', category: 'shop', rule: "Le feedback de réponse s'affiche", criteria: '"Bravo !" ou "Raté !" apparaît clairement après chaque réponse', file: 'personas-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'S06', category: 'shop', rule: 'Le personnage reste visible après réponse', criteria: "Le sprite ne disparaît pas quand le message de feedback s'affiche", file: 'personas-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'S07', category: 'shop', rule: 'Le mode direct affiche le bonus du jour', criteria: 'Le bouton du mode direct indique "Bonus de 10" pour la première session du jour', file: 'personas-flow.test.js', type: 'e2e', predeploy: false },

  // ── ÉMOTIONS — Comportement du personnage ──
  { id: 'E01', category: 'emotions', categoryLabel: 'Émotions — Comportement du personnage', categoryIcon: 'character', rule: 'Dashboard sans session → le personnage dort', criteria: "Sur le dashboard, si aucun quiz n'a été fait, le personnage est en mode dodo", file: 'emotion-rules.test.js', type: 'e2e', predeploy: false },
  { id: 'E02', category: 'emotions', rule: 'Dashboard après quiz → le personnage marche', criteria: "Sur le dashboard, après 2+ sessions, le personnage marche ou est assis", file: 'emotion-rules.test.js', type: 'e2e', predeploy: false },
  { id: 'E03', category: 'emotions', rule: 'Première question → le personnage fait coucou', criteria: "Au lancement d'un quiz, le personnage salue le joueur avec un geste ou un bisou", file: 'emotion-rules.test.js', type: 'e2e', predeploy: false },
  { id: 'E04', category: 'emotions', rule: 'Bonne réponse → le personnage applaudit', criteria: "Après une réponse correcte, le personnage tape dans ses mains (pas la danse de victoire)", file: 'emotion-rules.test.js', type: 'e2e', predeploy: false },
  { id: 'E05', category: 'emotions', rule: 'Tout premier quiz → le personnage dort', criteria: "Si c'est la toute première session du joueur, le personnage commence endormi dans le quiz", file: 'emotion-rules.test.js', type: 'e2e', predeploy: false },
  { id: 'E06', category: 'emotions', rule: 'Score bas → personnage hésitant', criteria: "Sur l'écran de fin avec un mauvais score, le personnage montre de la surprise ou réfléchit", file: 'emotion-rules.test.js', type: 'e2e', predeploy: false },

  // ── DICTÉE — Flux audio ──
  { id: 'D01', category: 'dictee', categoryLabel: 'Dictée — Flux audio', categoryIcon: 'book', rule: "L'onglet Dictée est accessible", criteria: "L'onglet est visible et cliquable depuis le dashboard", file: 'dictee-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'D02', category: 'dictee', rule: '"Commencer" lance la dictée', criteria: "Le quiz de dictée s'ouvre quand on clique sur le bouton", file: 'dictee-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'D03', category: 'dictee', rule: '"Écouter" joue le mot', criteria: "L'animation de lecture démarre quand on appuie sur le bouton audio", file: 'dictee-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'D04', category: 'dictee', rule: "La phrase de contexte s'affiche", criteria: "Le mot à écrire est présenté dans une phrase complète pour donner du sens", file: 'dictee-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'D05', category: 'dictee', rule: 'Fermer retourne au bon onglet', criteria: "En fermant le quiz de dictée, on revient sur l'onglet Dictée et pas sur Grammaire", file: 'dictee-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'D06', category: 'dictee', rule: 'Les fichiers audio se chargent', criteria: "L'app émet des requêtes réseau vers les bons fichiers audio", file: 'dictee-flow.test.js', type: 'e2e', predeploy: false },

  // ── STATS — Calcul de progression ──
  { id: 'T01', category: 'stats', categoryLabel: 'Stats — Calcul de progression', categoryIcon: 'chart', rule: 'Profil vierge → tout à zéro', criteria: "Un nouveau profil a 0 session, 0 dictée et toutes les règles au niveau 0", file: 'stats.test.js', type: 'unit', predeploy: true },
  { id: 'T02', category: 'stats', rule: 'Les sessions sont bien comptées', criteria: "Le total affiché correspond à la somme réelle des sessions grammaire + dictée", file: 'stats.test.js', type: 'unit', predeploy: true },
  { id: 'T03', category: 'stats', rule: 'Pas de doublon le même jour', criteria: "Mettre à jour les stats deux fois le même jour ne crée qu'une seule entrée", file: 'stats.test.js', type: 'unit', predeploy: true },
  { id: 'T04', category: 'stats', rule: "L'historique est limité à 30 jours", criteria: "Les entrées de plus de 30 jours sont automatiquement supprimées", file: 'stats.test.js', type: 'unit', predeploy: true },

  // ── PIN PARENTAL — Sécurité ──
  { id: 'P01', category: 'pin', categoryLabel: 'Pin parental — Sécurité', categoryIcon: 'lock', rule: '"Demander à Papa" visible si code actif', criteria: "Le bouton n'apparaît que quand un code parental a été configuré", file: 'pin-parental.test.js', type: 'e2e', predeploy: false },
  { id: 'P02', category: 'pin', rule: 'Bon code → retour au jeu', criteria: "La saisie du bon code sauvegarde le streak et ramène au dashboard", file: 'pin-parental.test.js', type: 'e2e', predeploy: false },
  { id: 'P03', category: 'pin', rule: 'Mauvais code → erreur', criteria: "Un message d'erreur s'affiche, avec verrouillage après plusieurs tentatives ratées", file: 'pin-parental.test.js', type: 'e2e', predeploy: false },
  { id: 'P04', category: 'pin', rule: 'Le code doit être saisi deux fois', criteria: "À la création, il faut confirmer en retapant le même code sinon erreur", file: 'pin-parental.test.js', type: 'e2e', predeploy: false },
  { id: 'P05', category: 'pin', rule: "Le code n'est jamais stocké en clair", criteria: "Seul un hash avec sel aléatoire est enregistré, pas les 4 chiffres", file: 'pin-parental.test.js', type: 'e2e', predeploy: false },

  // ── AUDIO — Bouton écouter ──
  { id: 'A01', category: 'audio', categoryLabel: 'Audio — Bouton écouter', categoryIcon: 'motion', rule: 'Les barres réagissent à la lecture', criteria: "Les barres du waveform changent de hauteur pendant que l'audio joue", file: 'play-word-button.test.js', type: 'e2e', predeploy: false },
  { id: 'A02', category: 'audio', rule: 'Le bouton change de couleur', criteria: "Le fond du bouton devient violet pendant la lecture audio", file: 'play-word-button.test.js', type: 'e2e', predeploy: false },
  { id: 'A03', category: 'audio', rule: "L'animation s'arrête toute seule", criteria: "Au bout d'environ 6 secondes, le bouton revient à son état de repos", file: 'play-word-button.test.js', type: 'e2e', predeploy: false },

  // ── PERSONNAGES — Catalogue ──
  { id: 'K01', category: 'characters', categoryLabel: 'Personnages — Catalogue', categoryIcon: 'character', rule: '17 personnages disponibles', criteria: "Les 17 noms de personnages sont tous visibles dans la boutique", file: 'characters-moods.test.js', type: 'e2e', predeploy: false },
  { id: 'K02', category: 'characters', rule: 'Les anciens personnages ont été retirés', criteria: "Grenouille, Licorne et Phénix n'apparaissent plus dans la boutique", file: 'characters-moods.test.js', type: 'e2e', predeploy: false },
  { id: 'K03', category: 'characters', rule: '10 émotions par personnage', criteria: "Marche, dodo, assis, coucou, bisou, applaudissement, victoire, danse, surprise et réflexion", file: 'characters-moods.test.js', type: 'e2e', predeploy: false },
  { id: 'K04', category: 'characters', rule: "Les sprites s'affichent correctement", criteria: "Chaque personnage a un sprite SVG qui se charge sans erreur", file: 'characters-moods.test.js', type: 'e2e', predeploy: false },

  // ── ENGINE — Calculs et algorithmes (unit) ──
  { id: 'N01', category: 'engine', categoryLabel: 'Engine — Calculs et algorithmes', categoryIcon: 'trophy', rule: 'Calcul des pièces selon le score', criteria: "0 % → 0 pièces · 60-79 % → 5 · 80-99 % → 20 · 100 % → 30", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N02', category: 'engine', rule: 'Bonus bienvenue 200 pièces (1re session ≥60 %)', criteria: "Le bonus n'est crédité qu'une seule fois, jamais deux", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N03', category: 'engine', rule: 'Bonus du jour +10 pièces', criteria: "La première session du jour rapporte 10 pièces supplémentaires", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N04', category: 'engine', rule: 'Progression de niveau Bronze→Argent→Couronne', criteria: "Après 3 sessions ≥80 %, le niveau monte ; en dessous, il reste stable", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N05', category: 'engine', rule: 'Diamant : 3 sessions consécutives ≥90 % requis', criteria: "Le compteur consécutif se remet à 0 si une session est <90 %", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N06', category: 'engine', rule: 'SM-2 : santé du diamant (0→1)', criteria: "La santé diminue en fonction des jours de retard sur la révision planifiée", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N07', category: 'engine', rule: 'SM-2 : planification de la prochaine révision', criteria: "Succès → intervalle doublé · Fragile → intervalle réduit · Échec → réinitialisation", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N08', category: 'engine', rule: 'SM-2 : échec de révision → retour couronne', criteria: "Un score <80 % en mode révision redescend la règle au niveau Couronne", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N09', category: 'engine', rule: 'Streak : incrémentation et reset après 2 jours', criteria: "Jouer hier → +1 · Jouer aujourd'hui → identique · 2 jours d'écart → reset à 1", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N10', category: 'engine', rule: 'Streak : bouclier non auto-consommé', criteria: "updateStreak ne consomme pas le bouclier (c'est ReturnScreen qui le gère manuellement)", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N11', category: 'engine', rule: 'Streak milestones (7/14/30/60/100 j)', criteria: "Chaque palier déclenche le bon montant de pièces (100/200/350/500/1000)", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N16', category: 'engine', rule: 'Double pièces : x2 pendant 5 sessions', criteria: "L'achat crédite 5 sessions bonus ; le compteur décrémente à chaque session", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N17', category: 'engine', rule: 'Double pièces : verrouillé 1 semaine', criteria: "Acheter deux fois la même semaine est bloqué jusqu'au lundi suivant", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N18', category: 'engine', rule: 'Images mystère : 2 morceaux par jour max', criteria: "Le 3e achat de la journée est refusé même si les pièces suffisent", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N19', category: 'engine', rule: 'Images mystère : révélation progressive 6 tuiles', criteria: "Les tuiles se révèlent dans l'ordre ; la dernière (fixe) n'est jamais en premier", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N22', category: 'engine', rule: 'Question Mystery : remplace la prochaine question', criteria: "L'item consommable pioche dans une règle différente de la règle courante", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N32', category: 'engine', rule: 'Sélection de questions : pas de répétition', criteria: "Les questions récemment vues sont évitées si le pool le permet", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N12d', category: 'engine', rule: 'ProgressBar : resolveCharacterMood fallback', criteria: "Si l'émotion demandée n'est pas possédée, le mood retombe sur walk", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N13', category: 'engine', rule: 'Coaching arc14.0 : nudge matin', criteria: "Le matin sans session et avec un streak actif, un message arc14.0 est retourné", file: 'engine.test.js', type: 'unit', predeploy: true },
  { id: 'N33', category: 'engine', rule: 'Assignation personnage/règle stable par jour', criteria: "Le même personnage est retourné pour la même règle le même jour", file: 'engine.test.js', type: 'unit', predeploy: true },

  // ── PROGRESSION — ReturnScreen, Dictée, EndScreen (E2E) ──
  { id: 'N14', category: 'progression', categoryLabel: 'Progression — ReturnScreen, Dictée, EndScreen', categoryIcon: 'crown', rule: 'ReturnScreen : apparaît après 2+ jours d\'inactivité', criteria: "L'écran \"Retour après une pause\" s'affiche quand le joueur revient après ≥2 jours", file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N14b', category: 'progression', rule: 'ReturnScreen : absent si joué hier', criteria: "Si la dernière session date d'hier, l'écran de retour ne s'affiche pas", file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N15', category: 'progression', rule: 'ReturnScreen : "Sauver la flamme" → retour dashboard', criteria: "Le bouton déduit les pièces du bouclier et ramène au dashboard", file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N23', category: 'progression', rule: 'Dictée : niveau HÉROS verrouillé sans Aventurier', criteria: 'Le cadenas et le message "Débloque quand tous Aventurier en couronne" sont visibles', file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N23b', category: 'progression', rule: 'Dictée : niveau AVENTURIER toujours accessible', criteria: "L'onglet Aventurier est cliquable quel que soit le profil du joueur", file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N24', category: 'progression', rule: 'EndScreen : section pièces visible après quiz', criteria: "Le total de pièces (ex : \"30\") apparaît sur l'écran de fin", file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N25', category: 'progression', rule: 'EndScreen : "Prochain objectif" visible', criteria: "La barre de niveau et le texte \"Prochain objectif\" s'affichent si pas de level-up", file: 'progression-flow.test.js', type: 'e2e', predeploy: false },
  { id: 'N25b', category: 'progression', rule: 'EndScreen redesign : layout responsive', criteria: "Le cadre unique, le CTA fixe, le récap scrollable, les SVG de fallback et l'absence d'emojis sont vérifiés sur mobile et desktop", file: 'end-screen-redesign.test.js', type: 'e2e', predeploy: false },

  // ── PARENT — Multi-enfant, réglages, PIN ──
  { id: 'N26', category: 'parent', categoryLabel: 'Parent — Multi-enfant, réglages, PIN', categoryIcon: 'shield', rule: 'Multi-enfant : données isolées par enfant', criteria: "Le progress d'un enfant ne peut pas écraser celui d'un autre (clés localStorage distinctes)", file: 'parent-dashboard.test.js', type: 'e2e', predeploy: false },
  { id: 'N28', category: 'parent', rule: 'Admin : réglage du nombre de questions', criteria: "La valeur saisie par le parent est enregistrée et persistée dans les paramètres enfant", file: 'parent-dashboard.test.js', type: 'e2e', predeploy: false },
  { id: 'N29', category: 'parent', rule: 'Backup quotidien : créé automatiquement', criteria: "Après une session, un snapshot progress est sauvé sous la clé du jour", file: 'parent-dashboard.test.js', type: 'e2e', predeploy: false },
  { id: 'N30', category: 'parent', rule: 'Backup restauration : snapshot lisible', criteria: "Un backup écrit puis relu retourne les mêmes coins et streak", file: 'parent-dashboard.test.js', type: 'e2e', predeploy: false },
  { id: 'N31b', category: 'parent', rule: 'PIN : formule de verrouillage progressif (unit)', criteria: "1 échec → 15 s · 2 → 30 s · le plafond est fixé à 3 600 s (1 heure)", file: 'parent-dashboard.test.js', type: 'e2e', predeploy: false },
  { id: 'N31', category: 'parent', rule: "PIN : compteur d'échecs incrémenté après mauvais code", criteria: "Après une saisie incorrecte, failedAttempts = 1 et lockedUntil est dans le futur", file: 'parent-dashboard.test.js', type: 'e2e', predeploy: false },

  // ── SEO — Pages publiques ──
  { id: 'SEO01', category: 'seo', categoryLabel: 'SEO — Pages publiques', categoryIcon: 'target', rule: 'Index des règles : 20 cartes affichées', criteria: "/regles affiche 20 liens de règles avec badges niveau", file: 'seo-pages.test.js', type: 'e2e', predeploy: true },
  { id: 'SEO02', category: 'seo', rule: 'Page règle : h1 orienté parent', criteria: "/regles/a-a-as affiche un h1 mentionnant 'enfant' ou 'aider'", file: 'seo-pages.test.js', type: 'e2e', predeploy: true },
  { id: 'SEO03', category: 'seo', rule: 'Page règle : memo card visible', criteria: "Le tableau memo avec forme/test/exemple est rendu", file: 'seo-pages.test.js', type: 'e2e', predeploy: true },
  { id: 'SEO04', category: 'seo', rule: 'Mini-quiz : flow complet', criteria: "Start → Q1 → feedback → Q2 → score → CTA gate", file: 'seo-pages.test.js', type: 'e2e', predeploy: true },
  { id: 'SEO05', category: 'seo', rule: 'Meta tags SEO corrects', criteria: "title, description, canonical, og:title sont présents et corrects", file: 'seo-pages.test.js', type: 'e2e', predeploy: true },
  { id: 'SEO06', category: 'seo', rule: 'Navigation interne fonctionne', criteria: "Clic carte → page règle, breadcrumb → retour index, 404 → redirect", file: 'seo-pages.test.js', type: 'e2e', predeploy: true },
];

export default testRegistry;
