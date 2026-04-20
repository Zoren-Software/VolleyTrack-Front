<template>
  <div class="training-attendance-view">
    <div v-if="loading" class="state-row">
      <va-progress-circle indeterminate size="small" />
      <span>Carregando lista de presença...</span>
    </div>

    <div v-else-if="!form.id" class="state-row state-row--empty">
      <va-icon name="info" size="20px" color="#6b7280" />
      <span>Treino não encontrado.</span>
    </div>

    <div v-else class="attendance-body">
      <h2 class="section-title">Chamada do Treino</h2>

      <div class="metrics-section">
        <div class="metrics-cards">
          <ZCardViewMetricsPresenceIntention
            title="Métricas do treino, intenção de presença"
            :strip="false"
            :data="confirmationTrainingMetrics"
          />
          <ZCardViewMetricsRealPresence
            title="Métricas do treino, presença real"
            :strip="false"
            :data="confirmationTrainingMetrics"
          />
        </div>

        <div class="progress-bars-section">
          <ZProgressBarMetricsTraining
            :metrics="confirmationTrainingMetrics"
            :data="form"
          />
        </div>
      </div>

      <div class="players-list-section">
        <ZListRelationConfirmationTrainings
          :items="form.confirmationsTraining"
          :training-date="form.dateValue"
          @action-confirm="actionConfirm"
          @action-reject="actionReject"
          @action-confirm-presence="actionConfirmPresence"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import TRAINING from "~/graphql/training/query/training.graphql";
import { transformTrainingData } from "~/utils/forms/trainingForm";
import ZListRelationConfirmationTrainings from "~/components/organisms/List/Relations/ZListRelationConfirmationTrainings";
import ZCardViewMetricsRealPresence from "~/components/molecules/Cards/ZCardViewMetricsRealPresence";
import ZCardViewMetricsPresenceIntention from "~/components/molecules/Cards/ZCardViewMetricsPresenceIntention";
import ZProgressBarMetricsTraining from "~/components/molecules/ProgressBar/ZProgressBarMetricsTraining";
import CONFIRMTRAINING from "~/graphql/training/mutation/confirmTraining.graphql";
import CONFIRMPRESENCE from "~/graphql/training/mutation/confirmPresence.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";

