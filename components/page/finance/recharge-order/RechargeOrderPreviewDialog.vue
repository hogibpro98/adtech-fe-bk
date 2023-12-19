<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    persistent
    v-bind="$attrs"
    :content-class="contentClass"
    v-on="$listeners"
  >
    <template slot="content">
      <div v-if="item" class="w-full">
        <div class="row">
          <span class="col-5 py-0">Tên đối tác:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.user.full_name
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Tên công ty:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.company_name
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Tên khách hàng:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.customer_name
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Mã số thuế:</span>
          <span class="font-weight-bold col-7 py-0">{{ item.tin }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Số điện thoại:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.phone_number
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Địa chỉ email:</span>
          <div
            v-if="item.email && item.email.length > 0"
            class="font-weight-bold col-7 py-0"
          >
            <div v-for="(email, i) in item.email">
              {{ email }}
            </div>
          </div>
        </div>
        <div class="row">
          <span class="col-5 py-0">Địa chỉ:</span>
          <span class="font-weight-bold col-7 py-0">{{ item.address }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Phương thức thanh toán:</span>
          <span class="font-weight-bold col-7 py-0">{{
            getPaymentMethod(item)
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Dịch vụ:</span>
          <span class="font-weight-bold col-7 py-0">{{
              item.service
            }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Xuất hóa đơn:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.export_invoice ? "Có" : "Không"
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Số tiền:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.amount | currency
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Chiết khấu:</span>
          <span v-if="discountPercent" class="font-weight-bold col-7 py-0">{{
            discountPercent + "%"
          }}</span>
          <span v-else class="font-weight-bold col-7 py-0">0%</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Số tiền chiết khấu:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.discount | currency
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Số tiền hàng:</span>
          <span class="font-weight-bold col-7 py-0">{{
            amountWithoutVat | currency
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Thuế suất:</span>
          <span class="font-weight-bold col-7 py-0">{{ vat }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">VAT:</span>
          <span class="font-weight-bold col-7 py-0">{{
            amountVat | currency
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Tiền nộp:</span>
          <span class="font-weight-bold col-7 py-0">{{
            realAmount | currency
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Hồ sơ thanh toán:</span>
          <div
            v-if="item.documents && item.documents.length > 0"
            class="col-7 py-0 d-flex"
          >
            <div style="max-width: 80%">
              <div
                v-for="(document, i) in item.documents"
                :key="`document-name-${i}`"
              >
                {{ document.name }}
              </div>
            </div>
            <div class="d-flex align-items-center ml-2">
              <v-tooltip bottom>
                <template #activator="{attrs, on}">
                  <v-btn
                    icon
                    v-bind="attrs"
                    @click="$openFilePreviewDialog(item.documents)"
                    v-on="on"
                  >
                    <v-icon>
                      mdi-text-box-search-outline
                    </v-icon>
                  </v-btn>
                </template>
                <span>Xem hồ sơ</span>
              </v-tooltip>
            </div>
          </div>
        </div>
        <div class="row">
          <span class="col-5 py-0">Ghi chú:</span>
          <span class="font-weight-bold col-7 py-0">{{ item.note }}</span>
        </div>
      </div>
    </template>
    <template slot="actions">
      <v-layout justify-end>
        <v-btn v-if="isPreview" color="blue darken-1" text @click="hide">
          Đóng
        </v-btn>
        <v-btn v-if="!isPreview" color="grey" text @click="hide">
          Hủy
        </v-btn>
        <v-btn
          v-if="item.status !== 'approve' && !isPreview"
          color="blue darken-1"
          text
          @click="approveRechargeOrder"
        >
          {{ isChecking ? "Xác nhận" : "Phê duyệt" }}
        </v-btn>
        <v-btn
          v-if="item.status !== 'reject' && !isPreview"
          color="red darken-1"
          text
          @click="rejectRechargeOrder"
        >
          Từ chối
        </v-btn>
      </v-layout>
      <recharge-order-reject-dialog
        ref="rechargeOrderRejectDialog"
        @action-success="success"
      />
      <recharge-order-approve-dialog
        ref="rechargeOrderApproveDialog"
        @action-success="success"
      />
      <recharge-order-confirm-dialog
        ref="rechargeOrderConfirmDialog"
        @action-success="success"
      />
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import FormDialog, { FormDialogRef } from "~/components/common/FormDialog.vue";
import { PAYMENT_METHOD } from "~/constants/dataSelect";
import RechargeOrderRejectDialog from "~/components/page/finance/recharge-order/RechargeOrderRejectDialog.vue";
import RechargeOrderApproveDialog from "~/components/page/finance/recharge-order/RechargeOrderApproveDialog.vue";
import RechargeOrderConfirmDialog from "~/components/page/finance/recharge-order/RechargeOrderConfirmDialog.vue";

const DEFAULT_ITEM = {
  user: {
    full_name: "",
    username: "",
    id: null
  },
  company_name: "",
  customer_name: "",
  tin: "",
  phone_number: "",
  address: "",
  payment_method: null,
  amount: 0,
  vat: null,
  discount: 0,
  documents: null,
  reason: "",
  note: "",
  export_invoice: 1
};

interface ComponentRefs {
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentData {
  item: any;
  discountPercent: any;
}

interface ComponentMethods {
  show(item: any): void;

  hide(): void;

  getPaymentMethod(item: any): void;

  approveRechargeOrder(): void;

  rejectRechargeOrder(): void;

  success(): void;
}

interface ComponentProps {}

interface ComponentComputed {
  title: string;
  contentClass: string;
  vat: string;
  realAmount: number;
  amountVat: number;
  amountWithoutVat: number;
  isChecking: boolean;
}

const RechargeOrderPreviewDialog = (Vue as VueConstructor<
  Vue & ComponentRefs
>).extend<ComponentData, ComponentMethods, ComponentComputed, ComponentProps>({
  components: {
    RechargeOrderConfirmDialog,
    FormDialog,
    RechargeOrderRejectDialog,
    RechargeOrderApproveDialog
  },
  data() {
    return {
      item: cloneDeep(DEFAULT_ITEM),
      discountPercent: null,
      isPreview: false
    };
  },
  computed: {
    title() {
      return "Thông tin chi tiết Đơn hàng nạp tiền";
    },
    isChecking() {
      return this.item.status === "CHECKING";
    },
    contentClass() {
      return "flex xs12 sm8 md8 lg5 xl4";
    },
    vat() {
      if (this.item.vat < 0) {
        return "Không chịu thuế";
      }
      return this.item.vat + "%";
    },
    realAmount() {
      return (this.item.amount || 0) - (this.item.discount || 0);
    },
    amountVat() {
      const vat = this.item.vat > 0 ? this.item.vat : 0;
      return Math.round((vat / (100 + vat)) * this.realAmount);
    },
    amountWithoutVat() {
      return this.realAmount - this.amountVat;
    }
  },
  watch: {
    realAmount(val) {
      if (this.item.amount && this.item.discount) {
        this.discountPercent = (this.item.discount / this.item.amount) * 100;
      } else {
        this.discountPercent = null;
      }
    },
    discountPercent(val) {
      if (this.item.amount && val) {
        this.item.discount = (val * this.item.amount) / 100;
      } else {
        this.item.discount = null;
      }
    }
  },
  methods: {
    approveRechargeOrder() {
      if (this.isChecking) {
        this.item.reason = "";
        this.$refs.rechargeOrderConfirmDialog.show(this.item);
      } else {
        this.$refs.rechargeOrderApproveDialog.show(this.item);
      }
    },
    rejectRechargeOrder() {
      this.item.reason = "";
      this.$refs.rechargeOrderRejectDialog.show(this.item);
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
    show(item = null) {
      this.item = cloneDeep(item);
      this.$refs.refFormDialog.show();
    },
    hide() {
      this.$refs.refFormDialog.hidden();
    },
    success() {
      this.hide();
      this.$emit("action-success");
    }
  }
});

export default RechargeOrderPreviewDialog;
</script>
<style scoped></style>
