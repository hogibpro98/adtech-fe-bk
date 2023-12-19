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
            :toolbar="toolbarSetting"
            page-name="targeting-os"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @import-file="importItem"
            @set-config="openConfig"
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
    <targeting-o-s-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-o-s-form-dialog>
    <targeting-os-import-form-dialog
      ref="importDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <targeting-o-s-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-o-s-delete-dialog>
    <targeting-config-dialog ref="configDialog" />
  </v-container>
</template>
<script lang="ts">
import TargetingOSFormDialog, {
  TargetingOSFormDialogRef
} from "@/components/page/targeting/TargetingOSFormDialog.vue";
import TargetingOSDeleteDialog, {
  TargetingOSDeleteDialogRef
} from "@/components/page/targeting/TargetingOSDeleteDialog.vue";
import { TEXT } from "@/constants/filterType";
import { OS } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "../../components/table/ApiDataTable.vue";
import TargetingOsImportFormDialog from "~/components/page/targeting/TargetingOsImportFormDialog.vue";
import TargetingConfigDialog from "~/components/common/TargetingConfigDialog.vue";
import targeting from "~/mixins/targeting";

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
    TargetingConfigDialog,
    TargetingOsImportFormDialog,
    TargetingOSDeleteDialog,
    TargetingOSFormDialog,
    ApiDataTable
  },
  mixins: [targeting],
  layout: "dashboard",
  data() {
    return {
      targetingName: "os",
      targetingDisplayName: "hệ điều hành",
      resource: OS,
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
          value: "name"
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
    importItem() {
      this.$refs.importDialog.show();
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
