<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <v-overlay v-if="loading" absolute color="#fff" class="z-1">
            <v-progress-circular
              :width="4"
              :size="25"
              indeterminate
              color="primary"
            >
            </v-progress-circular>
          </v-overlay>
          <new-custom-filter v-model="searchParams" :filters="filterShow" />
          <v-divider />
          <api-data-table
            ref="table"
            v-model="selectedItems"
            v-bind="$attrs"
            :resource="resource"
            :headers="headerShow"
            selectable
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            :fixed-left-count="2"
            page-name="manage-ads-mms-template"
            calculate-widths
            :default-pagination="pagination"
            v-on="$listeners"
            @view-detail="showDetail"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
            @clone-item="cloneItem"
            @approve-item="approveItem"
            @review-item="reviewItem"
            @approve-multi="massApprove"
            @reject-multi="massReject"
            @show-api="openApiInstruction"
          >
            <template slot="header.errcode" slot-scope="{ item }">
              Mã lỗi
              <v-icon small>info</v-icon>
            </template>
            <template slot="item.agency" slot-scope="{ item }">
              <nuxt-link
                v-if="getAgency(item)"
                :to="`/user/${getAgency(item).id}`"
                class="truncate-2 w-full block"
              >
                {{ getAgency(item).full_name }}
              </nuxt-link>
            </template>
            <template slot="item.advertiser" slot-scope="{ item }">
              <nuxt-link
                v-if="item.advertiser"
                :to="`/user/${item.advertiser.id}`"
                class="truncate-2 w-full block"
              >
                {{ item.advertiser.full_name }}
              </nuxt-link>
            </template>
            <template slot="item.content" slot-scope="{ item }">
              <a
                v-if="item.content"
                href="javascript:;"
                @click="showContent(item)"
              >
                {{ textContent(item) || "Xem chi tiết" }}
              </a>
              <span v-else> Không có nội dung </span>
            </template>
            <template slot="item.ads_name" slot-scope="{ item }">
              <a href="javascript:;" @click="showAds(item)">{{
                item.ads_name
              }}</a>
            </template>
            <template slot="item.brandname" slot-scope="{ item }">
              {{ item.brandname && item.brandname.name }}
            </template>
            <template slot="item.price" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price | currency }}
              </div>
            </template>
            <template slot="item.mms_type" slot-scope="{ item }">
              {{ renderMMSType(item) }}
            </template>

            <template slot="item.errcode" slot-scope="{ item }">
              <v-tooltip :key="`tooltip-${item.id}`" offset-overflow bottom>
                <template #activator="{ on, attrs }">
                  <span v-on="on">
                    {{ item.errcode }}
                  </span>
                </template>
                <span>{{ item.err_desc }}</span>
              </v-tooltip>
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
            <template slot="item.mms_type" slot-scope="{ item }">
              {{ typeMap[item.mms_type] }}
            </template>
            <template slot="item.created_at" slot-scope="{ item }">
              {{ item.created_at | timestamp }}
            </template>
            <template slot="item.sent_at" slot-scope="{ item }">
              {{ item.sent_at | timestamp }}
            </template>
            <template slot="item.ads_count" slot-scope="{ item }">
              <a
                v-if="item.ads_count > 0"
                :href="
                  `/manage-ads/list-ads-mms?resource_mms_user_template_id=${item.id}`
                "
              >
                {{ item.ads_count | numberSpace }}
              </a>
              <span v-else>{{ item.ads_count | numberSpace }}</span>
            </template>
          </api-data-table>
        </v-card>
      </v-flex>
    </v-layout>
    <preview-banner-mms-dialog ref="contentDialog" />
    <mms-template-form-dialog
      ref="dialog"
      v-on="$listeners"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <mms-template-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
    <mms-template-review-dialog ref="reviewDialog" @success="refreshTable" />
    <mms-template-mass-approve-dialog
      ref="massApproveDialog"
      @action-success="refreshTable(false, true)"
    />
    <mms-template-mass-reject-dialog
      ref="massRejectDialog"
      @action-success="refreshTable(false, true)"
    />
    <!--    <mms-template-mass-delete-dialog-->
    <!--      ref="massDeleteDialog"-->
    <!--      @confirm="deleteSelected"-->
    <!--      @action-success="refreshTable(false, false)"-->
    <!--    />-->
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/template-mms"
      object-name="template MMS"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <api-instruction-template-mms-dialog ref="apiDialog" service="sms" />

  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import BrandnameSelect from "@/components/select/BrandnameSelect";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { USER_STATUS } from "@/constants/code";
