<template>
  <div class="players-listing">
    <!-- Filter Card -->
    <va-card class="filter-card">
      <div class="filter-row filter-row--search">
        <div class="search-section">
          <label class="filter-label">Buscar</label>
          <ZDataTableInputSearch
            v-model="internalSearchValue"
            placeholder="Nome, e-mail ou celular..."
            @actionSearch="handleSearch"
          />
        </div>
      </div>
      <div class="filter-row filter-row--filters">
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
            class="search-button"
            :class="{ 'search-button--active': hasSearchFilterCriteria }"
            @click="handleSearch"
          >
            <va-icon name="search" class="button-icon" />
            <span class="button-text">Pesquisar</span>
          </va-button>
        </div>
      </div>
    </va-card>

    <VaModal
      v-model="showTeamsListModal"
      :title="teamsListModalTitle"
      size="small"
      close-button
      hide-default-actions
      class="player-teams-list-modal"
    >
      <div class="player-teams-list">
        <div
          v-for="(team, index) in teamsModalList"
          :key="team?.id || index"
          class="player-teams-list-item"
        >
          <div class="player-teams-list-name">{{ team?.name || "-" }}</div>
          <div
            v-if="team?.teamCategory || team?.teamLevel"
            class="player-teams-list-meta"
          >
            <span v-if="team?.teamCategory" class="player-teams-list-cat">{{
              team.teamCategory.name
            }}</span>
            <span
              v-if="team?.teamCategory && team?.teamLevel"
              class="player-teams-list-sep"
              >·</span
            >
            <span v-if="team?.teamLevel" class="player-teams-list-level">{{
              team.teamLevel.name
            }}</span>
          </div>
        </div>
      </div>
    </VaModal>

    <!-- DataTable -->
    <ZDatatableGeneric
      :buttonActionAdd="false"
      buttonActionDelete
      bulk-delete-via-selection-badge
      disable-action-delete
      includeActionsColumn
      :includeActionEditList="includeActionEditList"
      :includeActionDeleteList="includeActionDeleteList"
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
            <div v-if="rowKey.email" class="contact-item player-info-meta">
              <va-icon name="email" size="small" class="contact-icon" />
              <span class="player-meta-text">{{ rowKey.email }}</span>
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
            <div
              v-if="rowKey.information?.phone"
              class="contact-item player-info-meta"
            >
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
        </div>
      </template>
      <template #cell(actions)="{ rowKey }">
        <div class="actions-cell">
          <ZDataTableActions
            :id="Number(rowKey.id)"
            include-action-stats-list
            include-action-edit-list
            include-action-delete-list
            @stats="openStatsModal"
            @edit="editPlayer"
            @delete="deletePlayer"
          />
        </div>
      </template>
      <template #cell(team)="{ rowKey }">
        <div class="teams-cell">
          <template
            v-if="
              rowKey.teams &&
              (Array.isArray(rowKey.teams)
                ? rowKey.teams.length > 0
                : rowKey.teams)
            "
          >
            <button
              type="button"
              class="teams-count-chip"
              :title="'Ver todos os times de ' + (rowKey.displayName || rowKey.name)"
              @click="openTeamsListModal(rowKey)"
            >
              <va-icon name="groups" size="14px" color="#FF4E1B" />
              <span class="teams-count-chip-text">
                {{ normalizeTeams(rowKey.teams).length }}
                {{
                  normalizeTeams(rowKey.teams).length === 1 ? "time" : "times"
                }}
              </span>
            </button>
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
              <va-icon
                :name="getRoleIconName(role)"
                size="14px"
                color="#4a5568"
                class="role-tag-icon"
              />
              {{ role?.name }}
            </span>
          </template>
          <span v-else class="no-data-text">-</span>
        </div>
      </template>
    </ZDatatableGeneric>
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
import ZDataTableActions from "~/components/molecules/Datatable/ZDataTableActions.vue";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZCPF from "~/components/molecules/Datatable/Slots/ZCPF";
import USERDELETE from "~/graphql/user/mutation/userDelete.graphql";
import ROLES from "~/graphql/role/query/roles.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZUser,
    ZPosition,
    ZCPF,
    ZSelectPosition,
    ZSelectTeam,
    ZSelectRole,
    ZDataTableInputSearch,
    ZDataTableActions,
  },

  created() {
    this.getPlayers();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "player", name: "player", label: "NOME", sortable: true },
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
      showTeamsListModal: false,
      teamsModalList: [],
      teamsModalPlayerLabel: "",
    };
  },
  computed: {
    teamsListModalTitle() {
      const name = this.teamsModalPlayerLabel || "Atleta";
      return `Times — ${name}`;
    },
    internalSearchValue: {
      get() {
        return this.internalSearch;
      },
      set(value) {
        this.internalSearch = value;
        this.searchPlayers(value);
      },
    },
    hasSearchFilterCriteria() {
      const f = this.variablesGetPlayers.filter;
      if ((this.internalSearch || "").trim().length > 0) {
        return true;
      }
      if (Array.isArray(f.teamsIds) && f.teamsIds.length > 0) {
        return true;
      }
      if (Array.isArray(f.positionsIds) && f.positionsIds.length > 0) {
        return true;
      }
      if (Array.isArray(f.rolesIds) && f.rolesIds.length > 0) {
        return true;
      }
      return false;
    },
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },
    openTeamsListModal(rowKey) {
      const teams = this.normalizeTeams(rowKey?.teams);
      if (!teams.length) {
        return;
      }
      this.teamsModalList = teams;
      this.teamsModalPlayerLabel =
        rowKey?.displayName || rowKey?.name || "Atleta";
      this.showTeamsListModal = true;
    },
    getRoleIconName(role) {
      const raw = (role?.name || "").trim();
      if (!raw) {
        return "manage_accounts";
      }
      const n = raw
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      if (n.includes("admin")) {
        return "shield";
      }
      if (n.includes("tecnico")) {
        return "layers";
      }
      if (n.includes("jogador")) {
        return "person";
      }
      const exact = {
        administrador: "shield",
        tecnico: "layers",
        jogador: "person",
      };
      return exact[n] || "manage_accounts";
    },
    addPlayer() {
      this.$router.push("/players/create");
    },
    editPlayer(id) {
      this.$router.push(`/players/edit/${id}`);
    },
    openStatsModal(playerId) {
      this.$router.push(`/players/stats/${playerId}`);
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
      // Encontrar o nome do jogador para exibir na mensagem de confirmação
      const player = this.items.find(item => item.id === id);
      const playerName = player?.displayName || player?.name || `jogador #${id}`;

      const result = await Swal.fire({
        title: 'Tem certeza?',
        html: `Você tem certeza que deseja deletar o jogador <strong>${playerName}</strong>? Esta ação não pode ser desfeita.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await this.deleteItems([id]);
      }
    },

    async deletePlayers(items) {
      const result = await Swal.fire({
        title: 'Tem certeza?',
        html: `Você tem certeza que deseja deletar <strong>${items.length} jogador(es)</strong>? Esta ação não pode ser desfeita.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sim, deletar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        await this.deleteItems(items);
      }
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
    // Helper para normalizar array de times
    normalizeTeams(teams) {
      if (!teams) return [];
      return Array.isArray(teams) ? teams : [teams].filter(Boolean);
    },
  },
});
</script>

