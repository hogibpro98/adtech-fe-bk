import Vue from "vue";
// @ts-ignore
import VueCodemirror from "vue-codemirror";

// import base style
import "codemirror/lib/codemirror.css";

// import more codemirror resource...

// you can set default global options and events when Vue.use
Vue.use(
  VueCodemirror /* {
  options: { theme: 'base16-dark', ... },
  events: ['scroll', ...]
} */
);
