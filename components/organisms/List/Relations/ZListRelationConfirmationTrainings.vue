<template>
  <ZListRelationGeneric @add="add" disableRelation>
    <template #filter>
      <slot name="head" />
      <slot name="filter" />
    </template>
    <template #list>
      <div class="players-list-wrapper">
        <h3 class="players-list-title">Jogadores Relacionados</h3>
        <ZDatatableGeneric
          selectable
          :includeActionsColumn="false"
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
            <ZUser :data="player" :showPosition="true" />
          </template>
          <template
            #cell(presence)="{
              rowKey: { id, player, presence, trainingId, status },
            }"
          >
            <div class="presence-cell">
              <!-- Mostra ícone de status atual -->
              <div
                v-if="presence === null || presence === undefined"
                class="presence-status"
              >
                <VaIcon color="secondary" name="pending" :size="20" />
                <span class="presence-text">Não marcado</span>
              </div>
              <div v-else-if="presence" class="presence-status">
                <VaIcon color="success" name="check" :size="20" />
                <span class="presence-text">Presente</span>
              </div>
              <div v-else class="presence-status">
                <VaIcon color="danger" name="close" :size="20" />
                <span class="presence-text">Ausente</span>
              </div>

              <!-- Botões para técnico marcar presença real -->
              <div v-if="hasAdminOrTechnicianRole()" class="presence-buttons">
                <ZButton
                  v-if="presence !== true"
                  color="success"
                  size="small"
                  class="presence-button"
                  @click="
                    actionConfirmPresence(id, player.id, trainingId, true)
                  "
                >
                  <VaIcon name="check" :size="14" />
                  Marcar como Presente
                </ZButton>
                <ZButton
                  v-if="presence !== false"
                  color="danger"
                  size="small"
                  class="presence-button"
                  @click="
                    actionConfirmPresence(id, player.id, trainingId, false)
                  "
                >
                  <VaIcon name="close" :size="14" />
                  Marcar como Ausente
                </ZButton>
              </div>
            </div>
          </template>
          <template
            #cell(presenceIntention)="{
              rowKey: { id, player, status, trainingId },
            }"
          >
            <div class="presence-intention-cell">
              <!-- Status Badge -->
              <div class="status-badge-wrapper">
                <ZButton
                  :color="defineColorStatus(status)"
                  size="small"
                  :disabled="true"
                  class="status-badge"
                >
                  <VaIcon
                    v-if="status == 'REJECTED'"
                    name="close"
                    :size="16"
                    class="status-icon"
                  />
                  <VaIcon
                    v-if="status == 'CONFIRMED'"
                    name="checked"
                    :size="16"
                    class="status-icon"
                  />
                  <VaIcon
                    v-if="status == 'PENDING'"
                    name="pending"
                    :size="16"
                    class="status-icon"
                  />
                  {{ transformText(status) }}
                </ZButton>
              </div>

              <!-- Action Buttons - Only show if user can interact -->
              <div
                v-if="canInteractWithStatus(player)"
                class="intention-buttons"
              >
                <ZButton
                  color="success"
                  size="small"
                  class="intention-button"
                  @click="actionConfirm(id, player.id, trainingId)"
                >
                  <VaIcon name="check" :size="14" />
                  Confirmar
                </ZButton>
                <ZButton
                  color="danger"
                  size="small"
                  class="intention-button"
                  @click="actionReject(id, player.id, trainingId)"
                >
                  <VaIcon name="close" :size="14" />
                  Rejeitar
                </ZButton>
              </div>
            </div>
          </template>
        </ZDatatableGeneric>
      </div>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import ZButton from "~/components/atoms/Buttons/ZButton";
