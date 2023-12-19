<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || $attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <input v-model="innerValue" hidden />
    <v-card-text class="text-left pb-2 pl-0 theme--light label-md font-16">
      {{ label }}
      <span v-if="required" class="error--text">(*)</span>
    </v-card-text>
    <v-layout row wrap class="pa-2">
      <v-btn
        v-for="(item, index) in items"
        v-bind="$attrs"
        :key="`select-button-${uuid}-${index}`"
        :outlined="!isSelected(item)"
        class="ma-2"
        depressed
        :disabled="item.disabled"
        :input-value="isSelected(item)"
        @click.native.prevent="toggleItem(item)"
      >
        <template v-if="!hasContent">{{ item[itemText] }}</template>
        <template v-else>
          <slot name="content"></slot>
        </template>
      </v-btn>
    </v-layout>
    <error-display :errors="errors" />
  </validation-provider>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { xor } from "lodash";
import deepWrapper from "~/mixins/deepWrapper";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";

export default (Vue as VueConstructor).extend({
  name: "ButtonSelect",
  components: { ErrorDisplay },
  mixins: [deepWrapper, input],
  props: {
    label: {
      type: String,
      default: ""
    },

    returnObject: {
      type: Boolean,
      default: false
    },
    items: {
      type: Array,
      default: () => []
    },
    itemText: {
      type: String,
      default: "text"
    },
    itemValue: {
      type: String,
      default: "value"
    }
  },
  data() {
    return {
      innerValue: []
    };
  },
  computed: {
    hasContent() {
      return !!this.$slots.content;
    }
  },
  methods: {
    toggleItem(item) {
      if (!this.returnObject) {
        this.innerValue = xor(this.innerValue, [item[this.itemValue]]);
      } else {
        this.innerValue = xor(this.innerValue, [item]);
      }
    },
    isSelected(item) {
      if (!this.returnObject) {
        return this.innerValue.includes(item[this.itemValue]);
      } else {
        return this.innerValue
          .map(e => e[this.itemValue])
          .includes(item[this.itemValue]);
      }
    }
  }
});
</script>
