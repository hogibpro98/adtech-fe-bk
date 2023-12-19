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
            page-name="setting-display-ads-action-category"
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
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <action-category-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></action-category-form-dialog>
    <action-category-delete-dia-log
      ref="deleteDialog"
      @action-success="refreshTable"
    ></action-category-delete-dia-log>
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/action-category"
      object-name="danh mục"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-container>
</template>
<script lang="ts">
import ActionCategoryFormDialog, {
  ActionCategoryFormDialogRef
} from "@/components/page/setting-display-ads/categories/ActionCategoryFormDialog.vue";
import ActionCategoryDeleteDiaLog, {
  ActionCategoryDeleteDiaLogRef
} from "@/components/page/setting-display-ads/categories/ActionCategoryDeleteDiaLog.vue";
import { TEXT } from "@/constants/filterType";
import { ACTION_CATERORY } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
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
    dialog: ActionCategoryFormDialogRef;
    deleteDialog: ActionCategoryDeleteDiaLogRef;
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
    ActionCategoryDeleteDiaLog,
    ActionCategoryFormDialog,
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
      resource: ACTION_CATERORY,
      objectName: "action-category",
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
          text: "Mã",
          value: "code",
          width: 250
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false
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
