<template>
  <v-row
    id="step-information-banner-sms"
    class="no-margin w-full justify-content-center"
  >
    <v-flex sm6 class="form-group pr-3 mt-0">
      <v-flex xs12>
        <v-text-field-with-validation
          v-model="innerValue.name"
          :counter="255"
          :disabled="!!innerValue.id"
          name="name"
          label="Tên tin nhắn"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12>
        <select-type-m-m-s
          v-model="innerValue.sms_type"
          :disabled="!!innerValue.id"
          :attach="attachDropdown"
          name="sms_type"
          label="Loại quảng cáo"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <sms-template-select
          v-model="innerValue.template"
          :query-params="paramQueryBrandName"
          :disabled="!!smsTemplate"
          :attach="attachDropdown"
          name="sms_template"
        />
      </v-flex>
      <v-flex xs12>
        <brandname-select
          v-model="innerValue.brandname"
          :query-params="paramQueryBrandName"
          :disabled="!!smsTemplate"
          :attach="attachDropdown"
          name="brandname"
          label="Brandname"
          required
          rules="required"
        ></brandname-select>
      </v-flex>
      <v-flex xs12>
        <business-activity-select
          v-model="innerValue.cat_id"
          :attach="attachDropdown"
          :query-params="paramQueryBrandName"
          :disabled="!!smsTemplate"
          name="cat_id"
          type="sms"
          label="Lĩnh vực hoạt động"
          required
          :return-object="false"
          rules="required"
          item-value="name"
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <date-range-picker-flat
          v-model="dateRange"
          :config-props="{
            maxDate: maxTimePicker,
            minDate: minTimePicker
          }"
          :attach="true"
          name="date-range"
          label="Thời gian quảng cáo"
          required
          rules="required"
          model-format="YYYY-MM-DD HH:mm:ss"
          dense
          hide-details
          clearable
          auto-hide
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <schedule-input
          v-model="innerValue.schedule"
          label="Khoảng thời gian gửi tin"
          required
          name
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-checkbox
          v-model="innerValue.content_type"
          :label="'Tin nhắn động'"
          class="ma-0 pa-0 pt-2"
          :disabled="!!smsTemplate"
        >
        </v-checkbox>
      </v-flex>
      <v-flex v-if="innerValue.content_type" xs12 class="mt-2">
        <file-upload
          v-model="innerValue.params_file"
          :accept="DOCUMENT_CSV_TXT"
          :max-file-size="30"
          height="7rem"
          name="params_file"
          class="form-upload"
          label="File targeting tin nhắn động"
        >
        </file-upload>
        <a href="/targeting/templates/template_params.txt" download>
          Tải file mẫu
        </a>
      </v-flex>

      <v-flex xs12 class="mt-2">
        <div v-if="innerValue.content_type">
          <v-text-area-appendable-with-validation
            v-model="innerValue.content"
            required
            rules="required"
            :loading="loading"
            :disabled="!!smsTemplate"
            name="content"
            placeholder="Nhập nội dung"
            filled
            label="Nội dung chữ"
            rows="3"
            dynamic
            can-insert-link
            :tooltip-mess="'Thêm trường động'"
            :dialog-title="'Thêm trường động'"
          >
          </v-text-area-appendable-with-validation>
        </div>
        <div v-else>
          <v-text-area-appendable-with-validation
            v-model="innerValue.content"
            required
            :loading="loading"
            :disabled="!!smsTemplate"
            name="content"
            can-insert-link
            placeholder="Nhập nội dung"
            filled
            label="Nội dung chữ"
            rows="3"
            :rules="rules"
          >
          </v-text-area-appendable-with-validation>
        </div>
      </v-flex>
      <v-flex xs12 class="mt-2">
        <div v-if="!checkTelcoConfig">
          <div v-if="telcoConfig.length > 0">
            Số tin nhắn đang sử dụng: {{ smsCount }}
          </div>
          <div v-else class="warning--text">
            Không có cầu hình nào có tên Viettel
          </div>
        </div>
        <div v-else class="warning--text">
          Đang lấy cấu hình!
        </div>
      </v-flex>
    </v-flex>
    <v-flex sm6 class="form-group pl-2 mt-6">
      <preview-banner-sms
        :display-size="displaySize"
        :loading="loading"
        :header="innerValue.content"
        :banner-name="bannerName"
        class="mt-4"
        :is-show="isShow"
      />
    </v-flex>
  </v-row>
