import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      external: ["react-csv"]
    }
  }
});

