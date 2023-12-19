<template>
  <div>
    <v-layout justify-space-between class="mt-12 w-full">
      <v-divider />
    </v-layout>
    <v-layout justify-space-between class="mt-4">
      <v-btn
        :loading="loading"
        @click.native="$emit('prev')"
        color="blue white"
        text
      >
        {{ labelPrev }}
      </v-btn>
      <v-btn
        :loading="loading"
        type="submit"
        color="blue white"
        class="mr-0 white--text"
      >
        {{ labelNext }}
      </v-btn>
    </v-layout>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";

const FormDialogStepAction = (Vue as VueConstructor).extend({
  name: "FormDialogStepAction",
  props: {
    labelPrev: {
      type: String,
      default: "Quay lại"
    },
    labelNext: {
      type: String,
      default: "Tiếp tục"
    },
    loading: {
      type: Boolean,
      default: false
    }
  }
});

export default FormDialogStepAction;
export type FormDialogStepActionRef = InstanceType<typeof FormDialogStepAction>;
</script>
