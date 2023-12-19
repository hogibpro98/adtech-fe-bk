<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    @confirm="confirmItem"
    title="Bạn muốn duyệt chiến dịch?"
    label-button-confirm="Xác nhận"
  >
    <template slot="content">
      Bạn có chắc chắn muốn duyệt chiến dịch
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ComponentData {
  loading: boolean;
  item: CampaignInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $campaignRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: CampaignInterface): void;
  hide(): void;
  confirmItem(): void;
}

const CampaignApproveDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CampaignApproveDialog",
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
        const res = await this.$campaignRepository.post("change-status", {
          id: this.item.id,
          status: "approve"
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("duyệt chiến dịch");
        } else {
          this.$toast.global.server_error_msg(
            responseErrorToString(res.errors)
          );
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});

export default CampaignApproveDialog;
export type CampaignApproveDialogRef = InstanceType<
  typeof CampaignApproveDialog
>;
</script>
