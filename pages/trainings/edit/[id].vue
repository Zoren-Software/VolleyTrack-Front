<template>
  <div class="edit-training-page">
    <div class="page-header">
      <h1 class="title">Editar Treino</h1>
      <p class="subtitle">Atualize as informações do treino</p>
    </div>
    <ZTrainingForm
      :data="data"
      @save="edit"
      @saveAndContinue="editAndContinue"
      @saveScouts="editScouts"
      @refresh="getTraining({ fetchPolicy: 'network-only' })"
      :loading="loading"
      :errorFields="errorFields"
      :errors="errors"
      ref="trainingForm"
    />
  </div>
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

  watch: {
    data: {
      handler(newData) {
        // O ZTrainingForm agora lê automaticamente a etapa da URL
      },
      immediate: true,
    },
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
          playerIds: form.standalonePlayerIds
            ? form.standalonePlayerIds
                .map((id) => parseInt(id))
                .filter((id) => id != null)
            : [],
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        // Verifica a etapa atual para decidir se redireciona
        const currentStep = this.$refs.trainingForm
          ? this.$refs.trainingForm.controlledStep
          : 0;

        // Se estiver na etapa 0 (Informações Essenciais), apenas mostra sucesso sem recarregar
        if (currentStep === 0) {
          confirmSuccess("Treino salvo com sucesso!");
            this.errors = this.errorsDefault();
          // Não recarrega os dados para preservar as presenças marcadas na etapa 2
          // this.getTraining({ fetchPolicy: 'network-only' });
        } else if (currentStep >= 2) {
          // Se estiver salvando scouts (etapa 2), apenas mostra sucesso sem redirecionar
          confirmSuccess("Scouts salvos com sucesso!");
          this.errors = this.errorsDefault();
          // IMPORTANTE: Não redireciona, mantém na página atual
        } else {
          // Fallback para outras etapas
          confirmSuccess("Dados salvos com sucesso!");
          this.errors = this.errorsDefault();
        }
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

    async editAndContinue(form) {
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
          playerIds: form.standalonePlayerIds
            ? form.standalonePlayerIds
                .map((id) => parseInt(id))
                .filter((id) => id != null)
            : [],
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        // Só avança para a etapa 4 se estiver nas etapas iniciais (0-3)
        // E se não estiver salvando scouts (etapas 4-5)
        if (this.$refs.trainingForm && this.$refs.trainingForm.step <= 3) {
          this.$refs.trainingForm.step = 4; // Vai para a etapa 4 (Lista de Presença)
        } else if (
          this.$refs.trainingForm &&
          this.$refs.trainingForm.step >= 4
        ) {
          // Não altera o step quando está salvando scouts
        }
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

    async editScouts(form) {
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
          playerIds: form.standalonePlayerIds
            ? form.standalonePlayerIds
                .map((id) => parseInt(id))
                .filter((id) => id != null)
            : [],
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        // Para scouts, apenas mostra sucesso sem redirecionar
        confirmSuccess("Scouts salvos com sucesso!");
        this.errors = this.errorsDefault();
        // IMPORTANTE: Não redireciona, mantém na página atual
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

          confirmError("Ocorreu um erro ao salvar os scouts!", footer);
        } else {
          confirmError("Ocorreu um erro ao salvar os scouts!");
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

<style scoped>
.edit-training-page {
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
