<template>
  <ZListRelationGeneric @add="add" :has-selection="hasSelection">
    <template #filter>
      <slot name="filter" />
    </template>
    <template #list>
      <va-list>
        <va-list-label> Relacionados </va-list-label>
        <ZDatatableGeneric
          selectable
          includeActionsColumn
          includeActionDeleteList
          :items="items"
          :columns="columns"
          :loading="loading"
          :paginatorInfo="paginatorInfo"
          @delete="actionDelete"
        >
          <!-- FILTER -->

          <!-- CELL -->
          <template #cell(teams)="team">
            <!-- TODO - Personalizar depois -->
            {{ team }}
          </template>
        </ZDatatableGeneric>
      </va-list>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
    ZTeam,
  },
  emits: ["add", "delete"],
  props: {
    items: {
      type: Array || Object,
      required: true,
    },
    selectedValue: {
      type: [Array, Object],
      default: () => [],
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: String,
      default: "",
    },
  },
  computed: {
    hasSelection() {
      // Se não houver valor, não há seleção
      if (!this.selectedValue) {
        return false;
      }

      // ZSelect em modo multiple retorna um array de valores (números)
      if (Array.isArray(this.selectedValue)) {
        // Verifica se há pelo menos um valor válido no array
        return (
          this.selectedValue.length > 0 &&
          this.selectedValue.some(
            (val) => val != null && val !== "" && val !== undefined
          )
        );
      }

      // Pode ser um objeto único com value/text ou id
      if (
        typeof this.selectedValue === "object" &&
        this.selectedValue !== null
      ) {
        // Se for um objeto com propriedades value/text (formato do select)
        if (this.selectedValue.value != null || this.selectedValue.id != null) {
          return true;
        }
        // Se for um objeto vazio
        return Object.keys(this.selectedValue).length > 0;
      }

      // Se for um valor primitivo (número, string)
      return this.selectedValue != null && this.selectedValue !== "";
    },
  },
  data() {
    return {
      loading: false,
      paginatorInfo: {
        currentPage: 1,
        firstItem: 0,
        lastPage: 1,
        total: 0,
      },
      columns: [
        {
          key: "id",
          name: "id",
          label: "Id",
          sortable: true,
        },
        {
          key: "team",
          name: "team",
          label: "Times",
          sortable: true,
        },
      ],
    };
  },
  methods: {
    add() {
      this.$emit("add");
    },
    actionDelete(item) {
      this.$emit("delete", item);
    },
  },
};
</script>
