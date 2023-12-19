<template>
  <v-row class="no-margin">
    <v-overlay v-if="loading" absolute color="#fff" class="z-10">
      <v-progress-circular :width="4" :size="25" indeterminate color="primary">
      </v-progress-circular>
    </v-overlay>
    <v-flex xs12>
      <v-radio-group v-model="innerValue.budget_mode">
        <v-radio
          label="Chọn tính số tin nhắn theo ngày"
          class="no-margin z-1"
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
              <v-flex sm4>
                <v-number-field-with-validation
                  v-if="typeBudget === 'limit_by_day'"
                  v-model="innerValue.max_mms_per_day"
                  :loading="loading"
                  :decimal="false"
                  :hint="hintTextPerDayInput"
                  :rules="rulePerDayInput"
                  suffix="Tin nhắn"
                  class="d-flex align-items-center h-100 mt-1"
                  dense
                  name="Số tin nhắn"
                  placeholder="Nhập số tin nhắn"
                  required
                  persistent-hint
                >
                </v-number-field-with-validation>
              </v-flex>
              <v-flex
                sm8
                class="pl-3 mt-2 d-flex flex-column justify-content-center"
              >
                <div class="body-2 px-1">
                  Số tin nhắn tối đa mỗi ngày:
                  <span class="white-space-nowrap">
                    {{ numMMSOfDay | numberSpace }}
                  </span>
                </div>
                <div class="body-2 px-1 py-1">
                  Số tin nhắn tối đa cho quảng cáo:
                  <span class="white-space-nowrap">
                    {{ numMMSTotal | numberSpace }}
                  </span>
                </div>
              </v-flex>
            </v-row>
          </v-card>
        </v-expand-transition>
        <v-radio
          class="no-margin no-padding z-1 mt-2"
          label="Chọn tính tổng số tin nhắn"
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
              <v-flex sm4>
                <v-number-field-with-validation
                  v-if="typeBudget === 'unlimit'"
                  v-model="innerValue.max_mms"
                  :loading="loading"
                  :decimal="false"
                  :hint="hintTextInput"
                  :rules="ruleInput"
                  persistent-hint
                  suffix="Tin nhắn"
                  class="d-flex align-items-center h-100 mt-1"
                  dense
                  name="Số tin nhắn"
                  placeholder="Nhập số tin nhắn"
                  required
                >
                </v-number-field-with-validation>
              </v-flex>
              <v-flex
                sm8
                class="pl-3 mt-2 d-flex flex-column justify-content-center"
              >
                <div class="body-2 px-1">
                  Số tin nhắn tối đa cho quảng cáo:
                  <span class="white-space-nowrap">
                    {{ numMMSTotal | numberSpace }}
                  </span>
                </div>
                <div class="body-2 px-1 py-1">
                  Số tin nhắn trung bình mỗi ngày:
                  <span class="white-space-nowrap">
                    {{ numMMSOfDay | numberSpace }}
                  </span>
                </div>
              </v-flex>
            </v-row>
          </v-card>
        </v-expand-transition>
      </v-radio-group>
    </v-flex>
    <v-flex xs12>
      <v-card-title
        class="text-center pb-0 px-0  label-md text--primary font-16"
      >
        Chi phí quảng cáo ước tính
      </v-card-title>
      <v-radio-group value="mms" class="radio-hidden-icon">
        <v-radio
          class="no-margin z-1 rounded border-2-transparent"
          value="mms"
          active-class="radio-card-active"
        >
          <template slot="label">
            <v-card class="w-full" elevation="1">
              <v-row>
                <v-flex sm11 class="pl-2">
                  <v-card-title class="align-items-end">
                    {{ priceMMS | currency }}/<span
                      class="text-body-2 mb-1 bold"
                      >1 tin nhắn</span
                    >
                    <span class="text-body-2 ml-2 mb-1">
                      Chi phí ước tính mỗi ngày
                      {{ budgetOfDay | currency }}
                    </span>
                  </v-card-title>
                  <v-card-text class="text-subtitle-1 text--primary">
                    Chi phí ước tính cho quảng cáo
                    {{ budget | currency }}
                  </v-card-text>
                </v-flex>
                <v-flex sm1 class="ma-auto">
                  <v-icon color="primary">
                    check
                  </v-icon>
                </v-flex>
              </v-row>
            </v-card>
          </template>
        </v-radio>
      </v-radio-group>
      <v-card-subtitle class="px-0">
        Chi phí ước tính sẽ được lấy theo giá cao nhất giữa đơn giá của tin nhắn
        MMS và đơn giá tin nhắn SMS dự phòng
      </v-card-subtitle>
    </v-flex>
  </v-row>
</template>
<script lang="ts">
import VNumberFieldWithValidation from "@/components/common/VNumberFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import wrapper from "@/mixins/wrapper";
import { flatten } from "lodash";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import { isEmpty } from "~/util/typeof";
import {
  BannerMMSInterface,
  BannerRedirectInterface,
  ConfigMMSInterface
} from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";
import { countDay } from "~/util/time";

interface ComponentData {
  innerValue: BannerRedirectInterface | BannerMMSInterface;
  config: ConfigMMSInterface;
  $adsConfigRepository: RepositoryInterface;
  $systemConfigRepository: RepositoryInterface;
}

