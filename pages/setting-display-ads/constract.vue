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
            page-name="setting-display-ads-constract"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
            @fetched-data="fetchedDataTable"
            @approve-item="approveItem"
            @reject-item="rejectItem"
          >
            <template slot="item.display_type" slot-scope="props">
              <div class="text-left">
                <p>
                  {{
                    renderDisplayType(props.item.display_type)
                      ? renderDisplayType(props.item.display_type)
                      : " "
                  }}
                </p>
              </div>
            </template>
            <template slot="item.action_type" slot-scope="props">
              <div class="text-left">
                <p>
                  {{
                    renderActionType(props.item.action_type)
                      ? renderActionType(props.item.action_type)
                      : " "
                  }}
                </p>
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
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
            </template>
            <template slot="item.expires_date" slot-scope="{ item }"
              >{{ item.expires_date | timestamp }}
            </template>
            <template slot="item.price" slot-scope="props">
              {{ props.item.price | currency }}
            </template>
            <template slot="item.user" slot-scope="props">
              {{ props.item.user.full_name || "" }}
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
    <constract-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></constract-form-dialog>
    <constract-delete-dia-log
      ref="deleteDialog"
      @action-success="refreshTable"
    ></constract-delete-dia-log>
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/constract"
      object-name="constract"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <constract-approve-dialog
      ref="approveDialog"
      @action-success="refreshTable"
    />
    <constract-reject-dialog
      ref="rejectDialog"
      @action-success="refreshTable"
    />
  </v-container>
</template>
<script lang="ts">
import ConstractFormDialog, {
  ConstractFormDialogRef
} from "~/components/page/setting-display-ads/constract/ConstractFormDialog.vue";
import ConstractDeleteDiaLog, {
  ConstractDeleteDiaLogRef
} from "@/components/page/setting-display-ads/constract/ConstractDeleteDiaLog.vue";
import { TEXT } from "@/constants/filterType";
import { CONSTRACT } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { responseErrorToString } from "~/util/array";
import { RepositoryInterface } from "~/interface/plugin/repository";
import ConstractApproveDialog, {
  ConstractApproveDialogRef
} from "~/components/page/setting-display-ads/constract/ConstractApproveDialog.vue";
import ConstractRejectDialog, {
  ConstractRejectDialogRef
} from "~/components/page/setting-display-ads/constract/ConstractRejectDialog.vue";

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
    dialog: ConstractFormDialogRef;
    deleteDialog: ConstractDeleteDiaLogRef;
    approveDialog: ConstractApproveDialogRef;
    rejectDialog: ConstractRejectDialogRef;
  };
  $constractFormDiaLog: RepositoryInterface;
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
    ConstractDeleteDiaLog,
    ConstractFormDialog,
    ApiDataTable,
    ConstractApproveDialog,
    ConstractRejectDialog
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
      resource: CONSTRACT,
      objectName: "constract",
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
          width: 200,
          sortable: false
        },
        {
          text: "Mã",
          value: "code",
          width: 200,
          sortable: false
        },

        {
          text: "Loại action",
          value: "action_type",
          width: 200,
          sortable: false
        },
        {
          text: "Đơn giá",
          value: "price",
          width: 200,
          align: "right",
          sortable: false
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 250,
          sortable: false
        },
        {
          text: "Người sở hữu",
          value: "user",
          width: 200,
          sortable: false
        },
        {
          text: "Lý do từ chối",
          value: "desc",
          width: 300,
          sortable: false
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 250,
          sortable: true
        },
        {
          text: "Thời gian hết hạn",
          value: "expires_date",
          width: 250,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          width: 200,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "error",
              icon: "close",
              label: "Từ chối gói mua khoán",
              event: "reject-item",
              visible: this.canReject
            },
            {
              color: "success",
              icon: "mdi-shield-check",
              label: "Phê duyệt gói mua khoán",
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
      startIndex: 0,
      display_type_datas: {
        banner: "Banner",
        native: "Native",
        sticky: "Sticky",
        popup: "Popup",
        interstitial: "Toàn màn hình"
      },
      action_type_datas: {
        click: "Click",
        view: "View"
      }
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
    renderDisplayType(item) {
      return this.display_type_datas[item];
    },
    renderActionType(item) {
      return this.action_type_datas[item];
    },
    isApprove(value) {
      return value === "approve";
    },
    async changeStatusCategory(macroId, newStatus) {
      this.loading = {
        ...this.loading,
        [macroId]: true
      };

      try {
        const res = await this.$constractFormDiaLog.changeStatus({
          id: macroId,
          status: newStatus ? "reject" : "approve"
        });
        this.refreshTable();
        if (res.code !== CODE_SUCCESS) {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.refreshTable();
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
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
    }
  }
});
</script>
