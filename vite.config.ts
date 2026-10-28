import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
  plugins:[react(),VitePWA({registerType:'autoUpdate',includeAssets:['icons/icon-192.png','icons/icon-512.png'],manifest:{name:'BenchFlow — Experimental Workflow Companion',short_name:'BenchFlow',description:'Offline-first experimental workflow companion',theme_color:'#123b77',background_color:'#ffffff',display:'standalone',start_url:'/',icons:[{src:'/icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any maskable'},{src:'/icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]},workbox:{globPatterns:['**/*.{js,css,html,svg,png,woff2,json}'],navigateFallback:'/index.html'}})]
});
