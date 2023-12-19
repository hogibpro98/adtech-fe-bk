<template>
  <v-card elevation="2" class="pa-2" tile>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label"
      :rules="rules"
      :vid="fieldName"
    >
      <input v-model="innerValue" hidden type="text" />
      <v-card-text class="text-left pb-2 pl-1  label-md font-16">
        {{ label }}
        <span v-if="required" class="error--text">(*)</span>
        <v-btn
          color="primary darken-1"
          class="mx-2"
          text
          small
          @click.native.prevent="addItem"
          >Thêm
        </v-btn>
      </v-card-text>
      <v-card
        v-for="(items, index) in innerValue"
        :key="`schedule-${uuid}-${index}`"
        elevation="2"
        tile
        class="pa-2 ma-2"
      >
        <div class="d-flex flex-row-reverse">
          <v-btn
            text
            icon
            height="32"
            width="32"
            color="error"
            class="pa-2"
            @click.native.prevent="deleteItem(index)"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </div>
        <v-flex xs12 class="mb-2">
          <button-select
            v-model="items.days"
            color="primary"
            :label="'Ngày gửi tin'"
            :items="dayItems"
            :name="`${fieldName}.${index}.days`"
            required
            rules="required"
          ></button-select>
        </v-flex>
        <v-flex xs12>
          <time-range-input
            v-model="items.times"
            label="Khoảng thời gian gửi tin"
            name="times"
            required
            rules="required"
          />
        </v-flex>
      </v-card>
      <error-display :errors="errors" class="mt-2" />
    </validation-provider>
  </v-card>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { cloneDeep, union } from "lodash";
import ButtonSelect from "~/components/common/ButtonSelect.vue";
import TimeRangeInput from "~/components/common/TimeRangeInput.vue";
import { DAY_SELECT } from "~/constants/dataSelect";
import deepWrapper from "~/mixins/deepWrapper";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";

interface ComponentData {
  dayItems: Array<object>;
  innerValue: Array<object>;
}

const DEFAULT_SCHEDULE = [
  {
    days: [],
    times: [{ start: null, end: null }]
  }
];

export default (Vue as VueConstructor & ComponentData).extend({
  name: "ScheduleInput",
  components: { ErrorDisplay, TimeRangeInput, ButtonSelect },
  mixins: [deepWrapper, input],
  props: {
    label: {
      type: String,
      default: "Khoảng thời gian gửi tin"
    }
  },
  data() {
    return {
      dayItems: DAY_SELECT,
      innerValue: cloneDeep(DEFAULT_SCHEDULE)
    };
  },
  computed: {
    fieldName() {
      return this.name || this.$attrs.name || this.vid || "schedule";
    },
    selectedDays() {
      let selected = [];
      this.innerValue.forEach(item => {
        selected = union(selected, item.days);
      });
      return selected;
    }
  },
  mounted() {
    if (this.innerValue == null || this.innerValue == {}) {
      this.innerValue = cloneDeep(DEFAULT_SCHEDULE);
    }
  },
  methods: {
    addItem() {
      if (!Array.isArray(this.innerValue)) {
        this.innerValue = DEFAULT_SCHEDULE;
      } else {
        this.innerValue.push({
          days: [],
          times: [{ start: null, end: null }]
        });
      }
    },
    deleteItem(index) {
      this.innerValue.splice(index, 1);
    }
  }
});
</script>
