<template>
  <VaModal
    v-model="isOpen"
    :title="title"
    size="large"
    close-button
    no-dismiss
    :hide-default-actions="true"
    class="billing-form-modal"
    @cancel="cancel"
  >
    <div class="billing-form-wrapper">
      <p class="billing-form-description">
        Preencha os dados abaixo para emissão da Nota Fiscal. Eles serão usados após a confirmação do pagamento.
      </p>

      <!-- Loader overlay enquanto consulta CEP -->
      <div v-if="cepLoading" class="cep-loader-overlay">
        <div class="cep-loader-spinner"></div>
        <p class="cep-loader-text">Buscando endereço...</p>
      </div>

      <VaForm ref="billingFormRef" tag="form" class="billing-form" @submit.prevent="onSubmit">
      <div class="form-row">
        <VaSelect
          v-model="form.tipo"
          label="Tipo"
          :options="tipoOptions"
          value-by="value"
          text-by="label"
          class="form-field"
          @update:model-value="onTipoChange"
        />
        <VaInput
          v-model="form.federal_tax_number"
          :label="form.tipo === 'pj' ? 'CNPJ' : 'CPF'"
          placeholder="Somente números"
          class="form-field"
          :rules="taxNumberRules"
          maxlength="18"
        />
      </div>

      <div class="form-row single">
        <VaInput
          v-model="form.cep"
          label="CEP"
          placeholder="00000-000"
          class="form-field cep-field"
          :rules="[validators.required]"
          maxlength="9"
          @blur="fetchCep"
        />
      </div>

      <div class="form-row">
        <VaInput
          v-model="form.street"
          label="Logradouro"
          placeholder="Rua, Avenida..."
          class="form-field"
          :rules="[validators.required]"
        />
        <VaInput
          v-model="form.number"
          name="number"
          label="Número"
          placeholder="Nº"
          class="form-field number-field"
          :rules="numberFieldRules"
        />
      </div>

      <VaInput
        v-model="form.complement"
        label="Complemento (opcional)"
        placeholder="Sala, andar..."
        class="form-field"
      />

      <div class="form-row">
        <VaInput
          v-model="form.district"
          label="Bairro"
          placeholder="Bairro"
          class="form-field"
          :rules="[validators.required]"
        />
        <VaInput
          v-model="form.cityName"
          label="Cidade"
          placeholder="Cidade"
          class="form-field"
          :rules="[validators.required]"
        />
        <VaInput
          v-model="form.state"
          label="UF"
          placeholder="UF"
          class="form-field state-field"
          :rules="[validators.required]"
          maxlength="2"
        />
      </div>

      <div v-if="submitError" class="submit-error">
        {{ submitError }}
      </div>

      <div class="modal-footer-actions">
        <VaButton color="secondary" @click="cancel">Cancelar</VaButton>
        <VaButton :disabled="saving" @click="onSubmit">
          {{ saving ? 'Salvando...' : submitButtonText }}
        </VaButton>
      </div>
    </VaForm>
    </div>
  </VaModal>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: 'Dados para Nota Fiscal' },
  /** Dados atuais para preencher o formulário (modo edição) */
  initialData: { type: Object, default: null },
  /** Texto do botão de envio. Ex: "Continuar para pagamento" ou "Salvar" */
  submitButtonText: { type: String, default: 'Continuar para pagamento' },
});

const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

const validators = {
  required: (v) => (v && String(v).trim() ? true : 'Campo obrigatório'),
};

const tipoOptions = [
  { value: 'pf', label: 'Pessoa Física (CPF)' },
  { value: 'pj', label: 'Pessoa Jurídica (CNPJ)' },
];

const form = ref({
  tipo: 'pf',
  federal_tax_number: '',
  cep: '',
  street: '',
  number: '',
  complement: '',
  district: '',
  cityName: '',
  cityCode: '',
  state: '',
  postal_code: '',
});

const cepLoading = ref(false);
const saving = ref(false);
const submitError = ref('');
/** True após buscar CEP e preencher endereço (a API não retorna número, então o campo Número fica obrigatório) */
const addressFetchedFromCep = ref(false);

const billingFormRef = ref(null);

const taxNumberRules = computed(() => {
  const len = form.value.tipo === 'pj' ? 14 : 11;
  return [
    validators.required,
    (v) => {
      const digits = (v || '').replace(/\D/g, '');
      return digits.length === len ? true : (form.value.tipo === 'pj' ? 'CNPJ deve ter 14 dígitos' : 'CPF deve ter 11 dígitos');
    },
  ];
});

/** Número é obrigatório sempre; quando o endereço veio da consulta CEP (API não retorna número), reforçamos a obrigatoriedade */
const numberFieldRules = computed(() => {
  const required = (v) => (v && String(v).trim() ? true : 'Campo obrigatório');
  return [required];
});

function onTipoChange() {
  form.value.federal_tax_number = '';
}

function onlyNumbers(str, maxLen) {
  const digits = (str || '').replace(/\D/g, '').slice(0, maxLen);
  return digits;
}

