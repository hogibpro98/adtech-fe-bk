<template>
  <v-treeview
    class="pr-2"
    :items="items"
    :open.sync="open"
    item-children="items"
    item-key="name"
    item-text="title"
    open-on-click
  >
    <template #append="{ item, open }">
      <v-layout row wrap justify-end align-center>
        <v-checkbox
          v-for="(value, index) in item.actions"
          :key="value.id"
          v-model="rolePermissions"
          :label="value.action"
          :value="value.id"
          class="tree-checkbox"
        ></v-checkbox>
      </v-layout>
    </template>
  </v-treeview>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { splitPermission } from "~/helpers/ultis";
import Menu from "~/api/menu";
import { RepositoryInterface } from "~/interface/plugin/repository";

interface ComponentData {
  permissions: Array<string>;
  open: Array<string>;
  rolePermissions: Array<object>;
  $permissionRepository: RepositoryInterface;
}

interface ComponentMethods {
  filterMenu(menu: Array<object>): Array<object>;
  addMenuAction(menu: Array<object>): void;
  fetchAllPermissions(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PermissionTree",
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      permissions: [],
      open: [],
      rolePermissions: []
    };
  },
  computed: {
    items() {
      const menu = this.filterMenu(cloneDeep(Menu));
      return this.addMenuAction(menu);
    }
  },
  watch: {
    value: {
      handler(val) {
        this.rolePermissions = val;
      },
      deep: true
    },
    rolePermissions(val) {
      this.$emit("input", val);
    }
  },
  mounted() {
    this.fetchAllPermissions();
  },
  methods: {
    filterMenu(menu) {
      return menu.filter(e => {
        if (e.items) {
          e.items = this.filterMenu(e.items);
          return e.items.length > 0;
        } else {
          return e.title;
        }
      });
    },

    addMenuAction(menu) {
      return menu.map(e => {
        const name = e.href && e.href.substring(1).replace(/\//g, "-");

        if (e.items) {
          e.items = this.addMenuAction(e.items);
        }
        return {
          ...e,
          actions: this.permissions.filter(item => {
            return item.page === name;
          })
        };
      });
    },

    async fetchAllPermissions() {
      const res = await this.$permissionRepository.all();
      if (res) {
        this.permissions = res.results.map(e => {
          return {
            ...e,
            ...splitPermission(e.name)
          };
        });
        await this.$nextTick();
        this.rolePermissions = this.value;
      } else {
        this.$toast.global.action_fail();
      }
    }
  }
});
</script>

<style lang="scss">
.tree-checkbox {
  margin-top: 6px;
  margin-right: 16px;
  padding-top: 6px;

  .v-input__slot {
    margin-bottom: 0px;
  }

  .v-messages {
    font-size: 10px;
    min-height: 12px;
  }
}
</style>
