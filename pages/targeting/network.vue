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
              isCreate: true,
            }"
            page-name="targeting-network"
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
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <targeting-network-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-network-form-dialog>
    <targeting-network-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-network-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import TargetingNetworkFormDialog, {
  TargetingNetworkFormDialogRef
} from "@/components/page/targeting/TargetingNetworkFormDialog.vue";
import TargetingNetworkDeleteDialog, {
  TargetingNetworkDeleteDialogRef
} from "@/components/page/targeting/TargetingNetworkDeleteDialog.vue";
import { TEXT } from "@/constants/filterType";
import { NETWORK } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import { ApiDataTableRef } from "../../components/table/ApiDataTable.vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";

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
    dialog: TargetingNetworkFormDialogRef;
    deleteDialog: TargetingNetworkDeleteDialogRef;
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
    TargetingNetworkDeleteDialog,
    TargetingNetworkFormDialog,
    ApiDataTable
  },
  layout: "dashboard",
  data() {
    return {
      resource: NETWORK,
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

    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
