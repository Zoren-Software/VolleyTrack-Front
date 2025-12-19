<template>
  <div class="teams-listing">
    <!-- Filter Card -->
    <va-card class="filter-card">
      <div class="filter-content">
        <div class="search-section">
          <label class="filter-label">Buscar</label>
          <ZDataTableInputSearch
            v-model="internalSearchValue"
            placeholder="Nome do time..."
            @actionSearch="handleSearch"
          />
        </div>
        <div class="filters-section">
          <div class="filter-item">
            <label class="filter-label">Posição</label>
            <ZSelectPosition
              label=""
              placeholder="Selecione uma posição"
              v-model="variablesGetTeams.filter.positionsIds"
              :teamsIds="variablesGetTeams.filter.teamsIds"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Jogador</label>
            <ZSelectUser
              label=""
              placeholder="Selecione um jogador"
              v-model="variablesGetTeams.filter.playersIds"
            />
          </div>
        </div>
        <div class="filter-actions">
          <va-button
            color="#E9742B"
            class="search-button"
            @click="handleSearch"
          >
            <va-icon name="search" class="button-icon" />
            <span class="button-text">Pesquisar</span>
          </va-button>
        </div>
      </div>
    </va-card>

    <!-- DataTable -->
    <ZDatatableGeneric
      :buttonActionAdd="false"
      buttonActionDelete
      includeActionsColumn
      includeActionEditList
      includeActionDeleteList
      selectable
      :items="items"
      :columns="columns"
      :loading="loading"
      :paginatorInfo="paginatorInfo"
      :filter="false"
      @search="searchTeams"
      @actionSearch="handleSearch"
      @actionClear="clearSearch"
      @update:search="searchTeams"
      @add="addTeam"
      @edit="editTeam"
      @delete="deleteTeam"
      @deletes="deleteTeams"
      @update:currentPageActive="updateCurrentPageActive"
    >
      <!-- CELL -->
      <template #cell(team)="{ rowKey }">
        <ZTeam :data="rowKey" />
      </template>
      <template #cell(category)="{ rowKey: { teamCategory } }">
        <ZBadgeCustom
          :text="teamCategory?.name || 'Sem Categoria'"
          backgroundColor="#F5F5F5"
          textColor="#000000"
        />
      </template>
      <template #cell(level)="{ rowKey: { teamLevel } }">
        <ZBadgeCustom
          :text="teamLevel?.name || 'Sem Nível Técnico'"
          backgroundColor="#F5F5F5"
          textColor="#000000"
        />
      </template>
      <template #cell(players)="{ rowKey: { players } }">
        <span>{{ players?.length || 0 }} Jogadores</span>
      </template>
    </ZDatatableGeneric>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <va-card class="summary-card">
        <div class="summary-content">
          <div class="summary-icon">
            <va-icon name="groups" size="large" color="#E9742B" />
          </div>
          <div class="summary-number">{{ paginatorInfo.total || 0 }}</div>
          <div class="summary-label">Total de Times</div>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import moment from "moment";
