<template>
  <div :id="idFilter" class="filter-bar toolbar">
    <v-layout align-center wrap class="mt-0">
      <v-menu
        max-width="240"
        offset-y
        :attach="attach"
        transition="scale-transition"
        z-index="20"
        nudge-right="32"
      >
        <template #activator="{ on, attrs }">
          <v-row align="center" class="px-6 flex-wrap" v-on="on">
            <v-col xs12>
              <v-icon :color="hasFilter ? 'primary' : null">filter_alt</v-icon>
              <v-btn dense text class="ma-1">
                Thêm bộ lọc
              </v-btn>
              <v-chip
                v-for="(filter, index) in activeFilters"
                :key="`active-filter-${filter.name}`"
                color="primary"
                class="ma-1 filter-chip"
                close
                @click.stop="openFilter(filter)"
                @click:close="clearFilter(filter)"
              >
                <span class="truncate-1"> {{ chipLabel(filter) }} </span>
              </v-chip>
            </v-col>
          </v-row>
        </template>
        <v-list dense>
          <v-text-field
            v-model="search"
            :height="16"
            flat
            solo
            dense
            autofocus
            append-icon="search"
            placeholder="Tìm kiếm"
            hide-details
            class="hidden-sm-and-down filter-search-input px-1"
          ></v-text-field>
          <v-divider />
          <v-list-item
            v-for="(filter, index) in searchFilters"
            :key="`${filter.name}_${index}`"
            :input-value="isActive(filter)"
            dense
            color="primary"
            ripple="ripple"
            active-class="custom--active"
            @click="openFilter(filter)"
          >
            <v-list-item-content>
              {{ filter.label }}
            </v-list-item-content>
          </v-list-item>
          <v-list-item v-if="searchFilters.length === 0">
            <v-list-item-title>
              Không tìm thấy bộ lọc
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-layout>
    <filter-item
      ref="filterItem"
      :id-parent="idFilter"
      @apply="applyFilterItem"
    />
  </div>
</template>

<script lang="ts">
import { isArray } from "@/util/typeof";
import { v4 as uuidv4 } from "uuid";
import Vue, { VueConstructor } from "vue";
import WrapperInterface from "@/interface/mixins/wrapper";
import deepWrapper from "~/mixins/deepWrapper";
import FilterItem, {
  FilterItemRef
} from "~/components/common/NewCustomFilter/FilterItem.vue";
import {
  BOOLEAN,
  DATE,
  NUMBER,
  RESOURCE,
  SELECT
} from "~/constants/filterType";
import { TRUE } from "~/constants/code";
import { FilterInterface } from "~/interface/data/filter";
import { hasValue, isEqualDeep } from "~/helpers/ultis";

interface ComponentData {
  search: string;
  innerFilters: Array<FilterInterface>;
  idFilter: string;
  $refs: {
    filterItem: FilterItemRef;
  };
}

interface ComponentMethods {
  getPageQuery(): void;

  setInnerValue(): void;

  renderShowDefault(filter: FilterInterface): string;

  handleBoolFilter(filter: FilterInterface): void;

  handleNumberFilter(filter: FilterInterface): void;

  renderShowSelect(filter: FilterInterface): string;

  renderShowResource(filter: FilterInterface): string;

  renderShowDate(filter: FilterInterface): string;
}

interface ComponentComputed {
  hasFilters: boolean;
}

