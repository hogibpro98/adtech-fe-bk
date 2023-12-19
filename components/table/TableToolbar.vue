<template>
  <v-app-bar flat dense class="data-table__toolbar" color="data-table-toolbar">
    <v-text-field
      v-if="isSearch"
      v-model="search"
      :placeholder="searchPlaceholder"
      flat
      append-icon="search"
      hide-details
      class="search-bar mr-auto"
    ></v-text-field>
    <custom-icon
      v-if="isSynthesis && checkPermission(ACTIONS.ACTION)"
      icon="cached"
      desc="Tổng hợp lại"
      tooltip="Tổng hợp lại"
      class="ml-2"
      @click="$emit('synthesis-item')"
    ></custom-icon>
    <custom-icon
      v-for="(toolbarItem, i) in toolbarCustom"
      :key="`toolbar-item-${i}-${toolbarItem.event}`"
      :icon="toolbarItem.icon"
      :desc="toolbarItem.desc"
      :tooltip="toolbarItem.tooltip"
      :disabled="toolbarItem.disabled"
      class="ml-2"
      @click="$emit(toolbarItem.event)"
    ></custom-icon>

    <custom-icon
      v-if="isDelete && checkPermission(ACTIONS.DELETE)"
      icon="delete"
      desc="Xóa"
      tooltip="Xóa các bản ghi"
      class="ml-2"
      @click="$emit('delete-selected')"
    ></custom-icon>
    <custom-icon
      v-if="isCreate && checkPermission(ACTIONS.ADD)"
      icon="add"
      desc="Thêm mới"
      tooltip="Thêm mới bản ghi"
      class="ml-2"
      @click="$emit('add-item')"
    ></custom-icon>
    <custom-icon
      v-if="isDownload && checkPermission(ACTIONS.VIEW)"
      :disabled="loadingExport"
      icon="get_app"
      desc="Tải xuống"
      tooltip="Xuất file"
      class="ml-2"
      @click="exportFile"
    ></custom-icon>
    <custom-icon
      v-if="isImport  && checkPermission(ACTIONS.IMPORT)"
      icon="publish"
      desc="Tải lên"
      tooltip="Tải tệp lên"
      class="ml-2"
      @click="importFile"
    ></custom-icon>
    <custom-icon
      v-if="isFullScreen"
      :icon="showFullScreen ? 'fullscreen_exit' : 'fullscreen'"
      :desc="showFullScreen ? 'Thu gọn' : 'Mở rộng'"
      :tooltip="showFullScreen ? 'Thu gọn bảng' : 'Mở rộng bảng'"
      class="ml-2"
      @click="toggleShowFullScreen"
    ></custom-icon>
    <custom-icon
      v-if="isChangeColumn"
      icon="view_column"
      desc="Cột"
      tooltip="Ẩn/hiện cột"
      class="ml-2"
      @click="$emit('change-columns')"
    ></custom-icon>
    <v-divider v-if="isToggleChart" vertical></v-divider>
    <custom-icon
      v-if="isToggleChart"
      :icon="showChart ? 'expand_less' : 'expand_more'"
      :tooltip="showChart ? 'Ẩn biểu đồ' : 'Hiển thị biểu đồ'"
      class="ml-2"
      @click="toggleShowChart"
    ></custom-icon>
    <export-component ref="exportComponent" />
  </v-app-bar>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ACTIONS from "@/constants/actions";
import { isEqual, get } from "lodash";
import CustomIcon from "~/components/common/CustomIcon.vue";
import { isObject } from "~/util/typeof";
import ExportComponent from "~/components/common/ExportComponent.vue";
import HeaderSelectMonth from "~/components/common/HeaderSelectMonth.vue";
import { TOTAL_SECOND_OF_DAY } from "~/constants/time-unit";

interface ComponentData {
  ACTIONS: string;
  search: string;
  showFullScreen: boolean;
  showChartPrev: boolean;
  loadingExport: boolean;
}

interface ComponentMethods {
  checkPermission(role: string): boolean;

  toggleShowChart(): void;

  toggleShowFullScreen(): void;

  exportFile(): void;

  importFile(): void;

  defaultExport(): void;
}

const TableToolbar = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TableToolbar",
  components: { ExportComponent, CustomIcon, HeaderSelectMonth,},
  props: {
    pageName: {
      type: String,
      default: null
    },
    searchPlaceholder: {
      type: String,
      default: ""
    },
    keyword: {
      type: String,
      default: ""
    },
    showChart: {
      type: Boolean,
      default: true
    },
    exportResource: {
      type: String,
      default: null
    },
    exportParams: {
      type: Object,
      default: () => ({})
    },
    toolbar: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      ACTIONS,
      search: "",
      showFullScreen: false,
      showChartPrev: true,
      loadingExport: false,
      month: this.$options.filters.timeDateLine(
        Date.now() - TOTAL_SECOND_OF_DAY
      )
    };
  },

  computed: {
    isSearch() {
      return get(this.toolbar, "isSearch", true);
    },
    isCreate() {
      return get(this.toolbar, "isCreate", false);
    },
    isDelete() {
      return get(this.toolbar, "isDelete", false);
    },
    isDownload() {
      return get(this.toolbar, "isDownload", false);
    },
    isFullScreen() {
      return get(this.toolbar, "isFullScreen", false);
    },
    isChangeColumn() {
      return get(this.toolbar, "isChangeColumn", true);
    },
    isToggleChart() {
      return get(this.toolbar, "isToggleChart", false);
    },
    isImport() {
      return get(this.toolbar, "isImport", false);
    },
    toolbarCustom() {
      if (isObject(this.toolbar)) {
        return Object.entries(this.toolbar)
          .filter(([_, value]) => isObject(value))
          .map(([key, value]) => {
            return {
              event: key,
              ...value
            };
          });
      }
      return [];
    },
    isSynthesis() {
      return get(this.toolbar, "isSynthesis", false);
    }
  },
  watch: {
    search(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.$emit("update:keyword", newVal);
      }
    },
    keyword(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.search = this.keyword;
      }
    }
  },
  methods: {
    checkPermission(action) {
      if (this.pageName) {
        return this.$can(`${this.pageName}.${action}`);
      }
      return true;
    },
    toggleShowChart() {
      this.$emit("toggle-chart", !this.showChart);
    },
    toggleShowFullScreen() {
      if (this.showFullScreen) {
        this.$emit("toggle-chart", this.showChartPrev);
      } else {
        this.showChartPrev = this.showChart;
        this.$emit("toggle-chart", false);
      }
      this.$emit("full-screen", !this.showFullScreen);
      this.showFullScreen = !this.showFullScreen;
    },
    exportFile() {
      if (!this.toolbar?.exportResource) {
        this.$emit("export-file");
      } else {
        this.$refs.exportComponent.start(
          `${this.toolbar.exportResource}/limit-export`,
          this.exportParams
        );
      }
    },
    importFile() {
      this.$emit("import-file");
    }
    // async defaultExport() {
    //   this.loadingExport = true;
    //   try {
    //     const res = await this.$axios.post(
    //       `${this.toolbar.exportResource}/export`,
    //       this.exportParams,
    //       {
    //         responseType: "blob"
    //       }
    //     );
    //
    //     downloadFile(res);
    //   } catch (e) {
    //     console.log(e);
    //   }
    //   this.loadingExport = false;
    // }
  }
});

export default TableToolbar;
export type TableToolbarRef = InstanceType<typeof TableToolbar>;
</script>
