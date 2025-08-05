<template>
  <div v-if="data" class="row justify-start mt-2">
    <div class="flex flex-col">
      <div class="item mt-2">
        <va-avatar v-if="data.id" class="mr-6">{{ firstLetter }}</va-avatar>
        <va-icon v-else name="sports_volleyball" />
      </div>
    </div>
    <div class="flex flex-col">
      <div class="item">
        <div class="pl-2">
          <div class="flex gap-1 mb-1">
            <span class="va-text-custom"><b>{{ data.name }}</b></span>
          </div>
          <div v-if="data.teamCategory?.name" class="flex items-center">
            <va-icon size="small" name="category" color="secondary" class="mr-2" />
            <span class="va-text-custom">Categoria: {{ data.teamCategory.name }}</span>
          </div>
          <div v-if="data.teamLevel?.name" class="flex items-center">
            <va-icon size="small" name="star" color="secondary" class="mr-2" />
            <span class="va-text-custom">Nível Técnico: {{ data.teamLevel.name }}</span>
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
    firstLetter() {
      return this.data.name.charAt(0).toUpperCase();
    },
  },
};
</script>

<style scoped>
.va-text-custom {
  color: #34495e;
}
</style>