</template>
<script lang="ts">
import DateRangePickerFlat from "@/components/common/DateRangePickerFlat.vue";
import TimePickerFlat from "@/components/common/TimePickerFlat.vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation.vue";
import ContentMMSWithValidation from "@/components/page/manage-campaign/banner/common/ContentMMSWithValidation.vue";
import PreviewBannerMMS from "@/components/page/manage-campaign/banner/common/PreviewBannerMMS.vue";
import BrandnameSelect from "@/components/select/BrandnameSelect.vue";
import { CODE_SUCCESS, DOT, HTTP_CODE_422, THREE_DOTS } from "@/constants/code";
import { BANNER_MMS_CONTENT_TYPE, DAY_SELECT } from "@/constants/dataSelect";
import { AUDIO, DOCUMENT_CSV_TXT, IMAGE, VIDEO } from "@/constants/fileType";
import wrapper from "@/mixins/wrapper";
import { flatten, isEqual } from "lodash";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import SelectTypeMMS from "~/components/page/manage-campaign/banner/common/SelectTypeMMS";
import { convertPeriodTimeToArray } from "~/util/time";
import { isEmpty } from "~/util/typeof";
import {
  BannerMMSInterface,
  ConfigMMSInterface
} from "~/interface/data/banner";
import { DataSelectInterface } from "~/interface/data/dataSelect";
import { responseErrorToString } from "~/util/array";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import TimeRangeInput from "~/components/common/TimeRangeInput.vue";
import ButtonSelect from "~/components/common/ButtonSelect.vue";
import ScheduleInput from "~/components/common/ScheduleInput.vue";
import SmsTemplateSelect from "~/components/select/SmsTemplateSelect.vue";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import VTextAreaAppendableWithValidation from "~/components/common/VTextAreaAppendableWithValidation.vue";
import PreviewBannerSms from "~/components/page/manage-campaign/banner/common/PreviewBannerSms.vue";

interface ComponentData {
  IMAGE: Array<string>;
  VIDEO: Array<string>;
  AUDIO: Array<string>;
  DATA_TYPE: Array<DataSelectInterface>;
  dateRange: Array<object>;
  innerValue: BannerMMSInterface;
  config: ConfigMMSInterface;
  telcoConfig: object;
  formatContent: String;
}

interface ComponentMethod {
  getConfig(): void;
}

