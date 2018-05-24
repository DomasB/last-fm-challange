<template>
    <div>
        <div v-if="artist.error">{{artist.error}}</div>
        <div v-else>
            <h1><a :href="artist.artist_url" target="_blank">{{artist.artist_name}}</a></h1>
            <img :src="artist.artist_image" class="artist-image" />
            <ul class="artist-tag-list">
                <li v-for="tag in tags"><router-link :to="'/tag/'+encodeURIComponent(tag)">{{tag}}</router-link></li>
            </ul>
            <h2>Albums</h2>
            <div class="album-list">
                    <Album
                            v-for="album in albums"
                            :key="album.album_id"
                            :albumId="album.album_id"
                            :title="album.album_name"
                            :image="album.album_image"
                            :tags="album.album_tags"
                            :firstPlay="album.first_play"
                            :albumCompleted="album.album_completed"
                    ></Album>
            </div>
        </div>
    </div>
</template>

<script>
// @ is an alias to /src
import Album from "@/components/Album.vue";
export default {
  name: "artist",
    data () {
        return {
        }
    },
    props: ["id"],
    beforeRouteEnter (to, from, next) {
            next(vm => {
                vm.setData(to.params.id);
            });
    },
    beforeRouteUpdate (to, from, next) {
            next(vm => {
                vm.setData(to.params.id);
            });
    },
    watch: {
        id: {
            handler: function(id) {
                this.setData(id);
            },
            deep: true
        }
    },
    methods: {
      setData (id) {
          this.$store.dispatch('getArtistInfo', id);
      }
    },
    computed: {
      artist() {
          return this.$store.state.artist;
      },
      tags() {
          return this.$store.getters.getArtistTags;
      },
      albums() {
          return this.$store.state.artistAlbums;
      }
    },
    components: {
      Album
    }
};
</script>

<style scoped>
.artist-image {
  box-shadow: rgba(0, 0, 0, 0.42) 3px 3px 7px 0px;
}
.artist-tag-list {
  list-style: none;
  display: inline-block;
  text-align: left;
  font-size: 18px;
  margin: 0px;
  vertical-align: top;
  padding: 0px 10px;
}
.album-list {
  margin: 0 auto;
  max-width: 1000px;
}
</style>
