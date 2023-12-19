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
            :headers="headers"
            :filter="filterTable"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            :default-pagination="defaultPagination"
            page-name="expense-ads-list-order-mms"
            calculate-widths
            selectable
            v-on="$listeners"
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
            @approve-item="approveItem"
            @reject-item="rejectItem"
            @reject-multi="rejectMulti"
          >
            <template slot="item.user.full_name" slot-scope="{ item }">
              <nuxt-link
                :to="`/user/${item.user.id}`"
                class="w-full block"
                style="max-width: 250px"
              >
                {{ item.user.full_name }}
              </nuxt-link>
            </template>
            <template slot="item.date" slot-scope="{ item }">
              {{ item.date | date }}
            </template>
            <template slot="item.real_price" slot-scope="{ item }">
              <div class="text-right">
                {{ item.real_price | currency }}
              </div>
            </template>
            <template slot="item.price" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price | currency }}
              </div>
            </template>
            <template slot="item.bonus" slot-scope="{ item }">
              <div class="text-right">
                {{ item.bonus | currency }}
              </div>
            </template>
            <template slot="item.price_per_mms" slot-scope="{ item }">
              <div class="text-right">
                {{ item.price_per_mms | currency }}
              </div>
            </template>
            <template slot="item.duration" slot-scope="{ item }">
              <div class="text-right">
                {{ item.duration | numberSpace }} ngày
              </div>
            </template>
            <template slot="item.expired_date" slot-scope="{ item }">
              {{ item.expired_date | date }}
            </template>
            <template slot="item.created_at" slot-scope="{ item }">
              {{ item.created_at | timestamp }}
            </template>
            <template slot="item.updated_at" slot-scope="{ item }">
              {{ item.updated_at | timestamp }}
            </template>
            <template slot="item.documents" slot-scope="{ item }">
              <span
                v-html="item.documents ? renderFile(item.documents) : ''"
              ></span>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="TRANSACTION_MAP[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
                @click="$event => showReason(item, $event)"
              >
                {{ TRANSACTION_MAP[item.status].text }}
              </v-chip>
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
        <recharge-form-dialog
          ref="rechargeDialog"
          @create-success="refreshTable(true)"
          @update-success="refreshTable"
        />
        <recharge-delete-dialog
          ref="deleteDialog"
          @action-success="refreshTable"
        />
        <recharge-approve-dialog
          ref="approveDialog"
          @confirm="confirmApproveItem"
        ></recharge-approve-dialog>
        <recharge-mass-delete-dialog
          ref="massDeleteDialog"
          display-value="code"
          @confirm="deleteSelected"
          @action-success="refreshTable(false, false)"
        />
        <reject-dialog
          ref="rejectDialog"
          :loading="dialogLoading"
          title="Từ chối yêu cầu"
          @confirm="confirmRejectItem"
        >
          <template slot="content">
            Bạn có chắc chắn muốn từ chối yêu cầu nạp ví 511 mã
            <span class="error--text">{{ currentItem.code }}</span
            >?<br />
            Vui lòng nêu rõ lý do từ chối:
          </template>
        </reject-dialog>
        <reject-multi-dialog
          ref="rejectMultiDialog"
          object-name="đơn hàng"
          :resource="resource"
          @action-success="refreshTable"
        />
        <v-menu
          v-model="rejectReasonShow"
          :activator="menuActivator"
          :open-on-click="false"
          eager
          offset-x
          offset-overflow
          transition="slide-x-transition"
        >
          <v-card tile max-width="240">
            <v-card-text class="pa-2">
              <div>
                Lý do từ chối:
              </div>
              <div class="error--text">
                {{ rejectReason }}
              </div>
            </v-card-text>
          </v-card>
        </v-menu>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import EWalletRechargeDeleteDialog from "@/components/page/expense-mms/EWalletRechargeDeleteDialog.vue";
