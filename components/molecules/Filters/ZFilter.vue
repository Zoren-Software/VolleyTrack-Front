<template>
  <va-card
    class="mt-2 mr-3"
  >
    <va-collapse
      v-model="value[0]"
      header="Filtrar"
      solid
      color="secondary"
      class="mb-6"
    >
      <div class="pa-3">
        <slot name="default" />
      </div>
    </va-collapse>
  </va-card>
</template>

<script>
export default {
  data() {
    return {
      value: [false],
    }
  },
}
</script>