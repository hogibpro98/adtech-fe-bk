<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn chọn quảng cáo này cho trang của bạn?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="action"
  >
    <template slot="content">
      Bạn có chắc chắn muốn chọn quảng cáo
      <span class="red--text"> {{ adsInformation.url }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { ConfirmDialogRef } from "../../common/ConfirmDialog.vue";
import { TagInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import { showMessageError } from "~/util/errorMsg";

interface ComponentData {
  loading: boolean;
  item: TagInterface;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $adsReviewRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  deleteItem: Function;
}

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

/**
 * @property {Object} $adsReviewRepository
 */

const ApproveAdsPreviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ApproveAdsPreviewDialog",
  components: { ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    adsInformation() {
      return this.item?.metadata_redirects || {};
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

    async action() {
      this.loading = true;
      try {
        const res = await this.$adsReviewRepository.changeStatus({
          id: this.item.id,
          status: "reviewed"
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("chọn quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        showMessageError(this.$toast, e);
      }
    }
  }
});

export default ApproveAdsPreviewDialog;
export type ApproveAdsPreviewDialogRef = InstanceType<
  typeof ApproveAdsPreviewDialog
>;
</script>
