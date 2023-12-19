<template>
  <v-row class="step-preview-banner no-margin">
    <v-flex sm7 class="form-group pr-3 mt-0">
      <v-flex xs12>
        <v-row v-if="showTemplateId" class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Template Id:
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              {{ innerValue.temp_id || "Chưa có template id" }}
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-row>
      </v-flex>
      <hr v-if="showTemplateId" />
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
              Thông tin quảng cáo
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Tên quảng cáo: {{ innerValue.name }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Loại quảng cáo: {{ priceMMSName }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Brandname: {{ brandname }}
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Lĩnh vực hoạt động: {{ fieldActivity }}
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
              Thời gian nhắn tin:
              <span v-html="displayTimeSent(innerValue)"></span>
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
      <v-flex v-if="innerValue.targeting_type === 'targeting'" xs12>
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
              >Sử dụng nhà mạng:
              {{ networkSupplierNames.join(", ") }}.</v-list-item-subtitle
            >
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTypeTargetingBanner"
            >edit</v-icon
          >
        </v-row>
      </v-flex>
      <v-flex v-else-if="innerValue.targeting_type === 'import_file'" xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Đối tượng mục tiêu
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Được nhập từ tài liệu:
              <a :href="innerValue.target_file" target="_blank">
                Xem tài liệu
              </a>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTypeTargetingBanner"
            >edit</v-icon
          >
        </v-row>
      </v-flex>
      <v-flex v-else-if="innerValue.targeting_type === 'phone_group'" xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Đối tượng mục tiêu
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Nhóm thuê bao:
              <a href="javascript:;" @click="showPhoneList">
                {{ innerValue.phone_group && innerValue.phone_group.name }}
              </a>
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTypeTargetingBanner"
            >edit
          </v-icon>
        </v-row>
      </v-flex>
      <v-flex v-else-if="innerValue.targeting_type === 'api'" xs12>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Đối tượng mục tiêu
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Gửi API
            </v-list-item-subtitle>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTypeTargetingBanner"
            >edit
          </v-icon>
        </v-row>
      </v-flex>
      <v-flex v-else>
        <v-row class="no-margin">
          <v-list-item-content>
            <v-list-item-title class="v-label-bold">
              Đối tượng mục tiêu
            </v-list-item-title>
            <v-list-item-subtitle class="v-content-review">
              Sử dụng file targeting kèm trường động
            </v-list-item-subtitle>
            <a
              v-if="innerValue.params_file"
              :href="innerValue.params_file"
              target="_blank"
            >
              Xem file
            </a>
            <span v-else class="error--text">Chưa tải file</span>
          </v-list-item-content>
          <v-icon
            v-if="!readonly"
            class="pointer ml-2 mt-2-5 button-edit-banner"
            @click="openDialogEditTypeTargetingBanner"
            >edit
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
              {{ titleMode }} {{ numMMSOfDay | numberSpace }} tin nhắn
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Quảng cáo gửi tối đa {{ numMMSTotal | numberSpace }} tin nhắn
            </v-list-item-subtitle>
            <v-list-item-subtitle class="v-content-review">
              Đơn giá {{ pricingModeValue }}
            </v-list-item-subtitle>
            <v-list-item-title class="v-label-bold v-content-review">
              Chi phí ước tính mỗi ngày: {{ budgetOfDay | currency }}
            </v-list-item-title>
            <v-list-item-title class="v-label-bold v-content-review">
              Chi phí ước tính cho QC: {{ budgetTotal | currency }}
            </v-list-item-title>
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
    <v-flex sm5 class="pl-2">
      <preview-content-banner-sms
        v-model="innerValue"
        :loading="loading"
        :readonly="readonly"
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
    <banner-sms-vendor-edit-information-dialog
      ref="refEditBannerInformationDialog"
      @submit="onSaveData"
    />
    <banner-telco-edit-budget-dialog
      ref="refEditBannerBudgetDialog"
      @submit="onSaveData"
    />
    <banner-telco-edit-type-targeting-dialog
      ref="refBannerEditTargetingOptionalDialog"
      @submit="onSaveData"
    />
    <banner-telco-edit-type-targeting-dialog
      ref="refBannerEditTypeTargetingDialog"
      @submit="onSaveData"
    />
    <confirm-dialog
      v-if="innerValue.phone_group && innerValue.phone_group.numbers"
      ref="phoneGroupDialog"
      title="Danh sách số điện thoại"
      label-button-confirm=""
    >
      <ul slot="content">
        <li
          v-for="(value, index) in innerValue.phone_group.numbers"
          :key="index"
        >
          {{ value }}
        </li>
      </ul>
    </confirm-dialog>
  </v-row>
</template>
<script lang="ts">
import BannerEditCampaignDialog, {
  BannerEditCampaignDialogRef
} from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerEditCampaignDialog.vue";
import BannerEditTargetingDialog, {
  BannerEditTargetingDialogRef
} from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerEditTargetingDialog.vue";
import BannerEditTargetingOptionalDialog, {
  BannerEditTargetingOptionalDialogRef
} from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerEditTargetingOptionalDialog.vue";
import { BannerMMSEditBudgetDialogRef } from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerMMSEditBudgetDialog.vue";
import { BannerMMSEditInformationDialogRef } from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerMMSEditInformationDialog.vue";
import { BannerMMSEditTypeTargetingDialogRef } from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerMMSEditTypeTargetingDialog.vue";
import ACTIONS from "@/constants/actions";
import wrapper from "@/mixins/wrapper";
// @ts-ignore
import moment from 'moment/src/moment';
import { groupBy, flatten } from "lodash";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { SELECT_MMS_TYPE } from "~/constants/dataSelect";
import { generateName } from "~/util/ads";
import { isEmpty } from "~/util/typeof";
import {
  BannerMMSInterface,
  ConfigMMSInterface
} from "~/interface/data/banner";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import GlobalDataInterface from "~/interface/data/global";
import { responseErrorToString } from "~/util/array";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import BannerSmsVendorEditInformationDialog from "~/components/page/manage-ads/vendor/index/step/BannerSmsVendorEditInformationDialog.vue";
import { WEEKDAY_MAP } from "~/constants/map";
import PreviewContentBannerSms from "~/components/page/manage-ads/sms/index/PreviewContentBannerSms.vue";
import BannerSmsEditTypeTargetingDialog from "~/components/page/manage-ads/sms/index/BannerSmsEditTypeTargetingDialog.vue";
import BannerSmsEditBudgetDialog from "~/components/page/manage-ads/sms/index/BannerSmsEditBudgetDialog.vue";
import BannerTelcoEditBudgetDialog from "~/components/page/manage-ads/vendor/index/BannerTelcoEditBudgetDialog.vue";
import BannerTelcoEditTypeTargetingDialog from "~/components/page/manage-ads/vendor/index/BannerTelcoEditTypeTargetingDialog.vue";
import { SQL_TIMESTAMP } from "~/constants/format";
import { countDay } from "~/util/time";

export interface ComponentData extends GlobalDataInterface {
  innerValue: BannerSmsInterface;
  config: ConfigMMSInterface;
  maxMMSPerDayByConfig: number;
  numDayBanner: number;
  priceMMS: number;
  budgetCampaign: number;
  maxMMSByConfig: number;
  maxNumMMSOfCampaign: number;
  maxNumMMSPerDay: number;
  maxNumMMSByCampaign: number;
  maxNumMMSPerDayOfCampaign: number;
  maxNumMMSTotal: number;
  numMMSTotal: number;
  numMMSOfDay: number;
  priceCSKH: number;
  priceBrandMMS: number;
  campaign: CampaignInterface;
  isPermissionEdit: boolean;
  timeout: number;
  $adsConfigRepository: RepositoryInterface;
  $refs: {
    refBannerEditCampaignDialog: BannerEditCampaignDialogRef;
    refBannerEditTargetingDialog: BannerEditTargetingDialogRef;
    refBannerEditTargetingOptionalDialog: BannerEditTargetingOptionalDialogRef;
    refEditBannerInformationDialog: BannerMMSEditInformationDialogRef;
    refEditBannerBudgetDialog: BannerMMSEditBudgetDialogRef;
    refBannerEditTypeTargetingDialog: BannerMMSEditTypeTargetingDialogRef;
  };
}

interface ComponentMethods {
  getConfig(): void;
  openDialogEditCampaign(): void;
  openDialogEditTargeting(): void;
  openDialogEditTargetingOptional(): void;
  openDialogEditInformationBanner(): void;
  openDialogEditBudgetBanner(): void;
  openDialogEditTypeTargetingBanner(): void;
  onSaveData(item: BannerMMSInterface, cb: Function): void;
}

const StepReviewBannerSmsVendor = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "StepReviewBannerSmsVendor",
  components: {
    BannerSmsEditBudgetDialog,
    BannerSmsEditTypeTargetingDialog,
    PreviewContentBannerSms,
    BannerSmsVendorEditInformationDialog,
    ConfirmDialog,
    BannerEditTargetingOptionalDialog,
    BannerEditTargetingDialog,
    BannerEditCampaignDialog,
    BannerTelcoEditBudgetDialog,
    BannerTelcoEditTypeTargetingDialog
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
    onlyEditInDialog: {
      type: Boolean,
      required: false
    },
    editable: {
      type: Boolean,
      default: true
    },
    showTemplateId: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: {},
      currentTime: null,
      config: {}
    };
  },
  computed: {
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
    maxMMSPerDayByConfig() {
      if (!isEmpty(this.config.max_sms_per_day)) {
        return this.config.max_sms_per_day;
      }
      return null;
    },
    maxMMSByConfig() {
      if (!isEmpty(this.maxMMSPerDayByConfig)) {
        if (this.numDayBanner > 0) {
          return this.maxMMSPerDayByConfig * this.numDayBanner;
        }
        return 0;
      }
      return null;
    },
    dateRunAdsMMS() {
      const startTime = this.innerValue?.start_time;
      const endTime = this.innerValue?.end_time;

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
    timeSendMMS() {
      return `Từ ${this.innerValue.start_hour} đến ${this.innerValue.end_hour}`;
    },

    brandname() {
      return (
        (this.innerValue.brandname && this.innerValue.brandname.name) ||
        "Chưa chọn brandname"
      );
    },
    businessActivity() {
      return this.innerValue?.brandname?.business_activity?.name || "";
    },
    isPermissionEdit() {
      if (this.value?.item_permissions) {
        return this.value?.item_permissions?.includes("edit");
      }
      return this.$can(`manage-ads-list-ads-sms.${ACTIONS.EDIT}`);
    },
    isPermissionShowPrice() {
      return this.$can(`manage-ads-list-ads-sms-vendor.${ACTIONS.SHOW_PRICE}`);
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
    numDayBanner() {
      const {
        start_time: startTime,
        end_time: endTime,
        schedule
      } = this.innerValue;
      return countDay(schedule, startTime, endTime);
    },
    numDayCampaign() {
      // eslint-disable-next-line prefer-const
      let { start_time, end_time } = this.campaign;

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
    bannerDay() {
      const startTime = this.innerValue.start_time;
      const endTime = this.innerValue.end_time;

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
    maxNumMMSByCampaign() {
      if (this.priceMMS) {
        return Math.floor(this.budgetCampaign / this.priceMMS);
      }
      return 99999999999999;
    },
    maxNumMMSPerDayOfCampaign() {
      if (this.priceMMS) {
        if (this.numDayBanner) {
          return Math.floor(this.maxNumMMSByCampaign / this.numDayBanner);
        } else {
          return 0;
        }
      }

      return 99999999999999;
    },
    maxNumMMSPerDay() {
      if (this.numDayBanner > 0) {
        if (this.priceMMS) {
          const maxNumMMSPerDayOfCampaign = this.maxNumMMSPerDayOfCampaign;

          if (!isEmpty(this.maxMMSPerDayByConfig)) {
            return this.maxMMSPerDayByConfig < maxNumMMSPerDayOfCampaign
              ? this.maxMMSPerDayByConfig
              : maxNumMMSPerDayOfCampaign;
          }
          return maxNumMMSPerDayOfCampaign;
        }

        return 99999999999999;
      } else {
        return 0;
      }
    },
    maxNumMMSTotal() {
      if (this.numDayBanner > 0) {
        if (this.priceMMS) {
          const maxNumMMSTotal = this.maxNumMMSPerDay * this.numDayBanner;
          const maxNumMMS =
            maxNumMMSTotal > this.maxNumMMSOfCampaign
              ? this.maxNumMMSOfCampaign
              : maxNumMMSTotal;
          if (!isEmpty(this.maxMMSByConfig)) {
            return this.maxMMSByConfig < maxNumMMS
              ? this.maxMMSByConfig
              : maxNumMMS;
          } else {
            return maxNumMMS;
          }
        }

        return 99999999999999;
      } else {
        return 0;
      }
    },
    numMMSTotal() {
      let numMMSTotal = 0;
      if (this.innerValue?.budget_mode === "unlimit") {
        numMMSTotal = this.innerValue.max_sms || 0;
      } else {
        const numTotalPerDay = this.innerValue.max_sms_per_day || 0;
        numMMSTotal = numTotalPerDay * this.numDayBanner;
      }
      return numMMSTotal > this.maxNumMMSTotal
        ? this.maxNumMMSTotal
        : numMMSTotal;
    },
    numMMSOfDay() {
      let numMMSOfDay = 0;
      if (this.innerValue?.budget_mode === "unlimit") {
        if (this.numDayBanner > 0) {
          numMMSOfDay = Math.floor(this.numMMSTotal / this.numDayBanner);
        } else {
          return 0;
        }
      } else {
        numMMSOfDay = this.innerValue.max_sms_per_day || 0;
      }
      return numMMSOfDay > this.maxNumMMSPerDay
        ? this.maxNumMMSPerDay
        : numMMSOfDay;
    },
    titleMode() {
      if (this.innerValue?.budget_mode === "unlimit") {
        return "Mỗi ngày gửi trung bình";
      } else {
        return "Mỗi ngày gửi tối đa";
      }
    },
    budgetTotal() {
      if (this.numMMSTotal) {
        return this.numMMSTotal * this.priceMMS;
      }
      return 0;
    },
    budgetOfDay() {
      if (this.numMMSOfDay) {
        return this.numMMSOfDay * this.priceMMS;
      }
      return 0;
    },
    priceCSKH() {
      if (this.innerValue?.id) {
        return this.innerValue?.price_cskh || 0;
      } else {
        return this.innerValue?.brandname?.price_cskh || 0;
      }
    },
    priceBrandMMS() {
      // if (this.innerValue?.id) {
      //   return this.innerValue?.price_mms || 0;
      // } else {
      //   return this.innerValue?.brandname?.price_mms || 0;
      // }
      return this.innerValue?.price;
    },
    priceMMS() {
      return this.innerValue?.price || 0;
    },
    priceMMSName() {
      return SELECT_MMS_TYPE.find(
        type => parseInt(this.innerValue.sms_type, 10) === type.value
      )?.text;
    },
    pricingModeValue() {
      return `${
        this.priceMMS ? this.$filters.currency(this.priceMMS) : "-"
      }/tin nhắn`;
    },
    displaySize() {
      const displayType = (this.innerValue && this.innerValue.ads_type) || {};
      const imageTemplates = displayType.image_templates || [];
      return imageTemplates[0];
    },
    mediaTypeName() {
      const mediaType = this.innerValue.media_type;
      switch (mediaType) {
        case "slider":
          return "trình chiếu";
        case "video":
          return "video";
        case "text":
          return "văn bản";
        case "image":
        default:
          return "hình ảnh";
      }
    },
    fieldActivity() {
      return this.innerValue.cat_id;
    }
  },
  watch: {
    fieldActivity(newVal, oldVal) {
      this.getPriceSms();
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  created() {
    this.getConfig();
    this.updateCurrentTime();
  },
  methods: {
    updateCurrentTime() {
      this.currentTime = moment().unix();
    },
    displayTimeSent(item) {
      let msg = "";
      if (Array.isArray(item.schedule)) {
        item.schedule.forEach(e => {
          const days = e.days
            .map(day => {
              return WEEKDAY_MAP[day];
            })
            .sort();
          msg += days.join(", ") + ": <br/>";
          e.times.forEach(time => {
            msg += `Từ ${time.start} đến ${time.end};<br/> `;
          });
        });
      }
      return msg;
    },
    openDialogEditCampaign() {
      this.$refs.refBannerEditCampaignDialog.show(this.innerValue);
    },
    openDialogEditTargeting() {
      this.$refs.refBannerEditTargetingDialog.show(this.innerValue);
    },
    openDialogEditTargetingOptional() {
      this.$refs.refBannerEditTargetingOptionalDialog.show(this.innerValue);
    },
    openDialogEditInformationBanner() {
      this.$refs.refEditBannerInformationDialog.show(this.innerValue);
    },
    openDialogEditBudgetBanner() {
      this.$refs.refEditBannerBudgetDialog.show(this.innerValue);
    },
    openDialogEditTypeTargetingBanner() {
      this.$refs.refBannerEditTypeTargetingDialog.show(this.innerValue);
    },
    showPhoneList() {
      this.$refs.phoneGroupDialog.show();
    },
    onSaveData(item, cb) {
      this.innerValue = item;
      if (cb) {
        cb();
      }
    },
    async getConfig() {
      try {
        const config = await this.$adsConfigRepository.post();
        if (config.code === CODE_SUCCESS) {
          this.config = config.data;
        } else {
          this.$toast.global.server_error_msg(config.message);
        }
      } catch (e) {
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
    async getPriceSms() {
      const { data } = await this.$priceServiceRepository.post("get-price", {
        user_id:
          this.innerValue?.campaign?.advertiser_id ||
          this.innerValue?.campaign?.agency_id,
        cat_id: this.innerValue?.cat_id,
        service: "sms"
      });
      if (data !== null) {
        // this.price = data;
        this.innerValue.price = data;
      } else {
        this.innerValue.price = null;
      }
    }
  }
});

export default StepReviewBannerSmsVendor;
export type StepReviewBannerSmsVendorRef = InstanceType<
  typeof StepReviewBannerSmsVendor
>;
</script>
