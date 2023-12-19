<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            v-model="selectedItems"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            :toolbar="toolbarShow"
            page-name="setting-display-ads-type"
            calculate-widths
            selectable
            @add-item="addItem"
            @edit-item="editItem"
            @delete-item="deleteItem"
            @delete-selected="deleteSelected"
          >
            <template slot="item.image_demo" slot-scope="props">
              <v-img
                v-img="{ src: props.item.image_demo }"
                :lazy-src="props.item.image_demo"
                :src="props.item.image_demo"
                contain
                height="80"
                max-width="100"
              />
            </template>
            <template slot="item.media_type" slot-scope="props">{{ getNameMediaType(props.item.media_type) }}</template>
            <template slot="item.image_templates" slot-scope="props">
              <v-chip
                v-for="(image_template, index) in props.item.image_templates"
                :key="`size-${props.item.id}-${index}`"
                class="mx-1 px-2 py-1"
                label
                small
              >{{ image_template.width }} x {{ image_template.height }}</v-chip>
            </template>
            <template slot="item.device" slot-scope="props">{{ getNameDevice(props.item.device) }}</template>
            <template slot="item.platform" slot-scope="props">{{ getNamePlatform(props.item.platform) }}</template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <type-display-ads-form-dialog
      ref="dialog"
      @create-success="refreshTable(true)"
      @update-success="refreshTable"
    ></type-display-ads-form-dialog>
    <type-display-ads-delete-dialog
      ref="deleteDialog"
      @action-success="refreshTable"
    ></type-display-ads-delete-dialog>
    <base-mass-delete-dialog
      ref="massDeleteDialog"
      resource="/ads-type"
      object-name="loại hiện thị quảng cáo"
      @confirm="deleteSelected"
      @action-success="refreshTable(false, false)"
    />
  </v-container>
</template>
<script lang="ts">
import TypeDisplayAdsFormDialog from "@/components/page/setting-display-ads/type-display/TypeDisplayAdsFormDialog.vue";
import TypeDisplayAdsDeleteDialog from "@/components/page/setting-display-ads/type-display/TypeDisplayAdsDeleteDialog.vue";
import { DEVICES, PLATFORM, MEDIA_TYPES } from "@/constants/dataSelect";
import { SELECT, TEXT } from "@/constants/filterType";
import { ADS_TYPE } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import BaseMassDeleteDialog from "~/components/common/BaseMassDeleteDialog.vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import { TypeDisplayAdsFormDialogRef } from "~/components/page/setting-display-ads/type-display/TypeDisplayAdsFormDialog.vue";
import { TypeDisplayAdsDeleteDialogRef } from "~/components/page/setting-display-ads/type-display/TypeDisplayAdsDeleteDialog.vue";
import { DisplayAdsTypeInterface } from "~/interface/data/displayAdsType";
import GlobalDataInterface from "~/interface/data/global";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import TypeDisplayAdsMassDeleteDialog from "~/components/page/setting-display-ads/type-display/TypeDisplayAdsMassDeleteDialog.vue";

interface ComponentData extends GlobalDataInterface {
  showing: boolean;
  timeout: number;
  resource: string;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  searchParams: Array<object>;
  startIndex: number;
  $refs: {
    table: ApiDataTableRef;
    dialog: TypeDisplayAdsFormDialogRef;
    deleteDialog: TypeDisplayAdsDeleteDialogRef;
  };
}

interface ComponentMethods {
  refreshTable(toFirstPage?: boolean): void;
  addItem(): void;
  editItem(item: DisplayAdsTypeInterface): void;
  deleteItem(item: DisplayAdsTypeInterface): void;
  getNameDevice(deviceId: string): string;
  getNamePlatform(deviceId: string): string;
  getNameMediaType(deviceId: string): string;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    BaseMassDeleteDialog,
    TypeDisplayAdsMassDeleteDialog,
    TypeDisplayAdsDeleteDialog,
    TypeDisplayAdsFormDialog,
    ApiDataTable
  },
  mixins: [massDeleteTableWrapper],
  layout: "dashboard",
  props: {
    toolbar: {
      type: Object,
      default: () => ({
        isCreate: true
      })
    }
  },
  data() {
    return {
      resource: ADS_TYPE,
      filters: [
        {
          type: TEXT,
          name: "name",
          label: "Tên"
        },
        {
          type: SELECT,
          multiple: false,
          name: "platform",
          label: "Nền tảng",
          items: PLATFORM
        },
        {
          type: SELECT,
          multiple: false,
          name: "device",
          label: "Thiết bị",
          items: DEVICES
        }
      ],
      searchParams: null,
      headers: [
        {
          text: "Tên",
          value: "name",
          width: 200
        },
        {
          text: "Mô tả",
          value: "description",
          sortable: false
        },
        {
          text: "Ảnh demo",
          value: "image_demo",
          width: 200,
          sortable: false
        },
        {
          text: "Loại hiển thị",
          value: "media_type",
          width: 150,
          sortable: false
        },
        {
          text: "Kích thước",
          value: "image_templates",
          width: 150,
          sortable: false
        },
        // {
        //   text: "Nền tảng",
        //   value: "platform",
        //   width: 150
        // },
        // {
        //   text: "Thiết bị",
        //   value: "device",
        //   width: 150
        // },
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
      ],
      startIndex: 0
    };
  },
  computed: {
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
    },
    getNameDevice(deviceId) {
      const device = DEVICES.find(({ value }) => value === deviceId);
      return device?.text || deviceId;
    },
    getNamePlatform(platformId) {
      const platform = PLATFORM.find(({ value }) => value === platformId);
      return platform?.text || platformId;
    },
    getNameMediaType(mediaType) {
      const platform = MEDIA_TYPES.find(({ value }) => value === mediaType);
      return platform?.text || mediaType;
    }
  }
});
</script>
