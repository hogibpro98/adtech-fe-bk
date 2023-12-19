<template>
  <div>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label"
      :rules="rules"
      :vid="fieldName"
    >
      <input v-model="innerValue" hidden type="text" />
      <label class="v-label">
        {{ label }}
      </label>
      <v-layout wrap>
        <v-flex xs12 class="v-text-field__details mt-2">
          Màn hình lớn
        </v-flex>
        <v-flex xs6 class="pr-2">
          <v-number-field-with-validation
            v-model="large.row"
            :loading="loading"
            label="Số hàng"
            suffix="hàng"
            min-value-fixed
            min-value="0"
            max-value="10000"
          />
        </v-flex>
        <v-flex xs6 class="pl-2">
          <v-number-field-with-validation
            v-model="large.column"
            :loading="loading"
            label="Số cột"
            suffix="cột"
            min-value-fixed
            min-value="0"
            max-value="10000"
          />
        </v-flex>
        <v-flex xs12 class="v-text-field__details mt-2">
          Màn hình nhỏ
        </v-flex>
        <v-flex xs6 class="pr-2">
          <v-number-field-with-validation
            v-model="small.row"
            :loading="loading"
            label="Số hàng"
            suffix="hàng"
            min-value-fixed
            min-value="0"
            max-value="10000"
          />
        </v-flex>
        <v-flex xs6 class="pl-2">
          <v-number-field-with-validation
            v-model="small.column"
            :loading="loading"
            label="Số cột"
            suffix="cột"
            min-value-fixed
            min-value="0"
            max-value="10000"
          />
        </v-flex>
        <error-display :errors="errors" class="mt-2" />
      </v-layout>
    </validation-provider>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import input from "~/mixins/input";
import ErrorDisplay from "~/components/common/ErrorDisplay.vue";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import { SizeData } from "~/interface/data/zone";
import { isEqualDeep } from "~/helpers/ultis";

interface ComponentData {
  innerValue: SizeData;
}

export default (Vue as VueConstructor & ComponentData).extend({
  name: "RowColumnInput",
  components: {
    VNumberFieldWithValidation,
    ErrorDisplay
  },
  mixins: [input],
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    label: {
      type: String,
      default: "Số lượng quảng cáo"
    },
    name: {
      type: String,
      default: ""
    },
    vid: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      large: this.value?.large || {
        row: 1,
        column: 5
      },
      small: this.value?.small || {
        row: 1,
        column: 3
      }
    };
  },
  computed: {
    fieldName() {
      return this.name || this.$attrs.name || this.vid || "row-column";
    },
    innerValue() {
      return {
        large: this.large,
        small: this.small
      };
    }
  },
  watch: {
    large: {
      handler(val) {
        this.$emit("input", {
          ...(this.value || {}),
          large: val || {}
        });
      },
      deep: true
    },
    small: {
      handler(val) {
        this.$emit("input", {
          ...(this.value || {}),
          small: val || {}
        });
      },
      deep: true
    },
    value: {
      handler(val, oldVal) {
        if (!isEqualDeep(val?.large, oldVal?.large)) {
          this.large = val?.large || {};
        }

        if (!isEqualDeep(val?.small, oldVal?.small)) {
          this.small = val?.small || {};
        }
      },
      deep: true
    }
  },
  methods: {}
});
</script>
