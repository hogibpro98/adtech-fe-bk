<template>
  <v-navigation-drawer
    id="appDrawer"
    v-model="drawer"
    class="z-20"
    :mini-variant.sync="mini"
    :dark="$vuetify.dark"
    fixed
    app
    width="260"
  >
    <NuxtLink to="/" class="sticky-header">
      <v-toolbar color="primary darken-1" dark>
        <v-toolbar-title class="ml-0 pl-3 bold">
          <span class="hidden-sm-and-down">VDA</span>
        </v-toolbar-title>
      </v-toolbar>
    </NuxtLink>
    <vue-perfect-scrollbar
      v-if="isVerified"
      :settings="scrollSettings"
      class="drawer-menu--scroll"
    >
      <v-list dense height="40">
        <template v-for="(item, i) in menus">
          <v-list-group
            v-if="item.items"
            :key="item.name"
            :group="item.group"
            :prepend-icon="item.icon"
            :value="item.isActive"
            class="list-group-menu"
            no-action
          >
            <v-list-item-content slot="activator" dense ripple="ripple">
              <v-list-item-title class="pre-wrap"
                >{{ item.title }}
              </v-list-item-title>
            </v-list-item-content>

            <template v-for="(subItem, i) in item.items">
              <!--sub group-->
              <v-list-group
                v-if="subItem.items"
                :key="subItem.name"
                :group="subItem.group"
                :value="subItem.isActive"
                sub-group
              >
                <v-list-item-content slot="activator" ripple="ripple">
                  <v-list-item-title class="pre-wrap"
                    >{{ subItem.title }}
                  </v-list-item-title>
                </v-list-item-content>
                <v-list-item
                  v-for="(grand, i) in subItem.items"
                  :key="i"
                  :to="grand.href && !grand.type ? grand.href : null"
                  exact-path
                  ripple="ripple"
                  :value="grand.isActive"
                  @click="handleClickItem($event, grand)"
                >
                  <v-list-item-content>
                    <v-list-item-title class="pre-wrap ml-8"
                      >{{ grand.title }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-group>
              <!--child item-->
              <v-list-item
                v-else
                :key="i"
                :to="subItem.href && !subItem.type ? subItem.href : null"
                :disabled="subItem.disabled"
                :target="subItem.target"
                exact-path
                dense
                ripple="ripple"
                @click="handleClickItem($event, subItem)"
              >
                <v-list-item-content>
                  <v-list-item-title class="pre-wrap"
                    ><span>{{ subItem.title }}</span></v-list-item-title
                  >
                </v-list-item-content>
                <v-list-item-action v-if="subItem.action">
                  <v-icon :class="[subItem.actionClass || 'success--text']"
                    >{{ subItem.action }}
                  </v-icon>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list-group>
          <template v-else-if="item.header">
            <v-subheader
              v-show="checkShowHeaderMenus(item.name)"
              :key="i"
              class="primary--text"
            >
              {{ item.header }}
            </v-subheader>
          </template>
          <v-divider v-else-if="item.divider" :key="i"></v-divider>
          <!--top-level link-->
          <v-list-item
            v-else
            :key="item.name"
            :to="item.href && !item.type ? item.href : null"
            :disabled="item.disabled"
            :target="item.target"
            dense
            exact-path
            ripple="ripple"
            rel="noopener"
            @click="handleClickItem($event, item)"
          >
            <v-list-item-action v-if="item.icon" class="my-2">
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-action>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action v-if="item.subAction">
              <v-icon class="success--text">{{ item.subAction }}</v-icon>
            </v-list-item-action>
          </v-list-item>
        </template>
      </v-list>
    </vue-perfect-scrollbar>
  </v-navigation-drawer>
</template>
<script lang="ts">
import menu from "@/api/menu";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { USER_STATUS } from "~/constants/code";
import { MenuItem } from "~/interface/data/menu";
import { isArray } from "~/util/typeof";
import { GlobalDataInterface } from "~/interface/data/global";

interface ComponentMethods {
  getDisplayMenus(menu: any, parentName?: string): Array<MenuItem>;

  generateGroupName(menu: Array<MenuItem>): Array<MenuItem>;

  isActive(object): boolean;
}

interface ComponentData extends GlobalDataInterface {}

interface computedInterface {
  isVerified: boolean;
  drawer: object;
  computeGroupActive: boolean;
  menus: Array<MenuItem>;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & computedInterface
>).extend({
  name: "AppDrawer",
  props: {
    expanded: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    mini: false,
    scrollSettings: {
      maxScrollbarLength: 160
    }
  }),
  computed: {
    isVerified() {
      return this.$auth.user.status === USER_STATUS.ACTIVE;
    },
    drawer: {
      get() {
        return this.$store.state.drawer;
      },
      set(val) {
        this.$store.commit("drawer", val);
      }
    },
    computeGroupActive() {
      return true;
    },
    menus() {
      const newMenu = cloneDeep(menu);
      return this.generateGroupName(this.getDisplayMenus(newMenu));
    }
  },
  methods: {
    handleClickItem(event, menuItem) {
      if (menuItem.type === "report") {
        event.preventDefault();
        event.stopPropagation();
        this.$store.commit("report/TOGGLE_REPORT_DRAWER");
      }
    },
    generateGroupName(menu) {
      const path = this.$route.path;
      return menu.map(item => {
        if (isArray(item?.items)) {
          item.items = this.generateGroupName(item.items);
          if (
            item.items.some(e => {
              return e.isActive;
            })
          ) {
            item.isActive = true;
          }
        }
        if (item.href === path) {
          item.isActive = true;
        }
        return item;
      });
    },
    genChildTarget(item, subItem) {
      if (subItem.href) return;
      if (subItem.component) {
        return {
          name: subItem.component
        };
      }
      return { name: `${item.group}/${subItem.name}` };
    },
    checkShowHeaderMenus(name) {
      if (this.menus) {
        return this.menus.some(item => item.groupHeader === name);
      }
      return false;
    },
    getDisplayMenus(menus) {
      return menus.filter(item => {
        const routeName =
          item.href && item.href.substring(1).replace(/\//g, "-");
        if (item.items) {
          item.items = this.getDisplayMenus(item.items);
          return item.items.length > 0;
        } else {
          let viewable = true;
          if (item.permission) {
            viewable = viewable && this.$can(`${routeName}.view`);
          }
          if (item.service) {
            viewable = viewable && this.$hasService(item.service);
          }
          return viewable;
        }
      });
    },
    isActive(item) {
      if (item.items) {
        return item.items.some(e => {
          return e.href === this.$route.fullPath || this.isActive(e);
        });
      } else return false;
    }
  }
});
</script>

<style lang="stylus">
#appDrawer
  z-index: 15
  overflow-y: hidden

  .drawer-menu--scroll
    height: calc(100vh - 64px)
    overflow: hidden !important

.v-navigation-drawer__content
  overflow hidden

.v-navigation-drawer__content::-webkit-scrollbar
  width: 0
</style>
<style lang="scss">
.v-list .v-list-item--active {
  color: initial;
}
.list-group-menu {
  .v-list-item__icon {
    min-width: 32px !important;
    width: 32px !important;
  }

  .v-list-group__header__prepend-icon {
    margin-right: 8px !important;
  }
}

//.v-list .v-list-item {
//  padding: 0 8px;
//}
//.v-list-item__action {
//  margin-right: 8px !important;
//}
//.v-application--is-ltr
//  .v-list-group--no-action
//  > .v-list-group__items
//  > .v-list-item {
//  padding-left: 48px !important;
//}
//.v-application--is-ltr
//  .v-list--dense
//  .v-list-group--sub-group
//  .v-list-group__header {
//  padding-left: 16px !important;
//}
//.v-application--is-ltr
//  .v-list-group--sub-group
//  .v-list-group__items
//  .v-list-item {
//  padding-left: 56px !important;
//}
</style>