import TEAMS from "~/graphql/team/query/teams.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZDateTraining from "~/components/molecules/Datatable/Slots/ZDateTraining";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import ZBadgeCustom from "~/components/molecules/Badges/ZBadgeCustom";
import TEAMDELETE from "~/graphql/team/mutation/teamDelete.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZDateTraining,
    ZTeam,
    ZUser,
    ZSelectPosition,
    ZSelectTeam,
    ZSelectUser,
    ZDataTableInputSearch,
    ZBadgeCustom,
  },

  created() {
    this.getTeams();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "team", name: "team", label: "Time", sortable: false },
      {
        key: "category",
        name: "category",
        label: "Categoria",
        sortable: false,
      },
      { key: "level", name: "level", label: "Nível Técnico", sortable: false },
      {
        key: "players",
        name: "players",
        label: "Total de Jogadores",
        sortable: false,
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
      variablesGetTeams: {
        page: 1,
        filter: {
          usersIds: [],
          playersIds: [],
          positionsIds: [],
          search: "%%",
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
      internalSearchValue: "",
    };
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },
    addTeam() {
      this.$router.push("/teams/create");
    },
    editTeam(id) {
      this.$router.push(`/teams/edit/${id}`);
    },
    async deleteItems(ids) {
      try {
        this.loading = true;

        const query = gql`
          ${TEAMDELETE}
        `;

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Time(s) deletado(s) com sucesso!", () => {
          this.items = this.items.filter((item) => !ids.includes(item.id));
        });

        this.getTeams({ fetchPolicy: "network-only" });
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

          confirmError("Ocorreu um erro ao deletar o treino!", footer);
        } else {
          confirmError("Ocorreu um erro ao deletar o treino!");
        }
      }
      this.loading = false;
    },

    formatTrainingDate(dateStart) {
      return moment(dateStart);
    },

    async deleteTeam(id) {
      await this.deleteItems([id]);
    },

    async deleteTeams(items) {
      await this.deleteItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetTeams.page = page;
      this.getTeams();
    },

    searchTeams(search) {
      // Se search for vazio ou undefined, usar %%
      if (!search || search === "") {
        this.variablesGetTeams.filter.search = "%%";
      } else {
        // Remover os % se já existirem para evitar duplicação
        const cleanSearch = search.replace(/%/g, "");
        this.variablesGetTeams.filter.search = `%${cleanSearch}%`;
      }
    },

    handleSearch() {
      // Atualizar o filtro de busca com o valor do campo de busca
      if (
        this.internalSearchValue !== undefined &&
        this.internalSearchValue !== null
      ) {
        this.searchTeams(this.internalSearchValue);
      }
      // Executar a busca com os filtros atualizados
      this.getTeams({ fetchPolicy: "network-only" });
    },

    clearSearch() {
      this.internalSearchValue = "";
      this.variablesGetTeams.filter = {
        search: "%%",
        usersIds: [],
        playersIds: [],
        positionsIds: [],
      };
      // Recarregar dados após limpar filtros
      this.getTeams({ fetchPolicy: "network-only" });
    },

    getTeams(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${TEAMS}
      `;

      let positionsIdsValues =
        this.variablesGetTeams.filter.positionsIds?.map(
          (position) => position?.value || position
        ) || [];

      let usersIdsValues =
        this.variablesGetTeams.filter.usersIds?.map(
          (user) => user?.value || user
        ) || [];

      let playersIdsValues =
        this.variablesGetTeams.filter.playersIds?.map(
          (player) => player?.value || player
        ) || [];

      const consult = {
        ...this.variablesGetTeams,
        filter: {
          ...this.variablesGetTeams.filter,
          positionsIds: positionsIdsValues,
          usersIds: usersIdsValues,
          playersIds: playersIdsValues,
        },
      };

      const {
        result: { value },
        onResult,
      } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first",
      });

      onResult((result) => {
        this.loading = false;
        if (result?.data?.teams) {
          this.paginatorInfo = result.data.teams.paginatorInfo || {
            currentPage: 1,
            lastPage: 1,
            total: 0,
            firstItem: 0,
            lastItem: 0,
            perPage: 10,
          };
          this.items = (result.data.teams.data || []).map((team) => ({
            ...team,
            teamCategory: team.teamCategory || { name: "Sem Categoria" },
            teamLevel: team.teamLevel || { name: "Sem Nível Técnico" },
            players: team.players || [],
          }));
        } else {
          this.items = [];
          this.paginatorInfo = {
            currentPage: 1,
            lastPage: 1,
            total: 0,
            firstItem: 0,
            lastItem: 0,
            perPage: 10,
          };
        }
      });

      // Tratar dados em cache
      if (value?.teams) {
        this.loading = false;
        this.paginatorInfo = value.teams.paginatorInfo || {
          currentPage: 1,
          lastPage: 1,
          total: 0,
          firstItem: 0,
          lastItem: 0,
          perPage: 10,
        };
        this.items = (value.teams.data || []).map((team) => ({
          ...team,
          teamCategory: team.teamCategory || { name: "Sem Categoria" },
          teamLevel: team.teamLevel || { name: "Sem Nível Técnico" },
          players: team.players || [],
        }));
      } else if (value && !value.teams) {
        // Se value existe mas não tem teams, pode ser que ainda esteja carregando
        // ou que não há dados
        this.loading = false;
        this.items = [];
      }
    },
  },
});
</script>

<style scoped>
.teams-listing {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-content {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: space-between;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.filters-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.filter-item :deep(.va-input-wrapper) {
  margin-bottom: 0;
}

.filter-item :deep(.va-select) {
  margin-top: 0;
}

.filter-item :deep(.va-input-wrapper__field) {
  margin-top: 0;
}

.filter-item :deep(.va-input-wrapper__label) {
  display: none;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b1e3a;
  margin-bottom: 8px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  margin-left: auto;
}

.search-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #e9742b !important;
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.search-button:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.4);
  transform: translateY(-1px);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(233, 116, 43, 0.3);
}

.search-button .button-icon {
  font-size: 18px;
  color: #ffffff;
}

.search-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  margin-bottom: 8px;
}

.summary-number {
  font-size: 36px;
  font-weight: 700;
  color: #0b1e3a;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
  }

  .search-section,
  .filter-item {
    width: 100%;
    min-width: unset;
  }
}
</style>
