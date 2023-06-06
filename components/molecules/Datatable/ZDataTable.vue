<template>
  <va-card 
    class="mr-3 mt-3"
  >
    <va-data-table
      v-model="value"
      :items="items"
      :columns="extendedColumns"
      v-bind="$attrs"
    />
  </va-card>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    },
    columns: {
      type: Array,
      required: true
    },
    includeActionsColumn: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      value: []
    }
  },
  computed: {
    extendedColumns() {
      if (this.includeActionsColumn) {
        return [
          ...this.columns,
          { key: "actions", width: 80 }
        ]
      }
      return this.columns;
    }
  }
}
</script>