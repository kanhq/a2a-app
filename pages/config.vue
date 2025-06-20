<template>
  <div class="w-full">
    <Tabs value="common">
      <TabList>
        <Tab v-for="config in allConfigs" :value=config.name>{{ $t(config.label) }}</Tab>
      </TabList>

      <TabPanels>
        <TabPanel v-for="config in allConfigs" :value=config.name>
          <BaseConfig :config />
        </TabPanel>
      </TabPanels>

    </Tabs>

  </div>

</template>


<script setup lang="ts">


const configService = useConfig()
const allConfigs = configService.value.configSchemas


</script>