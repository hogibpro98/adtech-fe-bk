import displayMenu from "~/mixins/displayMenu";
export default {
  mixins: [displayMenu],
  created() {
    this.getSearchMenu(this.displayMenu);
  },
  methods: {
    getSearchMenu(menu, prefix) {
      for (let i = 0; i < menu.length; i++) {
        if (menu[i].href) {
          let searchMenuItem;
          if (!prefix) {
            searchMenuItem = {
              display_name: menu[i].title,
              href: menu[i].href
            };
          } else {
            searchMenuItem = {
              display_name: prefix + " - " + menu[i].title,
              href: menu[i].href
            };
          }
          this.searchMenu.push(searchMenuItem);
        } else if (menu[i].items) {
          let prefixTitle;
          if (prefix) {
            prefixTitle = prefix + " - " + menu[i].title;
          } else {
            prefixTitle = menu[i].title;
          }
          this.getSearchMenu(menu[i].items, prefixTitle);
        }
      }
    }
  },
  data() {
    return {
      searchMenu: []
    };
  }
};
