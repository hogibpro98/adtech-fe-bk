<template>
  <overview-table
    v-bind="$attrs"
    :headers="displayHeaders"
    :resource="resource"
    :filter="filter"
    :time-range="timeRange"
    title="Danh sách top quảng cáo Redirect"
    title-col="name"
    redirect="/manage-ads/list-ads-redirect"
    lazy
  >
    <template slot="item.name" slot-scope="props">
      <nuxt-link
        :to="`/manage-ads/list-ads-redirect/${props.item && props.item.id}`"
        class="truncate-2"
      >
        {{ props.item.name }}
      </nuxt-link>
    </template>
  </overview-table>
</template>

<script lang="ts">
import OverviewTable from "@/components/table/OverviewTable.vue";
import { ROLE_ADVERTISER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const DisplayAdsOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "DisplayAdsOverview",
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
    hideHeaders: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      headers: [
        {
          text: "CPM",
          value: "price_cpm",
          width: 250
        },
        {
          text: "Lượt click",
          value: "num_click",
          width: 150
        },
        {
          text: "Lượt impression",
          value: "num_view",
          width: 150
        },
        {
          text: "CTR",
          value: "ctr",
          width: 150,
          formatter: item => {
            return `${this.$filters.percent(item.ctr)}%`;
          }
        },
        {
          text: "Chi phí",
          value: "total_money",
          width: 150
        }
      ]
    };
  },
  computed: {
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders.includes(e.value);
      });
    },
    resource() {
      return this.$authHasRole(ROLE_ADVERTISER)
        ? "/advertiser/banner"
        : "/banner";
    }
  }
});

export default DisplayAdsOverview;
export type DisplayAdsOverviewRef = InstanceType<typeof DisplayAdsOverview>;
</script>
