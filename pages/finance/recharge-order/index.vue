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
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="{
              isCreate: true,
              isDownload: true,
              exportResource: 'order',
            }"
            page-name="finance-recharge-order"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @update-item="updateItem"
            @approve-item="approveItem"
            @pay-item="payItem"
            @cancel-item="cancelItem"
          >
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
            </template>
            <template slot="item.approved_at" slot-scope="{ item }"
              >{{ item.approved_at | timestamp }}
            </template>
            <template slot="item.transid" slot-scope="{ item }">
              <div @click="handlePreviewRechargeOrder(item)">
                <nuxt-link to="">{{ item.transid }}</nuxt-link>
              </div>
            </template>
            <template slot="item.export_invoice" slot-scope="{ item }"
              >{{ item.export_invoice ? "Có" : "Không" }}
            </template>
            <template slot="item.user" slot-scope="{ item }">
              <nuxt-link
                v-if="item.user"
                :to="`/user/${item.user_id}`"
                class="truncate-2 w-full block"
                >{{ item.user.full_name }}
              </nuxt-link>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                v-if="renderStatus(item)"
                :color="renderStatus(item).color"
                class="w-full justify-content-center"
                small
                label
              >
                {{ renderStatus(item).text }}
              </v-chip>
            </template>
            <template slot="item.amount" slot-scope="{ item }"
              >{{ item.amount | currency }}
            </template>
            <template slot="item.payment_method" slot-scope="{ item }"
              >{{ getPaymentMethod(item) }}
            </template>
            <template slot="item.discount" slot-scope="{ item }"
              >{{ item.discount | currency }}
            </template>
            <template slot="item.vat" slot-scope="{ item }"
              >{{ item.vat | vat }}
            </template>
            <v-btn
              slot="search-right"
              color="primary"
              dark
              class="mr-0"
              @click="addItem()"
            >
              <v-icon>add</v-icon>
              Thêm
            </v-btn>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <recharge-order-new-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @edit-success="refreshTable(false)"
    />
    <recharge-order-preview-dialog
      ref="previewDialog"
      @action-success="refreshTable(false)"
    />
    <recharge-order-cancel-dialog
      ref="cancelDialog"
      @action-success="refreshTable(false)"
    ></recharge-order-cancel-dialog>
  </v-container>
</template>
<script lang="ts">
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";

import { RESOURCE, SELECT, TEXT } from "~/constants/filterType";

import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import report from "~/api/report";
import {
  PAYMENT_METHOD,
  STATUS_ORDER_RECHARGE_NAME
} from "~/constants/dataSelect";
import RechargeOrderNewFormDialog from "~/components/page/finance/recharge-order/RechargeOrderNewFormDialog.vue";

