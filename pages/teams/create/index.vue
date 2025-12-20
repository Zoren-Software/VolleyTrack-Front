<template>
  <div class="create-team-page">
    <div class="page-header">
      <h1 class="title">Cadastro de Time</h1>
      <p class="subtitle">Crie um novo time para sua equipe</p>
    </div>
    <ZTeamForm
      @save="create"
      :loading="loading"
      :errorFields="errorFields"
      :errors="errors"
    />
  </div>
</template>

<script>
import ZTeamForm from "~/components/organisms/Forms/Team/ZTeamForm";
import TEAMCREATE from "~/graphql/team/mutation/teamCreate.graphql";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";
import { handleMutation } from "~/utils/graphql/mutationHandler";
import moment from "moment";

export default {
  components: {
    ZTeamForm,
  },

  data() {
    return {
      loading: false,
      error: false,
      errorFields: [],
      errors: this.errorsDefault(),
    };
  },

  methods: {
    errorsDefault() {
      return {
        name: [],
        teamId: [],
      };
    },
    async create(form) {
      this.loading = true;
      this.error = false;

      try {
        await handleMutation(
          async () => {
            const query = gql`
              ${TEAMCREATE}
            `;

            const variables = {
              name: form.name,
              playerId: form.users.map((item) => item.id),
              teamCategoryId: form.teamCategory.value,
              teamLevelId: form.teamLevel.value,
            };

            const { mutate } = await useMutation(query, { variables });
            return await mutate();
          },
          {
            onSuccess: (data) => {
              confirmSuccess("Time salvo com sucesso!", () => {
                this.errors = this.errorsDefault();
                this.$router.push("/teams");
              });
            },
            onError: (error) => {
              this.error = true;

              if (
                error.graphQLErrors &&
                error.graphQLErrors[0]?.extensions?.validation
              ) {
                this.errors = error.graphQLErrors[0].extensions.validation;
                this.errorFields = Object.keys(this.errors);
              }
            },
            errorTitle: "Ocorreu um erro ao salvar o time!",
          }
        );
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Criar Time",
});
</script>

<style scoped>
.create-team-page {
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.title {
  font-size: 30px;
  font-weight: bold;
  color: #0b1e3a;
}

.subtitle {
  font-size: 16px;
  color: #6c757d;
}
</style>
