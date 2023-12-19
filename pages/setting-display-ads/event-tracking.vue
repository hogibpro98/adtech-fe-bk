<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            selectable
            page-name="setting-display-ads-event-tracking"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
            @fetched-data="fetchedDataTable"
            @approve-item="approveItem"
            @reject-item="rejectItem"
            @approve-multi="approveMulti"
            @reject-multi="rejectMulti"
            @show-code="showCode"
          >
            <template slot="item.counting_type" slot-scope="props">
              <div class="text-left">
                <p>
                  {{
                    renderCountingType(props.item)
                      ? renderCountingType(props.item).text
                      : " "
                  }}
                </p>
              </div>
            </template>
            <template slot="item.counting_data" slot-scope="props">
              <div class="text-left">
                <p
                  v-if="
                    props.item.counting_data && props.item.counting_type == 3
                  "
                >
                  {{
                    "Một user tối đa " +
                      (props.item.counting_data.count || 1) +
                      " lượt, trong khoảng " +
                      (props.item.counting_data.duplication || 1) +
                      " " +
                      renderTimeType(
                        props.item.counting_data.minute || "minute"
                      )
                  }}
                </p>
              </div>
            </template>
            <template slot="item.tracking_code" slot-scope="props">
              <div class="text-left">
                <ul v-if="props.item.tracking_code">
                  <li v-for="(value, key) in props.item.tracking_code">
                    {{ value.name }}
                  </li>
                </ul>
              </div>
            </template>
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
            <template slot="item.ads_count" slot-scope="{ item }"
            >{{ item.ads_count | numberSpace }}
            </template>
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
            </template>
            <template slot="item.value" slot-scope="props">
              {{ props.item.value | numberSpace }}
            </template>
            <v-btn
              slot="search-right"
              color="primary"
              dark
              class="mr-0"
              @click="addItem()"
            >
              <v-icon>add</v-icon> Thêm
            </v-btn>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <event-tracking-form-dia-log
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></event-tracking-form-dia-log>
    <event-tracking-delete-dia-log
      ref="deleteDialog"
      @action-success="refreshTable"
    ></event-tracking-delete-dia-log>
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/event-tracking"
      object-name="event tracking"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <event-tracking-approve-dia-log
      ref="approveDialog"
      @action-success="refreshTable"
    />
    <event-tracking-reject-dialog
      ref="rejectDialog"
      @action-success="refreshTable"
    />
    <reject-multi-dialog
      ref="rejectMultiDialog"
      object-name="yêu cầu tạo tracking"
      :resource="resource"
      has-reason
      @action-success="refreshTable"
    />
    <event-tracking-approve-multi-dialog
      ref="approveMultiDialog"
      @action-success="refreshTable"
    />
    <event-tracking-form-show-dialog
      ref="dialogShowCode"
    ></event-tracking-form-show-dialog>
  </v-container>
