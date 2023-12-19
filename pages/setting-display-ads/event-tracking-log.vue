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
            page-name="setting-display-ads-event-tracking-logs"
            calculate-widths
            @fetched-data="fetchedDataTable"
          >
            <template slot="item.status" slot-scope="{ item }">
              {{ isInvalid(item.status) ? "Thành công" : "Thất bại" }}
            </template>
            <template slot="item.created_at" slot-scope="{ item }"
              >{{ item.created_at | timestamp }}
            </template>
            <v-btn
              slot="search-right"
              color="primary"
              dark
              class="mr-0"
              @click="addItem()"
            >
              <v-icon>add</v-icon> Thêm
            </v-btn>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { TEXT } from "@/constants/filterType";
import { EVENT_TRACKING_LOG } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { EVEN_TRACKING_STATUS } from "~/constants/dataSelect";
import { RepositoryInterface } from "~/interface/plugin/repository";

interface ComponentData {
  showing: boolean;
  timeout: number;
  resource: string;
  headers: Array<DataTableHeader>;
  filters: Array<FilterInterface>;
  searchParams: Array<object>;
  startIndex: number;
  $refs: {
    table: ApiDataTableRef;
  };
  $eventTrackingFormDiaLog: RepositoryInterface;
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  refreshTable: Function;
  loading: object;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
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
      loading: {},
      resource: EVENT_TRACKING_LOG,
      objectName: "event-tracking-logs",
      filters: [
        {
          type: TEXT,
          name: "name",
          label: "Tên"
        }
      ],
      searchParams: null,
      headers: [
        {
          text: "Tên",
          value: "event_trackings.name",
          width: 250,
          sortable: false
        },
        {
          text: "Quảng cáo",
          value: "ads.name",
          width: 200,
          sortable: false
        },
        {
          text: "Zone",
          value: "zones.name",
          width: 250,
          sortable: false
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 150,
          sortable: false
        },
        {
          text: "Lý do",
          value: "problem",
          width: 200,
          sortable: false
        },
        {
          text: "Click ID",
          value: "click_id",
          width: 250,
          sortable: false
        },
        // {
        //   text: "Giá trị",
        //   value: "value",
        //   width: 250,
        //   align: "right",
        //   sortable: false
        // },
        {
          text: "Kiểu thiết bị",
          value: "device_type",
          width: 250,
          sortable: false
        },
        {
          text: "Trình duyệt",
          value: "browser",
          width: 250,
          sortable: false
        },
        {
          text: "Thời gian tạo",
          value: "created_at",
          width: 250,
          sortable: true
        }
      ],
      startIndex: 0
    };
  },
  computed: {
    isLoadingChangeStatus() {
      return Object.keys(this.loading).some(key => !!this.loading[key]);
    }
  },
  methods: {
    renderStatus(item) {
      if (item) {
        return EVEN_TRACKING_STATUS.find(({ value }) => item.status === value);
      }
      return {
        color: "warning",
        value: "pending",
        text: "Khởi tạo"
      };
    },
    isInvalid(value) {
      return value === "VALID";
    },
    fetchedDataTable() {
      this.loading = {};
    }
  }
});
</script>
