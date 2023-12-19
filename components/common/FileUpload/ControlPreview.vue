<template>
  <div>
    <div v-if="files.length > 0" class="v-transmit-close-all">
      <v-tooltip offset-overflow bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            @click.native.stop="$emit('clear-file')"
            class="mr-2 mt-2"
            fab
            dark
            x-small
            elevation="2"
            color="white"
          >
            <v-icon dark color="grey darken-3">
              close
            </v-icon>
          </v-btn>
        </template>
        <span>Xóa tất cả</span>
      </v-tooltip>
    </div>
    <v-layout v-if="files.length === 0" column align-center justify-center>
      <h3 class="disabled--text">Click hoặc thả file để upload</h3>
      <div v-if="acceptedFileTypes" class="disabled--text">
        ({{ acceptedFileTypes.join(", ") }})
      </div>
    </v-layout>
    <v-overlay
      v-if="files.length > 0 && maximum > 1"
      :value="focusElement"
      @click.native.stop
      absolute
      color="#b3b3b3"
    >
      <v-btn
        @click.native.stop="$emit('to-tab-edit-file')"
        color="grey darken-3"
        class="ma-2 white--text"
      >
        <v-icon dark left>
          edit
        </v-icon>
        Chỉnh sửa
      </v-btn>
      <v-btn
        @click.native.stop="$emit('add-file')"
        color="grey darken-3"
        class="ma-2 white--text"
      >
        <v-icon dark left>
          queue
        </v-icon>
        Thêm file
      </v-btn>
    </v-overlay>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";

const ControlPreview = (Vue as VueConstructor).extend({
  name: "ControlPreview",
  props: {
    files: {
      type: Array,
      required: true
    },
    acceptedFileTypes: {
      type: Array,
      default: null
    },
    focusElement: {
      type: Boolean,
      default: () => false
    },
    maximum: {
      type: Number,
      default: () => 1
    }
  }
});

export default ControlPreview;
export type ControlPreviewRef = InstanceType<typeof ControlPreview>;
</script>
