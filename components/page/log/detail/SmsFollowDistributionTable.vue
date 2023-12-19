<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbar"
            :use-param-url="false"
            calculate-widths
            v-on="$listeners"
          >
            <template slot="item.created_at" slot-scope="{ item }">
              {{ item.created_at | timestamp }}
            </template>
            <template slot="item.updated_at" slot-scope="{ item }">
              {{ item.updated_at | date }}
            </template>
            <template slot="item.real_price" slot-scope="{ item }">
              <div class="text-right">
                {{ item.real_price | currency }}
              </div>
            </template>
            <template slot="item.sms_type" slot-scope="{ item }">
              {{ typeMap[item.sms_type] }}
            </template>
            <template slot="item.transid" slot-scope="{ item }">
              <div v-if="item.transid">
                <div v-if="item.transid === smsBeforeTransid">
                  Tim SMS tích hợp
                </div>
                <div v-else>
                  Tim xác nhận
                </div>
              </div>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="statusMap[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
              >
                {{ statusMap[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.price" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price | currency }}
              </div>
            </template>
            <template slot="item.price_per_mms" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price_per_mms | currency }}
              </div>
            </template>
            <template slot="item.duration" slot-scope="{ item }">
              <div class="text-right">{{ item.duration }} ngày</div>
            </template>
            <template
              v-for="(_, name) in $scopedSlots"
              :slot="name"
              slot-scope="slotData"
            >
              <slot :name="name" v-bind="slotData"/>
            </template>
          </api-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import {DATA_DISTRIBUTIONS_DETAIL} from "@/constants/resource";
import Vue, {VueConstructor} from "vue";
import {DataTableHeader} from "vuetify";
import {FilterInterface} from "~/interface/data/filter";
import ApiDataTable, {ApiDataTableRef} from "~/components/table/ApiDataTable.vue";
import {ROLE_IS_ADMIN} from "~/constants/role";
import {GlobalDataInterface} from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  showUserApprove: boolean;
  headers: Array<DataTableHeader>;
  headerShow: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  $refs: {
    table: ApiDataTableRef;
  };
}

interface ComponentMethod {
}

export default (Vue as VueConstructor<Vue & ComponentData & ComponentMethod>).extend({
  name: "SmsFollowDistributionTable",
  components: {
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: DATA_DISTRIBUTIONS_DETAIL
    },
    smsBeforeTransid: {
      type: String,
      default: ""
    },
    toolbar: {
      type: Object,
      default: () => ({
        isSearch: false,
        isCreate: false,
        isToggleChart: false,
        isFullScreen: false
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    },
    headerExcludes: {
      type: Array,
      default: () => []
    },
    filterExcludes: {
      type: Array,
      default: () => []
    },
    createBannerSMS: {
      type: Boolean,
      default: false
    },
    createBannerRedirect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      statusMap: {
        success: {
          color: "success",
          text: "Thành công"
        },
        fail: {
          color: "error",
          text: "Thất bại"
        }
      },
      headers: [
        {
          text: "Mã transaction",
          value: "transid",
          width: 180,
          sortable: false
        },
        {
          text: "Nội dung tin",
          value: "content",
          width: 240,
          sortable: false
        },
        {
          text: "Loại tin",
          value: "sms_type",
          width: 140,
          sortable: false
        },
        {
          text: "Loại tin SMS",
          value: "transid",
          width: 200,
          sortable: false
        },
        {
          text: "Trạng thái gửi đến SMSC",
          value: "status",
          width: 200,
          align: "right",
          sortable: false
        },
        {
          text: "Trạng thái nhận SMS",
          value: "cdr_state",
          width: 200,
          sortable: false
        },
        {
          text: "Giá",
          value: "price",
          width: 120,
          align: "right",
          sortable: false
        },
        {
          text: "Mã template",
          value: "temp_id",
          width: 200,
          sortable: false
        },
        {
          text: "Lĩnh vực",
          value: "business_activity",
          width: 180,
          sortable: false
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 120,
          sortable: false
        }
      ],
      typeMap: ["CSKH", "Quảng cáo"]
    };
  },
  computed: {
    headerShow() {
      return this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );
    },
    showUserApprove() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    filterShow() {
      return this.filters.filter(f => !this.filterExcludes.includes(f.name));
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    }
  }
});
</script>
