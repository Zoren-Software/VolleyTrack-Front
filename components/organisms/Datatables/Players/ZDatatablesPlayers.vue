<template>
  <div class="players-listing">
    <!-- Filter Card -->
    <va-card class="filter-card">
      <div class="filter-content">
        <div class="search-section">
          <label class="filter-label">Buscar</label>
          <ZDataTableInputSearch
            v-model="internalSearchValue"
            placeholder="Nome, e-mail ou celular..."
            @actionSearch="handleSearch"
          />
        </div>
        <div class="filters-section">
          <div class="filter-item">
            <label class="filter-label">Time</label>
            <ZSelectTeam
              label=""
              v-model="variablesGetPlayers.filter.teamsIds"
              :positionsIds="variablesGetPlayers.filter.positionsIds"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Posição</label>
            <ZSelectPosition
              label=""
              v-model="variablesGetPlayers.filter.positionsIds"
              :teamsIds="variablesGetPlayers.filter.teamsIds"
            />
          </div>
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
      @search="searchPlayers"
      @actionSearch="handleSearch"
      @actionClear="clearSearch"
      @update:search="searchPlayers"
      @add="addPlayer"
      @edit="editPlayer"
      @delete="deletePlayer"
      @deletes="deletePlayers"
      @update:currentPageActive="updateCurrentPageActive"
    >
      <!-- CELL -->
      <template #cell(player)="{ rowKey }">
        <div class="player-cell">
          <va-avatar class="player-avatar" size="medium">
            {{ rowKey.name?.charAt(0)?.toUpperCase() || "" }}
          </va-avatar>
          <div class="player-info">
            <div class="player-name">{{ rowKey.name || "-" }}</div>
            <div class="player-id">
              ID: #{{ rowKey.id ? String(rowKey.id).padStart(3, "0") : "---" }}
            </div>
          </div>
        </div>
      </template>
      <template #cell(contact)="{ rowKey }">
        <div class="contact-cell">
          <div v-if="rowKey.email" class="contact-item">
            <va-icon name="email" size="medium" class="contact-icon" />
            <span>{{ rowKey.email }}</span>
          </div>
          <div v-if="rowKey.information?.phone" class="contact-item">
            <va-icon name="phone" size="medium" class="contact-icon" />
            <span>{{ formatPhone(rowKey.information.phone) }}</span>
          </div>
        </div>
      </template>
      <template #cell(team)="{ rowKey: { teams } }">
        <div class="teams-cell">
          <template
            v-if="teams && (Array.isArray(teams) ? teams.length > 0 : teams)"
          >
            <span
              v-for="(team, index) in Array.isArray(teams)
                ? teams
                : [teams].filter(Boolean)"
              :key="team?.id || index"
              class="team-tag"
              :class="getTeamTagClass(index, team?.name)"
            >
              {{ team?.name }}
            </span>
          </template>
          <span v-else class="no-data-text">-</span>
        </div>
      </template>
      <template #cell(positions)="{ rowKey: { positions } }">
        <div class="positions-cell">
          <template
            v-if="
              positions &&
              (Array.isArray(positions) ? positions.length > 0 : positions)
            "
          >
            <span
              v-for="(position, index) in Array.isArray(positions)
                ? positions
                : [positions].filter(Boolean)"
              :key="position?.id || index"
              class="position-tag"
            >
              {{ position?.name }}
            </span>
          </template>
          <span v-else class="no-data-text">-</span>
        </div>
      </template>
    </ZDatatableGeneric>

    <!-- Summary Cards -->
    <div class="summary-cards">
      <va-card class="summary-card">
        <div class="summary-content">
          <div class="summary-icon">
            <va-icon name="person" size="large" color="#E9742B" />
          </div>
          <div class="summary-number">{{ paginatorInfo.total || 0 }}</div>
          <div class="summary-label">Total de Jogadores</div>
        </div>
      </va-card>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import PLAYERS from "~/graphql/user/query/users.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
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
    ZDataTableInputSearch,
  },

  created() {
    this.getPlayers();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "player", name: "player", label: "NOME", sortable: true },
      { key: "contact", name: "contact", label: "CONTATO", sortable: false },
      { key: "team", name: "team", label: "TIMES", sortable: false },
      {
        key: "positions",
        name: "positions",
        label: "POSIÇÕES",
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
      internalSearch: "",
    };
  },
  computed: {
    internalSearchValue: {
      get() {
        return this.internalSearch;
      },
      set(value) {
        this.internalSearch = value;
        this.searchPlayers(value);
      },
    },
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
      // Se search for vazio ou undefined, usar %%
      if (!search || search === "") {
        this.variablesGetPlayers.filter.search = "%%";
      } else {
        this.variablesGetPlayers.filter.search = `%${search}%`;
      }
    },

    handleSearch() {
      // Garantir que o search está atualizado antes de buscar
      // O search já foi atualizado pelo evento @search
      this.getPlayers({ fetchPolicy: "network-only" });
    },

    clearSearch() {
      this.variablesGetPlayers.filter = {
        search: "%%",
        positionsIds: [],
        teamsIds: [],
      };
      // Recarregar dados após limpar filtros
      this.getPlayers({ fetchPolicy: "network-only" });
    },

    getPlayers(fetchPolicyOptions = {}) {
      this.loading = true;
      this.items = [];

      const query = gql`
        ${PLAYERS}
      `;

      let positionsIdsValues =
        this.variablesGetPlayers.filter.positionsIds?.map(
          (position) => position?.value || position
        ) || [];

      let teamsIdsValues =
        this.variablesGetPlayers.filter.teamsIds?.map(
          (team) => team?.value || team
        ) || [];

      const consult = {
        ...this.variablesGetPlayers,
        filter: {
          ...this.variablesGetPlayers.filter,
          positionsIds: positionsIdsValues,
          teamsIds: teamsIdsValues,
        },
      };

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "network-only", // Sempre buscar dados atualizados
      });

      onResult((result) => {
        this.loading = false;
        if (result?.data?.users) {
          this.paginatorInfo =
            result.data.users.paginatorInfo || this.paginatorInfo;
          // Sempre atualizar items, mesmo se for array vazio
          this.items = result.data.users.data || [];
        } else {
          this.items = [];
        }
      });
    },
    formatPhone(phone) {
      if (!phone) return "";
      const cleaned = phone.replace(/\D/g, "");
      if (cleaned.length === 11) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(
          7
        )}`;
      } else if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(
          6
        )}`;
      }
      return phone;
    },
    getTeamTagClass(index, teamName) {
      // Identificar o tipo de time pelo nome para aplicar a cor correta
      const name = (teamName || "").toLowerCase();

      if (name.includes("juvenil a")) {
        return "team-tag-juvenil-a";
      } else if (name.includes("juvenil b")) {
        return "team-tag-juvenil-b";
      } else if (name.includes("infantil")) {
        return "team-tag-infantil";
      }

      // Fallback: usar cores rotativas se não identificar
      const colors = ["team-tag-orange", "team-tag-blue", "team-tag-green"];
      return colors[index % colors.length];
    },
  },
});
</script>

