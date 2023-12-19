<template>
  <v-flex lg12 class="no-padding">
    <v-card>
      <new-custom-filter v-model="searchParams" :filters="filters" />
      <v-divider />
      <api-data-table
        ref="table"
        v-bind="$attrs"
        :resource="resource"
        :headers="headers"
        v-model="selectedItems"
        :filter="filterTable"
        :start-index.sync="startIndex"
        :toolbar="toolbarShow"
        page-name="setting-display-ads-channel"
        :default-pagination="{
          sortBy: ['created_at'],
          sortDesc: [true]
        }"
        calculate-widths
        selectable
        v-on="$listeners"
        @add-item="addItem"
        @edit-item="editItem"
        @delete-item="deleteItem"
        @delete-selected="deleteSelected"
      >
        <template slot="item.name" slot-scope="{ item }">
          <nuxt-link :to="`/setting-display-ads/channel/${item.id}`">{{ item.name }}</nuxt-link>
        </template>
        <template slot="item.user" slot-scope="{item}">
          <nuxt-link
            v-if="item.user"
            :to="`/user/${item.user.id}`"
            class="truncate-2 w-full block"
          >
            {{ item.user.full_name }}
          </nuxt-link>
        </template>
        <template slot="item.url" slot-scope="props">
          <a
            :href="props.item.url"
            class="truncate-2 w-full block"
            target="_blank"
          >{{ props.item.url }}</a>
        </template>
        <template slot="item.inventory" slot-scope="props">
          <nuxt-link
            v-if="props.item.inventory"
            :to="`/setting-display-ads/inventory/${props.item.inventory.id}`"
          >{{ props.item.inventory.name }}</nuxt-link>
        </template>
        <template slot="item.tags" slot-scope="props">
          <v-chip
            v-for="(tag, index) in props.item.tags"
            :key="`tag-${props.item.id}-${index}`"
            class="ma-1 px-2 py-1"
            label
            small
          >{{ tag.name }}</v-chip>
        </template>
        <template slot="item.total_money" slot-scope="props">
          <div class="text-right">
           <p>{{ props.item.total_money | currency }}</p>
          </div>
        </template>
        <template slot="item.ctr" slot-scope="props">
          <div class="text-right">
            <p>{{ renderCTR(props.item) }}</p>
          </div>
        </template>
        <template slot="item.num_view" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_view | numberSpace }}</p>
          </div>
        </template>
        <template slot="item.num_click" slot-scope="props">
          <div class="text-right">
            <p>{{ props.item.num_click | numberSpace }}</p>
          </div>
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
    <channel-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></channel-form-dialog>
    <channel-delete-dialog ref="deleteDialog" @action-success="refreshTable" />
    <!--    <channel-mass-delete-dialog-->
    <!--      ref="massDeleteDialog"-->
    <!--      @confirm="deleteSelected"-->
    <!--      @action-success="refreshTable(false, false)"-->
    <!--    />-->
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/channel"
      object-name="sub-inventory"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-flex>
</template>
<script lang="ts">
import NewCustomFilter from "@/components/common/NewCustomFilter/index.vue";
import ChannelDeleteDialog from "@/components/page/setting-display-ads/channel/ChannelDeleteDialog.vue";
import ChannelFormDialog from "@/components/page/setting-display-ads/channel/ChannelFormDialog.vue";
import InventorySelect from "@/components/select/InventorySelect.vue";
import TargetingTagSelect from "@/components/select/TargetingTagSelect.vue";
import { CUSTOM, RESOURCE } from "@/constants/filterType";
import { CHANNEL } from "@/constants/resource";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { ChannelInterface } from "~/interface/data/channel";

import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import ChannelMassDeleteDialog from "~/components/page/setting-display-ads/channel/ChannelMassDeleteDialog.vue";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";

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
}

const ChannelTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ChannelTable",
  components: {
    BaseMassDeleteDialog,
    ChannelMassDeleteDialog,
    ChannelDeleteDialog,
    ChannelFormDialog,
    NewCustomFilter,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  props: {
    resource: {
      type: String,
      default: CHANNEL
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
          text: "Inventory",
          value: "inventory",
          sortable: false,
          width: 200
        },
        {
          text: "Địa chỉ URL",
          value: "url",
          sortable: false,
          width: 250
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
          align: "right",
          sortable: false,
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
          name: "inventory_id",
          label: "Inventory",
          itemValue: "id",
          itemText: "name",
          props: {
            multiple: false
          },
          component: InventorySelect
        },
        {
          type: CUSTOM,
          name: "tags",
          label: "Tag",
          itemValue: "id",
          component: TargetingTagSelect,
          props: {
            itemValue: "id",
            returnObject: false,
            multiple: false
          }
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
        tooltip: "Xóa các bản ghi"
      };
      return toolbarShow;
    }
  },
  methods: {
    renderCTR(item) {
      const numView = item.num_view;
      const numClick = item.num_click;
      if (numView && numClick) {
        return this.$filters.percent(numClick / numView);
      }
      return "0%";
    },
    addItem() {
      this.$refs.dialog.show();
    },
    editItem(item) {
      this.$refs.dialog.show(item);
    },
    deleteItem(item) {
      this.$refs.deleteDialog.show(item);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});

export default ChannelTable;
export type ChannelTableRef = InstanceType<typeof ChannelTable>;
</script>
