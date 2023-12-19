<template>
  <div>
    <table-toolbar
      :toolbar="toolbar"
      :page-name="pageName"
      :search-placeholder="searchPlaceholder"
      :keyword.sync="keyword"
      :export-params="params"
      :show-chart="showChart"
      @change-columns="changeColumns"
      v-on="$listeners"
    />
    <v-divider />
    <v-data-table
      ref="table"
      v-bind="$attrs"
      v-model="selectedItems"
      :multi-sort="multiSort"
      :must-sort="false"
      :footer-props="$attrs.footerProps || footerProps"
      :headers="tableHeaders"
      :items="indexedItems"
      :options.sync="pagination"
      :show-select="selectable"
      :server-items-length="total"
      :loading="loading"
      :loading-text="$attrs['loading-text'] || 'Đang tải dữ liệu...'"
      :no-data-text="noDataText"
      :class="
        `table-fixed-left-${fixedLeftCountShow} table-fixed-right-${fixedRightCountShow}`
      "
      :style="cssVars"
      dense
      class="elevation-1"
      @click:row="selectItem"
      v-on="$listeners"
    >
      <template v-if="rowActions" slot="item.action" slot-scope="props">
        <div :class="`nowrap ${rowActions.actions.length > 2 && 'text-right'}`">
          <v-tooltip
            v-for="(action, index) in rowActions.actions.filter(
              action =>
                action.visible === undefined ||
                action.visible(props.item, action)
            )"
            :key="`button-action-table-${index}`"
            offset-overflow
            bottom
          >
            <template #activator="{ on, attrs }">
              <span v-on="on">
                <v-btn
                  v-bind="attrs"
                  :class="getActionByItem(action, props.item, 'class')"
                  :color="getActionByItem(action, props.item, 'color')"
                  :disabled="getActionByItem(action, props.item, 'disabled')"
                  depressed
                  :retain-focus-on-click="false"
                  text
                  dense
                  icon
                  height="32"
                  width="32"
                  x-small
                  class="ma-0 px-1"
                  @click.native.stop.prevent="
                    action.event && $emit(action.event, props.item)
                  "
                >
                  <v-icon>{{
                    getActionByItem(action, props.item, "icon")
                  }}</v-icon>
                </v-btn>
              </span>
            </template>
            <span>{{ getActionByItem(action, props.item, "label") }}</span>
          </v-tooltip>
        </div>
      </template>

      <template slot="no-results">
        Không tìm thấy bản ghi.
      </template>

      <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      <template
        v-for="(_, name) in $scopedSlots"
        :slot="name"
        slot-scope="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>
    </v-data-table>
    <v-navigation-drawer
      v-model="columnDrawer"
      class="setting-drawer "
      temporary
      right
      hide-overlay
      fixed
    >
      <v-toolbar color="primary" dark>
        <v-toolbar-title>
          Chọn các cột hiển thị
        </v-toolbar-title>
      </v-toolbar>
      <vue-perfect-scrollbar
        class="drawer-menu--scroll"
        :settings="scrollSettings"
      >
        <div class="px-4">
          <v-checkbox
            v-for="header in originalHeaders"
            :key="header.value"
            v-model="shownColumns"
            :label="header.text"
            :value="header.value"
          ></v-checkbox>
        </div>
      </vue-perfect-scrollbar>
    </v-navigation-drawer>
  </div>
</template>

<script lang="ts">
import TableToolbar from "@/components/table/TableToolbar.vue";
import { DataTableHeader, DataOptions } from "vuetify";
import ACTIONS from "@/constants/actions";
import { isEqual, debounce, xor, xorBy } from "lodash";
import { isEqualDeep } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";
import { isArray } from "~/util/typeof";
import { fetchPermissionToStorage } from "~/util/permission";

export interface PaginationInterface {
  sortBy: Array<string>;
  sortDesc: Array<boolean>;
}

interface CustomDataTableHeader extends DataTableHeader {
  actions: Array<object>;
}

interface ComponentData {
  items: Array<object>;
  total: number;
  loading: boolean;
  pagination: DataOptions;
  options: object;
  keyword: string;
  startIndex: number;
  shownColumns: Array<CustomDataTableHeader | undefined>;
  columnDrawer: boolean;
  toolbar: object;
  selectedItems: Array<object>;
  selectable: boolean;
}

