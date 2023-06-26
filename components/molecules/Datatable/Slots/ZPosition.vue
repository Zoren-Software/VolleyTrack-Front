<template>
  <ZBadge :text="willPositions(data)" overlap>
    <ZButton v-if="data[0]" size="small" :color="colors(data[0].id)"> {{data[0].name}}</ZButton> 
  </ZBadge>
</template>

<script>
import ZBadge from '~/components/atoms/Badges/ZBadge'
import ZButton from '~/components/atoms/Buttons/ZButton'

export default {
  components: {
    ZBadge,
    ZButton
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
    },
    willPositions(total) {
      total = total.length
      if(total <= 1) return ''
      return `+${total - 1}`
    }
  },
}
</script>