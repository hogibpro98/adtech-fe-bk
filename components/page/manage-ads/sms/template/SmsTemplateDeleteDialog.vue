<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn xóa quảng cáo
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { GlobalDataInterface } from "~/interface/data/global";
import { RepositoryInterface } from "~/interface/plugin/repository";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

interface ComponentData extends GlobalDataInterface {
  item: BannerMMSInterface | BannerRedirectInterface;
  loading: boolean;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $templateSmsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  hide(): void;
  deleteItem(): void;
}

const SmsTemplateDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "SmsTemplateDeleteDialog",
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
        const res = await this.$templateSmsRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("template");
        } else {
          this.$toast.global.server_error_msg(
            responseErrorToString(res.errors)
          );
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});

export default SmsTemplateDeleteDialog;
export type SmsTemplateDeleteDialogRef = InstanceType<
  typeof SmsTemplateDeleteDialog
>;
</script>
