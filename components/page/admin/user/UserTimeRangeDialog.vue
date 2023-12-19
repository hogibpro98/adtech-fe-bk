<template>
  <v-dialog
    id="time-range-dialog"
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    persistent
    min-width="400"
    max-width="600"
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">Truy cập dữ liệu</span>
      </v-card-title>
      <v-card-text>
        Chọn khoảng thời gian mà người dùng
        <span class="red--text"> {{ item.username }} </span>
        được truy vấn trong báo cáo
      </v-card-text>
      <v-card-text>
        <validation-observer ref="form" v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(onSubmit)">
            <v-layout flex wrap>
              <v-flex xs12>
                <date-range-picker-flat
                  v-model="dateRange"
                  name="date-range"
                  label="Thời gian truy cập"
                  dense
                  model-format="YYYY-MM-DD HH:mm:ss"
                  hint="Không giới hạn nếu bỏ trống"
                  persistent-hint
                  clearable
                  auto-hide
                />
              </v-flex>
              <v-layout justify-end>
                <v-btn color="grey" text @click.native="showing = false"
                  >Hủy
                </v-btn>
                <v-btn
                  :loading="loading"
                  color="primary darken-1"
                  class="mr-0"
                  text
                  type="submit"
                >
                  Xác nhận
                </v-btn>
              </v-layout>
            </v-layout>
          </form>
        </validation-observer>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import {
  DialogInterface,
  FormDialogInterface
} from "~/interface/components/dialog";
import DateRangePickerFlat from "~/components/common/DateRangePickerFlat.vue";

const DEFAULT_ITEM = {
  id: null,
  username: ""
};

const UserTimeRangeDialog = (Vue as VueConstructor<
  Vue & DialogInterface & FormDialogInterface
>).extend({
  name: "UserTimeRangeDialog",
  components: { DateRangePickerFlat },
  data() {
    return {
      showing: false,
      item: cloneDeep(DEFAULT_ITEM),
      loading: false,
      timeout: null,
      dateRange: []
    };
  },

  watch: {
    // brandnameParams(val) {
    //   this.brandnames = this.item.
    // },
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    async show(item) {
      this.item = cloneDeep(item);
      this.showing = true;
      await this.$nextTick();
      this.fetchData();
    },

    resetData() {
      this.timeout = setTimeout(() => {
        this.item = cloneDeep(DEFAULT_ITEM);
        this.dateRange = [];
        this.$refs.form.reset();
      }, 300);
    },

    async fetchData() {
      this.loading = true;
      await this.$nextTick();
      this.dateRange = null;
      const param = {
        id: this.item.id
      };
      try {
        const res = await this.$userRepository.post(
          "get-report-time-range",
          param
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          await this.$nextTick();
          this.dateRange = [res.data.start_time, res.data.end_time];
          await this.$nextTick();
        }
      } catch (e) {
        this.loading = false;
      }
    },

    async onSubmit() {
      this.loading = true;
      const data = {
        id: this.item.id,
        start_time: this.dateRange[0],
        end_time: this.dateRange[1]
      };
      try {
        const res = await this.$userRepository.post(
          "set-report-time-range",
          data
        );
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.showing = false;
          this.$emit("action-success");
          this.$toast.global.edit_success(
            "thời gian dữ liệu báo cáo cho người dùng"
          );
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.form.setErrors(e.response.data.errors);
        }
      }
    }
  }
});
export default UserTimeRangeDialog;
export type UserTimeRangeDialogRef = InstanceType<typeof UserTimeRangeDialog>;
</script>
