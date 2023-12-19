<template>
  <v-menu
    v-model="showing"
    :close-on-content-click="false"
    :close-on-click="true"
    content-class="filter-item-menu"
    attach
    nudge-bottom="60"
    tile
    nudge-right="20"
    z-index="20"
  >
    <v-card min-width="360" max-width="360">
      <v-toolbar flat dense color="primary">
        <v-layout justify-space-between class="px-4">
          <v-toolbar-title class="d-flex align-center white--text">
            {{ filter.label }}
          </v-toolbar-title>
          <v-btn small icon dark @click="showing = false">
            <v-icon> mdi-close</v-icon>
          </v-btn>
        </v-layout>
      </v-toolbar>
      <validation-observer v-slot="{ handleSubmit }">
        <v-card-actions class="pt-6 px-4">
          <template v-if="filter.type === filterType.NUMBER">
            <v-row class="px-4">
              <v-flex xs6>
                <v-number-field-with-validation
                  :key="`${filter.name}-min`"
                  v-model="filter.min"
                  v-bind="filter.props"
                  :name="`${filter.name}-min`"
                  :rules="mergerRuleLessOrNull"
                  label="Min"
                  dense

                >
                </v-number-field-with-validation>
              </v-flex>
              <v-flex xs6>
                <v-number-field-with-validation
                  :key="`${filter.name}-max`"
                  v-model="filter.max"
                  v-bind="filter.props"
                  :name="`${filter.name}-max`"
                  :rules="mergerRuleGreaterOrNull"
                  label="Max"
                  dense

                >
                </v-number-field-with-validation>
              </v-flex>
            </v-row>
          </template>
          <template v-if="filter.type === filterType.CURRENCY">
            <v-row class="px-4">
              <v-flex xs6>
                <v-number-field-with-validation
                  :key="`${filter.name}-min`"
                  v-model="filter.min"
                  :name="`${filter.name}-min`"
                  :rules="mergerRuleLessOrNull"
                  label="Min"
                  dense
                  autofocus
                  suffix="₫"
                >
                </v-number-field-with-validation>
              </v-flex>
              <v-flex xs6>
                <v-number-field-with-validation
                  :key="`${filter.name}-max`"
                  v-model="filter.max"
                  :name="`${filter.name}-max`"
                  :rules="mergerRuleGreaterOrNull"
                  label="Max"
                  suffix="₫"
                  dense
                >
                </v-number-field-with-validation>
              </v-flex>
            </v-row>
          </template>
          <template v-else-if="filter.type === filterType.DATE">
            <v-flex xs12>
              <date-range-picker-flat
                :key="`${filter.name}-date`"
                v-model="filter.value"
                :name="`${filter.name}`"
                label="Khoảng ngày"
                dense
                model-format="YYYY-MM-DD"
                clearable
                autofocus
                auto-hide
                :config-props="filter.configProps"
                required
                rules="required"
              ></date-range-picker-flat>
            </v-flex>
          </template>
          <template v-else-if="filter.type === filterType.SELECT">
            <v-flex xs12>
              <v-select-with-validation
                :key="`${filter.name}-select`"
                v-model="filter.selected"
                :name="`${filter.name}-select`"
                :items="filter.items"
                :multiple="filter.muliple"
                :menu-props="menuProps"
                dense
                :label="filter.label"
                autofocus
                rules="required"
                item-value="value"
                item-text="text"
              >
              </v-select-with-validation>
            </v-flex>
          </template>
          <template v-else-if="filter.type === filterType.RESOURCE">
            <v-flex xs12>
              <Component
                :is="filter.component"
                :key="`${filter.name}-resource`"
                v-model="filter.selected"
                :label="filter.label"
                v-bind="filter.props"
                :name="`${filter.name}-resource`"
                :menu-props="menuProps"
                attach
                autofocus
                rules="required"
                clearable
                dense
              ></Component>
            </v-flex>
          </template>
          <template v-else-if="filter.type === filterType.BOOLEAN">
            <v-flex xs12>
              <boolean-select
                :key="`${filter.name}-switch`"
                v-model="filter.value"
                :name="`${filter.name}-switch`"
                :placeholder="filter.label"
                :label="filter.label"
                dense
                autofocus
                hide-details
              ></boolean-select>
            </v-flex>
          </template>
          <template v-else-if="filter.type === filterType.CUSTOM">
            <v-flex xs12>
              <Component
                :is="filter.component"
                :key="`${filter.name}`"
                v-model="filter.value"
                v-bind="filter.props"
                :name="`${filter.name}`"
                :label="filter.label"
                attach
                rules="required"
                autofocus
              ></Component>
            </v-flex>
          </template>
          <template v-else-if="filter.type === filterType.TEXT">
            <v-flex xs12>
              <v-text-field-with-validation
                :key="`${filter.name}`"
                v-model="filter.value"
                :name="`${filter.name}`"
                :label="filter.label"
                rules="required"
                dense
                autofocus
              >
              </v-text-field-with-validation>
            </v-flex>
          </template>
        </v-card-actions>
        <v-row justify="end" class="px-4 pb-2 pt-4 mb-0">
          <v-btn
            color="primary"
            class="mr-2"
            text
            @click.native="handleSubmit(applyFilter)"
          >
            Áp dụng
          </v-btn>
        </v-row>
      </validation-observer>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import * as typeofValue from "@/util/typeof";
