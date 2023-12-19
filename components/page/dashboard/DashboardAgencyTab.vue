<template>
  <div>
    <v-layout row wrap>
      <v-flex xs12 xl6>
        <multiple-pie-chart
          lazy
          has-resource
          :time-range="dateStatistics"
          :filter="currentFilter"
          title="Cơ cấu QC theo trạng thái"
          :resources="statusResources"
        />
      </v-flex>
      <v-flex xs12 xl6>
        <message-failed-pie-chart
          lazy
          :time-range="dateStatistics"
          :filter="currentFilter"
        />
      </v-flex>
      <v-flex xs12 xl6>
        <ads-data-by-brandname-overview
          :filter="currentFilter"
          :time-range="dateStatistics"
          :hide-headers="hideDisplayAdsHeaders"
        />
      </v-flex>
      <v-flex xs12 xl6>
        <ads-data-by-location-overview
          :filter="currentFilter"
          :time-range="dateStatistics"
          :hide-headers="hideDisplayAdsHeaders"
        />
      </v-flex>
      <v-flex xs12 xl6>
        <location-percentage-overview
          :filter="currentFilter"
          :time-range="dateStatistics"
          :hide-headers="hideDisplayAdsHeaders"
        />
      </v-flex>
      <v-flex v-if="isAdmin" xs12 xl6>
        <agency-overview
          :filter="currentFilter"
          :time-range="dateStatistics"
          is-agency
        />
      </v-flex>
      <v-flex xs12 xl6>
        <top-list-agency-ads-type
          :filter="currentFilter"
          :time-range="dateStatistics"
          :hide-headers="hideHeadersType"
        />
      </v-flex>
      <v-flex xs12 xl6>
        <date-time-heatmap-chart
          :filter="currentFilter"
          :time-range="dateStatistics"
        />
      </v-flex>
    </v-layout>
    <v-layout row wrap>
      <v-flex v-if="isAdmin" xs12 xl6>
        <simple-pie-chart
          lazy
          :time-range="dateStatistics"
          :filter="noAdvertiserFilter"
          title="Cơ cấu tiền QC theo agency"
          url="/summary/expense/agency"
        />
      </v-flex>
      <v-flex v-if="canViewFinance" xs12 xl6>
        <simple-pie-chart
          lazy
          :time-range="dateStatistics"
          :filter="currentFilter"
          title="Cơ cấu tiền QC theo advertiser"
          url="/summary/expense/advertiser"
        />
      </v-flex>
      <v-flex xs12>
        <gender-mms-chart
          :filter="currentFilter"
          :time-range="dateStatistics"
        />
      </v-flex>
      <v-flex xs12>
        <ads-stats-time-chart
          :filter="currentFilter"
          :time-range="dateStatistics"
        />
      </v-flex>
      <v-flex v-if="canViewFinance" xs12>
        <expense-time-chart
          :filter="currentFilter"
          :time-range="dateStatistics"
        />
      </v-flex>
    </v-layout>
  </div>
</template>
<script lang="ts">
import Material from "vuetify/es5/util/colors";
import SimplePieChart from "@/components/chart/common/SimplePieChart.vue";
import HeaderSelectTime from "@/components/common/HeaderSelectTime.vue";
import DisplayAdsOverview from "@/components/page/dashboard/DisplayAdsOverview.vue";
import CampaignOverview from "@/components/page/dashboard/CampaignOverview.vue";
import DateTimeHeatmapChart from "@/components/page/dashboard/DateTimeHeatmapChart.vue";
import DisplayAdsTimeChart from "@/components/page/dashboard/DisplayAdsTimeChart.vue";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import * as USER_ROLES from "@/constants/role";
import { ROLE_ADVERTISER, ROLE_IS_ADMIN } from "@/constants/role";
import { RESOURCE } from "@/constants/filterType";
import CampaignSelect from "@/components/select/CampaignSelect.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import RoleStats from "@/components/page/dashboard/RoleStats.vue";
import ExpenseTimeChart from "@/components/page/dashboard/ExpenseTimeChart.vue";
import MmsAdsOverview from "@/components/page/dashboard/MmsAdsOverview.vue";
import Vue, { VueConstructor } from "vue";
import AgencyOverview from "~/components/page/dashboard/AgencyOverview.vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import AdsDataOverview from "~/components/page/dashboard/AdsDataOverview.vue";
import GenderMmsChart from "~/components/page/dashboard/GenderMmsChart.vue";
import MultiplePieChart from "~/components/chart/common/MultiplePieChart.vue";
import AdsDataByBrandnameOverview from "~/components/page/dashboard/AdsDataByBrandnameOverview.vue";
import TopListAgencyAdsType from "~/components/page/dashboard/TopListAgencyAdsType.vue";
import AdsDataByLocationOverview from "~/components/page/dashboard/AdsDataByLocationOverview.vue";
import LocationPercentageOverview from "~/components/page/dashboard/LocationPercentageOverview.vue";
import MessageFailedPieChart from "~/components/page/dashboard/MessageFailedPieChart.vue";
import AdsStatsTimeChart from "~/components/page/dashboard/AdsStatsTimeChart.vue";

