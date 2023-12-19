<template>
  <v-container grid-list-xl fluid>
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :toolbar="{
              isCreate: true
            }"
            :filter="searchParams"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
          >
            <template slot="item.updated_at" slot-scope="{ item }">
              {{ item.updated_at | timestamp }}
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <whitelist-ip-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></whitelist-ip-dialog>
    <whitelist-ip-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></whitelist-ip-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import { WHITELIST_IP } from "@/constants/resource";
import { RESOURCE } from "@/constants/filterType";
import RoleSelect from "@/components/select/RoleSelect.vue";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { WhitelistIp } from "~/interface/data/permission";
import WhitelistIpDialog, {
  WhitelistIpDialogRef
} from "~/components/page/admin/whitelist-ip/WhitelistIpDialog.vue";
import WhitelistIpDeleteDialog, {
  WhitelistIpDeleteDialogRef
} from "~/components/page/admin/whitelist-ip/WhitelistIpDeleteDialog.vue";

interface ComponentData extends GlobalDataInterface {
  resource: string;
  headers: Array<DataTableHeader>;
  searchParams: Array<object>;
  filters: Array<FilterInterface>;
  $refs: {
    table: ApiDataTableRef;
    dialog: WhitelistIpDialogRef;
    deleteDialog: WhitelistIpDeleteDialogRef;
  };
}

interface ComponentMethod {
  addItem(): void;
  editItem(item: WhitelistIp): void;
  deleteItem(item: WhitelistIp): void;
  refreshTable(toFirstPage: false): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
  >).extend({
  permission: false,
  components: {
    WhitelistIpDeleteDialog,
    WhitelistIpDialog,
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      resource: WHITELIST_IP,
      headers: [
        {
          text: "IP",
          value: "ip"
        },
        {
          text: "Nhóm người dùng",
          value: "role.display_name",
          sortable: false
        },
        {
          text: "Người cập nhật",
          value: "updated_user.username",
          sortable: false
        },
        {
          text: "Cập nhật lần cuối",
          value: "updated_at"
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
      ],
      searchParams: {}
    };
  },
  computed: {
    filters() {
      return [
        {
          type: RESOURCE,
          component: RoleSelect,
          name: "role_id",
          label: "Nhóm người dùng",
          itemValue: "id",
          itemText: "display_name",
          props: {
            multiple: false,
            itemValue: "id",
            isSystemMode: 1
          }
        }
      ];
    }
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
