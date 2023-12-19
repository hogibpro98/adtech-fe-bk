<template>
  <v-container grid-list-xl fluid>
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :toolbar="{
              isCreate: true
            }"
            page-name="admin-permission"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
          >
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <permission-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></permission-dialog>
    <permission-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></permission-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { GlobalDataInterface } from "~/interface/data/global";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import PermissionDialog, {
  PermissionDialogRef
} from "~/components/page/admin/permission/PermissionDialog.vue";
import { PERMISSION } from "~/constants/resource";
import PermissionDeleteDialog, {
  PermissionDeleteDialogRef
} from "~/components/page/admin/permission/PermissionDeleteDialog.vue";
import { PermissionInterface } from "~/interface/data/permission";

interface ComponentData extends GlobalDataInterface {
  resource: string;
  headers: Array<DataTableHeader>;
  $refs: {
    table: ApiDataTableRef;
    deleteDialog: PermissionDeleteDialogRef;
    dialog: PermissionDialogRef;
  };
}

interface ComponentMethod {
  addItem(): void;
  editItem(item: PermissionInterface): void;
  deleteItem(item: PermissionInterface): void;
  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  permission: false,
  components: { PermissionDeleteDialog, PermissionDialog, ApiDataTable },
  layout: "dashboard",
  data() {
    return {
      resource: PERMISSION,
      headers: [
        {
          text: "Mã quyền",
          value: "name"
        },
        {
          text: "Tên hiển thị",
          value: "display_name"
        },
        {
          text: "Mô tả",
          value: "description"
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              event: "edit-item"
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa",
              event: "delete-item"
            }
          ]
        }
      ]
    };
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
