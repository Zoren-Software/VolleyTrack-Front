<template>
  <ZListRelationGeneric @add="add" :has-selection="hasSelection">
    <template #filter>
      <slot name="filter" />
    </template>
    <template #list>
      <div class="positions-list-wrapper">
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
          <template #cell(name)="{ rowKey: { name } }">
            <div class="position-name">{{ name }}</div>
          </template>
        </ZDatatableGeneric>
      </div>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
  },
  emits: ["add", "delete"],
  props: {
    items: {
      type: Array,
      required: true,
    },
    selectedValue: {
      type: [Array, Object],
      default: () => [],
    },
  },
  computed: {
    hasSelection() {
      if (!this.selectedValue) {
        return false;
      }
      if (Array.isArray(this.selectedValue)) {
        return (
          this.selectedValue.length > 0 &&
          this.selectedValue.some(
            (val) => val != null && val !== "" && val !== undefined
          )
        );
      }
      if (
        typeof this.selectedValue === "object" &&
        this.selectedValue !== null
      ) {
        if (this.selectedValue.value != null || this.selectedValue.id != null) {
          return true;
        }
        return Object.keys(this.selectedValue).length > 0;
      }
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
          label: "ID",
          sortable: true,
          width: 80,
        },
        {
          key: "name",
          name: "name",
          label: "Posição",
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

<style scoped>
.positions-list-wrapper {
  margin-top: 16px;
}

.position-name {
  font-weight: 500;
  color: #0b1e3a;
  font-size: 14px;
}
</style>
