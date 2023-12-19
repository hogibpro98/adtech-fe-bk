<template>
  <confirm-dialog
    ref="refConfirmDialog"
    title="Bạn muốn xóa câu hỏi này?"
    label-button-confirm="Xác nhận"
    :loading="loading"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa câu hỏi này
      <span class="red--text"> {{ item.question }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">

import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { GenderInterface } from "~/interface/data/targeting";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";

interface ComponentData {
  loading: boolean;
  item: GenderInterface;
  $refs: { refConfirmDialog: ConfirmDialogRef };
  $surveyRepository: RepositoryInterface;
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

const SurveyQuestionDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TargetingGenderDeleteDialog",
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
        const res = await this.$surveyRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("Survey");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
    }
  }
});

export default SurveyQuestionDeleteDialog;
export type SurveyQuestionDeleteDialogRef = InstanceType<
  typeof SurveyQuestionDeleteDialog
>;
</script>

<style scoped>

</style>
