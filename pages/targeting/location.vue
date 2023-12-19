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
            :toolbar="toolbarSetting"
            page-name="targeting-location"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
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
            <template slot="item.field_name" slot-scope="{ item }">
              <span v-if="getLevelLocation(item)">
                {{ getLevelLocation(item).text }}
              </span>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <targeting-location-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-location-form-dialog>
    <targeting-location-upload-form-dialog
      ref="dialogImport"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-location-upload-form-dialog>
    <targeting-location-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-location-delete-dialog>
    <targeting-config-dialog ref="configDialog" />
  </v-container>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import TargetingLocationFormDialog, {
  TargetingLocationFormDialogRef
} from "@/components/page/targeting/TargetingLocationFormDialog.vue";
import TargetingLocationDeleteDialog, {
  TargetingLocationDeleteDialogRef
} from "@/components/page/targeting/TargetingLocationDeleteDialog.vue";
import TargetingLocationUploadFormDialog, {
  TargetingLocationUploadFormDialogRef
} from "@/components/page/targeting/TargetingLocationUploadFormDialog.vue";
import LocationSelect from "@/components/select/LocationSelect.vue";
import { LEVEL_LOCATIONS } from "@/constants/dataSelect";
import { RESOURCE, SELECT } from "@/constants/filterType";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import { ApiDataTableRef } from "../../components/table/ApiDataTable.vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { LOCATION } from "~/constants/resource";
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
    dialog: TargetingLocationFormDialogRef;
    dialogImport: TargetingLocationUploadFormDialogRef;
    deleteDialog: TargetingLocationDeleteDialogRef;
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
    TargetingLocationUploadFormDialog,
    NewCustomFilter,
    TargetingLocationDeleteDialog,
    TargetingLocationFormDialog,
    ApiDataTable
  },
  mixins: [targeting],
  layout: "dashboard",
  data() {
    return {
      toolbar: {
        isCreate: false
      },
      resource: "/location-ccai",
      filters: [
        {
          type: SELECT,
          multiple: false,
          name: "field_name",
          label: "Cấp vị trí",
          items: LEVEL_LOCATIONS
        },
        {
          type: RESOURCE,
          name: "parent_id",
          label: "Trực thuộc",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false,
            queryParams: {
              select_level: [0, 1],
              include_no_parent: true
            }
          },
          component: LocationSelect
        }
      ],
      searchParams: null,
      headers: [
        {
          text: "Tên",
          value: "name",
          minWidth: 200
        },
        {
          text: "Code",
          value: "code",
          width: 100
        },
        {
          text: "Đơn vị hành chính",
          value: "field_name",
          width: 200
        },
        {
          text: "Trực thuộc",
          value: "parent_name",
          sortable: false,
          width: 250
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
    getLevelLocation(row) {
      return LEVEL_LOCATIONS.find(({ value }) => value === row?.field_name);
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
    importLocation() {
      this.$refs.dialogImport.show();
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
