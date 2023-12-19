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
      <step-review-banner-sms
        v-model="item"
        :editable="false"
        show-template-id
      />
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
import FormDialog from "@/components/common/FormDialog";
import BannerApproveDialog from "@/components/page/manage-campaign/banner/BannerApproveDialog";
import BannerRejectDialog from "@/components/page/manage-campaign/banner/BannerRejectDialog";
import { INVENTORY_DISPLAY, TARGETING_TAG } from "@/constants/resource";
import cloneDeep from "lodash/cloneDeep";
import { DOCUMENT } from "@/constants/fileType";
import { renderFile } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import StepReviewBannerSms, {
  StepReviewBannerSmsRef
} from "~/components/page/manage-ads/sms/index/step/StepReviewBannerSms.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerSmsInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
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
  owner: UserInterface;
  resourceInventory: string;
  resourceTag: string;
  item: BannerSmsInterface | BannerRedirectInterface;
  $refs: {
    refConfirmDialog: ConfirmDialogRef;
  };
  $adsRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerSmsInterface | BannerRedirectInterface): void;
  hide(): void;
  confirmItem(): void;
}

const BannerSmsFormReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerSmsFormReviewDialog",
  components: {
    StepReviewBannerSms,
    BannerApproveDialog,
    BannerRejectDialog,
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

export default BannerSmsFormReviewDialog;
export type BannerSmsFormReviewDialogRef = InstanceType<
  typeof BannerSmsFormReviewDialog
>;
</script>
