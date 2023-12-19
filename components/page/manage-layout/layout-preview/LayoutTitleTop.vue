<template>
  <div class="layout-title-top" :style="styleComponent">
    <div class="layout-title" :style="styleTitle">
      {{ dataSample.title }}
    </div>
    <div class="layout-media" :style="styleImage">
      <v-img
        v-if="dataSample.media && fileTypeByUrl === 'image'"
        :src="dataSample.media"
        :alt="dataSample.title"
        :aspect-ratio="aspectRatio"
        contain
      />
      <div
        v-else-if="dataSample.media && fileTypeByUrl === 'video'"
        :style="cssVars"
        class="video-container"
      >
        <video
          :title="dataSample.media"
          :aspect-ratio="aspectRatio"
          class="video"
          controls
          autoplay
          width="100%"
          muted
          loop
        >
          <source :src="dataSample.media" />
          Your browser does not support the video tag.
        </video>
      </div>
      <div
        v-else-if="dataSample.media && fileTypeByUrl === 'audio'"
        class="preview-wrapper"
      >
        <img
          v-if="dataSample.thumbnail"
          :src="dataSample.thumbnail"
          :aspect-ratio="aspectRatio"
          :width="width"
          :height="height"
          class="preview-wrapper"
          alt="preview-wrapper"
        />
        <v-img
          v-else
          :src="'/default/default-image.png'"
          :alt="dataSample.title"
          :aspect-ratio="aspectRatio"
        />
        <audio
          controls
          :title="dataSample.media"
          class="preview-wrapper w-full mt-auto"
        >
          <source :src="dataSample.media" />
          <p>Your browser doesn't support HTML5 video</p>
        </audio>
      </div>
      <v-img
        v-else
        :src="'/default/default-image.png'"
        :alt="dataSample.title"
        :aspect-ratio="aspectRatio"
      />
    </div>
    <div class="layout-description" :style="styleDescription">
      {{ dataSample.description }}
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { objectToStyle } from "~/util/object";
import {
  DATA_ADS_LAYOUT_PREVIEW,
  STYLE_IMAGE_DEFAULT
} from "~/constants/default";
import { URL_AUDIO_REGEX, URL_IMAGE_REGEX, URL_VIDEO_REGEX } from '~/constants/regex';

const LayoutTitleTop = (Vue as VueConstructor).extend({
  name: "LayoutTitleTop",
  props: {
    data: {
      type: Object,
      default: () => ({})
    },
    dataSample: {
      type: Object,
      default: () => DATA_ADS_LAYOUT_PREVIEW
    }
  },
  data: () => ({
    objectToStyle
  }),
  computed: {
    cssVars() {
      return {
        "--padding-top": `${100 / this.aspectRatio}%`
      };
    },
    fileTypeByUrl() {
      const url = this.dataSample.media;
      if (!url) {
        return "other";
      } else if (URL_IMAGE_REGEX.test(url)) {
        return "image";
      } else if (URL_VIDEO_REGEX.test(url)) {
        return "video";
      } else if (URL_AUDIO_REGEX.test(url)) {
        return "audio";
      } else {
        return "other";
      }
    },
    styleComponent() {
      const style = cloneDeep(this.data?.style_component || {});
      return this.objectToStyle(style);
    },
    styleImage() {
      const style = cloneDeep(this.data?.style_image || {});
      if (style.width_value && style.width_unit) {
        style.width = `${style.width_value}${style.width_unit}`;
      } else {
        style.width = `40%`;
      }
      return this.objectToStyle(style);
    },
    aspectRatio() {
      const aspect_ratio =
        this.data?.style_image?.aspect_ratio ||
        STYLE_IMAGE_DEFAULT.aspect_ratio;
      const [aspectRatio] = aspect_ratio.split(":");
      return Number.parseFloat(aspectRatio);
    },
    styleTitle() {
      const style = cloneDeep(this.data?.style_title || {});
      return this.objectToStyle(style);
    },
    styleDescription() {
      const style = cloneDeep(this.data?.style_description || {});
      return this.objectToStyle(style);
    }
  }
});

export default LayoutTitleTop;
export type LayoutTitleTopRef = InstanceType<typeof LayoutTitleTop>;
</script>

<style lang="scss" scoped>
.layout-title-top {
  display: block;
  font-size: 0;
  line-height: 0;
  overflow: hidden;
  padding: 0;
  border-style: solid;

  .layout-title {
    color: #212121;
    display: block;
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    overflow: hidden;
    padding: 0 0 10px 0;
    text-align: left;
  }

  .layout-description {
    color: #757575;
    display: block;
    font-size: 12px;
    font-weight: 300;
    line-height: 15px;
    padding: 0 0 10px 0;
    text-align: left;
  }

  .layout-media {
    display: block;
    float: left;
    font-size: 0;
    line-height: 0;
    overflow: hidden;
    padding: 0 15px 5px 0;
  }
}
</style>
