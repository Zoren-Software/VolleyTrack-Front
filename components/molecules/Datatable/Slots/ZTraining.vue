<template>
  <div class="training-cell">
    <div class="training-name">{{ data.name }}</div>
    <div class="training-meta">
      <div class="training-date-line">
        <va-icon name="event" size="14px" color="#6c757d" />
        <span>{{ formattedDate }}</span>
      </div>
      <div class="training-time-line">
        <va-icon name="schedule" size="14px" color="#6c757d" />
        <span>{{ formattedTimeRange }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";

export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    metrics: {
      type: Object,
      required: true,
    },
  },
  computed: {
    formattedDate() {
      const start = this.data?.dateStart ? moment(this.data.dateStart) : null;
      if (!start || !start.isValid()) return "-";
      return start.format("DD/MM/YYYY");
    },
    formattedTimeRange() {
      const start = this.data?.dateStart ? moment(this.data.dateStart) : null;
      const end = this.data?.dateEnd ? moment(this.data.dateEnd) : null;
      if (!start || !start.isValid()) return "-";
      const startTime = start.format("HH:mm");
      const endTime = end && end.isValid() ? end.format("HH:mm") : "-";
      return `${startTime} – ${endTime}`;
    },
  },
};
</script>

<style scoped>
.training-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 4px 0;
  min-width: 0;
}

.training-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.training-date-line,
.training-time-line {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.training-name {
  font-weight: 600;
  font-size: 14px;
  color: #0b1e3a;
  line-height: 1.4;
  word-break: break-word;
}
</style>
