<template>
  <v-row class="no-margin w-full">
    <v-flex sm6 class="form-group pr-3 mt-0">
      <v-flex xs12>
        <v-text-field-with-validation
          v-model="innerValue.name"
          :disabled="!!innerValue.id"
          :counter="255"
          name="name"
          label="Tên quảng cáo"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <date-range-picker-flat
          v-model="dateRange"
          :config-props="{
            maxDate: endTimeCampaign,
            minDate: startTimeCampaign
          }"
          name="date-range-banner"
          label="Thời gian chạy quảng cáo"
          rules="required"
          required
          dense
          model-format="YYYY-MM-DD HH:mm:ss"
          hide-details
          clearable
          auto-hide
        />
      </v-flex>
      <v-flex xs12>
        <v-number-field-with-validation
          v-model="innerValue.max_per_ip"
          label="Số lượt hiển thị tối đa"
          name="max_per_ip"
          hint="Số lượt hiển thị quảng cáo tối đa trên 1 IP"
          persistent-hint
          rules="numeric"
        />
      </v-flex>
      <v-flex xs12>
        <type-display-ads-select
          v-model="innerValue.ads_type"
          :attach="false"
          name="display_type"
          label="Loại hiển thị quảng cáo"
          required
          rules="required"
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-text-field-with-validation
          v-model="innerValue.title"
          :counter="255"
          name="title"
          label="Tiêu đề quảng cáo"
          required
          rules="required|max:255"
        />
      </v-flex>
      <v-flex xs12 class="mt-4">
        <v-text-area-with-validation
          v-model="innerValue.description"
          :counter="255"
          name="description"
          label="Mô tả quảng cáo"
          required
          rules="required|max:255"
        />
      </v-flex>

      <v-flex xs12>
        <api-select-with-validation
          v-if="mediaType === 'video'"
          :key="`file-upload-${mediaType}`"
          v-model="innerValue.threshold_obj"
          name="threshold"
          label="Loại video"
          :attach="false"
          item-text="name"
          item-value="threshold"
          :resource="'/ads-video-type'"
          required
          rules="required"
        />
      </v-flex>

      <v-flex xs12 class="mt-2 form-upload">
        <template v-if="mediaType === 'embed'">
          <div :key="`file-upload-${mediaType}`">
            <v-text-field-with-validation
              v-model="mediaData.embed"
              :loading="loading"
              name="media-embed"
              type="text"
              label="URL media"
              required
              rules="required|url|isEmbed"
            />
          </div>
        </template>
        <template v-if="mediaType === 'image'">
          <div :key="`file-upload-${mediaType}`">
            <file-upload
              v-model="mediaData.image.landscape"
              :accept="IMAGE"
              label="Ảnh hiển thị (1.91:1)"
              name="media-image-landscape"
              rules="required"
              required
            />
            <file-upload
              v-model="mediaData.image.square"
              :accept="IMAGE"
              label="Ảnh hiển thị (1:1)"
              name="media-image-square"
              rules="required"
              required
            />
          </div>
        </template>
        <template v-if="mediaType === 'video'">
          <file-upload
            :key="`file-upload-${mediaType}`"
            v-model="mediaData.video.landscape"
            :accept="VIDEO"
            name="media-image-landscape"
            label="Video hiển thị (1.91:1)"
            rules="required"
            required
          />
          <file-upload
            :key="`file-upload-${mediaType}`"
            v-model="mediaData.video.square"
            :accept="VIDEO"
            name="media-image-square"
            label="Video hiển thị (1:1)"
            rules="required"
            required
          />
        </template>
        <template v-if="mediaType === 'slider'">
          <file-upload
            :key="`file-upload-${mediaType}`"
            v-model="mediaData[mediaType]"
            :accept="IMAGE"
            :maximum="5"
            name="media"
            label="Danh sách ảnh hiển thị (tối đa 5 ảnh)"
          />
        </template>
        <template v-if="mediaType === 'audio'">
          <file-upload
            :key="`file-upload-${mediaType}-audio`"
            v-model="mediaData[mediaType].data"
            :accept="AUDIO"
            label="Audio"
            name="media-image-square"
            rules="required"
            required
          />
          <file-upload
            :key="`file-upload-${mediaType}-image`"
            v-model="mediaData.audio.thumbnail.landscape"
            :accept="IMAGE"
            label="Ảnh thumb audio (1.91:1)"
            name="media-image-landscape"
            rules="required"
            required
          />
          <file-upload
            :key="`file-upload-${mediaType}-image`"
            v-model="mediaData.audio.thumbnail.square"
            :accept="IMAGE"
            label="Ảnh thumb audio (1:1)"
            name="media-image-square"
            rules="required"
            required
          />
        </template>
      </v-flex>
    </v-flex>
    <v-flex sm6 class="form-group pl-2 mt-6">
      <preview-banner
        :display-size="displaySize"
        :loading="loading"
        :media-data="innerValue.media"
        :media-type="mediaType"
        :data="innerValue"
      />
    </v-flex>
  </v-row>
