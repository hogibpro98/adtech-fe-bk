<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || $attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name || name"
  >
    <v-overlay v-if="loading" absolute color="#fff" class="z-1">
      <v-progress-circular :width="4" :size="25" indeterminate color="primary">
      </v-progress-circular>
    </v-overlay>
    <v-card-title class="text-left pl-0 pb-0  label-md font-16">
      {{ label }}
      <span v-if="required" class="error--text">(*)</span>
    </v-card-title>
    <div>
      <v-checkbox
        v-for="(item, index) in items"
        :key="`${$attrs.name}-checkbox-${index}`"
        v-model="innerValue.services"
        :multiple="multiple"
        hide-details
        :label="item.text"
        :value="item.value"
        dense
        class="justify-content-space-between service-checkbox"
      >
        <template v-if="hasService(item.value) && hasPlan" slot="append">
          <validation-provider
            v-slot="{ errors, valid }"
            :name="label || $attrs.label"
            :rules="rules"
            :vid="`plan-${index}`"
          >
            <v-radio-group
              v-model="innerValue[item.value]"
              hide-details
              class="mt-3"
              :error-messages="errors && errors[0]"
            >
              <v-row justify="space-between" align="center">
                <v-radio
                  class="mb-0 mr-2"
                  label="Trả trước"
                  dense
                  hide-details
                  value="prepaid"
                />
                <v-radio
                  class="mb-0  mr-2"
                  label="Trả sau"
                  dense
                  hide-details
                  value="postpaid"
                />
              </v-row>
            </v-radio-group>
          </validation-provider>
        </template>
      </v-checkbox>
    </div>
    <error-display :errors="errors" />
  </validation-provider>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { cloneDeep, difference, union, unionBy, without } from "lodash";
import VCheckboxWithValidation from "~/components/common/VCheckboxWithValidation.vue";
import deepWrapper from "~/mixins/deepWrapper";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import { isEqualDeep } from "~/helpers/ultis";

const DEFAULT_SERVICE = {
  services: [],
  mms: null,
  sms: null,
  data: null,
  redirect: null,
  "sms-vendor": null
};

export default (Vue as VueConstructor).extend({
  name: "ServiceCheckbox",
  components: { ErrorDisplay, VCheckboxWithValidation },
  mixins: [input],
  props: {
    label: {
      type: String,
      default: "Dịch vụ sử dụng"
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    multiple: {
      type: Boolean,
      default: true
    },
    value: {},
    hasPlan: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    textValue: {
      type: Array,
      default: () => []
    },
    queryPrams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerValue: cloneDeep(DEFAULT_SERVICE),
      items: [
        {
          value: "sms",
          text: "Tin nhắn SMS"
        },
        {
          value: "mms",
          text: "Tin nhắn MMS"
        },
        {
          value: "redirect",
          text: "Quảng cáo redirect"
        },
        {
          value: "data",
          text: "Tài trợ data"
        },
        {
          value: "sms-vendor",
          text: "Tin nhắn ngoại mạng"
        }
      ]
    };
  },
  computed: {
    selectedService() {
      return this.innerValue.services;
    },
    services() {
      return this.items.map(e => e.value);
    },
    params() {
      return { ...this.queryPrams };
    }
  },
  watch: {
    innerValue: {
      handler(val, oldVal) {
        // if (!isEqualDeep(val, oldVal)) {
        this.$emit("input", this.mapServices(val));
        this.$emit("update:text-value", val.services);
        // }
      },
      deep: true
    },
    // Handles external model changes.
    value: {
      async handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.innerValue = this.parseServices(val);
        }
      },
      deep: false
    },
    textValue(val) {
      this.innerValue.services = val;
    },
    selectedService(val) {
      const unselected = difference(this.services, val);
      unselected.forEach(e => {
        // this.$delete(this.innerValue, e);
        this.innerValue[e] = null;
      });
    }
  },
  created() {
    this.fetchItems();
    this.innerValue = this.parseServices(this.value);
  },
  methods: {
    parseServices(services) {
      const obj = cloneDeep(DEFAULT_SERVICE);
      if (Array.isArray(services)) {
        services.forEach(e => {
          obj.services = union(obj.services, [e.name]);
          obj[e.name] = e.plan;
        });
      }
      return obj;
    },
    mapServices(serviceObj) {
      let res = [];
      if (Array.isArray(serviceObj.services)) {
        res = serviceObj.services.map(e => {
          return {
            name: e,
            plan: serviceObj[e] ? serviceObj[e] : null
          };
        });
      }
      return res;
    },
    hasService(service) {
      return this.innerValue.services?.includes(service);
    },
    async fetchItems() {
      try {
        const { data } = await this.$axios.post("/service/select", this.params);
        this.items = data.data.map(e => {
          return {
            value: e.name,
            text: e.display_name
          };
        });
      } catch (e) {
        console.log(e);
      }
    }
  }
});
</script>
<style lang="scss">
.service-checkbox {
  .v-input__control {
    width: unset !important;
  }

  .v-input--selection-controls {
    margin-top: 0px;
    padding-top: 0px;
  }
}
</style>
