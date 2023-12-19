<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xóa mạng viễn thông?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa mạng viễn thông
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { NetworkDataInterface } from "../../../interface/data/targeting";
import { ConfirmDialogRef } from "../../common/ConfirmDialog.vue";
import { RepositoryInterface } from "../../../interface/plugin/repository";
import { ToastInterface } from "../../../interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";

interface ComponentData {
  loading: boolean;
  item: NetworkDataInterface;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $networkRepository: RepositoryInterface;
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
 * @property {Object} $networkRepository
 */

const TargetingNetworkDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TargetingNetworkDeleteDialog",
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
        const res = await this.$networkRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("mạng viễn thông");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default TargetingNetworkDeleteDialog;
export type TargetingNetworkDeleteDialogRef = InstanceType<
  typeof TargetingNetworkDeleteDialog
>;
</script>
