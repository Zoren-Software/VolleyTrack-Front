<template>
  <ZBadge v-if="data[0]" :color="colors(data[0].id)" :text="data[0].name" /> 
</template>

<script>
import ZBadge from '~/components/atoms/Badges/ZBadge'

export default {
  components: {
    ZBadge
  },
  props: {
    data: {
      type: Object,
      required: true
    },
  },

  methods: {
    colors(id) {
      const colors = {
        1: 'primary',
        2: 'secondary',
        3: 'success',
        4: 'warning',
        5: 'danger',
      }
      return colors[id]
    }
  },
 
}
</script>