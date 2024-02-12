<template>
  <div class="row">
    <div class="flex flex-col pr-3 md4">
      <div class="item">
        <ZCardRegisters
          :step="step"
          :stepDisabled="0"
          @click="redirectCreatePlayers()"
          stripe
          title="Total de Jogadores"
          textButton="Adicionar Jogadores"
          icon="person"
        >
          <p>
            Adicione detalhes dos jogadores para formar uma base sólida para sua
            equipe.
          </p>
        </ZCardRegisters>
      </div>
    </div>
    <div class="flex flex-col pr-3 md4">
      <div class="item">
        <ZCardRegisters
          :step="step"
          :stepDisabled="1"
          @click="redirectCreateTeams()"
          stripe
          title="Total de Times"
          textButton="Adicionar Times"
          icon="group"
        >
          <p>
            Organize seus times de maneira eficaz, registrando cada detalhe
            importante.
          </p>
        </ZCardRegisters>
      </div>
    </div>
    <div class="flex flex-col pr-3 md4">
      <div class="item">
        <ZCardRegisters
          :step="step"
          :stepDisabled="2"
          @click="redirectCreateTrainings()"
          stripe
          title="Total de Treinos"
          textButton="Adicionar Treinos"
          icon="fitness_center"
        >
          <p>
            Planeje e registre treinos para maximizar o desempenho e a
            preparação da equipe.
          </p>
        </ZCardRegisters>
      </div>
    </div>
  </div>
</template>

<script>
import ZCard from "~/components/atoms/Cards/ZCard";
import ZButton from "~/components/atoms/Buttons/ZButton";
import ZCardRegisters from "~/components/molecules/Cards/ZCardRegisters.vue";
import { ref, watch, defineProps } from "vue";
import { VaIcon } from "vuestic-ui";

export default {
  components: {
    ZCard,
    ZButton,
    ZCardRegisters,
  },

  data() {
    return {
      token: "",
      user: {},
    };
  },
  mounted() {
    this.token = localStorage.getItem("userToken") ?? "sem token";
    this.user = JSON.parse(localStorage.getItem("user"));
  },

  methods: {
    redirectCreatePlayers() {
      this.$router.push("/players/create");
    },
    redirectCreateTeams() {
      this.$router.push("/teams/create");
    },
    redirectCreateTrainings() {
      this.$router.push("/trainings/create");
    },
  },
};
</script>

<script setup>
let step = ref(0);

let valueAccordion = ref([false]);

const props = defineProps({
  totalUsers: {
    type: Number,
    default: 0,
  },
  totalTeams: {
    type: Number,
    default: 0,
  },
  totalTrainings: {
    type: Number,
    default: 0,
  },
});
watch(step, (newValue) => {
  if (newValue === 3) {
    valueAccordion = [false];
  } else {
    valueAccordion = [true];
  }
});

watch(
  () => [props.totalUsers, props.totalTeams, props.totalTrainings],
  ([users, teams, trainings]) => {
    if (trainings >= 1) {
      step.value = 3;
    } else if (teams >= 1) {
      step.value = 2;
    } else if (users >= 1) {
      step.value = 1;
    } else {
      step.value = 0;
    }
  },
  { immediate: true }
);

let steps = [
  {
    label: "Jogadores",
    icon: "person",
    originalIcon: "person",
    completedIcon: "check",
  },
  {
    label: "Times",
    icon: "group",
    originalIcon: "group",
    completedIcon: "check",
  },
  {
    label: "Treinos",
    icon: "fitness_center",
    originalIcon: "fitness_center",
    completedIcon: "check",
  },
];

const updateStepIcon = (currentStep) => {
  steps.forEach((step, index) => {
    if (index < currentStep) {
      step.icon = step.completedIcon;
    }
  });
};

watch(step, (newValue, oldValue) => {
  if (newValue > oldValue) {
    // Avançando para o próximo step
    steps[oldValue].icon = steps[oldValue].completedIcon;
  } else if (newValue < oldValue) {
    // Retrocedendo para o step anterior
    steps[newValue].icon = steps[newValue].originalIcon;
  }
});
</script>

<style scoped>
.stepper-custom {
  padding-right: 12rem;
  padding-left: 12rem;
  margin-top: 2rem;
}
.gradient {
  background: linear-gradient(90deg, #f1aa30 0%, #fd1d1d 100%);
}

.divider {
  flex-grow: 1;
  margin: 0 1rem;
  height: 2px;
  width: 2rem;
  border-radius: 1rem;
}

.step-button {
  display: flex;
  gap: 1rem;
  color: white;
  background-color: var(--va-secondary);
  padding: 0.8rem;
  border-radius: 50%;
  transition: all 0.2s;
}

.step-button--active {
  color: white;
  background-color: var(--va-primary);
  border-radius: 50%;
  transition: all 0.2s;
}

.step-button--completed {
  color: white;
  background-color: var(--va-success);
}

.step-success {
  color: var(--va-success);
}
</style>
