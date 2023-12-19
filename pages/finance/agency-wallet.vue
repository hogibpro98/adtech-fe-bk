<template>
  <v-container grid-list-xl fluid>
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :toolbar="{
              isCreate: false,
              isDownload: true,
              exportResource: '/user-service-wallet'
            }"
            :filter="searchParams"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @edit-wallet="editWallet"
            @change-filter="onChangeFilter"
          >
            <template slot="item.full_name" slot-scope="{ item }">
              <a :href="`/admin/wallet-detail/${item.id}`">{{
                item.full_name
              }}</a>
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                v-if="USER_STATUS_MAP[item.status]"
                :color="USER_STATUS_MAP[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
              >{{ USER_STATUS_MAP[item.status].text }}</v-chip>
            </template>

            <template slot="item.wallet_redirect" slot-scope="{ item }">
              <span
                v-if="getWalletBalanceByType(item, 'redirect') !== false"
                :class="
                  getWalletBalanceByType(item, 'redirect') >= 0
                    ? 'success--text'
                    : 'error--text'
                "
              >
                {{ getWalletBalanceByType(item, "redirect") | currency }}
              </span>
              <span v-else>Không sử dụng dịch vụ</span>
            </template>
            <template slot="item.wallet_sms" slot-scope="{ item }">
              <span
                v-if="getWalletBalanceByType(item, 'sms') !== false"
                :class="
                  getWalletBalanceByType(item, 'sms') >= 0
                    ? 'success--text'
                    : 'error--text'
                "
              >{{ getWalletBalanceByType(item, "sms") | currency }}</span>
              <span v-else>Không sử dụng dịch vụ</span>
            </template>
            <template slot="item.wallet_mms" slot-scope="{ item }">
              <span
                v-if="getWalletBalanceByType(item, 'mms') !== false"
                :class="
                  getWalletBalanceByType(item, 'mms') >= 0
                    ? 'success--text'
                    : 'error--text'
                "
              >{{ getWalletBalanceByType(item, "mms") | currency }}</span>
              <span v-else>Không sử dụng dịch vụ</span>
            </template>
            <template slot="item.wallet_data" slot-scope="{ item }">
              <span
                v-if="getWalletBalanceByType(item, 'data') !== false"
                :class="
                  getWalletBalanceByType(item, 'data') >= 0
                    ? 'success--text'
                    : 'error--text'
                "
              >{{ getWalletBalanceByType(item, "data") | currency }}</span>
              <span v-else>Không sử dụng dịch vụ</span>
            </template>
            <template slot="item.wallet_remain" slot-scope="{ item }">
              <span>{{ getRemainBalance(item) | currency }}</span>
            </template>
            <template slot="item.wallet_total" slot-scope="{ item }">
              <span
                v-if="getWalletBalanceByType(item, 'total') !== false"
                :class="
                  getWalletBalanceByType(item, 'total') >= 0
                    ? 'success--text'
                    : 'error--text'
                "
              >{{ getWalletBalanceByType(item, "total") | currency }}</span>
              <span v-else>Chưa có ví</span>
            </template>
            <template v-if="summary" #body.prepend="{ headers, isMobile }">
              <tr v-if="!isMobile">
                <td
                  class="font-weight-bold nowrap"
                  style="border-right: none!important;"
                >
                  Tổng
                </td>
                <td />
                <template v-for="(header, index) in visibleColumns">
                  <td
                    v-if="index !== 0"
                    :key="`column-prepend-${index}`"
                    style="border-right: none!important;"
                    class="text-right nowrap"
                  >
                    <div class="text-right font-weight-bold">
                      <p>{{ renderSummaryCol(header, index) | currency }}</p>
                    </div>
                  </td>
                </template>
              </tr>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
        <wallet-detail-display-dialog
          ref="dialog"
          @success="refreshTable"
        ></wallet-detail-display-dialog>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { debounce, memoize } from "lodash";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import { AGENCY_WALLET, WHITELIST_IP } from "~/constants/resource";
