<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md10 lg7 xl5"
    attach-dropdown
    v-bind="$attrs"
    @on-submit="onSubmit"
  >
    <template slot="content">
      <step-information-banner-m-m-s v-model="item" class="min-h-11r" :is-show="isShow"/>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import StepInformationBannerMMS from "@/components/page/manage-campaign/banner/steps/StepInformationBannerMMS.vue";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";

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

const BannerMMSEditInformationDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerMMSEditInformationDialog",
  props: {
    isShow: {
      type: Boolean,
      default: false
    }
  },
  components: {
    StepInformationBannerMMS,
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
    async show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }
      this.title = `${
        this.isEdit ? "Cập nhật" : "Thêm"
      } thông tin cho tin nhắn của bạn`;
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

export default BannerMMSEditInformationDialog;
export type BannerMMSEditInformationDialogRef = InstanceType<
  typeof BannerMMSEditInformationDialog
>;
</script>
