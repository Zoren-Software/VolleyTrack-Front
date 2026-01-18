<template>
  <div class="top3-badge">
    <va-icon name="emoji_events" size="16px" color="#E9742B" />
    <span class="top3-text">TOP 3</span>
  </div>
</template>

<script>
export default {
  name: "ZTop3Badge",
};
</script>

<style scoped>
.top3-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  margin-left: 8px;
  padding: 4px 10px;
  background: rgba(233, 116, 43, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(233, 116, 43, 0.2);
}

.top3-text {
  font-size: 11px;
  font-weight: 700;
  color: #e9742b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
}
</style>