</template>
<script lang="ts">
import DateRangePickerFlat from "@/components/common/DateRangePickerFlat";
import FileUpload from "@/components/common/FileUpload/index";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation";
import PreviewBanner from "@/components/page/manage-campaign/banner/common/PreviewBanner";
import TypeDisplayAdsSelect from "@/components/select/TypeDisplayAdsSelect";
import { AUDIO, IMAGE, VIDEO } from "@/constants/fileType";
import wrapper from "@/mixins/wrapper";
import { isEqual } from "lodash";
import ApiSelectWithValidation from "@/components/common/ApiSelectWithValidation";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import { convertPeriodTimeToArray } from "~/util/time";
import { isArray, isEmpty } from "~/util/typeof";
import {
  BannerMMSInterface,
  BannerRedirectInterface
} from "~/interface/data/banner";
import { DataSelectInterface } from "~/interface/data/dataSelect";
import VTextAreaWithValidation from "~/components/common/VTextAreaWithValidation.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";

interface ComponentData {
  IMAGE: Array<string>;
  VIDEO: Array<string>;
  AUDIO: Array<string>;
  innerValue: BannerMMSInterface | BannerRedirectInterface;
  dateRange: Array<object>;
  mediaData: Array<DataSelectInterface>;
}

interface ComponentMethod {
  handleMediaSlider(value: Array<object>): Array<object>;
  handleMediaAudio(value: Array<object>): Array<object>;
  handleMediaDefault(value: Array<object>): Array<object>;
}

