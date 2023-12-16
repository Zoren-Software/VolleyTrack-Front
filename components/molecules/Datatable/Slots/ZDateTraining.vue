<template>
  <div class="row justify-start">
    <div class="flex flex-col xs2">
      <div class="item">
        <div class="pl-2">
          <div class="flex gap-1 mb-1">
            <span
              ><b>{{ formatDateRange(dateStart, dateEnd).date }}</b></span
            >
          </div>
          <div class="flex gap-1 mb-1">
            <span>{{ formatDateRange(dateStart, dateEnd).time }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ZBadge from "~/components/atoms/Badges/ZBadge";
import ZButton from "~/components/atoms/Buttons/ZButton";
import moment from "moment";

export default {
  components: {
    ZBadge,
    ZButton,
  },
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
