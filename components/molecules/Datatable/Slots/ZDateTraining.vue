<template>
  <div class="date-training-container">
    <div class="date-section">
      <va-icon name="event" size="small" color="secondary" class="date-icon" />
      <span class="date-text">{{
        formatDateRange(dateStart, dateEnd).date
      }}</span>
    </div>
    <div class="time-section">
      <va-icon
        name="schedule"
        size="small"
        color="secondary"
        class="time-icon"
      />
      <span class="time-text">{{
        formatDateRange(dateStart, dateEnd).time
      }}</span>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    dateStart: {
      type: Object,
      required: true,
    },
    dateEnd: {
      type: Object,
      required: true,
    },
  },
  methods: {
    willTeams(total) {
      total = total.length;
      if (total <= 1) return "";
      return `+${total - 1}`;
    },

    formatDateRange(dateStart, dateEnd) {
      const formattedDate = this.formatDate(dateStart); // Formata a data (dd/mm/yyyy)
      const startTime = moment(dateStart).format("HH:mm"); // Extrai a hora de início (hh:mm)
      const endTime = moment(dateEnd).format("HH:mm"); // Extrai a hora de fim (hh:mm)

      return {
        date: formattedDate,
        time: `das ${startTime} às ${endTime}`,
      };
    },

    formatDate(date) {
      return moment(date).format("DD/MM/YYYY");
    },
  },
};
</script>

<style scoped>
.date-training-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.date-section,
.time-section {
  display: flex;
  align-items: center;
  gap: 6px;
}

.date-icon,
.time-icon {
  flex-shrink: 0;
}

.date-text {
  color: #0b1e3a;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.time-text {
  color: #6c757d;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}
</style>
