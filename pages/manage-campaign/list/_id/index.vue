<template>
  <div :class="showFullScreen && 'show-full-screen'">
    <header-select-time
      v-if="campaignInformation.name"
      v-model="dateStatistics"
      :title="campaignInformation.name"
      :min="campaignInformation.start_time"
      :max="[campaignInformation.end_time, Date.now()] | minDate"
    />
    <v-container grid-list-xl fluid class="no-padding no-margin">
      <v-layout row wrap class="no-margin">
        <v-flex lg12 class="no-padding no-margin">
          <campaign-chart
            :date-statistics="timeRange"
            :query-params="queryParamsChart"
            :show="showChart"
          />
        </v-flex>
      </v-layout>
    </v-container>
    <v-flex v-if="campaignInformation.id" sm11 class="pt-8 mx-auto">
      <v-row class="no-margin">
        <v-flex sm11>
          <v-row class="no-margin">
            <v-flex md6 xs12 class="form-group pr-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Tên chiến dịch:
                </span>
                <span class="form-group">
                  {{ campaignInformation.name }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Trạng thái:
                </span>
                <span class="form-group">
                  {{ getStatusCampaign(campaignInformation).text }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Tên agency:
                </span>
                <span class="form-group">
                  {{
                    campaignInformation.agency
                      ? campaignInformation.agency.full_name
                      : "-"
                  }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Tên advertiser:
                </span>
                <span class="form-group">
                  {{
                    campaignInformation.advertiser
                      ? campaignInformation.advertiser.full_name
                      : "-"
                  }}
                </span>
              </v-row>
            </v-flex>
            <v-flex
              v-if="isPermissionShowPrice"
              md6
              xs12
              class="form-group pr-1"
            >
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Ngân sách dự kiến:
                </span>
                <span class="form-group">
                  {{ campaignInformation.budget | currency }}
                </span>
              </v-row>
            </v-flex>
            <v-flex md6 xs12 class="form-group pr-1">
              <v-row class="no-margin">
                <span class="mr-2 font-weight-medium label-detail-campaign">
                  Thời gian diễn ra:
                </span>
                <span class="form-group">
                  {{ campaignInformation.start_time | date }} -
                  {{ campaignInformation.end_time | date }}
                </span>
              </v-row>
            </v-flex>
          </v-row>
        </v-flex>
        <v-flex sm1>
          <v-icon
            v-if="isPermissionEdit"
            class="pointer ml-0 mt-0 button-edit-banner"
            @click="editCampaign"
          >
            edit
          </v-icon>
        </v-flex>
      </v-row>
    </v-flex>
    <v-flex xs12 class="mt-4">
      <v-tabs color="primary accent-4" left>
        <v-tab>Danh sách QC Redirect</v-tab>
        <v-tab>Danh sách tin nhắn MMS</v-tab>
        <v-tab>Danh sách tin nhắn SMS</v-tab>
        <v-tab>Danh sách chương trình tài trợ data</v-tab>
        <v-tab-item key="tab-item-1">
          <v-container grid-list-xl fluid class="no-padding no-margin">
            <v-layout row wrap class="no-margin">
              <banner-table
                :filter-custom="queryParamsTable"
                :form-selected-campaign="campaignInformation"
                :use-param-url="false"
                :header-excludes="[
                  'advertiser',
                  'agency',
                  'campaign',
                  'campaign_id'
                ]"
                :filter-excludes="[
                  'advertiser_id',
                  'agency_id',
                  'campaign',
                  'campaign_id'
                ]"
                :toolbar="{
                  isCreate: isCreatableBanner,
                  isToggleChart: true,
                  isDownload: true,
                  isFullScreen: true,
                  exportResource: BANNER
                }"
                :show-chart="showChart"
                @toggle-chart="toggleChart"
                @full-screen="toggleFullScreen"
                @change-filter="changeTableFilter"
              />
            </v-layout>
          </v-container>
        </v-tab-item>
        <v-tab-item key="tab-item-2">
          <v-container grid-list-xl fluid class="no-padding no-margin">
            <v-layout row wrap class="no-margin">
              <banner-m-m-s-table
                :filter-custom="queryParamsTable"
                :use-param-url="false"
                :header-excludes="[
                  'advertiser',
                  'agency',
                  'campaign',
                  'campaign_id'
                ]"
                :filter-excludes="[
                  'advertiser_id',
                  'agency_id',
                  'campaign',
                  'campaign_id'
                ]"
                :form-selected-campaign="campaignInformation"
                :show-chart="showChart"
                :toolbar="{
                  isCreate: isCreatableBanner,
                  isToggleChart: true,
                  isDownload: true,
                  isFullScreen: true,
                  exportResource: ADS_MMS
                }"
                @toggle-chart="toggleChart"
                @full-screen="toggleFullScreen"
                @change-filter="changeTableFilter"
              />
            </v-layout>
          </v-container>
        </v-tab-item>
        <v-tab-item key="tab-item-3">
          <v-container grid-list-xl fluid class="no-padding no-margin">
            <v-layout row wrap class="no-margin">
              <banner-sms-table
                :filter-custom="queryParamsTable"
                :use-param-url="false"
                :header-excludes="[
                  'advertiser',
                  'agency',
                  'campaign',
                  'campaign_id'
                ]"
                :filter-excludes="[
                  'advertiser_id',
                  'agency_id',
                  'campaign',
                  'campaign_id'
                ]"
                :form-selected-campaign="campaignInformation"
                :show-chart="showChart"
                :toolbar="{
                  isCreate: isCreatableBanner,
                  isToggleChart: true,
                  isDownload: true,
                  isFullScreen: true,
                  exportResource: ADS_SMS
                }"
                @toggle-chart="toggleChart"
                @full-screen="toggleFullScreen"
                @change-filter="changeTableFilter"
              />
            </v-layout>
          </v-container>
        </v-tab-item>
        <v-tab-item key="tab-item-4">
          <v-container grid-list-xl fluid class="no-padding no-margin">
            <v-layout row wrap class="no-margin">
              <data-sponsor-table
                :filter-custom="queryParamsTable"
                :use-param-url="false"
                :header-excludes="[
                  'advertiser',
                  'agency',
                  'campaign_name',
                  'campaign_id'
                ]"
                :filter-excludes="[
                  'advertiser_id',
                  'agency_id',
                  'campaign',
                  'campaign_id'
                ]"
                :form-selected-campaign="campaignInformation"
                :show-chart="showChart"
                @toggle-chart="toggleChart"
                @full-screen="toggleFullScreen"
                @change-filter="changeTableFilter"
              />
            </v-layout>
          </v-container>
        </v-tab-item>
      </v-tabs>
    </v-flex>
    <campaign-form-dialog
      ref="dialog"
      @update-success="updateCampaignInformation"
    ></campaign-form-dialog>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import HeaderSelectTime from "@/components/common/HeaderSelectTime.vue";
