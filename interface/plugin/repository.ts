export interface ResponseInterface {
  code: number;
  message: string;
  data?: any;
  results: Array<any>;
  errors: Array<any>;
  num_unread: number;
  num_un_view: number;
  load_more_able: boolean;
}

export interface RepositoryInterface {
  all(): Promise<ResponseInterface>;

  list(params?: object): Promise<ResponseInterface>;

  show(id?: any): Promise<ResponseInterface>;

  get(path?: string, params?: object): Promise<ResponseInterface>;

  getDetail(id?: any): Promise<ResponseInterface>;

  post(path: string, body?: object): Promise<ResponseInterface>;

  select(params?: object): Promise<ResponseInterface>;

  create(payload?: object): Promise<ResponseInterface>;

  update(payload?: object): Promise<ResponseInterface>;

  delete(payload?: object): Promise<ResponseInterface>;

  massDelete(payload?: object): Promise<ResponseInterface>;

  approve(payload?: object): Promise<ResponseInterface>;

  reject(payload?: object): Promise<ResponseInterface>;

  exportFile(payload?: object): Promise<ResponseInterface>;

  changeStatus(payload?: object): Promise<ResponseInterface>;
}

export interface ApiActionInterface {
  updateUserPassword(params?: any): Promise<ResponseInterface>;
  storeAgency(params?: any): Promise<ResponseInterface>;
  updateAgency(params?: any): Promise<ResponseInterface>;
  storeAdvertiser(params?: any): Promise<ResponseInterface>;
  updateAdvertiser(params?: any): Promise<ResponseInterface>;
  updateSelfInfo(params?: any): Promise<ResponseInterface>;
  updateSelfPassword(params?: any): Promise<ResponseInterface>;
  createSelfPassword(params?: any): Promise<ResponseInterface>;
  updateRolePermission(params?: any): Promise<ResponseInterface>;
  approveUser(params?: any): Promise<ResponseInterface>;
  rejectUser(params?: any): Promise<ResponseInterface>;
  sendVerifyEmail(params?: any): Promise<ResponseInterface>;
  register(params?: any): Promise<ResponseInterface>;
  getNotifications(params?: any): Promise<ResponseInterface>;
  markAsRead(params?: any): Promise<ResponseInterface>;
  markAsViewAll(params?: any): Promise<ResponseInterface>;
  markAsReadAll(params?: any): Promise<ResponseInterface>;
  resetPassword(params?: any): Promise<ResponseInterface>;
  getPagePermissions(params?: any): Promise<ResponseInterface>;
}

export interface AppRepository {
  $userRepository: RepositoryInterface;
  $MMSDayRepository: RepositoryInterface;
  $SMSDayRepository: RepositoryInterface;
  $dataDayRepository: RepositoryInterface;
}