import cloneDeep from "lodash/cloneDeep";
import Vue, { VueConstructor } from "vue";
import * as FILTER_TYPE from "~/constants/filterType";
import VNumberFieldWithValidation from "~/components/common/VNumberFieldWithValidation.vue";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import BooleanSelect from "~/components/select/BooleanSelect.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import DateRangePickerFlat from "~/components/common/DateRangePickerFlat.vue";
import { FilterInterface } from "~/interface/data/filter";
import { hasValue } from "~/helpers/ultis";

interface ComponentMethods {
  show: Function;

  resetData(): void;
}

interface ComponentData {
  showing: boolean;
  filterType: string;
  filter: FilterInterface;
}

interface ComponentComputed {
  selected: boolean;
}

const FilterItem = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed
>).extend({
  name: "FilterItem",
  components: {
    DateRangePickerFlat,
    VTextFieldWithValidation,
    BooleanSelect,
    VSelectWithValidation,
    VNumberFieldWithValidation
  },
  props: {
    idParent: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showing: false,
      filter: {
        selected: null
      },
      filterType: FILTER_TYPE,
      menuProps: {
        maxWidth: "450px"
      }
    };
  },
  computed: {
    selected() {
      return this.filter.selected || {};
    },
    mergerRuleGreaterOrNull() {
      if (typeofValue.isString(this.filter.props.rules)) {
        return `${this.filter.props.rules}|required|greaterOrNull:${this.filter.name}-min`;
      } else if (typeofValue.isObject(this.filter.props.rules)) {
        return {
          ...this.filter.props.rules,
          greaterOrNull: `${this.filter.name}-min`,
          required: true
        };
      } else {
        return {
          greaterOrNull: `${this.filter.name}-min`,
          required: true
        };
      }
    },
    mergerRuleLessOrNull() {
      if (typeofValue.isString(this.filter.props.rules)) {
        return `${this.filter.props.rules}|required|lessOrNull:${this.filter.name}-max`;
      } else if (typeofValue.isObject(this.filter.props.rules)) {
        return {
          ...this.filter.props.rules,
          required: true,
          lessOrNull: `${this.filter.name}-max`
        };
      } else {
        return {
          lessOrNull: `${this.filter.name}-max`,
          required: true
        };
      }
    }
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    },
    selected(val) {
      if (this.filter.type === FILTER_TYPE.SELECT) {
        this.filter.value = val;
      } else {
        this.filter.value = val[this.filter.itemValue];
      }
    }
  },
  methods: {
    async show(item) {
      this.filter = cloneDeep(item);
      await this.$nextTick();
      if (this.filter.selected) {
        this.filter.value = item.selected;
      }
      await this.$nextTick();

      if (item.value) {
        this.filter.value = item.value;
      }
      this.showing = true;
    },

    applyFilter() {
      if (
        hasValue(this.filter.selected) &&
        this.filter.type === FILTER_TYPE.SELECT
      ) {
        this.filter.value = this.filter.selected;
      }
      this.$emit("apply", this.filter);
      this.showing = false;
    },

    resetData() {
      this.filter = {
        value: null
      };
    }
  }
});
export default FilterItem;
export type FilterItemRef = InstanceType<typeof FilterItem>;
</script>
<style>
.filter-item-menu {
  contain: inherit;
  overflow: inherit;
}
</style>
