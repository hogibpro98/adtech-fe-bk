<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    attach-dropdown
    content-class="flex xs12 sm8 md9 lg5 xl4"
    v-bind="$attrs"
    eager
    @on-submit="onSubmit"
  >
    <template slot="content">
      <step-add-campaign-banner v-model="item" @chose="changeTitle" />
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog.vue";
import StepAddCampaignBanner from "@/components/page/manage-campaign/banner/steps/StepAddCampaignBanner.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { convertDataToUpdateCampaign } from "~/util/ads";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";

const DEFAULT_ITEM = {};

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  item: BannerRedirectInterface | BannerMMSInterface;
  timeout: number;
  loading: boolean;
  $refs: {
    refFormDialog: FormDialogRef;
  };
  $campaignRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerRedirectInterface | BannerMMSInterface): void;
  hidden(): void;
  onSubmit(): void;
  createCampaign(cb: Function): void;
  addMedia(type: string): void;
  removeMedia(id: string): void;
}

const BannerEditCampaignDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerEditCampaignDialog",
  components: {
    StepAddCampaignBanner,
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
    changeTitle(val) {
      this.isEdit = val;
      this.title = `${this.isEdit ? "Thêm" : "Cập nhật"} thông tin chiến dịch`;
    },
    show(item = null) {
      clearTimeout(this.timeout);
      if (item) {
        this.item = cloneDeep(item);
      } else {
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Thêm" : "Cập nhật"} thông tin chiến dịch`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.item.typeCampaign === "create-new-campaign") {
        this.createCampaign(() => {
          this.$emit("submit", this.item, this.hidden);
        });
      } else {
        this.$emit("submit", this.item, this.hidden);
      }
    },
    async createCampaign(cb) {
      const newCampaign = this.item.newCampaign || {};
      const dataNewCampaign = convertDataToUpdateCampaign(newCampaign);

      this.loading = true;
      try {
        const res = await this.$campaignRepository.create(dataNewCampaign);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.item.typeCampaign = "select-campaign";
          this.item.newCampaign = {};
          this.item.campaign = res.data;
          if (cb) {
            cb();
          }
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

export default BannerEditCampaignDialog;
export type BannerEditCampaignDialogRef = InstanceType<
  typeof BannerEditCampaignDialog
>;
</script>
