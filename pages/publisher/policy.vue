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
            page-name="publisher-policy"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @fetched-data="fetchedDataTable"
          >
            <template slot="item.status" slot-scope="{ item }">
              <div class="d-flex align-items-center py-2">
                <span style="width: 100px; text-align: end">
                  {{ isApprove(item.status) ? "Công khai" : "Ẩn chính sách" }}
                </span>
                <v-switch
                  :input-value="isApprove(item.status)"
                  :disabled="isLoadingChangeStatus"
                  class="d-inline-flex px-0 py-0 my-0 ml-2"
                  hide-details
                  dense
                  @click="changeStatus(item.id, isApprove(item.status))"
                ></v-switch>
                <v-progress-circular
                  v-if="!!loading[item.id]"
                  indeterminate
                  size="20"
                  color="primary"
                ></v-progress-circular>
              </div>
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
            <template slot="item.level" slot-scope="{ item }">
              {{ levelMap[item.level] || "" }}
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <policy-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></policy-form-dialog>
    <policy-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></policy-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import { TEXT } from "@/constants/filterType";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import PolicyFormDialog from "~/components/page/publisher/policy/PolicyFormDialog.vue";
import PolicyDeleteDialog from "~/components/page/publisher/policy/PolicyDeleteDialog.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { responseErrorToString } from "~/util/array";
import { RepositoryInterface } from "~/interface/plugin/repository";

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
  $policyRepository: RepositoryInterface;
  loading: object;
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
  changeStatus: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    PolicyDeleteDialog,
    PolicyFormDialog,
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
      resource: "publisher/policy",
      objectName: "policy",
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
          text: "Mã chính sách",
          value: "code",
          width: 240
        },
        {
          text: "Tên",
          value: "name",
          width: 240
        },
        {
          text: "Mức độ xử phạt",
          value: "level",
          width: 300
        },
        {
          text: "Mô tả",
          value: "desc",
          width: 400
        },
        {
          text: "Thời gian áp dụng",
          value: "created_at",
          sortable: false,
          width: 200
        },
        {
          text: "Trạng thái",
          value: "status",
          sortable: false,
          width: 250
        },
        {
          text: "Hành động",
          value: "action",
          width: 120,
          align: "right",
          sortable: false,
          actions: [
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
      loading: {}
    };
  },
  computed: {
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);

      return toolbarShow;
    },
    levelMap() {
      return {
        lock_payment: "Giữ tiền quảng cáo",
        lock_inventory: "Khóa phân phối cho inventory",
        warning: "Cảnh cáo"
      };
    },
    isLoadingChangeStatus() {
      return Object.keys(this.loading).some(key => !!this.loading[key]);
    }
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    async changeStatus(itemId, newStatus) {
      this.loading = {
        ...this.loading,
        [itemId]: true
      };

      try {
        const res = await this.$policyRepository.changeStatus({
          id: itemId,
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
    isApprove(value) {
      return value === "approve";
    },
    fetchedDataTable() {
      this.loading = {};
    }
  }
});
</script>
