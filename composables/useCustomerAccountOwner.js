import { ref } from "vue";
import { getApiBaseUrl } from "~/utils/apiBaseUrl";
import { useUser } from "~/composables/useUser";

const validationReady = ref(false);
const validationLoading = ref(false);
const isAccountOwner = ref(false);
const customerData = ref(null);
const validationError = ref(null);

const INVALID_OWNER_MESSAGE =
  "Seu usuário é inválido para esta ação. Entre em contato com o suporte se for necessário rever isso.";

/**
 * Mesma validação da página de pagamentos: POST /v1/customers/check-email
 * O usuário logado só é titular se existir Customer central com o mesmo e-mail no tenant.
 */
export async function validateCustomerAccountOwner() {
  validationLoading.value = true;
  validationError.value = null;
  validationReady.value = false;
  isAccountOwner.value = false;
  customerData.value = null;

  try {
    const { getUserInfo, getUserEmail } = useUser();
    await getUserInfo();

    const userEmail = getUserEmail();
    if (!userEmail) {
      throw new Error("E-mail do usuário não encontrado");
    }

    const token =
      localStorage.getItem("userToken") ||
      localStorage.getItem("apollo:default.token");

    if (!token) {
      throw new Error("Token de autenticação não encontrado");
    }

    const tenantId = localStorage.getItem("tenant_id");
    if (!tenantId) {
      throw new Error("Tenant não identificado");
    }

    const response = await fetch(`${getApiBaseUrl()}/v1/customers/check-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: userEmail,
        tenant_id: tenantId,
      }),
    });

    let data = {};
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    validationReady.value = true;

    if (response.ok && data.success === true && data.exists === true) {
      isAccountOwner.value = true;
      customerData.value = data.data ?? null;
      return { isOwner: true, customer: customerData.value };
    }

    if (response.status === 404 || (data.success === false && data.exists === false)) {
      isAccountOwner.value = false;
      validationError.value =
        data.message || "Este e-mail não é o titular da conta neste clube.";
      return { isOwner: false, customer: null };
    }

    throw new Error(data.message || `Erro ${response.status} na validação do titular`);
  } catch (error) {
    validationReady.value = true;
    isAccountOwner.value = false;
    customerData.value = null;
    validationError.value = error?.message || INVALID_OWNER_MESSAGE;
    return { isOwner: false, customer: null, error: validationError.value };
  } finally {
    validationLoading.value = false;
  }
}

export function useCustomerAccountOwner() {
  return {
    validationReady,
    validationLoading,
    isAccountOwner,
    customerData,
    validationError,
    validateCustomerAccountOwner,
    INVALID_OWNER_MESSAGE,
  };
}
