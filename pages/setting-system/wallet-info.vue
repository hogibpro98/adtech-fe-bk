<template>
  <div>
    <v-row wrap justify="center" class="pa-4">
      <v-flex xs12 xl8>
        <v-row wrap justify="center">
          <v-flex xs12 md6 lg4 class="pa-4">
            <mini-card :loading="loading" color="blue" icon="fa fa-credit-card">
              <v-row align="center" class="w-full pa-3">
                <v-flex offset-2 col-8 class="text-center">
                  <div class="headline">ID ví</div>
                  <h2 v-if="hasWallet">{{ wallet_info.wallet_id }}</h2>
                  <h2 v-else class="error--text">Chưa kết nối</h2>
                </v-flex>
                <v-flex col-2> </v-flex>
              </v-row>
            </mini-card>
          </v-flex>
          <v-flex xs12 md6 lg4 class="pa-4">
            <mini-card :loading="loading" color="warning" icon="paid">
              <v-row align="center" class="w-full pa-3">
                <v-flex offset-2 col-8 class="text-center">
                  <div class="headline">Số dư tạm tính</div>
                  <h2
                    v-if="hasWallet"
                    :class="
                      wallet_info.balance >= 0 ? 'success--text' : 'error--text'
                    "
                  >
                    {{ wallet_info.balance | numberSpace }}
                  </h2>
                  <h2 v-else class="error--text">Chưa kết nối</h2>
                </v-flex>
                <v-flex col-2> </v-flex>
              </v-row>
            </mini-card>
          </v-flex>
          <v-flex xs12 md6 lg4 class="pa-4">
            <mini-card :loading="loading" color="success" icon="local_atm">
              <v-row align="center" class="w-full pa-3">
                <v-flex offset-2 col-8 class="text-center">
                  <div class="headline">Số dư thực tế</div>
                  <h2
                    v-if="hasWallet"
                    :class="
                      wallet_info.true_balance >= 0
                        ? 'success--text'
                        : 'error--text'
                    "
                  >
                    {{ wallet_info.true_balance | numberSpace }}
                  </h2>
                  <h2 v-else class="error--text">Chưa kết nối</h2>
                </v-flex>
                <v-flex col-2>
                  <v-btn
                    v-if="hasWallet && $can('setting-system-wallet-info.edit')"
                    icon
                    depressed
                    @click="syncBalance"
                  >
                    <v-icon> cached</v-icon>
                  </v-btn>
                </v-flex>
              </v-row>
            </mini-card>
          </v-flex>
        </v-row>
      </v-flex>
    </v-row>
    <v-row justify="center" class="pa-4">
      Cập nhật lần cuối: {{ wallet_info.updated_at | timestamp }}
    </v-row>
    <wallet-link-dialog
      ref="linkDialog"
      @success="getInfo"
    ></wallet-link-dialog>
  </div>
</template>

<script lang="ts">
import { responseErrorToString } from "@/util/array";
import cloneDeep from "lodash/cloneDeep";
import MiniCard from "@/components/widgets/statistic/MiniCard.vue";
import WalletLinkDialog from "@/components/page/wallet-info/WalletLinkDialog.vue";
import { CODE_SUCCESS } from "@/constants/code";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";
import { WalletInfoInterface } from "~/interface/data/walletInfo";

const DEFAULT_WALLET_INFO = {
  wallet_id: null,
  balance: 0,
  real_balance: 0,
  updated_at: ""
};

interface ComponentData extends GlobalDataInterface {
  loading: boolean;
  hasWallet: boolean;
  wallet_info: WalletInfoInterface;
}

interface ComponentMethods {
  getInfo(): void;
}

export default (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  components: {
    WalletLinkDialog,
    MiniCard
  },
  layout: "dashboard",
  permission: false,
  data() {
    return {
      loading: false,
      wallet_info: cloneDeep(DEFAULT_WALLET_INFO)
    };
  },
  computed: {
    hasWallet() {
      return !!this.wallet_info.wallet_id;
    }
  },

  watch: {},
  mounted() {
    this.getInfo();
  },
  methods: {
    // openLinkDialog() {
    //   this.$refs.linkDialog.show();
    // },
    async getInfo() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(`/wallet-info/info`);
        if (data.code === CODE_SUCCESS) {
          if (data.data) {
            this.wallet_info = data.data;
          } else {
            this.wallet_info = cloneDeep(DEFAULT_WALLET_INFO);
          }
        }
        this.loading = false;
      } catch (e) {
        console.log(e);
        this.$toast.global.server_error_msg(
          responseErrorToString(e.response.data.errors)
        );
        this.loading = false;
      }
    },

    async syncBalance() {
      this.loading = true;
      try {
        const { data } = await this.$axios.post(`/wallet-info/sync`);
        if (data.code === CODE_SUCCESS) {
          if (data.data) {
            this.wallet_info = data.data;
          } else {
            this.wallet_info = cloneDeep(DEFAULT_WALLET_INFO);
          }
        }
        this.loading = false;
      } catch (e) {
        console.log(e);
        this.$toast.global.server_error_msg(
          responseErrorToString(e.response.data.errors)
        );
        this.loading = false;
      }
    }
  }
});
</script>
