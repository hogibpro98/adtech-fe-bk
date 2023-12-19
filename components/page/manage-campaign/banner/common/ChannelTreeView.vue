<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="label || name"
    :rules="rules"
    :vid="name"
  >
    <span v-model="innerValue"></span>
    <v-card-title
      :class="
        `${valid ? '' : 'error-text'} text-center pb-0 pl-1  label-md font-16`
      "
    >
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </v-card-title>
    <v-row no-gutters>
      <v-col cols="12" sm="6" xs="12">
        <template v-for="(item, index) in items">
          <v-treeview
            v-if="index % 2 === 0"
            :key="`item-tree-view-channel-${index}`"
            v-model="selections[item[0].id]"
            :items="item"
            selectable
            class="small"
            item-children="channels"
            open-on-click
            return-object
            transition
            dense
          ></v-treeview>
        </template>
      </v-col>
      <v-col cols="12" sm="6" xs="12">
        <template v-for="(item, index) in items">
          <v-treeview
            v-if="index % 2 === 1"
            :key="`item-tree-view-channel-${index}`"
            v-model="selections[item[0].id]"
            :items="item"
            selectable
            class="small"
            item-children="channels"
            open-on-click
            return-object
            transition
            dense
          ></v-treeview>
        </template>
      </v-col>
    </v-row>
    <div class="v-text-field__details mt-2">
      <div class="v-messages theme--light error--text" role="alert">
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
import { CODE_SUCCESS, HTTP_CODE_422 } from "@/constants/code";
import wrapper from "@/mixins/wrapper";
import { debounce, flatten, groupBy, isEqual } from "lodash";
import Vue, { VueConstructor } from "vue";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
import { isArray } from "~/util/typeof";
import { responseErrorToString } from "~/util/array";

interface ValueInterface {
  id: number | string;
  text: string;
  value: string | number | object;
}

interface ItemInterface {
  id: number | string;
  channels: Array<any>;
}

interface ComponentData {
  innerValue: Array<ValueInterface>;
  items: Array<ItemInterface>;
  selections: object;
  loading: boolean;
  $campaignRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethod {
  fetchChannel(): void;
}

const ChannelTreeView = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "ChannelTreeView",
  mixins: [wrapper],
  props: {
    value: {
      type: [Object, Array],
      default: null
    },
    tags: {
      type: Array,
      default: () => []
    },
    adsTypeId: {
      type: Number,
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
      innerValue: null,
      items: [],
      selections: {},
      debounceFetchChannel: null
    };
  },
  computed: {
    tagCodes() {
      return (this.tags || []).map(tag => tag.code);
    }
  },
  watch: {
    tags() {
      this.debounceFetchChannel();
    },
    adsTypeId() {
      this.debounceFetchChannel();
    },
    items(val) {
      if (val) {
        val.forEach(item => {
          this.selections[item.id] = [];
        });
      }
    },
    innerValue(val) {
      if (val && val.length > 0) {
        const idsVal = val.map(v => v.id);
        const selectionIds = Object.values(this.selections).map(v => v.id);

        if (isEqual(idsVal, selectionIds)) {
          return;
        }
        this.selections = groupBy(this.innerValue, function(channel) {
          return `inventory-${channel.inventory && channel.inventory.id}`;
        });
      }
    },
    selections: {
      handler(val) {
        if (this.innerValue) {
          const idsVal = this.innerValue.map(v => v.id);
          const selectionIds = flatten(Object.values(val)).map(v => v.id);
          if (!isEqual(idsVal, selectionIds)) {
            this.innerValue = flatten(Object.values(val));
          }
        } else {
          this.innerValue = flatten(Object.values(val));
        }
      },
      deep: true
    }
  },
  created() {
    this.debounceFetchChannel = debounce(function() {
      this.fetchChannel();
    }, 1000);
  },
  mounted() {
    this.fetchChannel();
  },
  methods: {
    async fetchChannel() {
      try {
        const res = await this.$channelRepository.post(`suggest`, {
          tags: this.tagCodes,
          ads_type_id: this.adsTypeId || undefined
        });
        if (res.code === CODE_SUCCESS) {
          this.items = res.data.map(d => {
            return [
              {
                ...d,
                id: `inventory-${d.id}`,
                channels: (d.channels || []).map(channel => ({
                  ...channel,
                  inventory: d
                }))
              }
            ];
          });

          const listChannelGroup = flatten(this.items || []);
          const listChannel = flatten(
            listChannelGroup.map(group => group?.channels)
          );
          if (isArray(this.innerValue)) {
            const channelIds = listChannel.map(channel => channel?.id);
            const newSelected = this.innerValue.filter(channel =>
              channelIds?.includes(channel?.id)
            );
            this.innerValue = newSelected;
            this.selections = groupBy(newSelected, function(channel) {
              return `inventory-${channel.inventory && channel.inventory.id}`;
            });
          }
        }
      } catch (e) {
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$toast.global.server_error_msg(
            responseErrorToString(e.response.data.errors)
          );
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});

export default ChannelTreeView;
export type ChannelTreeViewRef = InstanceType<typeof ChannelTreeView>;
</script>