import AgencyAdvertiserSelect from "@/components/select/AgencyAdvertiserSelect.vue";
import { STATUS_ORDER_RECHARGE_NAME } from "@/constants/dataSelect";
import { DATE, RESOURCE, SELECT } from "@/constants/filterType";
import { AGENCY_WALLET_SMS_TRANSACTION } from "@/constants/resource";
import { renderFile } from "@/helpers/ultis";
import { ROLE_IS_ADMIN, ROLE_AGENCY, ROLE_ADMIN } from "@/constants/role";
import cloneDeep from "lodash/cloneDeep";
import { CODE_SUCCESS, TRANSACTION_STATUS } from "@/constants/code";
import RejectDialog from "@/components/common/RejectDialog.vue";
import EWalletRechargeApproveForm from "@/components/page/expense-mms/EWalletRechargeApproveForm.vue";
import UserSelect from "@/components/select/UserSelect.vue";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { RedirectRechargeFormDialogRef } from "~/components/page/expense-redirect/RedirectRechargeFormDialog.vue";
import { SettingMaxDebtFormDialogRef } from "~/components/page/expense-redirect/SettingMaxDebtFormDialog.vue";
import { TransactionMMSDaily } from "~/interface/data/expense";
import { RejectDialogRef } from "~/components/common/RejectDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { OrderRechargeInterface } from "~/interface/data/orderRecharge";
import { FileInterface } from "~/interface/data/file";
import { rechargeDialogRef } from "~/components/page/expense-mms/rechargeDialog.vue";
import { EWalletRechargeApproveFormRef } from "~/components/page/expense-mms/EWalletRechargeApproveForm.vue";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import MmsRechargeMassDeleteDialog from "~/components/page/expense-mms/MmsRechargeMassDeleteDialog.vue";
import RechargeFormDialog from "~/components/page/expense-ads/sms/RechargeFormDialog.vue";
import RechargeDeleteDialog from "~/components/page/expense-ads/sms/RechargeDeleteDialog.vue";
import RechargeApproveDialog from "~/components/page/expense-ads/sms/RechargeApproveForm.vue";
import { EWalletFormRechargeRef } from "~/components/page/expense-mms/EWalletFormRecharge.vue";
import { EWalletRechargeDeleteDialogRef } from "~/components/page/expense-mms/EWalletRechargeDeleteDialog.vue";
import RechargeMassDeleteDialog from "~/components/page/expense-ads/sms/RechargeMassDeleteDialog.vue";
import RejectMultiDialog from "~/components/common/RejectMultiDialog.vue";

interface ComponentData extends GlobalDataInterface {
  timeout: number;
  menuActivator: object;
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
  loading: boolean;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  headerShow: Array<DataTableHeader>;
  filterShow: Array<FilterInterface>;
  filterTable: object;
  rejectReasonShow: boolean;
  rejectReason: string;
  currentItem: OrderRechargeInterface;
  dialogLoading: boolean;
  $agencyWalletSmsTransactionRepository: RepositoryInterface;
  $refs: {
    table: ApiDataTableRef;
    redirectRechargeDialog: RedirectRechargeFormDialogRef;
    settingMaxDebtDialog: SettingMaxDebtFormDialogRef;
    rejectDialog: RejectDialogRef;
    eWalletFormRecharge: EWalletFormRechargeRef;
    deleteDialog: EWalletRechargeDeleteDialogRef;
    approveDialog: EWalletRechargeApproveFormRef;
  };
}

interface ComponentMethod {
  recharge(item: TransactionMMSDaily): void;

  settingMaxDebt(item: TransactionMMSDaily): void;

  refreshTable(toFirstPage?: boolean): void;

  refreshTable(): void;

  checkShowButtonApprove(item: OrderRechargeInterface): boolean;

  checkShowButtonReject(item: OrderRechargeInterface): boolean;

  editItem(item: OrderRechargeInterface): void;

  deleteItem(item: OrderRechargeInterface): void;

  approveItem(item: OrderRechargeInterface): void;

  rejectItem(item: OrderRechargeInterface): void;

  confirmRejectItem(reason: string): void;

  showReason(item: OrderRechargeInterface, e: object): void;

  confirmApproveItem(): void;

  addItem(): void;