<style scoped>
.player-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
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
  background: #FF4E1B !important;
  color: white !important;
  border: 2px solid white !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

.player-avatar :deep(.va-avatar) {
  border: 2px solid white !important;
  background: #FF4E1B !important;
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
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.player-name {
  font-weight: 600;
  color: #0b1e3a;
  font-size: 13px;
  line-height: 1.3;
}

.player-info-meta {
  min-width: 0;
}

.player-meta-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
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
  align-items: center;
}

.teams-count-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border: 1px solid rgba(255, 78, 27, 0.35);
  border-radius: 999px;
  background: rgba(255, 78, 27, 0.08);
  color: #4a5568;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.teams-count-chip:hover {
  background: rgba(255, 78, 27, 0.14);
  border-color: rgba(255, 78, 27, 0.55);
}

.teams-count-chip:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.teams-count-chip-text {
  white-space: nowrap;
}

:deep(.player-teams-list-modal .va-modal__title) {
  font-size: 1.05rem;
  font-weight: 600;
}

.player-teams-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: min(60vh, 360px);
  overflow-y: auto;
  padding: 4px 0 8px;
}

.player-teams-list-item {
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.player-teams-list-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.player-teams-list-name {
  font-weight: 600;
  font-size: 14px;
  color: #1a202c;
}

.player-teams-list-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #718096;
}

.player-teams-list-sep {
  margin: 0 4px;
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
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background-color: #f0f0f0;
  color: #4a5568;
  line-height: 1.3;
  white-space: nowrap;
}

.role-tag-icon {
  flex-shrink: 0;
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
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.filter-row {
  width: 100%;
}

.filter-row--search .search-section {
  width: 100%;
  max-width: 100%;
}

.filter-row--filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 16px 20px;
  justify-content: space-between;
}

.search-section {
  width: 100%;
}

.filters-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1;
  min-width: 0;
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
  flex-shrink: 0;
}

/* Selects dos filtros: itens selecionados e foco em laranja */
.filter-row--filters :deep(.va-select) {
  --va-primary: #ff4e1b;
}

.filter-row--filters :deep(.va-input-wrapper) {
  --va-primary: #ff4e1b;
}

.filter-row--filters :deep(.va-input-wrapper--focused) {
  --va-input-color-border: #ff4e1b;
}

.filter-row--filters :deep(.va-tag) {
  --va-tag-color: #ff4e1b;
  background: rgba(255, 78, 27, 0.12) !important;
  color: #c2410c !important;
  border: 1px solid rgba(255, 78, 27, 0.35) !important;
}

.filter-row--filters :deep(.va-tag__close) {
  color: #c2410c !important;
}

.filter-row--filters :deep(.va-select-content__input) {
  color: #9a3412;
}

.filter-row--filters :deep(.va-select-dropdown__option--selected) {
  color: #ff4e1b;
  font-weight: 600;
}

.search-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #6b7280 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(75, 85, 99, 0.25);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.search-button.search-button--active {
  background-color: #ff4e1b !important;
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.3);
}

.search-button:hover {
  background-color: #4b5563 !important;
  box-shadow: 0 4px 10px rgba(75, 85, 99, 0.35);
  transform: translateY(-1px);
}

.search-button.search-button--active:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(255, 78, 27, 0.4);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(75, 85, 99, 0.3);
}

.search-button.search-button--active:active {
  box-shadow: 0 2px 6px rgba(255, 78, 27, 0.3);
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

.actions-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .filter-row--filters {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-actions {
    width: 100%;
  }

  .filter-actions .search-button {
    width: 100%;
    justify-content: center;
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
  background: #FF4E1B !important;
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
