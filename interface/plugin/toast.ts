interface GlobalInterface {
  too_many_action: Function;
  no_permission: Function;
  action_success: Function;
  add_success: Function;
  edit_success: Function;
  delete_success: Function;
  action_fail: Function;
  server_error_msg: Function;
  no_auth: Function;
  new_notification: Function;
}

export interface ToastInterface {
  show: Function;
  success: Function;
  info: Function;
  error: Function;
  register: Function;
  clear: Function;
  global: GlobalInterface;
}
