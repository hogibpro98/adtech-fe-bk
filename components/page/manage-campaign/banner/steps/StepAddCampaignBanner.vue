<template>
  <v-row class="no-margin w-full">
    <v-flex xs12>
      <v-tabs-items v-model="tab">
        <v-tab-item
          :v-show="tab === 'tab-select-campaign'"
          value="tab-select-campaign"
        >
          <v-flex
            v-if="tab === 'tab-select-campaign'"
            xs12
            class="form-group pr-1"
          >
            <campaign-select
              v-model="innerValue.campaign"
              :loading="loading"
              :query-params="queryCampaign"
              :attach="!attachDropdown"
              :item-disabled="checkCampaign"
              show-price
              name="campaign_select"
              type="text"
              required
              rules="required"
            />
          </v-flex>
        </v-tab-item>
        <v-tab-item
          :v-show="tab === 'tab-create-campaign'"
          value="tab-create-campaign"
        >
          <v-flex v-if="tab === 'tab-create-campaign'">
            <v-flex xs12 class="form-group pr-1 no-margin">
              <v-text-field-with-validation
                v-model="newCampaign.name"
                :loading="loading"
                name="campaign_name"
                type="text"
                label="Tên chiến dịch"
                required
                rules="required|max:200"

              />
            </v-flex>
            <v-flex xs12 class="form-group no-margin">
              <date-range-picker-flat
                v-model="newCampaign.period"
                :loading="loading"
                :config-props="{
                  minDate: startOfDateNow
                  // maxDate: maxDateCreateCampaign
                }"
                model-format="YYYY-MM-DD HH:mm:ss"
                name="campaign_period_time"
                label="Thời gian diễn ra"
                rows="3"
                required
                auto-hide
              />
            </v-flex>
            <v-row class="no-padding no-margin">
              <v-flex sm7 class="pr-2">
                <v-number-field-with-validation
                  v-model="newCampaign.budget"
                  :loading="loading"
                  required
                  suffix="₫"
                  name="budget"
                  label="Ngân sách"
                  rules="required|min_value:1"
                />
              </v-flex>
              <v-flex sm5 class="pl-2">
                <agency-advertiser-select
                  v-model="newCampaign.owner"
                  :loading="loading"
                  :query-params="{
                    include_me: true
                  }"
                  :attach="!attachDropdown"
                  name="agency-advertiser"
                  type="text"
                  label="Người sở hữu"
                  required
                  rules="required"

                />
              </v-flex>
            </v-row>
            <v-row class="no-padding no-margin">
              <v-flex sm12 class="form-group no-margin">
                <zone-select
                  v-model="newCampaign.zone"
                  :loading="loading"
                  :query-params="{
                    custom_zone_campaign: true
                  }"
                  name="zone_id"
                  type="text"
                  label="Khu vực hiển thị"
                />
              </v-flex>
            </v-row>
          </v-flex>
        </v-tab-item>
      </v-tabs-items>
      <v-card-subtitle
        v-if="tab !== 'tab-create-campaign'"
        class="no-padding caption"
      >
        Bạn chưa có chiến dịch?
        <router-link to="#" @click.native="tab = 'tab-create-campaign'"
          >Tạo mới</router-link
        >
      </v-card-subtitle>
      <v-card-subtitle
        v-if="tab !== 'tab-select-campaign'"
        class="no-padding caption"
      >
        Bạn đã có chiến dịch?
        <router-link to="#" @click.native="tab = 'tab-select-campaign'"
          >Chọn chiến dịch</router-link
        >
      </v-card-subtitle>
    </v-flex>
  </v-row>
</template>
<script lang="ts">
import DateRangePickerFlat from "@/components/common/DateRangePickerFlat.vue";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import CampaignSelect from "@/components/select/CampaignSelect.vue";
import wrapper from "@/mixins/wrapper";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { CampaignInterface } from "~/interface/data/campaign";
import GlobalDataInterface from "~/interface/data/global";
import ZoneSelect from '~/components/select/ZoneSelect.vue';

interface ComponentData extends GlobalDataInterface {
  newCampaign: CampaignInterface;
  innerValue: BannerRedirectInterface | BannerMMSInterface;
  period: Array<object>;
  nameCampaign: string;
  tab: string;
  queryCampaign: {
    select_status: Array<string>;
  };
}

interface ComponentMethod {
  checkCampaign(item: CampaignInterface): void;
}

const StepAddCampaignBanner = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepAddCampaignBanner",
  components: {
    ZoneSelect,
    VNumberFieldWithValidation,
    AgencyAdvertiserSelect,
    DateRangePickerFlat,
    VTextFieldWithValidation,
    CampaignSelect
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: null
    },
    attachDropdown: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      newCampaign: {},
      innerValue: {
        newCampaign: {}
      },
      period: null,
      nameCampaign: null,
      tab: "tab-select-campaign",
      queryCampaign: {
        select_status: ["waiting", "running", "pause"]
      }
    };
  },
  computed: {
    typeCampaign() {
      return this.innerValue.typeCampaign;
    },
    startOfDateNow() {
      return moment()
        .startOf("day")
        .toDate()
        .getTime();
    },
    minDateCreateCampaign() {
      if (this.value.start_time) {
        return moment(this.value.start_time)
          .startOf("day")
          .toDate()
          .getTime();
      }
      return null;
    },
    maxDateCreateCampaign() {
      if (this.value.end_time) {
        return moment(this.value.end_time)
          .endOf("day")
          .toDate()
          .getTime();
      }
      return null;
    },
    ruleDateCampaign() {
      let min = "";
      const minLabel = "Thời gian bắt đầu chạy quảng cáo";
      let max = "";
      const maxLabel = "Thời gian kết thúc chạy quảng cáo";
      if (this.minDateCreateCampaign) {
        min = this.$filters.date(this.minDateCreateCampaign);
      }

      if (this.maxDateCreateCampaign) {
        max = this.$filters.date(this.maxDateCreateCampaign);
      }
      const ruleMin = `|dateInOrNull:${min},${minLabel}`;
      const ruleMax = `|dateInOrNullMax:${max},${maxLabel}`;
      return `required${min ? ruleMin : ""}${max ? ruleMax : ""}`;
    }
  },
  watch: {
    typeCampaign(val) {
      if (val === "select-campaign" && this.tab !== "tab-select-campaign") {
        this.tab = "tab-select-campaign";
      }

      if (val === "create-new-campaign" && this.tab !== "tab-create-campaign") {
        this.tab = "tab-create-campaign";
      }
    },
    newCampaign(val) {
      this.innerValue.newCampaign = val;
    },
    tab(val) {
      this.innerValue.typeCampaign =
        val === "tab-select-campaign"
          ? "select-campaign"
          : "create-new-campaign";
      if (val === "tab-select-campaign"){
        this.$emit("chose", false)
      }
      else if (val === "tab-create-campaign"){
        this.$emit("chose", true)
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    checkCampaign(item) {
      const priceCpm = item?.price?.price_cpm || 0;
      const priceCPMInit = priceCpm / 1000;
      return item?.remain_budget_create_ads <= priceCPMInit;
    }
  }
});

export default StepAddCampaignBanner;
export type StepAddCampaignBannerRef = InstanceType<
  typeof StepAddCampaignBanner
>;
</script>
