<template>
  <div class="team-players-root">
    <h2 class="section-title">Jogadores</h2>
    <div class="players-input-container">
      <div class="players-select-wrap">
        <ZSelectUser
          v-model="usersSync"
          :ignore-ids="form.users.map((item) => item.id)"
          :roles-ids="[3]"
          label="Selecionar jogadores"
          placeholder="Digite o nome do jogador"
        />
      </div>
      <va-button
        class="custom-button"
        :color="hasPlayersToRelate ? 'primary' : 'secondary'"
        :disabled="!hasPlayersToRelate"
        @click="$emit('add-users')"
      >
        Relacionar
      </va-button>
    </div>
    <ZListRelationUsers :items="form.users" @delete="$emit('delete-user', $event)" />
  </div>
</template>

<script>
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZListRelationUsers from "~/components/organisms/List/Relations/ZListRelationUsers";

export default {
  name: "ZTeamFormPlayersFields",
  components: { ZSelectUser, ZListRelationUsers },
  props: {
    form: {
      type: Object,
      required: true,
    },
    users: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["update:users", "add-users", "delete-user"],
  computed: {
    usersSync: {
      get() {
        return this.users;
      },
      set(v) {
        this.$emit("update:users", v);
      },
    },
    hasPlayersToRelate() {
      return Array.isArray(this.users) && this.users.length > 0;
    },
  },
};
</script>

<style scoped>
.team-players-root :deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  color: #6b7280 !important;
}

.team-players-root :deep(.va-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: #ff4e1b;
  border-radius: 2px;
}

.players-input-container {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: nowrap;
}

.players-select-wrap {
  flex: 1 1 0;
  min-width: 0;
}

@media (max-width: 640px) {
  .players-input-container {
    flex-wrap: wrap;
  }

  .players-select-wrap {
    flex: 1 1 100%;
  }

  .custom-button {
    width: 100%;
  }
}

.custom-button {
  padding: 0 1rem;
  font-size: 14px;
  border-radius: 8px;
}
</style>
