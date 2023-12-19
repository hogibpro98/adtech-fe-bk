<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <v-card-text style="color: #333333">
            <em>Brandname được phép đồng bộ</em>
            <v-divider></v-divider>
          </v-card-text>
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
          >
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
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
    <form-dia-log
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></form-dia-log>
    <delete-dia-log
      ref="deleteDialog"
      @action-success="refreshTable"
    ></delete-dia-log>
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/sync-manual-brandname-config"
      object-name="cấu hình Brandname"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-container>
</template>
<script lang="ts">
import { TEXT } from "@/constants/filterType";
import { SYNC_MANUAL_BRANDNAME_CONFIG } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import FormDiaLog, {
  FormDiaLogRef
} from "~/components/page/manage-sync-ads/BrandnameConfig/FormDiaLog.vue";
import DeleteDiaLog, {
  DeleteDiaLogRef
} from "~/components/page/manage-sync-ads/BrandnameConfig/DeleteDiaLog.vue";

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
    dialog: FormDiaLogRef;
    deleteDialog: DeleteDiaLogRef;
  };
  $constractFormDiaLog: RepositoryInterface;
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
  loading: object;
  fetchConfig(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    FormDiaLog,
    BaseMassDeleteDialog,
    ApiDataTable,
    DeleteDiaLog
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
      first: true,
      configs: {},
      loading: false,
      resource: SYNC_MANUAL_BRANDNAME_CONFIG,
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
          text: "Mô tả",
          value: "desc",
          width: 300,
          sortable: false
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 150,
          sortable: true
        },
        {
          text: "Hành động",
          value: "action",
          width: 100,
          align: "center",
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
      return toolbarShow;
    }
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      this.loading = true;
      const { data } = await this.$axios.$post(
        "sync-manual-brandname-config/get-apply"
      );
      if (data.length > 0) {
        this.first = false;
        this.configs = data;
      }
      this.loading = false;
    },
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
    fetchedDataTable() {
      this.loading = {};
    }
  }
});
</script>
