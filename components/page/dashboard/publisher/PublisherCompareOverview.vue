<template>
  <display-card
    v-intersect.once="{
      handler: handleInView,
      options: {
        threshold: [0.8]
      }
    }"
    :max-height="800"
    :title="title"
    :loading="loading"
    :params="params"
  >
    <template #top-right>
      <compare-time-select
        v-model="selectedCompare"
        class="time-compare-select"
      />
    </template>
    <v-layout wrap row>
      <v-flex xs6 sm4>
        <div class="bold font-16">Số lượt xem trong trang</div>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="bold font-20" v-on="on">
              {{ getAttr("after.num_pageview") | textNumber }}
            </div>
          </template>
          <span>{{ getAttr("after.num_pageview") | formattedNumber }}</span>
        </v-tooltip>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              :class="getCompareClass(getAttr('change.num_pageview'))"
              v-on="on"
            >
              <span>{{
                getAttr("change.num_pageview") | compareTextNumber
              }}</span>
              <span class="px-2">
                ({{
                  getAttr("change_percent.num_pageview")
                    | compareFormattedNumber
                }}%)
              </span>
            </div>
          </template>
          <span>{{
            getAttr("change.num_pageview") | compareFormattedNumber
          }}</span>
        </v-tooltip>
        <div>
          <mini-compare-chart
            :data-set="getChartData('chart_data.after', 'num_pageview')"
            :compare-data-set="
              getChartData('chart_data.before', 'num_pageview')
            "
          />
        </div>
      </v-flex>
      <v-flex xs6 sm4>
        <div class="bold font-16">RPM</div>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="bold font-20" v-on="on">
              {{ getAttr("after.avg_rpm") | textNumber }}
            </div>
          </template>
          <span>{{ getAttr("after.avg_rpm") | formattedNumber }}</span>
        </v-tooltip>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              :class="getCompareClass(getAttr('change.avg_rpm'))"
              v-on="on"
            >
              <span>{{ getAttr("change.avg_rpm") | compareTextNumber }}</span>
              <span class="px-2">
                ({{
                  getAttr("change_percent.avg_rpm") | compareFormattedNumber
                }}%)
              </span>
            </div>
          </template>
          <span>{{ getAttr("change.avg_rpm") | compareFormattedNumber }}</span>
        </v-tooltip>
        <div>
          <mini-compare-chart
            :data-set="getChartData('chart_data.after', 'avg_rpm')"
            :compare-data-set="getChartData('chart_data.before', 'avg_rpm')"
          />
        </div>
      </v-flex>
      <v-flex xs6 sm4>
        <div class="bold font-16">Lượt impression</div>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="bold font-20" v-on="on">
              {{ getAttr("after.num_view") | textNumber }}
            </div>
          </template>
          <span>{{ getAttr("after.num_view") | formattedNumber }}</span>
        </v-tooltip>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              :class="getCompareClass(getAttr('change.num_view'))"
              v-on="on"
            >
              <span>{{ getAttr("change.num_view") | compareTextNumber }}</span>
              <span class="px-2">
                ({{
                  getAttr("change_percent.num_view") | compareFormattedNumber
                }}%)
              </span>
            </div>
          </template>
          <span>{{ getAttr("change.num_view") | compareFormattedNumber }}</span>
        </v-tooltip>
        <div>
          <mini-compare-chart
            :data-set="getChartData('chart_data.after', 'num_view')"
            :compare-data-set="getChartData('chart_data.before', 'num_view')"
          />
        </div>
      </v-flex>
      <v-flex xs6 sm4>
        <div class="bold font-16">Lượt click</div>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="bold font-20" v-on="on">
              {{ getAttr("after.num_click") | textNumber }}
            </div>
          </template>
          <span>{{ getAttr("after.num_click") | formattedNumber }}</span>
        </v-tooltip>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              :class="getCompareClass(getAttr('change.num_click'))"
              v-on="on"
            >
              <span>{{ getAttr("change.num_click") | compareTextNumber }}</span>
              <span class="px-2">
                ({{
                  getAttr("change_percent.num_click") | compareFormattedNumber
                }}%)
              </span>
            </div>
          </template>
          <span>{{
            getAttr("change.num_click") | compareFormattedNumber
          }}</span>
        </v-tooltip>
        <div>
          <mini-compare-chart
            :data-set="getChartData('chart_data.after', 'num_click')"
            :compare-data-set="getChartData('chart_data.before', 'num_click')"
          />
        </div>
      </v-flex>
      <v-flex xs6 sm4>
        <div class="bold font-16">CPC</div>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="bold font-20" v-on="on">
              {{ getAttr("after.avg_cpc") | textNumber }}
            </div>
          </template>
          <span>{{ getAttr("after.avg_cpc") | formattedNumber }}</span>
        </v-tooltip>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              :class="getCompareClass(getAttr('change.avg_cpc'))"
              v-on="on"
            >
              <span>{{ getAttr("change.avg_cpc") | compareTextNumber }}</span>
              <span class="px-2">
                ({{
                  getAttr("change_percent.avg_cpc") | compareFormattedNumber
                }}%)
              </span>
            </div>
          </template>
          <span>{{ getAttr("change.avg_cpc") | compareFormattedNumber }}</span>
        </v-tooltip>
        <div>
          <mini-compare-chart
            :data-set="getChartData('chart_data.after', 'avg_cpc')"
            :compare-data-set="getChartData('chart_data.before', 'avg_cpc')"
          />
        </div>
      </v-flex>
      <v-flex xs6 sm4>
        <div class="bold font-16">CTR</div>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div v-bind="attrs" class="bold font-20" v-on="on">
              {{ getAttr("after.ctr") | percent }}%
            </div>
          </template>
          <span>{{ getAttr("after.ctr") | percent }}%</span>
        </v-tooltip>
        <v-tooltip bottom left>
          <template #activator="{ on, attrs }">
            <div
              v-bind="attrs"
              :class="getCompareClass(getAttr('change.ctr'))"
              v-on="on"
            >
              <span>{{ getAttr("change.ctr") * 100 | compareFormattedNumber }}%</span>
              <span class="px-2">
                ({{ getAttr("change_percent.ctr") | compareFormattedNumber }}%)
              </span>
            </div>
          </template>
          <span>{{ getAttr("change.ctr") | compareFormattedNumber }}</span>
        </v-tooltip>
        <div>
          <mini-compare-chart
            :data-set="getChartData('chart_data.after', 'ctr')"
            :compare-data-set="getChartData('chart_data.before', 'ctr')"
          />
        </div>
      </v-flex>
    </v-layout>
  </display-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import GlobalDataInterface from "~/interface/data/global";
