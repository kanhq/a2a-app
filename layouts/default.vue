<template>
  <div class="w-full h-full flex flex-col">
    <Toast position="top-center" />
    <AppHeader class="flex-none h-14" />
    <div class="grow">
      <slot />
    </div>
    <AppFooter class="flex-none" />
  </div>
</template>