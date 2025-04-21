<template>
  <VaSidebar
    :model-value="modelValue"
    @update:modelValue="$emit('update:modelValue', $event)"
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
    <ZNotificationSettingsForm v-model="openNotificationModal" />
  </VaSidebar>
</template>

<script>
import ZNotificationSettingsForm from "~/components/organisms/Settings/ZNotificationSettingsForm.vue";

export default {
  name: "ZSidebarSettings",
  components: {
    ZNotificationSettingsForm,
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      openNotificationModal: false,
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
          active: false,
          action: () => {
            this.openNotificationModal = true;
          },
        },
        {
          title: "Fechar Configurações",
          icon: "close",
          action: () => {
            this.$emit("update:modelValue", false);
          },
        },
      ],
    };
  },
  methods: {
    handleMenuItemClick(item) {
      if (item.action) {
        item.action.call(this);
      } else if (item.to) {
        this.$router.push(item.to);
        this.$emit("update:modelValue", false);
      }
    },
  },
};
</script>
