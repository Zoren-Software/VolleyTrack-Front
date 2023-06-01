<template>
  <va-sidebar-item :active="isActive">
    <NuxtLink :to="link" class="no-style-link">
      <va-sidebar-item-content>
        <va-icon :name="icon" />
        <va-sidebar-item-title>
          {{ title }}
        </va-sidebar-item-title>
      </va-sidebar-item-content>
    </NuxtLink>
  </va-sidebar-item>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
  },
};
</script>

<style>
.no-style-link {
  color: inherit;
  text-decoration: none;
}
</style>