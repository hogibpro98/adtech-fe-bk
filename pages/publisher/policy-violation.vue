<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <v-divider />
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            page-name="publisher-policy-violation"
            calculate-widths
            @add-item="addItem"
            @appeal-item="appealItem"
            @reject-item="rejectItem"
            @resolve-item="resolveItem"
            @resend-item="resendItem"
          >
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                v-if="statusMap[item.status]"
                :color="statusMap[item.status].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ statusMap[item.status].text }}
              </v-chip>
            </template>
            <template slot="item.user" slot-scope="{ item }">
              <nuxt-link
                v-if="item.user && !item.inventory.deleted_at"
                :to="`/user/${item.user.id}`"
                class="truncate-2 w-full block"
              >
                {{ item.user.full_name }}
              </nuxt-link>
              <span v-else>
                {{ item.user.full_name || "" }}
              </span>
            </template>
            <template slot="item.inventory" slot-scope="{ item }">
              <nuxt-link
                v-if="item.inventory && !item.inventory.deleted_at"
                :to="`/setting-display-ads/inventory/${item.inventory_id}`"
                class="truncate-2 w-full block"
              >
                {{ item.inventory.name }}
              </nuxt-link>
              <span v-else>
                {{ item.inventory.name || "" }}
              </span>
            </template>
            <template
              v-if="item.policy"
              slot="item.policy"
              slot-scope="{ item }"
            >
              {{ item.policy.name }}
            </template>
            <template
              v-if="item.sent_mail_at"
              slot="item.sent_mail_at"
              slot-scope="{ item }"
            >
              {{ item.sent_mail_at | timestamp }}
            </template>
            <v-btn
              slot="search-right"
              color="primary"
              dark
              class="mr-0"
              @click="addItem()"
            >
              <v-icon>add</v-icon>
              Thêm
            </v-btn>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <policy-violation-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></policy-violation-form-dialog>
    <policy-violation-resolve-dialog
      ref="resolveDialog"
      @action-success="refreshTable"
    ></policy-violation-resolve-dialog>
    <policy-violation-reject-dialog
      ref="rejectDialog"
      @action-success="refreshTable"
    ></policy-violation-reject-dialog>
    <policy-violation-appeal-dialog
      ref="appealDialog"
      @action-success="refreshTable"
    />
    <policy-violation-resend-dialog
      ref="resendDialog"
      @action-success="refreshTable"
    />
  </v-container>
</template>
<script lang="ts">
import { RESOURCE, SELECT, TEXT } from "@/constants/filterType";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import PolicySelect from "~/components/select/PolicySelect.vue";
import PolicyViolationFormDialog from "~/components/page/publisher/policy-violation/PolicyViolationFormDialog.vue";
import PolicyViolationResolveDialog from "~/components/page/publisher/policy-violation/PolicyViolationResolveDialog.vue";
import PolicyViolationAppealDialog from "~/components/page/publisher/policy-violation/PolicyViolationAppealDialog.vue";
import PolicyViolationRejectDialog from "~/components/page/publisher/policy-violation/PolicyViolationRejectDialog.vue";
import PolicyViolationResendDialog from "~/components/page/publisher/policy-violation/PolicyViolationResendDialog.vue";

interface ComponentData {
  showing: boolean;
  timeout: number;
  resource: string;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  searchParams: Array<object>;
  startIndex: number;
  $refs: {
    table: ApiDataTableRef;
  };
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    PolicyViolationResendDialog,
    PolicyViolationRejectDialog,
    PolicyViolationAppealDialog,
    PolicyViolationResolveDialog,
    PolicyViolationFormDialog,
    NewCustomFilter,
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
      resource: "publisher/policy-violation",
      objectName: "policy",
      searchParams: null,
      startIndex: 0
    };
  },
  computed: {
    filters() {
      return [
        {
          type: RESOURCE,
          multiple: false,
          name: "policy_code",
          label: "Chính sách vi phạm",
          itemValue: "code",
          itemText: "name",
          component: PolicySelect
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: this.statusSelectItems
        }
      ];
    },
    statusMap: () => {
      return {
        noticed: {
          color: "primary",
          text: "Mới tạo"
        },
        appealing: {
          color: "warning",
          text: "Đang khiếu nại"
        },
        reject: {
          color: "error",
          text: "Bác bỏ khiếu nại"
        },
        resolved: {
          color: "success",
          text: "Đã giải quyết"
        }
      };
    },
    statusSelectItems() {
      const keys = Object.keys(this.statusMap);
      const items = [];

      keys.forEach(e => {
        if (this.statusMap[e]?.text) {
          items.push({
            value: e,
            text: this.statusMap[e].text
          });
        }
      });

      return items;
    },
    headers() {
      return [
        {
          text: "Mã vi phạm",
          value: "code",
          width: 240,
          sortable: false
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 120,
          sortable: false
        },
        {
          text: "Inventory",
          value: "inventory",
          width: 240,
          sortable: false
        },
        {
          text: "Người sở hữu",
          value: "user",
          width: 240,
          sortable: false
        },
        {
          text: "Chính sách vi phạm",
          value: "policy",
          width: 300,
          sortable: false
        },
        {
          text: "Loại vi phạm",
          value: "type",
          width: 120,
          sortable: false
        },
        {
          text: "Thời gian cảnh báo",
          value: "sent_mail_at",
          width: 200,
          sortable: false
        },
        {
          text: "Mô tả lý do",
          value: "reason",
          width: 300,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          width: 120,
          align: "right",
          sortable: false,
          actions: [
            {
              color: "error",
              icon: "close",
              label: "Bác bỏ khiếu nại",
              event: "reject-item",
              visible: this.canReject
            },
            {
              color: "success",
              icon: "mdi-shield-check",
              label: "Xác nhận bỏ vi phạm",
              event: "resolve-item",
              visible: this.canResolve
            },
            {
              color: "primary",
              icon: "mdi-comment-alert-outline",
              label: "Khiếu nại",
              event: "appeal-item",
              visible: this.canAppeal
            },
            {
              color: "primary",
              icon: "cached",
              label: "Gửi lại thông báo",
              event: "resend-item",
              visible: this.canResend
            }
          ]
        }
      ];
    },
    toolbarShow() {
      return this.toolbar;
    }
  },
  methods: {
    canResolve(item) {
      return (
        item.item_permissions?.includes("review") && item.status !== "resolved"
      );
    },
    canReject(item) {
      return (
        item.item_permissions?.includes("review") && item.status == "appealing"
      );
    },
    canAppeal(item) {
      return (
        item.item_permissions?.includes("appeal") &&
        (item.status == "noticed" || item.status == "reject")
      );
    },
    canResend(item) {
      return (
        item.item_permissions?.includes("add") && item.status === "noticed"
      );
    },
    addItem() {
      this.$refs.dialog.show();
    },
    appealItem(item) {
      this.$refs.appealDialog.show(item);
    },
    rejectItem(item) {
      this.$refs.rejectDialog.show(item);
    },
    resolveItem(item) {
      this.$refs.resolveDialog.show(item);
    },
    resendItem(item) {
      this.$refs.resendDialog.show(item);
    }
  }
});
</script>
