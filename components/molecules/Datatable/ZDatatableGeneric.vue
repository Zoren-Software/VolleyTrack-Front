<template>
  <div class="row justify-start mt-3">
    <div class="flex flex-col xs2">
      <div class="item">
        <ZDataTableActionButtons @add="actionAdd" @delete="actionDeletes" :selectedItemsEmitted="selectedItemsEmitted" />
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
  >
    <template #cell(actions)="{ id }">
      <va-button
        preset="plain"
        icon="edit"
        @click="actionEdit(id)"
      />
      <va-button
        preset="plain"
        icon="delete"
        color="danger"
        class="ml-3"
        @click="actionDelete(id)"
      />
    </template>
  </ZDataTable>
</template>

<script>

import { defineComponent } from "vue";
import ZDataTableActionButtons from '~/components/molecules/Datatable/ZDataTableActionButtons'
import ZDataTableInputSearch from '~/components/molecules/Datatable/ZDataTableInputSearch'
import ZDataTable from '~/components/molecules/Datatable/ZDataTable'
import ZInput from '~/components/atoms/Inputs/ZInput';
import ZIcon from '~/components/atoms/Icons/ZIcon';
import Swal from 'sweetalert2'

export default defineComponent({
  components: {
      ZDataTableActionButtons,
      ZDataTableInputSearch,
      ZDataTable,
      ZInput,
      ZIcon
  },
  emits: ['add', 'edit', 'deletes', 'delete', 'update:modelValue'],
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
      this.$emit('add');
    },

    actionDeletes() {
      const itemsDelete = this.selectedItemsEmitted.map((item) =>
         item.id
      )

      const totalItems = this.selectedItemsEmitted.length

      Swal.fire({
        title: 'Deseja deletar estes registros?',
        text: "Você não será capaz de reverter isso!",
        icon: 'warning',
        html:
          'Você tem <b>' + totalItems + '</b> registros selecionados para deletar.<br>',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar!',
        confirmButtonColor: '#154EC1',
        cancelButtonColor: '#E42222',
        cancelButtonText: 'Não, cancelar!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Deletando!',
            text: 'Seus registros estão sendo deletados!',
            icon: 'info',
            showConfirmButton: false,
          })
          this.$emit('deletes', itemsDelete);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire({
            title: 'Cancelado',
            text: 'Seus registros ainda continuam existindo :)',
            icon: 'error',
            confirmButtonColor: '#154EC1',
          })
        }
      })
    },

    actionDelete(id) {
      Swal.fire({
        title: 'Deseja deletar este registro?',
        text: "Você não será capaz de reverter isso!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sim, deletar!',
        confirmButtonColor: '#154EC1',
        cancelButtonColor: '#E42222',
        cancelButtonText: 'Não, cancelar!',
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Deletando!',
            text: 'Seu registro esta sendo deletado!',
            icon: 'info',
            showConfirmButton: false,
          })
          this.$emit('delete', id);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          Swal.fire({
            title: 'Cancelado',
            text: 'Seu registro ainda continua existindo :)',
            icon: 'error',
            confirmButtonColor: '#154EC1',
          })
        }
      })
    },

    actionEdit(id) {
      this.$emit('edit', id);
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