interface ComponentMethods {
  show: Function;
  hide: Function;
  refresh: Function;
  params: object;
  visibleEdit: boolean;
  visibleDelete: boolean;
  changeColumns: Function;

  getPageQuery(): void;

  debounceFetchData(): void;

  fetchData(): void;

  filterAction: Function;

  actionRow: Function;
}

interface ComponentComputed {
  rowActions: object;
  fixedRightCountShow: number;
  fixedLeftCountShow: number;
  tableHeaders: Array<CustomDataTableHeader>;
  isPermissionEdit: boolean;
  isPermissionAdd: boolean;
  isPermissionDelete: boolean;
}

const ApiDataTable = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "ApiDataTable",
  components: { TableToolbar },
  props: {
    pageName: {
      type: String,
      default: null
    },
    toolbar: {
      type: Object,
      default: (): object => ({})
    },
    // @ts-ignore
    headers: {
      type: Array,
      default: () => []
    },
    resource: {
      type: String,
      required: true
    },
    searchPlaceholder: {
      type: String,
      default: "Nhập từ khóa..."
    },
    filter: {
      type: Object,
      default: (): object => ({})
    },
    hasIndex: {
      type: Boolean,
      default: true
    },
    hasDivider: {
      type: Boolean,
      default: true
    },
    multiSort: {
      type: Boolean,
      default: false
    },
    useParamUrl: {
      type: Boolean,
      default: true
    },
    fixedLeftCount: {
      type: [String, Number],
      default: 2
    },
    fixedRightCount: {
      type: [String, Number],
      default: 1
    },
    autoFixedAction: {
      type: Boolean,
      default: true
    },
    defaultPagination: {
      type: Object,
      default: (): object => ({
        sortBy: ["created_at"],
        sortDesc: [true]
      })
    },
    showChart: {
      type: Boolean,
      default: true
    },
    selectable: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      items: [],
      total: 0,
      loading: false,
      pagination: {
        sortBy: [],
        sortDesc: [],
        multiSort: false
      },
      options: {},
      keyword: "",
      startIndex: 0,
      shownColumns: [],
      columnDrawer: false,
      debounceFetchData: null,
      selectedItems: []
    };
  },
  computed: {
    scrollSettings() {
      return {
        maxScrollbarLength: 160
      };
    },
    fixedLeftCountShow() {
      return this.fixedLeftCount + (this.selectable ? 1 : 0);
    },
    fixedRightCountShow() {
      if (this.autoFixedAction && this.fixedRightCount === 0) {
        if (this.rowActions) {
          return 1;
        } else {
          return 0;
        }
      } else {
        return typeof this.fixedRightCount === "string"
          ? parseInt(this.fixedRightCount)
          : this.fixedRightCount;
      }
    },
    pageQuery() {
      const query = this.$route.query;
      query.t = undefined;
      return query;
    },
    isPermissionEdit() {
      // if (this.pageName) {
      //   return this.$can(`${this.pageName}.${ACTIONS.EDIT}`);
      // }
      return true;
    },
    isPermissionDelete() {
      // if (this.pageName) {
      //   return this.$can(`${this.pageName}.${ACTIONS.DELETE}`);
      // }
      return true;
    },
    cssVars() {
      const cssProps = {};
      let marginLeft = this.selectable ? 65 : 0;
      let marginRight = 0;
      const fixedLeftCount =
        typeof this.fixedLeftCount === "string"
          ? parseInt(this.fixedLeftCount, 10)
          : this.fixedLeftCount;
      const fixedRightCount =
        typeof this.fixedRightCount === "string"
          ? parseInt(this.fixedRightCount, 10)
          : this.fixedRightCount;
      const increment = this.selectable ? 2 : 1;
      if (this.selectable) {
        cssProps["--col-1-left"] = "0px";
      }
      for (let i = 0; i < fixedLeftCount; i++) {
        const columnWidth = this.tableHeaders[i]?.width;
        cssProps[`--col-${i + increment}-left`] = marginLeft + "px";
        marginLeft += columnWidth || 64;
      }

      const colCount = this.tableHeaders.length;
      for (let i = 0; i < fixedRightCount; i++) {
        cssProps[`--col-${i + 1}-right`] = marginRight + "px";
        marginRight += +this.tableHeaders[colCount - i - 1]?.width || 64;
      }
      return cssProps;
    },
    params() {
      return {
        ...this.pagination,
        ...this.filter,
        keyword: this.keyword
      };
    },
    filterQuery() {
      return {
        ...this.filter,
        keyword: this.keyword
      };
    },
    originalHeaders() {
      return this.headers.filter(e => {
        return e.visible !== false;
      });
    },
    tableHeaders() {
      let headers = this.headers.filter(e => {
        return this.shownColumns.includes(e.value) && e.visible !== false;
      });

      let actionRow = headers.slice().find(header => header.actions);
      actionRow = this.filterAction(actionRow);
      if (actionRow?.actions?.length === 0) {
        headers = headers.filter(
          header => !header.actions || header.actions.length > 0
        );
      }

      if (this.hasIndex) {
        headers = [
          {
            text: "STT",
            value: "stt",
            align: "center",
            width: 64,
            sortable: false,
            class: "sticky-left"
          },
          ...headers
        ];
      }

      return headers;
    },
    noDataText() {
      if (this.loading) {
        return "Đang tải dữ liệu, vui lòng đợi trong giây lát.";
      } else {
        return "Không tìm thấy bản ghi.";
      }
    },
    indexedItems() {
      if (this.hasIndex) {
        return this.items.map((e, index) => {
          return {
            stt: this.startIndex + index + 1,
            ...e
          };
        });
      } else {
        return this.items;
      }
    },
    footerProps() {
      return {
        "show-first-last-page": true,
        "show-current-page": true,
        "items-per-page-options": [10, 20, 50, 100],
        "items-per-page-text": "Số bản ghi mỗi trang",
        "page-text": "{0}-{1} trong {2}"
      };
    },
    rowActions() {
      return this.tableHeaders.find(header => header.actions);
    }
  },

  watch: {
    pageQuery: {
      async handler(newVal, oldVal) {
        if (!isEqualDeep(newVal, oldVal)) {
          await this.getPageQuery();
          await this.$nextTick();
        }
      },
      deep: true
    },
    params(newVal, oldVal) {
      if (!isEqual(newVal, oldVal)) {
        this.loading = true;
        if (newVal.page === oldVal.page) {
          this.pagination.page = 1;
        }
        this.debounceFetchData();
      }
    },
    filterQuery: {
      handler(newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          // this.clearSelected();
          this.$emit("change-filter", newVal);
        }
      },
      deep: true
    },
    headers(val) {
      if (isArray(val)) {
        this.shownColumns = val.map(e => e.value);
      } else {
        this.shownColumns = [];
      }
    },
    tableHeaders(val) {
      this.$emit("change-table-headers", val);
    },
    value: {
      handler(val) {
        this.selectedItems = val;
      },
      deep: true
    },
    selectedItems: {
      handler(val) {
        this.$emit("input", val);
      },
      deep: true
    }
  },
  created() {
    this.shownColumns = this.headers.map(e => e.value);
    this.debounceFetchData = debounce(function(this: any) {
      if (this.useParamUrl) {
        const query = { ...this.params };

        this.$router.replace({ query });
      }
      this.fetchData();
    }, 1000);
    this.pagination = this.defaultPagination;
  },
  async mounted() {
    if (this.pageName) {
      await fetchPermissionToStorage({
        namePage: this.pageName,
        app: this,
        $auth: this.$auth
      });
    }

    if (this.useParamUrl) {
      this.getPageQuery();
      await this.$nextTick();
    } else {
      // this.fetchData();
    }
  },
  methods: {
    filterAction(actionRow) {
      if (actionRow?.actions) {
        {
          const editAction = actionRow.actions.find(
            action => action.event === "edit-item"
          );
          if (editAction && !editAction.visible) {
            editAction.visible = this.visibleEdit;
          }
        }

        {
          const deleteAction = actionRow.actions.find(
            action => action.event === "delete-item"
          );
          if (deleteAction && !deleteAction.visible) {
            deleteAction.visible = this.visibleDelete;
          }
        }
      }
      return actionRow;
    },

    visibleEdit(item) {
      if (!item?.item_permissions) {
        return true;
      } else {
        return item.item_permissions?.includes("edit");
      }
    },
    visibleDelete(item) {
      if (!item?.item_permissions) {
        return true;
      } else {
        return item.item_permissions?.includes("delete");
      }
    },
    changeSearch(val) {
      if (!isEqual(val, this.keyword)) {
        this.keyword = val;
      }
    },

    async getPageQuery() {
      const { query } = this.$route;
      const pagination = {};
      this.$set(this, "keyword", query.keyword ? query.keyword : "");
      await this.$nextTick();
      Object.keys(this.pagination).forEach(key => {
        if (query[key] && typeof query[key] !== "object") {
          switch (key) {
            case "itemsPerPage":
            case "page":
              pagination[key] = +query[key];
              break;
            case "sortBy":
            case "sortDesc":
              if (Array.isArray(query[key])) {
                pagination[key] = query[key];
              } else {
                pagination[key] = [query[key]];
              }
              break;
            default:
              pagination[key] = query[key] === "true";
          }
        }
      });
      this.pagination = { ...this.pagination, ...pagination };
    },

    async fetchData() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(
          `${this.resource}/listing`,
          this.params
        );
        this.total = data.total;
        this.items = data.data;
        this.startIndex =
          (this.pagination.page - 1) * this.pagination.itemsPerPage || 0;

        this.loading = false;
        if (this.startIndex >= this.total && this.pagination.page > 1) {
          this.pagination.page = Math.ceil(
            this.total / this.pagination.itemsPerPage
          );
          await this.$nextTick();
          this.fetchData();
        }
      } catch (e) {
        this.loading = false;
        this.items = [];
      }
      this.$emit("fetched-data");
      this.loading = false;
    },

    async refresh(toFirstPage = false) {
      if (toFirstPage) {
        this.pagination.page = 1;
      }
      await this.$nextTick();
      this.clearSelected();
      this.debounceFetchData();
    },

    changeColumns() {
      this.columnDrawer = true;
    },

    selectItem(item) {
      if (this.selectable) {
        this.selectedItems = xorBy(this.selectedItems, [item], "id");
      }
    },

    clearSelected() {
      this.selectedItems = [];
    },

    clearSearch() {
      this.keyword = "";
    },

    // getActionClass(action, item) {
    //   if (action.class) {
    //     if (typeof action.class === "function") {
    //       return action.class(item);
    //     }
    //     return action.class;
    //   }
    //   return "";
    // },

    getActionByItem(action, item, prop) {
      if (action[prop]) {
        if (typeof action[prop] === "function") {
          return action[prop](item);
        }
        return action[prop];
      }
      return undefined;
    }
    // handleSelectAll(){
    //
    // }
  }
});

