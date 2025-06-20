import Aura from '@primevue/themes/aura';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  ssr: false,

  runtimeConfig: {
    public: {
      monacoCdn: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs',
      remoteFS: true
    }
  },

  $development: {
    runtimeConfig: {
      public: {
        a2aUrl: 'http://192.168.31.69:30030',
      }
    }
  },

  $production: {
    runtimeConfig: {
      public: {
        a2aUrl: '',
      }
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

  modules: ["@primevue/nuxt-module", '@nuxtjs/tailwindcss', '@nuxtjs/i18n'],
  primevue: {
    autoImport: true,
    options: {
      theme: {
        preset: Aura
      }
    },
    loadStyles: false
  },
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'zh_cn', name: '中文', file: 'zh-cn.json' }
    ],
    bundle: {
      optimizeTranslationDirective: false,
    }
  }
})