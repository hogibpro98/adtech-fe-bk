<template>
  <confirm-dialog
    ref="dialog"
    :loading="loading"
    title="Hướng dẫn API"
    label-button-confirm=""
    content-class="flex xs12 sm10 lg8 xl6"
  >
    <template slot="content">
      <v-tabs v-model="tab" background-color="transparent">
        <v-tab>Request</v-tab>
        <v-tab>Response</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item>
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
        </v-tab-item>
        <v-tab-item>
          <v-flex xs12>
            <v-card-title class="px-0">Trường hợp gửi thành công:</v-card-title>
            <v-card-text class="px-0">Response body:</v-card-text>
            <code-block :script="successResponse" />
          </v-flex>
          <v-card-title class="px-0">Trường hợp gửi thất bại:</v-card-title>
          <v-flex xs12>
            <v-card-text class="px-0">- Nếu ví của agency hết tiền</v-card-text>
            <code-block :script="outOfMoneyResponse" />
          </v-flex>
          <v-flex xs12>
            <v-card-text class="px-0"
              >- Nếu trạng thái QC không phải đang chạy
            </v-card-text>
            <code-block :script="wrongStatusResponse" />
          </v-flex>
          <v-flex xs12>
            <v-card-text class="px-0"
              >- Nếu thông tin ip, token không đúng trả về thông tin như sau
            </v-card-text>
            <code-block :script="unauthorizedResponse" />
          </v-flex>
        </v-tab-item>
      </v-tabs-items>
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
  name: "DataApiInstructionDialog",
  components: { ConfirmDialog, CodeBlock },
  props: {
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      item: {},
      tab: 0
    };
  },
  computed: {
    request() {
      return `POST ${process.env.API_ENDPOINT}buy-data`;
    },
    params() {
      const params = {};
      if (this.item.params && this.item.params.length > 0) {
        this.item.params.forEach(e => {
          params[e] = `(Giá trị của ${e})`;
        });
      }
      return params;
    },
    body() {
      const body = {
        ads_id: this.item.id,
        phone_number: "(SĐT người nhận)",
        data: "(dung lượng data đơn vị MB)",
        data_code: "(mã gói data)",
        params: this.params
      };
      return JSON.stringify(body, null, 2);
    },
    headers() {
      const headers = {
        "Content-Type": "application/json",
        token: "(Token của tài khoản)",
        username: this.item.agency?.username
      };
      return JSON.stringify(headers, null, 2);
    },
    successResponse() {
      const body = {
        code: 0,
        message: "OK",
        body: {
          date: "20211215090111",
          errcode: "0",
          desc: "Success",
          transid: "gapit-533T1639533671423"
        }
      };
      return JSON.stringify(body, null, 2);
    },
    outOfMoneyResponse() {
      const body = {
        code: 2,
        message: "Tài khoản không đủ tiền"
      };
      return JSON.stringify(body, null, 2);
    },
    wrongStatusResponse() {
      const body = {
        code: 3,
        message: "Quảng cáo đang ở trạng thái stop"
      };
      return JSON.stringify(body, null, 2);
    },
    unauthorizedResponse() {
      const body = {
        code: 1,
        message: "UNAUTHORIZED"
      };
      return JSON.stringify(body, null, 2);
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
