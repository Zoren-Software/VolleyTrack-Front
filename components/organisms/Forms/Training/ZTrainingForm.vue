<template>
  <div
    class="form-container"
    :class="{ 'form-container-full-width': controlledStep === lastStepIndex }"
  >
    <div
      class="training-form-card"
      :class="{
        'training-form-card-full-width': controlledStep === lastStepIndex,
      }"
    >
      <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
        <va-stepper v-model="controlledStep" :steps="steps" controls-hidden>
          <!-- Etapa 1: Informações Gerais -->
          <template #step-content-0>
            <div class="step-content">
              <va-card class="training-step-card">
                <h2 class="section-title">Informações gerais</h2>
                <ZTextInput
                  id="name"
                  v-model="form.name"
                  name="name"
                  label="Nome"
                  class="mb-3"
                  :error-messages="errors.name || []"
                />
                <VaTextarea
                  id="description"
                  v-model="form.description"
                  style="width: 100%"
                  name="description"
                  label="Descrição do treino"
                  class="mb-3"
                  :error="errorFields.includes('description')"
                  :error-messages="errors.description || []"
                />
                <ZDateTimeRangePicker
                  id="dateTimeRange"
                  label="Data início"
                  clearable
                  :date="form.dateValue"
                  :time-start="form.timeStartValue"
                  :time-end="form.timeEndValue"
                  @update:date="form.dateValue = $event"
                  @update:time-start="form.timeStartValue = $event"
                  @update:time-end="form.timeEndValue = $event"
                />
              </va-card>

              <va-card class="training-step-card">
                <h2 class="section-title">Status do treino</h2>
                <div
                  class="training-status-wrapper"
                  :class="{
                    'training-status-wrapper--error':
                      errorFields.includes('status'),
                  }"
                >
                  <div class="training-status-grid">
                    <div
                      v-for="opt in trainingStatusCards"
                      :key="opt.value"
                      role="button"
                      :tabindex="opt.disabled ? -1 : 0"
                      :aria-disabled="opt.disabled || false"
                      :class="[
                        'training-status-card',
                        {
                          'training-status-card--selected':
                            isTrainingStatusSelected(opt.value),
                          'training-status-card--error':
                            errorFields.includes('status'),
                          'training-status-card--disabled': opt.disabled,
                        },
                      ]"
                      @click="selectTrainingStatus(opt.value)"
                      @keydown.enter.prevent="selectTrainingStatus(opt.value)"
                      @keydown.space.prevent="selectTrainingStatus(opt.value)"
                    >
                      <va-icon
                        class="training-status-card-icon"
                        :name="opt.icon"
                        :color="
                          isTrainingStatusSelected(opt.value)
                            ? '#FF4E1B'
                            : '#9CA3AF'
                        "
                        size="22px"
                      />
                      <div class="training-status-info">
                        <h4 class="training-status-title">{{ opt.title }}</h4>
                        <p class="training-status-description">
                          {{ opt.description }}
                        </p>
                        <p
                          v-if="opt.disabled && opt.disabledReason"
                          class="training-status-disabled-reason"
                        >
                          {{ opt.disabledReason }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="
                      errorFields.includes('status') &&
                      errors.status &&
                      errors.status.length
                    "
                    class="training-status-error-message"
                  >
                    <va-icon name="error" size="small" color="danger" />
                    <span>{{ (errors.status || []).join(" ") }}</span>
                  </div>
                </div>
              </va-card>
            </div>
          </template>

          <!-- Etapa 2: Fundamentos -->
          <template #step-content-1>
            <div class="step-content">
              <va-card class="training-step-card">
                <h2 class="section-title">Fundamentos</h2>
                <p class="subsection-description fundamental-section-hint">
                  Selecione um ou mais fundamentos gerais do treino.
                </p>
                <div
                  v-if="fundamentalsCatalogLoading"
                  class="fundamentals-loading"
                >
                  <va-progress-circle indeterminate size="small" />
                  <span>Carregando fundamentos...</span>
                </div>
                <p
                  v-else-if="!fundamentalCatalog.length"
                  class="fundamental-empty-hint mb-5"
                >
                  Nenhum fundamento geral disponível no sistema.
                </p>
                <div v-else class="fundamental-pick-grid mb-5">
                  <div
                    v-for="item in fundamentalCatalog"
                    :key="'f-' + item.id"
                    role="button"
                    tabindex="0"
                    :class="[
                      'fundamental-pick-card',
                      {
                        'fundamental-pick-card--selected': isFundamentalPicked(
                          item.id,
                        ),
                      },
                    ]"
                    @click="toggleFundamentalPick(item)"
                    @keydown.enter.prevent="toggleFundamentalPick(item)"
                    @keydown.space.prevent="toggleFundamentalPick(item)"
                  >
                    <va-icon
                      class="fundamental-pick-card-icon"
                      name="sports_volleyball"
                      :color="
                        isFundamentalPicked(item.id) ? '#FF4E1B' : '#9CA3AF'
                      "
                      size="22px"
                    />
                    <span class="fundamental-pick-card-title">{{
                      item.name
                    }}</span>
                  </div>
                </div>

                <template v-if="form.fundamentals && form.fundamentals.length">
                  <h4 class="fundamental-specific-heading">
                    Fundamentos específicos
                  </h4>
                  <p class="subsection-description fundamental-section-hint">
                    Escolha uma ou mais opções ligadas aos fundamentos
                    selecionados.
                  </p>
                  <div
                    v-if="specificFundamentalsLoading"
                    class="fundamentals-loading"
                  >
                    <va-progress-circle indeterminate size="small" />
                    <span>Carregando fundamentos específicos...</span>
                  </div>
                  <p
                    v-else-if="!specificFundamentalCatalog.length"
                    class="fundamental-empty-hint"
                  >
                    Não há fundamentos específicos cadastrados para a combinação
                    selecionada.
                  </p>
                  <div v-else class="fundamental-pick-grid mb-5">
                    <div
                      v-for="item in specificFundamentalCatalog"
                      :key="'sf-' + item.id"
                      role="button"
                      tabindex="0"
                      :class="[
                        'fundamental-pick-card',
                        'fundamental-pick-card--specific',
                        {
                          'fundamental-pick-card--selected':
                            isSpecificFundamentalPicked(item.id),
                        },
                      ]"
                      @click="toggleSpecificFundamentalPick(item)"
                      @keydown.enter.prevent="
                        toggleSpecificFundamentalPick(item)
                      "
                      @keydown.space.prevent="
                        toggleSpecificFundamentalPick(item)
                      "
                    >
                      <va-icon
                        class="fundamental-pick-card-icon"
                        name="tune"
                        :color="
                          isSpecificFundamentalPicked(item.id)
                            ? '#FF4E1B'
                            : '#9CA3AF'
                        "
                        size="22px"
                      />
                      <span class="fundamental-pick-card-title">{{
                        item.name
                      }}</span>
                    </div>
                  </div>
                </template>
              </va-card>
            </div>
          </template>

          <!-- Etapa 3: Relacionar Times -->
          <template #step-content-2>
            <div class="step-content">
              <va-card class="training-step-card">
                <h2 class="section-title">Relacionar times</h2>
                <ZListRelationTeams
                  :items="form.teams || []"
                  :selected-value="teams"
                  @add="addTeams"
                  @delete="actionDeleteTeam"
                >
                  <template #filter>
                    <ZSelectTeam
                      ref="selectTeamRef"
                      v-model="teams"
                      class="mb-3"
                      label="Times"
                      :disabled="form.teams.length >= 1"
                      :ignore-ids="form.teams.map((item) => parseInt(item.id))"
                      :messages="
                        form.teams.length >= 1
                          ? 'Você já selecionou um time'
                          : ''
                      "
                    />
                  </template>
                </ZListRelationTeams>

                <!-- Mostrar jogadores do time após relacionar (apenas visualização) -->
                <div
                  v-if="
                    form.teams &&
                    form.teams.length > 0 &&
                    getTeamPlayers().length > 0
                  "
                  class="mt-5"
                >
                  <h3 class="subsection-title">Jogadores Relacionados</h3>
                  <div class="players-list-simple">
                    <div
                      v-for="confirmation in getTeamPlayers()"
                      :key="confirmation.player?.id || confirmation.playerId"
                      class="player-item-simple"
                    >
                      <ZUser :data="confirmation.player" />
                      <div class="player-positions">
                        <span
                          v-for="(position, index) in confirmation.player
                            ?.positions || []"
                          :key="position?.id || index"
                          class="position-tag"
                        >
                          {{ position?.name }}
                        </span>
                        <span
                          v-if="
                            !confirmation.player?.positions ||
                            confirmation.player?.positions.length === 0
                          "
                          class="no-positions"
                        >
                          Sem posições
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Adicionar jogadores avulsos (apenas na tela de edição) -->
                <div v-if="isTrainingSaved" class="mt-5">
                  <h3 class="subsection-title">Jogadores Avulsos</h3>
                  <p class="subsection-description mb-3">
                    Adicione jogadores que não fazem parte do time relacionado
                  </p>
                  <div class="standalone-players-section">
                    <ZSelectUser
                      v-model="standalonePlayers"
                      :ignoreIds="getAllPlayerIds()"
                      :rolesIds="[3]"
                      class="mb-3"
                      label="Buscar e selecionar jogadores avulsos"
                      placeholder="Digite o nome do jogador"
                    />
                    <va-button
                      color="primary"
                      icon="add"
                      @click="addStandalonePlayers"
                      class="mb-3"
                    >
                      Adicionar Jogador Avulso
                    </va-button>
                  </div>

                  <!-- Mostrar jogadores avulsos adicionados (apenas visualização) -->
                  <div v-if="getStandalonePlayers().length > 0" class="mt-4">
                    <h4 class="subsection-subtitle mb-3">
                      Jogadores Avulsos Adicionados
                    </h4>
                    <div class="players-list-simple">
                      <div
                        v-for="confirmation in getStandalonePlayers()"
                        :key="confirmation.player?.id || confirmation.playerId"
                        class="player-item-simple"
                      >
                        <ZUser :data="confirmation.player" />
                        <div class="player-positions">
                          <span
                            v-for="(position, index) in confirmation.player
                              ?.positions || []"
                            :key="position?.id || index"
                            class="position-tag"
                          >
                            {{ position?.name }}
                          </span>
                          <span
                            v-if="
                              !confirmation.player?.positions ||
                              confirmation.player?.positions.length === 0
                            "
                            class="no-positions"
                          >
                            Sem posições
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </va-card>
            </div>
          </template>

          <!-- Etapa 4: Lista de Presença -->
          <template #step-content-3>
            <div class="step-content">
              <ZTrainingAttendanceView :training-id="form.id || ''" />
            </div>
          </template>

          <!-- Etapa 5: Marcação dos Scouts -->
          <template #step-content-4>
            <div class="step-content step-content-full-width">
              <ZListRelationPlayersWithScouts
                ref="listRelationPlayersWithScoutsRef"
                :training-id="form.id"
                :items="[...(form.players || []), ...(form.scouts || [])]"
                @add="addPlayers"
                @delete="actionDeletePlayer"
              >
              </ZListRelationPlayersWithScouts>
            </div>
          </template>
        </va-stepper>
      </va-form>
    </div>

    <!-- Botões de Ação (Fora do Card) -->
    <div class="action-buttons">
      <va-button
        v-if="controlledStep === 0"
        color="secondary"
        class="mr-1"
        @click="goBack"
        >Voltar</va-button
      >
      <va-button
        v-if="controlledStep > 0"
        color="secondary"
        class="mr-1"
        @click="handlePrevStep()"
        >Anterior</va-button
      >
      <va-button
        v-if="controlledStep < lastStepIndex"
        color="primary"
        class="mr-1"
        @click="handleNextStep()"
        >Próximo</va-button
      >
      <va-button
        v-if="controlledStep === lastStepIndex"
        color="primary"
        @click="handleSaveClick"
        >Salvar</va-button
      >
    </div>
  </div>
