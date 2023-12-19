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
            :default-pagination="{
              sortBy: ['created_at'],
              sortDesc: [true]
            }"
            selectable
            page-name="manage-age-group"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
          >
            <template slot="item.created_at" slot-scope="props">
              {{ props.item.created_at | date }}
            </template>
            <template slot="item.min_age" slot-scope="props">
              {{ props.item.min_age | numberSpace }}
            </template>
            <template slot="item.max_age" slot-scope="props">
              {{ props.item.max_age | numberSpace }}
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <manage-age-group-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <manage-age-group-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
    <mass-delete-dialog
      ref="massDeleteDialog"
      :resource="resource"
      object-name="nhóm tuổi"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <confirm-dialog
      ref="showDialog"
      title="Danh sách số điện thoại"
      label-button-confirm=""
      @hidden="resetNumbers"
    >
      <ul slot="content">
        <li v-for="(value, index) in selectedNumbers" :key="index">
          {{ value }}
        </li>
      </ul>
    </confirm-dialog>
  </v-container>
</template>
<script lang="ts">
import { MANAGE_AGE_GROUP } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "@/components/table/ApiDataTable.vue";
import PhoneGroupDeleteDialog from "~/components/page/targeting/phone-group/PhoneGroupDeleteDialog.vue";
import ManageAgeGroupFormDialog from "~/components/page/manage-age-group/ManageAgeGroupFormDialog.vue";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import MassDeleteDialog from "~/components/common/MassDeleteDialog.vue";
import ManageAgeGroupDeleteDialog from "~/components/page/manage-age-group/ManageAgeGroupDeleteDialog.vue";

interface ComponentData {
  showing: boolean;
  timeout: number;
  isAdmin: boolean;
  isAgency: boolean;
  $refs: {
    resource: string;
    searchParams: Array<object>;
    headers: DataTableHeader[];
    startIndex: number;
    table: ApiDataTableRef;
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
    MassDeleteDialog,
    ConfirmDialog,
    PhoneGroupDeleteDialog,
    ApiDataTable,
    ManageAgeGroupFormDialog,
    ManageAgeGroupDeleteDialog
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  data() {
    return {
      resource: MANAGE_AGE_GROUP,
      TYPE_MAP: {
        black: {
          color: "secondary",
          text: "Blacklist"
        },
        white: {
          color: "dark",
          text: "Whitelist"
        }
      },
      searchParams: {},
      startIndex: 0,
      selectedNumbers: [],
      selectedItems: []
    };
  },
  computed: {
    headers() {
      return [
        {
          text: "Tên",
          width: 200,
          sortable: false,
          value: "name"
        },
        {
          text: "Mã",
          width: 200,
          sortable: false,
          value: "code"
        },
        {
          text: "Thời gian tạo",
          width: 200,
          value: "created_at",
          align: "center"
        },
        {
          text: "Tối thiểu",
          width: 200,
          value: "min_age",
          sortable: false,
          align: "right"
        },
        {
          text: "Tối đa",
          value: "max_age",
          width: 200,
          sortable: false,
          align: "right"
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
      ];
    },

    isAdmin() {
      return this.$authHasRole(ROLE_IS_ADMIN);
    },
    isAgency() {
      return this.$authHasRole(ROLE_AGENCY);
    },
    filterExcludes() {
      return [this.isAdmin ? null : "user_id"];
    },
    toolbarShow() {
      const toolbarShow = {
        isCreate: true
      };
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa"
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
    showNumbers(item) {
      this.selectedNumbers = item.numbers;
      this.$refs.showDialog.show();
    },
    resetNumbers() {
      this.selectedNumbers = [];
    },

    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    getAgency(item) {
      if (item.agency) {
        return item.agency;
      }
      if (item.advertiser) {
        return item.advertiser.agencies[0];
      }
      return false;
    }
  }
});
</script>
