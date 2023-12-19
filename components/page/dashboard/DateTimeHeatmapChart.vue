<template>
  <heatmap-combo-chart
    v-bind="$attrs"
    :criteria="headers"
    :categories="categories"
    :filter="params"
    :map-function="mapFunction"
    :url="resource"
    title="Thống kê theo ngày giờ"
  />
</template>

<script lang="ts">
import HeatmapComboChart from "@/components/chart/common/HeatmapComboChart.vue";
import { ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";

interface categoryItemInterface {
  text: string;
  full_text: string;
  value: string;
}

interface categoriesInterface {
  text: string;
  value: string;
  categories: Array<categoryItemInterface>;
}

interface ComponentData {
  $authHasRole(role: string | Array<string>): boolean;
  categories: categoriesInterface;
  mapFunction(data: Array<object>): Array<Array<number>>;
}

interface ComponentMethods {}

const DateTimeHeatmapChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DateTimeHeatmapChart",
  components: { HeatmapComboChart },
  props: {
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      categories: [
        {
          text: "Ngày",
          value: "day_of_week",
          categories: [
            {
              text: "T7",
              full_text: "Thứ Bảy",
              value: "Sat"
            },
            {
              text: "T6",
              full_text: "Thứ Sáu",
              value: "Fri"
            },
            {
              text: "T5",
              full_text: "Thứ Năm",
              value: "Thu"
            },
            {
              text: "T4",
              full_text: "Thứ Tư",
              value: "Wed"
            },
            {
              text: "T3",
              full_text: "Thứ Ba",
              value: "Tue"
            },
            {
              text: "T2",
              full_text: "Thứ Hai",
              value: "Mon"
            },
            {
              text: "CN",
              full_text: "Chủ nhật",
              value: "Sun"
            }
          ]
        },
        {
          text: "Giờ",
          value: "hour",
          categories: [
            {
              text: "0",
              full_text: "00:00 - 00:59",
              value: "0"
            },
            {
              text: "1",
              full_text: "01:00 - 01:59",
              value: "1"
            },
            {
              text: "2",
              full_text: "02:00 - 02:59",
              value: "2"
            },
            {
              text: "3",
              full_text: "03:00 - 03:59",
              value: "3"
            },
            {
              text: "4",
              full_text: "04:00 - 04:59",
              value: "4"
            },
            {
              text: "5",
              full_text: "05:00 - 05:59",
              value: "5"
            },
            {
              text: "6",
              full_text: "06:00 - 06:59",
              value: "6"
            },
            {
              text: "7",
              full_text: "07:00 - 07:59",
              value: "7"
            },
            {
              text: "8",
              full_text: "08:00 - 08:59",
              value: "8"
            },
            {
              text: "9",
              full_text: "09:00 - 09:59",
              value: "9"
            },
            {
              text: "10",
              full_text: "10:00 - 10:59",
              value: "10"
            },
            {
              text: "11",
              full_text: "11:00 - 11:59",
              value: "11"
            },
            {
              text: "12",
              full_text: "12:00 - 12:59",
              value: "12"
            },
            {
              text: "13",
              full_text: "13:00 - 13:59",
              value: "13"
            },
            {
              text: "14",
              full_text: "14:00 - 14:59",
              value: "14"
            },
            {
              text: "15",
              full_text: "15:00 - 15:59",
              value: "15"
            },
            {
              text: "16",
              full_text: "16:00 - 16:59",
              value: "16"
            },
            {
              text: "17",
              full_text: "17:00 - 17:59",
              value: "17"
            },
            {
              text: "18",
              full_text: "18:00 - 18:59",
              value: "18"
            },
            {
              text: "19",
              full_text: "19:00 - 19:59",
              value: "19"
            },
            {
              text: "20",
              full_text: "20:00 - 20:59",
              value: "20"
            },
            {
              text: "21",
              full_text: "21:00 - 21:59",
              value: "21"
            },
            {
              text: "22",
              full_text: "22:00 - 22:59",
              value: "22"
            },
            {
              text: "23",
              full_text: "23:00 - 23:59",
              value: "23"
            }
          ]
        }
      ],
      mapFunction: data => {
        const keys = Object.keys(data[0]);
        return data.map(e => [
          e[keys[1]],
          e[keys[2]],
          parseInt(e[keys[3]], 10)
        ]);
      }
    };
  },
  computed: {
    params() {
      return {
        ...this.filter,
        interval: "hours"
      };
    },
    resource() {
      return this.$authHasRole(ROLE_ADVERTISER)
        ? "/statistic/advertiser/campaign"
        : "/statistic/campaign";
    },
    headers() {
      return this.$authHasRole(ROLE_ADVERTISER)
        ? [
            {
              text: "Lượt click",
              value: "num_click"
            },
            {
              text: "Lượt impression",
              value: "num_view"
            }
          ]
        : [
            {
              text: "Lượt click",
              value: "num_click"
            },
            {
              text: "Lượt impression",
              value: "num_view"
            },
            {
              text: "Chi phí",
              value: "total_money"
            }
          ];
    }
  }
});

export default DateTimeHeatmapChart;
export type DateTimeHeatmapChartRef = InstanceType<typeof DateTimeHeatmapChart>;
</script>
