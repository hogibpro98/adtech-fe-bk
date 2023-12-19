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
            page-name="manage-layout-list"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
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
            <template slot="item.user" slot-scope="{ item }">{{
              item.user && item.user.full_name
            }}</template>
            <template slot="item.layout_type" slot-scope="{ item }">
              <v-chip
                :color="layoutTypeMap[item.layout_type].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ layoutTypeMap[item.layout_type].title }}</v-chip
              >
            </template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | timestamp
            }}</template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <layout-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></layout-form-dialog>
    <layout-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></layout-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import { TEXT } from "@/constants/filterType";
import { MANAGE_LAYOUT } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import LayoutFormDialog, {
  LayoutFormDialogRef
} from "~/components/page/manage-layout/LayoutFormDialog.vue";
import LayoutDeleteDialog, {
  LayoutDeleteDialogRef
} from "~/components/page/manage-layout/LayoutDeleteDialog.vue";
import { REDIRECT_LAYOUT_TYPE_MAP } from "~/constants/layout";

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
    dialog: LayoutFormDialogRef;
    deleteDialog: LayoutDeleteDialogRef;
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
    LayoutDeleteDialog,
    LayoutFormDialog,
    ApiDataTable
  },
  layout: "dashboard",
  data() {
    return {
      resource: MANAGE_LAYOUT,
      layoutTypeMap: REDIRECT_LAYOUT_TYPE_MAP,
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
          width: 240
        },
        {
          text: "Người tạo",
          value: "user",
          sortable: false,
          width: 240
        },
        {
          text: "Loại layout",
          value: "layout_type",
          align: "center",
          width: 200
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          align: "center",
          width: 200
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
      startIndex: 0
    };
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
    }
  }
});
</script>
