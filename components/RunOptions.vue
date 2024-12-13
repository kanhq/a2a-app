<template>

  <DataTable :value="rows" dataKey="id">
    <template #header>
      <div class="flex items-center justify-between">
        <span class="flex-auto"/>
        <Button icon="pi pi-file-plus" severity="secondary" @click="onNewText()" text />
        <Button icon="pi pi-folder-plus" severity="secondary" @click="onNewFile()" text />
      </div>
    </template>
    <template #empty>
      <div class="p-4 text-center">
        <span class="text-lg">没有数据</span>
      </div>
    </template>
    <Column field="name" header="名称" headerStyle="background: var(--p-surface-200)">
      <template #body="{ data }">
        <InputText v-model="data.name" />
      </template>
    </Column>
    <Column field="value" header="值" headerStyle="background: var(--p-surface-200)">
      <template #body="{ data }">
        <template v-if="data.isFile">
          <template v-if="data.value.name">
            <span>{{ data.value.name }}</span>
          </template>
          <input type="file" :id="`f-${data.id}`" @change="onFileUpload"/>
        </template>
        <template v-else>
          <InputText v-model="data.value" />
        </template>
      </template>
    </Column>
    <Column field="id" header="操作" headerStyle="background: var(--p-surface-200)">
      <template #body="{ data }">
        <Button icon="pi pi-trash" @click="() => rows = rows.filter(row => row.id !== data.id)" />
      </template>
    </Column>
  </DataTable>
</template>
<script setup lang="ts">
type Row = {
  id: string
  name: string;
  value: any;
  isFile: boolean;
}

const model = defineModel<any>();

const rows = ref<Row[]>([]);

onMounted(() => {
  rows.value = buildRows(model.value);
});

onBeforeUnmount(() => {
  const value = Object.fromEntries(rows.value.map(row => [row.name, row.value]));
  console.log('RunOptions onBeforeUnmount', value);
  model.value = value
});

function buildRows(value: any) : Row[]  {
  if (!value) {
    return [];
  }
  const rows = Object.entries(model.value).map(([name, value]) => {
    return {
      id: /p\d+/.test(name) ? `r-${name.substring(1)}` : `r-${name}`,
      name,
      value,
      isFile: typeof value !== 'string'
    };
  })
  rows.sort((a, b) => a.name.localeCompare(b.name));
  return rows;
}

function nextId() : string {
  const maxId = rows.value
  .map(row => {
    const n = parseInt(row.id.substring(2));
    console.log('nextId', row.id, n);
    return isNaN(n) ? 0 : n;
  })
  .reduce((a, b) => Math.max(a, b), 0);
  const id = (maxId + 1).toFixed(0).padStart(3, '0');
  return id
}
  
function onNewText() {
  const id = nextId();
  rows.value.push({
    id: `r-${id}`,
    name: `p${id}`,
    value: '',
    isFile: false
  });
}

function onNewFile() {
  const id = nextId();
  rows.value.push({
    id: `r-${id}`,
    name: `p${id}`,
    value: {
      kind: 'file',
      name: '',
      content: ''
    },
    isFile: true
  });
}

function onFileUpload(event: Event) {
  console.log('onFileUpload', event);
  const input = event.target as HTMLInputElement;
  const id = input.id.substring(2);
  const file = input.files?.item(0);
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const row = rows.value.find(row => row.id === id);
      if (row) {
        row.value = {
          kind: 'file',
          name: file.name,
          content
        };
      }
    };
    reader.readAsDataURL(file);
  }
}

</script>