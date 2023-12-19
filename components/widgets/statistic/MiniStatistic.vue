<template>
  <v-card flat>
    <v-card-text class="pa-0">
      <v-container class="pa-0">
        <div class="layout row ma-0">
          <div class="sm6 xs6 flex">
            <div class="layout column ma-0 justify-center align-center">
              <v-icon :color="color" size="48px">{{ icon }}</v-icon>
              <div :class="`${color}--text`" class="headline">{{ title }}</div>
            </div>
          </div>
          <div
            :class="color"
            class="sm6 xs6 flex text-sm-center py-3 white--text d-flex flex-column align-center justify-content-center"
          >
            <div class="headline">{{ number | formattedNumber }}</div>
            <span class="caption">{{ subTitle }}</span>
          </div>
        </div>
      </v-container>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  name: "MiniStatistic",
  props: {
    icon: {
      type: String,
      default: ""
    },
    number: {
      type: [String, Number],
      default: ""
    },
    title: {
      type: String,
      default: ""
    },
    subTitle: {
      type: String,
      default: ""
    },
    color: {
      type: String,
      default: ""
    }
  }
});
</script>
