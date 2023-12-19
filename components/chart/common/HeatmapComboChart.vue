<template>
  <display-card
    :title="title"
    :redirect="redirect"
    :loading="loadingProps || loadingData"
    :params="params"
  >
    <v-select
      slot="top-right"
      v-model="criteriaSelected"
      :items="criteria"
      class="select-input"
      label="Tiêu chí"
      hide-details
      return-object
      style="width: 160px"
      dense
    ></v-select>
    <template v-if="sourceData.length > 0">
      <v-tabs v-model="tab" fixed-tabs>
        <v-tabs-slider />
        <v-tab
          v-for="(item, index) in computedCategories"
          :key="`tab-${index}`"
          class="uppercase"
          active-class="primary--text"
        >
          {{ item.text }}
        </v-tab>
      </v-tabs>
      <div
        class="d-flex justify-content-center align-center"
        style="height: 280px;"
      >
        <client-only>
          <e-chart
            ref="chart"
            :path-option="computeChartOption"
            :width="chartWidth"
            :height="chartHeight"
          >
          </e-chart>
        </client-only>
      </div>
    </template>
    <div
      v-else
      class="d-flex justify-content-center align-center display-card__content"
    >
      {{ loadingData ? "Đang tải dữ liệu" : "Chưa có dữ liệu" }}
    </div>
  </display-card>
</template>

<script lang="ts">
import DisplayCard from "@/components/common/DisplayCard.vue";
import { cloneDeep, debounce } from "lodash";
import { getPropsMax } from "@/util/array";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";

const colorRange = ["#ffffff", "#3F81F3"];

interface CRITERIA {
  value: string | number;
  text: string;
}

interface ComponentData extends GlobalDataInterface {
  tab: number;
  criteriaSelected: CRITERIA;
  loadingData: boolean;
  sourceData: Array<Array<string | number | object>>;
  data: Array<object>;
  chartWidth: string;
  chartHeight: string;
  defaultOptions: Array<Array<string | number | object>>;
}

interface ComponentMethods {
  mapData(tab: string): void;
  convertCategory(e: CRITERIA, mapObj: object): object;
  debounceFetchData(): void;
  fetchData(): void;
  resizeChart(): void;
}

const HeatmapComboChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "HeatmapComboChart",
  components: { DisplayCard },
  props: {
    height: {
      type: Number,
      default: 400
    },
    title: {
      type: String,
      required: true
    },
    redirect: {
      type: String,
      default: null
    },
    filter: {
      type: Object,
      default: () => ({})
    },
    categories: {
      type: Array,
      default: () => []
    },
    criteria: {
      type: Array,
      default: () => []
    },
    timeRange: {
      type: Array,
      default: () => []
    },
    loadingProps: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ""
    },
    mapFunction: {
      type: Function,
      default: data => data
    }
  },
  data() {
    return {
      tab: null,
      criteriaSelected: null,
      loadingData: false,
      sourceData: [],
      data: [],
      chartWidth: "100%",
      chartHeight: "280px",
      defaultOptions: [
        ["dataset.source", this.data],
        ["legend.show", false],
        ["tooltip.position", "bottom"],
        ["grid.bottom", 16],
        ["grid.left", 16],
        ["grid.right", 16]
      ],
      debounceFetchData: null
    };
  },
  computed: {
    computedCategories() {
      const [y, x] = this.categories;
      if (this.categories.length === 2 && x && y) {
        return [
          y,
          {
            text: `${y.text} và ${x.text}`,
            value: `${y.value}_${x.value}`
          },
          x
        ];
      }
      return this.categories;
    },
    computeChartOption() {
      const options = cloneDeep(this.defaultOptions);
      options.push(["series[0].name", this.criteriaSelected.text]);
      options.push([
        "tooltip.formatter",
        params => {
          let value = params.value.value || 0;
          let name = params.value.full_name;
          if (this.tab === 1) {
            value = params.value[2] || 0;
            name = `${
              this.categories[0].categories[params.value[1]].full_text
            }, ${this.categories[1].categories[params.value[0]].full_text}`;
          }

          const percent = this.$filters.percent(value / this.totalValue);
          return `
                  <b style="font-size:14px;">${name}</b> <br/>
                  <span style="font-size:12px;">${params.seriesName}</span><br/>
                  <div class="d-flex justify-content-start align-center">
                    <i
                    aria-hidden="true"
                    class="v-icon notranslate fa fa-square theme--light"
                    style="font-size: 14px;color: ${params.color}">
                    </i>
                    <span style="font-size:24px;margin-left: 12px;font-weight: 500">${this.$filters.numberSpace(
                      value
                    )}</span>
                  </div>
                  <span style="font-size:12px">(${percent}% tổng số ${
            params.seriesName
          })</span>
              `;
        }
      ]);

      switch (this.tab) {
        case 1:
          options.push(["series[0].type", "heatmap"]);
          options.push(["xAxis.type", "category"]);
          options.push(["yAxis[0].type", "category"]);
          options.push([
            "yAxis[0].data",
            this.categories[0].categories.map(e => e.text)
          ]);
          options.push([
            "xAxis.data",
            this.categories[1].categories.map(e => e.text)
          ]);
          options.push(["xAxis.axisLabel.show", true]);
          options.push(["xAxis.axisTick.alignWithLabel", false]);
          options.push([
            "visualMap",
            {
              min: 0,
              max: this.maxValue,
              show: false,
              inRange: {
                color: colorRange
              }
            }
          ]);
          options.push([
            "series[0].emphasis",
            {
              itemStyle: {
                shadowBlur: 5,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          ]);

          break;
        case 0:
          options.push(["dataset.dimensions", ["name", "value"]]);
          options.push(["series[0].type", "bar"]);
          options.push(["series[0].barWidth", "100%"]);
          options.push(["xAxis.show", false]);
          options.push(["yAxis[0].type", "category"]);
          options.push([
            "yAxis[0].data",
            this.categories[0].categories.map(e => e.text)
          ]);
          options.push(["yAxis[0].show", true]);
          options.push(["yAxis[0].nameTextStyle.color", "transparent"]);
          options.push(["yAxis[0].axisLine", {}]);
          options.push(["xAxis.type", "value"]);
          break;
        case 2:
          options.push(["dataset.dimensions", ["name", "value"]]);
          options.push(["series[0].type", "bar"]);
          options.push(["series[0].barWidth", "100%"]);
          options.push(["xAxis.type", "category"]);
          options.push(["xAxis.show", true]);
          options.push(["xAxis.axisLabel.show", true]);
          options.push(["xAxis.axisTick.alignWithLabel", false]);
          options.push(["xAxis.axisTick.show", false]);
          options.push([
            "xAxis.data",
            this.categories[1].categories.map(e => e.text)
          ]);
          options.push(["yAxis[0].type", "value"]);
          break;
      }
      return options;
    },
    params() {
      return {
        ...this.filter,
        time_range: this.timeRange,
        attribute: [
          ...this.categories.map(e => e.value),
          this.criteriaSelected?.value
        ]
      };
    },
    xMap() {
      const xMap = {};
      this.categories[1].categories.forEach((e, i) => {
        xMap[e.value] = i;
      });
      return xMap;
    },
    yMap() {
      const yMap = {};
      this.categories[0].categories.forEach((e, i) => {
        yMap[e.value] = i;
      });
      return yMap;
    },
    maxValue() {
      return getPropsMax(this.sourceData.map(e => e[2]));
    },
    totalValue() {
      return this.sourceData.map(e => e[2]).reduce((total, e) => total + e);
    }
  },
  watch: {
    tab() {
      this.data = this.mapData(this.tab);
      this.$set(this.defaultOptions, 0, ["dataset.source", this.data]);
    },
    params: {
      handler() {
        this.debounceFetchData();
      },
      deep: true
    }
  },
  created() {
    this.criteriaSelected = this.criteria[0];
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 400);
  },
  methods: {
    mapData(tab) {
      let mapObj = {};
      switch (tab) {
        case 0:
          mapObj = {};
          this.sourceData.forEach(e => {
            const [y, , val] = e;
            mapObj[y] = mapObj[y] ? mapObj[y] + val : val;
          });
          return this.categories[0].categories.map(e =>
            this.convertCategory(e, mapObj)
          );

        case 1:
          return this.sourceData.map(e => {
            const [y, x, val] = e;
            return [this.xMap[x], this.yMap[y], val];
          });
        case 2:
          mapObj = {};
          this.sourceData.forEach(e => {
            const [, x, val] = e;
            mapObj[x] = mapObj[x] ? mapObj[x] + val : val;
          });
          return this.categories[1].categories.map(e =>
            this.convertCategory(e, mapObj)
          );
        default:
          return [];
      }
    },
    convertCategory(e, mapObj) {
      return {
        value: mapObj[e.value] || 0,
        name: e.text,
        full_name: e.full_text
      };
    },
    async fetchData() {
      this.loadingData = true;
      try {
        const res = await this.$axios.$post(this.url, this.params);
        this.sourceData = this.mapFunction(res.data);
        this.data = this.mapData(this.tab);
        this.$set(this.defaultOptions, 0, ["dataset.source", this.data]);
        await this.$nextTick();
        this.loadingData = false;
        await this.$nextTick();
        this.resizeChart();
      } catch (e) {
        this.loadingData = false;
        this.sourceData = [];
      }
    },
    resizeChart() {
      if (this.$refs.chart) {
        let width = this.$refs.chart.chartInstance.getWidth();
        const offsetLeft = this.$refs.chart.chartInstance.convertToPixel(
          { xAxisIndex: 0 },
          0
        );
        const xAxisLength = Math.floor(width - offsetLeft - 32);

        let pointLength = Math.ceil(
          xAxisLength / this.categories[1].categories.length
        );
        let height = pointLength * this.categories[0].categories.length + 96;
        if (height > 280) {
          height = 280;
          pointLength = (height - 96) / this.categories[0].categories.length;
          width =
            pointLength * this.categories[1].categories.length +
            offsetLeft +
            32;
        }
        this.chartWidth = `${width}px`;
        this.chartHeight = `${height}px`;
      }
    }
  }
});

export default HeatmapComboChart;
export type HeatmapComboChartRef = InstanceType<typeof HeatmapComboChart>;
</script>