</template>

<script>
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZSelectTeam from "~/components/molecules/Selects/ZSelectTeam";
import ZListRelationTeams from "~/components/organisms/List/Relations/ZListRelationTeams";
import { confirmSuccess, confirmError } from "~/utils/sweetAlert2/swalHelper";
import Swal from "sweetalert2";
import ZDateTimeRangePicker from "~/components/molecules/Inputs/ZDateTimeRangePicker.vue";
import ZSelectFundamental from "~/components/molecules/Selects/ZSelectFundamental.vue";
import ZSelectSpecificFundamental from "~/components/molecules/Selects/ZSelectSpecificFundamental.vue";
import ZTrainingAttendanceView from "~/components/organisms/Training/ZTrainingAttendanceView.vue";
import ZListRelationPlayersWithScouts from "~/components/molecules/Datatable/ZListRelationPlayersWithScouts";
import ZSelectUser from "~/components/molecules/Selects/ZSelectUser";
import TEAM from "~/graphql/team/query/team.graphql";
import ZUser from "~/components/molecules/Datatable/Slots/ZUser";
import TRAININGEDIT from "~/graphql/training/mutation/trainingEdit.graphql";
import TRAINING from "~/graphql/training/query/training.graphql";
import moment from "moment";

export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          name: "",
          description: "",
          dateValue: new Date().toString(),
          timeStartValue: new Date(),
          timeEndValue: new Date(new Date().getTime() + 60 * 60 * 1000),
          teams: [],
          fundamentals: [],
          specificFundamentals: [],
          players: [],
        };
      },
    },
    loading: {
      type: Boolean,
      default: false,
    },
    errorFields: {
      type: Array,
      default: () => [],
    },
    errors: {
      type: Object,
      default: () => {
        return {
          name: [],
          description: [],
          dateValue: [],
          timeStartValue: [],
          timeEndValue: [],
          teams: [],
          fundamentals: [],
          specificFundamentals: [],
        };
      },
    },
  },
  components: {
    ZTextInput,
    ZSelectTeam,
    ZListRelationTeams,
    ZDateTimeRangePicker,
    ZSelectFundamental,
    ZSelectSpecificFundamental,
    ZTrainingAttendanceView,
    ZListRelationPlayersWithScouts,
    ZSelectUser,
    ZUser,
  },

  emits: [
    "refresh",
    "update:errors",
    "update:errorFields",
    "saveAndContinue",
    "saveScouts",
    "finish",
    "unfinish",
    "cancel",
    "uncancel",
  ],

  data() {
    return {
      radioOptions: [
        { label: "Alterar apenas este treino", value: false },
        { label: "Alterar este treino e todos os futuros", value: true },
      ],
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      internalStep: 0,
      positions: [],
      teams: [],
      form: {
        ...this.data,
        status: this.data.status || "pending",
        players: this.data.players || [],
        scouts: this.data.scouts || [],
        teams: this.data.teams || [],
        fundamentals: this.data.fundamentals || [],
        specificFundamentals: this.data.specificFundamentals || [],
        confirmationsTraining: this.data.confirmationsTraining || [],
        standalonePlayerIds: [],
      },
      fundamentalCatalog: [],
      fundamentalsCatalogLoading: false,
      specificFundamentalCatalog: [],
      specificFundamentalsLoading: false,
      users: [],
      players: [],
      scouts: [],
      standalonePlayers: [],
      teamPlayersCache: {}, // Cache para armazenar jogadores dos times
    };
  },

  computed: {
    trainingEndDateTime() {
      if (!this.form.dateValue || !this.form.timeEndValue) return null;
      try {
        // Usar moment para evitar problemas de timezone com new Date(string ISO)
        // new Date("YYYY-MM-DD") é interpretado como UTC meia-noite,
        // causando deslocamento de data em fusos negativos (ex: Brasil UTC-3)
        const dateStr = moment(this.form.dateValue).format("YYYY-MM-DD");
        const timeStr = moment(this.form.timeEndValue).format("HH:mm:ss");
        const combined = moment(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm:ss");
        return combined.isValid() ? combined.toDate() : null;
      } catch (e) {
        return null;
      }
    },
    isTrainingInFuture() {
      const end = this.trainingEndDateTime;
      if (!end) return false;
      return end > new Date();
    },
    trainingStatusCards() {
      return [
        {
          value: "pending",
          title: "Agendado",
          description:
            "Treino na programação; confirmações de presença ficam disponíveis.",
          icon: "event",
        },
        {
          value: "finished",
          title: "Finalizado",
          description:
            "Treino já realizado; use para encerrar chamada e consolidar registros.",
          icon: "task_alt",
          disabled: this.isTrainingInFuture,
          disabledReason: this.isTrainingInFuture
            ? "Indisponível para treinos futuros."
            : null,
        },
        {
          value: "cancelled",
          title: "Cancelado",
          description:
            "Treino não ocorrerá; informe os envolvidos quando necessário.",
          icon: "event_busy",
        },
      ];
    },
    // Verifica se o treino está salvo (tem ID)
    isTrainingSaved() {
      return this.form.id && this.form.id > 0;
    },
    // Computed property para controlar o step de forma segura
    controlledStep: {
      get() {
        return this.internalStep;
      },
      set(newStep) {
        // Marcação dos Scouts só após salvar o treino
        if (newStep > 2 && !this.isTrainingSaved) {
          confirmError(
            "Ação não permitida!",
            "Você precisa salvar as informações básicas do treino antes de acessar as etapas de Lista de Presença e Scouts. Por favor, salve o treino primeiro."
          );
          return;
        }
        this.internalStep = newStep;
      },
    },
    // Steps dinâmicos com validação (índices alinhados a #step-content-N)
    steps() {
      return [
        { label: "Informações Essenciais" },
        { label: "Fundamentos" },
        { label: "Relacionar times" },
        {
          label: "Lista de Presença",
          disabled: !this.isTrainingSaved,
        },
        {
          label: "Marcação dos Scouts",
          disabled: !this.isTrainingSaved,
        },
      ];
    },
    lastStepIndex() {
      return Math.max(0, this.steps.length - 1);
    },
  },

  watch: {
    data: {
      handler(val) {
        // Se não há dados válidos, não fazer nada
        if (!val || Object.keys(val).length === 0) {
          return;
        }

        // Verificar se o form já foi inicializado (tem ID ou dados básicos)
        const isFormInitialized = this.form && (this.form.id || this.form.name);

        // Preservar dados existentes que podem ser perdidos apenas se o form já foi inicializado
        const existingTeams = isFormInitialized ? this.form.teams || [] : [];
        const existingFundamentals = isFormInitialized
          ? this.form.fundamentals || []
          : [];
        const existingSpecificFundamentals = isFormInitialized
          ? this.form.specificFundamentals || []
          : [];
        const existingConfirmationsTraining = isFormInitialized
          ? this.form.confirmationsTraining || []
          : [];

        // Preservar valores de presença real e status dos confirmationsTraining existentes
        let preservedConfirmationsTraining;

        if (
          val.confirmationsTraining &&
          val.confirmationsTraining.length > 0 &&
          isFormInitialized
        ) {
          // Se há novos dados e o form já foi inicializado, mesclar preservando valores de presença e status
          preservedConfirmationsTraining = val.confirmationsTraining.map(
            (newConfirmation) => {
              // Buscar confirmação existente com mesmo ID ou mesmo playerId
              const existingConfirmation = existingConfirmationsTraining.find(
                (existing) =>
                  (existing.id && existing.id === newConfirmation.id) ||
                  (existing.playerId &&
                    existing.playerId === newConfirmation.playerId) ||
                  (existing.player?.id &&
                    existing.player?.id === newConfirmation.player?.id),
              );

              if (existingConfirmation) {
                // Preservar presença se foi marcada (true ou false)
                const preservedPresence =
                  existingConfirmation.presence !== null &&
                  existingConfirmation.presence !== undefined
                    ? existingConfirmation.presence
                    : newConfirmation.presence;

                // Preservar status se foi alterado (não é PENDING)
                const preservedStatus =
                  existingConfirmation.status &&
                  existingConfirmation.status !== "PENDING" &&
                  existingConfirmation.status !== "pending"
                    ? existingConfirmation.status
                    : newConfirmation.status;

                return {
                  ...newConfirmation,
                  presence: preservedPresence,
                  status: preservedStatus,
                };
              }

              // Caso contrário, usar os novos dados
              return newConfirmation;
            },
          );
        } else if (
          val.confirmationsTraining &&
          val.confirmationsTraining.length > 0
        ) {
          // Se é a primeira vez carregando, usar os dados novos diretamente
          preservedConfirmationsTraining = val.confirmationsTraining;
        } else {
          // Se não há novos dados, manter os existentes apenas se já houver dados no form
          preservedConfirmationsTraining = isFormInitialized
            ? existingConfirmationsTraining
            : [];
        }

        this.form = {
          ...val,
          players: val.players || this.form.players || [],
          scouts: val.scouts || this.form.scouts || [],
          confirmationsTraining: preservedConfirmationsTraining,
          standalonePlayerIds: this.form.standalonePlayerIds || [],
          // Usar dados novos se disponíveis, senão preservar existentes apenas se form já inicializado
          teams:
            Array.isArray(val.teams) && val.teams.length > 0
              ? val.teams
              : isFormInitialized &&
                  Array.isArray(existingTeams) &&
                  existingTeams.length > 0
                ? existingTeams
                : [],
          fundamentals:
            Array.isArray(val.fundamentals) && val.fundamentals.length > 0
              ? val.fundamentals
              : isFormInitialized &&
                  Array.isArray(existingFundamentals) &&
                  existingFundamentals.length > 0
                ? existingFundamentals
                : [],
          specificFundamentals:
            Array.isArray(val.specificFundamentals) &&
            val.specificFundamentals.length > 0
              ? val.specificFundamentals
              : isFormInitialized &&
                  Array.isArray(existingSpecificFundamentals) &&
                  existingSpecificFundamentals.length > 0
                ? existingSpecificFundamentals
                : [],
        };

        this.$nextTick(() => {
          this.refreshSpecificFundamentalsCatalog();
          this.syncStepFromRoute();
        });
      },
      immediate: false,
    },
    "data.team": function (newVal) {
      if (newVal && (!this.form.teams || this.form.teams.length === 0)) {
        this.form.teams = [{ id: newVal.id, team: newVal.name }];
      }
    },
    "form.id"(id) {
      if (id) {
        this.$nextTick(() => this.syncStepFromRoute());
      }
    },
    "$route.query.step"() {
      this.syncStepFromRoute();
    },
  },

  async mounted() {
    this.$nextTick(() => this.syncStepFromRoute());
    await this.fetchAllFundamentalsCatalog();
    await this.refreshSpecificFundamentalsCatalog();
    this.$nextTick(() => this.syncStepFromRoute());
  },

  methods: {
    /**
     * Abre o passo indicado por ?step= na URL (0 a N-1).
     * Compat: ?step=3 do fluxo antigo (Lista de Presença) → passo 3 no fluxo atual.
     */
    syncStepFromRoute() {
      const raw = this.$route?.query?.step;
      if (raw === undefined || raw === null || String(raw).trim() === "") {
        return;
      }
      let step = parseInt(String(raw), 10);
      if (Number.isNaN(step)) {
        return;
      }
      const max = this.steps.length - 1;
      if (step < 0 || step > max) {
        return;
      }
      if (step > 2 && !this.isTrainingSaved) {
        return;
      }
      this.internalStep = step;
    },
    // Valida se os campos obrigatórios estão preenchidos
    validateRequiredFields() {
      const requiredFields = {
        name: "Nome do treino",
        description: "Descrição do treino",
        dateValue: "Data do treino",
        timeStartValue: "Horário de início",
        timeEndValue: "Horário de término",
      };

      const missingFields = [];

      for (const [field, label] of Object.entries(requiredFields)) {
        if (
          !this.form[field] ||
          (Array.isArray(this.form[field]) && this.form[field].length === 0)
        ) {
          missingFields.push(label);
        }
      }

      // Validação específica para arrays
      console.log(
        "DEBUG - validateRequiredFields: Teams no form:",
        this.form.teams,
      );
      if (!this.form.teams || this.form.teams.length === 0) {
        console.log("DEBUG - validateRequiredFields: Time está vazio!");
        missingFields.push("Time");
      }

      if (missingFields.length > 0) {
        confirmError(
          "Campos obrigatórios não preenchidos!",
          `Por favor, preencha os seguintes campos antes de salvar: ${missingFields.join(
            ", ",
          )}`,
        );
        return false;
      }

      return true;
    },

    goBack() {
      this.$router.push("/trainings");
    },
    handleNextStep() {
      if (this.controlledStep < this.lastStepIndex) {
        this.controlledStep = this.controlledStep + 1;
      }
    },
    async handleSaveClick() {
      if (!this.validateRequiredFields()) {
        return;
      }
      if (!this.isTrainingSaved) {
        this.$emit("saveAndContinue", this.form);
        return;
      }
      await this.saveScoutsOnly();
    },
    handlePrevStep() {
      if (this.controlledStep > 0) {
        this.controlledStep = this.controlledStep - 1;
      }
    },

    handleGraphQLError(error) {
      if (
        error.graphQLErrors &&
        error.graphQLErrors[0] &&
        error.graphQLErrors[0].extensions &&
        error.graphQLErrors[0].extensions.validation
      ) {
        const validationErrors = error.graphQLErrors[0].extensions.validation;
        this.$emit("update:errors", validationErrors);

        const errorMessages = Object.values(validationErrors).map((item) => {
          return item[0];
        });

        this.$emit("update:errorFields", Object.keys(validationErrors));

        const footer = errorMessages.join("<br>");

        confirmError("Ocorreu um erro ao executar a operação!", footer);
      } else {
        confirmError("Ocorreu um erro ao executar a operação!");
      }
    },
    errorsDefault() {
      return {
        name: [],
        description: [],
        dateValue: [],
        timeStartValue: [],
        timeEndValue: [],
        teams: [],
        fundamentals: [],
        specificFundamentals: [],
        players: [],
        scouts: [],
      };
    },
    addTeams() {
      // Com return-object, o va-select retorna array de objetos {text, value}
      if (
        !this.teams ||
        (Array.isArray(this.teams) && this.teams.length === 0)
      ) {
        return;
      }

      let teamsToAdd = [];

      if (Array.isArray(this.teams)) {
        // Array de objetos {text, value}
        teamsToAdd = this.teams
          .filter(
            (item) =>
              item && typeof item === "object" && item.value !== undefined,
          )
          .map((item) => ({
            id: item.value,
            team: item.text,
          }));
      } else if (
        typeof this.teams === "object" &&
        this.teams.value !== undefined
      ) {
        // Objeto único {text, value} (caso não seja múltiplo)
        teamsToAdd = [
          {
            id: this.teams.value,
            team: this.teams.text,
          },
        ];
      }

      // Adicionar apenas times que ainda não foram adicionados
      teamsToAdd.forEach((newTeam) => {
        const isAlreadyAdded = this.form.teams.some(
          (existingTeam) => existingTeam.id === newTeam.id,
        );

        if (!isAlreadyAdded) {
          this.form.teams.push(newTeam);

          // Buscar jogadores do time e adicionar à lista
          this.loadTeamPlayers(newTeam.id);
        }
      });

      // Limpar seleção após adicionar
      this.teams = [];
    },

    loadTeamPlayers(teamId) {
      try {
        // Verificar se já temos os jogadores em cache
        if (this.teamPlayersCache[teamId]) {
          this.addTeamPlayersToConfirmations(
            this.teamPlayersCache[teamId],
            teamId,
          );
          return;
        }

        // Buscar jogadores do time
        const query = gql`
          ${TEAM}
        `;

        const {
          result: { value },
        } = useQuery(query, { id: teamId });

        const { onResult } = useQuery(query, { id: teamId });

        onResult((result) => {
          if (result?.data?.team?.players) {
            // Armazenar em cache
            this.teamPlayersCache[teamId] = result.data.team.players;
            // Adicionar jogadores à lista de confirmações
            this.addTeamPlayersToConfirmations(
              result.data.team.players,
              teamId,
            );
          }
        });

        // Também verificar se já temos resultado imediato
        if (value?.team?.players) {
          this.teamPlayersCache[teamId] = value.team.players;
          this.addTeamPlayersToConfirmations(value.team.players, teamId);
        }
      } catch (error) {
        console.error("Erro ao carregar jogadores do time:", error);
      }
    },

    addTeamPlayersToConfirmations(players, teamId) {
      if (!players || !Array.isArray(players)) {
        return;
      }

      if (!this.form.confirmationsTraining) {
        this.form.confirmationsTraining = [];
      }

      players.forEach((player) => {
        // Verificar se o jogador já existe na lista (por ID do jogador)
        const alreadyExists = this.form.confirmationsTraining.some(
          (confirmation) =>
            confirmation.player?.id === player.id &&
            confirmation.teamId === teamId,
        );

        if (!alreadyExists) {
          // Criar objeto temporário de confirmação para exibir
          this.form.confirmationsTraining.push({
            id: null, // Será criado quando salvar
            playerId: player.id,
            player: {
              id: player.id,
              name: player.name,
              email: player.email,
              userId: player.userId,
              information: player.information || null,
              positions: player.positions || [],
              teams: player.teams || [],
              emailVerifiedAt: player.emailVerifiedAt,
              createdAt: player.createdAt,
              updatedAt: player.updatedAt,
            },
            trainingId: this.form.id || null,
            teamId: teamId,
            status: "PENDING",
            presence: null,
            createdAt: null,
            updatedAt: null,
          });
        }
      });
    },

    actionDeletePosition(id) {
      this.form.positions = this.form.positions.filter((position) => {
        return position.id !== id;
      });

      transformedfundamentals.forEach((newFundamental) => {
        const isAlreadyAdded = this.form.fundamentals.some(
          (existingFundamental) => existingFundamental.id === newFundamental.id
        );

        if (!isAlreadyAdded) {
          this.form.fundamentals.push(newFundamental);
        }
      });

      this.fundamentals = [];
    },

    addSpecificFundamental() {
      const transformedSpecificFundamentals = this.specificFundamentals.map(
        (item) => {
          return {
            id: item.value,
            specificFundamental: item.text,
          };
        }
      );

      transformedSpecificFundamentals.forEach((newSpecificFundamental) => {
        const isAlreadyAdded = this.form.specificFundamentals.some(
          (existingSpecificFundamental) =>
            existingSpecificFundamental.id === newSpecificFundamental.id
        );

        if (!isAlreadyAdded) {
          this.form.specificFundamentals.push(newSpecificFundamental);
        }
      });

      this.specificFundamentals = [];
    },

    actionDeletePosition(id) {
      this.form.positions = this.form.positions.filter((position) => {
        return position.id !== id;
      });

      confirmSuccess("Posição removida com sucesso!");
    },

    actionDeleteTeam(id) {
      this.form.teams = this.form.teams.filter((team) => {
        return team.id !== id;
      });

      confirmSuccess("Time removido com sucesso!");
    },

    actionDeleteFundamental(id) {
      this.form.fundamentals = this.form.fundamentals.filter((fundamental) => {
        return fundamental.id !== id;
      });

      confirmSuccess("Fundamento removido com sucesso!");
    },

    actionDeleteSpecificFundamental(id) {
      this.form.specificFundamentals = this.form.specificFundamentals.filter(
        (specificFundamental) => {
          return specificFundamental.id !== id;
        }
      );

      confirmSuccess("Fundamento Específico removido com sucesso!");
    },

    addPlayers() {
      const transformedPlayers = this.players.map((item) => {
        return {
          id: item.value,
          user: {
            id: item.value,
            name: item.text,
            email: item.email,
            information: item.information,
            positions: item.positions,
          },
        };
      });

      transformedPlayers.forEach((newPlayer) => {
        const isAlreadyAdded = this.form.players.some(
          (existingPlayer) => existingPlayer.id === newPlayer.id,
        );

        if (!isAlreadyAdded) {
          this.form.players.push(newPlayer);
        }
      });

      this.players = [];
    },

    addScouts() {
      const transformedScouts = this.scouts.map((item) => {
        return {
          id: item.value,
          name: item.text,
        };
      });

      transformedScouts.forEach((newScout) => {
        const isAlreadyAdded = this.form.scouts.some(
          (existingScout) => existingScout.id === newScout.id,
        );

        if (!isAlreadyAdded) {
          this.form.scouts.push(newScout);
        }
      });

      this.scouts = [];
    },

    actionDeletePlayer(id) {
      this.form.players = this.form.players.filter((player) => {
        return player.id !== id;
      });

      confirmSuccess("Jogador removido com sucesso!");
    },

    getAllPlayerIds() {
      const teamPlayerIds =
        this.form.confirmationsTraining
          ?.filter((ct) => ct.player?.id)
          .map((ct) => parseInt(ct.player.id))
          .filter((id) => !isNaN(id)) || [];
      return teamPlayerIds;
    },

    getTeamPlayers() {
      if (
        !this.form.teams ||
        this.form.teams.length === 0 ||
        !this.form.confirmationsTraining
      ) {
        return [];
      }

      const teamIds = this.form.teams.map((t) => parseInt(t.id));
      return this.form.confirmationsTraining.filter(
        (ct) => ct.teamId && teamIds.includes(parseInt(ct.teamId)),
      );
    },

    getStandalonePlayers() {
      if (!this.form.confirmationsTraining) {
        return [];
      }
      return this.form.confirmationsTraining.filter((ct) => !ct.teamId);
    },

    async addStandalonePlayers() {
      console.log("addStandalonePlayers chamado", this.standalonePlayers);

      if (
        !this.standalonePlayers ||
        (Array.isArray(this.standalonePlayers) &&
          this.standalonePlayers.length === 0) ||
        (typeof this.standalonePlayers === "object" &&
          !Array.isArray(this.standalonePlayers) &&
          !this.standalonePlayers.value &&
          !this.standalonePlayers.id)
      ) {
        confirmError("Por favor, selecione um jogador antes de adicionar.");
        return;
      }

      if (!this.form.id) {
        confirmError(
          "O treino precisa ser salvo antes de adicionar jogadores avulsos.",
        );
        return;
      }

      let playersToAdd = [];

      if (Array.isArray(this.standalonePlayers)) {
        playersToAdd = this.standalonePlayers
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              (item.value !== undefined || item.id !== undefined),
          )
          .map((item) => ({
            id: parseInt(item.value || item.id),
            name: item.text || item.name,
            email: item.email || null,
            information: item.information || null,
            positions: item.positions || [],
          }))
          .filter((item) => !isNaN(item.id) && item.id > 0);
      } else if (
        typeof this.standalonePlayers === "object" &&
        this.standalonePlayers !== null
      ) {
        const playerId = parseInt(
          this.standalonePlayers.value || this.standalonePlayers.id || 0,
        );

        if (!isNaN(playerId) && playerId > 0) {
          playersToAdd = [
            {
              id: playerId,
              name: this.standalonePlayers.text || this.standalonePlayers.name,
              email: this.standalonePlayers.email || null,
              information: this.standalonePlayers.information || null,
              positions: this.standalonePlayers.positions || [],
            },
          ];
        }
      }

      if (playersToAdd.length === 0) {
        confirmError("Nenhum jogador válido foi encontrado na seleção.");
        return;
      }

      // Verificar quais jogadores já foram adicionados
      const existingPlayerIds =
        this.form.confirmationsTraining
          ?.map((ct) => parseInt(ct.player?.id || ct.playerId || 0))
          .filter((id) => !isNaN(id) && id > 0) || [];

      const newPlayerIds = playersToAdd
        .map((p) => p.id)
        .filter((id) => !existingPlayerIds.includes(id));

      if (newPlayerIds.length === 0) {
        confirmError(
          "Todos os jogadores selecionados já foram adicionados anteriormente.",
        );
        return;
      }

      try {
        // Preparar dados para a mutation
        const dateStart =
          moment(this.form.dateValue).format("YYYY-MM-DD") +
          " " +
          moment(this.form.timeStartValue).format("HH:mm:ss");
        const dateEnd =
          moment(this.form.dateValue).format("YYYY-MM-DD") +
          " " +
          moment(this.form.timeEndValue).format("HH:mm:ss");

        // Obter todos os playerIds já existentes + os novos
        const allStandalonePlayerIds = [
          ...(this.form.standalonePlayerIds || []),
          ...newPlayerIds,
        ];

        const query = gql`
          mutation trainingEdit(
            $id: ID!
            $teamId: Int
            $fundamentalId: [Int]
            $specificFundamentalId: [Int]
            $playerIds: [Int]
            $name: String!
            $description: String
            $dateStart: String!
            $dateEnd: String!
          ) {
            trainingEdit(
              id: $id
              teamId: $teamId
              fundamentalId: $fundamentalId
              specificFundamentalId: $specificFundamentalId
              playerIds: $playerIds
              name: $name
              description: $description
              dateStart: $dateStart
              dateEnd: $dateEnd
            ) {
              id
              confirmationsTraining {
                id
                userId
                playerId
                trainingId
                status
                presence
                teamId
                player {
                  id
                  name
                  email
                  userId
                  information {
                    id
                    userId
                    cpf
                    rg
                    phone
                    birthDate
                    createdAt
                    updatedAt
                  }
                  teams {
                    id
                    name
                    userId
                    createdAt
                    updatedAt
                  }
                  positions {
                    id
                    name
                    userId
                    createdAt
                    updatedAt
                  }
                  emailVerifiedAt
                  createdAt
                  updatedAt
                }
                createdAt
                updatedAt
              }
            }
          }
        `;

        // Quando estamos apenas adicionando jogadores avulsos, não precisamos
        // enviar fundamentos, pois o backend já os tem salvos.
        // Isso evita erros de validação.
        const variables = {
          id: parseInt(this.form.id),
          name: this.form.name,
          description: this.form.description || null,
          teamId:
            this.form.teams && this.form.teams.length > 0
              ? parseInt(this.form.teams[0].id)
              : null,
          // Não enviar fundamentos ao adicionar apenas jogadores
          // O backend preservará os fundamentos existentes
          playerIds: allStandalonePlayerIds,
          dateStart,
          dateEnd,
        };

        const { mutate } = await useMutation(query, { variables });
        const { data } = await mutate();

        // Atualizar a lista de confirmações com os dados retornados
        if (data?.trainingEdit?.confirmationsTraining) {
          // Filtrar apenas os jogadores avulsos (sem teamId) retornados
          const standaloneConfirmations =
            data.trainingEdit.confirmationsTraining.filter(
              (ct) => !ct.teamId || ct.teamId === null,
            );

          // Atualizar a lista local: manter jogadores do time e atualizar jogadores avulsos
          if (!this.form.confirmationsTraining) {
            this.form.confirmationsTraining = [];
          }

          // Separar jogadores do time e jogadores avulsos
          const teamPlayers = this.form.confirmationsTraining.filter(
            (ct) => ct.teamId && ct.teamId !== null,
          );

          // Combinar jogadores do time com os jogadores avulsos retornados
          this.form.confirmationsTraining = [
            ...teamPlayers,
            ...standaloneConfirmations,
          ];

          // Atualizar standalonePlayerIds
          this.form.standalonePlayerIds = allStandalonePlayerIds;

          // Forçar reatividade do Vue
          this.$forceUpdate();
        }

        this.standalonePlayers = [];

        confirmSuccess(
          `${newPlayerIds.length} jogador(es) avulso(s) adicionado(s) com sucesso!`,
        );

        // Emitir refresh para atualizar os dados
        this.$emit("refresh");
      } catch (error) {
        console.error("Erro ao adicionar jogadores avulsos:", error);
        confirmError(
          "Ocorreu um erro ao adicionar os jogadores avulsos. Tente novamente.",
        );
      }
    },

    actionDeleteScout(id) {
      this.form.scouts = this.form.scouts.filter((scout) => {
        return scout.id !== id;
      });

      confirmSuccess("Scout removido com sucesso!");
    },

    async save() {
      if (!this.validateRequiredFields()) {
        return;
      }
      this.$emit("save", this.form);
    },

    async saveAndContinue() {
      if (!this.validateRequiredFields()) {
        return;
      }
      this.$emit("saveAndContinue", this.form);
    },

    // Método específico para salvar scouts sem redirecionamento
    async saveScoutsOnly() {
      console.log("DEBUG - saveScoutsOnly: Iniciando save forçado de scouts");

      try {
        // Forçar o save de todos os scouts pendentes
        if (
          this.$refs.listRelationPlayersWithScoutsRef &&
          this.$refs.listRelationPlayersWithScoutsRef.forceSaveAllScouts
        ) {
          console.log("DEBUG - saveScoutsOnly: Chamando forceSaveAllScouts");
          await this.$refs.listRelationPlayersWithScoutsRef.forceSaveAllScouts();
        } else {
          console.log(
            "DEBUG - saveScoutsOnly: forceSaveAllScouts não disponível",
          );
        }

        // Aguardar um pouco para garantir que o save foi processado
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Emite evento específico para salvar scouts sem redirecionamento
        this.$emit("saveScouts", this.form);
      } catch (error) {
        console.error("DEBUG - saveScoutsOnly: Erro ao salvar scouts:", error);
        // Emite evento mesmo com erro para não bloquear o fluxo
        this.$emit("saveScouts", this.form);
      }
    },

    async finishTraining() {
      // Mostrar modal de confirmação
      const result = await Swal.fire({
        title: "Finalizar Treino?",
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;">
              <strong>Deseja finalizar este treino?</strong>
            </p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Ao finalizar o treino, o status será alterado para <strong>"Finalizado"</strong>.
              </p>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
              Esta ação pode ser revertida editando o status do treino.
            </p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, finalizar!",
        confirmButtonColor: "#059669",
        cancelButtonColor: "#6b7280",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Emite evento para finalizar o treino
        this.$emit("finish", this.form);
      }
    },

    async unfinishTraining() {
      // Mostrar modal de confirmação
      const result = await Swal.fire({
        title: "Cancelar Finalização do Treino?",
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;">
              <strong>Deseja cancelar a finalização deste treino?</strong>
            </p>
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #d97706;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Ao cancelar a finalização, o status será alterado para <strong>"Agendado"</strong> e o treino poderá ser editado novamente.
              </p>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
              Esta ação pode ser revertida finalizando o treino novamente.
            </p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, cancelar finalização!",
        confirmButtonColor: "#d97706",
        cancelButtonColor: "#6b7280",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Emite evento para cancelar a finalização do treino
        this.$emit("unfinish", this.form);
      }
    },

    async cancelTraining() {
      // Mostrar modal de confirmação
      const result = await Swal.fire({
        title: "Cancelar Treino?",
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;">
              <strong>Deseja cancelar este treino?</strong>
            </p>
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 8px; border-left: 4px solid #dc2626;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Ao cancelar o treino, o status será alterado para <strong>"Cancelado"</strong> e os jogadores serão notificados.
              </p>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
              Esta ação pode ser revertida reativando o treino.
            </p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Sim, cancelar!",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        cancelButtonText: "Não, manter ativo",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Emite evento para cancelar o treino
        this.$emit("cancel", this.form);
      }
    },

    async uncancelTraining() {
      // Mostrar modal de confirmação
      const result = await Swal.fire({
        title: "Reativar Treino?",
        html: `
          <div style="text-align: left; padding: 10px 0;">
            <p style="margin-bottom: 15px; font-size: 16px;">
              <strong>Deseja reativar este treino?</strong>
            </p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #059669;">
              <p style="margin: 0; font-size: 14px; color: #374151;">
                Ao reativar o treino, o status será alterado para <strong>"Agendado"</strong> e o treino voltará a estar ativo.
              </p>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #6b7280;">
              Esta ação pode ser revertida cancelando o treino novamente.
            </p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sim, reativar!",
        confirmButtonColor: "#059669",
        cancelButtonColor: "#6b7280",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
      });

      if (result.isConfirmed) {
        // Emite evento para reativar o treino
        this.$emit("uncancel", this.form);
      }
    },
  },
};
</script>

<style scoped>
.form-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.form-container-full-width {
  align-items: stretch;
  padding: 0;
  max-width: 100%;
}

.training-form-card {
  width: 100%;
  max-width: 800px;
  padding: 0;
  background-color: transparent;
  border-radius: 12px;
  box-shadow: none;
  border: none;
}

/* Quando estiver na etapa 3 (scouts), expandir para usar toda a largura */
.training-form-card-full-width {
  max-width: 100% !important;
  width: 100% !important;
  padding: 0 !important;
  box-shadow: none !important;
  background-color: transparent !important;
  border: none !important;
}

.training-step-card {
  box-sizing: border-box;
  width: 100%;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  padding: 32px 28px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.training-step-card + .training-step-card {
  margin-top: 20px;
}

.training-form-card :deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
  color: #6b7280 !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  letter-spacing: 0.06em !important;
  text-transform: uppercase !important;
}

.training-form-card :deep(.va-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  letter-spacing: inherit !important;
  text-transform: inherit !important;
  color: inherit !important;
}

.training-form-card :deep(.va-input-wrapper input),
.training-form-card :deep(.va-input-wrapper textarea) {
  font-size: 14px !important;
  font-weight: 500 !important;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: #ff4e1b;
  border-radius: 2px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #0b1e3a;
  margin-top: 24px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.fundamental-section-hint {
  margin-top: -6px;
  margin-bottom: 12px;
}

.fundamentals-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0 1rem;
  font-size: 14px;
  color: #6b7280;
}

.fundamental-pick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-items: stretch;
}

.fundamental-pick-card {
  min-width: 0;
  width: 100%;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 14px;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.fundamental-pick-card:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.fundamental-pick-card--selected {
  background-color: #fff4ec;
  border-color: #ff4e1b;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.fundamental-pick-card-icon {
  flex-shrink: 0;
}

.fundamental-pick-card-title {
  font-weight: 600;
  font-size: 13px;
  color: #4b5563;
  line-height: 1.35;
}

.fundamental-pick-card--selected .fundamental-pick-card-title {
  color: #111827;
}

.fundamental-specific-heading {
  font-size: 15px;
  font-weight: 600;
  color: #0b1e3a;
  margin: 8px 0 0 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e9ecef;
}

.fundamental-empty-hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 8px 0;
  line-height: 1.45;
}

.training-status-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}

.training-status-wrapper--error .training-status-card {
  border-color: #fecaca;
}

.training-status-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.training-status-card {
  flex: 1 1 160px;
  min-width: 140px;
  max-width: 260px;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s,
    box-shadow 0.2s;
  outline: none;
}

.training-status-card:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.training-status-card--selected {
  background-color: #fff4ec;
  border-color: #ff4e1b;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.training-status-card.training-status-card--error:not(
    .training-status-card--selected
  ) {
  border-color: #e53e3e;
  background-color: #fef2f2;
}

.training-status-card-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.training-status-info {
  flex: 1;
  min-width: 0;
}

.training-status-title {
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 2px 0;
  line-height: 1.3;
  transition: color 0.2s;
}

.training-status-card--selected .training-status-title {
  color: #111827;
}

.training-status-card--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.training-status-card--disabled:focus-visible {
  outline: none;
}

.training-status-disabled-reason {
  font-size: 10px;
  color: #e53e3e;
  margin: 3px 0 0 0;
  line-height: 1.3;
}

.training-status-description {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.35;
}

.training-status-error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e53e3e;
  margin-top: 4px;
}

.subsection-description {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
}

.standalone-players-section {
  margin-bottom: 20px;
}

.players-list-simple {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.player-item-simple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.player-positions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.player-item-simple .position-tag {
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 11px;
  font-weight: 500;
  display: inline-block;
  background-color: #ff4e1b;
  color: white;
  line-height: 1.3;
}

.player-item-simple .no-positions {
  color: #9ca3af;
  font-size: 12px;
  font-style: italic;
}

.step-content {
  padding: 12px 0;
}

/* Etapa Marcação dos Scouts - largura total */
.step-content-full-width {
  padding: 0;
  width: 100%;
  max-width: 100%;
  margin: 0;
}

/* Ajustar o stepper na etapa de Marcação dos Scouts (última) */
.training-form-card-full-width .va-stepper {
  padding: 0 20px;
  margin-bottom: 0;
}

.training-form-card-full-width .va-stepper__content {
  padding: 0;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  width: 100%;
  max-width: 800px;
}

.bulk-edit-option {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.bulk-edit-title {
  font-size: 16px;
  font-weight: 600;
  color: #0c4a6e;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bulk-edit-title::before {
  content: "";
  width: 4px;
  height: 20px;
  background: #ff4e1b;
  border-radius: 2px;
}

.bulk-edit-radios-container {
  margin-bottom: 12px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.radio-option-label {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  cursor: pointer;
  user-select: none;
}

.radio-option-label:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.radio-input-native {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #ff4e1b;
  flex-shrink: 0;
}

.radio-label-text {
  font-size: 14px;
  color: #0c4a6e;
  font-weight: 500;
  cursor: pointer;
  flex: 1;
}

.bulk-edit-hint {
  font-size: 13px;
  color: #075985;
  margin: 12px 0 0 0;
  line-height: 1.6;
  padding-top: 12px;
  border-top: 1px solid rgba(186, 230, 253, 0.5);
}

.action-buttons va-button {
  border-radius: 8px;
}

.form-container-full-width .action-buttons {
  max-width: 100%;
  padding: 0 20px;
}

@media (max-width: 768px) {
  .fundamental-pick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .action-buttons {
    flex-direction: column;
    width: 100%;
    max-width: 100%;
  }

  .action-buttons va-button {
    width: 100%;
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .fundamental-pick-grid {
    grid-template-columns: 1fr;
  }
}
</style>
