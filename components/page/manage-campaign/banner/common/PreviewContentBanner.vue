<template>
  <v-flex xs12>
    <v-row class="no-margin">
      <v-list-item-content class="pa-0">
        <div class="max-width-35">
          <preview-banner
            :display-size="displaySize"
            :loading="loading"
            :data="innerValue"
            :media-data="innerValue.media"
            :media-type="mediaType"
          />
        </div>
      </v-list-item-content>
    </v-row>
    <banner-edit-information-dialog
      ref="refEditBannerInformationDialog"
      @submit="onSaveData"
    />
  </v-flex>
</template>
<script lang="ts">
import PreviewBanner from "@/components/page/manage-campaign/banner/common/PreviewBanner";
import BannerEditInformationDialog, {
  BannerEditInformationDialogRef
} from "@/components/page/manage-campaign/banner/dialog-edit-step/BannerEditInformationDialog.vue";
import wrapper from "@/mixins/wrapper";
// @ts-ignore
import moment from 'moment/src/moment';
import Vue, { VueConstructor } from "vue";
import { isEqual } from "lodash";
import { ToastInterface } from "~/interface/plugin/toast";
import { BannerRedirectInterface } from "~/interface/data/banner";
import { GlobalDataInterface } from "~/interface/data/global";
import { isArray } from "~/util/typeof";

interface ComponentData extends GlobalDataInterface {
  innerValue: BannerRedirectInterface;
  $refs: {
    refEditBannerInformationDialog: BannerEditInformationDialogRef;
  };
  $toast: ToastInterface;
}

interface ComponentMethod {
  openDialogEditInformationBanner(): void;
  onSaveData(item: BannerRedirectInterface, cb: Function): void;
}

const PreviewContentBanner = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "PreviewContentBanner",
  components: {
    BannerEditInformationDialog,
    PreviewBanner
  },
  mixins: [wrapper],
  props: {
    displaySize: {
      type: Object,
      default: () => ({
        width: 300,
        height: 200,
        image_src: null
      })
    },
    loading: {
      type: Boolean,
      default: false
    },
    mediaType: {
      type: String,
      default: ""
    },
    readonly: {
      type: Boolean,
      required: false
    }
  },
  data() {
    return {
      innerValue: {},
      mediaData: {
        text: null,
        slider: null,
        image: {},
        video: {},
        embed: null,
        audio: {
          data: null,
          thumbnail: {}
        }
      }
    };
  },
  computed: {
    innerValueMedia() {
      return this.innerValue.media;
    },
    media() {
      return this.mediaData[this.mediaType];
    },
    width() {
      return this.displaySize.width || 300;
    },
    height() {
      return this.displaySize.height || 200;
    },
    scale() {
      return Math.floor((this.height * 100) / this.width);
    },
    url() {
      return this.displaySize.image_src;
    },
    mediaIsExists() {
      return (
        this.mediaData && this.mediaData.length > 0 && this.mediaData[0].data
      );
    },
    dataSingle() {
      return (this.mediaData && this.mediaData[0]) || {};
    },
    mediaTypeName() {
      const mediaType = this.innerValue.media_type;
      switch (mediaType) {
        case "slider":
          return "Trình chiếu";
        case "video":
          return "Video";
        case "text":
          return "Văn bản";
        case "audio":
          return "Audio";
        case "image":
        default:
          return "Hình ảnh";
      }
    },
    dateRunAds() {
      const startTime = this.innerValue.start_time;
      const endTime = this.innerValue.end_time;

      if (!startTime || !endTime) return "";

      const date1 = moment(startTime)
        .format("DD/MM/YYYY")
        .toString();
      const date2 = moment(endTime)
        .format("DD/MM/YYYY")
        .toString();
      if (date1 !== date2) {
        return `Từ ${date1} đến ${date2}`;
      } else {
        return date1;
      }
    },
    timeSend() {
      return `Từ ${this.innerValue.start_hour} đến ${this.innerValue.end_hour}`;
    },
    brandname() {
      return (
        (this.innerValue.brandname && this.innerValue.brandname.name) || ""
      );
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
    }
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
    openDialogEditInformationBanner() {
      this.$refs.refEditBannerInformationDialog.show(this.innerValue);
    },
    onSaveData(item, cb) {
      this.innerValue = item;
      if (cb) {
        cb();
      }
    }
  }
});

export default PreviewContentBanner;
export type PreviewContentBannerRef = InstanceType<typeof PreviewContentBanner>;
</script>
