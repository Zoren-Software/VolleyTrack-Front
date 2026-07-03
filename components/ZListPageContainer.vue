<template>
  <div
    class="z-list-page-container"
    :class="{
      'z-list-page-container--narrow': narrow,
      'z-list-page-container--failure': failure,
    }"
  >
    <slot />
  </div>
</template>

<script>
export default {
  name: "ZListPageContainer",
  props: {
    narrow: {
      type: Boolean,
      default: false,
    },
    failure: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style scoped>
.z-list-page-container {
  --z-list-page-padding-x: 24px;
  --z-list-page-padding-top: 24px;
  --z-list-page-padding-bottom: 32px;
  --z-list-page-gap: 24px;
  --z-list-page-max-width: 1280px;

  box-sizing: border-box;
  width: 100%;
  max-width: var(--z-list-page-max-width);
  min-width: 0;
  margin: 0 auto;
  padding: var(--z-list-page-padding-top) var(--z-list-page-padding-x)
    var(--z-list-page-padding-bottom);
  display: flex;
  flex-direction: column;
  gap: var(--z-list-page-gap);
  transition: background 0.25s ease;
}

.z-list-page-container--narrow {
  --z-list-page-max-width: 840px;
}

.z-list-page-container--failure {
  background: linear-gradient(180deg, #fff5f5 0%, #fafafa 42%, #ffffff 100%);
  min-height: 100vh;
  --z-list-page-padding-top: 20px;
  --z-list-page-padding-bottom: 48px;
}

/* O gap do container substitui margin-bottom dos cabeçalhos internos */
.z-list-page-container :deep(.page-header),
.z-list-page-container :deep(.account-summary-intro) {
  margin-bottom: 0;
}

@media (min-width: 769px) {
  .z-list-page-container {
    --z-list-page-padding-x: 32px;
    --z-list-page-padding-top: 28px;
    --z-list-page-padding-bottom: 40px;
    --z-list-page-gap: 28px;
  }
}

@media (min-width: 1200px) {
  .z-list-page-container {
    --z-list-page-padding-x: 40px;
    --z-list-page-max-width: 1240px;
  }

  .z-list-page-container--narrow {
    --z-list-page-max-width: 880px;
  }
}

@media (max-width: 768px) {
  .z-list-page-container {
    --z-list-page-padding-x: 16px;
    --z-list-page-padding-top: 16px;
    --z-list-page-padding-bottom: 24px;
    --z-list-page-gap: 16px;
  }
}
</style>
