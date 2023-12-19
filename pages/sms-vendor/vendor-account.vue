<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            resource="/vendor-account"
            :toolbar="showToolBar"
            :headers="headers"
            :filter="searchParams"
            @add-item="handleAddVendor"
            @edit-item="handleEditItem"
            @delete-item="handleDeleteItem"
            @config-item="handleConfigVendor"
            @regen-deliver-token="handleRegenDeliverToken"
          >
            <template slot="item.telco_codes" slot-scope="{ item }">
              <v-chip-group>
                <v-chip
                  v-for="(telco, index) in item.telco_codes"
                  small
                  label
                  color="primary"
                >
                  {{ telco }}
                </v-chip>
              </v-chip-group>
            </template>
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
    <vendor-account-dialog
      ref="vendorDialog"
      @action-success="refreshTable"
    ></vendor-account-dialog>
    <confirm-gen-dlvr-token-dialog
      ref="confirmGenDlvrTokenDialog"
      @action-success="refreshTable"
    ></confirm-gen-dlvr-token-dialog>
    <config-vendor-account-dialog
      ref="configVendorDialog"
      @action-success="refreshTable"
    ></config-vendor-account-dialog>
    <confim-delete-vendor-account-dialog
      ref="confirmDeleteDialog"
      @action-success="refreshTable"
    ></confim-delete-vendor-account-dialog>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ConfimDeleteVendorAccountDialog from "~/components/page/sms-vendor/ConfimDeleteVendorAccountDialog.vue";
import ConfirmGenDlvrTokenDialog from "~/components/page/sms-vendor/ConfirmGenDlvrTokenDialog.vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import ConfigVendorAccountDialog from "~/components/page/sms-vendor/ConfigVendorAccountDialog.vue";
import VendorAccountDialog from "~/components/page/sms-vendor/VendorAccountDialog.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import VendorSelect from "~/components/select/VendorSelect.vue";
import { NUMBER } from "~/constants/filterType";
import { unsecuredCopyToClipboard } from "~/helpers/ultis";
import Template from "~/pages/manage-ads/mms/template.vue";

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
  name: "SmsVendorManagerVendor",
  components: {
    Template,
    ApiDataTable,
    VendorAccountDialog,
    ConfigVendorAccountDialog,
    ConfirmGenDlvrTokenDialog,
    ConfimDeleteVendorAccountDialog,
    NewCustomFilter,
    VendorSelect
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
          text: "Username",
          value: "username",
          width: 200
        },
        {
          text: "Mã phân phối đối tác",
          sortable: false,
          value: "vendor_code",
          width: 180
        },
        {
          text: "API Token",
          sortable: false,
          value: "send_sms_token",
          width: 160
        },
        {
          text: "Deliver token",
          sortable: false,
          value: "dlvr_token",
          width: 300
        },
        {
          text: "Trọng số",
          value: "weight",
          align: "right",
          width: 120
        },
        {
          text: "Nhà mạng",
          sortable: false,
          value: "telco_codes",
          width: 200
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
