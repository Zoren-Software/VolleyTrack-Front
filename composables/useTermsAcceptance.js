import { ref } from "vue";
import ACCEPT_TERMS from "~/graphql/terms/mutation/acceptTerms.graphql";
import ME from "~/graphql/user/query/me.graphql";

const isModalOpen = ref(false);
const isSubmitting = ref(false);

export const useTermsAcceptance = () => {
  const syncFromUser = (user) => {
    if (!user?.termsAcceptanceStatus) {
      return;
    }

    if (user.termsAcceptanceStatus.required) {
      isModalOpen.value = true;
    } else {
      isModalOpen.value = false;
    }
  };

  const openModal = () => {
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
  };

  const reset = () => {
    isModalOpen.value = false;
    isSubmitting.value = false;
  };

  const handleGraphQLError = (error) => {
    const graphQLErrors = error?.graphQLErrors || error?.graphqlErrors;

    if (!Array.isArray(graphQLErrors)) {
      return false;
    }

    const hasTermsError = graphQLErrors.some(
      (err) =>
        err?.extensions?.code === "TERMS_ACCEPTANCE_REQUIRED" ||
        (typeof err?.message === "string" &&
          err.message.includes("Termos de Uso"))
    );

    if (hasTermsError) {
      isModalOpen.value = true;
      return true;
    }

    return false;
  };

  const refreshMe = async () => {
    const query = gql`
      ${ME}
    `;
    const { data } = await useAsyncQuery(query, {});

    if (data?.value?.me) {
      const user = data.value.me;
      localStorage.setItem("user", JSON.stringify(user));
      syncFromUser(user);
      return user;
    }

    return null;
  };

  const acceptTerms = async () => {
    if (isSubmitting.value) {
      return false;
    }

    isSubmitting.value = true;

    try {
      const mutation = gql`
        ${ACCEPT_TERMS}
      `;
      const { mutate } = useMutation(mutation);
      await mutate();

      await refreshMe();
      isModalOpen.value = false;

      if (import.meta.client) {
        window.location.reload();
      }

      return true;
    } catch (error) {
      console.error("Erro ao registrar aceite dos termos:", error);
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    isModalOpen,
    isSubmitting,
    syncFromUser,
    openModal,
    closeModal,
    reset,
    handleGraphQLError,
    acceptTerms,
    refreshMe,
  };
};
