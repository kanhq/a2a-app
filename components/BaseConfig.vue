<template>
  <DataTable :value="rows" v-model:filters="filters" v-model:editingRows="editingRows" editMode="row"
    v-model:selection="selectedRows" dataKey="name" showGridlines stripedRows @rowEditSave="onSaveRow">
    <template #header>
      <div class="flex items-center justify-between">
        <i :class="config.icon" class="mr-2"></i>
        <div class="flex">
          <Button icon="pi pi-file-plus" class="mr-2" severity="secondary" @click="onNewRow()" text />
          <Button icon=" pi pi-trash" severity="secondary" @click="onRemoveRow()" text />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" :placeholder="$t('placeholder.search')" />
          </IconField>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="p-4 text-center">
        <span class="text-lg">{{ $t('label.no_data') }}</span>
      </div>
    </template>
    <Column selectionMode="multiple" headerStyle="width: 1rem;background: var(--p-surface-200)"></Column>
    <Column v-for="col in config.columns" :key="col.field" :field="col.field" :header="$t(col.label)" :style="col.style"
      :frozen="col.frozen" headerStyle="background: var(--p-surface-200)">
      <template #editor="{ data, field }">
        <template v-if="col.options">
          <Select v-model="data[field]" :options="col.options" :optionLabel="i18OptionLabel" optionValue="value"
            placeholder="" class="w-full " :editable="!col.onlyOptions" />
        </template>
        <template v-else>
          <InputText v-model="data[field]" class="w-full" />
        </template>
      </template>
      <template #body="{ data }">
        <template v-if="col.options">
          <span>{{col.options.find((opt: any) => opt.value === data[col.field])?.label || data[col.field]}}</span>
        </template>
        <template v-else-if="col.password">
          <span>******</span>
        </template>
        <template v-else>
          <span>{{ data[col.field] || '' }}</span>
        </template>
      </template>
    </Column>
    <Column :rowEditor="true" headerStyle="width: 3rem;background: var(--p-surface-200)" bodyStyle="text-align:center">
    </Column>

  </DataTable>
</template>


<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';

const { t } = useI18n()

const props = defineProps<{
  config: ActionConfig
}>()

const rows = ref<any[]>([])
const selectedRows = ref<any>()
const editingRows = ref<any>()
const filters = reactive({
  global: { value: '', matchMode: FilterMatchMode.CONTAINS },
})
const openEditDlg = ref(false)

function i18OptionLabel(option: any) {
  return t(option.label)
}

onMounted(async () => {
  await loadRows()
})

async function loadRows() {
  try {
    const fileName = `/conf/${props.config.name}.json`
    const data: Record<string, any> = (await loadFileContent(fileName)) as any || {}
    const deSerFunc = props.config.deserialize
    const records = Object.entries(data).map(([key, value]) => {
      let record: any = {}
      if (typeof value !== 'object') {
        record = { name: key, value }
      } else {
        record = { ...value, name: key }
      }
      if (deSerFunc) {
        record = deSerFunc(record, props.config)
      }
      return record
    })
    rows.value = records
  } catch (e) {
    console.error('Error loading rows:', e)
    rows.value = []
  }
  console.debug('loadRows', props.config.name, rows.value)
}

async function saveRows() {
  const fileName = `/conf/${props.config.name}.json`
  const serFunc = props.config.serialize
  let data = rows.value.map(toRaw)
  if (serFunc) {
    data = data.map(r => serFunc(r, props.config))
  }
  const m = data.reduce((acc: Record<string, any>, row: any) => {
    if (!row.name) {
      console.warn('Row without name:', row)
      return acc
    }
    if (Object.keys(row).length === 2 && row.value !== undefined) {
      acc[row.name] = row.value
    } else {
      acc[row.name] = row
    }
    return acc
  }, {})
  console.debug('saveRows', fileName, m)
  await saveFile(fileName, toRaw(m))
}

function onNewRow() {


  const maxId = rows.value?.map((row: any) => row.name)
    .filter((name: string) => name.startsWith(props.config.name))
    .map((name: string) => parseInt(name.replace(props.config.name, '')) || 0)
    .sort((a: number, b: number) => b - a)
    .shift() || rows.value.length

  const nextId = (maxId + 1).toFixed(0).padStart(3, '0')

  const name = `${props.config.name}${nextId}`
  if (!rows.value) {
    rows.value = [{ name }]
  } else {
    rows.value.push({ name })
  }
  editingRows.value = [{ name }]
}

async function onRemoveRow() {
  if (selectedRows.value.length === 0) {
    return
  }
  const namesToRemove = selectedRows.value.map((row: any) => row.name)
  rows.value = rows.value.filter((row: any) => namesToRemove.indexOf(row.name) === -1)
  await saveRows()
}

async function onSaveRow(event: any) {
  let { newData, index } = event;
  rows.value[index] = newData
  await saveRows()
  editingRows.value = []
};

</script>