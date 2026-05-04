import { useEffect } from 'react';

/**
 * SeoHead — sets dynamic <title>, <meta description>, and <link canonical>
 * for SEO pages. Uses direct DOM manipulation (no react-helmet dependency).
 *
 * Usage:
 *   <SeoHead title="a, à ou as : aider votre enfant | PrimoLingo"
 *            description="Votre enfant confond..."
 *            canonical="https://www.primolingo.fr/regles/a-a-as" />
 */
const BASE_URL = 'https://www.primolingo.fr';

export default function SeoHead({ title, description, canonical }) {
  useEffect(() => {
    const prev = {
      title: document.title,
      desc: document.querySelector('meta[name="description"]')?.getAttribute('content'),
      ogTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content'),
      ogDesc: document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
      ogUrl: document.querySelector('meta[property="og:url"]')?.getAttribute('content'),
      twitterCard: document.querySelector('meta[name="twitter:card"]')?.getAttribute('content'),
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.getAttribute('content'),
      twitterDesc: document.querySelector('meta[name="twitter:description"]')?.getAttribute('content'),
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    };

    // Title
    if (title) document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = 'description';
      document.head.appendChild(metaDesc);
    }
    if (description) metaDesc.setAttribute('content', description);

    // OG title
    let ogTitleEl = document.querySelector('meta[property="og:title"]');
    if (!ogTitleEl) {
      ogTitleEl = document.createElement('meta');
      ogTitleEl.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleEl);
    }
    if (title) ogTitleEl.setAttribute('content', title);

    // OG description
    let ogDescEl = document.querySelector('meta[property="og:description"]');
    if (!ogDescEl) {
      ogDescEl = document.createElement('meta');
      ogDescEl.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescEl);
    }
    if (description) ogDescEl.setAttribute('content', description);

    // OG URL
    let ogUrlEl = document.querySelector('meta[property="og:url"]');
    if (!ogUrlEl) {
      ogUrlEl = document.createElement('meta');
      ogUrlEl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrlEl);
    }
    if (canonical) ogUrlEl.setAttribute('content', canonical);

    // Twitter card metadata
    let twitterCardEl = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCardEl) {
      twitterCardEl = document.createElement('meta');
      twitterCardEl.name = 'twitter:card';
      document.head.appendChild(twitterCardEl);
    }
    twitterCardEl.setAttribute('content', 'summary_large_image');

    let twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitleEl) {
      twitterTitleEl = document.createElement('meta');
      twitterTitleEl.name = 'twitter:title';
      document.head.appendChild(twitterTitleEl);
    }
    if (title) twitterTitleEl.setAttribute('content', title);

    let twitterDescEl = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDescEl) {
      twitterDescEl = document.createElement('meta');
      twitterDescEl.name = 'twitter:description';
      document.head.appendChild(twitterDescEl);
    }
    if (description) twitterDescEl.setAttribute('content', description);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.rel = 'canonical';
      document.head.appendChild(canonicalEl);
    }
    if (canonical) canonicalEl.setAttribute('href', canonical);

    // Restore on unmount
    return () => {
      if (prev.title) document.title = prev.title;
      if (prev.desc && metaDesc) metaDesc.setAttribute('content', prev.desc);
      if (prev.ogTitle && ogTitleEl) ogTitleEl.setAttribute('content', prev.ogTitle);
      if (prev.ogDesc && ogDescEl) ogDescEl.setAttribute('content', prev.ogDesc);
      if (prev.ogUrl && ogUrlEl) ogUrlEl.setAttribute('content', prev.ogUrl);
      if (prev.twitterCard && twitterCardEl) twitterCardEl.setAttribute('content', prev.twitterCard);
      if (prev.twitterTitle && twitterTitleEl) twitterTitleEl.setAttribute('content', prev.twitterTitle);
      if (prev.twitterDesc && twitterDescEl) twitterDescEl.setAttribute('content', prev.twitterDesc);
      if (prev.canonical && canonicalEl) canonicalEl.setAttribute('href', prev.canonical);
    };
  }, [title, description, canonical]);

  return null;
}

export { BASE_URL };
