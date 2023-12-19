<template>
  <v-flex xs12>
    <v-layout
      row
      class="align-center layout px-6 pt-4 app--page-header"
      style="height: 80px"
    >
      <v-icon>home</v-icon>
      <v-breadcrumbs divider="-" :items="breadcrumbs"> </v-breadcrumbs>
    </v-layout>
  </v-flex>
</template>

<script lang="ts">
import menu from "@/api/menu";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  title: string;
  rightDrawer: boolean;
  menu: Array<object>;
}

interface ComponentMethods {}

const PageHeader = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  data() {
    return {
      title: "",
      rightDrawer: false,
      menu
    };
  },
  computed: {
    breadcrumbs() {
      const breadcrumbs = [];
      const pathname = this.$route.path?.replace(/\/$/, "");
      this.menu.forEach(item => {
        if (item.items) {
          const child = item.items.find(i => {
            return i.href === pathname;
          });
          if (child) {
            breadcrumbs.push({ text: item.title });
            breadcrumbs.push({ text: child.title, disabled: true });
            this.title = child.title;
          } else {
            let grandChild;
            let childTitle;
            for (let i = 0; i < item.items.length; i++) {
              if (item.items[i].items) {
                grandChild = item.items[i].items.find(i => {
                  return i.href === pathname;
                });
                if (grandChild) {
                  childTitle = item.items[i].title;
                  break;
                }
              }
            }
            if (grandChild) {
              breadcrumbs.push({ text: item.title });
              breadcrumbs.push({ text: childTitle, disabled: true });
              breadcrumbs.push({ text: grandChild.title, disabled: true });
              this.title = grandChild.title;
            }
          }
        } else if (item.href === pathname) {
          this.title = item.title;
          breadcrumbs.push({ text: item.title });
        }
      });
      return breadcrumbs;
    },
    passwordExpiredAt(){

    },
    isNearExpiredPassword(){

    }
  },
  methods: {}
});

export default PageHeader;
export type PageHeaderRef = InstanceType<typeof PageHeader>;
</script>
<style>
.setting-drawer {
  z-index: 1000;
}
</style>
