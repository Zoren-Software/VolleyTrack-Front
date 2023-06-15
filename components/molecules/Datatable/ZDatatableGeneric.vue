<template>
  <div class="row justify-start mt-3">
    <div class="flex flex-col xs2">
      <div class="item">
        <ZDataTableActionButtons
          @add="actionAdd"
          @delete="actionDeletes"
          :selectedItemsEmitted="selectedItemsEmitted"
        />
      </div>
    </div>
    <div class="flex flex-col offset-xl7 xs2">
      <div class="item">
        <ZDataTableInputSearch
          v-model="search"
          @input="updateSearch"
        />
      </div>
    </div>
  </div>
  <ZFilter>
    
  </ZFilter>
  <ZDataTable
    :items="items"
    :columns="columns"
    :selectable="selectable"
    :loading="loading"
    :per-page="paginatorInfo.perPage"
    :includeActionsColumn="includeActionsColumn"
    @selectionChange="selectedItemsEmitted = $event.currentSelectedItems"
  >
    <template #cell(actions)="{rowKey:{id}}">
      <ZDataTableActions
        :id="id"
        @edit="actionEdit"
        @delete="actionDelete"
      />
    </template>
    <template #bodyAppend>
      <tr>
        <td colspan="12">
          <div class="flex justify-center mt-4 ml-4">
            <va-pagination
              v-model="currentPageActive"
              :pages="paginatorInfo.lastPage"
              :visible-pages="5"
              buttons-preset="secondary"
              rounded
              gapped
              class="mb-3"
            />
            <p>
              Itens de {{ paginatorInfo.firstItem }} a {{ paginatorInfo.lastItem }} de {{ paginatorInfo.total }}
            </p>
          </div>
        </td>
      </tr>
    </template>
    <template v-for="(_, slotName) in $slots" #[slotName]="scope">
      <slot :name="slotName" v-bind="scope"></slot>
    </template>
  </ZDataTable>
</template>

<script>

import { defineComponent } from "vue";
import ZDataTableActionButtons from '~/components/molecules/Datatable/ZDataTableActionButtons'
import ZDataTableActions from '~/components/molecules/Datatable/ZDataTableActions'
import ZDataTableInputSearch from '~/components/molecules/Datatable/ZDataTableInputSearch'
import ZDataTable from '~/components/molecules/Datatable/ZDataTable'
import ZInput from '~/components/atoms/Inputs/ZInput'
import ZIcon from '~/components/atoms/Icons/ZIcon'
import ZFilter from '~/components/molecules/Filters/ZFilter'
export default defineComponent({
  components: {
    ZDataTableActionButtons,
    ZDataTableActions,
    ZDataTableInputSearch,
    ZDataTable,
    ZInput,
    ZIcon,
    ZFilter
  },
  emits: [
    'add', 
    'edit', 
    'deletes', 
    'delete', 
    'update:modelValue', 
    'update:currentPageActive'
  ],
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
    loading: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    paginatorInfo: {
      type: Object,
    },
    modelValue: {
      type: [String, Number, Boolean, Object, Array, Date],
      default: null
    },
  },
  data() {
    return {
      search: this.modelValue,
      currentPageActive: this.paginatorInfo.currentPage,
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

    actionDeletes(itemsDelete) {
      this.$emit('deletes', itemsDelete);
    },

    actionDelete(id) {
      this.$emit('delete', id);
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
    },
    currentPageActive(newVal) {
      this.$emit('update:currentPageActive', newVal);
    }
  },
});
</script>