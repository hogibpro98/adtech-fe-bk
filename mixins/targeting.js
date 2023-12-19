import cloneDeep from "lodash/cloneDeep";

export default {
  data() {
    return {
      hasImport: true,
      toolbar: {
        isCreate: true,
      },
      targetingName: "location",
      targetingDisplayName: "vị trí"
    };
  },
  computed: {
    canSetting() {
      return this.$can("system-config.edit");
    },
    toolbarSetting() {
      const toolbar = cloneDeep(this.toolbar);
      if (this.canSetting) {
        toolbar["set-config"] = {
          icon: "settings",
          desc: `Điều chỉnh`,
          tooltip: "Điều chỉnh dịch vụ sử dụng"
        };
      }
      return toolbar;
    }
  },
  methods: {
    openConfig() {
      this.$refs.configDialog.show(
        this.targetingName,
        this.targetingDisplayName
      );
    }
  }
};