import BannerTable from "@/components/page/manage-campaign/banner/BannerTable.vue";
import BannerMMSTable from "@/components/page/manage-campaign/banner/BannerMMSTable.vue";
import CampaignChart from "@/components/page/manage-campaign/campaign/CampaignChart.vue";
import CampaignFormDialog from "@/components/page/manage-campaign/campaign/CampaignFormDialog.vue";
import ACTIONS from "@/constants/actions";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import { STATUS_CAMPAIGN } from "@/constants/dataSelect";
import { flatten } from "lodash";
import GlobalDataInterface from "../../../../interface/data/global";
import { CampaignInterface } from "~/interface/data/campaign";
import { CampaignFormDialogRef } from "~/components/page/manage-campaign/campaign/CampaignFormDialog.vue";
import { fetchPermissionToStorage } from "~/util/permission";
import { BANNER, ADS_MMS, ADS_SMS } from "~/constants/resource";
import { responseErrorToString } from "~/util/array";
import BannerSmsTable from "~/components/page/manage-ads/sms/index/BannerSmsTable.vue";
import DataSponsorTable from "~/components/page/manage-ads/data/DataSponsorTable.vue";

interface ComponentData extends GlobalDataInterface {
  campaignInformation: CampaignInterface;
  dateStatistics: Array<string>;
  userId: number | string;
  loading: boolean;
  showChart: boolean;
  showFullScreen: boolean;
  tableFilter: object;
  BANNER: string;
  ADS_MMS: string;
  isCreatableBanner: boolean;
  isPermissionEdit: boolean;
  isPermissionShowPrice: boolean;
  campaignId: number | string;
  timeRange: Array<string>;
  queryParamsChart: object;
  queryParamsTable: object;
  $refs: {
    dialog: CampaignFormDialogRef;
  };
}

