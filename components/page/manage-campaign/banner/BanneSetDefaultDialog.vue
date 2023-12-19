<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Đặt quảng cáo mặc định"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      <template v-if="item.is_default">
        Bạn có chắc chắn muốn bỏ quảng cáo
        <span class="red--text"> {{ item.name }} </span> khỏi danh sách quảng
        cáo mặc định?
      </template>
      <template v-else>
        Bạn có chắc chắn muốn đặt quảng cáo
        <span class="red--text"> {{ item.name }} </span> làm quảng cáo mặc định?
      </template>
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
  $adsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  hide(): void;
  deleteItem(): void;
}

const BannerSetDefaultDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerSetDefaultDialog",
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
        const res = await this.$adsRepository.post("toggle-default", {
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success(
            (this.item.is_default ? "bỏ" : "đặt") + " quảng cáo mặc định"
          );
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

export default BannerSetDefaultDialog;
export type BannerSetDefaultDialogRef = InstanceType<
  typeof BannerSetDefaultDialog
>;
</script>
