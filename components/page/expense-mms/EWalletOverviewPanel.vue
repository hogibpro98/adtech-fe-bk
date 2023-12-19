<template>
  <div class="d-flex justify-content-center">
    <v-flex xs9 sm7 md5 lg4 xl3>
      <v-card elevation="2" color="data-table-toolbar" class="d-flex" tile>
        <v-overlay v-if="loading" absolute color="#fff" class="z-1">
        </v-overlay>
        <v-flex
          xs3
          class="primary d-flex justify-content-center align-items-center"
        >
          <v-icon color="#fff" size="48"> monetization_on</v-icon>
        </v-flex>
        <v-flex
          v-if="hasWallet"
          xs9
          class="d-flex justify-content-space-between align-items-center"
        >
          <div class="text-left">
            <h3>Tài khoản ví tin nhắn MMS</h3>
            <h3>
              Số dư:
              <span :class="isPositive ? 'success--text' : 'error--text'">{{
                balance | currency
              }}</span>
            </h3>
          </div>
          <v-icon
            :class="{ 'rotate-infinity': loading }"
            color="label-disabled"
            @click="fetchData"
          >
            cached
          </v-icon>
        </v-flex>
        <v-flex
          v-else
          xs9
          class="d-flex justify-content-space-between align-items-center"
        >
          <h3>Bạn chưa có tài khoản ví 511</h3>
        </v-flex>
      </v-card>
    </v-flex>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  wallet: {
    wallet_id: string | number;
    balance: string | number;
  };
  loading: boolean;
  hasWallet: boolean;
  walletId: string | number;
  balance: number;
  isPositive: boolean;
}

interface ComponentMethods {
  fetchData(): void;
  $fetchViettelWallet(): void;
}

const EWalletOverviewPanel = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "EWalletOverviewPanel",
  data() {
    return {
      wallet: {
        wallet_id: null,
        balance: null
      },
      loading: false
    };
  },
  computed: {
    hasWallet() {
      return !!this.$auth.user.wallet;
    },
    walletId() {
      return this.$auth.user.wallet?.wallet_id || null;
    },
    balance() {
      return this.$auth.user.wallet?.balance || null;
    },
    isPositive() {
      return this.balance >= 0;
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      await this.$fetchViettelWallet();
      this.loading = false;
    }
  }
});

export default EWalletOverviewPanel;
export type EWalletOverviewPanelRef = InstanceType<typeof EWalletOverviewPanel>;
</script>
