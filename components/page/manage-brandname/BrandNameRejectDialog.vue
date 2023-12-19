<template>
  <reject-dialog
    ref="rejectDialog"
    :loading="loading"
    :counter="500"
    title="Từ chối yêu cầu"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn từ chối yêu cầu tạo brandname
      <span class="error--text">{{ item.code }}</span
      >?<br />
      Vui lòng nêu rõ lý do từ chối:
    </template>
  </reject-dialog>
</template>

<script lang="ts">
import RejectDialog, {
  RejectDialogRef
} from "@/components/common/RejectDialog.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { BrandnameInterface } from "~/interface/data/brandname";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";

interface ComponentData {
  loading: boolean;
  item: BrandnameInterface;
  $refs: { rejectDialog: RejectDialogRef };
  $brandNameRequestRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: () => void;
  hide: () => void;
  confirmItem: () => void;
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

const BrandNameRejectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "BrandNameRejectDialog",
  components: { RejectDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.rejectDialog.show();
    },
    hide() {
      this.$refs.rejectDialog.hide();
    },

    async confirmItem(reason) {
      this.loading = true;
      try {
        const res = await this.$brandNameRequestRepository.post("reject", {
          id: this.item.id,
          status: "reject",
          reason
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("từ chối yêu cầu tạo brandname");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default BrandNameRejectDialog;
export type BrandNameRejectDialogRef = InstanceType<
  typeof BrandNameRejectDialog
>;
</script>
