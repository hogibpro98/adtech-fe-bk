<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex xs12>
        <v-divider></v-divider>
        <api-data-table
          ref="table"
          :headers="headers"
          :toolbar="{
            isCreate: true
          }"
          resource="discount-profile"
          @add-item="handleAddItem"
          @edit-item="handleEditItem"
          @delete-item="handleDeleteItem"
        >
          <template slot="header.discount_config" slot-scope="{ item }">
            <v-row
              no-gutters
              class="d-flex justify-content-center px-0 align-items-center"
              style="height: 30px"
            >
              Giá trị chiết khấu
            </v-row>
            <v-divider />
            <v-row no-gutters class="discount-config-row">
              <v-col
                class="col-6 d-flex sub-header money-cell justify-content-end pr-4"
              >
                Số tiền
              </v-col>
              <v-col
                class="col-6 d-flex sub-header justify-content-end discount-cell pr-4"
              >
                Phần trăm chiết khấu
              </v-col>
            </v-row>
          </template>
          <template slot="item.name" slot-scope="props">{{
            props.item.name
          }}</template>
          <template slot="item.discount_config" slot-scope="props">
            <v-row
              v-for="(item, index) in props.item.discount_config"
              :key="index"
              class=" discount-config-row"
              no-gutters
            >
              <v-col class="col-6 d-flex money-cell justify-content-end pr-4">
                {{ item.money | currency }}
              </v-col>
              <v-col
                class="col-6 d-flex discount-cell justify-content-end pr-4 "
              >
                {{ item.discounted_rates }}%
              </v-col>
            </v-row>
          </template>
        </api-data-table>
      </v-flex>
    </v-layout>
    <profile-discounted-rate-dialog
      ref="profileDiscountedRateDialog"
      @action-success="refreshTable"
    ></profile-discounted-rate-dialog>
    <delete-discount-profile-dialog
      ref="deleteDiscountProfileDialog"
      @action-success="refreshTable"
    ></delete-discount-profile-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import ProfileDiscountedRateDialog from "~/components/page/profile-discounted-rate/ProfileDiscountedRateDialog.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import DeleteDiscountProfileDialog from "~/components/discount-profile/DeleteDiscountProfileDialog.vue";

export default Vue.extend({
  name: "Index",
  components: {
    DeleteDiscountProfileDialog,
    ApiDataTable,
    ProfileDiscountedRateDialog,
    NewCustomFilter
  },
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
          text: "Tên",
          value: "name",
          width: 550
        },
        {
          text: "Giá trị chiết khấu",
          value: "discount_config",
          sortable: false,
          width: 450,
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
              label: "Cập nhật",
              color: "primary",
              event: "edit-item"
            },
            {
              icon: "delete",
              label: "Xóa",
              color: "error",
              event: "delete-item"
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
  height: 30px !important;
}
.padding-x-0 {
  padding-right: 0 !important;
  padding-left: 0 !important;
}
</style>
