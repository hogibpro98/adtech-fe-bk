<template>
  <v-menu offset-y offset-overflow transition="">
    <template #activator="{ on, attrs }">
      <v-text-field
        :value="innerValue.text"
        v-bind="$attrs"
        class="font-weight-regular"
        dense
        reverse
        single-line
        readonly
        hide-details
        v-on="on"
      >
        <template #prepend-inner>
          <v-icon v-if="isSorting" size="20" style="margin-top: 2px">{{
            sorting[1] === "desc" ? "arrow_downward" : "arrow_upward"
          }}</v-icon>
        </template>
      </v-text-field>
    </template>
    <v-list dense class="dense-list">
      <v-subheader class="pl-4"
        >Sắp xếp theo: {{ innerValue.text }}</v-subheader
      >
      <v-list-item
        v-for="(item, index) in sortOptions"
        :key="`sort-${index}`"
        :input-value="sortActive(item.value)"
        :disabled="!innerValue.value"
        :color="!innerValue.value ? '' : 'primary'"
        dense
        active-class="custom--active"
        @click="setSorting(item.value)"
      >
        <v-list-item-content>
          {{ item.text }}
        </v-list-item-content>
      </v-list-item>
      <v-subheader class="pl-4">Chọn số liệu</v-subheader>
      <v-list-item
        v-for="(item, index) in headers"
        :key="index"
        :input-value="isActive(item)"
        :disabled="item.disabled"
        :color="item.disabled ? '' : 'primary'"
        dense
        active-class="custom--active"
        @click="setValue(item)"
      >
        <v-list-item-content>
          {{ item.text }}
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import deepWrapper from "@/mixins/deepWrapper";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  innerValue: any;
  isSorting: boolean;
}

interface ComponentMethods {
  sortActive(val: string): boolean;
  setSorting(val: string): void;
  isActive(item: object): boolean;
  setValue(item: object): void;
}

const HeaderSelect = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "HeaderSelect",
  mixins: [deepWrapper],
  props: {
    headers: {
      type: Array,
      default: () => []
    },
    sorting: {
      type: Array,
      default: () => []
    },
    index: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      innerValue: {}
    };
  },
  computed: {
    sortOptions() {
      return [
        {
          value: "asc",
          text: "Từ thấp đến cao"
        },
        {
          value: "desc",
          text: "Từ cao đến thấp"
        },
        {
          value: null,
          text: "Không sắp xếp"
        }
      ];
    },
    isSorting() {
      return (
        typeof this.sorting[0] === "number" && this.sorting[0] === this.index
      );
    }
  },
  methods: {
    sortActive(val) {
      return this.isSorting && this.sorting[1] === val;
    },
    setSorting(value) {
      this.$emit("sorted", {
        index: this.index,
        value
      });
    },
    isActive(item) {
      return item.value === this.innerValue.value;
    },
    setValue(item) {
      this.innerValue = item;
    }
  }
});

export default HeaderSelect;
export type HeaderSelectRef = InstanceType<typeof HeaderSelect>;
</script>
