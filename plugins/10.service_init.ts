


async function appInitPlugin(app: any) {
  console.log('init sys config')
  await useSysConfig().value.initialize();
}

export default defineNuxtPlugin(appInitPlugin)