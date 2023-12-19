<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xoá
      {{ isRequestBrandName ? "yêu cầu tạo brandname" : "brandname" }}
      <span class="red--text"> {{ item.name }} </span>
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
  $brandNameRepository: RepositoryInterface;
  $brandNameRequestRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: (item: BrandnameInterface) => void;
  hide: () => void;
  deleteItem: () => void;
}

interface ComponentComputed {
  isRequestBrandName: boolean;
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
 * @property {Object} $brandNameRepository
 */

const BrandNameDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "BrandNameDeleteDialog",
  components: { ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    isRequestBrandName() {
      return this.item?.status !== "active" && this.item?.status !== "inactive";
    }
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },

    async deleteItem() {
      this.loading = true;
      try {
        let res;
        if (this.isRequestBrandName) {
          res = await this.$brandNameRequestRepository.delete({
            id: this.item.id
          });
        } else {
          res = await this.$brandNameRepository.delete({
            id: this.item.id
          });
        }
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          if (this.isRequestBrandName) {
            this.$toast.global.delete_success("yêu cầu tạo brandname");
          } else {
            this.$toast.global.delete_success("brandname");
          }
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        // this.$toast.global.action_fail();
      }
    }
  }
});

export default BrandNameDeleteDialog;
export type BrandNameDeleteDialogRef = InstanceType<
  typeof BrandNameDeleteDialog
>;
</script>
