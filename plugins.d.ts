import {
  ApiActionInterface,
  AppRepository
} from "~/interface/plugin/repository";
import { ToastInterface } from "~/interface/plugin/toast";
// 2. Specify a file with the types you want to augment
//    Vue has the constructor type in types/vue.d.ts

declare module "vue/types/vue" {
  // 3. Declare augmentation for Vue
  interface Vue extends AppRepository {
    $echo: any;
    $apiAction: ApiActionInterface;
    $toast: ToastInterface;
    $filter: any;
    $can(permission: string): boolean;
    $authHasRole(role: string | Array<string>): boolean;
    $logout(): void;
    permission: any;
  }
}
