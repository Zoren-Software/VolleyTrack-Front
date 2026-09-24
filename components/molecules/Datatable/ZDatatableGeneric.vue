<template>
  <div
    v-if="
      buttonActionAdd || (buttonActionDelete && !bulkDeleteViaSelectionBadge)
    "
    class="row justify-start"
  >
    <div class="flex flex-col xs2">
      <div class="item">
        <ZDataTableActionButtons
          :buttonActionAdd="buttonActionAdd"
          :buttonActionDelete="
            buttonActionDelete && !bulkDeleteViaSelectionBadge
          "
          :selectedItemsEmitted="selectedItemsEmitted"
          :textButtonDelete="textButtonDelete"
          @add="actionAdd"
          @delete="actionDeletes"
        >
          <template #extra-actions-top>
            <slot name="extra-actions-top"></slot>
          </template>
        </ZDataTableActionButtons>
      </div>
    </div>
  </div>
  <ZFilter v-if="filter">
    <div class="row">
      <div v-if="optionSearch" class="flex flex-col md6 py-1">
        <div class="item">
          <ZDataTableInputSearch
            v-model="internalSearch"
            placeholder="Digite para pesquisar..."
            label="Pesquisar"
            @actionSearch="actionSearch"
          />
        </div>
      </div>
      <div class="flex flex-col md12 py-2">
        <div class="item mb-2">
          <slot name="filter"></slot>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="flex flex-col md6 py-1">
        <div class="item">
          <ZButton
            label="Filtrar"
            color="orange"
            class="mr-3"
            @click="actionSearch"
            >Filtrar</ZButton
          >
          <ZButton label="Limpar" color="info" class="mr-3" @click="actionClear"
            >Limpar</ZButton
          >
        </div>
      </div>
    </div>
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
    <template #cell(actions)="{ rowKey }">
      <ZDataTableActions
        v-if="!disableActionDelete"
        :id="Number(rowKey.id)"
        :includeActionEditList="includeActionEditList"
        :includeActionDeleteList="includeActionDeleteList"
        @edit="actionEdit"
        @delete="actionDelete(rowKey.id)"
      />
      <slot name="cell(actions)" :rowKey="rowKey" :id="rowKey.id"></slot>
    </template>
    <template #bodyAppend v-if="paginatorInfo && paginatorInfo.firstItem > 0">
      <tr class="pagination-row">
        <td
          :colspan="
            columns.length +
            (includeActionsColumn ? 1 : 0) +
            (selectable ? 1 : 0)
          "
          class="pagination-cell"
        >
          <div
            class="pagination-container"
            :class="{
              'pagination-container--with-selection':
                selectedItemsEmitted.length > 0,
            }"
          >
            <div
              v-if="selectedItemsEmitted.length > 0"
              class="pagination-info-section"
            >
              <button
                v-if="bulkDeleteViaSelectionBadge && buttonActionDelete"
                type="button"
                class="selected-badge selected-badge--clickable selected-badge--delete"
                :title="`Remove permanentemente ${selectedItemsEmitted.length} registro(s) da lista`"
                :aria-label="`Excluir ${selectedItemsEmitted.length} registro(s) selecionado(s)`"
                @click="onBulkDeleteFromSelectionBadge"
              >
                <va-icon name="close" size="small" class="badge-delete-icon" />
                <span class="badge-delete-text">
                  Excluir
                  <strong class="badge-delete-count">{{
                    selectedItemsEmitted.length
                  }}</strong>
                  {{
                    selectedItemsEmitted.length === 1
                      ? "selecionado"
                      : "selecionados"
                  }}
                </span>
              </button>
              <button
                v-if="bulkReadViaSelectionBadge"
                type="button"
                class="selected-badge selected-badge--clickable selected-badge--read"
                :title="`Marcar ${selectedItemsEmitted.length} notificação(ões) selecionada(s) como lidas`"
                :aria-label="`Ler todos os selecionados: ${selectedItemsEmitted.length}`"
                @click="onBulkReadFromSelectionBadge"
              >
                <va-icon name="check_circle" size="small" class="badge-read-icon" />
                <span class="badge-read-text">
                  Ler
                  <strong class="badge-read-count">{{
                    selectedItemsEmitted.length
                  }}</strong>
                  {{
                    selectedItemsEmitted.length === 1
                      ? "selecionado"
                      : "selecionados"
                  }}
                </span>
              </button>
              <div
                v-if="!selectionShowsBulkActions"
                class="selected-badge"
                role="status"
                :aria-label="`${selectedItemsEmitted.length} itens selecionados`"
              >
                <va-icon name="check_circle" size="small" />
                <span class="badge-number">{{
                  selectedItemsEmitted.length
                }}</span>
              </div>
            </div>
            <div class="pagination-controls">
              <va-pagination
                v-model="currentPageActive"
                :pages="paginatorInfo.lastPage"
                :visible-pages="5"
                buttons-preset="secondary"
                size="small"
                :rounded="false"
                gapped
              />
            </div>
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
import ZDataTableActionButtons from "~/components/molecules/Datatable/ZDataTableActionButtons";
import ZDataTableActions from "~/components/molecules/Datatable/ZDataTableActions";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
import ZDataTable from "~/components/molecules/Datatable/ZDataTable";
import ZFilter from "~/components/molecules/Filters/ZFilter";
import ZButton from "~/components/atoms/Buttons/ZButton";
import {
  confirmDeleteMultiple,
  confirmReadMultiple,
  notifyInfo,
} from "~/utils/sweetAlert2/swalHelper";

