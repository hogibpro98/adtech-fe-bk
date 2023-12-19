import { ROLE_IS_ADMIN } from "~/constants/role";

export default ({ $auth, error, $authHasRole, route }) => {
  if (!$authHasRole(ROLE_IS_ADMIN)) {
    if (route.params.id && route.params.id !== $auth.user.id) {
      error({ statusCode: 404 });
    }
  }
};
