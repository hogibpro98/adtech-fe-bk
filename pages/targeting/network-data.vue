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
            page-name="targeting-network-data"
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
    <targeting-network-data-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-network-data-form-dialog>
    <targeting-network-data-import-form-dialog
      ref="importDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <targeting-network-data-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-network-data-delete-dialog>
    <targeting-config-dialog ref="configDialog" />
  </v-container>
</template>
<script lang="ts">
import TargetingNetworkDataDeleteDialog, {
  TargetingNetworkDataDeleteDialogRef
} from "@/components/page/targeting/TargetingNetworkDataDeleteDialog.vue";
import TargetingNetworkDataFormDialog, {
  TargetingNetworkDataFormDialogRef
} from "@/components/page/targeting/TargetingNetworkDataFormDialog.vue";
import { TEXT } from "@/constants/filterType";
import { NETWORK_DATA } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "../../components/table/ApiDataTable.vue";
import TargetingNetworkDataImportFormDialog, {
  TargetingNetworkDataImportFormDialogRef
} from "~/components/page/targeting/TargetingNetworkDataImportFormDialog.vue";
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
    dialog: TargetingNetworkDataFormDialogRef;
    deleteDialog: TargetingNetworkDataDeleteDialogRef;
    importDialog: TargetingNetworkDataImportFormDialogRef;
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
    TargetingNetworkDataImportFormDialog,
    TargetingNetworkDataDeleteDialog,
    TargetingNetworkDataFormDialog,
    ApiDataTable
  },
  mixins: [targeting],
  layout: "dashboard",
  data() {
    return {
      targetingName: "network-data",
      targetingDisplayName: "gói dữ liệu",
      resource: NETWORK_DATA,
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
