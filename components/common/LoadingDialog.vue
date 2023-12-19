<template>
  <v-dialog v-model="innerValue" persistent width="300" no-click-animation>
    <v-card v-bind="$attrs">
      <v-card-text>
        <v-layout column justify-center align-center wrap class="py-2">
          {{ text }}
          <slot v-if="!text" name="text"></slot>
          <v-progress-circular
            v-if="circular"
            indeterminate
            size="64"
            width="8"
            :color="color"
            class="mb-0 mt-2"
          ></v-progress-circular>
          <v-progress-linear
            v-else
            indeterminate
            :color="color"
            class="mb-0 mt-2"
          ></v-progress-linear>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";

export default (Vue as VueConstructor).extend({
  name: "LoadingDialog",
  mixins: [wrapper],
  props: {
    text: {
      type: String,
      default: "Đang thực hiện..."
    },
    circular: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: "primary"
    }
  }
});
</script>
