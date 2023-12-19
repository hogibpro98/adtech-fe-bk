<template>
  <api-select-with-validation
    ref="selectRef"
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :multiple="multiple"
    :query-params="params"
    v-on="$listeners"
  >
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
    <template slot="selection" slot-scope="{ item }">
      <v-chip
        v-if="multiple"
        class="mx-1"
        color="primary"
        small
        close
        @click:close="remove(item)"
      >
        {{ item.name }}
      </v-chip>
      <span v-else>{{ item.name }}</span>
    </template>
    <template #item="{ item }">
      <v-list-item-content>
        <v-list-item-title>{{ item.name }}</v-list-item-title>
      </v-list-item-content>
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";

export default (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "EventTrackingSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Tracking"
    },
    type: {
      type: String,
      default: ""
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      resource: "/event-tracking",
      innerValue: null
    };
  },
  computed: {
    params() {
      const queryParams = this.$attrs["query-params"] ?? {};
      return {
        select_type: this.type ? this.type : undefined,
        ...queryParams
      };
    }
  },
  watch: {},
  methods: {
    remove(item) {
      let map = [];
      map = this.innerValue.map(e => e.id);
      const index = map.indexOf(item.id);
      if (index !== -1) {
        this.innerValue.splice(index, 1);
      }
    }
  }
});
</script>
