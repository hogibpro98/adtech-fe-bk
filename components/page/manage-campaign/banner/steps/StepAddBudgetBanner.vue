<template>
  <v-row class="no-margin">
    <v-flex xs12>
      <v-card-title
        class="text-center pb-0 pl-1  label-md text--primary font-16"
      >
        Cách tính phí quảng cáo
      </v-card-title>
      <v-radio-group v-model="innerValue.pricing_mode" row>
        <v-radio label="Tính theo lượt impression" value="cpm"></v-radio>
        <v-radio label="Tính theo lượt click" value="cpc"></v-radio>
      </v-radio-group>
      <v-card-title
        class="text-center pb-0 pl-1  label-md text--primary font-16"
      >
        Chi phí quảng cáo
      </v-card-title>
      <v-radio-group v-model="innerValue.budget_mode">
        <v-radio
          :label="perDayLabel"
          class="no-margin z-10"
          value="limit_by_day"
        ></v-radio>
        <v-expand-transition>
          <v-card
            v-show="typeBudget === 'limit_by_day'"
            width="100%"
            class="mx-auto"
            flat
          >
            <v-row class="no-margin ml-34">
              <v-flex sm6>
                <v-number-field-with-validation
                  v-if="
                    typeBudget === 'limit_by_day' &&
                      innerValue.pricing_mode === 'cpm'
                  "
                  v-model="viewPerDay"
                  :loading="loading"
                  :decimal="false"
                  :hint="hintTextInputImpressionPerDay"
                  :rules="ruleInputImpressionPerDay"
                  class="d-flex align-items-center h-100 mt-1"
                  dense
                  name="Số lượt impression tối đa mỗi ngày"
                  placeholder="Nhập số impression"
                  required
                >
                  <template #append>
                    {{ initName }} <span class="red--text ml-1"> (*) </span>
                  </template>
                </v-number-field-with-validation>
                <v-number-field-with-validation
                  v-if="typeBudget === 'limit_by_day' && pricingMode === 'cpc'"
                  v-model="clickPerDay"
                  :loading="loading"
                  :decimal="false"
                  :hint="hintTextInputCpcPerDay"
                  :rules="ruleInputCpcPerDay"
                  class="d-flex align-items-center h-100 mt-1"
                  dense
                  name="Số lượt click tối đa mỗi ngày"
                  placeholder="Nhập số click"
                  required
                >
                  <template #append>
                    {{ initName }} <span class="red--text ml-1"> (*) </span>
                  </template>
                </v-number-field-with-validation>
              </v-flex>
              <v-flex
                sm6
                class="pl-3 mt-2 d-flex flex-column justify-content-center"
              >
                <div class="body-2 px-1">
                  Số lượt
                  {{ unit }} tối đa mỗi ngày:
                  <span class="white-space-nowrap">
                    {{ numViewOfDay | numberSpace }}
                  </span>
                </div>
                <div class="body-2 px-1 py-1">
                  Số lượt
                  {{ unit }} tối đa cho quảng cáo:
                  <span class="white-space-nowrap">
                    {{ maxViewTotal | numberSpace }}
                  </span>
                </div>
              </v-flex>
            </v-row>
          </v-card>
        </v-expand-transition>
        <v-radio
          class="no-margin no-padding z-10 mt-2"
          :label="totalLabel"
          value="unlimit"
        ></v-radio>
        <v-expand-transition>
          <v-card
            v-show="typeBudget === 'unlimit'"
            width="100%"
            class="mx-auto"
            flat
          >
            <v-row class="no-margin ml-34">
              <v-flex sm6>
                <v-number-field-with-validation
                  v-if="typeBudget === 'unlimit' && pricingMode === 'cpm'"
                  v-model="view"
                  :loading="loading"
                  :decimal="false"
                  :hint="hintTextInputImpression"
                  :rules="ruleInputImpression"
                  class="d-flex align-items-center h-100 mt-1"
                  dense
                  name="Số lượt impression tối đa cho quảng cáo"
                  placeholder="Nhập số impression"
                  required
                >
                  <template #append>
                    {{ initName }} <span class="red--text ml-1"> (*) </span>
                  </template>
                </v-number-field-with-validation>
                <v-number-field-with-validation
                  v-if="typeBudget === 'unlimit' && pricingMode === 'cpc'"
                  v-model="click"
                  :loading="loading"
                  :decimal="false"
                  :hint="hintTextInputCpc"
                  :rules="ruleInputCpc"
                  class="d-flex align-items-center h-100 mt-1"
                  dense
                  name="Số lượt click tối đa cho quảng cáo"
                  placeholder="Nhập số click"
                  required
                >
                  <template #append>
                    {{ initName }} <span class="red--text ml-1"> (*) </span>
                  </template>
                </v-number-field-with-validation>
              </v-flex>
              <v-flex
                v-if="pricingMode === 'cpm'"
                sm6
                class="pl-3 mt-2 d-flex flex-column justify-content-center"
              >
                <div class="body-2 px-1">
                  Số lượt impression tối đa cho quảng cáo:
                  <span class="white-space-nowrap">
                    {{ maxViewTotal | numberSpace }}
                  </span>
                </div>
                <div class="body-2 px-1 py-1">
                  Số lượt impression trung bình mỗi ngày:
                  <span class="white-space-nowrap">
                    {{ numViewOfDay | numberSpace }}
                  </span>
                </div>
              </v-flex>
              <v-flex
                v-if="pricingMode === 'cpc'"
                sm6
                class="pl-3 mt-2 d-flex flex-column justify-content-center"
              >
                <div class="body-2 px-1">
                  Số lượt click tối đa cho quảng cáo:
                  <span class="white-space-nowrap">
                    {{ maxClickTotal | numberSpace }}
                  </span>
                </div>
                <div class="body-2 px-1 py-1">
                  Số lượt click trung bình mỗi ngày:
                  <span class="white-space-nowrap">
                    {{ numClickOfDay | numberSpace }}
                  </span>
                </div>
              </v-flex>
            </v-row>
          </v-card>
        </v-expand-transition>
      </v-radio-group>
    </v-flex>
    <v-flex xs12>
      <div v-if="!isContract">
        <v-flex xs12>
          <slider-range-with-validation
            v-if="pricingMode === 'cpm'"
            v-model="innerValue.cpm"
            :loading="loading"
            :min="0"
            :max="50000"
            :props-input1="{
              suffix: '₫',
              class: 'm-w-10',
              'label-validation': 'Giá tối thiểu'
            }"
            :props-input2="{
              suffix: '₫',
              class: 'm-w-10',
              'label-validation': 'Giá tối đa'
            }"
            :thumb-size="40"
            name="cpm"
            label="Giá đấu thầu theo 1000 lượt impression"
            stype="margin-left: 4px; margin-right: 4px;"
          />
          <slider-range-with-validation
            v-if="pricingMode === 'cpc'"
            v-model="innerValue.cpc"
            :loading="loading"
            :min="0"
            :max="50000"
            :props-input1="{
              suffix: '₫',
              class: 'm-w-10',
              'label-validation': 'Giá tối thiểu'
            }"
            :props-input2="{
              suffix: '₫',
              class: 'm-w-10',
              'label-validation': 'Giá tối đa'
            }"
            :thumb-size="40"
            name="click"
            label="Giá đấu thầu theo lượt click"
            required
            stype="margin-left: 4px; margin-right: 4px;"
          />
        </v-flex>
      </div>
      <v-flex xs12>
        <v-checkbox
          v-model="isTracking"
          hide-details
          class="mr-2 mt-0 bold"
          label="Chọn tracking"
        ></v-checkbox>
        <v-flex v-if="isTracking" xs12>
          <v-flex
            xs12
            class="d-flex justify-content-space-between align-items-center mt-4"
          >
            <span class="bold" style="font-size: 16px;"
              >Danh sách tracking quảng cáo đang sử dụng</span
            >
            <v-btn color="primary" icon @click="addIp">
              <v-icon>
                add
              </v-icon>
            </v-btn>
          </v-flex>
          <v-flex style="font-size: 16px;">
            Cần chọn một tracking và thêm tham số tối đa cho mỗi tracking
          </v-flex>
          <v-flex
            v-for="(tracking, i) in innerValue.event_trackings"
            :key="'event_trackings_' + i"
            xs12
          >
            <v-row no-gutters justify="space-between" align="center">
              <v-col cols="10">
                <event-tracking-select
                  v-model="tracking.id"
                  :loading="loading"
                  :return-object="false"
                  :name="`innerValue.event_trackings.${i}.id`"
                  label="Tracking"
                  item-value="id"
                  required
                  rules="required"
                />
              </v-col>
              <!--              <v-col cols="3" class="pl-2">-->
              <!--                <v-number-field-with-validation-->
              <!--                  v-model="tracking.pivot.value"-->
              <!--                  :loading="loading"-->
              <!--                  :decimal="true"-->
              <!--                  :name="`innerValue.event_trackings.${i}.pivot.value`"-->
              <!--                  label="Giá trị"-->
              <!--                  required-->
              <!--                  rules="required|min:0|max:14"-->
              <!--                />-->
              <!--              </v-col>-->
              <v-col cols="1" align="end">
                <v-btn small icon color="error" @click="ipRemove(i)">
                  <v-icon>delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-flex>
        </v-flex>
      </v-flex>
    </v-flex>
  </v-row>
