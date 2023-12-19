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
    :loading="loading"
    :url="resource"
    :filter="filter"
    :params="params"
  >
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
    <v-data-table
      :items="items"
      :options.sync="pagination"
      :footer-props="footerProps"
      hide-default-header
      class="overview-table"
      :server-items-length="total"
    >
      <template #header="props">
        <tr>
          <th scope="col" class="overview-table__first-column">
            <span v-if="tableTitle" class="font-weight-regular">{{
              tableTitle
            }}</span>
            <span v-else class="font-weight-regular">{{ title }}</span>
          </th>
          <th
            v-for="(item, index) in innerValue"
            :key="`val-${index}`"
            scope="col"
            class="px-1 pb-1"
          >
            <header-select
              v-model="innerValue[index]"
              :headers="headers"
              :sorting="sorting"
              :index="index"
              @sorted="handleSort"
            />
          </th>
        </tr>
      </template>
      <template #item="{ item }">
        <tr>
          <td class="overview-table__first-column">
            <template v-if="$scopedSlots[`item.${titleCol}`]">
              <slot :name="`item.${titleCol}`" v-bind="{ item }"></slot>
            </template>
            <span v-else>
              {{ item[titleCol] }}
            </span>
          </td>
          <td v-for="(val, index) of innerValue" :key="index">
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-row v-on="on">
                  <v-flex xs8>
                    <v-progress-linear
                      class="my-1"
                      color="primary"
                      background-color="transparent"
                      height="16"
                      :value="getPercentage(item, val.value) * 100"
                    />
                  </v-flex>
                  <v-flex class="text-right" xs4
                    >{{ getPercentage(item, val.value) | percent }}%
                  </v-flex>
                </v-row>
              </template>
              <span>
                {{ item[titleCol] }} : {{ item[val.value] | numberSpace }}
              </span>
            </v-tooltip>
          </td>
        </tr>
      </template>
      <template v-if="items.length === 0" #body>
        <tr>
          <td colspan="4">
            <span class="w-full d-flex justify-content-center pa-4">
              Chưa có dữ liệu.</span
            >
          </td>
        </tr>
      </template>
    </v-data-table>
  </display-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import HeaderSelect from "@/components/table/HeaderSelect.vue";
import deepWrapper from "@/mixins/deepWrapper";
import { debounce } from "lodash";
import DisplayCard from "@/components/common/DisplayCard.vue";
import { getPropsMin, getPropsMax } from "@/util/array";
import { isEqualDeep } from "@/helpers/ultis";
import Template from "~/pages/manage-ads/sms/template.vue";

interface ComponentData {
  innerValue: any;
}

interface ComponentMethods {
  calculateLevel(val: string | number, prop: string): number;

  computedClass(index: number, item: object, prop: string): string;

  handleSort(obj: object): void;

  fetchData(): void;
}

const OverviewPercentageTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "OverviewPercentageTable",
  components: { Template, DisplayCard, HeaderSelect },
  mixins: deepWrapper,
  props: {
    height: {
      type: Number,
      default: 400
    },
    title: {
      type: String,
      required: true
    },
    tableTitle: {
      type: String,
      required: false,
      default: ""
    },
    redirect: {
      type: String,
      default: null
    },
    headers: {
      type: Array,
      default: () => []
    },
    titleCol: {
      type: String,
      default: "title"
    },
    resource: {
      type: String,
      required: true
    },
    filter: {
      type: Object,
      default: () => ({})
    },
    lazy: {
      type: Boolean,
      default: false
    },
    timeRange: {
      type: Array,
      default: () => []
    },
    isAgency: {
      type: Boolean,
      default: false
    },
    fields: {
      type: Array,
      default: () => []
    },
    selections: {
      type: Array,
      default: () => []
    },
    isShowSelection: {
      type: Boolean,
      default: false
    },
    headersCount: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      items: [],
      total: 0,
      inView: false,
      innerValue: [],
      loading: false,
      sorting: [],
      sumData: {},
      debounceFetchData: null,
      pagination: {
        page: 1,
        itemsPerPage: 5
      }
    };
  },
  computed: {
    headerValues() {
      const columns = this.innerValue.map(e => e.value || null);
      return [this.titleCol, ...columns];
    },
    footerProps() {
      return {
        "show-first-last-page": true,
        "show-current-page": true,
        "items-per-page-options": [5],
        "items-per-page-text": "Số bản ghi mỗi trang",
        "page-text": "{0}-{1} trong {2}"
      };
    },
    params() {
      return {
        time_range: this.timeRange,
        page: this.pagination.page,
        itemsPerPage: this.pagination.itemsPerPage,
        sortBy:
          this.sorting[0] || this.sorting[0] === 0
            ? this.innerValue[this.sorting[0]].value
            : undefined,
        sortDesc: this.sorting[1] ? this.sorting[1] === "desc" : false,
        fields: this.fields,
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
    inView(val) {
      if (val) {
        this.debounceFetchData();
      }
    },

    async headers(val) {
      this.innerValue = val.slice(0, this.headersCount);
      await this.$nextTick();
      this.sorting = [0, "desc"];
    },

    resource(val) {
      if (val) {
        this.debounceFetchData();
      }
    }
  },
  created() {
    this.debounceFetchData = debounce(
      function() {
        this.fetchData();
      },
      400,
      { leading: true, trailing: true }
    );
    this.innerValue = this.headers.slice(0, this.headersCount);
    this.sorting = [0, "desc"];
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
    getPercentage(item, prop) {
      return item[prop] / this.sumData[prop];
    },
    handleSort(obj) {
      if (obj.value) {
        this.sorting = [obj.index, obj.value];
      } else {
        this.sorting = [];
      }
    },
    async fetchData() {
      if (!(this.lazy && !this.inView)) {
        this.loading = true;
        try {
          const { data } = await this.$axios.post(
            `${this.resource}/listing`,
            this.params
          );
          this.items = data.data;
          this.total = data.total ?? 0;
          this.sumData = data.sum;
          this.loading = false;
        } catch (e) {
          console.log(e);
          this.items = [];
          this.sumData = {};
          this.loading = false;
        }
      }
    }
  }
});

export default OverviewPercentageTable;
export type OverviewPercentageTableRef = InstanceType<
  typeof OverviewPercentageTable
>;
</script>

<style lang="scss">
.overview-table__first-column {
  width: 40%;
  padding: 0 16px;
  text-align: left;
}
</style>
