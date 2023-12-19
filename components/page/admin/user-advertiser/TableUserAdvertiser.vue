<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <v-overlay v-if="loading" absolute color="#fff" class="z-1">
        <v-progress-circular
          :width="4"
          :size="25"
          indeterminate
          color="primary"
        >
        </v-progress-circular>
      </v-overlay>
      <new-custom-filter v-model="searchParams" :filters="filterShow" />
      <v-divider />
      <api-data-table
        ref="table"
        v-bind="$attrs"
        :resource="resource"
        :headers="headerShow"
        :filter="filterTable"
        :start-index.sync="startIndex"
        :toolbar="toolbar"
        calculate-widths
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @change-password="changePassword"
        @delete-item="deleteItem"
      >
        <template
          v-for="(_, name) in $scopedSlots"
          :slot="name"
          slot-scope="slotData"
        >
          <slot :name="name" v-bind="slotData" />
        </template>
      </api-data-table>
    </v-card>
    <form-advertiser-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></form-advertiser-dialog>
    <user-delete-dialog ref="deleteDialog" @action-success="refreshTable" />
    <user-password-dialog ref="passwordDialog" @action-success="refreshTable" />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import FormAdvertiserDialog from "@/components/page/admin/user-advertiser/FormAdvertiserDialog";
import UserDeleteDialog from "@/components/page/admin/user/UserDeleteDialog";
import UserPasswordDialog from "@/components/page/admin/user/UserPasswordDialog";
import CampaignSelect from "@/components/select/CampaignSelect";
import { CODE_SUCCESS } from "@/constants/code";
import { STATUS_BANNER_MMS } from "@/constants/dataSelect";
import { RESOURCE, SELECT, TEXT } from "@/constants/filterType";
import { BANNER } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import { DataTableHeader } from "vuetify";
import ApiDataTable from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import { UserInterface } from "~/interface/data/user";
import { FormDialogRef } from "~/components/common/FormDialog.vue";
import { UserPasswordDialogRef } from "~/components/page/admin/user/UserPasswordDialog.vue";
import { ApiDataTableRef } from "~/components/table/ApiDataTable.vue";
import { UserDeleteDialogRef } from "~/components/page/admin/user/UserDeleteDialog.vue";

interface ComponentData {
  $refs: {
    dialog: FormDialogRef;
    deleteDialog: UserDeleteDialogRef;
    passwordDialog: UserPasswordDialogRef;
    table: ApiDataTableRef;
  };
  searchParams: Array<object>;
  userId: string;
  startIndex: number;
  loading: boolean;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
}

interface ComponentMethods {
  addItem(): void;
  changePassword(item: UserInterface): void;
  editItem(item: UserInterface): void;
  deleteItem(item: UserInterface): void;
  refreshTable(toFirstPage: boolean): string;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TableUserAdvertiser",
  components: {
    FormAdvertiserDialog,
    UserPasswordDialog,
    UserDeleteDialog,
    NewCustomFilter,
    ApiDataTable
  },
  props: {
    resource: {
      type: String,
      default: BANNER
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isToggleChart: true,
        isFullScreen: true
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    },
    headerExcludes: {
      type: Array,
      default: () => []
    },
    filterExcludes: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0,
      loading: false,
      headers: [
        {
          text: "Tên doanh nghiệp",
          value: "name",
          width: 250
        },
        {
          text: "Mã số thuế",
          value: "a",
          width: 250
        },
        {
          text: "Địa chỉ",
          value: "b",
          width: 250
        },
        {
          text: "Người đại diện",
          value: "c",
          sortable: false,
          width: 220
        },
        {
          text: "Số điện thoại",
          value: "d",
          width: 250
        },
        {
          text: "Email",
          value: "e",
          width: 150
        },
        {
          text: "Tài liệu đính kèm",
          value: "f",
          width: 150
        },
        {
          text: "Trạng thái",
          value: "g",
          width: 120
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "warning",
              icon: "lock",
              label: "Đổi mật khẩu",
              event: "change-password"
            },
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
      filters: [
        {
          type: TEXT,
          name: "title",
          label: "Tên"
        },
        {
          type: TEXT,
          name: "url",
          label: "URL"
        },
        {
          type: RESOURCE,
          name: "campaign_id",
          label: "Chiến dịch",
          itemValue: "id",
          itemText: "name",
          component: CampaignSelect,
          props: {
            multiple: false
          }
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: STATUS_BANNER_MMS
        }
      ]
    };
  },
  computed: {
    headerShow() {
      return this.headers.filter(
        header => !this.headerExcludes.includes(header.value)
      );
    },
    filterShow() {
      return this.filters.filter(f => !this.filterExcludes.includes(f.name));
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    }
  },
  methods: {
    addItem() {
      this.$refs.dialog.show();
    },
    changePassword(item) {
      this.$refs.passwordDialog.show(item);
    },
    async editItem(item) {
      try {
        this.loading = true;
        const res = await this.$bannerRepository.getDetail(item.id);
        this.loading = false;
        if (res.code === CODE_SUCCESS && res.data) {
          this.$refs.dialog.show(res.data);
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
      }
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
