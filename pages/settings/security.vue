<template>
  <div class="security-page">
    <div class="page-header">
      <h1 class="page-title">Segurança da conta</h1>
      <p class="page-subtitle">
        Proteja sua conta com a verificação em duas etapas.
      </p>
    </div>

    <section class="security-card">
      <div v-if="loading" class="loading-wrapper">
        <va-progress-circle indeterminate color="#FF4E1B" />
      </div>

      <template v-else-if="status">
        <div
          class="status-banner"
          :class="status?.twoFactorEnabled ? 'status-banner--enabled' : 'status-banner--disabled'"
        >
          <va-icon
            :name="status?.twoFactorEnabled ? 'verified_user' : 'security'"
            size="24px"
          />
          <div>
            <strong>
              {{
                status?.twoFactorEnabled
                  ? "Verificação em duas etapas ativada"
                  : "Verificação em duas etapas desativada"
              }}
            </strong>
            <p>
              {{
                status?.twoFactorEnabled
                  ? "Sua conta exige verificação adicional ao entrar."
                  : "Adicione uma camada extra de proteção ao seu acesso."
              }}
            </p>
          </div>
        </div>

        <div class="security-section">
          <div class="section-heading">
            <div class="security-icon">
              <va-icon name="phonelink_lock" size="24px" color="#FF4E1B" />
            </div>
            <div>
              <h2>Aplicativo autenticador</h2>
              <p>
                Use Google Authenticator, Authy ou outro aplicativo compatível
                para gerar códigos de acesso.
              </p>
            </div>
          </div>

          <template v-if="!status?.totpEnabled && !totpSetup">
            <va-button color="primary" :loading="busy" @click="enableTotp">
              Ativar aplicativo autenticador
            </va-button>
          </template>

          <template v-else-if="totpSetup">
            <div class="setup-panel">
              <p>Escaneie o QR Code no seu aplicativo autenticador.</p>
              <div class="qr-code" v-html="totpSetup.qrCodeSvg" />
              <p class="manual-secret">
                Não consegue escanear? Informe esta chave manualmente:
                <code>{{ totpSetup.secret }}</code>
              </p>
              <va-input
                v-model="confirmCode"
                label="Código de confirmação"
                placeholder="Digite o código de 6 dígitos"
                inputmode="numeric"
                autocomplete="one-time-code"
                class="code-input"
              />
              <va-button
                color="primary"
                :loading="busy"
                :disabled="!confirmCode.trim()"
                @click="confirmTotp"
              >
                Confirmar e ativar
              </va-button>
            </div>
          </template>

          <template v-else>
            <p class="recovery-remaining">
              Códigos de recuperação disponíveis:
              <strong>{{ status?.recoveryCodesRemaining ?? 0 }}</strong>
            </p>
            <div class="disable-panel">
              <h3>Desativar aplicativo autenticador</h3>
              <p>Confirme sua senha e um código atual para continuar.</p>
              <va-input
                v-model="disablePassword"
                type="password"
                label="Senha atual"
                autocomplete="current-password"
              />
              <va-input
                v-model="disableCode"
                label="Código do autenticador"
                placeholder="Digite o código de 6 dígitos"
                inputmode="numeric"
                autocomplete="one-time-code"
              />
              <va-button
                color="danger"
                :loading="busy"
                :disabled="!disablePassword || !disableCode.trim()"
                @click="disableTotp"
              >
                Desativar
              </va-button>
            </div>
          </template>
        </div>

        <div v-if="recoveryCodes.length" class="recovery-panel">
          <h2>Guarde seus códigos de recuperação</h2>
          <p>
            Eles só serão exibidos agora. Salve-os em um local seguro para
            recuperar o acesso caso perca seu autenticador.
          </p>
          <div class="recovery-codes">
            <code v-for="code in recoveryCodes" :key="code">{{ code }}</code>
          </div>
        </div>

        <div class="security-section security-section--last">
          <div class="section-heading">
            <div class="security-icon">
              <va-icon name="key" size="24px" color="#FF4E1B" />
            </div>
            <div>
              <h2>Chaves de acesso</h2>
              <p>
                Use 1Password, Face ID, Touch ID ou outra passkey para confirmar
                o acesso sem digitar códigos.
              </p>
            </div>
          </div>

          <va-button
            color="primary"
            :loading="passkeyBusy"
            :disabled="!passkeysSupported"
            @click="addPasskey"
          >
            Adicionar chave de acesso
          </va-button>
          <p v-if="!passkeysSupported" class="passkey-unsupported">
            Este navegador não oferece chaves de acesso.
          </p>

          <div v-if="passkeysLoading" class="passkey-loading">
            Carregando chaves...
          </div>
          <p v-else-if="passkeys.length === 0" class="passkey-empty">
            Nenhuma chave de acesso cadastrada.
          </p>
          <ul v-else class="passkey-list">
            <li v-for="passkey in passkeys" :key="passkey.id" class="passkey-item">
              <div>
                <strong>{{ passkey.name }}</strong>
                <p>
                  {{ passkey.authenticator || "Autenticador" }}
                  · Último uso:
                  {{ formatDate(passkey.lastUsedAt) || "nunca" }}
                </p>
              </div>
              <va-button
                color="danger"
                preset="secondary"
                size="small"
                :loading="deletingPasskeyId === passkey.id"
                :disabled="passkeyBusy"
                @click="startDeletePasskey(passkey)"
              >
                Remover
              </va-button>
            </li>
          </ul>

          <div v-if="passkeyToDelete" class="disable-panel passkey-delete-panel">
            <h3>Remover chave de acesso</h3>
            <p>
              Confirme sua senha para remover
              <strong>{{ passkeyToDelete.name }}</strong>.
            </p>
            <va-input
              v-model="deletePasskeyPassword"
              type="password"
              label="Senha atual"
              autocomplete="current-password"
            />
            <div class="passkey-delete-actions">
              <va-button
                color="danger"
                :loading="deletingPasskeyId === passkeyToDelete.id"
                :disabled="!deletePasskeyPassword"
                @click="deletePasskey"
              >
                Confirmar remoção
              </va-button>
              <va-button preset="plain" :disabled="passkeyBusy" @click="resetDeletePasskey">
                Cancelar
              </va-button>
            </div>
          </div>
        </div>
      </template>

      <div v-else class="status-unavailable">
        Não foi possível carregar as configurações de segurança.
      </div>

      <p v-if="errorMessage" class="error-message" role="alert">
        {{ errorMessage }}
      </p>
    </section>

    <div class="action-buttons">
      <va-button preset="secondary" @click="$router.push('/settings')">
        <va-icon name="arrow_back" size="16px" />
        Voltar
      </va-button>
    </div>
  </div>
