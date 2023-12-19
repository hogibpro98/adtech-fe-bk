export default {
  data() {
    return {
      showing: false,
      timeout: null
    };
  },
  watch: {
    showing(val) {
      if (!val) {
        this.resetData();
      }
    }
  },
  beforeDestroy() {
    clearTimeout(this.timeout);
  },
  methods: {
    resetData() {
      this.timeout = setTimeout(() => {
        //
      }, 300);
    }
  }
};
