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
          <div class="filter-item">
            <label class="filter-label">Função</label>
            <ZSelectRole
              label=""
              v-model="variablesGetPlayers.filter.rolesIds"
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

    <!-- Modal de Estatísticas -->
    <ZPlayerStatsModal
      v-if="selectedPlayerId"
      v-model="showStatsModal"
      :player-id="selectedPlayerId"
    />

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
            {{
              (rowKey.displayName || rowKey.name)?.charAt(0)?.toUpperCase() ||
              ""
            }}
          </va-avatar>
          <div class="player-info">
            <div class="player-name">
              {{ rowKey.displayName || rowKey.name || "-" }}
            </div>
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
            <va-popover
              v-if="rowKey.emailVerifiedAt"
              placement="top"
              trigger="hover"
              class="email-verified-popover"
            >
              <va-icon
                name="verified"
                size="small"
                class="email-verified-icon"
              />
              <template #body>
                <div class="email-verified-tooltip">Email verificado</div>
              </template>
            </va-popover>
          </div>
          <div v-if="rowKey.information?.phone" class="contact-item">
            <a
              :href="getWhatsAppLink(rowKey.information.phone)"
              target="_blank"
              rel="noopener noreferrer"
              class="phone-link"
              :title="'Abrir conversa no WhatsApp'"
            >
              <svg
                class="whatsapp-icon"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="15"
                height="15"
              >
                <path
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.372a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                />
              </svg>
              {{ formatPhone(rowKey.information.phone) }}
            </a>
          </div>
        </div>
      </template>
      <!-- Botão de Estatísticas na coluna de ações -->
      <template #cell(actions)="{ rowKey }">
        <div class="action-buttons-wrapper">
          <va-button
            icon="bar_chart"
            color="#e9742b"
            size="small"
            class="stats-btn action-btn"
            :title="'Ver estatísticas de ' + (rowKey.displayName || rowKey.name)"
            @click="openStatsModal(rowKey.id)"
          />
        </div>
      </template>
      <template #cell(team)="{ rowKey: { teams } }">
        <div class="teams-cell">
          <template
            v-if="teams && (Array.isArray(teams) ? teams.length > 0 : teams)"
          >
            <div class="teams-wrapper">
              <!-- Mostrar apenas o primeiro time -->
              <ZTeam
                :key="getFirstTeam(teams)?.id || 0"
                :data="getFirstTeam(teams)"
                :showCategoryAndLevel="true"
                class="team-item"
              />
              <!-- Badge com quantidade de times extras -->
              <ZTeamsExtra
                v-if="hasExtraTeams(teams)"
                :teams="normalizeTeams(teams)"
                class="teams-extra"
              />
            </div>
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
      <template #cell(roles)="{ rowKey: { roles } }">
        <div class="roles-cell">
          <template
            v-if="roles && (Array.isArray(roles) ? roles.length > 0 : roles)"
          >
            <span
              v-for="(role, index) in Array.isArray(roles)
                ? roles
                : [roles].filter(Boolean)"
              :key="role?.id || index"
              class="role-tag"
            >
              {{ role?.name }}
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
          <div class="summary-number-wrapper">
            <div class="summary-number">
              {{ paginatorInfo.total || 0
              }}<span
                v-if="showPlanLimits && planLimits.maxPlayers"
                class="plan-limit"
              >
                / {{ planLimits.maxPlayers }}</span
              >
            </div>
            <va-popover
              v-if="showPlanLimits && planLimits.maxPlayers"
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
                  Você pode cadastrar até {{ planLimits.maxPlayers }} jogadores
                  no seu plano atual.
                </p>
              </template>
            </va-popover>
          </div>
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
import ZSelectRole from "~/components/molecules/Selects/ZSelectRole";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import ZTeamsExtra from "~/components/molecules/Badges/ZTeamsExtra.vue";
import ZPlayerStatsModal from "~/components/molecules/Modal/ZPlayerStatsModal.vue";
import USERDELETE from "~/graphql/user/mutation/userDelete.graphql";
import ROLES from "~/graphql/role/query/roles.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import { getActivePlan } from "~/services/stripeCheckoutService.js";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZPosition,
    ZCPF,
    ZTeam,
    ZTeamsExtra,
    ZSelectPosition,
    ZSelectTeam,
    ZSelectRole,
    ZDataTableInputSearch,
    ZPlayerStatsModal,
  },

  async created() {
    await this.setDefaultRoleFilter();
    this.getPlayers();
    this.loadActivePlan();
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
      {
        key: "roles",
        name: "roles",
        label: "FUNÇÕES",
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
          rolesIds: [],
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
      activePlanData: null,
      showStatsModal: false,
      selectedPlayerId: null,
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
    addPlayer() {
      this.$router.push("/players/create");
    },
    editPlayer(id) {
      this.$router.push(`/players/edit/${id}`);
    },
    openStatsModal(playerId) {
      this.selectedPlayerId = playerId;
      this.showStatsModal = true;
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
        rolesIds: [],
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

      let rolesIdsValues =
        this.variablesGetPlayers.filter.rolesIds?.map(
          (role) => role?.value || role?.id || role
        ) || [];

      const consult = {
        ...this.variablesGetPlayers,
        filter: {
          ...this.variablesGetPlayers.filter,
          positionsIds: positionsIdsValues,
          teamsIds: teamsIdsValues,
          rolesIds: rolesIdsValues,
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
    getWhatsAppLink(phone) {
      if (!phone) return "#";
      // Remove todos os caracteres não numéricos
      const cleaned = phone.replace(/\D/g, "");

      // Se não tiver número, retorna link vazio
      if (!cleaned) return "#";

      // Para números brasileiros, adiciona código do país 55
      // Se já tiver código do país, mantém; senão, adiciona
      let phoneNumber = cleaned;
      if (!phoneNumber.startsWith("55") && phoneNumber.length >= 10) {
        phoneNumber = "55" + phoneNumber;
      }

      // Gera o link do WhatsApp
      return `https://wa.me/${phoneNumber}`;
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
    async setDefaultRoleFilter() {
      try {
        // Buscar a role "jogadores" para definir como filtro padrão
        const query = gql`
          ${ROLES}
        `;

        const variables = {
          page: 1,
          first: 100,
          filter: {
            search: "%%",
          },
        };

        return new Promise((resolve) => {
          const { onResult } = useQuery(query, variables);
          onResult((result) => {
            if (result?.data?.roles?.data) {
              // Procurar role "jogadores" (case insensitive)
              const jogadorRole = result.data.roles.data.find((role) =>
                role.name.toLowerCase().includes("jogador")
              );

              if (jogadorRole) {
                // Definir como filtro padrão
                this.variablesGetPlayers.filter.rolesIds = [
                  {
                    text: jogadorRole.name,
                    value: Number(jogadorRole.id),
                    id: Number(jogadorRole.id),
                  },
                ];
                console.log("✅ Filtro padrão de role 'jogadores' definido");
              }
            }
            resolve();
          });
        });
      } catch (error) {
        console.error("Erro ao buscar role padrão:", error);
        // Continuar sem filtro padrão em caso de erro
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
    // Helper para normalizar array de times
    normalizeTeams(teams) {
      if (!teams) return [];
      return Array.isArray(teams) ? teams : [teams].filter(Boolean);
    },
    // Helper para obter o primeiro time
    getFirstTeam(teams) {
      const normalized = this.normalizeTeams(teams);
      return normalized[0] || null;
    },
    // Helper para verificar se há times extras
    hasExtraTeams(teams) {
      const normalized = this.normalizeTeams(teams);
      return normalized.length > 1;
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.player-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  background: #e9742b !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 1.3), 0 1px 3px rgba(0, 0, 0, 0.08) !important;
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
  flex: 1;
  min-width: 0;
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

.phone-link {
  color: #4a5568;
  text-decoration: none;
  transition: color 0.2s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.phone-link:hover {
  color: #25d366;
  text-decoration: underline;
}

.whatsapp-icon {
  color: #25d366;
  flex-shrink: 0;
  width: 15px;
  height: 15px;
  transition: transform 0.2s ease;
}

.phone-link:hover .whatsapp-icon {
  transform: scale(1.1);
}

.email-verified-popover {
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
}

.email-verified-icon {
  color: #28a745;
  font-size: 14px;
  opacity: 0.7;
  flex-shrink: 0;
  cursor: help;
}

.email-verified-tooltip {
  font-size: 12px;
  color: #ffffff;
  padding: 4px 8px;
  white-space: nowrap;
}

.contact-icon {
  color: #9ca3af;
  font-size: 14px;
  flex-shrink: 0;
}

.teams-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.teams-wrapper {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  flex-wrap: nowrap;
  width: 100%;
}

.team-item {
  flex: 1;
  min-width: 0;
}

/* Ajustar o alinhamento do badge para ficar na mesma linha das informações do time */
.teams-extra {
  flex-shrink: 0;
  align-self: flex-start;
  /* Alinhar com a linha onde está "Adulto Ouro" */
  /* Considerando: avatar padding-top (2px) + nome do time (14px + 2px margin) + espaçamento */
  /* Total: ~18-20px para alinhar com a primeira linha de informações */
  margin-top: 20px;
}

.team-item {
  margin-bottom: 4px;
}

.team-item :deep(.team-avatar),
.team-item :deep(.team-avatar .va-avatar),
.team-item :deep(.team-avatar .va-avatar__content) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  border: 2px solid white !important;
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

.roles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-tag {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  background-color: #e3f2fd;
  color: #1976d2;
  line-height: 1.3;
  white-space: nowrap;
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
}

.stats-btn.action-btn {
  min-width: 32px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  padding: 0;
  background-color: #e9742b !important;
  color: white !important;
  transition: all 0.2s ease;
}

.stats-btn.action-btn:hover {
  background-color: #d6652a !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(233, 116, 43, 0.4);
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

/* Garantir sombra nos avatares de usuários (ZUser) na listagem de jogadores */
.players-listing :deep(.user-avatar),
.players-listing :deep(.user-avatar .va-avatar),
.players-listing :deep(.user-avatar .va-avatar__content) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  border: 2px solid white !important;
}
</style>
