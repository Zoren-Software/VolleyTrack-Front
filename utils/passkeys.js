import {
  browserSupportsWebAuthn,
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";

export function supportsPasskeys() {
  return browserSupportsWebAuthn();
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