</template>
<script lang="ts">
// @ts-ignore
import moment from "moment/src/moment";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import wrapper from "@/mixins/wrapper";
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import { CODE_SUCCESS } from "~/constants/code";
import { BannerRedirectInterface } from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { FiltersInterface } from "~/interface/plugin/filters";
import SliderRangeWithValidation from "~/components/common/SliderRangeWithValidation.vue";
import EventTrackingSelect from "~/components/select/EventTrackingSelect.vue";
import { isEmpty } from "~/util/typeof";

const DEFAULT_ITEM = {
  id: null,
  full_name: "",
  username: "",
  event_trackings: [
    {
      id: null,
      name: null,
      pivot: {
        value: 1
      }
    }
  ]
};

interface ItemInterface {
  event_trackings: Array<string>;
  id?: number;
  full_name: string;
  username: string;
}

interface ComponentData {
  innerValue: BannerRedirectInterface;
  unit: string;
  typeBudget: string;
  viewPerDay: number;
  view: number;
  clickPerDay: number;
  click: number;
  priceCpm: number;
  priceCpc: number;
  maxNumViewByCampaign: number;
  maxNumClickByCampaign: number;
  maxNumView: number;
  maxNumClick: number;
  maxNumClickPerDay: number;
  maxNumViewPerDay: number;
  budgetCampaign: number;
  numDayBanner: number;
  maxViewPerDay: number;
  maxView: number;
  maxClick: number;
  maxClickPerDay: number;
  pricingMode: string;
  $filters: FiltersInterface;
  $campaignRepository: RepositoryInterface;
  item: ItemInterface;
}

