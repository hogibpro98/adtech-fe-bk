<template>
  <form-dialog
    ref="refFormDialog"
    :title="title"
    :label-button-confirm="labelButtonConfirm"
    :loading="loading"
    content-class="flex xs12 sm8 md6 lg5 xl4"
    v-bind="$attrs"
    @on-submit="onSubmit"
    v-on="$listeners"
  >
    <template slot="content">
      <v-flex xs12 class="form-group">
        <v-text-field-with-validation
          v-model="item.question"
          :loading="loading"
          :counter="100"
          name="name"
          type="text"
          label="Câu hỏi"
          required
          rules="required|max:100"
        />
      </v-flex>
      <v-select
        v-model="item.type"
        :items="items"
        item-value="value"
        item-text="text"
        label="Loại câu trả lời"
      >
      </v-select>
      <v-list v-if="item.type === 'choice' || item.type === 'multi_choice'">
        <v-list-item v-for="(answer, i) in answersChoice" :key="i">
          <v-text-field-with-validation
            v-model="item.answers_choices[i]"
            :counter="100"
            name="name"
            type="text"
            label="Câu trả lời"
            required
            rules="required|max:100"
            :value="answer"
          />
          <v-btn color="grey" text @click="deleteAnswer(i)">
            Xóa
          </v-btn>
        </v-list-item>
        <v-btn color="primary darken-1" class="mr-0" text @click="addAnswer()">
          Thêm câu trả lời
        </v-btn>
      </v-list>
    </template>
  </form-dialog>
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import cloneDeep from "lodash/cloneDeep";
import FormDialog, { FormDialogRef } from "~/components/common/FormDialog.vue";
import VTextFieldWithValidation from "~/components/common/VTextFieldWithValidation.vue";
import { CODE_SUCCESS, HTTP_CODE_422 } from "~/constants/code";
import { SurveyInterface } from "~/interface/data/survey";
import { RepositoryInterface } from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";

interface ComponentData {
  title: string;
  labelButtonConfirm: string;
  isEdit: boolean;
  timeout: number;
  loading: boolean;
  item: SurveyInterface;
  $refs: { refFormDialog: FormDialogRef };
  $surveyRepository: RepositoryInterface;
  $toast: ToastInterface;
}

interface ComponentMethods {
  show: Function;
  hidden: Function;
  addItem: Function;
  editItem: Function;
}

const DEFAULT_ITEM = {
  question: "",
  type: "text",
  id: null,
  item_permissions: [],
  answers_choices: [],
  choices: [],
  key: null
};

const pluck = (arr, key) => arr.map(i => i[key]);
const SurveyQuestionFormDialog = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "SurveyQuestionFormDialog",
  components: {
    FormDialog,
    VTextFieldWithValidation
  },
  data() {
    return {
      title: "",
      labelButtonConfirm: "",
      isEdit: false,
      timeout: null,
      loading: false,
      item: cloneDeep(DEFAULT_ITEM),
      items: [
        { text: "Nhập câu trả lời", value: "text" },
        { text: "Một lựa chọn", value: "choice" },
        { text: "Nhiều lựa chọn", value: "multi_choice" }
      ],
      answersChoice: []
    };
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    show(item = null) {
      console.log(item);
      clearTimeout(this.timeout);
      if (item) {
        this.isEdit = true;
        this.item = cloneDeep(item);
        this.answersChoice = pluck(this.item.choices, "choice");
        this.item.answers_choices = this.answersChoice;
      } else {
        this.isEdit = false;
        this.item = cloneDeep(DEFAULT_ITEM);
      }

      this.title = `${this.isEdit ? "Cập nhật" : "Thêm"} survey`;
      this.labelButtonConfirm = this.isEdit ? "Cập nhật" : "Thêm";
      this.loading = false;
      this.$refs.refFormDialog.show();
    },
    hidden() {
      this.$refs.refFormDialog.hidden();
      clearTimeout(this.timeout);
    },
    onSubmit() {
      if (this.isEdit) {
        this.editItem();
      } else {
        this.addItem();
      }
    },

    async addItem() {
      this.loading = true;
      try {
        const res = await this.$surveyRepository.create(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("create-success");
          this.$toast.global.add_success("Survey");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    },

    async editItem() {
      this.loading = true;
      console.log(this.item);
      try {
        const res = await this.$surveyRepository.update(this.item);
        this.loading = false;
        if (res.code === CODE_SUCCESS) {
          this.hidden();
          this.$emit("update-success");
          this.$toast.global.edit_success("Survey");
        } else {
          this.$toast.global.action_fail();
        }
      } catch (e) {
        this.loading = false;
        if (e.response && e.response.status === HTTP_CODE_422) {
          this.$refs.refFormDialog.setErrors(e.response.data.errors);
        }
      }
    },
    deleteAnswer(i) {
      this.answersChoice.splice(i, 1);
      this.item.answers_choices = this.answersChoice;
    },
    addAnswer() {
      this.answersChoice.push(null);
      this.item.answers_choices = this.answersChoice;
    }
  }
});

export default SurveyQuestionFormDialog;
export type SurveyQuestionFormDialogRef = InstanceType<
  typeof SurveyQuestionFormDialog
>;
</script>

<style scoped></style>
