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
            v-bind="$attrs"
            v-model="selectedItems"
            :resource="resource"
            :headers="headerShow"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            :page-name="pageName"
            multi-sort
            :default-pagination="{
              sortBy: ['created_at', 'name'],
              sortDesc: [true, false]
            }"
            :selectable="selectable"
            calculate-widths
            v-on="$listeners"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
            @review="reviewBrandName"
            @reject="reviewBrandName"
            @approve="reviewBrandName"
            @creating="creatingBrandName"
            @active="activeBrandName"
            @inactive="inactiveBrandName"
            @sync="syncBrandname"
            @import-file="importBrandName"
            @approve-multi="approveMulti"
            @reject-multi="rejectMulti"
          >
            <template slot="item.name" slot-scope="props">
              <a href="#" @click.stop="detailBrandName(props.item)">{{
                props.item.name
              }}</a>
            </template>
            <template slot="item.maintain_fee" slot-scope="props">
              <div class="text-right">
                <p>{{ props.item.maintain_fee | numberCurrency }}</p>
              </div>
            </template>
            <template slot="item.price_hyper_qc" slot-scope="props">
              <div class="text-right">
                <p>{{ props.item.price_hyper_qc | currency }}</p>
              </div>
            </template>
            <template slot="item.price_hyper_cskh" slot-scope="props">
              <div class="text-right">
                <p>{{ props.item.price_hyper_cskh | currency }}</p>
              </div>
            </template>
            <template slot="item.agency" slot-scope="{ item }">
              <span v-if="item.agency">{{ item.agency.full_name }}</span>
            </template>
            <template slot="item.advertiser" slot-scope="{ item }">
              <span v-if="item.advertiser">{{
                item.advertiser.full_name
              }}</span>
            </template>
            <template slot="item.status" slot-scope="props">
              <v-chip
                v-if="renderStatus(props.item)"
                :color="renderStatus(props.item).color"
                class="w-full justify-content-center"
                small
                label
                >{{ renderStatus(props.item).text }}</v-chip
              >
            </template>
            <template slot="item.documents" slot-scope="{ item }">
              <div
                v-if="item.documents"
                class="d-flex align-items-center justify-content-center"
              >
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      @click.stop="$openFilePreviewDialog(item.documents)"
                      v-on="on"
                    >
                      <v-icon>mdi-text-box-search-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Xem tài liệu</span>
                </v-tooltip>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      v-bind="attrs"
                      @click.stop="handleDownloadAllDocument(item.documents)"
                      v-on="on"
                    >
                      <v-icon>mdi-briefcase-download-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Tải xuống tất cả</span>
                </v-tooltip>
              </div>
            </template>
            <template slot="item.brand_certificate" slot-scope="{ item }">
              <a
                v-if="item.brand_certificate"
                :href="item.brand_certificate"
                class="truncate-2 w-full block"
                target="_blank"
              >
                {{ item.brand_certificate }}
              </a>
            </template>
            <template slot="item.business_registration" slot-scope="{ item }">
              <a
                v-if="item.business_registration"
                :href="item.business_registration"
                class="truncate-2 w-full block"
                target="_blank"
                >{{ item.business_registration }}</a
              >
            </template>
            <template slot="item.expire_time" slot-scope="props">
              <div class="text-center">
                <p>{{ props.item.expire_time | date }}</p>
              </div>
            </template>
            <template slot="item.created_at" slot-scope="props">
              <div class="text-center">
                <p>{{ props.item.created_at | date }}</p>
              </div>
            </template>
            <template
              v-for="(_, name) in $scopedSlots"
              :slot="name"
              slot-scope="slotData"
            >
              <slot :name="name" v-bind="slotData" />
            </template>
          </api-data-table>
        </v-card>
        <brand-name-form-dialog
          ref="dialog"
          :is-create-request="isCreateRequest"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
          @action-success="refreshTable"
        />
        <brand-name-review-dialog
          ref="reviewDialog"
          :is-request-brand-name="isCreateRequest"
          @action-success="refreshTable"
        />
        <brand-name-import-dialog
          ref="importDialog"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        />
        <brand-name-creating-dialog
          ref="creatingDialog"
          @action-success="refreshTable"
        />
        <brand-name-inactive-dialog
          ref="inactiveDialog"
          @action-success="refreshTable"
        />
        <brand-name-active-dialog
          ref="activeDialog"
          @action-success="refreshTable"
        />
        <brand-name-detail-dialog
          ref="detailDialog"
          :is-create-request="isCreateRequest"
          @action-success="refreshTable"
        />
        <brand-name-delete-dialog
          ref="deleteDialog"
          :is-create-request="isCreateRequest"
          @action-success="refreshTable"
        />
        <brand-name-approve-multi-dialog
          ref="approveMultiDialog"
          @action-success="refreshTable"
        >
        </brand-name-approve-multi-dialog>
        <reject-multi-dialog
          ref="rejectMultiDialog"
          object-name="yêu cầu tạo brandname"
          :resource="resource"
          has-reason
          @action-success="refreshTable"
        />
        <mass-delete-dialog
          ref="massDeleteDialog"
          object-name="yêu cầu tạo brandname"
          :resource="resource"
          @action-success="refreshTable(false, false)"
        />
        <loading-dialog v-model="isZipping" circular text="Đang nén file" />
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { CODE_SUCCESS } from "@/constants/code";
import {
  STATUS_BRAND_NAME,
  STATUS_BRAND_NAME_FILTER_CREATE_REQUEST,
  STATUS_BRAND_NAME_FILTER
} from "@/constants/dataSelect";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { BRAND_NAME, BRANDNAME_REQUEST } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { ApiDataTableRef } from "../../table/ApiDataTable.vue";
import LoadingDialog from "~/components/common/LoadingDialog.vue";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { ROLE_IS_ADMIN, ROLE_ADVERTISER, ROLE_AGENCY } from "~/constants/role";
import { BrandnameInterface } from "~/interface/data/brandname";
import BrandNameFormDialog, {
  BrandNameFormDialogRef
} from "~/components/page/manage-brandname/BrandNameFormDialog.vue";
import BrandNameReviewDialog, {
  BrandNameReviewDialogRef
} from "~/components/page/manage-brandname/BrandNameReviewDialog.vue";
import BrandNameImportDialog, {
  BrandNameImportDialogRef
} from "~/components/page/manage-brandname/BrandNameImportDialog.vue";
import BrandNameCreatingDialog, {
  BrandNameCreatingDialogRef
} from "~/components/page/manage-brandname/BrandNameCreatingDialog.vue";
import BrandNameInactiveDialog, {
  BrandNameInactiveDialogRef
} from "~/components/page/manage-brandname/BrandNameInactiveDialog.vue";
import BrandNameActiveDialog, {
  BrandNameActiveDialogRef
} from "~/components/page/manage-brandname/BrandNameActiveDialog.vue";
import BrandNameDetailDialog, {
  BrandNameDetailDialogRef
} from "~/components/page/manage-brandname/BrandNameDetailDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { BrandNameRejectDialogRef } from "~/components/page/manage-brandname/BrandNameRejectDialog.vue";
import BrandNameDeleteDialog, {
  BrandNameDeleteDialogRef
} from "~/components/page/manage-brandname/BrandNameDeleteDialog.vue";
import BrandNameApproveMultiDialog from "~/components/page/manage-brandname/BrandNameApproveMultiDialog.vue";
import RejectMultiDialog from "~/components/common/RejectMultiDialog.vue";
import BrandNameMassDeleteDialog from "~/components/page/manage-brandname/BrandNameMassDeleteDialog.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";
import MassDeleteDialog from "~/components/common/MassDeleteDialog.vue";
import zipFiles from "~/mixins/zipFiles";

