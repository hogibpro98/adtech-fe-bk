<template>
  <validation-provider rules="cronValidator" tag="div">
    <div class="d-flex justify-content-start align-items-center advanced">
      <div class="ml-4 mr-4">Biểu thức cron</div>
      <div class="wrap-input-model-hour">
        <v-text-field
          v-model="innerValue"
          dense
          class="centered-input"
        ></v-text-field>
      </div>
      <div class="translate ml-4">{{ innerValue | translate }}</div>
    </div>
  </validation-provider>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { ValidationProvider } from "vee-validate";
import { translateCron } from "~/util/cron";
import CronMixin from "~/mixins/cron-mixin";
const cronValidator = require("cron-validator");
export default (Vue as VueConstructor<
  Vue & InstanceType<typeof CronMixin>
>).extend({
  name: "TabAdvanced",
  components: {
    ValidationProvider
  },
  filters: {
    translate(value) {
      if (!cronValidator.isValidCron(value)) return;
      return translateCron(value);
    }
  },
  mixins: [CronMixin],
  props: {
    value: {
      type: String,
      default: ""
    }
  }
});
</script>

<style scoped>
.v-text-field {
  height: 40px !important;
}

.advanced {
  border: 1px solid #ccc;
  height: 50px;
}

.centered-input >>> input {
  text-align: center;
}
</style>
