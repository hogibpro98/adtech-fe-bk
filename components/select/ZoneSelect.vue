<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :query-params="params"
    name="owner"
    item-text="name"
    v-on="$listeners"
  >
    <template #item="{ item }">
      <v-list-item-content v-if="item">
        <template>
          <v-list-item-title>
            {{ item.name }}
          </v-list-item-title>
          <v-list-item-subtitle>
            Đơn giá gói mua: {{ getPrice(item) }}đ
          </v-list-item-subtitle>
        </template>
      </v-list-item-content>
    </template>
    <template
      v-for="(_, name) in $scopedSlots"
      :slot="name"
      slot-scope="slotData"
    >
      <slot :name="name" v-bind="slotData" />
    </template>
  </api-select-with-validation>
</template>
<script lang="ts">
import { ZONE } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";

const ZoneSelect = (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "ZoneSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    label: {
      type: String,
      default: "Người sở hữu"
    },
    isShowParent: {
      type: Boolean,
      default: true
    },
    queryParams: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      resource: ZONE
    };
  },
  computed: {
    params() {
      return {
        sortBy: ["name"],
        sortDesc: [false],
        ...this.queryParams
      };
    }
  },
  methods: {
    getPrice(innerValue) {
      return innerValue?.constract?.price || 0;
    }
  }
});

export default ZoneSelect;
export type ZoneSelectRef = InstanceType<typeof ZoneSelect>;
</script>
