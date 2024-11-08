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
  </Menubar>
</template>


<script setup lang="ts">

const menus = ref([
  { label: '应用开发', icon: 'pi pi-fw pi-code', to: '/' },
  { label: '应用配置', icon: 'pi pi-fw pi-database', to: '/config' },
  { label: '系统设置', icon: 'pi pi-fw pi-cog', to: '/settings' }
]);

const menuBarTheme = ref({
  colorScheme: {
    light: {
      root: {
        background: '{gray.300}',
      },
      item: {
        focus: {
          background: '{gray.50}',
        }
      }
    }
  }
});
</script>