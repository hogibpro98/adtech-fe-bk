<template>
  <div>
    <v-layout row wrap>
      <v-flex v-if="isAdmin" xs12 xl6>
        <role-stats />
      </v-flex>
      <v-flex v-if="isAdmin" xs12 xl6>
        <simple-pie-chart
          lazy
          title="Cơ cấu agency theo trạng thái"
          redirect="/admin/user"
          url="/summary/agency-status"
        />
      </v-flex>
    </v-layout>
  </div>
</template>
<script lang="ts">
import Material from "vuetify/es5/util/colors";
import SimplePieChart from "@/components/chart/common/SimplePieChart.vue";
import * as USER_ROLES from "@/constants/role";
import { ROLE_ADVERTISER, ROLE_IS_ADMIN } from "@/constants/role";
import { RESOURCE } from "@/constants/filterType";
import CampaignSelect from "@/components/select/CampaignSelect.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import RoleStats from "@/components/page/dashboard/RoleStats.vue";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

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

const DashboardAdminTab = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {

    RoleStats,
    SimplePieChart,
  },
  props: {
    dateStatistics: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({
    color: Material,
    currentFilter: {},
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
  created() {},
  methods: {}
});
export default DashboardAdminTab;
export type DashboardAdminTabRef = InstanceType<typeof DashboardAdminTab>;
</script>
