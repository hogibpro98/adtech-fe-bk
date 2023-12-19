const repository = $axios => resource => ({
  all() {
    return $axios.$post(`${resource}/all`);
  },

  list(params) {
    return $axios.$post(`${resource}/listing`, params);
  },

  show(id) {
    return $axios.$post(`${resource}/${id}`);
  },

  get(path, params = {}) {
    const pathResource = path ? `/${path}` : "";
    return $axios.$get(`${resource}${pathResource}`, { params });
  },

  getDetail(id) {
    return $axios.$post(`${resource}/detail?id=${id}`);
  },

  post(path = "", body) {
    return $axios.$post(`${resource}/${path}`, body);
  },

  select(params) {
    return $axios.$post(`${resource}/select`, params);
  },

  create(payload) {
    return $axios.$post(`${resource}/store`, payload);
  },

  update(payload) {
    return $axios.$post(`${resource}/update`, payload);
  },

  delete(payload) {
    return $axios.$post(`${resource}/delete`, payload);
  },

  massDelete(payload) {
    return $axios.$post(`${resource}/mass-delete`, payload);
  },

  massApprove(payload) {
    return $axios.$post(`${resource}/mass-approve`, payload);
  },

  massReject(payload) {
    return $axios.$post(`${resource}/mass-reject`, payload);
  },

  approve(payload) {
    return $axios.$post(`${resource}/approve`, payload);
  },

  reject(payload) {
    return $axios.$post(`${resource}/reject`, payload);
  },

  exportFile(payload) {
    return $axios.$post(`${resource}/export`, payload);
  },

  changeStatus(payload) {
    return $axios.$post(`${resource}/change-status`, payload);
  }
});

export default repository;
