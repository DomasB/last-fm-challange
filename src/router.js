import Vue from "vue";
import Router from "vue-router";
import Home from "./views/Home.vue";
import About from "./views/About.vue";
import Artist from "./views/Artist.vue";
import fullAlbum from "./views/FullAlbum.vue";
import Artists from "./views/Artists.vue";
import CompletedArtists from "./views/CompletedArtists.vue";
import Albums from "./views/Albums.vue";
import Tag from "./views/Tag.vue";
import Tags from "./views/Tags.vue";
import Admin from "./views/AdminCookie.vue";
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "Completed Artists",
      redirect: '/completedartists'
    },
    {
      path: "/adminCookie",
      name: "Admin Cookie",
      component: Admin
    },
    {
      path: "/about",
      name: "about",
      component: About
    },
      {
          path: "/artist/:id",
          name: "Artist",
          component: Artist,
          props: true
      },
      {
          path: "/album/:id",
          name: "Full Album",
          component: fullAlbum,
          props:true
      },
      {
          path: "/artists/:limit/:page",
          name: "Artists",
          component: Artists,
          props:true
      },
      {
          path: "/completedartists",
          name: "Completed Artists",
          component: CompletedArtists,
      },
      {
          path: "/tag/:tag",
          name: "Tag",
          component: Tag,
          props:true
      },
      {
          path: "/albums/:limit/:page",
          name: "Albums",
          component: Albums,
          props:true
      },
      {
          path: "/tags",
          name: "Tags",
          component: Tags
      },

  ],
    scrollBehavior (to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { x: 0, y: 0 }
        }
    }
});
