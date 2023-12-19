<template>
  <div class="d-flex justify-content-start align-items-center hour">
    <span class="ml-4 mr-4">Mỗi</span>
    <validation-provider rules="minHour|requiredCron">
      <v-text-field
        v-model="innerValue.everyHourModel"
        dense
        @keypress="isNumber($event)"
        @keydown="handleKeyDownHour($event)"
        class="centered-input"
      >
      </v-text-field>
    </validation-provider>
    <span class="wrap-input-label mr-4 ml-4">giờ tại, phút thứ</span>
    <validation-provider rules="max59|requiredCron">
      <v-text-field
        v-model="innerValue.atMinuteOfHourModel"
        dense
        style="width: 60px"
        class="centered-input"
        @keypress="isNumber($event)"
        @keydown="handleKeyDownHourAtMinute($event)"
      >
      </v-text-field>
    </validation-provider>
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
  name: "TabHour",
  components: {
    ValidationProvider
  },
  mixins: [CronMixin],
  props: {
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      config: {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true
      }
    };
  },
  methods: {
    handleKeyDownHourAtMinute(evt: KeyboardEvent) {
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode === KEYCODE_VALUE.UP_ARROW) {
        this.innerValue.atMinuteOfHourModel =
          Number(this.innerValue.atMinuteOfHourModel) + 1;
        if (this.innerValue.atMinuteOfHourModel > 59) {
          this.innerValue.atMinuteOfHourModel = 59;
        }
      } else if (charCode === KEYCODE_VALUE.DOWN_ARROW) {
        this.innerValue.atMinuteOfHourModel =
          Number(this.innerValue.atMinuteOfHourModel) - 1;
        if (this.innerValue.atMinuteOfHourModel < 1) {
          this.innerValue.atMinuteOfHourModel = 0;
        }
      }
    },
    handleKeyDownHour(evt) {
      evt = evt || window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode === KEYCODE_VALUE.UP_ARROW) {
        this.innerValue.everyHourModel =
          Number(this.innerValue.everyHourModel) + 1;
      } else if (charCode === KEYCODE_VALUE.DOWN_ARROW) {
        this.innerValue.everyHourModel =
          Number(this.innerValue.everyHourModel) - 1;
        if (this.innerValue.everyHourModel < 1) {
          this.innerValue.everyHourModel = 0;
        }
      }
    }
  }
});
</script>

<style scoped>
.v-text-field {
  height: 40px !important;
}

.hour {
  border: 1px solid #ccc;
  height: 50px;
}

.centered-input >>> input {
  text-align: center;
}
</style>
