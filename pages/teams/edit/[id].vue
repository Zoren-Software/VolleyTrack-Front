<template>
  <ZTeamForm
    :data="data"
    @save="edit"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZTeamForm from "~/components/organisms/Forms/Team/ZTeamForm";
import TEAM from "~/graphql/team/query/team.graphql";
import TEAMEDIT from "~/graphql/team/mutation/teamEdit.graphql";
import { transformTeamData } from "~/utils/forms/teamForm";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZTeamForm,
  },
  mounted() {
    this.getTeam();
  },
  data() {
    return {
      data: {},
      variablesGetPlayer: {
        id: this.$route.params.id,
      },
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
        teamCategoryId: [],
        teamLevelId: [],
        users: [],
      };
    },
    getTeam() {
      this.loading = true;

      const query = gql`
        ${TEAM}
      `;

      const consult = {
        ...this.variablesGetPlayer,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult);

      onResult((result) => {
        if (result?.data?.team) {
          this.data = transformTeamData(result.data.team);
        }
      });

      if (value) {
        if (value?.team) {
          this.data = transformTeamData(value.team);
        }
      }
      this.loading = false;
    },

    async edit(form) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${TEAMEDIT}
        `;

        const variables = {
          id: form.id,
          name: form.name,
          playerId: form.users.map((item) => item.id),
          teamCategoryId: form.teamCategory.value,
          teamLevelId: form.teamLevel.value,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Time salvo com sucesso!", () => {
          this.errors = this.errorsDefault();

          this.$router.push("/teams");
        });
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

          // criar um título para essas validacões que seram mostradas
          const footer = errorMessages.join("<br>");

          confirmError("Ocorreu um erro ao salvar o time!", footer);
        } else {
          confirmError("Ocorreu um erro ao salvar o time!");
        }
      }
      this.loading = false;
    },
  },
};
</script>

<script setup>
useHead({
  titleTemplate: "Editar Time",
});
</script>
