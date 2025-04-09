import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-index-html',
      writeBundle: async () => {
        const distDir = path.resolve(__dirname, '../dist');

        const srcIndexHtmlFile = path.join(distDir, 'index.html');
        const destIndexHtmlDir = path.resolve(__dirname, '../templates');
        const destIndexHtmlFile = path.join(destIndexHtmlDir, 'index.html');
        fs.mkdirSync(destIndexHtmlDir, { recursive: true });
        fs.copyFileSync(srcIndexHtmlFile, destIndexHtmlFile);

        const srcAssetsDir = path.join(distDir, 'assets');
        const destAssetsDir = path.resolve(__dirname, '../static/assets');
        fs.mkdirSync(destAssetsDir, { recursive: true });
        fs.readdirSync(destAssetsDir).forEach(f => fs.rmSync(`${destAssetsDir}/${f}`));
        fs.cpSync(srcAssetsDir, destAssetsDir, {recursive: true});
      },
    },
  ],
  base: 'static',
  build: {
    outDir: path.resolve(__dirname, '../dist'),
    emptyOutDir: true,
    sourcemap: 'inline',
  },
});