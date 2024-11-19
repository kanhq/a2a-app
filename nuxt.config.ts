import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,

  runtimeConfig: {
    public: {
      monacoCdn: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs',
    }
  },


  app: {
    head: {
      title: 'A2A Workshop',
    },
  },
  css: [
    '~/assets/css/tailwind.css',
    'primeicons/primeicons.css',
    '~/assets/css/main.css',
  ],

  logLevel: 'verbose',

  modules: ["@primevue/nuxt-module", '@nuxtjs/tailwindcss'],
  primevue: {
    autoImport: true,
    options: {
      theme: {
        preset: Aura
      }
    },
    loadStyles: false
  },
})