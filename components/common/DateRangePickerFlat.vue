<template>
  <v-menu
    v-model="menu"
    v-bind="$attrs"
    :close-on-content-click="false"
    :nudge-right="40"
    offset-overflow
    transition="scale-transition"
    content-class="hidden-overflow"
    offset-y
    min-width="auto"
    max-width="100%"
  >
    <template #activator="{ on, attrs }">
      <validation-provider
        v-slot="{ errors, valid }"
        :name="label"
        :rules="rules"
        :vid="vid || $attrs.name"
      >
        <slot
          v-if="$scopedSlots.value"
          :label="label"
          :value="dateShow"
          :open="openMenu"
          name="value"
          @close="closeMenu"
        >
        </slot>

        <v-text-field
          v-if="!$scopedSlots.value"
          :value="dateShow"
          :label="label"
          :error-messages="errors"
          :clearable="clearable"
          :append-outer-icon="appendOuterIcon"
          v-bind="$attrs"
          readonly
          @click:clear="
            date = [];
            dateShow = '';
          "
          @click:append-outer="menu = true"
          v-on="on"
        >
          <template v-if="required" #label>
            {{ $attrs.label || label }} <span class="red--text"> (*) </span>
          </template>
        </v-text-field>
      </validation-provider>
    </template>
    <v-row class="ma-0 pa-0">
      <flat-pickr
        :value="date"
        v-bind="$attrs"
        :config="config"
        style="border-radius: 0"
        class="hide-input hide-border"
        color="primary"
        @on-change="onChange"
      />
      <slot
        v-if="$scopedSlots.alias"
        :open="openMenu"
        name="alias"
        @close="closeMenu"
      >
      </slot>
      <v-list v-if="!$scopedSlots.alias" dense>
        <v-list-item
          v-for="(value, index) of rangeAliasesShow"
          :key="`${$attrs}-${index}`"
          @click="selectAlias(value)"
        >
          <v-list-item-content>
            {{ value.label }}
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-row>
  </v-menu>
</template>
<script lang="ts">
// @ts-ignore
import moment from 'moment/src/moment';
import { Vietnamese } from "@/constants/locale/flatpickrvn";
import Vue, { VueConstructor } from "vue";
import { DATE_RANGE_FUTURE } from "~/constants/dataSelect";
import { convertPeriodTimeToArray } from "~/util/time";
import { isArray, isEmpty } from "~/util/typeof";
import { DATE } from "~/constants/format";

interface ComponentData {
  menu: boolean;
  date: Array<object>;
  dateShow: string;
}

interface ComponentMethods {
  updateDateToProps(dateNew: object): void;

  closeMenu(): void;

  openMenu(): void;

  convertSelectDate(val: Array<object>): Array<object>;

  updateValueToShow(val: Array<object>): void;

  selectAlias(alias: Array<object>): void;

  onChange(val: Array<object>): void;
}

