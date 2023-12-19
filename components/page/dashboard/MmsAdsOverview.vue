<template>
  <overview-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    :resource="resource"
    :filter="filter"
    :time-range="timeRange"
    title="Danh sách top tin nhắn MMS"
    title-col="name"
    redirect="/manage-ads/list-ads-mms"
  >
    <template slot="item.name" slot-scope="props">
      <nuxt-link
        :to="`/manage-ads/list-ads-mms/${props.item && props.item.id}`"
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

const MmsAdsOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "MmsAdsOverview",
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
          text: "Số tin nhắn thất bại",
          value: "num_fail",
          width: 250
        },
        {
          text: "Số tin nhắn thành công",
          value: "num_success",
          width: 250
        },
        {
          text: "Số tin nhắn đã gửi",
          value: "num_sent",
          width: 250
        },
        {
          text: "Tỉ lệ gửi thành công",
          value: "rate_success",
          width: 250,
          formatter: item => {
            return `${this.$filters.percent(item.success_rate)}%`;
          }
        },
        {
          text: "Chi phí",
          value: "expense",
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
        ? "/advertiser/ads-mms"
        : "/ads-mms";
    }
  }
});

export default MmsAdsOverview;
export type MmsAdsOverviewRef = InstanceType<typeof MmsAdsOverview>;
</script>
