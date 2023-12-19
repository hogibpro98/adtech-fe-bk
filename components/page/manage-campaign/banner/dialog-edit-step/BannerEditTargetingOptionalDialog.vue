<template>
  <form-dialog
    ref="refFormDialog"
    v-bind="$attrs"
    :title="title"
    attach-dropdown
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md9 lg6 xl4"
    @on-submit="onSubmit"
  >
    <template slot="content">
      <step-targeting-optional-banner
        v-model="item"
        :loading="loading"
        attach-dropdown
        hide-footer
        class="min-h-11r"
      />
      <step-targeting-advance-banner
        v-model="item"
        attach-dropdown
        :loading="loading"
        class="min-h-11r"
      />
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog from "@/components/common/FormDialog";
import StepTargetingAdvanceBanner from "@/components/page/manage-campaign/banner/steps/StepTargetingAdvanceBanner.vue";
import StepTargetingOptionalBanner from "@/components/page/manage-campaign/banner/steps/StepTargetingOptionalBanner.vue";
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

const BannerEditTargetingOptionalDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerEditTargetingOptionalDialog",
  components: {
    StepTargetingAdvanceBanner,
    StepTargetingOptionalBanner,
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

export default BannerEditTargetingOptionalDialog;
export type BannerEditTargetingOptionalDialogRef = InstanceType<
  typeof BannerEditTargetingOptionalDialog
>;
</script>
