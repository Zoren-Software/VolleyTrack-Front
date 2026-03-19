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
          <div class="filter-item">
            <label class="filter-label">Categoria</label>
            <ZSelectTeamCategory
              label=""
              placeholder="Selecione uma categoria"
              v-model="variablesGetTeams.filter.teamCategoryId"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Nível Técnico</label>
            <ZSelectTeamLevel
              label=""
              placeholder="Selecione o nível técnico"
              v-model="variablesGetTeams.filter.teamLevelId"
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

    <!-- Aviso quando a busca foi limitada (muitos times) -->
    <va-alert
      v-if="fetchTruncatedWarning"
      color="warning"
      class="truncated-warning"
      closeable
      @click:close="fetchTruncatedWarning = null"
    >
      {{ fetchTruncatedWarning }}
    </va-alert>

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
      <!-- Botões de Ações na coluna de ações -->
      <template #cell(actions)="{ rowKey }">
        <div class="action-buttons-wrapper">
          <va-button
            icon="bar_chart"
            color="#e9742b"
            size="small"
            class="stats-btn action-btn"
            :title="'Ver estatísticas de ' + (rowKey.name || 'Time')"
            @click="openStatsModal(rowKey.id)"
          />
          <va-button
            icon="edit"
            color="#1976d2"
            size="small"
            class="edit-btn action-btn"
            :title="'Editar ' + (rowKey.name || 'Time')"
            @click="editTeam(rowKey.id)"
          />
          <va-button
            icon="delete"
            color="#dc3545"
            size="small"
            class="delete-btn action-btn"
            :title="'Deletar ' + (rowKey.name || 'Time')"
            @click="deleteTeam(rowKey.id)"
          />
        </div>
      </template>
    </ZDatatableGeneric>

    <!-- Modal de Estatísticas do Time -->
    <ZTeamStatsModal
      v-if="selectedTeamId"
      v-model="showTeamStatsModal"
      :team-id="selectedTeamId"
    />

    <!-- Summary Cards -->
    <div class="summary-cards">
      <va-card class="summary-card">
        <div class="summary-content">
          <div class="summary-icon">
            <va-icon name="groups" size="large" color="#E9742B" />
          </div>
          <div class="summary-number-wrapper">
            <div class="summary-number">
              {{ paginatorInfo.total || 0
              }}<span
                v-if="showPlanLimits && planLimits.maxTeams"
                class="plan-limit"
              >
                / {{ planLimits.maxTeams }}</span
              >
            </div>
            <va-popover
              v-if="showPlanLimits && planLimits.maxTeams"
              placement="top"
              trigger="hover"
              class="plan-popover-wrapper"
            >
              <va-icon
                name="info"
                size="16px"
                color="#6c757d"
                class="plan-info-icon"
              />
              <template #title>Limite do Plano</template>
              <template #body>
                <p class="plan-popover-text">
                  Você pode cadastrar até {{ planLimits.maxTeams }} times no seu
                  plano atual.
                </p>
              </template>
            </va-popover>
          </div>
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
import ZSelectTeamCategory from "~/components/molecules/Selects/ZSelectTeamCategory";
import ZSelectTeamLevel from "~/components/molecules/Selects/ZSelectTeamLevel";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZDateTraining from "~/components/molecules/Datatable/Slots/ZDateTraining";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import ZBadgeCustom from "~/components/molecules/Badges/ZBadgeCustom";
import ZTeamStatsModal from "~/components/molecules/Modal/ZTeamStatsModal.vue";
import TEAMDELETE from "~/graphql/team/mutation/teamDelete.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import { getActivePlan } from "~/services/stripeCheckoutService.js";

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
    ZTeamStatsModal,
    ZSelectTeamCategory,
    ZSelectTeamLevel,
  },

  created() {
    this.getTeams();
    this.loadActivePlan();
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
          teamCategoryId: null,
          teamLevelId: null,
          search: "%%",
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      allTeamsUnfiltered: [],
      allTeamsBaseSignature: null,
      localPerPage: 10,
      localFetchRequestId: 0,
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
      internalSearchValue: "",
      activePlanData: null,
      showTeamStatsModal: false,
      selectedTeamId: null,
      fetchTruncatedWarning: null,
    };
  },
  computed: {
    showPlanLimits() {
      return (
        this.activePlanData &&
        this.activePlanData.has_active_plan &&
        !this.isUnlimitedPlan
      );
    },
    isUnlimitedPlan() {
      if (!this.activePlanData || !this.activePlanData.product) {
        return true;
      }

      const metadata = this.normalizeMetadata(
        this.activePlanData.product.metadata
      );
      const maxPlayers = parseInt(metadata.max_players || "0");
      const maxTeams = parseInt(metadata.max_teams || "0");
      const maxTrainings = parseInt(metadata.max_trainings || "0");

      return maxPlayers === 0 && maxTeams === 0 && maxTrainings === 0;
    },
    planLimits() {
      if (!this.activePlanData || !this.activePlanData.product) {
        return {
          maxPlayers: null,
          maxTeams: null,
          maxTrainings: null,
        };
      }

      const metadata = this.normalizeMetadata(
        this.activePlanData.product.metadata
      );

      return {
        maxPlayers: parseInt(metadata.max_players || "0") || null,
        maxTeams: parseInt(metadata.max_teams || "0") || null,
        maxTrainings: parseInt(metadata.max_trainings || "0") || null,
      };
    },
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
    openStatsModal(teamId) {
      this.selectedTeamId = teamId;
      this.showTeamStatsModal = true;
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
      // Ao alterar filtros, voltar para a primeira página evita exibir página vazia
      this.variablesGetTeams.page = 1;
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
        teamCategoryId: null,
        teamLevelId: null,
      };
      this.variablesGetTeams.page = 1;
      this.fetchTruncatedWarning = null;
      // Recarregar dados após limpar filtros
      this.getTeams({ fetchPolicy: "network-only" });
    },

    normalizeSelectionToId(selection) {
      if (selection === undefined || selection === null || selection === "") {
        return null;
      }

      if (typeof selection === "object") {
        const raw = selection?.value ?? selection?.id;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      }

      const n = Number(selection);
      return Number.isFinite(n) ? n : null;
    },

    getServerTeamsFilter() {
      const positionsIdsValues =
        this.variablesGetTeams.filter.positionsIds?.map(
          (position) => position?.value || position
        ) || [];

      const usersIdsValues =
        this.variablesGetTeams.filter.usersIds?.map(
          (user) => user?.value || user
        ) || [];

      const playersIdsValues =
        this.variablesGetTeams.filter.playersIds?.map(
          (player) => player?.value || player
        ) || [];

      return {
        search: this.variablesGetTeams.filter.search ?? "%%",
        positionsIds: positionsIdsValues,
        usersIds: usersIdsValues,
        playersIds: playersIdsValues,
      };
    },

    getBaseFilterSignature() {
      const serverFilter = this.getServerTeamsFilter();

      const normalizeAndSort = (arr) =>
        (arr || [])
          .map((v) => Number(v))
          .filter((n) => Number.isFinite(n))
          .sort((a, b) => a - b);

      return JSON.stringify({
        search: serverFilter.search,
        positionsIds: normalizeAndSort(serverFilter.positionsIds),
        usersIds: normalizeAndSort(serverFilter.usersIds),
        playersIds: normalizeAndSort(serverFilter.playersIds),
      });
    },

    shouldUseLocalCategoryLevelFilters() {
      const categoryId = this.normalizeSelectionToId(
        this.variablesGetTeams.filter.teamCategoryId
      );
      const levelId = this.normalizeSelectionToId(
        this.variablesGetTeams.filter.teamLevelId
      );

      return categoryId !== null || levelId !== null;
    },

    applyLocalCategoryLevelFilters(teams) {
      const categoryId = this.normalizeSelectionToId(
        this.variablesGetTeams.filter.teamCategoryId
      );
      const levelId = this.normalizeSelectionToId(
        this.variablesGetTeams.filter.teamLevelId
      );

      return (teams || []).filter((team) => {
        const teamCategoryId =
          team?.teamCategory?.id !== undefined &&
          team?.teamCategory?.id !== null
            ? Number(team.teamCategory.id)
            : null;
        const teamLevelId =
          team?.teamLevel?.id !== undefined && team?.teamLevel?.id !== null
            ? Number(team.teamLevel.id)
            : null;

        const matchesCategory =
          categoryId === null || teamCategoryId === categoryId;
        const matchesLevel = levelId === null || teamLevelId === levelId;

        return matchesCategory && matchesLevel;
      });
    },

    async fetchAllTeamsForBaseFilters(fetchPolicyOptions = {}) {
      const nuxtApp = useNuxtApp();
      const apolloClient = nuxtApp._apolloClients?.default;

      if (!apolloClient) {
        throw new Error("Apollo Client não encontrado");
      }

      const query = gql`
        ${TEAMS}
      `;

      let page = 1;
      let lastPage = 1;
      let perPage = this.localPerPage || 10;
      let allTeams = [];

      // Limites para evitar muitas requisições e uso excessivo de memória em cenários com muitos times
      const MAX_PAGES = 50;
      const MAX_TEAMS = 2000;

      while (
        page <= lastPage &&
        page <= MAX_PAGES &&
        allTeams.length < MAX_TEAMS
      ) {
        const consult = {
          ...this.variablesGetTeams,
          page,
          filter: this.getServerTeamsFilter(),
        };

        const result = await apolloClient.query({
          query,
          variables: consult,
          fetchPolicy: fetchPolicyOptions.fetchPolicy || "network-only",
        });

        const teamsPayload = result?.data?.teams;
        const paginatorInfo = teamsPayload?.paginatorInfo;
        const teamsData = teamsPayload?.data || [];

        if (paginatorInfo?.perPage) {
          perPage = paginatorInfo.perPage;
        }
        if (paginatorInfo?.lastPage !== undefined && paginatorInfo?.lastPage !== null) {
          lastPage = paginatorInfo.lastPage;
        }

        // Se não vierem dados, não faz sentido continuar paginando
        if (!teamsData.length) {
          break;
        }

        allTeams = allTeams.concat(teamsData);
        page += 1;

        if (page > 1000) {
          // Evita loop infinito: registra aviso e dispara erro para tratamento no UI
          console.warn(
            "[fetchAllTeamsForBaseFilters] Limite máximo de páginas excedido (page > 1000). " +
              "Verifique a paginação do backend."
          );
          throw new Error(
            "Não foi possível carregar todos os times: limite máximo de páginas excedido. " +
              "Tente ajustar os filtros ou contate o suporte."
          );
        }
      }

      const truncatedByLimit =
        page <= lastPage && (page > MAX_PAGES || allTeams.length >= MAX_TEAMS);
      if (truncatedByLimit) {
        console.warn(
          "[fetchAllTeamsForBaseFilters] Resultados limitados:",
          `carregados ${allTeams.length} times (máx. ${MAX_TEAMS}) em ${page - 1} páginas (máx. ${MAX_PAGES}). Refine os filtros para ver mais.`
        );
      }

      return {
        teams: allTeams.map((team) => ({
          ...team,
          teamCategory: team.teamCategory || { name: "Sem Categoria" },
          teamLevel: team.teamLevel || { name: "Sem Nível Técnico" },
          players: team.players || [],
        })),
        perPage,
        truncatedByLimit,
      };
    },

    async getTeams(fetchPolicyOptions = {}) {
      this.loading = true;
      // No modo de filtro local, mantém os itens atuais até a nova lista estar pronta
      // para evitar flicker (tabela piscando vazia) durante o fetch de múltiplas páginas
      if (!this.shouldUseLocalCategoryLevelFilters()) {
        this.items = [];
        this.fetchTruncatedWarning = null;
      }

      if (this.shouldUseLocalCategoryLevelFilters()) {
        const requestId = ++this.localFetchRequestId;
        const baseSignature = this.getBaseFilterSignature();

        // Se o conjunto base (search/posições/jogadores) mudou, buscar todos os times para filtrar no front
        if (
          !this.allTeamsBaseSignature ||
          this.allTeamsBaseSignature !== baseSignature
        ) {
          try {
            const { teams, perPage, truncatedByLimit } =
              await this.fetchAllTeamsForBaseFilters(fetchPolicyOptions);

            if (requestId !== this.localFetchRequestId) return;

            this.allTeamsUnfiltered = teams;
            this.allTeamsBaseSignature = baseSignature;
            this.localPerPage = perPage || this.localPerPage;
            this.fetchTruncatedWarning = truncatedByLimit
              ? "A lista foi limitada para evitar lentidão. Refine busca, categoria ou nível para ver resultados mais específicos."
              : null;
          } catch (error) {
            // Se a busca falhar, não interromper a página inteira
            console.error("Erro ao buscar times para filtragem local:", error);
            this.allTeamsUnfiltered = [];
            this.allTeamsBaseSignature = null;
            this.fetchTruncatedWarning = null;
          }
        }

        const filteredTeams = this.applyLocalCategoryLevelFilters(
          this.allTeamsUnfiltered
        );

        const perPage = this.localPerPage || 10;
        const total = filteredTeams.length;
        const lastPage = total === 0 ? 1 : Math.max(1, Math.ceil(total / perPage));
        const currentPage = Math.max(
          1,
          Math.min(this.variablesGetTeams.page || 1, lastPage)
        );
        const firstIndex = (currentPage - 1) * perPage;
        const pageTeams = filteredTeams.slice(
          firstIndex,
          firstIndex + perPage
        );

        this.items = pageTeams;
        this.paginatorInfo = {
          currentPage,
          lastPage,
          total,
          firstItem: total === 0 ? 0 : firstIndex + 1,
          lastItem: total === 0 ? 0 : firstIndex + pageTeams.length,
          perPage,
        };

        this.loading = false;
        return;
      }

      const query = gql`
        ${TEAMS}
      `;

      const consult = {
        ...this.variablesGetTeams,
        filter: this.getServerTeamsFilter(),
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
    async loadActivePlan() {
      try {
        const token =
          localStorage.getItem("userToken") ||
          localStorage.getItem("apollo:default.token");
        if (!token) {
          console.log("⚠️ Token não encontrado para carregar plano ativo");
          return;
        }

        const tenantId = localStorage.getItem("tenant_id") || "default";
        console.log("🔍 Carregando plano ativo - tenantId:", tenantId);

        const result = await getActivePlan(token, tenantId);
        console.log("🔍 Resultado do getActivePlan:", result);

        if (result.success && result.data) {
          this.activePlanData = result.data;
          console.log("✅ Plano ativo carregado:", result.data);
        } else {
          console.log("⚠️ Plano ativo não encontrado ou erro:", result);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar plano ativo:", error);
      }
    },
    normalizeMetadata(metadata) {
      if (!metadata) return {};

      if (typeof metadata === "string") {
        try {
          return JSON.parse(metadata);
        } catch (e) {
          return {};
        }
      }

      return metadata;
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

.truncated-warning {
  margin-bottom: 0;
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

.summary-number-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.summary-number {
  font-size: 36px;
  font-weight: 700;
  color: #0b1e3a;
}

.plan-limit {
  color: #9e9e9e;
  font-weight: 500;
  font-size: 30px;
}

.plan-popover-wrapper {
  position: absolute;
  top: -8px;
  right: -8px;
}

.plan-info-icon {
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.plan-info-icon:hover {
  opacity: 1;
}

.plan-popover-text {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
  line-height: 1.4;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.action-buttons-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.action-btn {
  min-width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.stats-btn {
  background-color: #e9742b !important;
  color: white !important;
}

.stats-btn :deep(.va-icon),
.stats-btn :deep(.material-icons) {
  color: white !important;
}

.stats-btn:hover :deep(.va-icon),
.stats-btn:hover :deep(.material-icons) {
  color: white !important;
}

.edit-btn {
  background-color: #1976d2 !important;
  color: white !important;
}

.delete-btn {
  background-color: #dc3545 !important;
  color: white !important;
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

  .action-buttons-wrapper {
    flex-direction: column;
    gap: 4px;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
