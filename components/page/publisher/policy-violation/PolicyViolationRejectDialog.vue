<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xác nhận bác bỏ khiếu nại?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn bác bỏ khiếu nại vi phạm chính sách
      <span class="red--text"> {{ item.code }} </span> ?

      <v-flex xs12 class="">
        <strong>Lý do khiếu nại: </strong>
        {{ item.appealing_note }}
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-text-area-with-validation
          v-model="item.reason"
          :loading="loading"
          name="reason"
          label="Lý do bác bỏ"
          rows="3"
          required
          rules="required"
          :counter="500"
        />
      </v-flex>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { ConfirmDialogRef } from "../../common/ConfirmDialog.vue";
import { ToastInterface } from "~/interface/plugin/toast";
import { CODE_SUCCESS } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";

interface ComponentData {
  loading: boolean;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  deleteItem: Function;
}

const DEFAULT_ITEM = {
  id: null,
  code: "",
  reason: ""
};

const PolicyViolationRejectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PolicyViolationRejectDialog",
  components: { VTextAreaWithValidation, ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      this.item.reason = "";
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.item = cloneDeep(DEFAULT_ITEM);
      this.$refs.refConfirmDialog.hide();
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$axios.$post(
          "publisher/policy-violation/reject",
          this.item
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success(
            "bác bỏ khiếu nại vi phạm chính sách"
          );
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default PolicyViolationRejectDialog;
export type PolicyViolationRejectDialogRef = InstanceType<
  typeof PolicyViolationRejectDialog
>;
</script>
