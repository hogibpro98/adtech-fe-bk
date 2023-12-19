<template>
  <v-row
    id="step-information-banner-mms"
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
          v-model="innerValue.mms_type"
          :counter="255"
          :disabled="!!innerValue.id"
          name="mms_type"
          label="Loại tin nhắn"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12>
        <mms-template-select
          v-model="innerValue.template"
          :query-params="paramQueryBrandName"
          :readonly="!!mmsTemplate"
          :attach="attachDropdown"
          name="mms_template"
        />
      </v-flex>
      <v-flex xs12>
        <brandname-select
          v-model="innerValue.brandname"
          :query-params="paramQueryBrandName"
          :readonly="!!mmsTemplate"
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
          :readonly="!!mmsTemplate"
          name="cat_id"
          label="Lĩnh vực hoạt động"
          required
          type="mms"
          :query-params="paramQueryBrandName"
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
          attach="#step-information-banner-mms"
          name="date-range"
          label="Thời gian diễn ra"
          required
          rules="required"
          dense
          model-format="YYYY-MM-DD HH:mm:ss"
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
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="mt-2">
        <v-row no-gutters class="mt-4">
          <v-checkbox
            v-model="innerValue.content_type"
            :label="'Tin nhắn động'"
            class="ma-0 pa-0 pt-2"
            :disabled="!!mmsTemplate"
          >
          </v-checkbox>
        </v-row>
        <v-flex v-if="contentType" xs12 class="mt-2">
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
        <div>
          <v-text-field-with-validation
            v-model="innerValue.header"
            :disabled="!!mmsTemplate"
            name="header"
            label="Header"
          />
        </div>
      </v-flex>
      <v-flex sm12 class="mt-4">
        <content-m-m-s-with-validation
          v-model="innerValue.content"
          :disabled="!!mmsTemplate"
          name="content-mms"
          label="Nội dung tin nhắn MMS"
          required
          rules="required"
          :dynamic="contentType"
        />
      </v-flex>
      <v-flex sm12 class="mt-4">
        <v-checkbox
          v-model="innerValue.has_backup"
          name="has_backup"
          :label="'Sử dụng SMS Backup'"
          :false-value="0"
          :true-value="1"
          class="ma-0 pa-0 pt-2 "
        >
        </v-checkbox>
      </v-flex>

      <v-flex v-if="innerValue.has_backup" sm12 class="mt-4">
        <back-up-sms
          v-model="innerValue.backup_sms"
          :content-type="innerValue.content_type"
          name="backup-sms"
          label="Nội dung tin nhắn SMS Backup"
          required
          rules="required"
        />
      </v-flex>
    </v-flex>
    <v-flex sm6 class="form-group pl-2 mt-6">
      <preview-banner-m-m-s
        :display-size="displaySize"
        :loading="loading"
        :header="innerValue.header"
        :banner-name="bannerName"
        :media-data="innerValue.content"
        :media-type="innerValue.media_type"
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
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import TimeRangeInput from "~/components/common/TimeRangeInput.vue";
import ButtonSelect from "~/components/common/ButtonSelect.vue";
import ScheduleInput from "~/components/common/ScheduleInput.vue";
import MmsTemplateSelect from "~/components/select/MmsTemplateSelect.vue";
import VTextAreaAppendableWithValidation from "~/components/common/VTextAreaAppendableWithValidation.vue";
import BackUpSms from "~/components/page/manage-campaign/banner/common/BackUpSms.vue";
import FileUpload from "~/components/common/FileUpload/index.vue";
import deepWrapper from "~/mixins/deepWrapper";

interface ComponentData {
  IMAGE: Array<string>;
  VIDEO: Array<string>;
  AUDIO: Array<string>;
  DATA_TYPE: Array<DataSelectInterface>;
  dateRange: Array<object>;
  innerValue: BannerMMSInterface;
  config: ConfigMMSInterface;
  backupSms: boolean;
}

interface ComponentMethod {
  getConfig(): void;
}

const StepInformationBannerMMS = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepInformationBannerMMS",
  components: {
    FileUpload,
    BackUpSms,
    MmsTemplateSelect,
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
    VTextFieldWithValidation,
    VTextAreaAppendableWithValidation
  },
  mixins: [deepWrapper],
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
      default: false
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
      dayItems: DAY_SELECT
    };
  },
  computed: {
    periodTime() {
      return convertPeriodTimeToArray(this.dateRange);
    },
    periodProps() {
      return [this.innerValue.start_time, this.innerValue.end_time];
    },
    bannerName() {
      return this.innerValue?.brandname?.name;
    },
    contentType() {
      return this.innerValue?.content_type;
    },
    campaign() {
      return this.innerValue.campaign || {};
    },
    mmsTemplate() {
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
    hasBackupSms() {
      return this.innerValue.has_backup;
    }
  },
  watch: {
    mmsTemplate: {
      handler(val) {
        if (val) {
          this.innerValue.brandname = val.brandname;
          this.innerValue.content = val.content;
          this.innerValue.header = val.mms_header;
          this.innerValue.cat_id = val.cat_id;
          this.innerValue.tempid = val.tempid;
          this.innerValue.content_type = val.content_type;
        }
      },
      deep: true
    },
    dateRange(val) {
      const [start, end] = val;
      this.innerValue.start_time = start;
      this.innerValue.end_time = end;
    },
    startTimeProp() {
      this.setStartTime();
    },
    endTimeProp() {
      this.setEndTime();
    }
  },
  created() {
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
  }
});

export default StepInformationBannerMMS;
export type StepInformationBannerMMSRef = InstanceType<
  typeof StepInformationBannerMMS
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