interface ComponentData extends GlobalDataInterface {
  color: string;
  dateStatistics: Array<string>;
  currentFilter: object;
  roles: object;
  abortController: object;
  userRole: string;
  isAdmin: boolean;
  canViewFinance: boolean;
  hideDisplayAdsHeaders: Array<string>;
  hideMmsHeaders: Array<string>;
  hideCampaignHeaders: Array<string>;
  filters: Array<FilterInterface>;
}

interface ComponentMethods {}

const DashboardAgencyTab = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    AdsStatsTimeChart,
    MessageFailedPieChart,
    LocationPercentageOverview,
    AdsDataByLocationOverview,
    MultiplePieChart,
    GenderMmsChart,
    AdsDataByBrandnameOverview,
    AdsDataOverview,
    MmsAdsOverview,
    ExpenseTimeChart,
    RoleStats,
    NewCustomFilter,
    DisplayAdsTimeChart,
    DateTimeHeatmapChart,
    CampaignOverview,
    DisplayAdsOverview,
    HeaderSelectTime,
    SimplePieChart,
    AgencyOverview,
    TopListAgencyAdsType
  },
  props: {
    dateStatistics: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    color: Material,
    currentFilter: null,
    roles: USER_ROLES,
    abortController: null
  }),
  computed: {
    userRole() {
      return this.$auth.user?.roles[0];
    },
    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    canViewFinance() {
      return this.$can("dashboard.view-finance");
    },
    hideDisplayAdsHeaders() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return ["price_cpm", "total_money"];
      } else {
        return [];
      }
    },
    hideMmsHeaders() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return ["total_money"];
      } else {
        return [];
      }
    },
    hideCampaignHeaders() {
      if (this.$authHasRole(ROLE_ADVERTISER)) {
        return ["total_money"];
      } else {
        return [];
      }
    },

    hideHeadersType() {
      return {
        redirect: this.hideDisplayAdsHeaders,
        data: this.hideMmsHeaders,
        campaign: this.hideCampaignHeaders,
        mms: this.hideMmsHeaders,
        sms: this.hideMmsHeaders
      };
    },

    filters() {
      return [
        {
          type: RESOURCE,
          name: "campaign_id",
          label: "Chiến dịch",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
          },
          component: CampaignSelect
        },
        {
          type: RESOURCE,
          name: "agency_id",
          label: "Agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          visible: this.$authHasRole(USER_ROLES.ROLE_IS_ADMIN),
          props: {
            multiple: false,
            queryParams: {
              type: USER_ROLES.ROLE_AGENCY
            }
          }
        },
        {
          type: RESOURCE,
          name: "advertiser_id",
          label: "Advertiser",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          visible: this.$authHasRole(USER_ROLES.ROLE_ADMIN_OR_AGENCY),
          props: {
            multiple: false,
            queryParams: {
              type: USER_ROLES.ROLE_ADVERTISER
            }
          }
        }
      ];
    },
    noAdvertiserFilter() {
      const filter = {
        ...this.currentFilter
      };
      if (filter.resource_advertiser_id) {
        this.$delete(filter, "resource_advertiser_id");
      }
      return filter;
    },
    pageFilter() {
      return {
        ...this.currentFilter,
        time_range: this.dateStatistics
      };
    },
    pageQuery() {
      return this.$route.query;
    },
    statusResources() {
      return [
        {
          value: "mms",
          text: "MMS",
          url: "/summary/ads-mms-status"
        },
        {
          value: "sms",
          text: "SMS",
          url: "/summary/ads-sms-status"
        },
        {
          value: "redirect",
          text: "QC Redirect",
          url: "/summary/ads-redirect-status"
        },
        {
          value: "data",
          text: "Tài trợ data",
          url: "/summary/ads-data-status"
        }
      ];
    }
  },
  watch: {
    pageFilter(query) {
      this.$router.push({ query });
    },
    pageQuery() {
      this.getPageQuery();
    }
  },
  created() {
    this.getPageQuery();
  },
  methods: {
    getPageQuery() {
      const query = this.pageQuery;
      this.dateStatistics =
        query?.time_range ||
        this.$filters.sqlDate([Date.now() - 6 * 24 * 3600 * 1000, Date.now()]);
      // this.$delete(query, "time_range");
      this.currentFilter = query;
    }
  }
});
export default DashboardAgencyTab;
export type DashboardAgencyTabRef = InstanceType<typeof DashboardAgencyTab>;
</script>
