<template>
  <div class="w-full h-full  bg-gray-100 flex">

    <div class="flex-1 border-2 m-2 border-solid border-gray-300">
      <VueMonacoEditor v-model:value="doc.prompt" theme="vs-light" language="markdown" :options="promptEditorOptions"
        @mount="handlePromptEditorMount" @change='onFileSave(true)' />
    </div>
    <div class="flex-1 border-2 m-2  border-solid  border-gray-300">
      <VueMonacoEditor v-model:value="doc.source" language="javascript" :options="sourceEditorOptions"
        @mount="handleSourceEditorMount" />
    </div>
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
  <Popover ref="fileBrowser" class="w-[300px]">
    <FileBrowser @selected="onFileSelected" />
  </Popover>
</template>

<script setup lang="ts">

import { ref, shallowRef } from 'vue'
import type { editor as MonacoEditor } from 'monaco-editor'
import { KeyCode, KeyMod } from 'monaco-editor'
import sysPrompt from '~/assets/data/code.md?raw'

const promptEditorOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: {
    enabled: false,
  },
  placeholder: '在此输入业务逻辑后, 按Ctrl+Enter生成代码',
  language: 'markdown',
}

const sourceEditorOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  automaticLayout: true,
  formatOnType: true,
  formatOnPaste: true,
  minimap: {
    enabled: false,
  },
  readOnly: false,
  placeholder: '点击上面的<编写>按钮来生成应用代码',
  language: 'javascript',
}
const promptEditor = shallowRef<MonacoEditor.IStandaloneCodeEditor>()
const sourceEditor = shallowRef<MonacoEditor.IStandaloneCodeEditor>()
const handlePromptEditorMount = (editor: MonacoEditor.IStandaloneCodeEditor) => {
  editor.addAction({
    id: 'a2a-code',
    label: '编写代码',
    keybindings: [KeyMod.CtrlCmd | KeyCode.Enter],
    run: () => generateCode(),
  })
  promptEditor.value = editor
}
const handleSourceEditorMount = (editorInstance: any) => (sourceEditor.value = editorInstance)


const doc = ref<{
  name: string
  prompt: string
  source: string
}>({
  name: UNTITLED_PROJECT,
  prompt: '',
  source: '',
})

const fileBrowser = ref()

const inputDlgResult = ref('')

const eventBus = useEventBus()
const sysConfig = useSysConfig()
const confirm = useConfirm();
const llm = useLlm()
const toast = useToast()


// your action
function formatCode() {
  promptEditor.value?.getAction('editor.action.formatDocument')?.run()
}

watch(eventBus, async (event) => {
  switch (event.command) {
    case 'code':
      await generateCode()
      break
    case 'open':
      await onFileOpen(event.payload, event.event)
      break
    case 'save':
      await onFileSave()
      break
    case 'new':
      doc.value = { name: UNTITLED_PROJECT, prompt: '', source: '' }
      await onFileSave()
      break
  }
})

onMounted(async () => {
  const name = sysConfig.value.project.lastProjectName
  const data = await loadFileContent(name)
  if (data) {
    doc.value = {
      name: name,
      prompt: data.prompt,
      source: data.source,
    }
  }
})


function extractCode(code: string) {
  // only extract the code block from the markdown

  let startPos = code.indexOf('```', 0)
  if (startPos >= 0) {
    startPos = code.indexOf('\n', startPos)
    if (startPos < 0) {
      return ''
    }
    startPos += 1
    const endPos = code.indexOf('```', startPos)
    if (endPos < startPos) {
      return code.substring(startPos)
    } else {
      return code.substring(startPos, endPos)
    }
  }
  return ''
}

async function generateCode() {
  const gateway = sysConfig.value.llm;
  if (!gateway?.url || !gateway?.token || !gateway.model?.model || !gateway.model?.provider) {

    confirm.require({
      message: '大模型配置不完整，请先配置大模型',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '取消',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: '去配置'
      },
      accept: () => {
        useRouter().push({ name: 'settings' })
      },
      reject: () => {
      }
    });
  }
  if (doc.value.prompt.trim() === '') {
    toast.add({
      severity: 'error',
      summary: '业务逻辑为空',
      detail: '请输入业务逻辑, 再生成代码',
      life: 3000,
    })
    return
  }

  doc.value.source = '// 正在生成代码，请稍等...'
  let start = false
  let code = ''
  for await (const part of llm.value.generateCode(doc.value.prompt, sysPrompt, gateway)) {
    if (!start) {
      code = part
      start = true
    } else {
      code += part
    }
    doc.value.source = extractCode(code)
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
    }
  }
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
      message: '请输入文件名',
      header: '保存文件',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: '取消',
        severity: 'secondary',
        outlined: true
      },
      acceptProps: {
        label: '确定'
      },
      accept: async () => {
        if (!inputDlgResult.value) {
          return
        }
        doc.value.name = `/projects/${inputDlgResult.value}.json`
        await saveFile(doc.value.name, {
          prompt: doc.value.prompt,
          source: doc.value.source,
        })
      },
      reject: () => {
      }
    });
  } else {
    await saveFile(doc.value.name, {
      prompt: doc.value.prompt,
      source: doc.value.source,
    })
  }
}


</script>