</template>

<script>
import TWO_FACTOR_STATUS from "~/graphql/user/query/twoFactorStatus.graphql";
import PASSKEYS from "~/graphql/user/query/passkeys.graphql";
import ENABLE_TOTP from "~/graphql/user/mutation/enableTotp.graphql";
import CONFIRM_TOTP from "~/graphql/user/mutation/confirmTotp.graphql";
import DISABLE_TOTP from "~/graphql/user/mutation/disableTotp.graphql";
import BEGIN_PASSKEY_REGISTRATION from "~/graphql/user/mutation/beginPasskeyRegistration.graphql";
import CONFIRM_PASSKEY_REGISTRATION from "~/graphql/user/mutation/confirmPasskeyRegistration.graphql";
import DELETE_PASSKEY from "~/graphql/user/mutation/deletePasskey.graphql";
import { confirmSuccess } from "~/utils/sweetAlert2/swalHelper";
import {
  createPasskeyCredential,
  credentialToJson,
  supportsPasskeys,
} from "~/utils/passkeys";

export default {
  name: "SecuritySettingsPage",
  data() {
    return {
      status: null,
      loading: true,
      busy: false,
      errorMessage: "",
      totpSetup: null,
      confirmCode: "",
      disablePassword: "",
      disableCode: "",
      recoveryCodes: [],
      passkeys: [],
      passkeysLoading: false,
      passkeyBusy: false,
      passkeysSupported: supportsPasskeys(),
      passkeyToDelete: null,
      deletePasskeyPassword: "",
      deletingPasskeyId: null,
    };
  },
  mounted() {
    this.loadStatus();
    this.loadPasskeys();
  },
  methods: {
    async loadStatus() {
      this.loading = true;
      this.errorMessage = "";

      try {
        const query = gql`
          ${TWO_FACTOR_STATUS}
        `;
        const { data } = await useAsyncQuery(query, {});
        this.status = data.value?.twoFactorStatus ?? null;
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Não foi possível carregar as configurações de segurança.",
        );
      } finally {
        this.loading = false;
      }
    },
    async loadPasskeys() {
      this.passkeysLoading = true;

      try {
        const query = gql`
          ${PASSKEYS}
        `;
        const { data } = await useAsyncQuery(query, {});
        this.passkeys = data.value?.passkeys ?? [];
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Não foi possível carregar as chaves de acesso.",
        );
      } finally {
        this.passkeysLoading = false;
      }
    },
    async enableTotp() {
      await this.runMutation(ENABLE_TOTP, {}, (data) => {
        this.totpSetup = data?.enableTotp ?? null;
        this.confirmCode = "";
      });
    },
    async confirmTotp() {
      await this.runMutation(
        CONFIRM_TOTP,
        { code: this.confirmCode.trim() },
        (data) => {
          const result = data?.confirmTotp;
          if (!result) {
            return;
          }

          this.status = result;
          this.recoveryCodes = result.recoveryCodes ?? [];
          this.totpSetup = null;
          this.confirmCode = "";
          confirmSuccess("Verificação em duas etapas ativada com sucesso!");
        },
      );
    },
    async disableTotp() {
      await this.runMutation(
        DISABLE_TOTP,
        {
          password: this.disablePassword,
          code: this.disableCode.trim(),
        },
        (data) => {
          this.status = data?.disableTotp ?? {
            twoFactorEnabled: false,
            totpEnabled: false,
            methods: [],
            passkeyEnabled: false,
            recoveryCodesRemaining: 0,
          };
          this.disablePassword = "";
          this.disableCode = "";
          this.recoveryCodes = [];
          confirmSuccess("Aplicativo autenticador desativado.");
        },
      );
    },
    async addPasskey() {
      if (!this.passkeysSupported) {
        return;
      }

      this.passkeyBusy = true;
      this.errorMessage = "";

      try {
        const beginMutation = gql`
          ${BEGIN_PASSKEY_REGISTRATION}
        `;
        const { mutate: beginMutate } = await useMutation(beginMutation, {
          variables: {},
        });
        const { data: beginData } = await beginMutate();
        const begin = beginData?.beginPasskeyRegistration;

        if (!begin?.optionsJson || !begin?.registrationId) {
          throw new Error("Não foi possível iniciar o registro da passkey.");
        }

        const credential = await createPasskeyCredential(begin.optionsJson);
        const defaultName =
          typeof navigator !== "undefined" && navigator.userAgentData?.platform
            ? navigator.userAgentData.platform
            : "Este dispositivo";

        await this.runMutation(
          CONFIRM_PASSKEY_REGISTRATION,
          {
            registrationId: begin.registrationId,
            name: defaultName,
            credentialJson: credentialToJson(credential),
          },
          (data) => {
            const result = data?.confirmPasskeyRegistration;
            if (!result) {
              return;
            }

            this.status = {
              twoFactorEnabled: result.twoFactorEnabled,
              methods: result.methods,
              totpEnabled: result.totpEnabled,
              passkeyEnabled: result.passkeyEnabled,
              recoveryCodesRemaining: result.recoveryCodesRemaining,
            };
            confirmSuccess("Chave de acesso adicionada com sucesso!");
          },
        );

        await this.loadPasskeys();
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Não foi possível adicionar a chave de acesso.",
        );
      } finally {
        this.passkeyBusy = false;
      }
    },
    startDeletePasskey(passkey) {
      this.passkeyToDelete = passkey;
      this.deletePasskeyPassword = "";
    },
    resetDeletePasskey() {
      this.passkeyToDelete = null;
      this.deletePasskeyPassword = "";
      this.deletingPasskeyId = null;
    },
    async deletePasskey() {
      if (!this.passkeyToDelete || !this.deletePasskeyPassword) {
        return;
      }

      this.deletingPasskeyId = this.passkeyToDelete.id;
      this.passkeyBusy = true;

      await this.runMutation(
        DELETE_PASSKEY,
        {
          id: this.passkeyToDelete.id,
          password: this.deletePasskeyPassword,
        },
        (data) => {
          this.status = data?.deletePasskey ?? this.status;
          this.resetDeletePasskey();
          confirmSuccess("Chave de acesso removida.");
        },
      );

      this.passkeyBusy = false;
      this.deletingPasskeyId = null;
      await this.loadPasskeys();
    },
    formatDate(value) {
      if (!value) {
        return "";
      }

      try {
        return new Date(value).toLocaleString("pt-BR");
      } catch {
        return value;
      }
    },
    async runMutation(document, variables, onSuccess) {
      this.busy = true;
      this.errorMessage = "";

      try {
        const mutation = gql`
          ${document}
        `;
        const { mutate } = await useMutation(mutation, { variables });
        const { data } = await mutate();
        onSuccess(data);
      } catch (error) {
        this.errorMessage = this.getErrorMessage(
          error,
          "Não foi possível concluir esta ação. Tente novamente.",
        );
      } finally {
        this.busy = false;
      }
    },
    getErrorMessage(error, fallback) {
      return error.graphQLErrors?.[0]?.message || error.message || fallback;
    },
  },
};
</script>

