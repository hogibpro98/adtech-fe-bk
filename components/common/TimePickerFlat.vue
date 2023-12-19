<template>
  <v-menu
    v-model="menu"
    v-bind="$attrs"
    :close-on-content-click="false"
    :nudge-right="0"
    offset-overflow
    transition="scale-transition"
    content-class="hidden-overflow"
    offset-y
    min-width="auto"
    max-width="100%"
  >
    <template #activator="{ on, attrs }">
      <validation-provider
        v-slot="{ errors, valid }"
        :name="label"
        :rules="rules"
        :vid="vid || $attrs.name"
      >
        <slot
          v-if="$scopedSlots.value"
          :label="label"
          :value="time"
          :open="openMenu"
          name="value"
          @close="closeMenu"
        >
        </slot>

        <v-text-field
          v-if="!$scopedSlots.value"
          :name="$attrs.name"
          :value="time"
          :label="label"
          :error-messages="errors"
          :clearable="clearable"
          v-bind="$attrs"
          readonly
          @click:clear="time = null"
          @click:append-outer="menu = true"
          @keydown.enter.prevent="selectAndClose"
          v-on="on"
        >
          <template v-if="required" #label>
            {{ $attrs.label || label }} <span class="red--text"> (*) </span>
          </template>
        </v-text-field>
        <div class="v-text-field__details mt-2">
          <div class="v-messages theme--light error--text" role="alert">
            <div class="v-messages__wrapper">
              <div class="v-messages__message">
                {{ errors && errors[0] }}
              </div>
            </div>
          </div>
        </div>
      </validation-provider>
    </template>
    <v-row class="ma-0">
      <flat-pickr
        ref="flatPickr"
        v-model="time"
        v-bind="$attrs"
        :config="config"
        class="hide-input hide-border"
        color="primary"
        @on-change="onChange"
        @on-close="selectAndClose"
      />
      <slot
        v-if="$scopedSlots.alias"
        :open="openMenu"
        name="alias"
        @close="closeMenu"
      >
      </slot>
    </v-row>
  </v-menu>
</template>
<script lang="ts">
import { Vietnamese } from "@/constants/locale/flatpickrvn";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  menu: boolean;
  time: string;
}

interface ComponentMethods {
  closeMenu(): void;
  openMenu(): void;
  onChange(valObject: object, valString: string): void;
  selectAndClose(): void;
}

const TimePickerFlat = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "TimePickerFlat",
  props: {
    label: {
      type: String,
      default: "Thời gian"
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
    value: {
      type: String,
      default: ""
    },
    configProps: {
      type: Object,
      default: () => ({})
    },
    defaultDate: {
      type: String,
      default: "08:30:00"
    },
    clearable: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    menu: false,
    time: ""
  }),
  computed: {
    config() {
      return {
        enableTime: true,
        noCalendar: true,
        dateFormat: "H:i:ss",
        time_24hr: true,
        inline: true,
        locale: Vietnamese,
        defaultDate: this.defaultDate,
        ...this.configProps
      };
    }
  },
  watch: {
    time(val) {
      if (this.value !== val) {
        this.$emit("input", val);
      }
    },
    value(val) {
      if (val !== this.time) {
        this.time = val;
      }
    }
  },
  mounted() {
    this.time = this.value;
  },
  methods: {
    closeMenu() {
      this.menu = false;
    },
    openMenu() {
      this.menu = true;
    },
    onChange(_, valString) {
      this.time = valString;
    },
    selectAndClose() {
      if (this.time) {
        this.$emit("input", this.time);
      } else {
        this.$emit("input", this.defaultDate);
      }
      this.closeMenu();
    }
  }
});

export default TimePickerFlat;
export type TimePickerFlatRef = InstanceType<typeof TimePickerFlat>;
</script>
