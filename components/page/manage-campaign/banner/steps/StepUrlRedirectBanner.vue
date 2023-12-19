<template>
  <v-row class="no-margin">
    <v-flex xs12 class="form-group pr-1">
      <v-text-field-with-validation
        ref="inputUrl"
        v-model="innerValue.url"
        :loading="loading"
        name="url_redirect"
        type="text"
        label="URL trang đích"
        required
        rules="required|url"
      />
    </v-flex>
    <div v-if="listMacro.length !== 0" class="list-macro">
      <v-card-subtitle class="no-padding caption mt-2 mx-2 m-auto">
        Các macro có sẵn mà bạn có thể sử dụng để theo dõi và tối ưu hóa các
        chiến dịch của mình.
      </v-card-subtitle>
      <v-chip
        v-for="(macro, i) in listMacro"
        :key="`macro-item-${i}`"
        class="mx-2 my-1 macro-item"
        label
        small
        :disabled="listMacroSelected.includes(macro.code)"
        @mousedown="insertMacro($event, macro.code)"
      >
        + {{ macro.code }}
      </v-chip>
    </div>
    <v-card-subtitle class="no-padding caption text-center mt-2 m-auto">
      Xem xét những gì bạn đang quảng cáo và nhập trang có liên quan nhất trên
      trang web của bạn. Đây có thể là trang chủ của bạn hoặc một trang cụ thể
      hơn.
    </v-card-subtitle>
  </v-row>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VTextFieldWithValidation from "@/components/common/VTextFieldWithValidation.vue";
import wrapper from "@/mixins/wrapper";
import { BannerRedirectInterface } from "~/interface/data/banner";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { getListMacroSelectedByUrl } from "~/util/array";

interface ComponentData {
  innerValue: BannerRedirectInterface;
  $targetingMarcoRepository: RepositoryInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "StepUrlRedirectBanner",
  components: { VTextFieldWithValidation },
  mixins: [wrapper],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      innerValue: {},
      listMacro: []
    };
  },
  computed: {
    listMacroSelected() {
      const url = this.innerValue.url || "";
      return getListMacroSelectedByUrl(url);
    }
  },
  async created() {
    try {
      const res = await this.$targetingMarcoRepository.list({
        page: 1,
        itemsPerPage: 100,
        select_status: "approve"
      });

      if (res?.data) {
        this.listMacro = (res?.data || [])
      }
    } catch (e) {
      console.log(e);
    }
  },
  methods: {
    insertMacro(event, code) {
      if (event && this.$refs.inputUrl?.$el) {
        event.stopPropagation();
        event.preventDefault();
        // Get the input element by tag name, using the ref as a base for the search
        // This is more vue-friendly and plays nicer when you duplicate components
        const el = this.$refs.inputUrl?.$el.querySelector("input");
        const text = `[${code}]`;
        const url = this.innerValue.url || "";
        // Insert text into current position
        let cursorPos = el.selectionEnd; // Get current Position
        this.innerValue.url =
          url.substring(0, cursorPos) + `[${code}]` + url.substring(cursorPos);

        // Get new cursor position
        cursorPos += text.length;

        // Wait until vue finishes rendering the new text and set the cursor position.
        this.$nextTick(() => el.setSelectionRange(cursorPos, cursorPos));
      }
    }
  }
});
</script>
<style lang="scss" scoped>
.list-macro {
  margin-left: -8px;
  margin-right: -8px;

  .macro-item {
    cursor: pointer;
  }
}
</style>
