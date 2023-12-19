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
        <step-review-banner
          v-model="dataViewAds"
          :loading="loading"
          only-edit-in-dialog
        />
      </v-card>
    </v-flex>
  </div>
</template>
<script lang="ts">
import ShowChartAndTable from "@/components/common/ShowChartAndTable.vue";
import BannerChart from "@/components/page/manage-campaign/banner/BannerChart.vue";
import StepReviewBanner from "@/components/page/manage-campaign/banner/steps/StepReviewBanner.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import {
  convertDataToUpdateAdsRedirect,
  convertDataToUpdateCampaign
} from "@/util/ads";
import { STATUS_BANNER_MMS } from "@/constants/dataSelect";
import { responseErrorToString } from "@/util/array";
import { flatten, isEqual, cloneDeep } from "lodash";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "../../../../interface/data/global";
import {
  ChartDataInterface,
  TableDataInterface
} from "../../../../components/common/ShowChartAndTable.vue";
import { BannerRedirectInterface } from "~/interface/data/banner";
import { CampaignInterface } from "~/interface/data/campaign";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { fetchPermissionToStorage } from "~/util/permission";

interface ComponentData extends GlobalDataInterface {
  chart: ChartDataInterface;
  table: TableDataInterface;
  dataViewAds: BannerRedirectInterface;
  bannerInformation: BannerRedirectInterface;
  loading: boolean;
  bannerId: number | string;
  campaign: CampaignInterface;
  $campaignRepository: RepositoryInterface;
  $adsMMSRepository: RepositoryInterface;
}

interface ComponentMethods {
  migrateData(adsInformation: BannerRedirectInterface): BannerRedirectInterface;
  createCampaign(newCampaign: CampaignInterface, cb: Function): void;
  fetchDataBanner(bannerId: string | number): void;
  editItem(data: BannerRedirectInterface): void;
  getStatusBanner(item: BannerRedirectInterface): object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    StepReviewBanner,
    ShowChartAndTable
  },
  layout: "dashboard-without-header",
  data() {
    return {
      chart: {
        props: {},
        component: BannerChart,
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
      namePage: "manage-ads-list-ads-redirect",
      app: this,
      $auth: this.$auth
    });

    await this.fetchDataBanner(this.$route.params.id);
  },
  methods: {
    async createCampaign(newCampaign, cb) {
      const dataNewCampaign = convertDataToUpdateCampaign(newCampaign);

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
        const res = await this.$bannerRepository.getDetail(bannerId);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          const item = res.data;
          item.cpc = {
            min: item.min_cpc || 0,
            max: item.max_cpc || 0
          };

          item.cpm = {
            min: item.min_cpm || 0,
            max: item.max_cpm || 0
          };
          this.bannerInformation = cloneDeep(item);
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
        const res = await this.$bannerRepository.update(
          convertDataToUpdateAdsRedirect(data)
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
