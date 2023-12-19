<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || name"
    :rules="rules"
    :vid="name"
  >
    <input v-model="innerValue" hidden />
    <label
      :class="
        `v-label pt-3 pb-4 mt-2 v-label-bold ${
          errors.length > 0 ? 'error--text' : ''
        }`
      "
    >
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </label>
    <v-row no-gutters>
      <v-radio-group v-model="innerValue" class="w-full mt-0" row :disabled="disabled">
        <v-col
          v-for="(item, index) in items"
          :key="`item-select-type-${index}`"
          class="pa-1 mr-0"
          cols="12"
          md="6"
          xs="12"
        >
          <v-radio
            :label="item.text"
            :value="item.value"
            class="mr-0"
            hide-details
            dense
          />
        </v-col>
      </v-radio-group>
    </v-row>
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
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SELECT_MMS_TYPE } from "~/constants/dataSelect";

interface ComponentData {
  innerValue: string | number;
  items: Array<object>;
  loading: boolean;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "SelectTypeMMS",
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, Number, String],
      default: null
    },
    label: {
      type: String,
      default: null
    },
    fieldValue: {
      type: String,
      default: "code"
    },
    name: {
      type: String,
      default: null
    },
    vid: {
      type: String,
      default: null
    },
    required: {
      default: false,
      type: Boolean
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    isDefaultSelectAll: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: SELECT_MMS_TYPE[0].value,
      items: SELECT_MMS_TYPE,
      loading: false
    };
  }
});
</script>

<style scoped>
.v-label-bold {
  display: block;

  line-height: 1.25rem;
  font-size: 16px;
  font-weight: 400 !important;
  color: #000 !important;
}
</style>
