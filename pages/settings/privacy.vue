<template>
  <ZListPageContainer narrow>
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">Privacidade e dados pessoais</h1>
          <p class="page-subtitle">
            Portabilidade e exclusão da conta no clube, conforme a LGPD. A exportação
            gera um arquivo com seus dados; a exclusão anonimiza informações pessoais
            e encerra o acesso.
          </p>
        </div>
      </div>
    </div>

    <ZLgpdPortabilityPanel />
    <ZLgpdPrivacyPanel />
  </ZListPageContainer>
</template>

<script setup>
import ZLgpdPortabilityPanel from "~/components/organisms/Privacy/ZLgpdPortabilityPanel.vue";
import ZLgpdPrivacyPanel from "~/components/organisms/Privacy/ZLgpdPrivacyPanel.vue";

definePageMeta({
  pageTransition: false,
});
</script>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.2;
}

.page-subtitle {
  margin: 0;
  font-size: 15px;
  color: #6c757d;
  line-height: 1.5;
}
</style>
