<template>
  <Listbox v-model="selectedFile" :options="files" optionLabel="name" class="w-full" listStyle="height:400px"
    :virtualScrollerOptions="{ itemSize: 20 }" emptyMessage="还没有文件" filter @change="onListChanged" />
</template>

<script setup lang="ts">
import { ref, onMounted, withDefaults } from 'vue';


type FileItem = {
  fullPath: string;
  name: string;
}

const searchQuery = ref('');
const files = ref<FileItem[]>([]);

const props = withDefaults(defineProps<{
  prefix?: string;
}>(), {
  prefix: '/projects/',
});

const emit = defineEmits<{
  (e: 'selected', file: FileItem): void,
}>();

const selectedFile = ref<FileItem | null>(null);

onMounted(async () => {
  const prefix = `${props.prefix}${searchQuery.value}`;
  const names = await listFiles(prefix);
  files.value = names.map(name => ({
    fullPath: name,
    name: trimPrefix(name, props.prefix),
  })).filter(file => !file.name.startsWith('untitled'))
});

function onListChanged(event: any) {
  if (selectedFile.value) {
    emit('selected', selectedFile.value);
  }
}
</script>
