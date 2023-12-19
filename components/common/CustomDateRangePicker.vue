<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    offset-overflow
    min-width="290px"
  >
    <template #activator="{ on, attrs }">
      <validation-provider
        v-slot="{ errors, valid }"
        :name="label"
        :rules="rules"
        :vid="vid || $attrs.name"
      >
        <v-text-field
          :value="displayRange"
          :label="label"
          :error-messages="errors"
          prepend-icon="mdi-calendar"
          readonly
          clearable
          v-bind="$attrs"
          @click:clear="date = null"
          v-on="on"
        >
          <template v-if="required" #label>
            {{ $attrs.label || label }} <span class="red--text"> (*) </span>
          </template>
        </v-text-field>
      </validation-provider>
    </template>
    <v-row class="mx-0">
      <v-date-picker
        v-model="date"
        landscape
        color="primary"
        no-title
        locale="vi"
        range
        @input="closeMenu"
      >
      </v-date-picker>
      <v-list dense>
        <v-list-item
          v-for="(value, index) of rangeAliases"
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
import Vue, { VueConstructor } from "vue";
import dateWrapper from "~/mixins/dateWrapper";

interface ComponentData {
  menu: boolean;
}

interface ComponentMethods {
  closeMenu(): void;
  selectAlias(val: object): void;
}

const CustomDateRangePicker = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  mixins: [dateWrapper],
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
    required: {
      type: Boolean,
      default: false
    },
    rangeAliases: {
      type: Array,
      default: () => [
        {
          label: "Tuần trước",
          getDateRange: () => [
            moment()
              .subtract(1, "weeks")
              .startOf("isoWeek")
              .format("YYYY/MM/DD"),
            moment()
              .subtract(1, "weeks")
              .endOf("isoWeek")
              .format("YYYY/MM/DD")
          ]
        },
        {
          label: "Tháng trước",
          getDateRange: () => [
            moment()
              .subtract(1, "months")
              .startOf("month")
              .format("YYYY/MM/DD"),
            moment()
              .subtract(1, "months")
              .endOf("month")
              .format("YYYY/MM/DD")
          ]
        },
        {
          label: "7 ngày qua",
          getDateRange: () => [
            moment()
              .subtract(8, "days")
              .format("YYYY/MM/DD"),
            moment()
              .subtract(1, "days")
              .format("YYYY/MM/DD")
          ]
        },
        {
          label: "30 ngày qua",
          getDateRange: () => [
            moment()
              .subtract(31, "days")
              .format("YYYY/MM/DD"),
            moment()
              .subtract(1, "days")
              .format("YYYY/MM/DD")
          ]
        }
      ]
    }
  },

  data: () => ({
    menu: false
  }),

  computed: {
    displayRange() {
      if (Array.isArray(this.date)) {
        const [dateFrom, dateTo] = this.date.slice().sort();
        if (dateFrom && dateTo) {
          return `${this.formatDate(dateFrom)} - ${this.formatDate(dateTo)}`;
        }
      }
      return "";
    }
  },

  methods: {
    closeMenu() {
      const [dateFrom, dateTo] = this.date;
      if (dateFrom && dateTo) {
        this.menu = false;
      }
    },
    selectAlias(alias) {
      this.date = alias.getDateRange();
      this.menu = false;
    }
  }
});

export default CustomDateRangePicker;
export type CustomDateRangePickerRef = InstanceType<
  typeof CustomDateRangePicker
>;
</script>
