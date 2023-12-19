<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    no-click-animation
    fullscreen
    transition="dialog-bottom-transition"
    v-on="$listeners"
  >
    <v-card class="d-flex flex-column h-fullscreen justify-space-between">
      <v-toolbar flat dark color="primary" class="full-dialog-header">
        <v-layout justify-space-between>
          <v-toolbar-title class="d-flex align-center">
            <template v-if="title">{{ title }}</template>
            <template v-else>
              <slot name="title"></slot>
            </template>
          </v-toolbar-title>
          <v-btn icon dark @click="showing = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-layout>
      </v-toolbar>
      <vue-perfect-scrollbar class="pa-8">
        <slot></slot>
      </vue-perfect-scrollbar>
      <div class="full-dialog-footer mt-auto">
        <v-divider />
        <template v-if="$scopedSlots.action">
          <slot name="action"></slot>
        </template>
        <v-card-actions v-else>
          <v-layout justify-end>
            <v-btn color="grey" text @click.native="showing = false">Hủy</v-btn>
            <v-btn
              :loading="loading"
              :disabled="loading"
              color="blue darken-1"
              text
              @click.native="$emit('submit')"
            >
              {{ labelButtonConfirm }}
            </v-btn>
          </v-layout>
        </v-card-actions>
      </div>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  showing: boolean;
  loading: boolean;
  timeout: number;
}

interface ComponentMethods {
  resetData(): void;

  show(): void;

  hidden(): void;
}

const FullscreenDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "FullscreenDialog",
  props: {
    labelButtonConfirm: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showing: false,
      loading: false,
      timeout: null
    };
  },

  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    resetData() {
      this.timeout = setTimeout(() => {
        this.$emit("reset");
      }, 300);
    },
    show() {
      this.showing = true;
      this.$emit("shown");
    },
    hidden() {
      this.showing = false;
      this.$emit("hidden");
    }
  }
});

export default FullscreenDialog;
export type FullscreenDialogRef = InstanceType<typeof FullscreenDialog>;
</script>
