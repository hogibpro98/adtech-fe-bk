export default {
  data() {
    return {
      selectedItems: [],
      objectName: ""
    };
  },
  computed: {
    hasSelectedItems() {
      return this.selectedItems.length > 0;
    },
    canMassDelete() {
      if (this.selectedItems.length === 0) {
        return false;
      }
      return this.selectedItems.some(e => {
        return e.item_permissions.includes("delete");
      });
    },
    selectedIds() {
      return this.selectedItems.map(e => e.id);
    }
  },
  methods: {
    deleteSelected() {
      if (this.canMassDelete) {
        const canDeletedItems = this.selectedItems?.filter(item =>
          item?.item_permissions?.includes("delete")
        );
        this.$refs.massDeleteDialog.show(canDeletedItems);
      } else {
        this.showSelectNoneError();
      }
    },
    showSelectNoneError() {
      this.$toast.error(`Bạn chưa chọn ${this.objectName} nào!`);
    },
    clearSelected() {
      this.$refs.table.clearSelected();
    },
    refreshTable(toFirstPage = false, clearSelect = false) {
      this.$refs.table.refresh(toFirstPage);
      if (clearSelect) {
        this.clearSelected();
      }
    }
  }
};
