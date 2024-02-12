<template>
  <ZCard
    :stripe="stripe"
    :stripe-color="colorStripStep()"
    :title="title"
    :color="colorStep()"
  >
    <div class="row">
      <div class="flex flex-col md8">
        <div class="item">
          <slot />
        </div>
      </div>
      <div class="flex flex-col pr-3 md4">
        <div class="item px-4">
          <va-icon :name="icon" size="5rem" />
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
