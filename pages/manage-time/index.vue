<template>
  <v-container>
    <v-layout justify-center>
      <v-flex xs12 md8 lg6>
        <v-card>
          <v-overlay v-if="loading" absolute color="#fff" class="z-1">
            <v-progress-circular
              :width="4"
              :size="25"
              indeterminate
              color="primary"
            >
            </v-progress-circular>
          </v-overlay>
          <v-card-title>
            Cấu hình thời gian tổng hợp
          </v-card-title>
          <validation-observer ref="form" v-slot="{ handleSubmit }">
            <form
              class="form-input background"
              @submit.prevent="handleSubmit(apply)"
            >
              <div v-if="time_config.length > 0">
                <div v-for="(item, index) in time_config" class="time-item">
                  <v-layout
                    align-center
                    justify-space-between
                    class="px-4 pt-2"
                  >
                    <span class="text-display-name">{{ item.name }}</span>
                  </v-layout>
                  <v-layout align-center justify-space-between class="px-4">
                    <span>
                      Trạng thái
                    </span>
                    <v-switch v-model="item.status"></v-switch>
                  </v-layout>
                  <v-layout align-center justify-space-between class="px-4">
                    <span>
                      Thời gian
                    </span>
                    <time-picker-flat
                      v-model="item.times"
                      :name="`start_hour_${index}`"
                      :config-props="configProps"
                      attach
                      dense
                      required
                      :rules="
                        `required|timeLTE:end_hour_${index},1|timeGTE:end_hour_${index -
                          1},1`
                      "
                      hide-details
                      clearable
                      auto-hide
                    />
                  </v-layout>
                </div>
              </div>
              <div v-else>
                <v-layout justify-center>
                  <v-btn
                    color="primary darken-1"
                    text
                    @click="handleLogConfig"
                  >
                    Lấy cấu hình thời gian mặc định
                  </v-btn>
                </v-layout>

              </div>

              <v-card-actions>
                <v-layout justify-end>
                  <v-btn
                    color="primary darken-1"
                    text
                    :disabled="loading"
                    @click.prevent="handleSubmit(apply)"
                  >
                    Áp dụng
                  </v-btn>
                </v-layout>
              </v-card-actions>
            </form>
          </validation-observer>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>
<script lang="ts">
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import GlobalDataInterface from "~/interface/data/global";
import { ConfigSystemInterface } from "~/interface/data/config";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { responseErrorToString } from "~/util/array";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import FrequencyInputWithValidation from "~/components/common/FrequencyInputWithValidation.vue";
import TimePickerFlat from "~/components/common/TimePickerFlat.vue";

interface ComponentData extends GlobalDataInterface {
  configs: object;
  loading: boolean;
  $systemConfigRepository: RepositoryInterface;
}

interface ComponentMethods {
  fetchConfig(): void;

  apply(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    FrequencyInputWithValidation,
    VNumberFieldWithValidation,
    TimePickerFlat
  },
  layout: "dashboard",
  data() {
    return {
      configs: {
        value: null
      },
      loading: false,
      time_config: {},
      configProps: {
        dateFormat: "H:i"
      }
    };
  },
  computed: {
    canEdit() {
      return this.$pageCan("edit");
    }
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      this.loading = true;
      const { data } = await this.$axios.$post("/report-total-config/listing");
      this.configs = data[0];
      if (data.length > 0){
        this.time_config = data[0].value;
      }
      this.loading = false;
    },

    async apply() {
      this.loading = true;
      this.configs.value = this.time_config;
      const data = cloneDeep(this.configs);
      try {
        const res = await this.$axios.$post("report-total-config/update", data);
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Lưu thành công.");
          this.$store.dispatch("config/timeConfig");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
      this.loading = false;
    },
    async handleLogConfig(){
      this.loading = true;
      try {
        const res = await this.$axios.$post("report-total-config/update");
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Cập nhật thành công");
          this.configs = res.data;
          this.time_config = res.data.value;
          this.$store.dispatch("config/timeConfig");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
      this.loading = false;
    }
  }
});
</script>
<style scoped>
.text-display-name {
  font-size: 1.1rem;
  font-weight: 500;
}
.time-item {
  background-color: #f9f9f9;
  margin-top: 10px;
}
</style>