const DateRangePickerFlat = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DateRangePickerFlat",
  props: {
    label: {
      type: String,
      default: "Khoảng ngày"
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    autoHide: {
      type: Boolean,
      default: false
    },

    required: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    configProps: {
      type: Object,
      default: () => ({})
    },
    rangeAliases: {
      type: Array,
      default: () => DATE_RANGE_FUTURE
    },
    modelFormat: {
      type: String,
      default: undefined
    },
    appendOuterIcon: {
      type: String,
      default: "mdi-calendar"
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    menu: false,
    date: [],
    dateShow: null
  }),
  computed: {
    config() {
      return {
        mode: "range",
        inline: true,
        locale: Vietnamese,
        dateFormat: "d/m/Y",
        ...this.configProps
      };
    },
    rangeAliasesShow() {
      const { maxDate, minDate } = this.configProps || {};
      let rangeAliases = this.rangeAliases || [];
      if (minDate) {
        rangeAliases = rangeAliases.filter(rangeAlias => {
          const [start, end] = rangeAlias.getDateRange();
          return (
            moment(start)
              .toDate()
              .getTime() >=
              moment(minDate)
                .toDate()
                .getTime() &&
            moment(end)
              .toDate()
              .getTime() >
              moment(minDate)
                .toDate()
                .getTime()
          );
        });
      }

      if (maxDate) {
        rangeAliases = rangeAliases.filter(rangeAlias => {
          const [start, end] = rangeAlias.getDateRange();
          return (
            moment(start)
              .toDate()
              .getTime() <
              moment(maxDate)
                .toDate()
                .getTime() &&
            moment(end)
              .toDate()
              .getTime() <=
              moment(maxDate)
                .toDate()
                .getTime()
          );
        });
      }

      return rangeAliases;
    }
  },
  watch: {
    date(val) {
      if (
        this.$filters.dateRange(val) !== this.$filters.dateRange(this.value)
      ) {
        this.updateDateToProps(val);
      }
      if (this.autoHide) {
        const [dateFrom, dateTo] = this.date || [];
        if (dateFrom && dateTo) {
          this.closeMenu();
        }
      }
      this.dateShow = this.$filters.dateRange(val);
    },
    value(val) {
      if (this.$filters.dateRange(val) !== this.$filters.dateRange(this.date)) {
        if (isArray(val) && val.length === 2) {
          this.updateValueToShow(val);
        } else {
          this.date = null;
        }
      }
    },
    menu(val) {
      if (!val) {
        this.date = convertPeriodTimeToArray(this.date);
        this.updateDateToProps(this.date);
      }
    }
  },
  mounted() {
    if (isArray(this.value) && this.value.length === 2) {
      this.updateValueToShow(this.value);
    }
    if (this.$attrs.autofocus !== undefined && this.$attrs.autofocus !== null) {
      setTimeout(() => {
        this.menu = true;
      }, 300);
    }
  },
  methods: {
    updateDateToProps(dateNew) {
      if (this.modelFormat) {
        if (isArray(dateNew)) {
          const [dateFrom, dateTo] = dateNew;
          if (dateFrom && dateTo) {
            this.$emit("input", [
              moment(new Date(dateFrom))
                .startOf("day")
                .format(this.modelFormat),
              moment(new Date(dateTo))
                .endOf("day")
                .format(this.modelFormat)
            ]);
          } else if (!dateFrom && !dateTo) {
            this.$emit("input", [null, null]);
          }
        } else {
          this.$emit("input", [
            moment(this.$filters.startOfDay(dateNew)).format(this.modelFormat),
            moment(this.$filters.endOfDay(dateNew)).format(this.modelFormat)
          ]);
        }
      } else {
        this.$emit("input", dateNew);
      }
    },
    closeMenu() {
      this.menu = false;
    },
    openMenu() {
      this.menu = true;
    },
    convertSelectDate(val) {
      if (!isEmpty(val)) {
        const [start, end] = val;
        if (start && end) {
          return [this.$filters.startOfDay(start), this.$filters.endOfDay(end)];
        } else if (start) {
          return [this.$filters.startOfDay(start)];
        }
      }
    },
    updateValueToShow(val) {
      // eslint-disable-next-line prefer-const
      let [startDate, endDate] = val;
      let newDate = [];
      if (startDate) {
        newDate = [this.$filters.startOfDay(startDate)];

        startDate = moment(startDate)
          .format(DATE)
          .toString();
      }

      if (endDate) {
        if (startDate) {
          newDate.push(this.$filters.endOfDay(endDate));
        } else {
          newDate = [
            this.$filters.startOfDay(endDate),
            this.$filters.endOfDay(endDate)
          ];
        }
      }
      this.dateShow = this.$filters.dateRange(val);
      this.date = newDate;
    },
    selectAlias(alias) {
      const { maxDate, minDate } = this.configProps || {};
      let [start, end] = alias.getDateRange();
      if (
        minDate &&
        moment(start)
          .toDate()
          .getTime() <
          moment(minDate)
            .toDate()
            .getTime()
      ) {
        start = moment(minDate).toDate();
      }

      if (
        maxDate &&
        moment(end)
          .toDate()
          .getTime() >
          moment(maxDate)
            .toDate()
            .getTime()
      ) {
        end = moment(maxDate).toDate();
      }
      const dateRange = this.convertSelectDate([start, end]);

      this.date = dateRange;
      this.dateShow = this.$filters.dateRange(dateRange);
    },
    onChange(val, _, instance) {
      const newDate = this.convertSelectDate(val);
      if (
        this.$filters.dateRange(newDate) !==
          this.$filters.dateRange(this.date) &&
        newDate
      ) {
        instance.element.value = this.$filters.dateRange(val);
        this.dateShow = this.$filters.dateRange(val);
        this.date = newDate;
      }
    }
  }
});

export default DateRangePickerFlat;
export type DateRangePickerFlatRef = InstanceType<typeof DateRangePickerFlat>;
</script>