interface ComponentData {
  showing: boolean;
  timeout: number;
  $brandNameRepository: RepositoryInterface;
  columnsPrice: Array<string>;
  runningApproves: Array<string>;
  syncingId: number;
  filters: Array<object>;
  searchParams: object;
  resource: string;
  headers: DataTableHeader[];
  filterExcludes: Array<object>;
  startIndex: number;
  selectedItems: Array<object>;
  $refs: {
    table: ApiDataTableRef;
    dialog: BrandNameFormDialogRef;
    reviewDialog: BrandNameReviewDialogRef;
    importDialog: BrandNameImportDialogRef;
    creatingDialog: BrandNameCreatingDialogRef;
    inactiveDialog: BrandNameInactiveDialogRef;
    activeDialog: BrandNameActiveDialogRef;
    detailDialog: BrandNameDetailDialogRef;
    rejectDialog: BrandNameRejectDialogRef;
    deleteDialog: BrandNameDeleteDialogRef;
    massDeleteDialog: ConfirmDialogRef;
  };
}

interface CheckPermissionFunction {
  (item: BrandnameInterface): boolean;
}

interface ComponentMethods {
  checkShowButtonSync: CheckPermissionFunction;
  checkShowButtonCreating: CheckPermissionFunction;
  checkShowButtonActive: CheckPermissionFunction;
  checkShowButtonInactive: CheckPermissionFunction;
  checkShowButtonApprove: CheckPermissionFunction;
  checkShowButtonReview: CheckPermissionFunction;
  checkShowButtonReject: CheckPermissionFunction;
  addItem: (item: BrandnameInterface) => void;
  editItem: (item: BrandnameInterface) => void;
  deleteItem: (item: BrandnameInterface) => void;
  approveBrandName: (item: BrandnameInterface) => void;
  rejectBrandName: (item: BrandnameInterface) => void;
  creatingBrandName: (item: BrandnameInterface) => void;
  activeBrandName: (item: BrandnameInterface) => void;
  inactiveBrandName: (item: BrandnameInterface) => void;
  reviewBrandName: (item: BrandnameInterface) => void;
  detailBrandName: (item: BrandnameInterface) => void;
  renderStatus: (item: BrandnameInterface) => object;
  importBrandName: () => void;
  syncBrandname: (item: BrandnameInterface) => void;
  refreshTable: () => void;
  $authHasRole: Function;
}

