<template>
  <div class="test-material-symbols">
    <h2>Teste de Material Symbols</h2>

    <div class="icon-test">
      <h3>Material Icons (Clássico)</h3>
      <va-icon name="sports_volleyball" size="large" color="primary" />
      <va-icon name="emoji_events" size="large" color="success" />
      <va-icon name="warning" size="large" color="warning" />
    </div>

    <div class="icon-test">
      <h3>Material Symbols (Nova Versão)</h3>
      <va-icon name="guardian" size="large" color="primary" />
      <va-icon name="sports_soccer" size="large" color="success" />
      <va-icon name="sports_basketball" size="large" color="warning" />
    </div>

    <div class="icon-test">
      <h3>Teste com CSS Custom</h3>
      <span
        class="material-symbols-outlined"
        style="font-size: 48px; color: #ff4e1b"
        >guardian</span
      >
      <span
        class="material-symbols-outlined"
        style="font-size: 48px; color: #4caf50"
        >sports_soccer</span
      >
      <span
        class="material-symbols-outlined"
        style="font-size: 48px; color: #ff9800"
        >sports_basketball</span
      >
    </div>
  </div>
</template>

<script setup>
// Componente de teste para verificar Material Symbols
</script>

<style scoped>
.test-material-symbols {
  padding: 20px;
  background: white;
  border-radius: 8px;
  margin: 20px;
}

.icon-test {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.icon-test h3 {
  margin-bottom: 15px;
  color: #333;
}

.material-symbols-outlined {
  margin-right: 15px;
}
</style>
