<template>
  <va-avatar-group
    :options="options"
    :max="max"
  >
    <slot name="default"/>
  </va-avatar-group>
</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "Group",
  
  props: {
      class: {
        type: String,
        default: '',
      },
      max: {
        type: Number,
        default: 3,
      },
      options: {
        type: Array,
        default: [],
      },
    }
});

</script>