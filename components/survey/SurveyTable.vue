<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <api-data-table
        ref="table"
        :headers="headers"
        :toolbar="toolbarShow"
        :filter="searchParams"
        :resource="resource"
        :start-index.sync="startIndex"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
      >
      </api-data-table>
    </v-card>
    <survey-question-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <survey-question-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
  </v-flex>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable, { ApiDataTableRef } from "~/components/table/ApiDataTable.vue";
import SurveyQuestionFormDialog, {
  SurveyQuestionFormDialogRef
} from "~/components/survey/SurveyQuestionFormDialog.vue";
import SurveyQuestionDeleteDialog, {
  SurveyQuestionDeleteDialogRef
} from "~/components/survey/SurveyQuestionDeleteDialog.vue";

import { TEXT } from "~/constants/filterType";
import { SURVEY } from "~/constants/resource";

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
    dialog: SurveyQuestionFormDialogRef;
    deleteDialog: SurveyQuestionDeleteDialogRef;
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
    SurveyQuestionDeleteDialog,
    SurveyQuestionFormDialog,
    ApiDataTable
  },
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
      selectedItems: [],
      searchParams: null,
      filters: [
        {
          type: TEXT,
          name: "type",
          label: "Loại"
        }
      ],
      headers: [
        {
          text: "Câu hỏi",
          value: "question",
          width: 250
        },
        {
          text: "Loại câu hỏi",
          value: "type",
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
  computed: {
    toolbarShow() {
      return this.toolbar;
    },
    resource() {
      return SURVEY;
    }
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      console.log(item);
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

<style scoped></style>
