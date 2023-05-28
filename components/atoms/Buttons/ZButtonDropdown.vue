<template>
  <div style="display: flex; align-items: center;">
    <va-button-dropdown
      :label="label"
      :class="class"
      :rounded="rounded"
      :size="size"
      :split="split"
      :border-color="borderColor"
      :color="color"
      :text-color="textColor"
      :disabled-button="disabledButton"
      :disabled-dropdown="disabledDropdown"
      :icon="icon"
      :hide-icon="hideIcon"
      :left-icon="leftIcon"
      :opened-icon="openedIcon"
      :icon-color="iconColor"
      :close-on-content-click="closeOnContentClick"
    >
      <slot name="label" />
      <slot name="default" />
    </va-button-dropdown>
  </div>
</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
      label: {
        type: String,
        default: '',
      },
      class: {
        type: String,
        default: '',
      },
      rounded: {
        type: Boolean,
        default: false,
      },
      size: {
        type: String,
        default: 'medium',
      },
      split: {
        type: Boolean,
        default: false,
      },
      borderColor: {
        type: String,
        default: '',
      },
      color: {
        type: String,
        default: 'primary',
      },
      textColor: {
        type: String,
        default: '',
      },
      disabledButton: {
        type: Boolean,
        default: false,
      },
      disabledDropdown: {
        type: Boolean,
        default: false,
      },
      icon: {
        type: String,
        default: 'va-arrow-down',
      },
      hideIcon: {
        type: Boolean,
        default: false,
      },
      leftIcon: {
        type: Boolean,
        default: false,
      },
      openedIcon: {
        type: String,
        default: '',
      },
      iconColor: {
        type: String,
        default: '',
      },
      closeOnContentClick: {
        type: Boolean,
        default: false,
      },
    }
});
</script>