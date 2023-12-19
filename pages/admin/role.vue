<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <v-divider />
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :toolbar="{
              isCreate: true
            }"
            page-name="admin-role"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @change-permission="changePermission"
          >
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | date
            }}</template>
            <template slot="item.updated_at" slot-scope="{ item }">{{
              item.updated_at | timestamp
            }}</template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <role-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></role-dialog>
    <role-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></role-delete-dialog>
    <role-permission-dialog
      ref="permissionDialog"
      @update-success="refreshTable"
    >
    </role-permission-dialog>
  </v-container>
</template>
<script lang="ts">
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import RoleDialog, {
  RoleDialogRef
} from "~/components/page/admin/role/RoleDialog.vue";
import { ROLE } from "~/constants/resource";
import RoleDeleteDialog, {
  RoleDeleteDialogRef
} from "~/components/page/admin/role/RoleDeleteDialog.vue";
import RolePermissionDialog, {
  RolePermissionDialogRef
} from "~/components/page/admin/role/RolePermissionDialog.vue";
import { DATE } from "~/constants/filterType";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { RolesInterface } from "~/interface/data/permission";
import { FilterInterface } from "~/interface/data/filter";

interface ComponentData extends GlobalDataInterface {
  resource: string;
  searchParams: Array<object>;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  $refs: {
    table: ApiDataTableRef;
    dialog: RoleDialogRef;
    deleteDialog: RoleDeleteDialogRef;
    permissionDialog: RolePermissionDialogRef;
  };
}

interface ComponentMethod {
  changePermission(item: RolesInterface): void;

  addItem(): void;

  editItem(item: RolesInterface): void;

  deleteItem(item: RolesInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    NewCustomFilter,
    RolePermissionDialog,
    RoleDeleteDialog,
    RoleDialog,
    ApiDataTable
  },
  layout: "dashboard",
  data() {
    return {
      resource: ROLE,
      searchParams: null,
      filters: [
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo"
        }
      ],
      headers: [
        {
          text: "Mã nhóm người dùng",
          value: "name",
          width: 180
        },
        {
          text: "Tên hiển thị",
          value: "display_name",
          width: 160
        },
        {
          text: "Mô tả",
          value: "description",
          width: 400
        },
        {
          text: "Trang mặc định",
          value: "default_page",
          width: 180
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: 144
        },
        {
          text: "Cập nhật lần cuối",
          value: "updated_at",
          align: "center",
          width: 180
        },
        {
          text: "Hành động",
          align: "right",
          width: 120,
          value: "action",
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
              label: item => {
                if (item.users_count > 0) {
                  return "Tồn tại người dùng thuộc nhóm người dùng này";
                }
                return "Xóa";
              },
              disabled: item => item.users_count > 0,
              event: "delete-item"
            },
            {
              color: "purple",
              icon: "accessibility",
              label: "Thiết lập quyền",
              event: "change-permission"
            }
          ]
        }
      ]
    };
  },
  methods: {
    changePermission(item) {
      this.$refs.permissionDialog.show(item);
    },
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
