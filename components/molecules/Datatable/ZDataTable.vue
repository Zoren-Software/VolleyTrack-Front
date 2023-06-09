<template>
  <va-card 
    class="mr-3 mt-3"
  >
    <va-data-table
      v-model="value"
      :items="items"
      :columns="extendedColumns"
      :loading="this.loading"
      v-bind="$attrs"
    >
      <template v-slot:cell(actions)="{ rowKey: {id} }">
        <slot name="cell(actions)" :id="id"></slot>
      </template>
    </va-data-table>
  </va-card>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      required: true
    },
    includeActionsColumn: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
  },
  data() {
    return {
      value: [],
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