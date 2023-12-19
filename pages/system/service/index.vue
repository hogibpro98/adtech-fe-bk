<template>
  <v-container grid-list-xl fluid>
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
            :toolbar="toolbarShow"
            :page-name="pageName"
            :default-pagination="{
              sortBy: ['created_at'],
              sortDesc: [true]
            }"
            @change-table-headers="changeColumnShows"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
          >
            <template slot="item.created_at" slot-scope="props">
              <span>{{ props.item.created_at | date }}</span>
            </template>
          </api-data-table>
        </v-card>
      </v-flex>
    </v-layout>
    <service-template-form-dialog
      ref="dialog"
      v-on="$listeners"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <service-template-delete-form-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
  </v-container>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef,
  PaginationInterface
} from "~/components/table/ApiDataTable";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import { DATA_DAY } from "~/constants/resource";
import { DATE, NUMBER, RESOURCE } from "~/constants/filterType";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect";
import CampaignSelect from "~/components/select/CampaignSelect";
import NewCustomFilter from "~/components/common/NewCustomFilter";
import ServiceTemplateFormDialog from "~/components/page/service/ServiceTemplateFormDialog";
import ServiceTemplateDeleteFormDialog from "~/components/page/service/ServiceTemplateDeleteFormDialog";

export default {
  components: {
    ApiDataTable,
    ServiceTemplateFormDialog,
    ServiceTemplateDeleteFormDialog
  },
  layout: "dashboard",
  props: {
    pageName: {
      type: String,
      default: "system-service"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      startIndex: 0,
      searchParams: null,
      tableFilter: {},
      summary: null,
      timeoutSummary: null,
      columnShows: []
    };
  },
  computed: {
    headerShow() {
      let headers = [...this.headers];
      if (this.$authHasRole(ROLE_AGENCY) && !this.$authHasRole(ROLE_IS_ADMIN)) {
        headers = headers.filter(h => h.value !== "agency");
      }
      return headers;
    },
    filterShow() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);

      if (isAdmin) {
        return this.filters;
      } else if (isAgency) {
        return this.filters.filter(f => f.name !== "agency_id");
      } else {
        return this.filters;
      }
    },
    filters() {
      return [
        {
          type: RESOURCE,
          name: "agency_id",
          label: "Agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            },
            label: "Agency"
          }
        },
        {
          type: RESOURCE,
          name: "campaign_id",
          label: "Chiến dịch",
          itemValue: "id",
          itemText: "name",
          component: CampaignSelect,
          props: {
            multiple: false
          }
        },
        {
          type: NUMBER,
          name: "price",
          props: {
            rules: "numeric"
          },
          label: "Đơn giá"
        },
        {
          type: NUMBER,
          name: "num_success",
          props: {
            rules: "numeric"
          },
          label: "Số lượt gửi thành công"
        },
        {
          type: NUMBER,
          name: "num_fail",
          props: {
            rules: "numeric"
          },
          label: "Số lượt gửi thất bại"
        },
        {
          type: NUMBER,
          name: "num_sent",
          props: {
            rules: "numeric"
          },
          label: "Số lượt số gửi"
        },
        {
          type: DATE,
          name: "date_full_date",
          request_name: "date_full_date",
          label: "Thời gian"
        }
      ];
    },
    headers() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 160,
          align: "left"
        },
        {
          text: "Tên hiển thị",
          value: "display_name",
          align: "left",
          width: 160,
          sortable: false
        },
        {
          text: "Mã mặt hàng BCCS",
          value: "bccs_id",
          sortable: false,
          width: 240
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false,
          width: 240
        },
        {
          text: "Ngày tạo",
          value: "created_at",
          align: "center",
          width: 240
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: this.actions
        }
      ];
    },

    actions() {
      return [
        //   color: "primary",
        //   icon: "content_copy",
        //   label: "Nhân bản",
        //   visible: this.canClone,
        //   event: "clone-item"
        // },
        {
          color: "primary",
          icon: "edit",
          label: "Chỉnh sửa",
          event: "edit-item"
        },
        {
          color: "error",
          icon: "delete",
          label: "Xóa",
          event: "delete-item"
        },
      ];
    },
    resource() {
      return "/service";
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    },
    filterAll() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      const tableFilter = this.tableFilter || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps,
        ...tableFilter
      };
    },
    toolbarShow() {
      return cloneDeep(this.toolbar);
    }
  },
  watch: {
    filterAll: {
      handler() {
        this.debounceFetchSummary();
      },
      deep: true
    }
  },
  async mounted() {
    await this.debounceFetchSummary();
  },
  methods: {
    getAgency(item) {
      return item.agency;
    },
    changeColumnShows(val) {
      this.columnShows = val;
    },
    async getSummary(params) {
      // if (!this.showColumnsPrice) {
      //   return;
      // }

      try {
        const { data } = await this.$dataDayRepository.post("summary", params);
        this.summary = data;
      } catch (e) {
        console.log(e);
      }
    },
    debounceFetchSummary() {
      if (this.timeoutSummary) {
        clearTimeout(this.timeoutSummary);
      }

      this.timeoutSummary = setTimeout(() => {
        this.timeoutSummary = null;
        this.getSummary(this.filterAll);
      }, 300);
    },
    renderShowColumn(column) {
      if (column.value) {
        switch (column.value) {
          case "total_money":
            return this.$filters.currency(this.summary?.total_money);
          case "total_money_refund":
            return this.$filters.currency(this.summary?.total_money_refund);
          case "total_price":
            return this.$filters.currency(this.summary?.total_money);
          case "num_success":
            return this.$filters.numberSpace(this.summary?.num_success);
          case "num_sent":
            return this.$filters.numberSpace(this.summary?.num_sent);
          case "num_fail":
            return this.$filters.numberSpace(this.summary?.num_fail);
          case "cdr_num_sms_fail":
            return this.$filters.numberSpace(this.summary?.cdr_num_sms_fail);
          case "cdr_num_sms_success":
            return this.$filters.numberSpace(this.summary?.cdr_num_sms_success);
          case "total_data": {
            const total_data = this.$filters.numberSpace(
              this.summary?.total_data
            );
            return `${total_data} MB`;
          }
          case "num_sms_success":
            return this.$filters.numberSpace(this.summary?.num_sms_success);
          case "num_sms_fail":
            return this.$filters.numberSpace(this.summary?.num_sms_fail);
          case "num_sms_confirm_success":
            return this.$filters.numberSpace(
              this.summary?.num_sms_confirm_success
            );
          case "num_sms_confirm_fail":
            return this.$filters.numberSpace(
              this.summary?.num_sms_confirm_fail
            );
          case "cdr_num_sms_confirm_success":
            return this.$filters.numberSpace(
              this.summary?.cdr_num_sms_confirm_success
            );
          case "cdr_num_sms_confirm_fail":
            return this.$filters.numberSpace(
              this.summary?.cdr_num_sms_confirm_fail
            );

          default:
            return null;
        }
      }
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    addItem() {
      this.$refs.dialog.show();
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    }
  }
};
</script>
