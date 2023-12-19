// @ts-ignore
import Echo from "laravel-echo";
import { Inject } from "@nuxt/types/app";
import GlobalDataInterface from "~/interface/data/global";

export default function({ $auth }: GlobalDataInterface, inject: Inject): void {
  const token = $auth.getToken("local");
  // @ts-ignore
  window.io = require("socket.io-client");
  // @ts-ignore
  window.Echo = new Echo({
    broadcaster: "socket.io",
    host: "localhost:6001",
    auth: {
      headers: {
        Authorization: token
      }
    }
  });
  // @ts-ignore
  inject("echo", window.Echo);
}
