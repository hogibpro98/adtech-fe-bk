<template>
  <div>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label"
      :rules="rules"
      :vid="name"
    >
      <input v-model="innerValue" hidden />
      <v-card-text class="text-left pb-2 pl-0 theme--light label-md font-16">
        {{ label }}
        <span v-if="required" class="error--text">*</span>
        <v-btn
          color="primary darken-1"
          class="mx-2"
          text
          small
          @click.native.prevent="addItem"
          >Thêm
        </v-btn>
      </v-card-text>

      <div :class="{ scrollable: innerValue.length > 5 }">
        <v-layout
          v-for="(item, index) in innerValue"
          :key="`time_range_${index}`"
          class="my-2 px-3"
          row
          wrap
        >
          <v-flex md5 xs12 class="pr-md-2">
            <time-picker-flat
              v-model="item.start"
              :config-props="{
                maxTime: config.max_end_hour,
                minTime: config.min_start_hour
              }"
              :default-date="defaultDate"
              :name="`start_hour_${uuid}_${index}`"
              label="Bắt đầu"
              attach
              dense
              required
              :rules="
                `required|timeLTE:end_hour_${uuid}_${index},1|timeGTE:end_hour_${uuid}_${index -
                  1},1`
              "
              hide-details
              clearable
              auto-hide
            />
          </v-flex>
          <v-flex md5 xs10 class="pl-md-2">
            <time-picker-flat
              v-model="item.end"
              :config-props="{
                maxTime: config.max_end_hour,
                minTime: config.min_start_hour
              }"
              :default-date="defaultDate"
              :name="`end_hour_${uuid}_${index}`"
              label="Kết thúc"
              attach
              dense
              required
              :rules="`required|timeGTE:start_hour_${uuid}_${index},1`"
              hide-details
              clearable
              auto-hide
            />
          </v-flex>
          <v-flex xs2 class="text-right" align-self-center>
            <v-btn
              text
              icon
              height="32"
              width="32"
              color="error"
              class="pa-2"
              @click.native.prevent="deleteItem(index)"
            >
              <v-icon>delete</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </div>

      <error-display :errors="errors" />
    </validation-provider>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import deepWrapper from "~/mixins/deepWrapper";
import TimePickerFlat from "~/components/common/TimePickerFlat.vue";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";

export default (Vue as VueConstructor).extend({
  name: "TimeRangeInput",
  components: { ErrorDisplay, TimePickerFlat },
  mixins: [deepWrapper, input],
  props: {
    label: {
      type: String,
      default: ""
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    required: {
      type: Boolean,
      default: false
    },
    config: {
      type: Object,
      default: () => {
        return {
          min_start_hour: null,
          max_start_hour: null
        };
      }
    },
    defaultDate: {
      type: String,
      default: () => {
        return "08:30:00";
      }
    }
  },
  data() {
    return {
      innerValue: [
        {
          start: null,
          end: null
        }
      ]
    };
  },
  methods: {
    addItem() {
      this.innerValue.push({
        start: null,
        end: null
      });
    },
    deleteItem(index) {
      this.innerValue.splice(index, 1);
    }
  }
});
</script>

<style lang="scss" scoped>
.scrollable {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 250px;
}
</style>
