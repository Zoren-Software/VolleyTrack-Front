<template>
  <div class="data-table-wrapper">
    <va-data-table
      v-model="value"
      :items="items"
      :columns="extendedColumns"
      :loading="this.loading"
      sticky-header
      noDataHtml="Nenhum registro encontrado"
      v-bind="$attrs"
    >
      <template v-for="(_, slotName) in $slots" #[slotName]="scope">
        <slot :name="slotName" v-bind="scope"></slot>
      </template>
    </va-data-table>
  </div>
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
        // Verificar se já existe uma coluna "actions" nas colunas
        const hasActionsColumn = this.columns.some(
          (col) => col.key === "actions" || col.name === "actions"
        );
        if (!hasActionsColumn) {
          return [
            ...this.columns,
            {
              key: "actions",
              name: "actions",
              label: "AÇÕES",
              width: 120,
              sortable: false,
            },
          ];
        }
      }
      return this.columns;
    },
  },
};
</script>

<style scoped>
.data-table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.va-data-table {
  border-radius: 12px; /* Bordas arredondadas */
  overflow: hidden; /* Para evitar que elementos ultrapassem os limites */
  background: white;
}

.va-data-table__table {
  border-collapse: separate;
  border-spacing: 0 4px; /* Espaçamento reduzido entre linhas */
}

.va-data-table__table-thead th {
  background-color: #f8f9fa; /* Cor de fundo do cabeçalho */
  color: #0b1e3a; /* Cor do texto */
  font-size: 13px; /* Tamanho da fonte reduzido */
  font-weight: 700; /* Negrito */
  text-align: left; /* Alinhamento do texto */
  padding: 10px 12px; /* Espaçamento interno reduzido */
  text-transform: none; /* Não transformar em maiúsculas */
}

.va-data-table__table-tbody tr {
  background-color: #ffffff; /* Cor de fundo das linhas */
  border-radius: 6px; /* Bordas arredondadas menores */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08); /* Sombra mais leve */
}

.va-data-table__table-tbody td {
  padding: 10px 12px; /* Espaçamento interno reduzido */
  color: #0b1e3a; /* Cor do texto */
  font-size: 13px; /* Tamanho da fonte reduzido */
  vertical-align: middle;
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
