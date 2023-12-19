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
    <v-select
      slot="top-right"
      v-model="selectedResource"
      label="Dịch vụ"
      class="select-input"
      :items="resources"
      hide-details
      return-object
      dense
    ></v-select>
    <div v-if="loadingData || data.length > 0" class="display-card__content">
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
import { cloneDeep, debounce } from "lodash";
import { colorPalette } from "@/constants/color";
import DisplayCard from "@/components/common/DisplayCard.vue";
import { isEqualDeep } from "@/helpers/ultis";
import displayCard from "~/mixins/displayCard";

interface RESOURCE {
  value: string | number;
  text: string;
  url: string;
  redirect: string;
}

interface ComponentData {
  defaultOptions: Array<Array<string | number | object>>;
  data: Array<object>;
  colorPalette: Array<string>;
  selectedCategories: Array<string>;
  loadingData: boolean;
  selectedResource: RESOURCE;
  resources: Array<RESOURCE>;
  debounceFetchData(): void;
}

interface ComponentMethods {
  fetchData(): void;
}

const MultiplePieChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "MultiplePieChart",
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

    loadingProps: {
      type: Boolean,
      default: false
    },
    itemText: {
      type: String,
      default: "name"
    },
    itemValue: {
      type: String,
      default: "value"
    }
  },
  data() {
    return {
      defaultOption: [
        ["dataset.source", this.data],
        ["series[0].type", "pie"],
        ["series[0].center", ["30%", "50%"]],
        ["series[0].radius", "80%"],
        ["legend.show", true],
        ["legend.tooltip.show", true],
        ["legend.orient", "vertical"],
        ["legend.right", 2],
        ["legend.textStyle.width", 120],
        ["legend.top", "center"],
        ["legend.textStyle.overflow", "truncate"],
        ["xAxis.show", false],
        [
          "series[0].label",
          {
            normal: {
              show: true,
              formatter(params) {
                return `${params.percent}%`;
              },
              position: "outer"
              // textStyle: {
              //   color: "#fff",
              //   fontSize: 14
              // }
            }
          }
        ],
        [
          "series[0].labelLine",
          {
            show: true,
            length: 8,
            length2: 8
          }
        ]

        // ["color", this.chartColor]
      ],
      data: [],
      inView: false,
      colorPalette,
      selectedCategories: [],
      loadingData: false
    };
  },
  computed: {
    computeChartOption() {
      const options = cloneDeep(this.defaultOption);
      options.push(["series[0].name", this.title]);
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
    }
  },

  methods: {
    async fetchData() {
      if (!(this.lazy && !this.inView)) {
        this.loadingData = true;
        const res = await this.$axios.$post(this.resourceUrl, this.params);
        this.data = res.data.map(e => {
          return {
            text: e[this.itemText],
            value: e[this.itemValue]
          };
        });
        console.log("data", this.data);
        this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
        this.loadingData = false;
      }
    }
  }
});

export default MultiplePieChart;
export type MultiplePieChartRef = InstanceType<typeof MultiplePieChart>;
</script>

<style>
.display-card__content {
  height: 320px;
}
</style>
