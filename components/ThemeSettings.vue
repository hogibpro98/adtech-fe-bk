<template>
  <div id="themeSetting">
    <v-toolbar color="blue" dark>
      <v-toolbar-title>
        Tùy chỉnh giao diện
      </v-toolbar-title>
    </v-toolbar>
    <v-container>
      <v-layout column>
        <v-flex>
          <v-subheader class="px-1 my-2">
            Màu sắc
          </v-subheader>
          <div class="color-option">
            <v-layout wrap>
              <label
                v-for="(option, index) in themeColorOptions"
                :key="index"
                class="color-option--label flex xs6 pa-1"
              >
                <input
                  v-model="themeColor"
                  :value="option.key"
                  type="radio"
                  name="color"
                />
                <span class="color-option--item bg">
                  <span class="overlay">
                    <span class="material-icons">check</span>
                  </span>
                  <span
                    :class="option.value.sideNav"
                    class="color-option--item--header sideNav"
                  ></span>
                  <span
                    :class="option.value.mainNav"
                    class="color-option--item--header mainNav"
                  ></span>
                  <span :class="option.value.sideManu" class="sideMenu"></span>
                </span>
              </label>
            </v-layout>
          </div>
          <div class="theme-options">
            <v-subheader class="px-1 my-2">
              Chế độ giao diện
            </v-subheader>
            <v-divider></v-divider>
            <div class="my-3">
              <v-btn-toggle v-model="sideBarOption">
                <v-btn text value="dark">
                  Dark
                </v-btn>
                <v-btn text value="light">
                  Light
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import colors from "vuetify/es5/util/colors";

interface ComponentData {
  themeColor: string;
  sideBarOption: string;
  colors: Array<object | Array<object>>;
}

const ThemeSettings = (Vue as VueConstructor<Vue & ComponentData>).extend({
  data() {
    return {
      themeColor: null,
      sideBarOption: this.$vuetify.theme.dark ? "dark" : "light",
      colors
    };
  },
  computed: {
    themeColorOptions() {
      return [
        {
          key: "blue",
          value: {
            sideNav: "blue",
            mainNav: "blue",
            sideManu: "white"
          }
        },
        {
          key: "teal",
          value: {
            sideNav: "teal",
            mainNav: "teal",
            sideManu: "white"
          }
        },
        {
          key: "orange",
          value: {
            sideNav: "orange",
            mainNav: "orange",
            sideManu: "white"
          }
        },
        {
          key: "purple",
          value: {
            sideNav: "purple",
            mainNav: "purple",
            sideManu: "white"
          }
        },
        {
          key: "indigo",
          value: {
            sideNav: "indigo",
            mainNav: "indigo",
            sideManu: "white"
          }
        },
        {
          key: "cyan",
          value: {
            sideNav: "cyan",
            mainNav: "cyan",
            sideManu: "white"
          }
        },
        {
          key: "pink",
          value: {
            sideNav: "pink",
            mainNav: "pink",
            sideManu: "white"
          }
        },
        {
          key: "green",
          value: {
            sideNav: "green",
            mainNav: "green",
            sideManu: "white"
          }
        }
      ];
    }
  },
  watch: {
    themeColor: {
      handler(val) {
        if (val) {
          this.$vuetify.theme.themes.light.primary = colors[val].base;
          this.$vuetify.theme.themes.dark.primary = colors[val].base;

          this.$auth.$storage.setUniversal("primaryColor", val);
        }
      }
    },
    sideBarOption: {
      handler(val) {
        this.$vuetify.theme.dark = val === "dark";
        this.$auth.$storage.setUniversal("mode", val);
      }
    }
  },
  async mounted() {
    await this.$nextTick();
    // console.log('cookie', this.$auth.$storage.getUniversals())
    this.themeColor = this.$auth.$storage.getUniversal("primaryColor");
    this.sideBarOption = this.$auth.$storage.getUniversal("mode");
  }
});

export default ThemeSettings;
export type ThemeSettingsRef = InstanceType<typeof ThemeSettings>;
</script>
<style lang="stylus" scoped>
.color-option
  &--label
    position: relative
    display: block
    cursor: pointer
    & input[type="radio"]
      display:none
      &+span
        position: relative
        &>.overlay
          display: none;
          position: absolute
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,.3);
          text-align: center;
          line-height: 30px;
          color: #fff;
      &:checked+span>.overlay
        display:block
    & .bg
      background-color: #f1f1f1
  &--item
    overflow: hidden;
    display: block;
    box-shadow: 0 0 2px rgba(0,0,0,.1);
    margin-bottom: 15px;
    &--header
      height: 10px
    &>span
      display: block;
      float: left;
      width: 50%;
      height: 20px;
</style>
