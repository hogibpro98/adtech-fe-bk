<template>
  <combo-box-with-validation
    v-model="innerValue"
    :loading="loading"
    :multiple="multiple"
    :label="label"
    :name="name"
    resource="/telco"
    item-value="code"
    item-text="name"
    :required="required"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <template v-if="multiple" slot="selection" slot-scope="{ item }">
      <v-chip
        class="mx-1"
        color="primary"
        small
        close
        @click:close="remove(item)"
      >
        {{ item }}
      </v-chip>
    </template>
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
  </combo-box-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import { ROLE_ADVERTISER, ROLE_AGENCY } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";
import ComboBoxWithValidation from "~/components/common/ComboBoxWithValidation.vue";
import input from "~/mixins/input";

export interface SelectUserDataInterface extends SelectDataInterface {
  tagNew: object;
  searchInput: string;
}

export default (Vue as VueConstructor<Vue & SelectUserDataInterface>).extend({
  name: "TelcoCombobox",
  components: { ComboBoxWithValidation },
  mixins: [wrapper, input],
  props: {
    type: {
      type: [Array, String],
      default: () => [ROLE_ADVERTISER, ROLE_AGENCY]
    },
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Email"
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: null
    };
  },
  methods: {
    remove(item) {
      this.innerValue.splice(this.innerValue.indexOf(item), 1);
      this.innerValue = [...this.innerValue];
    }
  }
});
</script>
