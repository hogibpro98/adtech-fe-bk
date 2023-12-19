<template>
  <v-menu
    ref="menu"
    v-model="menu"
    v-bind="$attrs"
    attach
    :close-on-content-click="false"
    :close-on-click="false"
    :nudge-right="40"
    transition="scale-transition"
    offset-y
    offset-overflow
    min-width="290px"
  >
    <template #activator="{ on, attrs }">
      <validation-provider
        v-slot="{ errors, valid }"
        :name="label"
        :rules="rules"
        :vid="vid || $attrs.name"
      >
        <v-combobox
          v-model="innerValue"
          multiple
          chips
          clearable
          prepend-icon="mdi-calendar"
          readonly
          v-bind="attrs"
          :error-messages="errors"
          @mouseup.stop.prevent="openDate()"
        >
          <template #selection="{ index, item }">
            <v-chip
              class="ma-1 filter-chip"
              color="primary"
              small
              close
              @click.stop="openDate(item)"
              @click:close="removeDate(index)"
            >
              {{ formatDate(item) }}
            </v-chip>
          </template>
          <template v-if="required" #label>
            {{ $attrs.label || label }} <span class="red--text"> (*) </span>
          </template>
        </v-combobox>
      </validation-provider>
    </template>

    <v-date-picker
      ref="picker"
      v-model="innerValue"
      color="primary"
      no-title
      multiple
      scrollable
      locale="vi"
    >
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="resetState">
        Reset
      </v-btn>
      <v-btn text color="primary" @click="menu = false">
        OK
      </v-btn>
    </v-date-picker>
  </v-menu>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import moment from 'moment/src/moment';
import { DATE, SQL_DATE } from "~/constants/format";
import deepWrapper from "~/mixins/deepWrapper";

interface ComponentData {
  pickerDate: string;
  menu: boolean;
}

const MultipleDatePicker = (Vue as VueConstructor<Vue & ComponentData>).extend({
  mixins: [deepWrapper],
  props: {
    label: {
      type: String,
      default: "Ngày"
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },

    required: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    displayFormat: {
      type: String,
      default: "DD/MM/YYYY"
    }
  },
  data: () => ({
    innerValue: [],
    currentDate: [],
    menu: false
  }),
  computed: {},
  watch: {
    innerValue(value) {
      if (!Array.isArray(value)) {
        this.innerValue = [];
      }
    },
    menu(value) {
      if (value) {
        this.currentDate = this.innerValue;
      }
    }
  },
  methods: {
    async openDate(date = null) {
      await this.$nextTick();
      this.menu = true;
    },
    removeDate(index) {
      this.innerValue.splice(index, 1);
    },
    formatDate(date) {
      if (moment(date, SQL_DATE).isValid()) {
        return moment(date, SQL_DATE).format(DATE);
      }
      return date;
    },
    resetState() {
      this.innerValue = this.currentDate;
      this.menu = false;
    }
  }
});

export default MultipleDatePicker;
export type MultipleDatePickerRef = InstanceType<typeof MultipleDatePicker>;
</script>
