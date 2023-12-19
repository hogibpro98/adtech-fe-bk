<template>
  <div>
    <v-row>
      <v-col cols="7">
        <div class="mb-1 text-h5">
          Tổng số dư:
          {{ mainWallet.balance | currency }}

          <div class="subtitle-1 mt-2">
            Phân bổ được:
            {{ remainingWallet | currency }}
          </div>
        </div>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="4" align-self="center" align="end" class="pr-3">
        <v-btn @click="distributeWallet">
          Phân bổ đều
        </v-btn>
      </v-col>
    </v-row>
    <div v-for="(item, index) in subWallets">
      <!--      <slider-with-input-->
      <!--        v-model="innerValue.find(i=>JSON.stringify(i) === JSON.stringify(item) ).balance"-->
      <!--        :header="item.service"-->
      <!--        :max-value="maxSubWalletValue[index]"-->
      <!--        :disable="!item.active"-->
      <!--      />-->
      <v-slider-with-validation
        v-model="item.balance"
        :disabled="item.withdrawable !== 1"
        :max="maxSubWalletValue[index]"
        :min="0"
        :min-value="
          typeof item.min_balance === 'undefined' ? 0 : item.min_balance
        "
        :label="
          typeof item.service_info === 'undefined'
            ? item.service
            : item.service_info.display_name
        "
        :rules="
          'between:' +
            (typeof item.min_balance === 'undefined'
              ? 0
              : item.min_balance
            ).toString() +
            ',' +
            maxSubWalletValue[index].toString()
        "
      >
        <template #max-value>
          {{ formatCurrency(maxSubWalletValue[index]) }} ₫
        </template>
        <template #min-value>
          {{
            formatCurrency(
              typeof item.min_balance === "undefined" ? 0 : item.min_balance
            )
          }}
          ₫
        </template>
      </v-slider-with-validation>
    </div>
    <v-row align="center" justify="end" class="mt-3">
      <v-col cols="12">
        <v-alert dense type="info">
          Hệ thống sẽ giữ lại số dư tối thiểu ở các ví dịch vụ để đáp ứng dịch
          vụ không bị ngắt quãng. <br />
          Bạn có thể xóa hết tất cả quảng cáo đang chạy của dịch vụ để điều
          chỉnh toàn bộ số dư của dịch vụ. <br />
          Các dịch vụ MMS, SMS, Tài trợ data được quyền điều chỉnh phân bổ, sao
          cho tổng số dư 3 dịch vụ luôn lớn hơn hoặc bằng tổng số dư 3 dịch vụ
          đó trước khi điều chỉnh.
        </v-alert>
      </v-col>
      <v-spacer></v-spacer>
      <v-col cols="4" align-self="center" align="end" class="pr-3">
        <slot name="save-dialog"></slot>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import SliderWithInput from "~/components/page/admin/cms-wallet/SliderWithInput";
import VSliderWithValidation from "~/components/common/VSliderWithValidation";
import { isEqualDeep } from "~/helpers/ultis";

export default {
  name: "WalletDetailMultipleSlider",
  components: { VSliderWithValidation },

  props: {
    value: {
      type: Array,
      default: () => [
        {
          service: "total",
          balance: 0
        }
      ]
    }
  },
  data: () => {
    return {
      innerValue: [
        {
          service: "total",
          balance: 0
        }
      ]
    };
  },

  computed: {
    subWallets() {
      // ví phụ
      return this.innerValue.filter(item => item.service !== "total");
    },
    withdrawableWallets() {
      // ví phụ có thể điều chỉnh phân bổ: MMS, SMS, tài trợ data
      return this.subWallets.filter(item => item.withdrawable === 1);
    },
    mainWallet() {
      // ví chính
      return this.innerValue.find(item => item.service === "total");
    },
    remainingWallet() {
      // số tiền còn lại trong ví chính sau khí trừ đi tiền hiện có các ví phụ
      if (this.subWallets.length === 0) return this.mainWallet.balance;
      let subBalance = 0;
      this.subWallets.forEach(e => {
        subBalance += isNaN(e.balance) ? 0 : e.balance;
      });
      return this.mainWallet.balance - subBalance;
    },
    remainingDivisibleWallet() {
      // số tiền có thể phân bổ vào các ví MMS, SMS, tài trợ data
      if (this.subWallets.length === 0 || this.withdrawableWallets.length === 0)
        return this.mainWallet.balance;

      return (
        this.mainWallet.balance +
        this.withdrawableWallets.reduce((a, b) => ({
          balance:
            (isNaN(a.balance) ? 0 : a.balance) +
            (isNaN(b.balance) ? 0 : b.balance)
        })).balance -
        this.subWallets.reduce((a, b) => ({
          balance:
            (isNaN(a.balance) ? 0 : a.balance) +
            (isNaN(b.balance) ? 0 : b.balance)
        })).balance
      );
    },
    maxSubWalletValue() {
      // max số tiền của 1 ví
      // return 5000;

      return this.subWallets.map(item => {
        return this.remainingWallet + item.balance;
      });
    },
    equallyDistributedWallet() {
      // giá trị các ví sau khi phân bổ
      // nếu giá trị phân bổ bé hơn min thì lấy giá trị min
      const activeWalletLength = this.withdrawableWallets.length;
      const distributeBelowMinWallet = this.innerValue.filter(item => {
        return (
          item.withdrawable === 1 &&
          item.service !== "total" &&
          Math.floor(this.remainingDivisibleWallet / activeWalletLength) <
          item.min_balance
        );
      });
      const distributedAboveMinWalletLength =
        activeWalletLength - distributeBelowMinWallet.length;
      const newRemainingDivisibleWallet =
        this.remainingDivisibleWallet -
        (distributeBelowMinWallet.length === 0
          ? 0
          : distributeBelowMinWallet.reduce((a, b) => ({
            min_balance: a.min_balance + b.min_balance
          })).min_balance);
      const newWalletValue = this.innerValue.map(item => ({
        ...item,
        balance:
          item.withdrawable === 1 && item.service !== "total"
            ? Math.floor(this.remainingDivisibleWallet / activeWalletLength) <
            item.min_balance
              ? item.min_balance
              : Math.floor(
                newRemainingDivisibleWallet / distributedAboveMinWalletLength
              )
            : item.balance
      }));
      return newWalletValue;
    }
  },
  watch: {
    // Handles internal model changes.
    innerValue: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.$emit("input", val);
        }
      },
      deep: true
    },
    // Handles external model changes.
    value: {
      handler(val, oldVal) {
        if (!isEqualDeep(val, oldVal)) {
          this.innerValue = val;
        }
      },
      deep: true
    }
  },
  created() {
    this.innerValue = this.value;
  },
  methods: {
    distributeWallet() {
      for (let i = 0; i < this.innerValue.length; i++) {
        this.$set(
          this.innerValue[i],
          "balance",
          this.equallyDistributedWallet[i].balance
        );
      }
    },
    formatCurrency(money, decimalPoint = 0) {
      return (decimalPoint === 0 ? Math.floor(money) : money)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
    }
  }
};
</script>

<style scoped></style>
