<template>
  <overview-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    :resource="resource"
    :filter="mappedFilter"
    :time-range="timeRange"
    title="Danh sách top chiến dịch"
    title-col="name"
    redirect="/manage-campaign/list"
  >
    <template slot="item.name" slot-scope="props">
      <nuxt-link
        :to="`/manage-campaign/list/${props.item && props.item.id}`"
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

const CampaignOverview = (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "CampaignOverview",
  components: { OverviewTable },
  props: {
    filter: {
      type: Object,
      default: () => ({})
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
          text: "Tổng tin gửi",
          value: "num_sent",
          width: 150
        },
        {
          text: "Gửi thành công",
          value: "num_success",
          width: 150
        },
        {
          text: "Gửi thất bại",
          value: "num_fail",
          width: 150
        },
        {
          text: "Tỷ lệ thành công",
          value: "success_rate",
          width: 150,
          formatter: item => {
            return `${this.$filters.percent(item.success_rate)}%`;
          }
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
        ? "/advertiser/campaign"
        : "/campaign";
    },
    mappedFilter() {
      if (this.filter.resource_campaign_id !== undefined) {
        const map = {
          ...this.filter,
          resource_id: this.filter.resource_campaign_id
        };
        this.$delete(map, "resource_campaign_id");
        return map;
      }
      return this.filter;
    }
  }
});

export default CampaignOverview;
export type CampaignOverviewRef = InstanceType<typeof CampaignOverview>;
</script>