import ME from "~/graphql/user/query/me.graphql";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
    ZUser,
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
    trainingDate: {
      type: Date,
      default: "",
    },
  },
  mounted() {
    this.getUser();
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
      user: {},
    };
  },
  methods: {
    add() {
      this.$emit("add");
    },
    actionDelete(item) {
      this.$emit("delete", item);
    },
    actionConfirm(id, playerId, trainingId) {
      this.$emit("actionConfirm", id, playerId, trainingId);
    },
    actionReject(id, playerId, trainingId) {
      this.$emit("actionReject", id, playerId, trainingId);
    },
    actionConfirmPresence(id, playerId, trainingId, presence) {
      this.$emit("actionConfirmPresence", id, playerId, trainingId, presence);
    },
    async getUser() {
      if (localStorage.getItem("user")) {
        this.user = await JSON.parse(localStorage.getItem("user"));
      } else {
        const query = gql`
          ${ME}
        `;
        const {
          data: { value },
        } = await useAsyncQuery(query, {});

        if (value?.me) {
          this.user = value.me;
          localStorage.setItem("user", JSON.stringify(this.user));
        }
      }
    },
    hasAdminOrTechnicianRole() {
      return (
        this.user &&
        this.user.roles &&
        this.user.roles.some(
          (role) => role.name === "Técnico" || role.name === "Administrador"
        )
      );
    },
    hasPlayerRole() {
      return (
        this.user &&
        this.user.roles &&
        this.user.roles.some((role) => role.name === "Jogador")
      );
    },
    transformText(text) {
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    },
    defineColorStatus(status) {
      switch (status) {
        case "PENDING":
          return "secondary";
        case "REJECTED":
          return "danger";
        case "CONFIRMED":
          return "success";
        default:
          return "primary";
      }
    },
    canInteractWithStatus(player) {
      if (!player || !this.user) return false;

      // Técnico/Admin pode confirmar/rejeitar a qualquer momento
      if (this.hasAdminOrTechnicianRole()) {
        return true;
      }

      // Jogador só pode confirmar/rejeitar antes do treino (intenção)
      if (
        this.isBeforeTrainingDate &&
        this.user.id === player.id &&
        this.hasPlayerRole()
      ) {
        return true;
      }

      return false;
    },
  },
  computed: {
    isBeforeTrainingDate() {
      if (!this.trainingDate) return true;
      return new Date(this.trainingDate) > new Date();
    },
    columns() {
      const baseColumns = [
        {
          key: "user",
          name: "user",
          label: "Jogador",
          sortable: true,
        },
      ];

      // Coluna de Intenção de Presença (sempre visível)
      const intentionColumn = {
        key: "presenceIntention",
        name: "presenceIntention",
        label: "Intenção de Presença",
        sortable: true,
        width: 200,
      };

      baseColumns.push(intentionColumn);

      // Coluna de Presença Real (sempre visível para técnico marcar)
      baseColumns.push({
        key: "presence",
        name: "presence",
        label: "Presença Real",
        sortable: true,
        width: 200,
      });

      return baseColumns;
    },
  },
};
</script>

<style scoped>
.players-list-wrapper {
  margin-top: 24px;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.players-list-wrapper :deep(.va-data-table) {
  width: 100%;
  min-width: 0;
}

/* Garantir que a tabela seja responsiva */
:deep(.va-data-table__table) {
  table-layout: auto;
  width: 100%;
  min-width: 0;
}

.players-list-title {
  font-size: 16px;
  font-weight: 700;
  color: #e9742b;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Estilos para células da tabela já definidos acima */

:deep(.va-data-table__table tbody tr) {
  height: auto;
  min-height: 60px;
}

:deep(.va-data-table__table tbody td) {
  vertical-align: top;
  padding-top: 12px;
  padding-bottom: 12px;
}

/* Coluna de Jogador */
:deep(.va-data-table__table td:nth-child(1)),
:deep(.va-data-table__table th:nth-child(1)) {
  width: auto;
  min-width: 200px;
  max-width: 400px;
}

:deep(.va-data-table__table td:nth-child(1)) {
  padding: 12px 8px;
  vertical-align: top;
}

/* Colunas de Ação - Responsivas */
:deep(.va-data-table__table td:nth-child(2)),
:deep(.va-data-table__table th:nth-child(2)),
:deep(.va-data-table__table td:nth-child(3)),
:deep(.va-data-table__table th:nth-child(3)) {
  width: auto;
  min-width: 160px;
  max-width: 200px;
}

.presence-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  width: 100%;
  min-width: 0;
}

.presence-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.presence-text {
  font-size: 12px;
  color: #0b1e3a;
  font-weight: 500;
  white-space: nowrap;
}

.presence-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: center;
  min-width: 0;
}

