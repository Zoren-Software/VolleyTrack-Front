<template>
  <ZListRelationGeneric @add="add">
    <template #filter>
      <slot name="filter" />
    </template>
    <template #list>
      <div class="row">
        <div class="flex flex-col md6">
          <div class="item">
            <ZSelectUser
              v-model="players"
              class="mb-3"
              label="Jogadores"
              :ignore-ids="items.map((item) => item.id)"
            />
          </div>
        </div>
      </div>

      <div class="row">
        <!-- Coluna da Esquerda - Jogadores -->
        <div class="flex flex-col md6">
          <div class="item">
            <va-list>
              <va-list-label> Jogadores Relacionados </va-list-label>
              <ZDatatableGeneric
                selectable
                includeActionsColumn
                includeActionDeleteList
                :items="playersItems"
                :columns="playersColumns"
                :loading="loading"
                :paginatorInfo="paginatorInfo"
                @delete="actionDeletePlayer"
              >
                <!-- CELL -->
                <template #cell(player)="{ rowKey }">
                  <ZUser v-if="rowKey?.user" :data="rowKey.user" show-email />
                </template>
                <template #cell(cpf)="{ rowKey }">
                  <ZCPF
                    v-if="rowKey?.user?.information"
                    :cpf="rowKey.user.information?.cpf"
                    :rg="rowKey.user.information?.rg"
                  />
                </template>
                <template #cell(positions)="{ rowKey }">
                  <ZPosition
                    v-if="rowKey?.user?.positions"
                    :data="rowKey.user.positions"
                  />
                </template>
              </ZDatatableGeneric>
            </va-list>
          </div>
        </div>

        <!-- Coluna da Direita - Espaço para próximo componente -->
        <div class="flex flex-col md6">
          <div class="item">
            <!-- Aqui você pode adicionar o próximo componente -->
            <slot name="right-column" />
          </div>
        </div>
      </div>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
    ZUser,
    ZCPF,
    ZPosition,
    ZSelectUser,
  },
  emits: ["add", "delete"],
  props: {
    items: {
      type: Array,
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
      playersColumns: [
        {
          key: "id",
          name: "id",
          label: "Id",
          sortable: true,
        },
        {
          key: "user",
          name: "player",
          label: "Jogador",
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
  computed: {
    playersItems() {
      return (this.items || []).filter((item) => item && item.user);
    },
  },
  methods: {
    add() {
      this.$emit("add");
    },
    actionDeletePlayer(item) {
      this.$emit("delete", item);
    },
  },
};
</script>
