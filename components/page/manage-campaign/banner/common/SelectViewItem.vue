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
        `${
          valid ? '' : 'error-text'
        } text-center pb-0 pl-1  label-md font-16`
      "
    >
      {{ label }}
      <span v-if="required" class="error--text">*</span>
    </v-card-title>
    <div>
      <v-checkbox
        v-model="selectAll"
        label="Tất cả"
        class="no-margin"
        hide-details
        dense
      ></v-checkbox>
    </div>
    <v-row no-gutters>
      <v-col
        v-for="(item, index) in items"
        :key="`item-view-os-${index}`"
        cols="12"
        md="4"
        lg="4"
        sm="6"
        xs="12"
      >
        <v-checkbox
          v-model="innerValue"
          :label="item.name"
          :value="item"
          :value-comparator="comparator"
          class="no-margin truncate-view-item"
          hide-details
          dense
        >
          <template slot="label">
            <v-tooltip bottom offset-overflow>
              <template #activator="{ on, attrs }">
                <span v-bind="attrs" v-on="on">
                  {{ item.name }}
                </span>
              </template>
              <span>{{ item.name }}</span>
            </v-tooltip>
          </template>
        </v-checkbox>
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
import { isEmpty } from "@/util/typeof";
import Vue, { VueConstructor } from "vue";

interface ComponentData {
  innerValue: Array<object>;
  items: Array<object>;
  selectAll: boolean;
  loading: boolean;
}

interface ComponentMethod {
  comparator(value1: any, value2: any): boolean;
  fetchData(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "SelectViewItem",
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
    fieldValue: {
      type: String,
      default: "code"
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
    },
    isDefaultSelectAll: {
      type: Boolean,
      default: false
    },
    resource: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      innerValue: [],
      items: [],
      selectAll: false,
      loading: false
    };
  },
  watch: {
    selectAll(val) {
      if (this.loading) {
        return;
      }
      if (val) {
        this.innerValue = this.items;
      } else if (this.items?.length === this.innerValue?.length) {
        this.innerValue = [];
      }
    },
    innerValue: {
      handler(newValue, oldValue) {
        if (this.loading) {
          return;
        }
        if (newValue?.length !== oldValue?.length) {
          this.selectAll = !this.items.some(item => {
            return !(newValue || []).some(f => f.code === item.code);
          });
        }
      },
      deep: true
    },
    loading(val) {
      if (!val && !isEmpty(this.items)) {
        this.selectAll = !this.items.some(item => {
          return !(this.innerValue || []).some(f => f.code === item.code);
        });
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    comparator(value1, value2) {
      return value1?.[this.fieldValue] === value2?.[this.fieldValue];
    },
    async fetchData() {
      try {
        this.loading = true;

        const { data: res } = await this.$axios.post(`${this.resource}/select`, {
            page: 1,
            page_size: -1
        });

        this.loading = false;
        if (res && res.code === CODE_SUCCESS) {
          this.items = res.data;

          if (this.isDefaultSelectAll && isEmpty(this.innerValue)) {
            this.innerValue = res.data;
          }
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        } else {
          this.$toast.global.action_fail();
          console.log(e);
        }
      }
    }
  }
});
</script>
