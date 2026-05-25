<template>
  <div class="trainings-listing">
    <!-- Filter Card -->
    <va-card class="filter-card">
      <div class="filter-content">
        <div class="search-section">
          <label class="filter-label">Buscar</label>
          <ZDataTableInputSearch
            v-model="internalSearchValue"
            placeholder="Nome do treino..."
            @actionSearch="handleSearch"
          />
        </div>
        <div class="filters-section">
          <div class="filter-item">
            <label class="filter-label">Status</label>
            <VaSelect
              v-model="variablesGetTrainings.filter.status"
              :options="statusOptions"
              text-by="label"
              value-by="value"
              label=""
              style="width: 100%"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Origem</label>
            <VaSelect
              v-model="variablesGetTrainings.filter.importScope"
              :options="importScopeOptions"
              text-by="label"
              value-by="value"
              label=""
              style="width: 100%"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Time</label>
            <ZSelectTeam
              label=""
              multiple
              v-model="variablesGetTrainings.filter.teamsIds"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Jogador</label>
            <ZSelectUser
              label=""
              v-model="variablesGetTrainings.filter.playersIds"
            />
          </div>
        </div>
        <div class="filter-actions">
          <va-button
            class="search-button"
            :class="{ 'search-button--active': hasSearchFilterCriteria }"
            @click="handleSearch"
          >
            <va-icon name="search" class="button-icon" />
            <span class="button-text">Pesquisar</span>
          </va-button>
        </div>
      </div>

      <!-- Filtros Avançados -->
      <div class="advanced-filters">
        <va-button
          preset="plain"
          class="advanced-filters-toggle"
          @click="showAdvancedFilters = !showAdvancedFilters"
        >
          <va-icon
            :name="showAdvancedFilters ? 'expand_less' : 'expand_more'"
            size="small"
          />
          <span>Filtros Avançados</span>
        </va-button>

        <div v-if="showAdvancedFilters" class="advanced-filters-content">
          <div class="filter-item">
            <label class="filter-label">Data Início</label>
            <VaDateInput
              v-model="variablesGetTrainings.filter.dateStart"
              name="dateStart"
              label=""
              id="date-training-start"
              style="width: 100%"
            />
          </div>
          <div class="filter-item">
            <label class="filter-label">Data Fim</label>
            <VaDateInput
              v-model="variablesGetTrainings.filter.dateEnd"
              name="dateEnd"
              label=""
              id="date-training-end"
              style="width: 100%"
            />
          </div>
        </div>
      </div>
    </va-card>

    <!-- DataTable -->
    <ZDatatableGeneric
      :buttonActionAdd="false"
      buttonActionDelete
      bulk-delete-via-selection-badge
      includeActionsColumn
      disable-action-delete
      includeActionEditList
      includeActionDeleteList
      selectable
      :items="items"
      :columns="columns"
      :loading="loading"
      :paginatorInfo="paginatorInfo"
      :filter="false"
      @search="searchTrainings"
      @actionSearch="handleSearch"
      @actionClear="clearSearch"
      @update:search="searchTrainings"
      @add="addTraining"
      @edit="editTraining"
      @delete="deleteTraining"
      @deletes="deleteTrainings"
      @update:currentPageActive="updateCurrentPageActive"
      @selectionChange="handleSelectionChange"
    >
      <template #extra-modals>
        <VaModal
          v-model="showTeamsListModal"
          :title="teamsListModalTitle"
          size="small"
          close-button
          hide-default-actions
          class="training-teams-list-modal"
        >
          <div class="training-teams-list">
            <div
              v-for="(team, index) in teamsModalList"
              :key="team?.id || index"
              class="training-teams-list-item"
            >
              <div class="training-teams-list-name">{{ team?.name || "-" }}</div>
              <div
                v-if="team?.teamCategory || team?.teamLevel"
                class="training-teams-list-meta"
              >
                <span v-if="team?.teamCategory" class="training-teams-list-cat">{{
                  team.teamCategory.name
                }}</span>
                <span
                  v-if="team?.teamCategory && team?.teamLevel"
                  class="training-teams-list-sep"
                  >·</span
                >
                <span v-if="team?.teamLevel" class="training-teams-list-level">{{
                  team.teamLevel.name
                }}</span>
              </div>
            </div>
          </div>
        </VaModal>
      </template>
      <template #extra-actions-top>
        <va-button
          v-if="hasBulkCreatedSelected"
          color="#DC2626"
          class="bulk-delete-button"
          @click="deleteBulkCreatedTrainings"
        >
          <va-icon name="delete" class="button-icon" />
          <span class="button-text"
            >Deletar Treinos em Massa Selecionados ({{
              selectedBulkTrainings.length
            }})</span
          >
        </va-button>
      </template>
      <!-- CELL -->
      <template
        #cell(name)="{
          rowKey: {
            id,
            name,
            importedAt,
            dateStart,
            dateEnd,
            confirmationTrainingMetrics,
          },
        }"
      >
        <ZTraining
          :data="{ id, name, importedAt, dateStart, dateEnd }"
          :metrics="confirmationTrainingMetrics"
        />
      </template>
      <template #cell(team)="{ rowKey: { team } }">
        <div class="teams-cell">
          <template v-if="team">
            <button
              type="button"
              class="teams-count-chip"
              title="Ver times relacionados"
              @click="openTeamsListModal(team)"
            >
              <va-icon name="groups" size="14px" color="#FF4E1B" />
              <span class="teams-count-chip-text">1 time</span>
            </button>
          </template>
          <span v-else class="no-data-text">-</span>
        </div>
      </template>
      <template #cell(status)="{ rowKey }">
        <div class="status-cell">
          <span
            class="training-status-badge"
            :class="trainingRowStatusClass(rowKey)"
          >
            {{ trainingRowStatusLabel(rowKey) }}
          </span>
        </div>
      </template>
      <template #cell(presence)="{ rowKey: { dateStart, confirmationTrainingMetrics } }">
        <div class="presence-cell">
          <template v-if="isPastTrainingDate(dateStart)">
            <div class="presence-lines">
              <div class="presence-line">
                <va-icon name="check_circle" size="16px" color="#16a34a" />
                <span class="presence-text">
                  {{ Number(confirmationTrainingMetrics?.presence || 0) }}
                  presentes
                </span>
              </div>
              <div class="presence-line">
                <va-icon name="cancel" size="16px" color="#dc2626" />
                <span class="presence-text">
                  {{ Number(confirmationTrainingMetrics?.absence || 0) }}
                  ausentes
                </span>
              </div>
            </div>
          </template>
          <span v-else class="no-data-text">-</span>
        </div>
      </template>
      <template #cell(actions)="{ rowKey }">
        <div class="actions-cell">
          <ZDataTableActions
            :id="Number(rowKey.id)"
            :includeActionDetailsList="true"
            :includeActionAttendanceList="true"
            :includeActionTechnicalAnalysis="true"
            :includeActionEditList="true"
            :includeActionDeleteList="true"
            :includeActionFinalize="trainingRowShowsFinalize(rowKey)"
            :includeActionCancelTraining="trainingRowShowsCancelTraining(rowKey)"
            :includeActionReactivate="trainingRowShowsReactivate(rowKey)"
            @details="goToDetails"
            @attendanceList="goToAttendanceList"
            @technicalAnalysis="goToTechnicalAnalysis"
            @edit="editTraining"
            @delete="deleteTraining"
            @finalize="confirmFinalizeTraining"
            @cancelTraining="confirmCancelTraining"
            @reactivate="confirmReactivateTraining"
          />
          <va-button
            v-if="rowKey.isBulkCreated"
            icon="delete_sweep"
            color="#DC2626"
            size="small"
            class="action-btn action-btn-bulk-delete"
            @click="deleteBulkCreatedTraining(rowKey.id)"
            title="Deletar treino criado em massa"
          />
        </div>
      </template>
    </ZDatatableGeneric>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import moment from "moment";
