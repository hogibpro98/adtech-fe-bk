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
    </v-row>
    <v-simple-table class="table-balance">
      <template #default>
        <thead>
          <tr>
            <th class="text-left">
              Dịch vụ
            </th>
            <th class="text-right">
              Số dư
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in subWallets" :key="item.display_name">
            <td class="text-left">{{ item.service_info.display_name }}</td>
            <td class="text-right">{{ formatCurrency(item.balance) }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <div class="display-card__content">
      <client-only>
        <e-chart :path-option="computeChartOption" width="100%" height="320px">
        </e-chart>
      </client-only>
    </div>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
import SliderWithInput from "~/components/page/admin/cms-wallet/SliderWithInput";
import VSliderWithValidation from "~/components/common/VSliderWithValidation";
import { isEqualDeep } from "~/helpers/ultis";
import { colorPalette } from "~/constants/color";

export default {
  name: "WalletDetailEchart",
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
      ],
      data: [
      ],

      inView: false,
      colorPalette,
      selectedCategories: [],
      loadingData: false
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
    },
    computeChartOption() {
      this.data = this.subWallets.map(e => {
        return {
          text: e.service_info.display_name,
          value: e.balance
        };
      });
      console.log("abc", this.data);
      const options = [
        ["dataset.source", this.data],
        ["series[0].type", "pie"],
        ["series[0].center", ["30%", "50%"]],
        ["series[0].radius", "80%"],
        ["legend.show", true],
        ["legend.tooltip.show", true],
        ["legend.orient", "vertical"],
        ["legend.right", 2],
        ["legend.textStyle.width", 120],
        ["legend.top", "center"],
        ["legend.textStyle.overflow", "truncate"],
        ["xAxis.show", false],
        [
          "series[0].label",
          {
            normal: {
              show: true,
              formatter(params) {
                return `${params.percent}%`;
              },
              position: "outer"
              // textStyle: {
              //   color: "#fff",
              //   fontSize: 14
              // }
            }
          }
        ],
        [
          "series[0].labelLine",
          {
            show: true,
            length: 8,
            length2: 8
          }
        ]
        // ["color", this.chartColor]
      ];
      options.push(["series[0].name", this.title]);
      return options;
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

<style scoped>
.table-balance {
  border: 2px solid rgba(0, 0, 0, 0.6);
  margin: 2rem 0 1rem 0;
}
.text-center {
  color: #1f1f1f !important;
  font-size: 20px !important;
  border-right: thin solid rgba(0,0,0,.12);
}
.text-left {
  color: #1f1f1f !important;
  font-size: 20px !important;
  border-right: thin solid rgba(0,0,0,.12);
}
.text-right {
  color: #1f1f1f !important;
  font-size: 20px !important;
  border-right: thin solid rgba(0,0,0,.12);
}
</style>
