export default {
  computed: {},
  methods: {
    can(permission) {
      return this.$can(`${this.$route.name}.${permission}`);
    }
  }
};
