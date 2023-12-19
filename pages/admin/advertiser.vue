<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters"/>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :toolbar="{
              isCreate: true
            }"
            :filter="searchParams"
            page-name="admin-advertiser"
            calculate-widths
            @add-item="addAgency"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @lock-item="lockItem"
            @change-password="changePassword"
            @approve="confirmApprove"
            @reject="confirmReject"
          >
            <template slot="item.name" slot-scope="{ item }"></template>
            <template slot="item.username" slot-scope="{ item }">
              <a href="javascript:;" @click="showDetail(item)">{{
                  item.username
                }}</a>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="USER_STATUS_MAP[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
              >
                {{ USER_STATUS_MAP[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.created_at" slot-scope="{ item }">
              {{ item.created_at | date }}
            </template>
            <template slot="item.user_info.documents" slot-scope="{ item }">
              <span
                v-html="
                  item.user_info ? renderFile(item.user_info.documents) : ''
                "
              ></span>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <user-delete-dialog ref="deleteDialog" @action-success="refreshTable"/>
    <user-lock-dialog ref="lockDialog" @action-success="refreshTable"/>
    <user-password-dialog ref="passwordDialog" @action-success="refreshTable"/>
    <advertiser-dialog
      ref="advertiserDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <confirm-dialog
      ref="approveDialog"
      :loading="loading"
      title="Phê duyệt đăng ký"
      @confirm="approveUser"
      @hidden="user = {}"
    >
      <div slot="content">
        Bạn có chắc chắn phê duyệt đăng ký của tài khoản
        <span class="error--text">{{ user.username }}</span> không?
        <div class="row mt-4">
          <span class="col-5 py-0">Email:</span>
          <span class="font-weight-bold col-7 py-0">{{ user.email }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Tên doanh nghiệp:</span>
          <span class="font-weight-bold col-7 py-0">{{ user.full_name }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Số điện thoại:</span>
          <span class="font-weight-bold col-7 py-0">{{
              user.phone_number
            }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Nhóm người dùng:</span>
          <span class="font-weight-bold col-7 py-0">{{
              user.roles && user.roles.length > 0
                ? user.roles[0].display_name
                : "Chưa có nhóm người dùng"
            }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Địa chỉ:</span>
          <span class="font-weight-bold col-7 py-0">{{
              user.user_info && user.user_info.address
            }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Người đại diện:</span>
          <span class="font-weight-bold col-7 py-0">{{
              user.user_info && user.user_info.representative
            }}</span>
        </div>
        <div class="row">
          <span class="col-5 py-0">Mã số thuế:</span>
          <span class="font-weight-bold col-7 py-0">{{
              user.user_info && user.user_info.tax_no
            }}</span>
        </div>

        <div class="row">
          <span class="col-5 py-0">Tài liệu đính kèm:</span>
          <span
            class="col-7 py-0"
            v-html="user.user_info ? renderFile(user.user_info.documents) : ''"
          ></span>
        </div>
      </div>
    </confirm-dialog>
    <reject-dialog
      ref="rejectDialog"
      @confirm="rejectUser"
      @hidden="user = {}"
    ></reject-dialog>
  </v-container>
</template>
<script lang="ts">
import {cloneDeep} from "lodash";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import {DATE, SELECT} from "@/constants/filterType";
import {SELECT_ADVERTISER_STATUS} from "@/constants/dataSelect";
import AdvertiserDialog from "@/components/page/admin/user/AdvertiserDialog.vue";
import {renderFile} from "@/helpers/ultis";
import {DataTableHeader} from "vuetify";
import Vue, {VueConstructor} from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import {USER} from "~/constants/resource";
import UserDeleteDialog, {
  UserDeleteDialogRef
} from "~/components/page/admin/user/UserDeleteDialog.vue";
import {CODE_SUCCESS, USER_STATUS} from "~/constants/code";
import UserPasswordDialog, {
  UserPasswordDialogRef
} from "~/components/page/admin/user/UserPasswordDialog.vue";
import ConfirmDialog, {
  ConfirmDialogRef
} from "~/components/common/ConfirmDialog.vue";
import RejectDialog, {
  RejectDialogRef
} from "~/components/common/RejectDialog.vue";
import {GlobalDataInterface} from "~/interface/data/global";
import {FilterInterface} from "~/interface/data/filter";
import {UserInterface} from "~/interface/data/user";
import {AdvertiserDialogRef} from "~/components/page/admin/user/AdvertiserDialog.vue";
import {FileInterface} from "~/interface/data/file";
import UserLockDialog from "~/components/page/admin/user/UserLockDialog.vue";

interface ComponentData extends GlobalDataInterface {
  roleSelecting: boolean;
  resource: string;
  USER_STATUS: object;
  USER_STATUS_MAP: object;
  user: UserInterface;
  loading: boolean;
  searchParams: Array<object>;
  startIndex: number;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  $refs: {
    table: ApiDataTableRef;
    rejectDialog: RejectDialogRef;
    approveDialog: ConfirmDialogRef;
    advertiserDialog: AdvertiserDialogRef;
    passwordDialog: UserPasswordDialogRef;
    deleteDialog: UserDeleteDialogRef;
  };
}

interface ComponentMethod {
  addAgency(): void;

  editItem(item: UserInterface): void;

  deleteItem(item: UserInterface): void;

  changePassword(item: UserInterface): void;

  confirmApprove(item: UserInterface): void;

  confirmReject(item: UserInterface): void;

  showDetail(item: UserInterface): void;

  approveUser(): void;

  rejectUser(reason: string): void;

  refreshTable(toFirstPage?: boolean): void;

  renderFile(file: FileInterface): string;
}

export default (Vue as VueConstructor<Vue & ComponentData & ComponentMethod>).extend({
  components: {
    UserLockDialog,
    AdvertiserDialog,
    NewCustomFilter,
    RejectDialog,
    ConfirmDialog,
    UserPasswordDialog,
    UserDeleteDialog,
    ApiDataTable
  },
  layout: "dashboard",
  data() {
    return {
      roleSelecting: false,
      resource: USER,
      USER_STATUS,
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
          text: "Đã từ chối"
        },
        DELETED: {
          color: "error",
          text: "Đã khóa"
        }
      },
      user: {},
      loading: false,
      filters: [
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo"
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: SELECT_ADVERTISER_STATUS
        }
      ],
      searchParams: {}
    };
  },
  computed: {
    userRole() {
      return this.$auth.user.roles[0]?.name;
    },
    headers() {
      return [
        {
          text: "Tên tài khoản",
          value: "username",
          width: 200
        },
        {
          text: "Tên doanh nghiệp",
          value: "full_name",
          width: 160
        },
        {
          text: "Email",
          value: "email",
          width: 240
        },
        {
          text: "Số điện thoại",
          class: "sticky-right",
          value: "phone_number",
          width: 160
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 120
        },

        {
          text: "Người đại diện",
          width: 160,
          value: "user_info.representative",
          sortable: false
        },

        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "right",
          width: 144
        },
        {
          text: "Hành động",
          value: "action",
          sortable: false,
          width: 76,
          class: "sticky-right",
          actions: [
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
              icon: "close",
              label: "Từ chối",
              event: "reject",
              visible: item => {
                return item.status === USER_STATUS.PENDING;
              }
            },
            {
              color: "error",
              icon: "delete",
              label: "Xóa tài khoản",
              event: "delete-item"
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
              event: "change-password"
            },
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              event: "edit-item"
            }
          ]
        }
      ];
    }
  },
  methods: {
    addAgency() {
      this.$refs.advertiserDialog.show();
    },
    editItem(item) {
      this.$refs.advertiserDialog.show(item, item.agencies[0]);
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
      this.$refs.table.refresh(toFirstPage);
    },
    confirmApprove(item) {
      this.user = cloneDeep(item);
      this.$refs.approveDialog.show();
    },
    confirmReject(item) {
      this.user = cloneDeep(item);
      this.$refs.rejectDialog.show();
    },
    async approveUser() {
      this.loading = true;
      try {
        const res = await this.$apiAction.approveUser({id: this.user.id});
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Gửi mail thông báo chấp thuận thành công");
          this.refreshTable();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
      }
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
