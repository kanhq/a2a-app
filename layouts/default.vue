<template>
  <div class="w-full h-full flex flex-col">
    <Toast position="top-center" />
    <AppHeader class="flex-none" />
    <div class="grow">
      <slot />
    </div>
    <AppFooter class="flex-none" />
  </div>
</template>