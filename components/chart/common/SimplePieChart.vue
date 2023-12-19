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
    :time-range="timeRange"
    :url="url"
    :filter="filter"
    :params="params"
  >
    <div v-if="loadingData || data.length > 0" class="display-card__content">
      <client-only>
        <e-chart :path-option="computeChartOption" width="100 %" height="320px">
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

interface CRITERIA {
  value: string | number;
  text: string;
}

interface ComponentData {
  defaultOptions: Array<Array<string | number | object>>;
  data: Array<object>;
  colorPalette: Array<string>;
  selectedCategories: Array<string>;
  loadingData: boolean;
  criteriaSelected: CRITERIA;
  debounceFetchData(): void;
}

interface ComponentMethods {
  fetchData(): void;
}

const SimplePieChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SimplePieChart",
  components: { DisplayCard },
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
        ["legend.right", 4],
        ["legend.textStyle.width", 100],
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
      loadingData: false,
      criteriaSelected: {},
      debounceFetchData: null
    };
  },
  computed: {
    computeChartHeight() {
      if (window.outerWidth <= 430) {
        return "170px";
      }
      return "320px";
    },
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
    computeChartHeight(val) {
      console.log(val);
    },
    params: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.debounceFetchData();
        }
      },
      deep: true
    },
    inView(val) {
      if (val) {
        this.debounceFetchData();
      }
    }
  },
  created() {
    console.log(window.innerWidth);
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 400);
  },
  mounted() {
    this.debounceFetchData();
  },
  methods: {
    handleInView(entries) {
      if (entries[0].isIntersecting && this.lazy) {
        this.inView = true;
      }
    },
    async fetchData() {
      if (!(this.lazy && !this.inView)) {
        this.loadingData = true;
        const res = await this.$axios.$post(this.url, this.params);
        this.data = res.data;
        this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
        this.loadingData = false;
      }
    }
  }
});

export default SimplePieChart;
export type SimplePieChartRef = InstanceType<typeof SimplePieChart>;
</script>

<style>
.display-card__content {
  height: 320px;
}
</style>