import TRAININGS from "~/graphql/training/query/trainings.graphql";
import ZDatatableGeneric from "~/components/molecules/Datatable/ZDatatableGeneric";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import ZDataTableInputSearch from "~/components/molecules/Datatable/ZDataTableInputSearch";
import ZDataTableActions from "~/components/molecules/Datatable/ZDataTableActions.vue";
import ZDateTraining from "~/components/molecules/Datatable/Slots/ZDateTraining";
import ZTeam from "~/components/molecules/Datatable/Slots/ZTeam";
import ZTraining from "~/components/molecules/Datatable/Slots/ZTraining";
import TRAINING from "~/graphql/training/query/training.graphql";
import TRAININGEDIT from "~/graphql/training/mutation/trainingEdit.graphql";
import TRAININGDELETE from "~/graphql/training/mutation/trainingDelete.graphql";
import TRAININGBULKDELETE from "~/graphql/training/mutation/trainingBulkDelete.graphql";
import TRAININGBULKDELETECOUNT from "~/graphql/training/query/trainingBulkDeleteCount.graphql";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import Swal from "sweetalert2";

//import { toRaw } from "vue"; // NOTE - Para debug

export default defineComponent({
  components: {
    ZDatatableGeneric,
    ZDataTableActions,
    ZDateTraining,
    ZTeam,
    ZSelectPosition,
    ZSelectTeam,
    ZSelectUser,
    ZDataTableInputSearch,
    ZTraining,
  },

  created() {
    this.getTrainings();
  },

  data() {
    let loading = false;

    const columns = [
      { key: "name", name: "name", label: "Treino", sortable: true },
      { key: "team", name: "team", label: "TIMES", sortable: false },
      { key: "status", name: "status", label: "STATUS", sortable: false },
      {
        key: "presence",
        name: "presence",
        label: "PRESENÇAS",
        sortable: false,
      },
    ];

    return {
      items: [],
      loading,
      columns,
      paginatorInfo: {
        currentPage: 1,
        lastPage: 1,
        total: 0,
      },
      variablesGetTrainings: {
        page: 1,
        first: 50,
        filter: {
          status: null,
          importScope: "TENANT_ONLY",
          teamsIds: [],
          playersIds: [],
          search: "%%",
          dateStart: null,
          dateEnd: null,
        },
        orderBy: "id",
        sortedBy: "desc",
      },
      statusOptions: [
        { label: "Agendado", value: "PENDING" },
        { label: "Finalizado", value: "FINISHED" },
        { label: "Cancelado", value: "CANCELLED" },
      ],
      importScopeOptions: [
        { label: "Do clube", value: "TENANT_ONLY" },
        { label: "Importados (LGPD)", value: "IMPORTED_ONLY" },
        { label: "Todos", value: "ALL" },
      ],
      selectedItems: [],
      selectedItemsEmitted: [],
      selectMode: "multiple",
      selectedColor: "primary",
      selectModeOptions: ["single", "multiple"],
      selectColorOptions: ["primary", "danger", "warning", "#EF467F"],
      internalSearchValue: "",
      showAdvancedFilters: false,
      showTeamsListModal: false,
      teamsModalList: [],
    };
  },

  computed: {
    teamsListModalTitle() {
      const count = (this.teamsModalList || []).length;
      return `Times relacionados (${count})`;
    },
    selectedBulkTrainings() {
      // Filtrar apenas treinos criados em massa que estão selecionados
      // Verificar tanto isBulkCreated === true quanto isBulkCreated === 1 (caso venha como número do banco)
      return this.selectedItemsEmitted.filter((item) => {
        return (
          item.isBulkCreated === true ||
          item.isBulkCreated === 1 ||
          item.isBulkCreated === "1"
        );
      });
    },
    hasBulkCreatedSelected() {
      return this.selectedBulkTrainings.length > 0;
    },
    hasSearchFilterCriteria() {
      const f = this.variablesGetTrainings.filter;
      if ((this.internalSearchValue || "").trim().length > 0) {
        return true;
      }
      if (Array.isArray(f.teamsIds) && f.teamsIds.length > 0) {
        return true;
      }
      if (Array.isArray(f.playersIds) && f.playersIds.length > 0) {
        return true;
      }
      if (f.dateStart) {
        return true;
      }
      if (f.dateEnd) {
        return true;
      }
      if (f.importScope && f.importScope !== "TENANT_ONLY") {
        return true;
      }
      return false;
    },
  },

  watch: {
    // Observar mudanças no status e executar busca automaticamente
    "variablesGetTrainings.filter.status"(newStatus, oldStatus) {
      // Evitar busca na inicialização (quando oldStatus é undefined)
      if (oldStatus !== undefined && newStatus !== oldStatus) {
        // Resetar para primeira página quando mudar o filtro
        this.variablesGetTrainings.page = 1;
        // Executar busca automaticamente
        this.getTrainings({ fetchPolicy: "network-only" });
      }
    },
    "variablesGetTrainings.filter.importScope"(newScope, oldScope) {
      if (oldScope !== undefined && newScope !== oldScope) {
        this.variablesGetTrainings.page = 1;
        this.getTrainings({ fetchPolicy: "network-only" });
      }
    },
  },

  methods: {
    trainingRowStatusUpper(row) {
      const raw = String(row?.status ?? "").trim();
      if (!raw) return "PENDING";
      return raw.toUpperCase();
    },
    trainingRowShowsFinalize(row) {
      const u = this.trainingRowStatusUpper(row);
      return u === "PENDING" || u === "PENDING_ACTION";
    },
    trainingRowShowsCancelTraining(row) {
      const u = this.trainingRowStatusUpper(row);
      return (
        u === "PENDING" ||
        u === "PENDING_ACTION" ||
        u === "FINISHED"
      );
    },
    trainingRowShowsReactivate(row) {
      return this.trainingRowStatusUpper(row) === "CANCELLED";
    },
    buildTrainingEditPayload(training, statusGraphQL) {
      const dateStart = moment(training.dateStart).format("YYYY-MM-DD HH:mm:ss");
      const dateEnd = moment(training.dateEnd).format("YYYY-MM-DD HH:mm:ss");
      const playerIds = (training.confirmationsTraining || [])
        .filter((c) => !c.teamId && c.playerId != null)
        .map((c) => parseInt(c.playerId, 10))
        .filter((n) => !Number.isNaN(n));
      return {
        id: parseInt(training.id, 10),
        name: training.name,
        description: training.description || null,
        status: statusGraphQL,
        teamId:
          training.teamId != null ? parseInt(training.teamId, 10) : null,
        fundamentalId: (training.fundamentals || [])
          .map((f) => parseInt(f.id, 10))
          .filter((n) => !Number.isNaN(n)),
        specificFundamentalId: (training.specificFundamentals || [])
          .map((f) => parseInt(f.id, 10))
          .filter((n) => !Number.isNaN(n)),
        playerIds,
        dateStart,
        dateEnd,
      };
    },
    async fetchTrainingById(id) {
      const nuxtApp = useNuxtApp();
      const apolloClient = nuxtApp._apolloClients?.default;
      if (!apolloClient) {
        confirmError("Cliente GraphQL indisponível.");
        return null;
      }
      const query = gql`
        ${TRAINING}
      `;
      const { data } = await apolloClient.query({
        query,
        variables: { id: String(id) },
        fetchPolicy: "network-only",
      });
      return data?.training || null;
    },
    async runTrainingStatusChange(id, statusGraphQL, successMessage) {
      try {
        this.loading = true;
        const training = await this.fetchTrainingById(id);
        if (!training) {
          confirmError("Treino não encontrado.");
          return;
        }
        const variables = this.buildTrainingEditPayload(training, statusGraphQL);
        const mutation = gql`
          ${TRAININGEDIT}
        `;
        const { mutate } = await useMutation(mutation, { variables });
        const { data, errors } = await mutate();
        if (errors?.length) {
          confirmError(errors[0]?.message || "Não foi possível atualizar o treino.");
          return;
        }
        if (data?.trainingEdit) {
          confirmSuccess(successMessage, () => {
            this.getTrainings({ fetchPolicy: "network-only" });
          });
        }
      } catch (error) {
        console.error(error);
        const msg =
          error?.graphQLErrors?.[0]?.message ||
          "Não foi possível atualizar o treino.";
        confirmError(msg);
      } finally {
        this.loading = false;
      }
    },
    confirmFinalizeTraining(id) {
      Swal.fire({
        title: "Finalizar treino?",
        text: "O treino será marcado como finalizado.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Finalizar",
        cancelButtonText: "Voltar",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.runTrainingStatusChange(
            id,
            "FINISHED",
            "Treino finalizado com sucesso!"
          );
        }
      });
    },
    confirmCancelTraining(id) {
      Swal.fire({
        title: "Cancelar treino?",
        text: "O treino será marcado como cancelado.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Cancelar treino",
        cancelButtonText: "Voltar",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.runTrainingStatusChange(
            id,
            "CANCELLED",
            "Treino cancelado com sucesso!"
          );
        }
      });
    },
    confirmReactivateTraining(id) {
      Swal.fire({
        title: "Reativar treino?",
        text: "O treino voltará para o status agendado.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Reativar",
        cancelButtonText: "Voltar",
        confirmButtonColor: "#FF4E1B",
        cancelButtonColor: "#6b7280",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.runTrainingStatusChange(
            id,
            "PENDING",
            "Treino reativado com sucesso!"
          );
        }
      });
    },
    trainingRowStatusKey(row) {
      const raw = String(row?.displayStatus || row?.status || "")
        .toLowerCase()
        .trim();
      if (!raw) return "pending";
      return raw;
    },
    trainingRowStatusLabel(row) {
      const key = this.trainingRowStatusKey(row);
      const map = {
        pending: "Agendado",
        pending_action: "Pendente ação",
        finished: "Finalizado",
        cancelled: "Cancelado",
      };
      return (
        map[key] || row?.displayStatus || row?.status || "Agendado"
      );
    },
    trainingRowStatusClass(row) {
      const key = this.trainingRowStatusKey(row);
      return {
        "status-pending": key === "pending",
        "status-pending-action": key === "pending_action",
        "status-finished": key === "finished",
        "status-cancelled": key === "cancelled",
      };
    },
    isPastTrainingDate(dateStart) {
      if (!dateStart) return false;
      return new Date(dateStart) <= new Date();
    },
    goToDetails(id) {
      this.$router.push(`/trainings/details/${id}`);
    },
    goToAttendanceList(id) {
      this.$router.push(`/trainings/attendance/${id}`);
    },
    goToTechnicalAnalysis(id) {
      this.$router.push({
        path: "/scout",
        query: { trainingId: String(id) },
      });
    },
    normalizeTeams(teamOrTeams) {
      if (!teamOrTeams) return [];
      if (Array.isArray(teamOrTeams)) return teamOrTeams.filter(Boolean);
      return [teamOrTeams].filter(Boolean);
    },
    openTeamsListModal(teamOrTeams) {
      this.teamsModalList = this.normalizeTeams(teamOrTeams);
      this.showTeamsListModal = true;
    },
    handleSelectionChange(selectedItems) {
      this.selectedItemsEmitted = selectedItems.currentSelectedItems || [];
    },
    async deleteBulkCreatedTrainings() {
      if (this.selectedBulkTrainings.length === 0) {
        confirmError("Nenhum treino criado em massa selecionado");
        return;
      }

      const ids = this.selectedBulkTrainings.map((training) => training.id);
      await this.deleteItems(ids);
      this.selectedItemsEmitted = []; // Limpar seleção após deletar
    },
    async deleteBulkCreatedTraining(id) {
      // Encontrar o treino para obter informações
      const training = this.items.find((item) => item.id === id);

      if (!training) {
        confirmError("Treino não encontrado");
        return;
      }

      // Formatar a data do treino para exibir na confirmação
      const trainingDate = moment(training.dateStart).format("DD/MM/YYYY");
      const trainingTime = moment(training.dateStart).format("HH:mm");

      try {
        // Buscar a contagem exata de treinos que serão deletados
        this.loading = true;

        const countQuery = gql`
          ${TRAININGBULKDELETECOUNT}
        `;

        const { onResult } = useQuery(countQuery, {
          trainingId: String(id),
        });

        await new Promise((resolve) => {
          onResult((result) => {
            const countToDelete = result?.data?.trainingBulkDeleteCount || 0;
            this.loading = false;

            // Mostrar confirmação antes de deletar com informações sobre a data e quantidade
            this.showBulkDeleteConfirmation(
              trainingDate,
              trainingTime,
              countToDelete,
              async () => {
                try {
                  this.loading = true;

                  const query = gql`
                    ${TRAININGBULKDELETE}
                  `;

                  const variables = {
                    trainingId: String(id),
                  };

                  const { mutate } = await useMutation(query, { variables });
                  const { data } = await mutate();

                  const deletedCount = data?.trainingBulkDelete || 0;

                  confirmSuccess(
                    `${deletedCount} treino(s) deletado(s) com sucesso!`,
                    () => {
                      this.getTrainings({ fetchPolicy: "network-only" });
                    },
                  );
                } catch (error) {
                  console.error(error);
                  this.loading = false;

                  if (
                    error.graphQLErrors &&
                    error.graphQLErrors[0] &&
                    error.graphQLErrors[0].extensions &&
                    error.graphQLErrors[0].extensions.validation
                  ) {
                    const errorMessages = Object.values(
                      error.graphQLErrors[0].extensions.validation,
                    )
                      .flat()
                      .filter((msg) => msg);

                    confirmError(
                      "Erro ao deletar treinos em massa!",
                      errorMessages,
                    );
                  } else {
                    const errorMessage =
                      error.graphQLErrors?.[0]?.message ||
                      "Erro ao deletar treinos em massa!";
                    confirmError(errorMessage);
                  }
                } finally {
                  this.loading = false;
                }
              },
            );
            resolve();
          });
        });
      } catch (error) {
        console.error(error);
        this.loading = false;
        confirmError("Erro ao buscar contagem de treinos a serem deletados!");
      }
    },
    showBulkDeleteConfirmation(date, time, count, onConfirm) {
      Swal.fire({
        title: "Deletar Treinos em Massa?",
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;">
              <strong>Atenção!</strong> Esta ação irá deletar todos os treinos criados em massa a partir da data selecionada.
            </p>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                <strong>Data base:</strong> ${date} às ${time}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 14px; color: #6b7280;">
                Todos os treinos criados em massa com data igual ou posterior a esta data serão deletados.
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #dc2626; font-weight: 600;">
                <strong>Total de treinos que serão deletados: ${count}</strong>
              </p>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #dc2626;">
              <strong>Esta ação não pode ser desfeita!</strong>
            </p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, deletar!",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          onConfirm();
        }
      });
    },
    unselectItem(item) {
      this.selectedItems = this.selectedItems.filter(
        (selectedItem) => selectedItem !== item,
      );
    },
    addTraining() {
      this.$router.push("/trainings/create");
    },
    editTraining(id) {
      this.$router.push(`/trainings/edit/${id}`);
    },
    async deleteItems(ids) {
      try {
        this.loading = true;

        const query = gql`
          ${TRAININGDELETE}
        `;

        const variables = {
          id: ids,
        };

        const { mutate } = await useMutation(query, { variables });

        const { data } = await mutate();

        confirmSuccess("Treino(s) deletado(s) com sucesso!", () => {
          this.items = this.items.filter((item) => !ids.includes(item.id));
        });

        this.getTrainings({ fetchPolicy: "network-only" });
      } catch (error) {
        console.error(error);
        this.error = true;

        if (
          error.graphQLErrors &&
          error.graphQLErrors[0] &&
          error.graphQLErrors[0].extensions &&
          error.graphQLErrors[0].extensions.validation
        ) {
          this.errors = error.graphQLErrors[0].extensions.validation;

          const errorMessages = Object.values(this.errors).map((item) => {
            return item;
          });

          this.errorFields = Object.keys(this.errors);

          confirmError("Ocorreu um erro ao deletar o treino!", errorMessages);
        } else {
          confirmError("Ocorreu um erro ao deletar o treino!");
        }
      }
      this.loading = false;
    },

    formatTrainingDate(dateStart) {
      return moment(dateStart);
    },

    async deleteTraining(id) {
      await this.deleteItems([id]);
    },

    async deleteTrainings(items) {
      await this.deleteItems(items);
    },

    updateCurrentPageActive(page) {
      this.variablesGetTrainings.page = page;
      this.getTrainings();
    },

    searchTrainings(search) {
      // Se search for vazio ou undefined, usar %%
      if (!search || search === "") {
        this.variablesGetTrainings.filter.search = "%%";
      } else {
        this.variablesGetTrainings.filter.search = `%${search}%`;
      }
    },

    handleSearch() {
      // Atualizar o filtro de busca com o valor do campo de busca
      if (
        this.internalSearchValue !== undefined &&
        this.internalSearchValue !== null
      ) {
        this.searchTrainings(this.internalSearchValue);
      }
      // Executar a busca com os filtros atualizados
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    clearSearch() {
      this.internalSearchValue = "";
      this.variablesGetTrainings.filter = {
        status: null,
        importScope: "TENANT_ONLY",
        teamsIds: [],
        playersIds: [],
        search: "%%",
        dateStart: null,
        dateEnd: null,
      };
      this.showAdvancedFilters = false;
      // Recarregar dados após limpar filtros
      this.getTrainings({ fetchPolicy: "network-only" });
    },

    getTrainings(fetchPolicyOptions = {}) {
      this.loading = true;

      const query = gql`
        ${TRAININGS}
      `;

      let teamsIdsValues =
        this.variablesGetTrainings.filter.teamsIds?.map((team) =>
          parseInt(team?.value || team),
        ) || [];

      let playersIdsValues =
        this.variablesGetTrainings.filter.playersIds?.map((player) =>
          parseInt(player?.value || player),
        ) || [];

      let dateEnd = this.variablesGetTrainings.filter.dateEnd;

      if (dateEnd) {
        dateEnd = moment(dateEnd).format("YYYY-MM-DD 23:59:59");
      }

      let dateStart = this.variablesGetTrainings.filter.dateStart;

      if (dateStart) {
        dateStart = moment(dateStart).format("YYYY-MM-DD 00:00:00");
      }

      const filterData = {
        ...this.variablesGetTrainings.filter,
        teamsIds: teamsIdsValues,
        playersIds: playersIdsValues,
      };

      if (dateStart) {
        filterData.dateStart = dateStart;
      } else {
        delete filterData.dateStart;
      }

      if (dateEnd) {
        filterData.dateEnd = dateEnd;
      } else {
        delete filterData.dateEnd;
      }

      // Adicionar status apenas se não for null (todos)
      if (
        this.variablesGetTrainings.filter.status &&
        this.variablesGetTrainings.filter.status !== null
      ) {
        filterData.status = this.variablesGetTrainings.filter.status;
      } else {
        delete filterData.status;
      }

      const consult = {
        ...this.variablesGetTrainings,
        first: this.variablesGetTrainings.first ?? 50,
        filter: filterData,
      };

      const nuxtApp = useNuxtApp();
      const apolloClient = nuxtApp._apolloClients?.default;
      if (!apolloClient) {
        this.loading = false;
        confirmError("Cliente GraphQL indisponível.");
        return;
      }

      apolloClient
        .query({
          query,
          variables: consult,
          fetchPolicy: fetchPolicyOptions.fetchPolicy || "network-only",
        })
        .then((result) => {
          this.loading = false;
          if (result?.data?.trainings) {
            this.paginatorInfo =
              result.data.trainings.paginatorInfo || this.paginatorInfo;
            this.items = result.data.trainings.data || [];
          } else {
            this.items = [];
          }
          if (result?.errors?.length) {
            console.error("[trainings]", result.errors);
            confirmError(
              "Não foi possível carregar os treinos.",
              result.errors.map((e) => e.message).join("<br>") || ""
            );
          }
        })
        .catch((err) => {
          this.loading = false;
          console.error("[trainings] query error", err);
          confirmError("Não foi possível carregar os treinos.");
        });
    },
  },
});
</script>

