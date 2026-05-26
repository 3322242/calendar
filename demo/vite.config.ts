import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  server: { port: 4200 },
  esbuild: { jsx: 'automatic' },
});
