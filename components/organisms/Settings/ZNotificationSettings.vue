<template>
  <div class="notification-settings">
    <div class="content">
      <h1 class="title">Preferências de Notificação</h1>
      <p class="subtitle">
        Escolha como deseja receber notificações para cada tipo de evento do sistema
      </p>

      <!-- Eventos Notificáveis -->
      <div class="card">
        <h2 class="card-title">
          <va-icon name="settings" class="icon-orange" /> Eventos Notificáveis
        </h2>
        <table class="events-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>E-mail</th>
              <th>Sistema</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in filteredEvents" :key="event.id">
              <td>
                <div class="event-info">
                  <va-icon :name="event.icon" :class="['event-icon', event.color]" />
                  <div>
                    <p class="event-title">{{ event.title }}</p>
                    <p class="event-description">{{ event.description }}</p>
                  </div>
                </div>
              </td>
              <td>
                <va-switch v-model="event.email" color="orange" />
              </td>
              <td>
                <va-switch v-model="event.system" color="orange" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Botão Salvar Configurações -->
      <div class="save-button-container">
        <va-button color="orange" class="save-button" @click="saveSettings">
          Salvar Configurações
        </va-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      events: [
        {
          id: 1,
          title: "Novo treino criado",
          description: "Quando um novo treino for agendado",
          icon: "event",
          color: "icon-green",
          email: false,
          system: true,
        },
        {
          id: 2,
          title: "Treino cancelado",
          description: "Quando um treino for cancelado",
          icon: "cancel",
          color: "icon-red",
          email: false,
          system: true,
        },
        {
          id: 3,
          title: "Treino alterado",
          description: "Quando informações de um treino forem modificadas",
          icon: "edit",
          color: "icon-blue",
          email: false,
          system: false,
        },
        {
          id: 4,
          title: "Nova avaliação disponível",
          description: "Quando uma nova avaliação técnica for criada",
          icon: "assessment",
          color: "icon-yellow",
          email: false,
          system: false,
        },
        {
          id: 5,
          title: "Comentários técnicos",
          description: "Quando novos comentários técnicos forem adicionados",
          icon: "comment",
          color: "icon-purple",
          email: false,
          system: false,
        },
      ],
    };
  },
  computed: {
    filteredEvents() {
      return this.events.filter((event) =>
        ["Novo treino criado", "Treino cancelado"].includes(event.title)
      );
    },
  },
  methods: {
    saveSettings() {
      console.log("Configurações salvas:", {
        events: this.filteredEvents,
      });
    },
  },
};
</script>

<style scoped>
.notification-settings {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
}

.content {
  max-width: 800px;
  width: 100%;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #0B1E3A;
  text-align: center;
}

.subtitle {
  font-size: 16px;
  color: #6C757D;
  text-align: center;
  margin-bottom: 20px;
}

.card {
  background-color: #FFFFFF;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: #0B1E3A;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-orange {
  color: #E9742B;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.events-table th,
.events-table td {
  padding: 10px;
  text-align: left;
}

.events-table th {
  background-color: #E9ECEF;
  color: #0B1E3A;
}

.events-table td {
  background-color: #FFFFFF;
}

.event-info {
  display: flex;
  align-items: center;
}

.event-icon {
  margin-right: 10px;
  font-size: 24px;
}

.icon-green {
  color: #28A745;
}

.icon-red {
  color: #DC3545;
}

.event-title {
  font-weight: bold;
  color: #0B1E3A;
}

.event-description {
  font-size: 12px;
  color: #6C757D;
}

.save-button-container {
  text-align: center;
  margin-top: 20px;
}

.save-button {
  background-color: #E9742B;
  color: #FFFFFF;
}
</style>