<style scoped>
.trainings-listing {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-content {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  flex-wrap: wrap;
  justify-content: space-between;
}

.search-section {
  flex: 1;
  min-width: 300px;
}

.filters-section {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-item {
  min-width: 200px;
}

.filter-item :deep(.va-input-wrapper) {
  margin-bottom: 0;
}

.filter-item :deep(.va-select) {
  margin-top: 0;
}

.filter-item :deep(.va-input-wrapper__field) {
  margin-top: 0;
}

.filter-item :deep(.va-input-wrapper__label) {
  display: none;
}

.filter-item :deep(.va-date-input-wrapper__label) {
  display: none;
}

.filter-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0b1e3a;
  margin-bottom: 8px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  margin-left: auto;
}

.search-button {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #6b7280 !important;
  color: #ffffff !important;
  box-shadow: 0 2px 6px rgba(75, 85, 99, 0.25);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  height: 40px;
}

.search-button.search-button--active {
  background-color: #ff4e1b !important;
  box-shadow: 0 2px 8px rgba(255, 78, 27, 0.3);
}

.search-button:hover {
  background-color: #4b5563 !important;
  box-shadow: 0 4px 10px rgba(75, 85, 99, 0.35);
  transform: translateY(-1px);
}

.search-button.search-button--active:hover {
  background-color: #d6652a !important;
  box-shadow: 0 4px 12px rgba(255, 78, 27, 0.4);
}

.search-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(75, 85, 99, 0.3);
}

