import { VueUiXy } from "vue-data-ui";
import "vue-data-ui/style.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component("VueUiXy", VueUiXy);
});
