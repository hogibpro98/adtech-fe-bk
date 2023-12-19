<template>
  <form-dialog-step
    ref="refFormDialogStep"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    :steps="steps"
    v-bind="$attrs"
    @on-submit="onSubmit"
    @hidden="hidden"
    v-on="$listeners"
  >
    <template slot="content-1">
      <step-add-campaign-banner
        v-model="item"
        :loading="loading"
      ></step-add-campaign-banner>
    </template>
    <template slot="content-2">
      <step-information-banner-sms
        v-model="item"
        :config="config"
        :loading="loading"
      />
    </template>
    <template slot="content-3">
      <step-select-type-targeting-banner-m-m-s
        v-model="item"
        :loading="loading"
      />
    </template>
    <template slot="content-4">
      <step-targeting-banner-sms
        v-model="item"
        :loading="loading"
      ></step-targeting-banner-sms>
    </template>

    <template slot="content-5">
      <step-import-file-targeting-banner-sms
        v-model="item"
        :loading="loading"
      />
    </template>
    <template slot="content-6">
      <phone-group-select
        v-if="item.targeting_type === 'phone_group'"
        v-model="item.phone_group"
        required
        rules="required"
        :loading="loading"
        class="w-full"
      />
      <div v-if="item.phone_group && item.phone_group.numbers">
        <div>Danh sách số điện thoại:</div>
        <v-list flat dense expand max-height="400">
          <v-list-item
            v-for="(value, index) in item.phone_group.numbers"
            :key="index"
          >
            {{ value }}
          </v-list-item>
        </v-list>
      </div>
    </template>
    <template slot="content-7">
      <step-add-budget-banner-sms v-model="item" :loading="loading" />
    </template>
    <template slot="content-8">
      <step-review-banner-sms
        v-model="item"
        :config="config"
        :loading="loading"
        :is-show="isShow"
      />
    </template>
  </form-dialog-step>
</template>
<script lang="ts">
import FormDialogStep from "@/components/common/FormDialogStep/index.vue";
import StepAddBudgetBannerMMS from "@/components/page/manage-campaign/banner/steps/StepAddBudgetBannerMMS.vue";
import StepAddCampaignBanner from "@/components/page/manage-campaign/banner/steps/StepAddCampaignBanner.vue";
import StepImportFileTargetingBannerMMS from "@/components/page/manage-campaign/banner/steps/StepImportFileTargetingBannerMMS.vue";
import StepInformationBannerMMS from "@/components/page/manage-campaign/banner/steps/StepInformationBannerMMS.vue";
import StepReviewBannerMMS from "@/components/page/manage-campaign/banner/steps/StepReviewBannerMMS.vue";
import StepSelectTypeTargetingBannerMMS from "@/components/page/manage-campaign/banner/steps/StepSelectTypeTargetingBannerMMS.vue";
import StepTargetingAdvanceBanner from "@/components/page/manage-campaign/banner/steps/StepTargetingAdvanceBanner.vue";
import StepTargetingOptionalBanner from "@/components/page/manage-campaign/banner/steps/StepTargetingOptionalBanner.vue";
import { STEPS_BANNER_MMS } from "@/constants/dataSelect";
import { cloneDeep, flatten } from "lodash";
import Vue, { VueConstructor } from "vue";
import { responseErrorToString } from "~/util/array";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import {
  convertDataToUpdateAdsMMS,
  convertDataToUpdateAdsSms,
  convertDataToUpdateCampaign
} from "~/util/ads";
import { GlobalDataInterface } from "~/interface/data/global";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { FormDialogStepRef } from "~/components/common/FormDialogStep/index.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import PhoneGroupSelect from "~/components/select/PhoneGroupSelect.vue";
import StepImportFileTargetingBannerSms from "~/components/page/manage-ads/sms/index/step/StepImportFileTargetingBannerSms.vue";
import StepInformationBannerSms from "~/components/page/manage-ads/sms/index/step/StepInformationBannerSms.vue";
import StepReviewBannerSms from "~/components/page/manage-ads/sms/index/step/StepReviewBannerSms.vue";
import StepAddBudgetBannerSms from "~/components/page/manage-ads/sms/index/step/StepAddBudgetBannerSms.vue";
import StepTargetingBannerMMS from "~/components/page/manage-campaign/banner/steps/StepTargetingBannerMMS.vue";
import StepTargetingBannerSms from "~/components/page/manage-ads/sms/index/step/StepTargetingBannerSms.vue";

