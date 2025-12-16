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
                <p class="user-position">
                  {{ item.user.positions[0]?.name || "Sem posição" }}
                </p>
              </div>
            </div>
            <va-icon
              name="delete"
              color="white"
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
  background-color: #e9742b;
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
  font-size: 14px;
}

.user-name {
  font-weight: bold;
  color: #0b1e3a;
}

.user-position {
  font-size: 14px;
  color: #6c757d;
}

.delete-icon {
  cursor: pointer;
  transition: color 0.2s ease;
  background-color: rgb(0, 225, 255);
}

.delete-icon:hover {
  color: #c82333;
}

.va-list-label {
  text-align: left; /* Alinha o texto à esquerda */
  font-weight: bold; /* Opcional: mantém o texto em destaque */
  margin-bottom: 8px; /* Opcional: adiciona espaçamento abaixo */
}
</style>