const NewCustomFilter = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods & ComponentComputed & WrapperInterface
>).extend({
  name: "NewCustomFilter",
  components: { FilterItem },
  // mixins: [deepWrapper],
  props: {
    // @ts-ignore
    value: {},
    filters: {
      type: Array,
      default: () => []
    },
    attach: {
      type: [Boolean, String],
      default: true
    }
  },
  data() {
    return {
      innerFilters: [],
      innerValue: {},
      search: "",
      idFilter: `filter-${uuidv4()}`
    };
  },
  computed: {
    hasFilter() {
      if (this.innerValue) {
        return (
          Object.values(this.innerValue).filter(e => e || e === 0).length > 0
        );
      }
      return false;
    },
    activeFilters() {
      return this.innerFilters.filter(e => {
        if (e.type === NUMBER) {
          return hasValue(e.min) || hasValue(e.max);
        } else {
          return hasValue(e.value) || (isArray(e.value) && e.value.length > 0);
        }
      });
    },
    searchFilters() {
      return this.innerFilters.filter(e => {
        return (
          this.$options.filters
            .toEnglish(e.label)
            .toLowerCase()
            .includes(
              this.$options.filters.toEnglish(this.search).toLowerCase()
            ) && e.visible !== false
        );
      });
    }
  },
  watch: {
    filters: {
      handler(val) {
        this.innerFilters = val;
      },
      deep: true
    },
    value: {
      async handler(val, old) {
        if (!isEqualDeep(val, old)) {
          this.updateValue(val);
        }
      },
      deep: true
    },
    innerValue: {
      async handler(val, old) {
        this.$emit("input", val);
        if (!isEqualDeep(val, old)) {
          await this.$nextTick();
          const newInnerFilters = this.filters.map(e => {
            if (e.type === NUMBER) {
              const minKey = `${e.type}_min_${e.name}`;
              const maxKey = `${e.type}_max_${e.name}`;
              if (hasValue(val[minKey])) {
                e.min = val[minKey];
              }
              if (hasValue(val[maxKey])) {
                e.max = val[maxKey];
              }
            } else if (e.type !== RESOURCE) {
              const key = e.request_name || `${e.type}_${e.name}`;
              if (hasValue(val[key])) {
                e.value = val[key];
                e.selected = val[key];
              }
            } else {
              const key = e.request_name || `${e.type}_${e.name}`;
              if (hasValue(val[key]) && !hasValue(e.value)) {
                e.value = val[key];
                e.selected = val[key];
              }
            }

            return e;
          });
          await this.$nextTick();
          this.innerFilters = newInnerFilters;
        }
      },
      deep: true
    }
  },
  async created() {
    this.innerFilters = this.filters;
    await this.$nextTick();
    this.updateValue(this.value);
    this.setupLocalStorageClearTime();
  },
  mounted() {
    this.getPageQuery();
  },
  methods: {
    updateValue(val) {
      if (Array.isArray(val) || val === null || val === undefined) {
        this.innerValue = {};
      } else {
        this.innerValue = val;
      }
    },
    setupLocalStorageClearTime() {
      const hour = 2;
      const now = new Date().getTime();
      const setupTime = localStorage.getItem("setupTime");
      if (setupTime == null) {
        localStorage.setItem("setupTime", now);
      } else if (now - setupTime > hour * 60 * 60 * 1000) {
        localStorage.removeItem("local_resource");
        localStorage.setItem("setupTime", now);
      }
    },
    openFilter(filter) {
      this.$refs.filterItem.show(filter);
    },
    isActive(filter) {
      return (
        hasValue(filter.min) || hasValue(filter.max) || hasValue(filter.value)
      );
    },
    setInnerValue(name, value) {
      this.$set(this.innerValue, name, value);
    },
    clearFilter(filter) {
      const index = this.innerFilters.map(e => e.name).indexOf(filter.name);
      if (filter.type === NUMBER) {
        this.$delete(
          this.innerValue,
          filter.request_name
            ? `${filter.request_name}_min`
            : `number_min_${filter.name}`
        );
        this.$delete(
          this.innerValue,
          filter.request_name
            ? `${filter.request_name}_max`
            : `number_max_${filter.name}`
        );
        this.$delete(this.innerFilters[index], "min");
        this.$delete(this.innerFilters[index], "max");
      } else {
        this.$delete(
          this.innerValue,
          filter.request_name || `${filter.type}_${filter.name}`
        );
        this.$delete(this.innerFilters[index], "value");
        if (filter.filter_type !== SELECT) {
          this.$delete(this.innerFilters[index], "selected");
        }
      }
    },
    async applyFilterItem(filter) {
      const index = this.innerFilters.map(e => e.name).indexOf(filter.name);
      await this.$nextTick();
      if (filter.renderQuery) {
        filter.renderQuery(filter, this.setInnerValue);
      } else if (filter.type === NUMBER) {
        if (filter.request_name) {
          this.$set(this.innerValue, `${filter.request_name}_min`, filter.min);
          this.$set(this.innerValue, `${filter.request_name}_max`, filter.max);
        } else {
          this.$set(this.innerValue, `number_min_${filter.name}`, filter.min);
          this.$set(this.innerValue, `number_max_${filter.name}`, filter.max);
        }
      } else if (filter.type === RESOURCE) {
        const key = filter.request_name || `${filter.type}_${filter.name}`;
        await this.$nextTick();
        if (isArray(filter.selected)) {
          this.$set(
            filter,
            "value",
            filter.selected.map(e => e[filter.itemValue])
          );
        }
        const localResource = localStorage.getItem("local_resource");
        if (localResource === null) {
          const localResource = {};
          localResource[`${filter.name}`] = [];
          if (isArray(filter.selected)) {
            filter.selected.forEach(e => {
              localResource[`${filter.name}`].push(e);
            });
          } else {
            localResource[`${filter.name}`].push(filter.selected);
          }
          localStorage.setItem("local_resource", JSON.stringify(localResource));
        } else {
          const localResourceObj = JSON.parse(localResource);
          if (!isArray(filter.selected)) {
            if (localResourceObj[`${filter.name}`] === undefined) {
              localResourceObj[`${filter.name}`] = [filter.selected];
            } else if (
              !localResourceObj[`${filter.name}`].find(
                el => el.id === filter.selected.id
              )
            ) {
              localResourceObj[`${filter.name}`].push(filter.selected);
            }
          } else if (localResourceObj[`${filter.name}`] === undefined) {
            localResourceObj[`${filter.name}`] = [];
            filter.selected.forEach(e => {
              localResourceObj[`${filter.name}`].push(e);
            });
          } else {
            filter.selected.forEach(e => {
              if (
                !localResourceObj[`${filter.name}`].find(el => el.id === e.id)
              ) {
                localResourceObj[`${filter.name}`].push(e);
              }
            });
          }
          localStorage.setItem(
            "local_resource",
            JSON.stringify(localResourceObj)
          );
        }
        this.$set(this.innerValue, key, filter.value);
      } else {
        const key = filter.request_name || `${filter.type}_${filter.name}`;
        this.$set(this.innerValue, key, filter.value);
      }
      await this.$nextTick();
      this.innerFilters.splice(index, 1, filter);
    },
    chipLabel(filter) {
      if (filter.renderShow) {
        return filter.renderShow(filter);
      } else {
        return this.renderShowDefault(filter);
      }
    },
    handleNumberFilter(filter) {
      const formatNumber = this.$options.filters.formattedNumber;
      const min = formatNumber(filter.min);
      const max = formatNumber(filter.max);
      if (min !== undefined && max !== undefined) {
        return `${filter.label}: ${min} <= x <= ${max}`;
      } else if (min !== undefined) {
        return `${filter.label} >= ${min}`;
      } else if (max !== undefined) {
        return `${filter.label} <= ${max}`;
      }
    },
    handleBoolFilter(filter) {
      const boolText = filter.value === TRUE ? "Có" : "Không";
      return `${filter.label}: ${boolText}`;
    },
    renderShowSelect(filter) {
      if (isArray(filter.value)) {
        const itemSelected = filter.items.filter(e => {
          return filter.value.includes(e.value);
        });
        return `${filter.label}: ${itemSelected
          .map(({ text }) => text)
          .join(", ") || filter.value}`;
      } else {
        const itemSelected =
          filter.items.find(({ value }) => value === filter.value) || {};
        return `${filter.label}: ${itemSelected.text || filter.value}`;
      }
    },
    renderShowResource(filter) {
      const itemResourceSelected = filter.selected || {};
      const localResource = JSON.parse(localStorage.getItem("local_resource"));
      if (isArray(itemResourceSelected)) {
        return `${filter.label}: ${itemResourceSelected
          .map(e => e[filter.itemText])
          .join(", ") || filter.value}`;
      } else {
        let displayChip = "";
        if (
          localResource !== null &&
          localResource[`${filter.name}`]?.find(e => e.id == filter.value)
        ) {
          displayChip = localResource[`${filter.name}`].find(
            e => e.id == filter.value
          )[filter.itemText];
        } else {
          displayChip = "ID " + filter.value;
        }
        return `${filter.label}: ${itemResourceSelected[filter.itemText] ||
          displayChip}`;
      }
    },
    renderShowDate(filter) {
      let dateRangeText = "";
      const [dateFrom, dateTo] = filter.value;
      if (dateFrom) {
        dateRangeText += `từ ${this.$options.filters.date(dateFrom)} `;
      }
      if (dateTo) {
        dateRangeText += `đến ${this.$options.filters.date(dateTo)} `;
      }
      return `${filter.label}: ${dateRangeText}`;
    },
    renderShowDefault(filter) {
      switch (filter.type) {
        case NUMBER:
          return this.handleNumberFilter(filter);
        case BOOLEAN:
          return this.handleBoolFilter(filter);
        case SELECT:
          return this.renderShowSelect(filter);
        case RESOURCE:
          return this.renderShowResource(filter);
        case DATE:
          return this.renderShowDate(filter);
        default:
          return `${filter.label}: ${filter.value}`;
      }
    },
    getPageQuery() {
      const { query } = this.$route;
      const value = {};
      let key;
      this.innerFilters.forEach((e, index) => {
        if (e.type === NUMBER) {
          let minKey;
          let maxKey;
          if (e.request_name) {
            minKey = `${e.request_name}_min`;
            maxKey = `${e.request_name}_max`;
          } else {
            minKey = `${e.type}_min_${e.name}`;
            maxKey = `${e.type}_max_${e.name}`;
          }
          if (query[minKey]) {
            value[minKey] = query[minKey];
            this.$set(this.innerFilters[index], "min", query[minKey]);
          }
          if (query[maxKey]) {
            value[maxKey] = query[maxKey];
            this.$set(this.innerFilters[index], "max", query[maxKey]);
          }
        } else {
          key = e.request_name || `${e.type}_${e.name}`;
          if (query[key]) {
            value[key] = query[key];
            this.$set(this.innerFilters[index], "value", query[key]);
          }
        }
      });
      this.$set(this, "innerValue", value);
    }
  }
});

export default NewCustomFilter;
</script>

<style>
.filter-bar {
  cursor: pointer;
}

.filter-chip {
  max-width: 400px;
}

.filter-search-input {
  font-size: 0.8125rem;
  line-height: 1rem;
}
</style>
