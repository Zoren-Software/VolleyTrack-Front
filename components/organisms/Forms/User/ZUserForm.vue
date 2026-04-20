<template>
  <div class="form-container">
    <!-- Header com Foto do Usuário (avatar só fora do wizard de cadastro) -->
    <div
      :class="['user-profile-header', { 'user-profile-header--wizard': useWizard }]"
    >
      <div v-if="!useWizard" class="profile-avatar-wrapper">
        <va-avatar class="profile-avatar" size="large" :color="avatarColor">
          <template v-if="form.name && firstLetter">
            {{ firstLetter }}
          </template>
          <va-icon v-else name="person" size="48px" />
        </va-avatar>
      </div>
      <h1 class="page-title">{{ headerTitle }}</h1>
      <p class="page-subtitle">
        {{ headerSubtitle }}
      </p>
    </div>

    <va-form
      ref="myForm"
      :class="[
        'flex',
        'flex-col',
        'mb-2',
        'w-full',
        useWizard ? 'user-form-gap--wizard' : 'gap-6',
      ]"
    >
      <template v-if="!useWizard">
      <!-- Card: Informações Essenciais -->
      <va-card class="info-card">
        <h2 class="section-title">Informações Essenciais</h2>
        <div class="form-grid">
          <ZTextInput
            v-model="form.name"
            name="name"
            label="Nome Completo"
            id="name"
            class="mb-3 name-field"
            placeholder="Digite o nome completo"
            :error="errorFields.includes('name')"
            :error-messages="errors.name || []"
          />
          <div class="nickname-field mb-3">
            <div class="nickname-input-row">
              <ZTextInput
                v-model="form.nickname"
                name="nickname"
                label="Apelido"
                id="nickname"
                class="nickname-input-grow"
                placeholder="Digite o apelido do jogador"
                :error="errorFields.includes('nickname')"
                :error-messages="errors.nickname || []"
              />
              <div
                class="nickname-toggle-wrap"
                role="group"
                aria-label="Exibição do apelido no lugar do nome"
              >
                <div class="nickname-toggle-row">
                  <va-switch
                    id="nickname-show-switch"
                    v-model="form.showNickname"
                    color="primary"
                    size="small"
                  />
                  <label
                    class="nickname-toggle-label"
                    for="nickname-show-switch"
                    >Exibir no lugar do nome completo</label
                  >
                </div>
              </div>
            </div>
          </div>
          <ZEmailInput
            v-model="form.email"
            label="E-mail"
            id="email"
            class="mb-3 email-field"
            placeholder="nome@exemplo.com"
            :error="errorFields.includes('email')"
            :error-messages="errors.email || ''"
          />
          <template v-if="!hidePasswordFields">
            <ZPasswordInput
              v-model="form.password"
              name="password"
              password-label="Nova Senha"
              id="password"
              class="mb-3 password-field"
              placeholder="Digite a nova senha"
              :error="errorFields.includes('password')"
              :error-messages="errors.password || []"
            />
            <ZPasswordInput
              v-model="form.confirmPassword"
              name="confirmPassword"
              password-label="Confirmar Nova Senha"
              id="confirmPassword"
              class="mb-3 password-field"
              placeholder="Digite novamente a senha"
              :error="errorFields.includes('confirmPassword')"
              :error-messages="errors.confirmPassword || []"
            />
          </template>
        </div>
      </va-card>

      <!-- Card: Informações Pessoais -->
      <va-card class="info-card">
        <h2 class="section-title">Informações Pessoais</h2>
        <div class="form-grid">
          <ZDate
            v-model="form.birthDate"
            id="birthDate"
            label="Data de Nascimento"
            class="mb-3"
            placeholder="DD/MM/AAAA"
            clearable
          />
          <ZPhoneInput
            v-model="form.phone"
            label="Celular"
            class="mb-3"
            placeholder="(00) 00000-0000"
          />
          <ZCPFInput
            v-model="form.cpf"
            label="CPF"
            class="mb-3"
            placeholder="000.000.000-00"
          />
          <ZRGInput
            v-model="form.rg"
            label="RG"
            class="mb-3"
            placeholder="00.000.000-0"
          />
        </div>
      </va-card>

      <!-- Card: Posições -->
      <va-card class="info-card">
        <h2 class="section-title">Posições</h2>
        <div v-if="positionsLoading" class="positions-loading">
          <va-progress-circle indeterminate size="small" />
          <span>Carregando posições...</span>
        </div>
        <div v-else class="positions-checkbox-section">
          <div
            class="positions-checkbox-list"
            role="group"
            aria-label="Posições do jogador"
          >
            <label
              v-for="pos in positionsOptions"
              :key="pos.id"
              :class="[
                'position-checkbox-card',
                {
                  'position-checkbox-card--selected':
                    isPositionChecked(pos.id),
                },
              ]"
            >
              <input
                type="checkbox"
                class="position-checkbox-input"
                :checked="isPositionChecked(pos.id)"
                @change="togglePosition(pos)"
              />
              <span class="position-checkbox-label">{{ pos.name }}</span>
            </label>
          </div>
        </div>
      </va-card>

      <!-- Card: Permissão no Sistema -->
      <va-card
        :class="['info-card', { 'info-card--error': errorFields.includes('roleId') }]"
      >
        <h2 class="section-title">Permissão no Sistema</h2>
        <div v-if="rolesLoading" class="permissions-loading">
          <va-progress-circle indeterminate size="small" />
          <span>Carregando funções...</span>
        </div>
        <div v-else class="permissions-wrapper">
          <div class="permissions-grid">
            <div
              v-for="role in rolesOptions"
              :key="role.id"
              :class="[
                'permission-card',
                {
                  'permission-card--selected':
                    Array.isArray(form.roles) && form.roles.includes(role.id),
                  'permission-card--error': errorFields.includes('roleId'),
                },
              ]"
              @click="selectRole(role.id)"
            >
              <va-icon
                class="permission-card-icon"
                :name="role.iconName"
                :color="
                  Array.isArray(form.roles) && form.roles.includes(role.id)
                    ? '#FF4E1B'
                    : '#9CA3AF'
                "
                size="22px"
              />
              <div class="permission-info">
                <h4 class="permission-title">{{ role.title }}</h4>
                <p class="permission-description">{{ role.description }}</p>
              </div>
            </div>
          </div>
          <div
            v-if="errorFields.includes('roleId') && errors.roleId && errors.roleId.length"
            class="permission-error-message"
          >
            <va-icon name="error" size="small" color="danger" />
            <span>{{ (errors.roleId || []).join(' ') }}</span>
          </div>
        </div>
      </va-card>

      </template>

      <template v-else>
        <va-stepper
          v-model="wizardStep"
          :steps="wizardSteps"
          controls-hidden
          class="user-form-stepper"
        >
          <template #step-content-0>
            <div class="wizard-step-inner">
              <va-card class="info-card">
                <h2 class="section-title">Informações Essenciais</h2>
                <div class="form-grid">
                  <ZTextInput
                    v-model="form.name"
                    name="name"
                    label="Nome Completo"
                    id="name"
                    class="mb-3 name-field"
                    placeholder="Digite o nome completo"
                    :error="errorFields.includes('name')"
                    :error-messages="errors.name || []"
                  />
                  <div class="nickname-field mb-3">
                    <div class="nickname-input-row">
                      <ZTextInput
                        v-model="form.nickname"
                        name="nickname"
                        label="Apelido"
                        id="nickname"
                        class="nickname-input-grow"
                        placeholder="Digite o apelido do jogador"
                        :error="errorFields.includes('nickname')"
                        :error-messages="errors.nickname || []"
                      />
                      <div
                        class="nickname-toggle-wrap"
                        role="group"
                        aria-label="Exibição do apelido no lugar do nome"
                      >
                        <div class="nickname-toggle-row">
                          <va-switch
                            id="nickname-show-switch"
                            v-model="form.showNickname"
                            color="primary"
                            size="small"
                          />
                          <label
                            class="nickname-toggle-label"
                            for="nickname-show-switch"
                            >Exibir no lugar do nome completo</label
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                  <ZEmailInput
                    v-model="form.email"
                    label="E-mail"
                    id="email"
                    class="mb-3 email-field"
                    placeholder="nome@exemplo.com"
                    :error="errorFields.includes('email')"
                    :error-messages="errors.email || ''"
                  />
                  <template v-if="!hidePasswordFields">
                    <ZPasswordInput
                      v-model="form.password"
                      name="password"
                      password-label="Nova Senha"
                      id="password"
                      class="mb-3 password-field"
                      placeholder="Digite a nova senha"
                      :error="errorFields.includes('password')"
                      :error-messages="errors.password || []"
                    />
                    <ZPasswordInput
                      v-model="form.confirmPassword"
                      name="confirmPassword"
                      password-label="Confirmar Nova Senha"
                      id="confirmPassword"
                      class="mb-3 password-field"
                      placeholder="Digite novamente a senha"
                      :error="errorFields.includes('confirmPassword')"
                      :error-messages="errors.confirmPassword || []"
                    />
                  </template>
                </div>
              </va-card>

              <va-card
                :class="['info-card', { 'info-card--error': errorFields.includes('roleId') }]"
              >
                <h2 class="section-title">Permissão no Sistema</h2>
                <div v-if="rolesLoading" class="permissions-loading">
                  <va-progress-circle indeterminate size="small" />
                  <span>Carregando funções...</span>
                </div>
                <div v-else class="permissions-wrapper">
                  <div class="permissions-grid">
                    <div
                      v-for="role in rolesOptions"
                      :key="role.id"
                      :class="[
                        'permission-card',
                        {
                          'permission-card--selected':
                            Array.isArray(form.roles) && form.roles.includes(role.id),
                          'permission-card--error': errorFields.includes('roleId'),
                        },
                      ]"
                      @click="selectRole(role.id)"
                    >
                      <va-icon
                        class="permission-card-icon"
                        :name="role.iconName"
                        :color="
                          Array.isArray(form.roles) && form.roles.includes(role.id)
                            ? '#FF4E1B'
                            : '#9CA3AF'
                        "
                        size="22px"
                      />
                      <div class="permission-info">
                        <h4 class="permission-title">{{ role.title }}</h4>
                        <p class="permission-description">{{ role.description }}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="errorFields.includes('roleId') && errors.roleId && errors.roleId.length"
                    class="permission-error-message"
                  >
                    <va-icon name="error" size="small" color="danger" />
                    <span>{{ (errors.roleId || []).join(' ') }}</span>
                  </div>
                </div>
              </va-card>
            </div>
          </template>

          <template #step-content-1>
            <div class="wizard-step-inner">
              <va-card class="info-card">
                <h2 class="section-title">Informações Pessoais</h2>
                <div class="form-grid">
                  <ZDate
                    v-model="form.birthDate"
                    id="birthDate"
                    label="Data de Nascimento"
                    class="mb-3"
                    placeholder="DD/MM/AAAA"
                    clearable
                  />
                  <ZPhoneInput
                    v-model="form.phone"
                    label="Celular"
                    class="mb-3"
                    placeholder="(00) 00000-0000"
                  />
                  <ZCPFInput
                    v-model="form.cpf"
                    label="CPF"
                    class="mb-3"
                    placeholder="000.000.000-00"
                  />
                  <ZRGInput
                    v-model="form.rg"
                    label="RG"
                    class="mb-3"
                    placeholder="00.000.000-0"
                  />
                </div>
              </va-card>
            </div>
          </template>

          <template #step-content-2>
            <div class="wizard-step-inner">
              <va-card class="info-card">
                <h2 class="section-title">Posições</h2>
                <div v-if="positionsLoading" class="positions-loading">
                  <va-progress-circle indeterminate size="small" />
                  <span>Carregando posições...</span>
                </div>
                <div v-else class="positions-checkbox-section">
                  <div
                    class="positions-checkbox-list"
                    role="group"
                    aria-label="Posições do jogador"
                  >
                    <label
                      v-for="pos in positionsOptions"
                      :key="pos.id"
                      :class="[
                        'position-checkbox-card',
                        {
                          'position-checkbox-card--selected':
                            isPositionChecked(pos.id),
                        },
                      ]"
                    >
                      <input
                        type="checkbox"
                        class="position-checkbox-input"
                        :checked="isPositionChecked(pos.id)"
                        @change="togglePosition(pos)"
                      />
                      <span class="position-checkbox-label">{{ pos.name }}</span>
                    </label>
                  </div>
                </div>
              </va-card>
            </div>
          </template>
        </va-stepper>
      </template>

      <!-- Botões -->
      <div :class="['action-buttons', { 'action-buttons--wizard': useWizard }]">
        <va-button
          v-if="useWizard && wizardStep > 0"
          color="secondary"
          class="mr-1"
          @click="wizardStep--"
        >
          Anterior
        </va-button>
        <va-button
          v-else
          color="secondary"
          class="mr-1"
          @click="goBack"
        >
          Voltar
        </va-button>
        <va-button
          v-if="useWizard && wizardStep < 2"
          color="primary"
          @click="wizardStep++"
        >
          Próximo
        </va-button>
        <va-button
          v-else
          color="primary"
          :loading="loading"
          @click="save()"
        >
          Salvar
        </va-button>
      </div>
    </va-form>
  </div>
