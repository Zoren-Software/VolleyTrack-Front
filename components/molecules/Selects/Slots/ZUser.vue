<template>
  <div class="row justify-start">
    <div class="flex flex-col">
      <div class="item mt-2">
        <va-avatar v-if="data.id" class="">{{ firstLatter }}</va-avatar>
        <va-icon v-else name="account_circle" />
      </div>
    </div>
    <div class="flex flex-col">
      <div class="item">
        <div class="pl-2">
          <div class="flex">
            <span
              ><b>{{ data.name }}</b></span
            >
          </div>
          <div v-if="data.information?.phone" class="flex items-center">
            <va-icon size="small" name="phone" color="secondary" class="mr-2" />
            <span>{{ formattedPhone }}</span>
          </div>
          <div class="flex items-center">
            <va-icon size="small" name="email" color="secondary" class="mr-2" />
            <span>{{ data.email }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { formatPhoneOnType } from "~/utils/formatting/formatHelper";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    firstLatter() {
      return this.data.name.charAt(0).toUpperCase();
    },
    formattedPhone() {
      return this.formatPhone(this.data.information?.phone);
    },
  },
  methods: {
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
