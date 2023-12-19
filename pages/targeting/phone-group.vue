<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <new-custom-filter v-model="searchParams" :filters="filterShow" />

          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            :default-pagination="{
              sortBy: ['created_at', 'name'],
              sortDesc: [true, false]
            }"
            selectable
            page-name="targeting-phone-group"
            calculate-widths
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
          >
            <template slot="item.agency" slot-scope="{ item }">
              <nuxt-link
                v-if="getAgency(item)"
                :to="`/user/${getAgency(item).id}`"
                class="truncate-2 w-full block"
                >{{ getAgency(item).full_name }}</nuxt-link
              >
            </template>
            <template slot="item.advertiser" slot-scope="{ item }">
              <nuxt-link
                v-if="item.advertiser"
                :to="`/user/${item.advertiser.id}`"
                class="truncate-2 w-full block"
                >{{ item.advertiser.full_name }}</nuxt-link
              >
            </template>
            <template slot="item.type" slot-scope="{ item }">
              <v-chip
                :color="TYPE_MAP[item.type].color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ TYPE_MAP[item.type].text }}</v-chip
              >
            </template>
            <template slot="item.numbers" slot-scope="{ item }">
              <a href="javascript:;" @click="showNumbers(item)">
                Xem chi tiết
              </a>
            </template>
            <template slot="item.ads_mms_count" slot-scope="{ item }">
              <a
                v-if="item.ads_mms_count > 0"
                :href="
                  `/manage-ads/list-ads-mms?resource_phone_group_id=${item.id}`
                "
                >{{ item.ads_mms_count | numberSpace }}</a
              >
              <span v-else>{{ item.ads_mms_count | numberSpace }}</span>
            </template>

            <template slot="item.target_file" slot-scope="{ item }">
              <a :href="item.target_file || ''">{{ item.target_file }}</a>
            </template>
            <template slot="item.created_at" slot-scope="props">
              <span>{{ props.item.created_at | datetime }}</span>
            </template>
            <template slot="item.updated_at" slot-scope="props">
              <span>{{ props.item.updated_at | datetime }}</span>
            </template>
          </api-data-table>
          <v-card-text class="pa-0"></v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <phone-group-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    />
    <phone-group-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
    <mass-delete-dialog
      ref="massDeleteDialog"
      :resource="resource"
      object-name="nhóm thuê bao"
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
import TargetingPhoneNameDeleteDialog, {
  TargetingPhoneNameDeleteDialogRef
} from "@/components/page/targeting/TargetingPhoneNameDeleteDialog.vue";
import Phone, {
  TargetingPhoneNameFormDialogRef
} from "@/components/page/targeting/TargetingPhoneNameFormDialog.vue";
import { DATE, RESOURCE, SELECT, TEXT } from "@/constants/filterType";
import { PHONE_GROUP, PHONE_NAME } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "@/components/table/ApiDataTable.vue";
import cloneDeep from "lodash/cloneDeep";
import PhoneGroupFormDialog from "~/components/page/targeting/phone-group/PhoneGroupFormDialog.vue";
import PhoneGroupDeleteDialog from "~/components/page/targeting/phone-group/PhoneGroupDeleteDialog.vue";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";
import NewCustomFilter from "~/components/common/NewCustomFilter/index.vue";
import AgencyAdvertiserSelect from "~/components/select/AgencyAdvertiserSelect.vue";
import { ROLE_AGENCY, ROLE_IS_ADMIN } from "~/constants/role";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import MassDeleteDialog from "~/components/common/MassDeleteDialog.vue";

interface ComponentData {
  showing: boolean;
  timeout: number;
  isAdmin: boolean;
  isAgency: boolean;
  $refs: {
    resource: string;
    filters: Array<object>;
    searchParams: Array<object>;
    headers: DataTableHeader[];
    startIndex: number;
    table: ApiDataTableRef;
    dialog: TargetingPhoneNameFormDialogRef;
    deleteDialog: TargetingPhoneNameDeleteDialogRef;
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
    NewCustomFilter,
    ConfirmDialog,
    PhoneGroupDeleteDialog,
    PhoneGroupFormDialog,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  data() {
    return {
      resource: PHONE_GROUP,
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
          value: "name"
        },
        {
          text: "Loại thuê bao",
          width: 200,
          value: "type"
        },
        {
          text: "File dữ liệu",
          width: 200,
          value: "target_file"
        },
        {
          text: "Agency",
          value: "agency",
          width: 200,
          visible: this.isAdmin,
          sortable: false
        },
        {
          text: "Advertiser",
          value: "advertiser",
          width: 200,
          visible: this.isAdmin || this.isAgency,
          sortable: false
        },
        // {
        //   text: "Danh sách",
        //   width: 200,
        //   value: "numbers"
        // },
        {
          text: "Số QC sử dụng",
          width: 200,
          align: "right",
          value: "ads_mms_count"
        },
        {
          text: "Thời gian tạo",
          width: 200,
          value: "created_at",
          align: "center"
        },
        {
          text: "Cập nhật lần cuối",
          width: 200,
          value: "updated_at",
          align: "center"
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

    filters() {
      return [
        {
          type: SELECT,
          multiple: false,
          name: "type",
          label: "Loại thuê bao",
          items: [
            {
              value: "black",
              text: "Blacklist"
            },
            {
              value: "white",
              text: "Whitelist"
            }
          ]
        },
        {
          type: RESOURCE,
          name: "user_id",
          label: "Người sở hữu",
          itemValue: "id",
          itemText: "full_name",
          component: AgencyAdvertiserSelect,
          props: {
            multiple: false,
            label: "Người sở hữu"
          }
        },
        {
          type: DATE,
          name: "created_at",
          label: "Thời gian tạo",
          maxDate: "tomorrow",
          configProps: {
            maxDate: Date.now()
          }
        },
        {
          type: DATE,
          name: "updated_at",
          label: "Cập nhật lần cuối",
          maxDate: "tomorrow",
          configProps: {
            maxDate: Date.now()
          }
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
    filterShow() {
      return this.filters.filter(f => !this.filterExcludes.includes(f.name));
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
