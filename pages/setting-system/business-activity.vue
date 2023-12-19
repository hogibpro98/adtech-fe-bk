<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <v-card-subtitle>
            Hệ thống sẽ tự động đồng bộ mỗi 30 phút
          </v-card-subtitle>
          <v-divider></v-divider>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="toolbar"
            page-name="setting-system-business-activity"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @sync="sync"
          >
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
    <business-activity-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></business-activity-form-dialog>
    <business-activity-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></business-activity-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import BusinessActivityDeleteDialog from "@/components/page/setting-system/notification-pattern/BusinessActivityDeleteDialog.vue";
import BusinessActivityFormDialog from "@/components/page/setting-system/notification-pattern/BusinessActivityFormDialog.vue";
import { TEXT } from "@/constants/filterType";
import { BUSINESS_ACTIVITY } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import { BusinessActivityInterface } from "~/interface/data/businessActivity";
import { BusinessActivityFormDialogRef } from "~/components/page/setting-system/notification-pattern/BusinessActivityFormDialog.vue";
import { BusinessActivityDeleteDialogRef } from "~/components/page/setting-system/notification-pattern/BusinessActivityDeleteDialog.vue";
import { CODE_SUCCESS } from "~/constants/code";

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
    dialog: BusinessActivityFormDialogRef;
    deleteDialog: BusinessActivityDeleteDialogRef;
  };
}

interface ComponentMethods {
  refreshTable(toFirstPage?: boolean): void;
  addItem(): void;
  editItem(item: BusinessActivityInterface): void;
  deleteItem(item: BusinessActivityInterface): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    BusinessActivityDeleteDialog,
    BusinessActivityFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  layout: "dashboard",
  data() {
    return {
      resource: BUSINESS_ACTIVITY,
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
          width: 250
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false
        }
        // {
        //   text: "Hành động",
        //   value: "action",
        //   width: 76,
        //   sortable: false,
        //   actions: [
        //     {
        //       color: "primary",
        //       icon: "edit",
        //       label: "Chỉnh sửa",
        //       event: "edit-item"
        //     },
        //     {
        //       color: "error",
        //       icon: "delete",
        //       label: "Xóa",
        //       event: "delete-item"
        //     }
        //   ]
        // }
      ],
      startIndex: 0,
      isSync: false
    };
  },
  computed: {
    toolbar() {
      return {
        sync: {
          icon: "cached",
          desc: `Đồng bộ`,
          disabled: this.isSync,
          tooltip: "Đồng bộ"
        }
      };
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
    async sync() {
      this.isSync = true;
      try {
        const res = await this.$businessActivityRepository.post("sync");
        if (res.code === CODE_SUCCESS) {
          this.$toast.global.action_success("đồng bộ lĩnh vực hoạt động");
          this.refreshTable(true);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.$toast.global.action_fail();
      }
      this.isSync = false;
    }
  }
});
</script>
