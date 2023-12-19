<template>
  <overview-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    :resource="resource"
    :filter="filter"
    :time-range="timeRange"
    is-show-selection
    :selections="selections"
    :title="title"
    table-title="Agency"
    title-col="name"
    :redirect="redirect"
  >
    <template #top-right>
      <v-select
        v-model="selectObjectType"
        :items="selections"
        label="Dịch vụ"
        hide-details
        return-object
        style="width: 100px"
        dense
      ></v-select>
    </template>
  </overview-table>
</template>

<script lang="ts">
import OverviewTable from "@/components/table/OverviewTable.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import GlobalDataInterface from "~/interface/data/global";
import { ROLE_ADVERTISER } from "~/constants/role";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const PublisherOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PublisherOverview",
  components: { OverviewTable },
  props: {
    filter: {
      type: Object,
      default: () => {}
    },
    timeRange: {
      type: Array,
      default: () => []
    },
    isAgency: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      title: "",
      resource: "",
      selectObjectType: null,
      redirect: ""
    };
  },
  computed: {
    isSelectingZone() {
      return this.selectObjectType?.value == "zone";
    },
    headers() {
      return [
        {
          text: "Lượt click",
          value: "num_click",
          align: "right",
          width: 160
        },
        {
          text: "Lượt impression",
          value: "num_view",
          align: "right",
          width: 160
        },
        {
          text: "CTR",
          value: "ctr",
          width: 160,
          formatter: item => {
            return `${this.$filters.percent(item.ctr)}%`;
          }
        },
        {
          text: "Lượt request",
          value: "num_request",
          align: "right",
          width: 160,
          visible: this.isSelectingZone
        },
        {
          text: "Lượt lấy QC thành công",
          value: "num_request_success",
          align: "right",
          width: 160,
          visible: this.isSelectingZone
        },
        {
          text: "Tỉ lệ lấy QC thành công",
          value: "request_success_rate",
          align: "right",
          width: 200,
          formatter: item => {
            return `${this.$filters.percent(item.request_success_rate)}%`;
          },
          visible: this.isSelectingZone
        },
        {
          text: "Lượt pageview",
          value: "num_pageview",
          align: "right",
          width: 160,
          visible: this.isSelectingZone
        },
        {
          text: "Doanh thu",
          value: "total_money",
          align: "right",
          width: 160
        }
      ];
    },
    displayHeaders() {
      return this.headers.filter(e => {
        return e.visible || e.visible == undefined;
      });
    },
    selections() {
      return [
        {
          text: "Zone",
          value: "zone",
          resource: "/zone",
          title: "Danh sách top zone",
          redirect: "/setting-display-ads/zone"
        },
        {
          text: "Sub Inventory",
          value: "channel",
          resource: "/channel",
          title: "Danh sách top sub inventory",
          redirect: "/setting-display-ads/channel"
        },
        {
          text: "Inventory",
          value: "inventory",
          resource: "/inventory/display-ads",
          title: "Danh sách top inventory",
          redirect: "/setting-display-ads/inventory"
        }
      ];
    }
  },
  watch: {
    selectObjectType(val) {
      if (val) {
        this.resource = val.resource;
        this.title = val.title;
        this.redirect = val.redirect;
      }
    }
  },
  created() {
    this.selectObjectType = this.selections[0];
  }
});

export default PublisherOverview;
export type PublisherOverviewRef = InstanceType<typeof PublisherOverview>;
</script>
