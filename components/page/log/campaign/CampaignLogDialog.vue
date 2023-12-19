<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    persistent
    content-class="flex xs12 lg8"
    :scrollable="false"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">
          <span v-if="item.campaign" class="headline">
            Chi tiết thay đổi chiến dịch
            <span class="info--text">{{ item.campaign.name }}</span> ngày
            <span class="info--text">{{ item.date }}</span>
          </span>
        </span>
      </v-card-title>
      <v-card-actions class="px-4">
        <v-timeline dense clippe class="w-full">
          <template v-if="item.change && item.change.length > 0">
            <v-timeline-item
              v-for="(value, index) in item.change"
              :key="`${index}`"
              :color="
                ACTION_MAP[value.action_type]
                  ? ACTION_MAP[value.action_type].color
                  : 'primary'
              "
            >
              <template #icon>
                <v-tooltip bottom>
                  <template #activator="{ on, attrs }">
                    <v-icon color="white" v-bind="attrs" v-on="on">
                      {{
                        ACTION_MAP[value.action_type]
                          ? ACTION_MAP[value.action_type].icon
                          : "edit"
                      }}
                    </v-icon>
                  </template>
                  <span>{{
                    ACTION_MAP[value.action_type]
                      ? ACTION_MAP[value.action_type].text
                      : "Cập nhật"
                  }}</span>
                </v-tooltip>
              </template>
              <v-row wrap justify="space-between" class="ma-0">
                <v-col cols="8">
                  <div>
                    <strong>{{ value.user.username }}</strong>
                  </div>
                  <div v-html="renderChanges(value)"></div>
                </v-col>
                <v-col
                  cols="3"
                  class="flex justify-content-end row align-items-center"
                >
                  {{ renderTime(value) }}
                </v-col>
              </v-row>
            </v-timeline-item>
          </template>
        </v-timeline>
      </v-card-actions>

      <v-card-actions>
        <v-layout justify-end>
          <v-btn color="grey" text @click.native="showing = false">Đóng</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
// google DiffMatchPatch
// @ts-ignore
import Vue, { VueConstructor } from "vue";
import CodeMirror from "codemirror";
import { cloneDeep, escape } from "lodash";

interface ComponentData {
  showing: boolean;
}

interface ComponentMethods {
  show(newData: any, oldData: any): void;

  refresh(): void;
}

const CampaignLogDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CampaignLogDialog",
  props: {},
  data() {
    return {
      timeout: 0,
      showing: false,
      item: {},
      ACTION_MAP: {
        edit: {
          color: "primary",
          icon: "edit",
          text: "Cập nhật"
        },
        add: {
          color: "success",
          icon: "add",
          text: "Thêm mới"
        },
        delete: {
          color: "error",
          icon: "delete",
          text: "Xóa"
        }
      },
      PROP_MAP: {
        status: {
          text: "trạng thái",
          map: {
            running: "đang chạy",
            waiting: "chờ chạy",
            pause: "tạm dừng",
            stop: "đã dừng chạy"
          }
        },
        budget: {
          text: "tổng ngân sách",
          filter: "currency"
        },
        remain_budget_create_ads: {
          text: "ngân sách còn lại",
          filter: "currency"
        },
        start_time: {
          text: "thời gian bắt đầu",
          filter: "timestamp"
        },
        end_time: {
          text: "thời gian kết thúc",
          filter: "timestamp"
        }
      }
    };
  },
  computed: {
    title() {
      const date = this.$filters.date(this.item?.date);
      return `Chi tiết thay đổi chiến dịch ${this.item?.campaign?.name} ngày ${date}`;
    }
  },
  watch: {
    showing(val) {
      if (val) {
        this.$emit("shown");
      }
    }
  },
  methods: {
    async show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
    },
    renderTime(value) {
      const time = value.created_at;
      return time.replace(this.item.date, "") || "";
    },

    renderChanges(item) {
      if (item.action_type === "add") {
        return `Thêm mới chiến dịch`;
      }
      if (item.action_type === "delete") {
        return `Xoá chiến dịch`;
      }
      const change =
        typeof item.modify_description === "object"
          ? item.modify_description
          : JSON.parse(item.modify_description);
      let msg = "";
      Object.keys(change).forEach(e => {
        let oldVal = change[e].old;
        let newVal = change[e].new;
        if (this.PROP_MAP[e]) {
          const renderObj = this.PROP_MAP[e];
          if (renderObj.filter) {
            oldVal =
              this.$filters[renderObj.filter](change[e].old) || change[e].old;
            newVal =
              this.$filters[renderObj.filter](change[e].new) || change[e].new;
          }
          if (renderObj.map) {
            oldVal = renderObj.map[change[e].old] || change[e].old;
            newVal = renderObj.map[change[e].new] || change[e].new;
          }
          msg += `- Thay đổi ${renderObj.text} ${
            !oldVal ? "" : "từ " + escape(oldVal)
          } ${!newVal ? "" : "thành " + escape(newVal)}. <br/>`;
        }
      });
      return msg;
    }
  }
});

export default CampaignLogDialog;
export type CampaignLogDialogRef = InstanceType<typeof CampaignLogDialog>;
</script>
<style>
.CodeMirror-scroll * {
  white-space: pre-wrap;
}
</style>
