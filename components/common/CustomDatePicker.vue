<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
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
        <v-text-field
          :value="formatDate(date)"
          :label="label"
          :error-messages="errors"
          v-bind="$attrs"
          prepend-icon="mdi-calendar"
          readonly
          v-on="on"
        >
          <template v-if="required" #label>
            {{ $attrs.label || label }} <span class="red--text"> (*) </span>
          </template>
        </v-text-field>
      </validation-provider>
    </template>

    <v-date-picker
      v-model="date"
      color="primary"
      no-title
      :multiple="multiple"
      locale="vi"
      v-bind="pickerProps"
      :max="configProps"
      @change="onInput"
    ></v-date-picker>
  </v-menu>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import dateWrapper from "~/mixins/dateWrapper";
import moment from 'moment/src/moment';

interface ComponentData {
  pickerDate: string;
  menu: boolean;
}

const CustomDatePicker = (Vue as VueConstructor<Vue & ComponentData>).extend({
  mixins: [dateWrapper],
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
    pickerProps: {
      type: Object,
      default: () => {}
    },
    configProps: {
      type: String,
      default: ""
    }
  },
  data: () => ({
    pickerDate: "",
    menu: false
  }),
  watch: {
    date(value) {
      if (this.multiple) {
        if (!Array.isArray(value)) {
          this.date = [];
        }
      }
    }
  },
  methods: {
    onInput() {
      if (!this.multiple) {
        this.menu = false;
      }
    }
  }
});

export default CustomDatePicker;
export type CustomDatePickerRef = InstanceType<typeof CustomDatePicker>;
</script>
