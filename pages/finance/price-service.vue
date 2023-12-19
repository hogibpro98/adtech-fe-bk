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
            :default-pagination="{
              sortBy: ['created_at'],
              sortDesc: [true]
            }"
            page-name="finance-price-service"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
          >
            <template slot="item.service" slot-scope="{ item }">
              <span v-if="item.service">{{ item.service.toUpperCase() }}</span>
            </template>
            <template slot="item.updated_at" slot-scope="{ item }">{{
              item.updated_at | timestamp
            }}</template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | date
            }}</template>
            <template slot="item.price" slot-scope="{ item }">
              <span v-if="item.price !== null">{{
                item.price | currency
              }}</span>
              <span v-else>Không sử dụng dịch vụ</span>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <price-service-edit-dialog
      ref="editDialog"
      @update-success="refreshTable"
    ></price-service-edit-dialog>
    <!--    <price-service-dialog-->
    <!--      ref="dialog"-->
    <!--      @create-success="refreshTable(true)"-->
    <!--    ></price-service-dialog>-->
    <price-service-add-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
    ></price-service-add-dialog>
    <price-service-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></price-service-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import {
  ADS_TYPE,
  WHITELIST_IP,
  ROLE,
  PRICE_SERVICE
} from "~/constants/resource";
import { DATE, RESOURCE, SELECT } from "~/constants/filterType";
import RoleSelect from "~/components/select/RoleSelect.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
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
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import { PriceService } from "~/interface/data/price";
import PriceServiceDialog, {
  PriceServiceDialogRef
} from "~/components/page/admin/price-service/PriceServiceDialog.vue";
import PriceServiceEditDialog from "~/components/page/admin/price-service/PriceServiceEditDialog.vue";
import PriceServiceDeleteDialog from "~/components/page/admin/price-service/PriceServiceDeleteDialog.vue";
import PriceServiceAddDialog from "~/components/page/admin/price-service/PriceServiceAddDialog.vue";
import { STATUS_BANNER_MMS_FILTER } from "~/constants/dataSelect";

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
  components: {
    PriceServiceAddDialog,
    PriceServiceDeleteDialog,
    PriceServiceEditDialog,
    PriceServiceDialog,
    WhitelistIpDeleteDialog,
    WhitelistIpDialog,
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      resource: PRICE_SERVICE,
      headers: [
        {
          text: "Tên agency",
          sortable: false,
          value: "agency.full_name"
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "cat_id"
        },
        {
          text: "Dịch vụ",
          value: "service"
        },
        {
          text: "Đơn giá",
          value: "price",
          align: "right"
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
              disabled: item => !item.item_permissions.includes("edit"),
              event: "edit-item"
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa",
              disabled: item => !item.item_permissions.includes("edit"),
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
          visible: this.$authHasRole(ROLE_IS_ADMIN),
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
          label: "Thời gian cập nhật lần cuối",
          maxDate: "tomorrow",
          configProps: {
            maxDate: Date.now()
          }
        },
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo",
          maxDate: "tomorrow",
          configProps: {
            maxDate: Date.now()
          }
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
      this.$refs.editDialog.show(item);
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
