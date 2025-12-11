<template>
  <div class="page-header">
    <h1 class="title">Cadastro de Treino</h1>
    <p class="subtitle">Crie um novo treino para sua equipe</p>
  </div>
  <ZTrainingForm
    ref="trainingForm"
    @save="create"
    @saveAndContinue="createAndContinue"
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

        // Converter a data para o formato YYYY-MM-DD antes de usar moment
        const dateValue = new Date(form.dateValue).toISOString().split("T")[0];
        const dateStart =
          dateValue + " " + moment(form.timeStartValue).format("HH:mm:ss");

        const dateEnd =
          dateValue + " " + moment(form.timeEndValue).format("HH:mm:ss");

        const variables = {
          name: form.name,
          description: form.description,
          teamId:
            form.teams && form.teams.length > 0
              ? parseInt(form.teams[0].id)
              : null,
          fundamentalId: form.fundamentals
            ? form.fundamentals
                .map((item) => item.id)
                .filter((id) => id != null)
            : [],
          specificFundamentalId: form.specificFundamentals
            ? form.specificFundamentals
                .map((item) => item.id)
                .filter((id) => id != null)
            : [],
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

    async createAndContinue(form) {
      try {
        this.loading = true;
        this.error = false;

        const query = gql`
          ${TRAININGCREATE}
        `;

        // Converter a data para o formato YYYY-MM-DD antes de usar moment
        const dateValue = new Date(form.dateValue).toISOString().split("T")[0];
        const dateStart =
          dateValue + " " + moment(form.timeStartValue).format("HH:mm:ss");

        const dateEnd =
          dateValue + " " + moment(form.timeEndValue).format("HH:mm:ss");

        const variables = {
          name: form.name,
          description: form.description,
          teamId:
            form.teams && form.teams.length > 0
              ? parseInt(form.teams[0].id)
              : null,
          fundamentalId: form.fundamentals
            ? form.fundamentals
                .map((item) => item.id)
                .filter((id) => id != null)
            : [],
          specificFundamentalId: form.specificFundamentals
            ? form.specificFundamentals
                .map((item) => item.id)
                .filter((id) => id != null)
            : [],
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        console.log("nem passei aqui");
        // Redireciona para a página de edição com o ID do treino criado e etapa 4
        this.$router.push(`/trainings/edit/${data.trainingCreate.id}?step=3`);
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
  titleTemplate: "Criar Treino",
});
</script>

<style scoped>
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
