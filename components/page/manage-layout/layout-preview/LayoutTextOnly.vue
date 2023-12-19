<template>
  <div class="layout-text-only" :style="styleComponent">
    <div class="content-wrapper">
      <div class="layout-title" :style="styleTitle">
        {{ dataSample.title }}
      </div>
      <div class="layout-description" :style="styleDescription">
        {{ dataSample.description }}
      </div>
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

const LayoutTextOnly = (Vue as VueConstructor).extend({
  name: "LayoutTextOnly",
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
    styleComponent() {
      const style = cloneDeep(this.data?.style_component || {});
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

export default LayoutTextOnly;
export type LayoutTextOnlyRef = InstanceType<typeof LayoutTextOnly>;
</script>

<style lang="scss" scoped>
.layout-text-only {
  display: block;
  font-size: 0;
  line-height: 0;
  overflow: hidden;
  padding: 0;

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
    overflow: hidden;
    padding: 0 0 10px 0;
    text-align: left;
    white-space: pre-line;
  }
}
</style>
