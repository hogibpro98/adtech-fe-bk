<template>
  <dual-compare-chart
    v-bind="$attrs"
    title="Thống kê theo độ tuổi và giới tính"
    lazy
    :attributes="attributes"
    :url="resourceUrl"
    :selected-resources="resources"
    chart-type="bar"
    :object-map="objectMap"
    :curr-attribute="selectedAttribute"
    :curr-objects="selectedObjects"
    :category-map="categoryMap"
    @updated-resource="setSelectedResource"
    v-on="$listeners"
  >
    <v-row slot="top-right" class="pt-4">
      <v-select
        v-model="selectedResource"
        :items="resources"
        class="attribute-select select-input"
        label="Dịch vụ"
        hide-details
        return-object
        dense
      ></v-select>
      <v-select
        v-model="selectedAttribute"
        :items="attributes"
        class="attribute-select pl-2"
        label="Tiêu chí"
        hide-details
        return-object
        style="width: 160px"
        dense
      ></v-select>
      <v-select
        v-model="selectedObjects"
        :items="objectMap"
        class="pl-2"
        hide-details
        multiple
        label="Giới tính"
        style="width: 200px"
        dense
        @change="handleChangeObjects"
      ></v-select>
    </v-row>
  </dual-compare-chart>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import DualCompareChart from "~/components/chart/common/DualCompareChart.vue";

interface ComponentData extends GlobalDataInterface {
  agency: number;
  advertiser: number;
  inspector: number;
  clicks: number;
  views: number;
  loadingData: boolean;
  params: object;
}

interface ComponentMethods {
  fetchData(): void;
}
const NUM_OBJECTS = 2;

const GenderMmsChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "GenderMmsChart",
  components: {
    DualCompareChart
  },
  data() {
    return {
      selectedResource: "mms",
      hasResource: true,
      selectedObjects: [],
      selectedAttribute: null
    };
  },

  computed: {
    attributes() {
      if (this.selectedResource.value !== "redirect") {
        return [
          {
            text: "Số tin nhắn gửi qua gateway thành công",
            value: "num_success"
          },
          {
            text: "Số tin nhắn gửi qua gateway thất bại",
            value: "num_fail"
          },
          {
            text: "Số tin nhắn gửi qua gateway",
            value: "num_sent"
          },
          {
            text: "Tổng số tiền đã gửi",
            value: "total_money"
          },
          {
            text: "Số tin nhắn đến thiết bị thất bại",
            value: "cdr_num_fail"
          },
          {
            text: "Số tin nhắn đến thiết bị thành công",
            value: "cdr_num_success"
          }
        ];
      } else {
        return [
          {
            text: "Số impression",
            value: "num_view"
          },
          {
            text: "Số click",
            value: "num_click"
          },
          {
            text: "Tổng số tiền đã gửi",
            value: "total_money"
          }
        ];
      }
    },
    resources() {
      return [
        {
          value: "mms",
          text: "MMS",
          url: "/demographic/mms/gender"
        },
        {
          value: "sms",
          text: "SMS",
          url: "/demographic/sms/gender"
        },
        {
          value: "redirect",
          text: "QC Redirect",
          url: "/demographic/redirect/gender"
        },
        {
          value: "message",
          text: "SMS+MMS",
          url: "/demographic/message/gender"
        }
      ];
    },
    resourceUrl() {
      return this.selectedResource?.url ?? "";
    },
    objectMap() {
      return [
        {
          value: "male",
          text: "Nam"
        },
        {
          value: "female",
          text: "Nữ"
        },
        {
          value: "other",
          text: "Khác"
        },
        {
          value: "undefined",
          text: "Không xác định"
        },
      ];
    },
    categoryMap() {
      return [
        {
          value: "18_24",
          text: "18 - 24",
          fullText: "Từ 18 đến 24 tuổi"
        },
        {
          value: "18_24",
          text: "18 - 24",
          fullText: "Từ 18 đến 24 tuổi"
        },
        {
          value: "25_34",
          text: "25 - 34",
          fullText: "Từ 25 đến 34 tuổi"
        },
        {
          value: "35_44",
          text: "35 - 44",
          fullText: "Từ 35 đến 44 tuổi"
        },
        {
          value: "45_54",
          text: "45 - 54",
          fullText: "Từ 45 đến 54 tuổi"
        },
        {
          value: "55_64",
          text: "55 - 64",
          fullText: "Từ 55 đến 64 tuổi"
        },
        {
          value: "65_",
          text: "65+",
          fullText: "Trên 65 tuổi"
        }
      ];
    }
  },
  watch: {
    async selectedResource() {
      await this.initAttribute();
    }
  },
  created() {
    this.selectedResource = this.resources[0] || null;
    this.initAttribute()
    this.selectedObjects = this.objectMap
      .map(obj => obj.value)
      .slice(0, NUM_OBJECTS);
  },

  mounted() {},
  methods: {
    setSelectedResource(){
    },
    async initAttribute() {
      await this.$nextTick();
      this.selectedAttribute = this.attributes[0] || null;
    },
    handleChangeObjects(val) {
      if (val.length > NUM_OBJECTS) {
        this.selectedObjects = val.slice(-NUM_OBJECTS);
      }
    }
  }
});

export default GenderMmsChart;
export type GenderMmsChartRef = InstanceType<typeof GenderMmsChart>;
</script>
<style>
.ministats-wrapper {
  height: 100%;
  padding: 16px;
}
</style>
