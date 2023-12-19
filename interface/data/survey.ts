export interface SurveyInterface {
  question: string;

  type: string;
  id: number;

  item_permissions: Array<string>;
  answers_choices: Array<string>;

  key: string;
}
