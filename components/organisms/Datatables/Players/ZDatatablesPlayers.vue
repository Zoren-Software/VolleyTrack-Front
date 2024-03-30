<template>
  <ZDatatableGeneric
    buttonActionAdd
    buttonActionDelete
    includeActionsColumn
    includeActionEditList
    includeActionDeleteList
    textAdvancedFilters
    selectable
    :items="items"
    :columns="columns"
    :loading="loading"
    :paginatorInfo="paginatorInfo"
    :filter="true"
    @search="searchPlayers"
    @actionSearch="getPlayers"
    @actionClear="clearSearch"
    @add="addPlayer"
    @edit="editPlayer"
    @delete="deletePlayer"
    @deletes="deletePlayers"
    @update:currentPageActive="updateCurrentPageActive"
  >
    <!-- FILTER -->
    <template #filter>
      <!-- TODO - Ajustar distribuição dos itens dentro deste componente -->
      <div class="row">
        <div class="flex flex-col md6">
          <div class="item mr-2">
            <ZSelectPosition
              label="Posições"
              v-model="variablesGetPlayers.filter.positionsIds"
              :teamsIds="variablesGetPlayers.filter.teamsIds"
            />
          </div>
        </div>
        <div class="flex flex-col md6">
          <div class="item">
            <ZSelectTeam
              label="Times"
              v-model="variablesGetPlayers.filter.teamsIds"
              :positionsIds="variablesGetPlayers.filter.positionsIds"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- CELL -->
    <template #cell(player)="{ rowKey }">
      <ZUser :data="rowKey" showEmail />
    </template>
    <template #cell(positions)="{ rowKey: { positions } }">
      <ZPosition :data="positions" />
    </template>
    <template #cell(cpf)="{ rowKey: { information } }">
      <ZCPF :cpf="information?.cpf" :rg="information?.rg" />
    </template>
    <template #cell(team)="{ rowKey: { teams } }">
      <ZTeam :data="teams" />
    </template>
    <template #cell(user)="{ rowKey: { user, createdAt, updatedAt } }">
      <ZUser
        :data="user || {}"
        :createdAt="createdAt"
        :updatedAt="updatedAt"
        showUpdatedAt
        showCreatedAt
      />
    </template>
  </ZDatatableGeneric>
</template>

<script>
import { defineComponent } from "vue";
import PLAYERS from "~/graphql/user/query/users.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import USERDELETE from "~/graphql/user/mutation/userDelete.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZPosition,
    ZCPF,
    ZTeam,
    ZSelectPosition,
    ZSelectTeam,
  },

  created() {
    this.getPlayers();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "id", name: "id", sortable: true },
      { key: "player", name: "player", label: "Jogadores", sortable: true },
      { key: "cpf", name: "cpf", label: "CPF e RG", sortable: true },
      {
        key: "positions",
        name: "positions",
        label: "Posições",
        sortable: true,
      },
      { key: "team", name: "team", label: "Times", sortable: true },
      {
        key: "user",
        name: "user",
        label: "Usuário Alteração",
        sortable: true,
      },
    ];

    return {
      items: [],
      loading,
      columns,
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      },
      variablesGetPlayers: {
        page: 1,
        filter: {
          search: "%%",
          positionsIds: [],
          teamsIds: [],
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
    };
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },
    addPlayer() {
      this.$router.push("/players/create");
    },
    editPlayer(id) {
      this.$router.push(`/players/edit/${id}`);
    },
    async deleteItems(ids) {
      try {
        this.loading = true;

        const query = gql`
          ${USERDELETE}
        `;

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Usuário(s) deletado(s) com sucesso!", () => {
          this.items = this.items.filter((item) => !ids.includes(item.id));
        });

        this.getPlayers({ fetchPolicy: "network-only" });
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item[0];
          });

          this.errorFields = Object.keys(this.errors);

          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao deletar o usuário!", footer);
        } else {
          confirmError("Ocorreu um erro ao deletar o usuário!");
        }
      }
      this.loading = false;
    },

    async deletePlayer(id) {
      await this.deleteItems([id]);
    },

    async deletePlayers(items) {
      await this.deleteItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetPlayers.page = page;
      this.getPlayers();
    },

    searchPlayers(search) {
      this.variablesGetPlayers.filter.search = `%${search}%`;
    },

    clearSearch() {
      this.variablesGetPlayers.filter = {
        search: "%%",
        positionsIds: [],
        teamsIds: [],
      };
    },

    getPlayers(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${PLAYERS}
      `;

      let positionsIdsValues = this.variablesGetPlayers.filter.positionsIds.map(
        (position) => position.value
      );

      let teamsIdsValues = this.variablesGetPlayers.filter.teamsIds.map(
        (team) => team.value
      );

      const consult = {
        ...this.variablesGetPlayers,
        filter: {
          ...this.variablesGetPlayers.filter,
          positionsIds: positionsIdsValues,
          teamsIds: teamsIdsValues,
        },
      };

      const {
        result: { value },
      } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.users?.data.length > 0) {
          this.paginatorInfo = result.data.users.paginatorInfo;
          this.items = result.data.users.data;
        }
      });

      if (value) {
        if (value?.users?.data.length > 0) {
          this.paginatorInfo = value.users.paginatorInfo;
          this.items = value.users.data;
        }
      }
      this.loading = false;
    },
  },
});
</script>