export type ApiDataTableRef = InstanceType<typeof ApiDataTable>;
export default ApiDataTable;
</script>
<style lang="scss">
.v-data-table-with-action
  > .v-data-table__wrapper
  > table
  > tbody
  > tr
  > td:last-child,
.v-data-table-with-action
  > .v-data-table__wrapper
  > table
  > thead
  > tr
  > th:last-child {
  &:last-of-type {
    position: sticky !important;
    position: -webkit-sticky !important;
    right: 0;
    z-index: 1;
  }
}

.v-data-table {
  .v-progress-linear,
  .v-progress-linear__buffer,
  .v-progress-linear__background {
    z-index: 5 !important;
  }

  table {
    .v-data-table__progress {
      & > th {
        z-index: 10 !important;
      }
    }

    .checkbox-select {
      min-width: 32px;
      width: 32px;
    }
  }
}

@for $i from 1 through 5 {
  .table-fixed-left-#{$i} {
    tbody {
      tr {
        @for $j from 1 through $i {
          td:nth-child(#{$j}) {
            position: sticky !important;
            position: -webkit-sticky !important;
            left: var(--col-#{$j}-left);
            z-index: 1;
          }
        }
      }
    }

    thead {
      tr {
        @for $j from 1 through $i {
          th:nth-child(#{$j}) {
            position: sticky !important;
            position: -webkit-sticky !important;
            left: var(--col-#{$j}-left);
            z-index: 1;
          }
        }
      }
    }
  }
  .table-fixed-right-#{$i} {
    tbody {
      tr {
        @for $j from 1 through $i {
          td:nth-last-child(#{$j}) {
            position: sticky !important;
            position: -webkit-sticky !important;
            right: var(--col-#{$j}-right);
            z-index: 1;
          }
        }
      }
    }

    thead {
      tr {
        @for $j from 1 through $i {
          th:nth-last-child(#{$j}) {
            position: sticky !important;
            position: -webkit-sticky !important;
            right: var(--col-#{$j}-right);
            z-index: 1;
          }
        }
      }
    }
  }
  .theme--light {
    .table-fixed-left-#{$i} {
      tbody {
        tr {
          td:nth-child(#{$i}) {
            border-right: thin solid rgba(0, 0, 0, 0.12);
          }

          td:nth-child(#{$i + 1}) {
            border-left: none;
          }
        }
      }

      thead {
        tr {
          th:nth-child(#{$i}) {
            border-right: thin solid rgba(0, 0, 0, 0.12);
          }

          th:nth-child(#{$i + 1}) {
            border-left: none;
          }
        }
      }
    }

    .table-fixed-right-#{$i} {
      tbody {
        tr {
          td:nth-last-child(#{$i}) {
            border-left: thin solid rgba(0, 0, 0, 0.12);
          }

          td:nth-last-child(#{$i + 1}) {
            border-right: none;
          }
        }
      }

      thead {
        tr {
          th:nth-last-child(#{$i}) {
            border-left: thin solid rgba(0, 0, 0, 0.12);
          }

          th:nth-last-child(#{$i + 1}) {
            border-right: none;
          }
        }
      }
    }
  }
  .theme--dark {
    .table-fixed-left-#{$i} {
      tbody {
        tr {
          td:nth-child(#{$i}) {
            border-right: thin solid rgba(255, 255, 255, 0.12);
          }

          td:nth-child(#{$i + 1}) {
            border-left: none;
          }
        }
      }

      thead {
        tr {
          th:nth-child(#{$i}) {
            border-right: thin solid rgba(255, 255, 255, 0.12);
          }

          th:nth-child(#{$i + 1}) {
            border-left: none;
          }
        }
      }
    }

    .table-fixed-right-#{$i} {
      tbody {
        tr {
          td:nth-last-child(#{$i}) {
            border-left: thin solid rgba(255, 255, 255, 0.12);
          }

          td:nth-last-child(#{$i + 1}) {
            border-right: none;
          }
        }
      }

      thead {
        tr {
          th:nth-last-child(#{$i}) {
            border-left: thin solid rgba(255, 255, 255, 0.12);
          }

          th:nth-last-child(#{$i + 1}) {
            border-right: none;
          }
        }
      }
    }
  }
}

