<template>
  <v-menu
    v-model="showing"
    :origin="origin"
    transition="scale-transition"
    offset-x
    offset-overflow
  >
    <template #activator="{ on, attrs }">
      <CustomIcon
        v-bind="attrs"
        :icon="showIcon"
        :tooltip="tooltip"
        :desc="desc"
        :disabled="disabled"
        :color="color"
        v-on="on"
      >
      </CustomIcon>
    </template>
    <v-list dense min-width="240">
      <v-list-item
        v-for="(item, index) in items"
        :key="index"
        :input-value="isActive(item)"
        :disabled="item.disabled"
        :color="item.disabled ? '' : 'primary'"
        dense
        active-class="custom--active"
        @click="handleClick(item)"
      >
        <v-list-item-icon v-if="item.icon">
          <v-icon>
            {{ item.icon }}
          </v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          {{ item[itemText] }}
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import CustomIcon from "~/components/common/CustomIcon.vue";
import deepWrapper from "~/mixins/deepWrapper";

interface ComponentData {
  showing: boolean;
  selectedIcon: string;
}

interface ComponentMethods {
  handleClick(item: object): void;
  isActive(item: object): boolean;
}

const IconDropdownSelect = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "IconDropdownSelect",
  components: { CustomIcon },
  mixins: [deepWrapper],
  props: {
    icon: {
      type: String,
      default: ""
    },
    desc: {
      type: String,
      default: ""
    },
    tooltip: {
      type: String,
      default: ""
    },
    disabled: {
      type: Boolean,
      default: false
    },
    color: {
      type: String,
      default: ""
    },
    itemText: {
      type: String,
      default: "text"
    },
    itemValue: {
      type: String,
      default: "value"
    },
    replaceIcon: {
      type: Boolean,
      default: true
    },
    items: {
      type: Array,
      default: () => []
    },
    origin: {
      type: String,
      default: "top right"
    }
  },

  data() {
    return {
      showing: false,
      selectedIcon: null
    };
  },

  computed: {
    showIcon() {
      if (this.replaceIcon) {
        return this.selectedIcon || this.icon;
      }
      return this.icon;
    }
  },

  methods: {
    handleClick(item) {
      this.innerValue = item[this.itemValue];
      if (this.replaceIcon) {
        this.selectedIcon = item.icon;
      }
    },
    isActive(item) {
      return item[this.itemValue] === this.innerValue;
    }
  }
});

export default IconDropdownSelect;
export type IconDropdownSelectRef = InstanceType<typeof IconDropdownSelect>;
</script>

