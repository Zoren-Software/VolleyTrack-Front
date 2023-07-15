<template>
  <ZRelationGeneric>
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
        >
          <!-- FILTER -->

          <!-- CELL -->
          <template #cell(positions)="{ rowKey: { name } }">
            <!-- TODO - Personalizar depois -->
            {{ name }}
          </template>
        </ZDatatableGeneric>
      </va-list>
    </template>
  </ZRelationGeneric>
</template>

<script>
import ZRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";

export default {
  components: {
    ZRelationGeneric,
    ZDatatableGeneric,
    ZPosition,
  },
  props: {
    items: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      },
      columns: [
        {
          key: "id",
          name: "id",
          label: "id",
          sortable: true,
        },
        {
          key: "name",
          name: "positions",
          label: "Posições",
          sortable: true,
        },
      ],
    };
  },
  methods: {},
};
</script>
