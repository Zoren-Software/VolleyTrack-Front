<template>
  <ZBadge :text="willTeams(data)" overlap>
    <ZButton v-if="data[0]" size="small" color="primary"> {{data[0].name}}</ZButton> 
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
    
    willTeams(total) {
      total = total.length
      if(total <= 1) return ''
      return `+${total - 1}`
    }
  },
}
</script>