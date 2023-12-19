<template>
  <v-container grid-list-xl fluid class="no-padding no-margin">
    <v-layout row wrap>
      <v-flex lg12>
        <v-card>
          <api-data-table
            ref="table"
            :resource="resource"
            :headers="headers"
            :filter="searchParams"
            :start-index.sync="startIndex"
            page-name="setting-display-ads-tag"
            calculate-widths
            @approve-item="openDialogApprove"
            @reject-item="rejectDialogApprove"
          >
            <template slot="item.user" slot-scope="{ item }">
              <span v-if="item.user">
                <nuxt-link
                  :to="`/user/${item.user.id}`"
                  class="w-full block"
                  style="max-width: 250px"
                >
                  {{ item.user.full_name }}
                </nuxt-link>
              </span>
              <span v-else>
                Người dùng đã bị xóa
              </span>
            </template>
            <template slot="item.file" slot-scope="props">
              <v-img
                v-if="props.item.file"
                v-img="{ src: props.item.file.url }"
                :lazy-src="props.item.file.url"
                :src="props.item.file.url"
                contain
                height="80"
                max-width="100"
              />
            </template>
            <template slot="item.created_at" slot-scope="{ item }">{{
              item.created_at | timestamp
            }}</template>
            <template slot="item.updated_at" slot-scope="{ item }">
              <span v-if="item.status !== 'created'">
                {{ item.updated_at | timestamp }}
              </span>
            </template>
            <template slot="item.content" slot-scope="{ item }">
              <render-content :content="item.content" />
            </template>
            <template slot="item.user_agent" slot-scope="{ item }">
              <a v-if="item.user_agent" href="javascript:;" @click="showDialogDeviceInformation(item)" class="truncate"
                >Xem chi tiết</a
              >
            </template>
            <template slot="item.status" slot-scope="{ item }">
              <v-chip
                :color="getObjStatusByCode(item.status).color"
                small
                label
                class="w-full d-flex justify-center"
                >{{ getObjStatusByCode(item.status).text }}</v-chip
              >
            </template>
          </api-data-table>
          <v-card-text class="pa-0"> </v-card-text>
          <approve-report-user-dialog
            ref="approveDialog"
            @confirm="refreshTable"
          ></approve-report-user-dialog>
          <reject-report-user-dialog
            ref="rejectDialog"
            @confirm="refreshTable"
          ></reject-report-user-dialog>
          <device-information-user-dialog ref="deviceInformationDialog"></device-information-user-dialog>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { FEEDBACK } from "@/constants/resource";
import { DataTableHeader } from "vuetify";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import ApiDataTable, {
  ApiDataTableRef
} from "~/components/table/ApiDataTable.vue";
import { FilterInterface } from "~/interface/data/filter";
import massDeleteTableWrapper from "~/mixins/massDeleteTableWrapper";
import { USER_REPORT_STATUS } from "~/constants/userReport";
import RenderContent from "~/components/common/Table/RenderContent.vue";
import ApproveReportUserDialog, {
  ApproveReportUserDialogRef
} from "~/components/page/user-report/ApproveReportUserDialog.vue";
import RejectReportUserDialog, {
  RejectReportUserDialogRef
} from "~/components/page/user-report/RejectReportUserDialog.vue";
import DeviceInformationUserDialog, {
  DeviceInformationUserDialogRef
} from '~/components/page/user-report/DeviceInformationUserDialog.vue';

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
    approveDialog: ApproveReportUserDialogRef;
    rejectDialog: RejectReportUserDialogRef;
    deviceInformationDialog: DeviceInformationUserDialogRef;
  };
}

interface ComponentMethods {
  addItem: Function;
  editItem: Function;
  deleteItem: Function;
  getObjStatusByCode: (code: string) => object;
  refreshTable: Function;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    DeviceInformationUserDialog,
    RejectReportUserDialog,
    ApproveReportUserDialog,
    RenderContent,
    ApiDataTable
  },
  layout: "dashboard",
  props: {},
  data() {
    return {
      resource: FEEDBACK,
      searchParams: null,
      headers: [
        {
          text: "Người dùng",
          value: "user",
          width: 120,
          sortable: false
        },
        {
          text: "Thời gian",
          value: "created_at",
          width: 120,
          sortable: false
        },
        {
          text: "Nội dung",
          value: "content",
          width: 250,
          sortable: false
        },
        {
          text: "Ảnh chụp màn hình",
          value: "file",
          width: 200,
          sortable: false
        },
        {
          text: "Trạng thái",
          value: "status",
          width: 120,
          sortable: false
        },
        {
          text: "Thời gian phản hồi",
          value: "updated_at",
          width: 120,
          sortable: false
        },
        {
          text: "URL phản ánh",
          value: "url",
          width: 200,
          sortable: false
        },
        {
          text: "Thiết bị",
          value: "user_agent",
          width: 120,
          sortable: false
        },
        {
          text: "Hành động",
          value: "action",
          width: 120,
          align: "right",
          sortable: false,
          actions: [
            {
              color: "primary",
              icon: "check",
              label: "Phê duyệt",
              visible: this.canReview,
              event: "approve-item"
            },
            {
              color: "error",
              icon: "close",
              label: "Từ chối",
              visible: this.canReview,
              event: "reject-item"
            },
          ]
        }
      ],
      startIndex: 0
    };
  },
  computed: {},
  methods: {
    canReview(item) {
      if (this.$pageCan("edit")) {
        if (item.status === "created") {
          return true;
        }
      }
      return false;
    },
    getObjStatusByCode(code) {
      return USER_REPORT_STATUS.find(status => status.code === code) || {};
    },
    openDialogApprove(item) {
      this.$refs.approveDialog.show(item);
    },
    rejectDialogApprove(item) {
      this.$refs.rejectDialog.show(item);
    },
    showDialogDeviceInformation(item) {
      this.$refs.deviceInformationDialog.show(item.user_agent);
    },
    refreshTable(toFirstPage = false) {
      this.$refs.table.refresh(toFirstPage);
    }
  }
});
</script>
