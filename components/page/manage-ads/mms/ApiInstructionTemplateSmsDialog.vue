<template>
  <confirm-dialog
    ref="dialog"
    :loading="loading"
    title="Hướng dẫn API Template SMS"
    label-button-confirm=""
  >
    <template slot="content">
      <v-flex xs12>
        <v-card-text class="px-0">HTTP Request</v-card-text>
        <code-block :script="request" />
      </v-flex>
      <v-flex xs12>
        <v-card-text class="px-0">Headers</v-card-text>
        <code-block :script="headers" />
      </v-flex>
      <v-flex xs12>
        <v-card-text class="px-0">Body</v-card-text>
        <code-block :script="body" />
      </v-flex>
    </template>
  </confirm-dialog>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "@/mixins/wrapper";
import cloneDeep from "lodash/cloneDeep";
import { BannerRedirectInterface } from "~/interface/data/banner";
import CodeBlock from "~/components/common/CodeBlock.vue";
import ConfirmDialog from "~/components/common/ConfirmDialog.vue";

interface ComponentData {
  innerValue: BannerRedirectInterface;
}

export default (Vue as VueConstructor<Vue & ComponentData>).extend({
  name: "ApiInstructionDialog",
  components: { ConfirmDialog, CodeBlock },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    service: {
      type: String,
      default: "sms-temp"
    }
  },
  data() {
    return {
      item: {}
    };
  },
  computed: {
    request() {
      return `POST ${process.env.API_ENDPOINT}sms-temp/send`;
    },
    params() {
      const params = {};
      if (this.item.params && this.item.params.length > 0) {
        this.item.params.forEach(e => {
          params[e] = `Giá trị của ${e}`;
        });
      }
      return params;
    },
    body() {
      const body = {
        cp_transid: "Mã giao dịch của đại lý",
        template_id: this.item.tempid,
        phone_number: "(SĐT người nhận)",
        params: this.params
      };
      return JSON.stringify(body, null, 2);
    },
    headers() {
      const headers = {
        "Content-Type": "application/json",
        token: "Token của tài khoản"
      };
      return JSON.stringify(headers, null, 2);
    }
  },
  methods: {
    show(item) {
      this.item = cloneDeep(item);
      this.$refs.dialog.show();
    },
    hide() {
      this.$refs.dialog.hide();
    }
  }
});
</script>
