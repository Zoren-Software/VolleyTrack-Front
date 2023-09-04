<template>
  <va-card class="mr-3 mt-3">
    <va-data-table
      v-model="value"
      :items="items"
      :columns="extendedColumns"
      :loading="this.loading"
      :style="{
        '--va-data-table-thead-background': 'var(--va-background-element)',
        '--va-data-table-tfoot-background': 'var(--va-background-element)',
      }"
      sticky-header
      noDataHtml="Nenhum registro encontrado"
      v-bind="$attrs"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]="scope">
        <slot :name="slotName" v-bind="scope"></slot>
      </template>
    </va-data-table>
  </va-card>
</template>

<script>
export default {
  props: {
    columns: {
      type: Array,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    includeActionsColumn: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      value: [],
    };
  },
  computed: {
    extendedColumns() {
      if (this.includeActionsColumn) {
        return [
          ...this.columns,
          {
            key: "actions",
            label: "Ações",
            width: 80,
          },
        ];
      }
      return this.columns;
    },
  },
};
</script>

<style>
/* NOTE - Para fazer com que o badge não fique sobrepondo o menu superior do datatables */

.va-data-table .va-data-table__table .va-data-table__table-thead--sticky {
  z-index: 3;
}
.no-data {
  padding: 2vh;
}

::v-deep(.custom-table) {
  --va-data-table-thead-background: linear-gradient(
    0deg,
    var(--va-primary),
    var(--va-info)
  );
  --va-data-table-tfoot-background: linear-gradient(
    0deg,
    var(--va-info),
    var(--va-primary)
  );
  --va-data-table-max-height: 300px;
  --va-data-table-thead-color: var(--va-text-inverted);
  --va-data-table-tfoot-color: var(--va-text-inverted);
}
</style>
