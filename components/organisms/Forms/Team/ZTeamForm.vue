<template>
  <div class="form-container">
    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
      <!-- Informações Essenciais -->
      <va-card class="info-card">
        <h2 class="section-title">Informações Essenciais</h2>
        <ZTextInput
          id="name"
          v-model="form.name"
          name="name"
          label="Nome do Time"
          placeholder="Ex: Águias de Ouro"
          class="mb-3"
          :error-messages="errors.name || []"
        />
        <ZSelectTeamCategory
          v-model="form.teamCategory"
          name="teamCategoryId"
          label="Categoria"
          placeholder="Selecione a categoria"
          class="mb-3"
          :error-messages="errors.teamCategory || []"
        />
        <ZSelectTeamLevel
          v-model="form.teamLevel"
          name="teamLevelId"
          label="Nível"
          placeholder="Selecione o nível"
          class="mb-3"
          :error-messages="errors.teamLevel || []"
        />
      </va-card>

      <!-- Jogadores -->
      <va-card class="players-card">
        <h2 class="section-title">Jogadores</h2>
        <div class="players-input-container">
          <ZSelectUser
            v-model="users"
            :ignoreIds="form.users.map((item) => item.id)"
            class="mb-3"
            label="Buscar e selecionar jogadores"
            placeholder="Digite o nome do jogador"
          />
          <va-button
            class="custom-button"
            color="primary"
            icon="add"
            @click="addUsers"
          >
            Relacionar
          </va-button>
        </div>
        <ZListRelationUsers :items="form.users" @delete="actionDeleteUser" />
      </va-card>

      <!-- Botões -->
      <div class="action-buttons">
        <va-button color="secondary" @click="goBack" class="mr-1"
          >Voltar</va-button
        >
        <va-button color="primary" @click="save">Salvar</va-button>
      </div>
    </va-form>
  </div>
</template>

<script>
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZListRelationUsers from "~/components/organisms/List/Relations/ZListRelationUsers";
import ZSelectTeamCategory from "~/components/molecules/Selects/ZSelectTeamCategory";
import ZSelectTeamLevel from "~/components/molecules/Selects/ZSelectTeamLevel.vue";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

export default {
  props: {
    data: {
      type: Object,
      default: () => ({
        name: "",
        users: [],
      }),
    },
    loading: {
      type: Boolean,
      default: false,
    },
    errorFields: {
      type: Array,
      default: () => [],
    },
    errors: {
      type: Object,
      default: () => ({
        name: [],
        users: [],
      }),
    },
  },
  components: {
    ZTextInput,
    ZSelectUser,
    ZListRelationUsers,
    ZSelectTeamCategory,
    ZSelectTeamLevel,
  },

  data() {
    return {
      users: [],
      form: {
        ...this.data,
        teamCategory: this.data.teamCategory || null,
        teamLevel: this.data.teamLevel || null,
      },
    };
  },

  watch: {
    data(val) {
      this.form = {
        ...val,
        teamCategory: val.teamCategory || null,
        teamLevel: val.teamLevel || null,
      };
    },
  },

  methods: {
    addUsers() {
      const transformedUser = this.users.map((item) => ({
        id: item.value,
        user: item,
      }));

      transformedUser.forEach((newTeam) => {
        const isAlreadyAdded = this.form.users.some(
          (existingTeam) => existingTeam.id === newTeam.id
        );

        if (!isAlreadyAdded) {
          this.form.users.push(newTeam);
        }
      });

      this.users = [];
    },

    actionDeleteUser(id) {
      this.form.users = this.form.users.filter((user) => user.id !== id);
      confirmSuccess("Jogador removido com sucesso!");
    },

    async save() {
      console.log(this.form);
      this.$emit("save", this.form);
    },

    goBack() {
      this.$router.push("/teams");
    },
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.info-card,
.players-card {
  width: 100%;
  max-width: 600px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.players-input-container {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #0b1e3a;
  margin-bottom: 10px;
}

.save-button-container {
  text-align: center;
  margin-top: 20px;
}

/* Aplicar estilo ao placeholder de inputs e textareas */
input::placeholder,
textarea::placeholder {
  font-size: 13px; /* Diminuir o tamanho da fonte do placeholder */
}

.custom-button {
  padding: 0 1rem; /* Espaçamento apenas nas laterais */
  font-size: 14px; /* Ajuste do tamanho da fonte */
  border-radius: 8px; /* Bordas arredondadas */
}

.action-buttons {
  display: flex;
  justify-content: flex-end; /* Alinha os botões no lado direito */
  gap: 12px;
}

.action-buttons va-button {
  border-radius: 8px;
}
</style>