export default defineComponent({
  components: {
    ZDataTableActionButtons,
    ZDataTableActions,
    ZDataTableInputSearch,
    ZDataTable,
    ZFilter,
    ZButton,
  },
  emits: [
    "add",
    "edit",
    "deletes",
    "delete",
    "reads",
    "search",
    "actionSearch",
    "actionClear",
    "update:currentPageActive",
    "update:search",
    "selectionChange",
  ],
  props: {
    textAdvancedFilters: {
      type: Boolean,
      default: false,
    },
    items: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    includeActionsColumn: {
      type: Boolean,
      default: false,
    },
    includeActionEditList: {
      type: Boolean,
      default: false,
    },
    includeActionDeleteList: {
      type: Boolean,
      default: false,
    },
    buttonActionAdd: {
      type: Boolean,
      default: false,
    },
    buttonActionDelete: {
      type: Boolean,
      default: false,
    },
    /** Esconde o botão superior de exclusão em massa e usa o badge de seleção (rodapé) para confirmar e excluir. */
    bulkDeleteViaSelectionBadge: {
      type: Boolean,
      default: false,
    },
    /** Badge no rodapé para marcar como lidos os registros selecionados (ex.: notificações). */
    bulkReadViaSelectionBadge: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    paginatorInfo: {
      type: Object,
    },
    filter: {
      type: Boolean,
      default: false,
    },
    textButtonDelete: {
      type: String,
      default: "Deletar",
    },
    optionSearch: {
      type: Boolean,
      default: true,
    },
    disableActionDelete: {
      type: Boolean,
      default: false,
    },
    search: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      currentPageActive: this.paginatorInfo?.currentPage || 1,
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
      localSearchValue: this.search || "",
    };
  },

  methods: {
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item
      );
    },

    actionAdd() {
      this.$emit("add");
    },

    actionDeletes(itemsDelete) {
      this.$emit("deletes", itemsDelete);
    },

    onBulkDeleteFromSelectionBadge() {
      if (!this.bulkDeleteViaSelectionBadge || !this.buttonActionDelete) {
        return;
      }
      const selected = this.selectedItemsEmitted;
      if (!selected.length) {
        return;
      }
      const itemsDelete = selected.map((item) => item.id);
      const totalItems = selected.length;
      confirmDeleteMultiple(
        totalItems,
        () => {
          this.actionDeletes(itemsDelete);
        },
        () => {},
      );
    },

    onBulkReadFromSelectionBadge() {
      if (!this.bulkReadViaSelectionBadge) {
        return;
      }
      const selected = this.selectedItemsEmitted;
      if (!selected.length) {
        return;
      }
      const unreadIds = selected
        .filter((item) => !item.readAt)
        .map((item) => item.id);
      if (!unreadIds.length) {
        notifyInfo(
          "Nada para marcar",
          "As notificações selecionadas já estão lidas.",
        );
        return;
      }
      confirmReadMultiple(
        unreadIds.length,
        () => {
          this.$emit("reads", unreadIds);
        },
        () => {},
      );
    },

    actionDelete(id) {
      this.$emit("delete", id);
    },

    actionEdit(id) {
      this.$emit("edit", id);
    },

    actionSearch() {
      // Usar o valor do computed que está sempre sincronizado
      const searchValue = this.internalSearch || "";
      // Primeiro atualizar o search no componente pai
      this.$emit("search", searchValue);
      // Depois emitir o actionSearch para executar a busca com o valor
      this.$emit("actionSearch", searchValue);
    },

    actionClear() {
      // Limpar o campo de busca visualmente
      this.localSearchValue = "";
      // Emitir eventos para limpar filtros
      this.$emit("update:search", "");
      this.$emit("actionClear", true);
    },

    updateSearch(value) {
      this.$emit("search", value);
    },
  },

  computed: {
    selectionShowsBulkActions() {
      const deleteBulk =
        this.bulkDeleteViaSelectionBadge && this.buttonActionDelete;
      return Boolean(deleteBulk || this.bulkReadViaSelectionBadge);
    },
    computedItems() {
      if (this.search) {
        return this.items.filter((item) =>
          Object.values(item).some((value) =>
            String(value).toLowerCase().includes(this.search.toLowerCase())
          )
        );
      } else {
        return this.items;
      }
    },
    internalSearch: {
      get() {
        return this.localSearchValue;
      },
      set(value) {
        this.localSearchValue = value;
        this.$emit("update:search", value);
      },
    },
  },
  watch: {
    search(newVal) {
      // Sincronizar o valor local quando o prop mudar externamente
      this.localSearchValue = newVal || "";
      this.$emit("search", newVal);
    },
    currentPageActive(newVal) {
      this.$emit("update:currentPageActive", newVal);
    },
  },
});
</script>

