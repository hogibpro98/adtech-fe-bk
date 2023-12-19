<template>
  <v-tooltip offset-overflow bottom>
    <template #activator="{on, attrs}">
      <span v-on="on">
        <v-icon v-bind="$attrs" :class="iconClass" v-on="$listeners">
          <slot></slot>
        </v-icon>
      </span>
    </template>
    <span>{{ tooltip }}</span>
  </v-tooltip>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor<Vue>).extend({
  name: "TooltipIcon",
  props: {
    tooltip: {
      type: String,
      default: ""
    },
    iconClass: {
      type: [String, Object],
      default: ""
    }
    // icon: {
    //   type: String,
    //   default: ""
    // }
  }
});
</script>
