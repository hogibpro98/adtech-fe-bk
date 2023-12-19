<template>
  <api-select-with-validation
    v-model="innerValue"
    v-bind="$attrs"
    :resource="resource"
    :label="label"
    :multiple="multiple"
    :query-params="params"
    name="user-select"
    :item-text="itemText"
    v-on="$listeners"
  >
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
import { USER } from "@/constants/resource";
import wrapper from "@/mixins/wrapper";
import { ROLE_ADVERTISER, ROLE_AGENCY } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";
import deepWrapper from "~/mixins/deepWrapper";

export interface SelectUserDataInterface extends SelectDataInterface {
  tagNew: object;
  searchInput: string;
}

export default (Vue as VueConstructor<Vue & SelectUserDataInterface>).extend({
  name: "ServiceSelect",
  components: { ApiSelectWithValidation },
  mixins: [deepWrapper],
  props: {
    resource: {
      type: String,
      default: "service"
    },
    type: {
      type: [Array, String],
      default: () => [ROLE_ADVERTISER, ROLE_AGENCY]
    },
    value: {
      type: [Object, Array, String, Number],
      default: null
    },
    agencyId: {
      type: Number,
      default: null
    },
    label: {
      type: String,
      default: "Dịch vụ"
    },
    itemText: {
      type: String,
      default: "display_name"
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerValue: null
    };
  },
  computed: {
    params() {
      return {
        type: this.type,
        agency_id: this.agencyId
      };
    }
  },
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
