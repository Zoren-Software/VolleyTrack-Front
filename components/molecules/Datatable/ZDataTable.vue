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
  display: flex;
  flex-direction: column;
}

.va-data-table {
  border-radius: 12px; /* Bordas arredondadas */
  overflow: hidden; /* Para evitar que elementos ultrapassem os limites */
  background: white;
}

.va-data-table__table {
  border-collapse: separate;
  border-spacing: 0 8px; /* Espaçamento entre linhas */
}

.va-data-table__table-thead th {
  background: linear-gradient(180deg, #f8f9fa 0%, #f1f3f5 100%);
  color: #0b1e3a;
  font-size: 13px;
  font-weight: 700;
  text-align: left;
  padding: 14px 16px;
  text-transform: none;
  border-bottom: 2px solid #e9ecef;
  position: relative;
}

.va-data-table__table-thead th:first-child {
  border-top-left-radius: 12px;
}

.va-data-table__table-thead th:last-child {
  border-top-right-radius: 12px;
}

.va-data-table__table-tbody tr {
  background-color: #ffffff;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
  margin-bottom: 8px;
}

.va-data-table__table-tbody tr:hover {
  background-color: #f8f9fa;
  border-color: #e9742b;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.15);
  transform: translateY(-1px);
}

.va-data-table__table-tbody tr:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.1);
}

.va-data-table__table-tbody td {
  padding: 14px 16px;
  color: #0b1e3a;
  font-size: 13px;
  vertical-align: middle;
  border: none;
}

.va-data-table__table-tbody tr:first-child td:first-child {
  border-top-left-radius: 8px;
}

.va-data-table__table-tbody tr:first-child td:last-child {
  border-top-right-radius: 8px;
}

.va-data-table__table-tbody tr:last-child td:first-child {
  border-bottom-left-radius: 8px;
}

.va-data-table__table-tbody tr:last-child td:last-child {
  border-bottom-right-radius: 8px;
}

/* Efeito para linhas selecionadas */
.va-data-table__table-tbody tr.va-data-table__table-tr--selected {
  background-color: #fff4ec;
  border-color: #e9742b;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.2);
}

.va-data-table__table-tbody tr.va-data-table__table-tr--selected:hover {
  background-color: #ffe8d6;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.25);
}

/* Estilização do checkbox */
.va-data-table__table-tbody tr td:first-child,
.va-data-table__table-thead th:first-child {
  padding-left: 16px;
}

/* Melhorar visualização de células vazias */
.va-data-table__table-tbody td:empty::before {
  content: "-";
  color: #9ca3af;
  font-style: italic;
}

/* Estilização para mensagem de "sem dados" */
.va-data-table__table-tbody .va-data-table__table-tbody-empty {
  padding: 40px 20px;
  text-align: center;
  color: #6c757d;
  font-size: 14px;
}

.va-data-table .va-data-table__table .va-data-table__table-thead--sticky {
  z-index: 3;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.no-data {
  padding: 2vh;
}

/* Estilos para melhorar checkboxes */
:deep(.va-checkbox) {
  transition: all 0.2s ease;
}

:deep(.va-checkbox:hover) {
  transform: scale(1.1);
}

/* Melhorar espaçamento interno da tabela */
:deep(.va-data-table__table) {
  padding: 8px;
}

/* Estilização de células com conteúdo rico */
:deep(.va-data-table__table-tbody td) {
  transition: background-color 0.2s ease;
}

/* Adicionar separador visual sutil entre colunas */
.va-data-table__table-thead th:not(:last-child) {
  border-right: 1px solid #dee2e6;
}

/* Melhorar contraste e legibilidade */
.va-data-table__table-tbody td {
  line-height: 1.5;
}

/* Efeito de loading mais elegante */
:deep(.va-data-table__table-tbody-loading) {
  opacity: 0.6;
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