.presence-button {
  font-size: 11px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: fit-content;
  max-width: 100%;
}

.presence-pending {
  color: #9ca3af;
  font-size: 14px;
}

.presence-intention-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
}

.status-badge-wrapper {
  width: 100%;
  min-width: 0;
}

.status-badge {
  font-size: 11px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  gap: 4px;
  width: 100%;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-icon {
  flex-shrink: 0;
}

.intention-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  width: 100%;
  min-width: 0;
}

.intention-button {
  font-size: 11px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1 1 auto;
  min-width: 70px;
  max-width: 100%;
  border-radius: 6px;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 1;
  justify-content: center;
}

.actions-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-button {
  font-size: 12px;
  padding: 4px 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Estilos para o componente ZUser dentro da célula */
:deep(.va-data-table__table td:nth-child(1) .user-cell) {
  max-width: 100%;
  min-width: 0;
}

/* Responsividade para tablets */
@media (max-width: 1024px) {
  .players-list-wrapper :deep(.va-data-table) {
    min-width: 600px;
  }

  :deep(.va-data-table__table td:nth-child(1)),
  :deep(.va-data-table__table th:nth-child(1)) {
    max-width: 350px;
    min-width: 200px;
  }

  :deep(.va-data-table__table td:nth-child(2)),
  :deep(.va-data-table__table th:nth-child(2)),
  :deep(.va-data-table__table td:nth-child(3)),
  :deep(.va-data-table__table th:nth-child(3)) {
    min-width: 140px;
    max-width: 180px;
  }

  .presence-button,
  .intention-button {
    font-size: 10px;
    padding: 4px 6px;
    min-width: 70px;
  }
}

/* Responsividade para tablets pequenos */
@media (max-width: 900px) {
  .players-list-wrapper :deep(.va-data-table) {
    min-width: 500px;
  }

  :deep(.va-data-table__table td:nth-child(1)),
  :deep(.va-data-table__table th:nth-child(1)) {
    max-width: 300px;
    min-width: 180px;
  }

  :deep(.va-data-table__table td:nth-child(2)),
  :deep(.va-data-table__table th:nth-child(2)),
  :deep(.va-data-table__table td:nth-child(3)),
  :deep(.va-data-table__table th:nth-child(3)) {
    min-width: 120px;
    max-width: 160px;
  }
}

/* Responsividade para mobile */
@media (max-width: 768px) {
  .players-list-title {
    font-size: 14px;
  }

  /* Em mobile, fazer as colunas empilharem */
  :deep(.va-data-table__table) {
    display: block;
  }

  :deep(.va-data-table__table thead) {
    display: none;
  }

  :deep(.va-data-table__table tbody) {
    display: block;
  }

  :deep(.va-data-table__table tr) {
    display: block;
    margin-bottom: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px;
    background: white;
  }

  :deep(.va-data-table__table td) {
    display: block;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    border: none;
    padding: 8px 0;
    text-align: left;
  }

  :deep(.va-data-table__table td:before) {
    content: attr(data-label);
    font-weight: 700;
    display: block;
    margin-bottom: 4px;
    color: #4a5568;
    font-size: 12px;
    text-transform: uppercase;
  }

  .intention-buttons {
    flex-direction: column;
    width: 100%;
  }

  .intention-button {
    width: 100%;
    min-width: 0;
  }

  .presence-buttons {
    flex-direction: column;
    width: 100%;
  }

  .presence-button {
    width: 100%;
    min-width: 0;
  }

  .actions-cell {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    width: 100%;
  }
}
</style>
