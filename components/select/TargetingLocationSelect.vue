<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || name"
    :rules="rules"
    :vid="name"
  >
    <v-card-title
      :class="
        `${valid ? '' : 'error-text'} text-center pb-0 pl-0  label-md font-16`
      "
    >
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </v-card-title>
    <div v-model="innerValue.locations" class="show-tag-select">
      <v-chip
        v-for="(location, index) in innerValue.locations || []"
        :key="`location-select-show-item-${index}`"
        class="mx-1 my-1 filter-chip"
        color="primary"
        text-color="white"
        close
        @click:close="removeTag(index)"
      >
        <span class="truncate">+ {{ location.name }}</span>
      </v-chip>
      <v-chip
        v-for="(location, index) in innerValue.exclude_locations || []"
        :key="`location-select-show-item-exclide-${index}`"
        class="mx-1 my-1 filter-chip"
        color="error"
        text-color="white"
        close
        @click:close="removeTagExcludeNew(index)"
      >
        <span class="truncate">&minus; {{ location.name }}</span>
      </v-chip>
      <api-select-with-validation
        v-model="tagNew"
        v-bind="$attrs"
        :resource="resource"
        :menu-props="{
          closeOnClick: true,
          maxWidth: '550px'
        }"
        :query-params="queryParamLocation"
        :cache-items="false"
        name="locations"
        item-text="name"
        placeholder="+ Thêm vị trí"
        class="w-full mx-1 my-1 pl-1 small-input"
        append-icon=""
      >
        <template #item="{ item }">
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
              <span v-if="item.parent"> - {{ item.parent.name }} </span>
              <span v-if="item.parent && item.parent.parent">
                - {{ item.parent.parent.name }}
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </template>
        <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      </api-select-with-validation>
      <api-select-with-validation
        v-model="tagExcludeNew"
        v-bind="$attrs"
        :resource="resource"
        :menu-props="{
          closeOnClick: true
        }"
        :query-params="queryParamExcludeLocation"
        :cache-items="false"
        name="exclude_locations"
        label=""
        item-text="name"
        placeholder="- Loại trừ vị trí"
        class="small-input w-full inline-block"
        append-icon=""
      >
        <template #item="{ item }">
          <v-list-item-content>
            <v-list-item-title>
              {{ item.name }}
              <span v-if="item.parent"> - {{ item.parent.name }} </span>
              <span v-if="item.parent && item.parent.parent">
                - {{ item.parent.parent.name }}
              </span>
            </v-list-item-title>
          </v-list-item-content>
        </template>
        <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      </api-select-with-validation>
    </div>
    <div class="v-text-field__details mt-2">
      <div class="v-messages " role="alert">
        <div class="v-messages__wrapper">
          <div class="v-messages__message">
            Mặc định hiển thị với tất cả khu vực (Nếu để trống khu vực nhà)
          </div>
        </div>
      </div>
      <div class="v-messages  error--text" role="alert">
        <div class="v-messages__wrapper">
          <div class="v-messages__message">
            {{ errors && errors[0] }}
          </div>
        </div>
      </div>
    </div>
  </validation-provider>
</template>
<script lang="ts">
import ApiSelectWithValidation from "@/components/common/ApiSelectWithValidation";
import { isObject } from "@/util/typeof";
import lodash from "lodash";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { LOCATION } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

interface MethodInterface {
  removeTag(index: number): void;
  removeTagExcludeNew(index: number): void;
}

const TargetingLocationSelect = (Vue as VueConstructor<
  Vue & SelectDataInterface & MethodInterface
>).extend({
  name: "TargetingLocationSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array],
      default: null
    },
    label: {
      type: String,
      default: null
    },
    name: {
      type: String,
      default: null
    },
    vid: {
      type: String,
      default: null
    },
    required: {
      default: false,
      type: Boolean
    },
    rules: {
      type: [Object, String],
      default: ""
    }
  },
  data() {
    return {
      resource: LOCATION,
      innerValue: {
        locations: null,
        exclude_locations: null
      },
      tagNew: null,
      tagExcludeNew: null
    };
  },
  computed: {
    allSelected() {
      const locations = this.innerValue.locations || [];
      const excludeWorkplaces = this.innerValue.exclude_locations || [];
      return [...locations, ...excludeWorkplaces];
    },
    locationsIds() {
      return (this.innerValue.locations || []).map(l => l?.id);
    },
    excludeLocationsIds() {
      return (this.innerValue.exclude_locations || []).map(l => l?.id);
    },
    queryParamLocation() {
      return {
        custom_ignore_children_ids: [
          ...this.excludeLocationsIds,
          ...this.locationsIds
        ],
        custom_selected_ids: this.locationsIds
      };
    },
    queryParamExcludeLocation() {
      return {
        custom_ignore_parent_ids: this.locationsIds,
        custom_ignore_children_ids: this.excludeLocationsIds,
        custom_selected_ids: this.excludeLocationsIds
      };
    }
  },
  watch: {
    async tagNew(val) {
      if (val) {
        this.$set(
          this.innerValue,
          "locations",
          lodash
            .uniqBy([...(this.innerValue.locations || []), val])
            .filter(l => isObject(l))
        );
        await this.$nextTick();
        this.tagNew = "";
      }
    },
    async tagExcludeNew(val) {
      if (val) {
        this.$set(
          this.innerValue,
          "exclude_locations",
          lodash
            .uniqBy([...(this.innerValue.exclude_locations || []), val])
            .filter(l => isObject(l))
        );
        await this.$nextTick();
        this.tagExcludeNew = "";
      }
    }
  },
  methods: {
    removeTag(index) {
      this.innerValue.locations = lodash.remove(
        this.innerValue.locations || [],
        (_, n) => n !== index
      );
    },
    removeTagExcludeNew(index) {
      this.innerValue.exclude_locations = lodash.remove(
        this.innerValue.exclude_locations || [],
        (_, n) => n !== index
      );
    }
  }
});

export default TargetingLocationSelect;
export type TargetingLocationSelectRef = InstanceType<
  typeof TargetingLocationSelect
>;
</script>
