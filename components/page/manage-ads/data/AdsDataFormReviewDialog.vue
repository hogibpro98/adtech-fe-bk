<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    v-bind="$attrs"
    content-class="flex xs12 sm10 lg6 xl4"
    v-on="$listeners"
  >
    <template slot="content">
      <v-card-text>
        Phiếu tài trợ data <strong>{{ item.name }}</strong>
      </v-card-text>
      <v-card-text>
        <v-row no-gutters>
          <v-flex xs6>
            Ngân sách tối đa:
          </v-flex>
          <v-flex xs6 class="text-end">
            <strong>{{ item.budget | currency }}</strong>
          </v-flex>
        </v-row>
      </v-card-text>
      <v-card-text>
        <v-row no-gutters>
          <v-flex xs6>
            Chi phí tạm tính:
          </v-flex>
          <v-flex xs6 class="text-end">
            <strong>{{ item.total_price | currency }}</strong>
          </v-flex>
        </v-row>
      </v-card-text>
      <v-card-text>
        Chi phí tạm tính lớn hơn ngân sách dự kiến. Bạn có chắc chắn muốn chạy
        phiếu tài trợ data này không?
      </v-card-text>
    </template>
    <template slot="actions">
      <v-layout justify-end>
        <v-btn color="grey" text @click="hidden">
          Hủy
        </v-btn>
        <v-btn :loading="loading" color="blue darken-1" text @click="approve">
          Phê duyệt
        </v-btn>
        <v-btn :loading="loading" color="red darken-1" text @click="reject">
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
import { CODE_SUCCESS } from "~/constants/code";

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

const AdsDataFormReviewDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "AdsDataFormReviewDialog",
  components: {
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
      this.title = "Xác nhận chạy tài trợ data";
      clearTimeout(this.timeout);
    },
    async approve() {
      this.loading = true;
      try {
        const res = await this.$adsDataRepository.post("change-status", {
          id: this.item.id,
          status: "waiting"
        });
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("success");
          this.$toast.global.action_success("xác nhận chạy tài trợ");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
      }
      this.loading = false;
    },
    async reject() {
      this.loading = true;
      try {
        const res = await this.$adsDataRepository.post("change-status", {
          id: this.item.id,
          status: "stop"
        });
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("success");
          this.$toast.global.action_success("từ chối chạy tài trợ");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
      }
      this.loading = false;
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

export default AdsDataFormReviewDialog;
export type AdsDataFormReviewDialogRef = InstanceType<
  typeof AdsDataFormReviewDialog
>;
</script>
