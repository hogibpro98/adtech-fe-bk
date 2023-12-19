<template>
  <div>
    <show-chart-and-table
      :chart="chart"
      :title="bannerInformation.name"
      :min="bannerInformation.created_at || campaign.start_time"
      :max="[campaign.end_time, Date.now()] | minDate"
    >
    </show-chart-and-table>
    <v-flex sm11 class="pt-8 mx-auto">
      <v-card flat>
        <v-overlay v-if="loading" absolute color="#fff" class="z-1">
          <v-progress-circular
            :width="4"
            :size="25"
            indeterminate
            color="primary"
          >
          </v-progress-circular>
        </v-overlay>
        <step-review-banner-sms
          v-model="dataViewAds"
          :loading="loading"
          show-template-id
          only-edit-in-dialog
        />
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import StepReviewBannerMMS from "@/components/page/manage-campaign/banner/steps/StepReviewBannerMMS.vue";
import StepReviewBannerSms from "~/components/page/manage-ads/sms/index/step/StepReviewBannerSms.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import { convertDataToUpdateAdsMMS } from "@/util/ads";
import { STATUS_BANNER_MMS } from "@/constants/dataSelect";
import { responseErrorToString } from "@/util/array";
import { flatten, isEqual, cloneDeep } from "lodash";
import Vue, { VueConstructor } from "vue";
import BannerMMSChart from "~/components/page/manage-campaign/banner/BannerMMSChart.vue";
import { fetchPermissionToStorage } from "~/util/permission";
import GlobalDataInterface from "~/interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "~/components/common/ShowChartAndTable.vue";
import { BannerMMSInterface } from "~/interface/data/banner";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import BannerSmsChart from "~/components/page/manage-ads/sms/index/BannerSmsChart.vue";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
  dataViewAds: BannerMMSInterface;
  bannerInformation: BannerMMSInterface;
  loading: boolean;
  bannerId: number | string;
  campaign: CampaignInterface;
  $campaignRepository: RepositoryInterface;
  $adsMMSRepository: RepositoryInterface;
}

interface ComponentMethods {
  migrateData(adsInformation: BannerMMSInterface): BannerMMSInterface;
  createCampaign(newCampaign: CampaignInterface, cb: Function): void;
  fetchDataBanner(bannerId: string | number): void;
  editItem(data: BannerMMSInterface): void;
  getStatusBanner(item: BannerMMSInterface): object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    StepReviewBannerMMS,
    ShowChartAndTable,
    StepReviewBannerSms
  },
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        component: BannerSmsChart,
        queryParams: {
          id: this.$route.params.id
        }
      },
      dataViewAds: {},
      bannerInformation: {},
      loading: false
    };
  },
  computed: {
    bannerId() {
      return this.$route.params.id;
    },
    campaign() {
      if (!this.bannerInformation) return {};

      return this.bannerInformation.campaign || {};
    }
  },
  watch: {
    bannerId(val) {
      this.fetchDataBanner(val);
      this.chart.queryParams.id = val;
    },
    dataViewAds: {
      handler(data) {
        if (data.id && !isEqual(data, this.bannerInformation)) {
          if (data.typeCampaign === "create-new-campaign") {
            this.createCampaign(data.newCampaign, newCampaign => {
              this.editItem({
                ...data,
                campaign: newCampaign
              });
            });
          } else {
            this.editItem(data);
          }
        }
      },
      deep: true
    }
  },
  async mounted() {
    await fetchPermissionToStorage({
      namePage: "manage-ads-list-ads-mms",
      app: this,
      $auth: this.$auth
    });

    await this.fetchDataBanner(this.$route.params.id);
  },
  methods: {
    migrateData(adsInformation) {
      adsInformation.dateRange = [
        new Date(adsInformation.start_time),
        new Date(adsInformation.end_time)
      ];
      if (adsInformation.media) {
        adsInformation.media.forEach(({ type, data }) => {
          adsInformation[type] = data;
        });
      }
      return adsInformation;
    },
    async createCampaign(newCampaign, cb) {
      const owner = newCampaign.owner;
      if (!newCampaign) return;
      const [startDate, endDate] = newCampaign.period;
      const dataNewCampaign = {
        name: newCampaign.name,
        budget: newCampaign.budget,
        agency_id: null,
        advertiser_id: null,
        start_time: null,
        end_time: null
      };

      if (owner) {
        if (owner.is_agency) {
          dataNewCampaign.agency_id = owner.id;
        } else {
          const agency = owner.agency || {};
          dataNewCampaign.agency_id = agency.id;
          dataNewCampaign.advertiser_id = owner.id;
        }
      }

      if (startDate) {
        dataNewCampaign.start_time = this.$filters.getTime(startDate);
      } else {
        dataNewCampaign.start_time = this.$filters.getTime();
      }

      if (endDate) {
        dataNewCampaign.end_time = this.$filters.getTime(endDate);
      } else {
        dataNewCampaign.end_time = dataNewCampaign.start_time;
      }

      this.loading = true;
      try {
        const res = await this.$campaignRepository.create(dataNewCampaign);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          if (cb) {
            cb(res.data);
          }
        } else {
          this.$toast.global.server_error_msg(
            responseErrorToString(res.errors)
          );
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },
    async fetchDataBanner(bannerId) {
      try {
        this.loading = true;
        const res = await this.$adsSmsRepository.getDetail(bannerId);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          const item = this.migrateData(cloneDeep(res.data));
          this.bannerInformation = item;
          this.dataViewAds = cloneDeep(item);
        } else {
          this.$toast.global.server_error_msg("Không tìm thấy quảng cáo");
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
    async editItem(data) {
      this.loading = true;
      try {
        const res = await this.$adsSmsRepository.update(
          convertDataToUpdateAdsMMS(data)
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.$toast.global.edit_success("quảng cáo");
          this.bannerInformation = cloneDeep(res.data);
          this.dataViewAds = cloneDeep(res.data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    },
    getStatusBanner(item) {
      return STATUS_BANNER_MMS.find(({ value }) => item.status === value) || {};
    }
  }
});
</script>
