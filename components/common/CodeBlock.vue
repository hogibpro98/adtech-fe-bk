<template>
  <v-sheet class="app-code no-margin theme--light grey lighten-5">
    <pre
      v-highlightjs="script"
      class="w-full agate white-space-break-spaces"
    ><code class="xml theme--light grey lighten-5"></code></pre>
    <v-tooltip offset-overflow bottom>
      <template #activator="{ on }">
        <v-btn
          v-clipboard="script"
          depressed
          text
          dense
          color="primary"
          icon
          fab
          dark
          right
          absolute
          top
          x-small
          class="ma-0 mt-6"
          v-on="on"
          @mousedown="copy"
        >
          <v-icon>{{ icon }}</v-icon>
        </v-btn>
      </template>
      <span>{{ title }}</span>
    </v-tooltip>
  </v-sheet>
</template>
<script lang="ts">
import Vue, { VueConstructor } from "vue";
import VueHighlightJS from "vue-highlightjs";

// Tell Vue.js to use vue-highlightjs
Vue.use(VueHighlightJS);


interface ComponentData {
  statusCopy: boolean;
  timeout: number;
}

interface ComponentMethods {
  copy(): void;
}


const CodeBlock = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CodeBlock",
  props: {
    script: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      statusCopy: false,
      timeout: null
    };
  },
  computed: {
    title() {
      return this.statusCopy ? "Đã sao chép" : "Sao chép";
    },
    icon() {
      return this.statusCopy ? "done" : "content_copy";
    }
  },
  beforeDestroy() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  },
  methods: {
    copy() {
      this.statusCopy = true;
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => {
        this.statusCopy = false;
      }, 3000);
    }
  }
});

export default CodeBlock;
export type CodeBlockRef = InstanceType<typeof CodeBlock>;
</script>
