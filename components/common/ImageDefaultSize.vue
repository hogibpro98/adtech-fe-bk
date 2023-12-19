<template>
  <div v-bind="$attrs" class="preview-banner-default">
    <span class="preview-banner-size"> {{ width }} x {{ height }} </span>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  name: "ImageDefaultSize",
  props: {
    width: {
      type: [String, Number],
      required: true
    },
    height: {
      type: [String, Number],
      required: true
    }
  }
});
</script>