</template>

<script>
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZPhoneInput from "~/components/molecules/Inputs/ZPhoneInput";
import ZCPFInput from "~/components/molecules/Inputs/ZCPFInput";
import ZRGInput from "~/components/molecules/Inputs/ZRGInput";
import ZDate from "~/components/atoms/Inputs/ZDate";
import ZSelectRole from "~/components/molecules/Selects/ZSelectRole";
import ROLES from "~/graphql/role/query/roles.graphql";
import POSITIONS from "~/graphql/position/query/positions.graphql";
import { gql } from "@apollo/client/core";
import { useNuxtApp } from "#app";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

const ROLE_ICONS = {
  Administrador: "shield",
  Técnico: "layers",
  Jogador: "person",
};

const ROLE_DESCRIPTIONS = {
  Administrador: "Acesso completo",
  Técnico: "Gerenciar treinos",
  Jogador: "Acesso limitado",
};

export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          cpf: "",
          rg: "",
          phone: "",
          birthDate: null,
          nickname: "",
          showNickname: false,
          roles: [],
          positions: [],
          teams: [],
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
          email: [],
          password: [],
          confirmPassword: [],
          cpf: [],
          rg: [],
          phone: [],
          birthDate: null,
          roleId: [],
        };
      },
    },
    headerTitle: {
      type: String,
      default: "Informações da Conta",
    },
    headerSubtitle: {
      type: String,
      default:
        "Mantenha seus dados atualizados para melhor experiência no sistema.",
    },
    useWizard: {
      type: Boolean,
      default: false,
    },
    hidePasswordFields: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    ZPasswordInput,
    ZEmailInput,
    ZPhoneInput,
    ZTextInput,
    ZCPFInput,
    ZRGInput,
    ZDate,
    ZSelectRole,
  },

  data() {
    return {
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      form: {
        ...this.data,
        positions: this.normalizePositions(this.data.positions),
      },
      positionsOptions: [],
      rolesOptions: [],
      rolesLoading: false,
      positionsLoading: false,
      wizardStep: 0,
    };
  },

  async mounted() {
    await Promise.all([this.fetchRoles(), this.fetchPositions()]);
  },

  computed: {
    firstLetter() {
      if (!this.form.name) return "";
      return this.form.name.trim().charAt(0).toUpperCase();
    },
    avatarColor() {
      return "#FF4E1B";
    },
    wizardSteps() {
      return [
        { label: "Informações e permissão" },
        { label: "Informações pessoais" },
        { label: "Posições" },
      ];
    },
  },

  watch: {
    data(val) {
      if (val.information) {
        val.birthDate = val.information.birthDate ?? null;
        val.nickname = val.information.nickname ?? "";
        val.showNickname = val.information.showNickname ?? false;
      }
      // Garantir que roles, positions e teams sejam sempre arrays (ids de role como string para bater com a API)
      if (!Array.isArray(val.roles)) {
        val.roles = [];
      } else {
        val.roles = val.roles.map((id) => String(id));
      }
      if (!Array.isArray(val.positions)) {
        val.positions = [];
      }
      if (!Array.isArray(val.teams)) {
        val.teams = [];
      }
      this.form = {
        ...val,
        positions: this.normalizePositions(val.positions),
        nickname: val.nickname || "",
        showNickname: val.showNickname ?? false,
      };
    },
  },

  methods: {
    normalizePositions(positions) {
      if (!Array.isArray(positions) || positions.length === 0) {
        return [];
      }
      return positions.map((p) => ({
        id: Number(p.id),
        name: p.name,
      }));
    },
    isPositionChecked(posId) {
      if (!Array.isArray(this.form.positions)) {
        return false;
      }
      return this.form.positions.some((p) => p.id === posId);
    },
    togglePosition(pos) {
      if (!Array.isArray(this.form.positions)) {
        this.form.positions = [];
      }
      const idx = this.form.positions.findIndex((p) => p.id === pos.id);
      if (idx >= 0) {
        this.form.positions.splice(idx, 1);
      } else {
        this.form.positions.push({ id: pos.id, name: pos.name });
      }
    },
    async fetchPositions() {
      this.positionsLoading = true;
      try {
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          console.error("ZUserForm - Cliente Apollo não encontrado");
          return;
        }
        const query = gql`
          ${POSITIONS}
        `;
        const perPage = 50;
        let page = 1;
        let hasMore = true;
        const all = [];
        while (hasMore) {
          const result = await apolloClient.query({
            query,
            variables: {
              filter: { search: "%%" },
              first: perPage,
              page,
            },
            fetchPolicy: "network-only",
          });
          const payload = result?.data?.positions;
          const rows = payload?.data ?? [];
          for (const item of rows) {
            all.push({
              id: Number(item.id),
              name: item.name,
            });
          }
          hasMore = Boolean(payload?.paginatorInfo?.hasMorePages);
          page += 1;
        }
        this.positionsOptions = all;
      } catch (err) {
        console.error("Erro ao carregar posições:", err);
      } finally {
        this.positionsLoading = false;
      }
    },
    async fetchRoles() {
      this.rolesLoading = true;
      try {
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          console.error("ZUserForm - Cliente Apollo não encontrado");
          return;
        }
        const query = gql`
          ${ROLES}
        `;
        const result = await apolloClient.query({
          query,
          variables: { filter: {}, first: 10, page: 1 },
        });
        const data = result?.data?.roles?.data ?? [];
        this.rolesOptions = data.map((role) => ({
          id: role.id,
          title: role.name,
          description:
            ROLE_DESCRIPTIONS[role.name] ?? "",
          iconName: ROLE_ICONS[role.name] ?? "badge",
        }));
      } catch (err) {
        console.error("Erro ao carregar roles:", err);
      } finally {
        this.rolesLoading = false;
      }
    },
    async save() {
      this.$emit("save", this.form);
    },
    selectRole(roleId) {
      if (!Array.isArray(this.form.roles)) {
        this.form.roles = [];
      }
      if (this.form.roles.includes(roleId)) {
        this.form.roles = this.form.roles.filter((id) => id !== roleId);
      } else {
        this.form.roles.push(roleId);
      }
    },
    goBack() {
      this.$router.push("/players");
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
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* Header com Foto do Usuário */
.user-profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 40px;
  padding: 30px 20px;
  text-align: center;
}

