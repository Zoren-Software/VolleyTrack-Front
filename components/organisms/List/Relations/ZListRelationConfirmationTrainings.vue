<template>
  <ZListRelationGeneric @add="add" disableRelation>
    <template #filter>
      <slot name="head" />
      <slot name="filter" />
    </template>
    <template #list>
      <va-card class="players-list-card">
        <div class="players-list-card__header">
          <div class="players-list-card__title-row">
            <va-icon name="people" size="24px" color="#FF4E1B" />
            <h3 class="players-list-card__title">Lista de Jogadores</h3>
          </div>
        </div>
        <div class="players-list-card__body">
          <div class="players-list-wrapper">
            <ZDatatableGeneric
          :includeActionsColumn="true"
          includeActionDeleteList
          disableActionDelete
          :items="items"
          :columns="columns"
          :loading="loading"
          :paginatorInfo="paginatorInfo"
          @delete="actionDelete"
        >
          <!-- FILTER -->

          <!-- CELL: jogador — avatar + nome + posições · + time / Avulso -->
          <template #cell(user)="{ rowKey }">
            <div class="player-cell">
              <va-avatar class="player-avatar" size="medium">
                {{
                  playerInitial(rowKey.player)
                }}
              </va-avatar>
              <div class="player-cell__info">
                <div class="player-cell__name">
                  {{
                    rowKey.player?.displayName ||
                    rowKey.player?.name ||
                    "—"
                  }}
                </div>
                <div class="player-cell__meta">
                  {{ formatPositions(rowKey.player) }}
                </div>
                <div class="player-cell__meta">
                  {{ playerTeamLabel(rowKey) }}
                </div>
              </div>
            </div>
          </template>

          <template
            #cell(presence)="{
              rowKey: { id, player, presence, trainingId },
            }"
          >
            <div class="presence-cell">
              <template
                v-if="
                  isEditingRow(id) &&
                  hasAdminOrTechnicianRole()
                "
              >
                <div
                  class="edit-actions-inline"
                  role="group"
                  :aria-label="
                    'Presença: ' +
                    (player?.displayName || player?.name || '')
                  "
                >
                  <button
                    type="button"
                    class="choice-btn choice-btn--present"
                    @click="
                      onConfirmPresence(id, player.id, trainingId, true)
                    "
                  >
                    <va-icon name="how_to_reg" size="16px" />
                    <span>Presente</span>
                  </button>
                  <button
                    type="button"
                    class="choice-btn choice-btn--absent"
                    @click="
                      onConfirmPresence(id, player.id, trainingId, false)
                    "
                  >
                    <va-icon name="person_off" size="16px" />
                    <span>Ausente</span>
                  </button>
                </div>
              </template>
              <template v-else-if="presence === true">
                <div
                  class="pill pill-presence pill-presence--present"
                >
                  <va-icon name="how_to_reg" size="16px" />
                  <span>Presente</span>
                </div>
              </template>
              <template v-else-if="presence === false">
                <div
                  class="pill pill-presence pill-presence--absent"
                >
                  <va-icon name="person_off" size="16px" />
                  <span>Ausente</span>
                </div>
              </template>
              <template v-else-if="hasAdminOrTechnicianRole()">
                <span class="presence-placeholder presence-placeholder--dash"
                  >—</span
                >
              </template>
              <template v-else>
                <div class="presence-placeholder">
                  Aguardando o técnico marcar a presença.
                </div>
              </template>
            </div>
          </template>

          <template
            #cell(presenceIntention)="{
              rowKey: { id, player, status, trainingId },
            }"
          >
            <div class="intention-cell">
              <template v-if="isEditingRow(id) && canEditIntention(player)">
                <div
                  class="edit-actions-inline"
                  role="group"
                  :aria-label="
                    'Intenção: ' +
                    (player?.displayName || player?.name || '')
                  "
                >
                  <button
                    type="button"
                    class="choice-btn choice-btn--confirm"
                    @click="onConfirmIntention(id, player.id, trainingId)"
                  >
                    <va-icon name="check_circle" size="16px" />
                    <span>Confirmar</span>
                  </button>
                  <button
                    type="button"
                    class="choice-btn choice-btn--reject"
                    @click="onRejectIntention(id, player.id, trainingId)"
                  >
                    <va-icon name="cancel" size="16px" />
                    <span>Rejeitar</span>
                  </button>
                </div>
              </template>
              <template v-else>
                <div
                  v-if="normalizeIntentionStatus(status) === 'CONFIRMED'"
                  class="pill pill-intention pill-intention--confirmed"
                >
                  <va-icon name="check_circle" size="16px" />
                  <span>Confirmado</span>
                </div>
                <div
                  v-else-if="
                    normalizeIntentionStatus(status) === 'REJECTED'
                  "
                  class="pill pill-intention pill-intention--rejected"
                >
                  <va-icon name="cancel" size="16px" />
                  <span>Rejeitado</span>
                </div>
                <div
                  v-else
                  class="pill pill-intention pill-intention--pending"
                >
                  <va-icon name="schedule" size="16px" />
                  <span>Pendente</span>
                </div>
              </template>
            </div>
          </template>

          <template #cell(actions)="{ rowKey }">
            <div class="row-actions">
              <template v-if="editingRowId === rowKey.id">
                <button
                  type="button"
                  class="icon-cancel-btn"
                  title="Cancelar edição"
                  aria-label="Cancelar edição"
                  @click="cancelEdit"
                >
                  <va-icon name="close" size="20px" />
                </button>
              </template>
              <template v-else-if="canShowEditar(rowKey)">
                <button
                  type="button"
                  class="icon-edit-btn"
                  title="Editar"
                  aria-label="Editar linha"
                  @click="startEdit(rowKey.id)"
                >
                  <va-icon name="edit" size="20px" />
                </button>
              </template>
              <span v-else class="row-actions__none">—</span>
            </div>
          </template>
        </ZDatatableGeneric>
          </div>
        </div>
      </va-card>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ME from "~/graphql/user/query/me.graphql";
