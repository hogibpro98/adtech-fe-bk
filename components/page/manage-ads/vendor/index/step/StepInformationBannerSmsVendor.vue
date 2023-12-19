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
          label="Tên quảng cáo"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12>
        <select-type-m-m-s
          v-model="innerValue.sms_type"
          :disabled="!!smsTemplate"
          :attach="attachDropdown"
          name="sms_type"
          label="Loại quảng cáo"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <sms-vendor-template-select
          v-model="innerValue.template"
          :query-params="paramQueryBrandName"
          :attach="attachDropdown"
          name="sms_vendor_template"
          lable="Template tin nhắn ngoại mạng"
          :loading="loading"
          :return-object="false"
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
        <business-cat-select
          v-model="innerValue.cat_id"
          :attach="attachDropdown"
          :disabled="!!smsTemplate"
          :query-params="paramQueryBrandName"
          name="cat_id"
          :return-object="false"
          type="sms"
          label="Lĩnh vực hoạt động"
          required
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
        <v-text-area-appendable-with-validation
          v-model="innerValue.content"
          :dynamic="innerValue.content_type"
          :disabled="!!smsTemplate"
          name="Nội dung"
          label="Nội dung"
          required
          rules="required|max:1000"
          :tooltip-mess="'Thêm trường động'"
          :dialog-title="'Thêm trường động'"
        />
      </v-flex>
      <!--      <v-flex xs12 class="mt-2">-->
      <!--        <div v-if="telcoConfig.length > 0">-->
      <!--          Số tin nhắn trong nội dung sms {{ smsCount }} tin nhắn-->
      <!--        </div>-->
      <!--        <div v-else class="warning&#45;&#45;text">-->
      <!--          Không có cầu hình nào có tên Viettel-->
      <!--        </div>-->
      <!--      </v-flex>-->
    </v-flex>
    <v-flex sm6 class="form-group pl-2 mt-6">
      <preview-banner-m-m-s
        :display-size="displaySize"
        :loading="loading"
        :header="innerValue.content"
        :banner-name="bannerName"
        class="mt-4"
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
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
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
import TimeRangeInput from "~/components/common/TimeRangeInput.vue";
import ScheduleInput from "~/components/common/ScheduleInput.vue";
import SmsVendorTemplateSelect from "~/components/select/SmsVendorTemplateSelect.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import VTextAreaAppendableWithValidation from "~/components/common/VTextAreaAppendableWithValidation.vue";
import BusinessCatSelect from "~/components/select/BusinessCatSelect.vue";

interface ComponentData {
  IMAGE: Array<string>;
  VIDEO: Array<string>;
  AUDIO: Array<string>;
  DATA_TYPE: Array<DataSelectInterface>;
  dateRange: Array<object>;
  innerValue: BannerMMSInterface;
  config: ConfigMMSInterface;
}

interface ComponentMethod {
  getConfig(): void;
}

const StepInformationBannerSmsVendor = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepInformationBannerSmsVendor",
  components: {
    BusinessCatSelect,
    VTextAreaAppendableWithValidation,
    FileUpload,
    SmsVendorTemplateSelect,
    ScheduleInput,
    SelectTypeMMS,
    PreviewBannerMMS,
    BrandnameSelect,
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
      telcoConfig: []
    };
  },
  computed: {
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
          this.innerValue.sms_type = val.sms_type;
        }
      },
      deep: true
    }
  },
  created() {
    // this.getTelcoConfig();
    this.getConfig();
    this.setStartTime();
    this.setEndTime();
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    setStartTime() {
      this.dateRange[0] = this.innerValue?.start_time;
    },
    setEndTime() {
      this.dateRange[1] = this.innerValue?.end_time;
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
    // async getTelcoConfig() {
    //   try {
    //     const telcoConfig = await this.$axios.post("/telco/detail", {
    //       name: "Viettel"
    //     });
    //     console.log(telcoConfig);
    //     this.telcoConfig = JSON.parse(
    //       telcoConfig.data.data.count_msg_length.config
    //     );
    //     console.log(this.telcoConfig);
    //   } catch (e) {
    //     if (e.response && e.response.status === HTTP_CODE_422) {
    //       this.$toast.global.server_error_msg(
    //         responseErrorToString(e.response.data.errors)
    //       );
    //     } else {
    //       this.$toast.global.action_fail();
    //       console.log(e);
    //     }
    //   }
    // }
  }
});

export default StepInformationBannerSmsVendor;
export type StepInformationBannerSmsVendorRef = InstanceType<
  typeof StepInformationBannerSmsVendor
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