  renderFile(file: FileInterface): string;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    RejectMultiDialog,
    RechargeMassDeleteDialog,
    RechargeApproveDialog,
    RechargeDeleteDialog,
    RechargeFormDialog,
    MmsRechargeMassDeleteDialog,
    RejectDialog,
    NewCustomFilter,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  data() {
    return {
      resource: AGENCY_WALLET_SMS_TRANSACTION,
      toolbar: {
        isCreate: true,
        isToggleChart: false,
        isDelete: true,
        isFullScreen: false
      },
      selectedItems: [],
      filterCustom: {},
      headerExcludes: [],
      filterExcludes: [],
      timeout: null,
      menuActivator: null,
      rejectReasonShow: false,
      searchParams: null,
      userId: this.$auth.user.id,
      defaultPagination: {
        sortBy: ["created_at"],
        sortDesc: [true]
      },
      startIndex: 0,
      loading: false,
      dialogLoading: false,
      TRANSACTION_MAP: {
        PENDING: {
          color: "warning",
          text: "Chờ phê duyệt"
        },
        APPROVED: {
          color: "success",
          text: "Đã phê duyệt"
        },
        REJECTED: {
          color: "error",
          text: "Từ chối phê duyệt"
        }
      },
      currentItem: {},
      rejectReason: "",
      objectName: "đơn hàng nạp tiền"
    };
  },
  computed: {
    authIsAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
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
    headers() {
      return [
        {
          text: "Mã đơn hàng",
          value: "code",
          width: 180
        },
        {
          text: "Mã giao dịch",
          value: "trans_id",
          width: 180
        },
        {
          text: "Tên Agency",
          value: "user.full_name",
          sortable: false,
          width: 240,
          visible: this.$authHasRole(ROLE_IS_ADMIN)
        },
        {
          text: "Ngày nạp đơn",
          value: "date",
          width: 160
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 144
        },
        {
          text: "Giá trị sử dụng",
          value: "price",
          width: 144,
          align: "right"
        },

        {
          text: "Chiết khấu",
          value: "bonus",
          width: 144,
          align: "right"
        },

        {
          text: "Giá trị đơn hàng",
          value: "real_price",
          width: 144,
          align: "right"
        },

        {
          text: "Đơn giá tin nhắn MMS",
          value: "price_per_mms",
          width: 160,
          align: "right"
        },
        {
          text: "Thời gian sử dụng",
          value: "duration",
          width: 160,
          align: "right"
        },

        {
          text: "Ngày hết hạn",
          value: "expired_date",
          align: "right",
          width: 144
        },
        {
          text: "Mô tả",
          value: "desc",
          width: 200
        },
        {
          text: "Tài liệu đính kèm",
          value: "documents",
          width: 160
        },
        {
          text: "Người phê duyệt",
          value: "approve_admin.username",
          sortable: false,
          width: 144,
          visible: this.$authHasRole(ROLE_IS_ADMIN)
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "right",
          width: 180
        },
        {
          text: "Cập nhật lần cuối",
          value: "updated_at",
          align: "right",
          width: 180
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "success",
              icon: "check",
              label: "Phê duyệt đơn hàng",
              visible: this.checkShowButtonApprove,
              event: "approve-item"
            },
            {
              color: "error",
              icon: "close",
              label: "Từ chối đơn hàng",
              visible: this.checkShowButtonReject,
              event: "reject-item"
            },
            {
              color: "primary",
              icon: "edit",
              label: "Cập nhật đơn hàng",
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
      ];
    },
    filters() {
      return [
        {
          type: RESOURCE,
          name: "user_id",
          label: "Agency",
          itemValue: "id",
          visible: this.authIsAdmin,
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            queryParams: {
              type: ROLE_AGENCY
            }
          }
        },
        {
          type: RESOURCE,
          name: "approved_by",
          // request_name: "resource_approved_by",
          label: "Người phê duyệt",
          itemValue: "id",
          visible: this.authIsAdmin,
          itemText: "username",
          component: UserSelect,
          props: {
            itemText: "username",
            multiple: false,
            type: ROLE_ADMIN
          }
        },
        {
          type: DATE,
          name: "date",
          label: "Ngày nạp đơn"
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái đơn hàng",
          items: STATUS_ORDER_RECHARGE_NAME
        }
      ];
    },

    userRole() {
      return this.$auth.user.roles[0]?.name;
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
  },
  watch: {
    rejectReasonShow(val) {
      if (!val) {
        this.rejectReason = "";
        this.menuActivator = null;
      }
    }
  },
  methods: {
    rejectMulti() {
      const itemIds = this.selectedItems?.filter(item => {
        return item?.item_permissions?.includes("reject");
      });
      if (itemIds?.length > 0) {
        this.$refs.rejectMultiDialog.show(itemIds);
      }
    },
    checkShowButtonApprove(item) {
      return item?.item_permissions?.includes("approve");
    },
    checkShowButtonReject(item) {
      return item?.item_permissions?.includes("reject");
    },
    addItem() {
      if (this.$authHasRole(ROLE_IS_ADMIN)) {
        this.$refs.rechargeDialog.show();
      } else {
        this.$refs.rechargeDialog.show(this.$auth.user);
      }
    },
    renderFile(file) {
      return renderFile(file);
    },
    editItem(item) {
      this.$refs.rechargeDialog.show(item.user, item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },

    // refreshPanel() {
    //   this.$refs.panel.fetchData();
    // },
    approveItem(item) {
      this.$refs.approveDialog.show(item.user, item);
    },
    rejectItem(item) {
      this.currentItem = cloneDeep(item);
      this.$refs.rejectDialog.show();
    },
    confirmApproveItem() {
      this.refreshTable();
      // this.refreshPanel();
    },

    async confirmRejectItem(reason) {
      this.dialogLoading = true;
      try {
        const res = await this.$agencyWalletSmsTransactionRepository.reject({
          id: this.currentItem.id,
          reason
        });
        if (res && res.code === CODE_SUCCESS) {
          this.$toast.success("Từ chối đơn hàng thành công.");
          this.refreshTable();
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {}
      this.dialogLoading = false;
      this.currentItem = {};
      this.$refs.rejectDialog.hide();
    },

    async showReason(item, e) {
      if (!this.rejectReasonShow) {
        this.rejectReason = item.reject_reason;
        await this.$nextTick();
        if (item.status === TRANSACTION_STATUS.REJECTED) {
          this.menuActivator = e.target;
          await this.$nextTick();
          this.rejectReasonShow = true;
        }
      }
    }
  }
});
</script>
