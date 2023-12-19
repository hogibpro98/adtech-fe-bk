<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn duyệt template quảng cáo?"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn duyệt template quảng cáo
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
} from "~/components/common/ConfirmDialog";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { GlobalDataInterface } from "~/interface/data/global";
import { RepositoryInterface } from "~/interface/plugin/repository";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ComponentData extends GlobalDataInterface {
  item: BannerMMSInterface | BannerRedirectInterface;
  loading: boolean;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $adsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  hide(): void;
  confirmItem(): void;
}

const BannerMMSTemplateApproveDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerMMSTemplateApproveDialog",
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
        const res = await this.$adsRepository.post("change-status", {
          id: this.item.id,
          status: "approve_template"
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("duyệt template quảng cáo");
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

export default BannerMMSTemplateApproveDialog;
export type BannerMMSTemplateApproveDialogRef = InstanceType<
  typeof BannerMMSTemplateApproveDialog
>;
</script>
