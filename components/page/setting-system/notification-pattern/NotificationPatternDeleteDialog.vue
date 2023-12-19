<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa định dạng thông báo
      <span class="red--text"> {{ item.name }} </span>
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

const DEFAULT_ITEM = {
  id: null,
  name: ""
};
interface ItemInterface {
  id: string;
  name: string;
}

interface ComponentData {
  loading: boolean;
  item: ItemInterface;
  $toast: ToastInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $notificationPatternRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ItemInterface): void;

  hide(): void;

  deleteItem(): void;
}

const NotificationPatternDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "NotificationPatternDeleteDialog",
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
        const res = await this.$notificationPatternRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("định dạng thông báo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default NotificationPatternDeleteDialog;
export type NotificationPatternDeleteDialogRef = InstanceType<
  typeof NotificationPatternDeleteDialog
>;
</script>
