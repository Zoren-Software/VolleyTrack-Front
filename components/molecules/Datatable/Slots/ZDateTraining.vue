<template>
  <div class="row justify-start">
    <div class="flex flex-col xs2">
      <div class="item">
        <div class="pl-2">
          <div class="flex gap-1 mb-1">
            <span
              ><b>{{ date }}</b></span
            >
          </div>
          <div class="flex gap-1 mb-1">
            <span>{{ time }}</span>
          </div>
        </div>
      </div>
    </div>
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
    date: {
      type: Object,
      required: true,
    },
    time: {
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
  },
};
</script>
