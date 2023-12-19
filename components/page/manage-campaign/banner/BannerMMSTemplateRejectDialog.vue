<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn từ chối template quảng cáo?"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      <v-flex xs12>
        Bạn có chắc chắn muốn từ chối template quảng cáo
        <span class="red--text"> {{ item.name }} </span>
      </v-flex>

      <v-flex xs12 class="mt-4">
        <v-text-area-with-validation
          v-model="message"
          :loading="loading"
          :counter="500"
          name="reason"
          label="Lý do từ chối template"
          rows="3"
          required
          rules="required|max:500"
        />
      </v-flex>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import VTextAreaWithValidation from "@/components/common/VTextAreaWithValidation";
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog from "~/components/common/ConfirmDialog";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";
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

const BannerMMSTemplateRejectDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerMMSTemplateRejectDialog",
  components: { VTextAreaWithValidation, ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      message: ""
    };
  },
  methods: {
    show(item) {
      this.item = item;
      this.$refs.refConfirmDialog.show();
      this.message = "";
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },

    async confirmItem() {
      this.loading = true;
      try {
        const res = await this.$adsRepository.post("change-status", {
          id: this.item.id,
          reason: this.message,
          status: "reject_template"
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success("từ chối template quảng cáo");
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

export default BannerMMSTemplateRejectDialog;
export type BannerMMSTemplateRejectDialogRef = InstanceType<
  typeof BannerMMSTemplateRejectDialog
>;
</script>
