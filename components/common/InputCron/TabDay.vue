<template>
  <div class="d-flex justify-content-start align-items-center day">
    <span class="ml-4 mr-4">Mỗi</span>
    <validation-provider rules="minDay|requiredCron">
      <v-text-field
        v-model="innerValue.everyDayModel"
        dense
        class="centered-input"
        @keypress="isNumber($event)"
        @keydown="handleKeyDownDay($event)"
      >
      </v-text-field>
    </validation-provider>
    <span class="wrap-input-label mr-4 ml-4">ngày, tại</span>

    <div class="wrap-input-flat-pickr">
      <div>
        <flat-pickr
          v-model="innerValue.atTimeOfDayModel"
          :config="config"
          class="pl-11 flat-pickr"
        >
        </flat-pickr>
        <div class="icon-clock-wrap"  >
          <v-icon class="icon-clock">mdi-clock-time-three-outline</v-icon>
        </div>
      </div>
    </div>
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
        wrap: true,
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i",
        time_24hr: true,
        static: true
      }
    };
  },
  methods: {
    handleKeyDownDay(evt) {
      evt = evt || window.event;
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode === KEYCODE_VALUE.UP_ARROW) {
        this.innerValue.everyDayModel =
          Number(this.innerValue.everyDayModel) + 1;
      } else if (charCode === KEYCODE_VALUE.DOWN_ARROW) {
        this.innerValue.everyDayModel =
          Number(this.innerValue.everyDayModel) - 1;
        if (this.innerValue.everyDayModel < 1) {
          this.innerValue.everyDayModel = 0;
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

.wrap-input-flat-pickr {
  position: relative;
}

.icon-clock-wrap {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  padding: 0 10px;
}

.icon-clock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.day {
  border: 1px solid #ccc;
  height: 50px;
}

.centered-input >>> input {
  text-align: center;
}

.flat-pickr {
  width: 120px;
}
</style>
