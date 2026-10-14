import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    watch: { ignored: ['**/.claude/**', '**/versao-html-anterior/**', '**/versao-geral-6-perguntas/**'] },
  },
});
