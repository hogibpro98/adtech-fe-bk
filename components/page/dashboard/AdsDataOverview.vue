<template>
  <overview-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    :resource="resource"
    :filter="filter"
    :time-range="timeRange"
    title="Danh sách top tài trợ data"
    title-col="name"
    redirect="/manage-ads/data"
  >
    <template slot="item.total_data" slot-scope="{ item }">
      {{ item.total_data | numberSpace }}MB
    </template>
  </overview-table>
</template>

<script lang="ts">
import OverviewTable from "@/components/table/OverviewTable.vue";
import { ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import GlobalDataInterface from "~/interface/data/global";
import { DATA_SPONSOR } from "~/constants/resource";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const AdsDataOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdsDataOverview",
  components: { OverviewTable },
  props: {
    filter: {
      type: Object,
      default: () => {}
    },
    timeRange: {
      type: Array,
      default: () => []
    },
    hideHeaders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {};
  },
  computed: {
    headers() {
      return [
        {
          text: "Tổng tiền đã tiêu",
          value: "amount_money",
          align: "right",
          width: 144,
          formatter: item => {
            return this.$filters?.currency(item.amount_money) || "-";
          }
        },
        {
          text: "Tổng data đã gửi",
          value: "amount_capacity",
          align: "right",
          width: 200,
          formatter: item => {
            return this.$filters?.numberSpace(item.amount_capacity) + "MB";
          }
        },
        {
          text: "Tổng số thuê bao đã gửi",
          value: "num_sent",
          align: "right",
          width: 144
        },
        {
          text: "Ngân sách dự kiến",
          value: "budget",
          align: "right",
          width: 200,
          formatter: item => {
            return this.$filters?.currency(item.budget) || "-";
          }
        },
        {
          text: "Chi phí tạm tính",
          value: "total_price",
          align: "right",
          width: 160,
          formatter: item => {
            return this.$filters?.currency(item.total_price) || "-";
          }
        },
        {
          text: "Tổng số thuê bao sẽ gửi",
          value: "total_rows",
          align: "right",
          width: 144
        },
        {
          text: "Tổng data sẽ gửi",
          value: "total_data",
          align: "right",
          width: 200,
          formatter: item => {
            return this.$filters?.numberSpace(item.total_data) + "MB";
          }
        },
      ];
    },
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders.includes(e.value);
      });
    },
    resource() {
      return DATA_SPONSOR;
    }
  }
});

export default AdsDataOverview;
export type AdsDataOverviewRef = InstanceType<typeof AdsDataOverview>;
</script>
