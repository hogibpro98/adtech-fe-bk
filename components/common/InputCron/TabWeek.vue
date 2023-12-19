<template>
  <div class="d-flex justify-content-start align-items-center week">
    <div class="ml-4 mr-4">Hàng tuần</div>
    <div class="d-flex">
      <validation-provider
        class="d-flex justify-content-center align-items-center"
        tag="div"
        immediate
        rules="requiredCron"
      >
        <v-checkbox
          v-for="(day, index) in days"
          :key="index"
          v-model="innerValue.checkboxDayModels"
          :label="day"
          :value="index"
          class="d-flex justify-content-center align-items-center mr-3 checkbox-day-of-week"
        ></v-checkbox>
      </validation-provider>
    </div>

    <span class="pl-4 mr-4">tại</span>
    <div class="wrap-input-flat-pickr">
      <flat-pickr
        v-model="innerValue.atTimeOfDayModel"
        :config="config"
        class="pl-11 flat-pickr"
      >
      </flat-pickr>
      <div class="icon-clock-wrap">
        <v-icon class="icon-clock">mdi-clock-time-three-outline</v-icon>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ValidationProvider } from "vee-validate";
import Vue, { VueConstructor } from "vue";
import CronMixin from "~/mixins/cron-mixin";

interface ComponentData {
  days: Array<string>;
}

export default (Vue as VueConstructor<
  Vue & InstanceType<typeof CronMixin> & ComponentData
>).extend({
  name: "TabWeek",
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
      },
      days: ["Chủ nhật", "T2", "T3", "T4", "T5", "T6", "T7"]
    };
  },
  methods: {}
});
</script>

<style scoped>
.v-text-field {
  height: 40px !important;
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

.week {
  border: 1px solid #ccc;
  height: 50px;
}

.v-input--selection-controls {
  margin-top: 0 !important;
  padding-top: 0 !important;
}

.checkbox-day-of-week >>> .v-input__slot {
  margin-bottom: 0px !important;
}

.centered-input >>> input {
  text-align: center;
}

.flat-pickr {
  width: 120px;
}

.checkbox-day-of-week >>> .v-input--selection-controls__input {
  margin-right: 0 !important;
}
</style>
