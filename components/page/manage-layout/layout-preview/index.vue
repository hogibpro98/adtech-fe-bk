<template>
  <div class="preview-layout">
    <layout-img-above
      v-if="layoutType === 'layout_img_above'"
      v-bind="$attrs"
      :data="data"
    />
    <layout-img-side
      v-if="layoutType === 'layout_img_side'"
      v-bind="$attrs"
      :data="data"
    />
    <layout-title-top
      v-if="layoutType === 'layout_title_top'"
      v-bind="$attrs"
      :data="data"
    />
    <layout-text-only
      v-if="layoutType === 'layout_text_only'"
      v-bind="$attrs"
      :data="data"
    />
    <layout-img-only
      v-if="layoutType === 'layout_img_only'"
      v-bind="$attrs"
      :data="data"
    />
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import LayoutImgAbove from "~/components/page/manage-layout/layout-preview/LayoutImgAbove.vue";
import LayoutImgSide from "~/components/page/manage-layout/layout-preview/LayoutImgSide.vue";
import LayoutTitleTop from "~/components/page/manage-layout/layout-preview/LayoutTitleTop.vue";
import LayoutTextOnly from "~/components/page/manage-layout/layout-preview/LayoutTextOnly.vue";
import LayoutImgOnly from "~/components/page/manage-layout/layout-preview/LayoutImgOnly.vue";

const LayoutPreview = (Vue as VueConstructor).extend({
  name: "LayoutPreview",
  components: {
    LayoutImgOnly,
    LayoutTextOnly,
    LayoutTitleTop,
    LayoutImgSide,
    LayoutImgAbove
  },
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    layoutType() {
      return this.data?.layout_type;
    }
  }
});

export default LayoutPreview;
export type LayoutPreviewRef = InstanceType<typeof LayoutPreview>;
</script>

<style lang="scss" scoped>
.preview-layout {
}
</style>