.profile-avatar-wrapper {
  margin-bottom: 24px;
}

.profile-avatar {
  width: 120px !important;
  height: 120px !important;
  font-size: 48px !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 4px solid white;
  color: white !important;
}

.profile-avatar :deep(*) {
  color: white !important;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
}

.user-profile-header--wizard {
  margin-bottom: 0.75rem;
  padding: 0.5rem 12px 0;
  text-align: center;
  align-items: center;
}

.user-profile-header--wizard .page-title {
  font-size: 26px;
  margin: 0 0 6px 0;
}

.user-profile-header--wizard .page-subtitle {
  font-size: 15px;
  line-height: 1.45;
  max-width: none;
}

.info-card {
  width: 100%;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
}

.info-card.info-card--error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 1px #e53e3e;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title::before {
  content: "";
  width: 4px;
  height: 24px;
  background: #FF4E1B;
  border-radius: 2px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem 1.25rem;
}

.name-field,
.email-field {
  grid-column: span 2;
}

.password-field {
  grid-column: span 1;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .name-field,
  .email-field,
  .password-field {
    grid-column: span 1;
  }
}

/* Remover borda estranha das labels dos inputs */
.form-container :deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.form-container :deep(.va-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* Remover borda das labels do date input também */
.form-container :deep(.va-date-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.form-container :deep(.va-date-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.form-container :deep(.va-input-wrapper__label),
.form-container :deep(.va-date-input-wrapper__label) {
  color: #6b7280 !important;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin-top: 20px;
  padding-top: 20px;
}

.action-buttons--wizard {
  margin-top: 0;
  padding-top: 0.5rem;
}

.action-buttons va-button {
  border-radius: 8px;
}

.user-form-gap--wizard {
  gap: 0.5rem;
}

.user-form-stepper {
  width: 100%;
  /* Alinha o card com a área dos botões (remove padding lateral do stepper) */
  --va-stepper-step-content-wrapper-padding: 0;
  --va-stepper-step-content-margin: 0.35rem 0 0;
}

.user-form-stepper :deep(.va-stepper__content) {
  padding-top: 4px;
  padding-bottom: 0;
}

.wizard-step-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.wizard-step-inner .info-card:last-child {
  margin-bottom: 0;
}

.permissions-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 0;
}

.permissions-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.permission-card {
  flex: 1 1 140px;
  min-width: 130px;
  max-width: 200px;
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
}

.permission-card--selected {
  background-color: #fff4ec;
  border-color: #ff4e1b;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.permission-card.permission-card--error {
  border-color: #e53e3e;
  background-color: #fef2f2;
}

.permission-card.permission-card--error.permission-card--selected {
  border-color: #e53e3e;
  background-color: #fef2f2;
}

.permissions-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.permission-error-message {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #e53e3e;
  margin-top: 4px;
}

.permission-card-icon {
  flex-shrink: 0;
  margin-top: 1px;
}

.permission-info {
  flex: 1;
  min-width: 0;
}

.permission-title {
  font-weight: 600;
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 2px 0;
  line-height: 1.3;
  transition: color 0.2s;
}

.permission-card--selected .permission-title {
  color: #111827;
}

.permission-description {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.35;
}

.nickname-field {
  grid-column: span 2;
}

.nickname-input-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px 20px;
  align-items: start;
}

.nickname-input-grow {
  min-width: 0;
  width: 100%;
}

.nickname-toggle-wrap {
  padding-top: 1.625rem;
  max-width: min(300px, 100%);
}

.nickname-toggle-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.nickname-toggle-label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  line-height: 1.35;
  margin: 0;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

@media (max-width: 768px) {
  .nickname-input-row {
    grid-template-columns: 1fr;
  }

  .nickname-toggle-wrap {
    padding-top: 0;
    max-width: none;
  }

  .nickname-toggle-row {
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
  }

  .nickname-toggle-label {
    flex: 1;
    min-width: 0;
  }
}

.positions-loading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0 1rem;
  color: #6b7280;
  font-size: 14px;
}

.positions-checkbox-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.positions-field-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #FF4E1B;
  margin-bottom: 4px;
}

.positions-checkbox-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  align-items: stretch;
}

.position-checkbox-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
  background: #fff;
  flex: 0 1 auto;
  min-width: 0;
}

.position-checkbox-card:hover {
  border-color: #ffe3d1;
  background: #fffdfb;
}

.position-checkbox-card--selected {
  border-color: #FF4E1B;
  background: #fff4ec;
  box-shadow: 0 0 0 1px rgba(255, 78, 27, 0.2);
}

.position-checkbox-input {
  width: 18px;
  height: 18px;
  accent-color: #FF4E1B;
  cursor: pointer;
  flex-shrink: 0;
}

.position-checkbox-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  white-space: nowrap;
}
</style>
