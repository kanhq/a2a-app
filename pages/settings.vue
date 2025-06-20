<template>

  <ScrollPanel class="w-full h-full" pt:content:class="flex flex-col items-center gap-2">
    <Card class="md:w-2/5 w-full m-2">
      <template #header>
        <div class="w-full flex bg-surface-100 p-3 justify-between items-center">
          <span class="text-lg font-bold">{{ $t('setting.a2a_header') }}</span>
          <i class="text-lg font-bold pi pi-question-circle" v-tooltip="a2aTip"></i>
        </div>
      </template>
      <template #content>
        <Form>
          <div class="grid grid-cols-[10rem_minmax(75%,_1fr)] items-center gap-1">
            <div>{{ $t('setting.a2a_url') }}：</div>
            <InputText v-model="a2aUrl" class="w-[30rem]" :placeholder="$t('placeholder.a2a_url')" />
            <div>{{ $t('setting.a2a_token') }}：</div>
            <Password v-model="a2aToken" inputClass="w-[30rem]" toggleMask :feedback="false"
              :inputProps="{ autocomplete: '' }" />
            <div>{{ $t('setting.a2a_llm') }}：</div>
            <CascadeSelect v-model="selectedModel" :options="llmModels" optionLabel="model" optionGroupLabel="desc"
              :optionGroupChildren="['models']" class="w-80" :placeholder="$t('placeholder.a2a_llm')" />
          </div>
        </Form>
      </template>
    </Card>
  </ScrollPanel>

</template>


<script setup lang="ts">

const eventBus = useEventBus()
const { t } = useI18n()

import llmData from '~/assets/json/llms.json'


const sysConfig = useSysConfig()

const a2aTip = t('setting.a2a_tip') //`A2A服务用于执行生成的代码`


const llmModels = ref(llmData)
const selectedModel = ref<LlmModel | undefined>(sysConfig.value.a2a?.model)
const a2aUrl = ref(sysConfig.value.a2a?.url)
const a2aToken = ref(sysConfig.value.a2a?.token)


watch(eventBus, (event) => {
  console.log('on app command', 'settings', event)
})

watch([selectedModel, a2aUrl, a2aToken], (a) => {
  const a2a = {
    url: a2aUrl.value,
    token: a2aToken.value,
    model: selectedModel.value,
  }
  sysConfig.value.a2a = a2a
})


</script>