.search-button.search-button--active:active {
  box-shadow: 0 2px 6px rgba(255, 78, 27, 0.3);
}

.search-button .button-icon {
  font-size: 18px;
  color: #ffffff;
}

.search-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

/* Filtros Avançados */
.advanced-filters {
  margin-top: 20px;
  padding-top: 0;
}

.advanced-filters-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6c757d !important;
  font-size: 14px;
  font-weight: 500;
  padding: 0 !important;
  margin-bottom: 16px;
}

.advanced-filters-toggle:hover {
  color: #FF4E1B !important;
}

.advanced-filters-content {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  padding-top: 8px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 24px;
}

.summary-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.summary-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.summary-icon {
  margin-bottom: 8px;
}

.summary-number {
  font-size: 36px;
  font-weight: 700;
  color: #0b1e3a;
}

.actions-cell {
  display: flex;
  gap: 8px;
  align-items: center;
}

.teams-cell {
  display: flex;
  align-items: center;
}

.status-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.training-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.training-status-badge.status-pending {
  background-color: #fef3c7;
  color: #d97706;
}

.training-status-badge.status-finished {
  background-color: #d1fae5;
  color: #059669;
}

.training-status-badge.status-cancelled {
  background-color: #fee2e2;
  color: #dc2626;
}

.training-status-badge.status-pending-action {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fbbf24;
}

