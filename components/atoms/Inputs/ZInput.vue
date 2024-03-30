<template>
  <va-input
    style="width: 100%"
    v-bind="$attrs"
    :id="id"
    :label="label"
    :rules="rules"
    :type="type"
    :messages="messages"
    v-model="internalValue"
  >
    <template v-for="(_, slotName) in $slots" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope"></slot>
    </template>
  </va-input>
</template>

<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: String,
      default: "",
    },
    rules: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      default: "text",
    },
    messages: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
  },
};
</script>
