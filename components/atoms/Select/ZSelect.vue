<template>
  <div style="max-width: 300px">
    <va-select
      v-model="value"
      v-bind="$attrs"
      :label="label"
      :options="options"
      value-by="valueBy"
      no-options-text="Nenhuma opção encontrada"
    />
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      value: "",
    };
  },
};
</script>
