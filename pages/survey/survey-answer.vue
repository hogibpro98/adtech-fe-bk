<template>
  <survey-answer-table />
</template>

<script>
import SurveyAnswerTable from "~/components/survey/SurveyAnswerTable";
export default {
  name: "SurveyAnswer",
  components: { SurveyAnswerTable },
  layout: "dashboard",
  permission: false
};
</script>

<style scoped>

</style>