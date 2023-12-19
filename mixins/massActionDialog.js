import { sortBy } from "lodash";

export default {
  props: {
    itemText: {
      type: String,
      default: "name"
    }
  },
  data() {
    return {
      items: []
    };
  },
  computed: {
    sortedItems() {
      return sortBy(this.items, this.itemText);
    }
  }
};
