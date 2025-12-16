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
            class="mb-3"
            :error="errorFields.includes('name')"
            :error-messages="errors.name || []"
          />
          <ZEmailInput
            v-model="form.email"
            label="E-mail"
            id="email"
            class="mb-3"
            :error="errorFields.includes('email')"
            :error-messages="errors.email || ''"
          />
          <ZPasswordInput
            v-model="form.password"
            name="password"
            label="Nova Senha"
            id="password"
            class="mb-3"
            :error="errorFields.includes('password')"
            :error-messages="errors.password || []"
          />
          <ZPasswordInput
            v-model="form.confirmPassword"
            name="confirmPassword"
            label="Confirmar Nova Senha"
            id="confirmPassword"
            class="mb-3"
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
</style>
