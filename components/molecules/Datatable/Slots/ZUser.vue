<template>
  <div class="row justify-start">
    <div class="flex flex-col xs2">
      <div class="item mt-2">
        <va-avatar v-if="data.id" class="mr-6">{{ firstLatter }}</va-avatar>
        <va-icon v-else name="account_circle" />
      </div>
    </div>
    <div class="flex flex-col xs2">
      <div class="item">
        <div class="pl-2">
          <div class="flex gap-1 mb-1">
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

      if (onlyNumbers.length === 0) {
        return "";
      } else if (onlyNumbers.length <= 2) {
        return onlyNumbers.replace(/^(\d{0,2})/, "($1");
      } else if (onlyNumbers.length <= 6) {
        return onlyNumbers.replace(/^(\d{2})(\d{0,4})/, "($1) $2");
      } else if (onlyNumbers.length <= 10) {
        return onlyNumbers.replace(/^(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
      } else {
        return onlyNumbers.replace(
          /^(\d{2})(\d{1})(\d{4})(\d{0,4})/,
          "($1) $2 $3-$4"
        );
      }
    },
  },
};
</script>
