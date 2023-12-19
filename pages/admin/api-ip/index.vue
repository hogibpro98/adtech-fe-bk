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
              isCreate: false
            }"
            page-name="admin-api-ip"
            :filter="searchParams"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
          >
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                v-if="USER_STATUS_MAP[item.status]"
                :color="USER_STATUS_MAP[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ USER_STATUS_MAP[item.status].text }}</v-chip
              >
            </template>
            <template slot="item.ipv4" slot-scope="{ item }">
              <ul v-if="item.ipv4 && item.ipv4.length > 0">
                <li
                  v-for="(value, index) in item.ipv4"
                  :key="`${item.id}-ip-${index}`"
                >
                  {{ value.ip }} {{ value.note ? ` - ${value.note}` : "" }}
                </li>
              </ul>
              <span v-else>Chưa thiết lập IP sử dụng</span>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <api-ip-dialog ref="dialog" @success="refreshTable"></api-ip-dialog>
  </v-container>
</template>
<script lang="ts">
import { RESOURCE, SELECT } from "@/constants/filterType";
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
import { USER_STATUS_MAP } from "~/constants/dataSelect";
import ApiIpDialog from "~/components/page/admin/api-ip/ApiIpDialog.vue";

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
  components: {
    ApiIpDialog,
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      headers: [
        {
          text: "Tên doanh nghiệp",
          value: "full_name"
        },
        {
          text: "Tên tài khoản",
          value: "username"
        },
        {
          text: "Trạng thái",
          align: "center",
          value: "status"
        },
        {
          text: "IP sử dụng",
          value: "ipv4",
          sortable: false
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
            }
          ]
        }
      ],
      searchParams: {}
    };
  },
  computed: {
    USER_STATUS_MAP() {
      return USER_STATUS_MAP;
    },
    resource() {
      return "/user-ip";
    },
    filters() {
      return [
        {
          type: SELECT,
          name: "status",
          label: "Trạng thái",
          items: [
            {
              value: "ACTIVE",
              text: "Đang sử dụng"
            },
            {
              value: "LOCKED",
              text: "Đã khóa"
            }
          ],
          multiple: false
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
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
