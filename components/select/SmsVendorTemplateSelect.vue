<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    attach
    :resource="resource"
    name="sms_vendor_template"
    :label="label"
    item-text="name"
    :multiple="multiple"
    clearable
    v-on="$listeners"
  >
    <template slot="selection" slot-scope="{ item }">
      <v-chip
        v-if="multiple"
        class="mx-1"
        color="primary"
        small
        close
        @click:close="remove(item)"
      >
        {{ item.name }}
      </v-chip>
      <span v-else class="content-input">{{ item.name }}</span>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import {
  BRAND_NAME,
  TEMPLATE_MMS,
  TEMPLATE_SMS,
  TEMPLATE_SMS_VENDOR
} from "~/constants/resource";

const SmsVendorTemplateSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface
>).extend({
  name: "SmsVendorTemplateSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Template tin nhắn ngoại mạng"
    },
    returnObject: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      resource: TEMPLATE_SMS_VENDOR,
      innerValue: null
    };
  },
  methods: {
    remove(item) {
      let map = [];

      map = this.innerValue.map(e => e.id);

      const index = map.indexOf(item.id);
      if (index !== -1) {
        this.innerValue.splice(index, 1);
      }
    }
  }
});

export default SmsVendorTemplateSelect;
export type SmsTemplateSelectRef = InstanceType<typeof SmsVendorTemplateSelect>;
</script>

<style scoped>
.content-input {
  max-width: 100%;
}
</style>
