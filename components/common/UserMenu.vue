<template>
  <v-menu
    :nudge-right="140"
    :nudge-bottom="10"
    offset-y
    origin="center center"
    transition="scale-transition"
    z-index="50"
  >
    <template #activator="{ on, attrs }">
      <v-btn v-bind="attrs" icon large text v-on="on">
        <v-avatar size="30px">
          <v-icon>account_circle</v-icon>
        </v-avatar>
      </v-btn>
    </template>
    <v-list class="pa-0">
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title>{{ $auth.user.username }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider />
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        :disabled="item.disabled"
        :target="item.target"
        ripple
        @click="item.click"
      >
        <v-list-item-action v-if="item.icon">
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: "UserMenu",
  data() {
    return {
      items: [
        {
          icon: "account_circle",
          title: "Profile",
          click: this.goToProfile
        },
        {
          icon: "settings",
          title: "Tùy chỉnh",
          click: this.openSetting
        },
        {
          icon: "mdi-logout",
          title: "Đăng xuất",
          click: this.logout
        }
      ]
    };
  },
  methods: {
    goToProfile() {
      this.$router.push("/profile");
    },
    openSetting() {
      this.$emit("open-drawer");
    },
    async logout() {
      await this.$logout();
      this.$router.push("/login");
    }
  }
};
</script>

<style scoped></style>
