<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 sm8 md67 lg6 xl5"
    v-on="$listeners"
  >
    <template slot="content">
      <step-review-banner-m-m-s
        v-model="item"
        :editable="false"
        show-template-id
      />
      <banner-m-m-s-template-reject-dialog
        ref="rejectDialog"
        @action-success="success"
      />
      <banner-m-m-s-template-approve-dialog
        ref="approveDialog"
        @action-success="success"
      />
    </template>
    <template slot="actions">
      <v-layout justify-end>
        <v-btn color="grey" text @click="hidden">
          Hủy
        </v-btn>
        <v-btn
          v-if="item.status !== 'approve_template'"
          :loading="loading"
          color="blue darken-1"
          text
          @click="approve"
        >
          Phê duyệt
        </v-btn>
        <v-btn
          v-if="item.status !== 'reject_template'"
          :loading="loading"
          color="red darken-1"
          text
          @click="reject"
        >
          Từ chối
        </v-btn>
      </v-layout>
    </template>
  </form-dialog>
</template>
<script lang="ts">
import FormDialog, { FormDialogRef } from "@/components/common/FormDialog";
import StepReviewBannerMMS from "@/components/page/manage-campaign/banner/steps/StepReviewBannerMMS.vue";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import { renderFile } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import BannerMMSTemplateRejectDialog from "~/components/page/manage-campaign/banner/BannerMMSTemplateRejectDialog.vue";
import BannerMMSTemplateApproveDialog, {
  BannerMMSTemplateApproveDialogRef
} from "~/components/page/manage-campaign/banner/BannerMMSTemplateApproveDialog.vue";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { GlobalDataInterface } from "~/interface/data/global";
import { UserInterface } from "~/interface/data/user";

const DEFAULT_ITEM = {};

interface ComponentData extends GlobalDataInterface {
  DOCUMENT: string;
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  price: number;
  item: BannerMMSInterface | BannerRedirectInterface;
  resourceInventory: string;
  resourceTag: string;
  owner: UserInterface;
  $refs: {
    refFormDialog: FormDialogRef;
    approveDialog: BannerMMSTemplateApproveDialogRef;
    rejectDialog: BannerMMSTemplateRejectDialog;
  };
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  renderFile(file: object): string;
  approve(): void;
  reject(): void;
  hidden(): void;
  success(): void;
}

const BannerSmsTemplateFormReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerSmsTemplateFormReviewDialog",
  components: {
    BannerMMSTemplateRejectDialog,
    BannerMMSTemplateApproveDialog,
    StepReviewBannerMMS,
    FormDialog
  },
  data() {
    return {
      DOCUMENT,
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      isReview: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      resourceInventory: INVENTORY_DISPLAY,
      resourceTag: TARGETING_TAG,
      owner: null
    };
  },
  computed: {
    ownerItem() {
      if (this.item?.advertiser) {
        return {
          ...this.item?.advertiser,
          is_agency: false,
          agency: this.item.agency
        };
      } else if (this.item?.agency) {
        return {
          ...this.item?.agency,
          is_agency: true
        };
      }
      return null;
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      this.item = cloneDeep(item);
      this.$refs.refFormDialog.show();
      this.title = "Duyệt quảng cáo tin nhắn SMS";
      clearTimeout(this.timeout);
    },
    renderFile(file) {
      return renderFile(file);
    },
    approve() {
      this.$refs.approveDialog.show(this.item);
    },
    reject() {
      this.$refs.rejectDialog.show(this.item);
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      this.isReview = false;
      clearTimeout(this.timeout);
    },
    success() {
      this.hidden();
      this.$emit("action-success");
    }
  }
});

export default BannerSmsTemplateFormReviewDialog;
export type BannerSmsTemplateFormReviewDialogRef = InstanceType<
  typeof BannerSmsTemplateFormReviewDialog
>;
</script>
