<template>
  <v-card :height="height">
    <v-card-text class="pa-0">
      <v-container class="pa-0">
        <div class="layout column ma-0">
          <div class="sm6 xs6 flex">
            <div
              :class="color"
              class="layout row ma-0 justify-center align-center pa-4"
            >
              <v-icon color="white" size="64px">{{ icon }}</v-icon>
            </div>
          </div>
          <div
            class="sm6 xs6 flex text-sm-center py-3 d-flex flex-column align-center justify-content-center"
          >
            <slot></slot>
          </div>
        </div>
      </v-container>
    </v-card-text>
    <v-overlay :value="loading" absolute color="#fff" class="z-1">
      <v-progress-circular :width="4" :size="32" indeterminate color="primary">
      </v-progress-circular>
    </v-overlay>
  </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  name: "MiniCard",
  props: {
    height: {
      type: Number,
      default: 200
    },
    icon: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
});
</script>
