<template>
  <div class="positions-cell">
    <template v-if="hasPositions">
      <ZBadge :text="willPositions(normalizedData)" overlap>
        <ZButton
          size="small"
          :color="colors(normalizedData[0].id)"
          class="position-tag"
        >
          {{ normalizedData[0].name }}
        </ZButton>
  </ZBadge>
    </template>
    <span v-else class="no-positions">-</span>
  </div>
</template>

<script>
import ZBadge from "~/components/atoms/Badges/ZBadge";
import ZButton from "~/components/atoms/Buttons/ZButton";

export default {
  components: {
    ZBadge,
    ZButton,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
  },

  computed: {
    normalizedData() {
      if (!this.data) return [];
      return Array.isArray(this.data) ? this.data : [this.data].filter(Boolean);
    },
    hasPositions() {
      return this.normalizedData && this.normalizedData.length > 0;
    },
  },
  methods: {
    colors(id) {
      const colors = {
        1: "primary",
        2: "secondary",
        3: "success",
        4: "warning",
        5: "danger",
      };
      return colors[id] || "primary";
    },
    willPositions(total) {
      if (!total || !Array.isArray(total)) return "";
      const length = total.length;
      if (length <= 1) return "";
      return `+${length - 1}`;
    },
  },
};
</script>

<style scoped>
.positions-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.position-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 500;
}

.no-positions {
  color: #9ca3af;
  font-size: 14px;
  font-style: italic;
}
</style>
