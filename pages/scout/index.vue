<template>
  <div class="scout-page">
    <ZTechnicalScout @save-evaluation="handleSaveEvaluation" />
  </div>
</template>

<script setup>
import ZTechnicalScout from "~/components/organisms/Scout/ZTechnicalScout.vue";

// Define a página
definePageMeta({
  title: "Scout Técnico",
  layout: "default",
});

// Methods
const handleSaveEvaluation = (evaluationData) => {
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
};
</script>

<style scoped>
.scout-page {
  height: 100vh;
  overflow: hidden;
}
</style>
