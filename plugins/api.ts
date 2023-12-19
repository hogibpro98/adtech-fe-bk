export default function({ $axios }, inject) {
  // Create a custom axios instance
  const api = $axios.create();
  // Inject to context as $api
  inject("api", api);
}
