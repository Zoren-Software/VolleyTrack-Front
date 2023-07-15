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
          <!-- <template #cell(user)="{ rowKey }">
            <ZUser :data="rowKey" />
          </template>
          <template #cell(positions)="{ rowKey: { positions } }">
            <ZPosition :data="positions" />
          </template>
          <template #cell(cpf)="{ rowKey: { information } }">
            <ZCPF :cpf="information?.cpf" :rg="information?.rg" />
          </template>
          <template #cell(team)="{ rowKey: { teams } }">
            <ZTeam :data="teams" />
          </template> -->
        </ZDatatableGeneric>
      </va-list>
    </template>
  </ZRelationGeneric>
</template>

<script>
import ZRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";

export default {
  components: {
    ZRelationGeneric,
    ZDatatableGeneric,
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
          name: "Id",
          key: "id",
        },
        {
          name: "Posição",
          key: "name",
        },
      ],
      items: [
        {
          id: "1",
          name: "Audrey Clay",
          address: "644 Vermont Court, Freelandville, Kentucky, 2619",
          img: "https://randomuser.me/api/portraits/women/5.jpg",
        },
        {
          id: "2",
          name: "Aguirre Klein",
          address: "626 Carroll Street, Roulette, Ohio, 1477",
          img: "https://randomuser.me/api/portraits/men/1.jpg",
        },
        {
          id: "3",
          name: "Tucker Kaufman",
          address: "887 Winthrop Street, Tryon, Florida, 3912",
          img: "https://randomuser.me/api/portraits/men/3.jpg",
        },
        {
          id: "4",
          name: "Herbert Keller",
          address: "286 NW. Shore St.Longwood, FL 32779",
          img: "https://randomuser.me/api/portraits/men/5.jpg",
        },
      ],
    };
  },
};
</script>
