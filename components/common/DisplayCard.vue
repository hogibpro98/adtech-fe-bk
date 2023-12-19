<template>
  <v-card :height="height" elevation="2">
    <v-card-title class="justify-content-space-between">
      <div class="v-card__title__container">
        <nuxt-link v-if="redirect" :to="redirect">{{ title }}</nuxt-link>
        <template v-else>{{ title }}</template>
      </div>
      <div class="display-card__top-right">
        <export-component ref="ExportComponent"></export-component>
        <slot name="top-right"></slot>
      </div>
    </v-card-title>
    <div class="px-4 py-2">
      <slot></slot>
    </div>
    <v-overlay :value="loading" absolute color="#fff" class="z-10">
      <v-progress-circular :width="4" :size="32" indeterminate color="primary">
      </v-progress-circular>
    </v-overlay>
  </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import ExportComponent from "~/components/common/ExportComponent.vue";
export default (Vue as VueConstructor).extend({
  name: "DisplayCard",
  components: { ExportComponent },

  props: {
    height: {
      type: Number,
      default: 480
    },
    title: {
      type: String,
      required: true
    },
    redirect: {
      type: String,
      default: null
    },
    loading: {
      type: Boolean,
      default: false
    },
    timeRange: {
      type: Array,
      default: null
    },
    filter: {
      type: Object,
      default: null
    },
    url: {
      type: String,
      default: null
    },
    params: {
      type: Object,
      default: null
    }
  },

  methods: {
    handlerExportClick() {
      const exportUrl = this.getExportUrl(this.url);
      if (this.url) {
        this.$refs.ExportComponent.start(exportUrl, this.params);
      }
    },
    isListingUrl(url) {
      if (url.includes("listing")) {
        return true;
      }
      return false;
    },
    getExportUrl(url) {
      let exportUrl;
      if (this.isListingUrl(url)) {
        exportUrl = url.substring(0, url.length - 7) + "limit-export";
      } else exportUrl = url + "/limit-export";
      return exportUrl;
    }
  }
});
</script>
<style>
.v-card__title__container {
  width: 360px;
  word-break: break-word;
}
.v-card__title {
  gap: 15px 0px;
}
</style>
