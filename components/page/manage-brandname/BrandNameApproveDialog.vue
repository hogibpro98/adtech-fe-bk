<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn phê duyệt?"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      <v-layout row>
        <v-flex xs12 class="form-group">
          Bạn cần bổ sung thêm thông tin cho brandname
          <span class="red--text"> {{ item.name }} </span>
        </v-flex>
        <v-flex xs12 class="form-group">
          <v-number-field-with-validation
            v-model="item.maintain_fee"
            :loading="loading"
            name="maintain_fee"
            label="Phí brandname"
            suffix="₫"
            rules="min_value:0"
          />
        </v-flex>
      </v-layout>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "../../common/ConfirmDialog.vue";
import { BrandnameInterface } from "~/interface/data/brandname";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";

interface ComponentData {
  loading: boolean;
  item: BrandnameInterface;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $brandNameRequestRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  deleteItem: Function;
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
  user_id: null
};

/**
 * @property {Object} $brandNameRequestRepository
 */

const BrandNameApproveDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "BrandNameApproveDialog",
  components: { VNumberFieldWithValidation, ConfirmDialog },
  props: {
    isRequestBrandName: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },
    async confirmItem() {
      this.loading = true;
      try {
        const res = await this.$brandNameRequestRepository.post("approve", {
          id: this.item.id,
          maintain_fee: this.item.maintain_fee,
          status: "approve"
        });
        this.loading = false;

        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          if (this.isRequestBrandName) {
            this.$toast.global.action_success(
              "phê duyệt yêu cầu tạo brandname"
            );
          } else {
            this.$toast.global.action_success("phê duyệt brandname");
          }
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default BrandNameApproveDialog;
export type BrandNameApproveDialogRef = InstanceType<
  typeof BrandNameApproveDialog
>;
</script>
