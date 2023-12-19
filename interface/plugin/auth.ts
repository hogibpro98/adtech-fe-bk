import { LocalScheme } from "@nuxtjs/auth-next/dist";
import { UserInterface } from "~/interface/data/user";
import { StoreInterface } from "~/interface/store";
interface UserAuthInterface extends UserInterface {

}

export interface AuthInterface {
  user: UserAuthInterface;
  loggedIn: boolean;
  $storage: StoreInterface;
  strategy: LocalScheme;
  setUser(user: UserInterface): void;
  logout(): Promise<void>;
  getToken(name?: string): string;
}
