<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    fullscreen
    persistent
    transition="dialog-bottom-transition"
    v-on="$listeners"
  >
    <v-card class="d-flex flex-column h-fullscreen justify-space-between">
      <v-toolbar flat dark color="primary" class="full-dialog-header">
        <v-layout justify-space-between>
          <v-toolbar-title class="d-flex align-center"
            >Thiết lập quyền nhóm người dùng</v-toolbar-title
          >
          <v-btn icon dark @click="showing = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-layout>
      </v-toolbar>
      <vue-perfect-scrollbar class="pa-4">
        <v-toolbar-title class="d-flex align-center"
          >Nhóm người dùng:&nbsp;
          <span class="red--text">{{
            item.display_name
          }}</span></v-toolbar-title
        >
        <permission-tree v-model="permissions"></permission-tree>
      </vue-perfect-scrollbar>
      <div class="full-dialog-footer mt-auto">
        <v-divider />
        <v-card-actions>
          <v-layout justify-end>
            <v-btn color="grey" text @click.native="showing = false">Hủy</v-btn>
            <v-btn
              :loading="loading"
              color="primary darken-1"
              text
              @click.native="updatePermission"
            >
              Xác nhận
            </v-btn>
          </v-layout>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import PermissionTree from "~/components/page/admin/role/PermissionTree.vue";
import { CODE_SUCCESS } from "~/constants/code";

const DEFAULT_ITEM = {
  id: null,
  display_name: null,
  permissions: []
};

interface ItemInterface {
  id: string;
  display_name: string;
  permissions: Array<string>;
}

interface ComponentData {
  showing: boolean;
  item: ItemInterface;
  loading: boolean;
  $roleRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;
  resetData(): void;
  mapData(): object;
  updatePermission(): void;
}

const RolePermissionDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RolePermissionDialog",
  components: { PermissionTree },
  data() {
    return {
      showing: false,
      loading: false,
      timeout: null,
      permissions: [],
      item: cloneDeep(DEFAULT_ITEM)
    };
  },

  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.permissions = [];
      }, 300);
    },
    show(item) {
      this.item = cloneDeep(item);
      this.permissions = this.item.permissions.map(e => e.id);
      this.showing = true;
    },

    mapData() {
      return {
        id: this.item.id,
        permission_ids: this.permissions
      };
    },

    async updatePermission() {
      this.loading = true;
      try {
        const params = this.mapData();
        const res = await this.$apiAction.updateRolePermission(params);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("update-success");
          this.$toast.global.edit_success("quyền của nhóm người dùng");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default RolePermissionDialog;
export type RolePermissionDialogRef = InstanceType<typeof RolePermissionDialog>;
</script>
