<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xóa nhóm thuê bao?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa nhóm thuê bao
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { PhoneNameInterface } from "../../../interface/data/targeting";
import { ConfirmDialogRef } from "../../common/ConfirmDialog.vue";
import { RepositoryInterface } from "../../../interface/plugin/repository";
import { ToastInterface } from "../../../interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";

interface ComponentData {
  loading: boolean;
  item: PhoneNameInterface;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $phoneNameRepository: RepositoryInterface;
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
 * @property {Object} $phoneGroupRepository
 */

const PhoneGroupDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PhoneGroupDeleteDialog",
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
        const res = await this.$phoneGroupRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("nhóm thuê bao");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default PhoneGroupDeleteDialog;
export type PhoneGroupDeleteDialogRef = InstanceType<
  typeof PhoneGroupDeleteDialog
>;
</script>
