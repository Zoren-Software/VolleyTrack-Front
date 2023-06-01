<template>
  <ZNavBarItem>
    <va-navbar-item>
        <va-button-dropdown
          :color="color()" 
          hide-icon
        >
          <template #label>
            <va-badge overlap>
              <template #text>
                <va-icon size="12px" /> 99+
              </template>
              <va-icon name="notifications" />
            </va-badge>
          </template>
          <ZListItemsNotification />
        </va-button-dropdown>
      </va-navbar-item>
  </ZNavBarItem>
</template>

<script>

import ZNavBarItem from '~/components/atoms/NavBar/ZNavBarItem'
import ZButtonDropdown from '~/components/atoms/Buttons/ZButtonDropdown'
import ZBadge from '~/components/atoms/Badges/ZBadge'
import ZIcon from '~/components/atoms/Icons/ZIcon'
import ZListItemsNotification from '~/components/organisms/List/ZListItemsNotification'

export default {
  components: {
    ZNavBarItem,
    ZButtonDropdown,
    ZBadge,
    ZIcon,
    ZListItemsNotification
  },
  methods: {
    color() {
      return this.$route.path === "/notifications" ? "primary" : "background-primary";
    },
  }
};
</script>