<style scoped>
.pagination-row {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.pagination-row:hover {
  background: transparent !important;
  transform: none !important;
}

.pagination-cell {
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  border-top: 1px solid #e9ecef;
  margin-top: 0;
  gap: 20px;
  flex-wrap: wrap;
  min-height: 64px;
}

.pagination-container--with-selection {
  justify-content: space-between;
}

.pagination-info-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.selected-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FF4E1B 0%, #ff6b35 100%);
  color: white;
  padding: 10px 18px;
  border-radius: 24px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.3);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.selected-badge--clickable {
  cursor: pointer;
  border: none;
  font: inherit;
  appearance: none;
  -webkit-appearance: none;
}

.selected-badge--clickable:focus-visible {
  outline: 2px solid #0b1e3a;
  outline-offset: 2px;
}

.selected-badge--clickable:hover {
  box-shadow: 0 4px 12px rgba(255, 78, 27, 0.45);
  transform: translateY(-1px);
}

.selected-badge--clickable:active {
  transform: translateY(0);
}

.selected-badge.selected-badge--delete {
  background: #dc2626;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.35);
  border-radius: 8px;
  padding: 8px 14px;
  gap: 10px;
  white-space: nowrap;
}

.selected-badge.selected-badge--delete.selected-badge--clickable:hover {
  background: #b91c1c;
  box-shadow: 0 4px 14px rgba(220, 38, 38, 0.55);
}

.selected-badge.selected-badge--delete::before {
  display: none;
}

.selected-badge--delete .badge-delete-icon {
  font-size: 20px !important;
  opacity: 0.95;
}

.selected-badge--delete .badge-delete-text {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.selected-badge--delete .badge-delete-count {
  font-weight: 800;
  margin: 0 0.2em;
}

.selected-badge.selected-badge--read {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  box-shadow: 0 2px 8px rgba(22, 163, 74, 0.35);
  border-radius: 8px;
  padding: 8px 14px;
  gap: 10px;
  white-space: nowrap;
}

.selected-badge.selected-badge--read.selected-badge--clickable:hover {
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  box-shadow: 0 4px 14px rgba(22, 163, 74, 0.45);
}

.selected-badge.selected-badge--read::before {
  display: none;
}

.selected-badge--read .badge-read-icon {
  font-size: 20px !important;
  opacity: 0.95;
}

.selected-badge--read .badge-read-text {
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.selected-badge--read .badge-read-count {
  font-weight: 800;
  margin: 0 0.2em;
}

.selected-badge::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: left 0.5s;
}

.selected-badge:hover::before {
  left: 100%;
}

.selected-badge:hover {
  box-shadow: 0 4px 12px rgba(255, 78, 27, 0.4);
  transform: translateY(-2px);
}

.selected-badge .va-icon {
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

.badge-number {
  font-size: 15px;
  font-weight: 700;
  min-width: 22px;
  text-align: center;
  letter-spacing: 0.5px;
}

.pagination-controls {
  display: flex;
  align-items: center;
}

.pagination-controls :deep(.va-pagination) {
  margin: 0;
}

.pagination-controls :deep(.va-pagination__item) {
  transition: all 0.2s ease;
}

.pagination-controls :deep(.va-pagination__item:hover) {
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
  }

  .pagination-container--with-selection {
    align-items: stretch;
  }

  .pagination-info-section {
    width: 100%;
    justify-content: flex-start;
  }

  .pagination-controls {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
