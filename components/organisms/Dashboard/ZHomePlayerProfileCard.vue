<template>
  <div v-if="loading" class="player-profile-card player-profile-card--loading">
    <va-progress-circle indeterminate size="small" />
    <span class="loading-label">Carregando seu perfil...</span>
  </div>

  <div
    v-else-if="profile"
    class="player-profile-card"
    role="button"
    tabindex="0"
    @click="goAccount"
    @keydown.enter="goAccount"
  >
    <div class="profile-header">
      <div class="avatar-ring-wrap" :aria-label="`Progresso ${ringPercent}%`">
        <svg class="progress-ring" viewBox="0 0 88 88" aria-hidden="true">
          <circle
            class="progress-ring-bg"
            cx="44"
            cy="44"
            r="38"
            fill="none"
            stroke-width="4"
          />
          <circle
            class="progress-ring-fill"
            cx="44"
            cy="44"
            r="38"
            fill="none"
            stroke-width="4"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringOffset"
            transform="rotate(-90 44 44)"
          />
        </svg>
        <div class="avatar-inner">
          <va-avatar v-if="profile.id" class="profile-avatar" size="large">
            {{ avatarLetter }}
          </va-avatar>
        </div>
      </div>

      <div class="profile-text">
        <div class="profile-name">{{ displayName }}</div>
        <div class="profile-subtitle">
          {{ teamsSubtitle }}
        </div>
        <div class="profile-badge-row">
          <va-icon name="emoji_events" size="18px" class="trophy-icon" />
          <span class="badge-label">{{ primaryRoleLabel }}</span>
        </div>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-col">
        <va-icon name="groups" size="22px" color="#FF4E1B" />
        <div class="stat-num">{{ teamsCount }}</div>
        <div class="stat-lbl">Times</div>
      </div>
      <div class="stat-col">
        <va-icon name="sports_volleyball" size="22px" color="#1976D2" />
        <div class="stat-num">{{ positionsCount }}</div>
        <div class="stat-lbl">Posições</div>
      </div>
      <div class="stat-col">
        <va-icon name="badge" size="22px" color="#6D4C41" />
        <div class="stat-num">{{ rolesCount }}</div>
        <div class="stat-lbl">Funções</div>
      </div>
    </div>
  </div>
</template>

<script>
import { gql } from "@apollo/client/core";
import USER from "~/graphql/user/query/user.graphql";

export default {
  name: "ZHomePlayerProfileCard",
  props: {
    setupProgress: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      loading: true,
      profile: null,
    };
  },
  computed: {
    displayName() {
      return this.profile?.displayName || this.profile?.name || "Jogador";
    },
    avatarLetter() {
      const n = this.displayName || "";
      return n.charAt(0).toUpperCase() || "?";
    },
    teamsCount() {
      return this.profile?.teams?.length ?? 0;
    },
    positionsCount() {
      return this.profile?.positions?.length ?? 0;
    },
    rolesCount() {
      return this.profile?.roles?.length ?? 0;
    },
    teamsSubtitle() {
      const n = this.teamsCount;
      if (n === 0) return "Nenhum time vinculado ainda";
      if (n === 1) return "1 time no clube";
      return `${n} times no clube`;
    },
    primaryRoleLabel() {
      const roles = this.profile?.roles;
      if (roles?.length) {
        return roles[0].name || "Membro";
      }
      return "Membro";
    },
    ringPercent() {
      const p = Number(this.setupProgress);
      if (Number.isNaN(p)) return 0;
      return Math.min(100, Math.max(0, p));
    },
    ringCircumference() {
      const r = 38;
      return 2 * Math.PI * r;
    },
    ringOffset() {
      return this.ringCircumference * (1 - this.ringPercent / 100);
    },
  },
  mounted() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {
      this.loading = true;
      this.profile = null;
      try {
        let id = null;
        const raw = localStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          id = parsed?.id;
        }
        if (!id) {
          this.loading = false;
          return;
        }

        const query = gql`
          ${USER}
        `;
        const nuxtApp = useNuxtApp();
        const apolloClient = nuxtApp._apolloClients?.default;
        if (!apolloClient) {
          this.loading = false;
          return;
        }

        const result = await apolloClient.query({
          query,
          variables: { id: String(id) },
          fetchPolicy: "cache-first",
        });

        this.profile = result?.data?.user || null;
      } catch (e) {
        console.warn("ZHomePlayerProfileCard: erro ao carregar usuário", e);
        this.profile = null;
      } finally {
        this.loading = false;
      }
    },
    goAccount() {
      this.$router.push("/account");
    },
  },
};
</script>

<style scoped>
.player-profile-card {
  background: #fff;
  border-radius: 16px;
  padding: 22px 20px 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #eee;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  width: 100%;
}

.player-profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.player-profile-card:focus-visible {
  outline: 2px solid #ff4e1b;
  outline-offset: 2px;
}

.player-profile-card--loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 120px;
  cursor: default;
}

.player-profile-card--loading:hover {
  transform: none;
}

.loading-label {
  font-size: 14px;
  color: #6c757d;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 16px;
}

.avatar-ring-wrap {
  position: relative;
  width: 88px;
  height: 88px;
  flex-shrink: 0;
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.progress-ring-bg {
  stroke: #f0e6e0;
}

.progress-ring-fill {
  stroke: #ff4e1b;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.45s ease;
}

.avatar-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-avatar {
  background: #ff4e1b !important;
  color: #fff !important;
  font-weight: 700;
  font-size: 1.25rem;
}

.profile-text {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.25;
  margin-bottom: 4px;
}

.profile-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
  margin-bottom: 10px;
  line-height: 1.35;
}

.profile-badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.trophy-icon {
  color: #cd7f32;
  flex-shrink: 0;
}

.badge-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #0b1e3a;
}

.stats-bar {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: #faf6f1;
  border-radius: 12px;
  padding: 14px 10px;
}

.stat-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.stat-num {
  font-size: 1.35rem;
  font-weight: 700;
  color: #0b1e3a;
  line-height: 1.1;
}

.stat-lbl {
  font-size: 0.7rem;
  font-weight: 600;
  color: #8a8a8a;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

@media (max-width: 480px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-ring-wrap {
    align-self: center;
  }
}
</style>
