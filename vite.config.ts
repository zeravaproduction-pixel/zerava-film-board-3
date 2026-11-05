
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/zerava-film-board-3/',
  build: {
    outDir: 'dist'
  }
});
