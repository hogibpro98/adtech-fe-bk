<template>
  <v-card
    flat
    color="transparent"
    class="mb-0 pr-6"
  >
    <v-subheader class="pl-8 text--darken-2" :class="disable?'':(sliderColor+'--text')">{{ header }}</v-subheader>
    <v-row class="pl-8">
      <v-col cols="5" sm="4" md="3" lg="2" xl="1" order="3">
        <v-text-field
          v-model="sliderValue"
          class="mt-0 pt-0"
          hide-details
          single-line
          type="number"
          @input="changeParent"
          :disabled="disable"
        ></v-text-field>
      </v-col>
      <v-col cols="1" sm="1" order="2" class="row--dense"></v-col>
      <v-col cols="6" sm="7" md="8" lg="9" xl="10" order="1" class="pb-0">
        <v-row justify="start">
          <v-col cols="12">
            <v-slider
              v-model="sliderValue"
              class="align-center"
              :max="maxValue"
              :min="minValue"
              hide-details
              @change="changeParent"
              :color="sliderColor"
              :track-color="sliderColor"
              :disabled="disable"
            >
            </v-slider>
          </v-col>
          <v-col cols="12" class="text-right mr-3 pt-0" :class="{'text--disabled':disable}">
            {{ formatCurrency(maxValue) }} VND
          </v-col>
        </v-row>
      </v-col>
      <!--      <v-col cols="1" sm="2" md="2" lg="2" xl="3" order="3">-->
      <!--       <div> Max ví {{header}}: {{maxValue.toFixed(2).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}} VND</div>-->
      <!--      </v-col>-->
    </v-row>
    <!--    <v-row>-->
    <!--      <v-col cols="12">-->
    <!--        <div class="px-6 py-3">-->
    <!--          <v-divider></v-divider>-->
    <!--        </div>-->
    <!--      </v-col>-->
    <!--    </v-row>-->
  </v-card>
</template>

<script>
export default {
  name: "SliderWithInput",
  props: {
    value: {
      default: null,
    },
    maxValue: {
      type: Number,
      default: 50,
    },
    minValue: {
      type: Number,
      default: 0,
    },
    vuetifyClass: {
      type: String,
      default: "",
    },
    header: {
      type: String,
      default: "",
    },
    disable: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    inputRule: function () {
      return "required|numeric|between:" + this.minValue.toString() + "," + this.maxValue.toString()
    },
    sliderColor: function () {
      const color_index = this.sliderValue / this.maxValue * 100;
      if (color_index >= 99) return "red";
      else if (color_index >= 80) return "orange";
      else if (color_index >= 60) return "yellow";
      else if (color_index >= 40) return "green";
      else return "blue";
    }
  },
  watch: {
    'value': {
      handler(newVal, oldVal) {
        this.sliderValue = newVal
        // console.log('Prop changed: ', newVal, ' | was: ', oldVal)
      },
      deep: true
    }
  },
  data: () => {
    return {
      sliderValue: 0,
    }
  },
  mounted() {
    this.sliderValue = this.value
  },
  methods: {
    changeParent() {
      let emitValue = parseInt(this.sliderValue)
      if (this.sliderValue === "") {
        emitValue = this.minValue;
      }
      if (parseInt(this.sliderValue) > this.maxValue) {
        emitValue = this.maxValue;
      }
      if (parseInt(this.sliderValue) < this.minValue) {
        emitValue = this.minValue;
      }
      // console.log(emitValue)
      this.$emit('input', emitValue)
    },
    formatCurrency(money, decimalPoint = 0) {
      return (decimalPoint === 0 ? Math.floor(money) : money).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    }
  }
}
</script>

<style scoped>

</style>
