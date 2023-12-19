<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || $attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name || name"
  >
    <input v-model="innerValue" hidden type="text" />
    <v-card-title class="text-left pl-0 pb-0 v-label ">
      {{ label }}
      <span v-if="required" class="error--text">(*)</span>
    </v-card-title>
    <div :class="layoutClass">
      <v-checkbox
        v-if="hasCheckAll && items.length > 0"
        v-model="checkAll"
        label="Chọn tất cả"
        dense
        :class="checkboxClass"
        @click="handleCheckAllClick"
      >
      </v-checkbox>
      <v-checkbox
        v-for="(item, index) in items"
        :key="`${$attrs.name}-checkbox-${index}`"
        v-model="innerValue"
        :class="checkboxClass"
        :multiple="multiple"
        :label="item[itemText]"
        :value="itemValue ? item[itemValue] : item"
        dense
      >
        <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
        <template slot="append">
          <slot name="append.item" :item="item"></slot>
        </template>
        <template
          v-for="(_, name) in $scopedSlots"
          :slot="name"
          slot-scope="slotData"
        >
          <slot :name="name" v-bind="slotData" />
        </template>
      </v-checkbox>
      <div v-if="items.length === 0">Chưa có dữ liệu</div>
    </div>
    <error-display :errors="errors" />
  </validation-provider>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import { clone, cloneDeep, isEqual, sortBy } from "lodash";
import deepWrapper from "~/mixins/deepWrapper";
import BannerFormDialog from "~/components/page/manage-campaign/banner/BannerFormDialog.vue";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import input from "~/mixins/input";
import { isEqualDeep } from "~/helpers/ultis";

interface ComponentData {
  statusCopy: boolean;
  timeout: number;
}

interface ComponentMethods {
  copy(): void;
}

const VCheckboxWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "VCheckboxWithValidation",
  components: { ErrorDisplay },
  mixins: [deepWrapper, input],
  props: {
    hasCheckAll: {
      type: Boolean,
      default: false
    },
    vid: {
      type: String,
      default: null
    },
    multiple: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    layoutClass: {
      type: [String, Object],
      default: "layout flex wrap"
    },
    checkboxClass: {
      type: [String, Object],
      default: "px-2"
    },
    itemText: {
      type: String,
      default: "text"
    },
    itemValue: {
      type: String,
      default: "value"
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // checkAllProxy: false,
    };
  },
  computed: {
    checkAll: {
      get() {
        return this.innerValue.length === this.items.length;
      },
      set(value) {
        return value;
      }
    }
  },
  watch: {
    // innerValue: {
    //   deep: true,
    //   handler(val) {
    //     console.log(val);
    //   }
    // }
  },
  destroyed() {
    this.innerValue = [];
  },
  methods: {
    itemsChange() {
      this.innerValue = [];
    },
    // clearInnerValue() {
    //   this.innerValue = [];
    // },
    handleCheckAllClick() {
      if (this.innerValue.length === this.items.length) {
        this.innerValue = [];
      } else {
        this.innerValue = cloneDeep(this.items);
      }
    }
  }
});
export default VCheckboxWithValidation;
</script>
