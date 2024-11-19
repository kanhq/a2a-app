
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'

export default defineNuxtPlugin(nuxtApp => {
  const config = useRuntimeConfig()


  const options = {
    paths: {
      vs: (config.public.monacoCdn as string),
    },
  }

  nuxtApp.vueApp.use(VueMonacoEditorPlugin, options)
})