const DEFAULT_ITEM = {
  id: null,
  campaign_id: null,
  campaign: null,
  name: "",
  brandname: null,
  brandname_id: null,
  dateRange: [],
  start_time: null,
  end_time: null,
  start_hour: "",
  end_hour: "",
  budget_mode: "limit_by_day",
  media_type: "text",
  image: null,
  video: null,
  text: null,
  header: null,
  targeting_type: null,
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
  sms_type: 0,
  price_cskh: null,
  price_mms: null,
  arpu: [],
  pricing_mode: "mms",
  typeCampaign: "",
  newCampaign: {},
  media: [],
  schedule: [],
  network_suppliers: [],
  os: [],
  ages: [],
  networks: [],
  tags: [],
  target_file: null,
  max_mms: null,
  tempid: null,
  max_mms_per_day: null,
  content_type: false,
  domain: ""
};

interface ComponentData extends GlobalDataInterface {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  price: number;
  item: BannerMMSInterface;
  steps: Array<object>;
  $refs: {
    refFormDialogStep: FormDialogStepRef;
  };
  $bannerRepository: RepositoryInterface;
  $adsSmsRepository: RepositoryInterface;
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

  reloadDataBanner(): void;

  reloadDataCampaign(): void;

  reloadDataBrandName(): void;
}

const BannerSmsFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BannerSmsFormDialog",
  components: {
    StepTargetingBannerSms,
    StepTargetingBannerMMS,
    StepAddBudgetBannerSms,
    StepReviewBannerSms,
    StepInformationBannerSms,
    StepImportFileTargetingBannerSms,
    PhoneGroupSelect,
    StepReviewBannerMMS,
    StepAddBudgetBannerMMS,
    StepImportFileTargetingBannerMMS,
    StepSelectTypeTargetingBannerMMS,
    StepInformationBannerMMS,
    StepTargetingAdvanceBanner,
    StepTargetingOptionalBanner,
    StepAddCampaignBanner,
    FormDialogStep
  },
  data() {
    return {
      title: "",
      item: cloneDeep(DEFAULT_ITEM),
      config: {},
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      price: null,
      isShow: false
    };
  },
  computed: {
    campaignId() {
      return this.item?.campaign?.id;
    },
    mediaType() {
      return this.item.media_type;
    },
    media() {
      return this.mediaData[this.mediaType];
    },
    targetingType() {
      return this.item.targeting_type;
    },
    contentType() {
      return this.item?.content_type;
    },
    isDynamic() {
      return !!this.item.content_type;
    },
    hasParamsFile() {
      return !!this.item.params_file;
    },
    steps() {
      if (this.isDynamic) {
        return STEPS_BANNER_MMS.map((step, index) => {
          let disabled = false;
          if (index === 2 && this.hasParamsFile) {
            disabled = true;
          }
          if (index === 3 || index === 4 || index === 5) {
            disabled = true;
          }
          return {
            ...step,
            disabled
          };
        });
      }
      if (this.targetingType === "import_file") {
        return STEPS_BANNER_MMS.map((step, index) => {
          let disabled = false;
          if (index === 3 || index === 5) {
            disabled = true;
          }
          return {
            ...step,
            disabled
          };
        });
      } else if (this.targetingType === "targeting") {
        return STEPS_BANNER_MMS.map((step, index) => {
          let disabled = false;
          if (index === 4 || index === 5) {
            disabled = true;
          }
          return {
            ...step,
            disabled
          };
        });
      } else if (this.targetingType === "phone_group") {
        return STEPS_BANNER_MMS.map((step, index) => {
          let disabled = false;
          if (index === 3 || index === 4) {
            disabled = true;
          }
          return {
            ...step,
            disabled
          };
        });
      } else if (this.targetingType === "api") {
        return STEPS_BANNER_MMS.map((step, index) => {
          let disabled = false;
          if (index === 3 || index === 4 || index === 5) {
            disabled = true;
          }
          return {
            ...step,
            disabled
          };
        });
      } else {
        return STEPS_BANNER_MMS;
      }
    }
  },
  watch: {
    campaignId() {
      if (this.$refs.refFormDialogStep?.showing) {
        // this.item.brandname = null;
        // this.item.brandname_id = null;
      }
    },
    contentType(val) {
      if (!val) {
        this.item.params_file = null;
      } else {
        this.item.targeting_type = null;
      }
    },
    targetingType(val) {
      if (val === "api") {
        this.item.params_file = null;
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  created() {
    this.reloadDataConfig();
  },
  methods: {
    async reloadDataConfig() {
      try {
        this.loading = true;
        const config = await this.$adsConfigRepository.post();
        this.loading = false;
        if (config.code === CODE_SUCCESS) {
          this.config = config.data;
        } else {
          this.$toast.global.server_error_msg(config.message);
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
    async show(item = null) {
      clearTimeout(this.timeout);

      if (item && !item.autoFillCampaign) {
        this.isEdit = true;
        this.isShow = true;
        this.item = cloneDeep(item);
        this.$store.commit("shorten/DETAIL_SHORTEN_URL", item.links);
        this.$store.commit("shorten/ADD_CONTENT_URL", item.content);
        this.item.dateRange = [
          new Date(item.start_time),
          new Date(item.end_time)
        ];
        if (item.media) {
          item.media.forEach(({ type, data }) => {
            this.item[type] = data;
          });
        }

        // Nhân bản tin nhắn
        if (!item.id) {
          this.isEdit = false;
          this.title = `Bản sao của "${item.name}"`;
          this.type = "general";
          this.labelButtonConfirm = "Phát hành";
          this.loading = false;

          this.$refs.refFormDialogStep.show(STEPS_BANNER_MMS.length);
          this.$refs.refFormDialogStep.setStepComplete(
            STEPS_BANNER_MMS[STEPS_BANNER_MMS.length - 1].index
          );
          return;
        }
      } else {
        this.isEdit = false;
        this.isShow = false;
        if (item) {
          this.item = {
            ...cloneDeep(DEFAULT_ITEM),
            ...item
          };
        } else {
          this.item = cloneDeep(DEFAULT_ITEM);
        }
      }
      this.item.pricing_mode = "mms";
      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} tin nhắn SMS`;
      this.type = "general";
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Phát hành";
      this.loading = false;
      await this.$nextTick();
      if (this.isEdit) {
        this.$refs.refFormDialogStep.show(STEPS_BANNER_MMS.length);
        this.$refs.refFormDialogStep.setStepComplete(
          STEPS_BANNER_MMS[STEPS_BANNER_MMS.length - 1].index
        );
      } else {
        this.$refs.refFormDialogStep.show(1);
      }
    },
    hidden() {
      this.$refs.refFormDialogStep.hidden();
      this.item = cloneDeep(DEFAULT_ITEM);
      clearTimeout(this.timeout);
    },
    onSubmit(step) {
      if (step === 1) {
        if (this.item.typeCampaign === "create-new-campaign") {
          this.createCampaign(() => {
            this.$refs.refFormDialogStep.next();
          });
          return;
        }
      } else if (step === STEPS_BANNER_MMS.length) {
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
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        }
      }
    },
    async addItem() {
      this.loading = true;
      try {
        const res = await this.$adsSmsRepository.create(
          convertDataToUpdateAdsSms(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("tin nhắn");
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
        await this.reloadDataConfig();
        await this.reloadDataCampaign();
        await this.reloadDataBrandName();
      }
    },
    async editItem() {
      this.loading = true;

      try {
        const res = await this.$adsSmsRepository.update(
          convertDataToUpdateAdsSms(this.item)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("tin nhắn");
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
        await this.reloadDataBanner();
        await this.reloadDataCampaign();
        await this.reloadDataBrandName();
        await this.reloadDataConfig();
      }
    },
    async reloadDataBanner() {
      const bannerId = this.item?.id;
      if (bannerId) {
        const res = await this.$adsSmsRepository.getDetail(bannerId);

        if (res.code === CODE_SUCCESS && res.data) {
          this.item.price_cskh = res.data.price_cskh;
          this.item.price_mms = res.data.price_mms;
          this.item.tempid = res.data.tempid;
        }
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
    async reloadDataBrandName() {
      const brandNameId = this.item?.brandname?.id;
      if (brandNameId) {
        const res = await this.$brandNameRepository.getDetail(brandNameId);

        if (res.code === CODE_SUCCESS && res.data) {
          this.item.brandname = res.data;
        }
      }
    }
  }
});

export default BannerSmsFormDialog;
export type BannerSmsFormDialogRef = InstanceType<typeof BannerSmsFormDialog>;
</script>
