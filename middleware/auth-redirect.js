export default ({ $auth, redirect, route }) => {
  if (!$auth.loggedIn) {
    redirect("/login?redirect=" + route.fullPath);
  }
};
