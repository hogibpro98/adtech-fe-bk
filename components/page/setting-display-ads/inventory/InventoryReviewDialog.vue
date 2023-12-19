<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template slot="content">
      <div class="w-full">
        <div class="row">
          <span class="col-5 py-0">Tên inventory:</span>
          <span class="font-weight-bold col-7 py-0">{{ item.name }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Người sở hữu:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.user ? item.user.full_name : ""
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Loại:</span>
          <span class="font-weight-bold col-7 py-0">{{ item.type }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Địa chỉ URL:</span>
          <a class="font-weight-bold col-7 py-0" :href="item.url" target="_blank">{{ item.url }}</a>
        </div>
        <div class="row">
          <span class="col-5 py-0">Ngày tạo:</span>
          <span class="font-weight-bold col-7 py-0">
            {{ item.created_at | date }}
          </span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Thời gian xác nhận tự đông</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.script_verified_at | timestamp
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Lý do từ chối phê duyệt:</span>
          <span class="font-weight-bold col-7 py-0">
            {{ item.reason }}
          </span>
        </div>
      </div>
      <inventory-reject-dialog
        ref="rejectDialog"
        @action-success="success"
      />
      <inventory-approve-dialog
        ref="approveDialog"
        @action-success="success"
      />
    </template>
    <template slot="actions">
      <v-layout justify-end>
        <v-btn color="grey" text @click="hidden">
          Hủy
        </v-btn>
        <v-btn
          v-if="item.status !== 'approve'"
          :loading="loading"
          color="blue darken-1"
          text
          @click="approveBrandName"
        >
          Đồng ý
        </v-btn>
        <v-btn
          v-if="item.status !== 'reject'"
          :loading="loading"
          color="red darken-1"
          text
          @click="rejectBrandName"
        >
          Từ chối
        </v-btn>
      </v-layout>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import Vue, { VueConstructor } from "vue";
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import { UserInterface } from "~/interface/data/user";
import { STATUS_BRAND_NAME } from "~/constants/dataSelect";
import { ROLE_IS_ADMIN, ROLE_AGENCY } from "~/constants/role";
import { BrandnameInterface } from "~/interface/data/brandname";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import InventoryRejectDialog from "~/components/page/setting-display-ads/inventory/InventoryRejectDialog.vue";
import InventoryApproveDialog from "~/components/page/setting-display-ads/inventory/InventoryApproveDialog.vue";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  isReview: boolean;
  timeout: number;
  loading: boolean;
  resourceInventory: string;
  resourceTag: string;
  owner: UserInterface;
  item: BrandnameInterface;
  $refs: { refFormDialog: FormDialogRef };
  $brandNameRequestRepository: RepositoryInterface;
  $brandNameRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: (item: BrandnameInterface) => void;
  renderFile: () => string;
  approveBrandName: () => void;
  rejectBrandName: () => void;
  hidden: () => void;
  success: () => void;
  renderStatus: () => object;
}

interface ComponentComputed {
  showPrice: () => boolean;
  ownerItem: () => UserInterface;
}

const DEFAULT_ITEM = {
  id: null,
  name: "",
  user: {
    full_name: ""
  },
  type: "web",
  url: "",
  created_at: null,
  script_verified_at: null,
  reason: ""
};

/**
 * @property {Object} $brandNameRepository
 */

const InventoryReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "InventoryReviewDialog",
  components: {
    InventoryApproveDialog,
    InventoryRejectDialog,
    FormDialog
  },
  props: {
    isRequestBrandName: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      DOCUMENT,
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      isReview: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      resourceInventory: INVENTORY_DISPLAY,
      resourceTag: TARGETING_TAG,
      owner: null,
      documents: [],
      price: null
    };
  },
  computed: {
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      this.item = cloneDeep(item);
      this.$refs.refFormDialog.show();
      this.title = "Phê duyệt yêu cầu tạo inventory";
      clearTimeout(this.timeout);
    },
    approveBrandName() {
      this.$refs.approveDialog.show(this.item);
    },
    rejectBrandName() {
      this.$refs.rejectDialog.show(this.item);
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.isReview = false;
      clearTimeout(this.timeout);
    },
    success() {
      this.hidden();
      this.$emit("action-success");
    },
    renderStatus(item) {
      return STATUS_BRAND_NAME.find(({ value }) => value === item.status);
    },
  }
});

export default InventoryReviewDialog;
export type InventoryReviewDialogRef = InstanceType<
  typeof InventoryReviewDialog
>;
</script>
