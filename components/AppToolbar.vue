<template>
  <v-app-bar color="primary" fixed dark app style="z-index: 20;">
    <v-toolbar-title class="ml-0 px-3">
      <v-app-bar-nav-icon @click.stop="toggleDrawer()"></v-app-bar-nav-icon>
    </v-toolbar-title>
    <v-menu offset-y content-class="data-table-toolbar mt-2">
      <template #activator="{ attrs, on }">
        <span v-bind="attrs" class="w-full max-width-50" v-on="on">
          <search-tool-bar></search-tool-bar>
        </span>
      </template>
    </v-menu>
    <v-spacer></v-spacer>
    <v-btn icon @click="handleFullScreen()">
      <v-icon>fullscreen</v-icon>
    </v-btn>
    <notification-component />
    <user-menu @open-drawer="openSetting"></user-menu>
  </v-app-bar>
</template>
<script lang="ts">
import Util from "@/util";
import Vue, { VueConstructor } from "vue";
import UserMenu from "@/components/common/UserMenu";
import SearchToolBar from "~/components/common/SearchToolBar.vue";
import NotificationComponent from "~/components/notification/NotificationComponent.vue";
import { MenuItem } from "~/interface/data/menu";
import { GlobalDataInterface } from "~/interface/data/global";
interface ComponentMethods {
  goToProfile(): void;
  openSetting(): void;
  logout(): void;
}

interface ComponentData extends GlobalDataInterface {
  menu: Array<MenuItem>;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AppToolbar",
  components: {
    NotificationComponent,
    SearchToolBar,
    UserMenu
  },
  data() {
    return {
      menu: []
    };
  },
  computed: {
    toolbarColor() {
      // @ts-ignore
      return this.$vuetify.options.extra.mainNav;
    }
  },
  methods: {
    toggleDrawer() {
      this.$store.commit("toggleDrawer");
    },
    handleFullScreen() {
      Util.toggleFullScreen();
    },
    openSetting() {
      this.$emit("open-drawer");
    }
  }
});
</script>
<style></style>
