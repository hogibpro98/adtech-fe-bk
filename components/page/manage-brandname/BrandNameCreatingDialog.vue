<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn chuyển trạng thái?"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn chuyển trạng thái yêu cầu tạo brandname
      <span class="red--text"> {{ item.name }} </span> sang Đang xử lý
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
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

const BrandNameCreatingDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "BrandNameCreatingDialog",
  components: { ConfirmDialog },
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
        const res = await this.$brandNameRequestRepository.post(
          "change-status",
          {
            id: this.item.id,
            status: "creating"
          }
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("chuyển trạng thái");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default BrandNameCreatingDialog;
export type BrandNameCreatingDialogRef = InstanceType<
  typeof BrandNameCreatingDialog
>;
</script>
