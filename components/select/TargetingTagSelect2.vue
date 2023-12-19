<template>
  <div>
    <validation-provider
      v-slot="{ errors, valid }"
      :name="label || name"
      :rules="rules"
      :vid="name"
    >
      <v-card-title
        :class="
          `${valid ? '' : 'error-text'} text-center pb-0 pl-1  label-md font-16`
        "
      >
        {{ label }}
        <span v-if="required" class="error--text">*</span>
      </v-card-title>
      <div v-model="innerValue" class="show-tag-select">
        <template v-for="(tag, index) in innerValue">
          <v-chip
            v-if="tag && tag.name"
            :key="`chip-${index}`"
            class="ma-1"
            close
            color="primary"
            text-color="white"
            @click:close="removeTag(index)"
          >
            {{ tag.name }}
          </v-chip>
        </template>
        <api-combo-box-with-validation
          v-if="showTagNew"
          v-model="tagNew"
          v-bind="$attrs"
          :resource="resource"
          :excludes="innerValue"
          :filter="filterShowSearch"
          :menu-props="{
            closeOnClick: true,
            minWidth: 244
          }"
          return-object
          autofocus
          name="tag"
          item-text="name"
          placeholder="Nhập nội dung"
          class="inline-block mx-1 my-1 pl-1 small-input"
          append-icon=""
        >
          <slot v-for="(_, name) in $slots" :slot="name" :name="name" />
        </api-combo-box-with-validation>
        <v-btn
          v-if="!showTagNew"
          text
          color="primary"
          class="text-transform-inherit p-7-5"
          @click="showTagNew = true"
        >
          + Tag mới
        </v-btn>
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
    <div
      v-if="tagSuggestsShow && tagSuggestsShow.length > 0"
      class="label-suggest"
    >
      Tag đề xuất
    </div>
    <div
      v-if="tagSuggestsShow && tagSuggestsShow.length > 0"
      class="suggest-tags mb-2"
    >
      <v-chip
        v-for="(tag, index) in tagSuggestsShow"
        :key="`tag-suggest-show-item-${index}`"
        class="mx-1 my-1 pointer"
        outlined
        @click="addTag(tag, index)"
      >
        <v-icon color="primary" size="20" left>
          add
        </v-icon>
        {{ tag.name }}
      </v-chip>
    </div>
  </div>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import lodash from "lodash";
import { CODE_SUCCESS } from "@/constants/code";
import ApiComboBoxWithValidation from "@/components/common/ApiComboBoxWithValidation";
import wrapper from "@/mixins/wrapper";
import { TARGETING_TAG } from "~/constants/resource";
import { SelectDataInterface } from "~/interface/components/select";

interface MethodInterface {
  removeTag(index: number): void;
  addTag(tag: string, index: number): void;
  filterShowSearch(
    item: Array<string>,
    queryText: string,
    itemText: string
  ): void;
  fetchTagSuggest(): void;
}

const TargetingTagSelect2 = (Vue as VueConstructor<
  Vue & SelectDataInterface & MethodInterface
>).extend({
  name: "TargetingTagSelect2",
  components: { ApiComboBoxWithValidation },
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
      resource: TARGETING_TAG,
      innerValue: [],
      tagNew: null,
      tagSuggests: [],
      showTagNew: false
    };
  },
  computed: {
    tagSuggestsShow() {
      return this.tagSuggests.filter(
        tag =>
          !(this.innerValue || []).find(
            tagSelected => tagSelected.code === tag.code
          )
      );
    }
  },
  watch: {
    tagNew(val) {
      if (val) {
        this.innerValue = lodash.uniq([...this.innerValue, val]);
        this.showTagNew = false;
        this.tagNew = "";
      }
    }
  },
  mounted() {
    this.fetchTagSuggest();
  },
  methods: {
    removeTag(index) {
      this.innerValue = lodash.remove(this.innerValue, (_, n) => n !== index);
    },
    addTag(tag) {
      this.innerValue = lodash.unionBy([...this.innerValue, tag], "code");
    },
    filterShowSearch(item) {
      return !(this.innerValue || []).find(
        tagSelected => tagSelected.code === item.code
      );
    },
    async fetchTagSuggest() {
      const rs = await this.$targetingTagRepository.select({
        page: 1,
        page_size: 12
      });

      if (rs.code === CODE_SUCCESS && rs.data) {
        this.tagSuggests = rs.data;
      }
    }
  }
});

export default TargetingTagSelect2;
export type TargetingTagSelect2Ref = InstanceType<typeof TargetingTagSelect2>;
</script>
