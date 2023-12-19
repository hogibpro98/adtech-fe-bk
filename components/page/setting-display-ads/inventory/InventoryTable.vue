<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <new-custom-filter v-model="searchParams" :filters="filters" />
      <v-divider />
      <api-data-table
        ref="table"
        v-bind="$attrs"
        v-model="selectedItems"
        :resource="resource"
        :headers="headers"
        :filter="filterTable"
        :start-index.sync="startIndex"
        :toolbar="toolbarShow"
        page-name="setting-display-ads-inventory"
        calculate-widths
        selectable
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @review-item="reviewItem"
        @delete-selected="deleteSelected"
      >
        <template slot="item.name" slot-scope="{ item }">
          <nuxt-link :to="`/setting-display-ads/inventory/${item.id}`"
            >{{ item.name }}
          </nuxt-link>
        </template>
        <template slot="item.url" slot-scope="{ item }">
          <a :href="item.url" class="truncate-2 w-full block" target="_blank">{{
            item.url
          }}</a>
        </template>
        <template slot="item.type" slot-scope="{ item }"
          >{{ getNamePlatform(item.type) }}
        </template>
        <template slot="item.status" slot-scope="{ item }">
          <v-chip
            v-if="statusMap[item.status]"
            :color="statusMap[item.status].color"
            small
            label
            class="w-full d-flex justify-center"
            >{{ statusMap[item.status].text }}
          </v-chip>
        </template>
        <template slot="item.total_money" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.total_money | currency }}</p>
          </div>
        </template>
        <template slot="item.ctr" slot-scope="{ item }">
          <div class="text-right">{{ renderCTR(item) }}</div>
        </template>
        <template slot="item.num_view" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.num_view | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_click" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.num_click | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.user" slot-scope="{ item }">
          <nuxt-link
            v-if="item.user"
            :to="`/user/${item.user.id}`"
            class="truncate-2 w-full block"
          >
            {{ item.user.full_name }}
          </nuxt-link>
        </template>
        <template
          v-for="(_, name) in $scopedSlots"
          :slot="name"
          slot-scope="slotData"
        >
          <slot :name="name" v-bind="slotData" />
        </template>
      </api-data-table>
    </v-card>
    <inventory-display-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></inventory-display-form-dialog>
    <inventory-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    />
    <inventory-review-dialog
      ref="reviewDialog"
      @action-success="refreshTable"
    />
    <!--    <inventory-mass-delete-dialog-->
    <!--      ref="massDeleteDialog"-->
    <!--      @confirm="deleteSelected"-->
    <!--      @action-success="refreshTable(false, false)"-->
    <!--    />-->
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/inventory/display-ads"
      object-name="inventory"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import InventoryDisplayFormDialog from "@/components/page/setting-display-ads/inventory/InventoryDisplayFormDialog.vue";
import InventoryDeleteDialog from "@/components/page/setting-display-ads/inventory/InventoryDeleteDialog.vue";
import { PLATFORM } from "@/constants/dataSelect";
import { SELECT } from "@/constants/filterType";
import { INVENTORY_DISPLAY } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";

import { ChannelInterface } from "~/interface/data/channel";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import InventoryMassDeleteDialog from "~/components/page/setting-display-ads/inventory/InventoryMassDeleteDialog.vue";
import InventoryReviewDialog from "~/components/page/setting-display-ads/inventory/InventoryReviewDialog.vue";

interface ComponentData {
  $refs: {
    table: ApiDataTableRef;
  };
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
}

interface ComponentMethods {
  renderCTR(item: ChannelInterface): string;

  addItem(): void;

  editItem(item: ChannelInterface): void;

  deleteItem(item: ChannelInterface): void;

  refreshTable(toFirstPage?: boolean): void;

  getNamePlatform(platformId: string): string;
}

const InventoryTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "InventoryTable",
  components: {
    InventoryReviewDialog,
    BaseMassDeleteDialog,
    InventoryMassDeleteDialog,
    InventoryDeleteDialog,
    InventoryDisplayFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  props: {
    resource: {
      type: String,
      default: INVENTORY_DISPLAY
    },
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true,
        isToggleChart: false,
        isFullScreen: false
      })
    },
    filterCustom: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      searchParams: null,
      userId: this.$auth.user.id,
      startIndex: 0
    };
  },
  computed: {
    filters() {
      return [
        {
          type: SELECT,
          multiple: false,
          name: "type",
          label: "Nền tảng",
          items: PLATFORM
        },
        {
          type: SELECT,
          multiple: false,
          name: "status",
          label: "Trạng thái",
          items: this.statusSelectItems
        }
      ];
    },
    statusMap: () => {
      return {
        created: {
          color: "info",
          text: "Mới tạo"
        },
        confirm: {
          color: "warning",
          text: "Cần xác nhận"
        },
        reject: {
          color: "error",
          text: "Từ chối"
        },
        locked: {
          color: "error",
          text: "Đã khóa"
        },
        approve: {
          color: "success",
          text: "Đang chạy"
        },
        penalized: {
          color: "purple",
          text: "Khóa doanh thu"
        }
      };
    },
    statusSelectItems() {
      const keys = Object.keys(this.statusMap);
      const items = [];

      keys.forEach(e => {
        if (this.statusMap[e]?.text) {
          items.push({
            value: e,
            text: this.statusMap[e].text
          });
        }
      });

      return items;
    },
    headers() {
      return [
        {
          text: "Tên",
          value: "name",
          width: 200
        },
        {
          text: "Người sở hữu",
          value: "user",
          sortable: false,
          width: 200
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 120
        },
        {
          text: "Loại",
          value: "type",
          width: 120
        },
        {
          text: "Địa chỉ URL",
          value: "url",
          width: 250,
          sortable: false
        },
        {
          text: "Lượt click",
          value: "num_click",
          align: "right",
          sortable: false,
          width: 150
        },
        {
          text: "Lượt impression",
          value: "num_view",
          sortable: false,
          align: "right",
          width: 150
        },
        {
          text: "CTR",
          value: "ctr",
          align: "right",
          sortable: false,
          width: 120
        },
        {
          text: "Doanh thu",
          value: "total_money",
          align: "right",
          sortable: false,
          width: 150
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "purple",
              icon: "visibility",
              label: "Duyệt",
              visible: this.checkShowButtonReview,
              event: "review-item"
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
      ];
    },
    filterTable() {
      const searchParamsFilter = this.searchParams || {};
      const filterCustomProps = this.filterCustom || {};
      return {
        ...searchParamsFilter,
        ...filterCustomProps
      };
    },

    toolbarShow() {
      const toolbarShow = cloneDeep(this.toolbar);
      toolbarShow["delete-selected"] = {
        icon: "delete",
        desc: `Xóa`,
        disabled: !this.canMassDelete,
        tooltip: "Xóa các bản ghi"
      };
      return toolbarShow;
    }
  },
  methods: {
    checkShowButtonReview(item) {
      return item?.item_permissions?.includes("review");
    },
    renderCTR(item) {
      const numView = item.num_view;
      const numClick = item.num_click;
      if (numView && numClick) {
        return `${this.$filters.percent(numClick / numView)}%`;
      }
      return "0%";
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    reviewItem(item) {
      this.$refs.reviewDialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    getNamePlatform(platformId) {
      const platform = PLATFORM.find(({ value }) => value === platformId);
      return platform?.text || platformId;
    }
  }
});

export default InventoryTable;
export type InventoryTableRef = InstanceType<typeof InventoryTable>;
</script>
