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
        <span v-if="item.ads" class="headline">
          Chi tiết thay đổi quảng cáo redirect
          <span class="info--text">{{ item.ads.name }}</span> ngày
          <span class="info--text">{{ item.date }}</span>
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
import { cloneDeep, escape } from "lodash";
import { WEEKDAY_MAP } from "~/constants/map";
import ACTION_MAP from "~/constants/actionMap";
const Diff = require("diff");

interface ComponentData {
  showing: boolean;
}

interface ComponentMethods {
  show(newData: any, oldData: any): void;

  diff(oldText: string, newText: string);

  renderDiff(diff);

  renderSchedule(schedule);

  refresh(): void;
}

const RedirectLogDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RedirectLogDialog",
  props: {},
  data() {
    return {
      ACTION_MAP,
      timeout: 0,
      showing: false,
      item: {},
      PROP_MAP: {
        name: {
          text: "tên"
        },
        "metadata.content_type": {
          text: "tin nhắn động",
          map: {
            true: "có",
            false: "không"
          }
        },
        "metadata.mms_type": {
          text: "loại quảng cáo",
          map: {
            0: "CSKH",
            1: "Quảng cáo"
          }
        },
        "metadata.targeting_type": {
          text: "đối tượng mục tiêu",
          map: {
            import_file: "tải file danh sách",
            phone_group: "chọn nhóm thuê bao",
            api: "gửi API",
            targeting: "nhân khẩu học"
          }
        },
        "metadata.target_file": {
          text: "file targeting"
        },
        "metadata.params_file": {
          text: "file trường động"
        },
        status: {
          text: "trạng thái",
          map: {
            running: "đang chạy",
            calculating: "đang tính toán",
            confirming: "chờ xác nhận",
            waiting: "chờ chạy",
            pause: "tạm dừng",
            stop: "đã dừng chạy"
          }
        },
        "metadata.budget": {
          text: "tổng ngân sách",
          filter: "currency"
        },
        start_time: {
          text: "thời gian bắt đầu",
          filter: "date"
        },
        end_time: {
          text: "thời gian kết thúc",
          filter: "date"
        },
        is_default: {
          text: "là quảng cáo mặc định",
          mapFunction: e => {
            return e ? "có" : "không";
          }
        },
        "metadata.max_view_per_day": {
          text: "số impression mỗi ngày",
          filter: "numberSpace"
        },
        "metadata.max_view": {
          text: "số impression tối đa",
          filter: "numberSpace"
        },
        "data_fee.0": {
          text: "targeting tiêu dùng data",
          mapFunction: value => {
            const min = this.$filters.currency(value.min);
            const max = this.$filters.currency(value.max);
            return `từ ${min} đến ${max}`;
          }
        },
        "sim_ages.0": {
          text: "targeting tuổi thuê bao",
          mapFunction: value => {
            const min = this.$filters.numberSpace(value.min);
            const max = this.$filters.numberSpace(value.max);
            return `từ ${min} đến ${max}`;
          }
        }
      }
    };
  },
  computed: {
    title() {
      const date = this.$filters.date(this.item?.date);
      return `Chi tiết thay đổi quảng cáo redirect ${this.item?.ads?.name} ngày ${date}`;
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
    renderSchedule(schedule) {
      let msg = "";
      if (Array.isArray(schedule)) {
        schedule.forEach(e => {
          const days = e.days
            .map(day => {
              return WEEKDAY_MAP[day];
            })
            .sort();
          msg += days.join(", ") + ": ";
          e.times.forEach(time => {
            msg += `Từ ${time.start} đến ${time.end}; `;
          });
        });
      }
      return msg;
    },
    async show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
    },
    renderTime(value) {
      const time = value.created_at;
      return time.replace(this.item.date, "") || "";
    },

    diff(oldText, newText) {
      if (oldText && newText) {
        return Diff.diffWordsWithSpace(oldText, newText);
      }
      return [];
    },
    renderDiff(diffs) {
      let msg = `<br/>`;
      if (Array.isArray(diffs)) {
        diffs.forEach((e, index) => {
          const text = escape(e.value);
          if (e.added) {
            if (diffs[index - 1]?.removed) {
              msg += `<span class="highlight--change">${text}</span>`;
            } else {
              msg += `<span class="highlight--add">${text}</span>`;
            }
          } else if (e.removed) {
            if (!diffs[index + 1]?.added) {
              msg += `<del><span class="highlight--remove">${text}</span></del>`;
            }
          } else {
            msg += text;
          }
        });
      }
      return msg;
    },

    renderChanges(item) {
      if (item.action_type !== "edit") {
        const action = this.ACTION_MAP[item.action_type]?.text;
        return `${action} quảng cáo redirect`;
      }
      const change =
        typeof item.modify_description === "object"
          ? item.modify_description
          : JSON.parse(item.modify_description);
      let msg = "";
      Object.keys(change).forEach(e => {
        let oldVal = escape(change[e].old);
        let newVal = escape(change[e].new);
        if (this.PROP_MAP[e]) {
          const renderObj = this.PROP_MAP[e];
          if (renderObj.filter) {
            oldVal =
              escape(this.$filters[renderObj.filter](change[e].old)) ||
              escape(change[e].old);
            newVal =
              escape(this.$filters[renderObj.filter](change[e].new)) ||
              escape(change[e].new);
          } else if (renderObj.map) {
            oldVal =
              renderObj.map[escape(change[e].old)] || escape(change[e].old);
            newVal =
              renderObj.map[escape(change[e].new)] || escape(change[e].new);
          } else if (renderObj.mapFunction) {
            oldVal =
              renderObj.mapFunction(change[e].old) || escape(change[e].old);
            newVal =
              renderObj.mapFunction(change[e].new, true) ||
              escape(change[e].new);
          } else if (e === "metadata.content") {
            oldVal = JSON.stringify(change[e].old);
            const diffs = this.diff(
              JSON.stringify(change[e].old),
              JSON.stringify(change[e].new)
            );
            newVal = this.renderDiff(diffs);
          } else if (e === "metadata.schedule") {
            oldVal = this.renderSchedule(change[e].old);
            newVal = this.renderSchedule(change[e].new);
            const diffs = this.diff(oldVal, newVal);
            newVal = this.renderDiff(diffs);
          }
          if (oldVal !== newVal) {
            msg += `- Thay đổi <strong>${renderObj.text}</strong> ${
              !oldVal ? "" : "từ <strong>" + oldVal + "</strong>"
            } ${!newVal ? "" : "thành <strong>" + newVal} </strong><br/>`;
          }
        }
      });
      return msg;
    }
  }
});

export default RedirectLogDialog;
export type RedirectLogDialogRef = InstanceType<typeof RedirectLogDialog>;
</script>
<style lang="scss"></style>