<style scoped>
.security-page {
  max-width: 720px;
  width: 100%;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #0b1e3a;
}

.page-subtitle {
  margin: 0;
  color: #6c757d;
  font-size: 15px;
}

.security-card {
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.loading-wrapper {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.status-banner,
.section-heading {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.status-banner {
  padding: 14px;
  border: 1px solid;
  border-radius: 10px;
  margin-bottom: 24px;
}

.status-banner--enabled {
  color: #065f46;
  border-color: #a7f3d0;
  background: #ecfdf5;
}

.status-banner--disabled {
  color: #92400e;
  border-color: #fde68a;
  background: #fffbeb;
}

.status-banner p,
.section-heading p,
.disable-panel p,
.recovery-panel p,
.passkey-item p {
  margin: 4px 0 0;
  font-size: 13px;
  line-height: 1.45;
}

.security-section {
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.security-section--last {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: 0;
}

.security-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #fff5f2;
  flex-shrink: 0;
}

.section-heading {
  margin-bottom: 20px;
}

.section-heading h2,
.recovery-panel h2,
.disable-panel h3 {
  margin: 0;
  color: #0b1e3a;
}

.section-heading h2,
.recovery-panel h2 {
  font-size: 17px;
}

.setup-panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.setup-panel > p {
  margin: 0 0 12px;
  color: #4b5563;
  font-size: 14px;
}

.qr-code {
  display: grid;
  place-items: center;
  align-self: center;
  padding: 12px;
  margin: 4px 0 16px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.qr-code :deep(svg) {
  width: 180px;
  height: 180px;
}

.manual-secret {
  word-break: break-all;
}

.manual-secret code,
.recovery-codes code {
  padding: 2px 5px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #374151;
}

.code-input,
.disable-panel :deep(.va-input-wrapper) {
  width: 100%;
  margin-bottom: 12px;
}

.recovery-remaining {
  margin: 0 0 16px;
  color: #4b5563;
  font-size: 14px;
}

.disable-panel {
  padding: 16px;
  border-radius: 10px;
  background: #fef2f2;
}

.disable-panel h3 {
  color: #991b1b;
  font-size: 15px;
}

.disable-panel p {
  margin-bottom: 14px;
  color: #7f1d1d;
}

.recovery-panel {
  margin-top: 24px;
  padding: 18px;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  background: #eff6ff;
}

.recovery-panel p {
  color: #1e3a8a;
}

.recovery-codes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.recovery-codes code {
  text-align: center;
}

.passkey-unsupported,
.passkey-empty,
.passkey-loading {
  margin: 12px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.passkey-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
}

.passkey-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #e5e7eb;
}

.passkey-item:first-child {
  border-top: 0;
}

.passkey-delete-panel {
  margin-top: 16px;
}

.passkey-delete-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.error-message {
  margin: 16px 0 0;
  color: #b91c1c;
  font-size: 14px;
}

.status-unavailable {
  padding: 16px;
  border-radius: 8px;
  color: #991b1b;
  background: #fef2f2;
}

.action-buttons {
  margin-top: 20px;
}

@media (max-width: 480px) {
  .security-card {
    padding: 16px;
  }

  .recovery-codes {
    grid-template-columns: 1fr;
  }
}
</style>
