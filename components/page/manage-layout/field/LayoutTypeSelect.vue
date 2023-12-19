<template>
  <div class="left">
    <div class="title title-block">
      Kiểu quảng cáo
    </div>
    <div>
      <layout-image-sample
        v-for="(item, index) in layoutTypes"
        :key="item.code"
        v-model="innerValue"
        :code="item.code"
        :title="item.title"
        :image="item.image"
        height-img="88"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import LayoutImageSample from "~/components/page/manage-layout/LayoutImageSample.vue";
import wrapper from "~/mixins/wrapper";
import { REDIRECT_LAYOUT_TYPES } from "~/constants/layout";

export default (Vue as VueConstructor).extend({
  name: "LayoutTypeSelect",
  components: { LayoutImageSample },
  mixins: [wrapper],
  data() {
    return {
      layoutTypes: REDIRECT_LAYOUT_TYPES
    };
  }
});
</script>
