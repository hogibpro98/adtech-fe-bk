<template>
  <display-card
    :title="title"
    :redirect="redirect"
    :loading="loadingProps || loadingData"
  >
    <v-select
      slot="top-right"
      v-model="criteriaSelected"
      :items="criteria"
      class="select-input"
      label="Tiêu chí"
      hide-details
      return-object
      dense
    ></v-select>

    <v-layout flex wrap justify-space-around align-center class="ma-0">
      <span v-for="(item, index) in categories" :key="`legend-${index}`">
        <v-icon :color="colorPalette[index]" class="mx-2">{{
          item.icon || "fa fa-square"
        }}</v-icon>
        {{ item.text }}
      </span>
    </v-layout>
    <v-responsive height="288px">
      <client-only>
        <e-chart :path-option="computeChartOption" width="100%" height="288px">
        </e-chart>
      </client-only>
    </v-responsive>
  </display-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { cloneDeep, debounce } from "lodash";
import { colorPalette } from "@/constants/color";
import DisplayCard from "@/components/common/DisplayCard.vue";
import { DataSelectInterface } from "~/interface/data/dataSelect";

interface ComponentData {
  defaultOption: Array<Array<string | number | object>>;
  data: Array<Array<string | number | object>>;
  colorPalette: Array<string>;
  selectedCategories: Array<string | number | object>;
  loadingData: boolean;
  criteriaSelected?: DataSelectInterface;
  params?: {
    criteria?: string;
    categories: Array<string>;
    time_range: Array<string>;
  };
}

interface ComponentMethods {
  debounceFetchData(): void;
  fetchData(): void;
}

const CategoryPieChart = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CategoryPieChart",
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
    }
  },
  data() {
    return {
      defaultOption: [
        ["dataset.source", this.data],
        ["series[0].type", "pie"],
        ["series.center", ["50%", "50%"]],
        ["legend.show", false],
        ["xAxis.show", false],
        ["series[0].label.show", false]
        // ["color", this.chartColor]
      ],
      data: [],
      colorPalette,
      selectedCategories: [],
      loadingData: false,
      criteriaSelected: {
        text: "",
        value: ""
      }
    };
  },
  computed: {
    computeChartOption() {
      const options = cloneDeep(this.defaultOption);
      options.push([
        "series[0].name",
        this.criteriaSelected.text || "Tiêu chí"
      ]);
      options.push([
        "tooltip.formatter",
        params => {
          return `
              <b style="font-size:14px;">${params.name}</b> <br/>
              <span style="font-size:12px;">${params.seriesName}</span><br/>
              <div class="d-flex justify-content-start align-center">
                <i
                aria-hidden="true"
                class="v-icon notranslate fa fa-square theme--light"
                style="font-size: 14px;color: ${params.color}">
                </i>
                <span style="font-size:24px;margin-left: 12px;font-weight: 500">${params.value.value}</span>
              </div>
              <span style="font-size:12px">(${params.percent}% tổng ${params.seriesName})</span>
          `;
        }
      ]);
      return options;
    },
    params() {
      return {
        criteria: this.criteriaSelected.value,
        categories: this.categories.map(e => e.value),
        time_range: this.timeRange
      };
    }
  },
  watch: {
    params: {
      handler() {
        this.debounceFetchData();
      },
      deep: true
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    debounceFetchData: debounce(function(): void {
      this.fetchData();
    }, 400),
    async fetchData(this: any): Promise<void> {
      const res = await this.$axios.$post(
        "/statistic/dashboard/category",
        this.params
      );

      this.data = res.data;
      this.$set(this.defaultOption, 0, ["dataset.source", this.data]);
    }
  }
});

export default CategoryPieChart;
export type CategoryPieChartRef = InstanceType<typeof CategoryPieChart>;
</script>
