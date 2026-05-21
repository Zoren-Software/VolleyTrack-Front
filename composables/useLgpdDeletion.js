import { ref } from "vue";
import REQUEST_USER_LGPD_DELETION from "~/graphql/lgpd/mutation/requestUserLgpdDeletion.graphql";
import { useTermsAcceptance } from "~/composables/useTermsAcceptance";

const isSubmitting = ref(false);

const LGPD_CENTRAL_PASSWORD_INVALID =
  "Senha incorreta. Não foi possível processar a solicitação.";

const LGPD_CENTRAL_UNAUTHENTICATED =
  "Sessão expirada ou inválida. Faça login novamente e tente outra vez.";

const LGPD_CENTRAL_GENERIC_ERROR =
  "Não foi possível processar a solicitação na conta central. Tente novamente.";

/**
 * Mensagem amigável para erros do DELETE /v1/user-lgpd ($fetch / ofetch).
 */
export function getLgpdCentralErrorMessage(error) {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status;
  const apiMessage =
    error?.data?.message ??
    error?.response?._data?.message ??
    (typeof error?.response?._data === "string" ? error.response._data : null);

  if (status === 422) {
    if (
      apiMessage &&
      !/unauthenticated/i.test(apiMessage) &&
      apiMessage !== "Unauthenticated."
    ) {
      return apiMessage;
    }

    return LGPD_CENTRAL_PASSWORD_INVALID;
  }

  if (status === 401) {
    return LGPD_CENTRAL_UNAUTHENTICATED;
  }

  if (apiMessage && apiMessage !== "Unauthenticated.") {
    return apiMessage;
  }

  if (error?.message === "missing_api_or_token") {
    return LGPD_CENTRAL_UNAUTHENTICATED;
  }

  if (error?.message && !/fetch failed/i.test(error.message)) {
    return error.message;
  }

  return LGPD_CENTRAL_GENERIC_ERROR;
}

export const useLgpdDeletion = () => {
  const requestTenantDeletion = async (password) => {
    if (isSubmitting.value) {
      return null;
    }

    isSubmitting.value = true;

    try {
      const mutation = gql`
        ${REQUEST_USER_LGPD_DELETION}
      `;
      const { mutate } = useMutation(mutation);
      const result = await mutate({ password });

      return result?.data?.requestUserLgpdDeletion ?? null;
    } finally {
      isSubmitting.value = false;
    }
  };

  const logoutAfterDeletion = () => {
    const { onLogout } = useApollo();
    onLogout();
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    useTermsAcceptance().reset();
    navigateTo({ path: "/login", query: { lgpd: "processed" } });
  };

  const requestCentralDeletion = async (password, { customerId, tenantId } = {}) => {
    const config = useRuntimeConfig();
    const apiBase = String(config.public.apiEndpoint ?? "").replace(/\/$/, "");
    const token = localStorage.getItem("userToken");
    const resolvedTenantId =
      tenantId || localStorage.getItem("tenant_id") || "";

    if (!apiBase || !token) {
      throw new Error("missing_api_or_token");
    }

    if (!customerId || !resolvedTenantId) {
      throw new Error("missing_customer_or_tenant");
    }

    return await $fetch(`${apiBase}/v1/user-lgpd`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "x-tenant": resolvedTenantId,
      },
      body: {
        password,
        customer_id: Number(customerId),
        tenant_id: resolvedTenantId,
      },
    });
  };

  return {
    isSubmitting,
    requestTenantDeletion,
    requestCentralDeletion,
    logoutAfterDeletion,
    getLgpdCentralErrorMessage,
  };
};