interface ComponentComputed {
  headerShow: () => Array<DataTableHeader>;
  showPrice: () => boolean;
  filterShow: () => Array<object>;
  filterTable: () => object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "BrandnameRequestTable",
  components: {
    MassDeleteDialog,
    BrandNameMassDeleteDialog,
    RejectMultiDialog,
    BrandNameApproveMultiDialog,
    BrandNameDeleteDialog,
    BrandNameDetailDialog,
    BrandNameInactiveDialog,
    BrandNameActiveDialog,
    BrandNameReviewDialog,
    BrandNameImportDialog,
    BrandNameCreatingDialog,
    BrandNameFormDialog,
    NewCustomFilter,
    ApiDataTable,
    LoadingDialog
  },
  mixins: [massDeleteTableWrapper, zipFiles],
  props: {
    resource: {
      type: String,
      default: BRANDNAME_REQUEST
    },
    selectable: {
      type: Boolean,
      default: true
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isToggleChart: false,
        isFullScreen: false,
        isImport: true
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
    isCreateRequest: {
      type: Boolean,
      default: false
    },
    pageName: {
      type: String,
      default: "manager-brandname-list"
    }
  },
  data() {
    return {
      isShowFilePreviewDialog: false,
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      syncingId: null,
      loading: false,
      runningApproves: [],
      selectedItems: [],
      columnsPrice: ["price_mms", "price_cskh", "maintain_fee"],
      headers: [
        {
          text: "Tên brandname",
          value: "name",
          width: 144
        },
        {
          text: "Tên doanh nghiệp",
          value: "business_name",
          width: 250
        },
        {
          text: "Tên agency",
          value: "agency",
          sortable: false,
          width: 155
        },
        {
          text: "Tên advertiser",
          value: "advertiser",
          sortable: false,
          width: 155
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },
        {
          text: "Phí brandname",
          value: "maintain_fee",
          align: "right",
          width: 144
        },
        {
          text: "Lĩnh vực hoạt động",
          value: "business_activity.name",
          sortable: false,
          width: 170
        },
        {
          text: "Tài liệu kèm theo",
          value: "documents",
          align: "center",
          sortable: false,
          width: 140
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: 144
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "warning",
              icon: "hourglass_full",
              label: "Đang xử lý",
              visible: this.checkShowButtonCreating,
              event: "creating"
            },
            {
              color: "purple",
              icon: "visibility",
              label: "Duyệt",
              visible: this.checkShowButtonReview,
              event: "review"
            },
            {
              color: "success",
              icon: "check",
              label: "Phê duyệt",
              visible: this.checkShowButtonApprove,
              event: "approve"
            },
            {
              color: "error",
              icon: "close",
              label: "Từ chối",
              event: "reject",
              visible: this.checkShowButtonReject
            },
            {
              color: "error",
              icon: "lock",
              label: "Khóa brandname",
              visible: this.checkShowButtonInactive,
              event: "inactive"
            },
            {
              color: "success",
              icon: "lock_open",
              label: "Mở khóa brandname",
              visible: this.checkShowButtonActive,
              event: "active"
            },
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              visible: this.checkEditButtonEdit,
              event: "edit-item"
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa",
              event: "delete-item"
            }
          ]
        }
      ],
      filters: [
        {
          type: RESOURCE,
          name: "agency_id",
          label: "Tên agency",
          itemValue: "id",
          itemText: "full_name",
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            }
          },
          component: AgencyAdvertiserSelect
        },
        {
          type: RESOURCE,
          name: "advertiser_id",
          label: "Tên advertiser",
          itemValue: "id",
          itemText: "full_name",
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_ADVERTISER
            }
          },
          component: AgencyAdvertiserSelect
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: STATUS_BRAND_NAME
        },
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo",
          maxDate: "tomorrow"
        },
        {
          type: RESOURCE,
          name: "business_activity_id",
          label: "Lĩnh vực hoạt động",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
          },
          component: BusinessActivitySelect
        }
      ],
      isZipping: false
    };
  },
  computed: {
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };
      const itemsApprove = this.selectedItems?.filter(item => {
        return (
          item?.item_permissions?.includes("approve") ||
          item?.item_permissions?.includes("reject")
        );
      });

      toolbarShow["approve-multi"] = {
        icon: "check",
        desc: `Phê duyệt (${itemsApprove?.length})`,
        disabled: itemsApprove?.length === 0,
        tooltip: "Đồng ý duyệt"
      };

      const itemsReject = this.selectedItems?.filter(item => {
        return item?.item_permissions?.includes("reject");
      });
      toolbarShow["reject-multi"] = {
        icon: "close",
        desc: `Từ chối (${itemsReject?.length})`,
        disabled: itemsReject?.length === 0,
        tooltip: "Từ chối duyệt"
      };
      return toolbarShow;
    },
    headerShow() {
      let headers = this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );

      if (this.$authHasRole(ROLE_AGENCY) && !this.$authHasRole(ROLE_IS_ADMIN)) {
        headers = headers.filter(h => h.value !== "agency");

        if (!this.isCreateRequest) {
          headers = headers.filter(h => h.value !== "action");
        }
      }

      if (
        this.$authHasRole(ROLE_ADVERTISER) &&
        !this.$authHasRole(ROLE_AGENCY) &&
        !this.$authHasRole(ROLE_IS_ADMIN)
      ) {
        headers = headers.filter(
          h =>
            h.value !== "advertiser" &&
            h.value !== "agency" &&
            h.value !== "price_mms" &&
            h.value !== "price_cskh" &&
            h.value !== "maintain_fee" &&
            h.value !== "action"
        );
      }

      if (this.showPrice) {
        return headers;
      } else {
        return headers.filter(
          header => !this.columnsPrice.includes(header.value)
        );
      }
    },
    showPrice() {
      const isAdmin = this.$authHasRole(ROLE_IS_ADMIN);
      const isAgency = this.$authHasRole(ROLE_AGENCY);
      return isAdmin || isAgency;
    },
    filterShow() {
      let filters = this.filters.filter(
        f => !this.filterExcludes.includes(f.name)
      );

      if (this.$authHasRole(ROLE_AGENCY) && !this.$authHasRole(ROLE_IS_ADMIN)) {
        filters = filters.filter(h => h.name !== "agency_id");
      }

      if (
        this.$authHasRole(ROLE_ADVERTISER) &&
        !this.$authHasRole(ROLE_AGENCY) &&
        !this.$authHasRole(ROLE_IS_ADMIN)
      ) {
        filters = filters.filter(
          h => h.name !== "advertiser_id" && h.name !== "agency_id"
        );
      }

      const filterStatus = filters.find(f => f.name === "status");
      if (filterStatus) {
        if (this.isCreateRequest) {
          filterStatus.items = STATUS_BRAND_NAME_FILTER_CREATE_REQUEST;
        } else {
          filterStatus.items = STATUS_BRAND_NAME_FILTER;
        }
      }

      return filters;
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    }
  },
  methods: {
    checkEditButtonEdit(item) {
      return item?.item_permissions?.includes("edit");
    },
    checkShowButtonSync(item) {
      return item?.item_permissions?.includes("sync");
    },
    checkShowButtonCreating(item) {
      return item?.item_permissions?.includes("creating");
    },
    checkShowButtonActive(item) {
      return item?.item_permissions?.includes("active");
    },
    checkShowButtonInactive(item) {
      return item?.item_permissions?.includes("inactive");
    },
    approveMulti() {
      const items = this.selectedItems?.filter(item => {
        return (
          item?.item_permissions?.includes("approve") ||
          item?.item_permissions?.includes("reject")
        );
      });
      if (items?.length > 0) {
        this.$refs.approveMultiDialog.show(items);
      }
    },
    rejectMulti() {
      const items = this.selectedItems?.filter(item => {
        return item?.item_permissions?.includes("reject");
      });
      if (items?.length > 0) {
        this.$refs.rejectMultiDialog.show(items);
      }
    },
    checkShowButtonApprove(item) {
      return (
        item?.item_permissions?.includes("approve") &&
        !item?.item_permissions?.includes("reject")
      );
    },
    checkShowButtonReview(item) {
      return (
        item?.item_permissions?.includes("approve") &&
        item?.item_permissions?.includes("reject")
      );
    },
    checkShowButtonReject(item) {
      return (
        !item?.item_permissions?.includes("approve") &&
        item?.item_permissions?.includes("reject")
      );
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    approveBrandName(item) {
      this.$refs.dialog.show(item, true);
    },
    rejectBrandName(item) {
      this.$refs.rejectDialog.show(item);
    },
    creatingBrandName(item) {
      this.$refs.creatingDialog.show(item);
    },
    activeBrandName(item) {
      this.$refs.activeDialog.show(item);
    },
    inactiveBrandName(item) {
      this.$refs.inactiveDialog.show(item);
    },
    reviewBrandName(item) {
      this.$refs.reviewDialog.show(item);
    },
    renderStatus(item) {
      return STATUS_BRAND_NAME.find(({ value }) => value === item.status);
    },
    importBrandName() {
      this.$refs.importDialog.show();
    },
    detailBrandName(item) {
      // this.$refs.reviewDialog.show(item);
      this.$refs.detailDialog.show(item);
    },
    async syncBrandname(item) {
      this.syncingId = item.id;
      try {
        const res = await this.$brandNameRepository.post("sync", {
          id: item.id
        });
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Đồng bộ brandname thành công");
          this.refreshTable();
        }
      } catch (e) {}

      this.syncingId = null;
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
