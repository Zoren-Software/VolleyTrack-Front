import { defineNuxtPlugin } from "#app";
import { useTermsAcceptance } from "~/composables/useTermsAcceptance";

export default defineNuxtPlugin(() => {
  const { handleGraphQLError } = useTermsAcceptance();

  return {
    provide: {
      handleTermsAcceptanceError: handleGraphQLError,
    },
  };
});
