<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headers"
            :toolbar="toolbarShow"
            :filter="searchParams"
            fixed-left-count="2"
            fixed-right-count="1"
            page-name="admin-user"
            calculate-widths
            selectable
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
            @lock-item="lockItem"
            @change-password="changePassword"
            @approve="confirmApprove"
            @reject="confirmReject"
            @approve-multi="approveMulti"
            @reject-multi="rejectMulti"
            @edit-brandname="editBrandname"
            @edit-report-time-range="editReportTimeRange"
          >
            <template slot="item.brandnames_count" slot-scope="{ item }">
              <a :href="`/manager-brandname/list?custom_user_id=${item.id}`">{{
                item.brandnames_count | numberSpace
              }}</a>
            </template>
            <template slot="item.username" slot-scope="{ item }">
              <a href="javascript:;" @click="showDetail(item)">{{
                item.username
              }}</a>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                v-if="USER_STATUS_MAP[item.status]"
                :color="USER_STATUS_MAP[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
              >
                {{ USER_STATUS_MAP[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.roles" slot-scope="{ item }">
              <span v-if="item.roles.length > 0">{{
                item.roles.map(e => e.display_name).join(", ")
              }}</span>
              <span v-else>Chưa có nhóm người dùng</span>
            </template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | date
            }}</template>
          </api-data-table>
          <v-card-text class="pa-0" />
        </v-card>
      </v-flex>
    </v-layout>
    <user-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <user-delete-dialog ref="deleteDialog" @action-success="refreshTable" />
    <user-lock-dialog ref="lockDialog" @action-success="refreshTable" />
    <user-password-dialog ref="passwordDialog" @action-success="refreshTable" />
    <agency-dialog
      ref="agencyDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <approve-agency-dialog
      ref="approveDialog"
      :user="user"
      :loading="loading"
      @confirm="approveUser"
      @hidden="user = {}"
    />
    <reject-dialog
      ref="rejectDialog"
      @confirm="rejectUser"
      @hidden="user = {}"
    />
    <role-select-dialog
      v-model="roleSelecting"
      @choose-admin="addAdmin"
      @choose-agency="addAgency"
      @choose-inspector="addInspector"
      @choose-advertiser="addAdvertiser"
    />
    <advertiser-dialog
      ref="advertiserDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <user-approve-multi-dialog
      ref="approveMultiDialog"
      @action-success="refreshTable"
    ></user-approve-multi-dialog>
    <reject-multi-dialog
      ref="rejectMultiDialog"
      object-name="tài khoản"
      item-text="username"
      :resource="resource"
      @action-success="refreshTable"
    />
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      item-text="username"
      :resource="resource"
      object-name="tài khoản"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <!--    <user-mass-delete-dialog-->
    <!--      ref="massDeleteDialog"-->
    <!--      @confirm="deleteSelected"-->
    <!--      @action-success="refreshTable(false, false)"-->
    <!--    />-->
    <user-brandname-dialog
      ref="brandnameDialog"
      @action-success="refreshTable(false, false)"
    />
    <user-time-range-dialog
      ref="timeRangeDialog"
      @action-success="refreshTable(false, false)"
    ></user-time-range-dialog>
  </v-container>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { SELECT_USER_STATUS } from "@/constants/dataSelect";
import RoleSelectDialog from "@/components/page/admin/user/RoleSelectDialog.vue";
import { renderFile } from "@/helpers/ultis";
import {
  ROLE_ADMIN,
  ROLE_ADVERTISER,
  ROLE_INSPECTOR,
  ROLE_SUPER_ADMIN
} from "@/constants/role";
import AdvertiserDialog from "@/components/page/admin/user/AdvertiserDialog.vue";
import RoleSelect from "@/components/select/RoleSelect.vue";
import ApproveAgencyDialog from "@/components/page/admin/user/ApproveAgencyDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "@/components/table/ApiDataTable.vue";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import UserDialog from "~/components/page/admin/user/UserDialog.vue";
import { USER } from "~/constants/resource";
import { ROLE_AGENCY } from "~/constants/role";
import UserDeleteDialog from "~/components/page/admin/user/UserDeleteDialog.vue";
import { CODE_SUCCESS, USER_STATUS } from "~/constants/code";
import UserPasswordDialog from "~/components/page/admin/user/UserPasswordDialog.vue";
import AgencyDialog from "~/components/page/admin/user/AgencyDialog.vue";
import RejectDialog from "~/components/common/RejectDialog.vue";
import { UserInterface } from "~/interface/data/user";
import { FormDialogInterface } from "~/interface/components/dialog";
import UserApproveMultiDialog from "~/components/page/admin/user/UserApproveMultiDialog.vue";
import RejectMultiDialog from "~/components/common/RejectMultiDialog.vue";
import UserLockDialog from "~/components/page/admin/user/UserLockDialog.vue";
import UserMassDeleteDialog from "~/components/page/admin/user/UserMassDeleteDialog.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { ConfirmDialogRef } from "~/components/common/ConfirmDialog.vue";
import UserBrandnameDialog from "~/components/page/admin/user/UserBrandnameDialog.vue";
import UserTimeRangeDialog from "~/components/page/admin/user/UserTimeRangeDialog.vue";

interface ComponentData {
  roleSelecting: boolean;
  resource: string;
  loading: boolean;
  user: UserInterface;
  USER_STATUS: any;
  USER_STATUS_MAP: any;
  searchParams: any;
  selectedItems: Array<object>;
  $refs: {
    passwordDialog: FormDialogInterface;
    dialog: FormDialogInterface;
    agencyDialog: FormDialogInterface;
    advertiserDialog: FormDialogInterface;
    deleteDialog: FormDialogInterface;
    approveDialog: FormDialogInterface;
    rejectDialog: FormDialogInterface;
    massDeleteDialog: ConfirmDialogRef;
  };
}

interface ComponentComputed {
  tableRef: ApiDataTableRef;
}

interface ComponentMethods {
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentComputed & ComponentMethods
>).extend({
  components: {
    UserTimeRangeDialog,
    BaseMassDeleteDialog,
    UserBrandnameDialog,
    UserMassDeleteDialog,
    UserLockDialog,
    RejectMultiDialog,
    UserApproveMultiDialog,
    ApproveAgencyDialog,
    AdvertiserDialog,
    RoleSelectDialog,
    NewCustomFilter,
    RejectDialog,
    AgencyDialog,
    UserPasswordDialog,
    UserDeleteDialog,
    UserDialog,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true
      })
    }
  },
  data() {
    return {
      roleSelecting: false,
      resource: USER,
      USER_STATUS,
      selectedItems: [],
      USER_STATUS_MAP: {
        PENDING: {
          color: "warning",
          text: "Chờ phê duyệt"
        },
        VERIFIED: {
          color: "info",
          text: "Chưa kích hoạt"
        },
        ACTIVE: {
          color: "success",
          text: "Đang sử dụng"
        },
        LOCKED: {
          color: "error",
          text: "Đã khóa"
        },
        INVALID: {
          color: "error",
          text: "Từ chối phê duyệt"
        },
        DELETED: {
          color: "error",
          text: "Đã khóa"
        }
      },
      user: {},
      loading: false,
      searchParams: {}
    };
  },
  computed: {
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      const itemsApprove = this.selectedItems?.filter(
        item =>
          item.status === USER_STATUS.PENDING ||
          item.status === USER_STATUS.INVALID
      );

      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
      };

      toolbarShow["approve-multi"] = {
        icon: "check",
        desc: `Phê duyệt (${itemsApprove?.length})`,
        disabled: itemsApprove?.length === 0,
        tooltip: "Đồng ý duyệt"
      };

      const itemsReject = this.selectedItems?.filter(
        item => item.status === USER_STATUS.PENDING
      );
      toolbarShow["reject-multi"] = {
        icon: "close",
        desc: `Từ chối (${itemsReject?.length})`,
        disabled: itemsReject?.length === 0,
        tooltip: "Từ chối duyệt"
      };

      return toolbarShow;
    },
    userRole() {
      return this.$auth.user.roles[0] && this.$auth.user.roles[0].name;
    },
    filters() {
      return [
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo",
          maxDate: "tomorrow"
        },
        {
          type: SELECT,
          name: "status",
          label: "Trạng thái",
          items: SELECT_USER_STATUS,
          multiple: false
        },
        {
          type: RESOURCE,
          request_name: "custom_role_id",
          component: RoleSelect,
          name: "role_id",
          label: "Nhóm người dùng",
          itemValue: "id",
          itemText: "display_name",
          props: {
            multiple: false,
            itemValue: "id",
            includeSystem: true
          }
        },
        {
          type: RESOURCE,
          name: "agency",
          request_name: "custom_agency_id",
          label: "Thuộc agency",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            }
          }
        }
        // {
        //   type: RESOURCE,
        //   request_name: "custom_agency_id",
        //   component: AgencyAdvertiserSelect,
        //   itemValue: "id",
        //   itemText: "full_name",
        //   props: {
        //     multiple: false,
        //     label: "Thuộc agency",
        //     filter: {
        //       type: ROLE_AGENCY
        //     }
        //   }
        // }
      ];
    },
    headers() {
      return [
        {
          text: "Tên tài khoản",
          value: "username",
          width: 200
        },
        {
          text: "Email",
          value: "email",
          width: 240
        },
        {
          text: "Tên doanh nghiệp",
          value: "full_name",
          width: 160
        },
        {
          text: "Số điện thoại",
          class: "sticky-right",
          value: "phone_number",
          width: 144
        },

        {
          text: "Nhóm người dùng",
          value: "roles",
          sortable: false,
          width: 160
        },
        {
          text: "Số brandname",
          value: "brandnames_count",
          sortable: false,
          width: 120,
          align: "right"
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: 144
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },
        {
          text: "Hành động",
          value: "action",
          sortable: false,
          align: "right",
          class: "sticky-right",
          width: 80,
          actions: [
            {
              color: "error",
              icon: "close",
              label: "Từ chối",
              event: "reject",
              visible: item => {
                return item.status === USER_STATUS.PENDING;
              }
            },
            {
              color: "success",
              icon: "cached",
              label: "Gửi lại email kích hoạt",
              event: "approve",
              visible: item => {
                return item.status === USER_STATUS.VERIFIED;
              }
            },

            {
              color: "error",
              icon: "delete",
              label: "Xóa tài khoản",
              event: "delete-item"
            },

            {
              color: "success",
              icon: "check",
              label: "Chấp thuận",
              event: "approve",
              visible: item => {
                return (
                  item.status === USER_STATUS.PENDING ||
                  item.status === USER_STATUS.INVALID
                );
              }
            },
            {
              color: "purple",
              icon: "mdi-file-eye-outline",
              label: "Dữ liệu truy cập",
              event: "edit-brandname",
              visible: item => {
                return item.status === USER_STATUS.ACTIVE;
              }
            },

            {
              color: "primary",
              icon: "mdi-calendar-clock",
              label: "Cấu hình thời gian dữ liệu báo cáo",
              event: "edit-report-time-range",
              visible: item => {
                return item.status === USER_STATUS.ACTIVE;
              }
            },

            {
              color: "error",
              icon: "lock",
              label: "Khóa tài khoản",
              event: "lock-item",
              visible: item => {
                return item.status === USER_STATUS.ACTIVE;
              }
            },
            {
              color: "success",
              icon: "lock_open",
              label: "Mở khóa tài khoản",
              event: "lock-item",
              visible: item => {
                return item.status === USER_STATUS.LOCKED;
              }
            },
            {
              color: "purple",
              icon: "vpn_key",
              label: "Đổi mật khẩu",
              event: "change-password",
              visible: item => {
                return item.status === USER_STATUS.ACTIVE;
              }
            },
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              event: "edit-item",
              visible: item => {
                return item.status !== USER_STATUS.DELETED;
              }
            }
          ]
        }
      ];
    },
    tableRef() {
      return this.$refs.table as ApiDataTableRef;
    }
  },
  methods: {
    addItem() {
      this.roleSelecting = true;
    },
    canChangeAccess(item) {
      if (item.status === USER_STATUS.ACTIVE) {
        if (this.$authHasRole(ROLE_SUPER_ADMIN)) {
          return true;
        }
        if (this.$authHasRole(ROLE_ADMIN)) {
          if (
            item.roles[0] &&
            item.roles[0].name !== ROLE_ADMIN &&
            item.roles[0].name !== ROLE_SUPER_ADMIN
          ) {
            return true;
          }
        }
        if (this.$authHasRole(ROLE_AGENCY)) {
          if (item.roles[0] && item.roles[0].name === ROLE_ADVERTISER) {
            return true;
          }
        }
      }
      return false;
    },
    addAdmin() {
      this.roleSelecting = false;
      this.$refs.dialog.show();
    },
    addInspector() {
      this.roleSelecting = false;
      this.$refs.dialog.show(null, ROLE_INSPECTOR);
    },
    addAgency() {
      this.roleSelecting = false;
      this.$refs.agencyDialog.show();
    },
    addAdvertiser() {
      this.roleSelecting = false;
      this.$refs.advertiserDialog.show();
    },
    editItem(item) {
      if (item.roles[0] && item.roles[0].name === ROLE_AGENCY) {
        this.$refs.agencyDialog.show(item);
      } else if (item.roles[0] && item.roles[0].name === ROLE_ADVERTISER) {
        this.$refs.advertiserDialog.show(item, item.agencies[0]);
      } else {
        this.$refs.dialog.show(item, item.roles[0].name);
      }
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    lockItem(item) {
      this.$refs.lockDialog.show(item);
    },
    changePassword(item) {
      this.$refs.passwordDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.tableRef.refresh(toFirstPage);
    },
    confirmApprove(item) {
      this.user = cloneDeep(item);
      this.$refs.approveDialog.show();
    },
    confirmReject(item) {
      this.user = cloneDeep(item);
      this.$refs.rejectDialog.show();
    },
    editBrandname(item) {
      this.$refs.brandnameDialog.show(item);
    },
    editReportTimeRange(item) {
      this.$refs.timeRangeDialog.show(item);
    },
    approveMulti() {
      const items = this.selectedItems?.filter(item => {
        return (
          item.status === USER_STATUS.PENDING ||
          item.status === USER_STATUS.INVALID
        );
      });
      if (items?.length > 0) {
        this.$refs.approveMultiDialog.show(items);
      }
    },
    rejectMulti() {
      const items = this.selectedItems?.filter(
        item => item.status === USER_STATUS.PENDING
      );
      if (items?.length > 0) {
        this.$refs.rejectMultiDialog.show(items);
      }
    },
    async approveUser() {
      this.loading = true;
      try {
        const res = await this.$apiAction.approveUser({ id: this.user.id });
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Gửi mail thông báo chấp thuận thành công");
          this.refreshTable();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {}
      this.loading = false;
      this.$refs.approveDialog.hide();
    },
    async rejectUser(reason) {
      this.loading = true;
      try {
        const res = await this.$apiAction.rejectUser({
          id: this.user.id,
          reason
        });
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Gửi mail thông báo từ chối thành công");
          this.refreshTable();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
      this.$refs.rejectDialog.hide();
    },
    renderFile(file) {
      return renderFile(file);
    },
    showDetail(item) {
      this.$router.push(`/user/${item.id}`);
    }
  }
});
</script>
