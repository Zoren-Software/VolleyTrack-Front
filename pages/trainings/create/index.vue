<template>
  <ZTrainingForm
    @save="create"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import ZTrainingForm from "~/components/organisms/Forms/Training/ZTrainingForm";
import TRAININGCREATE from "~/graphql/training/mutation/trainingCreate.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import moment from "moment";

export default {
  components: {
    ZTrainingForm,
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
          ${TRAININGCREATE}
        `;

        const dateStart =
          moment(form.dateValue).format("YYYY-MM-DD") +
          " " +
          moment(form.timeStartValue).format("HH:mm:ss");
        const dateEnd =
          moment(form.dateValue).format("YYYY-MM-DD") +
          " " +
          moment(form.timeEndValue).format("HH:mm:ss");

        const variables = {
          name: form.name,
          description: form.description,
          teamId: parseInt(form.teams.map((item) => item.id)[0]),
          fundamentalId: form.fundamentals.map((item) => item.id),
          specificFundamentalId: form.fundamentals.map((item) => item.id),
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Treino salvo com sucesso!", () => {
          this.errors = this.errorsDefault();

          this.$router.push("/trainings");
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

          confirmError("Ocorreu um erro ao salvar o treino!", footer);
        } else {
          confirmError("Ocorreu um erro ao salvar o treino!");
        }
      }
      this.loading = false;
    },
  },
};
</script>
