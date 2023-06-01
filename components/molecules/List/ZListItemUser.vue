<template>
  <va-list-item 
    :class="`no-style-link hover` + (isSelected ? ' selected' : '')"
    @click="emitAction"
  >
    <va-list-item-section class="mb-2 ml-3 mr-3 mt-2">
      {{ title }}
    </va-list-item-section>
  </va-list-item>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    action: {
      type: String,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    emitAction () {
      this.$emit('action', this.action)
    }
  },
}
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

.selected {
  transition: all 0.1s ease;
  background-color: #deecfd;
  border: 2px solid transparent;
  border-color: #deecfd; /* cor da borda ao passar o mouse */
  border-radius: 5px; /* raio de arredondamento */
}
</style>