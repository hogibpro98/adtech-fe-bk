<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 sm10 md10 lg8"
    v-on="$listeners"
  >
    <template slot="content">
      <step-review-banner v-model="item" :editable="false" />
      <banner-reject-dialog ref="rejectDialog" @action-success="success" />
      <banner-approve-dialog ref="approveDialog" @action-success="success" />
    </template>
    <template slot="actions">
      <v-layout justify-end>
        <v-btn color="grey" text @click="hidden">
          Hủy
        </v-btn>
        <v-btn
          v-if="item.status !== 'approve'"
          :loading="loading"
          color="blue darken-1"
          text
          @click="approve"
        >
          Phê duyệt
        </v-btn>
        <v-btn
          v-if="item.status !== 'reject'"
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
import FormDialog from "@/components/common/FormDialog.vue";
import BannerApproveDialog from "@/components/page/manage-campaign/banner/BannerApproveDialog.vue";
import BannerRejectDialog from "@/components/page/manage-campaign/banner/BannerRejectDialog.vue";
import StepReviewBanner from "@/components/page/manage-campaign/banner/steps/StepReviewBanner.vue";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import { renderFile } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { UserInterface } from "~/interface/data/user";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { RejectDialogRef } from "~/components/common/RejectDialog.vue";
import { BannerApproveDialogRef } from "~/components/page/manage-campaign/banner/BannerApproveDialog.vue";

const DEFAULT_ITEM = {};

interface ComponentData extends GlobalDataInterface {
  DOCUMENT: Array<string>;
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  isReview: boolean;
  timeout: number;
  loading: boolean;
  item: BannerMMSInterface | BannerRedirectInterface;
  resourceInventory: string;
  resourceTag: string;
  owner: UserInterface;
  $refs: {
    refFormDialog: FormDialogRef;
    approveDialog: BannerApproveDialogRef;
    rejectDialog: RejectDialogRef;
  };
  $adsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;
  renderFile(file: object): string;
  approve(): void;
  reject(): void;
  hidden(): void;
  success(): void;
}

const BannerFormReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerFormReviewDialog",
  components: {
    BannerApproveDialog,
    BannerRejectDialog,
    StepReviewBanner,
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
      this.title = "Duyệt quảng cáo Redirect";
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

export default BannerFormReviewDialog;
export type BannerFormReviewDialogRef = InstanceType<
  typeof BannerFormReviewDialog
>;
</script>
