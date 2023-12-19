<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            selectable
            page-name="brand-safety-content-block-url"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
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
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | timestamp
            }}</template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <block-url-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></block-url-form-dialog>
    <block-url-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></block-url-delete-dialog>
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      :resource="resource"
      item-text="url"
      object-name="chặn URL nhà quảng cáo"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-container>
</template>
<script lang="ts">
import { TEXT } from "@/constants/filterType";
import { BLOCK_URL } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import BlockUrlFormDialog, {
  BlockUrlFormDialogRef
} from "~/components/page/brand-safety/BlockUrlFormDialog.vue";
import BlockUrlDeleteDialog, {
  BlockUrlDeleteDialogRef
} from "~/components/page/brand-safety/BlockUrlDeleteDialog.vue";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";

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
    dialog: BlockUrlFormDialogRef;
    deleteDialog: BlockUrlDeleteDialogRef;
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
    BaseMassDeleteDialog,
    BlockUrlDeleteDialog,
    BlockUrlFormDialog,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true
      })
    }
  },
  data() {
    return {
      resource: BLOCK_URL,
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
          text: "Đối tượng",
          sortable: false,
          value: "name",
          width: 200
        },
        {
          text: "URL",
          sortable: false,
          value: "url",
          width: 200
        },
        {
          text: "Inventory",
          sortable: false,
          width: 150,
          value: "inventory.name"
        },
        {
          text: "Sub-inventory",
          sortable: false,
          width: 150,
          value: "channel.name"
        },
        {
          text: "Thời gian tạo",
          sortable: false,
          width: 170,
          value: "created_at"
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
  computed: {
    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa các bản ghi"
      };
      return toolbarShow;
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
    }
  }
});
</script>
