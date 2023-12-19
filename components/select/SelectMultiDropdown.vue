<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || name"
    :rules="rules"
    :vid="name"
  >
    <v-card-title
      :class="
        `${valid ? '' : 'error-text'} text-center pb-0 pl-0 label-md font-16`
      "
    >
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </v-card-title>
    <div v-model="innerValue" class="show-tag-select">
      <v-chip
        v-for="(item, index) in innerValue || []"
        :key="`select-show-item-${index}`"
        class="mx-1 my-1 filter-chip"
        color="primary"
        text-color="white"
        close
        @click:close="removeItem(index)"
      >
        <span class="truncate">{{ item.name }}</span>
      </v-chip>
      <api-select-with-validation
        v-model="itemNew"
        v-bind="$attrs"
        :resource="resource"
        :menu-props="{
          closeOnClick: true
        }"
        :excludes="innerValue"
        :cache-items="false"
        :name="name"
        :placeholder="placeholder"
        class="small-input w-full inline-block"
        append-icon=""
      >
        <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
      </api-select-with-validation>
    </div>
    <div class="v-messages " role="alert">
      <div class="v-messages__wrapper">
        <div class="v-messages__message">
          {{ noteMessage }}
        </div>
      </div>
    </div>
    <div class="v-text-field__details mt-2">
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
import lodash from "lodash";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";

interface MethodInterface {
  removeItem(index: number): void;
}

const SelectMultiDropdown = (Vue as VueConstructor<
  Vue & SelectDataInterface & MethodInterface
>).extend({
  name: "SelectMultiDropdown",
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
    resource: {
      type: String,
      required: true
    },
    rules: {
      type: [Object, String],
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    },
    noteMessage: {
      type: String,
      default: "Mặc định hiển thị với tất cả"
    }
  },
  data() {
    return {
      innerValue: [],
      itemNew: null
    };
  },
  watch: {
    async itemNew(val) {
      if (val) {
        this.innerValue = lodash.unionBy(
          [...(this.innerValue || []), val],
          "id"
        );

        await this.$nextTick();
        this.itemNew = null;
      }
    }
  },
  methods: {
    removeItem(index) {
      this.innerValue = lodash.remove(
        this.innerValue || [],
        (_, n) => n !== index
      );
    }
  }
});

export default SelectMultiDropdown;
export type SelectMultiDropdownRef = InstanceType<typeof SelectMultiDropdown>;
</script>
