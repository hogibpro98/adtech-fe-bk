import {USER, ROLE} from "~/constants/resource";

const action = $axios => ({
  updateUserPassword(payload) {
    return $axios.$post(`${USER}/update-password`, payload);
  },

  storeAgency(payload) {
    return $axios.$post(`${USER}/store-agency`, payload);
  },

  updateAgency(payload) {
    return $axios.$post(`${USER}/update-agency`, payload);
  },

  storeAdvertiser(payload) {
    return $axios.$post(`${USER}/store-advertiser`, payload);
  },

  updateAdvertiser(payload) {
    return $axios.$post(`${USER}/update-advertiser`, payload);
  },

  updateSelfInfo(payload) {
    return $axios.$post(`${USER}/update-self`, payload);
  },

  updateSelfPassword(payload) {
    return $axios.$post(`${USER}/update-self-password`, payload);
  },

  createSelfPassword(payload) {
    return $axios.$post(`${USER}/create-self-password`, payload);
  },

  updateRolePermission(payload) {
    return $axios.$post(`${ROLE}/update-permission`, payload);
  },

  approveUser(payload) {
    return $axios.$post(`${USER}/approve`, payload);
  },

  rejectUser(payload) {
    return $axios.$post(`${USER}/reject`, payload);
  },

  sendVerifyEmail() {
    return $axios.$post("/auth/verify");
  },

  register(payload) {
    return $axios.$post(`/auth/user/register`, payload);
  },

  getNotifications(page, itemsPerPage = 5) {
    return $axios.$post(`/notification`, {
      page,
      itemsPerPage
    });
  },

  markAsRead(id) {
    return $axios.$post("/notification/click", {id});
  },

  markAsViewAll() {
    return $axios.$post("/notification/mark-as-viewed");
  },

  markAsReadAll() {
    return $axios.$post("/notification/mark-as-read-all");
  },

  resetPassword(payload) {
    return $axios.$post(`/auth/reset-password`, payload);
  },

  getPagePermissions(payload) {
    return $axios.$post(`/page/permission`, payload);
  }
});
export default action;
