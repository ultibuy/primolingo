import { useNavigate } from 'react-router-dom';

const T = {
  bg1: '#1e1e2e',
  bg2: '#2d2b55',
  primary: '#a78bfa',
  textWhite: '#ffffff',
  textLight: 'rgba(255,255,255,0.85)',
  textMuted: 'rgba(255,255,255,0.5)',
  glassBorder: 'rgba(255,255,255,0.1)',
  font: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  fontDisplay: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

const sectionStyle = {
  marginBottom: '2.5rem',
};

const h2Style = {
  fontFamily: T.fontDisplay,
  fontSize: '1.4rem',
  fontWeight: 800,
  color: T.primary,
  marginBottom: '1rem',
  marginTop: 0,
};

const h3Style = {
  fontFamily: T.fontDisplay,
  fontSize: '1.05rem',
  fontWeight: 700,
  color: T.textWhite,
  marginBottom: '0.5rem',
  marginTop: '1.5rem',
};

const pStyle = {
  fontSize: '0.9rem',
  color: T.textLight,
  lineHeight: 1.7,
  marginBottom: '0.8rem',
};

export default function LegalPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg2} 50%, ${T.bg1} 100%)`,
      color: T.textWhite,
      fontFamily: T.font,
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: `1px solid ${T.glassBorder}`, borderRadius: 10,
              color: T.textMuted, padding: '0.4rem 0.8rem', cursor: 'pointer',
              fontSize: '0.85rem', fontFamily: T.font,
            }}
          >
            ← Accueil
          </button>
          <h1 style={{ fontFamily: T.fontDisplay, fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>
            Mentions légales & Confidentialité
          </h1>
        </div>

        {/* ── MENTIONS LÉGALES ── */}
        <div style={sectionStyle} id="mentions">
          <h2 style={h2Style}>Mentions légales</h2>

          <h3 style={h3Style}>Éditeur du site</h3>
          <p style={pStyle}>
            PrimoLingo est un projet personnel et gratuit, édité par Luc Behar.<br />
            Contact : primolingo.app@gmail.com
          </p>

          <h3 style={h3Style}>Hébergement</h3>
          <p style={pStyle}>
            Le site est hébergé par Google Firebase (Google LLC).<br />
            Adresse : 1600 Amphitheatre Parkway, Mountain View, CA 94043, États-Unis.
          </p>

          <h3 style={h3Style}>Propriété intellectuelle</h3>
          <p style={pStyle}>
            L'ensemble du contenu de PrimoLingo (textes, exercices, illustrations, code source) est la propriété
            de l'éditeur sauf mention contraire. Toute reproduction non autorisée est interdite.
          </p>
        </div>

        {/* ── POLITIQUE DE CONFIDENTIALITÉ ── */}
        <div style={sectionStyle} id="confidentialite">
          <h2 style={h2Style}>Politique de confidentialité</h2>
          <p style={pStyle}>Dernière mise à jour : 30 avril 2026</p>

          <h3 style={h3Style}>1. Données collectées</h3>
          <p style={pStyle}>
            PrimoLingo collecte uniquement les données nécessaires au fonctionnement du service :
          </p>
          <ul style={{ ...pStyle, paddingLeft: '1.5rem' }}>
            <li><strong>Compte parent</strong> : adresse email et nom (fournis par Google lors de la connexion)</li>
            <li><strong>Profil enfant</strong> : prénom et avatar (choisis par le parent, aucune donnée d'identité réelle requise)</li>
            <li><strong>Progression</strong> : scores, niveaux, pièces virtuelles, achats en boutique (100% virtuels)</li>
            <li><strong>Code parental</strong> : PIN à 4 chiffres défini par le parent</li>
          </ul>

          <h3 style={h3Style}>2. Données NON collectées</h3>
          <p style={pStyle}>
            PrimoLingo ne collecte <strong>aucune</strong> donnée de tracking, publicité, géolocalisation, cookie tiers,
            ni aucune donnée biométrique. Aucun SDK publicitaire n'est intégré. Aucune donnée n'est revendue à des tiers.
          </p>

          <h3 style={h3Style}>3. Finalité du traitement</h3>
          <p style={pStyle}>
            Les données sont utilisées exclusivement pour :
          </p>
          <ul style={{ ...pStyle, paddingLeft: '1.5rem' }}>
            <li>Sauvegarder et restaurer la progression de l'enfant</li>
            <li>Permettre au parent de suivre l'évolution de son enfant</li>
            <li>Assurer le fonctionnement technique de l'application (authentification, synchronisation)</li>
          </ul>

          <h3 style={h3Style}>4. Stockage et sécurité</h3>
          <p style={pStyle}>
            Les données sont stockées dans Google Firestore (serveurs européens disponibles).
            L'accès est protégé par l'authentification Google et des règles de sécurité Firestore
            qui garantissent qu'un parent ne peut accéder qu'à ses propres données.
          </p>

          <h3 style={h3Style}>5. Durée de conservation</h3>
          <p style={pStyle}>
            Les données sont conservées tant que le compte est actif. La suppression du compte
            entraîne la suppression de toutes les données associées.
          </p>

          <h3 style={h3Style}>6. Droits des utilisateurs</h3>
          <p style={pStyle}>
            Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, de suppression
            et de portabilité de vos données. Pour exercer ces droits, contactez : primolingo.app@gmail.com
          </p>

          <h3 style={h3Style}>7. Monitoring des erreurs</h3>
          <p style={pStyle}>
            PrimoLingo utilise Sentry pour détecter et corriger les bugs techniques. Sentry peut recevoir
            des informations techniques anonymisées (type de navigateur, stack trace d'erreurs). Aucune donnée
            personnelle identifiante n'est transmise à Sentry.
          </p>

          <h3 style={h3Style}>8. Mineurs</h3>
          <p style={pStyle}>
            PrimoLingo est destiné aux enfants sous la supervision d'un parent. Le compte est créé par le parent,
            et l'enfant n'a pas besoin de fournir de données personnelles pour utiliser l'application.
            Le parent reste responsable de l'utilisation du service par son enfant.
          </p>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center', padding: '1.5rem 0', borderTop: `1px solid ${T.glassBorder}`,
          fontSize: '0.8rem', color: T.textMuted,
        }}>
          © 2026 PrimoLingo — primolingo.app@gmail.com
        </div>
      </div>
    </div>
  );
}
