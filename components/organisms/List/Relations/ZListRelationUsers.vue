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
          <template #cell(user)="{ rowKey: { user } }">
            <ZUser :data="user" show-email />
          </template>
          <template
            #cell(cpf)="{
              rowKey: {
                user: { information },
              },
            }"
          >
            <ZCPF :cpf="information?.cpf" :rg="information?.rg" />
          </template>
          <template
            #cell(positions)="{
              rowKey: {
                user: { positions },
              },
            }"
          >
            <ZPosition :data="positions" />
          </template>
        </ZDatatableGeneric>
      </va-list>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
    ZUser,
    ZCPF,
    ZPosition,
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
          key: "user",
          name: "user",
          label: "Integrante",
          sortable: true,
        },
        {
          key: "positions",
          name: "positions",
          label: "Posições",
          sortable: true,
        },
        {
          key: "userInformation",
          name: "cpf",
          label: "CPF e RG",
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
