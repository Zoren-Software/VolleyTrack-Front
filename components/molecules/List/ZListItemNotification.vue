<template>
  <va-list-item
    class="no-style-link hover"
    :preset="value ? 'primary' : 'secondary'"
  >
    <va-list-item-section>
      <va-list-item-label> {{ action.title }} </va-list-item-label>
      <va-list-item-label caption class="notification-item-list">
        {{ action.description }}
      </va-list-item-label>
    </va-list-item-section>
    <va-list-item-section icon>
      <va-icon name="visibility" color="primary" />
    </va-list-item-section>
  </va-list-item>
</template>

<script>
export default {
  props: {
    action: {
      type: Object,
      required: true,
    },
    value: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped>
.hover {
  transition: all 0.1s ease;
  border: 2px solid transparent;
  border-radius: 5px; /* raio de arredondamento */
}
.hover:hover {
  transition: all 0.1s ease;
  background-color: #deecfd;
  border: 2px solid transparent;
  border-color: #deecfd; /* cor da borda ao passar o mouse */
  border-radius: 5px; /* raio de arredondamento */
}

.notification-item-list {
  /* limitar número de caracteres */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 11rem;
}
</style>
