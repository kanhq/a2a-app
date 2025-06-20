<template>
  <div class="w-full h-full  bg-gray-100 flex">
    <ClientOnly>
      <div class="basis-4/12 border-2 m-2 border-solid border-gray-300">
        <VueMonacoEditor v-model:value="doc.prompt" theme="vs-light" language="markdown" :options="promptEditorOptions"
          @mount="handlePromptEditorMount" @change='onFileSave(true)' />
      </div>
      <div class="basis-5/12 border-2 m-2  border-solid  border-gray-300">
        <VueMonacoEditor v-model:value="doc.source" language="javascript" :options="sourceEditorOptions"
          @mount="handleSourceEditorMount" />
      </div>
      <div class="basis-3/12 border-2 m-2  border-solid  border-gray-300">
        <VueMonacoEditor v-model:value="runResult" language="json" :options="outputEditorOptions"
          @mount="handleOutputEditorMount" />
      </div>
    </ClientOnly>
  </div>
  <ConfirmDialog />
  <ConfirmDialog group="inputRequired">
    <template #message="slotProps">
      <div class="flex flex-col w-[300px] gap-4">
        <div class="">{{ slotProps.message.message }}</div>
        <InputText v-model="inputDlgResult" class="w-full" />
      </div>
    </template>
  </ConfirmDialog>
  <ConfirmDialog group="runConfirm">
    <template #message>
      <div class="w-[700px]">
        <RunOptions v-model="doc.params" />
      </div>
    </template>
  </ConfirmDialog>
  <Popover ref="fileBrowser" class="w-[300px]">
    <FileBrowser @selected="onFileSelected" />
  </Popover>
</template>

<script setup lang="ts">

import { ref, shallowRef } from 'vue'
import type { editor as MonacoEditor } from 'monaco-editor'

const doc = ref<A2APoject>({
  name: UNTITLED_PROJECT,
  prompt: '',
  source: '',
  params: {},
})

const fileBrowser = ref()

const inputDlgResult = ref('')
const runResult = ref('')

const eventBus = useEventBus()
const sysConfig = useSysConfig()
const confirm = useConfirm();
const config = useConfig()
const toast = useToast()
const a2a = useA2a()
const primevue = usePrimeVue()
const i18n = useI18n()

const promptEditorOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  wordWrap: 'on',
  // fontSize: 9,
  // lineHeight: 20,
  minimap: {
    enabled: false,
  },
  placeholder: i18n.t('placeholder.editor_prompt'),
  language: 'markdown',
}

const sourceEditorOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  wordWrap: 'on',
  // fontSize: 10,
  // lineHeight:20,
  minimap: {
    enabled: false,
  },
  readOnly: false,
  placeholder: i18n.t('placeholder.editor_source'),
  language: 'javascript',
}

const outputEditorOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  wordWrap: 'on',
  minimap: {
    enabled: false,
  },
  readOnly: true,
  placeholder: i18n.t('placeholder.editor_log'),
  language: 'json',
}
const promptEditor = shallowRef<MonacoEditor.IStandaloneCodeEditor>()
const sourceEditor = shallowRef<MonacoEditor.IStandaloneCodeEditor>()
const outputEditor = shallowRef<MonacoEditor.IStandaloneCodeEditor>()
const handlePromptEditorMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {

  //console.log('handlePromptEditorMount, ', KeyMod.CtrlCmd, KeyMod.Shift, KeyMod.Alt, KeyMod.WinCtrl)
  editor.addAction({
    id: 'a2a-code',
    label: i18n.t('write_code'),
    keybindings: [MonacoKeys.KeyModCtrlCmd | MonacoKeys.Enter],
    run: () => generateCode(),
  })

  editor.addAction({
    id: 'a2a-save',
    label: i18n.t('save_file'),
    keybindings: [MonacoKeys.KeyModCtrlCmd | MonacoKeys.KeyS],
    run: () => onFileSave(),
  })

  editor.addAction({
    id: 'a2a-run',
    label: i18n.t('run'),
    keybindings: [MonacoKeys.KeyModCtrlCmd | MonacoKeys.KeyR],
    run: () => onRunDirect(),
  })

  promptEditor.value = editor
}
const handleSourceEditorMount = (editorInstance: any) => (sourceEditor.value = editorInstance)
const handleOutputEditorMount = (editorInstance: any) => (outputEditor.value = editorInstance)




watch(eventBus, async (event) => {
  switch (event.command) {
    case 'code':
      await generateCode()
      break
    case 'run':
      await onRun()
      break
    case 'runDirect':
      await onRunDirect()
      break
    case 'open':
      await onFileOpen(event.payload, event.event)
      break
    case 'save':
      await onFileSave()
      break
    case 'new':
      doc.value = { name: UNTITLED_PROJECT, prompt: '', source: '', params: {} }
      await onFileSave(true)
      break
  }
})

onMounted(async () => {
  const localeId = i18n.locale.value
  const messages = i18n.messages.value
  const primevueLocale = toRaw(messages[localeId].primevue || {}) as any
  primevue.config.locale = primevueLocale
  const name = sysConfig.value.project.lastProjectName
  try {
    const data = await loadFileContent(name)
    if (data) {
      doc.value = {
        name: name,
        prompt: data.prompt,
        source: data.source,
        params: data.params,
      }
    }
  } catch (err) {
    console.error('Error loading file content:', err)
    doc.value = { name: UNTITLED_PROJECT, prompt: '', source: '', params: {} }
  }
})

onBeforeUnmount(async () => {
  await onFileSave(true)
})