const StepInformationBanner = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "StepInformationBanner",
  components: {
    VNumberFieldWithValidation,
    VTextAreaWithValidation,
    ApiSelectWithValidation,
    DateRangePickerFlat,
    VTextFieldWithValidation,
    PreviewBanner,
    FileUpload,
    TypeDisplayAdsSelect
  },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
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
      innerValue: {},
      dateRange: [this.value.start_time, this.value.end_time],
      mediaData: {
        text: null,
        slider: null,
        embed: null,
        image: {},
        video: {},
        audio: {
          data: null,
          thumbnail: {}
        }
      },
      mediaTypes: [
        {
          text: "Hình ảnh",
          value: "image"
        },
        {
          text: "Video",
          value: "video"
        },
        {
          text: "Audio",
          value: "audio"
        },
        {
          text: "Văn bản",
          value: "text"
        }
      ]
    };
  },
  computed: {
    periodTime() {
      return convertPeriodTimeToArray(this.dateRange);
    },
    periodProps() {
      return [this.innerValue.start_time, this.innerValue.end_time];
    },
    mediaType() {
      return this.innerValue?.ads_type?.media_type;
    },
    media() {
      return this.mediaData[this.mediaType];
    },
    innerValueMedia() {
      return this.innerValue.media;
    },
    displaySize() {
      const displayType = this.value?.ads_type || {};
      const imageTemplates = displayType?.image_templates || [];
      return imageTemplates[0];
    },
    campaign() {
      return this.innerValue.campaign || {};
    },
    startTimeCampaign() {
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
    endTimeCampaign() {
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
    }
  },
  watch: {
    innerValueMedia(newValue, oldValue) {
      if (!isEqual(newValue, oldValue)) {
        switch (this.mediaType) {
          case "slider":
            this.mediaData[this.mediaType] = this.handleMediaSlider(newValue);
            break;
          case "embed":
            const embed = newValue.find(data => data.type === "landscape");
            this.mediaData[this.mediaType] = embed?.data;
            break;
          case "audio":
            if (isArray(newValue)) {
              const landscape = newValue.find(
                data => data.type === "landscape"
              );
              const square = newValue.find(data => data.type === "square");
              const mediaType = newValue.find(
                data => data.type === this.mediaType
              );

              this.mediaData[this.mediaType] = {
                type: this.mediaType,
                thumbnail: {
                  landscape: landscape?.thumbnail || mediaType?.thumbnail,
                  square: square?.thumbnail || mediaType?.thumbnail
                },
                data: landscape?.data || square?.data || mediaType?.data
              };
            } else {
              this.mediaData[this.mediaType] = {
                type: this.mediaType,
                thumbnail: {
                  landscape: "",
                  square: ""
                },
                data: ""
              };
            }
            break;
          case "video":
          case "image":
            if (isArray(newValue)) {
              const landscape = newValue.find(
                data => data.type === "landscape"
              );
              const square = newValue.find(data => data.type === "square");
              const mediaType = newValue.find(
                data => data.type === this.mediaType
              );

              this.mediaData[this.mediaType] = {
                type: this.mediaType,
                landscape: landscape?.data || mediaType?.data,
                square: square?.data || mediaType?.data
              };
            } else {
              this.mediaData[this.mediaType] = {
                type: this.mediaType,
                landscape: "",
                square: ""
              };
            }
            break;
          case "text":
          default:
            this.mediaData[this.mediaType] = this.handleMediaDefault(newValue);
            break;
        }
      }
    },
    media: {
      handler(value) {
        let data = [];
        if (value) {
          switch (this.mediaType) {
            case "embed":
              data = [
                {
                  type: "landscape",
                  data: value
                }
              ];
              break;
            case "slider":
              data = value.map(image => ({
                type: this.mediaType,
                data: image
              }));
              break;
            case "audio":
              data = [
                {
                  type: "landscape",
                  data: value?.data,
                  thumbnail: value?.thumbnail?.landscape
                },
                {
                  type: "square",
                  data: value?.data,
                  thumbnail: value?.thumbnail?.square
                }
              ];
              break;
            case "video":
            case "image":
              data = [
                {
                  type: "landscape",
                  data: value?.landscape
                },
                {
                  type: "square",
                  data: value?.square
                }
              ];
              break;
            case "text":
            default:
              data = [
                {
                  type: this.mediaType,
                  data: value || {}
                }
              ];
              break;
          }
        }
        if (!isEqual(data, this.innerValue.media)) {
          this.innerValue.media = data;
        }
      },
      deep: true
    },
    mediaType(val) {
      if (val !== "video") {
        this.innerValue.threshold_obj = null;
      }
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
    this.setStartTime();
    this.setEndTime();
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    handleMediaSlider(newValue) {
      if (newValue && newValue.length > 0) {
        return newValue.map(v => v.data);
      }
      return null;
    },
    handleMediaDefault(newValue) {
      if (newValue && newValue.length > 0) {
        return newValue?.[0]?.data || {};
      }
      return null;
    },
    setStartTime() {
      this.dateRange[0] = this.innerValue?.start_time;
    },
    setEndTime() {
      this.dateRange[1] = this.innerValue?.end_time;
    }
  }
});

export default StepInformationBanner;
export type StepInformationBannerRef = InstanceType<
  typeof StepInformationBanner
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
