<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xác nhận từ chối gói mua khoán?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn từ chối gói mua khoán
      <span class="red--text"> {{ item.name }} </span> ?

      <v-flex xs12 class="">
        <strong>Lý do từ chối: </strong>
        {{ item.desc }}
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-text-area-with-validation
          v-model="item.desc"
          :loading="loading"
          name="desc"
          label="Lý do từ chối"
          rows="3"
          required
          rules="required|max:500"
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
  desc: ""
};

const ConstractRejectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ConstractRejectDialog",
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
      this.item.desc = "";
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.item = cloneDeep(DEFAULT_ITEM);
      this.$refs.refConfirmDialog.hide();
    },

    async deleteItem() {
      this.loading = true;
      try {
        const res = await this.$axios.$post("constract/reject", this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success(
            "từ chối gói mua khoán"
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

export default ConstractRejectDialog;
export type ConstractRejectDialogRef = InstanceType<
  typeof ConstractRejectDialog
>;
</script>