function extractCode(code: string, usage: any) {
  // only extract the code block from the markdown

  let startPos = code.indexOf('```', 0)
  if (startPos >= 0) {

    let prefix = code.substring(0, startPos).split('\n').filter((line) => line.startsWith('//')).join('\n')
    if (usage) {
      prefix += `\n// PromptTokens: ${usage.prompt_tokens} CompletionTokens: ${usage.completion_tokens} TimeUsed: ${usage.time_used}`
    }

    //console.log({ code, prefix})
    if (prefix.trim() !== '') {
      prefix += '\n\n'
    }

    startPos = code.indexOf('\n', startPos)
    if (startPos < 0) {
      return ''
    }
    startPos += 1
    const endPos = code.indexOf('```', startPos)
    if (endPos < startPos) {
      return prefix + code.substring(startPos)
    } else {
      return prefix + code.substring(startPos, endPos)
    }
  }
  return ''
}

async function generateCode() {
  const gateway = sysConfig.value.a2a;
  if (!gateway.model?.model || !gateway.model?.provider) {

    confirm.require({
      message: i18n.t('confirm.llm_missing'),
      header: i18n.t('confirm.config_error'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: i18n.t('label.cancel'),
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: i18n.t('label.go_config')
      },
      accept: () => {
        useRouter().push({ name: 'settings' })
      },
      reject: () => {
      }
    });
    return
  }
  if (doc.value.prompt.trim() === '') {
    toast.add({
      severity: 'error',
      summary: i18n.t('toast.logic_empty'),
      detail: i18n.t('toast.logic_empty_detail'),
      life: 3000,
    })
    return
  }

  doc.value.source = '// 正在生成代码，请稍等...'
  let start = false
  let code = ''
  let usage = null
  let req = {
    provider: gateway.model?.provider || '',
    model: gateway.model?.model || '',
    prompt: doc.value.prompt,
    name: doc.value.name,
  }

  try {

    for await (const part of a2a.value.writeCode(req, sysConfig.value.a2a)) {
      if (part.startsWith('//usage:')) {
        usage = JSON.parse(part.substring(8))
      } else {
        if (!start) {
          code = part
          start = true
        } else {
          code += part
        }
      }
      doc.value.source = extractCode(code, usage)
    }
    toast.add({
      severity: 'success',
      summary: i18n.t('toast.code_generated'),
      detail: i18n.t('toast.code_generated_detail'),
      life: 3000,
    })
  } catch (err: any) {
    toast.add({
      severity: 'error',
      summary: i18n.t('toast.code_generation_failed'),
      detail: err.message || i18n.t('toast.code_generation_failed_detail'),
      life: 3000,
    })
    doc.value.source = i18n.t('toast.code_generation_failed_detail')
  }
}

async function onFileOpen(name: string, event: any) {
  if (!name) {
    fileBrowser.value?.toggle(event)
    return
  }
  if (doc.value.name === name) {
    return
  }

  const data = await loadFileContent(name)
  if (data) {
    doc.value = {
      name: name,
      prompt: data.prompt,
      source: data.source,
      params: data.params,
    }
  }
  sysConfig.value.project.lastProjectName = name
}

async function onFileSelected(file: any) {
  console.log('onFileSelected', file)
  const { fullPath } = file
  fileBrowser.value?.toggle()
  await onFileOpen(fullPath, null)
}

async function onFileSave(autoSave = false) {
  if (!autoSave && doc.value.name === UNTITLED_PROJECT) {
    confirm.require({
      group: 'inputRequired',
      message: i18n.t('confirm.save_message'),
      header: i18n.t('confirm.save_header'),
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: i18n.t('label.cancel'),
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: i18n.t('label.confirm')
      },
      accept: async () => {
        if (!inputDlgResult.value) {
          return
        }
        doc.value.name = `/projects/${inputDlgResult.value}.json`
        await saveFile(doc.value.name, {
          prompt: doc.value.prompt,
          source: doc.value.source,
          params: toRaw(doc.value.params),
        })
      },
      reject: () => {
      }
    });
  } else {
    await saveFile(doc.value.name, {
      prompt: doc.value.prompt,
      source: doc.value.source,
      params: toRaw(doc.value.params),
    })
  }
  sysConfig.value.project.lastProjectName = doc.value.name
  sysConfig.value.saveSysConfig()
}

async function onRun() {
  confirm.require({
    group: 'runConfirm',
    message: i18n.t('confirm.run_message'),
    header: i18n.t('confirm.run_header'),
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: i18n.t('label.cancel'),
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: i18n.t('label.confirm')
    },
    accept: onRunDirect,
    reject: () => {
    }
  });
}

async function onRunDirect() {
  const gateway = sysConfig.value.a2a
  // if (!gateway.url) {
  //   confirm.require({
  //     message: 'A2A配置不完整，请先配置A2A',
  //     header: 'Confirmation',
  //     icon: 'pi pi-exclamation-triangle',
  //     rejectProps: {
  //       label: '取消',
  //       severity: 'secondary',
  //       outlined: true
  //     },
  //     acceptProps: {
  //       label: '去配置'
  //     },
  //     accept: () => {
  //       useRouter().push({ name: 'settings' })
  //     },
  //     reject: () => {
  //     }
  //   });
  //   return
  // }
  let req = {
    script: toRaw(doc.value.source),
    //config: await config.value.mergeConfigs(),
    params: toRaw(doc.value.params),
  }
  const resp = await a2a.value.runJSON(req, gateway)

  runResult.value = JSON.stringify(resp, null, 2)
}

</script>
