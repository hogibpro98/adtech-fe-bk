<template>
  <v-checkbox-with-validation
    v-model="innerValue"
    label="Các câu hỏi"
    :required="required"
    :rules="rules"
    multiple
    item-text="question"
    item-value="id"
    layout-class="layout flex wrap"
    checkbox-class="flex-unset flex xs12 lg6 checkbox-responsive"
    :items="selectableQuestions"
  />
</template>

<script lang="ts">
import Vue, { VueConstructor } from "vue";
import wrapper from "~/mixins/wrapper";
import { FALSE, TRUE } from "~/constants/code";
import { SelectDataInterface } from "~/interface/components/select";
import VCheckboxWithValidation from "~/components/common/VCheckboxWithValidation.vue";
import deepWrapper from "~/mixins/deepWrapper";
import input from "~/mixins/input";

const SurveySelect = (Vue as VueConstructor<Vue & SelectDataInterface>).extend({
  name: "SurveySelect",
  components: { VCheckboxWithValidation },
  mixins: [deepWrapper, input],
  data() {
    return {
      selectableQuestions: [],
      loading: false
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      const { data } = await this.$axios.post("/survey/all");
      this.selectableQuestions = data.data;
      this.loading = false;
    }
  }
});

export default SurveySelect;
export type SurveySelectRef = InstanceType<typeof SurveySelect>;
</script>
