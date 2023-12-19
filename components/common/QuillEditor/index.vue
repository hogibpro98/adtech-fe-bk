<template>
  <section class="container text--primary">
    <client-only>
      <quill-editor
        ref="editor"
        v-model="innerValue"
        :options="editorOption"
        @blur="onEditorBlur($event)"
        @focus="onEditorFocus($event)"
        @ready="onEditorReady($event)"
        :data-placeholde="placeholder"
      />
    </client-only>
  </section>
</template>

<script lang="ts">
import wrapper from "@/mixins/wrapper";
import Vue, { VueConstructor } from "vue";

export interface EditorOptionInterface {
  placeholder: string;
  theme: string;
  modules: {
    toolbar: Array<string | object>;
  };
}

interface ComponentData {
  editorOption: EditorOptionInterface;
}

interface ComponentMethods {
  onEditorBlur(editor: any): void;
  onEditorFocus(editor: any): void;
  onEditorReady(editor: any): void;
}

const QuillEditorCustom = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "QuillEditorCustom",
  mixins: [wrapper],
  props: {
    placeholder: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      editorOption: {
        // Some Quill options...
        placeholder: "Nhập nội dung...",
        theme: "snow",
        modules: {
          toolbar: [
            [
              "bold",
              "italic",
              "underline",
              { align: [] },
              { color: [] },
              { font: [] },
              { size: [] },
              "blockquote",
              "code-block"
            ]
          ]
        }
      }
    };
  },
  watch: {
    placeholder(val) {
      this.editorOption.placeholder = val;
    }
  },
  mounted() {
    this.editorOption.placeholder = this.placeholder;
  },
  methods: {
    onEditorBlur(editor) {
      console.log("editor blur!", editor);
    },
    onEditorFocus(editor) {
      console.log("editor focus!", editor);
    },
    onEditorReady(editor) {
      console.log("editor ready!", editor);
    }
  }
});

export default QuillEditorCustom;
export type QuillEditorCustomRef = InstanceType<typeof QuillEditorCustom>;
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  margin: 0 auto;
  padding: 0;
  &::v-deep .ql-container {
    position: relative;
    min-height: 150px;
    max-height: 300px;
    overflow-y: auto;
  }

  &::v-deep .ql-picker-label {
    outline: none;
  }
}
</style>