async function fetchCep() {
  const cep = onlyNumbers(form.value.cep, 8);
  if (cep.length < 8) return;
  cepLoading.value = true;
  submitError.value = '';
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (data.erro) {
      submitError.value = 'CEP não encontrado';
      return;
    }
    form.value.street = data.logradouro || '';
    form.value.district = data.bairro || '';
    form.value.cityName = data.localidade || '';
    form.value.state = (data.uf || '').toUpperCase();
    form.value.cityCode = data.ibge || '';
    form.value.postal_code = cep.replace(/(\d{5})(\d{3})/, '$1-$2');
    // ViaCEP não retorna número; marcar que o endereço veio da API para exigir preenchimento do Número
    form.value.number = form.value.number || '';
    addressFetchedFromCep.value = true;
  } catch (e) {
    submitError.value = 'Erro ao buscar CEP';
  } finally {
    cepLoading.value = false;
  }
}

function cancel() {
  emit('cancel');
  isOpen.value = false;
}

function buildPayload() {
  const raw = form.value.federal_tax_number.replace(/\D/g, '');
  const cityCode = form.value.cityCode || '3550308';
  const postalCode = (form.value.postal_code || form.value.cep || '').replace(/\D/g, '');
  return {
    federal_tax_number: raw,
    billing_address: {
      street: form.value.street?.trim() || '',
      number: String(form.value.number ?? '').trim() || '',
      complement: (form.value.complement ?? '').trim(),
      district: form.value.district?.trim() || '',
      city: {
        code: cityCode,
        name: form.value.cityName?.trim() || '',
      },
      state: (form.value.state ?? '').trim().toUpperCase().slice(0, 2),
      postal_code: postalCode,
      country: 'BRA',
    },
  };
}

async function onSubmit() {
  submitError.value = '';
  await nextTick();
  const formValid = billingFormRef.value?.validate?.() ?? false;
  if (!formValid) return;
  const digits = form.value.federal_tax_number.replace(/\D/g, '');
  const len = form.value.tipo === 'pj' ? 14 : 11;
  if (digits.length !== len) {
    submitError.value = form.value.tipo === 'pj' ? 'Informe um CNPJ válido (14 dígitos).' : 'Informe um CPF válido (11 dígitos).';
    return;
  }
  saving.value = true;
  try {
    const payload = buildPayload();
    emit('submit', payload);
  } finally {
    saving.value = false;
  }
}

function applyInitialData(data) {
  addressFetchedFromCep.value = false;
  const tax = (data.federal_tax_number || '').replace(/\D/g, '');
  const addr = data.billing_address || {};
  const city = addr.city || {};
  const postal = (addr.postal_code || '').replace(/\D/g, '');
  form.value = {
    tipo: tax.length === 14 ? 'pj' : 'pf',
    federal_tax_number: tax,
    cep: postal.length >= 8 ? postal.replace(/(\d{5})(\d{3})/, '$1-$2') : '',
    street: addr.street || '',
    number: addr.number || '',
    complement: addr.additionalInformation || addr.complement || '',
    district: addr.district || '',
    cityName: typeof city === 'object' ? (city.name || '') : '',
    cityCode: typeof city === 'object' ? (city.code || '') : '',
    state: (addr.state || '').toUpperCase().slice(0, 2),
    postal_code: postal.length >= 8 ? postal.replace(/(\d{5})(\d{3})/, '$1-$2') : '',
  };
  submitError.value = '';
}

watch(isOpen, (open) => {
  if (open) {
    addressFetchedFromCep.value = false;
    if (props.initialData && (props.initialData.federal_tax_number || props.initialData.billing_address)) {
      applyInitialData(props.initialData);
    } else {
      form.value = {
        tipo: 'pf',
        federal_tax_number: '',
        cep: '',
        street: '',
        number: '',
        complement: '',
        district: '',
        cityName: '',
        cityCode: '',
        state: '',
        postal_code: '',
      };
      submitError.value = '';
    }
  }
});
</script>

<style scoped>
.billing-form-modal :deep(.va-modal__content) {
  padding: 1rem 1.5rem 1.5rem;
}

.billing-form-wrapper {
  position: relative;
  min-height: 280px;
}

/* Esconde o footer padrão do VaModal (Cancel/OK) – usamos apenas nossos botões */
.billing-form-modal :deep(.va-modal__footer) {
  display: none;
}
.billing-form-description {
  margin-bottom: 1.25rem;
  color: #6b7280;
  font-size: 0.9375rem;
}
.billing-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.form-row.single {
  grid-template-columns: 1fr;
}
.form-row .number-field { max-width: 120px; }
.form-row .state-field { max-width: 80px; }
.cep-field { max-width: 160px; }

/* Overlay + loader ao consultar CEP */
.cep-loader-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 0 0 12px 12px;
}
.cep-loader-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: cep-spin 0.9s linear infinite;
}
.cep-loader-text {
  margin: 1rem 0 0;
  font-size: 0.9375rem;
  color: #6b7280;
  font-weight: 500;
}
@keyframes cep-spin {
  to { transform: rotate(360deg); }
}
.submit-error {
  color: #dc2626;
  font-size: 0.875rem;
}
.modal-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}
</style>
