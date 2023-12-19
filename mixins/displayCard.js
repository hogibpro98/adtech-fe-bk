import { debounce } from "lodash";

export default {
  props: {
    lazy: {
      type: Boolean,
      default: false
    },
    hasResource: {
      type: Boolean,
      default: false
    },
    resources: {
      type: Array,
      default: () => []
    },
    loadingProps: {
      type: Boolean,
      default: false
    },

    url: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      selectedResource: {},
      inView: false,
      loading: false,
      debounceFetchData: null
    };
  },
  watch: {
    inView(val) {
      if (val) {
        this.debounceFetchData();
      }
    },
    resourceUrl(val) {
      if (val) {
        this.debounceFetchData();
      }
    }
  },
  computed: {
    resourceUrl() {
      return (this.hasResource ? this.selectedResource?.url : this.url) || "";
    }
  },
  created() {
    this.debounceFetchData = debounce(function() {
      this.fetchData();
    }, 400);
  },
  async mounted() {
    this.selectedResource = this.resources[0];
    await this.$nextTick();
    this.debounceFetchData();
  },
  methods: {
    handleInView(entries) {
      if (entries[0].isIntersecting && this.lazy) {
        this.inView = true;
      }
    }
  }
};
