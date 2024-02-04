<template>
  <va-popover
    class="mr-2 mb-2"
    :message="label + ' copied to clipboard'"
    placement="top"
    trigger="click"
  >
    <span :ref="refName" class="mr-2 va-text-secondary" v-once
      >{{ label }}:</span
    >
    <span :ref="refName" class="mr-2 va-text-custom" v-once>{{ text }}</span>
    <va-icon
      size="small"
      name="content_copy"
      color="primary"
      @click="copyToClipboard"
    />
  </va-popover>
</template>

<script>
import Clipboard from "clipboard";

export default {
  props: {
    name: {
      type: String,
      required: false,
    },
    refName: {
      type: String,
      required: false,
    },
    text: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: true,
    },
  },

  methods: {
    copyToClipboard() {
      try {
        if (!this.clipboard) {
          this.clipboard = new Clipboard(this.$refs[this.refName], {
            text: () => this.text,
          });

          this.clipboard.on("success", (e) => {
            console.log(this.label + " copied to clipboard");
            e.clearSelection();
          });
        }

        // NOTE - Simular um click no elemento para acionar a cópia para o clipboard.
        this.$refs[this.refName].click();
      } catch (error) {
        console.error("Error in copyToClipboard: ", error);
      }
    },
  },
};
</script>

<style scoped>
.va-text-custom {
  color: #34495e;
}
</style>
