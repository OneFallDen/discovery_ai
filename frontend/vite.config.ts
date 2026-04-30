import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from "fs";

const DEFAULT_API_PROXY_URL = "http://localhost:3000";
const DEFAULT_COMFY_PROXY_URL = "http://localhost:8188";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = JSON.parse(fs.readFileSync("./package.json", "utf8"))?.proxy;

  const proxyUrl = env.proxy || proxy || DEFAULT_API_PROXY_URL;
  const comfyUiProxyUrl = env.comfyUiProxyUrl | DEFAULT_COMFY_PROXY_URL
  
  return {
    envDir: '../',
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: true,
      proxy: {
        "/api": {
          target: proxyUrl,
          changeOrigin: false,
          ws: false,
          secure: false,
          rewrite: (pathStr: string) => pathStr.replace(/^\/api/, ""),
        },
        "/ws": {
          target: `${proxyUrl}`.replace("http", "ws"),
          changeOrigin: false,
          ws: true,
          secure: false,
        },
        "/comfyui": {
          target: comfyUiProxyUrl,
          changeOrigin: false,
          ws: false,
          secure: false,
          rewrite: (pathStr: string) => pathStr.replace(/^\/comfyui/, ""),
        }
      }
    },
  }
});