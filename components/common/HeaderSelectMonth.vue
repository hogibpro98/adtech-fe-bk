<template>
  <v-card
    tile
    class="py-2 d-flex align-items-center justify-content-space-between z-15"
  >
    <div v-if="isDialog === false" class="text-h6 pl-6">
      {{ title }}
    </div>
    <div class="d-flex align-items-end mr-10">
      <div  class="label">
        Chọn thời gian
      </div>
      <div :id="`date-picker-${id}`" class="pointer">
        <!--        <flat-pickr-->
        <!--          v-model="innerValue"-->
        <!--          class="form-control"-->
        <!--          :config="monthPicker"-->
        <!--        >-->
        <!--        </flat-pickr>-->
        <custom-date-picker
          v-model="innerValue"
          label=""
          v-bind="pickerProps"
          :config-props="configProps"
          hide-details
        ></custom-date-picker>
      </div>
    </div>
  </v-card>
</template>
<script lang="ts">
// @ts-ignore
import moment from 'moment/src/moment';
import shortid from "shortid";
import Vue, { VueConstructor } from "vue";
import { Vietnamese } from "~/constants/locale/flatpickrvn";
import CustomDatePicker from "~/components/common/CustomDatePicker.vue";

interface ComponentData {
  id: string;
}

interface ComponentMethods {
  validateInnerValueByMinMaxDate(minDate: object, maxDate: object): void;

  dateIsValid(date: object): void;

  nextTime(): void;

  prevTime(): void;
}

const HeaderSelectTime = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "HeaderSelectMonth",
  components: { CustomDatePicker },
  props: {
    value: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: "date"
    },
    isDialog: {
      type: Boolean,
      default: false
    },
    configProps: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      // month: `${new Date().getMonth() + 1}/${new Date().getFullYear()}}`,
      innerValue: this.value,
      id: shortid.generate()
    };
  },
  computed: {
    pickerProps() {
      if (this.type === "month") {
        return {
          format: "YYYY-MM",
          displayFormat: "MM/YYYY",
          pickerProps: {
            type: "month"
          }
        };
      } else {
        return {
          format: "YYYY-MM-DD",
          displayFormat: "DD/MM/YYYY",
          pickerProps: {
            type: "date"
          }
        };
      }
    }
  },
  watch: {
    value(val) {
      this.innerValue = val;
    },
    innerValue(val) {
      this.$emit("input", val);
    }
  }
});

export default HeaderSelectTime;
export type HeaderSelectTimeRef = InstanceType<typeof HeaderSelectTime>;
</script>

<style scoped>
.label {
  margin-right: 16px;
}
</style>
