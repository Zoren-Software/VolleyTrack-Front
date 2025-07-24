<template>
  <ZListRelationGeneric @add="add" :disable-relation="true">
    <template #filter>
      <slot name="filter" />
    </template>
    <template #list>
      <ZTechnicalScout
        @save-evaluation="handleSaveEvaluation"
        :training-id="trainingId"
      />
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";
import ZTechnicalScout from "~/components/organisms/Scout/ZTechnicalScout.vue";

export default {
  components: {
    ZListRelationGeneric,
    ZTechnicalScout,
  },
  emits: ["add", "delete"],
  props: {
    trainingId: {
      type: String,
      required: true,
    },
    items: {
      type: Array,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      paginatorInfo: {
        currentPage: 1,
        firstItem: 0,
        lastPage: 1,
        total: 0,
      },
      playersColumns: [
        {
          key: "user",
          name: "player",
          label: "Jogador",
          sortable: true,
        },
      ],
    };
  },
  computed: {
    playersItems() {
      return (this.items || []).filter((item) => item && item.user);
    },
  },
  methods: {
    add() {
      this.$emit("add");
    },
    actionDeletePlayer(item) {
      this.$emit("delete", item);
    },
    handleSaveEvaluation(evaluationData) {
      console.log("Avaliação salva:", evaluationData);

      // Aqui você pode implementar a lógica para salvar no backend
      // Por exemplo, fazer uma chamada para a API

      // Exemplo de dados que serão salvos:
      // {
      //   playerId: 1,
      //   playerName: "Maicon Souza",
      //   evaluations: {
      //     saque: { a: 5, b: 3, c: 1 },
      //     recepcao: { a: 4, b: 2, c: 0 },
      //     ataque: { a: 6, b: 2, c: 2 },
      //     bloqueio: { a: 3, b: 4, c: 1 },
      //     defesa: { a: 4, b: 3, c: 1 },
      //     levantamento: { a: 5, b: 2, c: 0 }
      //   },
      //   observations: "Jogador com excelente técnica de saque...",
      //   timestamp: "2024-01-15T10:30:00.000Z"
      // }

      // Exemplo de notificação de sucesso
      alert("Avaliação salva com sucesso!");
    },
  },
};
</script>
