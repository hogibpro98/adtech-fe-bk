<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headerShow"
            :filter="searchParams"
            :start-index.sync="startIndex"
            page-name="setting-display-ads-macro"
            calculate-widths
            @fetched-data="fetchedDataTable"
            @edit-item="editItem"
          >
            <template slot="item.status" slot-scope="{ item }">
              <div class="d-flex align-items-center py-2">
                <span style="width: 100px; text-align: end">
                  {{ isApprove(item.status) ? "Sử dụng" : "Tạm dừng" }}
                </span>
                <v-switch
                  :input-value="isApprove(item.status)"
                  :disabled="isLoadingChangeStatus"
                  class="d-inline-flex px-0 py-0 my-0 ml-2"
                  hide-details
                  dense
                  @click="changeStatusCategory(item.id, isApprove(item.status))"
                ></v-switch>
                <v-progress-circular
                  v-if="!!loading[item.id]"
                  indeterminate
                  size="20"
                  color="primary"
                ></v-progress-circular>
              </div>
            </template>
            <template slot="item.type" slot-scope="{ item }">
              {{ dataFrom[item.type] || "" }}
            </template>
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <targeting-macro-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-macro-form-dialog>
  </v-container>
</template>
<script lang="ts">
import TargetingMacroFormDialog, {
  TargetingMacroFormDialogRef
} from "@/components/page/targeting/TargetingMacroFormDialog.vue";
import { MACRO } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { isEmpty } from "~/util/typeof";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";

interface ComponentData {
  showing: boolean;
  timeout: number;
  resource: string;
  loading: object;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  searchParams: Array<object>;
  startIndex: number;
  $targetingMarcoRepository: RepositoryInterface;
  $refs: {
    table: ApiDataTableRef;
    dialog: TargetingMacroFormDialogRef;
  };
}

interface ComponentMethods {
  editItem: Function;
  isEmpty: Function;
  changeStatusCategory: Function;
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    TargetingMacroFormDialog,
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
      resource: MACRO,
      searchParams: null,
      loading: {},
      startIndex: 0
    };
  },
  computed: {
    isLoadingChangeStatus() {
      return Object.keys(this.loading).some(key => !!this.loading[key]);
    },
    headerShow() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 250,
          sortable: false
        },
        {
          text: "Mã",
          value: "code",
          width: 250,
          sortable: false
        },
        {
          text: "Nguồn thông tin",
          value: "type",
          width: 200,
          sortable: false
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false,
          width: 500
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 250
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 250,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          width: 120,
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "edit",
              label: "Chỉnh sửa",
              event: "edit-item"
            }
          ]
        }
      ];
    },
    dataFrom() {
      return {
        fe: "Người dùng cung cấp",
        be: "Hệ thống"
      };
    }
  },
  methods: {
    editItem(item) {
      if (this.$refs.dialog) {
        this.$refs.dialog.show(item);
      }
    },
    isEmpty(value) {
      return isEmpty(value);
    },
    isApprove(value) {
      return value === "approve";
    },
    fetchedDataTable() {
      this.loading = {};
    },
    async changeStatusCategory(macroId, newStatus) {
      this.loading = {
        ...this.loading,
        [macroId]: true
      };

      try {
        const res = await this.$targetingMarcoRepository.changeStatus({
          id: macroId,
          status: newStatus ? "reject" : "approve"
        });
        this.refreshTable();
        if (res.code == CODE_SUCCESS) {
          this.$toast.success("Cập nhập trạng thái thành công");
        }
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
    }
  }
});
</script>