import { resolveListRelationDeleteId } from "~/utils/resolveListRelationDeleteId";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
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
      editingRowId: null,
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
    isEditingRow(id) {
      return this.editingRowId === id;
    },
    startEdit(id) {
      this.editingRowId = id;
    },
    cancelEdit() {
      this.editingRowId = null;
    },
    playerInitial(player) {
      const raw = player?.displayName || player?.name || "";
      const ch = raw.trim().charAt(0);
      return ch ? ch.toUpperCase() : "";
    },
    canEditIntention(player) {
      return (
        this.hasAdminOrTechnicianRole() ||
        this.canInteractWithStatus(player)
      );
    },
    canShowEditar(rowKey) {
      if (!rowKey) return false;
      if (this.hasAdminOrTechnicianRole()) return true;
      return (
        this.canInteractWithStatus(rowKey.player) &&
        this.normalizeIntentionStatus(rowKey.status) === "PENDING"
      );
    },
    onConfirmIntention(id, playerId, trainingId) {
      this.actionConfirm(id, playerId, trainingId);
      this.editingRowId = null;
    },
    onRejectIntention(id, playerId, trainingId) {
      this.actionReject(id, playerId, trainingId);
      this.editingRowId = null;
    },
    onConfirmPresence(id, playerId, trainingId, presence) {
      this.actionConfirmPresence(id, playerId, trainingId, presence);
      this.editingRowId = null;
    },
    add() {
      this.$emit("add");
    },
    actionDelete(payload) {
      const id = resolveListRelationDeleteId(payload);
      if (id === null) {
        return;
      }
      this.$emit("delete", id);
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
    normalizeIntentionStatus(status) {
      const s = String(status ?? "PENDING").toUpperCase();
      if (s === "CONFIRMED") return "CONFIRMED";
      if (s === "REJECTED") return "REJECTED";
      return "PENDING";
    },
    formatPositions(player) {
      const positions = player?.positions;
      if (!Array.isArray(positions) || positions.length === 0) {
        return "—";
      }
      const names = positions.map((p) => p?.name).filter(Boolean);
      return names.length ? names.join(" · ") : "—";
    },
    playerTeamLabel(row) {
      const player = row?.player;
      const teamId = row?.teamId;
      if (teamId == null || teamId === "") {
        return "Avulso";
      }
      const teams = player?.teams;
      if (Array.isArray(teams)) {
        const match = teams.find((t) => String(t.id) === String(teamId));
        if (match?.name) return match.name;
      }
      return "Avulso";
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
        label: "INTENÇÃO",
        sortable: true,
        width: 260,
      };

      baseColumns.push(intentionColumn);

      baseColumns.push({
        key: "presence",
        name: "presence",
        label: "PRESENÇA REAL",
        sortable: true,
        width: 260,
      });

      return baseColumns;
    },
  },
};
</script>

<style scoped>
.players-list-card {
  margin-top: 28px;
  border-radius: 14px;
  border: 1px solid #eef0f3 !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.players-list-card :deep(.va-card__inner) {
  padding: 0;
}

.players-list-card__header {
  padding: 16px 18px 12px;
  border-bottom: 1px solid #eef0f3;
}

.players-list-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.players-list-card__title-row :deep(.va-icon) {
  flex-shrink: 0;
}

.players-list-card__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.25;
}

.players-list-card__body {
  padding: 0 4px 14px;
}