<style scoped>
.player-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.player-avatar {
  flex-shrink: 0;
}

/* Forçar tamanho do avatar maior e aplicar borda branca */
.player-avatar,
.player-avatar :deep(.va-avatar),
.player-avatar :deep(.va-avatar__content) {
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  max-width: 48px !important;
  max-height: 48px !important;
  --va-size-computed: 48px !important;
  font-size: 20px !important;
  line-height: 48px !important;
  background: #e9742b !important;
  color: white !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}

.player-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  background: #e9742b !important;
  color: white !important;
}

/* Garantir que o tamanho seja aplicado corretamente */
.player-avatar[style*="--va-size-computed"] {
  --va-size-computed: 48px !important;
}

/* Garantir que elementos filhos usem o tamanho correto */
.player-avatar :deep(*) {
  --va-size-computed: 48px !important;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  font-weight: 600;
  color: #0b1e3a;
  font-size: 13px;
  line-height: 1.3;
}

.player-id {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.2;
}

.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #4a5568;
  font-size: 12px;
  line-height: 1.4;
}

.contact-icon {
  color: #9ca3af;
  font-size: 14px;
  flex-shrink: 0;
}

.teams-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.team-tag {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
  line-height: 1.3;
}

/* Cores específicas para tipos de times conforme mockup */
.team-tag-juvenil-a {
  background-color: #ff9933;
  color: white;
}

.team-tag-juvenil-b {
  background-color: #ddf0ff;
  color: #1976d2;
}

.team-tag-infantil {
  background-color: #e0ffe0;
  color: #2e7d32;
}

/* Fallback para outros times */
.team-tag-orange {
  background-color: #ff9933;
  color: white;
}

.team-tag-blue {
  background-color: #ddf0ff;
  color: #1976d2;
}

.team-tag-green {
  background-color: #e0ffe0;
  color: #2e7d32;
}

.positions-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.position-tag {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  background-color: #f0f0f0;
  color: #4a5568;
  line-height: 1.3;
}

.no-data-text {
  color: #9e9e9e;
  font-style: italic;
}

.players-listing {
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

<style>
/* Estilo global para forçar tamanho do avatar maior e aplicar borda branca */
.players-listing .player-avatar,
.players-listing .player-avatar.va-avatar,
.players-listing .player-avatar .va-avatar {
  --va-size-computed: 48px !important;
  width: 48px !important;
  height: 48px !important;
  min-width: 48px !important;
  min-height: 48px !important;
  max-width: 48px !important;
  max-height: 48px !important;
  font-size: 20px !important;
  background: #e9742b !important;
  color: white !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}
</style>
