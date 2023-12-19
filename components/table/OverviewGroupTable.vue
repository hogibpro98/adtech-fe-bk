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
    :time-range="timeRange"
    :url="resource"
    class="z-3"
    :params="params"
  >
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
    <v-data-table
      :items="items"
      hide-default-header
      :options.sync="pagination"
      :footer-props="footerProps"
      :server-items-length="total"
      class="overview-table"
      height="100%"
    >
      <template #header="props">
        <tr>
          <th scope="col" class="overview-table__first-column">
            <span class="font-weight-regular">{{ objectName }}</span>
          </th>
          <th
            v-for="(innerItem, i) of innerValue"
            :key="i"
            scope="col"
            class="px-1 pb-1"
          >
            <header-group-select
              :headers="innerItem.children"
              :sorting="getSorting(innerItem)"
              :index="i"
              fixed-header
              :name="`header.${i}`"
              :header-label="innerItem.text"
              @sorted="handleSort"
              @select-attribute="handleAttribute"
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
                <v-progress-linear
                  v-for="child of visibleChildren(val.children)"
                  :key="`${child.value}.${index}`"
                  class="my-1"
                  :color="child.color"
                  background-color="transparent"
                  height="16"
                  :value="
                    getBarLength(
                      getValue(item, child, child.value),
                      child.value
                    )
                  "
                  v-on="on"
                >
                </v-progress-linear>
              </template>
              <span>
                <span
                  v-for="child of val.children"
                  :key="`${child.value}.${index}`"
                >
                  {{ child.text }} :
                  {{ getValue(item, child, child.value) | numberSpace }}
                  <br />
                </span>
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
import deepWrapper from "@/mixins/deepWrapper";
import { debounce, flatten } from "lodash";
import DisplayCard from "@/components/common/DisplayCard.vue";
import { isEqualDeep } from "@/helpers/ultis";
import { getPropsMax } from "~/util/array";
import Template from "~/pages/manage-ads/sms/template.vue";
import HeaderSelect from "~/components/table/HeaderSelect.vue";
import HeaderGroupSelect from "~/components/table/HeaderGroupSelect.vue";
import ExportComponent from "~/components/common/ExportComponent.vue";
interface ComponentData {
  innerValue: any;
}

interface ComponentMethods {
  calculateLevel(val: string | number, prop: string): number;

  computedClass(index: number, item: object, prop: string): string;

  handleSort(obj: object): void;

  fetchData(): void;
}

const OverviewGroupTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "OverviewGroupTable",
  components: {
    HeaderGroupSelect,
    HeaderSelect,
    Template,
    DisplayCard,
    ExportComponent
  },
  mixins: deepWrapper,
  props: {
    height: {
      type: Number,
      default: 400
    },
    resource: {
      type: String,
      default: ""
    },
    objectName: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      required: true
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
    itemTypes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      items: [],
      inView: false,
      innerValue: [],
      loading: false,
      sortBy: null,
      sortType: "desc",
      debounceFetchData: null,
      selectType: "mms",
      total: 0,
      pagination: {
        page: 1,
        itemsPerPage: 5
      }
    };
  },
  computed: {
    attributes() {
      return flatten(this.headerValues);
    },
    max() {
      let max = 1;
      if (this.items.length > 0) {
        this.attributes.forEach(e => {
          const attrMax = parseFloat(getPropsMax(this.items, e));
          max = attrMax > max ? attrMax : max;
        });
      }
      return max;
    },
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
      const fieldsRequest = [];
      for (let i = 0; i < this.headers.length; i++) {
        const childValues = this.headers[i].children;
        for (let j = 0; j < childValues.length; j++) {
          // skip add param if has formatter
          if (childValues[j].formatter === undefined) {
            const tmpItem = {};
            tmpItem.name = childValues[j].value;
            tmpItem.operator = childValues[j].operator || "sum";

            fieldsRequest.push(tmpItem);
          }
        }
      }
      return {
        time_range: this.timeRange,
        page: this.pagination.page,
        itemsPerPage: this.pagination.itemsPerPage,
        fields: fieldsRequest,
        sortBy: this.sortBy || undefined,
        sortDesc: this.sortType === "desc" || false,
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
    resource(val) {
      if (val) {
        this.debounceFetchData();
      }
    },
    inView(val) {
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
    this.innerValue = this.headers.slice(0, 2);
    this.sortBy = this.innerValue[0]?.value[0] ?? null;
  },
  mounted() {
    this.debounceFetchData();
  },
  methods: {
    visibleChildren(val) {
      return val.filter(e => e.visible === undefined || e.visible === true);
    },
    handlerExportClick() {
      console.log(1);
    },
    getValue(item, child, prop) {
      if (child.formatter) {
        return child.formatter(item);
      }
      return item[prop];
    },
    getBarLength(value) {
      const length = (value / this.max) * 100;
      return length >= 1 ? length : 1;
    },
    getSorting(innerItem) {
      const index = innerItem.children.map(e => e.value).indexOf(this.sortBy);
      // const index = 0;
      if (index >= 0) {
        return [0, this.sortType];
      } else {
        return [];
      }
    },
    handleInView(entries) {
      if (entries[0].isIntersecting && this.lazy) {
        this.inView = true;
      }
    },
    calculateClassNameColor(value) {
      if (typeof value === "string") {
        if (value.includes("fail")) {
          return "deep-orange";
        } else {
          // value.includes("success")
          return "light-blue";
        }
      }
    },
    handleSort(obj) {
      if (obj?.value) {
        this.sortType = obj.value;
      } else {
        (this.sortType = null), (this.sortBy = null);
      }
    },
    async handleAttribute(obj) {
      this.sortBy = obj?.value || null;
      await this.$nextTick();
      this.$forceUpdate();
    },
    async fetchData() {
      if (!(this.lazy && !this.inView)) {
        this.loading = true;
        try {
          const { data } = await this.$axios.post(
            `${this.resource}`,
            this.params
          );

          this.items = data.data;
          this.total = data.total ?? 0;
          this.loading = false;
        } catch (e) {
          this.items = [];
          this.loading = false;
        }
      }
    }
  }
});

export default OverviewGroupTable;
export type OverviewGroupTableRef = InstanceType<typeof OverviewGroupTable>;
</script>

<style lang="scss">
.overview-table__first-column {
  width: 40%;
  padding: 0 16px;
  text-align: left;
}
</style>
