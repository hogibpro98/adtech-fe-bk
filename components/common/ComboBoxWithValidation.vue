<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-combobox
      ref="selectRef"
      :key="vid || $attrs.name"
      v-model="innerValue"
      :error-messages="errors"
      :items="itemsShow"
      :loading="$attrs.loading || loading"
      v-bind="$attrs"
      :return-object="returnObject"
      hide-no-data
      :search-input.sync="search"
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
    </v-combobox>
  </validation-provider>
</template>
<script lang="ts">
import { debounce, pullAllBy, cloneDeep } from "lodash";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  loading: boolean;
  innerValue: any;
  items: Array<any>;
}

interface ComponentMethods {
  debounceFetchData(): void;

  fetchData(): void;
}

const ComboBoxWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ComboBoxWithValidation",
  props: {
    resource: {
      type: String,
      required: true
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: null,
      default: null
    },
    excludes: {
      type: Array,
      default: () => []
    },
    required: {
      type: Boolean,
      default: false
    },
    returnObject: {
      type: Boolean,
      default: true
    },
    itemValue: {
      type: String,
      default: null
    },
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      innerValue: null,
      items: [],
      total: 0,
      page: 1,
      search: null,
      debounceReset: null,
      debounceFetchData: null,
      debounceFetchItem: null
    };
  },
  computed: {
    itemsShow() {
      if (this.returnObject && !this.itemValue) {
        return pullAllBy(
          cloneDeep(this.items),
          this.excludes,
          this.itemValue || "id"
        );
      } else {
        return this.items.filter(item => {
          return !this.excludes.includes(item);
        });
      }
    },
    itemCount() {
      return this.items.length;
    },
    params() {
      return {
        keyword: this.search,
        page: this.page,
        ...this.queryParams
      };
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
    },
    search(newVal, oldVal) {
      if (newVal !== oldVal) {
        // this.debounceFetchData();
        this.debounceReset();
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

    if (this.value) {
      this.innerValue = this.value;
    }
  },
  async mounted() {
    this.loading = true;
    await this.fetchData();
    await this.$nextTick();
  },
  methods: {
    async reset() {
      this.loading = true;
      this.items = [];
      // if (this.selectedItem && this.selectedItem[this.itemValue]) {
      //   this.items.push(this.selectedItem);
      // }
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
        this.total = data.total;
        if (!this.returnObject || this.itemValue) {
          this.items = [
            ...this.items,
            ...data.data.map(item => item[this.itemValue || "id"])
          ];
        } else {
          this.items = [...this.items, ...data.data];
        }
      } catch (e) {}
      this.loading = false;
    },
    async fetchMoreData(entries) {
      if (entries[0].isIntersecting && !this.loading) {
        this.page++;
        await this.$nextTick();
        await this.fetchData();
      }
    }
  }
});

export default ComboBoxWithValidation;
export type ComboBoxWithValidationRef = InstanceType<
  typeof ComboBoxWithValidation
>;
</script>
