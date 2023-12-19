<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xác nhận bỏ vi phạm chính sách?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn khiếu nại vi phạm chính sách
      <span class="red--text"> {{ item.code }} </span> ?

      <v-flex xs12 class="mt-4">
        <v-text-area-with-validation
          v-model="item.appealing_note"
          :loading="loading"
          name="reason"
          label="Lý do khiếu nại"
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
  appealing_note: ""
};

const PolicyViolationAppealDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PolicyViolationAppealDialog",
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
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
      this.item = cloneDeep(DEFAULT_ITEM);
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$axios.$post(
          "publisher/policy-violation/appeal",
          {
            id: this.item.id,
            appealing_note: this.item.appealing_note
          }
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("khiếu nại vi phạm chính sách");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default PolicyViolationAppealDialog;
export type PolicyViolationAppealDialogRef = InstanceType<
  typeof PolicyViolationAppealDialog
>;
</script>
