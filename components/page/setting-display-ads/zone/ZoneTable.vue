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
        page-name="setting-display-ads-zone"
        calculate-widths
        selectable
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @show-code="showCode"
        @delete-selected="deleteSelected"
      >
        <template slot="item.constract" slot-scope="{ item }">
          <div class="text-start">
            <p>{{ checkConstract(item.constract) }}</p>
          </div>
        </template>
        <template slot="item.name" slot-scope="{ item }">
          <nuxt-link
            v-if="item.name"
            :to="`/setting-display-ads/zone/${item.id}`"
            >{{ item.name }}
          </nuxt-link>
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
        <template slot="item.channel" slot-scope="{ item }">
          <nuxt-link
            v-if="item.channel"
            :to="`/setting-display-ads/channel/${item.channel.id}`"
            >{{ item.channel.name }}
          </nuxt-link>
        </template>
        <template slot="item.layout" slot-scope="{ item }">
          <span v-if="item.layout">{{ item.layout.name }} </span>
        </template>
        <template slot="item.total_money" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.total_money | currency }}</p>
          </div>
        </template>
        <template slot="item.ctr" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ renderCTR(item) }}</p>
          </div>
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
        <template slot="item.num_pageview" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.num_pageview | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_request" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.num_request | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_request_success" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.num_request_success | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.request_success_rate" slot-scope="{ item }">
          <div class="text-right">
            <p>{{ item.request_success_rate | percent }}%</p>
          </div>
        </template>
        <template slot="item.width" slot-scope="{ item }"
          >{{ item.width | numberSpace }}x{{ item.height | numberSpace }}
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
    <zone-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></zone-form-dialog>
    <code-zone-form-show-dialog
      ref="dialogShowCode"
    ></code-zone-form-show-dialog>
    <zone-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></zone-delete-dialog>
    <zone-mass-delete-dialog
      ref="massDeleteDialog"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
    <base-mass-delete-dialog
      resource="/advertiser/zone"
      object-name="khu vực hiện thị"
    />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import CodeZoneFormShowDialog from "@/components/page/setting-display-ads/zone/CodeZoneFormShowDialog.vue";
import ZoneFormDialog from "@/components/page/setting-display-ads/zone/ZoneFormDialog.vue";
import ZoneDeleteDialog from "@/components/page/setting-display-ads/zone/ZoneDeleteDialog.vue";
import ChannelSelect from "@/components/select/ChannelSelect.vue";
import LayoutSelect from "@/components/select/LayoutSelect.vue";
import { RESOURCE, SELECT } from "@/constants/filterType";
import { ZONE } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { ChannelInterface } from "~/interface/data/channel";
import { ZoneFormDialogRef } from "~/components/page/setting-display-ads/zone/ZoneFormDialog.vue";
import { CodeZoneFormShowDialogRef } from "~/components/page/setting-display-ads/zone/CodeZoneFormShowDialog.vue";
import { ZoneDeleteDialogRef } from "~/components/page/setting-display-ads/zone/ZoneDeleteDialog.vue";
import GlobalDataInterface from "~/interface/data/global";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import ZoneMassDeleteDialog from "~/components/page/setting-display-ads/zone/ZoneMassDeleteDialog.vue";
import { DISPLAY_TYPE_SELECT } from "~/constants/dataSelect";

interface ComponentData extends GlobalDataInterface {
  $refs: {
    table: ApiDataTableRef;
    dialog: ZoneFormDialogRef;
    dialogShowCode: CodeZoneFormShowDialogRef;
    deleteDialog: ZoneDeleteDialogRef;
  };
  searchParams: Array<object>;
  userId: string | number;
  startIndex: number;
}

interface ComponentMethods {
  renderCTR(item: ChannelInterface): string;

  addItem(): void;

  editItem(item: ChannelInterface): void;

  showCode(item: ChannelInterface): void;

  deleteItem(item: ChannelInterface): void;

  refreshTable(toFirstPage?: boolean): void;
}

const ZoneTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ZoneTable",
  components: {
    BaseMassDeleteDialog,
    ZoneMassDeleteDialog,
    ZoneDeleteDialog,
    CodeZoneFormShowDialog,
    ZoneFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  props: {
    resource: {
      type: String,
      default: ZONE
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
    },
    headers: {
      type: Array,
      default: () => [
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
          text: "Sub-inventory",
          value: "channel",
          sortable: false,
          width: 160
        },
        {
          text: "Loại layout",
          value: "layout",
          sortable: false,
          width: 160
        },
        {
          text: "Kiểu hiển thị",
          value: "display_type",
          width: 160
        },
        {
          text: "Kích thước",
          value: "width",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false,
          width: 200
        },
        {
          text: "Gói mua khoán",
          value: "constract",
          sortable: false,
          width: 200
        },
        {
          text: "Lượt click",
          value: "num_click",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Lượt impression",
          value: "num_view",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "CTR",
          value: "ctr",
          align: "right",
          sortable: false,
          width: 120
        },
        {
          text: "Lượt request",
          value: "num_request",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Lượt lấy QC",
          value: "num_request_success",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Tỉ lệ lấy QC thành công",
          value: "request_success_rate",
          align: "right",
          sortable: false,
          width: 200
        },
        {
          text: "Lượt pageview",
          value: "num_pageview",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Doanh thu",
          value: "total_money",
          align: "right",
          sortable: false,
          width: 160
        },
        {
          text: "Hành động",
          value: "action",
          width: 76,
          align: "center",
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "settings",
              label: "Lấy code",
              event: "show-code"
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
      ]
    },
    filters: {
      type: Array,
      default: () => [
        {
          type: RESOURCE,
          name: "channel_id",
          label: "Sub-inventory",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
          },
          component: ChannelSelect
        },
        {
          type: RESOURCE,
          name: "layout_id",
          label: "Loại layout",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
          },
          component: LayoutSelect
        },
        {
          type: SELECT,
          name: "display_type",
          label: "Kiểu hiển thị",
          props: {
            multiple: false
          },
          items: DISPLAY_TYPE_SELECT
        }
      ]
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
        tooltip: "Xóa"
      };
      return toolbarShow;
    }
  },
  methods: {
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
    showCode(item) {
      this.$refs.dialogShowCode.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    },
    checkConstract(item) {
      return item?.name;
    }
  }
});

export default ZoneTable;
export type ZoneTableRef = InstanceType<typeof ZoneTable>;
</script>
