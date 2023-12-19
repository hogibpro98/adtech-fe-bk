<template>
  <display-card
      :loading="loading"
      :title="title"
      :redirect="redirect"
      :url="url"
      :params="params"

  >
    <v-select
      slot="top-right"
      v-model="selectedResource"
      label="Dịch vụ"
      :items="statusResources"
      hide-details
      class="select-input"
      style="width: 160px"
      dense
    ></v-select>
    <div
      class="d-flex justify-content-center align-center"
      style="height: 320px;"
    >
      <multi-series-chart
        v-bind="$attrs"
        :time-range="timeRange"
        :loading.sync="loading"
        :categories="categories"
        :url="url"
        height="320px"
        width="100%"
        lazy
      />
    </div>
  </display-card>
</template>

<script lang="ts">
import DisplayCard from "@/components/common/DisplayCard.vue";
import MultiSeriesChart from "@/components/chart/common/MultiSeriesChart.vue";
import { ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import colors from "vuetify/lib/util/colors";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
  selectedResource: string;
  resourcesMap: any;
}

interface ComponentMethods {}

const AdsStatsTimeChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AdsStatsTimeChart",
  components: { MultiSeriesChart, DisplayCard },
  data() {
    return {
      loading: false,
      selectedResource: "mms"
    };
  },
  props: {
    timeRange: {
      type: Array,
      default: null
    },
    filter: {
      type: Object,
      default: null
    }
  },
  computed: {
    params() {
      return {
        time_range: this.timeRange,
        ...this.filter
      }
    },
    title() {
      return (
        this.resourcesMap[this.selectedResource].title ??
        "Thống kê kết quả quảng cáo"
      );
    },
    redirect() {
      return `/manage-ads/list-ads-${this.selectedResource}`;
    },
    resourcesMap() {
      return {
        mms: {
          redirect: "/manage-ads/list-ads-mms",
          title: "Thống kê kết quả gửi tin nhắn MMS",
          categories: [
            {
              value: "num_sent",
              text: "Tổng số tin nhắn đã gửi",
              type: "line",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "num_fail",
              text: "Số tin đã gửi gateway thất bại",
              type: "line",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "num_success",
              text: "Số tin đã gửi gateway thành công",
              type: "line",
              color: colors.green.base,
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "cdr_num_success",
              text: "Số tin gửi đén thiết bị thành công",
              type: "bar",
              color: colors.green.base,
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "cdr_num_fail",
              text: "Số tin gửi đến thiết bị thất bại",
              type: "bar",
              color: colors.red.base,
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            }
          ]
        },
        sms: {
          redirect: "/manage-ads/list-ads-sms",
          title: "Thống kê kết quả gửi tin nhắn SMS",

          categories: [
            {
              value: "num_sent",
              text: "Tổng số tin nhắn đã gửi",
              type: "line",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "num_fail",
              text: "Số tin đã gửi gateway thất bại",
              type: "line",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "num_success",
              text: "Số tin đã gửi gateway thành công",
              type: "line",
              color: colors.green.base,
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "cdr_num_success",
              text: "Số tin gửi đén thiết bị thành công",
              type: "bar",
              color: colors.green.base,
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "cdr_num_fail",
              text: "Số tin gửi đến thiết bị thất bại",
              type: "bar",
              color: colors.red.base,
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            }
          ]
        },
        redirect: {
          redirect: "/manage-ads/list-ads-redirect",
          title: "Thống kê kết quả QC Redirect",
          categories: [
            {
              value: "num_view",
              text: "Lượt impression",
              type: "bar",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "num_click",
              text: "Lượt click",
              type: "bar",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              key: "ctr",
              text: "CTR",
              yIndex: 1,
              value: ["num_click", "num_view"],
              mapFunc: item => {
                if (item.num_view && item.num_click) {
                  return this.$filters.percent(item.num_click / item.num_view);
                }
                return 0;
              },
              formatter: val => {
                return `${val}%`;
              }
            }
          ]
        },
        data: {
          redirect: "/manage-ads/data",
          title: "Thống kê kết quả tài trợ data",
          categories: [
            {
              value: "num_success",
              text: "Số thuê bao gửi thành công",
              type: "line",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "num_fail",
              text: "Số thuê bao gửi thất bại",
              type: "line",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            },
            {
              value: "total_data",
              text: "Tổng số data gửi",
              type: "bar",
              yIndex: 0,
              formatter: val => {
                return this.$filters.numberSpace(val);
              }
            }
          ]
        }
      };
    },
    statusResources() {
      return [
        {
          value: "mms",
          text: "MMS"
        },
        {
          value: "sms",
          text: "SMS"
        },
        {
          value: "redirect",
          text: "QC Redirect"
        },
        {
          value: "data",
          text: "Tài trợ data"
        }
      ];
    },
    url() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return `/statistic/advertiser/ads-${this.selectedResource}`;
      } else {
        return `/statistic/ads-${this.selectedResource}`;
      }
    },
    categories() {
      return this.resourcesMap[this.selectedResource].categories ?? [];
    }
  }
});

export default AdsStatsTimeChart;
export type AdsStatsTimeChartRef = InstanceType<typeof AdsStatsTimeChart>;
</script>