import { RESOURCE, SELECT } from "~/constants/filterType";
import RoleSelect from "~/components/select/RoleSelect.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { GlobalDataInterface } from "~/interface/data/global";
import { FilterInterface } from "~/interface/data/filter";
import { WhitelistIp } from "~/interface/data/permission";
import EWalletLinkAccount, {
  EWalletLinkAccountRef
} from "~/components/page/expense-mms/EWalletLinkAccount.vue";
import EWalletDetailDialog, {
  EWalletDetailDialogRef
} from "~/components/page/admin/agency-wallet/EWalletDetailDialog.vue";
import WalletDetailDisplayDialog from "~/components/page/admin/agency-wallet/WalletDetailDisplayDialog.vue";
import { SELECT_USER_STATUS, USER_STATUS_MAP } from "~/constants/dataSelect";

interface ComponentData extends GlobalDataInterface {
  resource: string;
  headers: Array<DataTableHeader>;
  searchParams: Array<object>;
  filters: Array<FilterInterface>;
  $refs: {
    table: ApiDataTableRef;
    linkDialog: EWalletLinkAccountRef;
    detailDialog: EWalletDetailDialogRef;
  };
}

interface ComponentMethod {
  addItem(): void;

  editItem(item: WhitelistIp): void;

  deleteItem(item: WhitelistIp): void;

  refreshTable(toFirstPage: false): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  components: {
    WalletDetailDisplayDialog,
    EWalletDetailDialog,
    EWalletLinkAccount,
    ApiDataTable,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      resource: AGENCY_WALLET,
      USER_STATUS_MAP,
      summary: null,
      headers: [
        {
          text: "Tên doanh nghiệp",
          value: "full_name",
          width: 240
        },
        {
          text: "Tên tài khoản",
          value: "username",
          width: 200
        },
        {
          text: "Trạng thái",
          value: "status",
          align: "center",
          width: 200
        },
        {
          text: "Ví redirect",
          value: "wallet_redirect",
          align: "right",
          width: 180,
          sortable: false
        },
        {
          text: "Ví MMS",
          value: "wallet_mms",
          align: "right",
          width: 180,
          sortable: false
        },
        {
          text: "Ví SMS",
          value: "wallet_sms",
          align: "right",
          width: 180,
          sortable: false
        },
        {
          text: "Ví Data",
          value: "wallet_data",
          align: "right",
          width: 180,
          sortable: false
        },
        {
          text: "Số tiền chờ phân bổ",
          value: "wallet_remain",
          align: "right",
          width: 240,
          sortable: false
        },
        {
          text: "Tổng số dư",
          value: "wallet_total",
          align: "right",
          width: 200,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          align: "center",
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa ví",
              event: "edit-wallet"
            }
          ]
        }
      ],
      searchParams: {},
      debounceFetchSummary: null
      // getWalletBalanceByType: null
    };
  },
  computed: {
    filters() {
      return [
        {
          type: SELECT,
          name: "status",
          label: "Trạng thái",
          items: [
            {
              value: "ACTIVE",
              text: "Đang sử dụng"
            },
            {
              value: "LOCKED",
              text: "Đã khóa"
            }
          ],
          multiple: false
        }
      ];
    },
    visibleColumns() {
      return this.$refs.table.shownColumns;
    }
  },
  created() {
    this.debounceFetchSummary = debounce(function() {
      this.getSummary();
    }, 500);
    this.getSummary();
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    editWallet(item) {
      this.$refs.dialog.show(item);
    },
    getWalletBalanceByType(item, type) {
      const wallet = item.wallets.find(e => e.service === type);
      if (wallet) {
        return wallet.balance;
      } else {
        return false;
      }
    },
    getRemainBalance(item) {
      let totalBalance = 0;
      let otherBalance = 0;
      if (item.wallets?.length) {
        item.wallets.forEach(wallet => {
          if (wallet.service === "total") {
            totalBalance = wallet.balance;
          } else {
            otherBalance += wallet.balance;
          }
        });
      }
      return totalBalance - otherBalance;
    },
    async getSummary(filter = {}) {
      const data = await this.$agencyWalletRepository.post("summary", filter);
      this.summary = data;
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    linkWallet(item, type = "sms") {
      this.$refs.linkDialog.show(item, type);
    },
    viewInfo(item, type) {
      const wallet = item.wallets?.find(e => e.type === type);

      if (wallet) {
        this.$refs.detailDialog.show(wallet);
      }
    },
    onChangeFilter() {
      this.debounceFetchSummary();
    },
    renderSummaryCol(header, index) {
      const service = header.slice().replace("wallet_", "");
      if (this.summary[service] !== undefined) {
        return this.summary[service];
      }
      return null;
    }
  }
});
</script>
