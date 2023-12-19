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
            page-name="targeting-service-package"
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
              <v-icon>add</v-icon>
              Thêm
            </v-btn>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <targeting-service-package-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-service-package-form-dialog>
    <targeting-service-package-import-form-dialog
      ref="importDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <targeting-service-package-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-service-package-delete-dialog>
    <targeting-config-dialog ref="configDialog" />
  </v-container>
</template>
<script lang="ts">
import TargetingServicePackageDeleteDialog, {
  TargetingServicePackageDeleteDialogRef
} from "@/components/page/targeting/TargetingServicePackageDeleteDialog.vue";
import TargetingServicePackageFormDialog, {
  TargetingServicePackageFormDialogRef
} from "@/components/page/targeting/TargetingServicePackageFormDialog.vue";
import { TEXT } from "@/constants/filterType";
import { SERVICE_PACKAGE } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "../../components/table/ApiDataTable.vue";
import TargetingServicePackageImportFormDialog from "~/components/page/targeting/TargetingServicePackageImportFormDialog.vue";
import targeting from "~/mixins/targeting";
import TargetingConfigDialog from "~/components/common/TargetingConfigDialog.vue";

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
    dialog: TargetingServicePackageFormDialogRef;
    deleteDialog: TargetingServicePackageDeleteDialogRef;
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
    TargetingServicePackageImportFormDialog,
    TargetingServicePackageDeleteDialog,
    TargetingServicePackageFormDialog,
    ApiDataTable
  },
  mixins: [targeting],
  layout: "dashboard",
  data() {
    return {
      targetingName: "relationship",
      targetingDisplayName: "tình trạng hôn nhân",
      resource: SERVICE_PACKAGE,
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
          text: "Code",
          width: 120,
          value: "code"
        },
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
