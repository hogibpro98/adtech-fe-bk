<template>
  <v-dialog
    v-model="showing"
    v-bind="$attrs"
    persistent
    min-width="800"
    max-width="1200"
    scrollable
    v-on="$listeners"
  >
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>
      <v-card-actions>
        <v-row class="pl-4 py-4">
          <v-flex col6>
            Dữ liệu cũ
          </v-flex>
          <v-flex col6>
            Dữ liệu mới
          </v-flex>
        </v-row>
      </v-card-actions>

      <codemirror ref="codemirror" merge :options="cmOptions" class="px-4" />
      <v-card-actions>
        <v-layout justify-end>
          <v-btn color="grey" text @click.native="showing = false">Đóng</v-btn>
        </v-layout>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script lang="ts">
// merge css
import "codemirror/addon/merge/merge.css";

// merge js
import "codemirror/addon/merge/merge.js";

// google DiffMatchPatch
// @ts-ignore
import DiffMatchPatch from "diff-match-patch";
import Vue, { VueConstructor } from "vue";
import CodeMirror from "codemirror";

// DiffMatchPatch config with global
// @ts-ignore
window.diff_match_patch = DiffMatchPatch;
// @ts-ignore
window.DIFF_DELETE = -1;
// @ts-ignore
window.DIFF_INSERT = 1;
// @ts-ignore
window.DIFF_EQUAL = 0;

interface ComponentData {
  showing: boolean;
  newData: any;
  oldData: any;
  $refs: {
    codemirror: CodeMirror;
  };
}

interface ComponentMethods {
  show(newData: any, oldData: any): void;
  refresh(): void;
}

const CompareDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "CompareDialog",
  props: {
    title: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      timeout: 0,
      showing: false,
      newData: {},
      oldData: {}
    };
  },
  computed: {
    cmOptions() {
      return {
        orig: JSON.stringify(this.newData, null, "\t"),
        origRight: null,
        value: JSON.stringify(this.oldData, null, "\t"),
        mode: {
          name: "javascript",
          json: true
        },
        connect: "align",
        lineNumbers: true,
        collapseIdentical: false,
        highlightDifferences: true,
        revertButtons: false,
        showDifferences: true
      };
    }
  },
  watch: {
    showing(val) {
      if (val) {
        this.$emit("shown");
      } else {
        this.timeout = setTimeout(() => {
          this.newData = "{}";
          this.oldData = "{}";
        }, 300);
        this.$emit("hidden");
      }
    }
  },
  methods: {
    async show(newData, oldData) {
      this.newData = newData;
      this.oldData = oldData;
      await this.$nextTick();
      this.showing = true;
      await this.$nextTick();
      this.refresh();
    },

    refresh() {
      setTimeout(() => {
        const element = this.$refs.codemirror.cminstance.doc.cm.getWrapperElement()
          .parentElement.parentElement;
        element && element.remove && element.remove();
        this.$refs.codemirror.initialize();
      }, 300);
    }
  }
});

export default CompareDialog;
export type CompareDialogRef = InstanceType<typeof CompareDialog>;
</script>
<style>
.CodeMirror-scroll * {
  white-space: pre-wrap;
}
</style>
