<template>
  <confirm-dialog
    ref="refConfirmDialog"
    :loading="loading"
    title="Bạn muốn xóa khu vực hiển thị quảng cáo?"
    label-button-confirm="Xác nhận"
    @confirm="deleteItem"
  >
    <template slot="content">
      Việc xoá khu vực hiển thị có thể ảnh hưởng đến phân phối hiển thị các
      quảng đang sử dụng khu vực hiển thị này.
      <br />
      Bạn có chắc chắn muốn xóa khu vực hiển thị?
    </template>
  </confirm-dialog>
</template>

<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";
import { DisplayAdsTypeInterface } from "~/interface/data/displayAdsType";
import { ToastInterface } from "~/interface/plugin/toast";

import { RepositoryInterface } from "~/interface/plugin/repository";
import { ZoneInterface } from "~/interface/data/zone";
import GlobalDataInterface from "~/interface/data/global";
import { responseErrorToString } from "~/util/array";

const DEFAULT_ITEM = {
  id: null,
  name: ""
};

/**
 * @property {Object} $zoneRepository
 */

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
  item: DisplayAdsTypeInterface;
  $toast: ToastInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $adsTypeRepository: RepositoryInterface;
}

interface ComponentMethods {
  show(item: ZoneInterface): void;

  hide(): void;

  deleteItem(): void;
}

const ZoneDeleteDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ZoneDeleteDialog",
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
        const res = await this.$zoneRepository.delete({
          id: this.item.id
        });
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hide();
          this.$emit("action-success");
          this.$toast.global.delete_success("khu vực hiển thị quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.server_error_msg(
          responseErrorToString(e?.response?.data?.errors || []) ||
            e?.response?.data?.message
        );
        this.loading = false;
      }
    }
  }
});

export default ZoneDeleteDialog;
export type ZoneDeleteDialogRef = InstanceType<typeof ZoneDeleteDialog>;
</script>
