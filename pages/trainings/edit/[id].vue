<template>
  <ZTrainingForm
    :data="data"
    @save="edit"
    :loading="loading"
    :errorFields="errorFields"
    :errors="errors"
  />
  {{ data }}
</template>

<script>
import ZTrainingForm from "~/components/organisms/Forms/Training/ZTrainingForm";
import TRAINING from "~/graphql/training/query/training.graphql";
import USEREDIT from "~/graphql/user/mutation/userEdit.graphql";
import { transformTrainingData } from "~/utils/forms/trainingForm";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default {
  components: {
    ZTrainingForm,
  },
  mounted() {
    this.getTraining();
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
    getTraining() {
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

      const { onResult } = useQuery(query, consult);

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
          ${USEREDIT}
        `;

        const variables = {
          id: form.id,
          name: form.name,
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
