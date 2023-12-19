<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filterShow" />
          <v-divider />
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :filter="filterTable"
            :headers="headers"
            :toolbar="toolbarShow"
            selectable
            :default-pagination="{
              sortBy: ['full_date'],
              sortDesc: [true]
            }"
            :page-name="pageName"
            @synthesis-item="handleSynthesisItem"
            @import-file="handImportFile"
            @edit-item="handleEditItem"
            @delete-item="handleDeleteItem"
            @delete-selected="deleteSelected"
          >
            <template slot="item.full_date" slot-scope="props">
              {{ props.item.full_date | date }}
            </template>
            <template slot="item.num_message_success" slot-scope="props">
              {{ props.item.num_message_success | numberSpace }}
            </template>
            <template slot="item.price_click" slot-scope="props">
              {{ props.item.price_click | currency }}
            </template>
            <template slot="item.price_view" slot-scope="props">
              {{ props.item.price_view | currency }}
            </template>
            <template slot="item.price_num_message_success" slot-scope="props">
              {{ props.item.price_num_message_success | currency }}
            </template>
            <template slot="item.total_money" slot-scope="props">
              {{ props.item.total_money | currency }}
            </template>

            <template slot="item.price" slot-scope="props">
              {{ props.item.price | numberSpace }}
            </template>
            <template slot="item.view" slot-scope="props">
              {{ props.item.view | numberSpace }}
            </template>
            <template slot="item.num_message_success" slot-scope="props">
              {{ props.item.num_message_success | numberSpace }}
            </template>
          </api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
      <import-dialog
        ref="importFile"
        :resource="resource"
        name="Báo cáo doanh thu agency theo ngày"
        sample-url="/import/template_import_bao_cao_doanh_thu_agency_theo_ngay.xlsx"
        @create-success="refreshTable"
      ></import-dialog>
      <v-overlay :value="loading" absolute color="#fff" class="z-10">
        <v-progress-circular
          :width="4"
          :size="32"
          indeterminate
          color="primary"
        >
        </v-progress-circular>
      </v-overlay>
    </v-layout>
    <manual-summary-day-dialog
      ref="manualSummaryDayDiaLog"
      @action-success="refreshTable"
    ></manual-summary-day-dialog>
    <manual-summary-day-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      :resource="resource"
      object-name="bản ghi"
      item-text="display_text"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { cloneDeep } from "lodash";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { MANUAL_SUMMARY_DAY } from "~/constants/resource";
import { TOTAL_SECOND_OF_DAY } from "~/constants/time-unit";
import ImportFileStatistical from "~/components/common/FileUpload/ImportFileStatistical.vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { DATE, TEXT } from "~/constants/filterType";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import ManualSummaryDayDialog from "~/components/page/manual-summary-day/ManualSummaryDayDialog.vue";
import ManualSummaryDayDeleteDialog from "~/components/page/manual-summary-day/ManualSummaryDayDeleteDialog.vue";
import ImportDialog from "~/components/common/ImportDialog.vue";

interface ComponentMethods {
  handleEditItem(item: object): void;

  refreshTable(): void;
}

interface ComponentData extends GlobalDataInterface {
  filters: Array<FilterInterface>;
  filterShow: Array<FilterInterface>;
  selectedItems: Array<object>;
}

