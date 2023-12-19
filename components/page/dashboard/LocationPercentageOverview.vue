<template>
  <overview-percentage-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    table-title="Vị trí"
    :resource="resource"
    :filter="filterParams"
    :time-range="timeRange"
    title="Tỷ lệ impression/click của QC Redirect theo địa điểm"
    title-col="name"
  >
    <template #item.name="{item}">
      {{ item.name || "Không xác định" }}
    </template>
    <template #top-right>
      <v-select
        v-model="selectedLevel"
        class="pl-2 select-input"
        style="width: 160px"
        dense
        :items="levels"
        item-value="value"
        item-text="text"
        label="Chọn cấp độ"
      />
    </template>
  </overview-percentage-table>
</template>

<script lang="ts">
import { ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import GlobalDataInterface from "~/interface/data/global";
import OverviewPercentageTable from "~/components/table/OverviewPercentageTable.vue";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const LocationPercentageOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "LocationPercentageOverview",
  components: { OverviewPercentageTable },
  props: {
    filter: {
      type: Object,
      default: () => {}
    },
    timeRange: {
      type: Array,
      default: () => []
    },
    hideHeaders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      selectedLevel: ""
    };
  },
  computed: {
    filterParams() {
      return {
        ...this.filter,
        location_type: this.selectedLevel
      };
    },
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders.includes(e.value);
      });
    },
    resource() {
      return "/demographic/redirect/location";
    },
    headers() {
      return [
        {
          text: "Tỷ lệ impression",
          value: "num_view",
          width: 250
        },
        {
          text: "Tỷ lệ click",
          value: "num_click",
          width: 250
        }
      ];
    },
    levels() {
      return [
        {
          value: "area",
          text: "Khu vực"
        },
        {
          value: "province",
          text: "Tỉnh/Thành phố"
        },
        {
          value: "district",
          text: "Quận/Huyện"
        }
      ];
    }
  },
  created() {
    this.selectedLevel = "province";
  }
});

export default LocationPercentageOverview;
export type LocationPercentageOverviewRef = InstanceType<
  typeof LocationPercentageOverview
>;
</script>
