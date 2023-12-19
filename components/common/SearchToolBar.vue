<template>
  <v-autocomplete
    ref="SearchToolBar"
    v-model="selectedSearchMenuItem"
    :items="searchMenu"
    item-text="display_name"
    flat
    return-object
    solo-inverted
    append-icon=""
    prepend-inner-icon="search"
    placeholder="Tìm kiếm"
    no-data-text="Không có trang nào phù hợp"
    hide-details
    class="hidden-sm-and-down my-auto w-full max-width-50"
    @input="handlerSearchMenu"
  >
  </v-autocomplete>
</template>

<script>
import searchMenu from "~/mixins/searchMenu";
export default {
  name: "SearchToolBar",
  mixins: [searchMenu],
  props: {
    items: {
      type: Array,
      require: true
    }
  },
  data() {
    return {
      selectedSearchMenuItem: {}
    };
  },
  methods: {
    handlerSearchMenu() {
      if (this.selectedSearchMenuItem.href) {
        this.$router.push(this.selectedSearchMenuItem.href);
        this.selectedSearchMenuItem = {};
        if (this.$refs.SearchToolBar.isFocused) {
          this.$refs.SearchToolBar.blur();
        }
      }
    }
  }
};
</script>

<style></style>
