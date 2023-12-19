<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="{
              isCreate: true
            }"
            page-name="system-email-report"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @import-file="importItem"
          >
            <template slot="item.creator" slot-scope="{ item }">
              <span v-if="item.creator">{{ item.creator.username }}</span>
            </template>
            <template slot="item.email_address" slot-scope="{ item }">
              <ul v-html="renderEmails(item)"></ul>
            </template>
            <template slot="item.created_at" slot-scope="{ item }">{{ item.created_at | timestamp }}</template>
            <template slot="item.schedule" slot-scope="{ item }">{{ item.schedule | translateCron }}</template>
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
    <email-report-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></email-report-form-dialog>

    <email-report-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></email-report-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import { EMAIL_REPORT, OS } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cronstrue from "cronstrue";
import { escape } from "lodash";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import EmailReportFormDialog from "~/components/system/email-report/EmailReportFormDialog.vue";
import EmailReportDeleteDialog from "~/components/system/email-report/EmailReportDeleteDialog.vue";
import { translateCron } from "~/util/cron";
interface ComponentData {
  showing: boolean;
  timeout: number;
  $refs: {
    resource: string;
    filters: Array<object>;
    searchParams: Array<object>;
    headers: DataTableHeader[];
    startIndex: number;
    table: ApiDataTableRef;
    dialog: TargetingOSFormDialogRef;
    deleteDialog: TargetingOSDeleteDialogRef;
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
    EmailReportDeleteDialog,
    EmailReportFormDialog,
    ApiDataTable
  },
  filters: {
    translateCron(value) {
      return translateCron(value);
    }
  },
  layout: "dashboard",
  data() {
    return {
      resource: EMAIL_REPORT,
      searchParams: null,
      startIndex: 0
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 200,
        },
        {
          text: "Nội dung",
          value: "content",
          width: 300,
        },
        {
          text: "Lịch gửi",
          value: "schedule",
          width: 240,
        },
        {
          text: "Người nhận",
          value: "email_address",
          width: 240,
          sortable: false
        },
        {
          text: "Người tạo",
          value: "creator",
          width: 180,
          sortable: false
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 180,
          align: "center"
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
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
      ];
    }
  },
  methods: {
    renderEmails(item) {
      let msg = "";
      if (Array.isArray(item.email_address)) {
        item.email_address.slice(0, 5).forEach(e => {
          msg += `<li>${escape(e)}</li>`;
        });
        if (item.email_address.length > 5) {
          msg += `<li>...</li>`;
        }
      }
      return msg;
    },
    explainCron(str) {
      try {
        if (str) {
          return cronstrue.toString(str);
        }
      } catch (e) {
        return "Không hợp lệ";
      }
      return "Chưa có lịch";
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
    }
  }
});
</script>
