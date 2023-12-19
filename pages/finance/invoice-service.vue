\
<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            page-name="finance-invoice-service"
            :fixed-left-count="2"
            :filter="searchParams"
            :default-pagination="{
              sortBy: ['created_at'],
              sortDesc: [true]
            }"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @adjust-item="adjustItem"
            @show-item="showItem"
          >
            <template slot="item.status" slot-scope="props">
              <v-chip
                v-if="renderStatus(props.item)"
                :color="renderStatus(props.item).color"
                class="w-full justify-content-center"
                small
                label
                v-on="on"
              >
                {{ renderStatus(props.item).text }}
              </v-chip>
            </template>
            <template slot="item.invoice_file" slot-scope="props">
              <a
                v-if="props.item.invoice_file"
                :href="props.item.invoice_file"
                class="truncate-2 w-full block"
                target="_blank"
              >
                Link
              </a>
              <div v-else>Không tìm thấy file</div>
            </template>
            <template slot="item.authorization_file" slot-scope="props">
              <a
                v-if="props.item.authorization_file"
                :href="props.item.authorization_file"
                class="truncate-2 w-full block text-decoration-underline"
                target="_blank"
              >
                Link
              </a>
              <div v-else>Không tìm thấy file</div>
            </template>
            <template slot="item.amount" slot-scope="{ item }">
              <div class="text-right">
                <p>{{ item.amount | currency }}</p>
              </div>
            </template>
            <template slot="item.discount" slot-scope="{ item }">
              <div class="text-right">
                <p>{{ item.discount | currency }}</p>
              </div>
            </template>
            <template slot="item.name_service" slot-scope="{ item }">
              <div>Dịch vụ {{ item.name_service }}</div>
            </template>
            <template slot="item.revenue_object_type" slot-scope="{ item }">
              <div v-if="item.revenue_object_type === 1">
                Lên doanh thu đại lý
              </div>
              <div v-else-if="item.revenue_object_type === 2">
                Lên doanh thu nhân viên; CTV/Điểm bán
              </div>
            </template>
            <template slot="item.date" slot-scope="{ item }"
              >{{ item.date | date }}
            </template>
            <template slot="item.bccs_desc.code" slot-scope="{ item }">
              <v-tooltip bottom>
                <template #activator="{ on, attrs }">
                  <div
                    v-if="item.bccs_desc && item.bccs_desc.code === 0"
                    class="green--text pointer"
                    v-on="on"
                  >
                    0
                  </div>
                  <span v-else class="red--text pointer" v-on="on">{{
                    item.bccs_desc && item.bccs_desc.code
                  }}</span>
                </template>
                <span>{{
                  item.bccs_desc && renderDesc(item.bccs_desc.description)
                }}</span>
              </v-tooltip>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>

    <invoice-dialog ref="invoiceDialog" @action-success="refreshTable">
    </invoice-dialog>
    <invoice-service-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></invoice-service-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { INVOICE } from "~/constants/resource";
import { DATE, RESOURCE, SELECT, TEXT } from "~/constants/filterType";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import { ROLE_AGENCY } from "~/constants/role";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

import { INVOICE_STATUS } from "~/constants/dataSelect";
import UserSelect from "~/components/select/UserSelect.vue";
import InvoiceServiceDeleteDialog from "~/components/page/admin/invoice-service/InvoiceServiceDeleteDialog.vue";
import InvoiceServiceAdjustDialog from "~/components/page/admin/invoice-service/InvoiceServiceAdjustDialog.vue";
import InvoiceDialog from "~/components/page/admin/invoice-service/InvoiceDialog.vue";
import ApiServiceSelect from "~/components/common/ApiServiceSelect.vue";
import { DialogInterface } from "~/interface/components/dialog";
import ServiceSelect from "~/components/select/ServiceSelect.vue";

interface ComponentData extends GlobalDataInterface {
  resource: string;
  headers: Array<DataTableHeader>;
  searchParams: Array<object>;
  filters: Array<FilterInterface>;
  $refs: {
    table: ApiDataTableRef;
    dialog: DialogInterface;
    deleteDialog: DialogInterface;
  };
}

interface ComponentMethod {
  addItem(): void;

  editItem(item: any): void;

  deleteItem(item: any): void;

  adjustItem(item: any): void;