import { SELECT_MMS_TYPE, USER_STATUS_MAP } from "@/constants/dataSelect";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "@/constants/role";
import PreviewBannerMmsDialog from "@/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import cloneDeep from "lodash/cloneDeep";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import ApiDataTable, {
  ApiDataTableRef,
  PaginationInterface
} from "~/components/table/ApiDataTable.vue";
import GlobalDataInterface from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";

import { CompareDialogRef } from "~/components/common/CompareDialog.vue";
import { MMSDistributionInterface } from "~/interface/data/log";
import { PreviewBannerMmsDialogRef } from "~/components/page/manage-campaign/banner/common/PreviewBannerMmsDialog.vue";
import MmsTemplateDeleteDialog from "~/components/page/manage-ads/mms/template/MmsTemplateDeleteDialog.vue";
import MmsTemplateFormDialog from "~/components/page/manage-ads/mms/template/MmsTemplateFormDialog.vue";
import MmsTemplateReviewDialog from "~/components/page/manage-ads/mms/template/MmsReviewFormDialog.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import MmsTemplateMassApproveDialog from "~/components/page/manage-ads/mms/template/MmsTemplateMassApproveDialog.vue";
import MmsTemplateMassRejectDialog from "~/components/page/manage-ads/mms/template/MmsTemplateMassRejectDialog.vue";
import MmsTemplateMassDeleteDialog from "~/components/page/manage-ads/mms/template/MmsTemplateMassDeleteDialog.vue";
import ApiInstructionTemplateMmsDialog from "~/components/page/manage-ads/mms/ApiInstructionTemplateMmsDialog.vue";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";

interface ComponentData extends GlobalDataInterface {
  searchParams: Array<object>;
  userId?: number | string;
  startIndex: number;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  loading: boolean;
  pagination: PaginationInterface;
  syncingId?: number | string;
  isAdmin: boolean;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  typeMap: Array<string>;
  canViewRemain: boolean;
  selectedItems: Array<object>;
  $refs: {
    table: ApiDataTableRef;
    dialog: CompareDialogRef;
    contentDialog: PreviewBannerMmsDialogRef;
    massDeleteDialog: ConfirmDialogRef;
  };
}

interface ComponentMethod {
  showDetail(item: MMSDistributionInterface): void;

  showAds(item: MMSDistributionInterface): void;

