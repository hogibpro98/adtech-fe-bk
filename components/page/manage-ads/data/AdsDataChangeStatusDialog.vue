<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    :title="title"
    label-button-confirm="Xác nhận"
    @confirm="confirmItem"
  >
    <template slot="content">
      Bạn có chắc chắn muốn
      <span class="red--text">{{ STATUS_MAP[action] }}</span> tài trợ data
      <span class="red--text"> {{ item.name }} </span>
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { GlobalDataInterface } from "../../../../interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "../../../../interface/data/banner";
import { ConfirmDialogRef } from "../../../common/ConfirmDialog.vue";
import { RepositoryInterface } from "../../../../interface/plugin/repository";
import BannerApproveDialog from "./BannerApproveDialog.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import ConfirmDialog from "~/components/common/ConfirmDialog";

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

const AdsDataChangeStatusDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "AdsDataChangeStatusDialog",
  components: { ConfirmDialog },
  data() {
    return {
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      action: "running"
    };
  },
  computed: {
    STATUS_MAP() {
      return {
        stop: "dừng hẳn",
        running: "chạy",
        pause: "tạm dừng"
      };
    },
    title() {
      return `Bạn muốn ${this.STATUS_MAP[this.action]} tài trợ data?`;
    }
  },
  methods: {
    show(item, action = "running") {
      this.item = item;
      this.action = action;
      this.$refs.refConfirmDialog.show();
    },
    hide() {
      this.$refs.refConfirmDialog.hide();
    },

    async confirmItem() {
      this.loading = true;
      try {
        const res = await this.$adsRepository.post("change-status", {
          id: this.item.id,
          status: this.action
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.action_success(
            `${this.STATUS_MAP[this.action]} tài trợ data`
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

export default AdsDataChangeStatusDialog;
export type AdsDataChangeStatusDialogRef = InstanceType<
  typeof AdsDataChangeStatusDialog
>;
</script>
