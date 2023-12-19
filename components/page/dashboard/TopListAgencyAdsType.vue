<template>
  <overview-table
    v-bind="$attrs"
    lazy
    :headers="displayHeaders"
    :resource="resource"
    :filter="mappedFilter"
    :time-range="timeRange"
    is-show-selection
    :selections="selections"
    :title="title"
    title-col="name"
    :redirect="redirect"
  >
    <template slot="item.name" slot-scope="{ item }">
      <nuxt-link
        v-if="hideHeaderItem !== 'data'"
        :to="`${redirect}/${item && item.id}`"
        class="truncate-2"
      >
        {{ item.name }}
      </nuxt-link>
      <span v-else>
        {{ item.name }}
      </span>
    </template>

    <!--selection-->
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
import { DATA_SPONSOR } from "~/constants/resource";
import Template from "~/pages/manage-ads/sms/template.vue";

interface ComponentData extends GlobalDataInterface {
  headers: Array<DataTableHeader>;
}

interface ComponentMethods {}

const TopListAgencyAdsType = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TopListAgencyAdsType",
  components: { Template, OverviewTable },
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
      default: () => {}
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
          text: "Tổng tiền đã tiêu",
          value: "amount_money",
          align: "right",
          width: 144,
          formatter: item => {
            return this.$filters?.currency(item.amount_money) || "-";
          }
        },
        {
          text: "Tổng data đã gửi",
          value: "amount_capacity",
          align: "right",
          width: 200,
          formatter: item => {
            return this.$filters?.numberSpace(item.amount_capacity) + "MB";
          }
        },
        {
          text: "Tổng số thuê bao đã gửi",
          value: "num_sent",
          align: "right",
          width: 144
        },
        {
          text: "Ngân sách dự kiến",
          value: "budget",
          align: "right",
          width: 200,
          formatter: item => {
            return this.$filters?.currency(item.budget) || "-";
          }
        },
        {
          text: "Chi phí tạm tính",
          value: "total_price",
          align: "right",
          width: 160,
          formatter: item => {
            return this.$filters?.currency(item.total_price) || "-";
          }
        },
        {
          text: "Tổng số thuê bao sẽ gửi",
          value: "total_rows",
          align: "right",
          width: 144
        },
        {
          text: "Tổng data sẽ gửi",
          value: "total_data",
          align: "right",
          width: 200,
          formatter: item => {
            return this.$filters?.numberSpace(item.total_data) + "MB";
          }
        }
      ],
      title: "",
      resource: "",
      redirect: "",
      hideHeaderItem: "",
      selectedAgencyAdsType: null
    };
  },

  computed: {
    displayHeaders() {
      return this.headers.filter(e => {
        return !this.hideHeaders[this.hideHeaderItem].includes(e.value);
      });
    },
    mappedFilter() {
      if (this.hideHeaderItem === "campaign") {
        if (this.filter.resource_campaign_id !== undefined) {
          const map = {
            ...this.filter,
            resource_id: this.filter.resource_campaign_id
          };
          this.$delete(map, "resource_campaign_id");
          return map;
        }
      }
      return this.filter;
    },
    selections() {
      return [
        {
          text: "Tài trợ data",
          value: "data",
          resource: DATA_SPONSOR,
          title: "Danh sách top tài trợ data",
          redirect: "/manage-ads/data",
          headers: [
            {
              text: "Tổng tiền đã tiêu",
              value: "amount_money",
              align: "right",
              width: 144,
              formatter: item => {
                return this.$filters?.currency(item.amount_money) || "-";
              }
            },
            {
              text: "Tổng data đã gửi",
              value: "amount_capacity",
              align: "right",
              width: 200,
              formatter: item => {
                return this.$filters?.numberSpace(item.amount_capacity) + "MB";
              }
            },
            {
              text: "Tổng số thuê bao đã gửi",
              value: "num_sent",
              align: "right",
              width: 144
            },
            {
              text: "Ngân sách dự kiến",
              value: "budget",
              align: "right",
              width: 200,
              formatter: item => {
                return this.$filters?.currency(item.budget) || "-";
              }
            },
            {
              text: "Chi phí tạm tính",
              value: "total_price",
              align: "right",
              width: 160,
              formatter: item => {
                return this.$filters?.currency(item.total_price) || "-";
              }
            },
            {
              text: "Tổng số thuê bao sẽ gửi",
              value: "total_rows",
              align: "right",
              width: 144
            },
            {
              text: "Tổng data sẽ gửi",
              value: "total_data",
              align: "right",
              width: 200,
              formatter: item => {
                return this.$filters?.numberSpace(item.total_data) + "MB";
              }
            }
          ]
        },
        {
          text: "Quảng cáo redirect",
          value: "redirect",
          resource: this.$authHasRole(ROLE_ADVERTISER)
            ? "/advertiser/banner"
            : "/banner",
          title: "Danh sách top quảng cáo Redirect",
          redirect: "/manage-ads/list-ads-redirect",
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
        },
        {
          text: "Chiến dịch",
          value: "campaign",
          resource: this.$authHasRole(ROLE_ADVERTISER)
            ? "/advertiser/campaign"
            : "/campaign",
          title: "Danh sách top chiến dịch",
          redirect: "/manage-campaign/list",
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
        },
        {
          text: "MMS",
          value: "mms",
          resource: this.$authHasRole(ROLE_ADVERTISER)
            ? "/advertiser/ads-mms"
            : "/ads-mms",
          title: "Danh sách top tin nhắn MMS",
          redirect: "/manage-ads/list-ads-mms",
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
        },
        {
          text: "SMS",
          value: "sms",
          resource: this.$authHasRole(ROLE_ADVERTISER)
            ? "/advertiser/ads-sms"
            : "/ads-sms",
          title: "Danh sách top tin nhắn SMS",
          redirect: "/manage-ads/sms",
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
        this.hideHeaderItem = val.value;
        this.headers = val.headers;
      }
    }
  },

  created() {
    this.title = "Danh sách top tài trợ data";
    this.resource = DATA_SPONSOR;
    this.redirect = "/manage-ads/data";
    this.hideHeaderItem = "data";
    this.selectedAgencyAdsType = this.selections[0];
  }
});

export default TopListAgencyAdsType;
export type TopListAgencyAdsTypeRef = InstanceType<typeof TopListAgencyAdsType>;
</script>

<style scoped>
.disabled-link {
  color: black;
}
</style>
