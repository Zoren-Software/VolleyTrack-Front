<template>
  <ZListRelationGeneric @add="add">
    <template #filter>
      <slot name="filter" />
    </template>
    <template #list>
      <va-list v-if="items.length > 0">
        <va-list-label> Relacionados </va-list-label>
        <div class="user-list">
          <div v-for="item in items" :key="item.id" class="user-card">
            <div class="user-info">
              <div class="user-avatar">
                <span>{{ item.user.name.charAt(0).toUpperCase() }}</span>
              </div>
              <div class="user-details">
                <p class="user-name">{{ item.user.name }}</p>
                <div v-if="item.user.email" class="user-detail">
                  <va-icon
                    name="email"
                    size="small"
                    color="#6b7280"
                    class="detail-icon"
                  />
                  <span class="detail-text">{{ item.user.email }}</span>
                </div>
                <div class="user-detail user-detail--positions">
                  <va-icon
                    name="trip_origin"
                    size="small"
                    color="#6b7280"
                    class="detail-icon"
                  />
                  <span class="detail-text detail-text--positions">{{
                    positionsLabel(item.user)
                  }}</span>
                </div>
              </div>
            </div>
            <va-icon
              name="delete"
              color="danger"
              class="delete-icon"
              @click="actionDelete(item.id)"
            />
          </div>
        </div>
      </va-list>
    </template>
  </ZListRelationGeneric>
</template>

<script>
import ZListRelationGeneric from "~/components/molecules/List/ZListRelationGeneric";

export default {
  components: {
    ZListRelationGeneric,
  },
  emits: ["add", "delete"],
  props: {
    items: {
      type: Array,
      required: true,
    },
    error: {
      type: Boolean,
      default: false,
    },
    errorMessages: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      loading: false,
      paginatorInfo: {
        currentPage: 1,
        firstItem: 0,
        lastPage: 1,
        total: 0,
      },
    };
  },
  methods: {
    positionsLabel(user) {
      const list = user?.positions;
      if (!Array.isArray(list) || list.length === 0) {
        return "Sem posição";
      }
      const names = list.map((p) => p?.name).filter(Boolean);
      return names.length ? names.join(" • ") : "Sem posição";
    },
    add() {
      this.$emit("add");
    },
    actionDelete(id) {
      this.$emit("delete", id);
    },
  },
};
</script>

<style scoped>
.user-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #FF4E1B;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
  min-width: 0;
}

.user-name {
  font-weight: bold;
  color: #0b1e3a;
  margin: 0;
  line-height: 1.35;
}

.user-detail {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.35;
  min-width: 0;
}

.detail-icon {
  flex-shrink: 0;
  opacity: 0.85;
}

.detail-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.user-detail--positions .detail-text--positions {
  white-space: normal;
  word-break: break-word;
}

.delete-icon {
  cursor: pointer;
  transition: color 0.2s ease;
  color: #dc3545;
}

.delete-icon:hover {
  color: #c82333;
}

:deep(.va-list-label) {
  text-align: left;
  margin-bottom: 10px;
  color: #6b7280 !important;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
</style>
