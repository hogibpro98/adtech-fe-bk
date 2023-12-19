<template>
  <div class="d-flex justify-content-start align-items-center minute">
    <div class="ml-4 mr-4">Mỗi</div>
    <validation-provider rules="minMinute|requiredCron">
      <v-text-field
        v-model="innerValue"
        dense
        class="centered-input"
        @keypress="isNumber($event)"
        @keydown="handleKeyDownMinute($event)"
      ></v-text-field>
    </validation-provider>
    <span class="ml-4">Phút</span>
  </div>
</template>

<script lang="ts">
import { ValidationProvider } from "vee-validate";
import Vue, { VueConstructor } from "vue";
import KEYCODE_VALUE from "~/constants/key-code-value";
import CronMixin from "~/mixins/cron-mixin";

export default (Vue as VueConstructor<
  Vue & InstanceType<typeof CronMixin>
>).extend({
  name: "TabMinute",
  components: {
    ValidationProvider
  },
  mixins: [CronMixin],
  props: {
    value: [String, Number],
  },
  methods: {
    handleKeyDownMinute(evt: KeyboardEvent) {
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode === KEYCODE_VALUE.UP_ARROW) {
        this.innerValue = Number(this.innerValue) + 1;
      } else if (charCode === KEYCODE_VALUE.DOWN_ARROW) {
        this.innerValue = Number(this.innerValue) - 1;
        if (this.innerValue < 1) {
          this.innerValue = 1;
        }
      }
    }
  },
});
</script>

<style scoped>
.v-text-field {
  height: 40px !important;
}

.minute {
  border: 1px solid #ccc;
  height: 50px;
}

.centered-input >>> input {
  text-align: center;
}
</style>
