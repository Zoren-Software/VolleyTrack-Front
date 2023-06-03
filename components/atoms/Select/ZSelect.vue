<template>
  <div style="max-width: 300px;">
    <va-select 
      v-model="value" 
      :options="options" 
      :label="label" 
    />
  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      value: '',
    }
  },
}
</script>