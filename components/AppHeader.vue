<template>
  <Menubar :model="menus" :dt="menuBarTheme">
    <template #item="{ item, props, hasSubmenu, root }">
      <div class="w-32 text-lg text-center">
        <NuxtLink :to="item.to"
          class="p-2 no-underline hover:underline underline-offset-4 text-gray-900 visited:text-gray-900	">
          <span>
            <i :class="item.icon"></i>
            {{ item.label }}
          </span>
        </NuxtLink>
      </div>
    </template>
    <template #end>

      <Toolbar v-if="currentPath === '/'" :dt="toolBarTheme">
        <template #start>
          <Button icon="pi pi-file-plus" class="mr-2" severity="help" text raised @click="emitEvent('new', $event)" />
          <Button icon=" pi pi-folder-open" class="mr-2" severity="help" text raised
            @click="emitEvent('open', $event)" />
          <Button icon="pi pi-save" class="mr-2" severity="help" text raised @click="emitEvent('save', $event)" />
          <Button icon="pi pi-trash" severity="help" text raised @click="emitEvent('remove', $event)" />
        </template>

        <!-- <template #center>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText placeholder="Search" />
          </IconField>
        </template> -->

        <template #end>
          <Button icon="pi pi-fw pi-bolt" class="mr-2" label="编写" severity="primary" raised
            @click="emitEvent('code', $event)" v-tooltip="'用配置的大模型生成代码\n(Ctrl+Enter)'" />
          <Button icon=" pi pi-fw pi-play" class="mr-2" label="运行" raised severity="primary"
            @click="emitEvent('run', $event)" />
          <Button icon=" pi pi-fw pi-server" class="mr-2" label="部署" raised severity="primary"
            @click="emitEvent('deploy', $event)" />
        </template>
      </Toolbar>
    </template>
  </Menubar>
</template>


<script setup lang="ts">
import { emitEvent } from '~/composables/useEventBus';


const router = useRouter();

const menus = ref([
  { label: '应用开发', icon: 'pi pi-fw pi-code', to: '/' },
  { label: '应用配置', icon: 'pi pi-fw pi-database', to: '/config' },
  { label: '系统设置', icon: 'pi pi-fw pi-cog', to: '/settings' }
]);

const menuBarTheme = ref({
  colorScheme: {
    light: {
      root: {
        background: '{surface.100}',
      },
      item: {
        focus: {
          background: '{gray.50}',
        }
      }
    }
  }
});

const toolBarTheme = ref({
  colorScheme: {
    light: {
      root: {
        background: '{surface.100}',
      },
    }
  }
});

const currentPath = ref(router.currentRoute.value.path);

watch(() => router.currentRoute.value.path, (path) => {
  currentPath.value = path;
});

</script>