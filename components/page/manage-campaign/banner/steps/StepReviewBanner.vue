<template>
  <v-row class="step-preview-banner no-margin px-3">
    <v-flex sm7 class="form-group pr-3 mt-0">
      <v-flex xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Chiến dịch
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              {{ campaign.name }}
            </v-list-item-subtitle>
            <div class="caption">{{ campaignDay }}</div>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditCampaign"
          >
            edit
          </v-icon>
        </v-row>
      </v-flex>
      <hr />
      <v-flex xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              URL trang đích
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              {{ innerValue.url }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditUrlBanner"
          >
            edit
          </v-icon>
        </v-row>
      </v-flex>
      <hr />
      <v-flex xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Thông tin QC
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Tên QC: {{ innerValue.name }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Thời gian diễn ra: {{ bannerDay }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Tổng thời gian tạm dừng:
              {{ innerValue.total_time_pause | humanize }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Thời gian đã chạy: {{ totalRunDuration | humanize }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Loại hiển thị quảng cáo:
              {{ innerValue.ads_type && innerValue.ads_type.name }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="thresholdObj" class="v-content-review">
              Loại hiển thị:
              {{ thresholdObj.name }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Loại nội dung: {{ mediaTypeName }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditInformationBanner"
          >
            edit
          </v-icon>
        </v-row>
      </v-flex>
      <hr />
      <v-flex xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Thông tin hiển thị QC
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Tag: {{ tagNames.join(", ") }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Sub-inventory: {{ channelNames.join(" | ") }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTargeting"
          >
            edit
          </v-icon>
        </v-row>
      </v-flex>
      <hr />
      <v-flex xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Đối tượng mục tiêu
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Khu vực nhà:&nbsp;
              <span v-if="locationNames && locationNames.length > 0">
                Bao gồm ({{
                  locationNames.length > 0
                    ? locationNames.join(", ")
                    : "Tất cả"
                }})
              </span>
              <span v-else>
                Tất cả
              </span>
              <span
                v-if="excludeLocationNames && excludeLocationNames.length > 0"
              >
                ,&nbsp;Loại trừ ({{ excludeLocationNames.join(", ") }})
              </span>
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Khu vực làm việc:&nbsp;
              <span v-if="workplaceNames && workplaceNames.length > 0">
                Bao gồm ({{
                  workplaceNames.length > 0
                    ? workplaceNames.join(", ")
                    : "Tất cả"
                }})
              </span>
              <span v-else>
                Tất cả
              </span>
              <span
                v-if="excludeWorkplaceNames && excludeWorkplaceNames.length > 0"
              >
                ,&nbsp;Loại trừ ({{ excludeWorkplaceNames.join(", ") }})
              </span>
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="genderNames && genderNames.length > 0"
              class="v-content-review"
            >
              Giới tính: {{ genderNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="ageNames && ageNames.length > 0"
              class="v-content-review"
            >
              Độ tuổi: {{ ageNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="relationshipNames && relationshipNames.length > 0"
              class="v-content-review"
            >
              Tình trạng hôn nhân: {{ relationshipNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="osNames && osNames.length > 0"
              class="v-content-review"
            >
              Sử dụng hệ điều hành: {{ osNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="deviceNames && deviceNames.length > 0"
              class="v-content-review"
            >
              Thiết bị sử dụng: {{ deviceNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="phoneNames && phoneNames.length > 0"
              class="v-content-review"
            >
              Điện thoại sử dụng: {{ phoneNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="networkDataNames && networkDataNames.length > 0"
              class="v-content-review"
            >
              Data: {{ networkDataNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="servicePackageNames && servicePackageNames.length > 0"
              class="v-content-review"
            >
              Gói cước sử dụng: {{ servicePackageNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="simAgesNames && simAgesNames.length > 0"
              class="v-content-review"
            >
              Tuổi thuê bao: {{ simAgesNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="dataFeeNames && dataFeeNames.length > 0"
              class="v-content-review"
            >
              Tiêu dùng data: {{ dataFeeNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="phoneFeeNames && phoneFeeNames.length > 0"
              class="v-content-review"
            >
              Tiêu dùng thoại: {{ phoneFeeNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="ARPUNames && ARPUNames.length > 0"
              class="v-content-review"
            >
              Tiêu dùng trung bình: {{ ARPUNames.join(", ") }}.
            </v-list-item-subtitle>
            <v-list-item-subtitle
              v-if="networkSupplierNames && networkSupplierNames.length > 0"
              class="v-content-review"
              >Sử dụng nhà mạng: {{ networkSupplierNames.join(", ") }}.
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTargetingOptional"
            >edit
          </v-icon>
        </v-row>
      </v-flex>
      <hr />
      <v-flex xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Tích hợp tài trợ data
            </v-list-item-title>
            <template v-if="innerValue.use_data">
              <v-list-item-subtitle class="v-content-review">
                Mã gói cước: {{ innerValue.data_code }}
              </v-list-item-subtitle>
              <v-list-item-subtitle class="v-content-review">
                Dung lượng: {{ innerValue.data_capacity }}
              </v-list-item-subtitle>
            </template>
            <template v-else>
              <v-list-item-subtitle>
                Không tích hợp tài trợ data
              </v-list-item-subtitle>
            </template>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDataDialog"
          >
            edit
          </v-icon>
        </v-row>
      </v-flex>
      <hr v-if="isPermissionShowPrice" />
      <v-flex v-if="isPermissionShowPrice" xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Chi phí quảng cáo ước tính
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              {{ titleMode }}: {{ maxViewOfDay | numberSpace }} Lượt {{ unit }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Số lượt {{ unit }} tối đa cho quảng cáo:
              {{ maxView | numberSpace }} Lượt {{ unit }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="!isContract" class="v-content-review">
              Loại đấu thầu: {{ pricingModeText }}
            </v-list-item-subtitle>
            <v-list-item-subtitle v-if="pricingModeValue && !isContract" class="v-content-review">
              Giá đấu thầu: {{ pricingModeValue }}
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditBudgetBanner"
          >
            edit
          </v-icon>
        </v-row>
      </v-flex>
    </v-flex>
    <v-flex sm5 class="form-group pl-2 mt-4">
      <preview-content-banner
        v-model="innerValue"
        :readonly="readonly"
        :display-size="displaySize"
        :loading="loading"
        :media-data="innerValue.media"
        :media-type="mediaType"
      />
    </v-flex>
    <banner-edit-campaign-dialog
      ref="refBannerEditCampaignDialog"
      @submit="onSaveData"
    />
    <banner-edit-targeting-dialog
      ref="refBannerEditTargetingDialog"
      @submit="onSaveData"
    />
    <banner-edit-information-dialog
      ref="refEditBannerInformationDialog"
      @submit="onSaveData"
    />
    <banner-edit-budget-dialog
      ref="refEditBannerBudgetDialog"
      @submit="onSaveData"
    />
    <banner-edit-targeting-optional-dialog
      ref="refBannerEditTargetingOptionalDialog"
      @submit="onSaveData"
    />
    <banner-edit-url-redirect-dialog
      ref="refBannerEditUrlDialog"
      @submit="onSaveData"
    />
    <banner-edit-data-sponsor-dialog ref="dataDialog" @submit="onSaveData" />
  </v-row>
</template>
<script lang="ts">
// @ts-ignore
import moment from "moment/src/moment";
import { groupBy } from "lodash";
import Vue, { VueConstructor } from "vue";
import PreviewContentBanner from "~/components/page/manage-campaign/banner/common/PreviewContentBanner.vue";
import BannerEditBudgetDialog, {
  BannerEditBudgetDialogRef
} from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditBudgetDialog.vue";
import BannerEditInformationDialog, {
  BannerEditInformationDialogRef
} from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditInformationDialog.vue";
import BannerEditCampaignDialog, {
  BannerEditCampaignDialogRef
} from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditCampaignDialog.vue";
import BannerEditTargetingDialog, {
  BannerEditTargetingDialogRef
} from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditTargetingDialog.vue";
import BannerEditTargetingOptionalDialog, {
  BannerEditTargetingOptionalDialogRef
} from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditTargetingOptionalDialog.vue";
import BannerEditUrlRedirectDialog, {
  BannerEditUrlRedirectDialogRef
} from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditUrlRedirectDialog.vue";
import ACTIONS from "~/constants/actions";
import wrapper from "~/mixins/wrapper";
import { isEmpty } from "~/util/typeof";
import { BannerRedirectInterface } from "~/interface/data/banner";
import { CampaignInterface } from "~/interface/data/campaign";
import { generateName } from "~/util/ads";
import BannerEditDataSponsorDialog from "~/components/page/manage-campaign/banner/dialog-edit-step/BannerEditDataSponsorDialog.vue";
import { SQL_TIMESTAMP } from "~/constants/format";

interface DisplaySizeInterface {
  width: number;
  height: number;
}

interface ComponentData {
  innerValue: BannerRedirectInterface;
  thresholdObj: number;
  mediaType: string;
  isPermissionEdit: boolean;
  isPermissionShowPrice: boolean;
  readonly: boolean;
  campaign: CampaignInterface;
  numDayCampaign: number;
  campaignDay: number;
  numDayBanner: number;
  bannerDay: string;
  maxViewOfDay: number;
  budgetTotalOfDay: number;
  budgetTotal: number;
  priceCpm: number;
  pricingModeValue: string;
  titleMode: string;
  displaySize: DisplaySizeInterface;
  mediaTypeName: string;
  $refs: {
    refBannerEditCampaignDialog: BannerEditCampaignDialogRef;
    refBannerEditTargetingDialog: BannerEditTargetingDialogRef;
    refBannerEditTargetingOptionalDialog: BannerEditTargetingOptionalDialogRef;
    refEditBannerInformationDialog: BannerEditInformationDialogRef;
    refEditBannerBudgetDialog: BannerEditBudgetDialogRef;
    refBannerEditUrlDialog: BannerEditUrlRedirectDialogRef;
  };
}

interface ComponentMethod {
  openDialogEditCampaign(): void;

  openDialogEditTargeting(): void;

  openDialogEditTargetingOptional(): void;

  openDialogEditInformationBanner(): void;

  openDialogEditBudgetBanner(): void;

  openDialogEditUrlBanner(): void;

  onSaveData(item: BannerRedirectInterface, cb: Function): void;
}

const StepReviewBanner = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepReviewBanner",
  components: {
    BannerEditDataSponsorDialog,
    BannerEditUrlRedirectDialog,
    PreviewContentBanner,
    BannerEditTargetingOptionalDialog,
    BannerEditBudgetDialog,
    BannerEditInformationDialog,
    BannerEditTargetingDialog,
    BannerEditCampaignDialog
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: true
    },
    onlyEditInDialog: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      innerValue: {},
      currentTime: null
    };
  },
  computed: {
    isContract() {
      return !isEmpty(this.campaign?.zone_id);
    },
    totalRunDuration() {
      const endTime =
        moment(this.innerValue.end_time, SQL_TIMESTAMP).unix() <
        this.currentTime
          ? moment(this.innerValue.end_time, SQL_TIMESTAMP).unix()
          : this.currentTime;
      return (
        endTime -
        moment(this.innerValue.start_time).unix() -
        this.innerValue.total_time_pause
      );
    },
    unit() {
      if (this.innerValue?.pricing_mode === "cpm") {
        return "impression";
      }
      if (this.innerValue?.pricing_mode === "cpc") {
        return "click";
      }
      return "";
    },
    thresholdObj() {
      if (this.mediaType === "video") {
        return this.innerValue?.threshold_obj;
      }
      return 0;
    },
    mediaType() {
      return this.innerValue?.ads_type?.media_type;
    },
    isPermissionEdit() {
      if (this.value?.item_permissions) {
        return this.value?.item_permissions?.includes("edit");
      }
      return this.$can(`manage-ads-list-ads-redirect.${ACTIONS.EDIT}`);
    },
    isPermissionShowPrice() {
      return this.$can(`manage-ads-list-ads-redirect.${ACTIONS.SHOW_PRICE}`);
    },
    readonly() {
      if (this.value?.id) {
        if (!this.editable) return true;

        return !this.isPermissionEdit;
      }
      return false;
    },
    campaign() {
      return (this.innerValue && this.innerValue.campaign) || {};
    },
    numDayCampaign() {
      let { start_time } = this.campaign;
      const { end_time } = this.campaign;

      if (!start_time || !end_time) return "";

      if (start_time < Date.now()) {
        start_time = Date.now();
      }

      const date1 = moment(start_time);
      const date2 = moment(end_time);
      return date2.diff(date1, "day") + 1;
    },
    campaignDay() {
      // eslint-disable-next-line prefer-const
      let { start_time: startTime, end_time: endTime } = this.campaign;

      if (!startTime || !endTime) return "";

      const date1 = moment(startTime)
        .format("DD/MM/YYYY")
        .toString();
      const date2 = moment(endTime)
        .format("DD/MM/YYYY")
        .toString();
      if (date1 !== date2) {
        return `Từ ${date1} đến ${date2}`;
      } else {
        return date1;
      }
    },
    numDayBanner() {
      const { start_time: startTime, end_time: endTime } = this.innerValue;

      if (!startTime || !endTime) return 1;

      const date1 = moment(startTime);
      const date2 = moment(endTime);
      return date2.diff(date1, "day") + 1;
    },
    bannerDay() {
      const { start_time: startTime, end_time: endTime } = this.innerValue;
      if (!startTime || !endTime) return "";

      const date1 = moment(startTime)
        .format("DD/MM/YYYY")
        .toString();
      const date2 = moment(endTime)
        .format("DD/MM/YYYY")
        .toString();
      if (date1 !== date2) {
        return `Từ ${date1} đến ${date2}`;
      } else {
        return date1;
      }
    },
    locationNames() {
      if (isEmpty(this.innerValue.locations)) return [];

      return (this.innerValue.locations || []).map(l => l.name);
    },
    excludeLocationNames() {
      if (isEmpty(this.innerValue.exclude_locations)) return [];

      return (this.innerValue.exclude_locations || []).map(l => l.name);
    },
    workplaceNames() {
      return (this.innerValue.workplaces || []).map(l => l.name);
    },
    excludeWorkplaceNames() {
      return (this.innerValue.exclude_workplaces || []).map(l => l.name);
    },
    genderNames() {
      return (this.innerValue.genders || []).map(g => g.name);
    },
    osNames() {
      return (this.innerValue.os || []).map(item => item.name);
    },
    deviceNames() {
      return (this.innerValue.devices || []).map(item => item.name);
    },
    phoneNames() {
      return (this.innerValue.phone_names || []).map(item => item.name);
    },
    networkDataNames() {
      return (this.innerValue.network_data || []).map(item => item.name);
    },
    servicePackageNames() {
      return (this.innerValue.service_package || []).map(item => item.name);
    },
    simAgesNames() {
      return (this.innerValue.sim_ages || []).map(item =>
        generateName(item, "năm")
      );
    },
    dataFeeNames() {
      return (this.innerValue.data_fee || []).map(item =>
        generateName({
          min: this.$filters.currency(item?.min),
          max: this.$filters.currency(item?.max)
        })
      );
    },
    phoneFeeNames() {
      return (this.innerValue.phone_fee || []).map(item =>
        generateName({
          min: this.$filters.currency(item?.min),
          max: this.$filters.currency(item?.max)
        })
      );
    },
    ARPUNames() {
      return (this.innerValue.arpu || []).map(item =>
        generateName({
          min: this.$filters.currency(item?.min),
          max: this.$filters.currency(item?.max)
        })
      );
    },
    relationshipNames() {
      return (this.innerValue.relationships || []).map(item => item.name);
    },
    tagNames() {
      if (isEmpty(this.innerValue.tags)) {
        return ["Không có tag được chọn"];
      }
      return (this.innerValue.tags || []).map(tag => tag.name);
    },
    ageNames() {
      return (this.innerValue.ages || []).map(item =>
        generateName(item, "tuổi")
      );
    },
    networkSupplierNames() {
      return (this.innerValue.network_suppliers || []).map(g => g.name);
    },
    channelNames() {
      const groupByInventoryName = groupBy(this.innerValue.channels, function(
        channel
      ) {
        return channel.inventory && channel.inventory.name;
      });

      return Object.keys(groupByInventoryName).map(key => {
        const channels = groupByInventoryName[key] || [];
        return `${key} (${channels.map(channel => channel.name).join(", ")})`;
      });
    },
    budgetCampaign() {
      return this.innerValue?.campaign?.remain_budget_create_ads || 0;
    },
    maxNumViewByCampaign() {
      if (this.priceCpm) {
        return Math.floor(this.budgetCampaign / this.priceCpm) * 1000;
      }

      return 99999999999999;
    },
    maxView() {
      let maxView = 0;
      if (this.innerValue?.budget_mode === "unlimit") {
        maxView = this.innerValue.max_view;
      } else {
        maxView = (this.innerValue.max_view_per_day || 0) * this.numDayBanner;
      }
      return maxView > this.maxNumViewByCampaign
        ? this.maxNumViewByCampaign
        : maxView;
    },
    maxNumViewPerDay() {
      if (this.numDayBanner > 0) {
        if (this.priceCpm) {
          return Math.floor(this.maxView / this.numDayBanner);
        }

        return 99999999999999;
      } else {
        return 0;
      }
    },
    maxViewOfDay() {
      let maxViewOfDay = 0;
      if (this.innerValue?.budget_mode === "unlimit") {
        if (this.numDayBanner > 0) {
          maxViewOfDay = Math.floor(
            (this.innerValue.max_view || 0) / this.numDayBanner
          );
        }
      } else {
        maxViewOfDay = this.innerValue.max_view_per_day || 0;
      }

      return maxViewOfDay > this.maxNumViewPerDay
        ? this.maxNumViewPerDay
        : maxViewOfDay;
    },
    budgetTotalOfDay() {
      if (this.maxViewOfDay) {
        const price =
          this.innerValue?.pricing_mode === "cpc"
            ? this.priceCpc
            : this.priceCpm / 1000;
        return this.maxViewOfDay * price;
      }
      return 0;
    },
    budgetTotal() {
      if (this.maxView) {
        const price =
          this.innerValue?.pricing_mode === "cpc"
            ? this.priceCpc
            : this.priceCpm / 1000;
        return this.maxView * price;
      }
      return 0;
    },
    priceCpc() {
      return this.innerValue?.campaign?.price?.price_cpc || 0;
    },
    priceCpm() {
      if (this.innerValue?.id) {
        return this.innerValue?.price_cpm || 0;
      } else {
        return this.innerValue?.campaign?.price?.price_cpm || 0;
      }
    },
    pricingModeText() {
      if (this.innerValue?.pricing_mode === "cpm") {
        return "Tính theo lượt impression";
      } else if (this.innerValue?.pricing_mode === "cpc") {
        return "Tính theo lượt click";
      } else {
        return "Chưa chọn phương thức";
      }
    },
    pricingModeValue() {
      if (this.innerValue?.pricing_mode === "cpm") {
        if (!isEmpty(this.innerValue?.cpm)) {
          return `${this.$filters.currency(
            this.innerValue?.cpm?.min
          )} - ${this.$filters.currency(this.innerValue?.cpm?.max)}/1000 lượt ${
            this.unit
          }`;
        } else {
          return "Chưa nhập giá đấu thầu";
        }
      } else if (this.innerValue?.pricing_mode === "cpc") {
        if (!isEmpty(this.innerValue?.cpc)) {
          return `${this.$filters.currency(
            this.innerValue?.cpm?.min
          )} - ${this.$filters.currency(this.innerValue?.cpm?.max)}/lượt ${
            this.unit
          }`;
        } else {
          return "Chưa nhập giá đấu thầu";
        }
      }
    },
    titleMode() {
      if (this.innerValue?.budget_mode === "unlimit") {
        return `Số lượt ${this.unit} trung bình mỗi ngày`;
      } else {
        return `Số lượt ${this.unit} tối đa mỗi ngày`;
      }
    },
    displaySize() {
      const displayType = (this.innerValue && this.innerValue.ads_type) || {};
      const imageTemplates = displayType.image_templates || [];
      return imageTemplates[0];
    },
    mediaTypeName() {
      const mediaType = this.innerValue?.ads_type?.media_type;
      switch (mediaType) {
        case "slider":
          return "Trình chiếu";
        case "video":
          return "Video";
        case "text":
          return "Văn bản";
        case "audio":
          return "Audio";
        case "embed":
          return "Nhúng";
        case "image":
        default:
          return "Hình ảnh";
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  created() {
    this.updateCurrentTime();
  },
  methods: {
    updateCurrentTime() {
      this.currentTime = moment().unix();
    },

    openDialogEditCampaign() {
      this.$refs.refBannerEditCampaignDialog.show(this.innerValue);
    },
    openDataDialog() {
      this.$refs.dataDialog.show(this.innerValue);
    },
    openDialogEditTargeting() {
      this.$refs.refBannerEditTargetingDialog.show(this.innerValue);
    },
    openDialogEditTargetingOptional() {
      this.$refs.refBannerEditTargetingDialog.show(this.innerValue);
    },
    openDialogEditInformationBanner() {
      this.$refs.refEditBannerInformationDialog.show(this.innerValue);
    },
    openDialogEditBudgetBanner() {
      this.$refs.refEditBannerBudgetDialog.show(this.innerValue);
    },
    openDialogEditUrlBanner() {
      this.$refs.refBannerEditUrlDialog.show(this.innerValue);
    },
    onSaveData(item, cb) {
      this.innerValue = item;
      if (cb) {
        cb();
      }
    }
  }
});

export default StepReviewBanner;
export type StepReviewBannerRef = InstanceType<typeof StepReviewBanner>;
</script>
