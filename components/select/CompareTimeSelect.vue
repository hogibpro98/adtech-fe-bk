<template>
  <v-select
    v-model="innerValue"
    v-bind="$attrs"
    :items="items"
    return-object
    v-on="$listeners"
  ></v-select>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import moment from 'moment/src/moment';
import wrapper from "~/mixins/wrapper";
import { FALSE, TRUE } from "~/constants/code";
import { SelectDataInterface } from "~/interface/components/select";
import { SQL_DATE } from "~/constants/format";

const CompareTimeSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "CompareTimeSelect",
  mixins: [wrapper],
  data() {
    return {};
  },
  computed: {
    items() {
      return [
        {
          value: "yesterday",
          text: "Hôm qua và cùng ngày tuần trước",
          params: {
            before: moment()
              .subtract(8, "days")
              .format(SQL_DATE),
            after: moment()
              .subtract(1, "days")
              .format(SQL_DATE),
            duration: 1,
            interval: "days"
          }
        },
        {
          value: "last-7",
          text: "7 ngày qua và 7 ngày trước đó",
          params: {
            before: moment()
              .subtract(8, "days")
              .format(SQL_DATE),
            after: moment()
              .subtract(1, "days")
              .format(SQL_DATE),
            duration: 7,
            interval: "days"
          }
        },
        {
          value: "last-28",
          text: "28 ngày qua và 28 ngày trước đó",
          params: {
            before: moment()
              .subtract(29, "days")
              .format(SQL_DATE),
            after: moment()
              .subtract(1, "days")
              .format(SQL_DATE),
            duration: 28,
            interval: "days"
          }
        },
        {
          value: "last-3-months",
          text: "3 tháng qua và 3 tháng trước đó",
          params: {
            before: moment()
              .subtract(91, "days")
              .format(SQL_DATE),
            after: moment()
              .subtract(1, "days")
              .format(SQL_DATE),
            duration: 90,
            interval: "days"
          }
        }
      ];
    }
  },
  created() {
    if (!this.innerValue) {
      this.innerValue = this.items[0];
    }
  }
});

export default CompareTimeSelect;
export type CompareTimeSelectRef = InstanceType<typeof CompareTimeSelect>;
</script>
