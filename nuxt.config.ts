import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,

  modules: ["@primevue/nuxt-module", '@nuxtjs/tailwindcss'],
  primevue: {
    autoImport: true,
    options: {
      theme: {
        preset: Aura
      }
    }
  },
  css: ['~/assets/css/tailwind.css', 'primeicons/primeicons.css', '~/assets/css/main.css'],
})