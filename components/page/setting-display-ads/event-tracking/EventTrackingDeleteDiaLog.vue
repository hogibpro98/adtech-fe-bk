<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xóa event tracking?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa event tracking
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { ConfirmDialogRef } from "../../../common/ConfirmDialog.vue";
import { TagInterface } from "~/interface/data/targeting";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";

interface ComponentData {
  loading: boolean;
  item: TagInterface;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $eventTrackingFormDiaLog: RepositoryInterface;
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
 * @property {Object} $eventTrackingFormDiaLog
 */

const EventTrackingDeleteDiaLog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EventTrackingDeleteDiaLog",
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
        const res = await this.$eventTrackingFormDiaLog.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("event tracking");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default EventTrackingDeleteDiaLog;
export type EventTrackingDeleteDiaLogRef = InstanceType<
  typeof EventTrackingDeleteDiaLog
>;
</script>
