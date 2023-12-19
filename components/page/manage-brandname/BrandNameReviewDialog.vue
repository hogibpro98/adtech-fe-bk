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
          <span class="col-5 py-0">Tên brandname:</span>
          <span class="font-weight-bold col-7 py-0">{{ item.name }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Tên doanh nghiệp:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.business_name
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Lĩnh vực hoạt động:</span>
          <span class="font-weight-bold col-7 py-0">{{
            item.business_activity && item.business_activity.name
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Người sở hữu:</span>
          <span class="font-weight-bold col-7 py-0">{{
            ownerItem && ownerItem.full_name
          }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Trạng thái:</span>
          <span v-if="renderStatus(item)" class="font-weight-bold col-7 py-0">
            {{ renderStatus(item).text }}
          </span>
        </div>
        <div v-if="showPrice" class="row">
          <span class="col-5 py-0">Phí brandname:</span>
          <span class="font-weight-bold col-7 py-0">
            {{ item.maintain_fee | currency }}
          </span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Phí tin nhắn:</span>
          <span v-if="price" class="font-weight-bold col-7 py-0">
            {{ price | currency }}
          </span>
          <span v-else class="font-weight-bold col-7 py-0">
            Chưa đặt giá dịch vụ
          </span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Tài liệu kèm theo:</span>
          <div
            v-if="item.documents && item.documents.length > 0"
            class="col-7 py-0 d-flex"
          >
            <div style="max-width: 80%">
              <div v-for="(item, i) in item.documents">
                {{ item.name }}
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
                <span>Xem tài liệu</span>
              </v-tooltip>
            </div>
          </div>
        </div>
        <div class="row">
          <span class="col-5 py-0">Ngày tạo:</span>
          <span class="font-weight-bold col-7 py-0">
            {{ item.created_at | date }}
          </span>
        </div>
      </div>
      <brand-name-reject-dialog
        ref="rejectDialog"
        :is-request-brand-name="isRequestBrandName"
        @action-success="success"
      />
      <brand-name-approve-dialog
        ref="approveDialog"
        :is-request-brand-name="isRequestBrandName"
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
import BrandNameApproveDialog from "@/components/page/manage-brandname/BrandNameApproveDialog.vue";
import BrandNameRejectDialog from "@/components/page/manage-brandname/BrandNameRejectDialog.vue";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import { renderFile } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import FormDialog, { FormDialogRef } from "../../common/FormDialog.vue";
import { UserInterface } from "~/interface/data/user";
import { STATUS_BRAND_NAME } from "~/constants/dataSelect";
import { ROLE_IS_ADMIN, ROLE_AGENCY } from "~/constants/role";
import { BrandnameInterface } from "~/interface/data/brandname";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";

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
  status: "",
  advertiser: null,
  advertiser_id: null,
  agency: null,
  agency_id: null,
  brand_certificate: null,
  business_activity: null,
  business_activity_id: null,
  business_name: "",
  business_registration: null,
  created_at: null,
  deleted_at: null,
  deleted_by: null,
  expire_time: null,
  identify_certificate: null,
  item_permissions: null,
  maintain_fee: 0,
  price_cskh: 0,
  price_mms: 0,
  updated_at: null,
  user_id: null,
  documents: []
};

/**
 * @property {Object} $brandNameRepository
 */

const BrandNameReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "BrandNameReviewDialog",
  components: {
    BrandNameApproveDialog,
    BrandNameRejectDialog,
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
    showPrice() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);
      return isAdmin || isAgency;
    },
    ownerItem() {
      if (this.item?.advertiser) {
        return {
          ...this.item?.advertiser,
          is_agency: false,
          agency: this.item.agency
        };
      } else if (this.item?.agency) {
        return {
          ...this.item?.agency,
          is_agency: true
        };
      }
      return null;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    async show(item = null) {
      this.item = cloneDeep(item);
      this.$refs.refFormDialog.show();
      this.title = "Phê duyệt yêu cầu tạo brandname";
      await this.getPriceSms();
      clearTimeout(this.timeout);
    },
    renderFile(file) {
      return renderFile(file);
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
    async getPriceSms() {
      const { data } = await this.$priceServiceRepository.post("get-price", {
        user_id: this.item?.agency_id,
        cat_id: this.item?.business_activity?.name
      });
      if (data !== null) {
        this.price = data;
      }
    }
  }
});

export default BrandNameReviewDialog;
export type BrandNameReviewDialogRef = InstanceType<
  typeof BrandNameReviewDialog
>;
</script>
