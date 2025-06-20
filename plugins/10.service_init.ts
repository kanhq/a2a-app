
async function appInitPlugin(app: any) {
  console.log('init sys config')
  const sysConfig = useSysConfig()
  await sysConfig.value.initialize();

  // app.hook('app:mounted', (app) => {
  //   const localeId = app.$nuxt.$i18n.locale.value
  //   const messages = app.$nuxt.$i18n.getLocaleMessage(localeId)
  //   const primevueLocale = toRaw(messages.primevue)
  //   if (primevueLocale) {
  //     app.$nuxt.$primevue.config.locale = primevueLocale
  //     console.log('set primevue locale', primevueLocale)
  //   } else {
  //     console.warn('no primevue locale found for', localeId)
  //   }
  // })
}

export default defineNuxtPlugin(appInitPlugin)