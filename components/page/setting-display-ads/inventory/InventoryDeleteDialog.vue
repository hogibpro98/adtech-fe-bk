<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa inventory?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Việc xoá inventory có thể ảnh hưởng đến phân phối hiển thị các quảng cáo
      đang sử dụng inventory này.
      <br />
      Bạn có chắc chắn muốn xóa inventory?
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog";
import { CODE_SUCCESS } from "~/constants/code";
import { ChannelInterface } from "~/interface/data/channel";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { InventoryInterface } from "~/interface/data/inventory";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

/**
 * @property {Object} $inventoryDisplayRepository
 */

interface ComponentData {
  loading: boolean;
  item: InventoryInterface;
  $toast: ToastInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $inventoryDisplayRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ChannelInterface): void;

  hide(): void;

  deleteItem(): void;
}

const InventoryDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "InventoryDeleteDialog",
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
        const res = await this.$inventoryDisplayRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("inventory");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default InventoryDeleteDialog;
export type InventoryDeleteDialogRef = InstanceType<
  typeof InventoryDeleteDialog
>;
</script>
