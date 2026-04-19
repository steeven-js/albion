import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    fs: {
      // Autorise l'import des .md du repo (README, builds/, zones/, etc.)
      allow: ['../..'],
    },
  },
});
