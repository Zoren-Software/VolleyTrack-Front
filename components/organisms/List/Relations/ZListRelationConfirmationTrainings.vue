<template>
  <ZListRelationGeneric @add="add" disableRelation>
    <template #filter>
      <slot name="filter" />
    </template>
    <template #list>
      <va-list>
        <va-list-label> Jogadores Relacionados </va-list-label>
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
            #cell(actions)="{
              rowKey: { id, player, status, presence, trainingId },
            }"
          >
            <ZButton
              v-if="
                !isBeforeTrainingDate && hasAdminOrTechnicianRole() && !presence
              "
              color="danger"
              icon-right
              class="mr-2"
              @click="
                actionConfirmPresence(id, player.id, trainingId, !presence)
              "
            >
              Não compareceu
            </ZButton>
            <ZButton
              v-if="
                !isBeforeTrainingDate && hasAdminOrTechnicianRole() && presence
              "
              color="success"
              icon-right
              class="mr-2"
              @click="
                actionConfirmPresence(id, player.id, trainingId, !presence)
              "
            >
              Compareceu
            </ZButton>
            <VaIcon
              v-if="!presence && !isBeforeTrainingDate"
              class="mr-2"
              color="danger"
              name="close"
              :size="44"
            />
            <VaIcon
              v-if="presence && !isBeforeTrainingDate"
              class="mr-2"
              color="success"
              name="checked"
              :size="44"
            />
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
          <template
            #cell(presenceIntention)="{
              rowKey: { id, player, status, trainingId },
            }"
          >
            <ZButton
              v-if="
                (isBeforeTrainingDate && hasAdminOrTechnicianRole()) ||
                (isBeforeTrainingDate &&
                  user.id === player.id &&
                  hasPlayerRole())
              "
              color="success"
              icon-right
              class="mr-2"
              @click="actionConfirm(id, player.id, trainingId)"
            >
              Confirmar
            </ZButton>
            <ZButton
              v-else
              :color="defineColorStatus(status)"
              disabled
              icon-right
              class="mr-2"
              @click="actionConfirm(id, player.id, trainingId)"
            >
              {{ transformText(status) }}
            </ZButton>
            <ZButton
              v-if="
                (isBeforeTrainingDate && hasAdminOrTechnicianRole()) ||
                (isBeforeTrainingDate &&
                  user.id === player.id &&
                  hasPlayerRole())
              "
              color="danger"
              icon-right
              class="mr-2"
              @click="actionReject(id, player.id, trainingId)"
            >
              Rejeitar
            </ZButton>
            <VaIcon
              v-if="status == 'REJECTED'"
              class="mr-2"
              color="danger"
              name="close"
              :size="44"
            />
            <VaIcon
              v-if="status == 'CONFIRMED'"
              class="mr-2"
              color="success"
              name="checked"
              :size="44"
            />
            <VaIcon
              v-if="status == 'PENDING'"
              class="mr-2"
              color="secondary"
              name="pending"
              :size="44"
            />
          </template>
        </ZDatatableGeneric>
      </va-list>
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
      columns: [
        {
          key: "id",
          name: "id",
          label: "Id",
          sortable: true,
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
        },
        {
          key: "presenceIntention",
          name: "presenceIntention",
          label: "Intenção de Presença",
          sortable: true,
        },
      ],
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
    // preciso de uma função que faça o texto Uppercase ficar apenas com a primeira letra maiúscula
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
  },
  computed: {
    isBeforeTrainingDate() {
      return new Date(this.trainingDate) > new Date();
    },
  },
};
</script>
