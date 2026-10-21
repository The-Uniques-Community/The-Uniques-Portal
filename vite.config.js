import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

function muiIconsDirectImport() {
  return {
    name: 'mui-icons-direct-import',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('.jsx') && !id.endsWith('.js')) return null;
      if (!code.includes('@mui/icons-material')) return null;
      if (!/from\s+["']@mui\/icons-material["']/.test(code)) return null;

      const transformed = code.replace(
        /import\s*\{([^}]+)\}\s*from\s*["']@mui\/icons-material["'];?/g,
        (_, specifiers) => {
          return specifiers
            .split(',')
            .map((item) => {
              const cleaned = item.replace(/\/\/.*$/gm, '').trim();
              if (!cleaned) return '';
              const parts = cleaned.split(/\s+as\s+/);
              if (parts.length === 2) {
                return `import ${parts[1].trim()} from '@mui/icons-material/${parts[0].trim()}';`;
              }
              return `import ${cleaned} from '@mui/icons-material/${cleaned}';`;
            })
            .filter(Boolean)
            .join('\n');
        }
      );
      return { code: transformed, map: null };
    }
  };
}

export default defineConfig({
  plugins: [muiIconsDirectImport(), react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router', 'react-router-dom', '@emotion/react', '@mui/material'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-router/') ||
              id.includes('/react-router-dom/') ||
              id.includes('/@reduxjs/') ||
              id.includes('/react-redux/')
            ) {
              return 'vendor-react';
            }
            if (id.includes('/@mui/') || id.includes('/@emotion/')) {
              return 'vendor-mui';
            }
            if (id.includes('/framer-motion/') || id.includes('/lenis/')) {
              return 'vendor-motion';
            }
          }
        }
      }
    }
  }
});
