<template>
  <v-card elevation="2" class="pa-2 mt-2" tile>
    <v-card-text class="text-left pb-2 pl-1  label-md font-16">
      {{ label }}
      <span v-if="required" class="error--text">(*)</span>
    </v-card-text>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label"
      :rules="rules"
    >
      <input-cron v-model="innerValue"></input-cron>
      <error-display :errors="errors" />
    </validation-provider>
  </v-card>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { ValidationProvider } from "vee-validate";
import InputCron from "~/components/common/InputCron/InputCron.vue";
import wrapper from "~/mixins/wrapper";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";

interface ComponentMethods {}

interface ComponentData {}

interface ComponentComputed {}

interface ComponentProps {}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentComputed & ComponentMethods & ComponentProps
>).extend({
  name: "VCronEditorWithValidation",
  components: { ErrorDisplay, InputCron, ValidationProvider },
  mixins: [wrapper, input],
  props: {
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: null,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: ""
    };
  },
  computed: {
    // explanation() {
    //   try {
    //     if (this.innerValue) {
    //       return cronstrue.toString(this.innerValue);
    //     }
    //   } catch (e) {
    //     return null;
    //   }
    //   return null;
    // }
  }
});
</script>
<style scoped></style>
