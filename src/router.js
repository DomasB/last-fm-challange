import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Artist from "./views/Artist.vue";
import fullAlbum from "./views/FullAlbum.vue"
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "home",
      component: Home
    },
    {
      path: "/about",
      name: "about",
      component: About
    },
      {
          path: "/artist/:id",
          name: "artist",
          component: Artist,
          props: true
      },
      {
          path: "/album/:id",
          name: "fullAlbum",
          component: fullAlbum,
          props:true
      }
  ]
});
