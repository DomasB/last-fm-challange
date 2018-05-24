import Vue from "vue";
import Vuex from "vuex";
import fetcher from "@/fetcher";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    msg: "Hello world!",
    goalYear: 1514764800,
    goal: 1000,
    loading: false,
    artist: {},
    artistAlbums: [],
    album: {},
    albumTracks: [],
    missing: [],
    completedArtists: [],
    completedCount: 0,
      artists: [],
      albums: [],
      activePage: 1,
      totalPages: 1,
      limit: 100
  },
  mutations: {
    setLoading(state, isLoading) {
      state.loading = isLoading;
    },
    setArtistInfo(state, artistInfo) {
      state.artist = artistInfo.artist;
      state.artistAlbums = artistInfo.albums;
      state.loading = false;
    },
    setAlbumInfo(state, albumInfo) {
      state.album = albumInfo.album || {};
      state.albumTracks = albumInfo.tracks || [];
      state.missing = albumInfo.missing || [];
      state.loading = false;
    },
    setCompleted(state, completedInfo) {
      state.completedArtists = completedInfo.completedArtists || [];
      state.completedCount = completedInfo.completedCount || 0;
    },
      setArtists(state, artists) {
        state.artists = artists || [];
      },
      setAlbums(state, albums) {
          state.albums = albums || [];
      },
      setActivePage(state, activePage) {
        state.activePage = activePage;
      },
      setTotalPages(state, totalPages) {
        state.totalPages = totalPages;
      }
  },
  actions: {
    getArtistInfo({ commit }, id) {
      if (parseInt(this.state.artist.artist_id) !== parseInt(id))
        commit("setLoading", true);
      let url = "http://localhost:3000/api/artist/" + id;
      let callback = r => {
        commit("setArtistInfo", r);
      };
      fetcher(url, callback);
    },
    getAlbumInfo({ commit }, id) {
      commit("setLoading", true);
      let foundAlbum = this.state.artistAlbums.find(
        album => parseInt(album.album_id) === parseInt(id)
      );
      if (foundAlbum) commit("setAlbumInfo", { album: foundAlbum });
      let url = "http://localhost:3000/api/album/" + id;
      let callback = r => {
        commit("setAlbumInfo", r);
      };
      fetcher(url, callback);
    },
    getCompleted({ commit }) {
      let url =
        "http://localhost:3000/api/completedartists/" + this.state.goalYear;
      let callback = r => {
        if (!r.error) {
          commit("setCompleted", {
            completedArtists: r.artists,
            completedCount: r.completedArtists
          });
        }
      };
      fetcher(url, callback);
    },
      getArtists({commit}, page) {
        let url = "http://localhost:3000/api/artists/" + page.limit + "/" + page.page;
        let callback = r => {
            if(!r.error) {
                commit('setArtists', r.artists);
                commit('setActivePage', page.page);
                commit('setTotalPages', r.totalPages);
            }
        };
        fetcher(url, callback);
      },
      getAlbums({commit}, page) {
        let url = "http://localhost:3000/api/albums/" + page.limit + "/" + page.page;
        let callback = r => {
            commit('setAlbums', r.albums);
            commit('setActivePage', page.page);
            commit('setTotalPages', r.totalPages);
        };
          fetcher(url, callback);
      }
  },
  getters: {
    getArtistTags(state) {
      return state.artist.artist_tags
        ? JSON.parse(state.artist.artist_tags)
        : [];
    },
    getMissingTracks(state) {
      return state.missing.sort((a, b) => {
        if (
          String(a.track_album).toLowerCase() >
          String(b.track_album).toLowerCase()
        )
          return 1;
        if (
          String(a.track_album).toLowerCase() <
          String(b.track_album).toLowerCase()
        )
          return -1;
        if (
          String(a.track_name).toLowerCase() >
          String(b.track_name).toLowerCase()
        )
          return 1;
        if (
          String(a.track_name).toLowerCase() <
          String(b.track_name).toLowerCase()
        )
          return -1;
        return 0;
      });
    },
    completedPercent(state) {
      return "width: " + state.completedCount / state.goal * 100 + "%";
    },
    newPercent(state) {
      return "width: " + state.completedArtists.length / state.goal * 100 + "%";
    }
  }
});
