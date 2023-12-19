<template>
  <form-dialog-step
    ref="refFormDialogStep"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    :steps="steps"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content-1">
      <step-url-redirect-banner v-model="item" :loading="loading" />
    </template>
    <template slot="content-2">
      <step-add-campaign-banner
        v-model="item"
        :loading="loading"
      ></step-add-campaign-banner>
    </template>
    <template slot="content-3">
      <step-information-banner v-model="item" :loading="loading" />
    </template>
    <template slot="content-4">
      <step-targeting-banner v-model="item" :loading="loading" />
    </template>
    <template slot="content-5">
      <step-data-sponsor-banner v-model="item" :loading="loading" />
    </template>
    <template slot="content-6">
      <step-add-budget-banner v-model="item" :loading="loading">
      </step-add-budget-banner>
    </template>
    <template slot="content-7">
      <step-review-banner v-model="item" :loading="loading" />
    </template>
  </form-dialog-step>
</template>
<script lang="ts">
import FormDialogStep from "@/components/common/FormDialogStep/index.vue";
import StepAddBudgetBanner from "@/components/page/manage-campaign/banner/steps/StepAddBudgetBanner.vue";
import StepAddCampaignBanner from "@/components/page/manage-campaign/banner/steps/StepAddCampaignBanner.vue";
import StepInformationBanner from "@/components/page/manage-campaign/banner/steps/StepInformationBanner.vue";
import StepReviewBanner from "@/components/page/manage-campaign/banner/steps/StepReviewBanner.vue";
import StepTargetingBanner from "@/components/page/manage-campaign/banner/steps/StepTargetingBanner.vue";
import StepUrlRedirectBanner from "@/components/page/manage-campaign/banner/steps/StepUrlRedirectBanner.vue";
import { STEPS_BANNER } from "@/constants/dataSelect";
import { ADS_PRICE } from "@/constants/resource";
import { ROLE_IS_ADMIN, ROLE_AGENCY } from "@/constants/role";
import { responseErrorToString } from "@/util/array";
import {
  convertDataToUpdateAdsRedirect,
  convertDataToUpdateCampaign
} from "@/util/ads";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { FormDialogStepRef } from "~/components/common/FormDialogStep/index.vue";
import StepDataSponsorBanner from "~/components/page/manage-campaign/banner/steps/StepDataSponsorBanner.vue";

const DEFAULT_ITEM = {
  id: null,
  title: "",
  name: "",
  campaign_id: null,
  campaign: null,
  typeCampaign: "",
  budget_mode: "limit_by_day",
  display_type: null,
  newCampaign: {},
  channels: [],
  genders: [],
  date_range: [],
  locations: [],
  relationships: [],
  devices: [],
  phone_names: [],
  network_data: [],
  service_package: [],
  sim_ages: [],
  data_fee: [],
  phone_fee: [],
  arpu: [],
  media: [],
  pricing_mode: "cpm",
  cpm: {
    min: 0,
    max: 0
  },
  cpc: {
    min: 0,
    max: 0
  },
  media_type: "image",
  network_suppliers: [],
  max_view_per_day: null,
  max_view: null,
  price_cpm: null,

  os: [],
  ages: [],
  networks: [],
  tags: [],
  url: "",
  start_time: null,
  end_time: null,
  data_trigger_time: 30,
  data_code: null,
  data_capacity: null
};

interface ComponentData extends GlobalDataInterface {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  price: number;
  item: BannerMMSInterface | BannerRedirectInterface;
  steps: Array<object>;
  $refs: {
    refFormDialogStep: FormDialogStepRef;
  };
  $bannerRepository: RepositoryInterface;
  $campaignRepository: RepositoryInterface;
}

interface ComponentMethod {
  show(item: BannerMMSInterface | BannerRedirectInterface): void;

  getPriceOfMe(): void;

  hidden(): void;

  onSubmit(step: number): void;

  onSave(): void;

  createCampaign(cb: Function): void;

  addItem(): void;

  editItem(): void;

  reloadDataCampaign(): void;
}

const BannerFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerFormDialog",
  components: {
    StepDataSponsorBanner,
    StepUrlRedirectBanner,
    StepReviewBanner,
    StepAddBudgetBanner,
    StepAddCampaignBanner,
    StepTargetingBanner,
    StepInformationBanner,
    FormDialogStep
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      price: null,
      item: cloneDeep(DEFAULT_ITEM)
    };
  },
  computed: {
    steps() {
      return STEPS_BANNER;
    },
    mediaType() {
      return this.item.media_type;
    },
    media() {
      return this.mediaData[this.mediaType];
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  mounted() {
    const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
    const isAgency = this.$authHasRole(ROLE_AGENCY);

    if (isAdmin || isAgency) {
      this.getPriceOfMe();
    }
  },
  methods: {
    async show(item = null) {
      clearTimeout(this.timeout);
      if (item && !item.autoFillCampaign) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        if (!item.newCampaign) {
          this.item.newCampaign = {};
        }

        this.item.cpc = {
          min: item.min_cpc || 0,
          max: item.max_cpc || 0
        };

        this.item.cpm = {
          min: item.min_cpm || 0,
          max: item.max_cpm || 0
        };

        // Nhân bản quảng cáo
        if (!item.id) {
          this.isEdit = false;
          this.title = `Bản sao của "${item.name}"`;
          this.type = "general";
          this.labelButtonConfirm = "Phát hành";
          this.loading = false;

          this.$refs.refFormDialogStep.show(STEPS_BANNER.length);
          this.$refs.refFormDialogStep.setStepComplete(
            STEPS_BANNER[STEPS_BANNER.length - 1].index
          );
          return;
        }
      } else {
        this.isEdit = false;
        if (item) {
          this.item = {
            ...cloneDeep(DEFAULT_ITEM),
            ...item
          };
        } else {
          this.item = cloneDeep(DEFAULT_ITEM);
        }
        const price = this.price || {};
        this.item.price = {
          agency_id: price.agency_id,
          price_cpc: price.price_cpc,
          price_cpm: price.price_cpm
        };
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} quảng cáo Redirect`;
      this.type = "general";
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Phát hành";
      this.loading = false;
      await this.$nextTick();
      if (this.isEdit) {
        this.$refs.refFormDialogStep.show(STEPS_BANNER.length);
        this.$refs.refFormDialogStep.setStepComplete(
          STEPS_BANNER[STEPS_BANNER.length - 1].index
        );
      } else {
        this.$refs.refFormDialogStep.show(1);
      }
    },
    async getPriceOfMe() {
      try {
        const response = await this.$axios.post(ADS_PRICE);
        const data = response.data || {};
        if (response.status === 200 && data.code === CODE_SUCCESS) {
          if (data.data && data.data.length > 0) {
            this.price = data.data[0];
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    hidden() {
      this.$refs.refFormDialogStep.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit(step) {
      if (step === 2) {
        if (this.item.typeCampaign === "create-new-campaign") {
          this.createCampaign(() => {
            this.$refs.refFormDialogStep.next();
          });
          return;
        }
      } else if (step === STEPS_BANNER.length) {
        if (this.isEdit) {
          this.editItem();
        } else {
          this.addItem();
        }
        return;
      }

      this.$refs.refFormDialogStep.next();
    },
    onSave() {
      this.$refs.refAlertConfirmDialog.hide();
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
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
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$bannerRepository.create(
          convertDataToUpdateAdsRedirect(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("quảng cáo");
        } else {
          this.$toast.global.action_fail();
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
        await this.reloadDataCampaign();
      }
    },

    async editItem() {
      this.loading = true;

      try {
        const res = await this.$bannerRepository.update(
          convertDataToUpdateAdsRedirect(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("quảng cáo");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
        }
        await this.reloadDataCampaign();
        await this.reloadDataBanner();
      }
    },
    async reloadDataCampaign() {
      const campaignId = this.item?.campaign?.id;
      if (campaignId) {
        const res = await this.$campaignRepository.getDetail(campaignId);

        if (res.code === CODE_SUCCESS && res.data) {
          this.item.campaign = res.data;
        }
      }
    },
    async reloadDataBanner() {
      const bannerId = this.item?.id;
      if (bannerId) {
        const res = await this.$bannerRepository.getDetail(bannerId);

        if (res.code === CODE_SUCCESS && res.data) {
          this.item.price_cpm = res.data.price_cpm;
        }
      }
    }
  }
});

export default BannerFormDialog;
export type BannerFormDialogRef = InstanceType<typeof BannerFormDialog>;
</script>
