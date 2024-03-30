<template>
  <div v-if="data" class="row justify-start mt-2">
    <div v-if="data.id" class="flex flex-col">
      <div class="item mt-2">
        <va-avatar v-if="data.id" class="mr-6">{{ firstLatter }}</va-avatar>
        <va-icon v-else name="account_circle" />
      </div>
    </div>
    <div v-if="data.id" class="flex flex-col">
      <div class="item">
        <div class="pl-2">
          <div class="flex gap-1 mb-1">
            <span class="va-text-custom"
              ><b>{{ data.name }}</b></span
            >
          </div>
          <div v-if="data.information?.phone" class="flex items-center">
            <va-icon size="small" name="phone" color="secondary" class="mr-2" />
            <span class="va-text-custom">{{ formattedPhone }}</span>
          </div>
          <div v-if="showEmail" class="flex items-center">
            <va-icon size="small" name="email" color="secondary" class="mr-2" />
            <span class="va-text-custom">{{ data.email }}</span>
          </div>
          <div v-if="showCreatedAt" class="flex items-center">
            <va-icon size="small" name="event" color="secondary" class="mr-2" />
            <span class="va-text-custom"
              >Criado em: {{ formattedCreatedAt }}</span
            >
          </div>
          <div v-if="showUpdatedAt" class="flex items-center">
            <va-icon size="small" name="event" color="secondary" class="mr-2" />
            <span class="va-text-custom"
              >Atualizado em: {{ formattedUpdatedAt }}</span
            >
          </div>
          <div v-if="showConfirmTraining">
            <va-icon
              size="large"
              name="checked"
              color="success"
              class="custom-css pr-1"
            />
            <span class="va-text-success">Confirmado</span>
          </div>
          <div v-if="showCancelTraining">
            <va-icon
              size="large"
              name="closed"
              color="danger"
              class="custom-css pr-4"
            />
            <span class="va-text-danger">Cancelado</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPhoneOnType } from "~/utils/formatting/formatHelper";
import moment from "moment";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    showEmail: {
      type: Boolean,
      required: false,
      default: false,
    },
    createdAt: {
      type: String,
      required: false,
    },
    updatedAt: {
      type: String,
      required: false,
    },
    showCreatedAt: {
      type: Boolean,
      required: false,
      default: false,
    },
    showUpdatedAt: {
      type: Boolean,
      required: false,
      default: false,
    },
    showConfirmTraining: {
      type: Boolean,
      required: false,
      default: false,
    },
    showCancelTraining: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    firstLatter() {
      return this.data.name.charAt(0).toUpperCase() ?? "";
    },
    formattedPhone() {
      return this.formatPhone(this.data.information?.phone);
    },
    formattedCreatedAt() {
      return this.createdAt ? this.formatDate(this.createdAt) : "";
    },
    formattedUpdatedAt() {
      return this.updatedAt ? this.formatDate(this.updatedAt) : "";
    },
  },
  methods: {
    //formatar datas usando o moment
    formatDate(value) {
      return moment(value).format("DD/MM/YYYY HH:mm");
    },
    removeNonNumericCharacters(value) {
      return value.replace(/\D/g, "");
    },
    formatPhone(value) {
      const onlyNumbers = this.removeNonNumericCharacters(value);
      return formatPhoneOnType(onlyNumbers);
    },
  },
};
</script>

<style scoped>
.va-text-custom {
  color: #34495e;
}
.custom-css {
  margin-right: -2.6rem;
}
</style>
