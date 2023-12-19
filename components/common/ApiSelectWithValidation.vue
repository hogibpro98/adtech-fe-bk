<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-autocomplete
      ref="selectRef"
      v-model="innerValue"
      :error-messages="errors"
      :attach="attach"
      :items="itemShow"
      :multiple="multiple"
      :loading="$attrs.loading || loading"
      :search-input.sync="search"
      :return-object="returnObject"
      :cache-items="cacheItems"
      :item-value="itemValue || 'id'"
      :item-text="itemText"
      :menu-props="menuPropsMerge"
      v-bind="$attrs"
      :no-data-text="
        $attrs.loading || loading
          ? 'Đang tải dữ liệu...'
          : 'Không tìm thấy dữ liệu.'
      "
      clearable
      no-filter
      v-on="$listeners"
    >
      <!-- Slot section. Inherit slot override custom slot -->
      <!-- Custom slot -->
      <template v-if="required" #label>
        {{ $attrs.label }} <span class="red--text"> (*) </span>
      </template>

      <template #append-item>
        <v-list-item
          v-if="itemCount < total"
          v-intersect="{
            handler: fetchMoreData,
            options: {
              threshold: [0.1]
            }
          }"
        >
          Đang tải thêm dữ liệu...
        </v-list-item>
      </template>

      <!-- Pass on all slots & slot scope-->
      <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      <template
        v-for="(_, name) in $scopedSlots"
        :slot="name"
        slot-scope="slotData"
      >
        <slot :name="name" v-bind="slotData" />
      </template>
    </v-autocomplete>
  </validation-provider>
</template>
<script lang="ts">
import { debounce, merge, unionBy } from "lodash";
import { isArray } from "@/util/typeof";
import { isEqualDeep } from "@/helpers/ultis";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  search: string;
  loading: boolean;
  innerValue: any;
  page: number;
  total: number;
  items: Array<any>;
  requestIndex: number;
  debounceReset: any;
  debounceFetchData: any;
}

interface ComponentMethods {
  reset(): void;

  debounceReset(): void;

  debounceFetchData(): void;

  fetchData(): void;

  fetchMoreData(entries: Array<any>): void;
}

const ApiSelectWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ApiSelectWithValidation",
  props: {
    resource: {
      type: String,
      required: true
    },
    queryParams: {
      type: Object,
      default: () => ({})
    },
    attach: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    itemValue: {
      type: String,
      default: "id"
    },
    // must be included in props
    value: {
      type: null,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    prependSelected: {
      type: Boolean,
      default: true
    },
    excludes: {
      type: Array,
      default: () => []
    },
    cacheItems: {
      type: Boolean,
      default: false
    },
    returnObject: {
      type: Boolean,
      default: true
    },
    itemText: {
      type: String,
      default: "name"
    },
    multiple: {
      type: Boolean,
      default: false
    },
    menuProps: {
      type: Object,
      default: () => ({
        maxWidth: "550px"
      })
    }
  },
  data() {
    return {
      search: null,
      loading: false,
      innerValue: null,
      page: 1,
      total: 0,
      items: [],
      requestIndex: 0,
      debounceReset: null,
      debounceFetchData: null,
      debounceFetchItem: null
    };
  },
  computed: {
    menuPropsMerge() {
      return {
        maxWidth: "550px",
        ...this.menuProps
      };
    },
    itemCount() {
      return this.items.length;
    },
    params() {
      return {
        keyword: this.search !== this.selectedText ? this.search : "",
        page: this.page,
        ...this.queryParams
      };
    },
    lazySearch() {
      return this.$refs.selectRef.lazySearch;
    },
    selectedText() {
      if (this.returnObject) {
        return this.innerValue ? this.innerValue[this.itemText] : null;
      } else {
        if (this.innerValue) {
          const selectedItem = this.items.find(
            e => e[this.itemValue] === this.innerValue
          );
          return selectedItem ? selectedItem[this.itemText] : "";
        }
        return "";
      }
    },
    itemShow() {
      const items = (this.items || []).filter(item => {
        if (!Array.isArray(this.excludes)) {
          return true;
        }
        return !this.excludes.some(
          exclude => exclude[this.itemValue] === item[this.itemValue]
        );
      });
      if (this.returnObject) {
        if (this.multiple) {
          if (this.innerValue && this.innerValue.length > 0) {
            items = unionBy(items, this.innerValue, this.itemValue);
          }
        } else if (this.innerValue) {
          items = unionBy(items, [this.innerValue], this.itemValue);
        }
      }
      return items;
    },
    selectedItem() {
      return this.$refs.selectRef?.selectedItem;
    }
  },
  watch: {
    // Handles internal model changes.
    async innerValue(newVal) {
      this.$emit("input", newVal);
      await this.$nextTick();
      this.$emit("select-item", this.selectedItem);
    },
    // Handles external model changes.
    value(newVal) {
      this.innerValue = newVal;
      if (newVal && !this.lazySearch) {
        this.debounceFetchItem();
      }
    },
    search(newVal, oldVal) {
      if (newVal !== oldVal) {
        // this.debounceFetchData();
        this.debounceReset();
      }
    },
    queryParams: {
      deep: true,
      async handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          await this.$nextTick();
          this.items = [];
          this.page = 1;
          this.total = 0;
          await this.$nextTick();
          this.debounceFetchData();
          this.innerValue = this.multiple ? [] : null;
        }
      }
    }
  },
  created() {
    this.debounceReset = debounce(
      function() {
        this.reset();
      },
      1000,
      {
        trailing: true,
        leading: true
      }
    );
    this.debounceFetchData = debounce(
      function() {
        this.loading = true;
        this.fetchData();
      },
      1000,
      {
        trailing: true,
        leading: true
      }
    );
    this.debounceFetchItem = debounce(
      function() {
        this.fetchSelectedItems();
      },
      1000,
      {
        trailing: true,
        leading: true
      }
    );
    if (this.value) {
      this.innerValue = this.value;
      if (this.prependSelected) {
        const selectedValue = isArray(this.value)
          ? [...this.value]
          : [this.value];
        this.items = unionBy(this.items, selectedValue, this.itemValue);
      }
      if (this.innerValue) {
        this.debounceFetchItem();
      }
    }
  },
  async mounted() {
    this.loading = true;
    await this.fetchData();
    await this.$nextTick();
  },
  beforeDestroy() {
    this.page = 0;
  },
  methods: {
    async reset() {
      this.loading = true;
      this.items = [];
      if (this.selectedItem && this.selectedItem[this.itemValue]) {
        this.items.push(this.selectedItem);
      }
      this.page = 1;
      this.total = 0;
      await this.$nextTick();
      this.fetchData();
    },

    async fetchData() {
      try {
        const { data } = await this.$axios.post(
          `${this.resource}/select`,
          this.params
        );
        // if (currentRequestIndex === this.requestIndex) {
        this.total = data.total;
        if (this.page === 1) {
          if (this.selectedItem && this.selectedItem[this.itemValue]) {
            this.items = unionBy(
              [this.selectedItem],
              data.data,
              this.itemValue
            );
          } else {
            this.items = data.data;
          }
        } else {
          this.items = unionBy(this.items, data.data, this.itemValue);
        }
        // }
      } catch (e) {}
      this.loading = false;
    },
    async fetchMoreData(entries) {
      if (entries[0].isIntersecting && !this.loading) {
        this.page++;
        await this.$nextTick();
        await this.fetchData();
      }
    },
    async fetchSelectedItems() {
      try {
        let queryData = {};
        if (this.multiple) {
          queryData = {
            page: 1,
            ...this.queryParams
          };
          queryData[`select_${this.itemValue}`] = this.returnObject
            ? this.innerValue.map(e => e[this.itemValue])
            : this.innerValue;
        } else {
          queryData = {
            page: 1,
            ...this.queryParams
          };
          queryData[`select_${this.itemValue}`] = this.returnObject
            ? this.innerValue[this.itemText]
            : this.innerValue;
        }
        const { data } = await this.$axios.post(
          `${this.resource}/select`,
          queryData
        );
        // if (currentRequestIndex === this.requestIndex) {
        this.items = unionBy(this.items, data.data, this.itemValue);
        // }
      } catch (e) {}
    }
  }
});

export default ApiSelectWithValidation;
export type ApiSelectWithValidationRef = InstanceType<
  typeof ApiSelectWithValidation
>;
</script>
