<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filters" />
          <api-data-table
            ref="table"
            resource="/business-cat"
            :toolbar="showToolBar"
            :headers="headers"
            :filter="searchParams"
            @add-item="handleAddVendor"
            @edit-item="handleEditItem"
            @delete-item="handleDeleteItem"
            @set-brandname-alias="createBrandName"
            @set-business-cat-user-brandname-price="
              createBusinessCatUserBrandnamePriceDialog
            "
          >
            <template slot="item.business_type_id" slot-scope="props">
              <span
                v-if="props.item.business_type && props.item.business_type.name"
              >
                {{ props.item.business_type.name }}
              </span>
            </template>
            <template slot="item.type" slot-scope="{ item }">
              {{ renderType(item) }}
            </template>
          </api-data-table>
          <v-card-text class="no-padding"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <business-cat-dialog
      ref="vendorDialog"
      @action-success="refreshTable"
    ></business-cat-dialog>
    <confim-delete-business-cat-account-dialog
      ref="confirmDeleteDialog"
      @action-success="refreshTable"
    ></confim-delete-business-cat-account-dialog>
    <business-cat-price-dialog
      ref="BrandNameCreateDialog"
      @action-success="refreshTable"
    />
    <business-cat-user-brandname-price-dialog
      ref="BusinessCatUserBrandnamePriceDialog"
      @action-success="refreshTable"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import BusinessCatDialog from "~/components/page/sms-vendor/BusinessCatDialog.vue";
import ConfimDeleteBusinessCatAccountDialog from "~/components/page/sms-vendor/ConfimDeleteBusinessCatAccountDialog.vue";
import BusinessCatPriceDialog from "~/components/page/sms-vendor/BusinessCatPriceDialog.vue";
import BusinessCatUserBrandnamePriceDialog from "~/components/page/sms-vendor/BusinessCatUserBrandnamePriceDialog.vue";
import { NUMBER } from "~/constants/filterType";
import { SELECT_MMS_TYPE } from "~/constants/dataSelect";
interface ComponentData {}
interface ComponentMethod {
  handleAddVendor(): void;
  handleDeleteItem(item: object): void;
  handleEditItem(item: object): void;
  refreshTable(toFirstPage: boolean): void;
  renderType(item: object): string;
}
interface ComponentComputed {
  showToolBar: object;
  headers: Array<any>;
}
interface ComponentProp {}

export default Vue.extend<
  ComponentData,
  ComponentMethod,
  ComponentComputed,
  ComponentProp
>({
  name: "SmsVendorManagerBusinessCat",
  components: {
    ApiDataTable,
    BusinessCatDialog,
    ConfimDeleteBusinessCatAccountDialog,
    NewCustomFilter,
    BusinessCatPriceDialog,
    BusinessCatUserBrandnamePriceDialog
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
          text: "Tên lĩnh vực hoạt động",
          sortable: false,
          value: "name",
          width: 200
        },
        {
          text: "Loại tin nhắn",
          value: "type",
          width: 200
        },
        {
          text: "Tên lĩnh vực kinh doanh",
          sortable: false,
          value: "business_type_id",
          width: 300
        },
        {
          text: "Hành động",
          sortable: false,
          value: "action",
          align: "center",
          width: 120,
          actions: [
            {
              color: "primary",
              icon: "mdi-cash ",
              label: "Cấu hình giá theo nhà mạng",
              event: "set-brandname-alias"
            },
            {
              color: "primary",
              icon: "mdi-cash-multiple",
              label: "Cấu hình giá theo brandnae và agency",
              event: "set-business-cat-user-brandname-price"
            },
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
    renderType(item) {
      return SELECT_MMS_TYPE.find(({ value }) => item.type === value)?.text;
    },
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
    },
    createBrandName(item) {
      this.$refs.BrandNameCreateDialog.show(item);
    },
    createBusinessCatUserBrandnamePriceDialog(item) {
      this.$refs.BusinessCatUserBrandnamePriceDialog.show(item);
    }
  }
});
</script>

<style></style>
