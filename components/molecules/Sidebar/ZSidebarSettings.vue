<template>
  <VaSidebar
    :model-value="modelValue"
    @update:modelValue="(val) => $emit('update:modelValue', val)"
    class="settings-sidebar"
    animated="right"
  >
    <VaSidebarItem
      v-for="item in menuSettings"
      :key="item.title"
      :active="item.active"
    >
      <VaSidebarItemContent
        @click="handleMenuItemClick(item)"
        style="cursor: pointer"
      >
        <VaIcon :name="item.icon" />
        <VaSidebarItemTitle>
          {{ item.title }}
        </VaSidebarItemTitle>
      </VaSidebarItemContent>
    </VaSidebarItem>
  </VaSidebar>
</template>

<script>
export default {
  name: "ZSidebarSettings",
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      menuSettings: [
        {
          title: "Configurações da Conta",
          icon: "settings",
          to: "/settings",
          active: false,
        },
        {
          title: "Configurações de Notificação",
          icon: "notifications",
          to: "/notifications",
          active: false,
        },
        {
          title: "Fechar Configurações",
          icon: "close",
          action: () => {
            this.enabledSettings = false;
          },
        },
      ],
    };
  },
  methods: {
    handleMenuItemClick(item) {
      if (item.action) {
        item.action.call(this);
        this.$emit("update:modelValue", false);
      } else if (item.to) {
        this.$router.push(item.to);
        this.$emit("update:modelValue", false);
      }
    },
  },
};
</script>
