<template>
  <div class="user-form">
    <!-- Card: Informações Essenciais -->
    <va-card class="card">
      <div class="card-header">
        <div class="icon-circle">
          <i class="icon-essential"></i>
        </div>
        <h3 class="card-title">Informações Essenciais</h3>
      </div>
      <va-form ref="myForm" class="form-grid">
        <ZTextInput
          v-model="form.name"
          name="name"
          label="Nome Completo"
          id="name"
          class="form-field"
          :error="errorFields.includes('name')"
          :error-messages="errors.name || []"
        />
        <ZEmailInput
          v-model="form.email"
          label="E-mail"
          id="email"
          class="form-field"
          :error="errorFields.includes('email')"
          :error-messages="errors.email || ''"
        />
        <ZPasswordInput
          v-model="form.password"
          name="password"
          label="Nova Senha"
          id="password"
          class="form-field"
          :error="errorFields.includes('password')"
          :error-messages="errors.password || []"
        />
        <ZPasswordInput
          v-model="form.confirmPassword"
          name="confirmPassword"
          label="Confirmar Nova Senha"
          id="confirmPassword"
          class="form-field"
          :error="errorFields.includes('confirmPassword')"
          :error-messages="errors.confirmPassword || []"
        />
      </va-form>
    </va-card>

    <!-- Card: Informações Pessoais -->
    <va-card class="card">
      <div class="card-header">
        <div class="icon-circle">
          <i class="icon-personal"></i>
        </div>
        <h3 class="card-title">Informações Pessoais</h3>
      </div>
      <va-form class="form-grid">
        <ZDate
          v-model="form.birthDate"
          id="birthDate"
          label="Data de Nascimento"
          class="form-field"
          clearable
        />
        <ZPhoneInput v-model="form.phone" label="Celular" class="form-field" />
        <ZCPFInput v-model="form.cpf" label="CPF" class="form-field" />
        <ZRGInput v-model="form.rg" label="RG" class="form-field" />
      </va-form>
    </va-card>

    <!-- Card: Permissão no Sistema -->
    <va-card class="card">
      <div class="card-header">
        <div class="icon-circle">
          <i class="icon-permissions"></i>
        </div>
        <h3 class="card-title">Permissão no Sistema</h3>
      </div>
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

    <!-- Botão de Salvar -->
    <div class="action-buttons">
      <va-button color="primary" class="save-button" @click="save()"
        >Salvar</va-button
      >
    </div>
  </div>
</template>

<script>
import { useForm } from "vuestic-ui";
import ZPasswordInput from "~/components/molecules/Inputs/ZPasswordInput";
import ZTextInput from "~/components/molecules/Inputs/ZTextInput";
import ZEmailInput from "~/components/molecules/Inputs/ZEmailInput";
import ZPhoneInput from "~/components/molecules/Inputs/ZPhoneInput";
import ZCPFInput from "~/components/molecules/Inputs/ZCPFInput";
import ZRGInput from "~/components/molecules/Inputs/ZRGInput";
import ZDate from "~/components/atoms/Inputs/ZDate";
import ZSelectRole from "~/components/molecules/Selects/ZSelectRole";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";

const { formData } = useForm("myForm");

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
      formData,
      user: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null,
      form: {
        ...this.data,
      },
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
      this.form = { ...val };
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
  },
};
</script>

<style scoped>
.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.icon-circle {
  background-color: #e9742b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-title {
  font-weight: bold;
  color: #333333;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* Removido estilo de borda do form-field para deixar igual ao date input */

/* Remover borda estranha das labels dos inputs */
.user-form :deep(.va-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.user-form :deep(.va-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

/* Remover borda das labels do date input também */
.user-form :deep(.va-date-input-wrapper__label) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  background: transparent !important;
}

.user-form :deep(.va-date-input-wrapper__label *) {
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.save-button {
  background-color: #e9742b;
  border-radius: 8px;
  color: #ffffff;
}

.permissions-grid {
  display: flex;
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
