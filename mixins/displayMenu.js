import menu from "@/api/menu";
import cloneDeep from "lodash/cloneDeep";

export default {
  computed: {
    displayMenu() {
      return this.getDisplayMenus(cloneDeep(menu));
    }
  },
  methods: {
    getDisplayMenus(menus) {
      return menus.filter(item => {
        const routeName =
          item.href && item.href.substring(1).replace(/\//g, "-");
        if (item.items) {
          item.items = this.getDisplayMenus(item.items);
          return item.items.length > 0;
        } else {
          let viewable = true;
          if (item.permission) {
            viewable = viewable && this.$can(`${routeName}.view`);
          }
          if (item.service) {
            viewable = viewable && this.$hasService(item.service);
          }
          return viewable;
        }
      });
    }
  }
};
