import Vue from "vue";
Vue.directive("icon-tooltip", {
  inserted(el, binding) {
    const icon = document.createElement("i");
    icon.className = `v-icon mdi ${binding.value.mdiIcon}`;
    icon.setAttribute("data-title", `${binding.value.tooltip}`);
    el.style.alignItems = "center";
    el.appendChild(icon);
  }
});
