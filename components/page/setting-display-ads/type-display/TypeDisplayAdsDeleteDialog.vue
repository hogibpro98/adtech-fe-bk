<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Xóa loại hiển thị quảng cáo?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Việc xoá loại hiển thị quảng cáo có thể ảnh hưởng đến phân phối hiển thị
      các quảng cáo đang sử dụng loại hiển thị quảng cáo này.
      <br />
      Bạn có chắc chắn muốn xóa loại hiển thị quảng cáo?
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";
import { ToastInterface } from "~/interface/plugin/toast";

import { RepositoryInterface } from "~/interface/plugin/repository";
import { ChannelInterface } from "~/interface/data/channel";
import { DisplayAdsTypeInterface } from "~/interface/data/displayAdsType";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ComponentData {
  loading: boolean;
  item: DisplayAdsTypeInterface;
  $toast: ToastInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $adsTypeRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ChannelInterface): void;

  hide(): void;

  deleteItem(): void;
}

const TypeDisplayAdsDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TypeDisplayAdsDeleteDialog",
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

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$adsTypeRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res?.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("loại hiển thị quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default TypeDisplayAdsDeleteDialog;
export type TypeDisplayAdsDeleteDialogRef = InstanceType<
  typeof TypeDisplayAdsDeleteDialog
>;
</script>
