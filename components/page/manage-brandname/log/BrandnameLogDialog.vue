<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    persistent
    content-class="flex xs12 lg8"
    :scrollable="true"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span v-if="item.brandname" class="headline"
          >Chi tiết thay đổi brandname
          <span class="info--text">{{ item.brandname.name }}</span> ngày
          <span class="info--text"> {{ item.date }}</span>
        </span>
        <span v-if="item.brandname_request" class="headline"
          >Chi tiết thay đổi brandname request
          <span class="info--text">{{ item.brandname_request.name }}</span>
          ngày
          <span class="info--text"> {{ item.date }}</span>
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
import Vue from "vue";
import { cloneDeep, escape } from "lodash";

const Diff = require("diff");

interface ComponentData {
  showing: boolean;
  item: object;
  ACTION_MAP: object;
  PROP_MAP: object;
}
interface ComponentMethods {
  show(item: object): void;
  renderTime(value: any): any;
  diff(oldText: string, newText: string): void;
  renderDiff(diffs: any): string;
  renderChanges(item: object): string;
}
interface ComponentComputed {
  title: string;
}
interface ComponentProps {}

const BrandnameLogDialog = Vue.extend<
  ComponentData,
  ComponentMethods,
  ComponentComputed,
  ComponentProps
>({
  name: "BrandnameLogDialog",
  data() {
    return {
      showing: false,
      item: {},
      STATUS_MAP: {
        created: {
          color: "default",
          text: "Chờ phê duyệt"
        },
        creating: {
          color: "warning",
          text: "Đang xử lý"
        },
        reject: {
          color: "error",
          text: "Từ chối phê duyệt"
        },
        approve: {
          color: "success",
          text: "Đã phê duyệt"
        },
        active: {
          color: "success",
          text: "Đang sử dụng"
        },
        inactive: {
          text: "Đã khóa",
          color: "warning"
        }
      },
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
        },
        running: {
          color: "success",
          icon: "play_arrow",
          text: "Chạy"
        },
        stop: {
          color: "error",
          icon: "stop",
          text: "Dừng"
        },
        pause: {
          color: "warning",
          icon: "pause",
          text: "Tạm dừng"
        }
      },
      PROP_MAP: {
        name: {
          text: "tên brandname"
        },
        maintain_fee: {
          text: "phí duy trì",
          filter: "currency"
        },
        price_mms: {
          text: "đơn giá mms",
          filter: "currency"
        },
        expire_time: {
          text: "ngày hết hạn",
          filter: "date"
        },
        user_id: {
          text: "Mã người dùng"
        },
        advertiser_id: {
          text: "Mã advertiser"
        },
        status: {
          text: "trạng thái",
          map: {
            created: "Chờ phê duyệt",
            creating: "Đang xử lý",
            reject: "Từ chối phê duyệt",
            approve: "Đã phê duyệt",
            active: "Đang sử dụng",
            inactive: "Đã khóa"
          }
        },
        business_activity_id: {
          text: "lĩnh vực hoạt động"
        },
        start_time: {
          text: "thời gian bắt đầu",
          filter: "date"
        },
        business_name: {
          text: "tên doanh nghiệp"
        },
        documents: {
          text: "tài liệu kèm theo"
        }
      }
    };
  },
  watch: {
    showing(val) {
      if (val) {
        this.$emit("shown");
      }
    }
  },
  methods: {
    show(item) {
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
        if (this.item.brandname) {
          return `${action} brandname`;
        } else {
          return `${action} brandname request`;
        }
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
            oldVal = escape(change[e].old);
            const diffs = this.diff(change[e].old, change[e].new);
            newVal = this.renderDiff(diffs);
          }
          msg += `- Thay đổi <strong>${renderObj.text}</strong> ${
            !oldVal ? "" : "từ <strong>" + oldVal + "</strong>"
          } ${!newVal ? "" : "thành <strong>" + newVal} </strong><br/>`;
        }
      });
      return msg;
    }
  }
});

export default BrandnameLogDialog;
export type BrandnameLogDialogRef = InstanceType<typeof BrandnameLogDialog>;
</script>

<style scoped></style>