export default defineComponent({
  name: "ZTrainingAttendanceView",
  components: {
    ZListRelationConfirmationTrainings,
    ZCardViewMetricsRealPresence,
    ZCardViewMetricsPresenceIntention,
    ZProgressBarMetricsTraining,
  },
  props: {
    trainingId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      form: {},
    };
  },
  computed: {
    confirmationTrainingMetrics() {
      const confirmations = this.form.confirmationsTraining || [];

      const confirmed = confirmations.filter(
        (c) => c.status === "CONFIRMED" || c.status === "confirmed"
      ).length;
      const pending = confirmations.filter(
        (c) => c.status === "PENDING" || c.status === "pending"
      ).length;
      const rejected = confirmations.filter(
        (c) => c.status === "REJECTED" || c.status === "rejected"
      ).length;
      const presence = confirmations.filter((c) => c.presence === true).length;
      const absence = confirmations.filter((c) => c.presence === false).length;

      const total = confirmed + pending + rejected;

      return {
        confirmed,
        pending,
        rejected,
        total,
        confirmedPercentage: total > 0 ? (confirmed / total) * 100 : 0,
        pendingPercentage: total > 0 ? (pending / total) * 100 : 0,
        rejectedPercentage: total > 0 ? (rejected / total) * 100 : 0,
        presence,
        absence,
        presencePercentage: total > 0 ? (presence / total) * 100 : 0,
        absencePercentage: total > 0 ? (absence / total) * 100 : 0,
      };
    },
  },
  watch: {
    trainingId: {
      handler() {
        this.loadTraining();
      },
    },
  },
  mounted() {
    this.loadTraining();
  },
  methods: {
    async loadTraining() {
      if (
        this.trainingId === undefined ||
        this.trainingId === null ||
        String(this.trainingId).trim() === ""
      ) {
        this.form = {};
        return;
      }

      this.loading = true;
      try {
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          confirmError("Cliente GraphQL indisponível.");
          this.form = {};
          return;
        }

        const query = gql`
          ${TRAINING}
        `;
        const result = await apolloClient.query({
          query,
          variables: { id: String(this.trainingId) },
          fetchPolicy: "network-only",
        });

        const t = result?.data?.training;
        if (!t) {
          this.form = {};
          return;
        }

        this.form = transformTrainingData(t);
        this.form.confirmationsTraining = t.confirmationsTraining || [];
      } catch (e) {
        console.error(e);
        this.form = {};
        confirmError("Não foi possível carregar o treino.");
      } finally {
        this.loading = false;
      }
    },

    patchConfirmation(id, playerId, patch) {
      const list = this.form.confirmationsTraining;
      if (!Array.isArray(list)) return;

      const confirmationIndex = list.findIndex(
        (confirmation) =>
          (confirmation.id && confirmation.id === parseInt(id, 10)) ||
          (confirmation.playerId &&
            confirmation.playerId === parseInt(playerId, 10)) ||
          (confirmation.player?.id &&
            confirmation.player?.id === parseInt(playerId, 10))
      );

      if (confirmationIndex === -1) return;

      this.form.confirmationsTraining = [
        ...list.slice(0, confirmationIndex),
        {
          ...list[confirmationIndex],
          ...patch,
        },
        ...list.slice(confirmationIndex + 1),
      ];
    },

    async actionReject(id, playerId, trainingId) {
      try {
        const query = gql`
          ${CONFIRMTRAINING}
        `;

        const variables = {
          id: parseInt(id, 10),
          playerId: parseInt(playerId, 10),
          trainingId: parseInt(trainingId, 10),
          status: "REJECTED",
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        this.patchConfirmation(id, playerId, { status: "REJECTED" });

        confirmSuccess("Negando intenção de presença com sucesso!", () => {});
      } catch (error) {
        console.error(error);
        this.handleMutationError(
          error,
          "Ocorreu um erro ao negar a intenção de presença!"
        );
      }
    },

    async actionConfirmPresence(id, playerId, trainingId, presence) {
      try {
        const query = gql`
          ${CONFIRMPRESENCE}
        `;

        const variables = {
          id: parseInt(id, 10),
          playerId: parseInt(playerId, 10),
          trainingId: parseInt(trainingId, 10),
          presence,
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        this.patchConfirmation(id, playerId, { presence });

        confirmSuccess("Presença confirmada com sucesso!", () => {});
      } catch (error) {
        console.error(error);
        this.handleMutationError(
          error,
          "Ocorreu um erro ao confirmar a presença!"
        );
      }
    },

    async actionConfirm(id, playerId, trainingId) {
      try {
        const query = gql`
          ${CONFIRMTRAINING}
        `;

        const variables = {
          id: parseInt(id, 10),
          playerId: parseInt(playerId, 10),
          trainingId: parseInt(trainingId, 10),
          status: "CONFIRMED",
        };

        const { mutate } = await useMutation(query, { variables });
        await mutate();

        this.patchConfirmation(id, playerId, { status: "CONFIRMED" });

        confirmSuccess("Intenção de presença confirmada com sucesso!", () => {});
      } catch (error) {
        console.error(error);
        this.handleMutationError(
          error,
          "Ocorreu um erro ao confirmar a intenção de presença!"
        );
      }
    },

    handleMutationError(error, fallbackMessage) {
      if (
        error.graphQLErrors &&
        error.graphQLErrors[0] &&
        error.graphQLErrors[0].extensions &&
        error.graphQLErrors[0].extensions.validation
      ) {
        const validationErrors = error.graphQLErrors[0].extensions.validation;
        const errorMessages = Object.values(validationErrors).map((item) => {
          return Array.isArray(item) ? item[0] : item;
        });
        confirmError(fallbackMessage, errorMessages.join("<br>"));
      } else {
        confirmError(fallbackMessage);
      }
    },
  },
});
</script>

<style scoped>
.training-attendance-view {
  width: 100%;
}

.state-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 0;
  color: #4b5563;
  font-weight: 600;
}

.state-row--empty {
  color: #6b7280;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: #0b1e3a;
  margin: 0 0 20px 0;
}

.metrics-section {
  margin-bottom: 32px;
}

.metrics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.progress-bars-section {
  margin-top: 24px;
}

.players-list-section {
  margin-top: 32px;
}

@media (max-width: 768px) {
  .metrics-cards {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
