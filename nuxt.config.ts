import colors from "vuetify/lib/util/colors";
import { NuxtConfig } from "@nuxt/types";

const pkg = require("./package");

// const VuetifyLoaderPlugin = require("vuetify-loader/lib/plugin");

// @ts-ignore
// @ts-ignore
// @ts-ignore
const config: NuxtConfig = {
  ssr: false,

  /*
   ** Headers of the page
   */
  head: {
    title: "VDA",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "Viettel Digital Advertisng"
      }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    script: [
      {
        src: "/javascripts/echart.min.js",
        body: true
      },
      {
        src: "/javascripts/embed-tiktok.min.js",
        body: true
      }
    ]
  },

  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#3adced" },

  /*
   ** Global CSS
   */
  css: [
    "font-awesome/css/font-awesome.css",
    "vue-transmit/dist/vue-transmit.css",
    "roboto-fontface/css/roboto/roboto-fontface.css",
    "@/assets/sass/app.scss",
    "@mdi/font/css/materialdesignicons.min.css"
  ],

  env: {
    // baseUrl: process.env.BASE_URL || 'https://apiads.mhsolution.vn/api',
    baseUrl: process.env.BASE_URL || "https://apiads.mhsolution.vn/api",
    BASE_URL: process.env.BASE_URL || "https://apiads.mhsolution.vn/api",
    BASE_SHORTEN_URL: process.env.BASE_SHORTEN_URL || "https://abc.com/",
    ECHO_HOST: process.env.ECHO_HOST || "https://socket.mhsolution.vn",
    UPLOAD_URL:
      process.env.UPLOAD_URL || "https://apiads.mhsolution.vn/api/media/upload",
    SDK_URL:
      process.env.SDK_URL ||
      "https://qc.mhsolution.vn/pagead/sdk-display-ads.min.js?v=1.0.1",
    API_ENDPOINT:
      process.env.API_ENDPOINT || "https://adsdistributor.mhsolution.vn/api/",
    API_EXPORT_BASE: process.env.API_EXPORT_BASE
  },

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [
    "~/plugins/api",
    "~/plugins/directive",
    "~/plugins/vee-validate",
    "~/plugins/repository",
    "~/plugins/filter",
    "~/plugins/v-mask",
    "~/plugins/numeral",
    "~/plugins/document-preview",
    { src: "@/plugins/vue-perfect-scrollbar", mode: "client" },
    { src: "@/plugins/chart", mode: "client" },
    { src: "@/plugins/vue-transmit", mode: "client" },
    { src: "@/plugins/vue-image", mode: "client" },
    { src: "@/plugins/numeral", mode: "client" },
    { src: "@/plugins/vue-flat-pickr", mode: "client" },
    { src: "@/plugins/v-clipboards", mode: "client" },
    { src: "@/plugins/vue-sticky-directive", mode: "client" }
  ],

  buildModules: [
    // With options
    [
      "@nuxt/typescript-build",
      {
        typeCheck: {
          typescript: {
            enabled: true,
            mode: "write-tsbuildinfo"
          }
        }
      }
    ],
    [
      "@nuxtjs/laravel-echo",
      {
        /* module options */
        broadcaster: "socket.io",
        host: process.env.ECHO_HOST || "https://socket.mhsolution.vn",
        authEndpoint: "/broadcasting/auth",
        authModule: true,
        connectOnLogin: true,
        disconnectOnLogout: true
      }
    ]
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    "@nuxtjs/axios",
    "@nuxtjs/auth-next",
    "@nuxtjs/toast",
    "@nuxtjs/vuetify"
  ],

  auth: {
    plugins: [
      "~/plugins/axios",
      "~/plugins/auth",
      "~/plugins/authWallet"
      // "~/plugins/laravel-echo"
    ],
    // Options
    redirect: {
      login: "/login",
      logout: "/login",
      // @ts-ignore
      callback: false,
      home: "/"
    },
    cookie: false,
    strategies: {
      local: {
        token: {
          property: "access_token"
        },
        endpoints: {
          login: {
            url: "/auth/login",
            method: "POST",
            propertyName: "access_token",
            withCredentials: true
          },
          logout: {
            url: "/auth/logout",
            method: "post",
            withCredentials: true
          },
          user: {
            url: "/auth/me",
            method: "post",
            propertyName: "user"
          },
          refresh: {
            url: "/auth/refresh",
            method: "post",
            propertyName: "access_token",
            withCredentials: true
          }
        }
      }
    }
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.BASE_URL || "https://apiads.mhsolution.vn/api",
    credentials: true
  },
  toast: {
    position: "top-right",
    duration: 30000,
    singleton: true,
    action: [
      {
        icon: "close",
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onClick: (e, toastObject) => {
          toastObject.goAway(0);
        }
      }
    ],
    register: [
      // Register custom toasts
      {
        name: "too_many_action",
        message: "Thực hiện quá nhiều hành động, vui lòng thử lại sau ít phút",
        options: {
          type: "error"
        }
      },
      {
        name: "no_permission",
        message: "Bạn không có quyền thực hiện hành động này.",
        options: {
          type: "error"
        }
      },
      {
        name: "action_success",
        message: item => `Thực hiện ${item} thành công.`,
        options: {
          type: "success",
          duration: 1500
        }
      },
      {
        name: "add_success",
        message: item => `Thêm ${item} thành công.`,
        options: {
          type: "success",
          duration: 1500
        }
      },
      {
        name: "edit_success",
        message: item => `Cập nhật ${item} thành công.`,
        options: {
          type: "success",
          duration: 1500
        }
      },
      {
        name: "delete_success",
        message: item => `Xóa ${item} thành công`,
        options: {
          type: "success",
          duration: 1500
        }
      },
      {
        name: "action_fail",
        message: "Thực hiện thất bại, vui lòng thử lại sau.",
        options: {
          type: "error"
        }
      },
      {
        name: "server_error_msg",
        message: msg => msg,
        options: {
          type: "error"
        }
      },
      {
        name: "no_auth",
        message: "Đã hết phiên làm việc, vui lòng đăng nhập lại",
        options: {
          type: "error"
        }
      },
      {
        name: "new_notification",
        message: "Bạn có thông báo mới.",
        options: {
          position: "bottom-right",
          singleton: true,
          duration: 10000
        }
      }
    ]
  },
  vuetify: {
    customVariables: ["~assets/sass/variables.scss"],
    defaultAssets: false,
    iconfont: "mdi",
    treeShake: true,
    options: {
      customProperties: true
    },
    theme: {
      themes: {
        light: {
          icon: colors.grey.darken4,
          background: "#ffffff",
          "page-chart": "#f1f3f4",
          "data-table-toolbar": "#fff",
          disabled: "#9e9e9e",
          "label-disabled": "#5f6368",
          "card-background": "#fff",
          toolbar: "#f5f5f5"
        },
        dark: {
          icon: colors.grey.lighten4,
          background: "#1e1e1e",
          "page-chart": "#1f1f1f",
          "data-table-toolbar": "#1f1f1f",
          "card-background": "#303030",
          "label-disabled": "#5f6368",
          toolbar: "#272727"
        }
      }
    }
  },
  /*
   ** Build configuration
   */
  build: {
    transpile: ["vee-validate/dist/rules"],
    plugins: [],
    loaders: {
      vue: {
        compilerOptions: {
          whitespace: "condense"
        }
      },
      stylus: {
        import: ["~assets/style/variables.styl"]
      }
    },
    /*
     ** You can extend webpack config here
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    extend(config, ctx) {
      if (ctx.isDev) {
        config.devtool = ctx.isClient ? "source-map" : "inline-source-map";
      }
    }
  }
};

export default config;
