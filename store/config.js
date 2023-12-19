export const state = () => ({
  config: {},
  has_fetch: false
});

export const getters = {
  hasFetch: state => state.has_fetch
};

export const mutations = {
  SET_CONFIG(newState, config) {
    newState.config = config;
  },
  CHECK_CONFIG_FETCH_FLAG(newState, flag) {
    newState.has_fetch = flag;
  }
};
export const actions = {
  async fetchConfig({ commit, dispatch }) {
    const config = {};
    try {
      const { data } = await this.$systemConfigRepository.all();
      data.forEach(e => {
        config[e.name] = e.value;
      });
      commit("SET_CONFIG", config);
      commit("CHECK_CONFIG_FETCH_FLAG", true);
    } catch (e) {}
  }
};
