<template>
  <div class="language-wrapper">
    <va-button-dropdown
      color="background-primary"
      hide-icon
      placement="bottom-end"
      stick-to-edges
      :offset="[6, 0]"
    >
      <template #label>
        <span class="language-trigger-btn" title="Idioma / Language">
          <va-icon name="public" size="20px" class="language-trigger-btn__globe" />
          <span class="language-trigger-btn__label">{{ currentLabel }}</span>
          <va-icon name="expand_more" size="20px" class="language-trigger-btn__caret" />
        </span>
      </template>
      <div class="language-dropdown-card">
        <button
          v-for="opt in options"
          :key="opt.code"
          type="button"
          class="language-option"
          :class="{ 'language-option--active': opt.code === currentCode }"
          @click="selectLocale(opt.code)"
        >
          <va-icon
            :name="
              opt.code === currentCode
                ? 'radio_button_checked'
                : 'radio_button_unchecked'
            "
            size="20px"
            class="language-option__radio"
          />
          <span class="language-option__text">{{ opt.label }}</span>
        </button>
      </div>
    </va-button-dropdown>
  </div>
</template>

<script>
const STORAGE_KEY = "volleytrack_locale";

const HTML_LANG_BY_CODE = {
  "pt-BR": "pt-BR",
  en: "en",
  fr: "fr",
  de: "de",
  it: "it",
  rm: "rm",
  es: "es",
  zh: "zh",
};

export default {
  name: "ZTopBarLanguageSwitcher",
  data() {
    return {
      currentCode: "pt-BR",
      options: [
        { code: "pt-BR", label: "Português (Brasil)" },
        { code: "en", label: "English" },
        { code: "fr", label: "Français" },
        { code: "de", label: "Deutsch" },
        { code: "it", label: "Italiano" },
        { code: "rm", label: "Rumantsch" },
        { code: "es", label: "Español" },
        { code: "zh", label: "中文" },
      ],
    };
  },
  computed: {
    currentLabel() {
      const o = this.options.find((x) => x.code === this.currentCode);
      return o ? o.label : this.options[0].label;
    },
  },
  mounted() {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && this.options.some((o) => o.code === saved)) {
      this.currentCode = saved;
    }
    this.applyHtmlLang();
  },
  methods: {
    selectLocale(code) {
      this.currentCode = code;
      localStorage.setItem(STORAGE_KEY, code);
      this.applyHtmlLang();
    },
    applyHtmlLang() {
      if (typeof document === "undefined") return;
      document.documentElement.lang =
        HTML_LANG_BY_CODE[this.currentCode] || "pt-BR";
    },
  },
};
</script>

<style scoped>
.language-wrapper {
  position: relative;
  z-index: 1001;
  overflow: visible;
}

.language-wrapper :deep(.va-button-dropdown) {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  --va-background-color: transparent !important;
  z-index: 1001;
}

.language-wrapper :deep(.va-button-dropdown__anchor) {
  --va-background-color: transparent !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: none !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: unset !important;
  padding: 0 !important;
}

.language-wrapper :deep(.va-dropdown__content-wrapper) {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  margin-top: 4px;
  min-width: min(260px, calc(100vw - 24px));
  max-width: min(320px, calc(100vw - 24px));
  overflow: visible;
  padding: 0;
  z-index: 10002 !important;
}

.language-wrapper :deep(.va-dropdown__content) {
  padding: 0 !important;
  overflow: visible !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  background: transparent !important;
}

.language-wrapper :deep(.va-button-dropdown__label) {
  display: inline-flex !important;
  align-items: stretch !important;
  justify-content: center !important;
  --va-background-color: transparent !important;
  background: transparent !important;
  line-height: normal !important;
  min-height: unset !important;
  width: 100%;
}

.language-trigger-btn {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 12px;
  min-height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.language-trigger-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.language-trigger-btn__globe {
  flex-shrink: 0;
  color: #6b7280 !important;
}

.language-trigger-btn__label {
  font-size: 14px;
  font-weight: 700;
  color: #374151;
  line-height: 1.2;
  white-space: nowrap;
}

.language-trigger-btn__caret {
  flex-shrink: 0;
  margin-left: 2px;
  color: #6b7280 !important;
}

.language-dropdown-card {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eef0f3;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  padding: 6px 0;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  margin: 0;
  padding: 10px 14px;
  border: none;
  background: none;
  font: inherit;
  font-size: 14px;
  font-weight: 400;
  color: #374151;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.language-option:hover {
  background: #f8fafc;
}

.language-option--active {
  font-weight: 500;
}

.language-option__radio {
  flex-shrink: 0;
  color: #9ca3af !important;
}

.language-option--active .language-option__radio {
  color: #ff4e1b !important;
}

.language-option__text {
  flex: 1;
  min-width: 0;
}
</style>