.theme--light {
  .v-data-table {
    table {
      tbody {
        tr {
          td {
            background-color: #fff;
            border-right: thin solid rgba(0, 0, 0, 0.12);
          }

          &:hover {
            td {
              background-color: #eeeeee;
            }
          }
        }
      }

      thead {
        tr {
          th {
            background-color: #fff;
            border-right: thin solid rgba(0, 0, 0, 0.12);
          }
        }
      }
    }
  }
}

.v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
.v-data-table > .v-data-table__wrapper > table > tbody > tr > th,
.v-data-table > .v-data-table__wrapper > table > thead > tr > td,
.v-data-table > .v-data-table__wrapper > table > thead > tr > th,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > td,
.v-data-table > .v-data-table__wrapper > table > tfoot > tr > th {
  //padding: 4px 8px !important;
  overflow-wrap: anywhere;
}

.theme--dark {
  .v-data-table {
    table {
      tbody {
        tr {
          td {
            background-color: #1f1f1f;
            border-right: thin solid rgba(255, 255, 255, 0.12);
          }

          &:hover {
            td {
              background-color: #616161;
            }
          }
        }
      }

      thead {
        tr {
          th {
            background-color: #1f1f1f;
            border-right: thin solid rgba(255, 255, 255, 0.12);
          }
        }
      }
    }
  }
}

.v-data-table__wrapper {
  &::-webkit-scrollbar {
    position: sticky !important;
    bottom: 20px;
    width: 0.8em;
    height: 0.8em;
  }

  &::-webkit-scrollbar-thumb {
    background: #aaa;
    border-radius: 0.8em;
    //box-shadow: inset 2px 2px 2px hsl(0deg 0% 100% / 25%),
    //  inset -2px -2px 2px rgb(0 0 0 / 25%);
  }

  &::-webkit-scrollbar-track {
    background-color: #eee;
  }
}
</style>
