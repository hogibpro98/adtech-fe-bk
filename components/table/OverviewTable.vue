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
    :params="params"
  >
    <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
    <v-data-table
      :items="items"
      hide-default-footer
      hide-default-header
      class="overview-table"
    >
      <template #header="props">
        <tr>
          <th scope="col" class="overview-table__first-column">
            <span v-if="tableTitle" class="font-weight-regular">{{
              tableTitle
            }}</span>
            <span v-else class="font-weight-regular">{{ title }}</span>
          </th>
          <th scope="col" class="px-1 pb-1">
            <header-select
              v-model="innerValue[0]"
              :headers="headers"
              :sorting="sorting"
              :index="0"
              @sorted="handleSort"
            />
          </th>
          <th scope="col" class="px-1 pb-1">
            <header-select
              v-model="innerValue[1]"
              :headers="headers"
              :sorting="sorting"
              :index="1"
              @sorted="handleSort"
            />
          </th>
          <th scope="col" class="px-1 pb-1">
            <header-select
              v-model="innerValue[2]"
              :headers="headers"
              :sorting="sorting"
              :index="2"
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
          <td
            v-for="(val, index) of innerValue"
            :key="index"
            :class="computedClass(index, item, val.value)"
          >
            <span v-if="!val.formatter">
              {{ item[val.value] | numberSpace }}
            </span>
            <span v-else v-html="val.formatter(item)"></span>
            <!--            <span v-else>a</span>-->
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
import HeaderSelect from "@/components/table/HeaderSelect";
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

const OverviewTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "OverviewTable",
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
    }
  },
  data() {
    return {
      items: [],
      inView: false,
      innerValue: [],
      loading: false,
      sorting: [],
      debounceFetchData: null
    };
  },
  computed: {
    headerValues() {
      const columns = this.innerValue.map(e => e.value || null);
      return [this.titleCol, ...columns];
    },
    itemsMin() {
      return getPropsMin(
        this.items,
        this.innerValue.map(e => e.value)
      );
    },
    itemsMax() {
      return getPropsMax(
        this.items,
        this.innerValue.map(e => e.value)
      );
    },
    params() {
      return {
        time_range: this.timeRange,
        page: 1,
        itemsPerPage: 5,
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
      this.innerValue = val.slice(0, 3);
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
    this.innerValue = this.headers.slice(0, 3);
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
    calculateLevel(val, prop) {
      const value = parseFloat(val || 0);

      const min = Math.floor(this.itemsMin[prop] * 100);
      const max = Math.floor(this.itemsMax[prop] * 100);
      const scale = max - min;
      if (!val) {
        return 0;
      }
      if (scale <= 1) {
        return 2;
      }
      return Math.round(((value * 100 - min) / scale) * 7);
    },

    computedClass(index, item, prop) {
      let className = "text-end";
      if (index === this.sorting[0]) {
        className += " blue";
      } else {
        className += " grey";
      }
      const level = this.calculateLevel(item[prop], prop);
      if (level > 5) {
        className += ` darken-${level - 5} white--text ${level}`;
      } else if (level < 5) {
        className += ` lighten-${5 - level} black--text ${level}`;
      }
      return className;
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

          this.loading = false;
        } catch (e) {
          console.log(e);
          this.items = [];
          this.loading = false;
        }
      }
    }
  }
});

export default OverviewTable;
export type OverviewTableRef = InstanceType<typeof OverviewTable>;
</script>

<style lang="scss">
.overview-table__first-column {
  width: 40%;
  padding: 0 16px;
  text-align: left;
}
</style>
