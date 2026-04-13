import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Plugin that exposes a POST /api/save-rule endpoint in dev mode
// to write rule JSON files to disk from the debug editor.
function saveRulePlugin() {
  return {
    name: 'save-rule',
    configureServer(server) {
      server.middlewares.use('/api/save-rule', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end('Method not allowed');
          return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { id, data } = JSON.parse(body);
            const rulesDir = path.resolve(__dirname, 'src/content/rules');
            // Find the file that matches the rule id
            const files = fs.readdirSync(rulesDir).filter(f => f.endsWith('.json'));
            let targetFile = null;
            for (const file of files) {
              const content = JSON.parse(fs.readFileSync(path.join(rulesDir, file), 'utf8'));
              if (content.id === id) {
                targetFile = file;
                break;
              }
            }
            if (!targetFile) {
              res.statusCode = 404;
              res.end(JSON.stringify({ error: `Rule "${id}" not found` }));
              return;
            }
            // Merge: keep the existing questions, overwrite everything else
            const filePath = path.join(rulesDir, targetFile);
            const existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const updated = { ...data, questions: existing.questions };
            fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, file: targetFile }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: e.message }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), saveRulePlugin()],
})
