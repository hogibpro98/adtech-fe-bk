<template>
  <div id="v-widget">
    <v-card>
      <v-app-bar v-if="enableHeader" flat color="transparent" text dense>
        <v-toolbar-title
          ><h4>{{ title }}</h4></v-toolbar-title
        >
        <v-spacer></v-spacer>
        <slot name="widget-header-action"></slot>
      </v-app-bar>
      <v-divider v-if="enableHeader"></v-divider>
      <v-card-text :class="contentBg">
        <slot name="widget-content"></slot>
      </v-card-text>
    </v-card>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  name: "VWidget",
  props: {
    title: {
      type: String
    },
    enableHeader: {
      type: Boolean,
      default: true
    },
    contentBg: {
      type: String,
      default: "white"
    }
  },

  data() {
    return {};
  },
  computed: {}
});
</script>
