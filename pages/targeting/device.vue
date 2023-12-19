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
            page-name="targeting-device"
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
    <targeting-device-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <targeting-device-import-form-dialog
      ref="importDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <targeting-device-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
    <targeting-config-dialog ref="configDialog" />
  </v-container>
</template>
<script lang="ts">
import TargetingDeviceDeleteDialog, {
  TargetingDeviceDeleteDialogRef
} from "@/components/page/targeting/TargetingDeviceDeleteDialog.vue";
import TargetingDeviceFormDialog, {
  TargetingDeviceFormDialogRef
} from "@/components/page/targeting/TargetingDeviceFormDialog.vue";
import { TEXT } from "@/constants/filterType";
import { DEVICE } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import TargetingDeviceImportFormDialog, {
  TargetingDeviceImportFormDialogRef
} from "~/components/page/targeting/TargetingDeviceImportFormDialog.vue";
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
    dialog: TargetingDeviceFormDialogRef;
    deleteDialog: TargetingDeviceDeleteDialogRef;
    importItem: TargetingDeviceImportFormDialogRef;
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
    TargetingDeviceImportFormDialog,
    TargetingDeviceDeleteDialog,
    TargetingDeviceFormDialog,
    ApiDataTable
  },
  mixins: [targeting],
  layout: "dashboard",
  data() {
    return {
      targetingName: "device",
      targetingDisplayName: "thiết bị",
      resource: DEVICE,
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
  computed: {
    toolbar() {
      return {
        isCreate: true,
        isImport: true
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
    importItem() {
      this.$refs.importDialog.show();
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
