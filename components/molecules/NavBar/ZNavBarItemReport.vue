<template>
  <ZNavBarItem>
    <ZPopover message="Reporte um problema ou sugestão" placement="bottom">
      <ZButton
        href="https://github.com/Zoren-Software/VoleiClub/issues/new?assignees=&labels=bug&template=--bug--.md&title=%5B+BUG+%5D+Descri%C3%A7%C3%A3o+do+Bug"
        target="blank"
        color="background-primary"
      >
        <ZIcon name="assessment" color="text-primary" />
      </ZButton>
    </ZPopover>
  </ZNavBarItem>
</template>

<script>
import ZNavBarItem from "~/components/atoms/NavBar/ZNavBarItem";
import ZPopover from "~/components/atoms/Popover/ZPopover";
import ZButton from "~/components/atoms/Buttons/ZButton";
import ZIcon from "~/components/atoms/Icons/ZIcon";

export default {
  components: {
    ZNavBarItem,
    ZPopover,
    ZButton,
    ZIcon,
  },
};
</script>
