<template>
  <display-card
    v-intersect.once="{
      handler: handleInView,
      options: {
        threshold: [0.8]
      }
    }"
    :title="title"
    :redirect="redirect"
    :loading="loadingProps || loadingData"
    :url="resourceUrl"
    :params="params"
  >
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
    <!--    <v-row slot="top-right" class="pa-3">-->
    <!--      <v-select-->
    <!--        v-if="hasResource"-->
    <!--        v-model="selectedResource"-->
    <!--        :items="resources"-->
    <!--        class="attribute-select"-->
    <!--        label="Dịch vụ"-->
    <!--        hide-details-->
    <!--        return-object-->
    <!--        style="width: 160px"-->
    <!--        dense-->
    <!--      ></v-select>-->
    <!--      <v-select-->
    <!--        v-model="selectedAttribute"-->
    <!--        :items="attributes"-->
    <!--        class="attribute-select pl-2"-->
    <!--        label="Tiêu chí"-->
    <!--        hide-details-->
    <!--        return-object-->
    <!--        style="width: 160px"-->
    <!--        dense-->
    <!--      ></v-select>-->
    <!--    </v-row>-->
    <div v-if="loadingData || series.length > 0" class="display-card__content">
      <client-only>
        <e-chart :path-option="computeChartOption" width="100%" height="320px">
        </e-chart>
      </client-only>
    </div>
    <div
      v-else
      class="d-flex justify-content-center align-center display-card__content"
    >
      <span>Chưa có dữ liệu.</span>
    </div>
  </display-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { cloneDeep, debounce, find, uniq } from "lodash";
import concat from "lodash/concat";
import { colorPalette } from "@/constants/color";
import DisplayCard from "@/components/common/DisplayCard.vue";
import { isEqualDeep } from "@/helpers/ultis";
import { getMax } from "@/util/array.ts";
import { ca } from "cronstrue/dist/i18n/locales/ca";
import displayCard from "~/mixins/displayCard";

interface CRITERIA {
  value: string | number;
  text: string;
}

interface ComponentData {
  defaultOptions: Array<Array<string | number | object>>;
  data: Array<object>;
  colorPalette: Array<string>;
  currAttribute: Array<string>;
  loadingData: boolean;
  categories: Array<string>;
  categoryMap: Array<object>;
  series: Array<any>;

  debounceFetchData(): void;
}

interface ComponentMethods {
  fetchData(): void;
}

const TYPE_MAP = {
  bar: "fa fa-square",
  area: "fa fa-minus",
  line: "fa fa-minus"
};

const DualCompareChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DualCompareChart",
  components: { DisplayCard },
  mixins: [displayCard],
  props: {
    timeRange: {
      type: Array,
      default: () => []
    },
    filter: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      default: ""
    },
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
    lazy: {
      type: Boolean,
      default: false
    },
    loadingProps: {
      type: Boolean,
      default: false
    },
    attributes: {
      type: Array,
      default: () => []
    },
    categoryMap: {
      type: Array,
      default: () => []
    },
    objectMap: {
      type: Array,
      default: () => []
    },
    chartType: {
      type: String,
      default: "bar"
    },
    sortFunction: {
      type: Function,
      default: undefined
    },
    currAttribute: {
      type: Object,
      default: () => {}
    },
    currObjects: {
      type: Array,
      default: () => []
    },
    resourceUrl: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      defaultOptions: [
        ["series", []],
        ["legend.show", true],
        ["legend.tooltip.show", true],
        ["legend.orient", "horizontal"],
        ["legend.left", 80],
        ["legend.textStyle.width", 120],
        // ["legend.top", "center"],
        ["legend.textStyle.overflow", "truncate"],
        ["tooltip.trigger", "axis"],
        [
          "axisPointer",
          {
            link: [{ xAxisIndex: [0, 1] }]
          }
        ],
        [
          "grid",
          [
            {
              left: 100,
              right: 100,
              height: "30%"
            },
            {
              left: 100,
              right: 100,
              top: "55%",
              height: "30%"
            }
          ]
        ]
        // ["color", this.chartColor]
      ],
      data: {},
      inView: false,
      colorPalette,
      loadingData: false,
      categories: [],
      series: [],
      objects: [],
      debounceFetchData: null
    };
  },
  computed: {
    maxValue() {
      let dataSet = [];
      this.series.forEach(e => {
        dataSet = concat(
          dataSet,
          e.data.map(e => e.value)
        );
      });
      if (dataSet.length > 0) {
        const max = getMax(dataSet);
        return Math.ceil((max * 1.2) / 5) * 5;
      }
      return 25;
    },
    computeChartOption() {
      const options = cloneDeep(this.defaultOptions);
      options.push([
        "xAxis",
        [
          {
            type: "category",
            axisLine: { onZero: true },
            data: this.categories,
            axisLabel: {
              formatter: params => {
                return this.getCategoryProp(params);
              }
            }
          },
          {
            gridIndex: 1,
            type: "category",
            axisLine: { onZero: true },
            axisLabel: {
              show: false
            },
            data: this.categories
          }
        ]
      ]);
      options.push([
        "yAxis",
        [
          {
            // name: this.currObjects[0] || "",
            type: "value",
            max: this.maxValue
          },
          {
            gridIndex: 1,
            // name: this.currObjects[1] || "",
            type: "value",
            inverse: true,
            max: this.maxValue
          }
        ]
      ]);
      options.push([
        "tooltip.formatter",
        params => {
          let html = "";
          html += `<div>`;
          html += `<b style="font-size:14px;">${this.getCategoryProp(
            params[0].name,
            "fullText"
          )}</b> <br/>`;
          params.forEach(e => {
            html += `<div class="d-flex justify-content-space-between align-center">`;
            html += `<span><i
                  aria-hidden="true"
                  class="v-icon notranslate fa ${
                    TYPE_MAP[e.seriesType]
                  } theme--light"
                  style="font-size: 16px; color: ${e.color}">
                  </i> ${this.getObjectProp(e.seriesName)}</span>`;

            html += `<span style="padding-left:32px">${this.$filters.numberSpace(
              e.data.number
            )} (${this.$filters.numberSpace(e.data.value)}%)</span>`;
            html += `</div>`;
          });
          html += `</div>`;
          return html;
        }
      ]);
      options.push([
        "legend.formatter",
        params => {
          return this.getObjectProp(params);
        }
      ]);
      options.push([
        "legend.tooltip.formatter",
        ({ name }) => {
          const displayName = this.getObjectProp(name);
          const total =
            this.data?.total[name] &&
            this.data.total[name][this.currAttribute.value];
          return `${displayName}: ${total}`;
        }
      ]);
      return options;
    },
    params() {
      return {
        time_range: this.timeRange,
        ...this.filter
      };
    }
  },
  watch: {
    params: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.debounceFetchData();
        }
      },
      deep: true
    },
    currAttribute() {
      this.mapData();
    },
    currObjects() {
      this.mapData();
    }
  },
  created() {
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 400);
  },

  methods: {
    getCategoryProp(value, prop = "text") {
      const category = this.categoryMap.find(e => e.value === value);
      if (!category) {
        return value;
      } else {
        return category[prop] || value;
      }
    },
    getObjectProp(value, prop = "text") {
      const object = this.objectMap.find(e => e.value === value);
      if (!object) {
        return value;
      } else {
        return object[prop] || value;
      }
    },
    async fetchData() {
      if (!(this.lazy && !this.inView)) {
        this.loadingData = true;
        try {
          const res = await this.$axios.$post(this.resourceUrl, this.params);
          this.data = res.data;
          await this.$nextTick();
          this.mapData();
        } catch (e) {
          this.series = [];
        }
        // this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
        this.loadingData = false;
      }
    },
    async mapData() {
      const dataSeries = this.data.series;
      const total = this.data.total;
      const series = [];
      const categories = [];
      const objects = [];
      // if (dataSeries && dataSeries.length > 0) {
      Object.keys(dataSeries).forEach(name => {
        objects.push(this.getObjectProp(name));
        Object.keys(dataSeries[name]).forEach(category => {
          categories.push(category);
        });
      });
      this.objects = objects;
      this.categories = uniq(categories).sort(this.sortFunction);
      Object.keys(dataSeries)
        .filter(name => {
          return this.currObjects.includes(name);
        })
        .forEach((name, index) => {
          series.push({
            name,
            type: this.chartType,
            barWidth: "50%",
            xAxisIndex: index,
            label: {
              show: true,
              position: index % 2 === 0 ? "top" : "bottom",
              formatter(params) {
                return `${params.data.value}%`;
              }
            },
            yAxisIndex: index,
            data: this.categories.map(e => {
              // console.log(name, e, dataSeries[name][e]);
              const dataValue = dataSeries[name][e]
                ? dataSeries[name][e][this.currAttribute.value]
                : 0;
              return {
                number: dataValue,
                value: this.$filters.percent(
                  dataValue / total[name][this.currAttribute.value]
                )
              };
            })
          });
        });
      this.series = series;
      await this.$nextTick();
      this.$set(this.defaultOptions, 0, ["series", series]);
      // }
      // this.defaultOptions.push(["series", series]);
    }
  }
});

export default DualCompareChart;
export type DualCompareChartRef = InstanceType<typeof DualCompareChart>;
</script>

<style>
.display-card__content {
  height: 320px;
}
</style>
