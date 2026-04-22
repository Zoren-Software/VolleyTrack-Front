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

          <!-- CELL: jogador — nome, posição, time -->
          <template #cell(user)="{ rowKey }">
            <div class="player-info-cell">
              <div class="player-info-name">
                {{ rowKey.player?.displayName || rowKey.player?.name || "—" }}
              </div>
              <div class="player-info-meta">
                <span class="player-meta-label">Posição</span>
                <span class="player-meta-value">{{
                  formatPositions(rowKey.player)
                }}</span>
              </div>
              <div class="player-info-meta">
                <span class="player-meta-label">Time</span>
                <span class="player-meta-value">{{
                  playerTeamLabel(rowKey)
                }}</span>
              </div>
            </div>
          </template>

          <template
            #cell(presence)="{
              rowKey: { id, player, presence, trainingId },
            }"
          >
            <div class="presence-cell">
              <template v-if="presence === true">
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
              <template
                v-else-if="hasAdminOrTechnicianRole() && !isEditingRow(id)"
              >
                <span class="presence-placeholder presence-placeholder--dash"
                  >—</span
                >
              </template>
              <div v-else-if="!hasAdminOrTechnicianRole()" class="presence-placeholder">
                Aguardando o técnico marcar a presença.
              </div>

              <div
                v-if="
                  isEditingRow(id) &&
                  hasAdminOrTechnicianRole()
                "
                class="squircle-actions"
                role="group"
                :aria-label="'Presença: ' + (player?.displayName || player?.name || '')"
              >
                <button
                  type="button"
                  class="squircle-btn squircle-btn--yes"
                  title="Marcar presente"
                  @click="
                    onConfirmPresence(id, player.id, trainingId, true)
                  "
                >
                  <va-icon name="check" size="20px" />
                </button>
                <button
                  type="button"
                  class="squircle-btn squircle-btn--no"
                  title="Marcar ausente"
                  @click="
                    onConfirmPresence(id, player.id, trainingId, false)
                  "
                >
                  <va-icon name="close" size="20px" />
                </button>
              </div>
            </div>
          </template>

          <template
            #cell(presenceIntention)="{
              rowKey: { id, player, status, trainingId },
            }"
          >
            <div class="intention-cell">
              <div
                v-if="normalizeIntentionStatus(status) === 'CONFIRMED'"
                class="pill pill-intention pill-intention--confirmed"
              >
                <va-icon name="check_circle" size="16px" />
                <span>Confirmado</span>
              </div>
              <div
                v-else-if="normalizeIntentionStatus(status) === 'REJECTED'"
                class="pill pill-intention pill-intention--rejected"
              >
                <va-icon name="cancel" size="16px" />
                <span>Rejeitado</span>
              </div>
              <div v-else class="pill pill-intention pill-intention--pending">
                <va-icon name="schedule" size="16px" />
                <span>Pendente</span>
              </div>

              <div
                v-if="
                  isEditingRow(id) &&
                  canInteractWithStatus(player) &&
                  normalizeIntentionStatus(status) === 'PENDING'
                "
                class="squircle-actions"
                role="group"
                :aria-label="'Intenção: ' + (player?.displayName || player?.name || '')"
              >
                <button
                  type="button"
                  class="squircle-btn squircle-btn--yes"
                  title="Confirmar presença"
                  @click="onConfirmIntention(id, player.id, trainingId)"
                >
                  <va-icon name="check" size="20px" />
                </button>
                <button
                  type="button"
                  class="squircle-btn squircle-btn--no"
                  title="Rejeitar"
                  @click="onRejectIntention(id, player.id, trainingId)"
                >
                  <va-icon name="close" size="20px" />
                </button>
              </div>
            </div>
          </template>

          <template #cell(actions)="{ rowKey }">
            <div class="row-actions">
              <template v-if="editingRowId === rowKey.id">
                <button
                  type="button"
                  class="link-action"
                  @click="cancelEdit"
                >
                  Cancelar
                </button>
              </template>
              <template v-else-if="canShowEditar(rowKey)">
                <button
                  type="button"
                  class="link-action link-action--edit"
                  @click="startEdit(rowKey.id)"
                >
                  Editar
                </button>
              </template>
              <span v-else class="row-actions__none">—</span>
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
      return names.length ? names.join(", ") : "—";
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
      return "—";
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

:deep(.va-data-table__table) {
  table-layout: auto;
  width: 100%;
  min-width: 0;
}

.players-list-title {
  font-size: 16px;
  font-weight: 700;
  color: #ff4e1b;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

/* Com selectable: 1=checkbox; 2=jogador; 3=intenção; 4=presença; 5=ações */
:deep(.va-data-table__table td:nth-child(2)),
:deep(.va-data-table__table th:nth-child(2)) {
  width: auto;
  min-width: 220px;
  max-width: 380px;
}

:deep(.va-data-table__table td:nth-child(3)),
:deep(.va-data-table__table th:nth-child(3)),
:deep(.va-data-table__table td:nth-child(4)),
:deep(.va-data-table__table th:nth-child(4)) {
  min-width: 200px;
  max-width: 320px;
}

:deep(.va-data-table__table td:nth-child(5)),
:deep(.va-data-table__table th:nth-child(5)) {
  width: 100px;
  min-width: 96px;
  max-width: 120px;
  text-align: center;
}

/* Jogador */
.player-info-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.player-info-name {
  font-size: 14px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.3;
}

.player-info-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
  line-height: 1.35;
}

.player-meta-label {
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.04em;
}

.player-meta-value {
  font-weight: 600;
  color: #374151;
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

.link-action {
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link-action--muted {
  color: #64748b;
}

.link-action--muted:hover {
  color: #0f172a;
}

.link-action--edit {
  color: #ff4e1b;
  font-weight: 800;
}

.link-action--edit:hover {
  color: #c53d16;
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

.squircle-actions {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.squircle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  padding: 0;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease;
}

.squircle-btn:active {
  transform: scale(0.96);
}

.squircle-btn :deep(.va-icon) {
  flex-shrink: 0;
}

.squircle-btn--yes {
  background: #ecfdf5;
  color: #15803d;
}

.squircle-btn--yes :deep(.va-icon) {
  color: #15803d !important;
}

.squircle-btn--yes:hover {
  filter: brightness(0.97);
}

.squircle-btn--no {
  background: #fff1f2;
  color: #be123c;
}

.squircle-btn--no :deep(.va-icon) {
  color: #be123c !important;
}

.squircle-btn--no:hover {
  filter: brightness(0.97);
}

@media (max-width: 1024px) {
  .players-list-wrapper :deep(.va-data-table) {
    min-width: 640px;
  }
}

@media (max-width: 768px) {
  .players-list-title {
    font-size: 14px;
  }

  .players-list-wrapper :deep(.va-data-table) {
    min-width: 520px;
  }
}
</style>
