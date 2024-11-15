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
            <InputText v-model="filters['global'].value" placeholder="查找" />
          </IconField>
        </div>
      </div>
    </template>
    <template #empty>
      <div class="p-4 text-center">
        <span class="text-lg">没有数据</span>
      </div>
    </template>
    <Column selectionMode="multiple" headerStyle="width: 1rem;background: var(--p-surface-200)"></Column>
    <Column v-for="col in config.columns" :key="col.field" :field="col.field" :header="col.label" :style="col.style"
      :frozen="col.frozen" headerStyle="background: var(--p-surface-200)">
      <template #editor="{ data, field }">
        <template v-if="col.options">
          <Select v-model="data[field]" :options="col.options" optionLabel="label" optionValue="value" placeholder=""
            class="w-full " :editable="!col.onlyOptions" />
        </template>
        <template v-else>
          <InputText v-model="data[field]" class="w-full" />
        </template>
      </template>
      <template #body="{ data }">
        <template v-if="col.options">
          <span>{{ col.options.find((opt: any) => opt.value === data[col.field])?.label || data[col.field] }}</span>
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

onMounted(async () => {
  await loadRows()
})

async function loadRows() {
  const fileName = `/config/${props.config.name}.json`
  const data = (await loadFileContent(fileName)) as any[] || []
  if (props.config.deserialize) {
    rows.value = data.map(props.config.deserialize)
  } else {
    rows.value = data
  }
}

async function saveRows() {
  const fileName = `/config/${props.config.name}.json`
  const data = props.config.serialize ? rows.value.map(props.config.serialize) : rows.value.map(toRaw)
  console.log('saveRows', fileName, data)
  await saveFile(fileName, toRaw(data))
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