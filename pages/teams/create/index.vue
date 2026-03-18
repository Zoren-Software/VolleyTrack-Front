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
        teamCategory: [],
        teamLevel: [],
        playerId: [],
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
              name: form.name ?? "",
              playerId: (form.users || []).map((item) => item.id).filter(Boolean),
              teamCategoryId: form.teamCategory?.value ?? null,
              teamLevelId: form.teamLevel?.value ?? null,
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
                error?.graphQLErrors?.[0]?.extensions?.validation
              ) {
                const v = error.graphQLErrors[0].extensions.validation;
                const keyMap = { teamCategoryId: "teamCategory", team_level_id: "teamCategory", teamLevelId: "teamLevel", team_category_id: "teamLevel" };
                // Mapear chaves da API (camel ou snake) para as esperadas pelo formulário
                this.errors = {
                  name: v.name || [],
                  teamCategory: v.teamCategoryId || v.team_category_id || v.teamCategory || [],
                  teamLevel: v.teamLevelId || v.team_level_id || v.teamLevel || [],
                  playerId: v.playerId || v.player_id || [],
                };
                this.errorFields = [...new Set(Object.keys(v).map((k) => keyMap[k] || k))];
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
