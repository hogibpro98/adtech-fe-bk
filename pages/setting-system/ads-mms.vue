<template>
  <v-container class="mx-auto">
    <v-flex flex mt-4 offset-md1 offset-lg2 lg8 md10>
      <v-card class="ma-2">
        <v-card-actions class="pa-4">
          <validation-observer ref="form" class="w-full">
            <v-form @keyup.native.enter="validateAll">
              <v-layout flex wrap>
                <v-flex xs12>
                  <v-card-title class="pa-0 pb-2">
                    Thông tin cấu hình tin nhắn
                  </v-card-title>
                </v-flex>
                <v-flex v-if="configs.message_schedule" xs12 class="px-4">
                  <schedule-input
                    v-model="configs.message_schedule.value"
                    name="message_schedule"
                    :label="configs.message_schedule.display_name"
                    required
                  />
                </v-flex>
                <v-flex
                  v-if="configs.message_restricted_day"
                  xs12
                  class="px-4 mt-4"
                >
                  <multiple-date-picker
                    v-model="configs.message_restricted_day.value"
                    name="message_restricted_day"
                    :label="configs.message_restricted_day.display_name"
                    required
                  />
                </v-flex>
                <v-flex v-if="configs.max_mms_per_day" xs12 class="px-4">
                  <v-number-field-with-validation
                    v-model="configs.max_mms_per_day.value"
                    :loading="loading"
                    name="max_mms_per_day"
                    type="text"
                    :label="configs.max_mms_per_day.display_name"
                    rules="numeric|min_value:0"
                  />
                </v-flex>
                <v-flex v-if="configs.max_time_retry_sms" xs12 class="px-4">
                  <v-number-field-with-validation
                    v-model="configs.max_time_retry_sms.value"
                    :loading="loading"
                    name="max_time_retry_sms"
                    type="text"
                    :label="configs.max_time_retry_sms.display_name"
                    rules="numeric|min_value:0"
                  />
                </v-flex>
              </v-layout>
            </v-form>
          </validation-observer>
        </v-card-actions>
        <v-layout flex wrap class="px-4 pb-4">
          <v-layout justify-end>
            <v-btn
              :loading="loading"
              :disabled="!isUpdateAble"
              color="primary darken-1"
              class="mr-0"
              text
              @click.native="validateAll"
            >
              Cập nhật
            </v-btn>
          </v-layout>
        </v-layout>
      </v-card>
    </v-flex>
  </v-container>
</template>
<script lang="ts">
import TimePickerFlat from "@/components/common/TimePickerFlat.vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import { flatten, isEqual, cloneDeep } from "lodash";
import Vue, { VueConstructor } from "vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ConfigMMSInterface } from "~/interface/data/config";
import { FormInterface } from "~/interface/vee-validate/form";
import { responseErrorToString } from "~/util/array";
import TimeRangeInput from "~/components/common/TimeRangeInput.vue";
import CustomDatePicker from "~/components/common/CustomDatePicker.vue";
import ScheduleInput from "~/components/common/ScheduleInput.vue";
import MultipleDatePicker from "~/components/common/MultipleDatePicker.vue";
import {isEqualDeep} from "~/helpers/ultis";

interface ComponentData {
  loading: boolean;
  information: ConfigMMSInterface;
  configs: ConfigMMSInterface;
  isUpdateAble: boolean;
  $adsConfigRepository: RepositoryInterface;
  $refs: {
    form: FormInterface;
  };
}

interface ComponentMethods {
  getConfig(): void;
  validateAll(): void;
  updateConfig(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    MultipleDatePicker,
    ScheduleInput,
    VNumberFieldWithValidation,
    VTextFieldWithValidation
  },
  layout: "dashboard",
  data() {
    return {
      loading: false,
      information: {},
      configs: {}
    };
  },
  computed: {
    isUpdateAble() {
      return true;
    }
  },
  created() {
    this.fetchConfig();
  },
  methods: {
    async fetchConfig() {
      this.loading = true;
      const { data } = await this.$systemConfigRepository.all();
      data.forEach(e => {
        this.$set(this.configs, e.name, {
          value: e.value,
          display_name: e.display_name
        });
        this.$set(this.information, e.name, {
          value: e.value,
          display_name: e.display_name
        });
      });
      this.loading = false;
    },
    async validateAll() {
      const res = await this.$refs.form.validate();

      if (res && this.isUpdateAble) {
        this.apply();
      }
    },
    async apply() {
      this.loading = true;
      const data = cloneDeep(this.configs);
      try {
        const res = await this.$systemConfigRepository.update(data);
        if (res.code === CODE_SUCCESS) {
          this.$toast.success("Lưu thành công.");
          this.$store.dispatch("config/fetchConfig");
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
