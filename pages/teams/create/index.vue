<template>
  <ZTeamForm
    @save="create"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZTeamForm from "~/components/organisms/Forms/Team/ZTeamForm";
import TEAMCREATE from "~/graphql/team/mutation/teamCreate.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
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
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${TEAMCREATE}
        `;

        const variables = {
          name: form.name,
          playerId: form.users.map((item) => item.id),
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
