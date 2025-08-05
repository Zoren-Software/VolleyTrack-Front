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

<style scoped>
.va-data-table {
  border-radius: 12px; /* Bordas arredondadas */
  overflow: hidden; /* Para evitar que elementos ultrapassem os limites */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); /* Sombra leve */
}

.va-data-table__table {
  border-collapse: separate;
  border-spacing: 0 8px; /* Espaçamento entre linhas */
}

.va-data-table__table-thead th {
  background-color: #f8f9fa; /* Cor de fundo do cabeçalho */
  color: #0b1e3a; /* Cor do texto */
  font-size: 16px; /* Tamanho da fonte */
  font-weight: bold; /* Negrito */
  text-align: left; /* Alinhamento do texto */
  padding: 12px; /* Espaçamento interno */
}

.va-data-table__table-tbody tr {
  background-color: #ffffff; /* Cor de fundo das linhas */
  border-radius: 8px; /* Bordas arredondadas para as linhas */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Sombra leve */
}

.va-data-table__table-tbody td {
  padding: 12px; /* Espaçamento interno */
  color: #6c757d; /* Cor do texto */
  font-size: 14px; /* Tamanho da fonte */
}

.va-data-table__table-tbody tr:hover {
  background-color: #f1f1f1; /* Cor de fundo ao passar o mouse */
}

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
