<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex xs12>
        <v-divider></v-divider>
        <api-data-table
          ref="table"
          :headers="headers"
          :toolbar="{
            isCreate: false
          }"
          resource="user-telco-quota"
          @add-item="handleAddItem"
          @edit-items="handleEditItem"
          @delete-items="handleDeleteItem"
        >
          <template slot="header.quota_configs" slot-scope="{ item }">
            <v-row
              no-gutters
              class="d-flex justify-content-center px-0 align-items-center"
              style="height: 30px"
            >
              Cấu hình Quota
            </v-row>
            <v-divider />
            <v-row no-gutters class="discount-config-row">
              <v-col
                class="col-2 d-flex sub-header money-cell justify-content-end pr-4"
              >
                Nhà mạng
              </v-col>
              <v-col
                class="col-2 d-flex sub-header money-cell justify-content-end pr-4"
              >
                Số tin nhắn tối đa 1 tháng
              </v-col>
              <v-col
                class="col-2 d-flex sub-header money-cell justify-content-end discount-cell pr-4"
              >
                Số tin nhắn tối đa 1 năm
              </v-col>
              <v-col
                class="col-2 d-flex sub-header money-cell justify-content-end pr-4"
              >
                Số tin nhắn đã gửi tháng này
              </v-col>
              <v-col
                class="col-2 d-flex sub-header money-cell justify-content-end discount-cell pr-4"
              >
                Số tin nhắn đã gửi năm nay
              </v-col>
              <v-col
                class="col-2 d-flex sub-header  justify-content-end discount-cell pr-4"
              >
                Ngưỡng cảnh báo
              </v-col>
            </v-row>
          </template>
          <template slot="item.name" slot-scope="props">{{
            props.item.name
          }}</template>
          <template slot="item.quota_configs" slot-scope="props">
            <div v-if="props.item.quota_configs.length > 0">
              <v-row
                v-for="(item, index) in props.item.quota_configs"
                :key="index"
                class=" discount-config-row"
                no-gutters
              >
                <v-col class="col-2 d-flex money-cell justify-content-end pr-4">
                  {{ item.telco_code }}
                </v-col>
                <v-col
                  class="col-2 d-flex money-cell discount-cell justify-content-end pr-4 "
                >
                  {{ item.quota_month | numberSpace }}
                </v-col>
                <v-col
                  class="col-2 d-flex money-cell discount-cell justify-content-end pr-4 "
                >
                  {{ item.quota_year | numberSpace }}
                </v-col>
                <v-col
                  class="col-2 d-flex money-cell discount-cell justify-content-end pr-4 "
                >
                  {{ item.current_month | numberSpace }}
                </v-col>
                <v-col
                  class="col-2 d-flex money-cell discount-cell justify-content-end pr-4 "
                >
                  {{ item.current_year | numberSpace }}
                </v-col>
                <v-col
                  class="col-2 d-flex discount-cell  justify-content-end pr-4"
                >
                  {{ item.warning_threshold }}%
                </v-col>
              </v-row>
            </div>
            <span
              v-else
              class="d-flex justify-content-center px-0 align-items-center"
            >
              Chưa cấu hình Quota
            </span>
          </template>
        </api-data-table>
      </v-flex>
    </v-layout>
    <quota-dialog
      ref="profileDiscountedRateDialog"
      @action-success="refreshTable"
    ></quota-dialog>
    <delete-quota-dialog
      ref="deleteDiscountProfileDialog"
      @action-success="refreshTable"
    ></delete-quota-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import ProfileDiscountedRateDialog from "~/components/page/profile-discounted-rate/ProfileDiscountedRateDialog.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import DeleteDiscountProfileDialog from "~/components/discount-profile/DeleteDiscountProfileDialog.vue";
import QuotaDialog from "~/components/page/manage-quota/QuotaDialog.vue";
import DeleteQuotaDialog from "~/components/page/manage-quota/DeleteQuotaDialog.vue";
export default Vue.extend({
  name: "Index",
  components: {
    DeleteDiscountProfileDialog,
    ApiDataTable,
    ProfileDiscountedRateDialog,
    NewCustomFilter,
    QuotaDialog,
    DeleteQuotaDialog
  },
  permission: false,
  layout: "dashboard",
  data() {
    return {
      filters: []
    };
  },
  craeted() {
    this.isEmoji();
  },
  computed: {
    headers() {
      return [
        {
          text: "Tên Agency",
          value: "username",
          width: 250
        },
        {
          text: "Config Quota",
          value: "quota_configs",
          sortable: false,
          width: 1200,
          class: "padding-x-0",
          cellClass: "padding-x-0"
        },
        {
          text: "Hành Động",
          value: "action",
          sortable: false,
          align: "Center",
          width: "75",
          actions: [
            {
              icon: "edit",
              label: "Cấu hình quota",
              color: "primary",
              event: "edit-items"
            }
          ]
        }
      ];
    }
  },
  methods: {
    handleEditItem(item) {
      this.$refs.profileDiscountedRateDialog.show(item);
    },
    handleDeleteItem(item) {
      this.$refs.deleteDiscountProfileDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    handleAddItem() {
      this.$refs.profileDiscountedRateDialog.show();
    }
  }
});
</script>

<style>
.discount-config-row:not(:last-child) {
  border-bottom: 1px solid #ccc;
}
.money-cell {
  border-right: 1px solid #ccc;
  height: 40px;
  align-items: center;
}
.discount-cell {
  height: 40px;
  align-items: center;
  padding-left: 12px !important;
}
.sub-header {
  font-weight: bold;
  height: 50px !important;
}
.padding-x-0 {
  padding-right: 0 !important;
  padding-left: 0 !important;
}
</style>
