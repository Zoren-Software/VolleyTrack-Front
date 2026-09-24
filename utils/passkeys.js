import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

export function isSecurePasskeyContext() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.isSecureContext === true;
}

export function supportsPasskeys() {
  return isSecurePasskeyContext() && browserSupportsWebAuthn();
}

export function isLocalInsecureOrigin() {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.isSecureContext) {
    return false;
  }

  const host = window.location.hostname;
  return (
    host === "localhost" ||
    host.endsWith(".local") ||
    host.endsWith(".test") ||
    host.endsWith(".localhost")
  );
}

export function passkeySupportMessage() {
  if (typeof window === "undefined") {
    return "Chaves de acesso indisponíveis neste ambiente.";
  }

  if (!isSecurePasskeyContext()) {
    if (isLocalInsecureOrigin()) {
      return [
        "Chaves de acesso exigem contexto seguro. No Chrome local:",
        "1) Abra chrome://flags/#unsafely-treat-insecure-origin-as-secure",
        `2) Adicione ${window.location.origin}`,
        "3) Clique em Relaunch e recarregue esta página",
      ].join(" ");
    }

    return "Chaves de acesso só funcionam em conexões seguras (HTTPS).";
  }

  if (!browserSupportsWebAuthn()) {
    return "Este navegador não oferece chaves de acesso.";
  }

  return "";
}

export function parseWebAuthnOptions(optionsJson) {
  if (typeof optionsJson !== "string" || optionsJson === "") {
    throw new Error("Opções WebAuthn inválidas.");
  }

  const options = JSON.parse(optionsJson);
  if (!options || typeof options !== "object") {
    throw new Error("Opções WebAuthn inválidas.");
  }

  return options;
}

export async function createPasskeyCredential(optionsJson) {
  return startRegistration({
    optionsJSON: parseWebAuthnOptions(optionsJson),
  });
}

export async function assertPasskeyCredential(optionsJson) {
  return startAuthentication({
    optionsJSON: parseWebAuthnOptions(optionsJson),
  });
}

export function credentialToJson(credential) {
  return JSON.stringify(credential);
}