interface ComponentMethod {
  reloadDataCampaign(): void;
}

const StepAddBudgetBanner = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepAddBudgetBanner",
  components: {
    SliderRangeWithValidation,
    VNumberFieldWithValidation,
    EventTrackingSelect
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
    attachDropdown: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      test: {
        min: 0,
        max: 100
      },
      innerValue: {
        pricing_mode: "cpm",
        cpm: {
          min: 0,
          max: 0
        },
        cpc: {
          min: 0,
          max: 0
        },
        event_trackings: [
          {
            id: "",
            name: "",
            pivot: {
              value: 1
            }
          }
        ]
      },
      viewPerDay: null,
      view: null,
      clickPerDay: null,
      click: null,
      isTracking: false,
      item: cloneDeep(DEFAULT_ITEM),
      index: 0
    };
  },
  computed: {
    isContract() {
      return !isEmpty(this.innerValue?.campaign?.zone_id);
    },
    isTracking() {
      return (this.isTracking = true);
    },
    unit() {
      return this.pricingMode === "cpm" ? "impression" : "click";
    },
    perDayLabel() {
      return `Tính ${this.unit} theo ngày`;
    },
    totalLabel() {
      return `Tính ${this.unit} theo quảng cáo`;
    },
    pricingMode() {
      return this.innerValue.pricing_mode;
    },
    initName() {
      if (this.innerValue?.pricing_mode === "cpm") {
        return "Impression";
      } else {
        return "Click";
      }
    },
    hintTextInputImpression() {
      if (!this.priceCpm) {
        return "";
      }
      return `Tối đa ${this.$filters.spaceNumber(
        this.maxNumView
      )} lượt impression cho quảng cáo`;
    },
    hintTextInputCpc() {
      if (!this.priceCpc) {
        return "";
      }
      return `Tối đa ${this.$filters.spaceNumber(
        this.maxNumClick
      )} lượt click cho quảng cáo`;
    },
    ruleInputImpression() {
      if (!this.priceCpm) {
        return `required|numeric|min_value:1`;
      }

      return `required|numeric|min_value:1|max_value:${this.maxNumView}`;
    },
    ruleInputCpc() {
      if (!this.priceCpc) {
        return `required|numeric|min_value:1`;
      }

      return `required|numeric|min_value:1|max_value:${this.maxNumClick}`;
    },
    hintTextInputImpressionPerDay() {
      if (!this.priceCpm) {
        return "";
      }
      return `Tối đa ${this.$filters.spaceNumber(
        this.maxNumViewPerDay
      )} lượt impression mỗi ngày`;
    },
    hintTextInputCpcPerDay() {
      if (!this.priceCpc) {
        return "";
      }
      return `Tối đa ${this.$filters.spaceNumber(
        this.maxNumClickPerDay
      )} lượt click mỗi ngày`;
    },
    ruleInputImpressionPerDay() {
      if (!this.priceCpm) {
        return `required|numeric|min_value:1`;
      }

      return `required|numeric|min_value:1|max_value:${this.maxNumViewPerDay}`;
    },
    ruleInputCpcPerDay() {
      if (!this.priceCpc) {
        return `required|numeric|min_value:1`;
      }

      return `required|numeric|min_value:1|max_value:${this.maxNumClickPerDay}`;
    },
    budgetCampaign() {
      return this.innerValue?.campaign?.remain_budget_create_ads || 0;
    },
    maxNumView() {
      return Math.floor(this.budgetCampaign / this.priceCpm) * 1000;
    },
    maxNumClick() {
      return Math.floor(this.budgetCampaign / this.priceCpc) * 1000;
    },
    maxNumViewPerDay() {
      if (this.numDayBanner > 0) {
        if (this.priceCpm) {
          return Math.floor(this.maxNumView / this.numDayBanner);
        }

        return 99999999999999;
      } else {
        return 0;
      }
    },
    maxNumClickPerDay() {
      if (this.numDayBanner > 0) {
        if (this.priceCpc) {
          return Math.floor(this.maxNumClick / this.numDayBanner);
        }

        return 99999999999999;
      } else {
        return 0;
      }
    },
    maxNumViewByCampaign() {
      if (this.priceCpm) {
        return Math.floor(this.budgetCampaign / this.priceCpm) * 1000;
      }

      return 99999999999999;
    },
    maxNumClickByCampaign() {
      if (this.priceCpc) {
        return Math.floor(this.budgetCampaign / this.priceCpc) * 1000;
      }

      return 99999999999999;
    },
    typeBudget() {
      return this.innerValue?.budget_mode;
    },
    priceCpc() {
      if (this.innerValue?.id) {
        return this.innerValue?.price_cpc || 0;
      } else {
        return this.innerValue?.campaign?.price?.price_cpc || 0;
      }
    },
    priceCpm() {
      if (this.innerValue?.id) {
        return this.innerValue?.price_cpm || 0;
      } else {
        return this.innerValue?.campaign?.price?.price_cpm || 0;
      }
    },
    numDayBanner() {
      const { start_time: startTime, end_time: endTime } = this.innerValue;

      if (!startTime || !endTime) return 1;

      const date1 = moment(startTime);
      const date2 = moment(endTime);
      return date2.diff(date1, "day") + 1;
    },
    maxViewTotal() {
      if (this.typeBudget === "unlimit") {
        const maxView = this.innerValue.max_view || 0;
        return maxView > this.maxNumViewByCampaign
          ? this.maxNumViewByCampaign
          : maxView;
      } else {
        const maxViewByDay =
          (this.innerValue.max_view_per_day || 0) * this.numDayBanner;
        return maxViewByDay > this.maxNumViewByCampaign
          ? this.maxNumViewByCampaign
          : maxViewByDay;
      }
    },
    maxClickTotal() {
      if (this.typeBudget === "unlimit") {
        const maxClick = this.innerValue.max_click || 0;
        return maxClick > this.maxNumClickByCampaign
          ? this.maxNumClickByCampaign
          : maxClick;
      } else {
        const maxClickByDay =
          (this.innerValue.max_click_per_day || 0) * this.numDayBanner;
        return maxClickByDay > this.maxNumClickByCampaign
          ? this.maxNumClickByCampaign
          : maxClickByDay;
      }
    },
    maxViewPerDay() {
      return this.innerValue.max_view_per_day;
    },
    maxClickPerDay() {
      return this.innerValue.max_click_per_day;
    },
    maxView() {
      return this.innerValue.max_view;
    },
    maxClick() {
      return this.innerValue.max_click;
    },
    budgetOfDay() {
      if (this.typeBudget === "select-budget-all") {
        if (this.pricingMode === "cpm") {
          return Math.floor(
            (this.innerValue.max_view || 0) / this.numDayBanner
          );
        } else {
          return Math.floor(
            (this.innerValue.max_click || 0) / this.numDayBanner
          );
        }
      } else if (this.pricingMode === "cpm") {
        return this.innerValue.max_view_per_day || 0;
      } else {
        return this.innerValue.max_click_per_day || 0;
      }
    },
    numViewOfDay() {
      if (this.typeBudget === "unlimit") {
        const numView =
          Math.floor((this.innerValue.max_view || 0) / this.numDayBanner) || 0;
        return this.maxNumViewPerDay < numView
          ? this.maxNumViewPerDay
          : numView;
      } else {
        const maxViewByDay = this.innerValue.max_view_per_day || 0;
        return this.maxNumViewPerDay < maxViewByDay
          ? this.maxNumViewPerDay
          : maxViewByDay;
      }
    },
    numClickOfDay() {
      if (this.typeBudget === "unlimit") {
        const numClick =
          Math.floor((this.innerValue.max_click || 0) / this.numDayBanner) || 0;
        return this.maxNumClickPerDay < numClick
          ? this.maxNumClickPerDay
          : numClick;
      } else {
        const maxClickByDay = this.innerValue.max_click_per_day || 0;
        return this.maxNumClickPerDay < maxClickByDay
          ? this.maxNumClickPerDay
          : maxClickByDay;
      }
    }
  },
  watch: {
    viewPerDay(val) {
      if (val !== this.maxViewPerDay) {
        this.innerValue.max_view_per_day = val;
      }

      if (this.pricingMode === "cpm") {
        this.clickPerDay = val;
      }
    },
    view(val) {
      if (val !== this.maxView) {
        this.innerValue.max_view = val;
      }

      if (this.pricingMode === "cpm") {
        this.click = val;
      }
    },
    maxViewPerDay(val) {
      if (val !== this.viewPerDay) {
        this.viewPerDay = val;
      }
    },
    maxView(val) {
      if (val !== this.view) {
        this.view = val;
      }
    },
    clickPerDay(val) {
      if (val !== this.maxClickPerDay) {
        this.innerValue.max_click_per_day = val;
      }

      if (this.pricingMode === "cpc") {
        this.viewPerDay = val;
      }
    },
    click(val) {
      if (val !== this.maxClick) {
        this.innerValue.max_click = val;
      }

      if (this.pricingMode === "cpc") {
        this.view = val;
      }
    },
    maxClickPerDay(val) {
      if (val !== this.clickPerDay) {
        this.clickPerDay = val;
      }
    },
    maxClick(val) {
      if (val !== this.click) {
        this.click = val;
      }
    }
  },
  created() {
    if (
      this.innerValue.event_trackings &&
      (this.innerValue.event_trackings.length || false)
    ) {
      this.isTracking = true;
    }
  },
  mounted() {
    this.reloadDataCampaign();
  },
  methods: {
    async reloadDataCampaign() {
      const campaignId = this.innerValue?.campaign?.id;
      if (campaignId) {
        const res = await this.$campaignRepository.getDetail(campaignId);

        if (res.code === CODE_SUCCESS && res.data) {
          this.innerValue.campaign = res.data;
        }
      }
    },
    addIp() {
      if (!this.innerValue.event_trackings) {
        this.$set(this.innerValue, "event_trackings", []);
      }
      this.innerValue.event_trackings.push({
        id: "",
        name: "",
        pivot: {
          value: 1
        }
      });
      this.$forceUpdate();
    },
    ipRemove(index) {
      this.innerValue.event_trackings.splice(index, 1);
      this.$forceUpdate();
    }
  }
});

export default StepAddBudgetBanner;
export type StepAddBudgetBannerRef = InstanceType<typeof StepAddBudgetBanner>;
</script>
