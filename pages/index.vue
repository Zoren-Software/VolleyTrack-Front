<template>
  <div style="display: none">
    <h1>
      <!-- Mostrar aqui o token do usuario vindo de localstorage -->
      {{ token }}
      <pre>{{ JSON.stringify(user, null, 2) }}</pre>
    </h1>
  </div>
  <div>
    <h4 class="va-h4">Primeiros Passos no VolleyTrack</h4>
    <p class="va-text-secondary py-3">
      Bem-vindo ao VolleyTrack, a plataforma que transforma a gestão de equipes
      de vôlei.
      <br />
      <span class="va-text-success">Inicie seu caminho para o sucesso</span>
      organizando suas informações essenciais de maneira simples e eficiente.
      <br />
      Vamos começar?
    </p>
    <div class="row">
      <div class="flex flex-col pr-3 md4">
        <div class="item">
          <ZCardRegisters
            stripe
            stripe-color="success"
            title="Registro de Jogadores"
            color="secondary"
            textButton="Adicionar Jogadores"
          >
            <p>
              Adicione detalhes dos jogadores para formar uma base sólida para
              sua equipe.
            </p>
          </ZCardRegisters>
        </div>
      </div>
      <div class="flex flex-col pr-3 md4">
        <div class="item">
          <ZCardRegisters
            stripe
            stripe-color="success"
            title="Registro de Times"
            color="secondary"
            textButton="Adicionar Times"
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
            stripe
            stripe-color="success"
            title="Registro de Treinos"
            color="secondary"
            textButton="Adicionar Treinos"
          >
            <p>
              Planeje e registre treinos para maximizar o desempenho e a
              preparação da equipe.
            </p>
          </ZCardRegisters>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ZCard from "~/components/molecules/Cards/ZCard";
import ZButton from "~/components/atoms/Buttons/ZButton";
import ZCardRegisters from "~/components/organisms/Cards/ZCardRegisters.vue";

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
};
</script>

<script setup>
useHead({
  titleTemplate: "Home",
});
</script>