  showContent(item: MMSDistributionInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

interface ComponentComputed {
  selectedIds: Array<number>;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod & ComponentComputed
>).extend({
  components: {
    BaseMassDeleteDialog,
    MmsTemplateMassDeleteDialog,
    MmsTemplateMassRejectDialog,
    MmsTemplateMassApproveDialog,
    MmsTemplateReviewDialog,
    MmsTemplateFormDialog,
    MmsTemplateDeleteDialog,
    PreviewBannerMmsDialog,
    NewCustomFilter,
    ApiDataTable,
    ApiInstructionTemplateMmsDialog,
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  props: {
    resource: {
      type: String,
      default: "/template-mms"
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
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
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      USER_STATUS,
      USER_STATUS_MAP,
      syncingId: null,
      pagination: {
        sortBy: ["created_at"],
        sortDesc: [true]
      },
      statusMap: {
        created: {
          color: "warning",
          text: "Đang tạo template ID"
        },
        created_template_success: {
          color: "primary",
          text: "Chờ phê duyệt template"
        },
        created_template_fail: {
          color: "error",
          text: "Tạo template ID thất bại"
        },
        invalid: {
          color: "error",
          text: "Dừng sử dụng"
        },
        reject_template: {
          color: "error",
          text: "Từ chối phê duyệt template"
        },
        active: {
          color: "success",
          text: "Đang sử dụng"
        }
      },
      typeMap: ["CSKH", "Quảng cáo"]
    };
  },
  computed: {
    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    filters() {
      return [
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: [
            {
              value: "created",
              text: "Đang tạo template ID"
            },
            {
              value: "created_template_success",
              text: "Chờ phê duyệt template"
            },
            {
              value: "created_template_fail",
              text: "Tạo template ID thất bại"
            },
            {
              value: "invalid",
              text: "Dừng sử dụng"
            },
            {
              value: "reject_template",
              text: "Từ chối phê duyệt template"
            },
            {
              value: "active",
              text: "Đang sử dụng"
            }
          ]
        },
        {
          type: RESOURCE,
          name: "brandname_id",
          label: "Brandname",
          itemValue: "id",
          itemText: "name",
          component: BrandnameSelect,
          props: {
            multiple: false
          }
        },
        {
          type: RESOURCE,
          name: "user_id",
          label: "Người sở hữu",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              // type: ROLE_AGENCY
            },
            label: "Người sở hữu"
          }
        },
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo",
          maxDate: "tomorrow",
        },
        {
          type: DATE,
          name: "updated_at",
          label: "Cập nhật lần cuối"
        }
      ];
    },
    headers() {
      return [
        {
          text: "Tên template",
          value: "name",
          width: 200
        },
        {
          text: "Agency",
          value: "agency",
          width: 300,
          visible: this.isAdmin,
          sortable: false
        },
        {
          text: "Advertiser",
          value: "advertiser",
          width: 300,
          visible: this.isAdmin,
          sortable: false
        },
        {
          text: "Nội dung tin",
          value: "content",
          width: 200
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 144
        },
        {
          text: "Loại tin nhắn",
          value: "mms_type",
          width: 144
        },
        {
          text: "Mã template",
          value: "tempid",
          width: 160
        },
        {
          text: "Lĩnh vực",
          value: "cat_id",
          width: 160
        },
        {
          text: "Brandname",
          value: "brandname",
          width: 160
        },
        {
          text: "Đơn giá",
          value: "price",
          width: 144,
          align: "right",
          sortable: false
        },
        {
          text: "số quảng cáo sử dung",
          value: "ads_count",
          width: 180,
          align: "right",
          sortable: false
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 144
        },
        {
          text: "Cập nhật cuối",
          value: "updated_at",
          width: 144
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
    canViewRemain() {
      return this.$can("expense-ads-user-balance.view-remain");
    },
    headerShow() {
      return this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );
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
    },
    actions() {
      return [
        {
          color: "success",
          icon: "check",
          label: "Phê duyệt Template",
          visible: this.canApprove,
          event: "approve-item"
        },
        {
          color: "purple",
          icon: "mdi-api",
          label: "Hướng dẫn API",
          event: "show-api",
          visible: this.checkHasApi
        },
        {
          color: "purple",
          icon: "visibility",
          label: "Phê duyệt template",
          visible: this.canReview,
          event: "review-item"
        },
        {
          color: "primary",
          icon: "content_copy",
          label: "Nhân bản",
          visible: this.canClone,
          event: "clone-item"
        },
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
        }
      ];
    },

    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };
      if (this.$pageCan("review")) {
        const itemsApprove = this.selectedItems?.filter(item =>
          item?.item_permissions?.includes("review")
        );
        toolbarShow["approve-multi"] = {
          icon: "check",
          desc: `Phê duyệt (${itemsApprove?.length})`,
          disabled: itemsApprove?.length === 0,
          tooltip: "Đồng ý duyệt"
        };

        const itemsReject = this.selectedItems?.filter(
          item =>
            !item?.item_permissions?.includes("approve") &&
            item?.item_permissions?.includes("review")
        );
        toolbarShow["reject-multi"] = {
          icon: "close",
          desc: `Từ chối (${itemsReject?.length})`,
          disabled: itemsReject?.length === 0,
          tooltip: "Từ chói phê duyệt"
        };
      }
      return toolbarShow;
    }
  },
  methods: {
    canClone(item) {
      return item?.item_permissions?.includes("add");
    },
    canApprove(item) {
      return item?.item_permissions?.includes("approve");
    },
    canReview(item) {
      return (
        item?.item_permissions?.includes("review") &&
        !item?.item_permissions?.includes("approve")
      );
    },
    showDetail(item) {
      this.$refs.dialog.show(item.new_data, item.old_data);
    },
    reviewItem(item) {
      this.$refs.reviewDialog.showReview(item);
    },
    approveItem(item) {
      this.$refs.reviewDialog.showApprove(item);
    },

    showAds(item) {
      this.$router.push(`/manage-ads/list-ads-mms/${item.ads_id}`);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    cloneItem(item) {
      this.$refs.dialog.clone(item);
    },
    renderMMSType(item) {
      return SELECT_MMS_TYPE.find(({ value }) => item.mms_type === value)?.text;
    },
    showContent(item) {
      this.$refs.contentDialog.show({
        message: item.content,
        mms_header: item.mms_header
      });
    },

    textContent(item) {
      let text = item.header || "";

      item.content.forEach(e => {
        if (e.type === "text") {
          text += " " + e.data;
        }
      });
      return text;
    },

    massApprove() {
      const items = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("review")
      );
      if (items?.length > 0) {
        this.$refs.massApproveDialog.show(items);
      }
    },
    getAgency(item) {
      if (item.agency) {
        return item.agency;
      }
      if (item.advertiser) {
        return item.advertiser.agencies[0];
      }
      return false;
    },
    massReject() {
      const items = this.selectedItems?.filter(item =>
        item?.item_permissions?.includes("review")
      );
      if (items?.length > 0) {
        this.$refs.massRejectDialog.show(items);
      }
    },
    checkHasApi(item) {
      return item?.status === "active";
    },
    openApiInstruction(item) {
      this.$refs.apiDialog.show(item);
    }
  }
});
</script>
