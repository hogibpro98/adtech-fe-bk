const ACTION_MAP = {
  edit: {
    color: "primary",
    icon: "edit",
    text: "Cập nhật"
  },
  add: {
    color: "success",
    icon: "add",
    text: "Thêm mới"
  },
  delete: {
    color: "error",
    icon: "delete",
    text: "Xóa"
  },
  running: {
    color: "success",
    icon: "play_arrow",
    text: "Chạy"
  },
  stop: {
    color: "error",
    icon: "stop",
    text: "Dừng"
  },
  pause: {
    color: "warning",
    icon: "pause",
    text: "Tạm dừng"
  },
  reject: {
    color: "red",
    icon: "close",
    text: "Từ chối"
  }
};
export default ACTION_MAP;
