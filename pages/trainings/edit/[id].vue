<template>
  <ZTrainingForm
    :data="data"
    @save="edit"
    @refresh="getTraining({ fetchPolicy: 'network-only' })"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
</template>

<script>
import moment from "moment";
import ZTrainingForm from "~/components/organisms/Forms/Training/ZTrainingForm";
import TRAINING from "~/graphql/training/query/training.graphql";
import TRAININGEDIT from "~/graphql/training/mutation/trainingEdit.graphql";
import { transformTrainingData } from "~/utils/forms/trainingForm";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZTrainingForm,
  },
  mounted() {
    this.getTraining({ fetchPolicy: "network-only" });
  },
  data() {
    return {
      data: {},
      variablesGetTraining: {
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
        teamId: [],
      };
    },
    getTraining(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${TRAINING}
      `;

      const consult = {
        ...this.variablesGetTraining,
      };

      const {
        result: { value },
      } = useQuery(query, consult);

      const { onResult } = useQuery(query, consult, {
        fetchPolicy: fetchPolicyOptions.fetchPolicy || "cache-first", // Usa 'network-only' quando quer buscar nova consulta, senão 'cache-first'
      });

      onResult((result) => {
        if (result?.data?.training) {
          this.data = transformTrainingData(result.data.training);
        }
      });

      if (value) {
        if (value?.training) {
          this.data = transformTrainingData(value.training);
        }
      }
      this.loading = false;
    },

    async edit(form) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${TRAININGEDIT}
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
          id: parseInt(form.id),
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

<script setup>
useHead({
  titleTemplate: "Editar Treino",
});
</script>