  refreshTable(toFirstPage: false): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    ApiDataTable,
    NewCustomFilter,
    InvoiceServiceDeleteDialog,
    InvoiceServiceAdjustDialog,
    InvoiceDialog
  },
  layout: "dashboard",
  data() {
    return {
      resource: INVOICE,
      searchParams: {}
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Mã giao dịch",
          value: "saleTransCode",
          width: "125"
        },
        {
          text: "Tên hóa đơn",
          value: "name",
          width: "250"
        },
        {
          text: "Trạng thái",
          value: "status",
          width: "200",
          align: "center"
        },
        {
          text: "Số tiền",
          value: "amount",
          align: "right",
          width: "160"
        },
        {
          text: "Số tiền chiết khấu",
          value: "discount",
          align: "right",
          width: "160"
        },
        {
          text: "Ngày lập hóa đơn",
          value: "date",
          width: "200",
          sortable: true,
          align: "center"
        },
        {
          text: "Tên dịch vụ",
          value: "name_service",
          width: "180",
          sortable: true
        },
        {
          text: "Tên đối tác",
          value: "user.username",
          width: "250",
          sortable: true
        },
        {
          text: "Mã số thuế",
          value: "MST",
          width: "180"
        },

        {
          text: "Mã mặt hàng trên BCCS",
          value: "bccs_id",
          width: "180",
          sortable: true,
          align: "right",
        },
        {
          text: "Mã đối tượng lên doanh thu",
          value: "revenue_object",
          align: "left",
          width: "200",
          sortable: false
        },
        {
          text: "Loại đối tượng lên doanh thu",
          value: "revenue_object_type",
          align: "left",
          width: "250"
        },

        {
          text: "File hóa đơn",
          value: "invoice_file",
          width: "200",
          sortable: false
        },
        {
          text: "File ủy nhiệm chi",
          value: "authorization_file",
          width: "200",
          sortable: false
        },
        {
          text: "Tên mã lỗi",
          value: "bccs_desc.code",
          width: "150",
          align: "center",

        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: "200"
        },
        {
          text: "Cập nhật lần cuối",
          value: "updated_at",
          align: "center",
          width: "200"
        },
        {
          text: "Hành động",
          value: "action",
          width: 100,
          sortable: false,
          actions: [
            {
              color: "purple",
              icon: "visibility",
              label: "Xem chi tiết",
              event: "show-item"
            },
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              visible: this.canEdit,
              event: "edit-item"
            }
            // {
            //   color: "orange",
            //   icon: "edit",
            //   label: "Điều chỉnh hóa đơn",
            //   visible: this.canAdjust,
            //   event: "adjust-item"
            // },
            // {
            //   color: "error",
            //   icon: "delete",
            //   label: "Xóa",
            //   event: "delete-item"
            // }
          ]
        }
      ];
    },
    filters() {
      return [
        // {
        //   type: RESOURCE,
        //   name: "user_id",
        //   label: "Agency",
        //   itemValue: "id",
        //   itemText: "full_name",
        //   component: AgencyAdvertiserSelect,
        //   props: {
        //     multiple: false,
        //     queryParams: {
        //       type: ROLE_AGENCY
        //     }
        //   }
        // },
        {
          type: RESOURCE,
          name: "name_service",
          label: "Tên dịch vụ",
          itemText: "name",
          itemValue: "name",
          component: ServiceSelect,
          props: {
            itemText: "name",
            itemValue: "name",
            multiple: false,
            type: ROLE_AGENCY
          }
        },
        {
          type: RESOURCE,
          name: "user_id",
          label: "Tên đối tác",
          itemText: "username",
          itemValue: "id",
          component: UserSelect,
          props: {
            itemText: "username",
            itemValue: "id",
            multiple: false,
            type: ROLE_AGENCY
          }
        },
        {
          type: DATE,
          name: "date",
          label: "Thời gian lập hóa đơn",
          maxDate: "tomorrow"
        },
        // {
        //   type: RESOURCE,
        //   name: "name_service",
        //   label: "Dịch vụ",
        //   component: ApiServiceSelect,
        //   itemText: "display_name",
        //   itemValue: "name",
        //   props: {
        //     multiple: false,
        //     required: false
        //   }
        // },
        {
          type: TEXT,
          multiple: false,
          name: "revenue_object",
          label: "Đối tượng lên doanh thu"
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: INVOICE_STATUS
        }
      ];
    }
  },
  methods: {
    canEdit(item) {
      return (
        (item.status === "draft" || item.status === "failed") &&
        this.$can("finance-invoice-service.edit")
      );
    },
    canAdjust(item) {
      return (
        item.status === "exported" && this.$can("finance-invoice-service.edit")
      );
    },
    addItem() {
      this.$refs.invoiceDialog.show();
    },
    editItem(item) {
      this.$refs.invoiceDialog.show(item, "edit");
    },
    showItem(item) {
      this.$refs.invoiceDialog.show(item, "show");
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    adjustItem(item) {
      this.$refs.invoiceDialog.show(item, "adjust");
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },

    renderStatus(item) {
      return INVOICE_STATUS.find(({ value }) => item.status === value);
    },

    renderDesc(desc) {
      try {
        const obj = JSON.parse(desc);
        return obj;
      } catch (e) {
        return desc;
      }
    }
  }
});
</script>

<style>
</style>

