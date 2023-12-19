<template>
  <overview-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    :resource="resource"
    :filter="filter"
    :time-range="timeRange"
    :is-agency="isAgency"
    is-show-selection
    :selections="selections"
    :title="title"
    table-title="Agency"
    title-col="name"
    :redirect="redirect"
  >
    <template slot="item.name" slot-scope="{ item }">
      <nuxt-link
        v-if="item.agency"
        :to="`/user/${item.agency.id}`"
        class="truncate-2"
      >
        {{ item.agency.full_name }}
      </nuxt-link>
    </template>

    <template #top-right>
      <v-select
        v-model="selectedAgencyAdsType"
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

const AgencyOverview = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "AgencyOverview",
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
    },
    isAgency: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      headers: [
        {
          text: "Số tin đã gửi",
          value: "num_sent",
          width: 150
        },
        {
          text: "Số tin gửi ra gateway thành công",
          value: "num_success",
          width: 150
        },
        {
          text: "Số tin gửi ra gateway thất bại",
          value: "num_fail",
          width: 150
        },
        {
          text: "Số tin gửi đến thiết bị thành công",
          value: "cdr_num_success",
          width: 150
        },
        {
          text: "Số tin gửi đến thiết bị thất bại",
          value: "cdr_num_fail",
          width: 150
        }
      ],
      title: "",
      resource: "",
      selectedAgencyAdsType: null,
      redirect: ""
    };
  },
  computed: {
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders.includes(e.value);
      });
    },
    selections() {
      return [
        {
          text: "MMS",
          value: "MMS",
          resource: "/ads-mms/group-agency",
          title: "Danh sách top agency MMS",
          redirect: "/manage-ads/list-ads-mms"
        },
        {
          text: "SMS",
          value: "SMS",
          resource: "/ads-sms/group-agency",
          title: "Danh sách top agency SMS",
          redirect: "/manage-ads/sms"
        },
        {
          text: "SMS+MMS",
          value: "message",
          resource: "/ads-message/group-agency",
          title: "Danh sách top agency tin nhắn",
        }
      ];
    }
  },
  watch: {
    selectedAgencyAdsType(val) {
      if (val) {
        this.resource = val.resource;
        this.title = val.title;
        this.redirect = val.redirect;
      }
    }
  },
  created() {
    this.selectedAgencyAdsType = this.selections[0];
  }
});

export default AgencyOverview;
export type AgencyOverviewRef = InstanceType<typeof AgencyOverview>;
</script>