.players-list-wrapper {
  margin-top: 0;
  padding: 0 12px;
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.players-list-wrapper :deep(.va-data-table) {
  width: 100%;
  min-width: 0;
}

:deep(.va-data-table__table) {
  table-layout: auto;
  width: 100%;
  min-width: 0;
}

:deep(.va-data-table__table tbody tr) {
  height: auto;
  min-height: 60px;
}

:deep(.va-data-table__table tbody td) {
  vertical-align: middle;
  padding-top: 12px;
  padding-bottom: 12px;
}

/* Sem seleção: 1=jogador; 2=intenção; 3=presença; 4=ações */
:deep(.va-data-table__table td:nth-child(1)),
:deep(.va-data-table__table th:nth-child(1)) {
  width: auto;
  min-width: 220px;
  max-width: 380px;
}

:deep(.va-data-table__table td:nth-child(2)),
:deep(.va-data-table__table th:nth-child(2)),
:deep(.va-data-table__table td:nth-child(3)),
:deep(.va-data-table__table th:nth-child(3)) {
  min-width: 200px;
  max-width: 320px;
}

:deep(.va-data-table__table td:nth-child(4)),
:deep(.va-data-table__table th:nth-child(4)) {
  width: 100px;
  min-width: 96px;
  max-width: 120px;
  text-align: center;
}

/* Jogador — alinhado à listagem /players */
.player-cell {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  text-align: left;
}

.player-cell__info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.player-cell__name {
  font-size: 13px;
  font-weight: 600;
  color: #0b1e3a;
  line-height: 1.3;
}

.player-cell__meta {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  line-height: 1.35;
}

.player-avatar {
  flex-shrink: 0;
}

.player-avatar,
.player-avatar :deep(.va-avatar),
.player-avatar :deep(.va-avatar__content) {
  width: 44px !important;
  height: 44px !important;
  min-width: 44px !important;
  min-height: 44px !important;
  max-width: 44px !important;
  max-height: 44px !important;
  font-size: 18px !important;
  line-height: 44px !important;
  background: #ff4e1b !important;
  color: #fff !important;
  border: 2px solid #fff !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.edit-actions-inline {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.choice-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.choice-btn :deep(.va-icon) {
  flex-shrink: 0;
}

.choice-btn--confirm {
  color: #15803d;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.choice-btn--confirm :deep(.va-icon) {
  color: #15803d !important;
}

.choice-btn--confirm:hover {
  background: #dcfce7;
}

.choice-btn--reject {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fef2f2;
}

.choice-btn--reject :deep(.va-icon) {
  color: #b91c1c !important;
}

.choice-btn--reject:hover {
  background: #fee2e2;
}

.choice-btn--present {
  color: #15803d;
  border-color: #bbf7d0;
  background: #f0fdf4;
}

.choice-btn--present :deep(.va-icon) {
  color: #15803d !important;
}

.choice-btn--present:hover {
  background: #dcfce7;
}

.choice-btn--absent {
  color: #be123c;
  border-color: #fecdd3;
  background: #fff1f2;
}

.choice-btn--absent :deep(.va-icon) {
  color: #be123c !important;
}

.choice-btn--absent:hover {
  background: #ffe4e6;
}

.icon-edit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  color: #94a3b8;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.icon-edit-btn:hover {
  background: #f3f4f6;
  color: #64748b;
}

.icon-edit-btn :deep(.va-icon) {
  color: #94a3b8 !important;
}

.icon-edit-btn:hover :deep(.va-icon) {
  color: #64748b !important;
}

.icon-cancel-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  border: none;
  border-radius: 10px;
  background: transparent;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.icon-cancel-btn :deep(.va-icon) {
  color: #94a3b8 !important;
}

.icon-cancel-btn:hover {
  background: #fef2f2;
}

.icon-cancel-btn:hover :deep(.va-icon) {
  color: #b91c1c !important;
}

/* Pills (intenção e presença) */
.pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
  width: fit-content;
  max-width: 100%;
}

.pill :deep(.va-icon) {
  flex-shrink: 0;
}

.pill-intention--confirmed {
  background: #dcfce7;
  color: #15803d;
}

.pill-intention--confirmed :deep(.va-icon) {
  color: #15803d !important;
}

.pill-intention--pending {
  background: #fef3c7;
  color: #b45309;
}

.pill-intention--pending :deep(.va-icon) {
  color: #d97706 !important;
}

.pill-intention--rejected {
  background: #fee2e2;
  color: #b91c1c;
}

.pill-intention--rejected :deep(.va-icon) {
  color: #b91c1c !important;
}

.pill-presence--present {
  background: #dcfce7;
  color: #15803d;
}

.pill-presence--present :deep(.va-icon) {
  color: #15803d !important;
}

.pill-presence--absent {
  background: #ffe4e6;
  color: #be123c;
}

.pill-presence--absent :deep(.va-icon) {
  color: #be123c !important;
}

.intention-cell,
.presence-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  min-height: 44px;
  width: 100%;
  min-width: 0;
}

.presence-placeholder {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  line-height: 1.4;
  max-width: 220px;
}

.presence-placeholder--dash {
  color: #9ca3af;
  font-weight: 700;
}

.row-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.row-actions__none {
  color: #d1d5db;
  font-weight: 700;
}

@media (max-width: 1024px) {
  .players-list-wrapper :deep(.va-data-table) {
    min-width: 640px;
  }
}

@media (max-width: 768px) {
  .players-list-card__title {
    font-size: 16px;
  }

  .players-list-wrapper :deep(.va-data-table) {
    min-width: 520px;
  }
}
</style>
