<template>
  <v-flex :class="contentClass">
    <v-card elevation="2" color="data-table-toolbar" tile>
      <v-row class="ma-0">
        <v-flex
          :class="`${color} d-flex justify-content-center align-items-center`"
          xs3
        >
          <v-icon color="#fff" size="48">{{ icon }}</v-icon>
        </v-flex>
        <v-flex
          xs9
          class="d-flex justify-content-space-between align-items-center pa-2"
        >
          <div class="text-left">
            <h3>{{ name }}</h3>
            <h3
              v-if="$scopedSlots.content"
              class="mt-2 sticky bottom--1 background px-8 py-2 border-top"
            >
              <slot name="actions"></slot>
            </h3>
            <h3
              v-if="!$scopedSlots.content"
              class="mt-2 sticky bottom--1 background"
            >
              {{ value }}
            </h3>
          </div>
        </v-flex>
      </v-row>
    </v-card>
  </v-flex>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

export default (Vue as VueConstructor).extend({
  name: "OverviewItemPanel",
  props: {
    contentClass: {
      type: String,
      default: "xs12 md4 lg4 xl3"
    },
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: "primary"
    },
    name: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: ""
    }
  }
});
</script>