const StepInformationBannerSms = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepInformationBannerSms",
  components: {
    PreviewBannerSms,
    VTextAreaAppendableWithValidation,
    FileUpload,
    SmsTemplateSelect,
    VTextAreaWithValidation,
    SmsTemplateSelect,
    ScheduleInput,
    ButtonSelect,
    TimeRangeInput,
    BusinessActivitySelect,
    SelectTypeMMS,
    ContentMMSWithValidation,
    PreviewBannerMMS,
    BrandnameSelect,
    TimePickerFlat,
    DateRangePickerFlat,
    VTextFieldWithValidation
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    displaySize: {
      type: Object,
      default: () => ({
        width: 300,
        height: 200,
        image_src: null
      })
    },
    value: {
      type: Object,
      required: true
    },
    attachDropdown: {
      type: Boolean,
      default: true
    },
    isShow: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      IMAGE,
      VIDEO,
      AUDIO,
      DOCUMENT_CSV_TXT,
      DATA_TYPE: BANNER_MMS_CONTENT_TYPE,
      dateRange: [this.value.start_time, this.value.end_time],
      innerValue: {},
      config: {},
      dayItems: DAY_SELECT,
      telcoConfig: [],
      checkTelcoConfig: false,
      counterSpecialCharacter: 1,
      maxLengthSms: null,
      specialCharacters: "",
      numCharacter: 0
    };
  },
  computed: {
    rules() {
      return `required|compareGreaterValue:${this.maxLengthSms},${this.maxContent}`;
    },
    maxContent() {
      const contents = this.innerValue.content || "";
      const numSpecials = this.countSpecialCharacters(contents) || 0;
      let numThreeDots = 0;
      const special_characters = this.specialCharacters.split(",");
      if (this.hasThreeDots(special_characters)) {
        numThreeDots = this.countThreeDotsContents(contents);
      }
      const result =
        (numSpecials + numThreeDots) * this.counterSpecialCharacter +
        (contents.length - numSpecials - numThreeDots * 3);
      return result;
    },
    content() {
      return this.innerValue.content;
    },
    smsCount() {
      let count = 1;
      let totalChar = 0;
      for (let i = 0; i < this.telcoConfig.length; i++) {
        totalChar += this.telcoConfig[i].sms_length;
        if (
          this.innerValue.content &&
          this.innerValue?.content.length > totalChar
        ) {
          count++;
        }
      }
      return count;
    },
    periodTime() {
      return convertPeriodTimeToArray(this.dateRange);
    },
    periodProps() {
      return [this.innerValue.start_time, this.innerValue.end_time];
    },
    bannerName() {
      return this.innerValue?.brandname?.name;
    },
    campaign() {
      return this.innerValue.campaign || {};
    },
    smsTemplate() {
      return this.innerValue.template;
    },
    paramQueryBrandName() {
      if (this.campaign) {
        if (this.campaign.advertiser_id) {
          return {
            custom_user_id: this.campaign.advertiser_id
          };
        } else if (this.campaign.agency_id) {
          return {
            custom_user_id: this.campaign.agency_id
          };
        }
      }
      return {};
    },
    minTimePicker() {
      const startTimeInit = this.innerValue.start_time_init;
      const { start_time: startTime } = this.campaign;
      let timeMin =
        new Date(startTime) < Date.now() || !startTime ? Date.now() : startTime;
      if (
        !isEmpty(this.innerValue?.id) &&
        startTimeInit &&
        startTimeInit < timeMin
      ) {
        timeMin = startTimeInit;
      }

      return moment(timeMin)
        .startOf("day")
        .toDate()
        .getTime();
    },
    maxTimePicker() {
      const { end_time: endTime } = this.campaign;
      const timeMax = endTime < Date.now() ? Date.now() : endTime;
      if (endTime) {
        return moment(timeMax)
          .endOf("day")
          .toDate()
          .getTime();
      }

      return undefined;
    },
    startTimeProps() {
      return this.innerValue.start_time;
    },
    endTimeProps() {
      return this.innerValue.end_time;
    },
    contentType() {
      return this.innerValue?.content_type;
    }
  },
  watch: {
    startTimeProp() {
      this.setStartTime();
    },
    endTimeProp() {
      this.setEndTime();
    },
    dateRange(val) {
      const [start, end] = val;
      this.innerValue.start_time = start;
      this.innerValue.end_time = end;
    },

    smsTemplate: {
      handler(val) {
        if (val) {
          this.innerValue.brandname = val.brandname;
          this.innerValue.content = val.content;
          this.innerValue.content_type = val.content_type;
          this.innerValue.cat_id = val.cat_id;
          this.innerValue.tempid = val.tempid;
        }
      },
      deep: true
    }
  },
  created() {
    this.getTelcoConfig();
    this.getConfig();
    this.setStartTime();
    this.setEndTime();
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    countSpecialCharacters(contents) {
      let count = 0;
      const specialCharsArray = this.specialCharacters.split(",");
      for (let i = 0; i < contents.length; i++) {
        if (specialCharsArray.includes(contents[i])) {
          count++;
        }
      }
      return count;
    },
    hasThreeDots(specials) {
      return specials.some(item => item === THREE_DOTS);
    },
    countThreeDotsContents(contents) {
      let count = 0;
      for (let i = 0; i < contents.length; i++) {
        if (
          contents[i - 1] !== DOT &&
          contents[i] === DOT &&
          i < contents.length - 2
        ) {
          if (
            contents[i + 1] === DOT &&
            contents[i + 2] === DOT &&
            contents[i + 3] !== DOT
          ) {
            count++;
            i += 2;
          }
        }
      }
      return count;
    },
    setStartTime() {
      this.dateRange[0] = this.innerValue?.start_time;
    },
    setEndTime() {
      this.dateRange[1] = this.innerValue?.end_time;
    },
    async getTelcoConfig() {
      try {
        this.checkTelcoConfig = true;
        const { data } = await this.$axios.post("/telco/detail", {
          name: "Viettel"
        });
        const { count_msg_length } = data.data;
        this.telcoConfig = JSON.parse(count_msg_length.config);
        this.maxLengthSms = count_msg_length.max_length;
        this.specialCharacters = count_msg_length.special_character;
        this.counterSpecialCharacter = count_msg_length.count_special_character;
      } catch (e) {
        this.checkTelcoConfig = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
      this.checkTelcoConfig = false;
    },
    async getConfig() {
      try {
        const config = await this.$adsConfigRepository.post();
        if (config.code === CODE_SUCCESS) {
          this.config = config.data;
        } else {
          this.$toast.global.server_error_msg(config.message);
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
    }
  }
});

export default StepInformationBannerSms;
export type StepInformationBannerSmsRef = InstanceType<
  typeof StepInformationBannerSms
>;
</script>

<style lang="scss">
.form-upload {
  .v-transmit__upload-area {
    min-height: unset;
    height: 144px;
  }
}
</style>
