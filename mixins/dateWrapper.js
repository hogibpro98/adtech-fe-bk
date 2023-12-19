import moment from 'moment/src/moment';
import { DATE, REQUEST_DATE, SQL_DATE } from "~/constants/format";

export default {
  props: {
    value: String,
    format: {
      type: String,
      default: SQL_DATE
    },
    displayFormat: {
      type: String,
      default: DATE
    }
  },
  data: () => ({
    date: null
  }),
  computed: {
    sortedDate() {
      if (Array.isArray(this.date)) {
        return this.date.slice().sort();
      }
      return this.date;
    }
  },
  watch: {
    // Handles internal model changes.
    sortedDate: {
      handler(val) {
        this.$emit("input", this.formatModel(val));
      },
      deep: true
    },
    // Handles external model changes.
    value: {
      handler(val, prevVal) {
        if (Array.isArray(val)) {
          this.date = val.slice().sort();
        } else {
          this.date = val;
        }
      },
      deep: true
    }
  },
  created() {
    if (this.value) {
      this.date = this.value;
    }
  },
  methods: {
    formatDate(date) {
      if (Array.isArray(date)) {
        return date
          .map(e => {
            return moment(e, this.format).format(this.displayFormat);
          })
          .join(";");
      }
      if (!date) return null;
      return moment(date, this.format).format(this.displayFormat);
    },
    parseFormat(date) {
      return moment(date, this.format).format(SQL_DATE);
    },
    formatModel(date) {
      return moment(date, SQL_DATE).format(this.format);
    },
    parseDate(date) {
      if (!date) return null;
      const [day, month, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }
  }
};
