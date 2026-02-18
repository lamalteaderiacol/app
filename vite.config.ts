import path from 'path';
import fs from 'fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
      {
        name: 'publish-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url === '/__publish' && req.method === 'POST') {
              console.log('Running sync script...');
              exec('npm run sync', (err, stdout, stderr) => {
                if (err) {
                  console.error('Sync failed:', err);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Sync failed' }));
                  return;
                }
                console.log('Sync output:', stdout);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ success: true }));
              });
            } else if (req.url?.startsWith('/__upload') && req.method === 'POST') {
              const url = new URL(req.url, `http://${req.headers.host}`);
              const filename = url.searchParams.get('name');
              if (!filename) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Missing filename' }));
                return;
              }

              // Ensure public/imagenes exists
              const imagesDir = path.resolve(__dirname, 'public/imagenes');
              if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
              }

              const filePath = path.join(imagesDir, filename);
              const writeStream = fs.createWriteStream(filePath);

              req.pipe(writeStream);

              req.on('end', () => {
                console.log(`Image saved to ${filePath}`);
                res.statusCode = 200;
                res.end(JSON.stringify({ success: true, path: `/imagenes/${filename}` }));
              });

              req.on('error', (err) => {
                console.error('Upload failed:', err);
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Upload failed' }));
              });
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
