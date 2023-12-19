<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    attach-dropdown
    content-class="flex xs12 sm8 md9 lg6 xl5"
    v-bind="$attrs"
    @on-submit="onSubmit"
  >
    <template slot="content">
      <step-targeting-banner v-model="item" class="min-h-11r" />
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog";
import StepTargetingBanner from "@/components/page/manage-campaign/banner/steps/StepTargetingBanner";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { FormDialogRef } from "~/components/common/FormDialog.vue";

const DEFAULT_ITEM = {};

interface ComponentData extends GlobalDataInterface {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  item: BannerMMSInterface | BannerRedirectInterface;
  timeout: number;
  loading: boolean;
  $refs: {
    refFormDialog: FormDialogRef;
  };
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  hidden(): void;
  onSubmit(): void;
}

const BannerEditTargetingDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerEditTargetingDialog",
  components: {
    StepTargetingBanner,
    FormDialog
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      item: null,
      timeout: null,
      loading: false
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} thông tin quảng cáo`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      this.$emit("submit", this.item, this.hidden);
    }
  }
});

export default BannerEditTargetingDialog;
export type BannerEditTargetingDialogRef = InstanceType<
  typeof BannerEditTargetingDialog
>;
</script>
