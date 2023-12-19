<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Cảnh báo"
    label-button-confirm="Tiếp tục"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template slot="content">
      <div>
        Ngân sách tối đa mỗi ngày ít hơn ngân sách trung bình hằng ngày của
        chiến dịch.
      </div>
      <div>
        <small>
          *Điều này có nghĩa là khi kết thúc chiến dịch tổng ngân sách không sử
          dụng hết.
        </small>
      </div>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ConfirmDialog from "~/components/common/ConfirmDialog";

interface ComponentMethods {
  show(): void;
  hide(): void;
}

const AlertConfirmFormCampaign = (Vue as VueConstructor<
  Vue & ComponentMethods
>).extend({
  name: "AlertConfirmFormCampaign",
  components: { ConfirmDialog },
  methods: {
    show() {
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    }
  }
});

export default AlertConfirmFormCampaign;
export type AlertConfirmFormCampaignRef = InstanceType<
  typeof AlertConfirmFormCampaign
>;
</script>
