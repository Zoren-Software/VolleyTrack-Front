<template>
  <ZListRelationGeneric @add="add">
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
    error: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: String,
      default: "",
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
