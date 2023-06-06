<template>
  <div class="row justify-start mt-3">
    <div class="flex flex-col xs2">
      <div class="item">
        <ZDataTableActionButtons @add="actionAdd" @delete="actionDelete" :selectedItemsEmitted="selectedItemsEmitted" />
      </div>
    </div>
    <div class="flex flex-col offset-xl7 xs2">
      <div class="item">
        <ZDataTableInputSearch v-model="search" @input="updateSearch"  />
      </div>
    </div>
  </div>
  <ZDataTable 
    :items="items" 
    :columns="columns" 
    :selectable="selectable"
    :includeActionsColumn="includeActionsColumn"
    @selectionChange="selectedItemsEmitted = $event.currentSelectedItems"
  />
</template>

<script>

import { defineComponent } from "vue";
import ZDataTableActionButtons from '~/components/molecules/Datatable/ZDataTableActionButtons'
import ZDataTableInputSearch from '~/components/molecules/Datatable/ZDataTableInputSearch'
import ZDataTable from '~/components/molecules/Datatable/ZDataTable'
import ZInput from '~/components/atoms/Inputs/ZInput';
import ZIcon from '~/components/atoms/Icons/ZIcon';

export default defineComponent({
  components: {
      ZDataTableActionButtons,
      ZDataTableInputSearch,
      ZDataTable,
      ZInput,
      ZIcon
  },
  emits: ['add', 'delete', 'update:modelValue'],
  props: {
    items: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      default: () => []
    },
    includeActionsColumn: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: [String, Number, Boolean, Object, Array, Date],
      default: null
    },
  },
  data() {
    return {
      search: this.modelValue, // adicione esta linha
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
    };
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },
    actionAdd() {
      // Implemente a lógica de adicionar jogador.
      this.$emit('add');
    },
    actionDelete() {
      // Implemente a lógica de deletar jogadores.
      this.$emit('delete');
    },
    updateSearch(value) {
      this.search = value;
      this.$emit('update:modelValue', value);
    }
  },

  computed: {
    computedItems() {
      if (this.search) {
        return this.items.filter(item => 
          Object.values(item).some(value => String(value).toLowerCase().includes(this.search.toLowerCase()))
        );
      } else {
        return this.items;
      }
    }
  },
  watch: {
    modelValue(newVal) {
      this.search = newVal;
    }
  },
});
</script>