<template>
  <v-select-with-validation
    v-model="innerValue"
    :label="label"
    v-bind="$attrs"
    :item-value="valueProp"
    :items="menu"
    name="page"
    v-on="$listeners"
  >
    <template #item="{ item }">
      <span :class="`mr-${item.depth * 2}`"></span>
      {{ item.text }}
    </template>
  </v-select-with-validation>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import VSelectWithValidation from "~/components/common/VSelectWithValidation.vue";
import menus from "~/api/menu";

const NAME = "name";

interface ComponentData {
  menu: Array<object>;
  innerValue: string | object | Array<object>;
}

interface ComponentMethods {
  filterMenu(menuFilters: Array<object>): Array<object>;
  flattenTree(
    result: Array<object>,
    menu: Array<object>,
    depth: number,
    parentName: string
  ): Array<object>;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "PageSelect",
  components: { VSelectWithValidation },
  props: {
    value: {
      type: null,
      default: null
    },
    valueProp: {
      type: String,
      default: "value"
    },
    label: {
      type: String,
      default: "Trang"
    }
  },
  data() {
    return {
      menu: [],
      innerValue: null
    };
  },
  computed: {
    isName() {
      return this.valueProp === NAME;
    }
  },
  watch: {
    // Handles internal model changes.
    innerValue(newVal) {
      this.$emit("input", newVal);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
    }
  },
  created() {
    if (this.value) {
      this.innerValue = this.value;
    }
    this.menu = this.flattenTree([], this.filterMenu(cloneDeep(menus)));
  },

  methods: {
    filterMenu(menuFilters) {
      return menuFilters.filter(item => {
        if (item.items) {
          item.items = this.filterMenu(item.items);
          return item.items.length > 0;
        } else {
          return item.title;
        }
      });
    },
    flattenTree(result, menu, depth = 0) {
      menu.forEach(item => {
        const currentDepth = depth;
        const value = item.href
          ? item.href.substring(1).replace(/\//g, "-")
          : item.title;
        if (item.items) {
          result.push({
            value,
            href: item.href || item.title,
            text: item.title,
            depth: currentDepth,
            disabled: true
          });

          item.items = this.flattenTree(
            result,
            item.items,
            currentDepth + 1,
            value
          );
        } else {
          result.push({
            value,
            href: item.href || null,
            text: item.title,
            depth: currentDepth,
            disabled: !(value && item.title)
          });
        }
      });

      return result;
    }
  }
});
</script>
