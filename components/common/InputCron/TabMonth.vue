<template>
  <div class="d-flex justify-content-start align-items-center month">
    <span class="ml-4 mr-4">Tại ngày</span>
    <validation-provider rules="max31|minDay|requiredCron">
      <v-text-field
        v-model="innerValue.atDayModel"
        dense
        @keypress="isNumber($event)"
        @keydown="handleKeyDownAtDay($event)"
        class="centered-input"
      ></v-text-field>
    </validation-provider>

    <span class="ml-4 mr-4">của tháng, mỗi</span>
    <validation-provider rules="minMonth|requiredCron">
      <v-text-field
        v-model="innerValue.everyMonth"
        dense
        style="width: 60px"
        class="centered-input"
        @keypress="isNumber($event)"
        @keydown="handleKeyDownEveryMonth($event)"
      >
      </v-text-field>
    </validation-provider>
    <span class="ml-4 mr-4">tháng, tại</span>
    <div class="wrap-input-flat-pickr">
      <flat-pickr
        v-model="innerValue.atTimeOfDayModel"
        :config="config"
        class="pl-11 flat-pickr"
      ></flat-pickr>
      <div class="icon-clock-wrap">
        <v-icon class="icon-clock">mdi-clock-time-three-outline</v-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ValidationProvider } from "vee-validate";
import Vue, { VueConstructor } from "vue";
import KEYCODE_VALUE from "~/constants/key-code-value";
import CronMixin from "~/mixins/cron-mixin";

interface ComponentData {}

export default (Vue as VueConstructor<
  Vue & InstanceType<typeof CronMixin> & ComponentData
>).extend({
  name: "TabMonth",
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
        time_24hr: true,
        static: true
      }
    };
  },
  methods: {
    handleKeyDownEveryMonth(evt: KeyboardEvent) {
      if (evt) {
        const charCode = evt.which ? evt.which : evt.keyCode;
        if (charCode === KEYCODE_VALUE.UP_ARROW) {
          this.innerValue.everyMonth = Number(this.innerValue.everyMonth) + 1;
        } else if (charCode === KEYCODE_VALUE.DOWN_ARROW) {
          this.innerValue.everyMonth = Number(this.innerValue.everyMonth) - 1;
          if (this.innerValue.everyMonth < 1) {
            this.innerValue.everyMonth = 0;
          }
        }
      }
    },

    handleKeyDownAtDay(evt: KeyboardEvent) {
      const charCode = evt.which ? evt.which : evt.keyCode;
      if (charCode === KEYCODE_VALUE.UP_ARROW) {
        this.innerValue.atDayModel = Number(this.innerValue.atDayModel) + 1;
      } else if (charCode === KEYCODE_VALUE.DOWN_ARROW) {
        this.innerValue.atDayModel = Number(this.innerValue.atDayModel) - 1;
        if (this.innerValue.atDayModel < 1) {
          this.innerValue.atDayModel = 0;
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

.wrap-input-model {
  margin-left: 16px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 50px;
  margin-right: 16px;
  border: 1px solid #ccc;
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

.month {
  height: 50px;
  border: 1px #ccc solid;
}

.flat-pickr {
  width: 120px;
}

.centered-input >>> input {
  text-align: center;
}
</style>
