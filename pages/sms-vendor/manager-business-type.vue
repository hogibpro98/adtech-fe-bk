<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            resource="/business-type"
            :toolbar="showToolBar"
            :headers="headers"
            :filter="searchParams"
            @add-item="handleAddVendor"
            @edit-item="handleEditItem"
            @delete-item="handleDeleteItem"
          >
          </api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <business-type-dialog
      ref="vendorDialog"
      @action-success="refreshTable"
    ></business-type-dialog>
    <confim-delete-business-type-account-dialog
      ref="confirmDeleteDialog"
      @action-success="refreshTable"
    ></confim-delete-business-type-account-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import BusinessTypeDialog from "~/components/page/sms-vendor/BusinessTypeDialog.vue";
import ConfimDeleteBusinessTypeAccountDialog from "~/components/page/sms-vendor/ConfimDeleteBusinessTypeAccountDialog.vue"
import { NUMBER } from "~/constants/filterType";
interface ComponentData {}
interface ComponentMethod {
  handleAddVendor(): void;
  handleDeleteItem(item: object): void;
  handleEditItem(item: object): void;
  refreshTable(toFirstPage: boolean): void;
}
interface ComponentComputed {
  showToolBar: object;
  headers: Array<any>;
}
interface ComponentProp {}

const VendorPage = Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  name: "SmsVendorBusinessType",
  components: {
    ApiDataTable,
    BusinessTypeDialog,
    ConfimDeleteBusinessTypeAccountDialog,
    NewCustomFilter
  },
  layout: "dashboard",
  data() {
    return {
      searchParams: null,
      filters: [
        {
          type: NUMBER,
          name: "weight",
          props: {
            rules: "numeric|max_value:1000"
          },
          label: "Trọng số"
        },
        {
          type: NUMBER,
          name: "tps",
          props: {
            rules: "numeric|max_value:10000"
          },
          label: "TPS"
        }
      ]
    };
  },
  computed: {
    showToolBar() {
      return {
        isCreate: true
      };
    },
    headers() {
      return [
        {
          text: "Tên lĩnh vực kinh doanh",
          sortable: false,
          value: "name",
          width: 200
        },
        {
          text: "Mô tả",
          sortable: false,
          value: "description",
          width: 300
        },
        {
          text: "Hành động",
          sortable: false,
          value: "action",
          align: "center",
          width: 150,
          actions: [
            {
              color: "primary",
              icon: "edit",
              label: "Cập nhật",
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
    }
  },
  methods: {
    handleDeleteItem(item) {
      this.$refs.confirmDeleteDialog.show(item);
    },
    handleEditItem(item) {
      this.$refs.vendorDialog.show(item);
    },
    handleAddVendor() {
      this.$refs.vendorDialog.show();
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});

export default VendorPage;
</script>

<style scoped></style>
