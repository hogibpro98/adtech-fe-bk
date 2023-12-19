<template>
  <v-card
    tile
    class="py-2 d-flex align-items-center justify-content-space-between z-15"
  >
    <div class="text-h6 pl-6">
      {{ title }}
    </div>
    <div class="d-flex align-items-end mr-10">
      <div :id="`date-picker-${id}`" class="pointer">
        <date-range-picker-flat
          v-model="innerValue"
          :range-aliases="rangeAliases"
          :config-props="{
            maxDate,
            minDate
          }"
          :attach="`#date-picker-${id}`"
          auto-hide
          model-format="YYYY-MM-DD"
          left
          origin="top right"
          z-index="22"
        >
          <template slot="value" slot-scope="{ value, open, close }">
            <div class="d-flex align-items-baseline" @click="open()">
              <span class="mr-2 text-caption">
                Tùy chỉnh
              </span>
              <div v-if="value" class="input-label">
                {{ value }}
                <v-icon class="transform-translate-y--1">
                  arrow_drop_down
                </v-icon>
              </div>
              <div v-else class="place-holder input-label pb-2">
                Chọn ngày
              </div>
            </div>
          </template>
        </date-range-picker-flat>
      </div>
      <div class="mb-1 ml-2">
        <v-btn :disabled="isDisablePrevTime" icon small @click="prevTime">
          <v-icon>navigate_before</v-icon>
        </v-btn>
        <v-btn :disabled="isDisableNextTime" icon small @click="nextTime">
          <v-icon>navigate_next</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>
<script lang="ts">
import DateRangePickerFlat from "@/components/common/DateRangePickerFlat";
import { isEqual } from "lodash";
import { numDayRange, addDay } from "@/util/time";
// @ts-ignore
import moment from 'moment/src/moment';
import shortid from "shortid";
import { DATE_RANGE_FUTURE } from "@/constants/dataSelect";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  id: string;
  innerValue: Array<string>;
}

interface ComponentMethods {
  validateInnerValueByMinMaxDate(minDate: object, maxDate: object): void;
  dateIsValid(date: object): void;
  nextTime(): void;
  prevTime(): void;
}

const HeaderSelectTime = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "HeaderSelectTime",
  components: {
    DateRangePickerFlat
  },
  props: {
    title: {
      type: String,
      default: ""
    },
    min: {
      type: [Number, String, Date],
      default: null
    },
    max: {
      type: [Number, String, Date],
      default: null
    },
    value: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      id: shortid.generate(),
      innerValue: []
    };
  },
  computed: {
    minDate() {
      const minDate = this.min;
      if (minDate) {
        return moment(minDate)
          .startOf("day")
          .toDate()
          .getTime();
      }
      return null;
    },
    maxDate() {
      const maxDate = this.max || Date.now();
      if (maxDate) {
        return moment(maxDate)
          .endOf("day")
          .toDate()
          .getTime();
      }
      return null;
    },
    isDisableNextTime() {
      // eslint-disable-next-line no-unused-vars
      const [, to] = this.innerValue || [];
      return numDayRange(to, this.maxDate) < 2;
    },
    isDisablePrevTime() {
      // eslint-disable-next-line no-unused-vars
      const [from] = this.innerValue || [];

      if (!from || !this.minDate) {
        return false;
      }

      return numDayRange(this.minDate, from) < 2;
    },
    numDayRange() {
      const [from, to] = this.innerValue || [];
      return numDayRange(from, to);
    },
    rangeAliases() {
      return DATE_RANGE_FUTURE;
    }
  },
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      if (
        !isEqual(
          this.$filters.dateRange(newVal),
          this.$filters.dateRange(this.value)
        )
      ) {
        this.$emit("input", this.$filters.sqlDate(newVal));
      }
    },
    // Handles external model changes.
    value(newVal) {
      if (
        !isEqual(
          this.$filters.dateRange(newVal),
          this.$filters.dateRange(this.innerValue)
        )
      ) {
        this.innerValue = newVal;
      }
      if (newVal === [] || newVal === null) {
        this.innerValue = this.$filters.sqlDate([
          Date.now() - 6 * 24 * 3600 * 1000,
          Date.now()
        ]);
      }
    }
    // minDate(val) {
    //   this.validateInnerValueByMinMaxDate(val, this.maxDate);
    // },
    // maxDate(val) {
    //   this.validateInnerValueByMinMaxDate(this.minDate, val);
    // }
  },
  created() {
    this.innerValue = this.$filters.sqlDate([
      Date.now() - 6 * 24 * 3600 * 1000,
      Date.now()
    ]);
  },
  mounted() {
    this.validateInnerValueByMinMaxDate(this.minDate, this.maxDate);
  },
  methods: {
    validateInnerValueByMinMaxDate(minDate, maxDate) {
      const [start, end] = this.innerValue || [];
      let newStart = start;
      let newEnd = end;
      if (!this.dateIsValid(start)) {
        newStart = this.$filters.sqlDate(minDate);
      }
      if (!this.dateIsValid(end)) {
        newEnd = this.$filters.sqlDate(maxDate);
      }

      if (
        !isEqual(
          this.$filters.dateRange([newStart, newEnd]),
          this.$filters.dateRange(this.innerValue)
        )
      ) {
        this.innerValue = [
          this.$filters.dateObj(newStart),
          this.$filters.dateObj(newEnd)
        ];
      }
    },
    dateIsValid(date) {
      return (
        date &&
        (!this.minDate || numDayRange(this.minDate, date) > 0) &&
        (!this.maxDate || numDayRange(date, this.maxDate) > 0)
      );
    },
    nextTime() {
      const [from, to] = this.innerValue || [];
      if (from && to) {
        const newFrom = addDay(to, 1);
        const newTo = addDay(newFrom, this.numDayRange - 1);
        this.innerValue = [newFrom, newTo];
      }
    },
    prevTime() {
      const [from, to] = this.innerValue || [];
      if (from && to) {
        const newTo = addDay(from, -1);
        const newFrom = addDay(newTo, -(this.numDayRange - 1));
        this.innerValue = [newFrom, newTo];
      }
    }
  }
});

export default HeaderSelectTime;
export type HeaderSelectTimeRef = InstanceType<typeof HeaderSelectTime>;
</script>
