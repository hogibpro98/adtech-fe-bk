<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            resource="/telco"
            :toolbar="showToolBar"
            :headers="headers"
            @add-item="handleAddTelco"
            @edit-item="handleEditItem"
            @delete-item="handleDeleteItem"
            @config-telco="handleConfigTelco"
          ></api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <telco-dialog
      ref="telcoDialog"
      @action-success="refreshTable"
    ></telco-dialog>
    <confirm-delete-telco-dialog
      ref="confirmDeleteTelcoDialog"
      @action-success="refreshTable"
    ></confirm-delete-telco-dialog>
    <config-telco-dialog ref="configTelcoDialog" @action-success="refreshTable">
    </config-telco-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import TelcoDialog from "~/components/page/manage-telco/TelcoDialog.vue";
import ConfirmDeleteTelcoDialog from "~/components/page/manage-telco/ConfirmDeleteTelcoDialog.vue";
import ConfigTelcoDialog from "~/components/page/manage-telco/ConfigTelcoDialog.vue";
interface ComponentData {}
interface ComponentMethods {
  handleAddTelco(): void;
  handleEditItem(item: object): void;
  handleDeleteItem(item: object): void;
  handleConfigTelco(item: object): void;
  refreshTable(): void;
}
interface ComponentComputed {
  headers: Array<any>;
  showToolBar: object;
}
interface ComponentProps {}

export default Vue.extend<
  ComponentData,
  ComponentMethods,
  ComponentComputed,
  ComponentProps
>({
  name: "Index",
  components: {
    ApiDataTable,
    NewCustomFilter,
    TelcoDialog,
    ConfirmDeleteTelcoDialog,
    ConfigTelcoDialog
  },
  layout: "dashboard",
  computed: {
    headers() {
      return [
        {
          text: "Tên nhà mạng",
          value: "name",
          width: 250
        },
        {
          text: "Mã nhà mạng",
          value: "code",
          width: 250
        },
        // {
        //   text: "Nhóm nhà mạng",
        //   value: "telco_group_id",
        //   width: 400
        // },
        {
          text: "Hành động",
          value: "action",
          sortable: false,
          align: "right",
          width: 200,
          actions: [
            {
              color: "primary",
              label: "Cập nhật",
              event: "edit-item",
              icon: "edit"
            },
            {
              color: "warning",
              label: "Cấu hình nhà mạng",
              icon: "settings",
              event: "config-telco"
            },
            {
              color: "error",
              label: "Xóa",
              event: "delete-item",
              icon: "delete"
            }
          ]
        }
      ];
    },
    showToolBar() {
      return {
        isCreate: true
      };
    }
  },
  methods: {
    handleAddTelco() {
      this.$refs.telcoDialog.show();
    },
    handleEditItem(item) {
      this.$refs.telcoDialog.show(item);
    },
    handleDeleteItem(item) {
      this.$refs.confirmDeleteTelcoDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    handleConfigTelco(item) {
      this.$refs.configTelcoDialog.show(item);
    }
  }
});
</script>

<style scoped></style>
