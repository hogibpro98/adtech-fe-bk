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
            page-name="targeting-relationship"
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
    <targeting-relationship-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-relationship-form-dialog>
    <targeting-relationship-import-form-dialog
      ref="importDialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <targeting-relationship-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-relationship-delete-dialog>
    <targeting-config-dialog ref="configDialog" />
  </v-container>
</template>
<script lang="ts">
import TargetingRelationshipDeleteDialog, {
  TargetingRelationshipDeleteDialogRef
} from "@/components/page/targeting/TargetingRelationshipDeleteDialog.vue";
import TargetingRelationshipFormDialog, {
  TargetingRelationshipFormDialogRef
} from "@/components/page/targeting/TargetingRelationshipFormDialog.vue";
import { TEXT } from "@/constants/filterType";
import { RELATIONSHIP } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "../../components/table/ApiDataTable.vue";
import TargetingRelationshipImportFormDialog from "~/components/page/targeting/TargetingRelationshipImportFormDialog.vue";
import targeting from "~/mixins/targeting";
import TargetingConfigDialog from "~/components/common/TargetingConfigDialog.vue";
import {DialogInterface} from "~/interface/components/dialog";

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
    importDialog: DialogInterface;
    dialog: TargetingRelationshipFormDialogRef;
    deleteDialog: TargetingRelationshipDeleteDialogRef;
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
    TargetingRelationshipImportFormDialog,
    TargetingRelationshipDeleteDialog,
    TargetingRelationshipFormDialog,
    ApiDataTable
  },
  mixins: [targeting],
  layout: "dashboard",
  data() {
    return {
      targetingName: "relationship",
      targetingDisplayName: "tình trạng hôn nhân",
      resource: RELATIONSHIP,
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
