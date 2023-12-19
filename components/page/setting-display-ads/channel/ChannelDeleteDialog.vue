<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa sub-inventory?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Việc xoá sub-inventory có thể ảnh hưởng đến phân phối hiển thị các quảng
      cáo đang sử dụng sub-inventory này.
      <br />
      Bạn có chắc chắn muốn xóa sub-inventory?
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
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { ChannelInterface } from "~/interface/data/channel";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ComponentData {
  loading: boolean;
  item: ChannelInterface;
  $toast: ToastInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $channelRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ChannelInterface): void;

  hide(): void;

  deleteItem(): void;
}

const ChannelDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ChannelDeleteDialog",
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
        const res = await this.$channelRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("sub-inventory");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default ChannelDeleteDialog;
export type ChannelDeleteDialogRef = InstanceType<typeof ChannelDeleteDialog>;
</script>
