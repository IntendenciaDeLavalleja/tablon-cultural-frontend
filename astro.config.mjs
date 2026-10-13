// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL,
  vite: {
    plugins: [tailwindcss()],
    server: { proxy: { '/api': 'http://127.0.0.1:5000', '/media': 'http://127.0.0.1:5000' } },
  },
  integrations: [react()]
});
