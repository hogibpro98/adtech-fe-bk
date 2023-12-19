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
            :filter="searchParams"
            calculate-widths
            :default-pagination="{
              sortBy: ['created_at'],
              sortDesc: [true]
            }"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
          >
            <template slot="item.duration" slot-scope="{ item }">
              {{ item.duration }} ngày
            </template>
            <!--            <template slot="item.price_map" slot-scope="{ item }">-->
            <!--              <v-layout-->
            <!--                v-for="(value, index) in item.data"-->
            <!--                :key="`${item.code}-${index}`"-->
            <!--                class="py-0"-->
            <!--                row-->
            <!--                wrap-->
            <!--                justify-space-between-->
            <!--              >-->
            <!--                <v-flex xs6 class="py-1 text-right"-->
            <!--                  >{{ value.capacity }} MB</v-flex-->
            <!--                >-->
            <!--                <v-divider vertical />-->
            <!--                <v-flex xs6 class="text-right py-1">{{-->
            <!--                  value.price | currency-->
            <!--                }}</v-flex>-->
            <!--                <v-divider />-->
            <!--              </v-layout>-->
            <!--            </template>-->
            <template slot="item.capacity" slot-scope="{ item }"
              >{{ item.capacity | numberSpace }}MB</template
            >
            <template slot="item.is_daily" slot-scope="{ item }">{{
              item.is_daily ? "X" : ""
            }}</template>
            <template slot="item.price" slot-scope="{ item }">{{
              item.capacity | currency
            }}</template>
            <template slot="item.updated_at" slot-scope="{ item }">{{
              item.updated_at | timestamp
            }}</template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | timestamp
            }}</template>
            <template slot="item.price" slot-scope="{ item }">{{
              item.price | currency
            }}</template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <data-package-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @edit-success="refreshTable(false)"
    ></data-package-form-dialog>
    <data-package-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></data-package-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import {
  ADS_TYPE,
  WHITELIST_IP,
  ROLE,
  PRICE_SERVICE,
  DATA_PACKAGE
} from "@/constants/resource";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import RoleSelect from "@/components/select/RoleSelect.vue";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

import WhitelistIpDeleteDialog, {
  WhitelistIpDeleteDialogRef
} from "~/components/page/admin/whitelist-ip/WhitelistIpDeleteDialog.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import { PriceService } from "~/interface/data/price";
import PriceServiceDialog, {
  PriceServiceDialogRef
} from "~/components/page/admin/price-service/PriceServiceDialog.vue";

import DataPackageFormDialog from "~/components/page/data-package/DataPackageFormDialog.vue";
import DataPackageDeleteDialog from "~/components/page/data-package/DataPackageDeleteDialog.vue";
interface ComponentData extends GlobalDataInterface {
  resource: string;
  headers: Array<DataTableHeader>;
  searchParams: Array<object>;
  filters: Array<FilterInterface>;
  $refs: {
    table: ApiDataTableRef;
    dialog: PriceServiceDialogRef;
    deleteDialog: WhitelistIpDeleteDialogRef;
  };
}

interface ComponentMethod {
  addItem(): void;

  editItem(item: PriceService): void;

  deleteItem(item: PriceService): void;

  refreshTable(toFirstPage: false): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  permission: false,
  components: {
    DataPackageDeleteDialog,
    DataPackageFormDialog,

    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      resource: DATA_PACKAGE,
      headers: [
        {
          text: "Mã gói cước",
          value: "code"
        },
        {
          text: "Thời gian sử dụng",
          value: "duration",
          align: "right"
        },
        {
          text: "Dung lượng",
          value: "capacity",
          // cellClass: "pa-3",
          align: "right"
          // sortable: false
        },
        {
          text: "Gửi hàng ngày",
          value: "is_daily",
          // cellClass: "pa-3",
          align: "right"
          // sortable: false
        },
        {
          text: "Đơn giá",
          value: "price",
          // cellClass: "pa-3",
          align: "right"
          // sortable: false
        },

        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center"
        },
        {
          text: "Cập nhật lần cuối",
          value: "updated_at",
          align: "center"
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
              // disabled: item => !item.item_permissions.includes("edit"),
              event: "edit-item"
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa",
              // disabled: item => !item.item_permissions.includes("edit"),
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
          name: "agency_id",
          label: "Tên agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            // queryParams: {
            //   type: ROLE_AGENCY
            // },
            label: "Agency"
          }
        },
        {
          type: RESOURCE,
          name: "cat_id",
          label: "Lĩnh vực hoạt động",
          itemValue: "name",
          itemText: "name",
          props: {
            multiple: false
          },
          component: BusinessActivitySelect
        },
        {
          type: DATE,
          name: "updated_at",
          label: "Thời gian cập nhật lần cuối"
        },
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo"
        },
        {
          type: SELECT,
          multiple: false,
          name: "service",
          label: "Dịch vụ",
          items: [
            {
              value: "mms",
              text: "MMS"
            },
            {
              value: "sms",
              text: "SMS"
            }
          ]
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
