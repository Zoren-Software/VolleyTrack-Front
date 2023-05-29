<template>
  <ZNavBarItem>
    <va-navbar-item>
        <va-button-dropdown
          color="background-primary"
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
          <ListItemsNotification />
        </va-button-dropdown>
      </va-navbar-item>
  </ZNavBarItem>
</template>

<script>
import ZNavBarItem from '~/components/atoms/NavBar/ZNavBarItem'
import ZButtonDropdown from '~/components/atoms/Buttons/ZButtonDropdown'
import ZBadge from '~/components/atoms/Badges/ZBadge'
import ZIcon from '~/components/atoms/Icons/ZIcon'
import ListItemsNotification from '~/components/menu/actions/notification/ListItems'

export default {
  components: {
    ZNavBarItem,
    ZButtonDropdown,
    ZBadge,
    ZIcon,
    ListItemsNotification
  }
};
</script>