import RechargeOrderPreviewDialog from "~/components/page/finance/recharge-order/RechargeOrderPreviewDialog.vue";
import { ROLE_ACCOUNTANT, ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import RechargeOrderCancelDialog from "~/components/page/finance/recharge-order/RechargeOrderCancelDialog.vue";

interface ComponentData {
  showing: boolean;
  timeout: number;
  loadingExport: boolean;
  loading: boolean;
  $refs: {
    resource: string;
    filters: Array<object>;
    searchParams: Array<object>;
    headers: DataTableHeader[];
    startIndex: number;
    table: ApiDataTableRef;
    dialog: TargetingOSFormDialogRef;
    deleteDialog: TargetingOSDeleteDialogRef;
  };
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    RechargeOrderCancelDialog,
    RechargeOrderNewFormDialog,
    ApiDataTable,
    RechargeOrderPreviewDialog,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      searchParams: {},
      resource: "/order",
      selectableReports: cloneDeep(report),
      searchParams: null,
      loadingExport: false,
      startIndex: 0
    };
  },
  computed: {
    authIsAdmin() {
      return this.$authHasRole([...ROLE_IS_ADMIN, ROLE_ACCOUNTANT]);
    },
    filters() {
      return [
        {
          type: RESOURCE,
          name: "user_id",
          label: "Agency",
          itemValue: "id",
          itemText: "full_name",
          visible: this.authIsAdmin,
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            }
          }
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: STATUS_ORDER_RECHARGE_NAME
        },
        {
          type: SELECT,
          multiple: false,
          name: "payment_method",
          label: "Hình thức thanh toán",
          items: PAYMENT_METHOD
        }
      ];
    },
    headers() {
      return [
        {
          text: "Transaction ID",
          value: "transid",
          width: 200
        },
        {
          text: "Agency",
          value: "user",
          width: 160
        },
        {
          text: "Dịch vụ",
          value: "service",
          width: 160
        },
        {
          text: "Số tiền nạp",
          value: "amount",
          width: 160,
          align: "right"
        },
        {
          text: "Chiết khấu",
          value: "discount",
          width: 160,
          align: "right"
        },
        {
          text: "Thuế vat",
          value: "vat",
          align: "right",
          width: 160
        },

        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 144
        },
        {
          text: "Xuất hóa đơn",
          value: "export_invoice",
          align: "center",
          width: 144
        },
        {
          text: "Hình thức thanh toán",
          value: "payment_method",
          width: 240
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: 144
        },
        {
          text: "Nội dung phê duyệt/từ chối",
          value: "reason",
          width: 240
        },
        {
          text: "Thời gian phê duyệt, từ chối",
          value: "approved_at",
          align: "center",
          width: 220
        },
        {
          text: "Email nhận hóa đơn",
          value: "email",
          width: 200
        },
        {
          text: "Hành động",
          value: "action",
          sortable: false,
          align: "right",
          class: "sticky-right",
          width: 80,
          actions: [
            {
              color: "success",
              icon: "check",
              label: "Xác nhận",
              event: "approve-item",
              visible: this.canConfirm
            },
            {
              color: "success",
              icon: "payment",
              label: "Thanh toán",
              event: "pay-item",
              visible: this.canPay
            },
            {
              color: "purple",
              icon: "visibility",
              label: "Duyệt",
              event: "approve-item",
              visible: this.canReview
            },
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              event: "update-item",
              visible: this.canEdit
              // visible: item => {
              //   return item.status !== USER_STATUS.DELETED;
              // }
            },
            {
              color: "error",
              icon: "delete",
              label: "Hủy",
              event: "cancel-item",
              visible: this.canCancel
            }
          ]
        }
      ];
    }
  },
  methods: {
    canEdit(item) {
      if (this.$pageCan("edit")) {
        if (this.$authHasRole(ROLE_IS_ADMIN)) {
          if (item.status !== "APPROVED" && item.status !== "PROCESSING") {
            return true;
          }
        } else if (item.status === "PENDING" || item.status === "REJECTED") {
          return true;
        }
      }
      return false;
    },
    canCancel(item) {
      if (this.$authHasRole(ROLE_IS_ADMIN)) {
        if (item.status === "CHECKING" || item.status === "WAITING") {
          return true;
        }
      }
      if (this.$authHasRole(ROLE_ACCOUNTANT)) {
        return false;
      }
      if (item.status === "PENDING") {
        return true;
      }
      return false;
    },
    canReview(item) {
      if (this.$pageCan("review")) {
        if (item.status === "PENDING") {
          return true;
        }
      }
      return false;
    },
    canConfirm(item) {
      if (this.$pageCan("confirm")) {
        if (item.status === "CHECKING") {
          return true;
        }
      }
      return false;
    },
    canPay(item) {
      const VIETTEL_MONEY = 18;
      if (
        item.status === "WAITING" &&
        this.$auth.user.id === item.user_id &&
        item.payment_method === VIETTEL_MONEY
      ) {
        return true;
      }
      return false;
    },
    approveItem(item) {
      this.$refs.previewDialog.isPreview = false;
      this.$refs.previewDialog.show(item);
    },
    updateItem(item) {
      this.$refs.dialog.show(item);
    },
    cancelItem(item) {
      this.$refs.cancelDialog.show(item);
    },
    renderStatus(item) {
      return STATUS_ORDER_RECHARGE_NAME.find(
        ({ value }) => value === item.status
      );
    },
    async payItem(item) {
      try {
        const endpoint = `${process.env.API_ENDPOINT}orders/create/viettel_money?order_id=${item.id}`;
        const { data } = await this.$axios.get(endpoint);
        if (data) {
          const url = data.body;
          window.open(url, "_blank").focus();
          this.refreshTable();
        }
      } catch (e) {}
    },
    handlePreviewRechargeOrder(item) {
      this.$refs.previewDialog.isPreview = true;
      this.$refs.previewDialog.show(item);
    },
    addItem() {
      this.$refs.dialog.show();
    },
    getPaymentMethod(item) {
      if (item.payment_method) {
        const currentMethod = PAYMENT_METHOD.find(
          e => e.value === item.payment_method
        );
        if (currentMethod) {
          return currentMethod.text;
        }
      }
      return "Không có thông tin";
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
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
