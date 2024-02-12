<template>
  <ZCard
    :stripe="stripe"
    :stripe-color="colorStripStep()"
    :title="title"
    :color="colorStep()"
  >
    <div class="row">
      <div class="flex flex-col md8" v-if="!isSlotEmpty">
        <div class="item">
          <slot />
        </div>
      </div>
      <div class="flex flex-col pr-3 md5" v-if="isSlotEmpty">
        <div class="item px-4">
          <va-icon :name="icon" size="5rem" />
        </div>
      </div>
      <div class="flex flex-col pr-3 md4" v-else>
        <div class="item px-4">
          <va-icon :name="icon" size="5rem" />
        </div>
      </div>
      <div class="flex flex-col pr-3 md7 pl-5 border-custom" v-if="isSlotEmpty">
        <div class="item">
          <h3 class="va-h3">{{ total }} {{ textTotal }}</h3>
        </div>
      </div>
    </div>
    <ZButton
      color="primary"
      class="mt-3"
      :disabled="step < stepDisabled"
      @click="$emit('click')"
    >
      {{ textButton }}
    </ZButton>
  </ZCard>
</template>

<script>
import ZCard from "~/components/atoms/Cards/ZCard";
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  components: {
    ZCard,
    ZButton,
  },
  emits: ["click"],
  props: {
    stripe: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "Título",
    },
    color: {
      type: String,
      default: "primary",
    },
    textButton: {
      type: String,
      default: "Adicionar",
    },
    icon: {
      type: String,
      default: "plus",
    },
    step: {
      type: Number,
      default: 0,
    },
    stepDisabled: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    textTotal: {
      type: String,
      default: "Registros",
    },
    isSlotEmpty: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    colorStripStep() {
      if (this.step === this.stepDisabled) {
        return "primary";
      } else if (this.step > this.stepDisabled) {
        return "success";
      } else {
        return "secondary";
      }
    },
    colorStep() {
      if (this.step === this.stepDisabled) {
        return "primary";
      } else if (this.step > this.stepDisabled) {
        return "primary";
      } else {
        return "secondary";
      }
    },
  },
};
</script>

<style scoped>
.border-custom {
  border-left: 2px solid var(--va-primary);
}
</style>