import DisplayCard from "~/components/common/DisplayCard.vue";
import displayCard from "~/mixins/displayCard";
import CompareTimeSelect from "~/components/select/CompareTimeSelect.vue";
import MiniCompareChart from "~/components/chart/common/MiniCompareChart.vue";
import { isArray } from "~/util/typeof";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const PublisherCompareOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PublisherCompareOverview",
  components: { MiniCompareChart, CompareTimeSelect, DisplayCard },
  mixins: [displayCard],
  props: {
    filter: {
      type: Object,
      default: () => {}
    },
    timeRange: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: "Hiệu suất",
      selectedCompare: null,
      overviewData: null
    };
  },
  computed: {
    attribute() {
      return [
        "ctr",
        "num_click",
        "num_view",
        "num_pageview",
        "num_request",
        "num_request_success",
        "avg_rpm",
        "avg_cpc"
      ];
    },
    selectedCompareParams() {
      return this.selectedCompare?.params || {};
    },
    params() {
      return {
        time_range: this.timeRange,
        attribute: this.attribute,
        ...this.filter,
        ...this.selectedCompareParams
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
  methods: {
    getCompareClass(value) {
      if (value > 0) {
        return "success--text";
      }
      if (value < 0) {
        return "error--text";
      }
      return "";
    },
    async fetchData() {
      this.loading = true;
      try {
        const { data } = await this.$axios.$post(
          "/publisher/zone",
          this.params
        );
        this.overviewData = data;
      } catch (e) {}
      this.loading = false;
    },
    getAttr(prop) {
      const parts = prop.split(".");
      let value = this.overviewData;
      for (const part of parts) {
        if (value === undefined || value === null) {
          return null;
        }
        value = value[part];
      }
      return value;
    },

    generateRandomArray(x, y, n) {
      const arr = [];
      for (let i = 0; i < n; i++) {
        const num = Math.floor(Math.random() * (y - x + 1)) + x;
        arr.push(num);
      }
      return arr;
    },

    getChartData(prop = null, attr = null) {
      if (prop != null) {
        const series = this.getAttr(prop);
        if (isArray(series)) {
          if (series.length > 1) {
            return series.map(e => {
              return parseFloat(e[attr]) || 0;
            });
          }
        }
      }
      const data = this.generateRandomArray(0, 100, 14);
      return data;
    }
  }
});

export default PublisherCompareOverview;
export type PublisherCompareOverviewRef = InstanceType<
  typeof PublisherCompareOverview
>;
</script>
<style>
.time-compare-select {
  width: 360px;
}
</style>
