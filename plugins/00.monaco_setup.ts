
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'

export default defineNuxtPlugin(nuxtApp => {

  const options = {
    paths: {
      // 在这里更改 CDN 链接加载不同版本
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs'
    },
  }

  nuxtApp.vueApp.use(VueMonacoEditorPlugin, options)
})