import { uniqueId } from "lodash";

export default {
  props: {
    vid: {
      type: String,
      default: null
    },
    required: {
      type: Boolean,
      default: false
    },
    rules: {
      type: [String, Object],
      default: ""
    },
    label: {
      type: String,
      default: ""
    },
    name: {
      type: String,
      default: ""
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uuid: ""
    };
  },
  mounted() {
    this.uuid = uniqueId();
  }
};
