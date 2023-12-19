<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-combobox
      :key="vid || $attrs.name"
      v-model="innerValue"
      class="v-combobox"
      dense
      :error-messages="errors"
      :items="itemsShow"
      :allow-overflow="false"
      :loading="$attrs.loading || loading"
      :search-input.sync="search"
      v-bind="$attrs"
      :no-data-text="
        $attrs.loading || loading
          ? 'Đang tải dữ liệu...'
          : 'Không tìm thấy dữ liệu.'
      "
      :return-object="returnObject"
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
  search: string;
  loading: boolean;
  innerValue: any;
  page: number;
  total: number;
  items: Array<any>;
}

interface ComponentMethods {
  debounceFetchData(): void;
  fetchData(): void;
  fetchMoreData(entries: Array<any>): void;
}

const ApiComboBoxWithValidation = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "ApiComboBoxWithValidation",
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
    filter: {
      type: Function,
      default: () => true
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
      search: null,
      loading: false,
      innerValue: null,
      page: 1,
      total: 0,
      debounceFetchData: null,
      items: []
    };
  },
  computed: {
    itemCount() {
      return this.items.length;
    },
    selectedText() {
      return this.innerValue ? this.innerValue[this.$attrs["item-text"]] : null;
    },
    params() {
      return {
        keyword: this.search !== this.selectedText ? this.search : "",
        page: this.page,
        ...this.queryParams
      };
    },
    itemsShow() {
      if (this.returnObject) {
        return pullAllBy(
          cloneDeep(this.items),
          this.excludes,
          this.itemValue || "id"
        );
      } else {
        return this.items.filter(item => {
          const value = item[this.itemValue || "id"];
          return !this.excludes.includes(value);
        });
      }
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
    search(newVal) {
      if (newVal !== this.selectedText || !newVal) {
        this.items = [];
        this.page = 0;
        this.total = 0;
        this.debounceFetchData();
      }
    },
    queryParams() {
      this.items = [];
      this.page = 0;
      this.total = 0;
      this.debounceFetchData();
    }
  },
  created() {
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 1000);
    if (this.value) {
      this.innerValue = this.value;
    }
  },
  mounted() {
    this.fetchData();
  },
  beforeDestroy() {
    this.page = 1;
  },
  methods: {
    async fetchData() {
      try {
        const { data } = await this.$axios.post(
          `${this.resource}/select`,
          this.params
        );
        this.total = data.total;
        this.items = [...this.items, ...data.data];
      } catch (e) {
        console.log(e);
      }
    },
    async fetchMoreData(entries) {
      if (entries[0].isIntersecting && !this.loading) {
        this.page++;
        this.loading = true;
        await this.$nextTick();
        await this.debounceFetchData();
        this.loading = false;
      }
    }
  }
});

export default ApiComboBoxWithValidation;
export type ApiComboBoxWithValidationRef = InstanceType<
  typeof ApiComboBoxWithValidation
>;
</script>

<style lang="scss" scoped>
.v-combobox {
  &::v-deep .v-input__slot {
    margin-bottom: 0;
  }

  &::v-deep .v-messages {
    min-height: 0;
  }
}
</style>