interface ComponentMethods {
  editCampaign(): void;
  updateCampaignInformation(data: CampaignInterface): void;
  fetchDataCampaign(campaignId: number | string): void;
  getStatusCampaign(item: CampaignInterface): object;
  toggleChart(val: boolean): void;
  toggleFullScreen(val: boolean): void;
  changeTableFilter(val: object): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    DataSponsorTable,
    BannerSmsTable,
    CampaignFormDialog,
    CampaignChart,
    HeaderSelectTime,
    BannerMMSTable,
    BannerTable
  },
  provide() {
    const toggleResize = {};
    Object.defineProperty(toggleResize, "value", {
      enumerable: true,
      get: () => this.showFullScreen && this.showChart
    });
    return { toggleResize };
  },
  layout: "dashboard-without-header",
  data() {
    return {
      campaignInformation: {},
      dateStatistics: this.$filters.sqlDate([
        Date.now() - 6 * 24 * 3600 * 1000,
        Date.now()
      ]),
      loading: false,
      userId: this.$auth.user.id,
      showChart: true,
      showFullScreen: false,
      tableFilter: {},
      BANNER,
      ADS_MMS,
      ADS_SMS
    };
  },
  computed: {
    isCreatableBanner() {
      const statusCreatable = ["running", "waiting"];
      return statusCreatable.includes(this.campaignInformation?.status);
    },
    isPermissionEdit() {
      if (this.campaignInformation?.item_permissions) {
        return this.campaignInformation?.item_permissions?.includes("edit");
      }
      return this.$can(`manage-campaign-list.${ACTIONS.EDIT}`);
    },
    isPermissionShowPrice() {
      return this.$can(`manage-campaign-list.${ACTIONS.SHOW_PRICE}`);
    },
    campaignId() {
      return this.$route.params.id;
    },
    timeRange() {
      return this.$filters.sqlDate(this.dateStatistics);
    },
    queryParamsChart() {
      return {
        ...this.tableFilter,
        id: this.$route.params.id
      };
    },
    queryParamsTable() {
      return {
        time_range: this.timeRange,
        resource_campaign_id: this.$route.params.id
      };
    }
  },
  watch: {
    campaignId(val) {
      this.fetchDataCampaign(val);
    }
  },
  async mounted() {
    await fetchPermissionToStorage({
      namePage: "manage-campaign-list",
      app: this,
      $auth: this.$auth
    });

    this.fetchDataCampaign(this.$route.params.id);
  },
  methods: {
    editCampaign() {
      this.$refs.dialog.show(this.campaignInformation);
    },
    updateCampaignInformation(data) {
      this.campaignInformation = data;
    },
    async fetchDataCampaign(campaignId) {
      try {
        const res = await this.$campaignRepository.getDetail(campaignId);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.campaignInformation = res.data;
        } else {
          this.$toast.global.server_error_msg("Không tìm thấy chiến dịch");
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.server_error_msg("Lỗi hệ thống");
          console.log(e);
        }
      }
    },
    getStatusCampaign(item) {
      return STATUS_CAMPAIGN.find(({ value }) => item.status === value) || {};
    },
    toggleChart(val) {
      this.showChart = val;
    },
    toggleFullScreen(val) {
      this.showFullScreen = val;
    },
    changeTableFilter(val) {
      this.tableFilter = val || {};
    }
  }
});
</script>
<style>
.label-detail-campaign {
  width: 10rem;
}
</style>
