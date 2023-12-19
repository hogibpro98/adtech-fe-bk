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
            page-name="setting-system-notification-pattern"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
          >
            <template slot="item.redirect_pattern" slot-scope="{ item }">
              <a v-if="item.redirect_pattern">
                <span
                  v-for="(redirect_item, index) in item.redirect_pattern"
                  :key="`item-redirect-${item.id}-${index}`"
                  class="mr-1"
                  v-html="generateHTMLByTemplate(redirect_item)"
                />
              </a>
            </template>
            <template slot="item.message_pattern" slot-scope="{ item }">
              <p>
                <span
                  v-for="(redirect_item, index) in item.message_pattern"
                  :key="`item-redirect-${item.id}-${index}`"
                  class="mr-1"
                  v-html="generateHTMLByTemplate(redirect_item)"
                />
              </p>
            </template>
            <template slot="item.send_mail_now" slot-scope="{ item }">
              <span v-if="item.send_mail_now" class="success--text">
                Có
              </span>
              <span v-else class="error--text">
                Không
              </span>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <notification-pattern-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></notification-pattern-form-dialog>
    <notification-pattern-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></notification-pattern-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import NotificationPatternFormDialog from "@/components/page/setting-system/notification-pattern/NotificationPatternFormDialog.vue";
import NotificationPatternDeleteDialog from "@/components/page/setting-system/notification-pattern/NotificationPatternDeleteDialog.vue";
import { TEXT } from "@/constants/filterType";
import { NOTIFICATION_PATTERN } from "@/constants/resource";
import { escape } from "lodash";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import { NotificationPatternFormDialogRef } from "~/components/page/setting-system/notification-pattern/NotificationPatternFormDialog.vue";
import { NotificationPatternDeleteDialogRef } from "~/components/page/setting-system/notification-pattern/NotificationPatternDeleteDialog.vue";
import { ConfigNotificationPatternInterface } from "~/interface/data/config";

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
    dialog: NotificationPatternFormDialogRef;
    deleteDialog: NotificationPatternDeleteDialogRef;
  };
}

interface ComponentMethods {
  refreshTable(toFirstPage?: boolean): void;
  addItem(): void;
  editItem(item: ConfigNotificationPatternInterface): void;
  deleteItem(item: ConfigNotificationPatternInterface): void;
  generateHTMLByTemplate(redirectItem: Array<object>): string;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    NotificationPatternDeleteDialog,
    NotificationPatternFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  layout: "dashboard",
  permission: false,
  data() {
    return {
      resource: NOTIFICATION_PATTERN,
      filters: [
        {
          type: TEXT,
          name: "alias",
          label: "Alias"
        },
        {
          type: TEXT,
          name: "name",
          label: "Tên"
        },
        {
          type: TEXT,
          name: "redirect_pattern",
          label: "Redirect"
        },
        {
          type: TEXT,
          name: "message_pattern",
          label: "Nội dung"
        }
      ],
      searchParams: null,
      startIndex: 0
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Alias",
          value: "alias",
          width: 240
        },
        {
          text: "Tên",
          value: "name",
          width: 240
        },
        {
          text: "Redirect",
          value: "redirect_pattern",
          width: 240
        },
        {
          text: "Nội dung",
          value: "message_pattern",
          sortable: false,
          width: 300
        },
        {
          text: "Gửi mail thông báo",
          value: "send_mail_now",
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
              color: "primary",
              icon: "edit",
              visible: () => false,
              label: "hidden",
              event: "hidden"
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
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    generateHTMLByTemplate(redirectItem) {
      let htmlContent = escape(redirectItem.text);
      if (redirectItem.key) {
        htmlContent = redirectItem.text.replace(
          "{key}",
          `<code class="px-1">${redirectItem.key}</code>`
        );
      }

      if (redirectItem.tags) {
        htmlContent = redirectItem.tags.reduce((accumulator, tag) => {
          return `<${tag}>${accumulator}</${tag}>`;
        }, htmlContent);
      }

      return htmlContent;
    }
  }
});
</script>