.teams-count-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
  font: inherit;
}

.teams-count-chip:hover {
  border-color: rgba(255, 78, 27, 0.35);
  background: #fffdfb;
}

.teams-count-chip-text {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  line-height: 1;
}

.presence-cell {
  min-width: 0;
  padding: 2px 0;
}

.presence-lines {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.presence-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.presence-text {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

.training-teams-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.training-teams-list-item {
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 10px;
  border-left: 3px solid #ff4e1b;
}

.training-teams-list-name {
  font-size: 13px;
  font-weight: 600;
  color: #0b1e3a;
  margin-bottom: 4px;
}

.training-teams-list-meta {
  font-size: 11px;
  color: #6c757d;
  line-height: 1.4;
}

.training-teams-list-sep {
  margin: 0 4px;
  color: #9e9e9e;
}

.action-btn-bulk-delete {
  min-width: 32px;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  padding: 0;
  background-color: #dc2626 !important;
  color: white !important;
}

.action-btn-bulk-delete:hover {
  background-color: #b91c1c !important;
}

.bulk-delete-button {
  border-radius: 8px;
  padding: 10px 20px;
  font-weight: 500;
  white-space: nowrap;
  background-color: #dc2626 !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.bulk-delete-button:hover {
  background-color: #b91c1c !important;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
  transform: translateY(-1px);
}

.bulk-delete-button .button-icon {
  font-size: 18px;
  color: white;
}

.bulk-delete-button .button-text {
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.summary-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

/* Garantir sombra nos avatares dos times */
:deep(.team-avatar),
:deep(.team-avatar .va-avatar),
:deep(.team-avatar .va-avatar__content) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  border: 2px solid white !important;
}

/* Garantir sombra nos avatares dos usuários */
:deep(.user-avatar),
:deep(.user-avatar .va-avatar),
:deep(.user-avatar .va-avatar__content) {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
  border: 2px solid white !important;
}

@media (max-width: 768px) {
  .filter-content {
    flex-direction: column;
  }

  .search-section,
  .filter-item {
    width: 100%;
    min-width: unset;
  }
}
</style>
