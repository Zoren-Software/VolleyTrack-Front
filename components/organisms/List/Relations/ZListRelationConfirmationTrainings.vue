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
          includeActionsColumn
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
            <ZUser :data="player" show-email />
          </template>
          <template
            #cell(actions)="{ rowKey: { id, player, presence, trainingId } }"
          >
            <div class="actions-cell">
            <ZButton
              v-if="
                  !isBeforeTrainingDate &&
                  hasAdminOrTechnicianRole() &&
                  !presence
              "
              color="success"
                size="small"
                class="action-button"
              @click="
                actionConfirmPresence(id, player.id, trainingId, !presence)
              "
            >
              Compareceu
            </ZButton>
            <ZButton
              v-if="
                  !isBeforeTrainingDate &&
                  hasAdminOrTechnicianRole() &&
                  presence
              "
              color="danger"
                size="small"
                class="action-button"
              @click="
                actionConfirmPresence(id, player.id, trainingId, !presence)
              "
            >
              Não Compareceu
            </ZButton>
            </div>
          </template>
          <template
            #cell(positions)="{
              rowKey: {
                player: { positions },
              },
            }"
          >
            <ZPosition :data="positions" />
          </template>
          <template #cell(presence)="{ rowKey: { presence } }">
            <div class="presence-cell">
              <VaIcon v-if="!presence" color="danger" name="close" :size="32" />
            <VaIcon
                v-if="presence"
              color="success"
              name="checked"
                :size="32"
            />
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
              Confirmar
            </ZButton>
            <ZButton
              color="danger"
                  size="small"
                  class="intention-button"
              @click="actionReject(id, player.id, trainingId)"
            >
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
import ZPosition from "~/components/molecules/Datatable/Slots/ZPosition";
import ZButton from "~/components/atoms/Buttons/ZButton";
import ME from "~/graphql/user/query/me.graphql";

export default {
  components: {
    ZListRelationGeneric,
    ZDatatableGeneric,
    ZUser,
    ZPosition,
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
          key: "id",
          name: "id",
          label: "ID",
          sortable: true,
          width: 80,
        },
        {
          key: "user",
          name: "user",
          label: "Jogador",
          sortable: true,
        },
        {
          key: "positions",
          name: "positions",
          label: "Posições",
          sortable: true,
          width: 150,
        },
      ];

      // Se o treino ainda vai acontecer, mostra "Intenção de Presença"
      // Se o treino já passou, mostra "Presença"
      const intentionColumn = {
        key: "presenceIntention",
        name: "presenceIntention",
        label: this.isBeforeTrainingDate ? "Intenção de Presença" : "Presença",
        sortable: true,
        width: 200,
      };

      baseColumns.push(intentionColumn);

      // Coluna de presença real só aparece se o treino já passou
      if (!this.isBeforeTrainingDate) {
        baseColumns.push({
          key: "presence",
          name: "presence",
          label: "Presença Real",
          sortable: true,
          width: 120,
        });
      }

      return baseColumns;
    },
  },
};
</script>

<style scoped>
.players-list-wrapper {
  margin-top: 24px;
}

.players-list-title {
  font-size: 16px;
  font-weight: 700;
  color: #e9742b;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.presence-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.presence-pending {
  color: #9ca3af;
  font-size: 14px;
}

.presence-intention-cell {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
}

.status-badge-wrapper {
  width: 100%;
}

.status-badge {
  font-size: 12px;
  padding: 6px 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  justify-content: center;
}

.status-icon {
  flex-shrink: 0;
}

.intention-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
}

.intention-button {
  font-size: 12px;
  padding: 6px 14px;
  flex: 1;
  min-width: 100px;
}

.actions-cell {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.action-button {
  font-size: 12px;
  padding: 4px 12px;
}

@media (max-width: 768px) {
  .players-list-title {
    font-size: 14px;
  }

  .intention-buttons {
    flex-direction: column;
    width: 100%;
  }

  .intention-button {
    width: 100%;
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
