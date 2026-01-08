<template>
  <div class="form-container">
    <!-- Header com Foto do Usuário -->
    <div class="user-profile-header">
      <div class="profile-avatar-wrapper">
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

    <va-form ref="myForm" class="flex flex-col gap-6 mb-2">
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
            :error="errorFields.includes('name')"
            :error-messages="errors.name || []"
          />
          <div class="nickname-section mb-3" :class="{ active: form.showNickname }">
            <div class="nickname-header">
              <div class="nickname-icon-wrapper">
                <va-icon name="badge" size="20px" color="#E9742B" />
              </div>
              <div class="nickname-title-group">
                <label class="nickname-label">Apelido</label>
                <p class="nickname-description">
                  {{ form.showNickname ? 'Será exibido no lugar do nome completo' : 'Opcional - apenas para referência' }}
                </p>
              </div>
            </div>
            <div class="nickname-content">
              <ZTextInput
                v-model="form.nickname"
                name="nickname"
                label=""
                id="nickname"
                class="nickname-input"
                placeholder="Digite o apelido do jogador"
                :error="errorFields.includes('nickname')"
                :error-messages="errors.nickname || []"
              />
              <div class="switch-container">
                <div class="switch-label-group">
                  <va-icon 
                    :name="form.showNickname ? 'visibility' : 'visibility_off'" 
                    size="16px" 
                    :color="form.showNickname ? '#E9742B' : '#9CA3AF'"
                  />
                  <span class="switch-label-text">Exibir apelido</span>
                </div>
                <va-switch
                  v-model="form.showNickname"
                  color="primary"
                  size="small"
                />
              </div>
            </div>
          </div>
          <ZEmailInput
            v-model="form.email"
            label="E-mail"
            id="email"
            class="mb-3 email-field"
            :error="errorFields.includes('email')"
            :error-messages="errors.email || ''"
          />
          <ZPasswordInput
            v-model="form.password"
            name="password"
            label="Nova Senha"
            id="password"
            class="mb-3 password-field"
            :error="errorFields.includes('password')"
            :error-messages="errors.password || []"
          />
          <ZPasswordInput
            v-model="form.confirmPassword"
            name="confirmPassword"
            label="Confirmar Nova Senha"
            id="confirmPassword"
            class="mb-3 password-field"
            :error="errorFields.includes('confirmPassword')"
            :error-messages="errors.confirmPassword || []"
          />
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
            clearable
          />
          <ZPhoneInput v-model="form.phone" label="Celular" class="mb-3" />
          <ZCPFInput v-model="form.cpf" label="CPF" class="mb-3" />
          <ZRGInput v-model="form.rg" label="RG" class="mb-3" />
        </div>
      </va-card>

      <!-- Card: Posições -->
      <va-card class="info-card">
        <h2 class="section-title">Posições</h2>
        <ZListRelationPositions
          :items="form.positions || []"
          :selected-value="positions"
          @add="addPositions"
          @delete="actionDeletePosition"
        >
          <template #filter>
            <ZSelectPosition
              v-model="positions"
              class="mb-3"
              label="Posições"
              :ignore-ids="(form.positions || []).map((item) => item.id)"
            />
          </template>
        </ZListRelationPositions>
      </va-card>

      <!-- Card: Permissão no Sistema -->
      <va-card class="info-card">
        <h2 class="section-title">Permissão no Sistema</h2>
        <div class="permissions-grid">
          <div
            v-for="role in rolesOptions"
            :key="role.id"
            :class="[
              'permission-card',
              {
                selected:
                  Array.isArray(form.roles) && form.roles.includes(role.id),
              },
            ]"
            @click="selectRole(role.id)"
          >
            <div class="permission-icon">
              <div
                style="
                  background-color: #fff4ec;
                  border-radius: 50%;
                  width: 40px;
                  height: 40px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  border: 1px solid #ffe3d1;
                "
              >
                <va-icon :name="role.iconName" color="#E9742B" size="20px" />
              </div>
            </div>
            <div class="permission-info">
              <h4 class="permission-title">{{ role.title }}</h4>
              <p class="permission-description">{{ role.description }}</p>
            </div>
            <div
              v-if="Array.isArray(form.roles) && form.roles.includes(role.id)"
              class="permission-check"
            >
              <i class="icon-check"></i>
            </div>
          </div>
        </div>
      </va-card>

      <!-- Botões -->
      <div class="action-buttons">
        <va-button color="secondary" @click="goBack" class="mr-1"
          >Voltar</va-button
        >
        <va-button color="primary" @click="save()">Salvar</va-button>
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
import ZListRelationPositions from "~/components/organisms/List/Relations/ZListRelationPositions";
import ZSelectPosition from "~/components/molecules/Selects/ZSelectPosition";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

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
    ZListRelationPositions,
    ZSelectPosition,
  },

  data() {
    return {
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      form: {
        ...this.data,
        positions: Array.isArray(this.data.positions)
          ? this.data.positions
          : [],
      },
      positions: [],
      rolesOptions: [
        {
          id: 1,
          title: "Administrador",
          description: "Acesso completo",
          iconName: "shield",
        },
        {
          id: 2,
          title: "Técnico",
          description: "Gerenciar treinos",
          iconName: "layers",
        },
        {
          id: 3,
          title: "Jogador",
          description: "Acesso limitado",
          iconName: "person",
        },
        {
          id: 4,
          title: "Exemplo Vôlei",
          description: "Permissão de exemplo",
          iconName: "sports_volleyball",
        },
      ],
    };
  },

  computed: {
    firstLetter() {
      if (!this.form.name) return "";
      return this.form.name.trim().charAt(0).toUpperCase();
    },
    avatarColor() {
      return "#e9742b";
    },
  },

  watch: {
    data(val) {
      if (val.information) {
        val.birthDate = val.information.birthDate ?? null;
        val.nickname = val.information.nickname ?? "";
        val.showNickname = val.information.showNickname ?? false;
      }
      // Garantir que roles, positions e teams sejam sempre arrays
      if (!Array.isArray(val.roles)) {
        val.roles = [];
      }
      if (!Array.isArray(val.positions)) {
        val.positions = [];
      }
      if (!Array.isArray(val.teams)) {
        val.teams = [];
      }
      this.form = {
        ...val,
        positions: Array.isArray(val.positions) ? val.positions : [],
        nickname: val.nickname || "",
        showNickname: val.showNickname ?? false,
      };
    },
  },

  methods: {
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
    addPositions() {
      if (
        !this.positions ||
        (Array.isArray(this.positions) && this.positions.length === 0)
      ) {
        return;
      }

      if (!Array.isArray(this.form.positions)) {
        this.form.positions = [];
      }

      // ZSelect retorna array de objetos {text, value}
      const transformedPositions = Array.isArray(this.positions)
        ? this.positions.map((item) => {
            return {
              id: item.value,
              name: item.text,
            };
          })
        : [
            {
              id: this.positions.value,
              name: this.positions.text,
            },
          ];

      transformedPositions.forEach((newPosition) => {
        const isAlreadyAdded = this.form.positions.some(
          (existingPosition) => existingPosition.id === newPosition.id
        );

        if (!isAlreadyAdded) {
          this.form.positions.push(newPosition);
        }
      });

      this.positions = [];
    },
    actionDeletePosition(position) {
      if (!Array.isArray(this.form.positions)) {
        this.form.positions = [];
      }
      this.form.positions = this.form.positions.filter(
        (p) => p.id !== position.id
      );
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

.info-card {
  width: 100%;
  padding: 30px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
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
  background: #e9742b;
  border-radius: 2px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
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

.action-buttons {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  margin-top: 20px;
  padding-top: 20px;
}

.action-buttons va-button {
  border-radius: 8px;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.permission-card {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: border-color 0.3s, background-color 0.3s;
}

.permission-card.selected {
  background-color: #e7f1ff;
  border-color: #7ab8ff;
}

.permission-icon {
  background-color: #ffffff;
  border: 2px solid #ff7a00;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.permission-info {
  flex-grow: 1;
}

.permission-title {
  font-weight: bold;
  color: #1a1a1a;
}

.permission-description {
  color: #9ca3af;
}

.permission-check {
  color: #007bff;
}

.nickname-section {
  grid-column: span 2;
  background: linear-gradient(135deg, #FFF9F5 0%, #FFFFFF 100%);
  border: 2px solid #FFE3D1;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.nickname-section.active {
  background: linear-gradient(135deg, #FFF4EC 0%, #FFFFFF 100%);
  border-color: #E9742B;
  box-shadow: 0 4px 12px rgba(233, 116, 43, 0.1);
}

.nickname-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.nickname-icon-wrapper {
  width: 40px;
  height: 40px;
  background: #FFF4EC;
  border: 2px solid #FFE3D1;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.nickname-section.active .nickname-icon-wrapper {
  background: #E9742B;
  border-color: #E9742B;
}

.nickname-section.active .nickname-icon-wrapper :deep(.va-icon) {
  color: white !important;
}

.nickname-title-group {
  flex: 1;
}

.nickname-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.nickname-description {
  font-size: 12px;
  color: #6B7280;
  margin: 0;
  line-height: 1.4;
  transition: color 0.3s ease;
}

.nickname-section.active .nickname-description {
  color: #E9742B;
  font-weight: 500;
}

.nickname-content {
  display: flex;
  align-items: flex-end;
  gap: 16px;
}

.nickname-input {
  flex: 1;
}

.switch-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-bottom: 4px;
  flex-shrink: 0;
}

.switch-label-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.switch-label-text {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  white-space: nowrap;
  transition: color 0.3s ease;
}

.nickname-section.active .switch-label-text {
  color: #E9742B;
}

@media (max-width: 768px) {
  .nickname-content {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .switch-container {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #E5E7EB;
  }

  .switch-label-group {
    order: 2;
  }
}
</style>
