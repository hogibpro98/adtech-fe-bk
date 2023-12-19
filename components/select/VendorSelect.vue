<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :multiple="multiple"
    :query-params="params"
    name="vendor-select"
    :item-text="itemText"
    v-on="$listeners"
  >
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import { SMS_VENDOR } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import { ROLE_ADVERTISER, ROLE_AGENCY, ROLE_PUBLISHER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";

export interface SelectUserDataInterface extends SelectDataInterface {
  tagNew: object;
  searchInput: string;
}

export default (Vue as VueConstructor<Vue & SelectUserDataInterface>).extend({
  name: "VendorSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    resource: {
      type: String,
      default: SMS_VENDOR
    },
    type: {
      type: [Array, String],
      default: () => [ROLE_ADVERTISER, ROLE_AGENCY, ROLE_PUBLISHER]
    },
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    agencyId: {
      type: Number,
      default: null
    },
    label: {
      type: String,
      default: "Nhà phân phối"
    },
    itemText: {
      type: String,
      default: "vendor_name"
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
  computed: {
    params() {
      return {
        type: this.type,
        agency_id: this.agencyId
      };
    }
  },
  methods: {
    remove(item) {
      this.innerValue.splice(this.innerValue.indexOf(item), 1);
    }
  }
});
</script>
