<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn lưu template?"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn lưu template tin nhắn
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
import {
  CODE_SUCCESS,
  HTTP_CODE_422,
  HTTP_CODE_NO_PERMISSION
} from "~/constants/code";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";

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
  $adsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  hide(): void;
  confirmItem(): void;
}

const SaveTelcoTemplateDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "SaveTelcoTemplateDialog",
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

    async confirmItem() {
      this.loading = true;
      try {
        const res = await this.$templateSmsRepository.post("create-from-ads", {
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("lưu template thành công");
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
        } else if (e.response.status !== HTTP_CODE_NO_PERMISSION) {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});

export default SaveTelcoTemplateDialog;
export type SaveTelcoTemplateDialogRef = InstanceType<
  typeof SaveTelcoTemplateDialog
>;
</script>
