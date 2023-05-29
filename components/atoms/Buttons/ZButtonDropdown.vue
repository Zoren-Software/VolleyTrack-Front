<template>
  <va-button-dropdown
    :active-class="activeClass"
    :anchor-selector="anchorSelector"
    :append="append"
    :auto-placement="autoPlacement"
    :background-opacity="backgroundOpacity"
    :border-color="borderColor"
    :class="class"
    :close-on-anchor-click="closeOnAnchorClick"
    :close-on-click-outside="closeOnClickOutside"
    :close-on-content-click="closeOnContentClick"
    :cursor="cursor"
    :color="color"
    :disabled-button="disabledButton"
    :disabled-dropdown="disabledDropdown"
    :disabled="disabled"
    :hide-icon="hideIcon"
    :hover-behavior="hoverBehavior"
    :hover-mask-color="hoverMaskColor"
    :hover-opacity="hoverOpacity"
    :hover-out-timeout="hoverOutTimeout"
    :hover-over-timeout="hoverOverTimeout"
    :href="href"
    :icon="icon"
    :icon-color="iconColor"
    :inner-anchor-selector="innerAnchorSelector"
    :is-content-hoverable="isContentHoverable"
    :keep-anchor-width="keepAnchorWidth"
    :keyboard-navigation="keyboardNavigation"
    :label="label"
    :left-icon="leftIcon"
    :loading="loading"
    :opened-icon="openedIcon"
    :plain="plain"
    :preset="preset"
    :rounded="rounded"
    :pressed-behavior="pressedBehavior"
    :pressed-mask-color="pressedMaskColor"
    :pressed-opacity="pressedOpacity"
    :prevent-overflow="preventOverflow"
    :readonly="readonly"
    :replace="replace"
    :size="size"
    :split="split"
    :text-color="textColor"
  >
    <slot name="default" />
    <slot name="label" />
  </va-button-dropdown>
</template>


<script>
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    activeClass: {
      type: String,
    },
    anchorSelector: {
      type: String,
    },
    append: {
      type: Boolean,
    },
    autoPlacement: {
      type: Boolean,
      default: true,
    },
    backgroundOpacity: {
      type: Number,
    },
    borderColor: {
      type: String,
    },
    class: {
      type: String,
      default: '',
    },
    closeOnAnchorClick: {
      type: Boolean,
      default: true,
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true,
    },
    closeOnContentClick: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: 'primary',
    },
    cursor: {
      type: Boolean,
      default: false,
    },
    disabledButton: {
      type: Boolean,
      default: false,
    },
    disabledDropdown: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    exact: {
      type: Boolean,
    },
    exactActiveClass: {
      type: String,
    },
    hideIcon: {
      type: Boolean,
      default: false,
    },
    hoverBehavior: {
      type: String,
      default: 'mask',
    },
    hoverMaskColor: {
      type: String,
      default: 'textInverted',
    },
    hoverOpacity: {
      type: Number,
      default: 0.15,
    },
    hoverOutTimeout: {
      type: Number,
      default: 200,
    },
    hoverOverTimeout: {
      type: Number,
      default: 30,
    },
    href: {
      type: String,
    },
    icon: {
      type: String,
      default: 'va-arrow-down',
    },
    iconColor: {
      type: String,
      default: '',
    },
    innerAnchorSelector: {
      type: String,
      default: '',
    },
    isContentHoverable: {
      type: Boolean,
      default: true,
    },
    keepAnchorWidth: {
      type: Boolean,
      default: false,
    },
    keyboardNavigation: {
      type: Boolean,
      default: false,
    },
    label: {
      type: String,
      default: '',
    },
    leftIcon: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    openedIcon: {
      type: String,
      default: '',
    },
    plain: {
      type: Boolean,
      default: false,
    },
    preset: {
      type: String,
    },
    pressedBehavior: {
      type: String,
      default: 'mask',
    },
    pressedMaskColor: {
      type: String,
      default: 'textPrimary',
    },
    pressedOpacity: {
      type: Number,
      default: 0.13,
    },
    preventOverflow: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
    },
    replace: {
      type: Boolean,
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
    textColor: {
      type: String,
    },
  }
});
</script>