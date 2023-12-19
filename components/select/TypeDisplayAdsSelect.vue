<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :menu-props="{
      maxWidth: '550px',
      closeOnContentClick: true
    }"
    :query-params="{
      sortBy: ['name'],
      sortDesc: [false]
    }"
    name="type_display_ads"
    label="Loại hiển thị quảng cáo"
    item-text="name"
  >
    <template #item="data">
      <v-list-item-content>
        <v-list-item-title>
          {{ data.item.name }}
          <v-chip
            v-if="data.item.media_type"
            class="ml-0 mr-1 mb-2 px-1"
            label
            x-small
          >
            {{ getNameMediaType(data.item.media_type) }}
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ data.item.description }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import { ADS_TYPE } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import { SelectDataInterface } from "~/interface/components/select";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { MEDIA_TYPES } from "~/constants/dataSelect";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "TypeDisplayAdsSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    }
  },
  data() {
    return {
      resource: ADS_TYPE,
      innerValue: null
    };
  },
  methods: {
    getNameMediaType(mediaType) {
      const platform = MEDIA_TYPES.find(({ value }) => value === mediaType) || {
        text: ""
      };
      return platform.text || mediaType;
    }
  }
});
</script>
