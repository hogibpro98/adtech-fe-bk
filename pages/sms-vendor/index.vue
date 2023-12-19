<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            resource="/sms-vendor"
            :toolbar="showToolBar"
            :headers="headers"
            :filter="searchParams"
            @add-item="handleAddVendor"
            @edit-item="handleEditItem"
            @delete-item="handleDeleteItem"
            @config-item="handleConfigVendor"
            @regen-deliver-token="handleRegenDeliverToken"
          >
            <template slot="item.tps" slot-scope="{ item }">
              {{ item.tps | numberSpace }}
            </template>
            <template slot="item.weight" slot-scope="{ item }">
              {{ item.weight | numberSpace }}
            </template>
            <template slot="item.dlvr_token" slot-scope="{ item }">
              <div class="d-flex align-items-center my-2">
                <span>{{ item.dlvr_token }}</span>
                <div class="ml-6">
                  <v-tooltip top>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        icon
                        v-bind="attrs"
                        v-on="on"
                        @click="handleCopyDlvrToken(item.dlvr_token)"
                      >
                        <v-icon color="grey">
                          mdi-content-copy
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>Sao chép deliver token</span>
                  </v-tooltip>
                </div>
              </div>
            </template>
          </api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <vendor-dialog
      ref="vendorDialog"
      @action-success="refreshTable"
    ></vendor-dialog>
    <confirm-gen-dlvr-token-dialog
      ref="confirmGenDlvrTokenDialog"
      @action-success="refreshTable"
    ></confirm-gen-dlvr-token-dialog>
    <config-vendor-dialog
      ref="configVendorDialog"
      @action-success="refreshTable"
    ></config-vendor-dialog>
    <confirm-delete-vendor-dialog
      ref="confirmDeleteDialog"
      @action-success="refreshTable"
    ></confirm-delete-vendor-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ConfirmDeleteVendorDialog from "~/components/page/sms-vendor/ConfirmDeleteVendorDialog.vue";
import ConfirmGenDlvrTokenDialog from "~/components/page/sms-vendor/ConfirmGenDlvrTokenDialog.vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import ConfigVendorDialog from "~/components/page/sms-vendor/ConfigVendorDialog.vue";
import VendorDialog from "~/components/page/sms-vendor/VendorDialog.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import { NUMBER } from "~/constants/filterType";
import { unsecuredCopyToClipboard } from "~/helpers/ultis";
interface ComponentData {}
interface ComponentMethod {
  handleAddVendor(): void;
  handleDeleteItem(item: object): void;
  handleRegenDeliverToken(item: object): void;
  handleConfigVendor(item: object): void;
  handleEditItem(item: object): void;
  refreshTable(toFirstPage: boolean): void;
  handleCopyDlvrToken(token: string): void;
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
  name: "Index",
  components: {
    ApiDataTable,
    VendorDialog,
    ConfigVendorDialog,
    ConfirmGenDlvrTokenDialog,
    ConfirmDeleteVendorDialog,
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
          text: "Tên đối tác phân phối",
          value: "vendor_name",
          width: 200
        },
        {
          text: "Trọng số",
          value: "weight",
          align: "right",
          width: 200
        },
        {
          text: "Tps",
          value: "tps",
          align: "right",
          width: 200
        },
        {
          text: "Đường dẫn API",
          value: "send_sms_url",
          width: 400
        },
        {
          text: "API Token",
          value: "send_sms_token",
          width: 150
        },
        {
          text: "Deliver token",
          value: "dlvr_token",
          width: 350
        },
        // {
        //   text: "Tps key",
        //   value: "tps_key",
        //   width: 150
        // },
        {
          text: "Mã phân phối đối tác",
          value: "vendor_code",
          width: 180
        },
        {
          text: "Hành động",
          sortable: false,
          value: "action",
          align: "center",
          width: 200,
          actions: [
            {
              color: "primary",
              icon: "edit",
              label: "Cập nhật",
              event: "edit-item"
            },
            {
              color: "primary",
              icon: "settings",
              label: "Cấu hình vendor",
              event: "config-item"
            },
            {
              color: "warning",
              icon: "replay",
              label: "Sinh lại Deliver Token",
              event: "regen-deliver-token"
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
    handleCopyDlvrToken(token) {
      unsecuredCopyToClipboard(token);
    },
    handleDeleteItem(item) {
      this.$refs.confirmDeleteDialog.show(item);
    },
    handleRegenDeliverToken(item) {
      this.$refs.confirmGenDlvrTokenDialog.show(item);
    },
    handleConfigVendor(item) {
      this.$refs.configVendorDialog.show(item);
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
