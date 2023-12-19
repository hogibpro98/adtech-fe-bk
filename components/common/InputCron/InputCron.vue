<template>
  <validation-observer v-slot="{ errors }" ref="observerRef" tag="div">
    <v-tabs v-model="tabModel" class="tabs mb-2">
      <v-tab v-for="item in tabs" :key="item">
        {{ item }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tabModel" class="tab-item">
      <v-tab-item>
        <tab-minute v-model="minuteModel" @input="handleMinute"></tab-minute>
      </v-tab-item>

      <v-tab-item>
        <tab-hour v-model="hourModel" @input="handleTabHour"></tab-hour>
      </v-tab-item>
      <v-tab-item>
        <tab-day v-model="dayModel" @input="handleTabDay"> </tab-day>
      </v-tab-item>
      <v-tab-item>
        <tab-week v-model="weekModel" @input="handleTabWeek">
          >
        </tab-week>
      </v-tab-item>
      <v-tab-item>
        <tab-month v-model="monthModel" @input="handleTabMonth">
          >
        </tab-month>
      </v-tab-item>
      <v-tab-item>
        <tab-advanced
          v-model="advancedModel"
          @input="handleAdvanced"
        ></tab-advanced>
      </v-tab-item>
    </v-tabs-items>

    <div v-if="innerValue" class="mt-2 code-cron">
      <span>{{ showStringCron(Object.values(errors).flat()) }}</span>
      <error-display :errors="Object.values(errors).flat()" />
    </div>
  </validation-observer>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { ValidationObserver } from "vee-validate";
import TabMinute from "~/components/common/InputCron/TabMinute.vue";
import TabHour from "~/components/common/InputCron/TabHour.vue";
import TabDay from "~/components/common/InputCron/TabDay.vue";
import TabWeek from "~/components/common/InputCron/TabWeek.vue";
import TabMonth from "~/components/common/InputCron/TabMonth.vue";
import TabAdvanced from "~/components/common/InputCron/TabAdvanced.vue";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import {
  CRON_UNIT_INDEX,
  CRON_SYMBOL,
  DEFAULT_CODE_CRON
} from "~/constants/cron";

import {
  CronDay,
  CronHour,
  CronMinute,
  CronMonth,
  CronWeek
} from "~/interface/data/inputCron";
import CronMixin from "~/mixins/cron-mixin";
import { translateCron } from "~/util/cron";

const RESET_TIME = "00:00";
const LENGTH_CODE_CRONTAB = 5;

interface ComponentData {
  $refs: {
    observerRef: InstanceType<typeof ValidationObserver>;
  };
  tabModel: number;
  tabs: Array<string>;
  minuteModel: string;
  formatAtTimeOfDayModel: string;
  hourModel: CronHour;
  dayModel: {
    everyDayModel: string;
    atTimeOfDayModel: string;
  };
  weekModel: {
    checkboxDayModels: Array<number>;
    atTimeOfDayModel: string;
  };
  monthModel: {
    atDayModel: string;
    atTimeOfDayModel: string;
    everyMonth: string;
  };
  advancedModel: string;
  isActiveCodeCron: boolean;
}

interface ComponentMethods {
  handleMinute(value: string): void;

  handleTabHour(value: CronHour): void;

  handleTabDay(value: CronDay): void;

  handleTabMonth(value: CronMonth): void;

  handleTabWeek(value: CronWeek): void;

  handleAdvanced(value: string): void;

  showError(arr: Array<string>): string;

  showStringCron(arr: Array<string>): string;

  formatTimeOfDay(value: string): string;

  filterNumber(arr: Array<string>): Array<string>;

  filterChildNumber(value: string): string;

  filterNumberCron(): Array<string>;

  getNumberCron(value: number): string;
}

interface ComponentComputed {}

interface ComponentProps {
  codeCron: string;
}

export default (Vue as VueConstructor<
  Vue &
    InstanceType<typeof CronMixin> &
    ComponentData &
    ComponentComputed &
    ComponentMethods &
    ComponentProps
>).extend({
  name: "InputCron",
  components: {
    ValidationObserver,
    TabMinute,
    TabHour,
    TabDay,
    TabWeek,
    TabMonth,
    TabAdvanced,
    ErrorDisplay
  },
  mixins: [CronMixin],
  props: {
    codeCron: {
      type: String,
      default: ""
    },
    value: {
      type: String
    }
  },

  data() {
    return {
      tabModel: 0,
      indexTab: 0,
      tabs: ["Phút", "Giờ", "Ngày", "Tuần", "Tháng", "Nâng cao"],
      minuteModel: "1",
      formatAtTimeOfDayModel: "",
      hourModel: {
        everyHourModel: "1",
        atMinuteOfHourModel: "0"
      },
      dayModel: {
        everyDayModel: "1",
        atTimeOfDayModel: RESET_TIME
      },
      weekModel: {
        checkboxDayModels: [1],
        atTimeOfDayModel: RESET_TIME
      },
      monthModel: {
        atDayModel: "1",
        atTimeOfDayModel: RESET_TIME,
        everyMonth: "1"
      },
      advancedModel: "",
      isActiveCodeCron: false,
      isActiveAdvanced: false
    };
  },
  computed: {},
  watch: {
    tabModel(newValue, oldValue) {
      this.isActiveAdvanced = false;
      if (this.isActiveCodeCron || oldValue === this.indexTab) {
        this.resetUnitCron();

        switch (newValue) {
          case CRON_UNIT_INDEX.MINUTE:
            this.minuteModel = "1";
            this.innerValue = DEFAULT_CODE_CRON.MINUTE;
            break;
          case CRON_UNIT_INDEX.HOUR:
            this.hourModel = {
              everyHourModel: "1",
              atMinuteOfHourModel: "0"
            };
            this.innerValue = DEFAULT_CODE_CRON.HOUR;
            break;
          case CRON_UNIT_INDEX.DAY_OF_MONTH:
            this.dayModel = {
              everyDayModel: "1",
              atTimeOfDayModel: RESET_TIME
            };
            this.innerValue = DEFAULT_CODE_CRON.DAY_OF_MONTH;
            break;
          case CRON_UNIT_INDEX.MONTH:
            this.weekModel = {
              checkboxDayModels: [1],
              atTimeOfDayModel: RESET_TIME
            };
            this.innerValue = DEFAULT_CODE_CRON.DAY_OF_WEEK;
            break;
          case CRON_UNIT_INDEX.DAY_OF_WEEK:
            this.monthModel = {
              atDayModel: "1",
              atTimeOfDayModel: RESET_TIME,
              everyMonth: "1"
            };
            this.innerValue = DEFAULT_CODE_CRON.MONTH;
            break;
          case CRON_UNIT_INDEX.ADVANCED:
            this.isActiveAdvanced = true;
            this.advancedModel = DEFAULT_CODE_CRON.ADVANCED;
            this.innerValue = DEFAULT_CODE_CRON.ADVANCED;
            break;
        }
      }
      this.isActiveCodeCron = true;
    },
    value: {
      handler(value) {
        if (!this.isActiveAdvanced) {
          this.isActiveCodeCron = false;
          if (this.value?.includes(CRON_SYMBOL.RANGE)) {
            this.indexTab = CRON_UNIT_INDEX.ADVANCED;
            this.tabModel = CRON_UNIT_INDEX.ADVANCED;
            this.advancedModel = this.innerValue;
          } else {
            const crons = this.value?.trim().split(/\s+/);
            if (crons?.length === LENGTH_CODE_CRONTAB) {
              if (this.isTabMinute(crons)) {
                this.indexTab = CRON_UNIT_INDEX.MINUTE;
                this.tabModel = CRON_UNIT_INDEX.MINUTE;
                this.minuteModel = this.getNumberCron(CRON_UNIT_INDEX.MINUTE);
              } else if (this.isTabHour(crons)) {
                this.indexTab = CRON_UNIT_INDEX.HOUR;
                this.tabModel = CRON_UNIT_INDEX.HOUR;
                this.hourModel = {
                  everyHourModel: this.getNumberCron(CRON_UNIT_INDEX.HOUR),
                  atMinuteOfHourModel: this.getNumberCron(
                    CRON_UNIT_INDEX.MINUTE
                  )
                };
              } else if (this.isTabDay(crons)) {
                this.indexTab = CRON_UNIT_INDEX.DAY_OF_MONTH;
                this.tabModel = CRON_UNIT_INDEX.DAY_OF_MONTH;
                this.dayModel = {
                  everyDayModel: this.getNumberCron(
                    CRON_UNIT_INDEX.DAY_OF_MONTH
                  ),
                  atTimeOfDayModel:
                    this.getNumberCron(CRON_UNIT_INDEX.HOUR) +
                    ":" +
                    this.getNumberCron(CRON_UNIT_INDEX.MINUTE)
                };
              } else if (this.isTabWeek(crons)) {
                this.indexTab = CRON_UNIT_INDEX.MONTH;
                this.tabModel = CRON_UNIT_INDEX.MONTH;
                const nums = this.value.trim().split(" ");
                this.weekModel = {
                  checkboxDayModels: nums[nums.length - 1]
                    .split(",")
                    .map(i => Number(i)),
                  atTimeOfDayModel:
                    nums[CRON_UNIT_INDEX.HOUR] +
                    ":" +
                    nums[CRON_UNIT_INDEX.MINUTE]
                };
              } else if (this.isTabMonth(crons)) {
                this.indexTab = CRON_UNIT_INDEX.DAY_OF_WEEK;
                this.tabModel = CRON_UNIT_INDEX.DAY_OF_WEEK;
                this.monthModel = {
                  atDayModel: this.getNumberCron(CRON_UNIT_INDEX.DAY_OF_MONTH),
                  atTimeOfDayModel:
                    this.getNumberCron(CRON_UNIT_INDEX.HOUR) +
                    ":" +
                    this.getNumberCron(CRON_UNIT_INDEX.MINUTE),
                  everyMonth: this.getNumberCron(CRON_UNIT_INDEX.MONTH)
                };
              } else {
                this.indexTab = CRON_UNIT_INDEX.ADVANCED;
                this.tabModel = CRON_UNIT_INDEX.ADVANCED;
                this.advancedModel = this.innerValue;
              }
            }
          }
        }
      },
      immediate: true
    }
  },

  methods: {
    resetUnitCron() {
      this.minuteModel = "1";
      this.hourModel = {
        everyHourModel: "1",
        atMinuteOfHourModel: "0"
      };
      this.dayModel = {
        everyDayModel: "1",
        atTimeOfDayModel: RESET_TIME
      };
      this.weekModel = {
        checkboxDayModels: [1],
        atTimeOfDayModel: RESET_TIME
      };
      this.monthModel = {
        atDayModel: "1",
        atTimeOfDayModel: RESET_TIME,
        everyMonth: "1"
      };
      this.advancedModel = `* * * * *`;
    },
    handleMinute(value: string) {
      if (this.tabModel === CRON_UNIT_INDEX.MINUTE) {
        this.innerValue = `*/${value} * * * *`;
      }
    },
    handleTabHour(value: CronHour) {
      if (this.tabModel === CRON_UNIT_INDEX.HOUR) {
        this.innerValue = `${value.atMinuteOfHourModel} */${value.everyHourModel} * * *`;
      }
    },
    handleTabDay(value: CronDay) {
      if (this.tabModel === CRON_UNIT_INDEX.DAY_OF_MONTH)
        this.innerValue = `${this.formatTimeOfDay(value.atTimeOfDayModel)}*/${
          value.everyDayModel
        } * *`;
    },
    handleTabWeek(value: CronWeek) {
      if (this.tabModel === CRON_UNIT_INDEX.MONTH) {
        const temporary: Array<number> = [];
        Object.assign(temporary, value.checkboxDayModels);
        this.innerValue = `${this.formatTimeOfDay(
          value.atTimeOfDayModel
        )}* * ${temporary.sort().join(",")}`;
      }
    },
    handleTabMonth(value: CronMonth) {
      if (this.tabModel === CRON_UNIT_INDEX.DAY_OF_WEEK) {
        this.innerValue = `${this.formatTimeOfDay(value.atTimeOfDayModel)}${
          value.atDayModel
        } */${value.everyMonth} *`;
      }
    },
    handleAdvanced(value: string) {
      if (this.tabModel === CRON_UNIT_INDEX.ADVANCED) {
        this.innerValue = value;
      }
    },
    showError(arr: Array<string>) {
      if (arr && arr.length > 0) {
        return arr[0];
      }
    },
    showStringCron(arr: Array<string>) {
      if (arr.length === 0 && this.innerValue) {
        if (translateCron(this.innerValue)) {
          return this.innerValue;
        }
      }
    },

    formatTimeOfDay(value: string) {
      this.formatAtTimeOfDayModel = "";
      let temporary: string | Array<string> = value;
      temporary = value?.split(":")?.reverse();

      for (let i = 0; i < temporary?.length; i++) {
        if (temporary[i][0] === "0" && temporary[i][1]) {
          temporary[i] = temporary[i][1];
        }
      }
      for (let i = 0; i < temporary?.length; i++) {
        this.formatAtTimeOfDayModel += temporary[i] + " ";
      }
      return this.formatAtTimeOfDayModel;
    },
    filterNumber(arr: Array<string>) {
      return arr.filter(x => x !== CRON_SYMBOL.ANY_VALUE);
    },
    filterChildNumber(str: string) {
      const matches = str.match(/(\d+)/);
      if (matches) {
        return matches[0];
      }
    },
    filterNumberCron() {
      if (this.value) {
        const crons: Array<string> = this.value.trim().split(/\s+/);
        const nums: any = [];
        for (let i = 0; i < crons.length; i++) {
          if (
            crons[i] !== CRON_SYMBOL.ANY_VALUE &&
            this.filterChildNumber(this.filterNumber(crons)[i])
          ) {
            nums.push(this.filterChildNumber(this.filterNumber(crons)[i]));
          }
        }
        return nums;
      }
      return [];
    },
    getNumberCron(number: number) {
      if (this.filterNumberCron()[number]) {
        return this.filterNumberCron()[number];
      }
      return "";
    },
    isTabMinute(crons: Array<string>) {
      if (
        crons[CRON_UNIT_INDEX.MINUTE].includes(CRON_SYMBOL.STEP) &&
        crons[CRON_UNIT_INDEX.HOUR] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.DAY_OF_MONTH] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.MONTH] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.DAY_OF_WEEK] === CRON_SYMBOL.ANY_VALUE
      ) {
        return true;
      }

      return false;
    },
    isTabHour(crons: Array<string>) {
      if (
        !isNaN(Number(crons[CRON_UNIT_INDEX.MINUTE])) &&
        crons[CRON_UNIT_INDEX.HOUR].includes(CRON_SYMBOL.STEP) &&
        crons[CRON_UNIT_INDEX.DAY_OF_MONTH] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.MONTH] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.DAY_OF_WEEK] === CRON_SYMBOL.ANY_VALUE
      )
        return true;
      return false;
    },
    isTabDay(crons: Array<string>) {
      if (
        !isNaN(Number(crons[CRON_UNIT_INDEX.MINUTE])) &&
        !isNaN(Number(crons[CRON_UNIT_INDEX.HOUR])) &&
        crons[CRON_UNIT_INDEX.DAY_OF_MONTH].includes(CRON_SYMBOL.STEP) &&
        crons[CRON_UNIT_INDEX.MONTH] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.DAY_OF_WEEK] === CRON_SYMBOL.ANY_VALUE
      )
        return true;
      return false;
    },

    isTabWeek(crons: Array<string>) {
      if (
        !isNaN(Number(crons[CRON_UNIT_INDEX.MINUTE])) &&
        !isNaN(Number(crons[CRON_UNIT_INDEX.HOUR])) &&
        crons[CRON_UNIT_INDEX.DAY_OF_MONTH] === CRON_SYMBOL.ANY_VALUE &&
        crons[CRON_UNIT_INDEX.MONTH] === CRON_SYMBOL.ANY_VALUE &&
        this.isDayInWeek(crons[CRON_UNIT_INDEX.DAY_OF_WEEK])
      )
        return true;

      return false;
    },
    isTabMonth(crons: Array<string>) {
      if (
        !isNaN(Number(crons[CRON_UNIT_INDEX.MINUTE])) &&
        !isNaN(Number(crons[CRON_UNIT_INDEX.HOUR])) &&
        !isNaN(Number(crons[CRON_UNIT_INDEX.DAY_OF_MONTH])) &&
        crons[CRON_UNIT_INDEX.MONTH].includes(CRON_SYMBOL.STEP) &&
        crons[CRON_UNIT_INDEX.DAY_OF_WEEK] === CRON_SYMBOL.ANY_VALUE
      )
        return true;
      return false;
    },
    isDayInWeek(str: string) {
      const nums = str.split(",");
      for (let i = 0; i < nums.length; i++) {
        if (Number(nums[i]) > 6 || isNaN(Number(nums[i]))) {
          return false;
        }
      }
      return true;
    }
  }
});
</script>

<style>
.code-cron {
  background-color: #ffffff;
  height: 20px;
}

.error-message {
  color: red;
}
</style>
