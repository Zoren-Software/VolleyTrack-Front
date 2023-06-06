<template>
  <ZButton color="primary" class="mr-3" @click="$emit('add')">Adicionar</ZButton>
  <ZButton color="danger" :disabled="selectedItemsEmitted.length === 0" @click="$emit('delete')">Deletar</ZButton>
</template>

<script>
import ZButton from '~/components/atoms/Buttons/ZButton'

export default {
  components: {
    ZButton
  },
  emits: ['add', 'delete'],
  props: {
    selectedItemsEmitted: {
      type: Array,
      default: () => []
    }
  },
}
</script>
