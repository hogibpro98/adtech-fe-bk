<template>
  <div id="appRoot">
    <template>
      <v-app id="inspire" class="app">
        <app-drawer class="app--drawer"></app-drawer>
        <report-drawer></report-drawer>
        <app-toolbar
          class="app--toolbar"
          @open-drawer="openThemeSettings"
        ></app-toolbar>
        <v-main>
          <!-- Page Header -->
          <app-notification />
          <div class="page-wrapper">
            <nuxt />
          </div>
          <!-- App Footer -->
          <v-footer height="auto" class="pa-3 app--footer">
            <span class="caption">&copy; {{ new Date().getFullYear() }}</span>
            <v-spacer></v-spacer>
            <span class="caption mr-1"></span>
          </v-footer>
        </v-main>
        <!-- Go to top -->
        <app-fab></app-fab>
        <!-- theme setting -->
        <v-navigation-drawer
          v-model="rightDrawer"
          class="setting-drawer"
          temporary
          right
          hide-overlay
          fixed
        >
          <theme-settings />
        </v-navigation-drawer>
      </v-app>
    </template>

    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.color"
      bottom
      right
    >
      {{ snackbar.text }}
      <v-btn dark text icon @click.native="snackbar.show = false">
        <v-icon>close</v-icon>
      </v-btn>
    </v-snackbar>
  </div>
</template>

<script>
import AppDrawer from "@/components/AppDrawer";
import AppToolbar from "@/components/AppToolbar";
import AppFab from "@/components/AppFab";
import ThemeSettings from "@/components/ThemeSettings";
import ReportDrawer from "~/components/ReportDrawer.vue";
import AppNotification from "~/components/notification/AppNotification.vue";

import page from "~/mixins/page";

export default {
  components: {
    ReportDrawer,
    AppDrawer,
    AppToolbar,
    AppFab,
    AppNotification,
    ThemeSettings
  },
  mixins: [page],
  middleware: [
    "auth-redirect",
    "check-verify",
    "fetch-permission",
    "check-permission"
  ],
  data: () => ({
    expanded: true,
    rightDrawer: false,
    snackbar: {
      show: false,
      text: "",
      color: ""
    }
  }),
  created() {
    this.fetchConfig();
  },
  methods: {
    openThemeSettings() {
      this.$vuetify.goTo(0);
      this.rightDrawer = !this.rightDrawer;
    },
    fetchConfig() {
      if (!this.$store.getters["config/hasFetch"]) {
        this.$store.dispatch("config/fetchConfig");
      }
    }
  }
};
</script>

<style lang="stylus" scoped>
.setting-fab
  top: 50% !important;
  right: 0;
  border-radius: 0

.page-wrapper
  min-height: calc(100vh - 64px - 50px - 81px);
  margin-bottom 50px;

.app--footer
  position absolute;
  bottom 0;
  width 100%;
</style>
