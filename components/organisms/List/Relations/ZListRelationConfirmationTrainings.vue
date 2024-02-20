<template>
  <ZListRelationGeneric @add="add" disableRelation>
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
          disableActionDelete
          :items="items"
          :columns="columns"
          :loading="loading"
          :paginatorInfo="paginatorInfo"
          @delete="actionDelete"
        >
          <!-- FILTER -->

          <!-- CELL -->
          <template #cell(user)="{ rowKey: { player } }">
            <ZUser :data="player" show-email />
          </template>
          <template #cell(actions)="{ rowKey: { id } }">
            <ZButton
              color="success"
              icon-right
              class="mr-2"
              @click="actionConfirm(id)"
            >
              Confirmar
            </ZButton>
            <ZButton
              color="danger"
              icon-right
              class="mr-2"
              @click="actionReject(id)"
            >
              Rejeitar
            </ZButton>
            <ZButton
              color="primary"
              icon-right
              class="mr-2"
              @click="actionConfirmPresence(id)"
            >
              Confirmar Presença
            </ZButton>
          </template>
          <template
            #cell(positions)="{
              rowKey: {
                player: { positions },
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
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
    ZUser,
    ZPosition,
    ZButton,
  },
  emits: [
    "add",
    "delete",
    "actionConfirm",
    "actionReject",
    "actionConfirmPresence",
  ],
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
          label: "Jogador",
          sortable: true,
        },
        {
          key: "positions",
          name: "positions",
          label: "Posições",
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
    actionConfirm(item) {
      this.$emit("actionConfirm", item);
    },
    actionReject(item) {
      this.$emit("actionReject", item);
    },
    actionConfirmPresence(item) {
      this.$emit("actionConfirmPresence", item);
    },
  },
};
</script>