</template>
<script lang="ts">
import EventTrackingFormDiaLog, {
  EventTrackingFormDiaLogRef
} from "@/components/page/setting-display-ads/event-tracking/EventTrackingFormDiaLog.vue";
import EventTrackingDeleteDiaLog, {
  EventTrackingDeleteDiaLogRef
} from "@/components/page/setting-display-ads/event-tracking/EventTrackingDeleteDiaLog.vue";
import { TEXT } from "@/constants/filterType";
import { EVENT_TRACKING } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import {
  EVEN_TRACKING_COUNTING_TYPE,
  EVEN_TRACKING_STATUS
} from "~/constants/dataSelect";
import { RepositoryInterface } from "~/interface/plugin/repository";
import EventTrackingRejectDialog, {
  EventTrackingRejectDialogRef
} from "~/components/page/setting-display-ads/event-tracking/EventTrackingRejectDialog.vue";
import EventTrackingApproveDiaLog, {
  EventTrackingApproveDiaLogRef
} from "~/components/page/setting-display-ads/event-tracking/EventTrackingApproveDiaLog.vue";
import RejectMultiDialog from "~/components/common/RejectMultiDialog.vue";
import EventTrackingApproveMultiDialog from "~/components/page/setting-display-ads/event-tracking/EventTrackingApproveMultiDialog.vue";
import { CodeZoneFormShowDialogRef } from "~/components/page/setting-display-ads/zone/CodeZoneFormShowDialog.vue";
import EventTrackingFormShowDialog from "~/components/page/setting-display-ads/event-tracking/EventTrackingFormShowDialog.vue";

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
    dialog: EventTrackingFormDiaLogRef;
    deleteDialog: EventTrackingDeleteDiaLogRef;
    approveDialog: EventTrackingApproveDiaLogRef;
    rejectDialog: EventTrackingRejectDialogRef;
  };
  $eventTrackingFormDiaLog: RepositoryInterface;
  dialogShowCode: CodeZoneFormShowDialogRef;
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
  loading: object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    BaseMassDeleteDialog,
    EventTrackingDeleteDiaLog,
    EventTrackingFormDiaLog,
    ApiDataTable,
    EventTrackingApproveDiaLog,
    EventTrackingRejectDialog,
    RejectMultiDialog,
    EventTrackingApproveMultiDialog,
    EventTrackingFormShowDialog
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
      loading: {},
      resource: EVENT_TRACKING,
      objectName: "event-tracking",
      filters: [
        {
          type: TEXT,
          name: "name",
          label: "Tên"
        }
      ],
      searchParams: null,
      headers: [
        {
          text: "Tên",
          value: "name",
          width: 240,
          sortable: false
        },
        {
          text: "Người sở hữu",
          value: "users.full_name",
          width: 200,
          sortable: false
        },
        {
          text: "Số QC sử dụng",
          value: "ads_count",
          width: 160,
          align: "right",
          sortable: false
        },
        {
          text: "Danh mục",
          value: "action_categories.name",
          width: 250,
          sortable: false
        },
        {
          text: "Danh mục chỉnh sửa",
          value: "custom_category",
          width: 250,
          sortable: false
        },
        {
          text: "Giá trị",
          value: "value",
          width: 240,
          align: "right",
          sortable: false
        },
        {
          text: "Cách đếm",
          value: "counting_type",
          width: 200,
          sortable: false
        },
        {
          text: "Dữ liệu đếm",
          value: "counting_data",
          width: 250,
          sortable: false
        },
        {
          text: "Mã theo dõi",
          value: "tracking_code",
          width: 400,
          sortable: false
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 200,
          sortable: true
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 200,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          width: 120,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "settings",
              label: "Lấy code",
              event: "show-code"
            },
            {
              color: "error",
              icon: "close",
              label: "Từ chối gói tracking",
              event: "reject-item",
              visible: this.canReject
            },
            {
              color: "success",
              icon: "mdi-shield-check",
              label: "Phê duyệt gói tracking",
              event: "approve-item",
              visible: this.canApprove
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
          ]
        }
      ],
      startIndex: 0
    };
  },
  computed: {
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa các bản ghi"
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
    isLoadingChangeStatus() {
      return Object.keys(this.loading).some(key => !!this.loading[key]);
    },
    statusMap: () => {
      return {
        created: {
          color: "primary",
          text: "Khởi tạo"
        },
        reject: {
          color: "error",
          text: "Từ chối"
        },
        approve: {
          color: "success",
          text: "Đã phê duyệt"
        }
      };
    }
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      if (item.counting_data == null || item.counting_data.length === 0) {
        item.counting_data = {
          count: 1,
          minute: "hour",
          duplication: 1
        };
      }
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    renderCountingType(item) {
      if (item) {
        return EVEN_TRACKING_COUNTING_TYPE.find(
          ({ value }) => item.counting_type === value
        );
      }
      return false;
    },
    renderStatus(item) {
      if (item) {
        return EVEN_TRACKING_STATUS.find(({ value }) => item.status === value);
      }
      return {
        color: "warning",
        value: "pending",
        text: "Khởi tạo"
      };
    },
    renderTimeType(key) {
      const maps = { minute: "phút", hour: "giờ", day: "ngày" };
      return maps[key];
    },
    isApprove(value) {
      return value === "approve";
    },
    fetchedDataTable() {
      this.loading = {};
    },
    canReject(item) {
      return (
        item.item_permissions?.includes("review") && item.status == "created"
      );
    },
    canApprove(item) {
      return (
        item.item_permissions?.includes("approve") &&
        (item.status == "created" || item.status == "reject")
      );
    },
    rejectItem(item) {
      this.$refs.rejectDialog.show(item);
    },
    approveItem(item) {
      this.$refs.approveDialog.show(item);
    },
    rejectMulti() {
      const items = this.selectedItems?.filter(item => {
        return item?.item_permissions?.includes("reject");
      });
      if (items?.length > 0) {
        this.$refs.rejectMultiDialog.show(items);
      }
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
    showCode(item) {
      this.$refs.dialogShowCode.show(item);
    }
  }
});
</script>
