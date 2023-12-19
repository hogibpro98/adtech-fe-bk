<template>
  <validation-provider
    v-slot="{ errors, valid }"
    :name="$attrs.label"
    :rules="rules"
    :vid="vid || $attrs.name"
  >
    <v-flex xs12>
      <business-activity-select
        v-model="innerValue.cat_id"
        name="cat_id"
        label="Lĩnh vực hoạt động SMS"
        required
        :return-object="false"
        rules="required"
        type="sms"
        item-value="name"
      />
    </v-flex>
    <v-flex xs12 class="mt-2">
      <v-checkbox
        v-model="innerValue.content_type"
        :label="'Tin nhắn SMS động'"
        class="ma-0 pa-0 pt-2"
        :true-value="1"
        :false-value="0"
        :disabled="!contentType"
      >
      </v-checkbox>
      <div v-if="!innerValue.content_type">
        <v-text-area-appendable-with-validation
          v-model="innerValue.content"
          :loading="loading"
          placeholder="Nhập nội dung SMS"
          filled
          :name="'Nội dung tin nhắn'"
          label="Nội dung chữ"
          rows="3"
          required
          rules="required|max:500"
          counter="500"
        />
      </div>
      <div v-else>
        <v-text-area-appendable-with-validation
          v-model="innerValue.content"
          :loading="loading"
          placeholder="Nhập nội dung SMS"
          filled
          :name="'Nội dung tin nhắn'"
          label="Nội dung chữ"
          rows="3"
          dynamic
          :tooltip-mess="'Thêm trường động'"
          :dialog-title="'Thêm trường động'"
          required
          rules="required|max:500"
          counter="500"
        />
      </div>
    </v-flex>
  </validation-provider>
</template>
<script lang="ts">
import VTextAreaWithValidation from "@/components/common/VTextAreaStyleFillWithValidation";
import Vue, { VueConstructor } from "vue";
import VTextAreaAppendableWithValidation from "~/components/common/VTextAreaAppendableWithValidation.vue";
import { ToastInterface } from "~/interface/plugin/toast";
import BusinessActivitySelect from "~/components/select/BusinessActivitySelect.vue";
import deepWrapper from "~/mixins/deepWrapper";

interface ComponentData {
  $toast: ToastInterface;
  dynamic: Boolean;
}

interface ComponentMethod {}

const BackUpSms = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethod
>).extend({
  name: "BackUpSms",
  components: {
    BusinessActivitySelect,
    VTextAreaAppendableWithValidation,
    VTextAreaWithValidation
  },
  mixins: [deepWrapper],
  props: {
    rules: {
      type: [Object, String],
      default: ""
    },
    vid: {
      type: String,
      default: null
    },
    // must be included in props
    value: {
      type: Object,
      default: () => null
    },
    loading: {
      type: Boolean,
      default: false
    },
    required: {
      type: Boolean,
      default: false
    },
    contentType: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    innerValue: {
      content: "",
      content_type: 0,
      cat_id: ""
    }
  }),
  watch: {
    async contentType(val) {
      if (!val) {
        await this.$nextTick();
        this.$set(this.innerValue, "content_type", 0);
      }
    }
  },
  created() {
    this.innerValue = this.value || {
      content: "",
      content_type: 0,
      cat_id: ""
    };
    if (!this.contentType) {
      this.$set(this.innerValue, "content_type", 0);
    }
  }
});

export default BackUpSms;
export type BackUpSmsRef = InstanceType<typeof BackUpSms>;
</script>

<style lang="scss" scoped>
.v-label-bold {
  display: block;

  line-height: 1.25rem;
  font-size: 16px;
  font-weight: 400 !important;
  color: #000 !important;
}

.buttons {
  margin-top: 35px;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.menu-content {
  border: solid 1px #9e9e9e;
  border-radius: 4px;
  padding: 4px 0;

  position: sticky;
  position: -webkit-sticky;
  top: 0;
  z-index: 11;
  background-color: #fff;

  &::v-deep .custom-icon {
    opacity: 1 !important;
  }
}
</style>
