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
    <template #item="{ item }">
      <v-list-item-content v-if="item">
        <v-list-item-title>
          {{ item[itemText] }}
          <v-chip
            v-if="item.roles && item.roles[0]"
            class="ml-1 mr-0 mb-2 px-1"
            label
            x-small
          >
            {{ item.roles[0] && item.roles[0].display_name }}
          </v-chip>
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ item.email }}
        </v-list-item-subtitle>
      </v-list-item-content>
    </template>
    <!--    <template v-if="multiple" slot="selection" slot-scope="{ item }">-->
    <!--      <v-chip class="mx-1" small close @click:close="remove(item)">-->
    <!--        {{ item.email }}-->
    <!--      </v-chip>-->
    <!--    </template>-->
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
import { ROLE_ADVERTISER, ROLE_AGENCY, ROLE_PUBLISHER } from "@/constants/role";
import Vue, { VueConstructor } from "vue";
import ApiSelectWithValidation from "~/components/common/ApiSelectWithValidation.vue";
import { SelectDataInterface } from "~/interface/components/select";

export interface SelectUserDataInterface extends SelectDataInterface {
  tagNew: object;
  searchInput: string;
}

export default (Vue as VueConstructor<Vue & SelectUserDataInterface>).extend({
  name: "UserSelect",
  components: { ApiSelectWithValidation },
  mixins: [wrapper],
  props: {
    resource: {
      type: String,
      default: USER
    },
    type: {
      type: [Array, String],
      default: () => [ROLE_ADVERTISER, ROLE_AGENCY, ROLE_PUBLISHER]
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
      default: "Người sở hữu"
    },
    itemText: {
      type: String,
      default: "full_name"
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
      this.innerValue.splice(this.innerValue.indexOf(item), 1);
      // this.innerValue = [...this.innerValue];
    }
  }
});
</script>