interface ComponentMethod {
  getConfig(): void;
  getPriceMms(): void;
  getPriceSms(): void;
}

const StepAddBudgetBannerMMS = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepAddBudgetBannerMMS",
  components: { VNumberFieldWithValidation },
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
      innerValue: {},
      price: null,
      priceSms: null,
      config: {},
      loading: false,
      messageRestrictedDay: []
    };
  },
  computed: {
    maxMMSPerDayByConfig() {
      if (!isEmpty(this.config.max_mms_per_day)) {
        return this.config.max_mms_per_day;
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
    hintTextInput() {
      if (!this.priceMMS) {
        return "";
      }

      return `Tối đa ${this.$filters.spaceNumber(
        this.maxNumMMSTotal
      )} tin nhắn cho quảng cáo`;
    },
    ruleInput() {
      if (!this.priceMMS) {
        return "required|numeric|min_value:1";
      }

      return `required|numeric|min_value:1|max_value:${this.maxNumMMSTotal}`;
    },
    hintTextPerDayInput() {
      if (!this.priceMMS) {
        return "";
      }

      return `Tối đa ${this.$filters.spaceNumber(
        this.maxNumMMSPerDay
      )} tin nhắn mỗi ngày`;
    },
    rulePerDayInput() {
      if (!this.priceMMS) {
        return "required|numeric|min_value:1";
      }

      return `required|numeric|min_value:1|max_value:${this.maxNumMMSPerDay}`;
    },
    typeBudget() {
      return this.innerValue?.budget_mode;
    },

    priceMMS() {
      const priceMMS = this.price;
      return this.priceSms && priceMMS < this.priceSms
        ? this.priceSms
        : priceMMS;
    },

    budgetCampaign() {
      return this.innerValue?.campaign?.remain_budget_create_ads || 0;
    },
    maxNumMMSOfCampaign() {
      if (this.priceMMS) {
        return Math.floor(this.budgetCampaign / this.priceMMS);
      }

      return 99999999999999;
    },
    maxNumMMSPerDayOfCampaign() {
      if (this.priceMMS) {
        if (this.numDayBanner) {
          return Math.floor(this.maxNumMMSOfCampaign / this.numDayBanner);
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
          if (this.typeBudget === "unlimit") {
            return this.maxNumMMSOfCampaign;
          }
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
    numDayBanner() {
      const {
        start_time: startTime,
        end_time: endTime,
        schedule
      } = this.innerValue;
      return countDay(schedule, startTime, endTime, this.messageRestrictedDay);
    },
    budget() {
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
    numMMSOfDay() {
      let numMMSOfDay = null;
      if (this.typeBudget === "unlimit") {
        numMMSOfDay = Math.floor(this.innerValue.max_mms / this.numDayBanner);
      } else {
        numMMSOfDay = this.innerValue.max_mms_per_day;
      }
      return numMMSOfDay > this.maxNumMMSPerDay
        ? this.maxNumMMSPerDay
        : numMMSOfDay;
    },
    numMMSTotal() {
      let numMMSTotal = 0;
      if (this.typeBudget === "unlimit") {
        numMMSTotal = this.innerValue.max_mms;
      } else {
        const numTotalPerDay = this.innerValue.max_mms_per_day;
        numMMSTotal = numTotalPerDay * this.numDayBanner;
      }
      return numMMSTotal > this.maxNumMMSTotal
        ? this.maxNumMMSTotal
        : numMMSTotal;
    }
  },
  async created() {
    this.getSystenConfig();
    this.getConfig();
    await this.getPriceMms();
    if (this.innerValue?.backup_sms?.cat_id) {
      await this.getPriceSms();
    }
  },
  methods: {
    async getSystenConfig() {
      const datas = {};
      try {
        const systemConfig = await this.$systemConfigRepository.all();
        if (systemConfig.code === CODE_SUCCESS) {
          systemConfig.data.forEach(e => {
            datas[e.name] = e.value;
          });
          this.messageRestrictedDay = datas.message_restricted_day || [];
        } else {
          this.$toast.global.server_error_msg(systemConfig.message);
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

    async getPriceMms() {
      this.loading = true;
      const { data } = await this.$priceServiceRepository.post("get-price", {
        user_id:
          this.innerValue?.campaign?.advertiser_id ||
          this.innerValue?.campaign?.agency_id,
        cat_id: this.innerValue?.cat_id,
        service: "mms"
      });
      // if (data !== null) {
      this.price = data;
      this.innerValue.price = data;
      // }
      this.loading = false;
    },
    async getPriceSms() {
      this.loading = true;
      const { data } = await this.$priceServiceRepository.post("get-price", {
        user_id:
          this.innerValue?.campaign?.advertiser_id ||
          this.innerValue?.campaign?.agency_id,
        cat_id: this.innerValue?.backup_sms?.cat_id,
        service: "sms"
      });
      if (data !== null) {
        this.priceSms = data;
        this.innerValue.price = data;
      }
      this.loading = false;
    }
  }
});

export default StepAddBudgetBannerMMS;
export type StepAddBudgetBannerMMSRef = InstanceType<
  typeof StepAddBudgetBannerMMS
>;
</script>
