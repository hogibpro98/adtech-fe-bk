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
              isCreate: false
            }"
            page-name="manage-layout-list"
            calculate-widths
          >
            <template slot="item.user" slot-scope="{ item }">{{
              item.user && item.user.full_name
            }}</template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | timestamp
            }}</template>
            <template slot="item.reason_code" slot-scope="{ item }">
              <div v-if="item.reason_code">
                {{ item.reason_code.reason }}
              </div>
            </template>
            <template slot="item.ads" slot-scope="{ item }">
              <nuxt-link
                v-if="item.ads"
                :to="`/manage-ads/list-ads-redirect/${item.ads.id}`"
                class="truncate-2"
              >
                {{ item.ads.name }}
              </nuxt-link>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <layout-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></layout-form-dialog>
    <layout-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></layout-delete-dialog>
  </v-container>
</template>
<script lang="ts">
import { TEXT } from "@/constants/filterType";
import { MANAGE_ADS_USER_REPORT } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import LayoutFormDialog, {
  LayoutFormDialogRef
} from "~/components/page/manage-layout/LayoutFormDialog.vue";
import LayoutDeleteDialog, {
  LayoutDeleteDialogRef
} from "~/components/page/manage-layout/LayoutDeleteDialog.vue";

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
    dialog: LayoutFormDialogRef;
    deleteDialog: LayoutDeleteDialogRef;
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
    LayoutDeleteDialog,
    LayoutFormDialog,
    ApiDataTable
  },
  permission: false,
  layout: "dashboard",
  data() {
    return {
      resource: MANAGE_ADS_USER_REPORT,
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
          text: "Thời gian",
          value: "created_at",
          align: "left",
          width: 150
        },
        {
          text: "Quảng cáo",
          value: "ads",
          align: "left",
          sortable: false,
          width: 200
        },
        {
          text: "Lý do",
          value: "report_reason.reason",
          align: "left",
          sortable: false,
          width: 200
        }
      ],
      startIndex: 0
    };
  },
  methods: {
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
