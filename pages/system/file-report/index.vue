<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <v-divider />
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="{
              isCreate: true
            }"
            page-name="system-file-report"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @import-file="importItem"
            @download-item="downloadItem"
          >
            <template slot="item.created_at" slot-scope="{ item }">{{ item.created_at | timestamp }}</template>
            <template slot="item.model" slot-scope="{ item }">{{ getModelText(item.model) }}</template>
            <template slot="item.frequency" slot-scope="{ item }">{{ getFrequencyText(item.frequency) }}</template>
            <v-btn
              slot="search-right"
              color="primary"
              dark
              class="mr-0"
              @click="addItem()"
            >s
              <v-icon>add</v-icon>
              Thêm
            </v-btn>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <file-report-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></file-report-form-dialog>

    <file-report-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></file-report-delete-dialog>
    <loading-dialog
      v-model="loadingExport"
      text="Đang chuẩn bị file tải xuống"
      circular
    ></loading-dialog>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import { SELECT, TEXT } from "@/constants/filterType";
import { EMAIL_REPORT, FILE_REPORT, OS } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import FileReportFormDialog, {
  FileReportFormDialogRef
} from "~/components/system/file-report/FileReportFormDialog.vue";
import report from "~/api/report";
import { FREQUENCY_SELECT } from "~/constants/dataSelect";
import FileReportDeleteDialog from "~/components/system/file-report/FileReportDeleteDialog.vue";
import { downloadFile } from "~/helpers/ultis";
import LoadingDialog from "~/components/common/LoadingDialog.vue";

interface ComponentData {
  showing: boolean;
  timeout: number;
  loadingExport: boolean;
  loading: boolean;
  selectableReports: Array<any>;
  $refs: {
    resource: string;
    filters: Array<object>;
    searchParams: Array<object>;
    headers: DataTableHeader[];
    startIndex: number;
    table: ApiDataTableRef;
    dialog: FileReportFormDialogRef;
    deleteDialog: FileReportFormDialogRef;
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
    LoadingDialog,
    FileReportDeleteDialog,
    FileReportFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  layout: "dashboard",
  data() {
    return {
      selectableReports: cloneDeep(report),
      searchParams: null,
      loadingExport: false,
      startIndex: 0
    };
  },
  computed: {
    resource() {
      return FILE_REPORT;
    },
    headers() {
      return [
        {
          text: "Tên",
          value: "file_name",
          width: 240
        },
        {
          text: "Đối tượng báo cáo",
          value: "model",
          width: 240
        },
        {
          text: "Khoảng thời gian dữ liệu",
          value: "frequency",
          width: 180
        },
        {
          text: "Thời gian chênh lệch",
          value: "offset",
          align: "right",
          width: 180
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: 180
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          sortable: false,
          actions: [
            {
              color: "purple",
              icon: "download",
              label: "Xem thử",
              event: "download-item"
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
      ];
    },
    modelSelect() {
      return this.selectableReports.map(e => {
        return {
          value: e.model,
          text: e.title
        };
      });
    },
    filters() {
      return [
        {
          type: SELECT,
          name: "frequency",
          label: "Khoảng thời gian dữ liệu",
          items: FREQUENCY_SELECT
        },
        {
          type: SELECT,
          name: "model",
          label: "Đối tượng báo cáo",
          items: this.modelSelect
        }
      ];
    }
  },
  methods: {
    getModelText(model) {
      const text = this.selectableReports.find(e => e.model === model)?.title;
      return text || "Chưa có đối tượng";
    },
    getFrequencyText(val) {
      const text = FREQUENCY_SELECT.find(e => e.value === val)?.text;
      return text || "Tháng";
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    importItem() {
      this.$refs.importDialog.show();
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    async downloadItem(item) {
      this.loadingExport = true;
      try {
        const res = await this.$axios.post(
          `${FILE_REPORT}/test-export`,
          {
            id: item.id
          },
          {
            responseType: "blob"
          }
        );
        console.log(res);
        downloadFile(res);
      } catch (e) {
        this.$toast.global.action_fail();
        console.log(e);
      }
      this.loadingExport = false;
    }
  }
});
</script>
