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
            page-name="setting-display-ads-tag"
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
    <targeting-tag-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></targeting-tag-form-dialog>
    <targeting-tag-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></targeting-tag-delete-dialog>
    <!--    <targeting-tag-mass-delete-dialog-->
    <!--      ref="massDeleteDialog"-->
    <!--      @confirm="deleteSelected"-->
    <!--      @action-success="refreshTable(false, false)"-->
    <!--    />-->
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/tag"
      object-name="Tag"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-container>
</template>
<script lang="ts">
import TargetingTagFormDialog, {
  TargetingTagFormDialogRef
} from "@/components/page/targeting/TargetingTagFormDialog.vue";
import TargetingTagDeleteDialog, {
  TargetingTagDeleteDialogRef
} from "@/components/page/targeting/TargetingTagDeleteDialog.vue";
import { TEXT } from "@/constants/filterType";
import { TARGETING_TAG } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import TargetingTagMassDeleteDialog from "~/components/page/targeting/TargetingTagMassDeleteDialog.vue";
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
    dialog: TargetingTagFormDialogRef;
    deleteDialog: TargetingTagDeleteDialogRef;
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
    TargetingTagMassDeleteDialog,
    TargetingTagDeleteDialog,
    TargetingTagFormDialog,
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
      resource: TARGETING_TAG,
      objectName: "tag",
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
