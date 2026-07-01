// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  typescript: { typeCheck: false },
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@tresjs/nuxt',
  ],
  tres: {
    glsl: true
  },
  css: ['@/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()],
  },
})