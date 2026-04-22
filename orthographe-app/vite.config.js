import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { spawn } from 'node:child_process';

function devPlugin() {
  let child;
  return {
    name: 'dev-environment',
    configureServer() {
      child = spawn('node', ['server/local-api.mjs'], {
        stdio: 'inherit',
        env: { ...process.env, PORT: '3001' },
      });
      child.on('error', (err) => console.error('[local-api] failed to start:', err.message));
      child.on('exit', () => { child = null; });
      const cleanup = () => { if (child) { child.kill(); child = null; } };
      process.on('exit', cleanup);
      process.on('SIGTERM', cleanup);
      process.on('SIGINT', cleanup);
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        if (ctx.server) return html.replace('/favicon.svg', '/favicon-dev.svg');
        return html;
      },
    },
  };
}

export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
  plugins: [
    devPlugin(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name: "GramHero — L'aventure de l'orthographe",
        short_name: 'GramHero',
        description: "Apprendre l'orthographe en s'amusant",
        theme_color: '#1e1e2e',
        background_color: '#1e1e2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB for mystery images
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
});
