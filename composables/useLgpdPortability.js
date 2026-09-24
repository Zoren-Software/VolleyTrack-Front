import { ref } from "vue";
import EXPORT_ACCOUNT from "~/graphql/lgpd/mutation/exportAccount.graphql";
import IMPORT_ACCOUNT from "~/graphql/lgpd/mutation/importAccount.graphql";

const isExporting = ref(false);
const isImporting = ref(false);
const lastExportId = ref(null);

const LGPD_PORTABILITY_EXPORT_ERROR =
  "Não foi possível solicitar a exportação dos seus dados. Tente novamente.";

const LGPD_PORTABILITY_IMPORT_ERROR =
  "Não foi possível importar os dados. Verifique o arquivo e tente novamente.";

const LGPD_PORTABILITY_THROTTLED =
  "Muitas solicitações. Aguarde alguns minutos e tente novamente.";

export function getLgpdPortabilityErrorMessage(error) {
  const status = error?.statusCode ?? error?.status ?? error?.response?.status;
  const apiMessage =
    error?.data?.message ??
    error?.response?._data?.message ??
    error?.graphQLErrors?.[0]?.message;

  if (status === 429) {
    return apiMessage && apiMessage !== "Too Many Attempts."
      ? apiMessage
      : LGPD_PORTABILITY_THROTTLED;
  }

  if (apiMessage && apiMessage !== "Unauthenticated.") {
    return apiMessage;
  }

  if (error?.message === "missing_api_or_token") {
    return "Sessão expirada. Faça login novamente.";
  }

  return error?.message || LGPD_PORTABILITY_EXPORT_ERROR;
}

export const useLgpdPortability = () => {
  const requestExport = async (password, { includeCentral = false } = {}) => {
    if (isExporting.value) {
      return null;
    }

    isExporting.value = true;

    try {
      const mutation = gql`
        ${EXPORT_ACCOUNT}
      `;
      const { mutate } = useMutation(mutation);
      const result = await mutate({ password, includeCentral: includeCentral || null });

      const payload = result?.data?.exportAccount ?? null;
      lastExportId.value = payload?.exportId ?? null;

      return payload;
    } finally {
      isExporting.value = false;
    }
  };

  const downloadExport = async (exportId, downloadToken) => {
    const config = useRuntimeConfig();
    const apiBase = String(config.public.apiEndpoint ?? "").replace(/\/$/, "");
    const token = localStorage.getItem("userToken");
    const tenantId = localStorage.getItem("tenant_id") || "";

    if (!apiBase || !token || !exportId || !downloadToken) {
      throw new Error("missing_api_or_token");
    }

    const url = `${apiBase}/v1/lgpd/exports/${exportId}?${new URLSearchParams({
      token: downloadToken,
      tenant: tenantId,
    }).toString()}`;

    const blob = await $fetch(url, {
      method: "GET",
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/zip",
        "x-tenant": tenantId,
      },
    });

    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = "meus-dados-volleytrack.zip";
    anchor.click();
    URL.revokeObjectURL(objectUrl);
  };

  const importZipFile = async (file, password) => {
    if (isImporting.value) {
      return null;
    }

    const config = useRuntimeConfig();
    const apiBase = String(config.public.apiEndpoint ?? "").replace(/\/$/, "");
    const token = localStorage.getItem("userToken");
    const tenantId = localStorage.getItem("tenant_id") || "";

    if (!apiBase || !token) {
      throw new Error("missing_api_or_token");
    }

    isImporting.value = true;

    try {
      const formData = new FormData();
      formData.append("password", password);
      formData.append("file", file);

      return await $fetch(`${apiBase}/v1/lgpd/portability/import`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "x-tenant": tenantId,
        },
        body: formData,
      });
    } finally {
      isImporting.value = false;
    }
  };

  const importJsonPackage = async (password, packageData) => {
    if (isImporting.value) {
      return null;
    }

    isImporting.value = true;

    try {
      const mutation = gql`
        ${IMPORT_ACCOUNT}
      `;
      const { mutate } = useMutation(mutation);
      const result = await mutate({
        password,
        package: JSON.stringify(packageData),
      });

      return result?.data?.importAccount ?? null;
    } finally {
      isImporting.value = false;
    }
  };

  return {
    isExporting,
    isImporting,
    lastExportId,
    requestExport,
    downloadExport,
    importZipFile,
    importJsonPackage,
    getLgpdPortabilityErrorMessage,
    LGPD_PORTABILITY_EXPORT_ERROR,
    LGPD_PORTABILITY_IMPORT_ERROR,
  };
};
