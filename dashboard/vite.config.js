import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendTarget = env.VITE_BACKEND_PROXY || env.VITE_API_URL || 'http://127.0.0.1:8000';

  return {
    plugins: [tailwindcss(), react()],
    server: {
      port: 5173,
      host: '127.0.0.1',
      proxy: {
        '/health': { target: backendTarget, changeOrigin: true },
        '/stats': { target: backendTarget, changeOrigin: true },
        '/logs': { target: backendTarget, changeOrigin: true },
        '/timeline': { target: backendTarget, changeOrigin: true },
        '/devices': { target: backendTarget, changeOrigin: true },
        '/chat': { target: backendTarget, changeOrigin: true },
        '/api': { target: backendTarget, changeOrigin: true },
        '/device': { target: backendTarget, changeOrigin: true },
        '/docs': { target: backendTarget, changeOrigin: true },
        '/ws': { target: backendTarget.replace(/^http/, 'ws'), ws: true, changeOrigin: true },
      },
    },
  };
});