export default Vue.extend<Vue & ComponentMethods & ComponentData>({
  name: "ManualSummaryDay",
  components: {
    ImportDialog,
    ManualSummaryDayDeleteDialog,
    ManualSummaryDayDialog,
    BaseMassDeleteDialog,
    ImportFileStatistical,
    ApiDataTable,
    NewCustomFilter
  },
  filters: {
    getMonth(val) {
      return Number(val.split("-")[1]);
    },
    getDay(val) {
      return Number(val.split("-")[2]);
    },
    getPreviousMonth(val) {
      const month = Number(val.split("-")[1]);
      if (month === 1) {
        return 12;
      }
      return Number(val.split("-")[1]) - 1;
    }
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isSearch: false,
        isDownload: true,
        exportResource: MANUAL_SUMMARY_DAY,
        isImport: true
      })
    },
    pageName: {
      type: String,
      default: "manual-summary-day"
    },
    filterExcludes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      month: this.$options.filters.timeDateLine(
        Date.now() - TOTAL_SECOND_OF_DAY
      ),
      searchParams: null,
      dialog: false,
      loading: false,
      documents: null,
      selectedItems: []
    };
  },
  computed: {
    filters() {
      return [
        {
          type: DATE,
          name: "date_full_date",
          request_name: "date_full_date",
          label: "Ngày"
        },
        {
          type: TEXT,
          name: "cat_id",
          label: "Lĩnh vực hoạt động"
        },
        {
          type: TEXT,
          name: "brandname",
          label: "Brandname"
        },
        {
          type: TEXT,
          name: "agency_name",
          label: "Agency"
        },
        {
          label: "Loại tin",
          name: "message_type",
          type: TEXT
        },
        {
          label: "Kiểu truyền thông",
          name: "ads_type",
          type: TEXT
        }
      ];
    },
    headers() {
      return [
        {
          text: "Ngày",
          value: "full_date",
          align: "center",
          width: 200
        },
        {
          text: "Agency",
          value: "agency_name",
          sortable: false,
          width: 200
        },
        {
          text: "Brandname",
          value: "brandname",
          sortable: false,
          width: 200
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "cat_id",
          sortable: false,
          width: 200
        },
        {
          text: "Loại tin",
          value: "message_type",
          sortable: false,
          width: 200
        },
        {
          text: "Kiểu truyền thông",
          value: "ads_type",
          sortable: false,
          width: 200
        },
        {
          text: "Đơn vị quản lý",
          value: "manager",
          sortable: false,
          width: 200
        },
        {
          text: "Lượt view",
          value: "view",
          sortable: false,
          width: 200
        },
        {
          text: "Lượt click",
          value: "click",
          sortable: false,
          width: 200
        },
        {
          text: "Số tin MT",
          value: "num_message_success",
          sortable: false,
          width: 200
        },
        {
          text: "Đơn giá view",
          value: "price_view",
          sortable: false,
          width: 200
        },
        {
          text: "Đơn giá click",
          value: "price_click",
          sortable: false,
          width: 200
        },
        {
          text: "Đơn giá MT",
          value: "price_num_message_success",
          sortable: false,
          width: 200
        },
        {
          text: "Doanh thu",
          value: "total_money",
          sortable: false,
          width: 200
        },
        {
          text: "Hành động",
          value: "action",
          sortable: false,
          align: "center",
          width: 100,
          actions: [
            {
              color: "primary",
              label: "Cập nhật",
              event: "edit-item",
              icon: "edit"
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa",
              event: "delete-item"
            }
          ]
        }
      ];
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      return {
        ...searchParamsFilter
      };
    },
    resource() {
      return MANUAL_SUMMARY_DAY;
    },
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };
      return toolbarShow;
    },
    maxTimePicker() {
      const timeMax = new Date().toISOString().slice(0, 10);
      return timeMax;
    },
    filterShow() {
      return this.filters.filter(f => !this.filterExcludes.includes(f.name));
    }
  },
  methods: {
    deleteSelected() {
      if (this.canMassDelete) {
        const canDeletedItems = this.selectedItems
          ?.filter(item => item?.item_permissions?.includes("delete"))
          .map((e, index) => {
            if (index < 10) {
              e.display_text = `${e.full_date}; ${e.agency_name}; ${e.brandname}; ${e.message_type}; ${e.ads_type}; ${e.cat_id}; ${e.price}; ${e.num_message_success}; ${e.total_money}; ${e.year}; ${e.month}; ${e.date}`;
            }
            return e;
          });
        this.$refs.massDeleteDialog.show(canDeletedItems);
      } else {
        this.showSelectNoneError();
      }
    },
    handleSynthesisItem() {
      this.dialog = true;
    },
    handImportFile() {
      this.$refs.importFile.show();
    },
    handleEditItem(item) {
      this.$refs.manualSummaryDayDiaLog.show(item);
    },
    handleDeleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>

<style></style>
